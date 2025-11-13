const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let platforms = [];

function generatePlatforms(num) {
  platforms = [];
  let x = 0;
  for (let i = 0; i < num; i++) {
    let width = 100 + Math.random() * 100;
    let height = 15;
    let y = 320 - Math.random() * 200; // random vertical position, above ground
    platforms.push({ x: x, y: y, width: width, height: height });
    x += 120 + Math.random() * 150; // space between platforms
  }
// Player settings
let player = { x: 50, y: 300, width: 40, height: 40, dy: 0, onGround: false };
const gravity = 0.7;
const jumpPower = -12;
const groundY = 350;

// Keyboard controls
let keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function update() {
  // Jump with W
  if ((keys[' '] || keys['w']) && player.onGround) {
    player.dy = jumpPower;
    player.onGround = false;
  }

  // Apply gravity
  player.dy += gravity;
  player.y += player.dy;

  // Collide with ground
  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.dy = 0;
    player.onGround = true;
  }
player.onGround = false; // reset!
platforms.forEach(p => {
  if (
    player.x + player.width > p.x &&
    player.x < p.x + p.width &&
    player.y + player.height <= p.y + player.dy && // was above
    player.y + player.height + player.dy >= p.y // will land
  ) {
    player.y = p.y - player.height;
    player.dy = 0;
    player.onGround = true;
  }
});
  // Move left/right with A and D
  if (keys['a'] || keys['A']) player.x -= 4;
  if (keys['d'] || keys['D']) player.x += 4;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw ground
  ctx.fillStyle = '#444';
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
  // Draw player
  ctx.fillStyle = '#09f';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  ctx.fillStyle = '#7a7';
platforms.forEach(p => {
  ctx.fillRect(p.x, p.y, p.width, p.height);
});
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
generatePlatforms(5);
loop();
