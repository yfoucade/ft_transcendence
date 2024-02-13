let intervalID = 0;

let new_ai_interval_update_state = 0;
let new_ai_interval_move = 0;
let new_ai_interval_debug = 0;

// Now handled in the hydration recipe (navigation.js)

// document.addEventListener("DOMContentLoaded", function() {
//     if (window.location.pathname.includes("/local-match-pvai/")) {
//         intervalID = setInterval(fetchBallYCoordinate, 1000);
//     }
// });


function fetchBallYCoordinate() {
    console.log("Time check");
    // if (!window.location.pathname.includes("/local-match-pvai/")) {
    //     clearInterval(intervalID);
    // }
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

let ai_state = {
    state: "idle", // "idle", "center", or "intercept"
    paddle_target: null, // if "center" or "intercept"
    tol: 30, // tolerance with respect to target. If we are tol pixels up or down, idle
}

function f(nu, dx, dy) {
    return nu * dx / dy;
}

function new_ai_update_state()
{
    
    let ball_rect = pong_game.html_element_ball.getBoundingClientRect();
    let canvas_rect = pong_game.html_element_game_canvas.getBoundingClientRect();
    let paddle_rect = pong_game.html_element_left_paddle.getBoundingClientRect();
    
    if ( pong_game.ball_dx > 0 )
    {
        ai_state.state = "center";
        ai_state.target = canvas_rect.height / 2;
        return;
    }

    let x = ball_rect.left - canvas_rect.left - paddle_rect.width;
    let y = ball_rect.top - canvas_rect.top;
    let dx_pct_of_width = pong_game.ball_dx;
    let dy_pct_of_height = pong_game.ball_dy;
    let H = canvas_rect.height - ball_rect.height;

    let dx = dx_pct_of_width * canvas_rect.width;
    let dy = dy_pct_of_height * canvas_rect.height;

    let khi = f([y, H-y][dy>0 ? 1 : 0], dx, Math.abs(dy));
    if ( x + khi > 0 )
    {
        x = x + khi;
        // console.log(`first bounce: @${x}`);
        y = [0, H][dy > 0 ? 1 : 0];
        dy = -dy;
        khi = f( H, dx, Math.abs(dy) );
        while ( x + khi > 0 )
        {
            x += khi;
            // console.log(`bounce: @${x}`);
            y = H - y;
            dy = -dy;
        }
    }
    let target = y - x * dy / dx + ball_rect.height / 2;

    ai_state.target = target;
    ai_state.state = "intercept";

    // console.log(`target: ${target}`);
}

function new_ai_debug() {
    let ball_rect = pong_game.html_element_ball.getBoundingClientRect();
    let canvas_rect = pong_game.html_element_game_canvas.getBoundingClientRect();
    let paddle_rect = pong_game.html_element_left_paddle.getBoundingClientRect();

    let x = ball_rect.left - canvas_rect.left - paddle_rect.width;
    let y = ball_rect.top - canvas_rect.top;
    let dx_pct_of_width = pong_game.ball_dx;
    let dy_pct_of_height = pong_game.ball_dy;
    let H = canvas_rect.height - ball_rect.height;

    let dx = dx_pct_of_width * canvas_rect.width;
    let dy = dy_pct_of_height * canvas_rect.height;

    if (dx > 0)
        return;
    if ( x < 60 || y < 60 || (H-y) < 60 )
    {
        console.log(`x = ${x}, y = ${y}`);
    }
}

function new_ai_move() {
    if ( ai_state.state == "idle" )
        return;

    let canvas_rect = pong_game.html_element_game_canvas.getBoundingClientRect();
    let paddle_rect = pong_game.html_element_left_paddle.getBoundingClientRect();
    let current_height = paddle_rect.top - canvas_rect.top + paddle_rect.height / 2;

    if ( current_height < ai_state.target - ai_state.tol )
    {
        ai_move("down");
        return;
    }
    if ( current_height > ai_state.target + ai_state.tol )
    {
        ai_move("up");
        return;
    }
    ai_move("stop moving you idiot!");
    ai_state.state = "idle";
}
