let online_tournament_obj = {
    // html elements
    nb_of_users_in_queue: null,
    elt_div_lobby: null,
    elt_ul_queue: null,
    elt_anchor_leave: null,
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
    elt_a_winner: null,
    elt_a_return: null,

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
        nb_of_users_in_queue = document.getElementById("nb-of-players-in-queue");
        elt_div_lobby = document.getElementById("online-tournament-lobby");
        elt_ul_queue = document.getElementById("ul-queue");
        elt_anchor_leave = document.getElementById("anchor-leave");
        elt_anchor_leave.addEventListener( "click", route );
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
        elt_a_winner = document.getElementById("winner-anchor");
        elt_a_return = document.getElementById("a-return");

        elt_a_return.addEventListener("click", route);
        websocket = new WebSocket( "wss://" + window.location.host + "/ws/online-tournament/" );
        websocket.addEventListener( "open", event_handler_open_websocket );
        websocket.addEventListener( "message", event_handler_online_tournament_message_dispatcher );
    }
}

function event_handler_open_websocket( event )
{
    online_tournament_obj.elt_button_leave.addEventListener( "click", event_handler_leave );
}

function event_handler_leave( event )
{

}

function displayNumberOfUsers(queue) {
    const numberOfUsers = queue.length;
    online_tournament_obj.nb_of_users_in_queue.innerHTML = `${numberOfUsers}/4`;
}

function msg_handler_tournament_queue_update( queue )
{
    online_tournament_obj.elt_ul_queue.innerHTML = "";
    console.log(queue);
    displayNumberOfUsers(queue);
    for ( profile of queue )
    {
        online_tournament_obj.elt_ul_queue.innerHTML += `
        <li id="player-${profile.user_id}">
            <img id="player-${profile.user_id}-img" width="32" height="32" src="${profile.avatar_url}"/>
            <span id="player-${profile.user_id}-name">${profile.display_name}</span>
        </li>
        `
    }
}

function msg_handler_tournament_welcome( user_id )
{
    online_tournament_obj.user_id = user_id;
}

function build_usertag( user_id, display_name, avatar_url, reverse=false, ...args)
{
    res = document.createElement("span");

    img_elt = document.createElement("img");
    img_elt.width = "32"; img_elt.height = "32";
    img_elt.src = avatar_url;

    name_elt = document.createElement("span");
    name_elt.innerHTML = display_name;

    if ( reverse )
    {
        res.appendChild( name_elt );
        res.appendChild( img_elt );
    }
    else
    {
        res.appendChild( img_elt );
        res.appendChild( name_elt );
    }
    return res;
}

function build_pairing_ul_elements( pairings )
{
    let res = [];
    let new_li;
    for ( pairing of pairings )
    {
        new_li = document.createElement("li");
        new_li.appendChild( build_usertag(...Object.values(pairing.left_player)) );
        new_li.innerHTML += "<span>vs</span>";
        new_li.appendChild( build_usertag(...Object.values(pairing.right_player)) );
        res.push(new_li);
    }
    return res;
}

function msg_handler_tournament_next_round( pairings )
{
    online_tournament_obj.ask_confirmation_before_leaving = true;
    online_tournament_obj.elt_ul_queue.innerHTML = "";
    online_tournament_obj.elt_button_leave.removeEventListener( "click", event_handler_leave );
    online_tournament_obj.elt_div_lobby.classList.replace( "shown", "hidden" );
    online_tournament_obj.elt_game_elements.classList.replace( "shown", "hidden" );

    console.log("starting next round:");
    console.log(pairings);
    online_tournament_obj.elt_ul_round_pairings.innerHTML = "";
    for ( let pairing_elt of build_pairing_ul_elements( pairings ) )
        online_tournament_obj.elt_ul_round_pairings.appendChild( pairing_elt );

    online_tournament_obj.elt_div_next_round.classList.replace( "hidden", "shown" );
}

function ot_handle_keydown( event )
{
    if (event.key == "ArrowUp" && !online_tournament_obj.going_up)
    {
        online_tournament_obj.going_up = true;
        ot_send_paddle_movement();
    }
    else if (event.key == "ArrowDown" && !online_tournament_obj.going_down)
    {
        online_tournament_obj.going_down = true;
        ot_send_paddle_movement();
    }
}

function ot_handle_keyup( event )
{
    if (event.key == "ArrowUp" && online_tournament_obj.going_up)
    {
        online_tournament_obj.going_up = false;
        ot_send_paddle_movement();
    }
    else if (event.key == "ArrowDown" && online_tournament_obj.going_down)
    {
        online_tournament_obj.going_down = false;
        ot_send_paddle_movement();
    }
}

function ot_send_paddle_movement()
{
    online_tournament_obj.websocket.send(JSON.stringify(
        {
        "type": "game.paddle",
        "up": online_tournament_obj.going_up,
        "down": online_tournament_obj.going_down,
        }
    ));
}

function msg_handler_game_init( data )
{
    window.addEventListener( "keydown", ot_handle_keydown );
    window.addEventListener( "keyup", ot_handle_keyup );
    set_online_tournament_elt_values(data);
    online_tournament_obj.elt_div_next_round.classList.replace("shown", "hidden");
    online_tournament_obj.elt_game_elements.classList.replace("hidden", "shown");
}

function set_online_tournament_elt_values(data)
{
    online_tournament_obj.elt_player1_img.src = data.player_1_avatar_url;
    online_tournament_obj.elt_player1_name.innerHTML = data.player_1_display_name;
    online_tournament_obj.elt_player2_img.src = data.player_2_avatar_url;
    online_tournament_obj.elt_player2_name.innerHTML = data.player_2_display_name;
    online_tournament_obj.elt_canvas.style.height = data.canvas_height;
    online_tournament_obj.elt_canvas.style.aspectRatio = data.canvas_aspect_ratio;
    ot_next_frame(data);
}

/**
 * update scores and position of game elements
 * @param {Object} data 
 */
function ot_next_frame(data)
{
    online_tournament_obj.elt_left_score.innerHTML = data.left_score;
    online_tournament_obj.elt_right_score.innerHTML = data.right_score;
    online_tournament_obj.elt_left_paddle.style.top = `${data.left_paddle_top_pct}%`;
    online_tournament_obj.elt_right_paddle.style.top = `${data.right_paddle_top_pct}%`;
    online_tournament_obj.elt_ball.style.top = `${data.ball_top_pct}%`;
    online_tournament_obj.elt_ball.style.left = `${data.ball_left_pct}%`;
    online_tournament_obj.elt_left_paddle.style.transform = "translate(0, 0)";
    online_tournament_obj.elt_right_paddle.style.transform = "translate(-100%, 0)";
    online_tournament_obj.elt_ball.style.transform = "translate(0, 0)";
}

function msg_handler_game_update(data)
{
    ot_next_frame(data);
}

function msg_handler_tournament_winner( winner )
{
    online_tournament_obj.ask_confirmation_before_leaving = false;
    online_tournament_obj.elt_div_lobby.classList.replace( "shown", "hidden" );
    online_tournament_obj.elt_game_elements.classList.replace( "shown", "hidden" );
    online_tournament_obj.elt_div_next_round.classList.replace( "shown", "hidden" );
    let  winnertag = build_usertag(...Object.values(winner));
    online_tournament_obj.elt_a_winner.href = `/user/${winner.user_id}`;
    online_tournament_obj.elt_a_winner.innerHTML = "";
    online_tournament_obj.elt_a_winner.appendChild(winnertag);
    online_tournament_obj.elt_div_results.classList.replace( "hidden", "shown" );
}

function event_handler_online_tournament_message_dispatcher( event )
{
    let data = JSON.parse(event.data);
    if ( data.type == "tournament.welcome" )
        msg_handler_tournament_welcome( data.user_id );
    if ( data.type == "tournament.queue.update" )
        msg_handler_tournament_queue_update( data.data.queue );
    if ( data.type == "tournament.next_round" )
        msg_handler_tournament_next_round( data.pairings );
    if ( data.type == "game.init" )
        msg_handler_game_init( data.data );
    if ( data.type == "game.update" )
        msg_handler_game_update( data.data );
    if ( data.type == "tournament.winner" )
        msg_handler_tournament_winner( data.winner );
}
