const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load player sprites
const playerIdle = new Image();
playerIdle.src = 'sprites/PlayerIdle.gif';
const playerMove = new Image();
playerMove.src = 'sprites/PlayerMovement.gif';
const projectileImg = new Image();
projectileImg.src = 'sprites/gameProjectile.gif';

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let player = { x: 100, y: 300, width: 100, height: 100, dy: 0, onGround: false };
const gravity = 0.7;
const jumpPower = -12;
const groundY = 350;

let projectiles = [];
let platforms = [];
function generatePlatforms(num) {
  platforms = [];
  let x = 0;
  for (let i = 0; i < num; i++) {
    let width = 100 + Math.random() * 100;
    let height = 15;
    let y = 320 - Math.random() * 200;
    platforms.push({ x, y, width, height });
    x += 180 + Math.random() * 180;
  }
}
generatePlatforms(25);

let keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

let cameraX = 0;
let isMoving = false;

// Launch projectile on click
canvas.addEventListener('click', function(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left + cameraX;
  const mouseY = event.clientY - rect.top;
  const dx = mouseX - (player.x + player.width / 2);
  const dy = mouseY - (player.y + player.height / 2);
  const length = Math.hypot(dx, dy) || 1;
  const speed = 10;
  projectiles.push({
    x: player.x + player.width / 2,
    y: player.y + player.height / 2,
    dx: dx / length * speed,
    dy: dy / length * speed
  });
});

function update() {
  let moving = false;
  // Player Movement
  if (keys['a'] || keys['A']) { player.x -= keys['A'] ? 8 : 4; moving = true; }
  if (keys['d'] || keys['D']) { player.x += keys['D'] ? 8 : 4; moving = true; }
  isMoving = moving;

  // Jumping
  if ((keys[' '] || keys['w'] || keys['W']) && player.onGround) {
    player.dy = jumpPower;
  }

  // Gravity
  player.dy += gravity;
  let nextY = player.y + player.dy;
  player.onGround = false;

  // Platform Collision
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

  // Ground Collision
  if (player.y + player.height + player.dy >= groundY) {
    player.y = groundY - player.height;
    player.dy = 0;
    player.onGround = true;
  }

  // Update Y if in air
  if (!player.onGround) {
    player.y += player.dy;
  }

  // Update projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].x += projectiles[i].dx;
    projectiles[i].y += projectiles[i].dy;
    // Remove if offscreen
    if (
      projectiles[i].x < cameraX - 100 ||
      projectiles[i].x > cameraX + canvas.width + 100 ||
      projectiles[i].y < -100 ||
      projectiles[i].y > canvas.height + 100
    ) {
      projectiles.splice(i, 1);
    }
  }

  // Smooth camera
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

  // Draw projectiles
  projectiles.forEach(p => {
    if (projectileImg.complete && projectileImg.naturalWidth !== 0) {
      ctx.drawImage(projectileImg, p.x - 16, p.y - 16, 32, 32); // adjust size as needed
    } else {
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw player (GIF sprite)
  let sprite = isMoving ? playerMove : playerIdle;
  if (sprite.complete && sprite.naturalWidth !== 0) {
    ctx.drawImage(sprite, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = '#09f';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

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
