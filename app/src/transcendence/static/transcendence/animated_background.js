let mainHtml = document.querySelector('main');

let animationId = 0;

const balls = [];

let canvas;
let ctx;

function startBackground(){
	if (animationId != 0)
		cancelAnimationFrame(animationId);
	mainHtml = document.querySelector('main');
	canvas = document.getElementById("bouncing_dots");
	ctx = canvas.getContext("2d");
	if (mainHtml.classList.contains('no-animated-bg'))
		return;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	createBalls(30);
	animateBackground();
}

function Ball(x, y, radius, dx, dy, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = dx;
    this.dy = dy;
    this.color = color;

    this.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };

    this.update = function () {
        if ( this.x + this.radius > canvas.width ) {
            this.x = canvas.width - this.radius;
            this.dx = -this.dx;
        }
        else if ( this.x - this.radius < 0) {
            this.x = this.radius;
            this.dx = -this.dx;
        }

        if ( this.y + this.radius > canvas.height ) {
            this.y = canvas.height - this.radius;
            this.dy = -this.dy;
        }
        else if ( this.y - this.radius < 0 ) {
            this.y = this.radius;
            this.dy = -this.dy;
        }

        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    };
}

function createBalls(numBalls) {
	balls.length = 0; // Clear the array
for (let i = 0; i < numBalls; i++) {
	const radius = 10;
	const x = Math.random() * (canvas.width - radius * 2) + radius;
	const y = Math.random() * (canvas.height - radius * 2) + radius;
	const dx = (Math.random() - 0.5) * 5; // Random horizontal speed
	const dy = (Math.random() - 0.5) * 5; // Random vertical speed
	const color = "white";

	balls.push(new Ball(x, y, radius, dx, dy, color));
}
}

function animateBackground() {
	animationId = requestAnimationFrame(animateBackground);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (const ball of balls) {
		ball.update();
	}
}

window.addEventListener("resize", () => {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
});

startBackground();