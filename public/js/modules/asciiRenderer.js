/**
 * ASCII Renderer module implementing the common renderer interface
 */
class ASCIIRenderer {
    constructor() {
        this.container = null;
        this.display = null;
        this.width = 80;
        this.height = 24;
        this.buffer = [];
        this.entities = new Map();
        this.initialized = false;
    }

    /**
     * Initialize the renderer
     * @param {HTMLElement} container - Container element
     * @param {number} width - Display width
     * @param {number} height - Display height
     */
    init(container, width, height) {
        this.container = container;
        this.width = width;
        this.height = height;
        
        // Calculate actual screen dimensions
        this.calculateScreenDimensions();
        
        // Find or create the game display element
        this.display = container.querySelector('#game-display');
        if (!this.display) {
            this.display = document.createElement('pre');
            this.display.id = 'game-display';
            container.appendChild(this.display);
        }

        // Apply scaling styles
        this.applyScalingStyles();

        // Initialize display buffer
        this.initializeBuffer();
        
        // Add mouse hover functionality
        this.setupMouseHover();
        
        // Add window resize listener
        this.setupResizeListener();
        
        this.initialized = true;
    }

    /**
     * Calculate actual screen dimensions for scaling
     */
    calculateScreenDimensions() {
        // These are the dimensions of your ASCII grid
        this.displayCharWidth = this.width; // 80
        this.displayCharHeight = this.height; // 24
        this.charPixelWidth = 8; // Approximate character width in pixels
        this.charPixelHeight = 16; // Approximate character height in pixels
        
        // Get the container dimensions
        const containerRect = this.container.getBoundingClientRect();
        this.actualScreenWidth = Math.floor(containerRect.width);
        this.actualScreenHeight = Math.floor(containerRect.height);
        
        // Log dimensions only once during initialization
        if (!this._dimensionsLogged) {
            console.log(`Screen dimensions calculated:`);
            console.log(`  Container: ${this.actualScreenWidth}x${this.actualScreenHeight}`);
            console.log(`  ASCII Grid: ${this.displayCharWidth}x${this.displayCharHeight}`);
            console.log(`  Char size: ${this.charPixelWidth}x${this.charPixelHeight}`);
            this._dimensionsLogged = true;
        }
    }

    /**
     * Apply scaling to fill the screen properly
     */
    applyScalingStyles() {
        if (!this.display || !this.container) return;
        
        // Get the dimensions of the parent container (game-area)
        const gameArea = this.container.querySelector('#game-area');
        if (!gameArea) return;
        
        const containerWidth = gameArea.clientWidth;
        const containerHeight = gameArea.clientHeight;
        
        // Set base font size
        this.display.style.fontSize = '16px';
        this.display.style.lineHeight = '16px';
        this.display.style.fontFamily = 'Courier New, monospace';
        this.display.style.backgroundColor = '#000000';
        this.display.style.color = '#ffffff';
        this.display.style.whiteSpace = 'pre';
        this.display.style.margin = '0';
        this.display.style.padding = '0';
        
        // Calculate the total pixel size of the ASCII grid
        const gameWidth = this.displayCharWidth * this.charPixelWidth;
        const gameHeight = this.displayCharHeight * this.charPixelHeight;
        
        // Calculate the scale factor to fit the grid inside the container
        const scaleX = containerWidth / gameWidth;
        const scaleY = containerHeight / gameHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Debug logging
        console.log(`Dynamic scaling calculation:`);
        console.log(`  Container: ${containerWidth}x${containerHeight}`);
        console.log(`  Game size: ${gameWidth}x${gameHeight}`);
        console.log(`  Scale factors: X=${scaleX.toFixed(2)}, Y=${scaleY.toFixed(2)}`);
        console.log(`  Final scale: ${scale.toFixed(2)}`);
        
        // Apply the scaling and center it
        this.display.style.width = `${gameWidth}px`;
        this.display.style.height = `${gameHeight}px`;
        this.display.style.transform = `scale(${scale})`;
        this.display.style.transformOrigin = 'center center';
    }

    /**
     * Setup window resize listener
     */
    setupResizeListener() {
        window.addEventListener('resize', () => {
            // Recalculate container dimensions
            this.calculateScreenDimensions();
            // Apply new scaling
            this.applyScalingStyles();
        });
    }

    /**
     * Setup mouse hover functionality
     */
    setupMouseHover() {
        this.hoveredMonster = null;
        this.hoveredEntity = null;
        
        this.display.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });
        
        this.display.addEventListener('mouseleave', () => {
            this.hoveredMonster = null;
            this.hoveredEntity = null;
        });
    }
    
    /**
     * Handle mouse movement for hover detection
     * @param {MouseEvent} event - Mouse move event
     */
    handleMouseMove(event) {
        if (!this.display || !window.game) return;
        
        const rect = this.display.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / this.getCharWidth());
        const y = Math.floor((event.clientY - rect.top) / this.getCharHeight());
        
        // Find entity at mouse position
        this.hoveredEntity = null;
        this.hoveredMonster = null;
        
        for (const entity of window.game.world.getAllEntities().values()) {
            if (entity.active && Math.floor(entity.x) === x && Math.floor(entity.y) === y) {
                this.hoveredEntity = entity;
                if (entity.type === 'monster') {
                    this.hoveredMonster = entity;
                }
                break;
            }
        }
    }
    
    /**
     * Get character width in pixels (approximate)
     * @returns {number} Character width
     */
    getCharWidth() {
        // This is an approximation - in practice, you might want to measure the actual character width
        return 8; // Typical monospace character width
    }
    
    /**
     * Get character height in pixels (approximate)
     * @returns {number} Character height
     */
    getCharHeight() {
        // This is an approximation - in practice, you might want to measure the actual character height
        return 16; // Typical line height
    }

    /**
     * Initialize the display buffer
     */
    initializeBuffer() {
        this.buffer = [];
        for (let y = 0; y < this.height; y++) {
            this.buffer[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.buffer[y][x] = {
                    char: ' ',
                    color: '#ffffff',
                    backgroundColor: '#000000'
                };
            }
        }
    }

    /**
     * Clear the display buffer
     */
    clear() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.buffer[y][x] = {
                    char: ' ',
                    color: '#ffffff',
                    backgroundColor: '#000000'
                };
            }
        }
        this.entities.clear();
    }

    /**
     * Draw a tile on the display
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} char - Character to draw
     * @param {string} color - Text color
     * @param {string} backgroundColor - Background color
     */
    drawTile(x, y, char, color = '#ffffff', backgroundColor = '#000000') {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.buffer[y][x] = {
                char: char,
                color: color,
                backgroundColor: backgroundColor
            };
        }
    }

    /**
     * Draw an entity on the display
     * @param {string} id - Entity ID
     * @param {string} char - Character to draw
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Text color
     */
    drawEntity(id, char, x, y, color = '#ffffff') {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.entities.set(id, { x, y, char, color });
            this.buffer[y][x] = {
                char: char,
                color: color,
                backgroundColor: '#000000'
            };
        }
    }

    /**
     * Draw text on the display
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} text - Text to draw
     * @param {string} color - Text color
     * @param {string} backgroundColor - Background color
     */
    drawText(x, y, text, color = '#ffffff', backgroundColor = '#000000') {
        for (let i = 0; i < text.length; i++) {
            const charX = x + i;
            if (charX >= 0 && charX < this.width && y >= 0 && y < this.height) {
                this.buffer[y][charX] = {
                    char: text[i],
                    color: color,
                    backgroundColor: backgroundColor
                };
            }
        }
    }

    /**
     * Draw a rectangle on the display
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {string} char - Character to use for border
     * @param {string} color - Text color
     */
    drawRect(x, y, width, height, char = '#', color = '#ffffff') {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                const currentX = x + dx;
                const currentY = y + dy;
                
                if (currentX >= 0 && currentX < this.width && currentY >= 0 && currentY < this.height) {
                    // Draw border
                    if (dx === 0 || dx === width - 1 || dy === 0 || dy === height - 1) {
                        this.buffer[currentY][currentX] = {
                            char: char,
                            color: color,
                            backgroundColor: '#000000'
                        };
                    }
                }
            }
        }
    }

    /**
     * Draw a line on the display
     * @param {number} x1 - Start X coordinate
     * @param {number} y1 - Start Y coordinate
     * @param {number} x2 - End X coordinate
     * @param {number} y2 - End Y coordinate
     * @param {string} char - Character to use for line
     * @param {string} color - Text color
     */
    drawLine(x1, y1, x2, y2, char = '*', color = '#ffffff') {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;

        let x = x1;
        let y = y1;

        while (true) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                this.buffer[y][x] = {
                    char: char,
                    color: color,
                    backgroundColor: '#000000'
                };
            }

            if (x === x2 && y === y2) break;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }

    /**
     * Draw a circle on the display
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     * @param {number} radius - Circle radius
     * @param {string} char - Character to use for circle
     * @param {string} color - Text color
     */
    drawCircle(centerX, centerY, radius, char = 'o', color = '#ffffff') {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                if (Math.abs(distance - radius) < 0.5) {
                    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                        this.buffer[y][x] = {
                            char: char,
                            color: color,
                            backgroundColor: '#000000'
                        };
                    }
                }
            }
        }
    }

    /**
     * Render inventory display
     * @param {Entity} player - Player entity
     */
    renderInventory(player) {
        if (!player) return;

        const inventory = player.getComponent('inventory');
        const equipment = player.getComponent('equipment');
        const gold = player.getComponent('gold');
        const items = inventory ? inventory.items : [];

        // Draw inventory title with transparent background
        this.drawText(2, 2, 'INVENTORY', '#ff6b6b', 'transparent');
        this.drawText(2, 3, '=========', '#ff6b6b', 'transparent');

        let y = 5;

        // Show gold
        const goldAmount = gold ? gold.amount : 0;
        this.drawText(2, y, `Gold: ${goldAmount}`, '#ffd700', 'transparent');
        y += 2;

        // Show equipped items
        this.drawText(2, y, 'EQUIPPED:', '#00ff00', 'transparent');
        y += 1;

        if (equipment) {
            // Weapon
            const weapon = equipment.weapon;
            if (weapon) {
                this.drawText(4, y, `Weapon: ${weapon.name}`, '#ffffff', 'transparent');
                this.drawText(6, y + 1, `Damage: ${weapon.damage}`, '#cccccc', 'transparent');
                this.drawText(6, y + 2, `Speed: ${weapon.speed}`, '#cccccc', 'transparent');
                y += 4;
            } else {
                this.drawText(4, y, 'Weapon: None', '#888888', 'transparent');
                y += 2;
            }

            // Armor
            const armor = equipment.armor;
            if (armor) {
                this.drawText(4, y, `Armor: ${armor.name}`, '#ffffff', 'transparent');
                this.drawText(6, y + 1, `Defense: ${armor.defense}`, '#cccccc', 'transparent');
                y += 3;
            } else {
                this.drawText(4, y, 'Armor: None', '#888888', 'transparent');
                y += 2;
            }
        }

        y += 1;

        // Show inventory items
        this.drawText(2, y, 'ITEMS:', '#00ff00', 'transparent');
        y += 1;

        if (!items || items.length === 0) {
            this.drawText(4, y, 'No items in inventory', '#888888', 'transparent');
        } else {
            items.forEach((item, index) => {
                if (y < this.height - 4) {
                    const itemName = item.name || 'Unknown Item';
                    const itemType = item.type || 'Unknown';
                    const itemValue = item.value || 0;
                    
                    this.drawText(4, y, `${index + 1}. ${itemName}`, '#ffd93d', 'transparent');
                    this.drawText(6, y + 1, `Type: ${itemType}`, '#cccccc', 'transparent');
                    this.drawText(6, y + 2, `Value: ${itemValue} gold`, '#cccccc', 'transparent');
                    y += 4;
                }
            });
        }

        // Draw instructions
        this.drawText(2, this.height - 3, 'Press I to close inventory', '#888888', 'transparent');
        this.drawText(2, this.height - 2, 'Use WASD to move when closed', '#888888', 'transparent');
    }


    /**
     * Present the display buffer to the screen
     */
    present() {
        if (!this.initialized || !this.display) return;

        let output = '';
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.buffer[y][x];
                if (cell.color && cell.color !== '#ffffff') {
                    if (cell.backgroundColor === 'transparent') {
                        output += `<span style="color: ${cell.color}">${cell.char}</span>`;
                    } else {
                        output += `<span style="color: ${cell.color}; background-color: ${cell.backgroundColor}">${cell.char}</span>`;
                    }
                } else {
                    output += cell.char;
                }
            }
            if (y < this.height - 1) {
                output += '\n';
            }
        }

        this.display.innerHTML = output;
    }

    /**
     * Render the game world
     * @param {World} world - Game world
     * @param {Entity} player - Player entity
     * @param {Object} options - Render options
     */
    renderWorld(world, player, options = {}) {
        if (!this.initialized) return;

        this.clear();

        const {
            showFOV = true,
            fovRadius = 8,
            showAll = false,
            showInventory = false,
            combatMessages = []
        } = options;

        // Clear the entire buffer first
        this.clearBuffer();

        // Render the entire game area (full height since GUI is now separate)
        this.renderMap(world, player, showFOV, fovRadius, showAll, 0, 0, this.width, this.height);
        this.renderEntities(world, player, showFOV, fovRadius, showAll, 0, 0, this.width, this.height);

        // Update the separate HTML GUI
        this.updateHTMLGUI(world, player, combatMessages);

        // Note: Inventory is now handled by the new inventory overlay system
        // The old ASCII inventory rendering is no longer used

        // Present the display
        this.present();
    }

    /**
     * Update HTML GUI elements
     */
    updateHTMLGUI(world, player, combatMessages) {
        // Update combat messages
        const combatMessagesEl = document.getElementById('combat-messages');
        
        // Add scroll event listener to track user manual scrolling and implement infinite scroll
        if (combatMessagesEl && !combatMessagesEl.hasScrollListener) {
            combatMessagesEl.hasScrollListener = true;
            let userScrolled = false;
            let lastScrollTop = 0;
            
            // Initialize scroll position to bottom (show newest messages)
            combatMessagesEl.dataset.userScrolled = 'false';
            
            combatMessagesEl.addEventListener('scroll', () => {
                const isAtBottom = combatMessagesEl.scrollTop >= combatMessagesEl.scrollHeight - combatMessagesEl.clientHeight - 5;
                userScrolled = !isAtBottom;
                
                // Detect scroll direction for potential future optimizations
                const scrollDirection = combatMessagesEl.scrollTop > lastScrollTop ? 'down' : 'up';
                lastScrollTop = combatMessagesEl.scrollTop;
                
                // Track user scroll intent
                if (userScrolled) {
                    combatMessagesEl.dataset.userScrolled = 'true';
                } else {
                    // If user scrolls back to bottom, reset the flag
                    combatMessagesEl.dataset.userScrolled = 'false';
                }
                
                // User scroll tracking for auto-scroll behavior
            });
        }
        
        if (combatMessagesEl && combatMessages && combatMessages.length > 0) {
            // Implement virtual scrolling - only render visible messages + buffer
            const allMessages = combatMessages;
            const containerHeight = combatMessagesEl.clientHeight;
            const messageHeight = 20; // Approximate height per message
            const bufferSize = 10; // Messages to render outside visible area
            
            // Calculate visible range based on scroll position
            const scrollTop = combatMessagesEl.scrollTop;
            const visibleStart = Math.max(0, Math.floor(scrollTop / messageHeight) - bufferSize);
            const visibleEnd = Math.min(allMessages.length, visibleStart + Math.ceil(containerHeight / messageHeight) + (bufferSize * 2));
            
            // Performance optimization: only update DOM if visible range changed
            const currentVisibleStart = combatMessagesEl.dataset.visibleStart || 0;
            const currentVisibleEnd = combatMessagesEl.dataset.visibleEnd || 0;
            
            if (currentVisibleStart != visibleStart || currentVisibleEnd != visibleEnd || 
                combatMessagesEl.children.length !== (visibleEnd - visibleStart)) {
                
                // Store visible range for next comparison
                combatMessagesEl.dataset.visibleStart = visibleStart;
                combatMessagesEl.dataset.visibleEnd = visibleEnd;
                
                // Create spacer for messages above visible area
                const topSpacer = document.createElement('div');
                topSpacer.style.height = `${visibleStart * messageHeight}px`;
                topSpacer.style.pointerEvents = 'none';
                
                // Create visible messages
                const visibleMessages = allMessages.slice(visibleStart, visibleEnd);
                const messagesHTML = visibleMessages.map(msg => {
                // Don't truncate messages - let CSS handle overflow
                const truncatedText = msg.text;
                
                // Determine CSS class based on message type and color
                let cssClass = 'log-entry';
                
                if (msg.type === 'combat') {
                    if (msg.text.toLowerCase().includes('miss') || msg.text.toLowerCase().includes('fail') || msg.color === '#cccccc') {
                        cssClass += ' miss';
                    } else if (msg.color === '#51cf66') { // Green - player hits
                        cssClass += ' player-hit';
                    } else if (msg.color === '#ff6b6b') { // Red - monster hits
                        cssClass += ' monster-hit';
                    } else {
                        cssClass += ' combat';
                    }
                } else if (msg.type === 'heal') {
                    cssClass += ' heal';
                } else if (msg.type === 'xp') {
                    cssClass += ' xp';
                } else if (msg.type === 'levelup') {
                    cssClass += ' levelup';
                } else if (msg.type === 'notice') {
                    cssClass += ' notice';
                } else if (msg.type === 'loot') {
                    cssClass += ' loot';
                }
                
                // Use inline style if custom color is provided, otherwise use CSS class
                if (msg.color && msg.color !== '#ffffff') {
                    return `<div class="${cssClass}" style="color: ${msg.color}">${truncatedText}</div>`;
                } else {
                    return `<div class="${cssClass}">${truncatedText}</div>`;
                }
                }).join('');
                
                // Create spacer for messages below visible area
                const bottomSpacer = document.createElement('div');
                bottomSpacer.style.height = `${(allMessages.length - visibleEnd) * messageHeight}px`;
                bottomSpacer.style.pointerEvents = 'none';
                
                // Update DOM with virtual scrolling structure
                combatMessagesEl.innerHTML = '';
                combatMessagesEl.appendChild(topSpacer);
                combatMessagesEl.insertAdjacentHTML('beforeend', messagesHTML);
                combatMessagesEl.appendChild(bottomSpacer);
                
                // Update total height to enable proper scrolling
                combatMessagesEl.style.height = `${allMessages.length * messageHeight}px`;
                
                // Virtual scrolling updated
            }
            
            // Auto-scroll to bottom for new messages unless user has manually scrolled up
            // Only auto-scroll if messages count changed (new messages added)
            const currentMessageCount = parseInt(combatMessagesEl.dataset.messageCount || '0');
            if (allMessages.length > currentMessageCount) {
                setTimeout(() => {
                    if (combatMessagesEl) {
                        const userHasScrolled = combatMessagesEl.dataset.userScrolled === 'true';
                        
                        // Only auto-scroll if user hasn't manually scrolled up
                        if (!userHasScrolled) {
                            combatMessagesEl.scrollTop = combatMessagesEl.scrollHeight;
                        }
                    }
                }, 0);
                
                // Update message count to track when new messages are added
                combatMessagesEl.dataset.messageCount = allMessages.length;
            }
        }

        // Update enemies nearby
        const enemiesEl = document.getElementById('enemies-list');
        if (enemiesEl) {
            const nearbyEnemies = this.getNearbyEnemies(world, player);
            if (nearbyEnemies.length > 0) {
                enemiesEl.innerHTML = nearbyEnemies.map(enemy => {
                    // Generate consistent pastel color for monster name based on ID
                    const nameColor = this.getPastelColorForEntity(enemy.id || enemy.name || 'unknown');
                    
                    // Colorize monster HP same as player HP
                    const percentage = (enemy.health / enemy.maxHealth) * 100;
                    let currentColor;
                    
                    if (percentage >= 100) {
                        currentColor = '#00ff00'; // Green
                    } else if (percentage >= 75) {
                        currentColor = '#80ff00'; // Yellow-green
                    } else if (percentage >= 50) {
                        currentColor = '#ffff00'; // Yellow
                    } else if (percentage >= 25) {
                        currentColor = '#ff8000'; // Orange
                    } else {
                        currentColor = '#ff0000'; // Red
                    }
                    
                    return `<div><span style="color: ${nameColor}">${enemy.name}</span> Lv:${enemy.level} HP:<span style="color: ${currentColor}">${enemy.health}</span><span style="color: #ffffff">/${enemy.maxHealth}</span></div>`;
                }).join('');
            } else {
                enemiesEl.innerHTML = '<div>None</div>';
            }
        }

        // Update player stats
        const statsEl = document.getElementById('stats-content');
        if (statsEl && player) {
            const health = player.getComponent('health');
            const level = player.getComponent('level');
            const stats = player.getComponent('stats');
            
            let statsHTML = '';
            if (health) {
                // Colorize the current health value based on percentage, keep max white
                const percentage = (health.current / health.max) * 100;
                let currentColor;
                
                if (percentage >= 100) {
                    currentColor = '#00ff00'; // Green
                } else if (percentage >= 75) {
                    currentColor = '#80ff00'; // Yellow-green
                } else if (percentage >= 50) {
                    currentColor = '#ffff00'; // Yellow
                } else if (percentage >= 25) {
                    currentColor = '#ff8000'; // Orange
                } else {
                    currentColor = '#ff0000'; // Red
                }
                
                statsHTML += `<div>HP: <span style="color: ${currentColor}">${health.current}</span><span style="color: #ffffff">/${health.max}</span></div>`;
            }
            if (level) {
                statsHTML += `<div>Level: ${level.value}</div>`;
                statsHTML += `<div>XP: ${level.experience}/${level.experienceToNext}</div>`;
            }
            if (stats) {
                statsHTML += `<div>STR: ${stats.strength}</div>`;
                statsHTML += `<div>DEX: ${stats.dexterity}</div>`;
                statsHTML += `<div>INT: ${stats.intelligence}</div>`;
                statsHTML += `<div>CON: ${stats.constitution}</div>`;
                statsHTML += `<div>AGI: ${stats.agility}</div>`;
            }
            statsEl.innerHTML = statsHTML;
        }

        // Update controls
        const controlsEl = document.getElementById('controls-content');
        if (controlsEl) {
            controlsEl.innerHTML = `
                <div>WASD = Move Character</div>
                <div>Q = Engage Combat Mode</div>
                <div>C/I = Character Sheet (Pause)</div>
                <div>R = Rest</div>
                <div>Space = Loot/Interact</div>
                <div>F7 = Report Bug</div>
            `;
        }
    }

    /**
     * Render unified GUI with ASCII borders (legacy method - no longer used)
     */
    renderUnifiedGUI(world, player, combatMessages, guiStartY, guiHeight) {
        // Calculate section widths - ensure they fit properly
        const sectionWidth = Math.floor(this.width / 4);
        const maxTextWidth = sectionWidth - 3; // Leave space for borders and padding
        
        // Draw main GUI border (full width)
        for (let y = guiStartY; y < guiStartY + guiHeight; y++) {
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || x === this.width - 1 || y === guiStartY || y === guiStartY + guiHeight - 1) {
                    this.buffer[y][x] = {
                        char: '#',
                        color: '#333333',
                        backgroundColor: '#000000'
                    };
                }
            }
        }

        // Draw vertical dividers between sections
        for (let y = guiStartY; y < guiStartY + guiHeight; y++) {
            this.buffer[y][sectionWidth] = {
                char: '#',
                color: '#333333',
                backgroundColor: '#000000'
            };
            this.buffer[y][sectionWidth * 2] = {
                char: '#',
                color: '#333333',
                backgroundColor: '#000000'
            };
            this.buffer[y][sectionWidth * 3] = {
                char: '#',
                color: '#333333',
                backgroundColor: '#000000'
            };
        }

        // Section 1: Combat Log
        this.drawText(2, guiStartY + 1, 'COMBAT LOG', '#ffffff', 'transparent');
        this.drawText(2, guiStartY + 2, '==========', '#ffffff', 'transparent');
        if (combatMessages && combatMessages.length > 0) {
            const maxMessages = Math.min(combatMessages.length, guiHeight - 4);
            for (let i = 0; i < maxMessages; i++) {
                const msg = combatMessages[combatMessages.length - 1 - i];
                const text = msg.text.length > maxTextWidth ? msg.text.substring(0, maxTextWidth) : msg.text;
                this.drawText(2, guiStartY + 3 + i, text, msg.color || '#ffffff', 'transparent');
            }
        }

        // Section 2: Enemies Nearby
        this.drawText(sectionWidth + 2, guiStartY + 1, 'ENEMIES NEARBY', '#ffffff', 'transparent');
        this.drawText(sectionWidth + 2, guiStartY + 2, '==============', '#ffffff', 'transparent');
        const nearbyEnemies = this.getNearbyEnemies(world, player);
        for (let i = 0; i < Math.min(nearbyEnemies.length, guiHeight - 4); i++) {
            const enemy = nearbyEnemies[i];
            let text = `${enemy.name} Lv:${enemy.level} HP:${enemy.health}/${enemy.maxHealth}`;
            if (text.length > maxTextWidth) {
                text = text.substring(0, maxTextWidth);
            }
            this.drawText(sectionWidth + 2, guiStartY + 3 + i, text, '#ffffff', 'transparent');
        }

        // Section 3: Player Stats
        this.drawText((sectionWidth * 2) + 2, guiStartY + 1, 'PLAYER STATS', '#ffffff', 'transparent');
        this.drawText((sectionWidth * 2) + 2, guiStartY + 2, '============', '#ffffff', 'transparent');
        const health = player.getComponent('health');
        const level = player.getComponent('level');
        const stats = player.getComponent('stats');
        
        let y = guiStartY + 3;
        if (health) {
            // Colorize health display - current health colorized, max white
            const percentage = (health.current / health.max) * 100;
            let currentColor;
            
            if (percentage >= 100) {
                currentColor = '#00ff00'; // Green
            } else if (percentage >= 75) {
                currentColor = '#80ff00'; // Yellow-green
            } else if (percentage >= 50) {
                currentColor = '#ffff00'; // Yellow
            } else if (percentage >= 25) {
                currentColor = '#ff8000'; // Orange
            } else {
                currentColor = '#ff0000'; // Red
            }
            
            let text = `HP: ${health.current}/${health.max}`;
            if (text.length > maxTextWidth) text = text.substring(0, maxTextWidth);
            this.drawText((sectionWidth * 2) + 2, y++, text, currentColor, 'transparent');
        }
        if (level) {
            let text = `Level: ${level.value}`;
            if (text.length > maxTextWidth) text = text.substring(0, maxTextWidth);
            this.drawText((sectionWidth * 2) + 2, y++, text, '#ffffff', 'transparent');
            
            text = `XP: ${level.experience}/${level.experienceToNext}`;
            if (text.length > maxTextWidth) text = text.substring(0, maxTextWidth);
            this.drawText((sectionWidth * 2) + 2, y++, text, '#ffffff', 'transparent');
        }
        if (stats) {
            let text = `STR: ${stats.strength}`;
            if (text.length > maxTextWidth) text = text.substring(0, maxTextWidth);
            this.drawText((sectionWidth * 2) + 2, y++, text, '#ffffff', 'transparent');
            
            text = `DEX: ${stats.dexterity}`;
            if (text.length > maxTextWidth) text = text.substring(0, maxTextWidth);
            this.drawText((sectionWidth * 2) + 2, y++, text, '#ffffff', 'transparent');
            
            text = `INT: ${stats.intelligence}`;
            if (text.length > maxTextWidth) text = text.substring(0, maxTextWidth);
            this.drawText((sectionWidth * 2) + 2, y++, text, '#ffffff', 'transparent');
            
            text = `CON: ${stats.constitution}`;
            if (text.length > maxTextWidth) text = text.substring(0, maxTextWidth);
            this.drawText((sectionWidth * 2) + 2, y++, text, '#ffffff', 'transparent');
            
            text = `AGI: ${stats.agility}`;
            if (text.length > maxTextWidth) text = text.substring(0, maxTextWidth);
            this.drawText((sectionWidth * 2) + 2, y++, text, '#ffffff', 'transparent');
        }

        // Section 4: Controls
        this.drawText((sectionWidth * 3) + 2, guiStartY + 1, 'CONTROLS', '#ffffff', 'transparent');
        this.drawText((sectionWidth * 3) + 2, guiStartY + 2, '========', '#ffffff', 'transparent');
        this.drawText((sectionWidth * 3) + 2, guiStartY + 3, 'WASD Move', '#ffffff', 'transparent');
        this.drawText((sectionWidth * 3) + 2, guiStartY + 4, 'Q Engage', '#ffffff', 'transparent');
        this.drawText((sectionWidth * 3) + 2, guiStartY + 5, 'X Attack', '#ffffff', 'transparent');
        this.drawText((sectionWidth * 3) + 2, guiStartY + 6, 'I Inventory', '#ffffff', 'transparent');
        this.drawText((sectionWidth * 3) + 2, guiStartY + 7, 'R Rest', '#ffffff', 'transparent');
        this.drawText((sectionWidth * 3) + 2, guiStartY + 8, 'C Chest', '#ffffff', 'transparent');
        this.drawText((sectionWidth * 3) + 2, guiStartY + 9, 'Space Loot/Chest', '#ffffff', 'transparent');
    }


    /**
     * Get monster name from monster object
     * @param {Object} monster - Monster entity object
     * @returns {string} Formatted monster name
     */
    getMonsterName(monster) {
        return EntityUtils.getEntityName(monster);
    }

    /**
     * Get a consistent pastel color for an entity based on its ID
     * @param {string} entityId - Entity ID to generate color for
     * @returns {string} Pastel color in hex format
     */
    getPastelColorForEntity(entityId) {
        // Handle undefined or null entityId
        if (!entityId || typeof entityId !== 'string') {
            entityId = 'unknown';
        }
        
        // Create a simple hash from the entity ID
        let hash = 0;
        for (let i = 0; i < entityId.length; i++) {
            hash = ((hash << 5) - hash + entityId.charCodeAt(i)) & 0xffffffff;
        }
        
        // Use hash to generate consistent pastel colors
        const pastelColors = [
            '#FFB6C1', // Light Pink
            '#FFA07A', // Light Salmon
            '#FFE4B5', // Moccasin
            '#FFFFE0', // Light Yellow
            '#F0FFF0', // Honeydew
            '#E0FFFF', // Light Cyan
            '#E6E6FA', // Lavender
            '#F5F5DC', // Beige
            '#FFEFD5', // Papaya Whip
            '#FFDAB9', // Peach Puff
            '#DDA0DD', // Plum
            '#98FB98', // Pale Green
            '#F0E68C', // Khaki
            '#87CEEB', // Sky Blue
            '#D3D3D3', // Light Gray
            '#FFC0CB', // Pink
            '#ADD8E6', // Light Blue
            '#F0F8FF', // Alice Blue
            '#FFF8DC', // Cornsilk
            '#F5FFFA'  // Mint Cream
        ];
        
        // Use hash to select a color from the pastel palette
        const colorIndex = Math.abs(hash) % pastelColors.length;
        return pastelColors[colorIndex];
    }

    /**
     * Get nearby enemies for display
     */
    getNearbyEnemies(world, player) {
        const enemies = [];
        
        // Use the new World method to get entities within radius
        const nearbyEntities = world.getEntitiesInRadius(player, 10); // Within 10 tiles
        
        for (const entity of nearbyEntities) {
            if (EntityUtils.isMonster(entity)) {
                const healthInfo = EntityUtils.getEntityHealth(entity);
                const level = EntityUtils.getEntityLevel(entity);
                const monsterName = EntityUtils.getMonsterType(entity); // Get name without article
                
                enemies.push({
                    id: entity.id, // Include the entity ID for color generation
                    name: monsterName,
                    level: level,
                    health: healthInfo.current,
                    maxHealth: healthInfo.max
                });
            }
        }
        
        return enemies.slice(0, 5); // Limit to 5 enemies
    }



    /**
     * Clear the entire buffer
     */
    clearBuffer() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.buffer[y][x] = {
                    char: ' ',
                    color: '#ffffff',
                    backgroundColor: 'transparent'
                };
            }
        }
    }

    /**
     * Clear the GUI area
     * @param {number} guiStartY - Y coordinate where GUI starts
     * @param {number} guiHeight - Height of GUI area
     */
    clearGUIArea(guiStartY, guiHeight) {
        for (let y = guiStartY; y < guiStartY + guiHeight; y++) {
            for (let x = 0; x < this.width; x++) {
                this.buffer[y][x] = {
                    char: ' ',
                    color: '#ffffff',
                    backgroundColor: '#000000'
                };
            }
        }
    }




    /**
     * Render the map
     * @param {World} world - Game world
     * @param {Entity} player - Player entity
     * @param {boolean} showFOV - Whether to show field of view
     * @param {number} fovRadius - Field of view radius
     * @param {boolean} showAll - Whether to show everything
     * @param {number} startX - Start X coordinate
     * @param {number} startY - Start Y coordinate
     * @param {number} width - Width of render area
     * @param {number} height - Height of render area
     */
    renderMap(world, player, showFOV, fovRadius, showAll, startX = 0, startY = 0, width = this.width, height = this.height) {
        const map = world.map;
        const playerX = player ? player.x : 0;
        const playerY = player ? player.y : 0;

        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tile = map[y][x];
                const distance = Math.sqrt((x - playerX) ** 2 + (y - playerY) ** 2);
                
                // Check if tile should be visible
                const isVisible = showAll || !showFOV || distance <= fovRadius;
                
                if (isVisible) {
                    let char = tile.char;
                    let color = '#ffffff';
                    
                    // Set tile colors
                    switch (tile.type) {
                        case 'wall':
                            char = '#';
                            color = '#C0C0C0'; // Light grey
                            break;
                        case 'floor':
                            char = '.';
                            color = '#696969'; // Darker grey
                            break;
                        case 'door':
                            char = tile.open ? '/' : '+';
                            color = '#8B4513';
                            break;
                        case 'water':
                            char = '~';
                            color = '#0066CC';
                            break;
                        case 'lava':
                            char = '~';
                            color = '#FF0000';
                            break;
                        case 'hallway_exit':
                            char = '>';
                            color = '#8B4513'; // Brown color for exits
                            break;
                    }
                    
                    this.drawTile(x, y, char, color);
                } else if (tile.explored) {
                    // Show explored but not visible tiles
                    this.drawTile(x, y, tile.char, '#444444');
                }
            }
        }
    }

    /**
     * Render entities
     * @param {World} world - Game world
     * @param {Entity} player - Player entity
     * @param {boolean} showFOV - Whether to show field of view
     * @param {number} fovRadius - Field of view radius
     * @param {boolean} showAll - Whether to show everything
     * @param {number} startX - Start X coordinate
     * @param {number} startY - Start Y coordinate
     * @param {number} width - Width of render area
     * @param {number} height - Height of render area
     */
    renderEntities(world, player, showFOV, fovRadius, showAll, startX = 0, startY = 0, width = this.width, height = this.height) {
        const playerX = player ? player.x : 0;
        const playerY = player ? player.y : 0;

        // First, render all entities except the player and swing animations
        for (const entity of world.getAllEntities().values()) {
            if (!entity.active || entity.type === 'player' || entity.type === 'swing_animation') continue;

            const distance = Math.sqrt((entity.x - playerX) ** 2 + (entity.y - playerY) ** 2);
            const isVisible = showAll || !showFOV || distance <= fovRadius;

            if (isVisible) {
                let char = '?';
                let color = '#ffffff';

                // Get entity appearance
                const appearance = entity.getComponent('appearance');
                if (appearance) {
                    char = appearance.char;
                    color = appearance.color;
                } else {
                    // Default appearance based on type
                    switch (entity.type) {
                        case 'monster':
                            // Get monster type from entity ID or use default
                            const monsterType = this.getMonsterTypeFromId(entity.id);
                            char = this.getMonsterChar(monsterType);
                            // Change color based on notice state
                            const notice = entity.getComponent('notice');
                            if (notice && notice.hasNoticed) {
                                color = '#ff0000'; // Red when hostile
                            } else if (notice && notice.noticeTimer > 0) {
                                color = '#ffa500'; // Orange when noticing
                            } else {
                                color = '#ffffff'; // White when unaware
                            }
                            break;
                        case 'projectile':
                            char = '*';
                            color = '#ffff00';
                            break;
                        case 'item':
                            char = 'i';
                            color = '#00ff00';
                            break;
                        case 'corpse':
                            char = '%';
                            color = '#8B0000'; // Dark red color for corpse
                            break;
                    }
                }

                // Check for hit effect
                const hitEffect = entity.getComponent('hitEffect');
                if (hitEffect && hitEffect.remaining > 0) {
                    // Flash white when hit
                    color = '#ffffff';
                    // Decrease hit effect duration
                    hitEffect.remaining--;
                    if (hitEffect.remaining <= 0) {
                        entity.removeComponent('hitEffect');
                    }
                }

                this.drawEntity(entity.id, char, entity.x, entity.y, color);
            }
        }

        // Then, render the player last to ensure it's always visible
        if (player && player.active) {
            const distance = Math.sqrt((player.x - playerX) ** 2 + (player.y - playerY) ** 2);
            const isVisible = showAll || !showFOV || distance <= fovRadius;

            if (isVisible) {
                let char = '@';
                let color = '#ffffff';

                // Get player appearance
                const appearance = player.getComponent('appearance');
                if (appearance) {
                    char = appearance.char;
                    color = appearance.color;
                }

                // Check for rest animation
                if (player.isResting && player.restAnimationStart) {
                    const now = Date.now();
                    const elapsed = now - player.restAnimationStart;
                    const pulseCycle = 2000; // 2 second pulse cycle
                    const pulseProgress = (elapsed % pulseCycle) / pulseCycle;
                    
                    // Create pulsing effect: white to green to white
                    if (pulseProgress < 0.5) {
                        // First half: white to green
                        const intensity = pulseProgress * 2;
                        const red = Math.floor(255 * (1 - intensity));
                        const green = Math.floor(255 * intensity);
                        const blue = Math.floor(255 * (1 - intensity));
                        color = `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
                    } else {
                        // Second half: green to white
                        const intensity = (pulseProgress - 0.5) * 2;
                        const red = Math.floor(255 * intensity);
                        const green = 255;
                        const blue = Math.floor(255 * intensity);
                        color = `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
                    }
                }

                // Check for hit effect
                const hitEffect = player.getComponent('hitEffect');
                if (hitEffect && hitEffect.remaining > 0) {
                    // Flash white when hit
                    color = '#ffffff';
                    // Decrease hit effect duration
                    hitEffect.remaining--;
                    if (hitEffect.remaining <= 0) {
                        player.removeComponent('hitEffect');
                    }
                }

                this.drawEntity(player.id, char, player.x, player.y, color);
            }
        }

        // Finally, render swing animations on top of everything else
        this.renderSwingAnimations(world, player, showFOV, fovRadius, showAll);
    }

    /**
     * Render swing animations
     * @param {World} world - Game world
     * @param {Entity} player - Player entity
     * @param {boolean} showFOV - Whether to show field of view
     * @param {number} fovRadius - Field of view radius
     * @param {boolean} showAll - Whether to show everything
     */
    renderSwingAnimations(world, player, showFOV, fovRadius, showAll) {
        const playerX = player ? player.x : 0;
        const playerY = player ? player.y : 0;

        for (const entity of world.getAllEntities().values()) {
            if (!entity.active || entity.type !== 'swing_animation') continue;
            
            const distance = Math.sqrt((entity.x - playerX) ** 2 + (entity.y - playerY) ** 2);
            const isVisible = showAll || !showFOV || distance <= fovRadius;

            if (isVisible) {
                const char = entity.getCurrentChar();
                const color = entity.getCurrentColor();
                const x = Math.floor(entity.x);
                const y = Math.floor(entity.y);
                
                // Draw swing animation directly to buffer to ensure it's on top
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.buffer[y][x] = {
                        char: char,
                        color: color,
                        backgroundColor: '#000000'
                    };
                }
            }
        }
    }


    /**
     * Render monster information (HP and level) - Legacy method
     * @param {Entity} monster - Monster entity
     */
    renderMonsterInfo(monster) {
        const health = monster.getComponent('health');
        const stats = monster.getComponent('stats');
        
        if (!health) return;
        
        // Get monster name
        const appearance = monster.getComponent('appearance');
        const monsterName = appearance ? appearance.name : monster.monsterType || 'Monster';
        
        // Get level (if stats exist)
        const level = stats ? (stats.level || 1) : 1;
        
        // Format HP display
        const hpText = `${monsterName} L${level} ${health.current}/${health.max}`;
        
        // Position monster info directly above the monster's M icon, centered
        let infoX = monster.x - Math.floor(hpText.length / 2);
        let infoY = monster.y - 1; // 1 character above the monster
        
        // Ensure the text doesn't go off the left edge
        if (infoX < 0) {
            infoX = 0;
        }
        
        // Ensure the text doesn't go off the right edge
        if (infoX + hpText.length >= this.width) {
            infoX = this.width - hpText.length;
        }
        
        // Always draw monster info if the monster is visible (ignore view circle for info text)
        // Only check if we're within the display bounds
        if (infoY >= 0 && infoY < this.height && infoX >= 0 && infoX < this.width) {
            this.drawText(infoX, infoY, hpText, '#ffff00'); // Yellow text for monster info
        }
    }

    /**
     * Render UI elements
     * @param {Entity} player - Player entity
     * @param {Object} gameState - Game state
     */
    renderUI(player, gameState = {}) {
        if (!this.initialized) return;

        // Render player stats
        if (player) {
            this.renderPlayerStats(player);
        }

        // Render game messages
        if (gameState.messages) {
            this.renderMessages(gameState.messages);
        }

        // Combat messages are now handled in the GUI section
    }

    /**
     * Render player statistics
     * @param {Entity} player - Player entity
     */
    renderPlayerStats(player) {
        const health = player.getComponent('health');
        const level = player.getComponent('level');
        const mana = player.getComponent('mana');

        if (health) {
            const healthPercent = Math.floor((health.current / health.max) * 100);
            this.drawText(0, this.height - 3, `HP: ${health.current}/${health.max} (${healthPercent}%)`, '#ff0000');
        }

        if (level) {
            this.drawText(0, this.height - 2, `Level: ${level.value}`, '#ffff00');
            // Show XP progress
            const currentXP = level.experience || 0;
            const nextLevelXP = level.experienceToNext || 100;
            const xpPercent = Math.floor((currentXP / nextLevelXP) * 100);
            this.drawText(0, this.height - 1, `XP: ${currentXP}/${nextLevelXP} (${xpPercent}%)`, '#00ffff');
        }

        if (mana) {
            const manaPercent = Math.floor((mana.current / mana.max) * 100);
            this.drawText(0, this.height - 4, `MP: ${mana.current}/${mana.max} (${manaPercent}%)`, '#0000ff');
        }
    }

    /**
     * Render game messages
     * @param {Array} messages - Array of messages
     */
    renderMessages(messages) {
        const maxMessages = 5;
        const startY = this.height - 10;
        
        for (let i = 0; i < Math.min(messages.length, maxMessages); i++) {
            const message = messages[messages.length - 1 - i];
            this.drawText(0, startY + i, message.text, message.color || '#ffffff');
        }
    }


    /**
     * Get the display element
     * @returns {HTMLElement} Display element
     */
    getDisplay() {
        return this.display;
    }

    /**
     * Set display size
     * @param {number} width - New width
     * @param {number} height - New height
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.initializeBuffer();
    }

    /**
     * Check if renderer is initialized
     * @returns {boolean} True if initialized
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Get monster type from entity ID
     * @param {string} entityId - Entity ID
     * @returns {string} Monster type
     */
    getMonsterTypeFromId(entityId) {
        // Extract monster type from ID (e.g., "monster_1234567890_0" -> "goblin")
        if (entityId.includes('goblin')) return 'goblin';
        if (entityId.includes('orc')) return 'orc';
        if (entityId.includes('troll')) return 'troll';
        if (entityId.includes('skeleton')) return 'skeleton';
        if (entityId.includes('dragon')) return 'dragon';
        return 'goblin'; // Default
    }

    /**
     * Get monster character
     * @param {string} monsterType - Monster type
     * @returns {string} Character to display
     */
    getMonsterChar(monsterType) {
        return 'M'; // All monsters use 'M'
    }

    /**
     * Get monster color
     * @param {string} monsterType - Monster type
     * @returns {string} Color for monster
     */
    getMonsterColor(monsterType) {
        const colors = {
            goblin: '#00ff00',
            orc: '#8B4513',
            troll: '#696969',
            skeleton: '#C0C0C0',
            dragon: '#FF0000'
        };
        return colors[monsterType] || '#666666';
    }
}
