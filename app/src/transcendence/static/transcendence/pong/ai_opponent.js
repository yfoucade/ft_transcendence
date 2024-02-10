let intervalID = 0;

// Now handled in the hydration recipe (navigation.js)

// document.addEventListener("DOMContentLoaded", function() {
//     if (window.location.pathname.includes("/local-match-pvai/")) {
//         intervalID = setInterval(fetchBallYCoordinate, 1000);
//     }
// });


function fetchBallYCoordinate() {
    console.log("Time check");
    if (!window.location.pathname.includes("/local-match-pvai/")) {
        clearInterval(intervalID);
    }
    const ballElement = pong_game.html_element_ball;
    const ballRect = ballElement.getBoundingClientRect();
    const ballYCoordinate = ballRect.top + ballRect.height / 2;

    simulateKeyboardInput(ballYCoordinate);
}

function fetchPaddleYCoordinate() {
    const leftPaddleElement = pong_game.html_element_left_paddle;
    const leftPaddleRect = leftPaddleElement.getBoundingClientRect();

    return(leftPaddleYCoordinate);
}

function simulateKeyboardInput(ballYCoordinate) {
    const leftPaddleElement = pong_game.html_element_left_paddle;
    const leftPaddleRect = leftPaddleElement.getBoundingClientRect();
    const leftPaddleYCoordinate = leftPaddleRect.top + leftPaddleRect.height / 2;
    const halfPaddle = leftPaddleRect.height / 2;

    if (ballYCoordinate < leftPaddleYCoordinate - halfPaddle) {
        ai_move("up");
    }
    else if (ballYCoordinate > leftPaddleYCoordinate + halfPaddle) {
        ai_move("down");
    }
}

function ai_move( direction = 'stop' ) {
    // direction (str): 'stop', 'up' or 'down'

    if ( direction == 'up' )
    {
        pong_game.left_paddle_up = true;
        pong_game.left_paddle_down = false;
    }
    else if ( direction == 'down' )
    {
        pong_game.left_paddle_down = true;
        pong_game.left_paddle_up = false;
    }
    else
    {
        pong_game.left_paddle_down = false;
        pong_game.left_paddle_up = false;
    }
}