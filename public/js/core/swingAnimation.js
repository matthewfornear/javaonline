/**
 * Swing Animation Entity for visual attack effects
 */
class SwingAnimation extends Entity {
    constructor(id, attacker, target, weaponType = 'sword') {
        // Position animation directly over the target
        super(id, 'swing_animation', target.x, target.y);
        
        this.attacker = attacker;
        this.target = target;
        this.weaponType = weaponType;
        this.startX = attacker.x;
        this.startY = attacker.y;
        this.endX = target.x;
        this.endY = target.y;
        
        // Animation properties - shorter duration since no movement
        this.duration = 8; // frames - shorter since no travel time
        this.currentFrame = 0;
        this.speed = 0; // No movement - appears directly over target
        
        // No movement calculation needed - appears directly over target
        this.dx = 0;
        this.dy = 0;
        
        // Get appropriate swing character based on weapon type
        this.swingChar = this.getSwingCharacter(weaponType);
        // Get swing color based on target (white for monsters, red for player)
        this.swingColor = this.getSwingColorForTarget(target);
        
        // Add animation component
        this.addComponent('animation', {
            type: 'swing',
            duration: this.duration,
            currentFrame: this.currentFrame
        });
    }
    
    /**
     * Get swing character based on weapon type
     * @param {string} weaponType - Type of weapon
     * @returns {string} Character to display
     */
    getSwingCharacter(weaponType) {
        const swingChars = {
            sword: ['/', '|', '\\', '-', '|', '/', '\\', '-'],
            axe: ['>', '>', '>', '>', '>', '>', '>', '>'],
            mace: ['*', '*', '*', '*', '*', '*', '*', '*'],
            dagger: ['-', '-', '-', '-', '-', '-', '-', '-'],
            staff: ['|', '|', '|', '|', '|', '|', '|', '|'],
            bow: ['→', '→', '→', '→', '→', '→', '→', '→'],
            default: ['/', '|', '\\', '-', '|', '/', '\\', '-']
        };
        
        return swingChars[weaponType] || swingChars.default;
    }
    
    /**
     * Get swing color based on target type
     * @param {Entity} target - Target entity
     * @returns {string} Color for swing effect
     */
    getSwingColorForTarget(target) {
        // White swings against monsters (red), red swings against player (white)
        if (target.type === 'player') {
            return '#FF0000'; // Red for attacks against player
        } else if (target.type === 'monster') {
            return '#FFFFFF'; // White for attacks against monsters
        } else {
            return '#FFFFFF'; // Default white
        }
    }

    /**
     * Get swing color based on weapon type (legacy method)
     * @param {string} weaponType - Type of weapon
     * @returns {string} Color for swing effect
     */
    getSwingColor(weaponType) {
        const swingColors = {
            sword: '#FFFFFF', // Bright white
            axe: '#FF6600',   // Bright orange
            mace: '#FFFF00',  // Bright yellow
            dagger: '#00FFFF', // Bright cyan
            staff: '#00FF00',  // Bright green
            bow: '#FF00FF',    // Bright magenta
            default: '#FFFFFF' // Bright white
        };
        
        return swingColors[weaponType] || swingColors.default;
    }
    
    /**
     * Update the swing animation
     * @returns {boolean} True if animation is complete
     */
    update() {
        this.currentFrame++;
        
        // No movement - animation stays over target
        this.x = this.endX;
        this.y = this.endY;
        
        // Check if animation duration is complete
        const isComplete = this.currentFrame >= this.duration;
        
        if (isComplete) {
            this.active = false;
        }
        
        return isComplete;
    }
    
    /**
     * Get current swing character for this frame
     * @returns {string} Character to display
     */
    getCurrentChar() {
        const frameIndex = Math.min(this.currentFrame, this.swingChar.length - 1);
        return this.swingChar[frameIndex];
    }
    
    /**
     * Get current color with fade effect
     * @returns {string} Color with alpha based on progress
     */
    getCurrentColor() {
        const progress = this.currentFrame / this.duration;
        const alpha = Math.max(0, 1 - progress); // Fade out as animation progresses
        
        // For now, just return the base color since HTML doesn't support alpha in color strings
        // We'll handle the fade effect differently
        return this.swingColor;
    }
    
    /**
     * Get weapon type from attacker's equipment
     * @param {Entity} attacker - Attacking entity
     * @returns {string} Weapon type
     */
    static getWeaponTypeFromAttacker(attacker) {
        const equipment = attacker.getComponent('equipment');
        if (equipment && equipment.weapon) {
            return equipment.weapon.type || 'sword';
        }
        return 'sword'; // Default weapon type
    }
}
