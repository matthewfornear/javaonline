/**
 * Character Generator module for creating players and monsters
 */
class CharacterGenerator {
    constructor() {
        this.characterTemplates = this.initializeTemplates();
        this.equipmentSystem = new EquipmentSystem();
    }

    /**
     * Initialize character templates
     * @returns {Object} Character templates
     */
    initializeTemplates() {
        return {
            player: {
                type: 'player',
                char: '@',
                color: '#ffffff',
                components: {
                    health: { max: 50, current: 50 }, // Lower starting health
                    speed: { value: 2 }, // Slower player speed
                    level: { value: 1, experience: 0, experienceToNext: 100 },
                    stats: {
                        strength: 10,
                        dexterity: 10,
                        intelligence: 10,
                        constitution: 10,
                        agility: 15  // High agility for player
                    },
                    inventory: { items: new Array(8).fill(null), maxSize: 8 },
                    equipment: {
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
                        primary: {
                            name: 'Rusty Sword',
                            type: 'sword',
                            damage: 2,
                            speed: 2.72,
                            value: 10
                        },
                        secondary: null,
                        range: null,
                        ammo: null
                    }
                }
            },
            goblin: {
                type: 'monster',
                char: 'g',
                color: '#00ff00',
                components: {
                    health: { max: 10, current: 10 }, // 20% of player HP (50)
                    speed: { value: 1 }, // Much slower - 1 action per 10 seconds
                    level: { value: 1 },
                    stats: {
                        strength: 12,
                        dexterity: 14,
                        intelligence: 6,
                        constitution: 12,
                        agility: 8  // Low agility for goblin
                    },
                    equipment: {
                        weapon: null,
                        armor: null,
                        accessory: null
                    },
                    ai: { type: 'aggressive', range: 8 },
                    notice: { 
                        hasNoticed: false, 
                        noticeTimer: 0, 
                        noticeDelay: 10, 
                        alertRange: 5 
                    },
                    visibility: { 
                        isVisible: false 
                    },
                    loot: { gold: { min: 1, max: 5 }, items: [] }
                }
            },
            orc: {
                type: 'monster',
                char: 'o',
                color: '#8B4513',
                components: {
                    health: { max: 12, current: 12 }, // 24% of player HP (50)
                    speed: { value: 0.8 }, // Slower than goblin
                    level: { value: 2 },
                    stats: {
                        strength: 16,
                        dexterity: 10,
                        intelligence: 4,
                        constitution: 14,
                        agility: 6  // Very low agility for orc
                    },
                    equipment: {
                        weapon: null,
                        armor: null,
                        accessory: null
                    },
                    ai: { type: 'aggressive', range: 6 },
                    notice: { 
                        hasNoticed: false, 
                        noticeTimer: 0, 
                        noticeDelay: 10, 
                        alertRange: 6 
                    },
                    visibility: { 
                        isVisible: false 
                    },
                    loot: { gold: { min: 3, max: 10 }, items: [] }
                }
            },
            troll: {
                type: 'monster',
                char: 'T',
                color: '#696969',
                components: {
                    health: { max: 15, current: 15 }, // 30% of player HP (50)
                    speed: { value: 0.6 }, // Even slower
                    level: { value: 3 },
                    stats: {
                        strength: 20,
                        dexterity: 8,
                        intelligence: 3,
                        constitution: 18,
                        agility: 4  // Very low agility for troll
                    },
                    equipment: {
                        weapon: null,
                        armor: null,
                        accessory: null
                    },
                    ai: { type: 'aggressive', range: 10 },
                    notice: { 
                        hasNoticed: false, 
                        noticeTimer: 0, 
                        noticeDelay: 10, 
                        alertRange: 8 
                    },
                    visibility: { 
                        isVisible: false 
                    },
                    loot: { gold: { min: 10, max: 25 }, items: [] }
                }
            },
            skeleton: {
                type: 'monster',
                char: 's',
                color: '#C0C0C0',
                components: {
                    health: { max: 10, current: 10 }, // 20% of player HP (50)
                    speed: { value: 1.2 }, // Slightly faster than goblin
                    level: { value: 1 },
                    stats: {
                        strength: 14,
                        dexterity: 12,
                        intelligence: 8,
                        constitution: 12,
                        agility: 7  // Low agility for skeleton
                    },
                    equipment: {
                        weapon: null,
                        armor: null,
                        accessory: null
                    },
                    ai: { type: 'aggressive', range: 5 },
                    notice: { 
                        hasNoticed: false, 
                        noticeTimer: 0, 
                        noticeDelay: 10, 
                        alertRange: 4 
                    },
                    visibility: { 
                        isVisible: false 
                    },
                    loot: { gold: { min: 2, max: 8 }, items: [] }
                }
            },
            dragon: {
                type: 'monster',
                char: 'D',
                color: '#FF0000',
                components: {
                    health: { max: 20, current: 20 }, // 40% of player HP (50)
                    speed: { value: 0.4 }, // Very slow
                    level: { value: 5 },
                    stats: {
                        strength: 28,
                        dexterity: 10,
                        intelligence: 15,
                        constitution: 22,
                        agility: 5  // Very low agility for dragon
                    },
                    equipment: {
                        weapon: null,
                        armor: null,
                        accessory: null
                    },
                    ai: { type: 'aggressive', range: 15 },
                    notice: { 
                        hasNoticed: false, 
                        noticeTimer: 0, 
                        noticeDelay: 10, 
                        alertRange: 12 
                    },
                    visibility: { 
                        isVisible: false 
                    },
                    loot: { gold: { min: 50, max: 100 }, items: [] }
                }
            }
        };
    }

    /**
     * Create a player character
     * @param {string} id - Unique identifier
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} customStats - Custom stat overrides
     * @returns {Entity} Player entity
     */
    createPlayer(id, x, y, customStats = {}) {
        const template = this.characterTemplates.player;
        const entity = new Entity(id, template.type, x, y);
        
        // Add all components from template
        for (const [componentName, componentData] of Object.entries(template.components)) {
            const component = { ...componentData };
            
            // Apply custom stat overrides
            if (componentName === 'stats' && customStats) {
                Object.assign(component, customStats);
            }
            
            entity.addComponent(componentName, component);
        }

        // Equip starting gear (only leather armor, sword is already equipped in template)
        const leatherArmor = this.equipmentSystem.createItem('leatherArmor');
        this.equipmentSystem.equipItem(entity, leatherArmor);

        // Add gold component
        entity.addComponent('gold', { amount: 0 });

        return entity;
    }

    /**
     * Create a monster
     * @param {string} id - Unique identifier
     * @param {string} monsterType - Type of monster
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} customStats - Custom stat overrides
     * @returns {Monster|null} Monster entity or null if type not found
     */
    createMonster(id, monsterType, x, y, customStats = {}) {
        const template = this.characterTemplates[monsterType];
        if (!template) {
            console.warn(`Unknown monster type: ${monsterType}`);
            return null;
        }

        const monster = new Monster(id, x, y, monsterType);
        
        // Add all components from template
        for (const [componentName, componentData] of Object.entries(template.components)) {
            const component = { ...componentData };
            
            // Apply custom stat overrides
            if (componentName === 'stats' && customStats) {
                Object.assign(component, customStats);
            }
            
            monster.addComponent(componentName, component);
        }

        // Equip monster-specific gear
        this.equipMonsterGear(monster, monsterType);

        return monster;
    }

    /**
     * Equip gear for a monster based on its type
     * @param {Monster} monster - Monster entity
     * @param {string} monsterType - Type of monster
     */
    equipMonsterGear(monster, monsterType) {
        let weaponId, armorId;

        switch (monsterType) {
            case 'goblin':
                weaponId = 'rustyIronSword';
                armorId = 'leatherArmor';
                break;
            case 'orc':
                weaponId = 'orcAxe';
                armorId = 'leatherArmor';
                break;
            case 'troll':
                weaponId = 'trollClub';
                armorId = 'chainMail';
                break;
            case 'skeleton':
                weaponId = 'rustyIronSword';
                armorId = 'leatherArmor';
                break;
            case 'dragon':
                weaponId = 'dragonClaw';
                armorId = 'dragonScale';
                break;
            default:
                weaponId = 'rustyIronSword';
                armorId = 'leatherArmor';
        }

        // Create and equip items
        const weapon = this.equipmentSystem.createItem(weaponId);
        const armor = this.equipmentSystem.createItem(armorId);
        
        if (weapon) this.equipmentSystem.equipItem(monster, weapon);
        if (armor) this.equipmentSystem.equipItem(monster, armor);
    }

    /**
     * Create a random monster
     * @param {string} id - Unique identifier
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} level - Difficulty level
     * @returns {Entity} Random monster entity
     */
    createRandomMonster(id, x, y, level = 1) {
        const monsterTypes = Object.keys(this.characterTemplates).filter(type => type !== 'player');
        const levelAppropriateMonsters = this.getLevelAppropriateMonsters(level);
        
        const monsterType = levelAppropriateMonsters[
            Math.floor(Math.random() * levelAppropriateMonsters.length)
        ];
        
        return this.createMonster(id, monsterType, x, y);
    }

    /**
     * Get monsters appropriate for a given level
     * @param {number} level - Difficulty level
     * @returns {Array} Array of appropriate monster types
     */
    getLevelAppropriateMonsters(level) {
        const monsterLevels = {
            goblin: 1,
            skeleton: 1,
            orc: 2,
            troll: 3,
            dragon: 5
        };

        return Object.keys(monsterLevels).filter(monster => 
            monsterLevels[monster] <= level
        );
    }

    /**
     * Create a projectile
     * @param {string} id - Unique identifier
     * @param {string} projectileType - Type of projectile
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {string} ownerId - ID of entity that fired the projectile
     * @returns {Entity} Projectile entity
     */
    createProjectile(id, projectileType, x, y, targetX, targetY, ownerId) {
        const projectileTemplates = {
            arrow: {
                char: '-',
                color: '#8B4513',
                speed: 15,
                damage: 5,
                range: 10
            },
            firebolt: {
                char: '*',
                color: '#FF4500',
                speed: 12,
                damage: 8,
                range: 8
            },
            iceShard: {
                char: '^',
                color: '#00BFFF',
                speed: 10,
                damage: 6,
                range: 6
            }
        };

        const template = projectileTemplates[projectileType] || projectileTemplates.arrow;
        const entity = new Entity(id, 'projectile', x, y);
        
        entity.addComponent('projectile', {
            type: projectileType,
            targetX,
            targetY,
            ownerId,
            speed: template.speed,
            damage: template.damage,
            range: template.range,
            distanceTraveled: 0
        });

        entity.addComponent('appearance', {
            char: template.char,
            color: template.color
        });

        return entity;
    }

    /**
     * Create an item
     * @param {string} id - Unique identifier
     * @param {string} itemType - Type of item
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Entity} Item entity
     */
    createItem(id, itemType, x, y) {
        const itemTemplates = {
            healthPotion: {
                char: '!',
                color: '#FF0000',
                type: 'consumable',
                effect: 'heal',
                value: 25
            },
            manaPotion: {
                char: '~',
                color: '#0000FF',
                type: 'consumable',
                effect: 'restoreMana',
                value: 20
            },
            sword: {
                char: '/',
                color: '#C0C0C0',
                type: 'weapon',
                damage: 8,
                speed: 1.2
            },
            shield: {
                char: '[',
                color: '#8B4513',
                type: 'armor',
                defense: 5
            }
        };

        const template = itemTemplates[itemType] || itemTemplates.healthPotion;
        const entity = new Entity(id, 'item', x, y);
        
        entity.addComponent('item', {
            type: itemType,
            ...template
        });

        entity.addComponent('appearance', {
            char: template.char,
            color: template.color
        });

        return entity;
    }

    /**
     * Spawn monsters in a room
     * @param {Object} room - Room object
     * @param {number} level - Difficulty level
     * @param {number} maxMonsters - Maximum number of monsters
     * @returns {Array} Array of monster entities
     */
    spawnMonstersInRoom(room, level = 1, maxMonsters = 3) {
        const monsters = [];
        const numMonsters = Math.floor(Math.random() * maxMonsters) + 1;
        
        for (let i = 0; i < numMonsters; i++) {
            const x = room.x + Math.floor(Math.random() * room.width);
            const y = room.y + Math.floor(Math.random() * room.height);
            
            // Get monster type first, then create monster with proper ID
            const monsterTypes = Object.keys(this.characterTemplates).filter(type => type !== 'player');
            const levelAppropriateMonsters = this.getLevelAppropriateMonsters(level);
            const monsterType = levelAppropriateMonsters[
                Math.floor(Math.random() * levelAppropriateMonsters.length)
            ];
            
            // Generate ID with monster type before creating monster
            const id = `${monsterType}_monster_${Date.now()}_${i}`;
            const monster = this.createMonster(id, monsterType, x, y);
            
            if (monster) {
                monsters.push(monster);
            }
        }
        
        return monsters;
    }

    /**
     * Get monster type from entity
     * @param {Entity} entity - Monster entity
     * @returns {string} Monster type
     */
    getMonsterTypeFromEntity(entity) {
        // Check appearance component first
        const appearance = entity.getComponent('appearance');
        if (appearance && appearance.char) {
            switch (appearance.char) {
                case 'g': return 'goblin';
                case 'o': return 'orc';
                case 'T': return 'troll';
                case 's': return 'skeleton';
                case 'D': return 'dragon';
            }
        }
        
        // Fallback to checking stats or other components
        const stats = entity.getComponent('stats');
        if (stats) {
            if (stats.strength <= 10) return 'goblin';
            if (stats.strength <= 15) return 'orc';
            if (stats.strength <= 20) return 'troll';
            if (stats.strength <= 25) return 'dragon';
        }
        
        return 'goblin'; // Default
    }

    /**
     * Spawn items in a room
     * @param {Object} room - Room object
     * @param {number} maxItems - Maximum number of items
     * @returns {Array} Array of item entities
     */
    spawnItemsInRoom(room, maxItems = 2) {
        const items = [];
        const numItems = Math.floor(Math.random() * maxItems);
        
        for (let i = 0; i < numItems; i++) {
            const x = room.x + Math.floor(Math.random() * room.width);
            const y = room.y + Math.floor(Math.random() * room.height);
            const id = `item_${Date.now()}_${i}`;
            
            const itemTypes = ['healthPotion', 'manaPotion', 'sword', 'shield'];
            const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            
            const item = this.createItem(id, itemType, x, y);
            items.push(item);
        }
        
        return items;
    }

    /**
     * Get all available character types
     * @returns {Array} Array of character type names
     */
    getAvailableTypes() {
        return Object.keys(this.characterTemplates);
    }

    /**
     * Get character template by type
     * @param {string} type - Character type
     * @returns {Object|null} Character template or null
     */
    getTemplate(type) {
        return this.characterTemplates[type] || null;
    }

    /**
     * Add a new character template
     * @param {string} type - Character type name
     * @param {Object} template - Character template
     */
    addTemplate(type, template) {
        this.characterTemplates[type] = template;
    }

    /**
     * Remove a character template
     * @param {string} type - Character type name
     * @returns {boolean} True if template was removed
     */
    removeTemplate(type) {
        if (this.characterTemplates[type]) {
            delete this.characterTemplates[type];
            return true;
        }
        return false;
    }

    /**
     * Create a chest entity
     * @param {string} id - Chest ID
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Entity} Chest entity
     */
    createChest(id, x, y) {
        const chest = new Entity(id, 'chest', x, y);
        
        // Add appearance component
        chest.addComponent('appearance', {
            char: '[v]',
            color: '#FFD700' // Gold color
        });
        
        // Add chest component to track looted state
        chest.addComponent('chest', {
            looted: false,
            loot: {
                gold: Math.floor(Math.random() * 50) + 25, // 25-75 gold
                items: []
            }
        });
        
        return chest;
    }
}
