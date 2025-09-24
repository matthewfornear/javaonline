/**
 * Spells module for data-driven spell/attack system
 */
class Spells {
    constructor() {
        this.spellDatabase = this.initializeSpellDatabase();
        this.effectDatabase = this.initializeEffectDatabase();
        this.activeEffects = new Map(); // entityId -> effects array
    }

    /**
     * Initialize spell database
     * @returns {Object} Spell database
     */
    initializeSpellDatabase() {
        return {
            firebolt: {
                name: "Firebolt",
                type: "projectile",
                manaCost: 5,
                damage: 8,
                speed: 12,
                range: 8,
                char: '*',
                color: '#FF4500',
                onHit: [
                    { type: 'damage', value: 8 },
                    { type: 'applyEffect', effect: 'burn', duration: 3 }
                ],
                description: "A fiery projectile that burns enemies"
            },
            iceShard: {
                name: "Ice Shard",
                type: "projectile",
                manaCost: 4,
                damage: 6,
                speed: 10,
                range: 6,
                char: '^',
                color: '#00BFFF',
                onHit: [
                    { type: 'damage', value: 6 },
                    { type: 'applyEffect', effect: 'slow', duration: 2 }
                ],
                description: "A freezing projectile that slows enemies"
            },
            heal: {
                name: "Heal",
                type: "instant",
                manaCost: 8,
                range: 0,
                char: '+',
                color: '#00FF00',
                onCast: [
                    { type: 'heal', value: 15 },
                    { type: 'applyEffect', effect: 'regeneration', duration: 5 }
                ],
                description: "Restores health and provides regeneration"
            },
            lightning: {
                name: "Lightning",
                type: "instant",
                manaCost: 12,
                damage: 15,
                range: 5,
                char: '~',
                color: '#FFFF00',
                onCast: [
                    { type: 'damage', value: 15 },
                    { type: 'applyEffect', effect: 'stun', duration: 1 }
                ],
                description: "A powerful lightning bolt that stuns enemies"
            },
            teleport: {
                name: "Teleport",
                type: "instant",
                manaCost: 10,
                range: 10,
                char: 'T',
                color: '#800080',
                onCast: [
                    { type: 'teleport', range: 10 }
                ],
                description: "Instantly teleport to a nearby location"
            },
            magicMissile: {
                name: "Magic Missile",
                type: "projectile",
                manaCost: 3,
                damage: 4,
                speed: 15,
                range: 6,
                char: 'o',
                color: '#FF69B4',
                onHit: [
                    { type: 'damage', value: 4 }
                ],
                description: "A simple but reliable magical projectile"
            },
            poisonCloud: {
                name: "Poison Cloud",
                type: "area",
                manaCost: 15,
                damage: 3,
                range: 4,
                radius: 2,
                char: 'P',
                color: '#32CD32',
                onCast: [
                    { type: 'areaDamage', value: 3, radius: 2 },
                    { type: 'applyEffect', effect: 'poison', duration: 5 }
                ],
                description: "Creates a poisonous cloud that damages and poisons enemies"
            },
            shield: {
                name: "Shield",
                type: "buff",
                manaCost: 6,
                range: 0,
                char: 'S',
                color: '#C0C0C0',
                onCast: [
                    { type: 'applyEffect', effect: 'shield', duration: 10 }
                ],
                description: "Creates a protective shield that reduces incoming damage"
            }
        };
    }

    /**
     * Initialize effect database
     * @returns {Object} Effect database
     */
    initializeEffectDatabase() {
        return {
            burn: {
                name: "Burn",
                type: "damage",
                damage: 2,
                duration: 3,
                char: 'B',
                color: '#FF4500',
                description: "Takes fire damage each turn"
            },
            poison: {
                name: "Poison",
                type: "damage",
                damage: 1,
                duration: 5,
                char: 'P',
                color: '#32CD32',
                description: "Takes poison damage each turn"
            },
            slow: {
                name: "Slow",
                type: "debuff",
                speedModifier: 0.5,
                duration: 2,
                char: 'S',
                color: '#00BFFF',
                description: "Movement and action speed reduced"
            },
            stun: {
                name: "Stun",
                type: "debuff",
                canAct: false,
                duration: 1,
                char: '!',
                color: '#FFFF00',
                description: "Cannot act for one turn"
            },
            regeneration: {
                name: "Regeneration",
                type: "heal",
                heal: 3,
                duration: 5,
                char: 'R',
                color: '#00FF00',
                description: "Heals health each turn"
            },
            shield: {
                name: "Shield",
                type: "buff",
                damageReduction: 0.3,
                duration: 10,
                char: 'S',
                color: '#C0C0C0',
                description: "Reduces incoming damage by 30%"
            }
        };
    }

    /**
     * Cast a spell
     * @param {Entity} caster - Entity casting the spell
     * @param {string} spellName - Name of the spell
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {World} world - Game world
     * @returns {boolean} True if spell was cast successfully
     */
    castSpell(caster, spellName, targetX, targetY, world) {
        const spell = this.spellDatabase[spellName];
        if (!spell) {
            console.warn(`Unknown spell: ${spellName}`);
            return false;
        }

        // Check mana cost
        const manaComponent = caster.getComponent('mana');
        if (manaComponent && manaComponent.current < spell.manaCost) {
            console.log(`${caster.id} doesn't have enough mana to cast ${spellName}`);
            return false;
        }

        // Check range
        const distance = this.getDistance(caster.x, caster.y, targetX, targetY);
        if (spell.range > 0 && distance > spell.range) {
            console.log(`${spellName} is out of range`);
            return false;
        }

        // Consume mana
        if (manaComponent) {
            manaComponent.current -= spell.manaCost;
        }

        // Execute spell based on type
        switch (spell.type) {
            case 'projectile':
                this.createProjectile(caster, spell, targetX, targetY, world);
                break;
            case 'instant':
                this.executeInstantSpell(caster, spell, targetX, targetY, world);
                break;
            case 'area':
                this.executeAreaSpell(caster, spell, targetX, targetY, world);
                break;
            case 'buff':
                this.executeBuffSpell(caster, spell, targetX, targetY, world);
                break;
        }

        console.log(`${caster.id} cast ${spellName}`);
        return true;
    }

    /**
     * Create a projectile spell
     * @param {Entity} caster - Entity casting the spell
     * @param {Object} spell - Spell data
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {World} world - Game world
     */
    createProjectile(caster, spell, targetX, targetY, world) {
        const projectileId = `projectile_${Date.now()}_${Math.random()}`;
        const projectile = new Entity(projectileId, 'projectile', caster.x, caster.y);
        
        projectile.addComponent('projectile', {
            spell: spell,
            targetX,
            targetY,
            ownerId: caster.id,
            speed: spell.speed,
            range: spell.range,
            distanceTraveled: 0
        });

        projectile.addComponent('appearance', {
            char: spell.char,
            color: spell.color
        });

        world.addEntity(projectile);
    }

    /**
     * Execute an instant spell
     * @param {Entity} caster - Entity casting the spell
     * @param {Object} spell - Spell data
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {World} world - Game world
     */
    executeInstantSpell(caster, spell, targetX, targetY, world) {
        if (spell.onCast) {
            this.executeSpellEffects(caster, spell.onCast, targetX, targetY, world);
        }
    }

    /**
     * Execute an area spell
     * @param {Entity} caster - Entity casting the spell
     * @param {Object} spell - Spell data
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {World} world - Game world
     */
    executeAreaSpell(caster, spell, targetX, targetY, world) {
        const radius = spell.radius || 1;
        const affectedEntities = this.getEntitiesInRadius(world, targetX, targetY, radius);
        
        for (const entity of affectedEntities) {
            if (entity.id !== caster.id) {
                this.executeSpellEffects(entity, spell.onCast, targetX, targetY, world);
            }
        }
    }

    /**
     * Execute a buff spell
     * @param {Entity} caster - Entity casting the spell
     * @param {Object} spell - Spell data
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {World} world - Game world
     */
    executeBuffSpell(caster, spell, targetX, targetY, world) {
        if (spell.onCast) {
            this.executeSpellEffects(caster, spell.onCast, targetX, targetY, world);
        }
    }

    /**
     * Execute spell effects
     * @param {Entity} target - Target entity
     * @param {Array} effects - Array of effects to apply
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {World} world - Game world
     */
    executeSpellEffects(target, effects, targetX, targetY, world) {
        for (const effect of effects) {
            switch (effect.type) {
                case 'damage':
                    this.applyDamage(target, effect.value);
                    break;
                case 'heal':
                    this.applyHeal(target, effect.value);
                    break;
                case 'applyEffect':
                    this.applyStatusEffect(target, effect.effect, effect.duration);
                    break;
                case 'teleport':
                    this.teleportEntity(target, targetX, targetY, world);
                    break;
                case 'areaDamage':
                    this.applyAreaDamage(world, targetX, targetY, effect.value, effect.radius);
                    break;
            }
        }
    }

    /**
     * Apply damage to an entity
     * @param {Entity} entity - Target entity
     * @param {number} damage - Damage amount
     */
    applyDamage(entity, damage) {
        const healthComponent = entity.getComponent('health');
        if (healthComponent) {
            healthComponent.current = Math.max(0, healthComponent.current - damage);
            console.log(`${entity.id} takes ${damage} damage`);
        }
    }

    /**
     * Apply healing to an entity
     * @param {Entity} entity - Target entity
     * @param {number} heal - Heal amount
     */
    applyHeal(entity, heal) {
        const healthComponent = entity.getComponent('health');
        if (healthComponent) {
            healthComponent.current = Math.min(healthComponent.max, healthComponent.current + heal);
            console.log(`${entity.id} heals for ${heal} health`);
        }
    }

    /**
     * Apply a status effect to an entity
     * @param {Entity} entity - Target entity
     * @param {string} effectName - Effect name
     * @param {number} duration - Effect duration
     */
    applyStatusEffect(entity, effectName, duration) {
        const effect = this.effectDatabase[effectName];
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
            duration: duration,
            remaining: duration
        });

        console.log(`${entity.id} is affected by ${effectName} for ${duration} turns`);
    }

    /**
     * Teleport an entity to a location
     * @param {Entity} entity - Entity to teleport
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {World} world - Game world
     */
    teleportEntity(entity, x, y, world) {
        if (world.isPassable(x, y) && !world.isOccupied(x, y, entity.id)) {
            entity.setPosition(x, y);
            console.log(`${entity.id} teleported to (${x}, ${y})`);
        }
    }

    /**
     * Apply area damage
     * @param {World} world - Game world
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     * @param {number} damage - Damage amount
     * @param {number} radius - Damage radius
     */
    applyAreaDamage(world, x, y, damage, radius) {
        const entities = this.getEntitiesInRadius(world, x, y, radius);
        for (const entity of entities) {
            this.applyDamage(entity, damage);
        }
    }

    /**
     * Get entities within a radius
     * @param {World} world - Game world
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     * @param {number} radius - Search radius
     * @returns {Array} Array of entities within radius
     */
    getEntitiesInRadius(world, x, y, radius) {
        const entities = [];
        for (const entity of world.getAllEntities().values()) {
            if (entity.active) {
                const distance = this.getDistance(x, y, entity.x, entity.y);
                if (distance <= radius) {
                    entities.push(entity);
                }
            }
        }
        return entities;
    }

    /**
     * Process all active effects for an entity
     * @param {Entity} entity - Entity to process effects for
     * @param {World} world - Game world
     */
    processEffects(entity, world) {
        if (!this.activeEffects.has(entity.id)) return;

        const effects = this.activeEffects.get(entity.id);
        const effectsToRemove = [];

        for (let i = 0; i < effects.length; i++) {
            const effect = effects[i];
            effect.remaining--;

            // Apply effect
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
                this.applyDamage(entity, effect.damage);
                break;
            case 'heal':
                this.applyHeal(entity, effect.heal);
                break;
            case 'debuff':
                // Handle debuff effects (slow, stun, etc.)
                break;
            case 'buff':
                // Handle buff effects (shield, etc.)
                break;
        }
    }

    /**
     * Get distance between two points
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
     * Get all available spells
     * @returns {Array} Array of spell names
     */
    getAvailableSpells() {
        return Object.keys(this.spellDatabase);
    }

    /**
     * Get spell data by name
     * @param {string} spellName - Spell name
     * @returns {Object|null} Spell data or null
     */
    getSpell(spellName) {
        return this.spellDatabase[spellName] || null;
    }

    /**
     * Get all available effects
     * @returns {Array} Array of effect names
     */
    getAvailableEffects() {
        return Object.keys(this.effectDatabase);
    }

    /**
     * Get effect data by name
     * @param {string} effectName - Effect name
     * @returns {Object|null} Effect data or null
     */
    getEffect(effectName) {
        return this.effectDatabase[effectName] || null;
    }

    /**
     * Get active effects for an entity
     * @param {string} entityId - Entity ID
     * @returns {Array} Array of active effects
     */
    getActiveEffects(entityId) {
        return this.activeEffects.get(entityId) || [];
    }

    /**
     * Clear all effects for an entity
     * @param {string} entityId - Entity ID
     */
    clearEffects(entityId) {
        this.activeEffects.delete(entityId);
    }

    /**
     * Add a new spell to the database
     * @param {string} name - Spell name
     * @param {Object} spell - Spell data
     */
    addSpell(name, spell) {
        this.spellDatabase[name] = spell;
    }

    /**
     * Add a new effect to the database
     * @param {string} name - Effect name
     * @param {Object} effect - Effect data
     */
    addEffect(name, effect) {
        this.effectDatabase[name] = effect;
    }
}
