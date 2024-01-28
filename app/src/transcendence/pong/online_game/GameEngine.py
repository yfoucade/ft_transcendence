import asyncio
import json
import math
import sys
from datetime import datetime, timedelta

from .game_settings import *
from transcendence.models import PongGame, Profile
from django.utils import timezone

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
        # print("in GameEngine.set_init_game_str")
        # sys.stdout.flush()
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
        updated_fields += self.instance.set_game_elements(
            lpt=tmp["left_paddle_top_pct"],
            rpt=tmp["right_paddle_top_pct"],
            bl=tmp["ball_left_pct"],
            bt=tmp["ball_top_pct"],
        )
        # print(f"{updated_fields = }")
        # sys.stdout.flush()
        await self.instance.asave(update_fields=updated_fields)

    async def main_loop(self, start_delay = timedelta(seconds=3)):
        updated_fields = self.instance.set_start_time(start_delay=start_delay)
        await self.instance.asave(update_fields=updated_fields)
        while self.instance.game_status == "starting" and self.instance.start_time > timezone.now():
            await asyncio.sleep(0)
            await self.instance.arefresh_from_db(fields=["game_status"])
        updated_fields = await self.instance.set_status("running")
        await self.instance.asave(update_fields=updated_fields)
        tic = timezone.now()
        # print("starting ball_movement")
        # print((tic - self.instance.start_time).total_seconds())
        # sys.stdout.flush()
        while (tic - self.instance.start_time).total_seconds() < 10:
            # print("new position")
            # sys.stdout.flush()
            toc = timezone.now()
            delta = (toc-tic).total_seconds()
            self.ball_left += self.ball_r * delta
            await self.save_positions()
            tic = toc
            await asyncio.sleep(0)
        print("setting status to done")
        sys.stdout.flush()
        updated_fields = await self.instance.set_status("done")
        await self.instance.asave(update_fields=updated_fields)

    async def save_positions(self):
        updated_fields = self.instance.set_game_elements(
            lpt = 100 * self.left_paddle_top / CANVAS_HEIGHT,
            rpt = 100 * self.right_paddle_top / CANVAS_HEIGHT,
            bl = 100 * self.ball_left / CANVAS_WIDTH,
            bt = 100 * self.ball_top / CANVAS_HEIGHT,
        )
        await self.instance.asave(update_fields=updated_fields)
