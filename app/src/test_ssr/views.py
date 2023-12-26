from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.

def view_a( request ):
    return render( request, "test_ssr/view_a.html" )

def view_b( request ):
    return render( request, "test_ssr/view_b.html" )