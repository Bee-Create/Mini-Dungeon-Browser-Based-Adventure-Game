"use strict";

// ===== Game settings =====
const MAX_HEALTH = 30;
const FINAL_ROOM = 8;
const POTION_HEAL = 12;

const enemies = [
  { name: "Cave Goblin", icon: "👺", health: 10, damage: 4, gold: 5 },
  { name: "Skeleton Guard", icon: "💀", health: 12, damage: 5, gold: 7 },
  { name: "Shadow Beast", icon: "👹", health: 15, damage: 6, gold: 9 },
  { name: "Cursed Knight", icon: "🛡️", health: 18, damage: 7, gold: 12 }
];

const bossTemplate = {
  name: "The Dungeon Overlord",
  icon: "🐉",
  health: 28,
  damage: 7,
  gold: 50,
  isBoss: true
};

// ===== Player and game state =====
let player;
let currentEnemy;
let gameOver;
let victory;
let eventHistory;

// ===== HTML elements =====
const elements = {
  healthText: document.querySelector("#health-text"),
  healthBar: document.querySelector("#health-bar"),
  goldText: document.querySelector("#gold-text"),
  potionText: document.querySelector("#potion-text"),
  inventoryText: document.querySelector("#inventory-text"),
  roomText: document.querySelector("#room-text"),

  sceneIcon: document.querySelector("#scene-icon"),
  sceneLabel: document.querySelector("#scene-label"),
  sceneTitle: document.querySelector("#scene-title"),
  sceneDescription: document.querySelector("#scene-description"),

  enemyCard: document.querySelector("#enemy-card"),
  enemyName: document.querySelector("#enemy-name"),
  enemyIcon: document.querySelector("#enemy-icon"),
  enemyHealthText: document.querySelector("#enemy-health-text"),
  enemyHealthBar: document.querySelector("#enemy-health-bar"),

  exploreButton: document.querySelector("#explore-btn"),
  attackButton: document.querySelector("#attack-btn"),
  potionButton: document.querySelector("#potion-btn"),
  fleeButton: document.querySelector("#flee-btn"),
  restartButton: document.querySelector("#restart-btn"),

  actionHint: document.querySelector("#action-hint"),
  eventLog: document.querySelector("#event-log")
};

// ===== Game setup =====
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
    "Take a breath, check your supplies, and begin your journey."
  );

  addLog("Your adventure begins at the dungeon entrance.");
  addLog("You packed 3 healing potions. Make them count.");

  renderGame();
}

// ===== Interface updates =====
function updateScene(icon, label, title, description) {
  elements.sceneIcon.textContent = icon;
  elements.sceneLabel.textContent = label;
  elements.sceneTitle.textContent = title;
  elements.sceneDescription.textContent = description;
}

function addLog(message) {
  eventHistory.unshift(message);
  eventHistory = eventHistory.slice(0, 8);

  elements.eventLog.replaceChildren();

  eventHistory.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "log-entry";
    item.textContent = entry;
    elements.eventLog.append(item);
  });
}

function renderGame() {
  const healthPercent = (player.health / MAX_HEALTH) * 100;

  elements.healthText.textContent =
    `${player.health} / ${MAX_HEALTH}`;

  elements.healthBar.style.width = `${healthPercent}%`;
  elements.healthBar.style.background =
    healthPercent <= 30 ? "#f07886" :
    healthPercent <= 60 ? "#f3ca77" : "#71d6a0";

  elements.goldText.textContent = player.gold;
  elements.potionText.textContent = player.potions;
  elements.roomText.textContent =
    `Room ${player.room} / ${FINAL_ROOM}`;

  const inventoryItems = [];

  if (player.treasures > 0) {
    inventoryItems.push(`💎 Treasures found: ${player.treasures}`);
  }

  if (player.potions > 0) {
    inventoryItems.push(`🧪 Healing potions: ${player.potions}`);
  }

  elements.inventoryText.textContent = inventoryItems.length
    ? inventoryItems.join(" • ")
    : "Your bag is empty. Keep exploring!";

  elements.enemyCard.hidden = !currentEnemy;

  if (currentEnemy) {
    const enemyPercent =
      (currentEnemy.health / currentEnemy.maxHealth) * 100;

    elements.enemyName.textContent = currentEnemy.name;
    elements.enemyIcon.textContent = currentEnemy.icon;
    elements.enemyHealthText.textContent =
      `${currentEnemy.health} / ${currentEnemy.maxHealth}`;
    elements.enemyHealthBar.style.width = `${enemyPercent}%`;
  }

  elements.exploreButton.hidden = Boolean(currentEnemy) || gameOver;
  elements.attackButton.hidden = !currentEnemy || gameOver;
  elements.fleeButton.hidden =
    !currentEnemy || gameOver || currentEnemy.isBoss;
  elements.potionButton.hidden = gameOver;
  elements.restartButton.hidden = !gameOver;

  elements.potionButton.disabled =
    player.potions <= 0 || player.health === MAX_HEALTH;

  if (gameOver) {
    elements.actionHint.textContent = victory
      ? "You conquered the dungeon! Start a new adventure?"
      : "Your adventure has ended. Ready to try again?";

    elements.statusDot?.classList?.add("inactive");
  } else if (currentEnemy) {
    elements.actionHint.textContent = currentEnemy.isBoss
      ? "This is the final battle. Defeat the Overlord to win!"
      : "Fight back, use a potion, or retreat to survive.";
  } else {
    elements.actionHint.textContent =
      "Explore to discover the next room. Keep an eye on your health.";
  }
}

// ===== Exploration =====
function explore() {
  if (gameOver || currentEnemy) return;

  if (player.room < FINAL_ROOM) {
    player.room++;
  }

  if (player.room === FINAL_ROOM) {
    beginBossFight();
    return;
  }

  const roll = Math.random();

  if (roll < 0.45) {
    beginRandomFight();
  } else if (roll < 0.70) {
    findTreasure();
  } else if (roll < 0.85) {
    findPotion();
  } else {
    findQuietRoom();
  }

  renderGame();
}

function beginRandomFight() {
  const template = enemies[
    Math.floor(Math.random() * enemies.length)
  ];

  currentEnemy = {
    ...template,
    maxHealth: template.health
  };

  updateScene(
    "⚠️",
    "ENCOUNTER",
    `${currentEnemy.name} appears!`,
    "A hostile creature blocks your path. Choose your next move carefully."
  );

  addLog(`${currentEnemy.name} blocks your path!`);
}

function beginBossFight() {
  currentEnemy = {
    ...bossTemplate,
    maxHealth: bossTemplate.health
  };

  updateScene(
    "🐉",
    "FINAL ROOM",
    "The Overlord awakens!",
    "You've reached the heart of the dungeon. Defeat the Overlord to claim victory."
  );

  addLog("The Dungeon Overlord emerges for the final battle!");
  renderGame();
}

function findTreasure() {
  const reward = Math.floor(Math.random() * 11) + 5;

  player.gold += reward;
  player.treasures++;

  updateScene(
    "💎",
    "TREASURE FOUND",
    "A hidden treasure!",
    `You discover a stash containing ${reward} gold coins. Not a bad find!`
  );

  addLog(`You found treasure and collected ${reward} gold.`);
}

function findPotion() {
  player.potions++;

  updateScene(
    "🧪",
    "SUPPLY CACHE",
    "A healing potion!",
    "You discover a potion tucked away in the shadows. Add it to your supplies."
  );

  addLog("You found a healing potion.");
}

function findQuietRoom() {
  const healing = Math.min(5, MAX_HEALTH - player.health);
  player.health += healing;

  updateScene(
    "🕯️",
    "SAFE ROOM",
    "A moment of peace.",
    healing > 0
      ? `The room is quiet. You rest and recover ${healing} health.`
      : "The room is quiet, but you're already at full health. Time to move on."
  );

  addLog(
    healing > 0
      ? `You rested and recovered ${healing} health.`
      : "You found a quiet room and caught your breath."
  );
}

// ===== Combat =====
function attack() {
  if (gameOver || !currentEnemy) return;

  const damage = Math.floor(Math.random() * 5) + 4;
  currentEnemy.health = Math.max(0, currentEnemy.health - damage);

  addLog(`You hit ${currentEnemy.name} for ${damage} damage.`);

  if (currentEnemy.health <= 0) {
    defeatEnemy();
    renderGame();
    return;
  }

  enemyCounterattack();
  renderGame();
}

function enemyCounterattack() {
  const damage = Math.floor(Math.random() * 3) + currentEnemy.damage;

  player.health = Math.max(0, player.health - damage);

  addLog(`${currentEnemy.name} strikes you for ${damage} damage.`);

  if (player.health <= 0) {
    endGame(false);
  }
}

function defeatEnemy() {
  const defeated = currentEnemy;
  player.gold += defeated.gold;

  updateScene(
    defeated.isBoss ? "🏆" : "⚔️",
    defeated.isBoss ? "VICTORY" : "ENEMY DEFEATED",
    defeated.isBoss ? "The dungeon is yours!" : `${defeated.name} defeated!`,
    defeated.isBoss
      ? `You defeated the Overlord, collected ${defeated.gold} gold, and conquered the dungeon.`
      : `You earned ${defeated.gold} gold. Catch your breath before continuing.`
  );

  addLog(
    `You defeated ${defeated.name} and earned ${defeated.gold} gold.`
  );

  currentEnemy = null;

  if (defeated.isBoss) {
    endGame(true);
  }
}

// ===== Items and retreat =====
function usePotion() {
  if (gameOver || player.potions <= 0) return;

  if (player.health === MAX_HEALTH) {
    addLog("You're already at full health. Save that potion!");
    renderGame();
    return;
  }

  const previousHealth = player.health;

  player.health = Math.min(
    MAX_HEALTH,
    player.health + POTION_HEAL
  );

  const healed = player.health - previousHealth;
  player.potions--;

  addLog(`You used a potion and restored ${healed} health.`);

  if (currentEnemy) {
    enemyCounterattack();
  } else {
    updateScene(
      "🧪",
      "ITEM USED",
      "A little recovery.",
      `You restored ${healed} health. Stay alert as you continue exploring.`
    );
  }

  renderGame();
}

function retreat() {
  if (gameOver || !currentEnemy || currentEnemy.isBoss) return;

  const escapedEnemy = currentEnemy.name;
  currentEnemy = null;

  updateScene(
    "💨",
    "TACTICAL RETREAT",
    "You escaped!",
    `You slipped away from ${escapedEnemy}. You can continue exploring, but the dungeon is still dangerous.`
  );

  addLog(`You retreated from ${escapedEnemy}.`);
  renderGame();
}

// ===== End of game =====
function endGame(didWin) {
  gameOver = true;
  victory = didWin;

  if (didWin) {
    addLog(`Dungeon conquered! Final gold: ${player.gold}.`);
  } else {
    updateScene(
      "💀",
      "GAME OVER",
      "Your adventure ends here.",
      `You reached room ${player.room} and collected ${player.gold} gold. The dungeon claims another adventurer.`
    );

    addLog("You ran out of health. The dungeon wins this time.");
  }

  renderGame();
}

// ===== Button events =====
elements.exploreButton.addEventListener("click", explore);
elements.attackButton.addEventListener("click", attack);
elements.potionButton.addEventListener("click", usePotion);
elements.fleeButton.addEventListener("click", retreat);
elements.restartButton.addEventListener("click", startGame);

// Start the game when the page loads.
startGame();
