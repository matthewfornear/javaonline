/**
 * Combat System for handling combat mechanics
 */
class CombatSystem {
    constructor() {
        this.characterProgress = null; // Will be injected
        this.equipmentSystem = new EquipmentSystem();
        this.messageCallback = null; // Will be injected for colored messages
        this.renderer = null; // Will be injected for monster name resolution
    }

    /**
     * Set character progress module
     * @param {CharacterProgress} characterProgress - Character progress module
     */
    setCharacterProgress(characterProgress) {
        this.characterProgress = characterProgress;
    }

    /**
     * Set message callback for colored combat messages
     * @param {Function} callback - Function to call with (message, type, color)
     */
    setMessageCallback(callback) {
        this.messageCallback = callback;
    }

    /**
     * Set renderer for monster name resolution
     * @param {ASCIIRenderer} renderer - ASCII renderer instance
     */
    setRenderer(renderer) {
        this.renderer = renderer;
    }

    /**
     * Process combat for an entity
     * @param {Entity} entity - Entity to process
     * @param {World} world - Game world
     */
    processEntity(entity, world) {
        if (entity.type === 'monster') {
            this.processMonsterCombat(entity, world);
        }
    }

    /**
     * Process monster combat
     * @param {Entity} entity - Monster entity
     * @param {World} world - Game world
     */
    processMonsterCombat(entity, world) {
        const visibilityComponent = entity.getComponent('visibility');
        if (!visibilityComponent) return;

        // Only process monsters that are visible to the player
        if (!visibilityComponent.isVisible) return;

        const player = world.player;
        if (!player) return;

        const distance = entity.distanceTo(player);
        
        // Check if monster is adjacent to player
        if (distance <= 1.5) { // Adjacent or diagonal
            this.attackTarget(entity, player, world);
        }
    }

    /**
     * Attack a target
     * @param {Entity} attacker - Attacking entity
     * @param {Entity} target - Target entity
     * @param {World} world - Game world
     * @returns {boolean} True if attack was successful
     */
    attackTarget(attacker, target, world) {
        if (!this.canAttack(attacker, target)) {
            return false;
        }

        // Check attack cooldown (EverQuest 1 style - slow attacks)
        const now = Date.now();
        const lastAttack = attacker.getComponent('lastAttack') || { time: 0 };
        
        // Calculate attack speed based on equipment and stats
        const damageResult = this.equipmentSystem.calculateDamage(attacker);
        const baseAttackSpeed = 6400; // Base 6.4 seconds (20% faster)
        const attackSpeed = baseAttackSpeed / damageResult.swingSpeed; // Faster weapons = shorter cooldown
        
        if (now - lastAttack.time < attackSpeed) {
            return false; // Still on cooldown
        }

        // Update last attack time
        attacker.addComponent('lastAttack', { time: now });

        const damage = this.calculateDamage(attacker, target);
        const hit = this.rollToHit(attacker, target);
        
        if (hit) {
            // Check for block (only if target has a shield equipped)
            const blocked = this.checkBlock(target);
            let finalDamage = damage;
            
            if (blocked) {
                finalDamage = Math.floor(damage * 0.5); // Block reduces damage by 50%
                this.logBlock(target);
                
                // Gain block skill experience
                if (window.game && window.game.skillsSystem) {
                    window.game.skillsSystem.gainSkillExperience(target, 'block', 5);
                }
            }
            
            this.applyDamage(target, finalDamage);
            
            if (blocked) {
                this.logAttack(attacker, target, finalDamage, true);
            } else {
                this.logAttack(attacker, target, finalDamage);
            }
            
            // Create swing animation
            this.createSwingAnimation(attacker, target, world);
            
            // Interrupt player's rest if player is being attacked
            if (target.type === 'player' && window.game && window.game.interruptResting) {
                window.game.interruptResting();
            }
            
            // Check if target is dead
            if (this.isDead(target)) {
                this.handleDeath(target, world);
            }
            
            // Gain weapon skill experience for attacker
            this.gainWeaponSkillExperience(attacker);
            
            return true;
        } else {
            this.logMiss(attacker, target);
            
            // Create swing animation even for misses
            this.createSwingAnimation(attacker, target, world);
            
            // Check if target dodged and gain dodge experience
            const dodgeChance = this.calculateDodge(target);
            if (Math.random() * 100 < dodgeChance) {
                this.logDodge(target);
                
                // Gain dodge skill experience
                if (window.game && window.game.skillsSystem) {
                    window.game.skillsSystem.gainSkillExperience(target, 'dodge', 3);
                }
            }
            
            return false;
        }
    }

    /**
     * Check if attacker can attack target
     * @param {Entity} attacker - Attacking entity
     * @param {Entity} target - Target entity
     * @returns {boolean} True if can attack
     */
    canAttack(attacker, target) {
        if (!attacker.active || !target.active) return false;
        if (attacker.id === target.id) return false;
        
        // Check if target is dead
        if (this.isDead(target)) return false;
        
        return true;
    }

    /**
     * Calculate damage for an attack
     * @param {Entity} attacker - Attacking entity
     * @param {Entity} target - Target entity
     * @returns {number} Damage amount
     */
    calculateDamage(attacker, target) {
        // Use the new equipment system for damage calculation
        const damageResult = this.equipmentSystem.calculateDamage(attacker);
        let baseDamage = damageResult.damage;
        
        // Apply defense
        const defense = this.calculateDefense(target);
        const finalDamage = Math.max(1, baseDamage - defense);
        
        // Debug logging removed
        
        return finalDamage;
    }

    /**
     * Calculate defense for an entity
     * @param {Entity} entity - Entity
     * @returns {number} Defense value
     */
    calculateDefense(entity) {
        // Use the new equipment system for defense calculation
        return this.equipmentSystem.calculateDefense(entity);
    }

    /**
     * Roll to hit (EverQuest 1 style - misses feel terrible)
     * @param {Entity} attacker - Attacking entity
     * @param {Entity} target - Target entity
     * @returns {boolean} True if hit
     */
    rollToHit(attacker, target) {
        // Calculate base hit chance from attacker's stats
        const attackerStats = attacker.getComponent('stats');
        const targetStats = target.getComponent('stats');
        
        if (!attackerStats || !targetStats) {
            return Math.random() < 0.5; // 50% default
        }
        
        // Base hit chance calculation
        let baseHitChance = 50; // Base 50% hit chance
        
        // Dexterity affects accuracy (attacker's ability to hit)
        const dexBonus = (attackerStats.dexterity - 10) * 2; // +2% per point above 10
        
        // Agility affects dodge (target's ability to avoid)
        const dodge = this.calculateDodge(target);
        
        // Calculate final hit chance
        const finalHitChance = Math.max(5, Math.min(95, baseHitChance + dexBonus - dodge));
        
        const roll = Math.random() * 100;
        return roll < finalHitChance;
    }

    /**
     * Calculate accuracy for an entity
     * @param {Entity} entity - Entity
     * @returns {number} Accuracy percentage
     */
    calculateAccuracy(entity) {
        if (this.characterProgress) {
            return this.characterProgress.calculateAccuracy(entity);
        }
        return 80; // Default accuracy
    }

    /**
     * Calculate dodge chance for an entity
     * @param {Entity} entity - Entity
     * @returns {number} Dodge percentage
     */
    calculateDodge(entity) {
        const statsComponent = entity.getComponent('stats');
        if (!statsComponent || !statsComponent.agility) {
            return 0; // Default dodge
        }
        
        // Agility-based dodge calculation
        // Higher agility = higher dodge chance
        // Base dodge is 0, each point of agility adds 2% dodge chance
        const baseDodge = 0;
        const agilityBonus = (statsComponent.agility - 10) * 2; // -10 because 10 is average
        let totalDodge = Math.max(0, baseDodge + agilityBonus);
        
        // Apply dodge skill bonus
        if (window.game && window.game.skillsSystem) {
            const skillBonuses = window.game.skillsSystem.getSkillBonuses(entity, null);
            totalDodge += skillBonuses.dodgeChance;
        }
        
        return Math.min(50, totalDodge); // Cap dodge at 50%
    }

    /**
     * Check if target blocks the attack
     * @param {Entity} target - Defending entity
     * @returns {boolean} True if blocked
     */
    checkBlock(target) {
        const equipment = target.getComponent('equipment');
        if (!equipment || !equipment.secondary || equipment.secondary.type !== 'shield') {
            return false; // No shield equipped
        }
        
        // Get block skill bonus
        let blockChance = 0;
        if (window.game && window.game.skillsSystem) {
            const skillBonuses = window.game.skillsSystem.getSkillBonuses(target, null);
            blockChance = skillBonuses.blockChance;
        }
        
        // Base block chance is 10% + skill bonus
        const totalBlockChance = 10 + blockChance;
        return Math.random() * 100 < totalBlockChance;
    }

    /**
     * Gain weapon skill experience for attacker
     * @param {Entity} attacker - Attacking entity
     */
    gainWeaponSkillExperience(attacker) {
        if (!window.game || !window.game.skillsSystem) {
            console.log('Skills system not available');
            return;
        }
        
        const equipment = attacker.getComponent('equipment');
        const weapon = equipment ? (equipment.weapon || equipment.primary) : null;
        
        if (weapon) {
            // Determine weapon skill based on weapon type
            const weaponType = weapon.type || 'sword';
            const skillName = window.game.skillsSystem.weaponSkillMapping[weaponType] || '1h_slash';
            
            console.log(`Gaining weapon skill experience: ${skillName} for weapon type: ${weaponType}`);
            
            // Gain experience (more for successful hits)
            const leveledUp = window.game.skillsSystem.gainSkillExperience(attacker, skillName, 2);
            console.log(`Weapon skill ${skillName} leveled up: ${leveledUp}`);
            
            // Also gain offense skill experience
            const offenseLeveledUp = window.game.skillsSystem.gainSkillExperience(attacker, 'offense', 1);
            console.log(`Offense skill leveled up: ${offenseLeveledUp}`);
        } else {
            console.log('No weapon found for skill experience');
        }
    }

    /**
     * Apply damage to an entity
     * @param {Entity} entity - Target entity
     * @param {number} damage - Damage amount
     */
    applyDamage(entity, damage) {
        const health = entity.getComponent('health');
        if (health) {
            const oldHealth = health.current;
            health.current = Math.max(0, health.current - damage);
            const actualDamage = oldHealth - health.current;
            
            // Damage is already logged in logAttack method
            
            // Add visual hit feedback
            this.addHitEffect(entity);
        }
    }

    /**
     * Add visual hit effect to entity
     * @param {Entity} entity - Entity that was hit
     */
    addHitEffect(entity) {
        // Add a temporary hit effect component
        entity.addComponent('hitEffect', {
            duration: 3, // 3 frames
            remaining: 3
        });
    }

    /**
     * Create a swing animation from attacker to target
     * @param {Entity} attacker - Attacking entity
     * @param {Entity} target - Target entity
     * @param {World} world - Game world
     */
    createSwingAnimation(attacker, target, world) {
        try {
            // Get weapon type from attacker's equipment
            const weaponType = SwingAnimation.getWeaponTypeFromAttacker(attacker);
            
            // Create unique ID for the swing animation
            const swingId = `swing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Create the swing animation entity
            const swingAnimation = new SwingAnimation(swingId, attacker, target, weaponType);
            
            // Add it to the world
            world.addEntity(swingAnimation);
        } catch (error) {
            console.error('Error creating swing animation:', error);
        }
    }

    /**
     * Check if entity is dead
     * @param {Entity} entity - Entity to check
     * @returns {boolean} True if dead
     */
    isDead(entity) {
        const health = entity.getComponent('health');
        return health ? health.current <= 0 : false;
    }

    /**
     * Handle entity death
     * @param {Entity} entity - Dead entity
     * @param {World} world - Game world
     */
    handleDeath(entity, world) {
        // Play death sound effect
        if (window.game && window.game.audioSystem) {
            window.game.audioSystem.playDeathSound();
        }
        
        // Entity death handled
        
        // Give experience if player killed monster
        if (entity.type === 'monster' && world.player) {
            this.giveExperience(world.player, entity);
        }
        
        // Create corpse if monster
        if (entity.type === 'monster') {
            this.createCorpse(entity, world);
        }
        
        // Remove entity from world
        world.removeEntity(entity.id);
    }

    /**
     * Create a corpse from a dead monster
     * @param {Entity} monster - Dead monster
     * @param {World} world - Game world
     */
    createCorpse(monster, world) {
        const corpseId = `corpse_${monster.id}`;
        const corpse = new Entity(corpseId, 'corpse', monster.x, monster.y);
        
        // Store the monster's loot data in the corpse
        const loot = monster.getComponent('loot');
        if (loot) {
            corpse.addComponent('loot', loot);
        }
        
        // Store monster type for display
        const appearance = monster.getComponent('appearance');
        if (appearance) {
            corpse.addComponent('appearance', {
                char: '%',
                color: '#8B4513' // Brown color for corpse
            });
        }
        
        // Add corpse component to track loot state
        corpse.addComponent('corpse', {
            monsterType: monster.monsterType || 'monster',
            looted: false
        });
        
        world.addEntity(corpse);
    }

    /**
     * Loot a corpse
     * @param {Entity} corpse - Corpse entity
     * @param {Entity} player - Player entity
     * @param {World} world - Game world
     */
    lootCorpse(corpse, player, world) {
        const corpseComponent = corpse.getComponent('corpse');
        if (!corpseComponent || corpseComponent.looted) {
            return false; // Already looted
        }
        
        const loot = corpse.getComponent('loot');
        if (!loot) {
            return false; // No loot to give
        }
        
        let looted = false;
        
        // Give gold to player
        if (loot.gold) {
            const goldAmount = Math.floor(Math.random() * (loot.gold.max - loot.gold.min + 1)) + loot.gold.min;
            if (goldAmount > 0) {
                // Add gold to player inventory (simplified - just add to a gold component)
                let playerGold = player.getComponent('gold');
                if (!playerGold) {
                    player.addComponent('gold', { amount: 0 });
                    playerGold = player.getComponent('gold');
                }
                playerGold.amount += goldAmount;
                
                // Add to XP/Loot tracking for Actions GUI only
                if (window.game && window.game.addXpLootMessage) {
                    window.game.addXpLootMessage(`+${goldAmount} gold`, '#ffd700');
                }
                looted = true;
            }
        }
        
        // Mark corpse as looted
        corpseComponent.looted = true;
        
        // Play loot sound effect if something was looted
        if (looted && window.game && window.game.audioSystem) {
            window.game.audioSystem.playLootSound();
        }
        
        // Remove corpse if looted
        if (looted) {
            world.removeEntity(corpse.id);
        }
        
        return looted;
    }

    /**
     * Drop loot from a monster
     * @param {Entity} monster - Dead monster
     * @param {World} world - Game world
     */
    dropLoot(monster, world) {
        const loot = monster.getComponent('loot');
        if (!loot) return;
        
        // Drop gold
        if (loot.gold) {
            const goldAmount = Math.floor(Math.random() * (loot.gold.max - loot.gold.min + 1)) + loot.gold.min;
            if (goldAmount > 0) {
                // Create gold item
                const goldId = `gold_${Date.now()}_${Math.random()}`;
                const gold = new Entity(goldId, 'item', monster.x, monster.y);
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
        
        // Drop items
        if (loot.items && loot.items.length > 0) {
            for (const itemType of loot.items) {
                if (Math.random() < 0.3) { // 30% chance to drop each item
                    const itemId = `item_${Date.now()}_${Math.random()}`;
                    const item = new Entity(itemId, 'item', monster.x, monster.y);
                    item.addComponent('item', {
                        type: itemType
                    });
                    world.addEntity(item);
                }
            }
        }
    }

    /**
     * Give experience to player for killing monster
     * @param {Entity} player - Player entity
     * @param {Entity} monster - Dead monster
     */
    giveExperience(player, monster) {
        if (!this.characterProgress) return;
        
        const level = monster.getComponent('level');
        if (!level) return;
        
        const experience = level.value * 10; // Base experience
        const result = this.characterProgress.addExperience(player, experience);
        
        // Add to XP/Loot tracking for Actions GUI only
        if (window.game && window.game.addXpLootMessage) {
            window.game.addXpLootMessage(`+${experience} XP`, '#dda0dd');
        }
        
        if (result.leveledUp) {
            this.addCombatLog(`Level up! You are now level ${result.newLevel}!`, 'levelup');
            console.log(`${player.id} leveled up to level ${result.newLevel}!`);
        }
    }

    /**
     * Log attack result (EverQuest 1 style - hits feel great)
     * @param {Entity} attacker - Attacking entity
     * @param {Entity} target - Target entity
     * @param {number} damage - Damage dealt
     */
    logAttack(attacker, target, damage) {
        const attackerName = this.getEntityName(attacker);
        const targetName = this.getEntityName(target);
        
        // Make hits feel more impactful with different messages based on damage
        let message;
        if (damage >= 20) {
            message = `${attackerName} CRUSH ${targetName} for ${damage} damage!`;
        } else if (damage >= 15) {
            message = `${attackerName} SMASH ${targetName} for ${damage} damage!`;
        } else if (damage >= 10) {
            message = `${attackerName} HIT ${targetName} for ${damage} damage!`;
        } else if (damage >= 5) {
            message = `${attackerName} strike ${targetName} for ${damage} damage!`;
        } else {
            message = `${attackerName} hit ${targetName} for ${damage} damage!`;
        }
        
        // Play hit sound effect
        if (window.game && window.game.audioSystem) {
            window.game.audioSystem.playHitSound();
        }
        
        // Determine color based on attacker type
        let color;
        if (attacker.type === 'player') {
            color = '#51cf66'; // Green for player hits
        } else {
            color = '#ff6b6b'; // Red for monster hits
        }
        
        if (this.messageCallback) {
            this.messageCallback(message, 'combat', color);
        }
    }

    /**
     * Log a blocked attack
     * @param {Entity} blocker - Entity that blocked
     */
    logBlock(blocker) {
        const blockerName = this.getEntityName(blocker);
        const message = `${blockerName} BLOCKS the attack!`;
        
        if (this.messageCallback) {
            this.messageCallback(message, 'combat', '#87ceeb'); // Light blue for block
        }
    }

    /**
     * Log a dodge
     * @param {Entity} dodger - Entity that dodged
     */
    logDodge(dodger) {
        const dodgerName = this.getEntityName(dodger);
        const message = `${dodgerName} DODGE the attack!`;
        
        if (this.messageCallback) {
            this.messageCallback(message, 'combat', '#ffd700'); // Gold for dodge
        }
    }

    /**
     * Log miss (EverQuest 1 style - misses feel terrible)
     * @param {Entity} attacker - Attacking entity
     * @param {Entity} target - Target entity
     */
    logMiss(attacker, target) {
        const attackerName = this.getEntityName(attacker);
        const targetName = this.getEntityName(target);
        
        // Play miss sound effect
        if (window.game && window.game.audioSystem) {
            window.game.audioSystem.playMissSound();
        }
        
        // Make misses feel terrible with different messages
        const missMessages = [
            `${attackerName} swing wildly and miss ${targetName}!`,
            `${attackerName} strike at ${targetName} but MISS!`,
            `${attackerName} attack ${targetName} but FAIL to connect!`,
            `${attackerName} swing at ${targetName} but hit only air!`,
            `${attackerName} attempt to hit ${targetName} but MISS!`
        ];
        
        const message = missMessages[Math.floor(Math.random() * missMessages.length)];
        
        // Misses are always light grey for both player and monsters
        if (this.messageCallback) {
            this.messageCallback(message, 'combat', '#cccccc');
        }
    }

    /**
     * Add message to combat log
     * @param {string} message - Message text
     * @param {string} type - Message type
     */
    addCombatLog(message, type = 'combat', color = '#ffffff') {
        if (window.game && window.game.addCombatMessage) {
            window.game.addCombatMessage(message, type, color);
        }
    }

    /**
     * Get entity name for logging
     * @param {Entity} entity - Entity
     * @returns {string} Entity name
     */
    getEntityName(entity) {
        return EntityUtils.getEntityName(entity);
    }

    /**
     * Get all entities in attack range
     * @param {Entity} attacker - Attacking entity
     * @param {World} world - Game world
     * @param {number} range - Attack range
     * @returns {Array} Array of entities in range
     */
    getEntitiesInRange(attacker, world, range = 1) {
        const entities = [];
        
        for (const entity of world.getAllEntities().values()) {
            if (entity.active && entity.id !== attacker.id) {
                const distance = attacker.distanceTo(entity);
                if (distance <= range) {
                    entities.push(entity);
                }
            }
        }
        
        return entities;
    }

    /**
     * Get all enemies of an entity
     * @param {Entity} entity - Entity
     * @param {World} world - Game world
     * @returns {Array} Array of enemy entities
     */
    getEnemies(entity, world) {
        const enemies = [];
        
        for (const other of world.getAllEntities().values()) {
            if (other.active && other.id !== entity.id && this.isEnemy(entity, other)) {
                enemies.push(other);
            }
        }
        
        return enemies;
    }

    /**
     * Check if two entities are enemies
     * @param {Entity} entity1 - First entity
     * @param {Entity} entity2 - Second entity
     * @returns {boolean} True if enemies
     */
    isEnemy(entity1, entity2) {
        // Player vs monsters
        if (entity1.type === 'player' && entity2.type === 'monster') return true;
        if (entity1.type === 'monster' && entity2.type === 'player') return true;
        
        // Monsters vs other monsters (optional)
        if (entity1.type === 'monster' && entity2.type === 'monster') return false;
        
        return false;
    }
}
