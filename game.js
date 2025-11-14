const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const playerIdle = new Image();
playerIdle.src = 'sprites/PlayerIdle.gif';
const playerMove = new Image();
playerMove.src = 'sprites/PlayerMovement.gif';
const projectileImg = new Image();
projectileImg.src = 'sprites/gameProjectile.gif';
const explosionImg = new Image();
explosionImg.src = 'sprites/gameExplosion.gif';
const platformImgs = [
  plat1(),
  plat2(),
  plat3()
  ];

platformImgs[0].src = 'sprites/platforms/Plat1.gif'

platformImgs[1].src = 'sprites/platforms/Plat2.gif'

platformImgs[2].src = 'sprites/platforms/Plat3.gif'

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
function generatePlatforms(num) {
  platforms = [];
  let x = 0;
  for (let i = 0; i < num; i++) {
    let width = 100 + Math.random() * 100;
    let height = 15;
    let y = 320 - Math.random() * 200;
    let imgIndex = Math.floor(Math.random() * platformImgs.length);
    platforms.push({ x, y, width, height, imgIndex });
    x += 180 + Math.random() * 180;
  }
}

generatePlatforms(25);

let keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

let cameraX = 0;
let isMoving = false;
let lastShotTime = 0
// SHOOT: Fires in current facing direction
canvas.addEventListener('click', function(event) {
  const now = Date.now();
  if (now - lastShotTime < 1000) return; 
  lastShotTime = now
  
  const speed = 14;
  const dir = player.facingRight ? 1 : -1;
  projectiles.push({
    x: player.facingRight
      ? player.x + player.width * 0.8  // right hand/side
      : player.x + player.width * 0.2, // left hand/side
    y: player.y + player.height * 0.6,
    dx: speed * dir,
    dy: 0,
    exploding: false,
    explosionTimer: 0
  });
});

function update() {
  let moving = false;
  // Player Movement
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

  // --- Update projectiles ---
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    if (!p.exploding) {
      p.x += p.dx;
      p.y += p.dy;
      // Impact with platforms
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
      // Impact with ground
      if (p.y > groundY) {
        p.exploding = true;
        p.explosionTimer = 0;
      }
      // Impact with edge of screen (optional)
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
      // Exploding: animate for some frames then remove
      p.explosionTimer += 1;
      if (p.explosionTimer > 24) { // About 0.4 sec at 60 FPS
        projectiles.splice(i, 1);
        continue;
      }
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
platforms.forEach(p => {
  const img = platformImgs[p.imgIndex];
  if (img.complete && img.naturalWidth !== 0) {
    ctx.drawImage(img, p.x, p.y, p.width, p.height);
  } else {
    ctx.fillStyle = '#7a7';
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }
});
  // Draw projectiles
  projectiles.forEach(p => {
    if (p.exploding) {
      if (explosionImg.complete && explosionImg.naturalWidth !== 0) {
        ctx.drawImage(explosionImg, p.x - 32, p.y - 32, 64, 64);
      } else {
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 32, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      if (projectileImg.complete && projectileImg.naturalWidth !== 0) {
        ctx.drawImage(projectileImg, p.x - 16, p.y - 16, 32, 32);
      } else {
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
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
