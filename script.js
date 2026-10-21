="use strict";

// ===== Constants =====
const MAX_HEALTH = 30;
const FINAL_ROOM = 8;
const POTION_HEAL = 12;

// ===== Enemies =====
const enemies = [
  {
    name: "Cave Goblin",
    icon: "👺",
    health: 10,
    damage: 4,
    gold: 5
  },
  {
    name: "Skeleton Guard",
    icon: "💀",
    health: 12,
    damage: 5,
    gold: 7
  },
  {
    name: "Shadow Beast",
    icon: "👹",
    health: 15,
    damage: 6,
    gold: 9
  },
  {
    name: "Cursed Knight",
    icon: "🛡️",
    health: 18,
    damage: 7,
    gold: 12
  }
];

const boss = {
  name: "The Dungeon Overlord",
  icon: "🐉",
  health: 28,
  damage: 7,
  gold: 50,
  isBoss: true
};

// ===== Game State =====
let player;
let currentEnemy;
let gameOver;
let victory;
let eventHistory;

// ===== Elements =====
const elements = {
  healthText: document.getElementById("health-text"),
  healthBar: document.getElementById("health-bar"),
  goldText: document.getElementById("gold-text"),
  potionText: document.getElementById("potion-text"),
  inventoryText: document.getElementById("inventory-text"),
  roomText: document.getElementById("room-text"),

  sceneIcon: document.getElementById("scene-icon"),
  sceneLabel: document.getElementById("scene-label"),
  sceneTitle: document.getElementById("scene-title"),
  sceneDescription: document.getElementById("scene-description"),

  enemyCard: document.getElementById("enemy-card"),
  enemyName: document.getElementById("enemy-name"),
  enemyIcon: document.getElementById("enemy-icon"),
  enemyHealthText: document.getElementById("enemy-health-text"),
  enemyHealthBar: document.getElementById("enemy-health-bar"),

  exploreButton: document.getElementById("explore-btn"),
  attackButton: document.getElementById("attack-btn"),
  potionButton: document.getElementById("potion-btn"),
  fleeButton: document.getElementById("flee-btn"),
  restartButton: document.getElementById("restart-btn"),

  actionHint: document.getElementById("action-hint"),
  eventLog: document.getElementById("event-log")
};

// ===== Initialize =====
function startGame() {
  player = {
    health: MAX_HEALTH,
    gold: 0,
    potions: 3,
    room: 1,
    treasures: 0
  };

  currentEnemy = null;
  gameOver = false;
  victory = false;
  eventHistory = [];

  updateScene(
    "🏰",
    "THE ENTRANCE",
    "The dungeon awaits.",
    "Take a breath, check your supplies and begin your adventure."
  );

  addLog("Your adventure begins.");
  addLog("You packed 3 healing potions.");

  renderGame();
}

// ===== Scene =====
function updateScene(icon, label, title, description) {
  elements.sceneIcon.textContent = icon;
  elements.sceneLabel.textContent = label;
  elements.sceneTitle.textContent = title;
  elements.sceneDescription.textContent = description;
}

// ===== Journal =====
function addLog(message) {
  eventHistory.unshift(message);

  if (eventHistory.length > 8) {
    eventHistory.pop();
  }

  elements.eventLog.innerHTML = "";

  eventHistory.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "log-entry";
    li.textContent = entry;
    elements.eventLog.appendChild(li);
  });
}

// ===== UI =====
function renderGame() {
  const healthPercent =
    (player.health / MAX_HEALTH) * 100;

  elements.healthText.textContent =
    `${player.health} / ${MAX_HEALTH}`;

  elements.healthBar.style.width =
    `${healthPercent}%`;

  elements.goldText.textContent = player.gold;
  elements.potionText.textContent = player.potions;

  elements.roomText.textContent =
    `Room ${player.room} / ${FINAL_ROOM}`;

  const inventory = [];

  if (player.treasures > 0) {
    inventory.push(
      `💎 Treasures: ${player.treasures}`
    );
  }

  inventory.push(
    `🧪 Potions: ${player.potions}`
  );

  elements.inventoryText.textContent =
    inventory.join(" • ");

  if (currentEnemy) {
    elements.enemyCard.hidden = false;

    const enemyPercent =
      (currentEnemy.health /
        currentEnemy.maxHealth) *
      100;

    elements.enemyName.textContent =
      currentEnemy.name;

    elements.enemyIcon.textContent =
      currentEnemy.icon;

    elements.enemyHealthText.textContent =
      `${currentEnemy.health} / ${currentEnemy.maxHealth}`;

    elements.enemyHealthBar.style.width =
      `${enemyPercent}%`;
  } else {
    elements.enemyCard.hidden = true;
  }

  elements.exploreButton.hidden =
    currentEnemy || gameOver;

  elements.attackButton.hidden =
    !currentEnemy || gameOver;

  elements.fleeButton.hidden =
    !currentEnemy ||
    gameOver ||
    currentEnemy?.isBoss;

  elements.restartButton.hidden =
    !gameOver;

  elements.potionButton.hidden =
    gameOver;

  elements.potionButton.disabled =
    player.potions <= 0 ||
    player.health >= MAX_HEALTH;

  if (gameOver) {
    elements.actionHint.textContent =
      victory
        ? "You conquered the dungeon!"
        : "Your adventure has ended.";
  } else if (currentEnemy) {
    elements.actionHint.textContent =
      "Fight, use a potion, or retreat.";
  } else {
    elements.actionHint.textContent =
      "Explore the dungeon.";
  }
}

// ===== Exploration =====
function explore() {
  if (gameOver || currentEnemy) return;

  if (player.room < FINAL_ROOM) {
    player.room++;
  }

  if (player.room === FINAL_ROOM) {
    startBossFight();
    return;
  }

  const roll = Math.random();

  if (roll < 0.45) {
    startFight();
  } else if (roll < 0.7) {
    findTreasure();
  } else if (roll < 0.85) {
    findPotion();
  } else {
    findSafeRoom();
  }

  renderGame();
}

function startFight() {
  const template =
    enemies[
      Math.floor(
        Math.random() * enemies.length
      )
    ];

  currentEnemy = {
    ...template,
    maxHealth: template.health
  };

  updateScene(
    "⚠️",
    "ENCOUNTER",
    `${currentEnemy.name} appears!`,
    "A monster blocks your path."
  );

  addLog(
    `${currentEnemy.name} appears!`
  );
}

function startBossFight() {
  currentEnemy = {
    ...boss,
    maxHealth: boss.health
  };

  updateScene(
    "🐉",
    "FINAL ROOM",
    "The Overlord awakens!",
    "Defeat the Overlord to win."
  );

  addLog(
    "The Dungeon Overlord appears!"
  );

  renderGame();
}

function findTreasure() {
  const reward =
    Math.floor(Math.random() * 11) + 5;

  player.gold += reward;
  player.treasures++;

  updateScene(
    "💎",
    "TREASURE",
    "Hidden Treasure!",
    `You found ${reward} gold.`
  );

  addLog(
    `You found ${reward} gold.`
  );
}

function findPotion() {
  player.potions++;

  updateScene(
    "🧪",
    "SUPPLY CACHE",
    "Potion Found!",
    "You found a healing potion."
  );

  addLog(
    "You found a healing potion."
  );
}

function findSafeRoom() {
  const heal =
    Math.min(
      5,
      MAX_HEALTH - player.health
    );

  player.health += heal;

  updateScene(
    "🕯️",
    "SAFE ROOM",
    "A quiet room.",
    heal > 0
      ? `Recovered ${heal} health.`
      : "Already fully healed."
  );

  addLog(
    heal > 0
      ? `Recovered ${heal} health.`
      : "You rested."
  );
}

// ===== Combat =====
function attack() {
  if (!currentEnemy || gameOver) return;

  const damage =
    Math.floor(Math.random() * 5) + 4;

  currentEnemy.health -= damage;

  addLog(
    `You dealt ${damage} damage to ${currentEnemy.name}.`
  );

  if (currentEnemy.health <= 0) {
    defeatEnemy();
    renderGame();
    return;
  }

  enemyAttack();

  renderGame();
}

function enemyAttack() {
  const damage =
    currentEnemy.damage +
    Math.floor(Math.random() * 3);

  player.health -= damage;

  if (player.health < 0) {
    player.health = 0;
  }

  addLog(
    `${currentEnemy.name} hit you for ${damage} damage.`
  );

  if (player.health <= 0) {
    endGame(false);
  }
}

function defeatEnemy() {
  player.gold += currentEnemy.gold;

  addLog(
    `You defeated ${currentEnemy.name} and gained ${currentEnemy.gold} gold.`
  );

  updateScene(
    currentEnemy.isBoss
      ? "🏆"
      : "⚔️",
    currentEnemy.isBoss
      ? "VICTORY"
      : "DEFEATED",
    currentEnemy.isBoss
      ? "Dungeon Conquered!"
      : `${currentEnemy.name} defeated!`,
    currentEnemy.isBoss
      ? "The dungeon is yours."
      : "The path is clear."
  );

  const bossDefeated =
    currentEnemy.isBoss;

  currentEnemy = null;

  if (bossDefeated) {
    endGame(true);
  }
}

// ===== Potions =====
function usePotion() {
  if (gameOver) return;

  if (player.potions <= 0) {
    addLog("No potions left.");
    return;
  }

  if (player.health >= MAX_HEALTH) {
    addLog(
      "You already have full health."
    );
    return;
  }

  player.potions--;

  const oldHealth =
    player.health;

  player.health = Math.min(
    MAX_HEALTH,
    player.health + POTION_HEAL
  );

  const healed =
    player.health - oldHealth;

  addLog(
    `You restored ${healed} health.`
  );

  updateScene(
    "🧪",
    "HEALING",
    "Potion Used",
    `You recovered ${healed} health.`
  );

  if (currentEnemy) {
    enemyAttack();
  }

  renderGame();
}

// ===== Retreat =====
function retreat() {
  if (
    !currentEnemy ||
    currentEnemy.isBoss ||
    gameOver
  ) {
    return;
  }

  addLog(
    `You escaped from ${currentEnemy.name}.`
  );

  updateScene(
    "💨",
    "RETREAT",
    "You escaped!",
    "The monster remains somewhere in the dungeon."
  );

  currentEnemy = null;

  renderGame();
}

// ===== End Game =====
function endGame(win) {
  gameOver = true;
  victory = win;

  if (win) {
    addLog(
      `Victory! Final gold: ${player.gold}.`
    );
  } else {
    updateScene(
      "💀",
      "GAME OVER",
      "You have fallen.",
      `Final Gold: ${player.gold}`
    );

    addLog("Game Over.");
  }

  renderGame();
}

// ===== Events =====
elements.exploreButton.addEventListener(
  "click",
  explore
);

elements.attackButton.addEventListener(
  "click",
  attack
);

elements.potionButton.addEventListener(
  "click",
  usePotion
);

elements.fleeButton.addEventListener(
  "click",
  retreat
);

elements.restartButton.addEventListener(
  "click",
  startGame
);

// ===== Start =====
startGame();.
