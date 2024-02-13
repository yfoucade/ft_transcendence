# transcendence/routing.py
from django.urls import path, re_path

from . import consumers

transcendence_websockets = [
    path("ws/online-game/", consumers.OnlineGameConsumer.as_asgi()),
    path("ws/online-tournament/", consumers.OnlineTournamentConsumer.as_asgi()),
]
