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

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 120,
  width: 50,
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
  player.x = canvas.width / 2 - 25;
  scoreLabel.textContent = "Score: 0";
  lastSpawn = 0;
  lastTime = 0;
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * road.laneCount);
  const x = road.x + lane * road.laneWidth + 10;
  const width = 50;
  const height = 90;

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

  if (player.moveLeft) player.x -= player.speed;
  if (player.moveRight) player.x += player.speed;

  player.x = Math.max(
    road.x,
    Math.min(player.x, road.x + road.width - player.width)
  );

  score += delta * 0.02;
  scoreLabel.textContent = "Score: " + Math.floor(score);

  if (performance.now() - lastSpawn > 850) {
    spawnObstacle();
    lastSpawn = performance.now();
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const car = obstacles[i];
    car.y += car.speed;

    if (checkCollision(player, car)) {
      endGame();
      return;
    }

    if (car.y > canvas.height) {
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

function drawPlayerCar() {
  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "#eaf2ff";
  ctx.fillRect(player.x + 8, player.y + 12, player.width - 16, 20);

  ctx.fillStyle = "#f1c40f";
  ctx.fillRect(player.x + 8, player.y + 2, 10, 8);
  ctx.fillRect(player.x + player.width - 18, player.y + 2, 10, 8);
}

function drawEnemyCar(car) {
  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(car.x, car.y, car.width, car.height);

  ctx.fillStyle = "#ecf0f1";
  ctx.fillRect(car.x + 8, car.y + 12, car.width - 16, 20);

  ctx.fillStyle = "#f1c40f";
  ctx.fillRect(car.x + 8, car.y + car.height - 10, 10, 8);
  ctx.fillRect(car.x + car.width - 18, car.y + car.height - 10, 10, 8);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();

  for (const car of obstacles) {
    drawEnemyCar(car);
  }

  drawPlayerCar();

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

  if (key === "arrowleft" || key === "a") player.moveLeft = true;
  if (key === "arrowright" || key === "d") player.moveRight = true;
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") player.moveLeft = false;
  if (key === "arrowright" || key === "d") player.moveRight = false;
});

startBtn.addEventListener("click", startGame);

resetGame();
draw();
