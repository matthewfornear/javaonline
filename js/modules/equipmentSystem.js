/**
 * Equipment System for handling weapons, armor, and item generation
 * This will eventually be moved server-side for security
 */
class EquipmentSystem {
    constructor() {
        this.itemTemplates = this.initializeItemTemplates();
    }

    /**
     * Initialize item templates (will be server-side eventually)
     * @returns {Object} Item templates
     */
    initializeItemTemplates() {
        return {
            // Weapons
            weapons: {
                        rustyIronSword: {
                            name: 'Rusty Iron Sword',
                            type: 'weapon',
                            damage: 3,
                            speed: 1.6, // 5 second swing speed (8000/1.6 = 5000ms)
                            durability: 50,
                            value: 10,
                            description: 'A worn iron sword with some rust'
                        },
                        ironSword: {
                            name: 'Iron Sword',
                            type: 'weapon',
                            damage: 3, // Lower damage for balance
                            speed: 2.67, // 3 second swing speed (8000/2.67 = 3000ms)
                            durability: 100,
                            value: 25,
                            description: 'A well-made but heavy iron sword'
                        },
                steelSword: {
                    name: 'Steel Sword',
                    type: 'weapon',
                    damage: 7,
                    speed: 1.0,
                    durability: 150,
                    value: 50,
                    description: 'A sharp steel blade'
                },
                        orcAxe: {
                            name: 'Orc Axe',
                            type: 'weapon',
                            damage: 4, // Lower damage for balance
                            speed: 1.33, // 6 second swing speed
                            durability: 80,
                            value: 30,
                            description: 'A crude but effective axe'
                        },
                        trollClub: {
                            name: 'Troll Club',
                            type: 'weapon',
                            damage: 6, // Lower damage for balance
                            speed: 1.0, // 8 second swing speed
                            durability: 120,
                            value: 40,
                            description: 'A heavy wooden club'
                        },
                        dragonClaw: {
                            name: 'Dragon Claw',
                            type: 'weapon',
                            damage: 8, // Lower damage for balance
                            speed: 1.6, // 5 second swing speed
                            durability: 200,
                            value: 100,
                            description: 'A sharp dragon claw'
                        }
            },
            // Armor
            armor: {
                leatherArmor: {
                    name: 'Leather Tunic',
                    type: 'armor',
                    defense: 1,
                    durability: 60,
                    value: 15,
                    description: 'Basic leather protection'
                },
                chainMail: {
                    name: 'Chain Mail',
                    type: 'armor',
                    defense: 4,
                    durability: 100,
                    value: 35,
                    description: 'Interlocked metal rings'
                },
                plateArmor: {
                    name: 'Plate Armor',
                    type: 'armor',
                    defense: 6,
                    durability: 150,
                    value: 75,
                    description: 'Heavy metal plates'
                },
                dragonScale: {
                    name: 'Dragon Scale',
                    type: 'armor',
                    defense: 8,
                    durability: 300,
                    value: 200,
                    description: 'Tough dragon scales'
                }
            }
        };
    }

    /**
     * Create an item instance with randomized stats (server-side in production)
     * @param {string} itemId - Item template ID
     * @returns {Object} Item instance
     */
    createItem(itemId) {
        const template = this.getItemTemplate(itemId);
        if (!template) {
            console.error(`Item template not found: ${itemId}`);
            return null;
        }

        // Create a copy of the template
        const item = JSON.parse(JSON.stringify(template));
        
        // Add randomized stats (server-side in production)
        if (item.type === 'weapon') {
            // Randomize damage slightly (±10%)
            const damageVariance = 0.9 + (Math.random() * 0.2);
            item.damage = Math.floor(item.damage * damageVariance);
            
            // Randomize speed slightly (±5%)
            const speedVariance = 0.95 + (Math.random() * 0.1);
            item.speed = Math.round(item.speed * speedVariance * 100) / 100;
        } else if (item.type === 'armor') {
            // Randomize defense slightly (±10%) but ensure minimum of 1
            const defenseVariance = 0.9 + (Math.random() * 0.2);
            item.defense = Math.max(1, Math.floor(item.defense * defenseVariance));
        }

        // Add unique ID
        item.id = this.generateItemId();
        
        return item;
    }

    /**
     * Get item template by ID
     * @param {string} itemId - Item template ID
     * @returns {Object} Item template
     */
    getItemTemplate(itemId) {
        // Search through all item categories
        for (const category in this.itemTemplates) {
            if (this.itemTemplates[category][itemId]) {
                return this.itemTemplates[category][itemId];
            }
        }
        return null;
    }

    /**
     * Generate unique item ID (server-side in production)
     * @returns {string} Unique item ID
     */
    generateItemId() {
        return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Calculate damage based on STR, DEX, and weapon
     * @param {Entity} entity - Attacking entity
     * @returns {Object} Damage calculation result
     */
    calculateDamage(entity) {
        const stats = entity.getComponent('stats');
        const equipment = entity.getComponent('equipment');
        
        if (!stats) return { damage: 1, hitChance: 50, swingSpeed: 1.0 };

        let baseDamage = 1;
        let hitChance = 50; // Base hit chance
        let swingSpeed = 1.0; // Base swing speed

        // STR contributes to damage
        const strengthBonus = Math.floor((stats.strength - 10) * 0.5);
        baseDamage += strengthBonus;

        // DEX contributes to hit chance and swing speed
        const dexterityBonus = Math.floor((stats.dexterity - 10) * 0.3);
        hitChance += dexterityBonus;
        swingSpeed += (stats.dexterity - 10) * 0.02;

        // Weapon modifications (check both legacy and new slot structure)
        const weapon = equipment ? (equipment.primary || equipment.weapon) : null;
        if (weapon) {
            baseDamage += weapon.damage || 0;
            swingSpeed *= weapon.speed || 1.0;
            hitChance += Math.floor((weapon.damage || 0) * 0.5); // Better weapons are easier to hit with
            
            // Apply skill bonuses
            if (window.game && window.game.skillsSystem) {
                const skillBonuses = window.game.skillsSystem.getSkillBonuses(entity, weapon);
                baseDamage += skillBonuses.damage;
                hitChance += skillBonuses.hitChance;
            }
        }

        // Cap hit chance
        hitChance = Math.max(10, Math.min(95, hitChance));

        return {
            damage: Math.max(1, baseDamage),
            hitChance: hitChance,
            swingSpeed: Math.max(0.3, Math.min(2.0, swingSpeed)) // Reasonable speed limits
        };
    }

    /**
     * Calculate defense based on armor
     * @param {Entity} entity - Defending entity
     * @returns {number} Defense value
     */
    calculateDefense(entity) {
        const stats = entity.getComponent('stats');
        const equipment = entity.getComponent('equipment');
        
        let defense = 0;

        // Constitution provides natural defense
        if (stats) {
            defense += Math.floor((stats.constitution - 10) * 0.2);
        }

        // Armor defense (check both legacy and new slot structure)
        if (equipment) {
            // Legacy armor slot
            if (equipment.armor) {
                defense += equipment.armor.defense || 0;
            }
            
            // New equipment slots - sum defense from all armor pieces
            const armorSlots = ['helm', 'shoulder', 'chest', 'arms', 'legs', 'wrist1', 'wrist2', 'hands', 'feet'];
            for (const slot of armorSlots) {
                if (equipment[slot] && equipment[slot].defense) {
                    defense += equipment[slot].defense;
                }
            }
        }

        // Apply skill bonuses
        if (window.game && window.game.skillsSystem) {
            const skillBonuses = window.game.skillsSystem.getSkillBonuses(entity, null);
            defense += skillBonuses.defense;
        }

        return Math.max(0, defense);
    }

    /**
     * Equip an item to an entity
     * @param {Entity} entity - Entity to equip item
     * @param {Object} item - Item to equip
     * @returns {boolean} Success
     */
    equipItem(entity, item, slot = null) {
        if (!item || !item.type) return false;

        let equipment = entity.getComponent('equipment');
        if (!equipment) {
            // Initialize with new slot structure
            equipment = {
                helm: null,
                shoulder: null,
                neck: null,
                back: null,
                chest: null,
                arms: null,
                legs: null,
                wrist1: null,
                wrist2: null,
                hands: null,
                finger1: null,
                finger2: null,
                feet: null,
                primary: null,
                secondary: null,
                range: null,
                ammo: null
            };
            entity.addComponent('equipment', equipment);
        }

        // Use inventory system if available
        if (window.game && window.game.inventorySystem) {
            return window.game.inventorySystem.equipItem(entity, item, slot);
        }

        // Fallback to legacy system
        if (item.type === 'weapon') {
            equipment.primary = item;
        } else if (item.type === 'armor') {
            equipment.chest = item;
        } else if (item.type === 'accessory') {
            equipment.finger1 = item;
        } else {
            return false;
        }

        return true;
    }

    /**
     * Unequip an item from an entity
     * @param {Entity} entity - Entity to unequip from
     * @param {string} slot - Equipment slot ('weapon', 'armor', 'accessory')
     * @returns {Object} Unequipped item
     */
    unequipItem(entity, slot) {
        const equipment = entity.getComponent('equipment');
        if (!equipment) return null;

        // Use inventory system if available
        if (window.game && window.game.inventorySystem) {
            return window.game.inventorySystem.unequipItem(entity, slot);
        }

        // Fallback to legacy system
        const item = equipment[slot];
        equipment[slot] = null;
        
        return item;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EquipmentSystem;
}
