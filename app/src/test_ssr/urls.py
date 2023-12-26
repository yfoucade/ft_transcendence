from django.urls import path

from . import views

urlpatterns = [
    path( "view_a", views.view_a, name="view_a" ),
    path( "view_b", views.view_b, name="view_b" ),
]
