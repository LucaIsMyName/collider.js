import { animate } from './animate-js/animate.js';

const INITIAL_ENEMY_SIZE = 50;
const INITIAL_ENEMY_SPAWN_RATE = 4000 + Math.floor(Math.random() * 500);
const INITIAL_SPEED = 1 + Math.floor(Math.random() * 5);
const PLAYER_MOVEMENT_SPEED = 1 + Math.floor(Math.random() * 5);
const PLAYER_COLLISION_RESET_X = 50 + Math.floor(Math.random() * 5);
const PLAYER_MAX_X_OFFSET = 16;
const INITIAL_FRIEND_SIZE = 50; // Size for friends
const FRIEND_SPAWN_RATE = 4000 + Math.floor(Math.random() * 500); // Spawn rate for friends

let player = document.getElementById('player');
let pointsElement = document.querySelector('[data-points]');
let livesElement = document.getElementById('lives');
let endGameOverlay = document.getElementById('end-game-overlay');
let finalPointsElement = document.getElementById('final-points');
let playAgainButton = document.getElementById('play-again');
let playPauseButton = document.querySelector('[data-play-pause-game]');
let arrowsElement = document.getElementById('arrows'); // Arrows display
let friendInterval;
let friendSize = INITIAL_FRIEND_SIZE;

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
  friendInterval = setInterval(createFriend, FRIEND_SPAWN_RATE); // Initialize friend creation
  gameInterval = setInterval(updateGame, 100);
  resetArrows();

  playerHorizontalPos = 0;
  playerMaxX = window.innerWidth - (PLAYER_MAX_X_OFFSET * 16); // Account for player size in pixels
  arrowsElement.textContent = `${arrowsRemaining}`; // Initialize arrows display
}

// Function to create a friend
function createFriend() {
  if (isGamePaused) return;

  let friend = document.createElement('div');
  friend.classList.add('friend', 'absolute');

  // SVG for the friend (white square)
  friend.innerHTML = `<svg class="w-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="8" width="16" height="16" fill="#FFFFFF"/>
</svg>`;

  let randomizedFriendSize = friendSize * Math.random() * 2;
  let getRandomizedFriendSize = randomizedFriendSize <= 30 ? 30 : randomizedFriendSize;
  friend.style.bottom = Math.random() * (window.innerHeight - getRandomizedFriendSize) + 'px';
  friend.style.left = window.innerWidth + 'px';
  friend.style.width = `${getRandomizedFriendSize}px`;
  friend.style.height = `${getRandomizedFriendSize}px`;
  document.querySelector('[data-game-area]').appendChild(friend);

  let moveInterval = setInterval(() => {
    if (isGamePaused) return;

    let currentLeft = parseFloat(window.getComputedStyle(friend).left);
    if (currentLeft < -friendSize) {
      friend.remove();
    } else {
      friend.style.left = `${currentLeft - speed}px`;
    }
  }, 20);
}
// Function to handle collision with a friend
function checkFriendCollision(friend) {
  let friendRect = friend.getBoundingClientRect();
  let playerRect = player.getBoundingClientRect();

  if (
    !(friendRect.right < playerRect.left ||
      friendRect.left > playerRect.right ||
      friendRect.bottom < playerRect.top ||
      friendRect.top > playerRect.bottom)
  ) {
    // Randomly choose an outcome
    let outcome = Math.floor(Math.random() * 4);
    function createAnimation() {
      animate.create(player,
        {
          keyframes: {
            0: {
              transform: 'rotate(0deg)',
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
              transform: 'rotate(-10deg)',
            },
            100: {
              transform: 'rotate(0deg)',
            }
          },
        })
    }
    switch (outcome) {
      case 0:
        createAnimation();

        playerHorizontalPos = PLAYER_COLLISION_RESET_X;
        player.style.left = `${playerHorizontalPos}px`;

        break;
      case 1:
        createAnimation();

        arrowsRemaining = 5;
        arrowsElement.textContent = `${arrowsRemaining}`;

        break;
      case 2:
        createAnimation();

        lives = 5;
        livesElement.textContent = lives;

      case 3:
        createAnimation();

        enemyCount += 10;
        pointsElement.textContent = enemyCount;

    }

    friend.remove();
  }
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
    player.style.bottom = `${currentBottom + 50}px`;
  }
}

function movePlayerDown() {
  let currentBottom = parseFloat(window.getComputedStyle(player).bottom);
  if (currentBottom > 0) {
    player.style.bottom = `${currentBottom - 50}px`;
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
      // randomize speed
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
    player.appendChild(
      createElement('div').setAttribute('class',
      'absolute size-3 bg-yellow-500 rounded-full animate-ping'
      )
    )
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

  document.querySelectorAll('.friend').forEach((friend) => {
    checkFriendCollision(friend);
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
// Update event listener to use the new handleTouchControl function
function handleTouchControl(control) {
  if (isGamePaused) return;

  const action = control.getAttribute('data-touch');
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
    handleTouchControl(control);
  });
});

playPauseButton.addEventListener('click', toggleGamePause);

startGame();

