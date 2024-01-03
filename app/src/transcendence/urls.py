from django.urls import path

from . import views

urlpatterns = [
    path( "", views.index, name="index" ),
    path( "play/", views.play, name="play" ),
    path( "local-match/", views.local_match, name="local-match" ),
    path( "local-tournament/form/", views.local_tournament_form, name="local-tournament-form" ),
    path( "local-tournament/lobby/", views.local_tournament_lobby, name="local-tournament-lobby" ),
]
