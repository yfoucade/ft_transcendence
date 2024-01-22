from django.urls import path

from . import views

urlpatterns = [
    path( "", views.poc, name="poc" ),
    path( "init_game/", views.init_game, name="init-game" ),
]