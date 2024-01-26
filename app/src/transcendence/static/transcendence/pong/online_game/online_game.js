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
    elt_player1: null,
    elt_player2: null,
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
}

async function og_wait_handler(event)
{
    data = JSON.parse(event.data);
    online_game_obj.game_id = data.game_id;
    console.log(`game_id: ${data.game_id}`);
    // online_game_obj.event_source.close();
    // online_game_obj.event_source = null;
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
