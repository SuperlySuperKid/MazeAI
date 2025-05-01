let seeker = { x: 1, y: 1, color: "lime", speed: 0.1 };
let hunter = { x: 18, y: 13, color: "crimson", speed: 0.13 };
let running = false;
let fast = false;
let dragging = null;

// Q-learning variables
const ACTIONS = [
  [0, -1], // up
  [1, 0],  // right
  [0, 1],  // down
  [-1, 0]  // left
];

let QTABLE = JSON.parse(localStorage.getItem("ai_qtable") || "{}");

// Epsilon-greedy parameters
const epsilon = 0.05; // Reduced exploration rate to focus on exploiting knowledge
const learningRate = 0.5; // Increased learning rate for faster adaptation
const discount = 0.95; // Increased discount for future rewards to weigh them more heavily

function getState(x, y) {
  return `${Math.floor(x)},${Math.floor(y)}`;
}

function getAction(state) {
  if (!QTABLE[state]) QTABLE[state] = [0, 0, 0, 0]; // Initialize if state is not in the table
  const qvals = QTABLE[state];
  
  // Exploration vs. Exploitation
  if (Math.random() < epsilon) {
    return Math.floor(Math.random() * ACTIONS.length); // Random action (exploration)
  } else {
    const maxQ = Math.max(...qvals);
    const bestActions = qvals
      .map((val, i) => val === maxQ ? i : -1)
      .filter(i => i !== -1);
    return bestActions[Math.floor(Math.random() * bestActions.length)]; // Best action (exploitation)
  }
}

function updateQ(state, action, reward, nextState) {
  if (!QTABLE[state]) QTABLE[state] = [0, 0, 0, 0];
  if (!QTABLE[nextState]) QTABLE[nextState] = [0, 0, 0, 0];

  const oldQ = QTABLE[state][action];
  const nextMaxQ = Math.max(...QTABLE[nextState]);

  // Q-learning update rule
  QTABLE[state][action] = oldQ + learningRate * (reward + discount * nextMaxQ - oldQ);
  localStorage.setItem("ai_qtable", JSON.stringify(QTABLE));
}

function moveSeekerAI(goalX, goalY) {
  const state = getState(seeker.x, seeker.y);
  const action = getAction(state);
  const [dx, dy] = ACTIONS[action];

  const nextX = seeker.x + dx;
  const nextY = seeker.y + dy;

  let reward = -0.05;  // Small penalty for each move to encourage faster goal-reaching
  let valid = !isWall(nextX, nextY);

  // Avoid the hunter (penalty increases as the seeker gets closer)
  let hunterDX = seeker.x - hunter.x;
  let hunterDY = seeker.y - hunter.y;
  let distToHunter = Math.hypot(hunterDX, hunterDY);

  if (distToHunter < 2) {
    reward -= 0.8; // Stronger penalty if near the hunter (closer to danger)
  }

  if (valid) {
    seeker.x = nextX;
    seeker.y = nextY;

    // Reward for reaching the goal
    if (Math.floor(seeker.x) === goalX && Math.floor(seeker.y) === goalY) {
      reward = 1; // Positive reward for reaching the goal
    }
  } else {
    reward = -0.8; // Larger penalty for hitting a wall to strongly discourage this behavior
  }

  const nextState = getState(seeker.x, seeker.y);
  updateQ(state, action, reward, nextState);
}

function moveHunterAI(targetX, targetY) {
  let dx = targetX - hunter.x;
  let dy = targetY - hunter.y;
  let dist = Math.hypot(dx, dy);
  if (dist > 0.01) {
    let nx = hunter.x + (dx / dist) * hunter.speed;
    let ny = hunter.y + (dy / dist) * hunter.speed;
    if (!isWall(nx, ny)) {
      hunter.x = nx;
      hunter.y = ny;
    }
  }
}

function isWall(x, y) {
  let cx = Math.floor(x);
  let cy = Math.floor(y);
  return map[cy] && map[cy][cx] === 1; // Check if the next position is a wall
}

function startAI() { running = true; }
function stopAI() { running = false; }
function toggleSpeed() { fast = !fast; }

// Game loop with learning incorporated
function gameLoop(goalX, goalY) {
  if (running) {
    moveSeekerAI(goalX, goalY);
    moveHunterAI(seeker.x, seeker.y);

    // Visualize the AI movements (you may want to draw them on canvas or a similar system)
    renderGame();

    setTimeout(() => gameLoop(goalX, goalY), fast ? 50 : 100); // Adjust speed
  }
}

// Function to render the game (or simply update positions)
function renderGame() {
  // Replace this with actual rendering code (e.g., canvas)
  console.log(`Seeker Position: ${seeker.x}, ${seeker.y}`);
  console.log(`Hunter Position: ${hunter.x}, ${hunter.y}`);
}

gameLoop(9, 9);  // Start the AI with a goal at (9, 9)
function exportAI() {
  const qtableCode = `const QTABLE = ${JSON.stringify(QTABLE, null, 2)};\n`;
  const baseCode = document.querySelector("script[data-basecode]").textContent;
  const blob = new Blob([qtableCode + baseCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ai_self_rewritten.js";
  a.click();
}
// === Hunter Q-learning Setup ===
let HUNTER_QTABLE = JSON.parse(localStorage.getItem("hunter_qtable") || "{}");
const hunterEpsilon = 0.05;
const hunterLearningRate = 0.4;
const hunterDiscount = 0.9;

function getHunterState(x, y, targetX, targetY) {
  const dx = Math.floor(targetX) - Math.floor(x);
  const dy = Math.floor(targetY) - Math.floor(y);
  return `${Math.floor(x)},${Math.floor(y)},${Math.sign(dx)},${Math.sign(dy)}`;
}

function getHunterAction(state) {
  if (!HUNTER_QTABLE[state]) HUNTER_QTABLE[state] = [0, 0, 0, 0];
  const qvals = HUNTER_QTABLE[state];

  if (Math.random() < hunterEpsilon) {
    return Math.floor(Math.random() * ACTIONS.length);
  } else {
    const maxQ = Math.max(...qvals);
    const bestActions = qvals
      .map((val, i) => val === maxQ ? i : -1)
      .filter(i => i !== -1);
    return bestActions[Math.floor(Math.random() * bestActions.length)];
  }
}

function updateHunterQ(state, action, reward, nextState) {
  if (!HUNTER_QTABLE[state]) HUNTER_QTABLE[state] = [0, 0, 0, 0];
  if (!HUNTER_QTABLE[nextState]) HUNTER_QTABLE[nextState] = [0, 0, 0, 0];

  const oldQ = HUNTER_QTABLE[state][action];
  const nextMaxQ = Math.max(...HUNTER_QTABLE[nextState]);

  HUNTER_QTABLE[state][action] = oldQ + hunterLearningRate * (reward + hunterDiscount * nextMaxQ - oldQ);
  localStorage.setItem("hunter_qtable", JSON.stringify(HUNTER_QTABLE));
}

function moveHunterAI(targetX, targetY) {
  const state = getHunterState(hunter.x, hunter.y, targetX, targetY);
  const action = getHunterAction(state);
  const [dx, dy] = ACTIONS[action];

  const nextX = hunter.x + dx;
  const nextY = hunter.y + dy;

  let reward = -0.05; // Encourage speed

  let valid = !isWall(nextX, nextY);
  let caught = false;

  if (valid) {
    hunter.x = nextX;
    hunter.y = nextY;
    const dist = Math.hypot(seeker.x - hunter.x, seeker.y - hunter.y);
    if (dist < 0.5) {
      reward = 1; // Reward for catching
      caught = true;
    }
  } else {
    reward = -0.8; // Penalty for wall
  }

  const nextState = getHunterState(hunter.x, hunter.y, targetX, targetY);
  updateHunterQ(state, action, reward, nextState);

  if (caught) resetPositions(); // You already have this function
}
function getHunterState(x, y) {
  return `${Math.floor(x)},${Math.floor(y)}`;
}

function getHunterAction(state) {
  if (!QTABLE_HUNTER[state]) QTABLE_HUNTER[state] = [0, 0, 0, 0];
  const qvals = QTABLE_HUNTER[state];

  if (Math.random() < epsilon) {
    return Math.floor(Math.random() * ACTIONS.length); // Explore
  } else {
    const maxQ = Math.max(...qvals);
    const bestActions = qvals
      .map((val, i) => val === maxQ ? i : -1)
      .filter(i => i !== -1);
    return bestActions[Math.floor(Math.random() * bestActions.length)];
  }
}

function updateHunterQ(state, action, reward, nextState) {
  if (!QTABLE_HUNTER[state]) QTABLE_HUNTER[state] = [0, 0, 0, 0];
  if (!QTABLE_HUNTER[nextState]) QTABLE_HUNTER[nextState] = [0, 0, 0, 0];

  const oldQ = QTABLE_HUNTER[state][action];
  const nextMaxQ = Math.max(...QTABLE_HUNTER[nextState]);

  QTABLE_HUNTER[state][action] = oldQ + learningRate * (reward + discount * nextMaxQ - oldQ);
  localStorage.setItem("ai_qtable_hunter", JSON.stringify(QTABLE_HUNTER));
}

// Separate Q-table for the hunter
let QTABLE_HUNTER = JSON.parse(localStorage.getItem("ai_qtable_hunter") || "{}");

function moveHunterAI(targetX, targetY) {
  const state = getHunterState(hunter.x, hunter.y);
  const action = getHunterAction(state);
  const [dx, dy] = ACTIONS[action];

  const nextX = hunter.x + dx;
  const nextY = hunter.y + dy;

  let reward = -0.05; // Small penalty to encourage efficient movement

  let valid = !isWall(nextX, nextY);
  if (valid) {
    hunter.x = nextX;
    hunter.y = nextY;

    const dist = Math.hypot(hunter.x - seeker.x, hunter.y - seeker.y);
    if (dist < 0.3) {
      reward = 1; // Reward for catching the seeker
    }
  } else {
    reward = -0.8; // Penalty for hitting a wall
  }

  const nextState = getHunterState(hunter.x, hunter.y);
  updateHunterQ(state, action, reward, nextState);
}

