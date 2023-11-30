/**
 * TODO:
 * Split game related source code in several modules:

    1 module for the code common to all games ( pong game class, fonctions to manipulate the game elements…)

    1 module for each game mode:

    local pvp

    local pvai

    local tournament

    online pvp

    online tournament
 */

let listener_removers = {
    "main-local-pvp": remove_main_local_pvp_listeners,
};

let view_updaters = {
    "main-local-pvp": update_main_local_pvp,
};

let view_cleaners = {
    "main-local-pvp": clean_main_local_pvp,
};


function init_navigation_listeners( event )
{
    let nav_elements_ids = ["nav-home", "nav-play", "nav-local-pvp"];

    for ( let id of nav_elements_ids ) {
        console.log(`Adding listener for ${id}`);
        let element = document.getElementById(id);
        element.addEventListener( "click", handle_nav_event );
    }
    pong_game.start_button.addEventListener( "click", start_local_pvp_game );
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

function remove_main_local_pvp_listeners( main )
{
    /**
     * Remove paddle controls listeners
     */
    window.removeEventListener( "keydown", handle_keydown );
    window.removeEventListener( "keyup", handle_keyup);
}

function update_main_local_pvp( main )
{
    /**
     * Initialize game
     * Show 'Start' button
     * 
     */
    // pong_game.game_canvas.style.borderWidth = `${pong_game.game_canvas_border_width_px}px`;
    pong_game.start_button.classList.replace( "hidden", "shown" );
}

function clean_main_local_pvp( main )
{
    /**
     * center paddles and ball
     */
    pong_game.game_in_progress = false;
}

function start_local_pvp_game( event )
{
    /**
     * Hide 'Start' button
     * Add event listeners on paddles
     * Launch ball
     */
    init_game_state();
    pong_game.start_button.classList.replace( "shown", "hidden" );
    // call the animation function that will call requestAnimationFrame()
    pong_game.game_in_progress = true;
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
    if ( pong_game.game_in_progress )
        requestAnimationFrame( new_time => animate(new_time, time) );
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
    document.getElementById("local-pvp-left-score").innerHTML = pong_game.left_score;
    document.getElementById("local-pvp-right-score").innerHTML = pong_game.right_score;
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

function end_game()
{
    pong_game.game_in_progress = false;
    update_main_local_pvp();
}

function check_score()
{
    let left_paddle_rect = pong_game.left_paddle.getBoundingClientRect();
    let right_paddle_rect = pong_game.right_paddle.getBoundingClientRect();
    let ball_rect = pong_game.ball.getBoundingClientRect();

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
    let canvas_rect = pong_game.game_canvas.getBoundingClientRect();
    let ball_rect = pong_game.ball.getBoundingClientRect();

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
    let left_paddle_rect = pong_game.left_paddle.getBoundingClientRect();
    let right_paddle_rect = pong_game.right_paddle.getBoundingClientRect();
    let ball_rect = pong_game.ball.getBoundingClientRect();

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

function clamp( num, min, max )
{
    return num < min ? min : ( num > max ? max : num );
}

function update_paddles_positions( time_delta_ms )
{
    pong_game.left_paddle_percent += (pong_game.left_paddle_down - pong_game.left_paddle_up) * pong_game.paddle_speed * time_delta_ms;
    pong_game.right_paddle_percent += (pong_game.right_paddle_down - pong_game.right_paddle_up) * pong_game.paddle_speed * time_delta_ms;
    pong_game.left_paddle_percent = clamp( pong_game.left_paddle_percent, 0, pong_game.paddle_top_max_value_percentage );
    pong_game.right_paddle_percent = clamp( pong_game.right_paddle_percent, 0, pong_game.paddle_top_max_value_percentage );
    pong_game.left_paddle.style.top = `${pong_game.left_paddle_percent}%`;
    pong_game.right_paddle.style.top = `${pong_game.right_paddle_percent}%`;
}

function update_ball_position( time_delta_ms )
{
    pong_game.ball_left_percent += pong_game.ball_dx * ( time_delta_ms );
    pong_game.ball_top_percent += pong_game.ball_dy * ( time_delta_ms );
    pong_game.ball.style.left = `${pong_game.ball_left_percent}%`;
    pong_game.ball.style.top = `${pong_game.ball_top_percent}%`;
}

function init_game_state()
{
    pong_game.left_paddle_height = pong_game.left_paddle.getBoundingClientRect().height;
    pong_game.right_paddle_height = pong_game.right_paddle.getBoundingClientRect().height;
    pong_game.ball_height = pong_game.ball.getBoundingClientRect().height;
    let game_canvas_bounding_rect = pong_game.game_canvas.getBoundingClientRect();
    game_canvas_height = game_canvas_bounding_rect.height;
    game_canvas_width  = game_canvas_bounding_rect.width;

    pong_game.paddle_top_max_value_percentage = 100 * ( game_canvas_height - pong_game.left_paddle_height ) / game_canvas_height;
    pong_game.ball_top_max_value_percentage = 100 * ( game_canvas_height - pong_game.ball_height ) / game_canvas_height;
    pong_game.ball_left_min_value_percentage = 100 * pong_game.left_paddle.getBoundingClientRect().width / game_canvas_width;
    pong_game.ball_left_max_value_percentage = 100 * ( game_canvas_width - pong_game.right_paddle.getBoundingClientRect().width - pong_game.ball_height ) / game_canvas_width;

    pong_game.left_paddle_percent = pong_game.paddle_top_max_value_percentage / 2;
    pong_game.right_paddle_percent = pong_game.paddle_top_max_value_percentage / 2;
    pong_game.ball_left_percent = pong_game.ball_left_max_value_percentage / 2;
    pong_game.ball_top_percent = pong_game.ball_top_max_value_percentage / 2;

    pong_game.left_paddle.style.transform = "translate(0, 0)";
    pong_game.right_paddle.style.transform = "translate(-100%, 0)";
    pong_game.left_paddle.style.top = `${pong_game.left_paddle_percent}%`;
    pong_game.right_paddle.style.top = `${pong_game.right_paddle_percent}%`;
    pong_game.ball.style.transform = "translate(0, 0)";
    pong_game.ball.style.left = `${pong_game.ball_left_percent}%`;
    pong_game.ball.style.top = `${pong_game.ball_top_percent}%`;

    // pong_game.ball_theta = Math.random() * Math.PI / 2 - Math.PI / 4;
    pong_game.ball_theta = ( 2 * Math.random() - 1 ) * Math.PI / 4;
    if ( Math.random() < .5 )
        pong_game.ball_theta = Math.PI - pong_game.ball_theta;
    pong_game.ball_r = pong_game.init_ball_r;
    pong_game.ball_dx = pong_game.ball_r * Math.cos( pong_game.ball_theta );
    pong_game.ball_dy = pong_game.ball_r * Math.sin( pong_game.ball_theta );

    pong_game.left_score = 0;
    pong_game.right_score = 0;
    pong_game.last_scorer = null;
    pong_game.last_bounce = null;
    print_current_score();

    // Install listeners
    window.addEventListener( "keydown", handle_keydown );
    window.addEventListener( "keyup", handle_keyup );
}

function handle_keydown( event )
{
    if ( event.key == "e")
        pong_game.left_paddle_up = true;
    else if ( event.key == "d" )
        pong_game.left_paddle_down = true;
    else if ( event.key == "ArrowUp" )
        pong_game.right_paddle_up = true;
    else if ( event.key == "ArrowDown" )
        pong_game.right_paddle_down = true;
}

function handle_keyup( event )
{
    if ( event.key == "e")
        pong_game.left_paddle_up = false;
    else if ( event.key == "d" )
        pong_game.left_paddle_down = false;
    else if ( event.key == "ArrowUp" )
        pong_game.right_paddle_up = false;
    else if ( event.key == "ArrowDown" )
        pong_game.right_paddle_down = false;
}