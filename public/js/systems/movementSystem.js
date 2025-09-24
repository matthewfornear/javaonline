/**
 * Movement System for handling entity movement and AI
 */
class MovementSystem {
    constructor() {
        this.directions = {
            'north': { x: 0, y: -1 },
            'south': { x: 0, y: 1 },
            'east': { x: 1, y: 0 },
            'west': { x: -1, y: 0 },
            'northeast': { x: 1, y: -1 },
            'northwest': { x: -1, y: -1 },
            'southeast': { x: 1, y: 1 },
            'southwest': { x: -1, y: 1 }
        };
    }

    /**
     * Process movement for an entity
     * @param {Entity} entity - Entity to process
     * @param {World} world - Game world
     */
    processEntity(entity, world) {
        if (entity.type === 'player') {
            // Player movement is handled by input system
            return;
        } else if (entity.type === 'monster') {
            this.processMonsterMovement(entity, world);
        } else if (entity.type === 'projectile') {
            this.processProjectileMovement(entity, world);
        }
    }

    /**
     * Process monster movement and AI
     * @param {Entity} entity - Monster entity
     * @param {World} world - Game world
     */
    processMonsterMovement(entity, world) {
        const aiComponent = entity.getComponent('ai');
        const noticeComponent = entity.getComponent('notice');
        const visibilityComponent = entity.getComponent('visibility');
        if (!aiComponent || !noticeComponent || !visibilityComponent) return;

        // Only process monsters that are visible to the player
        if (!visibilityComponent.isVisible) return;

        const player = world.player;
        if (!player) return;

        const distance = entity.distanceTo(player);
        const alertRange = noticeComponent.alertRange || 5;
        const aiRange = aiComponent.range || 5;

        // Check if player is in alert range and has line of sight
        // Note: Visibility check ensures monster is within player's FOV
        
        // Debug logging removed
        
        if (distance <= alertRange && this.hasLineOfSight(entity, player, world)) {
            if (!noticeComponent.hasNoticed) {
                // Start notice countdown
                noticeComponent.noticeTimer++;
                if (noticeComponent.noticeTimer >= noticeComponent.noticeDelay) {
                    noticeComponent.hasNoticed = true;
                    this.addCombatLog(`${this.getEntityName(entity)} becomes hostile!`, 'notice');
                } else if (noticeComponent.noticeTimer === 1) {
                    this.addCombatLog(`${this.getEntityName(entity)} begins to notice you...`, 'notice');
                }
            }
        } else {
            // Reset notice if player moves away, loses line of sight, or moves out of FOV
            if (noticeComponent.hasNoticed) {
                noticeComponent.hasNoticed = false;
                noticeComponent.noticeTimer = 0;
                this.addCombatLog(`${this.getEntityName(entity)} loses interest.`, 'notice');
            }
        }

        // Handle movement based on notice state
        if (noticeComponent.hasNoticed) {
            // Monster has noticed player - stand still during notice countdown, then charge
            if (noticeComponent.noticeTimer < noticeComponent.noticeDelay) {
                // Stand still while noticing
                return;
            } else {
                // Charge towards player using shortest path
                this.moveTowardsTarget(entity, player, world);
            }
        } else {
            // Very sedentary behavior when player is not noticed - only move occasionally
            if (Math.random() < 0.05) { // Only 5% chance to move each turn
                this.randomMovement(entity, world);
            }
        }
    }

    /**
     * Move entity towards a target using diagonal movement when appropriate
     * @param {Entity} entity - Entity to move
     * @param {Entity} target - Target entity
     * @param {World} world - Game world
     */
    moveTowardsTarget(entity, target, world) {
        const dx = target.x - entity.x;
        const dy = target.y - entity.y;
        
        // Calculate distance for diagonal movement decision
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If close enough, try to move directly towards target
        if (distance <= 1.5) {
            // Try diagonal movement first if both dx and dy are non-zero
            if (dx !== 0 && dy !== 0) {
                const diagonalX = entity.x + (dx > 0 ? 1 : -1);
                const diagonalY = entity.y + (dy > 0 ? 1 : -1);
                
                if (this.canMoveTo(entity, diagonalX, diagonalY, world)) {
                    entity.setPosition(diagonalX, diagonalY);
                    return;
                }
            }
            
            // Fall back to cardinal movement
            const moveX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
            const moveY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
            
            const newX = entity.x + moveX;
            const newY = entity.y + moveY;
            
            if (this.canMoveTo(entity, newX, newY, world)) {
                entity.setPosition(newX, newY);
            }
        } else {
            // For longer distances, use more sophisticated pathfinding
            // Try diagonal movement if both directions are needed
            if (Math.abs(dx) > Math.abs(dy)) {
                // Move horizontally first
                const moveX = dx > 0 ? 1 : -1;
                const newX = entity.x + moveX;
                const newY = entity.y;
                
                if (this.canMoveTo(entity, newX, newY, world)) {
                    entity.setPosition(newX, newY);
                }
            } else if (Math.abs(dy) > Math.abs(dx)) {
                // Move vertically first
                const moveY = dy > 0 ? 1 : -1;
                const newX = entity.x;
                const newY = entity.y + moveY;
                
                if (this.canMoveTo(entity, newX, newY, world)) {
                    entity.setPosition(newX, newY);
                }
            } else {
                // Equal distance - try diagonal movement
                const moveX = dx > 0 ? 1 : -1;
                const moveY = dy > 0 ? 1 : -1;
                const newX = entity.x + moveX;
                const newY = entity.y + moveY;
                
                if (this.canMoveTo(entity, newX, newY, world)) {
                    entity.setPosition(newX, newY);
                } else {
                    // Fall back to cardinal movement
                    const cardinalX = entity.x + moveX;
                    const cardinalY = entity.y;
                    
                    if (this.canMoveTo(entity, cardinalX, cardinalY, world)) {
                        entity.setPosition(cardinalX, cardinalY);
                    } else {
                        const fallbackX = entity.x;
                        const fallbackY = entity.y + moveY;
                        
                        if (this.canMoveTo(entity, fallbackX, fallbackY, world)) {
                            entity.setPosition(fallbackX, fallbackY);
                        }
                    }
                }
            }
        }
    }

    /**
     * Random movement for entities
     * @param {Entity} entity - Entity to move
     * @param {World} world - Game world
     */
    randomMovement(entity, world) {
        const directions = Object.values(this.directions);
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        
        const newX = entity.x + randomDir.x;
        const newY = entity.y + randomDir.y;
        
        if (this.canMoveTo(entity, newX, newY, world)) {
            entity.setPosition(newX, newY);
        }
    }

    /**
     * Process projectile movement
     * @param {Entity} entity - Projectile entity
     * @param {World} world - Game world
     */
    processProjectileMovement(entity, world) {
        const projectileComponent = entity.getComponent('projectile');
        if (!projectileComponent) return;

        const targetX = projectileComponent.targetX;
        const targetY = projectileComponent.targetY;
        
        // Move towards target
        const dx = targetX - entity.x;
        const dy = targetY - entity.y;
        
        if (dx === 0 && dy === 0) {
            // Reached target
            this.handleProjectileHit(entity, world);
            return;
        }
        
        const moveX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
        const moveY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
        
        const newX = entity.x + moveX;
        const newY = entity.y + moveY;
        
        // Check if projectile hit something
        const targetEntity = this.getEntityAt(world, newX, newY);
        if (targetEntity && targetEntity.id !== projectileComponent.ownerId) {
            this.handleProjectileHit(entity, world, targetEntity);
            return;
        }
        
        // Check if projectile hit a wall
        if (!world.isPassable(newX, newY)) {
            this.handleProjectileHit(entity, world);
            return;
        }
        
        // Move projectile
        entity.setPosition(newX, newY);
        projectileComponent.distanceTraveled++;
        
        // Check if projectile has traveled too far
        if (projectileComponent.distanceTraveled >= projectileComponent.range) {
            this.handleProjectileHit(entity, world);
        }
    }

    /**
     * Handle projectile hit
     * @param {Entity} projectile - Projectile entity
     * @param {World} world - Game world
     * @param {Entity} target - Target entity (optional)
     */
    handleProjectileHit(projectile, world, target = null) {
        const projectileComponent = projectile.getComponent('projectile');
        if (!projectileComponent) return;

        if (target) {
            // Apply damage to target
            const health = target.getComponent('health');
            if (health) {
                health.current = Math.max(0, health.current - projectileComponent.damage);
                console.log(`${target.id} takes ${projectileComponent.damage} damage from projectile`);
            }
        }
        
        // Remove projectile
        world.removeEntity(projectile.id);
    }

    /**
     * Check if entity can move to a position
     * @param {Entity} entity - Entity trying to move
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {World} world - Game world
     * @returns {boolean} True if entity can move there
     */
    canMoveTo(entity, x, y, world) {
        // Check bounds
        if (x < 0 || x >= world.width || y < 0 || y >= world.height) {
            return false;
        }
        
        // Check if position is passable
        if (!world.isPassable(x, y)) {
            return false;
        }
        
        // Check if position is occupied by another entity (except corpses)
        const entitiesAtPosition = world.getEntitiesAt(x, y);
        const blockingEntity = entitiesAtPosition.find(e => 
            e.active && e.id !== entity.id && e.type !== 'corpse'
        );
        
        if (blockingEntity) {
            return false;
        }
        
        return true;
    }

    /**
     * Get entity at a position
     * @param {World} world - Game world
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Entity|null} Entity at position or null
     */
    getEntityAt(world, x, y) {
        const entities = world.getEntitiesAt(x, y);
        return entities.length > 0 ? entities[0] : null;
    }

    /**
     * Move entity in a direction
     * @param {Entity} entity - Entity to move
     * @param {string} direction - Direction name
     * @param {World} world - Game world
     * @returns {boolean} True if movement was successful
     */
    moveInDirection(entity, direction, world) {
        const dir = this.directions[direction];
        if (!dir) return false;
        
        const newX = entity.x + dir.x;
        const newY = entity.y + dir.y;
        
        if (this.canMoveTo(entity, newX, newY, world)) {
            entity.setPosition(newX, newY);
            return true;
        }
        
        return false;
    }

    /**
     * Move entity to a specific position
     * @param {Entity} entity - Entity to move
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {World} world - Game world
     * @returns {boolean} True if movement was successful
     */
    moveToPosition(entity, x, y, world) {
        if (this.canMoveTo(entity, x, y, world)) {
            entity.setPosition(x, y);
            return true;
        }
        return false;
    }

    /**
     * Get path between two positions
     * @param {number} startX - Start X coordinate
     * @param {number} startY - Start Y coordinate
     * @param {number} endX - End X coordinate
     * @param {number} endY - End Y coordinate
     * @param {World} world - Game world
     * @returns {Array} Array of path positions
     */
    getPath(startX, startY, endX, endY, world) {
        return world.findPath(startX, startY, endX, endY);
    }

    /**
     * Get all valid moves for an entity
     * @param {Entity} entity - Entity
     * @param {World} world - Game world
     * @returns {Array} Array of valid move positions
     */
    getValidMoves(entity, world) {
        const moves = [];
        
        for (const direction of Object.values(this.directions)) {
            const newX = entity.x + direction.x;
            const newY = entity.y + direction.y;
            
            if (this.canMoveTo(entity, newX, newY, world)) {
                moves.push({ x: newX, y: newY });
            }
        }
        
        return moves;
    }

    /**
     * Get distance between two positions
     * @param {number} x1 - First X coordinate
     * @param {number} y1 - First Y coordinate
     * @param {number} x2 - Second X coordinate
     * @param {number} y2 - Second Y coordinate
     * @returns {number} Distance
     */
    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get Manhattan distance between two positions
     * @param {number} x1 - First X coordinate
     * @param {number} y1 - First Y coordinate
     * @param {number} x2 - Second X coordinate
     * @param {number} y2 - Second Y coordinate
     * @returns {number} Manhattan distance
     */
    getManhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    }

    /**
     * Add message to combat log
     * @param {string} message - Message text
     * @param {string} type - Message type
     */
    addCombatLog(message, type = 'combat') {
        if (window.game && window.game.addCombatMessage) {
            window.game.addCombatMessage(message, type);
        }
    }

    /**
     * Check if there's line of sight between two entities
     * @param {Entity} from - Starting entity
     * @param {Entity} to - Target entity
     * @param {World} world - Game world
     * @returns {boolean} True if line of sight exists
     */
    hasLineOfSight(from, to, world) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return true;
        
        // Use Bresenham's line algorithm for precise straight lines
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        const stepX = dx / steps;
        const stepY = dy / steps;
        
        // Check each step along the line
        for (let i = 1; i < steps; i++) {
            const checkX = Math.floor(from.x + stepX * i + 0.5);
            const checkY = Math.floor(from.y + stepY * i + 0.5);
            
            // If we hit a wall, no line of sight
            if (!world.isPassable(checkX, checkY)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get entity name for logging
     * @param {Entity} entity - Entity
     * @returns {string} Entity name
     */
    getEntityName(entity) {
        return EntityUtils.getEntityName(entity);
    }
}
