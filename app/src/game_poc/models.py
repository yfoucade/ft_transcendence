import math

from django.db import models
from django.utils import timezone

# Create your models here.

# Idea: give the user a token or set a cookie in the session
# for the user to be able to modify the game state.
# In pong, the views will require login and we'll have access to user.id
class Game(models.Model):
    status = models.CharField(default="initialized") # initialized, waiting, running, over
    target_value = models.FloatField(default=50 + 50*math.cos(0))
    target_value_delta_units_per_s = models.FloatField(null=True)
    player_value = models.FloatField(default=50)
    current_score = models.FloatField(default=0)
    target_score = models.FloatField(default=1_000)
    player_move_up = models.BooleanField(default=False)
    player_move_down = models.BooleanField(default=False)
    player_move_speed = models.FloatField(default=100/math.pi)

    init_time = models.DateTimeField(default=timezone.now)
    start_time = models.DateTimeField(null=True)
    # end_time = models.DateTimeField(null=True)
    last_update_time = models.DateTimeField(null=True)
    last_user_request_time = models.DateTimeField(null=True)

    @property
    def elapsed_time_since_init(self):
        return timezone.now() - self.init_time

    @property
    def game_time(self):
        if ( not self.start_time ) or ( not self.last_update_time ):
            return None
        return self.last_update_time - self.start_time

    def start_game(self):
        self.start_time = timezone.now()
        self.last_update_time = timezone.now()
        self.last_user_request_time = timezone.now()
        self.status = "running"

    def update_state(self):
        if self.status != "running":
            return
        now = timezone.now()
        game_time = now - self.start_time
        delta_time = now - self.last_update_time

        # Target value pauses for 1 second every 10 seconds
        if int( game_time.seconds ) % 10:
            self.target_value = 50 + 50 * math.cos( game_time.total_seconds() )
        self.player_value += ( self.player_move_up - self.player_move_down ) * self.player_move_speed * (delta_time.total_seconds())
        self.current_score += 2e-1 * (100 - ( abs(self.target_value - self.player_value) )) * (delta_time.total_seconds())

        if self.current_score >= self.target_score:
            self.status = "over"
        
        self.last_update_time = now

        return ["target_value", "player_value", "current_score", "status", "last_update_time"]
