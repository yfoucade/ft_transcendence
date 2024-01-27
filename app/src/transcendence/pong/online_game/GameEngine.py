import json
import math
import sys

from .game_settings import *
from transcendence.models import PongGame, Profile

class GameEngine:
    def __init__(self, instance:PongGame):
        self.instance = instance
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
        # physics
        self.paddle_max_top = CANVAS_HEIGHT - self.paddle_height
        self.ball_min_left = self.paddle_width
        self.ball_max_left = CANVAS_WIDTH - self.paddle_width - self.ball_side
        self.ball_max_top = CANVAS_HEIGHT - self.ball_side
        self.left_going_up, self.left_going_down = False, False
        self.right_going_up, self.right_going_down = False, False
        self.ball_theta, self.ball_r = None, BALL_INIT_R
        self.ball_dx, self.ball_dy = None, None
        self.last_update_time = None


    async def set_init_game_str(self):
        """
        Sets self.instance.init_game_str to a json string containing:
        player_1_display_name, player_1_avatar_url,
        player_2_display_name, player_2_avatar_url,
        left_score, right_score
        canvas_width, canvas_height, canvas_aspect_ratio,
        paddle_height_pct, paddle_width_pct,
        ball_width_pct,
        left_paddle_top_pct, right_paddle_top_pct,
        ball_left_pct, ball_top_pct
        """
        tmp = {}
        profile_1 = await Profile.objects.aget(user_id=self.instance.user_1_id)
        profile_2 = await Profile.objects.aget(user_id=self.instance.user_2_id)
        tmp["player_1_display_name"] = profile_1.display_name
        tmp["player_2_display_name"] = profile_2.display_name
        tmp["player_1_avatar_url"] = profile_1.picture.url
        tmp["player_2_avatar_url"] = profile_2.picture.url
        tmp["left_score"], tmp["right_score"] = 0, 0
        tmp["canvas_width"], tmp["canvas_height"] = CANVAS_WIDTH, CANVAS_HEIGHT
        tmp["canvas_aspect_ratio"] = CANVAS_ASPECT_RATIO
        tmp["paddle_height_pct"] = PADDLE_HEIGHT_PCT
        tmp["paddle_width_pct"] = PADDLE_WIDTH_PCT
        tmp["ball_width_pct"] = BALL_WIDTH_PCT
        tmp["left_paddle_top_pct"] = 100 * self.left_paddle_top / CANVAS_HEIGHT
        tmp["right_paddle_top_pct"] = tmp["left_paddle_top_pct"]
        tmp["ball_left_pct"] = 100 * self.ball_left / CANVAS_WIDTH
        tmp["ball_top_pct"] = 100 * self.ball_top / CANVAS_HEIGHT

        res = json.dumps(tmp)
        updated_fields = self.instance.set_init_game_str(res)
        await self.instance.asave(update_fields=updated_fields)
