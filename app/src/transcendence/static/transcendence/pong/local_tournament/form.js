
let tournament_form = {
    // HTMLElements
    html_element_form: null,
    html_element_csrf_token: null,
    html_element_error_message_form: null,
    html_element_text_input: null,
    html_element_registered_players: null,
    html_element_error_message_start: null,

    // csrftoken
    csrftoken: null,

    // Config
    max_players: 8,
};

function update_main_local_tournament_form( element ){
    console.log("update_main_local_tournament_form");
    tournament_form.html_element_text_input.focus();
}

function add_player_to_local_tournament( event )
{
    event.preventDefault();
    let name = tournament_form.html_element_text_input.value;
    if ( !name )
        return;
    if ( !valid_player_name( name ) )
    {
        tournament_form.html_element_error_message_form.innerHTML = "Allowed characters: alphanumeric and underscore.";
        return;
    }
    if ( check_number_of_players() )
    {
        tournament_form.html_element_error_message_form.innerHTML = "Max number of players reached.";
        return;
    }
    tournament_form.html_element_error_message_form.innerHTML = '';
    let new_player_element = build_registration_element( name );
    tournament_form.html_element_registered_players.appendChild( new_player_element );
    tournament_form.html_element_text_input.value = "";
    if ( get_number_of_players() == 2 )
        tournament_form.html_element_error_message_start.innerHTML = "";
}

function get_number_of_players()
{
    return document.querySelectorAll(".registered-player").length;
}

function check_number_of_players()
{
    return get_number_of_players() >= tournament_form.max_players;
}

function valid_player_name( name )
{
    let regex = /^[A-Za-z0-9_]*$/;
    return regex.test( name );
}

function build_registration_element( name )
{
    let res = document.createElement("div");
    res.classList.add("registered-player");

    let player_name = document.createElement("span");
    player_name.classList.add("player-name");
    player_name.innerHTML = name;
    res.appendChild( player_name );

    let remove_player = document.createElement("span");
    remove_player.classList.add("remove-player");
    remove_player.innerHTML = "+";
    remove_player.addEventListener( "click", remove_player_handler );
    res.appendChild( remove_player );

    return res;
}

function remove_player_handler( event )
{
    event.currentTarget.parentNode.remove();
}

async function start_tournament( event )
{
    if ( get_number_of_players() < 2 )
    {
        tournament_form.html_element_error_message_start.innerHTML = "Need at list two players";
        return;
    }
    init_local_tournament_obj();
    init_pong_game_htmlelements();
    // let current_main = document.getElementById("main-local-tournament-form");
    // let target_main = document.getElementById("main-local-tournament-lobby");
    // switch_view( current_main, target_main );
    // show_tournament_page();
    let tournament_state_string = JSON.stringify( local_tournament_obj );
    console.log( tournament_state_string );
    
    let response = await fetch(
        "/local-tournament/lobby/",
        {
            method: "POST",
            headers: {
                "X-CSRFToken": tournament_form.csrftoken,
                "Content-Type": "application/json",
            },
            body: tournament_state_string,
        },
    );
    let document_text = await response.text();
    update_state( "/local-tournament/lobby/", document_text );
    history.pushState( state, "", state.pathname );
    render();
    // console.log(document_text);
    // clean_form();
    console.log("Starting tournament");
}


function clean_form()
{
    with (tournament_form)
    {
        html_element_text_input.innerHTML = "";
        html_element_registered_players.innerHTML = "";
    }
}