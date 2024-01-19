from .models import Profile

def profile(request):
    res = {}
    if request.user.is_authenticated:
        res["profile"] = Profile.objects.get(user=request.user.pk)
    return res