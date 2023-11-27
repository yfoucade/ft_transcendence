let listener_removers = {
    "main-local-1v1": remove_main_local_1v1_listeners,
};

let view_updaters = {
    "main-local-1v1": update_main_local_1v1,
};

let view_cleaners = {
    "main-local-1v1": clean_main_local_1v1,
};

let local_1v1_game = {
    // HTMLElements
    game_canvas: document.getElementById("game-canvas"),
    start_button: document.getElementById("local-1v1-start-button"),
    left_paddle: document.getElementById("local-1v1-left-paddle"),
    right_paddle: document.getElementById("local-1v1-right-paddle"),
    ball: document.getElementById("local-1v1-ball"),
    left_score: document.getElementById("local-1v1-left-score"),
    right_score: document.getElementById("local-1v1-right-score"),
    // Display settings
    // game_canvas_border_width_px: 3,
    // Sizes and positions
    left_paddle_height: null,
    right_paddle_height: null,
    ball_height: null, // ball_width == ball_height
    paddle_top_max_value_percentage: null,
    ball_top_max_value_percentage: null,
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

function init_navigation_listeners( event )
{
    let nav_elements_ids = ["nav-home", "nav-play", "nav-local-1v1"];

    for ( let id of nav_elements_ids ) {
        console.log(`Adding listener for ${id}`);
        let element = document.getElementById(id);
        element.addEventListener( "click", handle_nav_event );
    }
    local_1v1_game.start_button.addEventListener( "click", start_local_1v1_game );
}

function handle_nav_event( event )
{
    let old_main = document.querySelector(".shown");
    let new_main = document.getElementById( event.currentTarget.getAttribute("data-target-main-id") );
    switch_view( old_main, new_main );
}

function switch_view( old_main, new_main )
{
    let old_main_id = old_main.getAttribute("id");
    let new_main_id = new_main.getAttribute("id");

    if ( old_main_id in listener_removers )
        listener_removers[old_main_id]( old_main );
    if ( new_main_id in view_updaters )
        view_updaters[new_main_id]( new_main );
    old_main.classList.replace( "shown", "hidden" );
    new_main.classList.replace( "hidden", "shown" );
    if ( old_main_id in view_cleaners )
        view_cleaners[old_main_id]( old_main );
}


function remove_main_local_1v1_listeners( main )
{
    /**
     * Remove paddle controls listeners
     */
    window.removeEventListener( "keydown", handle_keydown );
    window.removeEventListener( "keyup", handle_keyup);
}

function update_main_local_1v1( main )
{
    /**
     * Initialize game
     * Show 'Start' button
     * 
     */
    // local_1v1_game.game_canvas.style.borderWidth = `${local_1v1_game.game_canvas_border_width_px}px`;
    local_1v1_game.start_button.classList.replace( "hidden", "shown" );
}

function clean_main_local_1v1( main )
{
    /**
     * center paddles and ball
     */
    local_1v1_game.game_in_progress = false;
}

function start_local_1v1_game( event )
{
    /**
     * Hide 'Start' button
     * Add event listeners on paddles
     * Launch ball
     */
    init_game_state();
    local_1v1_game.start_button.classList.replace( "shown", "hidden" );
    // call the animation function that will call requestAnimationFrame()
    local_1v1_game.game_in_progress = true;
    requestAnimationFrame( time => animate(time, time) );
}

function animate( time, last_time )
{
    update_paddles_positions( time - last_time );
    update_ball_position( time - last_time );
    if ( check_score() )
    {
        if ( new_point() )
        {
            end_game();
            return;
        }
    }
    else
    {
        check_wall_collision();
        check_paddle_collision();
    }
    if ( local_1v1_game.game_in_progress )
        requestAnimationFrame( new_time => animate(new_time, time) );
}

function new_point()
{
    /**
     * Returns true if match is over, false otherwise
     */
    print_current_score();
    reset_paddles_and_ball();
    if ( local_1v1_game.left_score == 3 || local_1v1_game.right_score == 3 )
        return true;
}

function print_current_score()
{
    document.getElementById("local-1v1-left-score").innerHTML = local_1v1_game.left_score;
    document.getElementById("local-1v1-right-score").innerHTML = local_1v1_game.right_score;
}

function reset_paddles_and_ball()
{
    local_1v1_game.left_paddle_percent = local_1v1_game.paddle_top_max_value_percentage / 2;
    local_1v1_game.right_paddle_percent = local_1v1_game.paddle_top_max_value_percentage / 2;
    local_1v1_game.ball_left_percent = local_1v1_game.ball_left_max_value_percentage / 2;
    local_1v1_game.ball_top_percent = local_1v1_game.ball_top_max_value_percentage / 2;

    local_1v1_game.ball_theta = ( 2 * Math.random() - 1 ) * Math.PI / 4;
    if ( local_1v1_game.last_scorer == "left" )
        local_1v1_game.ball_theta = Math.PI - local_1v1_game.ball_theta;
    local_1v1_game.ball_r = local_1v1_game.init_ball_r;
    local_1v1_game.ball_dx = local_1v1_game.ball_r * Math.cos( local_1v1_game.ball_theta );
    local_1v1_game.ball_dy = local_1v1_game.ball_r * Math.sin( local_1v1_game.ball_theta );
    local_1v1_game.last_bounce = null;
}

function end_game()
{
    update_main_local_1v1();
}

function check_score()
{
    let left_paddle_rect = local_1v1_game.left_paddle.getBoundingClientRect();
    let right_paddle_rect = local_1v1_game.right_paddle.getBoundingClientRect();
    let ball_rect = local_1v1_game.ball.getBoundingClientRect();

    if ( ball_rect.left < left_paddle_rect.right )
    {
        if ( ball_rect.bottom < left_paddle_rect.top || ball_rect.top > left_paddle_rect.bottom )
        {
            local_1v1_game.right_score += 1;
            local_1v1_game.last_scorer = "right";
            return true;
        }
    }
    if ( ball_rect.right > right_paddle_rect.left )
    {
        if (ball_rect.bottom < right_paddle_rect.top || ball_rect.top > right_paddle_rect.bottom )
        {
            local_1v1_game.left_score += 1;
            local_1v1_game.last_scorer = "left";
            return true;
        }
    }
    return false;
}

function check_wall_collision()
{
    let canvas_rect = local_1v1_game.game_canvas.getBoundingClientRect();
    let ball_rect = local_1v1_game.ball.getBoundingClientRect();

    if ( ball_rect.top < canvas_rect.top || ball_rect.bottom > canvas_rect.bottom )
    {
        local_1v1_game.ball_top_percent = clamp( local_1v1_game.ball_top_percent, 0, local_1v1_game.ball_top_max_value_percentage );
        local_1v1_game.ball_theta = -local_1v1_game.ball_theta;
        local_1v1_game.ball_dx = local_1v1_game.ball_r * Math.cos( local_1v1_game.ball_theta );
        local_1v1_game.ball_dy = local_1v1_game.ball_r * Math.sin( local_1v1_game.ball_theta );
    }
}

function check_paddle_collision()
{
    let left_paddle_rect = local_1v1_game.left_paddle.getBoundingClientRect();
    let right_paddle_rect = local_1v1_game.right_paddle.getBoundingClientRect();
    let ball_rect = local_1v1_game.ball.getBoundingClientRect();

    if ( ball_rect.left > left_paddle_rect.right && ball_rect.right < right_paddle_rect.left )
        return ;

    if ( ball_rect.left < left_paddle_rect.right && local_1v1_game.last_bounce != "left" )
        bounce( (ball_rect.top + ball_rect.bottom) / 2, left_paddle_rect.top, left_paddle_rect.bottom, false );
    if ( ball_rect.right > right_paddle_rect.left && local_1v1_game.last_bounce != "right" )
        bounce( (ball_rect.top + ball_rect.bottom) / 2, right_paddle_rect.top, right_paddle_rect.bottom, true );
}

function bounce( mean_ball_height, top, bottom, go_left )
{
    mean_ball_height = clamp( mean_ball_height, top, bottom );
    let new_theta = local_1v1_game.max_bounce_angle - 2 * local_1v1_game.max_bounce_angle * (bottom - mean_ball_height) / (bottom - top);
    if ( go_left )
        new_theta = Math.PI - new_theta;
    local_1v1_game.ball_theta = new_theta;
    local_1v1_game.ball_dx = local_1v1_game.ball_r * Math.cos( local_1v1_game.ball_theta );
    local_1v1_game.ball_dy = local_1v1_game.ball_r * Math.sin( local_1v1_game.ball_theta );
    local_1v1_game.ball_r *= local_1v1_game.ball_acceleration;
    local_1v1_game.last_bounce = go_left ? "right" : "left";
}

function clamp( num, min, max )
{
    return num < min ? min : ( num > max ? max : num );
}

function update_paddles_positions( time_delta_ms )
{
    local_1v1_game.left_paddle_percent += (local_1v1_game.left_paddle_down - local_1v1_game.left_paddle_up) * local_1v1_game.paddle_speed * time_delta_ms;
    local_1v1_game.right_paddle_percent += (local_1v1_game.right_paddle_down - local_1v1_game.right_paddle_up) * local_1v1_game.paddle_speed * time_delta_ms;
    local_1v1_game.left_paddle_percent = clamp( local_1v1_game.left_paddle_percent, 0, local_1v1_game.paddle_top_max_value_percentage );
    local_1v1_game.right_paddle_percent = clamp( local_1v1_game.right_paddle_percent, 0, local_1v1_game.paddle_top_max_value_percentage );
    local_1v1_game.left_paddle.style.top = `${local_1v1_game.left_paddle_percent}%`;
    local_1v1_game.right_paddle.style.top = `${local_1v1_game.right_paddle_percent}%`;
}

function update_ball_position( time_delta_ms )
{
    local_1v1_game.ball_left_percent += local_1v1_game.ball_dx * ( time_delta_ms );
    local_1v1_game.ball_top_percent += local_1v1_game.ball_dy * ( time_delta_ms );
    local_1v1_game.ball.style.left = `${local_1v1_game.ball_left_percent}%`;
    local_1v1_game.ball.style.top = `${local_1v1_game.ball_top_percent}%`;
}

function init_game_state()
{
    // TODO: use height and width directly
    console.log("Initialising game state");
    let left_paddle_bounding_rect = local_1v1_game.left_paddle.getBoundingClientRect();
    console.log("left_paddle bottom and top:", left_paddle_bounding_rect.bottom, left_paddle_bounding_rect.top);
    local_1v1_game.left_paddle_height = left_paddle_bounding_rect.bottom - left_paddle_bounding_rect.top;
    console.log("left_paddle_height:", local_1v1_game.left_paddle_height);
    let right_paddle_bounding_rect = local_1v1_game.right_paddle.getBoundingClientRect();
    local_1v1_game.right_paddle_height = right_paddle_bounding_rect.bottom - right_paddle_bounding_rect.top;
    let ball_bounding_rect = local_1v1_game.ball.getBoundingClientRect();
    console.log("ball_bounding_rect:", ball_bounding_rect.bottom, ball_bounding_rect.top);
    local_1v1_game.ball_height = ball_bounding_rect.bottom - ball_bounding_rect.top;
    let game_canvas_bounding_rect = local_1v1_game.game_canvas.getBoundingClientRect();
    game_canvas_height = game_canvas_bounding_rect.height;
    game_canvas_width  = game_canvas_bounding_rect.width;
    console.log("canvas border width:", local_1v1_game.game_canvas.style.borderWidth);

    local_1v1_game.paddle_top_max_value_percentage = 100 * ( game_canvas_height - local_1v1_game.left_paddle_height ) / game_canvas_height;
    local_1v1_game.ball_top_max_value_percentage = 100 * ( game_canvas_height - local_1v1_game.ball_height ) / game_canvas_height;
    local_1v1_game.ball_left_max_value_percentage = 100 * ( game_canvas_width - local_1v1_game.ball_height ) / game_canvas_width;

    local_1v1_game.left_paddle_percent = local_1v1_game.paddle_top_max_value_percentage / 2;
    local_1v1_game.right_paddle_percent = local_1v1_game.paddle_top_max_value_percentage / 2;
    local_1v1_game.ball_left_percent = local_1v1_game.ball_left_max_value_percentage / 2;
    local_1v1_game.ball_top_percent = local_1v1_game.ball_top_max_value_percentage / 2;

    local_1v1_game.left_paddle.style.transform = "translate(0, 0)";
    local_1v1_game.right_paddle.style.transform = "translate(-100%, 0)";
    local_1v1_game.left_paddle.style.top = `${local_1v1_game.left_paddle_percent}%`;
    local_1v1_game.right_paddle.style.top = `${local_1v1_game.right_paddle_percent}%`;
    local_1v1_game.ball.style.transform = "translate(0, 0)";
    local_1v1_game.ball.style.left = `${local_1v1_game.ball_left_percent}%`;
    local_1v1_game.ball.style.top = `${local_1v1_game.ball_top_percent}%`;

    // local_1v1_game.ball_theta = Math.random() * Math.PI / 2 - Math.PI / 4;
    local_1v1_game.ball_theta = ( 2 * Math.random() - 1 ) * Math.PI / 4;
    if ( Math.random() < .5 )
        local_1v1_game.ball_theta = Math.PI - local_1v1_game.ball_theta;
    local_1v1_game.ball_r = local_1v1_game.init_ball_r;
    local_1v1_game.ball_dx = local_1v1_game.ball_r * Math.cos( local_1v1_game.ball_theta );
    local_1v1_game.ball_dy = local_1v1_game.ball_r * Math.sin( local_1v1_game.ball_theta );

    local_1v1_game.left_score = 0;
    local_1v1_game.right_score = 0;
    local_1v1_game.last_scorer = null;
    local_1v1_game.last_bounce = null;
    print_current_score();

    // Install listeners
    window.addEventListener( "keydown", handle_keydown );
    window.addEventListener( "keyup", handle_keyup );
}

function handle_keydown( event )
{
    console.log( "keydown:", event.key );
    if ( event.key == "e")
        local_1v1_game.left_paddle_up = true;
    else if ( event.key == "d" )
        local_1v1_game.left_paddle_down = true;
    else if ( event.key == "ArrowUp" )
        local_1v1_game.right_paddle_up = true;
    else if ( event.key == "ArrowDown" )
        local_1v1_game.right_paddle_down = true;
}

function handle_keyup( event )
{
    if ( event.key == "e")
        local_1v1_game.left_paddle_up = false;
    else if ( event.key == "d" )
        local_1v1_game.left_paddle_down = false;
    else if ( event.key == "ArrowUp" )
        local_1v1_game.right_paddle_up = false;
    else if ( event.key == "ArrowDown" )
        local_1v1_game.right_paddle_down = false;
}