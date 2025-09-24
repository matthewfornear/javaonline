/**
 * Character Progress module for handling stats, leveling, and progression
 */
class CharacterProgress {
    constructor() {
        this.experienceTable = this.initializeExperienceTable();
        this.statBonuses = this.initializeStatBonuses();
    }

    /**
     * Initialize experience table for leveling
     * @returns {Array} Experience requirements for each level
     */
    initializeExperienceTable() {
        // Experience required for each level (1-indexed)
        return [
            0,    // Level 1
            100,  // Level 2
            250,  // Level 3
            450,  // Level 4
            700,  // Level 5
            1000, // Level 6
            1350, // Level 7
            1750, // Level 8
            2200, // Level 9
            2700, // Level 10
            3250, // Level 11
            3850, // Level 12
            4500, // Level 13
            5200, // Level 14
            5950, // Level 15
            6750, // Level 16
            7600, // Level 17
            8500, // Level 18
            9450, // Level 19
            10450 // Level 20
        ];
    }

    /**
     * Initialize stat bonus tables
     * @returns {Object} Stat bonus configurations
     */
    initializeStatBonuses() {
        return {
            strength: {
                damage: 0.8,      // +0.8 damage per point (higher scaling)
                carryWeight: 2     // +2 carry weight per point
            },
            dexterity: {
                speed: 0.1,       // +0.1 speed per point
                dodge: 0.8,       // +0.8% dodge chance per point (higher)
                accuracy: 0.8     // +0.8% accuracy per point (higher)
            },
            intelligence: {
                mana: 2,          // +2 mana per point
                spellPower: 0.3,  // +0.3 spell power per point
                experience: 0.05  // +5% experience gain per point
            },
            constitution: {
                health: 4,        // +4 health per point (higher)
                regen: 0.1,       // +0.1 health regen per point
                resistance: 0.3   // +0.3% damage resistance per point (higher)
            }
        };
    }

    /**
     * Calculate experience required for a level
     * @param {number} level - Target level
     * @returns {number} Experience required
     */
    getExperienceForLevel(level) {
        if (level <= 0) return 0;
        if (level > this.experienceTable.length) {
            // Calculate for levels beyond the table
            const baseExp = this.experienceTable[this.experienceTable.length - 1];
            const extraLevels = level - this.experienceTable.length;
            return baseExp + (extraLevels * 500); // +500 exp per level after 20
        }
        return this.experienceTable[level - 1];
    }

    /**
     * Add experience to a character
     * @param {Entity} entity - Character entity
     * @param {number} experience - Experience to add
     * @returns {Object} Level up information
     */
    addExperience(entity, experience) {
        const levelComponent = entity.getComponent('level');
        if (!levelComponent) return { leveledUp: false, newLevel: levelComponent.value };

        const oldLevel = levelComponent.value;
        levelComponent.experience += experience;

        // Check for level up
        const leveledUp = this.checkLevelUp(entity);
        
        return {
            leveledUp,
            oldLevel,
            newLevel: levelComponent.value,
            experienceGained: experience
        };
    }

    /**
     * Check if character should level up and handle it
     * @param {Entity} entity - Character entity
     * @returns {boolean} True if leveled up
     */
    checkLevelUp(entity) {
        const levelComponent = entity.getComponent('level');
        if (!levelComponent) return false;

        const currentLevel = levelComponent.value;
        const requiredExp = this.getExperienceForLevel(currentLevel + 1);
        
        if (levelComponent.experience >= requiredExp) {
            this.performLevelUp(entity);
            return true;
        }
        
        return false;
    }

    /**
     * Perform level up for a character
     * @param {Entity} entity - Character entity
     */
    performLevelUp(entity) {
        const levelComponent = entity.getComponent('level');
        const statsComponent = entity.getComponent('stats');
        const healthComponent = entity.getComponent('health');
        
        if (!levelComponent || !statsComponent) return;

        levelComponent.value++;
        levelComponent.experienceToNext = this.getExperienceForLevel(levelComponent.value + 1) - levelComponent.experience;

        // Increase stats
        this.increaseStats(entity);

        // Restore health and mana
        if (healthComponent) {
            const constitution = statsComponent.constitution || 10;
            const healthIncrease = this.statBonuses.constitution.health;
            healthComponent.max += healthIncrease;
            healthComponent.current = healthComponent.max; // Full heal on level up
        }

        // Add mana if character has it
        const manaComponent = entity.getComponent('mana');
        if (manaComponent) {
            const intelligence = statsComponent.intelligence || 10;
            const manaIncrease = this.statBonuses.intelligence.mana;
            manaComponent.max += manaIncrease;
            manaComponent.current = manaComponent.max; // Full mana on level up
        }

        console.log(`${entity.id} leveled up to level ${levelComponent.value}!`);
    }

    /**
     * Increase character stats on level up
     * @param {Entity} entity - Character entity
     */
    increaseStats(entity) {
        const statsComponent = entity.getComponent('stats');
        if (!statsComponent) return;

        // Random stat increases (1-3 points total)
        const totalPoints = Math.floor(Math.random() * 3) + 1;
        const stats = ['strength', 'dexterity', 'intelligence', 'constitution'];
        
        for (let i = 0; i < totalPoints; i++) {
            const stat = stats[Math.floor(Math.random() * stats.length)];
            statsComponent[stat] = (statsComponent[stat] || 10) + 1;
        }
    }

    /**
     * Calculate damage based on stats and weapon (EverQuest 1 style)
     * @param {Entity} entity - Attacking entity
     * @param {Object} weapon - Weapon component (optional) - DEPRECATED, use equipment system
     * @returns {number} Calculated damage
     */
    calculateDamage(entity, weapon = null) {
        // This method is now deprecated - use EquipmentSystem.calculateDamage instead
        const statsComponent = entity.getComponent('stats');
        if (!statsComponent) return 1;

        let baseDamage = 1;
        let strengthBonus = 0;

        if (weapon) {
            baseDamage = weapon.damage || 1;
        }

        if (statsComponent.strength) {
            // Much lower strength scaling for more balanced damage
            strengthBonus = Math.floor((statsComponent.strength - 10) * 0.2); // Only bonus above 10
        }

        // Lower weapon multiplier for balance
        const weaponMultiplier = weapon ? 1.2 : 1.0;
        const totalDamage = Math.floor((baseDamage + strengthBonus) * weaponMultiplier);
        
        // Add damage variance (EverQuest style) - 60% to 140% of base damage
        const variance = 0.6 + (Math.random() * 0.8);
        const finalDamage = Math.floor(totalDamage * variance);
        
        return Math.max(1, finalDamage);
    }

    /**
     * Calculate defense based on stats and armor
     * @param {Entity} entity - Defending entity
     * @param {Object} armor - Armor component (optional)
     * @returns {number} Calculated defense
     */
    calculateDefense(entity, armor = null) {
        let baseDefense = 0;
        let constitutionBonus = 0;

        const statsComponent = entity.getComponent('stats');
        if (statsComponent && statsComponent.constitution) {
            constitutionBonus = statsComponent.constitution * this.statBonuses.constitution.resistance;
        }

        if (armor) {
            baseDefense = armor.defense || 0;
        }

        return baseDefense + constitutionBonus;
    }

    /**
     * Calculate speed based on stats and equipment
     * @param {Entity} entity - Entity
     * @returns {number} Calculated speed
     */
    calculateSpeed(entity) {
        const statsComponent = entity.getComponent('stats');
        if (!statsComponent) return 10;

        let baseSpeed = 10;
        let dexterityBonus = 0;

        if (statsComponent.dexterity) {
            dexterityBonus = statsComponent.dexterity * this.statBonuses.dexterity.speed;
        }

        return Math.max(1, baseSpeed + dexterityBonus);
    }

    /**
     * Calculate dodge chance based on stats
     * @param {Entity} entity - Entity
     * @returns {number} Dodge chance (0-100)
     */
    calculateDodgeChance(entity) {
        const statsComponent = entity.getComponent('stats');
        if (!statsComponent || !statsComponent.dexterity) return 0;

        return Math.min(50, statsComponent.dexterity * this.statBonuses.dexterity.dodge);
    }

    /**
     * Calculate accuracy based on stats
     * @param {Entity} entity - Entity
     * @returns {number} Accuracy (0-100)
     */
    calculateAccuracy(entity) {
        const statsComponent = entity.getComponent('stats');
        if (!statsComponent || !statsComponent.dexterity) return 60; // Lower base accuracy

        // Much lower base accuracy, more dependent on stats
        const baseAccuracy = 50;
        const dexBonus = statsComponent.dexterity * 0.8; // Higher dexterity scaling
        const finalAccuracy = Math.min(85, baseAccuracy + dexBonus); // Lower cap
        
        return finalAccuracy;
    }

    /**
     * Calculate maximum health based on stats
     * @param {Entity} entity - Entity
     * @returns {number} Maximum health
     */
    calculateMaxHealth(entity) {
        const statsComponent = entity.getComponent('stats');
        if (!statsComponent) return 100;

        const constitution = statsComponent.constitution || 10;
        return 50 + (constitution * this.statBonuses.constitution.health);
    }

    /**
     * Calculate maximum mana based on stats
     * @param {Entity} entity - Entity
     * @returns {number} Maximum mana
     */
    calculateMaxMana(entity) {
        const statsComponent = entity.getComponent('stats');
        if (!statsComponent) return 50;

        const intelligence = statsComponent.intelligence || 10;
        return 20 + (intelligence * this.statBonuses.intelligence.mana);
    }

    /**
     * Apply stat bonuses to an entity
     * @param {Entity} entity - Entity to apply bonuses to
     */
    applyStatBonuses(entity) {
        const statsComponent = entity.getComponent('stats');
        if (!statsComponent) return;

        // Update health
        const healthComponent = entity.getComponent('health');
        if (healthComponent) {
            const newMaxHealth = this.calculateMaxHealth(entity);
            const healthRatio = healthComponent.current / healthComponent.max;
            healthComponent.max = newMaxHealth;
            healthComponent.current = Math.floor(healthComponent.max * healthRatio);
        }

        // Update mana
        const manaComponent = entity.getComponent('mana');
        if (manaComponent) {
            const newMaxMana = this.calculateMaxMana(entity);
            const manaRatio = manaComponent.current / manaComponent.max;
            manaComponent.max = newMaxMana;
            manaComponent.current = Math.floor(manaComponent.max * manaRatio);
        }

        // Update speed
        const speedComponent = entity.getComponent('speed');
        if (speedComponent) {
            speedComponent.value = this.calculateSpeed(entity);
        }
    }

    /**
     * Get character's current level
     * @param {Entity} entity - Character entity
     * @returns {number} Current level
     */
    getLevel(entity) {
        const levelComponent = entity.getComponent('level');
        return levelComponent ? levelComponent.value : 1;
    }

    /**
     * Get character's current experience
     * @param {Entity} entity - Character entity
     * @returns {number} Current experience
     */
    getExperience(entity) {
        const levelComponent = entity.getComponent('level');
        return levelComponent ? levelComponent.experience : 0;
    }

    /**
     * Get experience required for next level
     * @param {Entity} entity - Character entity
     * @returns {number} Experience required for next level
     */
    getExperienceToNext(entity) {
        const levelComponent = entity.getComponent('level');
        if (!levelComponent) return 0;

        const currentLevel = levelComponent.value;
        const requiredExp = this.getExperienceForLevel(currentLevel + 1);
        return requiredExp - levelComponent.experience;
    }

    /**
     * Get character's stat value
     * @param {Entity} entity - Character entity
     * @param {string} statName - Stat name
     * @returns {number} Stat value
     */
    getStat(entity, statName) {
        const statsComponent = entity.getComponent('stats');
        return statsComponent ? (statsComponent[statName] || 0) : 0;
    }

    /**
     * Set character's stat value
     * @param {Entity} entity - Character entity
     * @param {string} statName - Stat name
     * @param {number} value - New stat value
     */
    setStat(entity, statName, value) {
        const statsComponent = entity.getComponent('stats');
        if (statsComponent) {
            statsComponent[statName] = Math.max(1, value);
            this.applyStatBonuses(entity);
        }
    }

    /**
     * Get character's total stat points
     * @param {Entity} entity - Character entity
     * @returns {number} Total stat points
     */
    getTotalStats(entity) {
        const statsComponent = entity.getComponent('stats');
        if (!statsComponent) return 0;

        return Object.values(statsComponent).reduce((total, stat) => total + stat, 0);
    }

    /**
     * Reset character to level 1
     * @param {Entity} entity - Character entity
     */
    resetCharacter(entity) {
        const levelComponent = entity.getComponent('level');
        const statsComponent = entity.getComponent('stats');
        const healthComponent = entity.getComponent('health');

        if (levelComponent) {
            levelComponent.value = 1;
            levelComponent.experience = 0;
            levelComponent.experienceToNext = this.getExperienceForLevel(2);
        }

        if (statsComponent) {
            statsComponent.strength = 10;
            statsComponent.dexterity = 10;
            statsComponent.intelligence = 10;
            statsComponent.constitution = 10;
        }

        if (healthComponent) {
            healthComponent.max = this.calculateMaxHealth(entity);
            healthComponent.current = healthComponent.max;
        }

        this.applyStatBonuses(entity);
    }
}
