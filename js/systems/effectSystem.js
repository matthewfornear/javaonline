/**
 * Effect System for handling status effects and buffs/debuffs
 */
class EffectSystem {
    constructor() {
        this.spells = null; // Will be injected
        this.activeEffects = new Map(); // entityId -> effects array
    }

    /**
     * Set spells module
     * @param {Spells} spells - Spells module
     */
    setSpells(spells) {
        this.spells = spells;
    }

    /**
     * Process effects for an entity
     * @param {Entity} entity - Entity to process effects for
     * @param {World} world - Game world
     */
    processEntity(entity, world) {
        if (!this.activeEffects.has(entity.id)) return;
        
        const effects = this.activeEffects.get(entity.id);
        const effectsToRemove = [];
        
        for (let i = 0; i < effects.length; i++) {
            const effect = effects[i];
            effect.remaining--;
            
            // Apply effect for this tick
            this.applyEffectTick(entity, effect, world);
            
            // Remove expired effects
            if (effect.remaining <= 0) {
                effectsToRemove.push(i);
            }
        }
        
        // Remove expired effects
        for (let i = effectsToRemove.length - 1; i >= 0; i--) {
            effects.splice(effectsToRemove[i], 1);
        }
        
        // Clean up empty effect arrays
        if (effects.length === 0) {
            this.activeEffects.delete(entity.id);
        }
    }

    /**
     * Apply effect for one tick
     * @param {Entity} entity - Target entity
     * @param {Object} effect - Effect data
     * @param {World} world - Game world
     */
    applyEffectTick(entity, effect, world) {
        switch (effect.type) {
            case 'damage':
                this.applyDamageEffect(entity, effect);
                break;
            case 'heal':
                this.applyHealEffect(entity, effect);
                break;
            case 'debuff':
                this.applyDebuffEffect(entity, effect);
                break;
            case 'buff':
                this.applyBuffEffect(entity, effect);
                break;
        }
    }

    /**
     * Apply damage effect
     * @param {Entity} entity - Target entity
     * @param {Object} effect - Effect data
     */
    applyDamageEffect(entity, effect) {
        const health = entity.getComponent('health');
        if (health) {
            health.current = Math.max(0, health.current - effect.damage);
            console.log(`${entity.id} takes ${effect.damage} damage from ${effect.name}`);
        }
    }

    /**
     * Apply heal effect
     * @param {Entity} entity - Target entity
     * @param {Object} effect - Effect data
     */
    applyHealEffect(entity, effect) {
        const health = entity.getComponent('health');
        if (health) {
            health.current = Math.min(health.max, health.current + effect.heal);
            console.log(`${entity.id} heals for ${effect.heal} health from ${effect.name}`);
        }
    }

    /**
     * Apply debuff effect
     * @param {Entity} entity - Target entity
     * @param {Object} effect - Effect data
     */
    applyDebuffEffect(entity, effect) {
        // Handle different debuff types
        switch (effect.name) {
            case 'slow':
                this.applySlowEffect(entity, effect);
                break;
            case 'stun':
                this.applyStunEffect(entity, effect);
                break;
            case 'poison':
                this.applyPoisonEffect(entity, effect);
                break;
        }
    }

    /**
     * Apply buff effect
     * @param {Entity} entity - Target entity
     * @param {Object} effect - Effect data
     */
    applyBuffEffect(entity, effect) {
        // Handle different buff types
        switch (effect.name) {
            case 'shield':
                this.applyShieldEffect(entity, effect);
                break;
            case 'regeneration':
                this.applyRegenerationEffect(entity, effect);
                break;
        }
    }

    /**
     * Apply slow effect
     * @param {Entity} entity - Target entity
     * @param {Object} effect - Effect data
     */
    applySlowEffect(entity, effect) {
        const speed = entity.getComponent('speed');
        if (speed) {
            // Reduce speed by modifier
            const originalSpeed = speed.originalValue || speed.value;
            speed.value = Math.max(1, originalSpeed * (effect.speedModifier || 0.5));
        }
    }

    /**
     * Apply stun effect
     * @param {Entity} entity - Target entity
     * @param {Object} effect - Effect data
     */
    applyStunEffect(entity, effect) {
        // Stun prevents action - this is handled by the scheduler
        // This is just for logging
        console.log(`${entity.id} is stunned and cannot act`);
    }

    /**
     * Apply poison effect
     * @param {Entity} entity - Target entity
     * @param {Object} effect - Effect data
     */
    applyPoisonEffect(entity, effect) {
        const health = entity.getComponent('health');
        if (health) {
            health.current = Math.max(0, health.current - effect.damage);
            console.log(`${entity.id} takes ${effect.damage} poison damage`);
        }
    }

    /**
     * Apply shield effect
     * @param {Entity} entity - Target entity
     * @param {Object} effect - Effect data
     */
    applyShieldEffect(entity, effect) {
        // Shield reduces incoming damage
        // This is handled by the combat system when calculating damage
        console.log(`${entity.id} is protected by a shield`);
    }

    /**
     * Apply regeneration effect
     * @param {Entity} entity - Target entity
     * @param {Object} effect - Effect data
     */
    applyRegenerationEffect(entity, effect) {
        const health = entity.getComponent('health');
        if (health) {
            health.current = Math.min(health.max, health.current + effect.heal);
            console.log(`${entity.id} regenerates ${effect.heal} health`);
        }
    }

    /**
     * Apply a status effect to an entity
     * @param {Entity} entity - Target entity
     * @param {string} effectName - Effect name
     * @param {number} duration - Effect duration
     * @param {Object} customData - Custom effect data
     */
    applyEffect(entity, effectName, duration, customData = {}) {
        if (!this.spells) return;
        
        const effect = this.spells.getEffect(effectName);
        if (!effect) {
            console.warn(`Unknown effect: ${effectName}`);
            return;
        }
        
        if (!this.activeEffects.has(entity.id)) {
            this.activeEffects.set(entity.id, []);
        }
        
        const effects = this.activeEffects.get(entity.id);
        effects.push({
            ...effect,
            ...customData,
            duration: duration,
            remaining: duration
        });
        
        console.log(`${entity.id} is affected by ${effectName} for ${duration} turns`);
    }

    /**
     * Remove a specific effect from an entity
     * @param {Entity} entity - Target entity
     * @param {string} effectName - Effect name to remove
     */
    removeEffect(entity, effectName) {
        if (!this.activeEffects.has(entity.id)) return;
        
        const effects = this.activeEffects.get(entity.id);
        const index = effects.findIndex(effect => effect.name === effectName);
        
        if (index !== -1) {
            effects.splice(index, 1);
            console.log(`${effectName} removed from ${entity.id}`);
        }
    }

    /**
     * Remove all effects from an entity
     * @param {Entity} entity - Target entity
     */
    removeAllEffects(entity) {
        this.activeEffects.delete(entity.id);
        console.log(`All effects removed from ${entity.id}`);
    }

    /**
     * Get active effects for an entity
     * @param {Entity} entity - Target entity
     * @returns {Array} Array of active effects
     */
    getActiveEffects(entity) {
        return this.activeEffects.get(entity.id) || [];
    }

    /**
     * Check if entity has a specific effect
     * @param {Entity} entity - Target entity
     * @param {string} effectName - Effect name
     * @returns {boolean} True if entity has the effect
     */
    hasEffect(entity, effectName) {
        const effects = this.getActiveEffects(entity);
        return effects.some(effect => effect.name === effectName);
    }

    /**
     * Check if entity can act (not stunned)
     * @param {Entity} entity - Target entity
     * @returns {boolean} True if entity can act
     */
    canAct(entity) {
        const effects = this.getActiveEffects(entity);
        const stunEffect = effects.find(effect => effect.name === 'stun');
        return !stunEffect;
    }

    /**
     * Get modified speed for an entity
     * @param {Entity} entity - Target entity
     * @returns {number} Modified speed
     */
    getModifiedSpeed(entity) {
        const speed = entity.getComponent('speed');
        if (!speed) return 10;
        
        const effects = this.getActiveEffects(entity);
        let modifiedSpeed = speed.value;
        
        // Apply slow effects
        for (const effect of effects) {
            if (effect.name === 'slow' && effect.speedModifier) {
                modifiedSpeed *= effect.speedModifier;
            }
        }
        
        return Math.max(1, modifiedSpeed);
    }

    /**
     * Get damage reduction from effects
     * @param {Entity} entity - Target entity
     * @returns {number} Damage reduction (0-1)
     */
    getDamageReduction(entity) {
        const effects = this.getActiveEffects(entity);
        let reduction = 0;
        
        // Apply shield effects
        for (const effect of effects) {
            if (effect.name === 'shield' && effect.damageReduction) {
                reduction += effect.damageReduction;
            }
        }
        
        return Math.min(1, reduction);
    }

    /**
     * Process all effects for all entities
     * @param {World} world - Game world
     */
    processAllEffects(world) {
        for (const entity of world.getAllEntities().values()) {
            if (entity.active) {
                this.processEntity(entity, world);
            }
        }
    }

    /**
     * Clear all effects
     */
    clearAllEffects() {
        this.activeEffects.clear();
    }

    /**
     * Get effect count for an entity
     * @param {Entity} entity - Target entity
     * @returns {number} Number of active effects
     */
    getEffectCount(entity) {
        return this.getActiveEffects(entity).length;
    }

    /**
     * Get effect by name for an entity
     * @param {Entity} entity - Target entity
     * @param {string} effectName - Effect name
     * @returns {Object|null} Effect data or null
     */
    getEffect(entity, effectName) {
        const effects = this.getActiveEffects(entity);
        return effects.find(effect => effect.name === effectName) || null;
    }
}
