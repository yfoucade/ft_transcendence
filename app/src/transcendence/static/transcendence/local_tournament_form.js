
let tournament_form = {
    // HTMLElements
    html_element_error_message_form: document.getElementById("error-message-form"),
    html_element_text_input: document.getElementById("form-player-name"),
    html_element_player_list: document.getElementById("div-player-list"),
    html_element_error_message_start: document.getElementById("error-message-start"),

    // Config
    max_players: 8,

    // State
    player_list: null,
};

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
    tournament_form.html_element_player_list.appendChild( new_player_element );
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

function start_tournament( event )
{
    if ( get_number_of_players() < 2 )
    {
        tournament_form.html_element_error_message_start.innerHTML = "Need at list two players";
        return;
    }
    init_players_list();
    // show_tournament_page();
    // clean_form();
    console.log("Starting tournament");
}

function init_players_list()
{
    let res = [];
    players_elements = tournament_form.html_element_player_list.querySelectorAll(".player-name");
    for ( element of players_elements )
    {
        res.push(element.innerHTML);
    }
    console.log(`List of players: ${res}`);
}