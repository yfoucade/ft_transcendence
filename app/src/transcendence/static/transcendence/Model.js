class Model {
    constructor () {
        this._current_activity = null;
        // TODO: move the following functions in the current class.
        // as some of these will update attributes of the class (eg new game instance)
        this._listener_removers = {
            "main-local-1v1": this.remove_main_local_1v1_listeners,
        };
        this._view_updaters = {
            "main-local-1v1": this.update_main_local_1v1,
        }
        this._view_cleaners = {
            "main-local-1v1": this.clean_main_local_1v1,
        }
        this._local_game = null;
    }

    ask_confirmation_before_view_change() { return ( this._current_activity != null && this._current_activity != "local 1v1" ) }

    get_current_activity() { return this._current_activity; }

    stop_current_activity() { this._current_activity = null; }

    switch_view( old_main, new_main )
    {
        let old_main_id = old_main.getAttribute("id");
        let new_main_id = new_main.getAttribute("id");

        if ( old_main_id in this._listener_removers )
            this._listener_removers[old_main_id]( old_main );
        if ( new_main_id in this._view_updaters )
            this._view_updaters[new_main_id]( new_main ); // Add elements and listeners
        old_main.classList.replace( "shown", "hidden" );
        new_main.classList.replace( "hidden", "shown" );
        if ( old_main_id in this._view_cleaners )
            this._view_cleaners[old_main_id]( old_main );
    }

    remove_main_local_1v1_listeners( main )
    {
    }

    start_game( event )
    {
        console.log("starting local 1v1 game");
        this._local_game.start_game();
        event.currentTarget.remove();
    }

    update_main_local_1v1( main )
    {
        /*
            Create local game with empty strings for player names.
            the game will add its assets but won't add the listeners yet.
            Current class finally adds a 'start' button, and listen to the button.
            On click, remove listener and button, and call local_1v1.start_game()
            that will add its own listeners.
        */
        let game_canvas = document.getElementById("game-canvas");
        window.addEventListener( "end_local_1v1", this.end_local_1v1 );
        this._local_game = new LocalGame("", "", game_canvas);
        this._start_game_button = document.createElement("button");
        this._start_game_button.id = "button-start-1v1";
        this._start_game_button.classList = "link";
        this._start_game_button.appendChild(document.createTextNode("Start"));
        game_canvas.appendChild( this._start_game_button );

        this._start_game_button.addEventListener( "click", (event) => {this.start_game(event)} );
    }

    clean_main_local_1v1( main )
    {
    }

    end_local_1v1() {
        console.log("end of local 1v1 game");
    }

}