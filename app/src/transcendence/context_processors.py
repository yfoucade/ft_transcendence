from .models import Profile

def profile(request):
    res = {}
    if request.user.is_authenticated:
        try:
            res["profile"] = Profile.objects.get(user=request.user.pk)
        except:
            profile = Profile(user = request.user, display_name=request.user.username)
            profile.save()
            res["profile"] = Profile.objects.get(user=request.user.pk)
    return res
