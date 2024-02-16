import asyncio
import html
import json
import os
from typing import Any
from datetime import timezone, timedelta
import sys

from django.contrib.auth.models import User
from django.conf import settings
from django.core.paginator import Paginator
from django.db.models import F, Q
from django.db.models.query import QuerySet
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.template import loader
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.utils.translation import gettext as _
from django.conf import settings
from django.http import HttpResponse, StreamingHttpResponse
from django.utils import translation, timezone
from django.utils.translation import check_for_language

from .forms import CustomUserCreationForm, CustomUserChangeForm, CustomProfileChangeForm
from .models import Profile, PongGame, SESSION_TIMEOUT_SECONDS
from .pong.local_tournament import lobby
from .pong.online_game.online_game import online_game_stream
# Create your views here.

def index(request):
    # template = loader.get_template("transcendence/base.html")
    return render(request, "transcendence/index.html")

def play(request):
    return render(request, "transcendence/pong/play.html")

def select_opponent(request):
    return render(request, "transcendence/pong/local_match/select_opponent.html")

def local_match_pvp(request):
    return render(request, "transcendence/pong/local_match/local_match_pvp.html")

def local_match_pvai(request):
    return render(request, "transcendence/pong/local_match/local_match_pvai.html")

def local_tournament_form(request):
    return render(request, "transcendence/pong/local_tournament/form.html")

def local_tournament_lobby(request):
    if ( request.method == "POST" ):
        escaped_body = html.escape( request.body.decode(), quote=False )
        tournament_state = json.loads( escaped_body )
        context = lobby.build_local_tournament_context( tournament_state )
        return render(request, "transcendence/pong/local_tournament/lobby.html", context)
    else:
        return redirect("local-tournament-form")

def local_tournament_match(request):
    if ( request.method == "POST" ):
        context = json.loads( request.body )
        return render(request, "transcendence/pong/local_tournament/match.html", context)
    else:
        return redirect("local-tournament-form")

def local_tournament_results(request):
    if ( request.method == "POST" ):
        context = json.loads( request.body )
        # with open("/dev/pts/0", "w") as f:
        #     print("results", file=f)
        #     print(f"{context['remaining_players'] = }", file=f)
        context["winner"] = list(context["remaining_players"].keys())[0]
        return render(request, "transcendence/pong/local_tournament/results.html", context)
    else:
        return redirect("local-tournament-form")

def signup(request):
    if ( request.method == "POST" ):
        form = CustomUserCreationForm( request.POST )
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            profile = Profile(user = user, display_name=user.username)
            profile.save()
            return redirect( request.POST.get( "next", "" ) or "index" )
    else:
        form = CustomUserCreationForm()
    return render( request, "transcendence/accounts/signup.html", {"form":form} )

def set_language(language):
    if check_for_language(language):
        translation.activate(language)
        response = HttpResponse()
        response.set_cookie(settings.LANGUAGE_COOKIE_NAME, language)
        return response
    return redirect('index')

@login_required
def profile(request):
    return render( request, "transcendence/accounts/profile.html" )

@login_required
def edit_profile(request):
    profile = Profile.objects.get(user=request.user.pk)
    if ( request.method == "POST" ):
        user_change_form = CustomUserChangeForm( request.POST, instance=request.user )
        profile_change_form = CustomProfileChangeForm( request.POST, request.FILES, instance=profile )
        if user_change_form.is_valid() and profile_change_form.is_valid():
            user_change_form.save()
            profile_change_form.save()
            return redirect("profile")
    else:
        user_change_form = CustomUserChangeForm(instance=request.user)
        profile_change_form = CustomProfileChangeForm( instance=profile )
    return render(
        request,
        "transcendence/accounts/edit_profile.html",
        {
            "user_change_form": user_change_form,
            "profile_change_form": profile_change_form,
        })

def leaderboard(request):
    profile_list = Profile.objects.order_by("-rating")
    paginator = Paginator(profile_list, 3)  # Show <n> contacts per page.

    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render( request,
                    "transcendence/community/leaderboard.html",
                    {
                        "page_obj": page_obj,
                        "start_index": ( int(page_number if page_number else 1) - 1 ) * 3,
                    })

@login_required
def user_details(request, id):
    client_profile = Profile.objects.get(user=request.user.pk)
    target_profile = Profile.objects.get(user=id)
    if request.method == "POST":
        if request.POST.get("data-action") == "unfollow":
            client_profile.following.remove( User.objects.get(pk=id) )
        elif request.POST.get("data-action") == "follow":
            client_profile.following.add( User.objects.get(pk=id) )
    own_page = request.user.pk == id
    following = client_profile.following.filter(id=id).exists()

    # stats and history
    game_history = PongGame.objects.filter(Q(user_1_id=target_profile.user_id) | Q(user_2_id=target_profile.user_id),
                                           Q(winner__isnull=False) ).order_by("-start_time")
    nb_wins = game_history.filter(winner_id=target_profile.user_id).count()
    nb_losses = game_history.filter(~Q(winner_id=target_profile.user_id)).count()

    context = {"target_profile": target_profile, "own_page":own_page, "following": following,
               "nb_wins":nb_wins, "nb_losses":nb_losses, "game_history":game_history, }
    return render( request, "transcendence/community/user_details.html", context )


def get_friends_statuses( profile:Profile ):
    res = []
    users_we_follow = profile.following.all()
    for user in users_we_follow:
        user_profile = Profile.objects.get(user=user.pk)
        res.append( (user_profile, user_profile.last_request_time >= timezone.now() - timedelta(seconds=SESSION_TIMEOUT_SECONDS)) )
    return sorted( res, key=lambda t: (-t[1], t[0].display_name) )


@login_required
def following(request):
    client_profile = Profile.objects.get(user=request.user.pk)
    following_list = get_friends_statuses(client_profile)
    paginator = Paginator(following_list, 3)  # Show <n> contacts per page.

    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render( request, "transcendence/community/following.html", {"page_obj":page_obj} )

@login_required
def online_game(request):
    return render( request, "transcendence/pong/online_game/online_game.html" )

@login_required
def online_tournament(request):
    return render( request, "transcendence/pong/online_tournament/online_tournament.html" )
