let state = {
    "pathname": null,
    "document": null, // https://stackoverflow.com/questions/11551633/can-i-use-js-to-serialize-the-current-dom
    "main_id": null,
    // "hydration_recipe": null,
}


let hydration_recipes = {
    "main-index": home_page,
    "main-play": play_hydration_recipe,
    "main-local-match": local_match_hydration_recipe,
}

let dehydration_recipes = {
    "main-local-match": local_match_dehydration_recipe,

}

function home_page()
{
    console.log("welcome to transcendence");
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

function can_leave_view()
{
    return (    (state.main_id in dehydration_recipes)
             && (dehydration_recipes[state.main_id]()) );
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

    if ( !can_leave_view() )
        return;

    let href = event.currentTarget.getAttribute("href");
    console.log(`redirecting to ${href}`);
    let response = await fetch( href, {"referrer":state.pathname} );
    if ( !response.ok )
        return;
    let document_text = await response.text();
    if ( response.status != 200 )
    {
        console.log(document_text);
        return;
    }

    if ( href == state.pathname )
    {
        update_state( href, document_text );
        history.replaceState( state, "", state.pathname );
    }
    else
    {
        update_state( href, document_text );
        history.pushState( state, "", state.pathname );
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

    let old_main = document.querySelector("main");
    let new_main = new_document.querySelector("main");
    old_main.parentNode.replaceChild(new_main, old_main);
}