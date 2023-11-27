class Controller {
    constructor( model ) {
        this._model = model;
    }

    init_navigation_listeners()
    {
        /*
        Navigation elements (class="link") are the ones that change
        the <main> section of the page.
        The handler must hide the currently 'shown' <main>, and show the
        <main> with id=event.target.getAttribute("data-target-main-id").
        Also ask for confirmation ( window.confirm(message) ) if an online
        game or a local tournament is in progress.
        */
        let nav_element_ids = ["nav-home", "nav-play", "nav-local-1v1"];
        console.log(`Installing listeners`);
        for ( let id of nav_element_ids ) {
            console.log(`Adding listener for ${id}`);
            let element = document.getElementById(id);
            element.addEventListener( "click", (event) => {this.handle_nav_event(event)} );
        }
        window.addEventListener( 'beforeunload', (event) => {this.before_unload(event)} );
    }

    handle_nav_event(event)
    {
        if ( this._model.ask_confirmation_before_view_change() )
        {
            current_activity = this._model.get_current_activity();
            message = `You are currently in a ${current_activity}\nDo you want to quit ?`;
            if ( !window.confirm( message ) )
                return ;
            this._model.stop_current_activity();
        }
        let current_main = document.querySelector(".shown");
        let target_main = document.getElementById( event.currentTarget.getAttribute("data-target-main-id") );
        this._model.switch_view( current_main, target_main );
        // current_main.classList.replace( "shown", "hidden" );
        // target_main.classList.replace( "hidden", "shown" );
    }

    before_unload( event )
    {
        // event.preventDefault();
        console.log("Are you leaving ?");
    }
}
