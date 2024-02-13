from django.conf.urls.i18n import i18n_patterns
from django.urls import path

from . import views

urlpatterns = [
    path( "", views.index, name="index" ),
    path( "play/", views.play, name="play" ),
	path( "select-opponent/", views.select_opponent, name="select-opponent"),
    path( "local-match-pvp/", views.local_match_pvp, name="local-match-pvp"),
    path( "local-match-pvai/", views.local_match_pvai, name="local-match-pvai"),
    # path( "local-match/", views.local_match, name="local-match" ),
    path( "local-tournament/form/", views.local_tournament_form, name="local-tournament-form" ),
    path( "local-tournament/lobby/", views.local_tournament_lobby, name="local-tournament-lobby" ),
    path( "local-tournament/match/", views.local_tournament_match, name="local-tournament-match" ),
    path( "local-tournament/results/", views.local_tournament_results, name="local-tournament-results" ),
    path( "signup/", views.signup, name="signup" ),
    path( "profile/", views.profile, name="profile" ),
    path( "edit-profile/", views.edit_profile, name="edit-profile" ),
    path( "leaderboard/", views.leaderboard, name="leaderboard" ),
    path( "user/<int:id>/", views.user_details, name="user-details" ),
    path( "following/", views.following, name="following" ),
    path( "online-game/", views.online_game, name="online-game" ),
    path( "online-tournament/", views.online_tournament, name="online-tournament" ),
]
