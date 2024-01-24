let game_state = {
    // htmlElements
    elt_current_score: document.getElementById("current-score"),
    elt_target_value: document.getElementById("target-value"),
    elt_player_value: document.getElementById("player-value"),

    // game
    game_id: null,

    // connection
    event_source: null,

    // key status
    going_up: false,
    going_down: false,
};

async function init_game()
{
    let response = await fetch( "init_game" );
    response = await response.json();
    console.log(response);
    console.log(`Game id: ${response.game_id}`);
    game_state.game_id = response.game_id;
    game_state.event_source = new EventSource(`connect/${game_state.game_id}`);
    game_state.event_source.addEventListener( "update", update_state );
    game_state.event_source.addEventListener( "game-over", close_event_source );
    window.addEventListener( "keydown", handle_keydown );
    window.addEventListener( "keyup", handle_keyup );
}

function update_state( event )
{
    data = JSON.parse(event.data);
    // console.log(`data: ${data}`)
    game_state.elt_current_score.innerHTML = data.current_score;
    game_state.elt_target_value.innerHTML = data.target_value;
    game_state.elt_player_value.innerHTML = data.player_value;
}

function close_event_source( event )
{
    game_state.event_source.close();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handle_keydown( event )
{
    if (event.key == "ArrowUp" && !game_state.going_up)
    {
        game_state.going_up = true;
        await fetch(`player_event/${game_state.game_id}/keydown/up`);
    }
    else if (event.key == "ArrowDown" && !game_state.going_down)
    {
        game_state.going_down = true;
        await fetch(`player_event/${game_state.game_id}/keydown/down`);
    }
}

async function handle_keyup( event )
{
    if (event.key == "ArrowUp" && game_state.going_up)
    {
        game_state.going_up = false;
        await fetch(`player_event/${game_state.game_id}/keyup/up`);
    }
    else if (event.key == "ArrowDown" && game_state.going_down)
    {
        game_state.going_down = false;
        await fetch(`player_event/${game_state.game_id}/keyup/down`);
    }
}

init_game();
