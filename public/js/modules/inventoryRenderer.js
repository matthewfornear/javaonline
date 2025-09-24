/**
 * Inventory Renderer for full-screen inventory overlay
 */
class InventoryRenderer {
    constructor() {
        this.inventoryOverlay = null;
        this.isVisible = false;
        this.selectedSlot = null;
        this.hoveredSlot = null;
    }

    /**
     * Initialize the inventory renderer
     */
    init() {
        this.createInventoryOverlay();
        this.setupEventListeners();
    }

    /**
     * Create the inventory overlay HTML structure
     */
    createInventoryOverlay() {
        // Create main overlay container
        this.inventoryOverlay = document.createElement('div');
        this.inventoryOverlay.id = 'inventory-overlay';
        this.inventoryOverlay.className = 'inventory-overlay';
        
        // Create the three main sections
        const statsSection = this.createStatsSection();
        const equipmentSection = this.createEquipmentSection();
        const inventorySection = this.createInventorySection();
        
        this.inventoryOverlay.appendChild(statsSection);
        this.inventoryOverlay.appendChild(equipmentSection);
        this.inventoryOverlay.appendChild(inventorySection);
        
        // Add to body
        document.body.appendChild(this.inventoryOverlay);
    }

    /**
     * Create the player stats section (left 1/3)
     * @returns {HTMLElement} Stats section
     */
    createStatsSection() {
        const section = document.createElement('div');
        section.className = 'inventory-section stats-section';
        
        section.innerHTML = `
            <div class="section-header">
                <h2>CHARACTER</h2>
            </div>
            <div class="stats-content">
                <div class="stat-group">
                    <h3>VITAL STATISTICS</h3>
                    <div class="stat-row">
                        <span class="stat-label">Health:</span>
                        <span class="stat-value" id="char-health">100/100</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Mana:</span>
                        <span class="stat-value" id="char-mana">50/50</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Level:</span>
                        <span class="stat-value" id="char-level">1</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Experience:</span>
                        <span class="stat-value" id="char-xp">0/100</span>
                    </div>
                </div>
                
                <div class="stat-group">
                    <h3>ATTRIBUTES</h3>
                    <div class="stat-row">
                        <span class="stat-label">Strength:</span>
                        <span class="stat-value" id="char-str">10</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Dexterity:</span>
                        <span class="stat-value" id="char-dex">10</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Intelligence:</span>
                        <span class="stat-value" id="char-int">10</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Constitution:</span>
                        <span class="stat-value" id="char-con">10</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Agility:</span>
                        <span class="stat-value" id="char-agi">10</span>
                    </div>
                </div>
                
                <div class="stat-group">
                    <h3>COMBAT STATS</h3>
                    <div class="stat-row">
                        <span class="stat-label">Damage:</span>
                        <span class="stat-value" id="char-damage">0</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Defense:</span>
                        <span class="stat-value" id="char-defense">0</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Attack Speed:</span>
                        <span class="stat-value" id="char-speed">1.0</span>
                    </div>
                </div>
                
                <div class="stat-group">
                    <h3>WEAPON SKILLS</h3>
                    <div class="skill-list" id="weapon-skills">
                        <div class="skill-item">
                            <span class="skill-name">1H Slash</span>
                            <span class="skill-level">0</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">2H Slash</span>
                            <span class="skill-level">0</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">1H Blunt</span>
                            <span class="skill-level">0</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">2H Blunt</span>
                            <span class="skill-level">0</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">1H Pierce</span>
                            <span class="skill-level">0</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">2H Pierce</span>
                            <span class="skill-level">0</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Hand-to-Hand</span>
                            <span class="skill-level">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="stat-group">
                    <h3>DEFENSIVE SKILLS</h3>
                    <div class="skill-list" id="defensive-skills">
                        <div class="skill-item">
                            <span class="skill-name">Dodge</span>
                            <span class="skill-level">0</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Block</span>
                            <span class="skill-level">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="stat-group">
                    <h3>COMBAT SKILLS</h3>
                    <div class="skill-list" id="combat-skills">
                        <div class="skill-item">
                            <span class="skill-name">Offense</span>
                            <span class="skill-level">0</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Defense</span>
                            <span class="skill-level">0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return section;
    }

    /**
     * Create the equipment section (middle 1/3)
     * @returns {HTMLElement} Equipment section
     */
    createEquipmentSection() {
        const section = document.createElement('div');
        section.className = 'inventory-section equipment-section';
        
        section.innerHTML = `
            <div class="section-header">
                <h2>EQUIPMENT</h2>
            </div>
            <div class="equipment-content">
                <div class="equipment-grid">
                    <!-- Head/Helm -->
                    <div class="equipment-slot helm-slot" data-slot="helm">
                        <div class="slot-label">HELM</div>
                        <div class="slot-content" id="equip-helm">
                            <div class="slot-occupied" id="equip-helm-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Shoulder -->
                    <div class="equipment-slot shoulder-slot" data-slot="shoulder">
                        <div class="slot-label">SHOULDER</div>
                        <div class="slot-content" id="equip-shoulder">
                            <div class="slot-occupied" id="equip-shoulder-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Neck -->
                    <div class="equipment-slot neck-slot" data-slot="neck">
                        <div class="slot-label">NECK</div>
                        <div class="slot-content" id="equip-neck">
                            <div class="slot-occupied" id="equip-neck-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Back -->
                    <div class="equipment-slot back-slot" data-slot="back">
                        <div class="slot-label">BACK</div>
                        <div class="slot-content" id="equip-back">
                            <div class="slot-occupied" id="equip-back-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Chest -->
                    <div class="equipment-slot chest-slot" data-slot="chest">
                        <div class="slot-label">CHEST</div>
                        <div class="slot-content" id="equip-chest">
                            <div class="slot-occupied" id="equip-chest-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Arms -->
                    <div class="equipment-slot arms-slot" data-slot="arms">
                        <div class="slot-label">ARMS</div>
                        <div class="slot-content" id="equip-arms">
                            <div class="slot-occupied" id="equip-arms-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Legs -->
                    <div class="equipment-slot legs-slot" data-slot="legs">
                        <div class="slot-label">LEGS</div>
                        <div class="slot-content" id="equip-legs">
                            <div class="slot-occupied" id="equip-legs-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Wrist 1 -->
                    <div class="equipment-slot wrist-slot" data-slot="wrist1">
                        <div class="slot-label">WRIST</div>
                        <div class="slot-content" id="equip-wrist1">
                            <div class="slot-occupied" id="equip-wrist1-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Wrist 2 -->
                    <div class="equipment-slot wrist-slot" data-slot="wrist2">
                        <div class="slot-label">WRIST</div>
                        <div class="slot-content" id="equip-wrist2">
                            <div class="slot-occupied" id="equip-wrist2-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Hands -->
                    <div class="equipment-slot hands-slot" data-slot="hands">
                        <div class="slot-label">HANDS</div>
                        <div class="slot-content" id="equip-hands">
                            <div class="slot-occupied" id="equip-hands-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Finger 1 -->
                    <div class="equipment-slot finger-slot" data-slot="finger1">
                        <div class="slot-label">RING</div>
                        <div class="slot-content" id="equip-finger1">
                            <div class="slot-occupied" id="equip-finger1-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Finger 2 -->
                    <div class="equipment-slot finger-slot" data-slot="finger2">
                        <div class="slot-label">RING</div>
                        <div class="slot-content" id="equip-finger2">
                            <div class="slot-occupied" id="equip-finger2-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Feet -->
                    <div class="equipment-slot feet-slot" data-slot="feet">
                        <div class="slot-label">FEET</div>
                        <div class="slot-content" id="equip-feet">
                            <div class="slot-occupied" id="equip-feet-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Primary Weapon -->
                    <div class="equipment-slot primary-slot" data-slot="primary">
                        <div class="slot-label">PRIMARY</div>
                        <div class="slot-content" id="equip-primary">
                            <div class="slot-occupied" id="equip-primary-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Secondary -->
                    <div class="equipment-slot secondary-slot" data-slot="secondary">
                        <div class="slot-label">SECONDARY</div>
                        <div class="slot-content" id="equip-secondary">
                            <div class="slot-occupied" id="equip-secondary-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Range -->
                    <div class="equipment-slot range-slot" data-slot="range">
                        <div class="slot-label">RANGE</div>
                        <div class="slot-content" id="equip-range">
                            <div class="slot-occupied" id="equip-range-occupied"></div>
                        </div>
                    </div>
                    
                    <!-- Ammo -->
                    <div class="equipment-slot ammo-slot" data-slot="ammo">
                        <div class="slot-label">AMMO</div>
                        <div class="slot-content" id="equip-ammo">
                            <div class="slot-occupied" id="equip-ammo-occupied"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return section;
    }

    /**
     * Create the inventory section (right 1/3)
     * @returns {HTMLElement} Inventory section
     */
    createInventorySection() {
        const section = document.createElement('div');
        section.className = 'inventory-section inventory-section';
        
        section.innerHTML = `
            <div class="section-header">
                <h2>INVENTORY</h2>
            </div>
            <div class="inventory-content">
                <div class="inventory-grid">
                    <div class="inventory-slot" data-slot="inv_0">
                        <div class="slot-content" id="inv-0"></div>
                    </div>
                    <div class="inventory-slot" data-slot="inv_1">
                        <div class="slot-content" id="inv-1"></div>
                    </div>
                    <div class="inventory-slot" data-slot="inv_2">
                        <div class="slot-content" id="inv-2"></div>
                    </div>
                    <div class="inventory-slot" data-slot="inv_3">
                        <div class="slot-content" id="inv-3"></div>
                    </div>
                    <div class="inventory-slot" data-slot="inv_4">
                        <div class="slot-content" id="inv-4"></div>
                    </div>
                    <div class="inventory-slot" data-slot="inv_5">
                        <div class="slot-content" id="inv-5"></div>
                    </div>
                    <div class="inventory-slot" data-slot="inv_6">
                        <div class="slot-content" id="inv-6"></div>
                    </div>
                    <div class="inventory-slot" data-slot="inv_7">
                        <div class="slot-content" id="inv-7"></div>
                    </div>
                </div>
                <div class="inventory-info">
                    <div class="currency-display">
                        <div class="currency-item">
                            <span class="currency-label gold">GOLD:</span>
                            <span class="currency-amount" id="gold-amount">0</span>
                        </div>
                        <div class="currency-item">
                            <span class="currency-label silver">SILVER:</span>
                            <span class="currency-amount" id="silver-amount">0</span>
                        </div>
                        <div class="currency-item">
                            <span class="currency-label copper">COPPER:</span>
                            <span class="currency-amount" id="copper-amount">0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return section;
    }

    /**
     * Setup event listeners for the inventory
     */
    setupEventListeners() {
        // Close inventory on escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // Equipment slot interactions
        const equipmentSlots = this.inventoryOverlay.querySelectorAll('.equipment-slot');
        equipmentSlots.forEach(slot => {
            slot.addEventListener('click', (event) => {
                this.handleSlotClick(event, slot.dataset.slot);
            });
            
            slot.addEventListener('mouseenter', (event) => {
                this.handleSlotHover(event, slot.dataset.slot);
            });
            
            slot.addEventListener('mouseleave', (event) => {
                this.handleSlotLeave(event);
            });
        });

        // Inventory slot interactions
        const inventorySlots = this.inventoryOverlay.querySelectorAll('.inventory-slot');
        inventorySlots.forEach(slot => {
            slot.addEventListener('click', (event) => {
                this.handleSlotClick(event, slot.dataset.slot);
            });
            
            slot.addEventListener('mouseenter', (event) => {
                this.handleSlotHover(event, slot.dataset.slot);
            });
            
            slot.addEventListener('mouseleave', (event) => {
                this.handleSlotLeave(event);
            });
        });
    }

    /**
     * Handle slot click
     * @param {Event} event - Click event
     * @param {string} slot - Slot identifier
     */
    handleSlotClick(event, slot) {
        if (this.selectedSlot === slot) {
            // Deselect if clicking the same slot
            this.selectedSlot = null;
            this.updateSlotSelection();
        } else if (this.selectedSlot) {
            // Move item between slots
            this.moveItem(this.selectedSlot, slot);
            this.selectedSlot = null;
            this.updateSlotSelection();
        } else {
            // Select slot
            this.selectedSlot = slot;
            this.updateSlotSelection();
        }
    }

    /**
     * Handle slot hover
     * @param {Event} event - Hover event
     * @param {string} slot - Slot identifier
     */
    handleSlotHover(event, slot) {
        this.hoveredSlot = slot;
        this.showItemTooltip(event, slot);
    }

    /**
     * Handle slot leave
     * @param {Event} event - Leave event
     */
    handleSlotLeave(event) {
        this.hoveredSlot = null;
        this.hideItemTooltip();
    }

    /**
     * Move item between slots
     * @param {string} fromSlot - Source slot
     * @param {string} toSlot - Destination slot
     */
    moveItem(fromSlot, toSlot) {
        // This will be implemented to work with the game's inventory system
        if (window.game && window.game.player) {
            const inventorySystem = window.game.inventorySystem;
            if (inventorySystem) {
                inventorySystem.moveItem(window.game.player, fromSlot, toSlot);
                this.updateDisplay(window.game.player);
            }
        }
    }

    /**
     * Update slot selection visual state
     */
    updateSlotSelection() {
        const allSlots = this.inventoryOverlay.querySelectorAll('.equipment-slot, .inventory-slot');
        allSlots.forEach(slot => {
            slot.classList.remove('selected');
            if (slot.dataset.slot === this.selectedSlot) {
                slot.classList.add('selected');
            }
        });
    }

    /**
     * Show item tooltip
     * @param {Event} event - Mouse event
     * @param {string} slot - Slot identifier
     */
    showItemTooltip(event, slot) {
        // Implementation for showing item tooltips
        // This would show item details when hovering over slots
    }

    /**
     * Hide item tooltip
     */
    hideItemTooltip() {
        // Implementation for hiding item tooltips
    }

    /**
     * Show the inventory overlay
     */
    show() {
        this.isVisible = true;
        this.inventoryOverlay.style.display = 'flex';
        
        // Update display with current player data
        if (window.game && window.game.player) {
            this.updateDisplay(window.game.player);
            
            // Force update tooltips after a short delay to ensure DOM is ready
            setTimeout(() => {
                this.updateDisplay(window.game.player);
            }, 100);
        }
    }

    /**
     * Hide the inventory overlay
     */
    hide() {
        this.isVisible = false;
        this.inventoryOverlay.style.display = 'none';
        this.selectedSlot = null;
        this.hoveredSlot = null;
        this.updateSlotSelection();
    }

    /**
     * Update the display with player data
     * @param {Entity} player - Player entity
     */
    updateDisplay(player) {
        this.updatePlayerStats(player);
        this.updateEquipmentSlots(player);
        this.updateInventorySlots(player);
    }

    /**
     * Update player statistics display
     * @param {Entity} player - Player entity
     */
    updatePlayerStats(player) {
        const health = player.getComponent('health');
        const level = player.getComponent('level');
        const stats = player.getComponent('stats');
        const gold = player.getComponent('gold');
        const equipment = player.getComponent('equipment');
        
        // Update vital statistics
        if (health) {
            const healthElement = document.getElementById('char-health');
            if (healthElement) {
                const percentage = (health.current / health.max) * 100;
                let color = '#00ff00';
                if (percentage < 25) color = '#ff0000';
                else if (percentage < 50) color = '#ff8000';
                else if (percentage < 75) color = '#ffff00';
                
                healthElement.innerHTML = `<span style="color: ${color}">${health.current}</span>/<span style="color: #ffffff">${health.max}</span>`;
            }
        }
        
        if (level) {
            const levelElement = document.getElementById('char-level');
            const xpElement = document.getElementById('char-xp');
            if (levelElement) levelElement.textContent = level.value;
            if (xpElement) xpElement.textContent = `${level.experience}/${level.experienceToNext}`;
        }
        
        // Update attributes
        if (stats) {
            const elements = {
                'char-str': stats.strength,
                'char-dex': stats.dexterity,
                'char-int': stats.intelligence,
                'char-con': stats.constitution,
                'char-agi': stats.agility
            };
            
            for (const [id, value] of Object.entries(elements)) {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            }
        }
        
        // Update currency
        if (gold) {
            const goldElement = document.getElementById('gold-amount');
            if (goldElement) goldElement.textContent = gold.amount || 0;
        }
        
        const silver = player.getComponent('silver');
        const copper = player.getComponent('copper');
        
        if (silver) {
            const silverElement = document.getElementById('silver-amount');
            if (silverElement) silverElement.textContent = silver.amount || 0;
        } else {
            const silverElement = document.getElementById('silver-amount');
            if (silverElement) silverElement.textContent = '0';
        }
        
        if (copper) {
            const copperElement = document.getElementById('copper-amount');
            if (copperElement) copperElement.textContent = copper.amount || 0;
        } else {
            const copperElement = document.getElementById('copper-amount');
            if (copperElement) copperElement.textContent = '0';
        }
        
        // Calculate and display combat stats
        this.updateCombatStats(player);
        
        // Update skills display
        this.updateSkillsDisplay(player);
    }

    /**
     * Update combat statistics
     * @param {Entity} player - Player entity
     */
    updateCombatStats(player) {
        let combatStats = {
            damage: 1,
            defense: 0,
            speed: 1.0
        };
        
        // Use the equipment system for accurate calculations
        if (window.game && window.game.equipmentSystem) {
            const damageResult = window.game.equipmentSystem.calculateDamage(player);
            combatStats.damage = damageResult.damage;
            combatStats.speed = damageResult.swingSpeed;
            combatStats.defense = window.game.equipmentSystem.calculateDefense(player);
        } else {
            // Fallback calculation
            const equipment = player.getComponent('equipment');
            const stats = player.getComponent('stats');
            
            if (equipment && stats) {
                // Calculate damage from weapon
                const weapon = equipment.primary || equipment.weapon;
                if (weapon) {
                    // Base damage from strength
                    const strengthBonus = Math.floor((stats.strength - 10) * 0.5);
                    combatStats.damage = Math.max(1, strengthBonus + (weapon.damage || 0));
                    combatStats.speed = weapon.speed || 1.0;
                }
                
                // Calculate defense from armor
                let totalDefense = 0;
                
                // Constitution provides natural defense
                totalDefense += Math.floor((stats.constitution - 10) * 0.2);
                
                // Armor defense from all armor slots
                const armorSlots = ['helm', 'shoulder', 'chest', 'arms', 'legs', 'wrist1', 'wrist2', 'hands', 'feet'];
                for (const slot of armorSlots) {
                    if (equipment[slot] && equipment[slot].defense) {
                        totalDefense += equipment[slot].defense;
                    }
                }
                
                combatStats.defense = Math.max(0, totalDefense);
            }
        }
        
        // Update combat stat displays
        const damageElement = document.getElementById('char-damage');
        const defenseElement = document.getElementById('char-defense');
        const speedElement = document.getElementById('char-speed');
        
        if (damageElement) damageElement.textContent = combatStats.damage;
        if (defenseElement) defenseElement.textContent = combatStats.defense;
        if (speedElement) speedElement.textContent = combatStats.speed.toFixed(1);
    }

    /**
     * Update equipment slots display
     * @param {Entity} player - Player entity
     */
    updateEquipmentSlots(player) {
        const equipment = player.getComponent('equipment');
        if (!equipment) return;
        
        // Update each equipment slot
        for (const [slot, item] of Object.entries(equipment)) {
            const slotContainer = document.getElementById(`equip-${slot}`)?.closest('.equipment-slot');
            const occupiedContainer = document.getElementById(`equip-${slot}-occupied`);
            
            if (slotContainer && occupiedContainer) {
                if (item) {
                    // Create item icon if available
                    const itemIcon = this.getItemIcon(item);
                    
                    // Populate the occupied container
                    occupiedContainer.innerHTML = `
                        ${itemIcon}
                        <div class="item-name">${item.name || 'Unknown'}</div>
                    `;
                    occupiedContainer.style.display = 'flex';
                    slotContainer.classList.add('has-item');
                    
                    // Add tooltip with item details to the slot container
                    const tooltip = this.createItemTooltip(item);
                    slotContainer.title = tooltip;
                } else {
                    // Clear the occupied container
                    occupiedContainer.innerHTML = '';
                    occupiedContainer.style.display = 'none';
                    slotContainer.classList.remove('has-item');
                    slotContainer.title = '';
                }
            }
        }
    }

    /**
     * Update inventory slots display
     * @param {Entity} player - Player entity
     */
    updateInventorySlots(player) {
        const inventory = player.getComponent('inventory');
        if (!inventory) return;
        
        // Update each inventory slot
        for (let i = 0; i < inventory.items.length; i++) {
            const slotElement = document.getElementById(`inv-${i}`);
            const item = inventory.items[i];
            
            if (slotElement) {
                if (item) {
                    slotElement.innerHTML = `
                        <div class="item-name">${item.name || 'Unknown'}</div>
                        <div class="item-type">${item.type || 'Unknown'}</div>
                    `;
                    slotElement.classList.add('has-item');
                } else {
                    slotElement.innerHTML = '';
                    slotElement.classList.remove('has-item');
                }
            }
        }
    }

    /**
     * Update skills display
     * @param {Entity} player - Player entity
     */
    updateSkillsDisplay(player) {
        const skills = player.getComponent('skills');
        if (!skills) return;
        
        // Get player level for skill caps
        const playerLevel = player.getComponent('level');
        const maxSkillLevel = playerLevel ? playerLevel.value * 5 : 5;
        
        // Update weapon skills
        const weaponSkills = [
            '1h_slash', '2h_slash', '1h_blunt', '2h_blunt',
            '1h_pierce', '2h_pierce', 'hand_to_hand'
        ];
        
        weaponSkills.forEach((skillName, index) => {
            const skillElement = document.querySelector(`#weapon-skills .skill-item:nth-child(${index + 1}) .skill-level`);
            if (skillElement && skills[skillName]) {
                const skill = skills[skillName];
                skillElement.textContent = `${skill.level}/${maxSkillLevel}`;
            }
        });
        
        // Update defensive skills
        const defensiveSkills = ['dodge', 'block'];
        defensiveSkills.forEach((skillName, index) => {
            const skillElement = document.querySelector(`#defensive-skills .skill-item:nth-child(${index + 1}) .skill-level`);
            if (skillElement && skills[skillName]) {
                const skill = skills[skillName];
                skillElement.textContent = `${skill.level}/${maxSkillLevel}`;
            }
        });
        
        // Update combat skills
        const combatSkills = ['offense', 'defense'];
        combatSkills.forEach((skillName, index) => {
            const skillElement = document.querySelector(`#combat-skills .skill-item:nth-child(${index + 1}) .skill-level`);
            if (skillElement && skills[skillName]) {
                const skill = skills[skillName];
                skillElement.textContent = `${skill.level}/${maxSkillLevel}`;
            }
        });
    }

    /**
     * Get item icon HTML
     * @param {Object} item - Item to get icon for
     * @returns {string} Icon HTML
     */
    getItemIcon(item) {
        if (!item) return '';
        
        // Map item types to icon files
        const iconMap = {
            'sword': 'sword001.png',
            'iron sword': 'sword001.png',
            'rusty sword': 'sword001.png',
            'armor': 'chest001.png',
            'leather tunic': 'chest001.png',
            'leather armor': 'chest001.png'
        };
        
        const iconFile = iconMap[item.type] || iconMap[item.name?.toLowerCase()];
        
        if (iconFile) {
            return `<img src="icons/${iconFile}" alt="${item.name}" class="item-icon" />`;
        }
        return '';
    }

    /**
     * Create tooltip text for an item
     * @param {Object} item - Item to create tooltip for
     * @returns {string} Tooltip text
     */
    createItemTooltip(item) {
        if (!item) return '';
        
        let tooltip = `${item.name || 'Unknown Item'}\n`;
        
        // Get proper weapon type display
        let typeDisplay = item.type || 'Unknown';
        if (item.type === 'sword') {
            typeDisplay = '1H Slash';
        } else if (item.type === 'weapon' && item.name && item.name.toLowerCase().includes('sword')) {
            typeDisplay = '1H Slash';
        }
        
        tooltip += `Type: ${typeDisplay}\n`;
        
        if (item.damage) {
            tooltip += `Damage: ${item.damage}\n`;
        }
        
        if (item.defense) {
            tooltip += `Defense: ${item.defense}\n`;
        }
        
        if (item.speed) {
            tooltip += `Speed: ${item.speed}\n`;
        }
        
        if (item.value) {
            tooltip += `Value: ${item.value} gold\n`;
        }
        
        if (item.description) {
            tooltip += `\n${item.description}`;
        }
        
        return tooltip;
    }

    /**
     * Check if inventory is visible
     * @returns {boolean} True if visible
     */
    isInventoryVisible() {
        return this.isVisible;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventoryRenderer;
}
