
const TILE_SIZE = 40;
const ROWS = 15;
const COLS = 20;
let map = Array.from({ length: ROWS }, () => Array(COLS).fill(0)); // 0 = empty, 1 = wall

function toggleTile(x, y, rightClick = false) {
  if (x >= 0 && y >= 0 && x < COLS && y < ROWS) {
    map[y][x] = rightClick ? 0 : (map[y][x] === 1 ? 0 : 1);
  }
}
