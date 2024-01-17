from django.db import models
from django.contrib.auth.models import User

# Create your models here.

def get_thumbnail_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/thumbnail
    return "user_{0}/thumbnail".format(instance.user.id)

class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete = models.CASCADE,
    )
    display_name = models.CharField(max_length=10, blank=False, unique=True)
    # thumbnail = models.ImageField(upload_to=get_thumbnail_path, default="default.jpg")
    following = models.ManyToManyField(User, related_name="followers")
    rating = models.FloatField(default=1500)
