const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerImg = new Image();
playerImg.src = 'sprites/player.gif';
// Resize canvas to always fit the window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

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

generatePlatforms(25);

let keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

let cameraX = 0;

function update() {
  // --- Player Movement ---
  if (keys['a']) player.x -= 4;
  if (keys['d']) player.x += 4;
  if (keys['A']) player.x -= 8;
  if (keys['D']) player.x += 8;

  // --- Jumping ---
  if ((keys[' '] || keys['w'] || keys['W']) && player.onGround) {
    player.dy = jumpPower;
  }

  // --- Gravity ---
  player.dy += gravity;

  // --- Predict Y for platform collision ---
  let nextY = player.y + player.dy;
  player.onGround = false;

  // --- Platform Collision ---
  platforms.forEach(p => {
    if (
      player.x + player.width > p.x &&
      player.x < p.x + p.width &&
      player.y + player.height <= p.y &&
      nextY + player.height >= p.y
    ) {
      player.y = p.y - player.height;
      player.dy = 0;
      player.onGround = true;
    }
  });

  // --- Ground Collision ---
  if (player.y + player.height + player.dy >= groundY) {
    player.y = groundY - player.height;
    player.dy = 0;
    player.onGround = true;
  }

  // --- Update Y if in air ---
  if (!player.onGround) {
    player.y += player.dy;
  }

  // --- SMOOTH CAMERA TRACKING ---
  let targetCam = player.x - canvas.width / 2 + player.width / 2;
  cameraX += (targetCam - cameraX) * 0.1;
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
/ Draw player
if (playerImg.complete && playerImg.naturalWidth !== 0) {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
} else {
  // Fallback: draw a blue rectangle while image loads
  ctx.fillStyle = '#09f';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

ctx.restore();
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

// Optional: Press "f" for immersive fullscreen
// (requires user gesture in most browsers)
document.addEventListener('keydown', function(e) {
  if (e.key === 'f') {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  }
});
