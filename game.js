const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
  if ((keys['w'] || keys['W']) && player.onGround) {
    player.dy = jumpPower;
    player.onGround = false;
  }
  // (Remove the spacebar jump block if only using WASD)

  // Apply gravity
  player.dy += gravity;
  player.y += player.dy;
  // Collide with ground
  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.dy = 0;
    player.onGround = true;
  }
  // Move left/right
  if (keys['a'] || keys['A']) player.x -= 4; // Left
  if (keys['d'] || keys['D']) player.x += 4; // Right
}
  }

function draw() {
 ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#444';
ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY); // Draw ground
ctx.fillStyle = '#09f';
ctx.fillRect(player.x, player.y, player.width, player.height);  // Draw player


function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
