let listener_removers = {
    "main-local-1v1": remove_main_local_1v1_listeners,
};

let view_updaters = {
    "main-local-1v1": update_main_local_1v1,
    "main-local-tournament-lobby": update_main_local_tournament_lobby,
    "main-local-tournament-match": update_main_local_tournament_match,
};

let view_cleaners = {
    "main-local-1v1": clean_main_local_1v1,
    "main-local-tournament-form": clean_form,
    "main-local-tournament-lobby": clean_main_local_tournament_lobby,
};

let after_loading = {
    "main-local-tournament-form": update_main_local_tournament_form,
    "main-local-tournament-match": after_loading_main_local_tournament_match,
}

function init_listeners( event )
{
    let nav_elements_ids = ["nav-home", "nav-play", "nav-local-pvp", "nav-local-tournament"];

    for ( let id of nav_elements_ids ) {
        console.log(`Adding listener for ${id}`);
        let element = document.getElementById(id);
        element.addEventListener( "click", handle_nav_event );
    }
    document.getElementById("local-tournament-form").addEventListener( "submit", add_player_to_local_tournament );
    document.getElementById("start-tournament").addEventListener( "click", start_tournament );
}


function handle_nav_event( event )
{
    let old_main = document.querySelector("main[class~=shown]");
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
    if ( new_main_id in after_loading )
        after_loading[new_main_id]( new_main );
    if ( old_main_id in view_cleaners )
        view_cleaners[old_main_id]( old_main );
}
