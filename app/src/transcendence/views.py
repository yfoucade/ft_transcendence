import json
import os
from typing import Any

from django.conf import settings
from django.core.paginator import Paginator
from django.db.models.query import QuerySet
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.template import loader
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.utils.translation import gettext as _
from django.conf import settings
from django.http import HttpResponse
from django.utils import translation
from django.utils.translation import check_for_language
from django.views.generic.list import ListView

from .forms import CustomUserCreationForm, CustomUserChangeForm, CustomProfileChangeForm
from .models import Profile
from .pong.local_tournament import lobby
# Create your views here.

def index(request):
    # template = loader.get_template("transcendence/base.html")
    return render(request, "transcendence/index.html")

def play(request):
    return render(request, "transcendence/pong/play.html")

def local_match(request):
    return render(request, "transcendence/pong/local_match/local_match.html")

def local_tournament_form(request):
    return render(request, "transcendence/pong/local_tournament/form.html")

def local_tournament_lobby(request):
    if ( request.method == "POST" ):
        tournament_state = json.loads( request.body )
        context = lobby.build_local_tournament_context( tournament_state )
        # TODO: this is debug
        # with open("/dev/pts/0", "w") as f:
        #     print("processing form", file=f)
        #     print(f"{tournament_state = }", file=f)
        # return render(request, "transcendence/pong/local_tournament/lobby.html")
        # return HttpResponse(request.body)
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

# TODO: redirect to profile page if user is authenticated
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
                    })

def user_details(request):
    pass