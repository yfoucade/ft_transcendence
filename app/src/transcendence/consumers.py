# transcendence/consumers.py
import asyncio
import sys
import uuid

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

from .models import PongGame, Profile
from .pong.online_game.GameEngine import GameEngine
from .pong.online_tournament.TournamentEngine import TournamentEngine


MAX_NB_OF_PLAYERS = 4


class OnlineGameConsumer(AsyncJsonWebsocketConsumer):
    """
    Class attributes:
        games_queue: list(tuple(PongGame, Lock, GameEngine))
        games_queue_lock: Lock

    Instance attributes:
        self.status: str. empty string (default), 'waiting', or 'playing'
        self.game_instance: PongGame. Shared within group. Default: None
        self.game_instance_lock: asyncio.Lock. Shared within group
        self.game_engine: GameEngine. Shared within group
        self.group_name: str. empty (default) when not in a group, or name of game's group
        self.task: None (default) or asyncio task running game loop
        self.side: str. empty, "left", or "right"
    """
    games_queue = []
    games_queue_lock = asyncio.Lock()

    async def connect(self):
        self.status = "" # empty, 'waiting', 'playing'
        self.game_instance = None
        self.game_instance_lock = None
        self.game_engine = None
        self.group_name = None
        self.task = None
        await self.accept()

    # Receive message from WebSocket
    async def receive_json(self, content):
        # text_data_json = json.loads(text_data)
        # message = text_data_json["message"]

        # # Send message to room group
        # async_to_sync(self.channel_layer.group_send)(
        #     self.room_group_name, {"type": "chat.message", "message": message}
        # )
        match content.get("type", ""):
            case "game.join":
                await self.game_join(content)
            case "game.paddle":
                await self.game_paddle(content)

    async def disconnect(self, close_code):
        # # Leave room group
        # async_to_sync(self.channel_layer.group_discard)(
        #     self.room_group_name, self.channel_name
        # )
        if self.game_instance_lock:
            async with self.game_instance_lock:
                updated_fields = await self.game_instance.abort_running_game(self.scope["user"])
                await self.game_instance.asave(update_fields=updated_fields)
        if self.group_name:
            await self.channel_layer.group_send(
                self.group_name,
                {"type":"game.disconnect", "who":self.side})
        self.close()

    async def game_join(self, content):
        self.status = "init"
        async with self.games_queue_lock:
            if self.games_queue:
                self.status = "playing"
                self.game_instance, self.game_instance_lock, self.game_engine = self.games_queue.pop(0)

        if self.status == "init":
            await self.init_game()
        else:
            await self.start_game()

    async def game_paddle(self, content):
        self.game_engine.update_paddle( self.side, content["up"], content["down"])

    async def init_game(self):
        self.game_instance = PongGame()
        await self.game_instance.asave()
        await self.game_instance.asave(
                update_fields= await self.game_instance.add_player(self.scope["user"])
                )
        self.game_instance_lock = asyncio.Lock()
        self.game_engine = GameEngine()
        OnlineGameConsumer.games_queue.append((self.game_instance, self.game_instance_lock, self.game_engine))
        self.group_name = f"game_{self.game_instance.id}"
        await self.channel_layer.group_add( self.group_name, self.channel_name )
        self.status = "waiting"
        await self.send_json(content={"type": "wait"})

    async def start_game(self):
        async with self.game_instance_lock:
            await self.game_instance.asave(
                    update_fields= await self.game_instance.add_player(self.scope["user"])
                    )
        self.group_name = f"game_{self.game_instance.id}"
        await self.channel_layer.group_add( self.group_name, self.channel_name )
        async with self.game_instance_lock:
            await self.game_instance.asave(update_fields=self.game_instance.set_start_time())
        self.game_engine.set_start_time(self.game_instance.start_time)
        asyncio.create_task(self.game_loop())

    async def game_loop(self):
        await self.channel_layer.group_send(self.group_name, {"type": "game.init", "data": await self.game_engine.get_init_state(self.game_instance),})
        while timezone.now() < self.game_instance.start_time:
            await asyncio.sleep(.01)
        while self.status == 'playing':
            self.game_engine.compute_next_frame()
            state = self.game_engine.get_state()
            await self.channel_layer.group_send(
                self.group_name,
                {"type":"game.update", "data":state}
            )
            # await asyncio.sleep(0.005)
            if state["winner"]: break

    async def game_disconnect(self, event):
        await self.send_json(content=event)
        self.status = ""
        self.game_instance = None
        self.game_instance_lock = None
        self.game_engine = None
        self.side = None
        self.group_name = ""
        if self.task:
            self.task.cancel()
        self.task = None

    async def game_init(self, event):
        self.status = 'playing'
        if self.game_instance.user_1_id == self.scope["user"].id:
            self.side = "left"
        else:
            self.side = "right"
        await self.send_json(content=event)

    async def game_update(self, event):
        await self.send_json(content=event)


class OnlineTournamentConsumer(AsyncJsonWebsocketConsumer):
    """
    Class attributes:
        queues: list(dict)
            Each dict has keys: "id" (uuid), "queue" (list),
            "status" (str)
            The group name is tournament_<id>.
            The queue will contain the `self.tournament_profile` dict of each user.
        engines dict:
            "<id>": TournamentEngine
        queues_lock: asyncio.Lock
            Lock for the queues attribute

    Instance attributes:
        self.tournament_profile: dict
            id (int), display_name (str), avatar_url (str),
            connected (bool),
        self.tournament: dict
            A reference to the element of cls.queues representing the tournament
        self.tournament_group_name: str
        
    """
    queues = []
    engines = {}
    lock = asyncio.Lock()

    async def connect(self, *args, **kwargs):
        profile = await Profile.objects.aget(user_id=self.scope["user"].id)
        self.tournament_profile = {
            "user_id": profile.user_id,
            "display_name": profile.display_name,
            "avatar_url": profile.picture.url,
            "connected": True,
            }
        print(f"New player connected: {self.tournament_profile}")
        sys.stdout.flush()
        await self.accept()
        await self.send_json(content={"type":"tournament.welcome", "user_id":self.tournament_profile["user_id"]})
        async with OnlineTournamentConsumer.lock:
            # Create new tournament if necessary
            if (not OnlineTournamentConsumer.queues) or (len(OnlineTournamentConsumer.queues[-1]) == MAX_NB_OF_PLAYERS):
                OnlineTournamentConsumer.queues.append({"id":uuid.uuid4().hex, "queue":[], "status":"lobby"})
            self.tournament = OnlineTournamentConsumer.queues[-1]
            self.tournament["queue"].append(self.tournament_profile)
            self.tournament_group_name = f"tournament_{self.tournament['id']}"
            await self.channel_layer.group_add(self.tournament_group_name, self.channel_name)
            await self.channel_layer.group_send(self.tournament_group_name, {"type":"tournament.queue.update"})
            if len(self.tournament["queue"]) == MAX_NB_OF_PLAYERS:
                OnlineTournamentConsumer.queues.pop(0)
                self.engine = [TournamentEngine()]
                OnlineTournamentConsumer.engines[self.tournament["id"]] = self.engine
                self.tournament["status"] = "running"
                await self.engine[0].init_tournament(**self.tournament)

    async def receive_json(self, content, *args, **kwargs):
        if content["type"] == "tournament.start":
            await self.engine[0].init_tournament(**self.tournament)

    async def disconnect(self, code):
        pass

    async def tournament_queue_update(self, content):
        """
        The queue's state has been modified (a player joined or left the queue).
        Because it is a reference ot the class attribute,
        the new list of profiles is in self.tournament.
        """
        data = {"type":"tournament.queue.update", "data":self.tournament}
        await self.send_json(content=data)

