import json

from datetime import timedelta
from random import random

from asgiref.sync import sync_to_async
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.

CUSTOM_USERNAME_MAXLENGTH = 10
SESSION_TIMEOUT_SECONDS = 60
K = 20

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
    
    def update_rating(self, is_winner, opponent_rating):
        D = self.rating - opponent_rating
        pD = 1 / ( 1 + 10 ** (-D / 400) )
        self.rating += K * ( is_winner - pD )
        return [ "rating" ]

class PongGame(models.Model):
    # context
    user_1 = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, related_name="games_as_user_1")
    user_2 = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, related_name="games_as_user_2")
    init_time = models.DateTimeField(default=timezone.now)
    start_time = models.DateTimeField(null=True)

    # status
    init_game_str = models.CharField(null=True) # all init info to be sent to the client
    game_status = models.CharField(default="init") # starting, running, aborted, over
    end_reason = models.CharField(null=True) # points, disconnected
    winner = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, related_name="games_won")
    left_score = models.SmallIntegerField(default=0)
    right_score = models.SmallIntegerField(default=0)

    # in-game elements
    ball_top_pct = models.FloatField(null=True)
    ball_left_pct = models.FloatField(null=True)
    left_paddle_top_pct = models.FloatField(null=True)
    right_paddle_top_pct = models.FloatField(null=True)

    @sync_to_async
    def add_player(self, user:User, start_delay:timedelta=timedelta(seconds=3)):
        """
        Adds user `user` to the list of players.
        If there is already one registered player, adds the second player
        and also sets the status to 'starting'.
        """

        if not self.user_1:
            self.user_1 = user
            return ["user_1"]
        self.user_2 = user
        # if random() < .5:
        #     self.user_1, self.user_2 = self.user_2, self.user_1
        self.game_status = "starting"
        return ["user_1", "user_2", "game_status"]

    def set_start_time(self, start_delay = timedelta(seconds=3)):
        self.start_time = timezone.now() + start_delay
        return ["start_time"]

    def set_status(self, new_status:str):
        self.game_status = new_status
        return ["game_status"]

    async def set_loser(self, user:User):
        if (self.user_1_id == user.pk):
            return await self.set_winner(self.user_2)
        else:
            return await self.set_winner(self.user_1)
        # self.winner = self.user_2 if (self.user_1_id == user.pk) else self.user_1
        #               ^^^^^^^^^^^
        #               SynchronousOnlyOperation
        # return ["winner"]
    
    async def set_winner(self, user:User):
        if self.winner:
            return []
        self.winner = user
        profile_1 = await Profile.objects.aget( user_id = self.user_1.pk )
        profile_2 = await Profile.objects.aget( user_id = self.user_2.pk )
        updated_fields = profile_1.update_rating( self.user_1_id == user.pk, profile_2.rating )
        await profile_1.asave( update_fields = updated_fields )
        updated_fields = profile_2.update_rating( self.user_2_id == user.pk, profile_1.rating )
        await profile_2.asave( update_fields = updated_fields )
        return ["winner"]

    def set_end_reason(self, reason:str):
        self.end_reason = reason
        return ["end_reason"]

    async def abort_running_game(self, user:User):
        updated_fields = self.set_status("done")
        updated_fields += self.set_end_reason("disconnected")
        updated_fields += await self.set_loser(user)
        return updated_fields

    @sync_to_async
    def get_user(self, num=1):
        if num == 1:
            return self.user_1
        else:
            return self.user_2

