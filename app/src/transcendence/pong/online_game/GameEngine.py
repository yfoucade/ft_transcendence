import asyncio
import json
import math
import random
import sys
from datetime import datetime, timedelta

from .game_settings import *
from transcendence.models import PongGame, Profile
from django.utils import timezone

class GameEngine:
    def __init__(self):
        # sizes
        self.paddle_height = CANVAS_HEIGHT * PADDLE_HEIGHT_PCT / 100
        self.paddle_width = CANVAS_WIDTH * PADDLE_WIDTH_PCT / 100
        self.ball_side = CANVAS_WIDTH * BALL_WIDTH_PCT / 100
        # positions
        self.left_paddle_top = (CANVAS_HEIGHT - self.paddle_height) / 2
        self.right_paddle_top = self.left_paddle_top
        self.ball_top = (CANVAS_HEIGHT - self.ball_side) / 2
        self.ball_left = (CANVAS_WIDTH - self.ball_side) / 2
        # rules
        self.left_score, self.right_score = 0, 0
        self.last_scorer = None
        self.winner = "" # empty, 'left', or 'right'
        # physics
        self.last_update_time = None
        self.paddle_max_top = CANVAS_HEIGHT - self.paddle_height
        self.ball_min_left = self.paddle_width
        self.ball_max_left = CANVAS_WIDTH - self.paddle_width - self.ball_side
        self.ball_max_top = CANVAS_HEIGHT - self.ball_side
        self.left_going_up, self.left_going_down = False, False
        self.right_going_up, self.right_going_down = False, False
        self.ball_theta, self.ball_r = self.random_theta(), BALL_INIT_R
        self.ball_dx, self.ball_dy = self.polar_to_cartesian()
        self.last_update_time = None


    async def get_init_state(self, instance: PongGame):
        """
        Returns init_game_str, a json string containing:
        player_1_display_name, player_1_avatar_url, player_1_id
        player_2_display_name, player_2_avatar_url, player_2_id
        left_score, right_score
        canvas_width, canvas_height, canvas_aspect_ratio,
        paddle_height_pct, paddle_width_pct,
        ball_width_pct,
        left_paddle_top_pct, right_paddle_top_pct,
        ball_left_pct, ball_top_pct
        """
        # print("in GameEngine.set_init_game_str")
        # sys.stdout.flush()
        res = {}
        profile_1 = await Profile.objects.aget(user_id=instance.user_1_id)
        profile_2 = await Profile.objects.aget(user_id=instance.user_2_id)
        res["player_1_display_name"] = profile_1.display_name
        res["player_2_display_name"] = profile_2.display_name
        res["player_1_avatar_url"] = profile_1.picture.url
        res["player_2_avatar_url"] = profile_2.picture.url
        res["player_1_id"] = profile_1.user_id
        res["player_2_id"] = profile_2.user_id
        res["left_score"], res["right_score"] = 0, 0
        res["canvas_width"], res["canvas_height"] = CANVAS_WIDTH, CANVAS_HEIGHT
        res["canvas_aspect_ratio"] = CANVAS_ASPECT_RATIO
        res["paddle_height_pct"] = PADDLE_HEIGHT_PCT
        res["paddle_width_pct"] = PADDLE_WIDTH_PCT
        res["ball_width_pct"] = BALL_WIDTH_PCT
        res["left_paddle_top_pct"] = 100 * self.left_paddle_top / CANVAS_HEIGHT
        res["right_paddle_top_pct"] = res["left_paddle_top_pct"]
        res["ball_left_pct"] = 100 * self.ball_left / CANVAS_WIDTH
        res["ball_top_pct"] = 100 * self.ball_top / CANVAS_HEIGHT
        return res
    
    def set_start_time(self, time:datetime = None):
        self.tic = time or timezone.now()

    def compute_next_frame(self):
        if self.winner:
            return
        toc = timezone.now()
        delta = (toc - self.tic).total_seconds()
        # move paddles
        self.left_paddle_top += (self.left_going_down - self.left_going_up) * PADDLE_SPEED * delta
        self.right_paddle_top += (self.right_going_down - self.right_going_up) * PADDLE_SPEED * delta
        self.left_paddle_top = self.clamp(self.left_paddle_top, 0, CANVAS_HEIGHT - self.paddle_height)
        self.right_paddle_top = self.clamp(self.right_paddle_top, 0, CANVAS_HEIGHT - self.paddle_height)

        # move ball
        self.ball_left += self.ball_dx * delta
        self.ball_top += self.ball_dy * delta

        # apply wall collision
        if not 0 <= self.ball_top <= CANVAS_HEIGHT - self.ball_side:
            self.ball_theta = -self.ball_theta
            self.ball_dx, self.ball_dy = self.polar_to_cartesian()
            self.ball_top = self.clamp(self.ball_top, 0, CANVAS_HEIGHT - self.ball_side)

        # check score
        if self.check_score():
            if self.left_score == WIN_CONDITION:
                self.winner = "left"
            elif self.right_score == WIN_CONDITION:
                self.winner = "right"
            else:
                self.new_point()

        self.tic = toc

    def new_point(self):
        self.left_paddle_top = (CANVAS_HEIGHT - self.paddle_height) / 2
        self.right_paddle_top = self.left_paddle_top
        self.ball_top = (CANVAS_HEIGHT - self.ball_side) / 2
        self.ball_left = (CANVAS_WIDTH - self.ball_side) / 2
        self.ball_theta = BALL_MAX_INIT_ANGLE * ( 2 * random.random() - 1 )
        self.ball_r = BALL_INIT_R
        if self.last_scorer == "left":
            self.ball_theta -= math.pi
        self.ball_dx, self.ball_dy = self.polar_to_cartesian()

    def check_score(self):
        if self.ball_left < self.paddle_width:
            if self.ball_top + self.ball_side < self.left_paddle_top \
                or self.ball_top >self.left_paddle_top + self.paddle_height:
                self.right_score += 1
                self.last_scorer = "right"
                return True
            else:
                mean_ball_height = self.ball_top + self.ball_side / 2
                collision_point = self.clamp( mean_ball_height - self.left_paddle_top, 0, self.paddle_height )
                self.ball_theta = BALL_MAX_ANGLE * ( -2 * collision_point + self.paddle_height ) / self.paddle_height
                self.ball_r *= BALL_ACCELERATION
                self.ball_dx, self.ball_dy = self.polar_to_cartesian()
        if self.ball_left > CANVAS_WIDTH - self.paddle_width - self.ball_side:
            if self.ball_top + self.ball_side < self.right_paddle_top \
                or self.ball_top > self.right_paddle_top + self.paddle_height:
                self.left_score += 1
                self.last_scorer = "left"
                return True
            else:
                mean_ball_height = self.ball_top + self.ball_side / 2
                collision_point = self.clamp( mean_ball_height - self.right_paddle_top, 0, self.paddle_height )
                self.ball_theta = math.pi - BALL_MAX_ANGLE * ( -2 * collision_point + self.paddle_height ) / self.paddle_height
                self.ball_r *= BALL_ACCELERATION
                self.ball_dx, self.ball_dy = self.polar_to_cartesian()
        return False

    def get_state(self):
        res = {
            "left_score": self.left_score,
            "right_score": self.right_score,
            "left_paddle_top_pct": 100 * self.left_paddle_top / CANVAS_HEIGHT,
            "right_paddle_top_pct": 100 * self.right_paddle_top / CANVAS_HEIGHT,
            "ball_left_pct": 100 * self.ball_left / CANVAS_WIDTH,
            "ball_top_pct": 100 * self.ball_top / CANVAS_HEIGHT,
            "winner": self.winner
        }
        return res

    def random_theta(self):
        theta = BALL_MAX_INIT_ANGLE * ( 2 * random.random() - 1 )
        if random.random() < .5:
            theta += math.pi
        return theta

    def polar_to_cartesian(self):
        return self.ball_r * math.cos(self.ball_theta), - self.ball_r * math.sin(self.ball_theta)
    
    def clamp(self, value, mini, maxi):
        return max(mini, min(maxi, value))
    
    def update_paddle(self, side, up, down):
        if side[0] == 'l':
            self.left_going_up = up
            self.left_going_down = down
        else:
            self.right_going_up = up
            self.right_going_down = down
