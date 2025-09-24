/**
 * Scheduler class managing turn-based game flow using priority queue
 */
class Scheduler {
    constructor() {
        this.queue = new PriorityQueue();
        this.currentTime = 0;
        this.isRunning = false;
        this.gameOver = false;
    }

    /**
     * Schedule an entity's next action
     * @param {Entity} entity - Entity to schedule
     * @param {number} delay - Delay in milliseconds (optional, uses entity's default if not provided)
     */
    schedule(entity, delay = null) {
        if (!entity || !entity.active) return;

        const actionDelay = delay !== null ? delay : entity.getActionDelay();
        const nextActionTime = this.currentTime + actionDelay;
        
        entity.setNextActionTime(nextActionTime);
        this.queue.push(entity, nextActionTime);
    }

    /**
     * Get the next entity that should act
     * @returns {Entity|null} Next entity to act or null if none
     */
    getNextEntity() {
        if (this.queue.isEmpty()) return null;
        
        const entity = this.queue.pop();
        if (!entity || !entity.active) {
            return this.getNextEntity(); // Skip inactive entities
        }
        
        this.currentTime = entity.getNextActionTime();
        return entity;
    }

    /**
     * Process one turn of the game
     * @param {World} world - Game world
     * @param {Object} systems - Game systems object
     * @returns {boolean} True if turn was processed, false if game over or no entities
     */
    processTurn(world, systems) {
        if (this.gameOver || this.queue.isEmpty()) {
            return false;
        }

        const entity = this.getNextEntity();
        if (!entity) {
            return false;
        }

        // Update world time
        world.setCurrentTime(this.currentTime);

        // Process entity action based on type
        this.processEntityAction(entity, world, systems);

        // Schedule entity's next action
        this.schedule(entity);

        return true;
    }

    /**
     * Process an entity's action
     * @param {Entity} entity - Entity acting
     * @param {World} world - Game world
     * @param {Object} systems - Game systems
     */
    processEntityAction(entity, world, systems) {
        switch (entity.type) {
            case 'player':
                this.processPlayerAction(entity, world, systems);
                break;
            case 'monster':
                this.processMonsterAction(entity, world, systems);
                break;
            case 'projectile':
                this.processProjectileAction(entity, world, systems);
                break;
            default:
                console.warn(`Unknown entity type: ${entity.type}`);
        }
    }

    /**
     * Process player action (handled by input system)
     * @param {Entity} entity - Player entity
     * @param {World} world - Game world
     * @param {Object} systems - Game systems
     */
    processPlayerAction(entity, world, systems) {
        // Player actions are handled by input system
        // This is just a placeholder for the turn structure
        if (systems.movement) {
            systems.movement.processEntity(entity, world);
        }
    }

    /**
     * Process monster action
     * @param {Entity} entity - Monster entity
     * @param {World} world - Game world
     * @param {Object} systems - Game systems
     */
    processMonsterAction(entity, world, systems) {
        if (systems.movement) {
            systems.movement.processEntity(entity, world);
        }
        
        if (systems.combat) {
            systems.combat.processEntity(entity, world);
        }
    }

    /**
     * Process projectile action
     * @param {Entity} entity - Projectile entity
     * @param {World} world - Game world
     * @param {Object} systems - Game systems
     */
    processProjectileAction(entity, world, systems) {
        if (systems.projectile) {
            systems.projectile.processEntity(entity, world);
        }
    }

    /**
     * Add an entity to the scheduler
     * @param {Entity} entity - Entity to add
     * @param {number} initialDelay - Initial delay before first action
     */
    addEntity(entity, initialDelay = 0) {
        this.schedule(entity, initialDelay);
    }

    /**
     * Remove an entity from the scheduler
     * @param {string} entityId - ID of entity to remove
     */
    removeEntity(entityId) {
        // Entities are removed when they become inactive
        // The queue will skip inactive entities automatically
    }

    /**
     * Get the current game time
     * @returns {number} Current time
     */
    getCurrentTime() {
        return this.currentTime;
    }

    /**
     * Set the current game time
     * @param {number} time - New current time
     */
    setCurrentTime(time) {
        this.currentTime = time;
    }

    /**
     * Check if the scheduler is running
     * @returns {boolean} True if running
     */
    isRunning() {
        return this.isRunning;
    }

    /**
     * Start the scheduler
     */
    start() {
        this.isRunning = true;
        this.gameOver = false;
    }

    /**
     * Stop the scheduler
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Set game over state
     * @param {boolean} gameOver - Game over state
     */
    setGameOver(gameOver) {
        this.gameOver = gameOver;
    }

    /**
     * Check if game is over
     * @returns {boolean} True if game is over
     */
    isGameOver() {
        return this.gameOver;
    }

    /**
     * Clear all scheduled entities
     */
    clear() {
        this.queue.clear();
        this.currentTime = 0;
        this.gameOver = false;
    }

    /**
     * Get the number of scheduled entities
     * @returns {number} Number of entities in queue
     */
    getQueueSize() {
        return this.queue.size();
    }

    /**
     * Get the next action time
     * @returns {number|null} Next action time or null if queue is empty
     */
    getNextActionTime() {
        const nextEntity = this.queue.peek();
        return nextEntity ? nextEntity.getNextActionTime() : null;
    }
}
