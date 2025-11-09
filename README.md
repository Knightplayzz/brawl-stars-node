<div align="center">
 <img src="https://static.wikia.nocookie.net/supercell-fankit/images/f/ff/Brawl_Stars_Smile_Logo.png/revision/latest/scale-to-width-down/250?cb=20201119180831" height="200px" alt="Brawl Stars Logo"/>
 <br><br>
 <p><b>A lightweight Node.js wrapper for the <a href="https://developer.brawlstars.com/">Brawl Stars API</a>, designed to make interaction simple and efficient.</b></p>
 
 <a href="https://app.travis-ci.com/Knightplayzz/brawl-stars"><img src="https://app.travis-ci.com/Knightplayzz/brawl-stars.svg?branch=main" alt="Build Status"></a>
 <a href="https://www.npmjs.com/package/brawl-stars-node"><img src="https://img.shields.io/npm/v/brawl-stars-node" alt="NPM Version"></a>
 <a href="https://www.npmjs.com/package/brawl-stars-node"><img src="https://img.shields.io/npm/dt/brawl-stars-node.svg?maxAge=3600" alt="NPM Downloads"></a>
 <a href="https://packagephobia.com/result?p=brawl-stars-node"><img src="https://packagephobia.com/badge?p=brawl-stars-node" alt="Install Size"></a>
 <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
</div>

---

## 🚀 Introduction

**brawl-stars-node** provides an easy and efficient way to interact with the official [Brawl Stars API](https://developer.brawlstars.com/).  
It simplifies authentication, handles rate limits, and caches responses — so you can focus on building features, not managing requests.

> ⚠️ Not affiliated with or endorsed by Supercell.

**Author:** Philippe Smeets

---

## 📦 Installation

```bash
npm install brawl-stars-node
````

If you’re using TypeScript:

```bash
npm install --save-dev typescript
```

---

## 📚 Documentation & Links

* [📘 Documentation](https://github.com/Knightplayzz/brawl-stars/blob/main/documentation.md)
* [💻 Official Brawl Stars API](https://developer.brawlstars.com/#/documentation)
* [🧠 Changelog](https://github.com/Knightplayzz/brawl-stars/blob/main/CHANGELOG.md)
* [🔒 Security Policy](https://github.com/Knightplayzz/brawl-stars/blob/main/SECURITY.md)

---

## 💡 Example Usage

```typescript
import { BrawlStarsClient } from 'brawl-stars-node';

const client = new BrawlStarsClient('YOUR-TOKEN-HERE');

async function main() {
    const player = await client.players.get('PLAYER-TAG-HERE');
    console.log(`${player.name} (${player.tag})`);
}

main();
```

---

## ⚙️ Features

- ✅ Simple authentication
- ✅ Fully written in TypeScript
- ✅ Built-in caching system
- ✅ Automatic rate limiting (5 requests/sec)
- ✅ Structured response types
- ✅ Easy-to-use endpoint access (Players, Clubs, Rankings, Events, etc.)
- ✅ Tested with Jest + integrated CI/CD

---

## 🧩 API Overview

| Category     | Method                                       | Description                         |
| ------------ | -------------------------------------------- | ----------------------------------- |
| **Players**  | `get(tag)`                                   | Fetch player data                   |
| **Players**  | `getBattlelog(tag)`                          | Fetch player’s recent battles       |
| **Clubs**    | `get(tag)`                                   | Fetch club information              |
| **Clubs**    | `getMembers(tag)`                            | Fetch club member list              |
| **Rankings** | `getPlayerRankings(countryCode)`             | Get player leaderboard              |
| **Rankings** | `getClubRankings(countryCode)`               | Get club leaderboard                |
| **Rankings** | `getBrawlerRankings(countryCode, brawlerId)` | Get rankings for a specific brawler |
| **Brawlers** | `getAll()`                                   | Get all brawlers                    |
| **Brawlers** | `getById(brawlerId)`                         | Get specific brawler info           |
| **Events**   | `getRotation()`                              | Get current and upcoming events     |

---

## ⚠️ Disclaimer

This project is **not affiliated with, endorsed, sponsored, or specifically approved by Supercell**.
Supercell is not responsible for it.
For more information, please refer to Supercell’s [Fan Content Policy](https://www.supercell.com/en/fan-content-policy/).

---

**© 2025 – Philippe Smeets**
📧 [philippesmeets@icloud.com](mailto:philippesmeets@icloud.com)