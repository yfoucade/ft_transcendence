"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.i18n import i18n_patterns
from transcendence import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from django.conf import settings # TODO: remove in production
from django.conf.urls.static import static # TODO: remove in production

urlpatterns = [
    path( '', include( "transcendence.urls" ) ),
    path( 'accounts/', include( "django.contrib.auth.urls" ) ),
    path( 'test_ssr/', include( "test_ssr.urls" ) ), #TODO: remove this app
    path('admin/', admin.site.urls),
	path("i18n/", include("django.conf.urls.i18n")),
    path('api/token', TokenObtainPairView.as_view(), name='obtain_tokens'),
    path('api/token/refresh', TokenRefreshView.as_view(), name='refresh_token'),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # TODO: remove in production

urlpatterns += i18n_patterns(
    path( "", views.index, name="index" ),
    path( "play/", views.play, name="play" ),
    path( "local-match/", views.local_match, name="local-match" ),
    path( "local-tournament/form/", views.local_tournament_form, name="local-tournament-form" ),
    path( "local-tournament/lobby/", views.local_tournament_lobby, name="local-tournament-lobby" ),
    path( "local-tournament/match/", views.local_tournament_match, name="local-tournament-match" ),
    path( "local-tournament/results/", views.local_tournament_results, name="local-tournament-results" ),
    path( "signup/", views.signup, name="signup" ),
    path( "profile/", views.profile, name="profile" ),
)
