const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreNode = document.getElementById("score");
const winGifNode = document.getElementById("win-gif");
ctx.imageSmoothingEnabled = false;

const groundY = 420;
const gravity = 0.88;
const jumpStrength = -17.5;
const boostJumpStrength = -20.5;
const maxJumps = 3;
const pikachuImage = new Image();
let pikachuImageLoaded = false;
const pikachuHappyImage = new Image();
let pikachuHappyImageLoaded = false;
const ketchupImage = new Image();
let ketchupImageLoaded = false;
const gastlyImage = new Image();
let gastlyImageLoaded = false;
const boulderImage = new Image();
let boulderImageLoaded = false;
const bushImages = {
  bush1: new Image(),
  bush2: new Image(),
};
const bushImageLoaded = {
  bush1: false,
  bush2: false,
};
const berryImages = {};
const berryImagePaths = Array.from({ length: 10 }, (_, index) => `./assets/berry${index + 1}.png`);
const berryImageKeys = berryImagePaths.map((path) => path.replace("./assets/", "").replace(".png", ""));
const gameOverMessages = ["Pikachu fainted!", "Pikachu is unable to battle!"];
const assetState = {
  berriesLoaded: 0,
};
const levelUpMessage = "PIKACHU GREW TO LEVEL 67!";
const confettiColors = ["#f25f5c", "#ffe066", "#70c1b3", "#4d96ff", "#c77dff", "#ff9f1c"];
const audioState = {
  bgmStarted: false,
  winPlayed: false,
  losePlayed: false,
};
const bgmAudio = new Audio();
const loseAudio = new Audio();
const winAudio = new Audio();
const jumpAudio = new Audio();
bgmAudio.loop = true;
bgmAudio.volume = 0.35;
loseAudio.volume = 0.5;
winAudio.volume = 0.5;
jumpAudio.volume = 0.35;
const urlParams = new URLSearchParams(window.location.search);
const previewScore = Number.parseInt(urlParams.get("score") || "", 10);
const playScore = Number.parseInt(urlParams.get("playScore") || "", 10);
const previewMode = Number.isFinite(previewScore);
const playMode = Number.isFinite(playScore);
const pixelFont = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00001", "00001", "00001", "00001", "10001", "10001", "01110"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

const player = {
  x: 160,
  y: groundY - 108,
  width: 112,
  height: 108,
  velocityY: 0,
  jumping: false,
  jumpsUsed: 0,
};

const game = {
  speed: 6,
  distance: 0,
  frame: 0,
  score: 0,
  gameOver: false,
  gameWon: false,
  obstacles: [],
  collectibles: [],
  obstacleTimer: 0,
  collectibleTimer: 0,
  gameOverMessage: gameOverMessages[0],
  confetti: [],
  winButton: {
    x: canvas.width / 2 - 112,
    y: 208,
    width: 224,
    height: 48,
  },
};

function tryLoadImage(image, sources, onSuccess) {
  let index = 0;

  function loadNext() {
    if (index >= sources.length) {
      return;
    }

    image.onload = () => {
      onSuccess();
    };
    image.onerror = () => {
      index += 1;
      loadNext();
    };
    image.src = sources[index];
  }

  loadNext();
}

function tryLoadAudio(audio, sources) {
  let index = 0;

  function loadNext() {
    if (index >= sources.length) {
      return;
    }

    audio.oncanplaythrough = () => {
      audio.oncanplaythrough = null;
      audio.onerror = null;
    };
    audio.onerror = () => {
      index += 1;
      loadNext();
    };
    audio.src = sources[index];
    audio.load();
  }

  loadNext();
}

tryLoadImage(pikachuImage, ["./assets/pikachu.png"], () => {
  pikachuImageLoaded = true;
});
tryLoadImage(pikachuHappyImage, ["./assets/pikachu_happy.gif"], () => {
  pikachuHappyImageLoaded = true;
});
tryLoadImage(ketchupImage, ["./assets/ketchup.png"], () => {
  ketchupImageLoaded = true;
});
tryLoadImage(gastlyImage, ["./assets/gastly.png"], () => {
  gastlyImageLoaded = true;
});
tryLoadImage(boulderImage, ["./assets/boulder.png"], () => {
  boulderImageLoaded = true;
});
tryLoadImage(bushImages.bush1, ["./assets/bush1.png"], () => {
  bushImageLoaded.bush1 = true;
});
tryLoadImage(bushImages.bush2, ["./assets/bush2.png"], () => {
  bushImageLoaded.bush2 = true;
});
berryImagePaths.forEach((path, index) => {
  const image = new Image();
  berryImages[berryImageKeys[index]] = image;
  tryLoadImage(image, [path], () => {
    assetState.berriesLoaded += 1;
  });
});
tryLoadAudio(bgmAudio, ["./assets/bgm.mp3"]);
tryLoadAudio(loseAudio, ["./assets/lose.mp3"]);
tryLoadAudio(winAudio, ["./assets/win.mp3"]);
tryLoadAudio(jumpAudio, ["./assets/jump.mp3"]);

function resetGame() {
  game.speed = 6;
  game.distance = 0;
  game.frame = 0;
  game.score = previewMode
    ? Math.max(0, Math.min(100, previewScore))
    : playMode
      ? Math.max(0, Math.min(99, playScore))
      : 0;
  game.gameOver = false;
  game.gameWon = previewMode && game.score >= 100;
  game.obstacles.length = 0;
  game.collectibles.length = 0;
  game.obstacleTimer = 0;
  game.collectibleTimer = 0;
  game.gameOverMessage = gameOverMessages[0];
  game.confetti.length = 0;
  audioState.winPlayed = false;
  audioState.losePlayed = false;
  player.y = groundY - player.height;
  player.velocityY = 0;
  player.jumping = false;
  player.jumpsUsed = 0;
  if (game.gameWon) {
    spawnConfettiBurst();
  }
  if (audioState.bgmStarted && !previewMode) {
    bgmAudio.currentTime = 0;
    void bgmAudio.play().catch(() => {});
  }
  syncWinGifVisibility();
  updateScore();
}

function updateScore() {
  scoreNode.textContent = game.score;
}

function syncWinGifVisibility() {
  winGifNode.style.display = game.gameWon ? "block" : "none";
}

function spawnConfettiBurst() {
  game.confetti.length = 0;
  for (let i = 0; i < 120; i += 1) {
    game.confetti.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.4,
      width: 6 + Math.random() * 8,
      height: 10 + Math.random() * 10,
      color: confettiColors[i % confettiColors.length],
      speedY: 1.8 + Math.random() * 3.2,
      speedX: -1.8 + Math.random() * 3.6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: -0.12 + Math.random() * 0.24,
    });
  }
}

function startBackgroundMusic() {
  if (audioState.bgmStarted || previewMode) {
    return;
  }

  audioState.bgmStarted = true;
  void bgmAudio.play().catch(() => {});
}

function playLoseAudio() {
  if (audioState.losePlayed) {
    return;
  }

  audioState.losePlayed = true;
  bgmAudio.pause();
  loseAudio.currentTime = 0;
  void loseAudio.play().catch(() => {});
}

function playWinAudio() {
  if (audioState.winPlayed) {
    return;
  }

  audioState.winPlayed = true;
  bgmAudio.pause();
  winAudio.currentTime = 0;
  void winAudio.play().catch(() => {});
}

function playJumpAudio() {
  jumpAudio.pause();
  jumpAudio.currentTime = 0;
  void jumpAudio.play().catch(() => {});
}

function rectsOverlap(a, b, padX = 0, padY = 0) {
  return (
    a.x < b.x + b.width + padX &&
    a.x + a.width + padX > b.x &&
    a.y < b.y + b.height + padY &&
    a.y + a.height + padY > b.y
  );
}

function shiftSpawnAwayFromOverlap(entity, others, padX, padY, minGap) {
  let attempts = 0;
  while (attempts < 6) {
    const overlap = others.find((other) => rectsOverlap(entity, other, padX, padY));
    if (!overlap) {
      return entity;
    }

    entity.x = overlap.x + overlap.width + minGap;
    attempts += 1;
  }
  return entity;
}

function jump() {
  if (previewMode) {
    return;
  }

  startBackgroundMusic();

  if (game.gameWon) {
    return;
  }

  if (game.gameOver) {
    resetGame();
    return;
  }

  if (player.jumpsUsed === 0) {
    player.velocityY = jumpStrength;
    player.jumping = true;
    player.jumpsUsed = 1;
    playJumpAudio();
    return;
  }

  if (player.jumpsUsed < maxJumps) {
    player.velocityY = boostJumpStrength;
    player.jumpsUsed += 1;
    player.jumping = true;
    playJumpAudio();
  }
}

window.addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
    event.preventDefault();
    jump();
  }
});

canvas.addEventListener("pointerdown", jump);
canvas.addEventListener("click", (event) => {
  if (!game.gameWon) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const pointerX = (event.clientX - rect.left) * scaleX;
  const pointerY = (event.clientY - rect.top) * scaleY;

  if (
    pointerX >= game.winButton.x &&
    pointerX <= game.winButton.x + game.winButton.width &&
    pointerY >= game.winButton.y &&
    pointerY <= game.winButton.y + game.winButton.height
  ) {
    resetGame();
  }
});

function spawnObstacle() {
  const kinds = ["bush", "boulder", "ghastly"];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];

  if (kind === "ghastly") {
    const ghastlyY = groundY - 220 + Math.random() * 110;
    const obstacle = shiftSpawnAwayFromOverlap(
      {
        kind,
        x: canvas.width + 80,
        y: ghastlyY,
        width: 72,
        height: 72,
        baseY: ghastlyY,
        driftOffset: Math.random() * Math.PI * 2,
        driftSpeed: 0.012 + Math.random() * 0.01,
        driftRange: 18 + Math.random() * 10,
        swayStrength: 0.35 + Math.random() * 0.35,
      },
      game.collectibles,
      42,
      32,
      110
    );
    game.obstacles.push(obstacle);
    return;
  }

  const sizes = {
    bush: {
      width: 100,
      height: 66,
      y: groundY - 66,
      variant: Math.random() < 0.5 ? "bush1" : "bush2",
    },
    boulder: { width: 82, height: 82, y: groundY - 82 },
  };

  const obstacle = shiftSpawnAwayFromOverlap(
    {
      kind,
      x: canvas.width + 80,
      ...sizes[kind],
    },
    game.collectibles,
    36,
    22,
    90
  );

  game.obstacles.push(obstacle);
}

function spawnCollectible() {
  const isKetchup = Math.random() < 0.18;
  const collectibleY = isKetchup
    ? groundY - 190 + Math.random() * 70
    : groundY - 180 + Math.random() * 120;
  const collectible = shiftSpawnAwayFromOverlap(
    {
      kind: isKetchup ? "ketchup" : "berry",
      berryStyle: isKetchup ? null : berryImageKeys[Math.floor(Math.random() * berryImageKeys.length)],
      value: isKetchup ? 10 : 1,
      x: canvas.width + 100,
      y: collectibleY,
      width: isKetchup ? 42 : 48,
      height: isKetchup ? 52 : 48,
    },
    game.obstacles,
    42,
    30,
    110
  );

  game.collectibles.push(collectible);
}

function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function update() {
  if (previewMode || game.gameOver || game.gameWon) {
    if (game.gameWon) {
      updateConfetti();
    }
    return;
  }

  game.frame += 1;
  game.distance += game.speed;
  game.speed += 0.0014;

  player.velocityY += gravity;
  player.y += player.velocityY;

  if (player.y >= groundY - player.height) {
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.jumping = false;
    player.jumpsUsed = 0;
  }

  game.obstacleTimer -= 1;
  game.collectibleTimer -= 1;

  if (game.obstacleTimer <= 0) {
    spawnObstacle();
    game.obstacleTimer = 78 + Math.random() * 42 - Math.min(22, game.speed * 2);
  }

  if (game.collectibleTimer <= 0) {
    spawnCollectible();
    game.collectibleTimer = 58 + Math.random() * 56;
  }

  game.obstacles.forEach((obstacle) => {
    obstacle.x -= game.speed;
    if (obstacle.kind === "ghastly") {
      if (game.score >= 50) {
        obstacle.driftOffset += obstacle.driftSpeed;
        const verticalWave = Math.sin(obstacle.driftOffset) * obstacle.driftRange;
        const secondaryWave = Math.cos(obstacle.driftOffset * 1.7) * (obstacle.driftRange * 0.45);
        obstacle.y = obstacle.baseY + verticalWave + secondaryWave;
        obstacle.x += Math.sin(obstacle.driftOffset * 0.9) * obstacle.swayStrength;
      } else {
        obstacle.y = obstacle.baseY;
      }
    }
  });

  game.collectibles.forEach((item) => {
    item.x -= game.speed;
    item.y += Math.sin((game.frame + item.x) * 0.06) * 0.8;
  });

  const playerHitbox = {
    x: player.x + 18,
    y: player.y + 14,
    width: player.width - 38,
    height: player.height - 22,
  };

  game.obstacles = game.obstacles.filter((obstacle) => {
    if (obstacle.x + obstacle.width < -40) {
      return false;
    }

    const hitbox = getObstacleHitbox(obstacle);

    if (intersects(playerHitbox, hitbox)) {
      game.gameOverMessage = gameOverMessages[Math.floor(Math.random() * gameOverMessages.length)];
      game.gameOver = true;
      playLoseAudio();
    }

    return true;
  });

  game.collectibles = game.collectibles.filter((item) => {
    if (item.x + item.width < -30) {
      return false;
    }

    if (intersects(playerHitbox, item)) {
      game.score += item.value;
      if (game.score >= 100) {
        game.score = 100;
        game.gameWon = true;
        spawnConfettiBurst();
        playWinAudio();
      }
      updateScore();
      return false;
    }

    return true;
  });
}

function updateConfetti() {
  if (!game.confetti.length) {
    spawnConfettiBurst();
  }

  game.confetti.forEach((piece) => {
    piece.x += piece.speedX;
    piece.y += piece.speedY;
    piece.rotation += piece.rotationSpeed;

    if (piece.y > canvas.height + 20) {
      piece.y = -20 - Math.random() * 120;
      piece.x = Math.random() * canvas.width;
    }

    if (piece.x < -20) {
      piece.x = canvas.width + 20;
    } else if (piece.x > canvas.width + 20) {
      piece.x = -20;
    }
  });
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const season = getSeasonTheme();
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, season.skyTop);
  sky.addColorStop(0.58, season.skyMid);
  sky.addColorStop(1, season.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, groundY);

  ctx.fillStyle = season.cloud;
  drawCloud(110, 82, 1);
  drawCloud(350, 58, 0.78);
  drawCloud(690, 102, 1.06);
  drawCloud(850, 72, 0.68);

  ctx.fillStyle = season.hillTop;
  ctx.fillRect(0, 238, canvas.width, 32);
  ctx.fillStyle = season.hillBottom;
  ctx.beginPath();
  ctx.moveTo(0, 260);
  for (let x = 0; x <= canvas.width; x += 60) {
    ctx.lineTo(x, 230 + Math.sin((x + game.distance * 0.12) * 0.018) * 18);
  }
  ctx.lineTo(canvas.width, 300);
  ctx.lineTo(0, 300);
  ctx.closePath();
  ctx.fill();

  const townScroll = -(game.distance * 0.18) % 310;
  for (let i = -1; i < 5; i += 1) {
    const baseX = townScroll + i * 310;
    drawHouse(baseX + 10, 246, "#f8edd6", "#cd5345");
    drawHouse(baseX + 136, 226, "#f5e4c6", "#d25b4f");
    drawLab(baseX + 236, 212);
    drawTree(baseX + 108, 246, 1.05, season);
    drawTree(baseX + 296, 242, 0.96, season);
  }

  ctx.fillStyle = season.grassBase;
  ctx.fillRect(0, 308, canvas.width, 78);
  drawGrassTiles(0, 308, canvas.width, 78, 16, season);

  ctx.fillStyle = season.pathEdge;
  ctx.fillRect(0, 386, canvas.width, 22);
  drawPathEdge((game.distance * 0.5) % 24, season);

  ctx.fillStyle = season.pathBase;
  ctx.fillRect(0, groundY + 8, canvas.width, 88);
  drawPathTiles((game.distance * 0.75) % 24, season);

  for (let x = 0; x < canvas.width; x += 88) {
    drawFence(x - (game.distance * 0.5) % 88, 366);
  }

  for (let x = 30; x < canvas.width; x += 180) {
    drawFlowerBed(x - (game.distance * 0.2) % 180, 322, season);
  }
}

function getSeasonTheme() {
  if (game.score >= 75) {
    return {
      name: "spring",
      skyTop: "#9fd8ff",
      skyMid: "#d8f0ff",
      skyBottom: "#fff7fb",
      cloud: "#fffaff",
      hillTop: "#b4d796",
      hillBottom: "#93bc7a",
      grassBase: "#8ad27a",
      grassLight: "#9be089",
      grassDark: "#6fb95f",
      grassBlade: "#58a74b",
      pathEdge: "#d0df8e",
      pathEdgeAlt: "#bdd078",
      pathEdgeHighlight: "#edf7be",
      pathBase: "#dcbf90",
      pathTileA: "#e5ca9d",
      pathTileB: "#d6b280",
      pathPebble: "#bc9467",
      flowerBed: "#91c56c",
      flower1: "#f399be",
      flower2: "#f3d170",
      treeTrunk: "#71512f",
      treeLeafMain: "#efb3c9",
      treeLeafLight: "#f7cadb",
      treeLeafDark: "#d986ac",
    };
  }

  if (game.score >= 50) {
    return {
      name: "winter",
      skyTop: "#95a8c4",
      skyMid: "#bfd0e6",
      skyBottom: "#eef5ff",
      cloud: "#f7fbff",
      hillTop: "#c9d3de",
      hillBottom: "#a9b6c2",
      grassBase: "#d7e1e9",
      grassLight: "#e5edf3",
      grassDark: "#bdcad3",
      grassBlade: "#a8b7c3",
      pathEdge: "#d6dde5",
      pathEdgeAlt: "#c3cdd7",
      pathEdgeHighlight: "#f2f6fa",
      pathBase: "#d5dbe3",
      pathTileA: "#e1e7ee",
      pathTileB: "#cbd3dc",
      pathPebble: "#a6b0ba",
      flowerBed: "#ccd5dd",
      flower1: "#e7eef5",
      flower2: "#b9c7d3",
      treeTrunk: "#765d49",
      treeLeafMain: "#8f7e6a",
      treeLeafLight: "#a49684",
      treeLeafDark: "#6f5f50",
    };
  }

  if (game.score >= 25) {
    return {
      name: "autumn",
      skyTop: "#f3b06e",
      skyMid: "#f7cf99",
      skyBottom: "#fff0d7",
      cloud: "#fff7ed",
      hillTop: "#d4a66c",
      hillBottom: "#ba8453",
      grassBase: "#b67d3f",
      grassLight: "#c98f48",
      grassDark: "#99662f",
      grassBlade: "#e0aa5c",
      pathEdge: "#d3b07c",
      pathEdgeAlt: "#c59a64",
      pathEdgeHighlight: "#efd3a5",
      pathBase: "#be8c59",
      pathTileA: "#cb9a68",
      pathTileB: "#b78553",
      pathPebble: "#996b42",
      flowerBed: "#9a6532",
      flower1: "#d95c32",
      flower2: "#f0b44e",
      treeTrunk: "#6a4729",
      treeLeafMain: "#d9702f",
      treeLeafLight: "#eba34f",
      treeLeafDark: "#9d4d22",
    };
  }

  return {
    name: "summer",
    skyTop: "#93d7ff",
    skyMid: "#d8f3ff",
    skyBottom: "#f8fcff",
    cloud: "#fbffff",
    hillTop: "#9fc98d",
    hillBottom: "#82b66d",
    grassBase: "#7ec86f",
    grassLight: "#77be66",
    grassDark: "#6ab45a",
    grassBlade: "#5aa24d",
    pathEdge: "#c4d67f",
    pathEdgeAlt: "#b6cb6a",
    pathEdgeHighlight: "#dce996",
    pathBase: "#d6b986",
    pathTileA: "#d7bb86",
    pathTileB: "#ccb078",
    pathPebble: "#c19a67",
    flowerBed: "#8dbb5c",
    flower1: "#ea6c86",
    flower2: "#f5df69",
    treeTrunk: "#71512f",
    treeLeafMain: "#2f8e4d",
    treeLeafLight: "#46ac63",
    treeLeafDark: "#24733d",
  };
}

function drawGrassTiles(x, y, width, height, size, season) {
  for (let row = 0; row < height; row += size) {
    for (let col = 0; col < width; col += size) {
      ctx.fillStyle = (row / size + col / size) % 2 === 0 ? season.grassLight : season.grassDark;
      ctx.fillRect(x + col, y + row, size, size);
      ctx.fillStyle = season.grassBlade;
      ctx.fillRect(x + col + 4, y + row + 6, 3, 6);
      ctx.fillRect(x + col + 9, y + row + 4, 3, 8);
    }
  }
}

function drawPathEdge(scroll, season) {
  for (let x = -24; x < canvas.width + 24; x += 24) {
    ctx.fillStyle = ((x + scroll) / 24) % 2 === 0 ? season.pathEdgeAlt : season.pathEdge;
    ctx.fillRect(x + scroll, 386, 24, 10);
    ctx.fillStyle = season.pathEdgeHighlight;
    ctx.fillRect(x + scroll, 396, 24, 4);
  }
}

function drawPathTiles(scroll, season) {
  for (let y = groundY + 8; y < canvas.height; y += 20) {
    for (let x = -24; x < canvas.width + 24; x += 24) {
      ctx.fillStyle = (Math.floor((x + scroll) / 24) + Math.floor(y / 20)) % 2 === 0 ? season.pathTileA : season.pathTileB;
      ctx.fillRect(x + scroll, y, 24, 20);
      ctx.fillStyle = season.pathPebble;
      ctx.fillRect(x + scroll + 4, y + 5, 5, 5);
      ctx.fillRect(x + scroll + 14, y + 11, 4, 4);
    }
  }
}

function drawFence(x, y) {
  ctx.fillStyle = "#8c6239";
  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(x + i * 18, y, 6, 28);
  }
  ctx.fillRect(x - 6, y + 6, 76, 6);
  ctx.fillRect(x - 6, y + 18, 76, 6);
}

function drawFlowerBed(x, y, season) {
  ctx.fillStyle = season.flowerBed;
  ctx.fillRect(x, y, 54, 24);
  ctx.fillStyle = season.flower1;
  ctx.fillRect(x + 6, y + 6, 6, 6);
  ctx.fillRect(x + 22, y + 10, 6, 6);
  ctx.fillRect(x + 38, y + 6, 6, 6);
  ctx.fillStyle = season.flower2;
  ctx.fillRect(x + 14, y + 12, 6, 6);
  ctx.fillRect(x + 30, y + 4, 6, 6);
}

function drawCloud(x, y, scale) {
  ctx.fillRect(x, y, 36 * scale, 22 * scale);
  ctx.fillRect(x + 18 * scale, y - 12 * scale, 34 * scale, 20 * scale);
  ctx.fillRect(x + 42 * scale, y - 4 * scale, 34 * scale, 22 * scale);
  ctx.fillRect(x + 66 * scale, y + 4 * scale, 24 * scale, 16 * scale);
}

function drawHouse(x, y, wallColor, roofColor) {
  ctx.fillStyle = "#7a8a90";
  ctx.fillRect(x - 4, y + 68, 116, 16);
  ctx.fillStyle = roofColor;
  ctx.fillRect(x + 6, y - 18, 88, 26);
  ctx.fillStyle = "#9b322e";
  ctx.fillRect(x + 14, y - 10, 72, 10);
  ctx.fillStyle = wallColor;
  ctx.fillRect(x, y, 100, 70);
  ctx.fillStyle = "#d3c3a0";
  ctx.fillRect(x + 8, y + 8, 84, 54);
  ctx.fillStyle = "#6ea7d7";
  ctx.fillRect(x + 14, y + 18, 18, 18);
  ctx.fillRect(x + 68, y + 18, 18, 18);
  ctx.fillStyle = "#4a7cab";
  ctx.fillRect(x + 18, y + 22, 10, 10);
  ctx.fillRect(x + 72, y + 22, 10, 10);
  ctx.fillStyle = "#9f6f49";
  ctx.fillRect(x + 40, y + 34, 20, 28);
  ctx.fillStyle = "#805736";
  ctx.fillRect(x + 46, y + 40, 4, 22);
}

function drawLab(x, y) {
  ctx.fillStyle = "#7e8f99";
  ctx.fillRect(x - 8, y + 78, 146, 14);
  ctx.fillStyle = "#d6dfe6";
  ctx.fillRect(x, y + 10, 128, 68);
  ctx.fillStyle = "#7b8da2";
  ctx.fillRect(x + 14, y - 8, 100, 24);
  ctx.fillStyle = "#5c6f86";
  ctx.fillRect(x + 24, y, 80, 8);
  ctx.fillStyle = "#9cc2e6";
  ctx.fillRect(x + 18, y + 24, 24, 20);
  ctx.fillRect(x + 50, y + 24, 24, 20);
  ctx.fillRect(x + 82, y + 24, 24, 20);
  ctx.fillStyle = "#85add4";
  ctx.fillRect(x + 22, y + 28, 16, 12);
  ctx.fillRect(x + 54, y + 28, 16, 12);
  ctx.fillRect(x + 86, y + 28, 16, 12);
  ctx.fillStyle = "#8a6647";
  ctx.fillRect(x + 54, y + 46, 20, 32);
}

function drawTree(x, y, scale, season) {
  ctx.fillStyle = season.treeTrunk;
  ctx.fillRect(x + 20 * scale, y + 40 * scale, 12 * scale, 30 * scale);
  ctx.fillStyle = season.treeLeafMain;
  ctx.fillRect(x + 6 * scale, y + 12 * scale, 40 * scale, 18 * scale);
  ctx.fillRect(x, y + 24 * scale, 52 * scale, 16 * scale);
  ctx.fillStyle = season.treeLeafLight;
  ctx.fillRect(x + 10 * scale, y, 32 * scale, 18 * scale);
  ctx.fillRect(x + 6 * scale, y + 18 * scale, 40 * scale, 10 * scale);
  if (season.name !== "winter") {
    ctx.fillStyle = season.treeLeafDark;
    ctx.fillRect(x + 2 * scale, y + 30 * scale, 12 * scale, 8 * scale);
    ctx.fillRect(x + 38 * scale, y + 30 * scale, 10 * scale, 8 * scale);
  } else {
    ctx.fillStyle = season.treeLeafDark;
    ctx.fillRect(x + 14 * scale, y + 10 * scale, 4 * scale, 22 * scale);
    ctx.fillRect(x + 30 * scale, y + 10 * scale, 4 * scale, 22 * scale);
    ctx.fillRect(x + 10 * scale, y + 18 * scale, 28 * scale, 4 * scale);
  }
}

function roundedRectPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPlayer() {
  const x = player.x;
  const y = player.y;
  const bounce = player.jumping ? -7 : Math.sin(game.frame * 0.18) * 2;

  ctx.save();
  ctx.translate(x, y + bounce);

  ctx.fillStyle = "rgba(64, 67, 92, 0.22)";
  ctx.beginPath();
  ctx.ellipse(50, 100, 32, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  if (pikachuImageLoaded) {
    ctx.drawImage(pikachuImage, -4, -8, 120, 120);
  } else {
    ctx.fillStyle = "#f7df81";
    ctx.beginPath();
    ctx.ellipse(48, 50, 30, 36, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(44, 24, 24, 20, -0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#de6b5b";
    ctx.beginPath();
    ctx.arc(20, 35, 8, 0, Math.PI * 2);
    ctx.arc(58, 38, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawBush(obstacle) {
  if (obstacle.variant && bushImageLoaded[obstacle.variant]) {
    ctx.drawImage(
      bushImages[obstacle.variant],
      obstacle.x - 4,
      obstacle.y - 4,
      obstacle.width + 10,
      obstacle.height + 8
    );
    return;
  }

  ctx.fillStyle = "#2d9248";
  ctx.fillRect(obstacle.x + 10, obstacle.y + 18, 16, 28);
  ctx.fillRect(obstacle.x + 24, obstacle.y + 8, 20, 36);
  ctx.fillRect(obstacle.x + 42, obstacle.y + 6, 22, 38);
  ctx.fillRect(obstacle.x + 60, obstacle.y + 18, 14, 24);
  ctx.fillStyle = "#1f7234";
  ctx.fillRect(obstacle.x + 16, obstacle.y + 34, 48, 12);
  ctx.fillRect(obstacle.x + 30, obstacle.y + 20, 18, 8);
}

function drawBoulder(obstacle) {
  if (boulderImageLoaded) {
    ctx.drawImage(boulderImage, obstacle.x - 2, obstacle.y - 4, obstacle.width + 6, obstacle.height + 6);
    return;
  }

  ctx.fillStyle = "#888d97";
  ctx.fillRect(obstacle.x + 8, obstacle.y + 16, 52, 38);
  ctx.fillRect(obstacle.x + 16, obstacle.y + 8, 36, 12);
  ctx.fillStyle = "#70757f";
  ctx.fillRect(obstacle.x + 18, obstacle.y + 24, 14, 8);
  ctx.fillRect(obstacle.x + 36, obstacle.y + 36, 12, 8);
  ctx.fillRect(obstacle.x + 42, obstacle.y + 18, 10, 6);
}

function drawGhastly(obstacle) {
  ctx.save();
  ctx.translate(obstacle.x, obstacle.y);

  if (gastlyImageLoaded) {
    ctx.drawImage(gastlyImage, -6, -8, 86, 86);
    ctx.restore();
    return;
  }

  ctx.fillStyle = "rgba(170, 132, 187, 0.88)";
  for (const puff of [
    [14, 16, 8],
    [26, 10, 10],
    [40, 8, 9],
    [54, 16, 8],
    [60, 30, 8],
    [56, 45, 8],
    [44, 56, 8],
    [28, 58, 9],
    [14, 50, 8],
    [8, 34, 8],
  ]) {
    ctx.beginPath();
    ctx.arc(puff[0], puff[1], puff[2], 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(162, 120, 180, 0.75)";
  for (const puff of [
    [20, 18, 7],
    [34, 12, 8],
    [48, 18, 7],
    [52, 42, 7],
    [36, 50, 8],
    [20, 44, 7],
  ]) {
    ctx.beginPath();
    ctx.arc(puff[0], puff[1], puff[2], 0, Math.PI * 2);
    ctx.fill();
  }

  const orb = ctx.createRadialGradient(26, 18, 4, 36, 34, 28);
  orb.addColorStop(0, "#3a3030");
  orb.addColorStop(0.55, "#161010");
  orb.addColorStop(1, "#090707");
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.arc(36, 34, 26, 0, Math.PI * 2);
  ctx.fill();

  const shine = ctx.createRadialGradient(24, 18, 2, 26, 16, 18);
  shine.addColorStop(0, "rgba(255,255,255,0.28)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.arc(28, 18, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(12, 22);
  ctx.quadraticCurveTo(20, 10, 34, 16);
  ctx.lineTo(25, 44);
  ctx.quadraticCurveTo(16, 40, 12, 22);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(60, 22);
  ctx.quadraticCurveTo(52, 10, 38, 16);
  ctx.lineTo(47, 44);
  ctx.quadraticCurveTo(56, 40, 60, 22);
  ctx.fill();

  ctx.fillStyle = "#141111";
  ctx.beginPath();
  ctx.arc(20, 28, 1.8, 0, Math.PI * 2);
  ctx.arc(52, 28, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d0a0b5";
  ctx.beginPath();
  ctx.moveTo(25, 47);
  ctx.quadraticCurveTo(36, 56, 47, 47);
  ctx.quadraticCurveTo(37, 53, 25, 47);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(24, 46);
  ctx.lineTo(28, 46);
  ctx.lineTo(24, 54);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(44, 46);
  ctx.lineTo(48, 46);
  ctx.lineTo(46, 54);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#110d0d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(36, 34, 26, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawBerry(item) {
  ctx.save();
  ctx.translate(item.x, item.y);

  const berryImage = berryImages[item.berryStyle];
  if (berryImage?.complete && berryImage.naturalWidth > 0) {
    ctx.drawImage(berryImage, 0, 0, item.width, item.height);
    ctx.restore();
    return;
  }

  if (item.berryStyle === "oran") {
    ctx.fillStyle = "#3c2b2a";
    ctx.beginPath();
    ctx.arc(18, 18, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a88d6";
    ctx.beginPath();
    ctx.arc(18, 18, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5fa4e4";
    ctx.beginPath();
    ctx.arc(14, 14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2e6eb3";
    ctx.beginPath();
    ctx.arc(25, 22, 2.5, 0, Math.PI * 2);
    ctx.arc(12, 24, 2, 0, Math.PI * 2);
    ctx.arc(19, 28, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7cc06c";
    ctx.beginPath();
    ctx.arc(18, 5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4e8d48";
    ctx.beginPath();
    ctx.arc(18, 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (item.berryStyle === "sitrus") {
    ctx.fillStyle = "#a96c1f";
    ctx.beginPath();
    ctx.moveTo(17, 2);
    ctx.lineTo(21, 2);
    ctx.lineTo(20, 10);
    ctx.lineTo(16, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d9ac2b";
    ctx.beginPath();
    ctx.arc(18, 18, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f1de61";
    ctx.beginPath();
    ctx.arc(18, 17, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#bad15c";
    for (const seed of [
      [13, 12, 3],
      [22, 13, 2.5],
      [12, 22, 2.5],
      [23, 23, 3],
      [18, 27, 2],
    ]) {
      ctx.beginPath();
      ctx.arc(seed[0], seed[1], seed[2], 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#5cb04d";
    ctx.beginPath();
    ctx.ellipse(14, 6, 5, 3, -0.5, 0, Math.PI * 2);
    ctx.ellipse(22, 6, 5, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (item.berryStyle === "lum") {
    ctx.fillStyle = "#3f2f1d";
    ctx.beginPath();
    ctx.arc(18, 18, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d9d951";
    ctx.beginPath();
    ctx.arc(18, 18, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#eff07b";
    ctx.beginPath();
    ctx.arc(14, 13, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#97b34a";
    ctx.lineWidth = 3;
    for (const ring of [
      [12, 12, 4],
      [22, 12, 3.5],
      [11, 23, 3],
      [22, 23, 4],
      [18, 18, 4],
    ]) {
      ctx.beginPath();
      ctx.arc(ring[0], ring[1], ring[2], 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#8f7340";
    ctx.fillRect(16, 0, 4, 10);
    ctx.restore();
    return;
  }

  const isPecha = item.berryStyle === "pecha";
  const bodyColor = isPecha ? "#ef96bc" : "#e99372";
  const bodyHighlight = isPecha ? "#f7b5d3" : "#f4c0a6";
  const outlineColor = isPecha ? "#8f4b43" : "#9a533f";
  const leafColor = "#7ac260";
  const leafShade = "#4d9447";

  ctx.fillStyle = outlineColor;
  ctx.beginPath();
  ctx.moveTo(9, 8);
  ctx.quadraticCurveTo(19, 2, 28, 9);
  ctx.quadraticCurveTo(34, 18, 30, 30);
  ctx.quadraticCurveTo(22, 35, 13, 31);
  ctx.quadraticCurveTo(5, 24, 9, 8);
  ctx.fill();

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(11, 10);
  ctx.quadraticCurveTo(20, 4, 27, 10);
  ctx.quadraticCurveTo(31, 18, 28, 28);
  ctx.quadraticCurveTo(21, 33, 14, 29);
  ctx.quadraticCurveTo(8, 23, 11, 10);
  ctx.fill();

  ctx.fillStyle = bodyHighlight;
  ctx.beginPath();
  ctx.ellipse(18, 14, 7, 5, -0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = isPecha ? "#b15f7f" : "#bd6e58";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, 24);
  ctx.quadraticCurveTo(28, 26, 27, 29);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(21, 28);
  ctx.quadraticCurveTo(25, 30, 24, 32);
  ctx.stroke();

  ctx.fillStyle = leafColor;
  ctx.beginPath();
  ctx.ellipse(11, 8, 5, 7, -0.8, 0, Math.PI * 2);
  ctx.ellipse(18, 5, 5, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(25, 8, 5, 7, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = leafShade;
  ctx.beginPath();
  ctx.ellipse(11, 8, 2, 4, -0.8, 0, Math.PI * 2);
  ctx.ellipse(18, 5, 2, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(25, 8, 2, 4, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawKetchup(item) {
  ctx.save();
  ctx.translate(item.x, item.y);

  if (ketchupImageLoaded) {
    ctx.drawImage(ketchupImage, 2, 0, 38, 52);
    ctx.restore();
    return;
  }

  ctx.strokeStyle = "#2e2626";
  ctx.lineWidth = 3;

  ctx.fillStyle = "#d74f4f";
  roundedRectPath(12, 14, 18, 30, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#d74f4f";
  roundedRectPath(15, 8, 12, 12, 5);
  ctx.fill();
  ctx.stroke();

  roundedRectPath(18, 0, 6, 12, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  roundedRectPath(16, 18, 3, 14, 2);
  ctx.fill();
  ctx.restore();
}

function drawCollectibles() {
  game.collectibles.forEach((item) => {
    if (item.kind === "berry") {
      drawBerry(item);
    } else {
      drawKetchup(item);
    }
  });
}

function drawObstacles() {
  game.obstacles.forEach((obstacle) => {
    if (obstacle.kind === "bush") {
      drawBush(obstacle);
    } else if (obstacle.kind === "boulder") {
      drawBoulder(obstacle);
    } else {
      drawGhastly(obstacle);
    }
  });
}

function drawGameOver() {
  if (!game.gameOver) {
    return;
  }

  ctx.fillStyle = "rgba(24, 49, 83, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff7dd";
  roundedRectPath(canvas.width / 2 - 220, 132, 440, 196, 22);
  ctx.fill();
  ctx.strokeStyle = "#183153";
  ctx.lineWidth = 6;
  ctx.stroke();

  const headlineLines =
    game.gameOverMessage === "Pikachu is unable to battle!"
      ? ["PIKACHU IS UNABLE", "TO BATTLE!"]
      : ["PIKACHU FAINTED!"];

  headlineLines.forEach((line, index) => {
    drawPixelText(line, canvas.width / 2, 170 + index * 28, 3, "#183153", "center");
  });

  drawPixelText(`FINAL SCORE: ${game.score}`, canvas.width / 2, 242, 3, "#183153", "center");
  drawPixelText("JUMP AGAIN TO RESTART.", canvas.width / 2, 280, 3, "#183153", "center");
}

function drawConfetti() {
  game.confetti.forEach((piece) => {
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
    ctx.restore();
  });
}

function drawWinOverlay() {
  if (!game.gameWon) {
    return;
  }

  ctx.fillStyle = "rgba(24, 49, 83, 0.58)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff7dd";
  roundedRectPath(canvas.width / 2 - 230, 52, 460, 196, 22);
  ctx.fill();
  ctx.strokeStyle = "#183153";
  ctx.lineWidth = 6;
  ctx.stroke();

  drawConfetti();
  drawPixelText("PIKACHU GREW TO", canvas.width / 2, 92, 3, "#183153", "center");
  drawPixelText("LEVEL 67!", canvas.width / 2, 126, 3, "#183153", "center");

  ctx.fillStyle = "#ffcf58";
  roundedRectPath(game.winButton.x, game.winButton.y, game.winButton.width, game.winButton.height, 12);
  ctx.fill();
  ctx.strokeStyle = "#183153";
  ctx.lineWidth = 4;
  ctx.stroke();
  drawPixelText("PLAY AGAIN", canvas.width / 2, 224, 2, "#183153", "center");
}

function measurePixelText(text, scale) {
  return text.length * 6 * scale - scale;
}

function drawPixelText(text, x, y, scale, color, align = "left") {
  const upper = text.toUpperCase();
  const width = measurePixelText(upper, scale);
  let startX = x;
  if (align === "center") {
    startX = x - width / 2;
  } else if (align === "right") {
    startX = x - width;
  }

  ctx.fillStyle = color;
  for (let i = 0; i < upper.length; i += 1) {
    const glyph = pixelFont[upper[i]] || pixelFont[" "];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < glyph[row].length; col += 1) {
        if (glyph[row][col] === "1") {
          ctx.fillRect(startX + i * 6 * scale + col * scale, y + row * scale, scale, scale);
        }
      }
    }
  }
}

function drawScoreHud() {
  const boxWidth = 198;
  const boxHeight = 52;
  const x = canvas.width - boxWidth - 24;
  const y = 24;
  const scoreLabel = `SCORE: ${game.score}`;
  const maxTextWidth = boxWidth - 28;
  const scoreScale = measurePixelText(scoreLabel, 3) <= maxTextWidth ? 3 : 2;

  ctx.fillStyle = "rgba(255, 252, 239, 0.95)";
  roundedRectPath(x, y, boxWidth, boxHeight, 12);
  ctx.fill();
  ctx.strokeStyle = "#183153";
  ctx.lineWidth = 4;
  ctx.stroke();

  drawPixelText(scoreLabel, x + boxWidth - 14, y + (scoreScale === 3 ? 16 : 20), scoreScale, "#183153", "right");
}

function getObstacleHitbox(obstacle) {
  if (obstacle.kind === "bush") {
    return {
      x: obstacle.x + 14,
      y: obstacle.y + 18,
      width: obstacle.width - 30,
      height: obstacle.height - 24,
    };
  }

  if (obstacle.kind === "boulder") {
    return {
      x: obstacle.x + 16,
      y: obstacle.y + 16,
      width: obstacle.width - 28,
      height: obstacle.height - 20,
    };
  }

  return {
    x: obstacle.x + 10,
    y: obstacle.y + 10,
    width: obstacle.width - 20,
    height: obstacle.height - 18,
  };
}

function render() {
  syncWinGifVisibility();
  drawBackground();
  drawCollectibles();
  drawObstacles();
  drawPlayer();
  drawScoreHud();
  drawGameOver();
  drawWinOverlay();
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

resetGame();
loop();
