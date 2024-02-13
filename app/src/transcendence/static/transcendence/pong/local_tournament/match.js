async function get_local_tournament_match_view()
{
    let match = local_tournament_obj.current_round_matches[local_tournament_obj.current_match];
    let players = {
        "left_player": match.left_player,
        "right_player": match.right_player,
    };
    
    let response = await fetch(
        "/local-tournament/match/",
        {
            method: "POST",
            headers: {
                "X-CSRFToken": tournament_form.csrftoken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify( players ),
        },
    );
    // let document_text = await response.text();
    // update_state( response.url, document_text );
    // history.pushState( state, "", state.pathname );
    // render();
    // if ( state.main_id in hydration_recipes )
    //     hydration_recipes[state.main_id]();
    update_view( response );
}


function start_local_tournament_match( event )
{
    /**
     * Hide 'Start' button
     * Add event listeners on paddles
     * Launch ball
     */
    // init_game_state();
    pong_game.end_of_game_callback = end_local_tournament_match;
    pong_game.html_element_start_button.classList.replace( "shown", "hidden" );
    pong_game.html_element_start_button.removeEventListener( "click", start_local_tournament_match );
    // call the animation function that will call requestAnimationFrame()
    pong_game.game_in_progress = true;
    requestAnimationFrame( time => animate(time, time) );
}

function end_local_tournament_match()
{
    console.log( "end of local tournament match" );
    pong_game.game_in_progress = false;
    let current_match = local_tournament_obj.current_round_matches[local_tournament_obj.current_match];
    current_match.set_final_score( pong_game.left_score, pong_game.right_score );
    if ( current_match.winner == "left" )
    {
        local_tournament_obj.current_round_qualified.push(current_match.left_player);
        local_tournament_obj.current_round_eliminated.push(current_match.right_player);
        local_tournament_obj.eliminated_players.push( current_match.right_player );
        delete local_tournament_obj.remaining_players[current_match.right_player];
    }
    else
    {
        local_tournament_obj.current_round_qualified.push(current_match.right_player);
        local_tournament_obj.current_round_eliminated.push(current_match.left_player);
        local_tournament_obj.eliminated_players.push( current_match.left_player );
        delete local_tournament_obj.remaining_players[current_match.left_player];
    }
    set_next_match();

    update_state();
    state.inner_state = e_inner_state.match_done;
    history.replaceState( state, "", state.pathname );

    pong_game.html_element_start_button.innerHTML = "Back to lobby";
    pong_game.html_element_start_button.addEventListener( "click", back_to_lobby );
    pong_game.html_element_start_button.classList.replace( "hidden", "shown" );
}