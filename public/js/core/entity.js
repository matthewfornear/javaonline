/**
 * Entity class representing game objects (player, monsters, projectiles, etc.)
 */
class Entity {
    constructor(id, type, x = 0, y = 0) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.nextAction = 0;
        this.components = new Map();
        this.active = true;
    }

    /**
     * Add a component to this entity
     * @param {string} name - Component name
     * @param {Object} component - Component data
     */
    addComponent(name, component) {
        this.components.set(name, component);
    }

    /**
     * Get a component from this entity
     * @param {string} name - Component name
     * @returns {Object|undefined} The component or undefined
     */
    getComponent(name) {
        return this.components.get(name);
    }

    /**
     * Check if entity has a component
     * @param {string} name - Component name
     * @returns {boolean} True if component exists
     */
    hasComponent(name) {
        return this.components.has(name);
    }

    /**
     * Remove a component from this entity
     * @param {string} name - Component name
     * @returns {boolean} True if component was removed
     */
    removeComponent(name) {
        return this.components.delete(name);
    }

    /**
     * Get the entity's position
     * @returns {Object} Position object with x and y
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * Set the entity's position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Get the entity's next action time
     * @returns {number} Next action time
     */
    getNextActionTime() {
        return this.nextAction;
    }

    /**
     * Set the entity's next action time
     * @param {number} time - Next action time
     */
    setNextActionTime(time) {
        this.nextAction = time;
    }

    /**
     * Calculate delay for next action based on entity speed
     * @returns {number} Delay in milliseconds
     */
    getActionDelay() {
        const speed = this.getComponent('speed');
        if (!speed) return 1000; // Default 1 second delay
        
        return Math.max(100, 1000 / speed.value); // Convert speed to delay
    }

    /**
     * Check if entity can act at the given time
     * @param {number} currentTime - Current game time
     * @returns {boolean} True if entity can act
     */
    canAct(currentTime) {
        return this.active && this.nextAction <= currentTime;
    }

    /**
     * Mark entity as inactive
     */
    deactivate() {
        this.active = false;
    }

    /**
     * Mark entity as active
     */
    activate() {
        this.active = true;
    }

    /**
     * Get distance to another entity
     * @param {Entity} other - Other entity
     * @returns {number} Distance
     */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get Manhattan distance to another entity
     * @param {Entity} other - Other entity
     * @returns {number} Manhattan distance
     */
    manhattanDistanceTo(other) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    /**
     * Serialize entity to JSON
     * @returns {Object} Serialized entity
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            nextAction: this.nextAction,
            active: this.active,
            components: Object.fromEntries(this.components)
        };
    }

    /**
     * Create entity from JSON
     * @param {Object} data - Serialized entity data
     * @returns {Entity} New entity instance
     */
    static fromJSON(data) {
        const entity = new Entity(data.id, data.type, data.x, data.y);
        entity.nextAction = data.nextAction;
        entity.active = data.active;
        entity.components = new Map(Object.entries(data.components));
        return entity;
    }
}
