from django.urls import path

from . import views

urlpatterns = [
    path( "", views.poc, name="poc" ),
    path( "init_game/", views.init_game, name="init-game" ),
    path( "connect/<int:game_id>/", views.sse_game_stream, name="game-stream" ),
    path( "player_event/<int:game_id>/<event>/<key>", views.user_event, name="user-event"),
]