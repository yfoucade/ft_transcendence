import math

"""
SIZES AND POSITIONS

Only sizes are defined in this module. The positions will be computed by
the game engine.
The client will only work with the aspect-ratio for the canvas and with
percentages for the sizes and positions.
However it is more convenient to work with absolute values in the engine.
Thus, the engine will work with absolute values but convert them to
percentages before storing them in the PongGame instance it is working with.
"""
CANVAS_WIDTH = 858
CANVAS_HEIGHT = 525
CANVAS_ASPECT_RATIO = f"{CANVAS_WIDTH}/{CANVAS_HEIGHT}"
PADDLE_HEIGHT_PCT = 25
PADDLE_WIDTH_PCT = 3
BALL_WIDTH_PCT = 3 # client knows that aspect-ratio = 1/1

"""
PHYSICS
"""
BALL_MAX_INIT_ANGLE = math.pi / 4
BALL_INIT_R = 300
BALL_ACCELERATION = 1.10
PADDLE_SPEED = 450
BALL_MAX_ANGLE = 5 * math.pi / 12

"""
RULES
"""
WIN_CONDITION = 2
