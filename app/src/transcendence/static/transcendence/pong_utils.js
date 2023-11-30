
let pong_game = {
    // HTMLElements
    game_canvas: document.getElementById("game-canvas"),
    start_button: document.getElementById("local-pvp-start-button"),
    left_paddle: document.getElementById("local-pvp-left-paddle"),
    right_paddle: document.getElementById("local-pvp-right-paddle"),
    ball: document.getElementById("local-pvp-ball"),
    left_score: document.getElementById("local-pvp-left-score"),
    right_score: document.getElementById("local-pvp-right-score"),
    // Sizes and positions
    left_paddle_height: null,
    right_paddle_height: null,
    ball_height: null, // ball_width == ball_height
    paddle_top_max_value_percentage: null,
    ball_top_max_value_percentage: null,
    ball_left_min_value_percentage: null,
    ball_left_max_value_percentage: null,
    left_paddle_percent: null,
    right_paddle_percent: null,
    ball_left_percent: null,
    ball_top_percent: null,
    // Movement
    ball_theta: null,
    ball_r: null,
    init_ball_r: .05,
    ball_dx: null,
    ball_dy: null,
    ball_acceleration: 1.05,
    left_paddle_up: false,
    left_paddle_down: false,
    right_paddle_up: false,
    right_paddle_down: false,
    paddle_speed: .1,
    max_bounce_angle: 5 * Math.PI / 12, // if mean height of ball >= left_paddle.top
    // Game state
    game_in_progress: false,
    left_score: 0,
    right_score: 0,
    last_scorer: null, // 'null' until first point, then 'left' or 'right'
    last_bounce: null,
}

