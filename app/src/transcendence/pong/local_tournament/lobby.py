def get_round_name( state ):
    n_matches = len(state["current_round_matches"])
    return ["Final", "Semifinals", "Quarterfinals", "Quarterfinals"][n_matches-1]

def build_local_tournament_context( state ):
    res = {"round_name":get_round_name(state)}
    next_match = state["current_round_matches"][state["current_match"]]
    res["next_match"] = next_match
    res["matches"] = state["current_round_matches"]
    res["eliminated_players"] = state["eliminated_players"]
    return res