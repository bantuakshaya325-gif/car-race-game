const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const scoreLabel = document.getElementById("scoreLabel");

const road = {
  x: 90,
  width: 240,
  laneCount: 3,
  laneWidth: 80
};

const bike = {
  x: canvas.width / 2 - 35,
  y: canvas.height - 120,
  width: 70,
  height: 90,
  speed: 8,
  moveLeft: false,
  moveRight: false
};

let obstacles = [];
let score = 0;
let gameRunning = false;
let animationId = null;
let lastTime = 0;
let lastSpawn = 0;

function resetGame() {
  obstacles = [];
  score = 0;
  bike.x = canvas.width / 2 - 35;
  scoreLabel.textContent = "Score: 0";
  lastSpawn = 0;
  lastTime = 0;
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * road.laneCount);
  const x = road.x + lane * road.laneWidth + 12;
  const width = 52;
  const height = 62;

  obstacles.push({
    x,
    y: -height,
    width,
    height,
    speed: 4 + Math.random() * 2 + score * 0.025
  });
}

function update(delta) {
  if (!gameRunning) return;

  if (bike.moveLeft) bike.x -= bike.speed;
  if (bike.moveRight) bike.x += bike.speed;

  bike.x = Math.max(
    road.x,
    Math.min(bike.x, road.x + road.width - bike.width)
  );

  score += delta * 0.02;
  scoreLabel.textContent = "Score: " + Math.floor(score);

  if (performance.now() - lastSpawn > 850) {
    spawnObstacle();
    lastSpawn = performance.now();
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    obstacle.y += obstacle.speed;

    if (checkCollision(bike, obstacle)) {
      endGame();
      return;
    }

    if (obstacle.y > canvas.height) {
      obstacles.splice(i, 1);
    }
  }
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function drawRoad() {
  ctx.fillStyle = "#303030";
  ctx.fillRect(road.x, 0, road.width, canvas.height);

  for (let i = 0; i < 20; i++) {
    const stripeY = ((i * 80) + (performance.now() * 0.12) % 80) % (canvas.height + 40);
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(road.x + road.laneWidth - 8, stripeY, 12, 40);
    ctx.fillRect(road.x + road.laneWidth * 2 - 8, stripeY, 12, 40);
  }

  ctx.fillStyle = "#dfe6e9";
  ctx.fillRect(road.x - 8, 0, 8, canvas.height);
  ctx.fillRect(road.x + road.width, 0, 8, canvas.height);
}

function drawBike() {
  const x = bike.x;
  const y = bike.y;
  const w = bike.width;
  const h = bike.height;

  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.roundRect(x + 16, y + 18, w - 28, 28, 12);
  ctx.fill();

  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.roundRect(x + 27, y + 40, w - 42, 18, 10);
  ctx.fill();

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 18, y + 22);
  ctx.lineTo(x + 8, y + 54);
  ctx.lineTo(x + 34, y + 80);
  ctx.moveTo(x + 52, y + 22);
  ctx.lineTo(x + 62, y + 54);
  ctx.lineTo(x + 36, y + 82);
  ctx.stroke();

  ctx.strokeStyle = "#f8fafc";
  ctx.beginPath();
  ctx.moveTo(x + 22, y + 56);
  ctx.lineTo(x + 6, y + 68);
  ctx.moveTo(x + 52, y + 56);
  ctx.lineTo(x + 66, y + 68);
  ctx.stroke();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(x + 16, y + 78, 12, 0, Math.PI * 2);
  ctx.arc(x + 56, y + 78, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.arc(x + 16, y + 78, 5, 0, Math.PI * 2);
  ctx.arc(x + 56, y + 78, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(x + 34, y + 12, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fca5a5";
  ctx.fillRect(x + 27, y + 2, 14, 10);

  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 34, y + 22);
  ctx.lineTo(x + 28, y + 36);
  ctx.moveTo(x + 34, y + 22);
  ctx.lineTo(x + 42, y + 36);
  ctx.stroke();
}

function drawObstacle(obstacle) {
  const x = obstacle.x;
  const y = obstacle.y;
  const w = obstacle.width;
  const h = obstacle.height;

  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fdba74";
  ctx.fillRect(x + 14, y + 18, w - 28, 18);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();

  for (const obstacle of obstacles) {
    drawObstacle(obstacle);
  }

  drawBike();

  if (!gameRunning) {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press Start", canvas.width / 2, canvas.height / 2);
  }
}

function gameLoop(timestamp) {
  const delta = timestamp - lastTime || 16;
  lastTime = timestamp;

  update(delta);
  draw();

  if (gameRunning) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function startGame() {
  resetGame();
  gameRunning = true;
  startBtn.textContent = "Restart Game";
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  gameRunning = false;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "bold 32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

  ctx.font = "20px Arial";
  ctx.fillText("Final Score: " + Math.floor(score), canvas.width / 2, canvas.height / 2 + 35);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") bike.moveLeft = true;
  if (key === "arrowright" || key === "d") bike.moveRight = true;
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") bike.moveLeft = false;
  if (key === "arrowright" || key === "d") bike.moveRight = false;
});

startBtn.addEventListener("click", startGame);

resetGame();
draw();
