class Model {
    constructor () {
        this._local_or_online = null; // current game: "local", "online", or null
        this._1v1_or_tournament = null; // current game: "1v1", "tournament", or null
    }

    ask_confirmation_before_view_change() {
        if ( this._local_or_online == null )
            return false;
        if ( this._local_or_online == "local" && this._1v1_or_tournament == "1v1")
            return false;
        return true;
    }

    get_current_activity()
    {
        return this._1v1_or_tournament;
    }

    stop_current_activity()
    {
        this._local_or_online = null;
        this._1v1_or_tournament = null;
    }
}