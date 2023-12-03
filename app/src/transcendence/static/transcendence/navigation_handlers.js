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
    // "main-local-tournament-form": clean_main_local_tournament_form,
};

function init_listeners( event )
{
    let nav_elements_ids = ["nav-home", "nav-play", "nav-local-pvp", "nav-local-tournament"];

    for ( let id of nav_elements_ids ) {
        console.log(`Adding listener for ${id}`);
        let element = document.getElementById(id);
        element.addEventListener( "click", handle_nav_event );
    }
    pong_game.start_button.addEventListener( "click", start_local_pvp_game );
    document.getElementById("local-tournament-form").addEventListener( "submit", add_player_to_local_tournament );
    document.getElementById("start-tournament").addEventListener( "click", start_tournament );
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
