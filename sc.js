// Global Constants for better readability and easier tuning
const PLAYER_SPEED = 12; // Player speed
const PADDLE_HEIGHT = 140; // Matches CSS
const PADDLE_WIDTH = 20; // Matches CSS
const BALL_SIZE = 28; // Matches CSS
const WALL_THICKNESS = 20; // Distance from screen edge for paddles

// Get DOM elements once
const rightPaddle = document.getElementById('right');
const leftPaddle = document.getElementById('left');
const ballElement = document.getElementById('ball');
const leftScoreDisplay = document.getElementById('scoreleft');
const rightScoreDisplay = document.getElementById('scoreright');
const goalMessage = document.getElementById('goal');

// Get window dimensions, update on resize
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

window.addEventListener('resize', () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    // Reposition paddles and ball on resize to prevent off-screen elements
    leftPaddle.style.top = `${windowHeight / 2 - PADDLE_HEIGHT / 2}px`;
    rightPaddle.style.top = `${windowHeight / 2 - PADDLE_HEIGHT / 2}px`;
    ballElement.style.left = `${windowWidth / 2 - BALL_SIZE / 2}px`;
    ballElement.style.top = `${windowHeight / 2 - BALL_SIZE / 2}px`;
});


// Helper to convert px string to number
function parsePx(value) {
    // Check if the value is defined before calling replace
    if (typeof value === 'string' && value.endsWith('px')) {
        return Number(value.replace("px", ""));
    }
    return 0; // Return 0 or handle error as appropriate
}

// Key state management (more robust)
const pressedKeys = {};
window.addEventListener('keydown', (e) => {
    pressedKeys[e.keyCode] = true;
});
window.addEventListener('keyup', (e) => {
    pressedKeys[e.keyCode] = false;
});

// Ball properties
let ballSpeedX = 4; // Initial horizontal speed
let ballSpeedY = 2; // Initial vertical speed
let ballMaxSpeed = 8; // Cap ball speed to prevent it from becoming too fast

// Initial positioning of paddles and ball
// Ensure initial 'top' and 'left' styles are set to avoid parsePx errors on first read
leftPaddle.style.top = `${windowHeight / 2 - PADDLE_HEIGHT / 2}px`;
rightPaddle.style.top = `${windowHeight / 2 - PADDLE_HEIGHT / 2}px`;
ballElement.style.left = `${windowWidth / 2 - BALL_SIZE / 2}px`;
ballElement.style.top = `${windowHeight / 2 - BALL_SIZE / 2}px`;


// --- Game Loop and Logic ---

// Use requestAnimationFrame for smoother animations
function gameLoop() {
    handlePaddleMovement();
    updateBallPosition();
    checkBallCollisions();
    requestAnimationFrame(gameLoop); // Request the next frame
}

function handlePaddleMovement() {
    let leftPaddleTop = parsePx(leftPaddle.style.top);
    let rightPaddleTop = parsePx(rightPaddle.style.top);

    // Left paddle (W: 87, S: 83)
    if (pressedKeys[87]) { // W key (move up)
        leftPaddleTop = Math.max(0, leftPaddleTop - PLAYER_SPEED);
    } else if (pressedKeys[83]) { // S key (move down)
        leftPaddleTop = Math.min(windowHeight - PADDLE_HEIGHT, leftPaddleTop + PLAYER_SPEED);
    }
    leftPaddle.style.top = `${leftPaddleTop}px`;

    // Right paddle (Up Arrow: 38, Down Arrow: 40)
    if (pressedKeys[38]) { // Up Arrow (move up)
        rightPaddleTop = Math.max(0, rightPaddleTop - PLAYER_SPEED);
    } else if (pressedKeys[40]) { // Down Arrow (move down)
        rightPaddleTop = Math.min(windowHeight - PADDLE_HEIGHT, rightPaddleTop + PLAYER_SPEED);
    }
    rightPaddle.style.top = `${rightPaddleTop}px`;
}

function updateBallPosition() {
    ballElement.style.left = `${parsePx(ballElement.style.left) + ballSpeedX}px`;
    ballElement.style.top = `${parsePx(ballElement.style.top) + ballSpeedY}px`;
}

function checkBallCollisions() {
    let ballLeft = parsePx(ballElement.style.left);
    let ballTop = parsePx(ballElement.style.top);

    // Collision with top/bottom walls
    if (ballTop <= 0 || ballTop + BALL_SIZE >= windowHeight) {
        ballSpeedY *= -1; // Reverse vertical direction
        // Add a small push to prevent sticking to the wall
        ballElement.style.top = ballTop <= 0 ? `0px` : `${windowHeight - BALL_SIZE}px`;
    }

    // Collision with right paddle
    if (ballLeft + BALL_SIZE >= windowWidth - PADDLE_WIDTH - WALL_THICKNESS) { // Check if ball reaches paddle X position
        const rightPaddleTop = parsePx(rightPaddle.style.top);
        if (ballTop + BALL_SIZE > rightPaddleTop && ballTop < rightPaddleTop + PADDLE_HEIGHT) {
            // Collision detected with right paddle
            ballSpeedX *= -1; // Reverse horizontal direction

            // Adjust vertical speed based on where it hit the paddle
            const hitPoint = (ballTop + BALL_SIZE / 2) - (rightPaddleTop + PADDLE_HEIGHT / 2); // -PADDLE_HEIGHT/2 to PADDLE_HEIGHT/2
            ballSpeedY = hitPoint * 0.15; // Adjusted multiplier for desired angle change (can tune this)

            // Increase ball speed slightly after each paddle hit (up to max)
            ballSpeedX = Math.sign(ballSpeedX) * Math.min(ballMaxSpeed, Math.abs(ballSpeedX) * 1.05);
            ballSpeedY = Math.sign(ballSpeedY) * Math.min(ballMaxSpeed, Math.abs(ballSpeedY) * 1.05);

            // Ensure ball doesn't get stuck in paddle by pushing it out slightly
            ballElement.style.left = `${windowWidth - PADDLE_WIDTH - WALL_THICKNESS - BALL_SIZE}px`;
        } else if (ballLeft + BALL_SIZE >= windowWidth) { // Ball went past paddle (goal)
            scoreGoal('left');
        }
    }

    // Collision with left paddle
    if (ballLeft <= PADDLE_WIDTH + WALL_THICKNESS) { // Check if ball reaches paddle X position
        const leftPaddleTop = parsePx(leftPaddle.style.top);
        if (ballTop + BALL_SIZE > leftPaddleTop && ballTop < leftPaddleTop + PADDLE_HEIGHT) {
            // Collision detected with left paddle
            ballSpeedX *= -1; // Reverse horizontal direction

            // Adjust vertical speed based on where it hit the paddle
            const hitPoint = (ballTop + BALL_SIZE / 2) - (leftPaddleTop + PADDLE_HEIGHT / 2); // -PADDLE_HEIGHT/2 to PADDLE_HEIGHT/2
            ballSpeedY = hitPoint * 0.15; // Adjusted multiplier for desired angle change (can tune this)

            // Increase ball speed slightly after each paddle hit (up to max)
            ballSpeedX = Math.sign(ballSpeedX) * Math.min(ballMaxSpeed, Math.abs(ballSpeedX) * 1.05);
            ballSpeedY = Math.sign(ballSpeedY) * Math.min(ballMaxSpeed, Math.abs(ballSpeedY) * 1.05);

            // Ensure ball doesn't get stuck in paddle by pushing it out slightly
            ballElement.style.left = `${PADDLE_WIDTH + WALL_THICKNESS}px`;
        } else if (ballLeft <= 0) { // Ball went past paddle (goal)
            scoreGoal('right');
        }
    }
}

function scoreGoal(scoringPlayer) {
    // Show "GOAL!!!" message with animation
    goalMessage.style.opacity = '1';
    // Reset transform to re-trigger animation each time
    goalMessage.style.transform = 'scale(0.5) translateY(-50px)';
    goalMessage.style.animation = 'none'; // Clear previous animation
    void goalMessage.offsetWidth; // Trigger reflow to apply 'none' instantly
    goalMessage.style.animation = 'goalPop 0.8s ease-out forwards'; // Reapply animation

    // Update score
    if (scoringPlayer === 'left') {
        leftScoreDisplay.innerHTML = Number(leftScoreDisplay.innerHTML) + 1;
    } else {
        rightScoreDisplay.innerHTML = Number(rightScoreDisplay.innerHTML) + 1;
    }

    // Reset ball position and speed for next round
    resetBall();
}

function resetBall() {
    ballElement.style.left = `${windowWidth / 2 - BALL_SIZE / 2}px`;
    ballElement.style.top = `${windowHeight / 2 - BALL_SIZE / 2}px`;
    // Random initial horizontal direction, maintain minimum speed
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 3); // speed between 3 and 5
    // Random initial vertical speed, between -3 and 3
    ballSpeedY = (Math.random() * 6 - 3);
}

// Start the game loop
gameLoop();