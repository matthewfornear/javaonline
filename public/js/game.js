/**
 * Main Game class that integrates all modules and systems
 */
class Game {
    constructor() {
        this.world = null;
        this.scheduler = null;
        this.renderer = null;
        this.player = null;
        this.isRunning = false;
        this.gameOver = false;
        this.currentLevel = 1;
        this.messages = [];
        this.combatMessages = [];
        this.moveMessages = [];
        this.xpLootMessages = []; // Track XP and loot messages for Actions GUI
        this.combatQueueEnabled = false;
        this.inventoryOpen = false;
        this.gamePaused = false; // New flag for game pause
        
        // Initialize modules
        this.mapGenerator = new MapGenerator();
        this.characterGenerator = new CharacterGenerator();
        this.characterProgress = new CharacterProgress();
        this.audioSystem = new AudioSystem();
        
        // Initialize systems
        this.movementSystem = new MovementSystem();
        this.combatSystem = new CombatSystem();
        this.projectileSystem = new ProjectileSystem();
        this.effectSystem = new EffectSystem();
        this.inventorySystem = new InventorySystem(); // New inventory system
        this.inventoryRenderer = new InventoryRenderer(); // New inventory renderer
        this.skillsSystem = new SkillsSystem(); // New skills system
        
        // Set up system dependencies
        this.combatSystem.setCharacterProgress(this.characterProgress);
        this.combatSystem.setMessageCallback((message, type, color) => {
            this.addCombatMessage(message, type, color);
        });
        // Spell functionality removed for now
        
        // Initialize input handling
        this.setupInputHandling();
    }

    /**
     * Initialize the game
     */
    init() {
        console.log('Initializing game...');
        
        // Create world
        this.world = new World(80, 24);
        this.scheduler = new Scheduler();
        
        // Initialize renderer at original dimensions
        this.renderer = new ASCIIRenderer();
        const gameContainer = document.getElementById('game-container');
        this.renderer.init(gameContainer, 80, 24);
        
        // Set up renderer dependency for combat system
        this.combatSystem.setRenderer(this.renderer);
        
        // Initialize inventory renderer
        this.inventoryRenderer.init();
        
        // Generate initial level
        this.generateLevel();
        
        // Create player
        this.createPlayer();
        
        // Initialize player inventory system
        this.inventorySystem.initializeEntity(this.player);
        
        // Initialize player skills system
        this.skillsSystem.initializeEntity(this.player);
        
        // Initialize audio system and start random music
        this.audioSystem.init();
        this.audioSystem.playRandomMusic();
        
        // Add welcome messages
        this.addMessage('Welcome to Tiny RPG!', '#ffffff', 'system');
        this.addMessage('Press Q to toggle combat queue', '#ffff00', 'system');
        this.addMessage('Use WASD to move, Q to engage combat, X to attack, R to rest, I for inventory, C for chests, Space to loot, M to mute', '#ffff00', 'system');
        
        // Add some example action messages
        this.addMessage('You enter the dungeon...', '#ffff00', 'action');
        this.addMessage('The air is thick with mystery', '#cccccc', 'action');
        
        // Start game loop
        this.start();
    }

    /**
     * Generate a new level
     */
    generateLevel() {
        // Clear existing entities
        this.world.clearEntities();
        
        // Generate map
        const map = this.mapGenerator.generateDungeon(80, 24, {
            minRoomSize: 4,
            maxRoomSize: 12,
            maxRooms: 15,
            roomPadding: 2
        });
        
        // Set world map
        this.world.map = map;
        
        // Spawn monsters and items
        this.spawnLevelContent();
        
        console.log('Level generated!');
    }

    /**
     * Spawn monsters and items for the current level
     */
    spawnLevelContent() {
        const rooms = this.mapGenerator.getRooms();
        
        // Spawn monsters in rooms (except the first room)
        for (let i = 1; i < rooms.length; i++) {
            const room = rooms[i];
            // On level 1, spawn single monsters. On higher levels, spawn groups
            const maxMonsters = this.currentLevel === 1 ? 1 : 3;
            const monsters = this.characterGenerator.spawnMonstersInRoom(room, this.currentLevel, maxMonsters);
            
            for (const monster of monsters) {
                this.world.addEntity(monster);
                this.scheduler.addEntity(monster, Math.random() * 1000);
            }
        }
        
        // Spawn one chest per level in a random room (not the first room)
        if (rooms.length > 1) {
            const chestRoomIndex = Math.floor(Math.random() * (rooms.length - 1)) + 1; // Skip first room
            const chestRoom = rooms[chestRoomIndex];
            
            // Find a random position in the room
            const chestX = chestRoom.x + Math.floor(Math.random() * chestRoom.width);
            const chestY = chestRoom.y + Math.floor(Math.random() * chestRoom.height);
            
            const chestId = `chest_${this.currentLevel}_${Date.now()}`;
            const chest = this.characterGenerator.createChest(chestId, chestX, chestY);
            
            this.world.addEntity(chest);
        }
        
        // Spawn items in some rooms
        for (let i = 0; i < rooms.length; i++) {
            if (Math.random() < 0.3) { // 30% chance per room
                const room = rooms[i];
                const items = this.characterGenerator.spawnItemsInRoom(room, 2);
                
                for (const item of items) {
                    this.world.addEntity(item);
                }
            }
        }
    }

    /**
     * Create the player character
     */
    createPlayer() {
        const rooms = this.mapGenerator.getRooms();
        const startRoom = rooms[0]; // Use first room as starting position
        
        const startX = Math.floor(startRoom.x + startRoom.width / 2);
        const startY = Math.floor(startRoom.y + startRoom.height / 2);
        
        this.player = this.characterGenerator.createPlayer('player', startX, startY);
        this.world.addEntity(this.player);
        this.scheduler.addEntity(this.player, 0);
        
        console.log(`Player created at (${startX}, ${startY})`);
    }

    /**
     * Start the game
     */
    start() {
        this.isRunning = true;
        this.gameOver = false;
        this.scheduler.start();
        
        // Start game loop
        this.gameLoop();
        
        console.log('Game started!');
    }

    /**
     * Stop the game
     */
    stop() {
        this.isRunning = false;
        this.scheduler.stop();
        console.log('Game stopped!');
    }

    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        // Check if game is paused (inventory open)
        if (!this.gamePaused) {
            // Process one turn
            this.processTurn();
        }
        
        // Always render the game (even when paused)
        this.render();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Process one game turn
     */
    processTurn() {
        if (this.gameOver) return;
        
        // Update monster visibility based on player FOV first
        this.updateMonsterVisibility();
        
        // Process scheduler
        const entity = this.scheduler.getNextEntity();
        if (entity) {
            this.scheduler.setCurrentTime(entity.getNextActionTime());
            this.world.setCurrentTime(entity.getNextActionTime());
            
            // Process entity action
            this.processEntityAction(entity);
            
            // Schedule next action
            this.scheduler.schedule(entity);
        }
        
        // Process effects
        this.effectSystem.processAllEffects(this.world);
        
        // Update swing animations
        this.updateSwingAnimations();
        
        // Check win/lose conditions
        this.checkGameState();
    }

    /**
     * Process an entity's action
     * @param {Entity} entity - Entity acting
     */
    processEntityAction(entity) {
        if (!entity.active) return;
        
        // Check if entity can act (not stunned)
        if (!this.effectSystem.canAct(entity)) {
            console.log(`${entity.id} is stunned and cannot act`);
            return;
        }
        
        // Process based on entity type
        switch (entity.type) {
            case 'player':
                // Player actions are handled by input
                // But also process automatic combat when queue is enabled
                if (this.combatQueueEnabled) {
                    this.processPlayerCombat(entity);
                }
                break;
            case 'monster':
                this.movementSystem.processEntity(entity, this.world);
                // Monsters always attack when hostile, regardless of player combat queue
                this.combatSystem.processEntity(entity, this.world);
                break;
            case 'projectile':
                this.projectileSystem.processEntity(entity, this.world);
                break;
        }
    }

    /**
     * Update monster visibility based on player's field of view
     */
    updateMonsterVisibility() {
        if (!this.player || !this.world) return;
        
        const playerFOVRadius = 8; // Same as the renderer's FOV radius
        const monsters = this.world.getEntitiesByType('monster');
        
        for (const monster of monsters) {
            if (!monster.active) continue;
            
            const visibilityComponent = monster.getComponent('visibility');
            if (!visibilityComponent) continue;
            
            const distance = monster.distanceTo(this.player);
            const wasVisible = visibilityComponent.isVisible;
            visibilityComponent.isVisible = distance <= playerFOVRadius;
            
            // If monster just became invisible, reset its notice state
            if (wasVisible && !visibilityComponent.isVisible) {
                const noticeComponent = monster.getComponent('notice');
                if (noticeComponent) {
                    noticeComponent.hasNoticed = false;
                    noticeComponent.noticeTimer = 0;
                }
            }
        }
    }

    /**
     * Update swing animations
     */
    updateSwingAnimations() {
        const entitiesToRemove = [];
        
        for (const entity of this.world.getAllEntities().values()) {
            if (entity.type === 'swing_animation' && entity.active) {
                const isComplete = entity.update();
                if (isComplete) {
                    entitiesToRemove.push(entity.id);
                }
            }
        }
        
        // Remove completed swing animations
        for (const entityId of entitiesToRemove) {
            this.world.removeEntity(entityId);
        }
    }

    /**
     * Check game state (win/lose conditions)
     */
    checkGameState() {
        // Check if player is dead
        if (this.player && this.player.getComponent('health').current <= 0) {
            this.gameOver = true;
            this.addMessage('You have died!', '#ff0000');
            
            // Play death sound effect
            this.audioSystem.playDeathSound();
            
            console.log('Game Over!');
        }
        
        // Check if all monsters are dead
        const monsters = this.world.getEntitiesByType('monster');
        if (monsters.length === 0 && !this.gameOver) {
            this.addMessage('Level cleared! Look for hallway exits (>) to explore new areas', '#00ff00');
        }
    }

    /**
     * Render the game
     */
    render() {
        if (!this.renderer || !this.renderer.isInitialized()) return;
        
        // Render world
        this.renderer.renderWorld(this.world, this.player, {
            showFOV: true,
            fovRadius: 8,
            showAll: false,
            showInventory: this.inventoryOpen,
            combatMessages: this.combatMessages // Pass all combat messages for virtual scrolling
        });
        
        // Render UI
        this.renderer.renderUI(this.player, {
            messages: this.messages.slice(-5), // Show last 5 messages
            combatMessages: this.combatMessages.slice(-5), // Show last 5 combat messages
            moveMessages: this.moveMessages.slice(-5) // Show last 5 move messages
        });
        
        // Update HTML elements
        this.updateUI();
    }

    /**
     * Update HTML UI elements
     */
    updateUI() {
        if (!this.player) return;
        
        // Update player stats
        const health = this.player.getComponent('health');
        const level = this.player.getComponent('level');
        const stats = this.player.getComponent('stats');
        
        if (health) {
            const healthText = document.getElementById('health-text');
            const healthFill = document.getElementById('health-fill');
            
            if (healthText) {
                // Colorize the current health value based on percentage, keep max white
                const percentage = (health.current / health.max) * 100;
                let currentColor;
                
                // Calculate color from green (100%) to red (0%)
                if (percentage >= 100) {
                    currentColor = '#00ff00'; // Green
                } else if (percentage >= 75) {
                    currentColor = '#80ff00'; // Yellow-green
                } else if (percentage >= 50) {
                    currentColor = '#ffff00'; // Yellow
                } else if (percentage >= 25) {
                    currentColor = '#ff8000'; // Orange
                } else {
                    currentColor = '#ff0000'; // Red
                }
                
                healthText.innerHTML = `<span style="color: ${currentColor}">${health.current}</span><span style="color: #ffffff">/${health.max}</span>`;
            }
            
            if (healthFill) {
                const percentage = (health.current / health.max) * 100;
                healthFill.style.width = `${percentage}%`;
                
                // Change color based on health percentage
                if (percentage > 60) {
                    healthFill.style.backgroundColor = '#44ff44';
                } else if (percentage > 30) {
                    healthFill.style.backgroundColor = '#ffaa44';
                } else {
                    healthFill.style.backgroundColor = '#ff4444';
                }
            }
        }
        
        if (level) {
            const levelElement = document.getElementById('player-level');
            const xpElement = document.getElementById('player-xp');
            const xpNextElement = document.getElementById('player-xp-next');
            
            if (levelElement) {
                levelElement.textContent = level.value;
            }
            if (xpElement) {
                xpElement.textContent = level.experience || 0;
            }
            if (xpNextElement) {
                xpNextElement.textContent = level.experienceToNext || 100;
            }
        }
        
        if (stats) {
            const strElement = document.getElementById('player-str');
            const dexElement = document.getElementById('player-dex');
            const intElement = document.getElementById('player-int');
            const conElement = document.getElementById('player-con');
            const agiElement = document.getElementById('player-agi');
            
            if (strElement) strElement.textContent = stats.strength || 10;
            if (dexElement) dexElement.textContent = stats.dexterity || 10;
            if (intElement) intElement.textContent = stats.intelligence || 10;
            if (conElement) conElement.textContent = stats.constitution || 10;
            if (agiElement) agiElement.textContent = stats.agility || 10;
        }
        
        // Update game time
        const timeElement = document.getElementById('game-time');
        if (timeElement) {
            timeElement.textContent = `Time: ${Math.floor(this.world.getCurrentTime())}`;
        }
        
        // Update all logs
        this.updateActionLog();
        // this.updateCombatLog(); // Disabled - asciiRenderer handles this with better color support
        this.updateMoveLog();
        this.updateQueueStatus();
        this.updateActionsGUI();
    }

    /**
     * Update action log
     */
    updateActionLog() {
        const logElement = document.getElementById('action-messages');
        if (!logElement) return;
        
        logElement.innerHTML = '';
        
        // Show only action messages (opening chests, using items, etc.)
        const actionMessages = this.messages.filter(msg => 
            ['action', 'item', 'chest', 'door', 'interaction'].includes(msg.type)
        );
        
        for (const message of actionMessages.slice(-10).reverse()) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${message.type || 'default'}`;
            logEntry.textContent = message.text;
            logElement.appendChild(logEntry);
        }
    }

    /**
     * Update move log
     */
    updateMoveLog() {
        const logElement = document.getElementById('move-messages');
        if (!logElement) return;
        
        logElement.innerHTML = '';
        
        for (const message of this.moveMessages.slice(-10).reverse()) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${message.type || 'movement'}`;
            logEntry.textContent = message.text;
            logElement.appendChild(logEntry);
        }
    }

    /**
     * Update combat log
     */
    updateCombatLog() {
        const logElement = document.getElementById('combat-messages');
        if (!logElement) return;
        
        logElement.innerHTML = '';
        
        for (const message of this.combatMessages.slice(-10).reverse()) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${message.type || 'combat'}`;
            logEntry.textContent = message.text;
            logElement.appendChild(logEntry);
        }
    }

    /**
     * Update queue status
     */
    updateQueueStatus() {
        const indicator = document.getElementById('queue-indicator');
        if (!indicator) return;
        
        if (this.combatQueueEnabled) {
            indicator.textContent = 'ON';
            indicator.className = 'active';
        } else {
            indicator.textContent = 'OFF';
            indicator.className = '';
        }
    }

    /**
     * Update actions GUI
     */
    updateActionsGUI() {
        const actionsElement = document.getElementById('actions-content');
        if (!actionsElement) return;
        
        let actionsHTML = '';
        
        // Combat mode status
        const combatStatus = this.combatQueueEnabled ? '<span style="color: #00ff00">ON</span>' : '<span style="color: #ff0000">OFF</span>';
        actionsHTML += `<div>Combat: ${combatStatus}</div>`;
        
        // XP/Loot chat history
        actionsHTML += `<div style="flex: 1; overflow-y: auto; max-height: 80px; border: 1px solid #555; padding: 2px; margin-top: 5px;">`;
        
        if (this.xpLootMessages.length > 0) {
            const recentMessages = this.xpLootMessages.slice(-10); // Show last 10 messages
            actionsHTML += recentMessages.map(msg => 
                `<div style="color: ${msg.color}; font-size: 10px; margin-bottom: 1px;">${msg.text}</div>`
            ).join('');
        }
        
        actionsHTML += '</div>';
        
        actionsElement.innerHTML = actionsHTML;
    }

    /**
     * Check for nearby lootable corpses
     */
    checkForNearbyLoot() {
        if (!this.player) return false;
        
        // Check current position and adjacent positions for corpses
        const positions = [
            {x: this.player.x, y: this.player.y},
            {x: this.player.x + 1, y: this.player.y},
            {x: this.player.x - 1, y: this.player.y},
            {x: this.player.x, y: this.player.y + 1},
            {x: this.player.x, y: this.player.y - 1}
        ];
        
        for (const pos of positions) {
            const entities = this.world.getEntitiesAt(pos.x, pos.y);
            const corpse = entities.find(entity => entity.type === 'corpse' && entity.active);
            if (corpse) {
                const corpseComponent = corpse.getComponent('corpse');
                if (corpseComponent && !corpseComponent.looted) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Add a message to the game log
     * @param {string} text - Message text
     * @param {string} color - Message color
     * @param {string} type - Message type
     */
    addMessage(text, color = '#ffffff', type = 'default') {
        this.messages.push({
            text: text,
            color: color,
            type: type,
            timestamp: this.world.getCurrentTime()
        });
        
        // Keep only last 100 messages
        if (this.messages.length > 100) {
            this.messages = this.messages.slice(-100);
        }
    }

    /**
     * Add a message to the combat log
     * @param {string} text - Message text
     * @param {string} type - Message type
     */
    addCombatMessage(text, type = 'combat', color = '#ffffff') {
        this.combatMessages.push({
            text: text,
            type: type,
            color: color,
            timestamp: Date.now() // Use real time for fading
        });
        
        // Keep only last 500 messages for extensive combat history
        if (this.combatMessages.length > 500) {
            this.combatMessages = this.combatMessages.slice(-500);
        }
    }

    /**
     * Add a message to the move log
     * @param {string} text - Message text
     * @param {string} type - Message type
     */
    addMoveMessage(text, type = 'movement') {
        this.moveMessages.push({
            text: text,
            type: type,
            timestamp: this.world.getCurrentTime()
        });
        
        // Keep only last 100 messages
        if (this.moveMessages.length > 100) {
            this.moveMessages = this.moveMessages.slice(-100);
        }
    }

    /**
     * Add a message to the XP/Loot log
     * @param {string} text - Message text
     * @param {string} color - Message color
     */
    addXpLootMessage(text, color = '#ffffff') {
        this.xpLootMessages.push({
            text: text,
            color: color,
            timestamp: Date.now()
        });
        
        // Keep only last 20 messages
        if (this.xpLootMessages.length > 20) {
            this.xpLootMessages = this.xpLootMessages.slice(-20);
        }
    }

    /**
     * Setup input handling
     */
    setupInputHandling() {
        document.addEventListener('keydown', (event) => {
            if (!this.isRunning || this.gameOver) return;
            
            this.handleInput(event);
        });
        
        // Add click handler for audio interaction
        document.addEventListener('click', () => {
            this.audioSystem.handleUserInteraction();
        });
    }

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleInput(event) {
        if (!this.player) return;
        
        // Handle user interaction for audio
        this.audioSystem.handleUserInteraction();
        
        const key = event.key.toLowerCase();
        
        // Handle inventory toggle first
        if (key === 'i' || key === 'c') {
            this.toggleInventory();
            event.preventDefault();
            return;
        }
        
        // If inventory is open, only allow closing it (handled by inventory renderer)
        if (this.inventoryOpen) {
            event.preventDefault();
            return;
        }
        
        // Movement keys - WASD only (no diagonal movement)
        if (key === 'w' || key === 'arrowup') {
            this.movePlayer('north');
        } else if (key === 's' || key === 'arrowdown') {
            this.movePlayer('south');
        } else if (key === 'a' || key === 'arrowleft') {
            this.movePlayer('west');
        } else if (key === 'd' || key === 'arrowright') {
            this.movePlayer('east');
        } else if (key === ' ') {
            // Try to loot corpse first, then chest
            const lootedCorpse = this.lootCorpse();
            if (!lootedCorpse) {
                this.interactWithChest();
            }
        } else if (key === 'q') {
            this.toggleCombatQueue();
        } else if (key === 'r') {
            this.restPlayer();
        } else if (key === 'x') {
            this.playerAttackAdjacent();
        } else if (key === 'm') {
            // Toggle mute
            const isMuted = this.audioSystem.toggleMute();
            this.addMessage(isMuted ? 'Audio muted' : 'Audio unmuted', '#ffffff', 'system');
        } else if (key === 'f7') {
            // Bug report
            this.reportBug();
        }
        
        event.preventDefault();
    }

    /**
     * Move player in a direction
     * @param {string} direction - Direction to move
     */
    movePlayer(direction) {
        if (!this.player) return;
        
        const success = this.movementSystem.moveInDirection(this.player, direction, this.world);
        
        if (success) {
            // Interrupt resting when player moves
            this.interruptResting();
            
            this.addMoveMessage(`Moved ${direction}`, 'movement');
            
            // Check if player moved into a monster (attack)
            this.checkPlayerAttack();
            
            // Check if player stepped on a hallway exit
            this.checkHallwayExit();
        } else {
            this.addMoveMessage(`Cannot move ${direction}`, 'movement');
        }
    }

    /**
     * Check if player should attack a monster
     */
    checkPlayerAttack() {
        if (!this.player || !this.combatQueueEnabled) return;
        
        const monsters = this.world.getEntitiesAt(this.player.x, this.player.y);
        const monster = monsters.find(entity => entity.type === 'monster' && entity.active);
        
        if (monster) {
            this.playerAttackMonster(monster);
        }
    }

    /**
     * Check if player stepped on a hallway exit
     */
    checkHallwayExit() {
        if (!this.player || !this.world) return;
        
        const tile = this.world.map[this.player.y][this.player.x];
        if (tile && tile.type === 'hallway_exit') {
            console.log(`Player stepped on hallway exit at (${this.player.x}, ${this.player.y})`);
            this.enterNewArea(tile.direction);
        }
    }

    /**
     * Enter a new area through a hallway
     * @param {string} direction - Direction of the hallway
     */
    enterNewArea(direction) {
        this.currentLevel++;
        this.addMessage(`Entering new area via ${direction} hallway...`, '#ffff00', 'system');
        this.addCombatMessage(`Discovered new area! Level ${this.currentLevel}`, 'system');
        
        // Play stair sound effect
        if (this.audioSystem) {
            this.audioSystem.playStairSound();
        }
        
        // Store player reference before clearing entities
        const playerBackup = this.player;
        
        // Generate new level (this clears all entities including player)
        this.generateLevel();
        
        // Restore player to the world
        this.world.player = playerBackup;
        this.world.addEntity(playerBackup);
        
        // Move player to new starting position
        const rooms = this.mapGenerator.getRooms();
        const startRoom = rooms[0];
        const startX = Math.floor(startRoom.x + startRoom.width / 2);
        const startY = Math.floor(startRoom.y + startRoom.height / 2);
        
        this.player.setPosition(startX, startY);
        
        // Heal player slightly
        const health = this.player.getComponent('health');
        if (health) {
            health.current = Math.min(health.max, health.current + 20);
            this.addMessage(`Healed for 20 HP!`, '#00ff00', 'system');
        }
    }

    /**
     * Player attacks a monster
     * @param {Entity} monster - Monster to attack
     */
    playerAttackMonster(monster) {
        // Use the combat system's attackTarget method which includes swing animations
        // The combat system will handle the messaging, so we don't need to add messages here
        this.combatSystem.attackTarget(this.player, monster, this.world);
    }

    /**
     * Player attacks adjacent monster
     */
    playerAttackAdjacent() {
        if (!this.player) {
            this.addCombatMessage('No player!', 'combat');
            return;
        }
        
        // Interrupt resting when player attacks
        this.interruptResting();
        
        // Check weapon speed cooldown for manual attacks too
        const now = Date.now();
        const lastAttack = this.player.getComponent('lastAttack') || { time: 0 };
        
        // Calculate attack speed based on weapon
        const equipment = this.player.getComponent('equipment');
        let attackSpeed = 6400; // Base 6.4 seconds (20% faster)
        
        // Check both legacy and new weapon slots
        const weapon = equipment ? (equipment.weapon || equipment.primary) : null;
        if (weapon && weapon.speed) {
            attackSpeed = 6400 / weapon.speed; // Weapon speed affects cooldown
        }
        
        if (now - lastAttack.time < attackSpeed) {
            const remainingTime = Math.ceil((attackSpeed - (now - lastAttack.time)) / 1000);
            this.addCombatMessage(`Weapon not ready! ${remainingTime}s remaining.`, 'combat');
            return;
        }
        
        // Find adjacent monsters
        const directions = [
            { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
            { x: -1, y: 0 },                   { x: 1, y: 0 },
            { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
        ];
        
        for (const dir of directions) {
            const targetX = this.player.x + dir.x;
            const targetY = this.player.y + dir.y;
            const monsters = this.world.getEntitiesAt(targetX, targetY);
            const monster = monsters.find(entity => entity.type === 'monster' && entity.active);
            
            if (monster) {
                this.playerAttackMonster(monster);
                return;
            }
        }
        
        this.addCombatMessage('No monster to attack!', 'combat');
    }

    /**
     * Process automatic player combat when combat queue is enabled
     * @param {Entity} player - Player entity
     */
    processPlayerCombat(player) {
        if (!player) return;

        // Check weapon speed cooldown
        const now = Date.now();
        const lastAttack = player.getComponent('lastAttack') || { time: 0 };
        
        // Calculate attack speed based on weapon
        const equipment = player.getComponent('equipment');
        let attackSpeed = 6400; // Base 6.4 seconds (20% faster)
        
        // Check both legacy and new weapon slots
        const weapon = equipment ? (equipment.weapon || equipment.primary) : null;
        if (weapon && weapon.speed) {
            attackSpeed = 6400 / weapon.speed; // Weapon speed affects cooldown
        }
        
        if (now - lastAttack.time < attackSpeed) {
            return; // Still on cooldown
        }

        // Find the closest monster within attack range
        const monsters = this.world.getEntitiesByType('monster').filter(entity => 
            entity.active
        );

        // If no monsters, no need to continue combat
        if (monsters.length === 0) {
            return;
        }

        let closestMonster = null;
        let closestDistance = Infinity;

        for (const monster of monsters) {
            const distance = player.distanceTo(monster);
            if (distance <= 1.5) { // Adjacent or diagonal (same as monster combat)
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestMonster = monster;
                }
            }
        }

        // Attack the closest monster if found
        if (closestMonster) {
            this.playerAttackMonster(closestMonster);
        }
    }

    /**
     * Loot nearby corpse (from current position or adjacent)
     * @returns {boolean} True if successfully looted a corpse
     */
    lootCorpse() {
        if (!this.player) return false;
        
        // Check for corpses at player's position first
        let entitiesAtPosition = this.world.getEntitiesAt(this.player.x, this.player.y);
        let corpse = entitiesAtPosition.find(entity => entity.type === 'corpse' && entity.active);
        
        // If no corpse at current position, check adjacent positions
        if (!corpse) {
            const directions = [
                { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
                { x: -1, y: 0 },                   { x: 1, y: 0 },
                { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
            ];
            
            for (const dir of directions) {
                const checkX = this.player.x + dir.x;
                const checkY = this.player.y + dir.y;
                entitiesAtPosition = this.world.getEntitiesAt(checkX, checkY);
                corpse = entitiesAtPosition.find(entity => entity.type === 'corpse' && entity.active);
                if (corpse) break;
            }
        }
        
        if (corpse) {
            // Try to loot the corpse
            const looted = this.combatSystem.lootCorpse(corpse, this.player, this.world);
            if (!looted) {
                this.addMoveMessage('Nothing to loot here', 'movement');
            }
            return looted;
        } else {
            return false; // No corpse found
        }
    }

    /**
     * Inspect adjacent monster
     */
    inspectAdjacentMonster() {
        if (!this.player) return;
        
        // Find adjacent monsters
        const directions = [
            { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
            { x: -1, y: 0 },                   { x: 1, y: 0 },
            { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
        ];
        
        for (const dir of directions) {
            const targetX = this.player.x + dir.x;
            const targetY = this.player.y + dir.y;
            const monsters = this.world.getEntitiesAt(targetX, targetY);
            const monster = monsters.find(entity => entity.type === 'monster' && entity.active);
            
            if (monster) {
                this.inspectMonster(monster);
                return;
            }
        }
        
        this.addCombatMessage('No monster to inspect!', 'combat');
    }

    /**
     * Inspect a specific monster
     * @param {Entity} monster - Monster to inspect
     */
    inspectMonster(monster) {
        const health = monster.getComponent('health');
        const level = monster.getComponent('level');
        const notice = monster.getComponent('notice');
        
        // Get monster type from ID or use default
        let monsterType = 'Monster';
        if (monster.id.includes('goblin')) monsterType = 'Goblin';
        else if (monster.id.includes('orc')) monsterType = 'Orc';
        else if (monster.id.includes('troll')) monsterType = 'Troll';
        else if (monster.id.includes('skeleton')) monsterType = 'Skeleton';
        else if (monster.id.includes('dragon')) monsterType = 'Dragon';
        
        let info = `${monsterType} (${monster.id.slice(-4)})`;
        
        if (health) {
            info += ` - HP: ${health.current}/${health.max}`;
        }
        
        if (level) {
            info += ` - Level: ${level.value}`;
        }
        
        if (notice) {
            if (notice.hasNoticed) {
                info += ' - HOSTILE!';
            } else if (notice.noticeTimer > 0) {
                info += ' - Suspicious...';
            } else {
                info += ' - Unaware';
            }
        }
        
        this.addCombatMessage(info, 'combat');
    }

    /**
     * Toggle combat queue on/off
     */
    toggleCombatQueue() {
        this.combatQueueEnabled = !this.combatQueueEnabled;
        // Combat queue status now shows in Actions GUI, no need for combat log messages
    }

    /**
     * Rest player (heal over time)
     */
    restPlayer() {
        if (!this.player) return;
        
        const health = this.player.getComponent('health');
        if (!health) return;
        
        // Check if already at full health
        if (health.current >= health.max) {
            this.addCombatMessage('You are already at full health', 'notice', '#00FF00'); // Neon green
            return;
        }
        
        // Check if already resting - if so, stop resting
        if (this.player.isResting) {
            this.stopResting();
            return;
        }
        
        // Start resting
        this.player.isResting = true;
        this.player.restStartTime = Date.now();
        this.player.restAnimationStart = Date.now();
        
        this.addCombatMessage('You begin to rest...', 'notice', '#00FF00'); // Neon green
        
        // Play rest sound effect
        this.audioSystem.playRestSound();
        
        // Start rest healing process
        this.startRestHealing();
    }

    /**
     * Start the rest healing process
     */
    startRestHealing() {
        if (!this.player || !this.player.isResting) return;
        
        const health = this.player.getComponent('health');
        if (!health || health.current >= health.max) {
            this.stopResting();
            return;
        }
        
        // Heal 2% of max health every 30 seconds
        const healAmount = Math.floor(health.max * 0.02);
        health.current = Math.min(health.max, health.current + healAmount);
        
        this.addCombatMessage(`You rest and recover ${healAmount} HP`, 'heal', '#98FB98'); // Pastel green
        
        // Continue resting if not at full health
        if (health.current < health.max) {
            setTimeout(() => {
                this.startRestHealing();
            }, 6000); // 6 seconds
        } else {
            this.stopResting();
        }
    }

    /**
     * Stop resting
     */
    stopResting() {
        if (!this.player) return;
        
        this.player.isResting = false;
        this.player.restStartTime = null;
        this.player.restAnimationStart = null;
        
        // Stop rest sound
        if (this.audioSystem) {
            this.audioSystem.stopRestSound();
        }
        
        this.addCombatMessage('You finish resting', 'notice', '#00FF00'); // Neon green
    }

    /**
     * Interrupt resting (called when player moves, attacks, or is attacked)
     */
    interruptResting() {
        if (!this.player || !this.player.isResting) return;
        
        this.player.isResting = false;
        this.player.restStartTime = null;
        this.player.restAnimationStart = null;
        
        // Stop rest sound
        if (this.audioSystem) {
            this.audioSystem.stopRestSound();
        }
        
        this.addCombatMessage('Your rest is interrupted!', 'notice', '#00FF00'); // Neon green
    }

    /**
     * Report a bug - creates a timestamped log entry with user description
     */
    reportBug() {
        // Show input dialog for bug description
        const bugDescription = prompt('Please describe the bug you encountered:\n\n(Leave empty to cancel)');
        
        if (bugDescription === null || bugDescription.trim() === '') {
            this.addCombatMessage('Bug report cancelled.', 'system', '#FFA500');
            return;
        }
        
        const timestamp = new Date().toISOString();
        const playerInfo = this.player ? {
            level: this.player.getComponent('level')?.value || 'unknown',
            position: { x: this.player.x, y: this.player.y },
            health: this.player.getComponent('health') ? {
                current: this.player.getComponent('health').current,
                max: this.player.getComponent('health').max
            } : 'unknown'
        } : 'no player';
        
        const gameState = {
            currentLevel: this.currentLevel,
            combatQueueEnabled: this.combatQueueEnabled,
            inventoryOpen: this.inventoryOpen,
            worldSize: this.world ? { width: this.world.width, height: this.world.height } : 'no world'
        };
        
        const bugReport = {
            timestamp: timestamp,
            type: 'bug_report',
            description: bugDescription.trim(),
            player: playerInfo,
            gameState: gameState,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Create log entry
        const logEntry = `[${timestamp}] BUG REPORT\n${JSON.stringify(bugReport, null, 2)}\n\n`;
        
        // Try to save to log file (this will work in a real server environment)
        this.saveBugReport(logEntry);
        
        // Show confirmation to player
        this.addCombatMessage('Bug report submitted! Thank you for helping improve the game.', 'system', '#00FF00');
        console.log('Bug report created:', bugReport);
    }

    /**
     * Save bug report to log file
     * @param {string} logEntry - The log entry to save
     */
    saveBugReport(logEntry) {
        try {
            // First, try to send to server
            fetch('/api/bug-report', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    logEntry: logEntry,
                    timestamp: new Date().toISOString(),
                    gameVersion: '1.0.0' // You can update this as needed
                })
            }).then(response => {
                if (response.ok) {
                    console.log('Bug report successfully sent to server');
                    this.addCombatMessage('Bug report sent to server! Thank you for helping improve the game.', 'system', '#00FF00');
                } else {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
            }).catch(error => {
                console.warn('Failed to send bug report to server, using fallback method:', error);
                this.fallbackBugReport(logEntry);
            });
            
            // Also log to console for immediate visibility
            console.log('=== BUG REPORT ===');
            console.log(logEntry);
            console.log('==================');
            
        } catch (error) {
            console.error('Failed to save bug report:', error);
            this.fallbackBugReport(logEntry);
        }
    }

    /**
     * Fallback method for bug reports when server is unavailable
     * @param {string} logEntry - The log entry to save
     */
    fallbackBugReport(logEntry) {
        try {
            // Create a downloadable log file
            const blob = new Blob([logEntry], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bug_report_${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Also save to localStorage as backup
            const existingLogs = localStorage.getItem('bug_reports') || '';
            const updatedLogs = existingLogs + logEntry;
            localStorage.setItem('bug_reports', updatedLogs);
            
            this.addCombatMessage('Bug report saved locally (server unavailable). Thank you for helping improve the game.', 'system', '#FFA500');
            
        } catch (error) {
            console.error('Failed to save bug report locally:', error);
            this.addCombatMessage('Failed to save bug report. Please try again.', 'system', '#FF0000');
        }
    }

    /**
     * Interact with nearby chest
     */
    interactWithChest() {
        if (!this.player) return;
        
        // Interrupt resting when interacting
        this.interruptResting();
        
        // Check for chests at player's position first
        let entitiesAtPosition = this.world.getEntitiesAt(this.player.x, this.player.y);
        let chest = entitiesAtPosition.find(entity => entity.type === 'chest' && entity.active);
        
        // If no chest at current position, check adjacent positions
        if (!chest) {
            const directions = [
                { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
                { x: -1, y: 0 },                   { x: 1, y: 0 },
                { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
            ];
            
            for (const dir of directions) {
                const checkX = this.player.x + dir.x;
                const checkY = this.player.y + dir.y;
                entitiesAtPosition = this.world.getEntitiesAt(checkX, checkY);
                chest = entitiesAtPosition.find(entity => entity.type === 'chest' && entity.active);
                if (chest) break;
            }
        }
        
        if (chest) {
            this.openChest(chest);
        } else {
            this.addMoveMessage('No chest nearby', 'movement');
        }
    }

    /**
     * Open a chest and give loot to player
     * @param {Entity} chest - Chest entity
     */
    openChest(chest) {
        const chestComponent = chest.getComponent('chest');
        if (!chestComponent) {
            this.addMoveMessage('This chest is broken', 'movement');
            return;
        }
        
        if (chestComponent.looted) {
            this.addMoveMessage('This chest is already empty', 'movement');
            return;
        }
        
        // Give gold to player
        const playerGold = this.player.getComponent('gold');
        if (playerGold && chestComponent.loot.gold > 0) {
            playerGold.amount += chestComponent.loot.gold;
            this.addXpLootMessage(`+${chestComponent.loot.gold} gold`, '#FFD700');
            this.addMessage(`Found ${chestComponent.loot.gold} gold!`, '#FFD700', 'chest');
        }
        
        // Mark chest as looted and update appearance
        chestComponent.looted = true;
        const appearance = chest.getComponent('appearance');
        if (appearance) {
            appearance.char = '[ ]'; // Empty brackets where v was
            appearance.color = '#B8860B'; // Dark gold color
        }
        
        this.addMessage('Chest opened!', '#FFD700', 'chest');
        
        // Play treasure sound effect
        this.audioSystem.playTreasureSound();
    }


    /**
     * Get game state
     * @returns {Object} Game state
     */
    getGameState() {
        return {
            isRunning: this.isRunning,
            gameOver: this.gameOver,
            currentLevel: this.currentLevel,
            player: this.player ? this.player.toJSON() : null,
            world: {
                width: this.world.width,
                height: this.world.height,
                currentTime: this.world.getCurrentTime()
            }
        };
    }

    /**
     * Toggle inventory display
     */
    toggleInventory() {
        if (this.inventoryOpen) {
            this.closeInventory();
        } else {
            this.openInventory();
        }
    }

    /**
     * Open inventory overlay
     */
    openInventory() {
        this.inventoryOpen = true;
        this.gamePaused = true; // Pause game logic
        this.inventoryRenderer.show();
        this.addMoveMessage('Inventory opened', 'movement');
    }

    /**
     * Close inventory overlay
     */
    closeInventory() {
        this.inventoryOpen = false;
        this.gamePaused = false; // Resume game logic
        this.inventoryRenderer.hide();
        this.addMoveMessage('Inventory closed', 'movement');
    }

    /**
     * Update inventory display
     */
    updateInventoryDisplay() {
        const inventoryItems = document.getElementById('inventory-items');
        if (!inventoryItems || !this.player) return;

        const inventory = this.player.getComponent('inventory');
        if (!inventory || !inventory.items || inventory.items.length === 0) {
            inventoryItems.innerHTML = '<p>No items in inventory</p>';
            return;
        }

        inventoryItems.innerHTML = '';
        inventory.items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.innerHTML = `
                <h4>${item.name || 'Unknown Item'}</h4>
                <p>Type: ${item.type || 'Unknown'}</p>
                <p>Value: ${item.value || 0} gold</p>
            `;
            inventoryItems.appendChild(itemDiv);
        });
    }

    /**
     * Reset the game
     */
    reset() {
        this.stop();
        this.currentLevel = 1;
        this.gameOver = false;
        this.messages = [];
        this.init();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Make game globally accessible for debugging
    window.game = game;
});
