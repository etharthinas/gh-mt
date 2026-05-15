# GH 성장 레이스

A browser-based party board game built for the **Growth Hackers** community at Seoul National University. Three teams race around a 60-cell board shaped like the letters "GH", earning and losing coins through dice rolls, mini-games, VS battles, and special events.

---

## Features

- **60-cell board** arranged in a "GH" letter path
- **3-team competition** with customizable team names and photos
- **8 VS game types** — head-to-head mini-games between two teams
- **13 mini-games** — full-group games played at the end of each round
- **7 special market events** — steal coins, swap positions, double rewards, and more
- **4 monster events** — random chaos that shakes up the standings
- **In-game customization** — edit team info and cell properties, persisted via localStorage
- **Zero dependencies** — runs entirely in the browser with no build step

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 (CDN, UMD build) |
| JSX Transform | Babel Standalone (CDN) |
| Styling | Plain CSS3 |
| Data | `board.json` (static file) |
| Persistence | Browser `localStorage` |
| Build | None — static files only |

---

## Project Structure

```
gh_mt/
├── index.html              # Entry point — loads React/Babel from CDN
├── app.js                  # Full React application (~1,750 lines)
├── styles.css              # All styling
├── board.json              # Game configuration (teams, cells, settings)
├── gh_logo.jpeg            # GH organization logo
├── 건석팀.jpeg              # Team 1 photo
├── 수현팀.jpeg              # Team 2 photo
├── 희재팀.jpeg              # Team 3 photo
└── game_descriptions/      # Game instruction images shown in modals
    ├── vs게임/             # 8 VS game instruction images
    └── 미니게임/           # 13 mini-game instruction images
        ├── 1v2/            # 1v2 format games (6 games)
        └── 111/
            ├── win/        # 3-way winner-takes-all games (5 games)
            └── lose/       # 3-way last-place-loses games (2 games)
```

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (required — `board.json` is fetched via HTTP)

### Running the Game

```bash
# Clone the repository
git clone <repo-url>
cd gh_mt

# Start a local server using any of the following:

# Python 3
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then open **http://localhost:8000** in your browser.

---

## Configuration

Game data is defined in `board.json`.

### Settings

```json
{
  "settings": {
    "startingCoins": 20,
    "totalCells": 60
  }
}
```

### Teams

```json
{
  "teams": [
    {
      "id": 1,
      "name": "건석팀",
      "color": "#FF6B6B",
      "initials": "KS",
      "imageUrl": "./건석팀.jpeg"
    }
  ]
}
```

### Cells

```json
{
  "cells": [
    {
      "id": 1,
      "type": "start",
      "coinChange": 0,
      "text": "출발"
    }
  ]
}
```

#### Cell Types

| Type | Effect |
|---|---|
| `start` | Starting position |
| `finish` | End of the board (cell 60) |
| `blue` | Gain coins (`coinChange` > 0) |
| `green` | No effect (neutral) |
| `red` | Lose coins — pay up or drink |
| `vs` | Triggers a VS game against another team |
| `market` | Triggers a random special market event |
| `drink` | Triggers a drinking penalty |
| `monster` | Triggers a random monster event |

---

## Gameplay

### Turn Structure

1. The active team rolls the dice (1–6).
2. The team's piece moves forward that many cells.
3. The cell effect triggers (coin change, modal, mini-game, etc.).
4. After all three teams have rolled, a **round mini-game** is selected and played.
5. Repeat for 30 rounds. The team with the most coins wins.

### Rolling the Dice

- Click **주사위 굴리기** to roll randomly.
- Switch to manual mode to type a specific value (1–6).

### Red Cell Penalty

Landing on a red cell opens a choice modal:

- **코인 납부** — Pay the coin penalty.
- **음주** — Drink instead (number of drinks = penalty ÷ 5).

### VS Games (8 types)

Two teams face off in a quick physical or social game. The facilitator adjusts coin amounts before confirming the result.

| Game | Description |
|---|---|
| 묵찌빠 | Rock-paper-scissors variant |
| 병뚜껑 컬링 | Bottle cap curling |
| 참참참 | Direction-pointing game |
| 초성 스피드 | Korean consonant speed quiz |
| 칭찬 공격 | Compliment battle |
| 표정 따라하기 | Mimic facial expressions |
| 표정 뽑기 | Pick and hold an expression |
| 휴지 불기 | Tissue blowing |

### Special Market Events (7 types)

| Event | Effect |
|---|---|
| 코인 훔치기 | Steal 5 coins from a chosen team |
| 음주 선고 | Force a chosen team to drink |
| 위치 교환 | Swap board positions with a chosen team |
| 코인 기부 | Give 5 coins to a chosen team |
| 랜덤 이동 | Move to a random cell |
| 2배 코인 | Next coin gain is doubled |
| 강제 이동 | Send a chosen team to a specific cell |

### Monster Events (4 types)

| Event | Effect |
|---|---|
| 코인 강탈 | Lose 20 coins |
| 코인 균등 분배 | All coins are pooled and split equally |
| 빈부격차 해소 | Richest team gives 10 coins to the poorest |
| 공연 소환 | A team member must perform |

### Mini-Games (13 total)

Played at the end of each round. The format is selected by a spinner.

- **1v2** (6 games) — One team faces the other two.
- **3-way, winner scored** (5 games) — One team wins coins.
- **3-way, loser scored** (2 games) — One team loses coins.

---

## In-Game Customization

All customizations are saved to `localStorage` and persist across sessions.

### Edit a Team

Click a team's avatar to open the team edit modal. You can change:
- Team name
- Team photo (URL or local file path)

### Edit a Cell

Click any cell on the board to open the cell edit modal. You can change:
- Display text
- Coin change value
- Cell type

### Game Controls

| Control | Action |
|---|---|
| 주사위 굴리기 | Roll the dice |
| ↺ 초기화 | Reset the entire game |
| +1턴 (bottom right) | Add one turn to the maximum round count |

---

## Persistence

| Key | Contents |
|---|---|
| `gh_team_names` | Team name and image customizations |
| `gh_texts` | Cell text and coin customizations |

Game progress (positions, coins, turn count) is **not** persisted — each page load starts a fresh game.

---

## Notes

- The UI is entirely in **Korean**.
- The game is designed for in-person party play — a facilitator should manage the screen.
- `localStorage` must be enabled in the browser.
- The board scales automatically to fit the viewport width.
- All mini-game instruction images are preloaded on startup.
