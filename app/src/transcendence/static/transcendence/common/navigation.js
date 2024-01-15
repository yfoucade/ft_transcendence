e_inner_state = {
    "init": null,
    "match_done": 1,
}

let state = {
    "pathname": null,
    "document": null, // https://stackoverflow.com/questions/11551633/can-i-use-js-to-serialize-the-current-dom
    "main_id": null,
    "inner_state": null,
    // "hydration_recipe": null,
}


let hydration_recipes = {
    "main-index": home_page,
    "main-play": play_hydration_recipe,
    "main-local-match": local_match_hydration_recipe,
    "main-local-tournament-form": local_tournament_form_hydration_recipe,
    "main-local-tournament-lobby": local_tournament_lobby_hydration_recipe,
    "main-local-tournament-match": local_tournament_match_hydration_recipe,
    "main-login": login_hydration_recipe,
    "main-profile": profile_hydration_recipe,
    "main-signup": signup_hydration_recipe,
}

let dehydration_recipes = {
    "main-local-match": local_match_dehydration_recipe,
    "main-local-tournament-lobby": local_tournament_lobby_dehydration_recipe,
    "main-local-tournament-match": local_tournament_match_dehydration_recipe,
}

function home_page()
{
    console.log("welcome to transcendence");
}

function local_tournament_match_hydration_recipe()
{
    init_pong_game_htmlelements();
    if ( state.inner_state == e_inner_state.match_done )
    {
        console.log( "match is done" );
        pong_game.html_element_start_button.innerHTML = "Back to lobby";
        pong_game.html_element_start_button.addEventListener( "click", back_to_lobby );
        pong_game.html_element_start_button.classList.replace( "hidden", "shown" );
        return ;
    }

    init_game_state();
    window.addEventListener( "beforeunload", (event)=>{event.preventDefault();} );

    pong_game.html_element_start_button.innerHTML = "Start game";
    pong_game.html_element_start_button.addEventListener( "click", start_local_tournament_match );
    pong_game.html_element_start_button.classList.replace( "hidden", "shown" );
}

function local_tournament_match_dehydration_recipe()
{
    state.inner_state = e_inner_state.init;
    pong_game.html_element_start_button.removeEventListener( "click", back_to_lobby );
    return true;
}

function local_tournament_lobby_hydration_recipe()
{
    local_tournament_obj.html_element_button = document.getElementById("local-tournament-lobby-button");
    local_tournament_obj.html_element_button.addEventListener( "click", get_local_tournament_match_view );
    window.addEventListener( "beforeunload", local_tournament_lobby_handle_refresh );
}

function local_tournament_lobby_dehydration_recipe()
{
    window.removeEventListener( "beforeunload", local_tournament_lobby_handle_refresh );
    return true;
}

function local_tournament_form_hydration_recipe()
{
    console.log("hydrating form");
    with ( tournament_form )
    {
        html_element_form = document.getElementById("local-tournament-form");
        html_element_error_message_form = document.getElementById("error-message-form");
        html_element_text_input = document.getElementById("form-player-name");
        html_element_registered_players = document.getElementById("div-player-list");
        html_element_error_message_start = document.getElementById("error-message-start");
        
        csrftoken = tournament_form.html_element_form.querySelector("input[name=csrfmiddlewaretoken]").value;
        html_element_form.addEventListener( "submit", add_player_to_local_tournament );

        html_element_text_input.focus();
    }

    document.getElementById("start-tournament").addEventListener( "click", start_tournament );
}

function local_match_dehydration_recipe()
{
    end_local_pvp_game();
    // TODO: remove event listeners
    return true;
}

// Todo: put in right file
function play_hydration_recipe()
{
    let main = document.querySelector("main");
    for ( let element of main.querySelectorAll("a") )
        element.addEventListener( "click", route );
}

function local_match_hydration_recipe()
{
    init_pong_game_htmlelements();
    pong_game.html_element_start_button.addEventListener( "click", start_local_pvp_game );
    pong_game.html_element_start_button.classList.replace( "hidden", "shown" );
}

function login_hydration_recipe()
{
    document.getElementById("login-form").addEventListener( "submit", submit_login_form );
    let main = document.querySelector("main");
    let links = main.querySelectorAll("a");
    for ( let link of links )
        link.addEventListener( "click", route );
}

function signup_hydration_recipe()
{
    document.getElementById("signup-form").addEventListener( "submit", submit_signup_form );
}

function profile_hydration_recipe()
{
    document.getElementById("logout-link").addEventListener( "click", logout );
}

function can_leave_view()
{
    return (    !(state.main_id in dehydration_recipes)
             || (dehydration_recipes[state.main_id]()) );
}

function pop_state_event_handler( event ) {
    event.preventDefault();
    console.log("pop_state_event_handler: starting");

    if ( !can_leave_view() )
        return ;

    // dehydrate view
    if ( state.main_id in dehydration_recipes )
        dehydration_recipes[state.main_id]();

    if ( event.state ) {
        state = event.state;
        render( state );
    }
    else {
        update_state();
        history.replaceState(state, "", state.pathname);
        hydrate_common_elements();
    }

    if ( state.main_id in hydration_recipes )
        hydration_recipes[state.main_id]();
}

// TODO: JSdoc
function update_state( pathname = null, new_document = null ) {
    state.pathname = pathname == null ? location.pathname : pathname;
    if ( new_document == null )
    {
        state.document = document.documentElement.outerHTML;
        state.main_id = document.querySelector("main").getAttribute("id");
    }
    else
    {
        state.document = new_document;
        let parsed_document = new DOMParser().parseFromString( new_document, "text/html" );
        state.main_id = parsed_document.querySelector("main").getAttribute("id");
    }
}


async function route( event ) {
    event.preventDefault();
    
    let href = event.currentTarget.getAttribute("href");
    console.log(`redirecting to ${href}`);
    let response = await fetch( href, {"referrer":state.pathname} );
    
    update_view( response );
}

async function update_view( response )
{
    if ( !response.ok )
        return;
    let document_text = await response.text();
    if ( response.status != 200 )
    {
        console.log(document_text);
        return;
    }
    if ( !can_leave_view() )
        return;

    if ( response.url == state.pathname )
    {
        update_state( response.url, document_text );
        history.replaceState( state, "", response.url );
    }
    else
    {
        state.inner_state = e_inner_state.init;
        update_state( response.url, document_text );
        history.pushState( state, "", response.url );
    }
    render();

    if ( state.main_id in hydration_recipes )
        hydration_recipes[state.main_id]();
}

function render() {
    let new_document = new DOMParser().parseFromString(state.document, "text/html");

    let old_usertag = document.getElementById("user-tag");
    let new_usertag = new_document.getElementById("user-tag");
    old_usertag.parentElement.replaceChild(new_usertag, old_usertag);
    new_usertag.querySelector("a").addEventListener( "click", route );

    let old_main = document.querySelector("main");
    let new_main = new_document.querySelector("main");
    old_main.parentNode.replaceChild(new_main, old_main);
}