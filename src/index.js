import { animate } from './animate-js/animate.js';

const INITIAL_ENEMY_SIZE = 50;
const INITIAL_ENEMY_SPAWN_RATE = 2000;
const INITIAL_SPEED = 1;
const PLAYER_MOVEMENT_SPEED = 0.5;
const PLAYER_COLLISION_RESET_X = 100;
const PLAYER_MAX_X_OFFSET = 16;

let player = document.getElementById('player');
let pointsElement = document.querySelector('[data-points]');
let livesElement = document.getElementById('lives');
let endGameOverlay = document.getElementById('end-game-overlay');
let finalPointsElement = document.getElementById('final-points');
let playAgainButton = document.getElementById('play-again');
let playPauseButton = document.querySelector('[data-play-pause-game]');
let arrowsElement = document.getElementById('arrows'); // Arrows display

let gameInterval;
let enemyInterval;
let enemySize = INITIAL_ENEMY_SIZE;
let enemySpawnRate = INITIAL_ENEMY_SPAWN_RATE;
let speed = INITIAL_SPEED;
let enemyCount = 0;
let lives = 5;
let enemiesSpawned = 0;
let playerHorizontalPos = 0;
let playerHorizontalSpeed = PLAYER_MOVEMENT_SPEED;
let playerMaxX;
let isGamePaused = false;

let arrowsRemaining = 5; // Initial number of arrows
let arrowSpeed = 10; // Speed of the arrows
let arrows = [];
let arrowCooldown = false; // Prevent rapid arrow shooting
let arrowsUsed = 0; // Track arrows used

// Start the game
function startGame() {
  document.addEventListener('keydown', handleKeyPress); // Combined listener for movement and shooting
  enemyInterval = setInterval(createEnemy, enemySpawnRate);
  gameInterval = setInterval(updateGame, 100);
  resetArrows();

  playerHorizontalPos = 0;
  playerMaxX = window.innerWidth - (PLAYER_MAX_X_OFFSET * 16); // Account for player size in pixels
  arrowsElement.textContent = `${arrowsRemaining}`; // Initialize arrows display
}

function handleKeyPress(e) {
  if (isGamePaused) return;

  switch (e.key) {
    case 'ArrowUp':
      movePlayerUp();
      break;
    case 'ArrowDown':
      movePlayerDown();
      break;
    case 'ArrowRight':
      handleArrowShooting(); // Shooting functionality moved here
      break;
  }
}

function movePlayerUp() {
  let currentBottom = parseFloat(window.getComputedStyle(player).bottom);
  if (currentBottom < window.innerHeight - player.clientHeight) {
    player.style.bottom = `${currentBottom + 20}px`;
  }
}

function movePlayerDown() {
  let currentBottom = parseFloat(window.getComputedStyle(player).bottom);
  if (currentBottom > 0) {
    player.style.bottom = `${currentBottom - 20}px`;
  }
}

function movePlayer(e) {
  if (isGamePaused) return;

  let currentBottom = parseFloat(window.getComputedStyle(player).bottom);
  if (e.key === 'ArrowUp' && currentBottom < window.innerHeight - player.clientHeight) {
    player.style.bottom = `${currentBottom + 20}px`;
  } else if (e.key === 'ArrowDown' && currentBottom > 0) {
    player.style.bottom = `${currentBottom - 20}px`;
  }
}

function updatePlayerHorizontalMovement() {
  playerHorizontalPos += playerHorizontalSpeed;
  if (playerHorizontalPos > playerMaxX) {
    playerHorizontalPos = playerMaxX;
    playerHorizontalSpeed = -playerHorizontalSpeed; // Reverse direction
  } else if (playerHorizontalPos < 0) {
    playerHorizontalPos = 0;
    playerHorizontalSpeed = -playerHorizontalSpeed; // Reverse direction
  }
  player.style.left = `${playerHorizontalPos}px`;

  playerHorizontalSpeed *= 0.98; // Gradually decrease the speed
}

function createEnemy() {
  if (isGamePaused) return;

  let enemy = document.createElement('div');
  enemy.className = 'enemy';

  // SVG for the enemy
  enemy.innerHTML = `<svg class="w-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="12" height="12" fill="#FF0000"/>
  <rect x="12" y="8" width="8" height="2" fill="#FF0000"/>
  <circle cx="16" cy="16" r="4" fill="#FF0000"/>
</svg>`;

  let randomizedEnemySize = enemySize * Math.random() * 2;
  let getRandomizedEnemySize = randomizedEnemySize <= 30 ? 30 : randomizedEnemySize;
  enemy.style.bottom = Math.random() * (window.innerHeight - getRandomizedEnemySize) + 'px';
  enemy.style.left = window.innerWidth + 'px';
  enemy.style.width = `${getRandomizedEnemySize}px`;
  enemy.style.height = `${getRandomizedEnemySize}px`;
  document.querySelector('[data-game-area]').appendChild(enemy);

  let moveInterval = setInterval(() => {
    if (isGamePaused) return;

    let currentLeft = parseFloat(window.getComputedStyle(enemy).left);
    if (currentLeft < -enemySize) {
      enemy.remove();
      enemiesSpawned++;
      if (enemiesSpawned % 10 === 0) {
        enemySize += 10;
        enemySpawnRate = Math.max(500, enemySpawnRate - 50);
        clearInterval(enemyInterval);
        enemyInterval = setInterval(createEnemy, enemySpawnRate);
      }
      enemyCount++;
      pointsElement.textContent = enemyCount;
    } else {
      enemy.style.left = `${currentLeft - speed}px`;
    }
  }, 20);
}

function handleArrowShooting() {
  if (arrowsRemaining > 0 && !arrowCooldown && !isGamePaused) {
    shootArrow();
    arrowsRemaining--;
    arrowsUsed++; // Increment the used arrow count
    arrowsElement.textContent = `${arrowsRemaining}`; // Update arrow count
    arrowCooldown = true;
    setTimeout(() => {
      arrowCooldown = false; // Reset cooldown after 1 second
    }, 1000);
  }
}

// Function to shoot an arrow
function shootArrow() {
  let arrow = document.createElement('div');
  arrow.classList.add('arrow', 'absolute', 'size-3');
  arrow.innerHTML = `<svg class="w-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="16,2 26,16 16,30" fill="#FFFF00"/>
</svg>`;

  // Calculate initial position offset within player's width
  let arrowOffset = 40; // Adjust this value for desired arrow placement

  arrow.style.left = `${parseFloat(window.getComputedStyle(player).left) + player.clientWidth - arrowOffset}px`;
  arrow.style.bottom = `${parseFloat(window.getComputedStyle(player).bottom) + player.clientHeight / 2}px`;

  document.querySelector('[data-game-area]').appendChild(arrow);
  arrows.push(arrow);

  let arrowInterval = setInterval(() => {
    let arrowLeft = parseFloat(window.getComputedStyle(arrow).left);
    if (arrowLeft > window.innerWidth) {
      arrow.remove();
      clearInterval(arrowInterval);
    } else {
      arrow.style.left = `${arrowLeft + arrowSpeed}px`;
      checkArrowCollision(arrow, arrowInterval);
    }
  }, 20);
}
function checkArrowCollision(arrow, arrowInterval) {
  let collisionDetected = false;

  document.querySelectorAll('.enemy').forEach((enemy) => {
    let arrowRect = arrow.getBoundingClientRect();
    let enemyRect = enemy.getBoundingClientRect();

    // Calculate arrow center coordinates
    let arrowCenterX = (arrowRect.left + arrowRect.right) / 2;
    let arrowCenterY = (arrowRect.top + arrowRect.bottom) / 2;

    // Check if arrow center is within enemy's bounding box
    if (
      arrowCenterX >= enemyRect.left &&
      arrowCenterX <= enemyRect.right &&
      arrowCenterY >= enemyRect.top &&
      arrowCenterY <= enemyRect.bottom
    ) {
      // Remove the enemy and arrow when hit
      animate.create(enemy, {
        keyframes: {
          0: {
            scale: 1,
          },
          10: {
            transform: 'rotate(10deg)',
          },
          20: {
            transform: 'rotate(-10deg)',
          },
          30: {
            transform: 'rotate(10deg)',
          },
          50: {
            scale: 1.1,
            transform: 'rotate(-10deg)',
          },
          100: {
            scale: 0,
            filter: 'blur(100px)',

          }
        },
        duration: 500,
      });
      setTimeout(() => {
        enemy.remove();
      }, 500);
      arrow.remove();
      clearInterval(arrowInterval); // Stop arrow movement once hit

      console.log('Enemy hit and removed!');
      collisionDetected = true;

      enemiesSpawned++;
      enemyCount++;
      pointsElement.textContent = enemyCount;
    }
  });

  // Log the collision status
  console.log('Collision Detected:', collisionDetected);
}

function resetArrows() {
  if (enemyCount % 10 === 0 && arrowsRemaining === 0) {
    arrowsRemaining = 3;
    arrowsElement.textContent = `${arrowsRemaining}`;
  }
}
// Update game function
function updateGame() {
  if (isGamePaused) return;

  speed += 0.01;
  updatePlayerHorizontalMovement();

  document.querySelectorAll('.enemy').forEach((enemy) => {
    let enemyRect = enemy.getBoundingClientRect();
    let playerRect = player.getBoundingClientRect();

    if (
      !(enemyRect.right < playerRect.left ||
        enemyRect.left > playerRect.right ||
        enemyRect.bottom < playerRect.top ||
        enemyRect.top > playerRect.bottom)
    ) {
      lives--;
      livesElement.textContent = lives;
      enemy.remove();
      if (lives <= 0) {
        endGame();
      } else {
        playerHorizontalPos = Math.min(playerHorizontalPos + PLAYER_COLLISION_RESET_X, playerMaxX);
        player.style.left = `${playerHorizontalPos}px`;
      }
    }
  });

  pointsElement.textContent = enemyCount;
}

function toggleGamePause() {
  isGamePaused = !isGamePaused;
  playPauseButton.innerHTML = isGamePaused ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
</svg>` : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
<path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>`;

  if (!isGamePaused) {
    enemyInterval = setInterval(createEnemy, enemySpawnRate);
    gameInterval = setInterval(updateGame, 100);
  } else {
    clearInterval(enemyInterval);
    clearInterval(gameInterval);
  }
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(enemyInterval);
  document.removeEventListener('keydown', movePlayer);
  document.removeEventListener('keydown', handleArrowShooting);

  // Ensure the overlay is shown by setting display style directly
  endGameOverlay.classList.remove('hidden');
  endGameOverlay.style.display = 'flex';  // Add this line

  finalPointsElement.textContent = enemyCount;
}
playAgainButton.addEventListener('click', () => {
  location.reload();
});

// Add this function to handle touch control events
function handleTouchControl(e) {
  if (isGamePaused) return;

  const action = e.target.getAttribute('data-touch');
  if (action) {
    switch (action) {
      case 'up':
        movePlayerUp();
        break;
      case 'down':
        movePlayerDown();
        break;
      case 'shoot':
        handleArrowShooting();
        break;
    }
  }
}

// Add event listeners for touch controls
let allTouchControls = document.querySelectorAll('[data-touch]');
allTouchControls.forEach(control => {
  control.addEventListener('click', () => {
    console.log('Touch control clicked:', control.getAttribute('data-touch'));
    handleTouchControl
  });
});

playPauseButton.addEventListener('click', toggleGamePause);

startGame();

/**
 * Star Animation
 */

let allStars = document.querySelectorAll('.star');

allStars.forEach(star => {
  // random number between 0 and 100
  let initLeft = Math.floor(Math.random() * 150);
  let initTop = Math.floor(Math.random() * 150);
  let endLeft = Math.floor(Math.random() * 150);
  let endTop = Math.floor(Math.random() * 150);
  animate.create(star,
    {
      callback: () => {
        animate.destroy(star);
      },
      // direction: 'alternate',
      duration: 7500 + Math.floor(Math.random() * 5000),
      iterations: 'infinite',
      keyframes: {
        0: {
          filter: `blur(30px)`,
          opacity: 0,
          left: `${initLeft}%`,
          top: `${initTop}%`,
          transform: 'translateX(-110vw)',
        },
        10: {
          opacity: 0.7,
          scale: Math.random() * 2,
        },
        90: {
          opacity: 0.7,
          scale: Math.random() * 2,
          filter: `blur(${Math.random() * 50}px)`,
        },
        100: {
          left: `${endLeft}%`,
          top: `${endTop}%`,
          transform: 'translateX(110vw)',
          filter: `blur(30px)`,
        }
      }
    })
});
