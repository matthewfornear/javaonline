/**
 * Entity Utilities - Centralized entity name resolution and common entity operations
 */
class EntityUtils {
    /**
     * Get formatted entity name for display
     * @param {Entity} entity - Entity to get name for
     * @returns {string} Formatted entity name
     */
    static getEntityName(entity) {
        if (entity.type === 'player') return 'You';
        
        // Get monster type from ID
        let monsterType = 'monster';
        if (entity.id) {
            if (entity.id.includes('goblin')) monsterType = 'goblin';
            else if (entity.id.includes('orc')) monsterType = 'orc';
            else if (entity.id.includes('troll')) monsterType = 'troll';
            else if (entity.id.includes('skeleton')) monsterType = 'skeleton';
            else if (entity.id.includes('dragon')) monsterType = 'dragon';
        }
        
        // Fallback: check monsterType property if it exists
        if (entity.monsterType) {
            monsterType = entity.monsterType;
        }
        
        // Return proper name with article
        const article = ['a', 'e', 'i', 'o', 'u'].includes(monsterType[0]) ? 'an' : 'a';
        return `${article} ${monsterType}`;
    }

    /**
     * Get monster name without article (for internal use)
     * @param {Entity} entity - Entity to get name for
     * @returns {string} Monster name without article
     */
    static getMonsterType(entity) {
        if (entity.type === 'player') return 'player';
        
        // Get monster type from ID
        let monsterType = 'monster';
        if (entity.id) {
            if (entity.id.includes('goblin')) monsterType = 'goblin';
            else if (entity.id.includes('orc')) monsterType = 'orc';
            else if (entity.id.includes('troll')) monsterType = 'troll';
            else if (entity.id.includes('skeleton')) monsterType = 'skeleton';
            else if (entity.id.includes('dragon')) monsterType = 'dragon';
        }
        
        // Fallback: check monsterType property if it exists
        if (entity.monsterType) {
            monsterType = entity.monsterType;
        }
        
        return monsterType;
    }

    /**
     * Get entity level with fallback logic
     * @param {Entity} entity - Entity to get level for
     * @returns {number} Entity level
     */
    static getEntityLevel(entity) {
        const level = entity.getComponent('level');
        return level ? (level.value || level.level || 1) : 1;
    }

    /**
     * Get entity health info
     * @param {Entity} entity - Entity to get health for
     * @returns {Object} Health info {current, max}
     */
    static getEntityHealth(entity) {
        const health = entity.getComponent('health');
        return {
            current: health ? health.current : 0,
            max: health ? health.max : 0
        };
    }

    /**
     * Check if entity is a monster
     * @param {Entity} entity - Entity to check
     * @returns {boolean} True if entity is a monster
     */
    static isMonster(entity) {
        return entity.type === 'monster';
    }

    /**
     * Check if entity is the player
     * @param {Entity} entity - Entity to check
     * @returns {boolean} True if entity is the player
     */
    static isPlayer(entity) {
        return entity.type === 'player';
    }
}
