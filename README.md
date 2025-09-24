# Tiny RPG

A minimalist web-based roguelike game built with JavaScript, featuring ASCII rendering, queue-based combat system, and data-driven content. This project implements a turn-based dungeon crawler with variable-speed combat, monster AI, and procedural level generation.

## 🎮 Game Features

- **ASCII-based Graphics**: Classic roguelike aesthetic with monospace fonts
- **Queue-based Combat**: Variable weapon speeds and monster attack rates
- **Procedural Dungeons**: Automatically generated rooms and corridors
- **Monster AI**: Intelligent creatures that chase, attack, and react to the player
- **Character Progression**: Level-based stats, experience, and equipment
- **Skill System**: Weapon skills, defensive skills, and combat skills with level caps
- **Interactive Elements**: Chests, corpses, and lootable items
- **Rest System**: Healing mechanics with visual feedback and ambient audio
- **Audio System**: Background music, sound effects, and dynamic audio feedback
- **Inventory System**: Full-screen character sheet with equipment and skill display
- **Virtual Scrolling**: Efficient message handling for large combat logs

## 🎯 Controls

| Key | Action |
|-----|--------|
| `WASD` | Move character (North, West, South, East) |
| `Q` | Toggle combat queue (auto-attack mode) |
| `X` | Attack adjacent monster |
| `R` | Rest (heal over time with ambient audio) |
| `I` or `C` | Open/close character sheet |
| `Space` | Loot corpses or interact with chests |
| `M` | Toggle audio mute/unmute |

## 🏗️ Project Architecture

The game follows a modular, component-based architecture with clear separation of concerns:

### Core Engine
- **Entity-Component System**: Flexible object representation
- **Priority Queue Scheduler**: Time-based turn management
- **World Management**: Spatial organization and collision detection
- **Renderer Abstraction**: Pluggable rendering system

### Systems
- **Combat System**: Damage calculation, hit/miss logic, and combat messages
- **Movement System**: Pathfinding and collision handling
- **Effect System**: Status effects and temporary modifications
- **Projectile System**: Ranged attacks and spell effects

### Modules
- **Map Generator**: Procedural dungeon creation
- **Character Generator**: Player and monster creation
- **Equipment System**: Weapon and armor mechanics
- **Character Progress**: Leveling and stat progression
- **Skills System**: Weapon, defensive, and combat skill progression
- **Audio System**: Background music and sound effects management
- **Inventory System**: Equipment and inventory management
- **Inventory Renderer**: Full-screen character sheet interface

## 📁 Project Structure

```
webrpg/
├── 📄 index.html                 # Main HTML entry point
├── 🎨 styles.css                # Game styling and layout
├── 📚 doc/
│   └── scope.md                 # Project scope and design document
│
├── 📁 js/                       # JavaScript source code
│   ├── 🎮 game.js              # Main game controller and loop
│   ├── 📊 priorityQueue.js     # Priority queue implementation
│   │
│   ├── 📁 core/                # Core engine components
│   │   ├── 🧩 entity.js        # Entity-Component system base
│   │   ├── 🌍 world.js         # World state and spatial management
│   │   ├── ⏰ scheduler.js     # Turn-based scheduling system
│   │   ├── 👹 monster.js       # Monster-specific entity logic
│   │   ├── ⚔️ swingAnimation.js # Combat animation system
│   │   └── 📝 logger.js        # Logging and debugging utilities
│   │
│   ├── 📁 modules/             # Game feature modules
│   │   ├── 🗺️ mapGenerator.js  # Procedural dungeon generation
│   │   ├── 👤 characterGenerator.js # Player/monster creation
│   │   ├── 📈 characterProgress.js  # Leveling and progression
│   │   ├── ⚔️ equipmentSystem.js    # Weapons and armor
│   │   ├── 🎨 asciiRenderer.js      # ASCII rendering engine
│   │   ├── 🎵 audioSystem.js        # Audio management and sound effects
│   │   ├── 🎯 skillsSystem.js       # Weapon and combat skill progression
│   │   ├── 🎒 inventorySystem.js    # Equipment and inventory management
│   │   ├── 📋 inventoryRenderer.js  # Full-screen character sheet interface
│   │   └── 🔮 spells.js            # Spell system (currently disabled)
│   │
│   ├── 📁 systems/             # Game logic systems
│   │   ├── 🏃 movementSystem.js    # Movement and pathfinding
│   │   ├── ⚔️ combatSystem.js      # Combat mechanics and damage
│   │   ├── 🎯 projectileSystem.js  # Projectile and ranged attacks
│   │   └── ✨ effectSystem.js      # Status effects and buffs
│   │
│   └── 📁 utils/               # Utility functions
│       └── 🔧 entityUtils.js   # Entity helper functions
│
└── 🖼️ Untitled.png             # Project assets
```

## 🔧 File Descriptions

### Core Engine Files

| File | Purpose |
|------|---------|
| **`entity.js`** | Base Entity class with component system. Handles adding/getting components, position tracking, and entity lifecycle. |
| **`world.js`** | World state management including entity storage, collision detection, spatial queries, and map data. |
| **`scheduler.js`** | Turn-based scheduling using priority queue. Manages when entities act, processes game turns, and handles timing. |
| **`monster.js`** | Monster-specific entity extensions with AI behaviors, notice states, and monster-specific components. |
| **`swingAnimation.js`** | Visual feedback system for combat actions, creating temporary animation entities for attack effects. |
| **`logger.js`** | Debugging and logging utilities for game development and troubleshooting. |

### Game Modules

| File | Purpose |
|------|---------|
| **`mapGenerator.js`** | Procedural dungeon generation using room-and-corridor algorithm. Creates random layouts with rooms, hallways, and exits. |
| **`characterGenerator.js`** | Factory for creating players, monsters, items, and chests. Defines templates and spawns entities with appropriate components. |
| **`characterProgress.js`** | Leveling system with experience tables, stat progression, and character advancement mechanics. |
| **`equipmentSystem.js`** | Weapon and armor system handling damage calculation, attack speeds, and equipment bonuses. |
| **`asciiRenderer.js`** | ASCII rendering engine with virtual scrolling, color management, and HTML GUI integration. |
| **`audioSystem.js`** | Audio management system with background music, sound effects, pitch variation, and mute controls. |
| **`skillsSystem.js`** | Weapon and combat skill progression system with level caps, experience tracking, and skill bonuses. |
| **`inventorySystem.js`** | Equipment and inventory management with slot-based equipment system and item handling. |
| **`inventoryRenderer.js`** | Full-screen character sheet interface with stats, skills, equipment display, and tooltips. |
| **`spells.js`** | Spell system with data-driven spell definitions (currently disabled for simplification). |

### Game Systems

| File | Purpose |
|------|---------|
| **`movementSystem.js`** | Handles entity movement, pathfinding, collision detection, and movement validation. |
| **`combatSystem.js`** | Core combat mechanics including damage calculation, hit/miss determination, loot generation, and combat messages. |
| **`projectileSystem.js`** | Manages projectile entities, movement, collision detection, and spell effect application. |
| **`effectSystem.js`** | Status effect management including duration tracking, effect application, and temporary modifications. |

### Main Game Files

| File | Purpose |
|------|---------|
| **`game.js`** | Main game controller integrating all systems, managing game state, input handling, and the main game loop. |
| **`priorityQueue.js`** | Heap-based priority queue implementation for efficient entity scheduling and turn management. |

### Utilities

| File | Purpose |
|------|---------|
| **`entityUtils.js`** | Helper functions for entity manipulation, distance calculations, and common entity operations. |

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webrpg
   ```

2. **Open in browser**
   - Simply open `index.html` in a web browser
   - No build process or dependencies required

3. **Start playing**
   - Use WASD to move your character (`@`)
   - Press `Q` to enable auto-combat mode
   - Explore dungeons, fight monsters, and collect loot

## 🎨 Technical Highlights

### Queue-Based Combat System
The game uses a priority queue to manage turn order, allowing for:
- Variable weapon speeds (faster weapons attack more frequently)
- Monster attack rates based on their speed stats
- Precise timing for all game actions

### Skill Progression System
Advanced skill system with meaningful progression:
- **Weapon Skills**: 1H Slash, 2H Slash, 1H Blunt, 2H Blunt, 1H Pierce, 2H Pierce, Hand-to-Hand
- **Defensive Skills**: Dodge and Block with percentage-based bonuses
- **Combat Skills**: Offense and Defense affecting damage and hit chance
- **Level Caps**: Skills capped at player level × 5 for balanced progression
- **Skill Bonuses**: Each skill level provides meaningful combat improvements

### Audio System
Comprehensive audio feedback system:
- **Background Music**: Random track selection on game start
- **Sound Effects**: Hit, miss, death, loot, skillup, rest, and treasure sounds
- **Pitch Variation**: Random pitch shifting for sound variety
- **Dynamic Audio**: Rest sounds loop until interrupted
- **Mute Controls**: Full audio control with M key

### Character Sheet Interface
Full-screen character management:
- **Equipment Display**: Visual equipment slots with tooltips
- **Skill Progress**: Real-time skill level display with caps (e.g., "3/5")
- **Combat Stats**: Live calculation of damage, defense, and attack speed
- **Item Tooltips**: Detailed item information with proper weapon types

### Virtual Scrolling
The combat log implements virtual scrolling for performance:
- Only renders visible messages plus a buffer
- Handles thousands of messages efficiently
- Maintains scroll position and auto-scroll behavior

### Component-Based Architecture
Entities use a flexible component system:
- Health, position, equipment, and stats are separate components
- Easy to add new entity types and behaviors
- Modular and extensible design

### Data-Driven Content
Game content is defined in JavaScript objects:
- Monster templates with stats and behaviors
- Equipment with damage and speed properties
- Spell definitions with effects and costs

## 🆕 Recent Updates

### Audio System Implementation
- **Background Music**: Random track selection with autoplay handling
- **Combat Audio**: Hit, miss, death, loot, and skillup sound effects
- **Pitch Variation**: Random pitch shifting for sound variety (-3 to +3 semitones)
- **Rest Audio**: Looping ambient sounds during rest with interruption handling
- **Mute Controls**: Full audio control system

### Skill Progression System
- **Weapon Skills**: 7 different weapon types with individual progression
- **Defensive Skills**: Dodge and Block with percentage-based bonuses
- **Combat Skills**: Offense and Defense affecting damage and hit chance
- **Level Caps**: Skills capped at player level × 5 for balanced progression
- **10% Skillup Rate**: Balanced progression with meaningful rewards

### Character Sheet Interface
- **Full-Screen UI**: Complete character management interface
- **Equipment Slots**: Visual equipment display with tooltips
- **Skill Display**: Real-time skill progress with level caps (e.g., "3/5")
- **Combat Stats**: Live calculation of damage, defense, and attack speed
- **Item Tooltips**: Detailed item information with proper weapon types

### Game Balance Improvements
- **Monster Spawning**: Level 1 spawns single monsters, higher levels spawn groups
- **Defense Calculation**: Fixed inventory display to show correct defense values
- **Grammar Fixes**: Corrected combat log messages ("DODGE" instead of "DODGES")
- **Control Updates**: C and I keys both open character sheet

## 🔮 Future Enhancements

- **Canvas Rendering**: Replace ASCII with smooth 2D graphics
- **More Content**: Additional monsters, items, and spells
- **Save System**: Persistent character progression
- **Multiplayer**: Online co-op gameplay
- **Mobile Support**: Touch controls and responsive design

## 📝 Development Notes

This project was built with a focus on:
- **Fast iteration**: ASCII rendering for rapid prototyping
- **Clean architecture**: Modular design for easy extension
- **Performance**: Efficient algorithms and data structures
- **User experience**: Responsive controls and clear feedback

The codebase is designed to be easily extensible, with clear separation between game logic and rendering, making it simple to add new features or swap out the rendering system entirely.

---

*Built with ❤️ using vanilla JavaScript, HTML, and CSS*
