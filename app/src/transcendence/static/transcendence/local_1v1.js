
function remove_main_local_1v1_listeners( main )
{
    /**
     * Remove paddle controls listeners
     */
    pong_game.html_element_start_button.removeEventListener( "click", start_local_pvp_game );
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
    // pong_game.html_element_game_canvas.style.borderWidth = `${pong_game.game_canvas_border_width_px}px`;
    init_pong_game_htmlelements( "local-1v1" );
    pong_game.html_element_start_button.addEventListener( "click", start_local_pvp_game );
    pong_game.html_element_start_button.classList.replace( "hidden", "shown" );
}

function clean_main_local_1v1( main )
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
    pong_game.end_of_game_callback = end_local_pvp_game;
    pong_game.html_element_start_button.classList.replace( "shown", "hidden" );
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
            pong_game.end_of_game_callback();
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

function end_local_pvp_game()
{
    pong_game.game_in_progress = false;
    update_main_local_1v1();
}

function clamp( num, min, max )
{
    return num < min ? min : ( num > max ? max : num );
}

function init_game_state()
{
    pong_game.left_paddle_height = pong_game.html_element_left_paddle.getBoundingClientRect().height;
    pong_game.right_paddle_height = pong_game.html_element_right_paddle.getBoundingClientRect().height;
    pong_game.ball_height = pong_game.html_element_ball.getBoundingClientRect().height;
    let game_canvas_bounding_rect = pong_game.html_element_game_canvas.getBoundingClientRect();
    game_canvas_height = game_canvas_bounding_rect.height;
    game_canvas_width  = game_canvas_bounding_rect.width;

    pong_game.paddle_top_max_value_percentage = 100 * ( game_canvas_height - pong_game.left_paddle_height ) / game_canvas_height;
    pong_game.ball_top_max_value_percentage = 100 * ( game_canvas_height - pong_game.ball_height ) / game_canvas_height;
    pong_game.ball_left_min_value_percentage = 100 * pong_game.html_element_left_paddle.getBoundingClientRect().width / game_canvas_width;
    pong_game.ball_left_max_value_percentage = 100 * ( game_canvas_width - pong_game.html_element_right_paddle.getBoundingClientRect().width - pong_game.ball_height ) / game_canvas_width;

    pong_game.left_paddle_percent = pong_game.paddle_top_max_value_percentage / 2;
    pong_game.right_paddle_percent = pong_game.paddle_top_max_value_percentage / 2;
    pong_game.ball_left_percent = pong_game.ball_left_max_value_percentage / 2;
    pong_game.ball_top_percent = pong_game.ball_top_max_value_percentage / 2;

    pong_game.html_element_left_paddle.style.transform = "translate(0, 0)";
    pong_game.html_element_right_paddle.style.transform = "translate(-100%, 0)";
    pong_game.html_element_left_paddle.style.top = `${pong_game.left_paddle_percent}%`;
    pong_game.html_element_right_paddle.style.top = `${pong_game.right_paddle_percent}%`;
    pong_game.html_element_ball.style.transform = "translate(0, 0)";
    pong_game.html_element_ball.style.left = `${pong_game.ball_left_percent}%`;
    pong_game.html_element_ball.style.top = `${pong_game.ball_top_percent}%`;

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
