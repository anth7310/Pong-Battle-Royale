//TODO: add pause feature
// https://github.com/Tacktel/JS-pong-game/blob/master/index.html
// import canvas object
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

class Paddle {
    constructor(height, width, posX, posY, controls) {
        this.height = height;
        this.width = width;
        this.posX = posX;
        this.posY =  canvas.height / 2 - posY / 2;
        this.velocity = 5;
        
        //movement controls
        this.controls = controls;
        this.keyPressDown = false;
        this.keyPressUp = false;
    }

    // movement - key press
    onKeyPress = (e) => {
        if (e) {
            if (e.keyCode === this.controls['up']) { // up arrow
                // console.log(e)
                this.keyPressUp = true;
            } else if (e.keyCode === this.controls['down']) { // down arrow
                this.keyPressDown = true;
            }
        }
    }

    onKeyRelease = (e) => {
        if (e) {
            if (e.keyCode === this.controls['up']) { // up arrow
                console.log(e)
                this.keyPressUp = false;
            } else if (e.keyCode === this.controls['down']) { // down arrow
                this.keyPressDown = false;
            }
        }
    }

    updatePosition = () => {
        // update the current position of paddle given key pressed
        if (this.keyPressUp && this.posY > 0) {
            this.posY -= this.velocity;
        }
        else if (this.keyPressDown && this.posY < canvas.height - this.height) {
            this.posY += this.velocity;
        }
    }

    // render
    render = () => {
        ctx.rect(this.posX, this.posY, this.width, this.height);
        ctx.fillStyle = "white";
        ctx.fill();
    }
}

class Ball {
    constructor(radius, posX, posY, dx, dy) {
        // size of ball
        this.radius = radius;
        this.initX = posX;
        this.initY = posY;
        // current position of ball
        this.posX = posX;
        this.posY = posY;

        // current velocity of ball
        this.dx = dx;
        this.dy = dy;
    }

    // reset-board
    reset = () => {
        this.posX = this.initX;
        this.posY = this.initY;
        this.dx = -this.dx;
        this.dy = -this.dy;
    }

    // ------------movement------------
    updatePosition = (new_posX, new_posY) => {
        this.posX = new_posX;
        this.posY = new_posY;
    }

    updateNext = () => {
        this.posX = this.posX + this.dx;
        this.posY = this.posY + this.dy;
    }

    updateVelocity = (new_dx, new_dy) => {
        // Update the movement of the ball
        this.dx = new_dx;
        this.dy = new_dy;
    }

    // ------------collision-detection------------
    isCollidedWithPaddle = (paddle) => {
        // return true if ball is colliding with paddle object, otherwise return false
        // paddle is Paddle object
        
        // check x pos
        if ((this.posX - this.radius) <= 5 + paddle.width || (this.posX + this.radius) >= canvas.width - (paddle.width + 5)) {
            // check y pos
            if (this.posY > paddle.posY && this.posY < paddle.posY + paddle.height)
                return true;
        }
        return false;
    }

    isCollidedWithWall = () => {
        // return true if ball is colliding with wall (top, bottom)
        return (((this.posY - this.radius) <= 0) || ((this.posY + this.radius) >= canvas.height)) 
    }

    isCollidedWithEdge = () => {
        // return true if ball is colliding with edge (left, right)
        return (this.posX - this.radius*1.5 <= 0 || this.posX + this.radius*1.5 >= canvas.width)
    }

    render = () => {
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI*2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();
    }
}


// left player paddle
const paddleLeft = new Paddle(
    90, 15, 5, 
    canvas.height/2, // center paddle on canvas
    {'up': 87, 'down': 83}
);

// Right player paddle
const paddleRight = new Paddle(
    90, 15, canvas.width-20, 
    canvas.height/2, // center paddle on canvas
    {'up': 38, 'down': 40}
);

// ball object
const ball = new Ball(
    10, // ball radius
    canvas.width/2, canvas.height/2, // ball position
    4, -4 // velocity
);

function drawScene() { // draw center line
    ctx.rect(canvas.width / 2 - 1, 0, 3, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();
}

let leftScore = 0;
let rightScore = 0;

function drawScores() {
    ctx.font = "80px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(leftScore, (canvas.width / 2) - 80, 80);
    ctx.fillText(rightScore, (canvas.width / 2) + 40, 80);
}

let paddleArray = [paddleLeft, paddleRight];

function draw() {

    // -----------render objects-----------

    ctx.clearRect(0, 0, canvas.width, canvas.height); // refresh screen
    // render scores
    drawScores();
    drawScene();

    // render ball
    ball.render();

    // render paddles
    paddleArray.forEach((paddle) => {
        paddle.render();
    })

    // -----------player movement-----------
    paddleArray.forEach((paddle) => {
        paddle.updatePosition();
    })


    // -----------collision detection-----------

    // if collided with top and bottom walls, inverse y direction
    if (ball.isCollidedWithWall()) {
        ball.updateVelocity(ball.dx, -ball.dy);
    }
    // if collided with paddle, inverse x direction
    paddleArray.forEach((paddle) => {
        if (ball.isCollidedWithPaddle(paddle)){
            ball.updateVelocity(-ball.dx, ball.dy);
            // update ball position to slightly move to side of paddle
            // we do this so no collision bug
            ball.updatePosition(ball.posX+ball.dx*2.5, ball.posY+ball.dy*2.5);
        }
    })

    // if collided with edge past paddle (left or right), reset game board
    if (ball.isCollidedWithEdge()) {
        if (ball.posX > canvas.width/2) {
            leftScore += 1;
        } else {
            rightScore += 1;
        }
        ball.reset();
    }

    // update ball position with current velocity
    ball.updateNext();
}

// render game every 10 milliseconds
var gameSpeed = 10;
setInterval(draw, gameSpeed);

// assign listening event to DOM for paddle keypresses
paddleArray.forEach((paddle) => {
    document.addEventListener("keydown", paddle.onKeyPress.bind(paddle), false);
    document.addEventListener("keyup", paddle.onKeyRelease.bind(paddle), false);
}

