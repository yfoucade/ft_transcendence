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
    "main-local-match-pvp": local_match_pvp_hydration_recipe,
    "main-local-match-pvai": local_match_pvai_hydration_recipe,
    "main-local-tournament-form": local_tournament_form_hydration_recipe,
    "main-local-tournament-lobby": local_tournament_lobby_hydration_recipe,
    "main-local-tournament-match": local_tournament_match_hydration_recipe,
    "main-login": login_hydration_recipe,
    "main-profile": profile_hydration_recipe,
    "main-signup": signup_hydration_recipe,
    "main-edit-profile": edit_profile_hydration_recipe,
    "main-password-change": password_change_hydration_recipe,
    "main-password-change-done": password_change_done_hydration_recipe,
    "main-leaderboard": leaderboard_hydration_recipe,
    "main-user-details": user_details_hydration_recipe,
    "main-following": following_hydration_recipe,
    "main-select-opponent": select_opponent_hydration_recipe,
    "main-online-game": online_game_hydration_recipe,
    "main-online-tournament": online_tournament_hydration_recipe,
}

let dehydration_recipes = {
    "main-local-match-pvp": local_match_pvp_dehydration_recipe,
    "main-local-match-pvai": local_match_pvai_dehydration_recipe,
    "main-local-tournament-lobby": local_tournament_lobby_dehydration_recipe,
    "main-local-tournament-match": local_tournament_match_dehydration_recipe,
    "main-online-game": online_game_dehydration_recipe,
    "main-online-tournament": online_tournament_dehydration_recipe,
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

    pong_game.html_element_start_button.innerHTML = "Start game";
    pong_game.html_element_start_button.addEventListener( "click", start_local_tournament_match );
    pong_game.html_element_start_button.classList.replace( "hidden", "shown" );
}

function local_tournament_match_dehydration_recipe()
{
    state.inner_state = e_inner_state.init;
    pong_game.game_in_progress = false;
    pong_game.html_element_start_button.removeEventListener( "click", back_to_lobby );
    return true;
}

function local_tournament_lobby_hydration_recipe()
{
    local_tournament_obj.html_element_button = document.getElementById("local-tournament-lobby-button");
    local_tournament_obj.html_element_button.addEventListener( "click", get_local_tournament_match_view );
    // window.addEventListener( "beforeunload", local_tournament_lobby_handle_refresh );
}

function local_tournament_lobby_dehydration_recipe()
{
    // window.removeEventListener( "beforeunload", local_tournament_lobby_handle_refresh );
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
        players_list = [];
    }

    document.getElementById("start-tournament").addEventListener( "click", start_tournament );
}

function local_match_pvp_dehydration_recipe()
{
    end_local_pvp_game();
    return true;
}

function local_match_pvai_dehydration_recipe()
{
    end_local_pvp_game();
    pong_game.opponnent_is_ai = false;
    pong_game.ai_type = null;
    return true;
}

function play_hydration_recipe()
{
    let main = document.querySelector("main");
    for ( let element of main.querySelectorAll("a") )
        element.addEventListener( "click", route );
}

function local_match_pvp_hydration_recipe()
{
    init_pong_game_htmlelements();
    pong_game.html_element_start_button.addEventListener( "click", start_local_pvp_game );
    pong_game.html_element_start_button.classList.replace( "hidden", "shown" );
}

function local_match_pvai_hydration_recipe()
{
    init_pong_game_htmlelements( ai_type = "new" );
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
    let main = document.querySelector("main");
    let links = main.querySelectorAll("a:not(form a)");
    for ( let link of links )
        link.addEventListener( "click", route );
    document.getElementById("logout-link").addEventListener( "click", logout );
}

function edit_profile_hydration_recipe()
{
    let main = document.querySelector("main");
    let links = main.querySelectorAll("a:not(form a)");
    for ( let link of links )
        link.addEventListener( "click", route );
    document.getElementById("logout-link").addEventListener( "click", logout );
    document.getElementById("edit-profile-form").addEventListener( "submit", submit_edit_profile_form );
}

function password_change_hydration_recipe()
{
    document.getElementById("password-change-form").addEventListener( "submit", submit_form );
}

function password_change_done_hydration_recipe()
{
    let main = document.querySelector("main");
    let links = main.querySelectorAll("a:not(form a)");
    for ( let link of links )
        link.addEventListener( "click", route );
    document.getElementById("logout-link").addEventListener( "click", logout );
}

function leaderboard_hydration_recipe()
{
    let main = document.querySelector("main");
    let links = main.querySelectorAll("a");
    for ( let link of links )
        link.addEventListener( "click", route );
}

function user_details_hydration_recipe()
{
    form = document.getElementById("follow-form")
    if (!form)
        return;
    form.addEventListener( "submit", submit_form );
}

function following_hydration_recipe()
{
    let main = document.querySelector("main");
    let links = main.querySelectorAll("a");
    for ( let link of links )
        link.addEventListener( "click", route );
}

function select_opponent_hydration_recipe()
{
    let main = document.querySelector("main");
    let links = main.querySelectorAll("a");
    for ( let link of links )
        link.addEventListener( "click", route );
}

function online_game_hydration_recipe()
{
    hydrate_online_game();
}

function online_tournament_hydration_recipe()
{
    hydrate_online_tournament();
}

function online_game_dehydration_recipe()
{
    if ( online_game_lobby_obj.ask_confirmation_before_leaving
        && !confirm("Data will be lost, leave anyway ?"))
        return false;
    if ( online_game_obj.websocket )
    {
        if ( online_game_obj.websocket.readyState == 1 )
            online_game_obj.websocket.close();
        online_game_obj.websocket = null;
    }
    // if (online_game_obj.elt_div_result)
    // {
    //     online_game_obj.elt_div_result.innerHTML = "";
    //     online_game_obj.elt_div_result.classList.replace("shown", "hidden");
    // }
    return true; // can leave page
}

function online_tournament_dehydration_recipe()
{
    if ( online_tournament_obj.ask_confirmation_before_leaving
         && !confirm("The tournament is still running, leave anyway ?"))
         return false;
    console.log("closing websocket");
    if ( online_tournament_obj.websocket )
        online_tournament_obj.websocket.close();
    return true;
}

async function submit_form( event )
{
    event.preventDefault();

    let form = event.currentTarget;
    let form_data = new FormData( form );

    let response = await fetch( form.action,
        {
            method: form.method,
            body: form_data,
        }
    );
    update_view( response );
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

    body = document.querySelector("body");
    if ( document.getElementById("game-canvas") )
        body.style.overflow = "hidden";
    else
        body.style.overflow = "";

    if ( state.main_id in hydration_recipes )
        hydration_recipes[state.main_id]();
}

function render() {
    let new_document = new DOMParser().parseFromString(state.document, "text/html");

    let old_body = document.querySelector("body");
    let new_body = new_document.querySelector("body");
    old_body.parentNode.replaceChild(new_body, old_body);

    hydrate_common_elements();
}
