const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let goal = { x: 10, y: 7 };

let greenScore = 0;
let redScore = 0;
let timer = 120; // seconds
let lastTick = Date.now();

canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = Math.floor((e.clientX - rect.left) / TILE_SIZE);
  const my = Math.floor((e.clientY - rect.top) / TILE_SIZE);

  if (Math.floor(seeker.x) === mx && Math.floor(seeker.y) === my) dragging = seeker;
  else if (Math.floor(hunter.x) === mx && Math.floor(hunter.y) === my) dragging = hunter;
  else toggleTile(mx, my, e.button === 2);
});

canvas.addEventListener("mousemove", e => {
  if (dragging) {
    const rect = canvas.getBoundingClientRect();
    dragging.x = Math.floor((e.clientX - rect.left) / TILE_SIZE) + 0.5;
    dragging.y = Math.floor((e.clientY - rect.top) / TILE_SIZE) + 0.5;
  }
});

canvas.addEventListener("mouseup", () => dragging = null);
canvas.addEventListener("contextmenu", e => e.preventDefault());

function drawTile(x, y, type) {
  if (type === 1) {
    ctx.fillStyle = "#555";
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}

function drawGrid() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      drawTile(x, y, map[y][x]);
    }
  }
  ctx.fillStyle = "gold";
  ctx.beginPath();
  ctx.arc(goal.x * TILE_SIZE + TILE_SIZE / 2, goal.y * TILE_SIZE + TILE_SIZE / 2, 10, 0, Math.PI * 2);
  ctx.fill();
}

function drawBot(bot) {
  ctx.fillStyle = bot.color;
  ctx.beginPath();
  ctx.arc(bot.x * TILE_SIZE, bot.y * TILE_SIZE, TILE_SIZE / 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawScores() {
  ctx.fillStyle = "white";
  ctx.font = "18px sans-serif";
  ctx.fillText("Green: " + greenScore + "   Red: " + redScore + "   Time: " + Math.max(Math.floor(timer), 0), 10, 20);
}

function resetPositions() {
  seeker.x = 1.5;
  seeker.y = 1.5;
  hunter.x = 18.5;
  hunter.y = 13.5;
  timer = 120;
  lastTick = Date.now();
}

function checkWinConditions() {
  const dx = seeker.x - hunter.x;
  const dy = seeker.y - hunter.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.3) {
    redScore++;
    resetPositions();
  }
  const gx = goal.x + 0.5;
  const gy = goal.y + 0.5;
  const gdx = seeker.x - gx;
  const gdy = seeker.y - gy;
  const gdist = Math.hypot(gdx, gdy);
  if (gdist < 0.3) {
    greenScore++;
    resetPositions();
  }
}

function updateTimer() {
  if (!running) return;
  const now = Date.now();
  const elapsed = (now - lastTick) / 1000;
  lastTick = now;
  timer -= elapsed;
  if (timer <= 0) {
    greenScore--;
    redScore--;
    resetPositions();
  }
}

// Main loop with AI decision-making
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  if (running) {
    moveSeekerAI(goal.x, goal.y);
    moveHunterAI(seeker.x, seeker.y);
    checkWinConditions();
    updateTimer();
  }

  drawBot(seeker);
  drawBot(hunter);
  drawScores();

  setTimeout(loop, fast ? 10 : 30);
}

resetPositions();
loop();
