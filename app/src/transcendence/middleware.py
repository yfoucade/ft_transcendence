from django.utils import timezone

from .models import Profile

class UpdateLastRequestTimeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):

        response = self.get_response(request)

        if request.user.is_authenticated:
            try:
                profile = Profile.objects.get(user=request.user.id)
            except:
                profile = Profile(user = request.user, display_name=request.user.username)
                profile.save()
            profile.last_request_time = timezone.now()
            profile.save()

        return response
