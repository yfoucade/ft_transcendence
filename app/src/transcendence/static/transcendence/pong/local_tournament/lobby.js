class Match {
    /**
     * @constructor
     * @param {string} left_player - player on the left of the screen
     * @param {string} right_player - player on the right, null if `left_player` has a bye
     */
    constructor( left_player, right_player ) {
        this.left_player = left_player;
        this.right_player = right_player;
        this.is_bye = this.right_player == null;
        this.winner = this.is_bye ? "left" : null;
        this.final_score = [0, 0];
    }

    set_final_score( left_score, right_score ) {
        this.final_score = [ left_score, right_score ];
        this.winner = this.final_score[0] > this.final_score[1] ? "left" : "right";
    }

    update_winner() {
    }

    get_htmlelement() {
        let res = document.createElement("div");
        let left = document.createElement("span");
        let separator = document.createElement("span");
        let right = document.createElement("span");
        
        res.classList.add("match");
        left.classList.add("left-player");
        if ( this.winner == "left" )
            left.classList.add("match-winner");
        separator.classList.add("separator");
        right.classList.add("right-player");
        if ( this.winner == "right" )
            right.classList.add("match-winner");
        if ( this.is_bye )
            right.classList.add("bye");

        left.innerHTML = this.left_player;
        separator.innerHTML = "-";
        right.innerHTML = this.is_bye ? "bye" : this.right_player;

        res.appendChild(left);
        res.appendChild(separator);
        res.appendChild(right);

        return res;
    }
};

let local_tournament_obj = {
    // Lobby HTMLElements
    // html_element_main: document.getElementById("main-local-tournament-lobby"),
    // html_element_current_round_name: document.getElementById("local-tournament-lobby-current-round-name"),
    // html_element_next_match: document.getElementById("local-tournament-lobby-next-match"),
    // html_element_winner: document.getElementById("local-tournament-lobby-winner"),
    // html_element_next_round: document.getElementById("div-local-tournament-lobby-next-round"),
    // html_element_players_eliminated: document.getElementById("div-local-tournament-lobby-players-out"),
    // html_element_button: document.getElementById("local-tournament-lobby-button"),

    html_element_main: null,
    html_element_current_round_name: null,
    html_element_next_match: null,
    html_element_winner: null,
    html_element_next_round: null,
    html_element_players_eliminated: null,
    html_element_button: null,

    // State
    registered_players: null,
    remaining_players: null, // dict, keys (str): name, values (bool): has had a bye.
    eliminated_players: null,
    current_round: null, // int
    current_round_matches: null, // array of Match objects
    current_match: null,
    current_round_qualified: null, // array
    current_round_eliminated: null, // array
};

function init_local_tournament_obj()
{
    init_registered_players();
    init_remaining_players();
    local_tournament_obj.eliminated_players = [];
    local_tournament_obj.current_round = 0;
    make_pairings();
}

function init_registered_players()
{
    local_tournament_obj.registered_players = [];
    players_elements = tournament_form.html_element_registered_players.querySelectorAll(".player-name");
    for ( element of players_elements )
    {
        local_tournament_obj.registered_players.push(element.innerHTML);
    }
    console.log(`List of players: ${local_tournament_obj.registered_players}`);

}

function init_remaining_players()
{
    // Initialize remaining_players with no bye.
    local_tournament_obj.remaining_players = {};
    for ( player of local_tournament_obj.registered_players )
        local_tournament_obj.remaining_players[player] = 0;
}

function make_pairings()
{
    // if ( local_tournament_obj.current_round_qualified )
    //     local_tournament_obj.remaining_players = [...local_tournament_obj.current_round_qualified];

    with ( local_tournament_obj ) {
        current_round += 1
        current_round_matches = [];
        current_match = 0;
        current_round_qualified = [];
        current_round_eliminated = [];
    }

    if ( Object.keys( local_tournament_obj.remaining_players ).length == 1 )
    // if ( local_tournament_obj.remaining_players.length == 1 )
        return;

    let players = Object.keys(local_tournament_obj.remaining_players);
    console.log(players);
    if ( players.length % 2 )
    {
        let i = 0;
        while ( i < players.length )
        {
            if ( local_tournament_obj.remaining_players[players[i]] == false )
            {
                local_tournament_obj.current_round_matches.push(new Match(players[i], null));
                local_tournament_obj.remaining_players[players[i]] += 1;
                players.splice(i, 1);
                break;
            }
            i++;
        }
        local_tournament_obj.current_match = 1;
    }
    for ( let i = 0; i < players.length; i += 2 )
        local_tournament_obj.current_round_matches.push( new Match(players[i], players[i+1]) );

    console.log(local_tournament_obj.current_round_matches);
}

async function get_lobby_view()
{
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
    update_view( response );
    // let document_text = await response.text();
    // update_state( response.url, document_text );
    // history.pushState( state, "", state.pathname );
    // render();
    // if ( state.main_id in hydration_recipes )
    //     hydration_recipes[state.main_id]();
}

async function get_results_view()
{
    let tournament_state_string = JSON.stringify( local_tournament_obj );
    console.log( tournament_state_string );
    
    let response = await fetch(
        "/local-tournament/results/",
        {
            method: "POST",
            headers: {
                "X-CSRFToken": tournament_form.csrftoken,
                "Content-Type": "application/json",
            },
            body: tournament_state_string,
        },
    );
    update_view( response );
}

function local_tournament_lobby_handle_refresh( event )
{
    event.preventDefault();
    get_lobby_view();
}

function update_main_local_tournament_lobby( element )
{
    if ( local_tournament_obj.current_round_matches.length )
    {
        update_next_match();
        for ( match of local_tournament_obj.current_round_matches )
            local_tournament_obj.html_element_next_round.appendChild(match.get_htmlelement());
        update_button( "Next match" );
    }
    else
    {
        update_winner();
        update_button( "Restart tournament" );
    }
    update_eliminated();
}

function update_button( action )
{
    local_tournament_obj.html_element_button.innerHTML = action;
    if ( action == "Next match" )
        local_tournament_obj.html_element_button.addEventListener( "click", start_next_match );
    else
        local_tournament_obj.html_element_button.addEventListener( "click", restart_tournament );
}

function start_next_match( event )
{
    console.log( "starting next match" );
    let target_main = document.getElementById("main-local-tournament-match");
    switch_view( local_tournament_obj.html_element_main, target_main );
}

function restart_tournament( event )
{
    console.log( "restarting tournament" );
}

function update_next_match()
{
    let n_matches = local_tournament_obj.current_round_matches.length;
    let round_name = ["Final", "Semifinals", "Quarterfinals", "Quarterfinals"][n_matches-1];
    local_tournament_obj.html_element_current_round_name.innerHTML = round_name;
    let match = local_tournament_obj.current_round_matches[local_tournament_obj.current_match];
    let text = `Next match: ${match.left_player} vs ${match.right_player}`;
    local_tournament_obj.html_element_next_match.innerHTML = text;
}

function update_winner()
{
    let winner = Object.keys(local_tournament_obj.remaining_players)[0];
    let text = `Winner: ${winner}`;
    local_tournament_obj.html_element_winner.innerHTML = text;
}

function update_eliminated()
{
    if ( local_tournament_obj.eliminated_players == null )
        return;

    for ( player of local_tournament_obj.eliminated_players )
    {
        let element = document.createElement("div");
        element.innerHTML = player;
        local_tournament_obj.html_element_players_eliminated.appendChild(element);
    }
}

function clean_main_local_tournament_lobby( main_element )
{
    with ( local_tournament_obj )
    {
        html_element_current_round_name.innerHTML = "";
        html_element_next_match.innerHTML = "";
        html_element_winner.innerHTML = "";
        html_element_next_round.innerHTML = "";
        html_element_players_eliminated.innerHTML = "";
        html_element_button.removeEventListener( "click", start_next_match );
        html_element_button.removeEventListener( "click", restart_tournament );
    }
}

function update_main_local_tournament_match( main_element )
{
    update_player_names();

    pong_game.html_element_start_button.innerHTML = "Start game";
    pong_game.html_element_start_button.addEventListener( "click", start_local_tournament_match );
    pong_game.html_element_start_button.classList.replace( "hidden", "shown" );
}

function update_player_names()
{
    let names = document.getElementById( "players-names" );
    let left_player_name = document.getElementById( "player1" );
    let right_player_name = document.getElementById( "player2" );

    let match = local_tournament_obj.current_round_matches[local_tournament_obj.current_match];
    
    left_player_name.innerHTML = match.left_player;
    right_player_name.innerHTML = match.right_player;

    names.classList.replace("hidden", "shown");
}

function after_loading_main_local_tournament_match()
{
    init_game_state();
}

function set_next_match()
{
    local_tournament_obj.current_match += 1;
    if ( local_tournament_obj.current_match == local_tournament_obj.current_round_matches.length )
        make_pairings();
}

function back_to_lobby()
{
    // let current_main = document.querySelector("main[class~=shown]");

    // pong_game.html_element_start_button.removeEventListener( "click", back_to_lobby );
    // pong_game.html_element_start_button.classList.replace( "shown", "hidden");
    // switch_view( current_main, local_tournament_obj.html_element_main );
    if ( Object.keys( local_tournament_obj.remaining_players ).length == 1 )
        get_results_view();
    else
        get_lobby_view();
}
