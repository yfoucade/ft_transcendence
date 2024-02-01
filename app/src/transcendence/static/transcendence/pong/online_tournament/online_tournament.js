let online_tournament_obj = {
    // html elements
    elt_div_lobby: null,
    elt_ul_queue: null,
    elt_div_start: null, // shown for first player in queue
    elt_button_start: null,
    elt_button_leave: null,
    
    elt_div_next_round: null,
    elt_h3_round_name: null,
    elt_ul_round_pairings: null,

    elt_game_elements: null,
    elt_player1_img: null,
    elt_player1_name: null,
    elt_player2_img: null,
    elt_player2_name: null,
    elt_canvas: null,
    elt_left_paddle: null,
    elt_ball: null,
    elt_right_paddle: null,
    elt_left_score: null,
    elt_right_score: null,

    elt_div_results: null,

    // page status
    ask_confirmation_before_leaving: false,

    // API
    websocket: null,

    // game_status
    going_down: false,
    going_up: false,

    // player info
    user_id: null,
};

function hydrate_online_tournament()
{
    with (online_tournament_obj)
    {
        elt_div_lobby = document.getElementById("online-tournament-lobby");
        elt_ul_queue = document.getElementById("ul-queue");
        elt_div_start = document.getElementById("div-start");
        elt_button_start = document.getElementById("button-start");
        elt_button_leave = document.getElementById("button-leave");
        
        elt_div_next_round = document.getElementById("online-tournament-next-round");
        elt_h3_round_name = document.getElementById("round-name");
        elt_ul_round_pairings = document.getElementById("ul-round-pairings");

        elt_game_elements = document.getElementById("game-elements");
        elt_player1_img = document.getElementById("player1-img");
        elt_player1_name = document.getElementById("player1-name");
        elt_player2_img = document.getElementById("player2-img");
        elt_player2_name = document.getElementById("player2-name");
        elt_canvas = document.getElementById("game-canvas");
        elt_left_paddle = document.getElementById("left-paddle");
        elt_ball = document.getElementById("ball");
        elt_right_paddle = document.getElementById("right-paddle");
        elt_left_score = document.getElementById("left-score");
        elt_right_score = document.getElementById("right-score");

        elt_div_results = document.getElementById("online-tournament-results");

        websocket = new WebSocket( "ws://" + window.location.host + "/ws/online-tournament/" );
        websocket.addEventListener( "open", event_handler_open_websocket );
        websocket.addEventListener( "message", event_handler_online_tournament_message_dispatcher );
    }
}

function event_handler_open_websocket( event )
{
    online_tournament_obj.elt_button_start.addEventListener( "click", event_handler_start );
    online_tournament_obj.elt_button_leave.addEventListener( "click", event_handler_leave );
}

function event_handler_start( event )
{

}

function event_handler_leave( event )
{

}

function msg_handler_tournament_queue_update( queue )
{
    online_tournament_obj.elt_ul_queue.innerHTML = "";
    online_tournament_obj.elt_div_start.classList.replace("shown", "hidden");
    console.log(queue);
    for ( profile of queue )
    {
        online_tournament_obj.elt_ul_queue.innerHTML += `
        <li id="player-${profile.user_id}">
            <img id="player-${profile.user_id}-img" width="32" height="32" src="${profile.avatar_url}"/>
            <span id="player-${profile.user_id}-name">${profile.display_name}</span>
        </li>
        `
    }
    if (online_tournament_obj.user_id == queue[0].user_id)
        online_tournament_obj.elt_div_start.classList.replace("hidden", "shown");
}

function msg_handler_tournament_welcome( user_id )
{
    online_tournament_obj.user_id = user_id;
}

function event_handler_online_tournament_message_dispatcher( event )
{
    data = JSON.parse(event.data);
    console.log("received from server:");
    console.log(data);
    if ( data.type == "tournament.welcome" )
        msg_handler_tournament_welcome( data.user_id );
    if ( data.type == "tournament.queue.update" )
        msg_handler_tournament_queue_update( data.data.queue );
}