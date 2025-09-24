/**
 * Map Generator module for creating dungeon layouts
 */
class MapGenerator {
    constructor() {
        this.rooms = [];
        this.corridors = [];
    }

    /**
     * Generate a dungeon map
     * @param {number} width - Map width
     * @param {number} height - Map height
     * @param {Object} options - Generation options
     * @returns {Array} 2D array representing the map
     */
    generateDungeon(width, height, options = {}) {
        const {
            minRoomSize = 4,
            maxRoomSize = 12,
            maxRooms = 15,
            roomPadding = 2
        } = options;

        this.rooms = [];
        this.corridors = [];

        // Initialize map with walls
        const map = this.initializeMap(width, height);

        // Generate rooms
        this.generateRooms(map, minRoomSize, maxRoomSize, maxRooms, roomPadding);

        // Connect rooms with corridors
        this.connectRooms(map);

        // Add doors
        this.addDoors(map);

        // Add hallways to new areas
        this.addHallways(map);

        return map;
    }

    /**
     * Initialize map with walls
     * @param {number} width - Map width
     * @param {number} height - Map height
     * @returns {Array} 2D array filled with walls
     */
    initializeMap(width, height) {
        const map = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                map[y][x] = {
                    type: 'wall',
                    char: '#',
                    passable: false,
                    explored: false
                };
            }
        }
        return map;
    }

    /**
     * Generate rooms randomly
     * @param {Array} map - Map array to modify
     * @param {number} minSize - Minimum room size
     * @param {number} maxSize - Maximum room size
     * @param {number} maxRooms - Maximum number of rooms
     * @param {number} padding - Padding around rooms
     */
    generateRooms(map, minSize, maxSize, maxRooms, padding) {
        const width = map[0].length;
        const height = map.length;
        let attempts = 0;
        const maxAttempts = maxRooms * 3;

        while (this.rooms.length < maxRooms && attempts < maxAttempts) {
            attempts++;

            const roomWidth = this.randomInt(minSize, maxSize);
            const roomHeight = this.randomInt(minSize, maxSize);
            const x = this.randomInt(1, width - roomWidth - 1);
            const y = this.randomInt(1, height - roomHeight - 1);

            const room = {
                x, y, width: roomWidth, height: roomHeight,
                centerX: Math.floor(x + roomWidth / 2),
                centerY: Math.floor(y + roomHeight / 2)
            };

            if (this.isRoomValid(room, padding)) {
                this.rooms.push(room);
                this.carveRoom(map, room);
            }
        }
    }

    /**
     * Check if a room placement is valid
     * @param {Object} room - Room object
     * @param {number} padding - Padding around room
     * @returns {boolean} True if room placement is valid
     */
    isRoomValid(room, padding) {
        for (const existingRoom of this.rooms) {
            if (this.roomsOverlap(room, existingRoom, padding)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if two rooms overlap
     * @param {Object} room1 - First room
     * @param {Object} room2 - Second room
     * @param {number} padding - Padding between rooms
     * @returns {boolean} True if rooms overlap
     */
    roomsOverlap(room1, room2, padding) {
        return !(room1.x + room1.width + padding < room2.x ||
                room2.x + room2.width + padding < room1.x ||
                room1.y + room1.height + padding < room2.y ||
                room2.y + room2.height + padding < room1.y);
    }

    /**
     * Carve out a room in the map
     * @param {Array} map - Map array to modify
     * @param {Object} room - Room object
     */
    carveRoom(map, room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                map[y][x] = {
                    type: 'floor',
                    char: '.',
                    passable: true,
                    explored: false
                };
            }
        }
    }

    /**
     * Connect all rooms with corridors
     * @param {Array} map - Map array to modify
     */
    connectRooms(map) {
        if (this.rooms.length < 2) return;

        // Connect each room to the next one
        for (let i = 0; i < this.rooms.length - 1; i++) {
            const room1 = this.rooms[i];
            const room2 = this.rooms[i + 1];
            this.connectTwoRooms(map, room1, room2);
        }

        // Add some random connections for more interesting layouts
        const extraConnections = Math.floor(this.rooms.length / 3);
        for (let i = 0; i < extraConnections; i++) {
            const room1 = this.rooms[this.randomInt(0, this.rooms.length)];
            const room2 = this.rooms[this.randomInt(0, this.rooms.length)];
            if (room1 !== room2) {
                this.connectTwoRooms(map, room1, room2);
            }
        }
    }

    /**
     * Connect two rooms with a corridor
     * @param {Array} map - Map array to modify
     * @param {Object} room1 - First room
     * @param {Object} room2 - Second room
     */
    connectTwoRooms(map, room1, room2) {
        const corridor = this.createCorridor(room1, room2);
        this.carveCorridor(map, corridor);
        this.corridors.push(corridor);
    }

    /**
     * Create a corridor between two rooms
     * @param {Object} room1 - First room
     * @param {Object} room2 - Second room
     * @returns {Object} Corridor object
     */
    createCorridor(room1, room2) {
        const startX = room1.centerX;
        const startY = room1.centerY;
        const endX = room2.centerX;
        const endY = room2.centerY;

        const corridor = {
            startX, startY, endX, endY,
            points: []
        };

        // Create L-shaped corridor
        let currentX = startX;
        let currentY = startY;

        // Move horizontally first
        while (currentX !== endX) {
            corridor.points.push({ x: currentX, y: currentY });
            currentX += currentX < endX ? 1 : -1;
        }

        // Then move vertically
        while (currentY !== endY) {
            corridor.points.push({ x: currentX, y: currentY });
            currentY += currentY < endY ? 1 : -1;
        }

        // Add end point
        corridor.points.push({ x: endX, y: endY });

        return corridor;
    }

    /**
     * Carve out a corridor in the map
     * @param {Array} map - Map array to modify
     * @param {Object} corridor - Corridor object
     */
    carveCorridor(map, corridor) {
        for (const point of corridor.points) {
            if (map[point.y] && map[point.y][point.x]) {
                map[point.y][point.x] = {
                    type: 'floor',
                    char: '.',
                    passable: true,
                    explored: false
                };
            }
        }
    }

    /**
     * Add doors to the map
     * @param {Array} map - Map array to modify
     */
    addDoors(map) {
        const doorChance = 0.3; // 30% chance for a door

        for (const room of this.rooms) {
            // Add doors at room entrances
            this.addDoorsToRoom(map, room, doorChance);
        }
    }

    /**
     * Add doors to a specific room
     * @param {Array} map - Map array to modify
     * @param {Object} room - Room object
     * @param {number} doorChance - Chance of adding a door
     */
    addDoorsToRoom(map, room, doorChance) {
        const width = map[0].length;
        const height = map.length;

        // Check each wall of the room
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (this.isWall(map, x, y) && this.isAdjacentToFloor(map, x, y)) {
                    if (Math.random() < doorChance) {
                        map[y][x] = {
                            type: 'door',
                            char: '+',
                            passable: true,
                            explored: false,
                            open: false
                        };
                    }
                }
            }
        }
    }

    /**
     * Check if a position is a wall
     * @param {Array} map - Map array
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if position is a wall
     */
    isWall(map, x, y) {
        if (x < 0 || x >= map[0].length || y < 0 || y >= map.length) {
            return false;
        }
        return map[y][x].type === 'wall';
    }

    /**
     * Check if a position is adjacent to a floor
     * @param {Array} map - Map array
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if adjacent to floor
     */
    isAdjacentToFloor(map, x, y) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < map[0].length && ny >= 0 && ny < map.length) {
                if (map[ny][nx].type === 'floor') {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Get a random room
     * @returns {Object|null} Random room or null if no rooms
     */
    getRandomRoom() {
        if (this.rooms.length === 0) return null;
        return this.rooms[this.randomInt(0, this.rooms.length)];
    }

    /**
     * Get all rooms
     * @returns {Array} Array of all rooms
     */
    getRooms() {
        return this.rooms;
    }

    /**
     * Get all corridors
     * @returns {Array} Array of all corridors
     */
    getCorridors() {
        return this.corridors;
    }

    /**
     * Generate a random integer between min and max (exclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Generate a simple cave-like map
     * @param {number} width - Map width
     * @param {number} height - Map height
     * @param {Object} options - Generation options
     * @returns {Array} 2D array representing the map
     */
    generateCave(width, height, options = {}) {
        const {
            wallChance = 0.45,
            iterations = 5
        } = options;

        // Initialize with random walls
        const map = this.initializeMap(width, height);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                map[y][x] = {
                    type: Math.random() < wallChance ? 'wall' : 'floor',
                    char: Math.random() < wallChance ? '#' : '.',
                    passable: Math.random() >= wallChance,
                    explored: false
                };
            }
        }

        // Apply cellular automata rules
        for (let i = 0; i < iterations; i++) {
            this.applyCellularAutomata(map);
        }

        return map;
    }

    /**
     * Apply cellular automata rules to smooth the map
     * @param {Array} map - Map array to modify
     */
    applyCellularAutomata(map) {
        const newMap = JSON.parse(JSON.stringify(map));
        const width = map[0].length;
        const height = map.length;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const wallCount = this.countWallsAround(map, x, y);
                
                if (wallCount >= 5) {
                    newMap[y][x] = {
                        type: 'wall',
                        char: '#',
                        passable: false,
                        explored: false
                    };
                } else if (wallCount <= 3) {
                    newMap[y][x] = {
                        type: 'floor',
                        char: '.',
                        passable: true,
                        explored: false
                    };
                }
            }
        }

        // Copy new map back
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                map[y][x] = newMap[y][x];
            }
        }
    }

    /**
     * Count walls around a position
     * @param {Array} map - Map array
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} Number of walls around position
     */
    countWallsAround(map, x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || nx >= map[0].length || ny < 0 || ny >= map.length) {
                    count++;
                } else if (map[ny][nx].type === 'wall') {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * Add hallways leading to new areas
     * @param {Array} map - 2D map array
     */
    addHallways(map) {
        const width = map[0].length;
        const height = map.length;
        const numHallways = Math.floor(Math.random() * 3) + 1; // 1-3 hallways
        
        console.log(`Generating ${numHallways} hallways for map ${width}x${height}`);
        
        const directions = [
            { name: 'North', dx: 0, dy: -1, edge: 0 },
            { name: 'South', dx: 0, dy: 1, edge: height - 1 },
            { name: 'East', dx: 1, dy: 0, edge: width - 1 },
            { name: 'West', dx: -1, dy: 0, edge: 0 }
        ];
        
        // Shuffle directions to get random selection
        const shuffledDirections = directions.sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(numHallways, directions.length); i++) {
            const dir = shuffledDirections[i];
            console.log(`Creating hallway: ${dir.name}`);
            this.createHallway(map, dir, width, height);
        }
        
        // Count and report hallway exits
        let exitCount = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (map[y][x].type === 'hallway_exit') {
                    exitCount++;
                    console.log(`Found hallway exit at (${x}, ${y})`);
                }
            }
        }
        
        // If no hallways were created, force create at least one
        if (exitCount === 0) {
            console.log('No hallways created, forcing creation of at least one...');
            const fallbackDir = shuffledDirections[0];
            this.createFallbackHallway(map, fallbackDir, width, height);
            
            // Recount exits
            exitCount = 0;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (map[y][x].type === 'hallway_exit') {
                        exitCount++;
                        console.log(`Found hallway exit at (${x}, ${y})`);
                    }
                }
            }
        }
        
        // If still no exits, create a guaranteed exit at a known location
        if (exitCount === 0) {
            console.log('Still no exits, creating guaranteed exit...');
            this.createGuaranteedExit(map, width, height);
        }
        
        console.log(`Total hallway exits created: ${exitCount}`);
    }

    /**
     * Create a single hallway in a direction
     * @param {Array} map - 2D map array
     * @param {Object} direction - Direction object with name, dx, dy, edge
     * @param {number} width - Map width
     * @param {number} height - Map height
     */
    createHallway(map, direction, width, height) {
        const { name, dx, dy, edge } = direction;
        
        // Find a suitable starting position that's accessible from the map interior
        let startX, startY;
        let attempts = 0;
        let found = false;
        
        // Try to find a position that connects to existing floor tiles
        do {
            if (dx === 0) { // North or South
                startX = Math.floor(Math.random() * (width - 4)) + 2;
                startY = edge;
            } else { // East or West
                startX = edge;
                startY = Math.floor(Math.random() * (height - 4)) + 2;
            }
            
            // Check if this position is adjacent to a floor tile (accessible)
            let hasAdjacentFloor = false;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = startX + dx;
                    const ny = startY + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        if (map[ny][nx].type === 'floor' || map[ny][nx].type === 'door') {
                            hasAdjacentFloor = true;
                            break;
                        }
                    }
                }
                if (hasAdjacentFloor) break;
            }
            
            // Check if we can create a hallway from this position
            const hallwayLength = 3 + Math.floor(Math.random() * 3); // 3-5 tiles long
            let canCreate = true;
            
            for (let i = 0; i < hallwayLength; i++) {
                const x = startX + (dx * i);
                const y = startY + (dy * i);
                if (x < 0 || x >= width || y < 0 || y >= height) {
                    canCreate = false;
                    break;
                }
            }
            
            if (canCreate && hasAdjacentFloor) {
                found = true;
            }
            attempts++;
        } while (!found && attempts < 200);
        
        if (!found) {
            console.log(`Failed to find suitable position for ${name} hallway after ${attempts} attempts`);
            return;
        }
        
        console.log(`Creating ${name} hallway starting at (${startX}, ${startY})`);
        
        // Create the hallway
        const hallwayLength = 3 + Math.floor(Math.random() * 3); // 3-5 tiles long
        
        for (let i = 0; i < hallwayLength; i++) {
            const x = startX + (dx * i);
            const y = startY + (dy * i);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                map[y][x] = {
                    type: 'floor',
                    char: '.',
                    passable: true,
                    explored: false,
                    hallway: true,
                    direction: name
                };
            }
        }
        
        // Mark the end of the hallway as a special tile
        const endX = startX + (dx * hallwayLength);
        const endY = startY + (dy * hallwayLength);
        
        if (endX >= 0 && endX < width && endY >= 0 && endY < height) {
            map[endY][endX] = {
                type: 'hallway_exit',
                char: '>',
                passable: true,
                explored: false,
                hallway: true,
                direction: name
            };
            console.log(`Created hallway exit at (${endX}, ${endY}) for ${name} direction`);
        } else {
            console.log(`Failed to create hallway exit at (${endX}, ${endY}) - out of bounds`);
        }
    }

    /**
     * Create a fallback hallway when normal generation fails
     * @param {Array} map - 2D map array
     * @param {Object} direction - Direction object with name, dx, dy, edge
     * @param {number} width - Map width
     * @param {number} height - Map height
     */
    createFallbackHallway(map, direction, width, height) {
        const { name, dx, dy, edge } = direction;
        
        console.log(`Creating fallback ${name} hallway...`);
        
        // Find any floor tile and create a hallway from there
        let startX, startY;
        let found = false;
        
        for (let y = 0; y < height && !found; y++) {
            for (let x = 0; x < width && !found; x++) {
                if (map[y][x].type === 'floor') {
                    // Check if we can create a hallway from this position
                    const hallwayLength = 3;
                    let canCreate = true;
                    
                    for (let i = 0; i < hallwayLength; i++) {
                        const nx = x + (dx * i);
                        const ny = y + (dy * i);
                        if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
                            canCreate = false;
                            break;
                        }
                    }
                    
                    if (canCreate) {
                        startX = x;
                        startY = y;
                        found = true;
                    }
                }
            }
        }
        
        if (!found) {
            console.log(`Failed to create fallback hallway - no suitable floor tiles found`);
            return;
        }
        
        console.log(`Creating fallback ${name} hallway starting at (${startX}, ${startY})`);
        
        // Create the hallway
        const hallwayLength = 3;
        
        for (let i = 0; i < hallwayLength; i++) {
            const x = startX + (dx * i);
            const y = startY + (dy * i);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                map[y][x] = {
                    type: 'floor',
                    char: '.',
                    passable: true,
                    explored: false,
                    hallway: true,
                    direction: name
                };
            }
        }
        
        // Mark the end of the hallway as a special tile
        const endX = startX + (dx * hallwayLength);
        const endY = startY + (dy * hallwayLength);
        
        if (endX >= 0 && endX < width && endY >= 0 && endY < height) {
            map[endY][endX] = {
                type: 'hallway_exit',
                char: '>',
                passable: true,
                explored: false,
                hallway: true,
                direction: name
            };
            console.log(`Created fallback hallway exit at (${endX}, ${endY}) for ${name} direction`);
        } else {
            console.log(`Failed to create fallback hallway exit at (${endX}, ${endY}) - out of bounds`);
        }
    }

    /**
     * Create a guaranteed exit at a known location
     * @param {Array} map - 2D map array
     * @param {number} width - Map width
     * @param {number} height - Map height
     */
    createGuaranteedExit(map, width, height) {
        console.log('Creating guaranteed exit...');
        
        // Find the first floor tile and create an exit there
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (map[y][x].type === 'floor') {
                    map[y][x] = {
                        type: 'hallway_exit',
                        char: '>',
                        passable: true,
                        explored: false,
                        hallway: true,
                        direction: 'North'
                    };
                    console.log(`Created guaranteed exit at (${x}, ${y})`);
                    return;
                }
            }
        }
        
        console.log('No floor tiles found for guaranteed exit!');
    }
}
