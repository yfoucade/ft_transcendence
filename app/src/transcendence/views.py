from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader

# Create your views here.

def index(request):
    # template = loader.get_template("transcendence/base.html")
    context = {}
    if request.user.is_authenticated:
        context["username"] = request.user.name
    else:
        context["username"] = "log in"
    return render(request, "transcendence/base.html", context)
