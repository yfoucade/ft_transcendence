document.addEventListener("DOMContentLoaded", function() {
    if (window.location.pathname.includes("/local-match/")) {
        setInterval(fetchBallYCoordinate, 1000);
    }
});

function fetchBallYCoordinate() {
    console.log("Time check");
    const ballElement = pong_game.html_element_ball;
    const ballRect = ballElement.getBoundingClientRect();
    const ballYCoordinate = ballRect.top + ballRect.height / 2;

    simulateKeyboardInput(ballYCoordinate);
}

function fetchPaddleYCoordinate() {
    const leftPaddleElement = pong_game.html_element_left_paddle;
    const leftPaddleRect = leftPaddleElement.getBoundingClientRect();
    const leftPaddleYCoordinate = leftPaddleRect.top + leftPaddleRect.height / 2;

    return(leftPaddleYCoordinate);
}

function simulateKeyboardInput(ballYCoordinate) {
    let leftPaddleYCoordinate = fetchPaddleYCoordinate();

    if (ballYCoordinate < leftPaddleYCoordinate) {
        handle_keydown({ key: "e" });
        handle_keyup({ key: "d" });
    }
    else if (ballYCoordinate > leftPaddleYCoordinate) {
        handle_keydown({ key: "d" });
        handle_keyup({ key: "e" });
    } else {
        handle_keyup({ key: "e" });
        handle_keyup({ key: "d" });
    }
}
