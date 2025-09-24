/**
 * Monster class - extends Entity for monster-specific functionality
 */
class Monster extends Entity {
    constructor(id, x, y, monsterType = 'goblin') {
        super(id, 'monster', x, y);
        this.monsterType = monsterType;
        this.initializeMonster();
    }

    /**
     * Initialize monster with type-specific components
     */
    initializeMonster() {
        // This will be called by the character generator
        // to add the appropriate components based on monster type
    }

    /**
     * Get monster type
     * @returns {string} Monster type
     */
    getMonsterType() {
        return this.monsterType;
    }

    /**
     * Set monster type
     * @param {string} type - Monster type
     */
    setMonsterType(type) {
        this.monsterType = type;
    }

    /**
     * Check if monster has noticed the player
     * @returns {boolean} True if noticed
     */
    hasNoticedPlayer() {
        const notice = this.getComponent('notice');
        return notice ? notice.hasNoticed : false;
    }

    /**
     * Check if monster is suspicious (notice timer > 0)
     * @returns {boolean} True if suspicious
     */
    isSuspicious() {
        const notice = this.getComponent('notice');
        return notice ? notice.noticeTimer > 0 : false;
    }

    /**
     * Get monster display name
     * @returns {string} Display name
     */
    getDisplayName() {
        const appearance = this.getComponent('appearance');
        if (appearance && appearance.name) {
            return appearance.name;
        }
        return this.monsterType.charAt(0).toUpperCase() + this.monsterType.slice(1);
    }
}
