# Character Data Fetcher Script

## Overview

`fetch-characters.js` is a Node.js script that fetches and updates character ability data from the TacticusTable API.

## Purpose

This script:
1. **Fetches** current ability data from `https://api.tacticustable.com/game-info`
2. **Loads** existing character data from `tacticustable_heroes_stats.json`
3. **Updates** character abilities by matching names from the API
4. **Completely replaces** old ability data when a match is found
5. **Converts** API variables format into structured tables with proper parameter types
6. **Saves** results to both `data.json` and `tacticustable_heroes_stats.json`
7. **Creates** automatic backups before overwriting files
8. **Reports** detailed statistics about the update process

## Usage

### Via npm script
```bash
npm run fetch:characters
```

### Direct execution
```bash
node scripts/fetch-characters.js
```

## Process Flow

### Step 1: Load API Data (📥 Шаг 1/4)
- Fetches game info from `https://api.tacticustable.com/game-info`
- Downloads all 480+ available abilities with their parameters
- Returns abilities indexed by ID with `name`, `description`, `variables`, and `constants`

### Step 2: Load Existing Characters (📥 Шаг 2/4)
- Reads existing character data from `tacticustable_heroes_stats.json`
- Preserves base stats, faction, rarity, and other metadata
- Prepares for ability updates

### Step 3: Update Abilities (🔄 Шаг 3/4)
- For each character's active and passive abilities:
  - **Cleans** ability name (removes HTML tags, normalizes spacing)
  - **Searches** for matching ability in API data
  - **Completely replaces** old ability data if found:
    - Updates name and description
    - Converts variables into typed tables
    - Stores constants (e.g., range, damage type)
  - **Logs** failures with character and ability names
  - Leaves empty tables if ability not found

### Step 4: Save Results (💾 Шаг 4/4)
- Creates backup: `tacticustable_heroes_stats.backup.json`
- Updates `data.json` with new metadata and ability data
- Updates `tacticustable_heroes_stats.json` with same data
- Sets metadata with timestamp, source, API version, and statistics

## Data Transformation

### Input Format (API)
```json
{
  "abilities": {
    "DranchnyenAbility": {
      "name": "Drach'nyen",
      "description": "...",
      "variables": {
        "maxDmg": ["15", "18", "21", ...],
        "extraHits": ["1", "1", "1", ...]
      },
      "constants": {
        "damageProfile": "Piercing"
      }
    }
  }
}
```

### Output Format (data.json)
```json
{
  "activeAbility": {
    "name": "Drach'nyen",
    "description": "...",
    "tables": [
      {
        "parameter": "maxDmg",
        "type": "damage",
        "values": [15, 18, 21, ...]
      },
      {
        "parameter": "extraHits",
        "type": "hits",
        "values": [1, 1, 1, ...]
      }
    ],
    "constants": {
      "damageProfile": "Piercing"
    }
  }
}
```

## Ability Matching Algorithm

### Name Cleaning
1. Remove HTML tags: `<span>...</span>` → text
2. Remove HTML entities: `&nbsp;` → space
3. Normalize whitespace: multiple spaces → single space
4. Trim and convert to lowercase

### Example Matches
```
Input: "Way of the Short Blade"
API:   "Way of the Short Blade"
→ MATCH ✅

Input: "Hades Auto<span>cannons</span>"
API:   "Hades Autocannons"
→ After cleaning: both "hades autocannons" → MATCH ✅

Input: "Unknown Ability"
API:   (not found in abilities)
→ NO MATCH ⚠️ (tables set to [])
```

## Parameter Type Detection

The script automatically detects parameter types:

- **damage**: `damage`, `minDmg`, `maxDmg`, `extraDmg`, `dmg`, etc.
- **health**: `hp`, `maxHp`, `extraHp`, `hpToHeal`, etc.
- **hits**: `nrOfHits`, `extraHits`, `hitsReduction`, etc.
- **armor**: `armor`, `extraArmor`, `armorIgnored`, etc.
- **percent**: `dmgPct`, `healthPct`, `critChance`, `blockChance`, etc.
- **distance**: `range`, `extraRange`, `nrOfTiles`, etc.
- **rounds**: `nrOfRounds`, `cooldownTurns`, `initialCooldownTurns`, etc.
- **count**: `nrOfSummons`, `nrOfProjectiles`, `nrOfTargets`, `nrOfUnits`, etc.
- **number**: any other parameter (default)

## Output Example

```
🚀 НАЧАЛО ОБНОВЛЕНИЯ ДАННЫХ ПЕРСОНАЖЕЙ

📥 Шаг 1/4: Загрузка game-info API...
   ✅ Загружено 481 способностей

📥 Шаг 2/4: Загрузка существующих данных персонажей...
   ✅ Загружено 103 персонажей

🔄 Шаг 3/4: Обновление данных способностей...
   ✅ Успешно обновлено: 206 способностей
   ⚠️  Не найдено: 0 способностей
   📈 Успех: 100%

💾 Шаг 4/4: Сохранение результатов...
   ✅ Создан backup: tacticustable_heroes_stats.backup.json
   ✅ Обновлён data.json
   ✅ Обновлён tacticustable_heroes_stats.json

✅ ГОТОВО! Данные успешно обновлены.
```

## Error Handling

### Critical Errors (exit code 1)
- **API unavailable**: HTTP error when fetching game-info
- **File not found**: `tacticustable_heroes_stats.json` missing
- **Invalid JSON**: Corrupted data files
- **Save error**: Cannot write output files

### Warnings (continues execution)
- **Ability not found**: Logs character and ability name
- Sets `tables: []` for unmatched abilities
- Reports count of unmatched abilities

## Metadata Updated

After successful run, `data.json` meta contains:
```json
{
  "lastUpdate": "2025-11-30T14:32:54.799Z",
  "source": "api.tacticustable.com",
  "apiVersion": "1.34.30.2",
  "charactersCount": 103,
  "abilitiesMatched": 206,
  "abilitiesFailed": 0,
  "successRate": "100%"
}
```

## Backup Strategy

Before overwriting `tacticustable_heroes_stats.json`, the script:
1. Creates a copy: `tacticustable_heroes_stats.backup.json`
2. Timestamp preserved in original filename
3. Can be restored if needed

## Requirements

- Node.js >= 18 (for native `fetch` API)
- npm dependencies: `node-fetch` (already installed)

## Performance

- **API fetch**: ~2-5 seconds
- **Character processing**: ~100ms for 103 characters
- **File I/O**: ~200ms
- **Total runtime**: ~5-10 seconds

## Use Cases

### Update abilities after game patch
```bash
npm run fetch:characters
```

### Sync with latest API data
```bash
npm run fetch:characters
```

### As part of automated workflow
```bash
npm run workflow
```

## Related Scripts

- `parse-abilities-api.js`: Fetch and parse abilities (older, alternative approach)
- `validate-data.js`: Validate data structure
- `calculate-ratings.js`: Calculate character effectiveness ratings
- `fix-ability-tables.js`: Repair malformed ability tables

## Notes

- The script **completely replaces** old ability data when names match
- Base stats (health, armour, damage) are NOT changed
- Character metadata (faction, rarity, traits) are preserved
- Only abilities are updated from API
- All numeric values from API are converted to proper numbers
- HTML in descriptions is preserved (for reference only)

## Troubleshooting

### Script hangs
- Check internet connection to api.tacticustable.com
- API might be temporarily unavailable
- Try increasing timeout or running again later

### No abilities matched (0%)
- API structure might have changed
- Check if API URL is still valid
- Run with verbose logging to debug

### Backup not created
- Permissions issue on filesystem
- `tacticustable_heroes_stats.json` might be read-only
- Check disk space

### JSON parse errors
- Data files might be corrupted
- Try restoring from backup
- Re-run script to regenerate
