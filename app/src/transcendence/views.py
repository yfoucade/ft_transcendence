from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader

# Create your views here.

def index(request):
    # template = loader.get_template("transcendence/base.html")
    return render(request, "transcendence/index.html")

def play(request):
    return render(request, "transcendence/pong/play.html")

def local_match(request):
    return render(request, "transcendence/pong/local_match/local_match.html")