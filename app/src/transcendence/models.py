from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.

CUSTOM_USERNAME_MAXLENGTH = 10
SESSION_TIMEOUT_SECONDS = 60

def get_picture_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/picture
    return "user_{0}/picture".format(instance.user.id)

class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete = models.CASCADE,
    )
    display_name = models.CharField(max_length=150, blank=False, unique=True)
    picture = models.ImageField(upload_to=get_picture_path, default="default_pp.png")
    following = models.ManyToManyField(User, related_name="followers", blank=True)
    rating = models.FloatField(default=1500)
    last_request_time = models.DateTimeField(default=timezone.now, blank=True)

