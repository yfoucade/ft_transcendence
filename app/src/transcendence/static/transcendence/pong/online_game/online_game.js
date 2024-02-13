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
    elt_div_result: null,
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
    websocket: null,
    game_id: null,
	user_id: null,

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

        // elt_button_play.addEventListener( "click", join_game );
        // elt_button_abort.addEventListener( "click", abort_game );
    }
    online_game_obj.websocket = new WebSocket(
        "wss://"
        + window.location.host
        + "/ws/online-game/"
        );
    online_game_obj.websocket.addEventListener( "open", hydrate_buttons );
    online_game_obj.websocket.addEventListener( "message", ws_message_dispatcher );
}

function hydrate_buttons(event)
{
    online_game_lobby_obj.elt_button_play.addEventListener( "click", join_game );
    online_game_lobby_obj.elt_button_abort.addEventListener( "click", abort_game );
}

function join_game( event )
{
    with (online_game_lobby_obj)
    {
        elt_div_play.classList.replace("shown", "hidden");
        elt_div_waiting.classList.replace("hidden", "shown");
        ask_confirmation_before_leaving = true;
    }

    with (online_game_obj)
    {
        websocket.send(JSON.stringify({"type":"game.join"}))
        // event_source = new EventSource("/sse-online-game");
        // event_source.addEventListener( "debug", og_print_debug );
        // event_source.addEventListener( "close", og_close_connection );
        // event_source.addEventListener( "wait", og_wait_handler );
        // event_source.addEventListener( "init", og_init_handler );
        // // event_source.addEventListener( "countdown", og_countdown_handler );
        // event_source.addEventListener( "position", og_position_handler );
        // // event_source.addEventListener( "done", og_done_handler );
        // // event_source.onerror = (err) => { og_error_handler(err) };
    }
}

function og_disconnect_handler(loser)
{
    console.log("Disconnecting");
    online_game_obj.websocket.close();
    online_game_lobby_obj.ask_confirmation_before_leaving = false;
    winner = loser == "left" ? "right" : "left";
    online_game_obj.elt_div_result.innerHTML = `${loser} player left the game. ${winner} player won.`;
    online_game_obj.elt_div_result.classList.replace("hidden", "shown");
}

function og_game_over(content)
{
    online_game_lobby_obj.ask_confirmation_before_leaving = false;
    online_game_obj.websocket.close();
    online_game_obj.elt_div_result.innerHTML = `${content.winner_side} player Won.`;
    online_game_obj.elt_div_result.classList.replace("hidden", "shown");
}

function ws_message_dispatcher(event)
{
    // console.log(event);
    content = JSON.parse(event.data);
	if ( content.type == "game.connect" )
		og_game_connect( content );
    if ( content.type == "game.init" )
        og_init_handler(content.data);
    if ( content.type == "game.update" )
        og_update_handler(content.data);
    if ( content.type == "game.disconnect" )
        og_disconnect_handler(content.who_side);
    if ( content.type == "game.over" )
        og_game_over( content );
}

function og_game_connect( data )
{
    console.log(data);
	online_game_obj.user_id = data.user_id;
}

function og_print_debug(event)
{
    console.log(`${event.data}`);
}

function og_close_connection(event)
{
    console.log("closing event source");
    if (online_game_obj.event_source)
        online_game_obj.event_source.close();
    online_game_lobby_obj.ask_confirmation_before_leaving = false;
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
    if (online_game_obj.websocket == null)
        return;
    online_game_obj.websocket.send(JSON.stringify(
        {
            type: "game.abort",
        }
    ));
}

function init_online_game_elements()
{
    with (online_game_obj)
    {
        elt_game_elements = document.getElementById("game-elements");
        elt_div_result = document.getElementById("div-result");
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

        window.addEventListener( "keydown", og_handle_keydown );
        window.addEventListener( "keyup", og_handle_keyup );
    }
}

function og_handle_keydown( event )
{
    if (event.key == "ArrowUp" && !online_game_obj.going_up)
    {
        online_game_obj.going_up = true;
        send_paddle_movement();
    }
    else if (event.key == "ArrowDown" && !online_game_obj.going_down)
    {
        online_game_obj.going_down = true;
        send_paddle_movement();
    }
}

function og_handle_keyup( event )
{
    if (event.key == "ArrowUp" && online_game_obj.going_up)
    {
        online_game_obj.going_up = false;
        send_paddle_movement();
    }
    else if (event.key == "ArrowDown" && online_game_obj.going_down)
    {
        online_game_obj.going_down = false;
        send_paddle_movement();
    }
}

function send_paddle_movement()
{
	if ( !online_game_obj.websocket )
		return;
    online_game_obj.websocket.send(JSON.stringify(
        {
        "type": "game.paddle",
        "up": online_game_obj.going_up,
        "down": online_game_obj.going_down,
        }
    ));
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

function og_init_handler( data )
{
    init_online_game_elements();
    set_online_game_elt_values(data);
    online_game_lobby_obj.elt_div_lobby.classList.replace( "shown", "hidden" );
    online_game_obj.elt_game_elements.classList.replace( "hidden", "shown" );
    console.log(data);
}

function og_update_handler(data)
{
    next_frame(data);
}
