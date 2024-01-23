let game_state = {
    // htmlElements
    elt_current_score: document.getElementById("current-score"),
    elt_target_value: document.getElementById("target-value"),
    elt_player_value: document.getElementById("player-value"),

    // game
    game_id: null,

    // connection
    event_source: null,
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

init_game();
