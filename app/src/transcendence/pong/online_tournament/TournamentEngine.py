import random
import uuid

from channels.layers import get_channel_layer

class TournamentEngine:
    """
    Instance attributes:
        self.tournament_id: str
            uuid of the tournament
        self.group_name: str
            Name of the tournament's group
        self.init_queue: tuple
            Tuple of player profiles
        self.players_remaining: list
            List of player profiles, used for the next round's pairings.
            When a player loses a match or is disconnected, remove them
            from this list.
        self.rounds: list(dict)
            Each dict contains:
            "pairings": list(dict)
                each dict contains:
                "game_id": uuid
                "left_player": profile
                "right_player": profile or empty string
            "results": list(dict)
                A list of same size with the results of the round.
                Each dict contains:
                "winner" (str): "left" or "right"
                "reason" (str): "bye", "disconnect", or "points"
                "score" (str): empty if `reason`=="bye", else final_score
    """

    def __init__(self):
        self.tournament_id = None
        self.group_name = None
        self.init_queue = None
        self.players_remaining = None
        self.rounds = []
        self.channel_layer = get_channel_layer()

    async def init_tournament(self, *, id, queue, **kwargs):
        self.tournament_id = id
        self.init_queue = tuple(queue)
        self.group_name = f"tournament_{id}"
        self.players_remaining = [profile for profile in queue if profile["connected"]]
        random.shuffle(self.players_remaining)
        await self.start_round()

    async def start_round(self):
        """
        Add the dict representing the new round to `self.rounds`.
        Send the pairings to the group.
        """
        res = {}

        self.players_remaining = [profile for profile in self.players_remaining if profile["connected"]]
        if len(self.players_remaining) == 1:
            await self.channel_layer.group_send( self.group_name, {"type":"tournament.winner", "winner":self.players_remaining[0]} )
            return
        # Avoid multiple byes.
        if len(self.players_remaining) % 2:
            self.players_remaining.append(self.players_remaining.pop(0))
        # Make pairings
        res["pairings"] = [{"game_id": uuid.uuid4().hex,
                            "left_player": self.players_remaining[i],
                            "right_player": self.players_remaining[i+1]}
                            for i in range(0, len(self.players_remaining)-1, 2)]
        if len(self.players_remaining) % 2:
            res["pairings"].append({"game_id": uuid.uuid4().hex, "left_player": self.players_remaining[-1], "right_player":""})
        # Init results
        res["results"] = [[{}, {"winner":"left", "reasons":"bye", "score":""}][not pairing["right_player"]] for pairing in res["pairings"]]
        # Send round info
        self.rounds.append(res)
        await self.channel_layer.group_send(self.group_name, {"type":"tournament.next_round", "pairings":res["pairings"]})

    async def set_winner( self, game_id:str, side:str, reason:str, score:str ):
        game = None
        for i, (pairing, result) in enumerate( zip(self.rounds[-1]["pairings"], self.rounds[-1]["results"]) ):
            if pairing["game_id"] == game_id:
                result["winner"] = side
                result["reason"] = reason
                result["score"] = score
                if side == "left":
                    try:
                        self.players_remaining.remove(pairing["right_player"])
                    except:
                        pass
                else:
                    self.players_remaining.remove(pairing["left_player"])
        if not all( result for result in self.rounds[-1]["results"] ):
            return
        await self.channel_layer.group_send( self.group_name, {"type":"tournament.round_results", "results":self.rounds[-1]["results"]} )
        await self.start_round()
