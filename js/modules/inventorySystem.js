/**
 * Advanced Inventory System for comprehensive equipment and inventory management
 */
class InventorySystem {
    constructor() {
        this.equipmentSlots = {
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
        
        this.inventorySlots = new Array(8).fill(null);
        
        // Item type to equipment slot mapping
        this.slotMapping = {
            'helm': 'helm',
            'helmet': 'helm',
            'shoulder': 'shoulder',
            'pauldrons': 'shoulder',
            'neck': 'neck',
            'necklace': 'neck',
            'amulet': 'neck',
            'back': 'back',
            'cape': 'back',
            'cloak': 'back',
            'chest': 'chest',
            'armor': 'chest',
            'breastplate': 'chest',
            'arms': 'arms',
            'gauntlets': 'arms',
            'bracers': 'arms',
            'legs': 'legs',
            'pants': 'legs',
            'greaves': 'legs',
            'wrist': 'wrist1', // Default to wrist1, can be moved to wrist2
            'bracers': 'wrist1',
            'hands': 'hands',
            'gloves': 'hands',
            'finger': 'finger1', // Default to finger1, can be moved to finger2
            'ring': 'finger1',
            'feet': 'feet',
            'boots': 'feet',
            'shoes': 'feet',
            'primary': 'primary',
            'weapon': 'primary',
            'sword': 'primary',
            'mace': 'primary',
            'axe': 'primary',
            'secondary': 'secondary',
            'shield': 'secondary',
            'offhand': 'secondary',
            'range': 'range',
            'bow': 'range',
            'crossbow': 'range',
            'ammo': 'ammo',
            'arrows': 'ammo',
            'bolts': 'ammo',
            'consumable': 'inventory',
            'potion': 'inventory',
            'scroll': 'inventory',
            'misc': 'inventory'
        };
    }

    /**
     * Initialize inventory system for an entity
     * @param {Entity} entity - Entity to initialize inventory for
     */
    initializeEntity(entity) {
        // Get existing equipment or initialize with all slots
        let equipment = entity.getComponent('equipment');
        if (!equipment) {
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
        } else {
            // Ensure all slots exist in existing equipment
            const requiredSlots = [
                'helm', 'shoulder', 'neck', 'back', 'chest', 'arms', 'legs',
                'wrist1', 'wrist2', 'hands', 'finger1', 'finger2', 'feet',
                'primary', 'secondary', 'range', 'ammo'
            ];
            
            for (const slot of requiredSlots) {
                if (!(slot in equipment)) {
                    equipment[slot] = null;
                }
            }
        }
        
        // Initialize inventory component with 8 slots
        let inventory = entity.getComponent('inventory');
        if (!inventory) {
            inventory = {
                items: new Array(8).fill(null),
                maxSize: 8
            };
            entity.addComponent('inventory', inventory);
        }
    }

    /**
     * Add item to inventory
     * @param {Entity} entity - Entity to add item to
     * @param {Object} item - Item to add
     * @returns {boolean} Success
     */
    addItem(entity, item) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return false;

        // Find first empty slot
        for (let i = 0; i < inventory.items.length; i++) {
            if (inventory.items[i] === null) {
                inventory.items[i] = item;
                return true;
            }
        }
        
        return false; // Inventory full
    }

    /**
     * Remove item from inventory
     * @param {Entity} entity - Entity to remove item from
     * @param {number} slotIndex - Slot index to remove from
     * @returns {Object} Removed item
     */
    removeItem(entity, slotIndex) {
        const inventory = entity.getComponent('inventory');
        if (!inventory || slotIndex < 0 || slotIndex >= inventory.items.length) return null;

        const item = inventory.items[slotIndex];
        inventory.items[slotIndex] = null;
        return item;
    }

    /**
     * Equip an item
     * @param {Entity} entity - Entity to equip item on
     * @param {Object} item - Item to equip
     * @param {string} slot - Specific slot to equip to (optional)
     * @returns {boolean} Success
     */
    equipItem(entity, item, slot = null) {
        const equipment = entity.getComponent('equipment');
        if (!equipment || !item) return false;

        // Determine slot if not specified
        if (!slot) {
            slot = this.getSlotForItem(item);
        }

        if (!slot || !equipment.hasOwnProperty(slot)) return false;

        // Unequip current item in that slot
        const currentItem = equipment[slot];
        if (currentItem) {
            // Try to put current item back in inventory
            if (!this.addItem(entity, currentItem)) {
                // If inventory is full, drop the item
                this.dropItem(entity, currentItem);
            }
        }

        // Equip new item
        equipment[slot] = item;
        return true;
    }

    /**
     * Unequip an item
     * @param {Entity} entity - Entity to unequip from
     * @param {string} slot - Slot to unequip
     * @returns {Object} Unequipped item
     */
    unequipItem(entity, slot) {
        const equipment = entity.getComponent('equipment');
        if (!equipment || !equipment.hasOwnProperty(slot)) return null;

        const item = equipment[slot];
        equipment[slot] = null;
        
        // Try to put item back in inventory
        if (item && !this.addItem(entity, item)) {
            // If inventory is full, drop the item
            this.dropItem(entity, item);
        }
        
        return item;
    }

    /**
     * Get the appropriate slot for an item
     * @param {Object} item - Item to get slot for
     * @returns {string} Slot name
     */
    getSlotForItem(item) {
        if (!item || !item.type) return null;
        
        // Check for exact type match first
        if (this.slotMapping.hasOwnProperty(item.type)) {
            const slot = this.slotMapping[item.type];
            if (slot !== 'inventory') {
                return slot;
            }
        }
        
        // Check for partial matches in item name
        const itemName = item.name ? item.name.toLowerCase() : '';
        for (const [itemType, slot] of Object.entries(this.slotMapping)) {
            if (itemName.includes(itemType) && slot !== 'inventory') {
                return slot;
            }
        }
        
        // Default to inventory
        return 'inventory';
    }

    /**
     * Drop an item (remove from entity)
     * @param {Entity} entity - Entity dropping item
     * @param {Object} item - Item to drop
     */
    dropItem(entity, item) {
        // This would typically create a world item entity
        // For now, just remove it from the entity
        console.log(`Dropped item: ${item.name || 'Unknown Item'}`);
    }

    /**
     * Get total stats from all equipped items
     * @param {Entity} entity - Entity to calculate stats for
     * @returns {Object} Combined stats
     */
    getEquippedStats(entity) {
        const equipment = entity.getComponent('equipment');
        if (!equipment) return {};

        const stats = {
            damage: 0,
            defense: 0,
            speed: 0,
            health: 0,
            mana: 0,
            strength: 0,
            dexterity: 0,
            intelligence: 0,
            constitution: 0,
            agility: 0
        };

        // Sum stats from all equipped items
        for (const [slot, item] of Object.entries(equipment)) {
            if (item && item.stats) {
                for (const [stat, value] of Object.entries(item.stats)) {
                    if (stats.hasOwnProperty(stat)) {
                        stats[stat] += value;
                    }
                }
            }
            
            // Legacy item properties
            if (item) {
                if (item.damage) stats.damage += item.damage;
                if (item.defense) stats.defense += item.defense;
                if (item.speed) stats.speed += item.speed;
                if (item.health) stats.health += item.health;
                if (item.mana) stats.mana += item.mana;
            }
        }

        return stats;
    }

    /**
     * Get all equipped items
     * @param {Entity} entity - Entity to get equipment from
     * @returns {Object} All equipped items by slot
     */
    getEquippedItems(entity) {
        const equipment = entity.getComponent('equipment');
        return equipment || {};
    }

    /**
     * Get inventory items
     * @param {Entity} entity - Entity to get inventory from
     * @returns {Array} Inventory items
     */
    getInventoryItems(entity) {
        const inventory = entity.getComponent('inventory');
        return inventory ? inventory.items : [];
    }

    /**
     * Check if inventory is full
     * @param {Entity} entity - Entity to check
     * @returns {boolean} True if full
     */
    isInventoryFull(entity) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return true;
        
        return inventory.items.every(item => item !== null);
    }

    /**
     * Get number of empty inventory slots
     * @param {Entity} entity - Entity to check
     * @returns {number} Number of empty slots
     */
    getEmptySlots(entity) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return 0;
        
        return inventory.items.filter(item => item === null).length;
    }

    /**
     * Move item between slots
     * @param {Entity} entity - Entity
     * @param {string} fromSlot - Source slot
     * @param {string} toSlot - Destination slot
     * @returns {boolean} Success
     */
    moveItem(entity, fromSlot, toSlot) {
        const equipment = entity.getComponent('equipment');
        const inventory = entity.getComponent('inventory');
        
        if (!equipment || !inventory) return false;

        let fromItem = null;
        let toItem = null;

        // Get source item
        if (fromSlot.startsWith('inv_')) {
            const slotIndex = parseInt(fromSlot.replace('inv_', ''));
            fromItem = inventory.items[slotIndex];
        } else if (equipment.hasOwnProperty(fromSlot)) {
            fromItem = equipment[fromSlot];
        }

        // Get destination item
        if (toSlot.startsWith('inv_')) {
            const slotIndex = parseInt(toSlot.replace('inv_', ''));
            toItem = inventory.items[slotIndex];
        } else if (equipment.hasOwnProperty(toSlot)) {
            toItem = equipment[toSlot];
        }

        // Check if destination slot can accept the item
        if (toSlot.startsWith('inv_')) {
            // Moving to inventory slot
            const slotIndex = parseInt(toSlot.replace('inv_', ''));
            if (toItem !== null) return false; // Slot occupied
            
            // Remove from source
            if (fromSlot.startsWith('inv_')) {
                const fromIndex = parseInt(fromSlot.replace('inv_', ''));
                inventory.items[fromIndex] = null;
            } else if (equipment.hasOwnProperty(fromSlot)) {
                equipment[fromSlot] = null;
            }
            
            // Add to destination
            inventory.items[slotIndex] = fromItem;
        } else if (equipment.hasOwnProperty(toSlot)) {
            // Moving to equipment slot
            // Check if item is appropriate for this slot
            if (fromItem && this.getSlotForItem(fromItem) !== toSlot && toSlot !== 'inventory') {
                // Allow moving to any slot for now, but this could be restricted
            }
            
            // Remove from source
            if (fromSlot.startsWith('inv_')) {
                const fromIndex = parseInt(fromSlot.replace('inv_', ''));
                inventory.items[fromIndex] = null;
            } else if (equipment.hasOwnProperty(fromSlot)) {
                equipment[fromSlot] = null;
            }
            
            // Add to destination
            equipment[toSlot] = fromItem;
            
            // Handle displaced item
            if (toItem) {
                if (fromSlot.startsWith('inv_')) {
                    const fromIndex = parseInt(fromSlot.replace('inv_', ''));
                    inventory.items[fromIndex] = toItem;
                } else if (equipment.hasOwnProperty(fromSlot)) {
                    equipment[fromSlot] = toItem;
                } else {
                    // Try to find empty inventory slot
                    if (!this.addItem(entity, toItem)) {
                        this.dropItem(entity, toItem);
                    }
                }
            }
        }

        return true;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventorySystem;
}
