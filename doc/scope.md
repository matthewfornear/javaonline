# Project Scope: Queue-Based Roguelike

## Vision
Build a minimalist web-based roguelike where:
- **ASCII rendering** is used for the first iteration (fastest possible MVP).
- The **game loop is driven by a time/event queue**, enabling variable weapon speeds, monster attack rates, and advanced combat logic.
- Game logic is **renderer-agnostic** so we can later swap ASCII for Canvas, PixiJS, or three.js without rewriting the core engine.
- Attacks, effects, and entities are **data-driven**, so adding new content is as simple as defining JSON entries.

The goal: **get a working game out the door quickly** with a clear path for more advanced mechanics and graphics.

---

## Core Gameplay Loop
1. **Explore a dungeon** represented in ASCII (rooms, corridors, walls).
2. **Encounter monsters** with different speeds and behaviors.
3. **Combat is scheduled** by a time-based priority queue:
   - Each entity has a "next action time."
   - On each tick, the earliest entity acts.
   - Attack/movement/casting are delayed by entity or weapon speed.
4. **Player choices** (move, attack, wait, use item) enqueue actions with different delays.
5. **Survive as long as possible** — each floor resets with new monsters.

---

## System Design

### 1. Engine
- Written in **JavaScript/TypeScript**.
- Maintains world state (map, entities, items).
- Priority Queue manages turn order (`entity.nextAction`).
- Core components:
  - **World**: map grid, entities, collisions.
  - **Entity**: player, monsters, projectiles.
  - **Components**: health, position, speed, attack definition.
  - **Scheduler**: queue-based time system.
  - **Systems**: movement, combat, projectiles, effects.

### 2. Renderer
- **ASCII Renderer (MVP)**:
  - `<pre>` block in HTML.
  - Monospace font (`Courier`, `Fira Code`).
  - Updates each tick.
- **Future Renderers**:
  - **Canvas 2D / PixiJS**: GPU accelerated, particles, smooth animations.
  - **three.js**: 3D rendering, advanced effects.
- All renderers implement a common interface:
  ```ts
  interface Renderer {
    init(container: HTMLElement, width: number, height: number): void;
    clear(): void;
    drawEntity(id: string, spriteOrChar: string, x: number, y: number): void;
    drawText(x:number, y:number, text:string): void;
    present(): void;
  }
```

### 3. Data-Driven Content
Attacks, monsters, and items are defined in JSON:

```json
{
  "name": "firebolt",
  "type": "projectile",
  "speed": 8,
  "damage": 6,
  "onHit": [{ "applyStatus": "burn", "duration": 3 }]
}
```

### 4. Scheduler / Queue
```js
let now = 0;
let queue = new PriorityQueue();

function schedule(entity, delay) {
  entity.nextAction = now + delay;
  queue.push(entity);
}

while (!gameOver) {
  let entity = queue.pop();
  now = entity.nextAction;
  entity.act();
  schedule(entity, entity.getActionDelay());
}
```

---

## Roadmap

### Phase 1: MVP (ASCII Roguelike)
- Basic map generation (rooms + corridors).
- ASCII renderer in `<pre>`.
- Player movement.
- Monster AI (chase or idle).
- Queue-based combat (variable attack speeds).
- Win/Lose conditions.

### Phase 2: Content Expansion
- More monsters with varied speeds and attacks.
- Simple inventory + items.
- Projectiles (arrows, firebolts).
- Status effects (poison, burn, stun).

### Phase 3: Renderer Upgrades
- Canvas/PixiJS renderer with smooth animations.
- Particle effects for advanced attacks.
- Optional three.js renderer for 3D experiments.

### Phase 4: Persistence & Meta
- Scoring / high scores.
- Save/load system (localStorage or backend).
- Procedural dungeon depth progression.

---

## Tech Stack

**Frontend:** HTML + CSS + JavaScript/TypeScript.

**Libraries:**
- ROT.js (optional: mapgen, FOV, scheduler).
- PriorityQueue implementation (tiny, custom or npm lib).

**Deployment:** Static files (GitHub Pages / Netlify).

**Future:** Node.js backend for persistence or multiplayer.

---

## Guiding Principles

- Start ugly, start fast: ASCII + minimal mechanics.
- Renderer independence: Core game logic shouldn't know if it's ASCII or 3D.
- Data-driven design: Attacks and monsters as JSON for easy expansion.
- Queue-based scheduling: Combat timing is core, everything else builds on it.