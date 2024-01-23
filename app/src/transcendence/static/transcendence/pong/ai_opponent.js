let intervalID = 0;

document.addEventListener("DOMContentLoaded", function() {
    if (window.location.pathname.includes("/local-match-pvai/")) {
        intervalID = setInterval(fetchBallYCoordinate, 1000);
    }
});

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
        handle_keydown({ key: "e" });
        handle_keyup({ key: "d" });
    }
    else if (ballYCoordinate > leftPaddleYCoordinate + halfPaddle) {
        handle_keydown({ key: "d" });
        handle_keyup({ key: "e" });
    }
}
