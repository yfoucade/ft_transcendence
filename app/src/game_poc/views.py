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
    while True:
        data = {}
        instance.update_state()
        if instance.status == "over":
            # send end-of-game message and return
            event = "game-over"
            data["time"] = str(instance.game_time.seconds)
            yield build_message(event, data)
            return
        elif instance.status == "running":
            event = "update"
            data["current_score"] = instance.current_score
            data["target_value"] = instance.target_value
            data["player_value"] = instance.player_value
            yield build_message(event, data)
        if instance.status == "over":
            break
        await asyncio.sleep(.1)


async def sse_game_stream(request, game_id):
    game = await Game.objects.aget(pk=game_id)
    return StreamingHttpResponse( game_loop(game), content_type='text/event-stream' )
