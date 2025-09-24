/**
 * Projectile System for handling projectile movement and effects
 */
class ProjectileSystem {
    constructor() {
        this.spells = null; // Will be injected
    }

    /**
     * Set spells module
     * @param {Spells} spells - Spells module
     */
    setSpells(spells) {
        this.spells = spells;
    }

    /**
     * Process projectile movement and effects
     * @param {Entity} entity - Projectile entity
     * @param {World} world - Game world
     */
    processEntity(entity, world) {
        if (entity.type !== 'projectile') return;
        
        const projectile = entity.getComponent('projectile');
        if (!projectile) return;
        
        // Move projectile towards target
        this.moveProjectile(entity, world);
        
        // Check for collisions
        this.checkCollisions(entity, world);
        
        // Check if projectile should be removed
        this.checkProjectileLifetime(entity, world);
    }

    /**
     * Move projectile towards its target
     * @param {Entity} entity - Projectile entity
     * @param {World} world - Game world
     */
    moveProjectile(entity, world) {
        const projectile = entity.getComponent('projectile');
        if (!projectile) return;
        
        const targetX = projectile.targetX;
        const targetY = projectile.targetY;
        
        // Calculate direction
        const dx = targetX - entity.x;
        const dy = targetY - entity.y;
        
        if (dx === 0 && dy === 0) {
            // Reached target
            this.handleProjectileHit(entity, world);
            return;
        }
        
        // Normalize direction
        const moveX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
        const moveY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
        
        const newX = entity.x + moveX;
        const newY = entity.y + moveY;
        
        // Check if new position is valid
        if (this.isValidPosition(newX, newY, world)) {
            entity.setPosition(newX, newY);
            projectile.distanceTraveled++;
        } else {
            // Hit something, handle collision
            this.handleProjectileHit(entity, world);
        }
    }

    /**
     * Check for projectile collisions
     * @param {Entity} entity - Projectile entity
     * @param {World} world - Game world
     */
    checkCollisions(entity, world) {
        const projectile = entity.getComponent('projectile');
        if (!projectile) return;
        
        // Check for entity collisions
        const entitiesAtPosition = world.getEntitiesAt(entity.x, entity.y);
        for (const target of entitiesAtPosition) {
            if (target.id !== projectile.ownerId && target.active) {
                this.handleProjectileHit(entity, world, target);
                return;
            }
        }
    }

    /**
     * Check if projectile should be removed due to lifetime
     * @param {Entity} entity - Projectile entity
     * @param {World} world - Game world
     */
    checkProjectileLifetime(entity, world) {
        const projectile = entity.getComponent('projectile');
        if (!projectile) return;
        
        // Check if projectile has traveled too far
        if (projectile.distanceTraveled >= projectile.range) {
            this.handleProjectileHit(entity, world);
        }
    }

    /**
     * Handle projectile hit
     * @param {Entity} entity - Projectile entity
     * @param {World} world - Game world
     * @param {Entity} target - Target entity (optional)
     */
    handleProjectileHit(entity, world, target = null) {
        const projectile = entity.getComponent('projectile');
        if (!projectile) return;
        
        // Apply damage if there's a target
        if (target) {
            this.applyProjectileDamage(entity, target, world);
        }
        
        // Apply spell effects if it's a spell projectile
        if (projectile.spell && this.spells) {
            this.applySpellEffects(entity, target, world);
        }
        
        // Remove projectile
        world.removeEntity(entity.id);
    }

    /**
     * Apply projectile damage to target
     * @param {Entity} projectile - Projectile entity
     * @param {Entity} target - Target entity
     * @param {World} world - Game world
     */
    applyProjectileDamage(projectile, target, world) {
        const projectileComponent = projectile.getComponent('projectile');
        if (!projectileComponent) return;
        
        const damage = projectileComponent.damage || 1;
        const health = target.getComponent('health');
        
        if (health) {
            health.current = Math.max(0, health.current - damage);
            console.log(`${target.id} takes ${damage} damage from projectile`);
            
            // Check if target is dead
            if (health.current <= 0) {
                this.handleTargetDeath(target, world);
            }
        }
    }

    /**
     * Apply spell effects from projectile
     * @param {Entity} projectile - Projectile entity
     * @param {Entity} target - Target entity
     * @param {World} world - Game world
     */
    applySpellEffects(projectile, target, world) {
        const projectileComponent = projectile.getComponent('projectile');
        if (!projectileComponent || !projectileComponent.spell) return;
        
        const spell = projectileComponent.spell;
        if (spell.onHit) {
            this.spells.executeSpellEffects(target, spell.onHit, target.x, target.y, world);
        }
    }

    /**
     * Handle target death
     * @param {Entity} target - Dead target
     * @param {World} world - Game world
     */
    handleTargetDeath(target, world) {
        console.log(`${target.id} has died!`);
        
        // Play death sound effect
        if (window.game && window.game.audioSystem) {
            window.game.audioSystem.playDeathSound();
        }
        
        // Give experience if player killed the target
        if (target.type === 'monster' && world.player) {
            this.giveExperience(world.player, target);
        }
        
        // Drop loot if monster
        if (target.type === 'monster') {
            this.dropLoot(target, world);
        }
        
        // Remove target from world
        world.removeEntity(target.id);
    }

    /**
     * Give experience to player
     * @param {Entity} player - Player entity
     * @param {Entity} target - Dead target
     */
    giveExperience(player, target) {
        const level = target.getComponent('level');
        if (!level) return;
        
        const experience = level.value * 10;
        console.log(`Player gains ${experience} experience!`);
        
        // Note: Experience handling would be done by the combat system
        // This is just for logging
    }

    /**
     * Drop loot from target
     * @param {Entity} target - Dead target
     * @param {World} world - Game world
     */
    dropLoot(target, world) {
        const loot = target.getComponent('loot');
        if (!loot) return;
        
        // Drop gold
        if (loot.gold) {
            const goldAmount = Math.floor(Math.random() * (loot.gold.max - loot.gold.min + 1)) + loot.gold.min;
            if (goldAmount > 0) {
                const goldId = `gold_${Date.now()}_${Math.random()}`;
                const gold = new Entity(goldId, 'item', target.x, target.y);
                gold.addComponent('item', {
                    type: 'gold',
                    value: goldAmount
                });
                gold.addComponent('appearance', {
                    char: '$',
                    color: '#FFD700'
                });
                world.addEntity(gold);
            }
        }
    }

    /**
     * Check if position is valid for projectile
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {World} world - Game world
     * @returns {boolean} True if position is valid
     */
    isValidPosition(x, y, world) {
        // Check bounds
        if (x < 0 || x >= world.width || y < 0 || y >= world.height) {
            return false;
        }
        
        // Check if position is passable
        if (!world.isPassable(x, y)) {
            return false;
        }
        
        return true;
    }

    /**
     * Create a projectile
     * @param {Entity} caster - Entity creating the projectile
     * @param {Object} projectileData - Projectile data
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {World} world - Game world
     * @returns {Entity} Created projectile entity
     */
    createProjectile(caster, projectileData, targetX, targetY, world) {
        const projectileId = `projectile_${Date.now()}_${Math.random()}`;
        const projectile = new Entity(projectileId, 'projectile', caster.x, caster.y);
        
        projectile.addComponent('projectile', {
            ...projectileData,
            targetX,
            targetY,
            ownerId: caster.id,
            distanceTraveled: 0
        });
        
        projectile.addComponent('appearance', {
            char: projectileData.char || '*',
            color: projectileData.color || '#ffffff'
        });
        
        world.addEntity(projectile);
        return projectile;
    }

    /**
     * Get all projectiles in the world
     * @param {World} world - Game world
     * @returns {Array} Array of projectile entities
     */
    getProjectiles(world) {
        return world.getEntitiesByType('projectile');
    }

    /**
     * Remove all projectiles from the world
     * @param {World} world - Game world
     */
    clearProjectiles(world) {
        const projectiles = this.getProjectiles(world);
        for (const projectile of projectiles) {
            world.removeEntity(projectile.id);
        }
    }

    /**
     * Get projectiles owned by a specific entity
     * @param {string} ownerId - Owner entity ID
     * @param {World} world - Game world
     * @returns {Array} Array of projectile entities
     */
    getProjectilesByOwner(ownerId, world) {
        const projectiles = this.getProjectiles(world);
        return projectiles.filter(projectile => {
            const projectileComponent = projectile.getComponent('projectile');
            return projectileComponent && projectileComponent.ownerId === ownerId;
        });
    }
}
