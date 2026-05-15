I am building a Mario-cart style boardgame that I will use at an upcoming party.

# General
The party will be for "Growth Hackers", or "GH" for short. Their logo and colours are in gh_logo.jpeg. Refer to this when making designs.

# Board
We will have 60 cells in the board, each cell should be a circle.

# Pieces
There will be three teams participating in the race.

# Dice
We will have one dice, from sides 1 to 6.

# Gameplay
Each team starts at the start/finish line.

On a team's turn, they will roll the dice and move their piece forward the corresponding number of spaces.

If a team lands on a blue cell, they earn coins
If a team lands on a green cell, they are neutral.
If a team lands on a red cell, they lose coins.

Make each color, position, and effect of the cell be configuration in a separate json file.

---

# Specs

## Tech Stack
- **HTML5** + **CSS3** + **JavaScript (React 18)**
- React and ReactDOM loaded via CDN (`unpkg.com`)
- JSX transpiled in-browser via **Babel Standalone** (no build step required)
- Hosted as a **static website** — must be served over HTTP, not opened as `file://`

## File Structure
```
index.html      Entry point; loads CDN scripts and app.js
app.js          React application (JSX, transpiled by Babel in-browser)
styles.css      All styling — GH royal-blue theme, responsive layout
board.json      Board configuration: all 60 cells, team definitions, settings
gh_logo.jpeg    GH branding asset (referenced in header and favicon)
```

## Board Layout
- **60 circular cells** arranged in a **10-column × 6-row snake grid**
- Path direction: left→right on even rows, right→left on odd rows (like a reading snake)
- Cell 1 (top-left) = **START** 🏁 | Cell 60 (bottom-left) = **FINISH** 🏆
- First team to reach or pass cell 60 wins

## Cell Types
| Type   | Color  | Effect               |
|--------|--------|----------------------|
| start  | Gold   | No effect (cell 1)   |
| blue   | Blue   | Earn coins (+5 to +25)|
| green  | Green  | Neutral (no change)  |
| red    | Red    | Lose coins (−5 to −20)|
| finish | Gold   | +30 coins (cell 60)  |

**Distribution:** 15 blue cells, 15 red cells, 28 green cells, 1 start, 1 finish.

## board.json Schema
```json
{
  "settings": {
    "startingCoins": 20,
    "totalCells": 60
  },
  "teams": [
    { "id": 1, "name": "Team Alpha", "color": "#FF6B6B", "initials": "A" }
  ],
  "cells": [
    { "id": 1,  "type": "start",  "coinChange": 0  },
    { "id": 2,  "type": "blue",   "coinChange": 5  },
    { "id": 60, "type": "finish", "coinChange": 30 }
  ]
}
```
All cell positions, colors, and coin effects are defined in `board.json`. To customize: edit `cells[]` entries and change `type` to `blue`, `green`, or `red` and set `coinChange`.

## Teams
- 3 teams defined in `board.json` under `"teams"`
- Each team has: `id`, `name`, `color` (hex), `initials` (shown on piece)
- Starting coins set via `settings.startingCoins` (default: 20)
- Team names, colors, and count are fully configurable in `board.json`

## Dice
- Standard 6-sided die (values 1–6)
- Animated shake effect during roll (10 rapid random frames at 75 ms each)
- Dot pattern rendered visually on dice face

## Gameplay Loop
1. Active team clicks **Roll Dice**
2. Dice animates then lands on a value
3. Team piece advances that many cells (capped at cell 60)
4. Coin change applies; floating popup shows the delta
5. Turn passes to the next team
6. First team to reach cell 60 wins — winner modal appears

## UI Features
- GH royal-blue gradient theme (`#0a1060` → `#1565c0`)
- GH logo in header
- Team panels show current cell position and coin balance
- Roll button color matches the active team's color
- Floating coin popup animation on blue/red cell landings
- Scrollable game log (last 30 moves)
- Winner modal with Play Again button
- Reset button resets game without page reload
- Responsive: stacks vertically on screens narrower than 900 px

## Hosting
Serve the project folder from any static web server. Examples:
```bash
# Python
python3 -m http.server 8000

# Node (npx)
npx serve .

# VS Code Live Server extension
```
Then open `http://localhost:8000` in a browser.
