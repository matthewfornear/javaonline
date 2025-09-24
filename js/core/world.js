/**
 * World class managing the game world state
 */
class World {
    constructor(width = 80, height = 24) {
        this.width = width;
        this.height = height;
        this.entities = new Map();
        this.map = [];
        this.player = null;
        this.currentTime = 0;
        
        // Initialize empty map
        this.initializeMap();
    }

    /**
     * Initialize empty map grid
     */
    initializeMap() {
        this.map = [];
        for (let y = 0; y < this.height; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.map[y][x] = { type: 'wall', char: '#', passable: false };
            }
        }
    }

    /**
     * Add an entity to the world
     * @param {Entity} entity - Entity to add
     */
    addEntity(entity) {
        this.entities.set(entity.id, entity);
        
        // Set as player if it's the player entity
        if (entity.type === 'player') {
            this.player = entity;
        }
    }

    /**
     * Remove an entity from the world
     * @param {string} entityId - ID of entity to remove
     * @returns {boolean} True if entity was removed
     */
    removeEntity(entityId) {
        const entity = this.entities.get(entityId);
        if (entity) {
            entity.deactivate();
            this.entities.delete(entityId);
            
            // Clear player reference if removing player
            if (entity === this.player) {
                this.player = null;
            }
            return true;
        }
        return false;
    }

    /**
     * Get an entity by ID
     * @param {string} entityId - Entity ID
     * @returns {Entity|undefined} The entity or undefined
     */
    getEntity(entityId) {
        return this.entities.get(entityId);
    }

    /**
     * Get all entities
     * @returns {Map} Map of all entities
     */
    getAllEntities() {
        return this.entities;
    }

    /**
     * Get entities at a specific position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Array} Array of entities at position
     */
    getEntitiesAt(x, y) {
        const entities = [];
        for (const entity of this.entities.values()) {
            if (entity.x === x && entity.y === y && entity.active) {
                entities.push(entity);
            }
        }
        return entities;
    }

    /**
     * Get entities of a specific type
     * @param {string} type - Entity type
     * @returns {Array} Array of entities of the specified type
     */
    getEntitiesByType(type) {
        const entities = [];
        for (const entity of this.entities.values()) {
            if (entity.type === type && entity.active) {
                entities.push(entity);
            }
        }
        return entities;
    }

    /**
     * Check if a position is passable
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if position is passable
     */
    isPassable(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.map[y][x].passable;
    }

    /**
     * Check if a position is occupied by an entity
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} excludeId - Entity ID to exclude from check
     * @returns {boolean} True if position is occupied
     */
    isOccupied(x, y, excludeId = null) {
        const entities = this.getEntitiesAt(x, y);
        if (excludeId) {
            return entities.some(entity => entity.id !== excludeId);
        }
        return entities.length > 0;
    }

    /**
     * Get the tile at a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|undefined} Tile object or undefined
     */
    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return undefined;
        }
        return this.map[y][x];
    }

    /**
     * Set the tile at a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} tile - Tile object
     */
    setTile(x, y, tile) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.map[y][x] = tile;
        }
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
     * Advance time by a given amount
     * @param {number} delta - Time to advance by
     */
    advanceTime(delta) {
        this.currentTime += delta;
    }

    /**
     * Get all active entities sorted by next action time
     * @returns {Array} Array of active entities
     */
    getActiveEntities() {
        const activeEntities = [];
        for (const entity of this.entities.values()) {
            if (entity.active) {
                activeEntities.push(entity);
            }
        }
        return activeEntities.sort((a, b) => a.nextAction - b.nextAction);
    }

    /**
     * Find path between two points using simple pathfinding
     * @param {number} startX - Start X coordinate
     * @param {number} startY - Start Y coordinate
     * @param {number} endX - End X coordinate
     * @param {number} endY - End Y coordinate
     * @returns {Array} Array of path positions
     */
    findPath(startX, startY, endX, endY) {
        // Simple pathfinding - just move towards target
        const path = [];
        let currentX = startX;
        let currentY = startY;

        while (currentX !== endX || currentY !== endY) {
            const dx = endX - currentX;
            const dy = endY - currentY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                currentX += dx > 0 ? 1 : -1;
            } else {
                currentY += dy > 0 ? 1 : -1;
            }
            
            path.push({ x: currentX, y: currentY });
            
            // Prevent infinite loops
            if (path.length > this.width + this.height) {
                break;
            }
        }
        
        return path;
    }

    /**
     * Clear all entities from the world
     */
    clearEntities() {
        this.entities.clear();
        this.player = null;
    }

    /**
     * Reset the world to initial state
     */
    reset() {
        this.clearEntities();
        this.initializeMap();
        this.currentTime = 0;
    }

    /**
     * Get entities within a certain radius of a position
     * @param {Entity} centerEntity - Entity to center the radius around
     * @param {number} radius - Radius in tiles
     * @returns {Array} Array of entities within radius
     */
    getEntitiesInRadius(centerEntity, radius) {
        const entities = [];
        const centerX = centerEntity.x;
        const centerY = centerEntity.y;
        
        for (const entity of this.entities.values()) {
            if (entity.id === centerEntity.id) continue; // Skip the center entity itself
            
            const distance = Math.sqrt((entity.x - centerX) ** 2 + (entity.y - centerY) ** 2);
            if (distance <= radius) {
                entities.push(entity);
            }
        }
        
        return entities;
    }
}
