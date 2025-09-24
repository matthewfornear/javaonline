/**
 * Skills System for handling weapon and combat skill progression
 */
class SkillsSystem {
    constructor() {
        this.skillCategories = {
            weapon: [
                '1h_slash', '2h_slash', '1h_blunt', '2h_blunt',
                '1h_pierce', '2h_pierce', 'hand_to_hand'
            ],
            defensive: ['dodge', 'block'],
            combat: ['offense', 'defense']
        };
        
        // Weapon type to skill mapping
        this.weaponSkillMapping = {
            'sword': '1h_slash',
            'longsword': '2h_slash',
            'mace': '1h_blunt',
            'warhammer': '2h_blunt',
            'dagger': '1h_pierce',
            'spear': '2h_pierce',
            'unarmed': 'hand_to_hand'
        };
    }

    /**
     * Initialize skills for an entity
     * @param {Entity} entity - Entity to initialize skills for
     */
    initializeEntity(entity) {
        const skills = {};
        
        // Initialize all weapon skills (10% skillup chance)
        for (const skill of this.skillCategories.weapon) {
            skills[skill] = { level: 0, experience: 0, maxExperience: 20 };
        }
        
        // Initialize defensive skills (10% skillup chance)
        for (const skill of this.skillCategories.defensive) {
            skills[skill] = { level: 0, experience: 0, maxExperience: 20 };
        }
        
        // Initialize combat skills (10% skillup chance)
        for (const skill of this.skillCategories.combat) {
            skills[skill] = { level: 0, experience: 0, maxExperience: 20 };
        }
        
        entity.addComponent('skills', skills);
    }

    /**
     * Get weapon skill for a weapon type
     * @param {Entity} entity - Entity
     * @param {string} weaponType - Type of weapon
     * @returns {number} Skill level
     */
    getWeaponSkill(entity, weaponType) {
        const skills = entity.getComponent('skills');
        if (!skills) return 0;
        
        const skillName = this.weaponSkillMapping[weaponType] || '1h_slash';
        return skills[skillName] ? skills[skillName].level : 0;
    }

    /**
     * Get defensive skill
     * @param {Entity} entity - Entity
     * @param {string} skillType - 'dodge' or 'block'
     * @returns {number} Skill level
     */
    getDefensiveSkill(entity, skillType) {
        const skills = entity.getComponent('skills');
        if (!skills) return 0;
        
        return skills[skillType] ? skills[skillType].level : 0;
    }

    /**
     * Get combat skill
     * @param {Entity} entity - Entity
     * @param {string} skillType - 'offense' or 'defense'
     * @returns {number} Skill level
     */
    getCombatSkill(entity, skillType) {
        const skills = entity.getComponent('skills');
        if (!skills) return 0;
        
        return skills[skillType] ? skills[skillType].level : 0;
    }

    /**
     * Gain skill experience
     * @param {Entity} entity - Entity
     * @param {string} skillName - Skill name
     * @param {number} experience - Experience gained
     * @returns {boolean} True if skill leveled up
     */
    gainSkillExperience(entity, skillName, experience) {
        const skills = entity.getComponent('skills');
        if (!skills || !skills[skillName]) {
            console.log(`No skills component or skill ${skillName} not found for entity ${entity.id}`);
            return false;
        }
        
        const skill = skills[skillName];
        const oldLevel = skill.level;
        
        // Check if skill is at level cap
        const playerLevel = entity.getComponent('level');
        const maxSkillLevel = playerLevel ? playerLevel.value * 5 : 5; // Cap at level * 5
        
        if (skill.level >= maxSkillLevel) {
            console.log(`Skill ${skillName} is at level cap (${maxSkillLevel})`);
            return false;
        }
        
        skill.experience += experience;
        
        console.log(`Gained ${experience} experience in ${skillName}. Current: ${skill.experience}/${skill.maxExperience}, Level: ${skill.level}`);
        
        // Check for level up
        let leveledUp = false;
        while (skill.experience >= skill.maxExperience && skill.level < maxSkillLevel) {
            skill.experience -= skill.maxExperience;
            skill.level++;
            skill.maxExperience = Math.floor(skill.maxExperience * 1.1); // Increase requirement by 10%
            leveledUp = true;
            console.log(`SKILL LEVEL UP! ${skillName} is now level ${skill.level}`);
        }
        
        // Add combat log message and play sound if skill leveled up
        if (leveledUp && entity.type === 'player') {
            const skillDisplayName = this.getSkillDisplayName(skillName);
            const message = `Your ${skillDisplayName} skill increased to ${skill.level}!`;
            
            console.log(`Adding skillup message: ${message}`);
            
            if (window.game && window.game.addCombatMessage) {
                window.game.addCombatMessage(message, 'skillup', '#98FB98'); // Pastel green for skill ups
            }
            
            // Play skillup sound effect
            if (window.game && window.game.audioSystem) {
                window.game.audioSystem.playSkillupSound();
            }
        }
        
        return leveledUp;
    }

    /**
     * Get display name for skill
     * @param {string} skillName - Internal skill name
     * @returns {string} Display name
     */
    getSkillDisplayName(skillName) {
        const displayNames = {
            '1h_slash': '1-Handed Slash',
            '2h_slash': '2-Handed Slash',
            '1h_blunt': '1-Handed Blunt',
            '2h_blunt': '2-Handed Blunt',
            '1h_pierce': '1-Handed Pierce',
            '2h_pierce': '2-Handed Pierce',
            'hand_to_hand': 'Hand to Hand',
            'dodge': 'Dodge',
            'block': 'Block',
            'offense': 'Offense',
            'defense': 'Defense'
        };
        
        return displayNames[skillName] || skillName;
    }

    /**
     * Apply skill bonuses to combat calculations
     * @param {Entity} entity - Entity
     * @param {Object} weapon - Weapon being used
     * @returns {Object} Skill bonuses
     */
    getSkillBonuses(entity, weapon) {
        const bonuses = {
            damage: 0,
            hitChance: 0,
            dodgeChance: 0,
            blockChance: 0,
            defense: 0
        };
        
        const skills = entity.getComponent('skills');
        if (!skills) return bonuses;
        
        // Weapon skill bonus
        if (weapon) {
            const weaponSkill = this.weaponSkillMapping[weapon.type] || '1h_slash';
            const skillLevel = skills[weaponSkill] ? skills[weaponSkill].level : 0;
            
            // Weapon skill affects damage and hit chance
            bonuses.damage += skillLevel * 0.5; // +0.5 damage per skill level
            bonuses.hitChance += skillLevel * 2; // +2% hit chance per skill level
        }
        
        // Dodge skill
        const dodgeLevel = skills.dodge ? skills.dodge.level : 0;
        bonuses.dodgeChance = dodgeLevel * 1.5; // +1.5% dodge per level
        
        // Block skill (only if holding a shield)
        const equipment = entity.getComponent('equipment');
        if (equipment && equipment.secondary && equipment.secondary.type === 'shield') {
            const blockLevel = skills.block ? skills.block.level : 0;
            bonuses.blockChance = blockLevel * 2; // +2% block per level
            bonuses.defense += blockLevel * 0.3; // +0.3 defense per block level
        }
        
        // Offense skill
        const offenseLevel = skills.offense ? skills.offense.level : 0;
        bonuses.damage += offenseLevel * 0.3; // +0.3 damage per offense level
        bonuses.hitChance += offenseLevel * 1; // +1% hit chance per offense level
        
        // Defense skill
        const defenseLevel = skills.defense ? skills.defense.level : 0;
        bonuses.defense += defenseLevel * 0.5; // +0.5 defense per defense level
        
        return bonuses;
    }

    /**
     * Get all skills for display
     * @param {Entity} entity - Entity
     * @returns {Object} All skills organized by category
     */
    getAllSkills(entity) {
        const skills = entity.getComponent('skills');
        if (!skills) return {};
        
        return {
            weapon: {},
            defensive: {},
            combat: {}
        };
    }

    /**
     * Update skill display names for UI
     * @param {string} skillName - Internal skill name
     * @returns {string} Display name
     */
    getSkillDisplayName(skillName) {
        const displayNames = {
            '1h_slash': '1H Slash',
            '2h_slash': '2H Slash',
            '1h_blunt': '1H Blunt',
            '2h_blunt': '2H Blunt',
            '1h_pierce': '1H Pierce',
            '2h_pierce': '2H Pierce',
            'hand_to_hand': 'Hand-to-Hand',
            'dodge': 'Dodge',
            'block': 'Block',
            'offense': 'Offense',
            'defense': 'Defense'
        };
        
        return displayNames[skillName] || skillName;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillsSystem;
}
