import asyncio
import json
import os

from django.http import HttpResponse, StreamingHttpResponse
from django.shortcuts import render

from .models import Game

# Create your views here.

def poc(request):
    return render(request, "game_poc/poc.html")

async def watch_initialized(instance:Game):
    while instance.status == "initialized":
        if instance.elapsed_time_since_init.seconds > 10:
            await instance.adelete()
            return

def init_game(request):
    response = {}
    game = Game()
    game.save()
    response["game_id"] = game.pk

    return HttpResponse( json.dumps(response) )

def build_message( event:str, data:dict ):
    res_dict = {"event": event, "data": json.dumps(data)}
    res = '\n'.join(f"{item[0]}: {item[1]}" for item in res_dict.items())
    # res = f"event: {event}\n
    #     data: {json.dumps(data)}"
    return res + "\n\n"

async def game_loop( instance:Game ):
    instance.start_game()
    await instance.asave()
    while True:
        data = {}
        await instance.arefresh_from_db()
        updated_fields = instance.update_state()
        await instance.asave(update_fields=updated_fields)
        if instance.status == "over":
            # send end-of-game message and return
            event = "game-over"
            data["time"] = str(instance.game_time.seconds)
            yield build_message(event, data)
            return
        elif instance.status == "running":
            event = "update"
            data["current_score"] = round(instance.current_score, 2)
            data["target_value"] = round(instance.target_value, 2)
            data["player_value"] = round(instance.player_value, 2)
            yield build_message(event, data)
        if instance.status == "over":
            break
        await asyncio.sleep(.01)


async def sse_game_stream(request, game_id):
    game = await Game.objects.aget(pk=game_id)
    return StreamingHttpResponse( game_loop(game), content_type='text/event-stream' )

async def user_event(request, game_id, event, key):
    game = await Game.objects.aget(pk=game_id)
    # if ( event == "keydown" and key == "up" ):
    #     game.player_move_up = True
    #     await game.asave()

    match (event, key):
        case ("keydown", "up"):
            game.player_move_up = True
        case ("keydown", "down"):
            game.player_move_down = True
        case ("keyup", "up"):
            game.player_move_up = False
        case ("keyup", "down"):
            game.player_move_down = False
    await game.asave(update_fields=["player_move_up", "player_move_down"])
    return HttpResponse("OK")