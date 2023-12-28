let state = {
    "pathname": null,
    "document": null, // https://stackoverflow.com/questions/11551633/can-i-use-js-to-serialize-the-current-dom
    "main_id": null,
    // "hydration_recipe": null,
}


let callbacks = {
    "main-index": home_page,
}


function home_page()
{
    console.log("welcome to transcendence");
}


function pop_state_event_handler( event ) {
    event.preventDefault();
    console.log("pop_state_event_handler: starting");
    if ( event.state ) {
        /* render state */
        state = event.state;
        render( state );
    }
    else {
        initialize_state();
        history.replaceState(state, "", state.pathname);
        hydrate_common_elements();
    }
    // hydrate( state.hydration_recipe );
    if ( state.main_id in callbacks )
        callbacks[state.main_id]();
}


function initialize_state() {
    state.pathname = location.pathname;
    state.document = new XMLSerializer().serializeToString( document );
    state.main_id = document.querySelector("main").getAttribute("id");
}


async function route( event ) {
    event.preventDefault();
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
}