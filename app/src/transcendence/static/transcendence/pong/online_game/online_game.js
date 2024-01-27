let online_game_lobby_obj = {
    //htmlElements
    elt_div_lobby: null,
    elt_div_play: null,
    elt_div_waiting: null,
    elt_button_play: null,
    elt_button_abort: null,

    // page status
    ask_confirmation_before_leaving: false,
}

let online_game_obj = {
    // htmlElements
    elt_game_elements: null,
    elt_player1_img: null,
    elt_player1_name: null,
    elt_player2_img: null,
    elt_player2_name: null,
    elt_canvas: null,
    elt_left_paddle: null,
    elt_ball: null,
    elt_right_paddle: null,
    elt_left_score: null,
    elt_right_score: null,
    
    // API
    event_source: null,
    game_id: null,

    // key_status
    going_up: false,
    going_down: false,
};

function hydrate_online_game()
{
    hydrate_common_elements();
    with (online_game_lobby_obj)
    {
        elt_div_lobby = document.getElementById("lobby");
        elt_div_play = document.getElementById("div-play");
        elt_div_waiting = document.getElementById("div-waiting");
        elt_button_play = document.getElementById("button-play");
        elt_button_abort = document.getElementById("button-abort");

        elt_button_play.addEventListener( "click", wait_game );
        elt_button_abort.addEventListener( "click", abort_game );
    }
}

function wait_game( event )
{
    with (online_game_lobby_obj)
    {
        elt_div_play.classList.replace("shown", "hidden");
        elt_div_waiting.classList.replace("hidden", "shown");
        ask_confirmation_before_leaving = true;
    }

    with (online_game_obj)
    {
        console.log("connecting to event source");
        event_source = new EventSource("/sse-online-game");
        event_source.addEventListener( "debug", og_print_debug );
        event_source.addEventListener( "close", og_close_connection );
        event_source.addEventListener( "wait", og_wait_handler );
        event_source.addEventListener( "init", og_init_handler );
        // event_source.addEventListener( "countdown", og_countdown_handler );
        // event_source.addEventListener( "position", og_position_handler );
        // event_source.addEventListener( "done", og_done_handler );
        // event_source.onerror = (err) => { og_error_handler(err) };
    }
}

function og_print_debug(event)
{
    console.log(`${event.data}`);
}

function og_close_connection(event)
{
    console.log("closing event source");
    online_game_obj.event_source.close();
    online_game_obj.ask_confirmation_before_leaving = false;
}

async function og_wait_handler(event)
{
    data = JSON.parse(event.data);
    online_game_obj.game_id = data.game_id;
    console.log(`game_id: ${data.game_id}`);
}

function abort_game( event )
{
    online_game_lobby_obj.elt_div_waiting.classList.replace("shown", "hidden");
    online_game_lobby_obj.elt_div_play.classList.replace("hidden", "shown");
    online_game_lobby_obj.ask_confirmation_before_leaving = false;
    if (online_game_obj.event_source == null)
        return;
    online_game_obj.event_source.close();
}

function init_online_game_elements()
{
    with (online_game_obj)
    {
        elt_game_elements = document.getElementById("game-elements");
        elt_player1_img = document.getElementById("player1-img");
        elt_player1_name = document.getElementById("player1-name");
        elt_player2_img = document.getElementById("player2-img");
        elt_player2_name = document.getElementById("player2-name");
        elt_canvas = document.getElementById("game-canvas");
        elt_left_paddle = document.getElementById("left-paddle");
        elt_ball = document.getElementById("ball");
        elt_right_paddle = document.getElementById("right-paddle");
        elt_left_score = document.getElementById("left-score");
        elt_right_score = document.getElementById("right-score");
    }
}

function set_online_game_elt_values(data)
{
    online_game_obj.elt_player1_img.src = data.player_1_avatar_url;
    online_game_obj.elt_player1_name.innerHTML = data.player_1_display_name;
    online_game_obj.elt_player2_img.src = data.player_2_avatar_url;
    online_game_obj.elt_player2_name.innerHTML = data.player_2_display_name;
    online_game_obj.elt_canvas.style.height = data.canvas_height;
    online_game_obj.elt_canvas.style.aspectRatio = data.canvas_aspect_ratio;
    next_frame(data);
}

/**
 * update scores and position of game elements
 * @param {Object} data 
 */
function next_frame(data)
{
    online_game_obj.elt_left_score.innerHTML = data.left_score;
    online_game_obj.elt_right_score.innerHTML = data.right_score;
    online_game_obj.elt_left_paddle.style.top = `${data.left_paddle_top_pct}%`;
    online_game_obj.elt_right_paddle.style.top = `${data.right_paddle_top_pct}%`;
    online_game_obj.elt_ball.style.top = `${data.ball_top_pct}%`;
    online_game_obj.elt_ball.style.left = `${data.ball_left_pct}%`;
    online_game_obj.elt_left_paddle.style.transform = "translate(0, 0)";
    online_game_obj.elt_right_paddle.style.transform = "translate(-100%, 0)";
    online_game_obj.elt_ball.style.transform = "translate(0, 0)";
}

function og_init_handler( event )
{
    init_online_game_elements();
    data = JSON.parse(event.data);
    set_online_game_elt_values(data);
    online_game_lobby_obj.elt_div_lobby.classList.replace( "shown", "hidden" );
    online_game_obj.elt_game_elements.classList.replace( "hidden", "shown" );
    console.log(data);
}
