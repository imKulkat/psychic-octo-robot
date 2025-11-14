const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let player = { x: 100, y: 300, width: 100, height: 100, dy: 0, onGround: false, facingRight: true };
const gravity = 0.7;
const jumpPower = -12;
const groundY = 350;

let projectiles = [];
let platforms = [];
const PLATFORM_HEIGHTS = [100, 220, 340]; // Adjust these to 3 set heights

function generatePlatforms(num) {
  if (!num) num = 100; // Generate a lot for an endless feel
  platforms = [];
  let x = 0;
  for (let i = 0; i < num; i++) {
    let width = 100 + Math.random() * 120;
    let height = 20;
    let y = PLATFORM_HEIGHTS[Math.floor(Math.random() * PLATFORM_HEIGHTS.length)];
    platforms.push({ x, y, width, height });
    x += 150 + Math.random() * 220;
  }
}
generatePlatforms();

let keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

let cameraX = 0;
let isMoving = false;
let lastShotTime = 0;

// SHOOT: Fires in current facing direction
canvas.addEventListener('click', function(event) {
  const now = Date.now();
  if (now - lastShotTime < 1000) return; 
  lastShotTime = now;
  const speed = 14;
  const dir = player.facingRight ? 1 : -1;
  projectiles.push({
    x: player.facingRight
      ? player.x + player.width * 0.8
      : player.x + player.width * 0.2,
    y: player.y + player.height * 0.6,
    dx: speed * dir,
    dy: 0,
    exploding: false,
    explosionTimer: 0
  });
});

function update() {
  let moving = false;
  if (keys['a'] || keys['A']) {
    player.x -= keys['A'] ? 8 : 4;
    moving = true;
    player.facingRight = false;
  }
  if (keys['d'] || keys['D']) {
    player.x += keys['D'] ? 8 : 4;
    moving = true;
    player.facingRight = true;
  }
  isMoving = moving;

  if ((keys[' '] || keys['w'] || keys['W']) && player.onGround) {
    player.dy = jumpPower;
  }

  player.dy += gravity;
  let nextY = player.y + player.dy;
  player.onGround = false;

  // Platform collision
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

  // Ground collision
  if (player.y + player.height + player.dy >= groundY) {
    player.y = groundY - player.height;
    player.dy = 0;
    player.onGround = true;
  }

  if (!player.onGround) {
    player.y += player.dy;
  }

  // --- Update projectiles ---
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    if (!p.exploding) {
      p.x += p.dx;
      p.y += p.dy;
      // Projectile-Platform Collision
      for (const plat of platforms) {
        if (
          p.x > plat.x && p.x < plat.x + plat.width &&
          p.y > plat.y && p.y < plat.y + plat.height
        ) {
          p.exploding = true;
          p.explosionTimer = 0;
          break;
        }
      }
      if (p.y > groundY) {
        p.exploding = true;
        p.explosionTimer = 0;
      }
      if (
        p.x < cameraX - 100 ||
        p.x > cameraX + canvas.width + 100 ||
        p.y < -100 ||
        p.y > canvas.height + 100
      ) {
        projectiles.splice(i, 1);
        continue;
      }
    } else {
      p.explosionTimer += 1;
      if (p.explosionTimer > 24) {
        projectiles.splice(i, 1);
        continue;
      }
    }
  }

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

  // Draw platforms (gray)
  platforms.forEach(p => {
    ctx.fillStyle = '#888';
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  // Draw projectiles
  projectiles.forEach(p => {
    if (p.exploding) {
      ctx.fillStyle = 'orange';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 32, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw player (just blue square for now)
  ctx.fillStyle = '#09f';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

document.addEventListener('keydown', function(e) {
  if (e.key === 'f') {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  }
});
