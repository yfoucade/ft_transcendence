from datetime import timedelta
from random import random

from asgiref.sync import sync_to_async
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

class PongGame(models.Model):
    # context
    user_1 = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, related_name="games_as_user_1")
    user_2 = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, related_name="games_as_user_2")
    init_time = models.DateTimeField(default=timezone.now)
    start_time = models.DateTimeField(null=True)

    # status
    init_game_str = models.CharField(null=True) # all init info to be sent to the client
    game_status = models.CharField(default="init") # starting, running, aborted, over
    end_reason = models.CharField(null=True) # points, deconnection
    winner = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, related_name="games_won")
    left_points = models.SmallIntegerField(default=0)
    right_points = models.SmallIntegerField(default=0)

    # in-game elements
    ball_top = models.CharField(null=True)

    @sync_to_async
    def add_player(self, user:User, start_delay:timedelta=timedelta(seconds=3)):
        """
        Adds user `user` to the list of players.
        If there is already one registered player, adds the second player
        and also sets the status to 'running' and the start time to
        now + start_delay.
        """

        if not self.user_1:
            self.user_1 = user
            return ["user_1"]
        self.user_2 = user
        if random() < .5:
            self.user_1, self.user_2 = self.user_2, self.user_1
        self.start_time = timezone.now() + start_delay
        self.game_status = "starting"
        return ["user_1", "user_2", "game_status", "start_time"]

    def set_status(self, new_status:str):
        self.game_status = new_status
        return ["game_status"]
    
    def set_loser(self, user:User):
        self.winner = self.user_2 if (self.user_1 == user.pk) else self.user_1
        return ["winner"]

    def set_end_reason(self, reason:str):
        self.end_reason = reason
        return ["end_reason"]

    def abort_running_game(self, user:User):
        updated_fields = self.set_status("done")
        updated_fields += self.set_end_reason("deconnection")
        updated_fields += self.set_loser(user)
        return updated_fields

    @sync_to_async
    def get_user(self, num=1):
        if num == 1:
            return self.user_1
        else:
            return self.user_2
