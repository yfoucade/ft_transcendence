import sys
sys.path.append("../../../")

import asyncio
import json

from django.db.models import Q
from django.contrib.auth.models import User

from .GameEngine import GameEngine
from transcendence.models import PongGame


async def assign_to_game(user:User):
    already_waiting = await PongGame.objects.filter(
        Q(game_status__exact="init"),
        Q(user_1_id=user.id)
    ).afirst()
    if already_waiting:
        return already_waiting
    initialized_games = await PongGame.objects.filter(game_status="init").afirst()
    res = initialized_games or PongGame()
    await res.asave()
    updated_fields = await res.add_player(user)
    await res.asave(update_fields=updated_fields)
    return res

def build_message(msg_dict):
    res = '\n'.join(f"{item[0]}: {item[1]}" for item in msg_dict.items())
    return res + "\n\n"

async def send_game_id(game:PongGame):
    msg_data = {"game_id": f"{game.id}"}
    msg = {"event":"wait",
           "data":json.dumps(msg_data)}
    txt = build_message(msg)
    yield txt

async def wait_second_player(game:PongGame):
    while True:
        await game.arefresh_from_db()
        if game.user_2_id:
            return



async def dummy_fun(n=1):
    for i in range(10):
        print(f"{i}: in dummy fun {n}")
        sys.stdout.flush()
        await asyncio.sleep(.2)

async def dummy_gen(n=1):
    for i in range(10):
        print(f"{i}: in dummy gen {n}")
        sys.stdout.flush()
        yield build_message({"event":"debug", "data":f"{i} in dummy {n}"})
        await asyncio.sleep(.2)

async def game_loop(game:PongGame):
    """
    - Initialize a game engine
    - Set the init_game_str attribute in `game`
    - wait while timezone.now() < start_time
    - while status == running, compute next state
    """
    engine = GameEngine(game)
    await engine.set_init_game_str()
    await engine.main_loop()

async def state_sender(game:PongGame):
    """
    - wait while game.init_game_str is not set
    - yield game.init_game_str
    - while status == starting, yield seconds remaining
    - while status == running, yield game state
    - send 'done' event
    """
    while not game.init_game_str:
        print("waiting init_game_str")
        sys.stdout.flush()
        await asyncio.sleep(0)
        await game.arefresh_from_db(fields=["init_game_str"])
    yield build_message({"event":"init", "data":game.init_game_str})
    while not game.start_time:
        await asyncio.sleep(0.01)
        await game.arefresh_from_db(fields=["start_time"])
    print(f"start time set to {game.start_time}")
    sys.stdout.flush()
    while game.game_status != "running":
        print(f"{game.game_status = }")
        sys.stdout.flush()
        await asyncio.sleep(0.01)
        await game.arefresh_from_db(fields=["game_status"])
    print(f"{game.game_status = }")
    sys.stdout.flush()
    await game.arefresh_from_db()
    while game.game_status == "running":
        data = game.get_position_str()
        yield build_message({"event":"position", "data":data})
        await asyncio.sleep(0.1)
        await game.arefresh_from_db()

async def online_game_stream(request):
    game = await assign_to_game(request.user)
    try:
        async for message in send_game_id(game):
            yield message
        await wait_second_player(game)
        yield build_message({"event":"debug", "data":"found second player"})

        loop_task = asyncio.create_task(game_loop(game)) if game.user_1_id == request.user.pk else None
        loop_task
        async for msg in state_sender(game):
            yield msg
        if loop_task:
            await loop_task
        yield build_message({"event":"close", "data":""})
    except asyncio.CancelledError:
        updated_fields = []
        if not game:
            return
        await game.arefresh_from_db()
        if game.game_status == "init":
            await game.adelete()
            return
        elif game.game_status == "starting":
            updated_fields = await game.set_status("aborted")
        elif game.game_status == "running":
            updated_fields = await game.abort_running_game(request.user)
        await game.asave(update_fields=updated_fields)
