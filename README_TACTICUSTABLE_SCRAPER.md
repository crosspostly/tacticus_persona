# TacticusTable Hero Stats Scraper

## Overview

This project scrapes and parses hero data from TacticusTable (https://www.tacticustable.com) using their official API endpoint.

## Files Created

1. **parse_tacticustable_api.js** - Main parser script that fetches and converts API data
2. **tacticustable_heroes_stats.json** - Output file with 103 heroes and full stats
3. **raw_game_info.json** - Cached raw API response (gitignored)

## Usage

### Quick Start

```bash
node parse_tacticustable_api.js
```

This will:
- Fetch data from `https://api.tacticustable.com/game-info` (if not cached)
- Parse all 103 heroes with full stats, abilities, factions, traits, etc.
- Save to `tacticustable_heroes_stats.json`

### Force Refresh

To force a fresh download from the API (bypassing cache):

```bash
node parse_tacticustable_api.js --force
```

or

```bash
node parse_tacticustable_api.js -f
```

## Dependencies

- node-fetch (already installed)

## API Endpoint

The scraper uses the official TacticusTable API:
- **Endpoint:** `https://api.tacticustable.com/game-info`
- **Size:** ~7.2MB
- **Contains:** Full game data including all heroes, abilities, weapons, upgrades, factions, etc.
- **Version:** 1.34.30.2 (as of 2025-11-30)

## Output Format

The script generates a JSON file compatible with the existing `data.json` format:

```json
{
  "meta": {
    "total": 103,
    "successful": 103,
    "failed": 0,
    "source": "api.tacticustable.com",
    "apiVersion": "1.34.30.2",
    "timestamp": "2025-11-30T13:11:41.421Z",
    "errors": []
  },
  "characters": [
    {
      "name": "Varro Tigurius",
      "faction": "Ultramarines",
      "description": "Tigurius is the Ultramarines Chief Librarian...",
      "baseStats": {
        "health": "65",
        "armour": "14",
        "damage": "30"
      },
      "attacks": {
        "melee": "Physical / 1 hit",
        "ranged": "Psychic / 1 hit / Range 2"
      },
      "movement": "3",
      "traits": ["Psyker"],
      "rarity": "Uncommon",
      "activeAbility": {
        "name": "Storm of Wrath",
        "description": "...",
        "tables": []
      },
      "passiveAbility": {
        "name": "Psychic Fortress",
        "description": "...",
        "tables": []
      },
      "images": {
        "heroArt": "https://www.tacticustable.com/images/heroes/varro-tigurius.png",
        "heroIcon": "https://www.tacticustable.com/images/heroes/varro-tigurius.png"
      },
      "rawInfobox": {}
    }
  ]
}
```

## What Data Is Extracted

✅ **Fully Extracted:**
- Hero names (long and short)
- Factions (e.g., Ultramarines, Necrons, Death Guard, etc.)
- Base stats (Health, Armour, Damage) from Stone I rank
- Melee weapon (type, hits, range, damage profile)
- Ranged weapon (type, hits, range, damage profile)
- Movement
- Traits (e.g., Psyker, Resilient, etc.)
- Rarity (Common, Uncommon, Rare, Epic, Legendary)
- Active ability (name and description)
- Passive ability (name and description)
- Description text
- Hero images URLs

⏳ **Not Yet Extracted (but available in API):**
- Ability upgrade tables
- Equipment upgrade tables
- Rank progression details
- Alliance information
- Damage profiles
- Item slots

## Results

Successfully parsed **103 heroes** from api.tacticustable.com with full data including:

### Example Heroes:
- **Varro Tigurius** (Ultramarines) - HP:65, Armour:14, Damage:30
- **Marneus Calgar** (Ultramarines) - HP:95, Armour:20, Damage:28
- **Abaddon the Despoiler** (BlackLegion) - HP:100, Armour:25, Damage:15
- **Typhus** (DeathGuard) - HP:120, Armour:25, Damage:18
- **Maugan Ra** (Aeldari) - HP:70, Armour:22, Damage:9
- And 98 more...

### Factions Included:
- Ultramarines
- Sisterhood
- Necrons
- Astra Militarum
- Black Legion
- Death Guard
- Orks
- Black Templars
- Aeldari
- Tau
- Space Wolves
- Dark Angels
- Thousand Sons
- Tyranids
- Drukhari
- Adeptus Mechanicus
- And more...

## How It Works

1. Fetches full game data from `https://api.tacticustable.com/game-info`
2. Caches the raw response to `raw_game_info.json` (7.2MB)
3. Parses the heroes object from the API response
4. Converts each hero to the `data.json` format:
   - Extracts base stats from the first rank (Stone I)
   - Formats weapon data (melee/ranged)
   - Looks up ability details by ability ID
   - Strips HTML tags from descriptions
   - Generates image URLs
5. Saves to `tacticustable_heroes_stats.json`

## Advantages Over Web Scraping

✅ **Reliable:** Uses official API instead of scraping HTML  
✅ **Fast:** Single HTTP request instead of 100+ page loads  
✅ **Complete:** Full hero data with all stats and abilities  
✅ **Stable:** API format is more stable than HTML structure  
✅ **No Browser:** No need for Puppeteer/headless Chrome  
✅ **Cacheable:** Can work offline after initial download  

## Notes

- The API includes game version `1.34.30.2`
- Data is cached to `raw_game_info.json` to avoid repeated downloads
- Use `--force` flag to refresh from API
- The API contains much more data than just heroes (abilities, items, campaigns, etc.)
- HTML tags are stripped from ability descriptions

## Comparison with tacticus.wiki

While the existing `tacticus_parser.js` scrapes from tacticus.wiki.gg, this new parser:
- Gets data directly from TacticusTable's official API
- Includes 103 heroes vs 100 from wiki
- Has more accurate/up-to-date stats
- Includes proper faction names
- Includes weapon details (melee/ranged with damage types)
- Is faster and more reliable

## License

MIT
