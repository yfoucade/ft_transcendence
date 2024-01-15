import json

from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.template import loader
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required

from .forms import CustomUserCreationForm
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
    
def signup(request):
    if ( request.method == "POST" ):
        form = CustomUserCreationForm( request.POST )
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect( request.POST.get( "next", "index" ))
    else:
        form = CustomUserCreationForm()
    return render( request, "transcendence/accounts/signup.html", {"form":form} )

@login_required
def profile(request):
    return render( request, "transcendence/accounts/profile.html" )