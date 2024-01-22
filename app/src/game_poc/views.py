import asyncio
import json
import os

from django.http import HttpResponse
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