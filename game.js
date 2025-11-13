const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 100, y: 300, width: 40, height: 40, dy: 0, onGround: false };
const gravity = 0.7;
const jumpPower = -12;
const groundY = 350;

let platforms = [];
function generatePlatforms(num) {
  platforms = [];
  let x = 0;
  for (let i = 0; i < num; i++) {
    let width = 100 + Math.random() * 100;
    let height = 15;
    let y = 320 - Math.random() * 200;
    platforms.push({ x: x, y: y, width: width, height: height });
    x += 180 + Math.random() * 180;
  }
}

let keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

let cameraX = 0;

function update() {
  // Horizontal movement
  if (keys['a'] || keys['A']) player.x -= 4;
  if (keys['d'] || keys['D']) player.x += 4;

  // Jump
  if ((keys[' '] || keys['w'] || keys['W']) && player.onGround) {
    player.dy = jumpPower;
  }

  // Gravity
  player.dy += gravity;

  // Predict where the player would be after moving vertically
  let nextY = player.y + player.dy;

  // Assume player is in air
  player.onGround = false;

  // Platform collision
  platforms.forEach(p => {
    // Will the bottom of the player cross the top of the platform next frame, and are they horizontally overlapping?
    if (
      player.x + player.width > p.x &&
      player.x < p.x + p.width &&
      player.y + player.height <= p.y &&
      nextY + player.height >= p.y // This checks for crossing the platform
    ) {
      player.y = p.y - player.height;
      player.dy = 0;
      player.onGround = true;
    }
  });

  // Ground collision (run after platforms)
  if (player.y + player.height + player.dy >= groundY) {
    player.y = groundY - player.height;
    player.dy = 0;
    player.onGround = true;
  }

  // If not blocked, update position
  if (!player.onGround) {
    player.y += player.dy;
  }
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(-cameraX, 0);

  // Draw ground
  ctx.fillStyle = '#444';
  ctx.fillRect(cameraX, groundY, canvas.width * 5, canvas.height - groundY);

  // Draw platforms
  ctx.fillStyle = '#7a7';
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  // Draw player
  ctx.fillStyle = '#09f';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.restore();
}

generatePlatforms(25);
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
