
let pong_game = {
    // HTMLElements
    html_element_game_canvas: null,
    html_element_start_button: null,
    html_element_left_paddle: null,
    html_element_right_paddle: null,
    html_element_ball: null,
    html_element_left_score: null,
    html_element_right_score: null,
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
    // Callback
    end_of_game_callback: null,
}

function init_pong_game_htmlelements()
{

    with ( pong_game )
    {
        html_element_game_canvas = document.getElementById(`game-canvas`);
        html_element_start_button = document.getElementById(`start-button`);
        html_element_left_paddle = document.getElementById(`left-paddle`);
        html_element_right_paddle = document.getElementById(`right-paddle`);
        html_element_ball = document.getElementById(`ball`);
        html_element_left_score = document.getElementById(`left-score`);
        html_element_right_score = document.getElementById(`right-score`);
    }
}

function new_point()
{
    /**
     * Returns true if match is over, false otherwise
     */
    print_current_score();
    reset_paddles_and_ball();
    if ( pong_game.left_score == 3 || pong_game.right_score == 3 )
        return true;
}

function print_current_score()
{
    // document.getElementById("local-1v1-left-score").innerHTML = pong_game.left_score;
    // document.getElementById("local-1v1-right-score").innerHTML = pong_game.right_score;

    pong_game.html_element_left_score.innerHTML = pong_game.left_score;
    pong_game.html_element_right_score.innerHTML = pong_game.right_score;
}

function reset_paddles_and_ball()
{
    pong_game.left_paddle_percent = pong_game.paddle_top_max_value_percentage / 2;
    pong_game.right_paddle_percent = pong_game.paddle_top_max_value_percentage / 2;
    pong_game.ball_left_percent = pong_game.ball_left_max_value_percentage / 2;
    pong_game.ball_top_percent = pong_game.ball_top_max_value_percentage / 2;

    pong_game.ball_theta = ( 2 * Math.random() - 1 ) * Math.PI / 4;
    if ( pong_game.last_scorer == "left" )
        pong_game.ball_theta = Math.PI - pong_game.ball_theta;
    pong_game.ball_r = pong_game.init_ball_r;
    pong_game.ball_dx = pong_game.ball_r * Math.cos( pong_game.ball_theta );
    pong_game.ball_dy = pong_game.ball_r * Math.sin( pong_game.ball_theta );
    pong_game.last_bounce = null;
}

function check_score()
{
    let left_paddle_rect = pong_game.html_element_left_paddle.getBoundingClientRect();
    let right_paddle_rect = pong_game.html_element_right_paddle.getBoundingClientRect();
    let ball_rect = pong_game.html_element_ball.getBoundingClientRect();

    if ( ball_rect.left < left_paddle_rect.right )
    {
        if ( ball_rect.bottom < left_paddle_rect.top || ball_rect.top > left_paddle_rect.bottom )
        {
            pong_game.right_score += 1;
            pong_game.last_scorer = "right";
            return true;
        }
    }
    if ( ball_rect.right > right_paddle_rect.left )
    {
        if (ball_rect.bottom < right_paddle_rect.top || ball_rect.top > right_paddle_rect.bottom )
        {
            pong_game.left_score += 1;
            pong_game.last_scorer = "left";
            return true;
        }
    }
    return false;
}

function check_wall_collision()
{
    let canvas_rect = pong_game.html_element_game_canvas.getBoundingClientRect();
    let ball_rect = pong_game.html_element_ball.getBoundingClientRect();

    if ( ball_rect.top < canvas_rect.top || ball_rect.bottom > canvas_rect.bottom )
    {
        pong_game.ball_top_percent = clamp( pong_game.ball_top_percent, 0, pong_game.ball_top_max_value_percentage );
        pong_game.ball_theta = -pong_game.ball_theta;
        pong_game.ball_dx = pong_game.ball_r * Math.cos( pong_game.ball_theta );
        pong_game.ball_dy = pong_game.ball_r * Math.sin( pong_game.ball_theta );
    }
}

function check_paddle_collision()
{
    let left_paddle_rect = pong_game.html_element_left_paddle.getBoundingClientRect();
    let right_paddle_rect = pong_game.html_element_right_paddle.getBoundingClientRect();
    let ball_rect = pong_game.html_element_ball.getBoundingClientRect();

    if ( ball_rect.left > left_paddle_rect.right && ball_rect.right < right_paddle_rect.left )
        return ;

    if ( ball_rect.left < left_paddle_rect.right && pong_game.last_bounce != "left" )
        bounce_on_paddle( (ball_rect.top + ball_rect.bottom) / 2, left_paddle_rect.top, left_paddle_rect.bottom, "left" );
    if ( ball_rect.right > right_paddle_rect.left && pong_game.last_bounce != "right" )
        bounce_on_paddle( (ball_rect.top + ball_rect.bottom) / 2, right_paddle_rect.top, right_paddle_rect.bottom, "right" );
}

function bounce_on_paddle( mean_ball_height, top, bottom, paddle )
{
    mean_ball_height = clamp( mean_ball_height, top, bottom );
    let new_theta = pong_game.max_bounce_angle - 2 * pong_game.max_bounce_angle * (bottom - mean_ball_height) / (bottom - top);
    if ( paddle == "right" )
    {
        new_theta = Math.PI - new_theta;
        pong_game.ball_left_percent = pong_game.ball_left_max_value_percentage;
    }
    if ( paddle == "left" )
        pong_game.ball_left_percent = pong_game.ball_left_min_value_percentage;
    pong_game.ball_theta = new_theta;
    pong_game.ball_dx = pong_game.ball_r * Math.cos( pong_game.ball_theta );
    pong_game.ball_dy = pong_game.ball_r * Math.sin( pong_game.ball_theta );
    pong_game.ball_r *= pong_game.ball_acceleration;
    pong_game.last_bounce = paddle;
}

function update_paddles_positions( time_delta_ms )
{
    pong_game.left_paddle_percent += (pong_game.left_paddle_down - pong_game.left_paddle_up) * pong_game.paddle_speed * time_delta_ms;
    pong_game.right_paddle_percent += (pong_game.right_paddle_down - pong_game.right_paddle_up) * pong_game.paddle_speed * time_delta_ms;
    pong_game.left_paddle_percent = clamp( pong_game.left_paddle_percent, 0, pong_game.paddle_top_max_value_percentage );
    pong_game.right_paddle_percent = clamp( pong_game.right_paddle_percent, 0, pong_game.paddle_top_max_value_percentage );
    pong_game.html_element_left_paddle.style.top = `${pong_game.left_paddle_percent}%`;
    pong_game.html_element_right_paddle.style.top = `${pong_game.right_paddle_percent}%`;
}

function update_ball_position( time_delta_ms )
{
    pong_game.ball_left_percent += pong_game.ball_dx * ( time_delta_ms );
    pong_game.ball_top_percent += pong_game.ball_dy * ( time_delta_ms );
    pong_game.html_element_ball.style.left = `${pong_game.ball_left_percent}%`;
    pong_game.html_element_ball.style.top = `${pong_game.ball_top_percent}%`;
}
