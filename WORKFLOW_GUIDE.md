# 🚀 Character Data Workflow Guide

Complete guide for parsing, validating, and calculating character ratings.

## Quick Start

```bash
# Run complete workflow
npm run workflow

# Or individual commands
npm run validate           # Validate data.json
npm run calc:ratings      # Calculate ratings
npm run fix:tables        # Fix malformed ability tables
npm run parse:abilities   # Parse ability tables from API
```

## Files

### Core Tools

| File | Purpose | Command |
|------|---------|---------|
| `validate-data.js` | Validate data.json structure | `npm run validate` |
| `calculate-ratings.js` | Rating calculator (library) | Used by generate-ratings-table |
| `generate-ratings-table.js` | Generate ratings output | `npm run calc:ratings` |
| `parse-abilities-api.js` | Parse ability tables from API | `npm run parse:abilities` |
| `fix-ability-tables.js` | Fix malformed tables | `npm run fix:tables` |
| `merge-character-data.js` | Merge API + DB data | `node merge-character-data.js` |

### Generated Files

| File | Format | Purpose |
|------|--------|---------|
| `character-ratings.json` | JSON | Detailed ratings with all metrics |
| `character-ratings.csv` | CSV | Spreadsheet-friendly format |
| `CHARACTER_RATINGS.md` | Markdown | Human-readable report |
| `data_from_api.json` | JSON | Parsed data from API |
| `data_backup_before_fix.json` | JSON | Backup from last fix |

### Documentation

| File | Purpose |
|------|---------|
| `README_RATINGS.md` | Complete ratings documentation |
| `WORKFLOW_GUIDE.md` | This file - workflow instructions |

## Workflow Steps

### 1. Validate Data

Check if `data.json` is valid:

```bash
npm run validate
```

**Output:**
```
✅ All 100 characters validated successfully
```

**What it checks:**
- Required fields present (name, faction, stats, abilities, etc.)
- Data types correct (health/armour/damage must be numeric strings)
- Rarity values valid (Common, Uncommon, Rare, Epic, Legendary)
- Ability tables have consistent column counts

### 2. Calculate Ratings

Generate character effectiveness ratings:

```bash
npm run calc:ratings
```

**Output:**
- `character-ratings.json` (66KB)
- `character-ratings.csv` (8.2KB)
- `CHARACTER_RATINGS.md` (14KB)

**Metrics included:**
- DPT (Damage Per Turn)
- EHP (Effective Health Pool)
- Survivability Score
- Utility Score
- Overall Rating

### 3. Parse Ability Tables (Optional)

If you want to update ability table data from the API:

```bash
npm run parse:abilities
```

**Output:** `data_from_api.json` (parsed API data)

**Options:**
- `npm run parse:abilities:force` - Force refresh from API

### 4. Fix Malformed Tables (if needed)

Fix any inconsistent table structures:

```bash
npm run fix:tables
```

**Output:**
- Fixed `data.json`
- Backup: `data_backup_before_fix.json`

### 5. Merge Data (Advanced)

Merge data from multiple sources:

```bash
node merge-character-data.js data_from_api.json data.json data_merged.json
```

## Understanding Ratings

### Rating Formula

```
Rating = (DPT × 0.4) + (Survivability × 0.3) + (Utility × 0.3)
```

**40%** Damage, **30%** Defense, **30%** Support

### Metrics

**DPT (Damage Per Turn)**
- How much damage character deals per turn
- Formula: `(ADPA × Mobility × Synergy)`
- Higher = More offensive power

**Survivability**
- How long character survives
- Formula: `EHP × Healing × (1 - Damage Reduction)`
- Higher = More defensive power

**Utility**
- Support, control, buffs, debuffs
- Includes: Stun, Suppress, Taunt, Summons, Push, Pull, etc.
- Higher = More useful in team play

### Example

**Kharn (Top rated - 206.1)**
```
DPT: 434.3 (exceptional damage)
Survivability: 108.0 (moderate defense)
Utility: 0.0 (no support abilities)
Rating: 206.1 (top offense)
```

**Tanksmasha (3rd - 131.3)**
```
DPT: 103.2 (moderate damage)
Survivability: 115.0 (good defense)
Utility: 185.0 (excellent support)
Rating: 131.3 (balanced tank)
```

## Data Structure

### Input: data.json

```json
{
  "meta": {
    "total": 100,
    "successful": 100,
    "failed": 0
  },
  "characters": [
    {
      "name": "Kharn",
      "faction": "Chaos",
      "baseStats": {
        "health": "90",
        "armour": "20",
        "damage": "25"
      },
      "attacks": {
        "melee": "Power / 5 hits",
        "ranged": "N/A"
      },
      "movement": "3",
      "traits": ["Let the Galaxy Burn", "Resilient"],
      "rarity": "Legendary",
      "activeAbility": {
        "name": "Ability Name",
        "description": "...",
        "tables": [[...]]
      },
      "passiveAbility": {
        "name": "Passive Name",
        "description": "...",
        "tables": [[...]]
      }
    }
  ]
}
```

### Output: character-ratings.json

```json
{
  "meta": {
    "total": 100,
    "generated": "2025-11-30T13:49:48.276Z"
  },
  "ratings": [
    {
      "rank": 1,
      "name": "Kharn",
      "faction": "Chaos",
      "rarity": "Legendary",
      "stats": {
        "health": 90,
        "armour": 20,
        "damage": 25,
        "movement": 3
      },
      "calculated": {
        "adpa_melee": 434.3,
        "adpa_ranged": 0.0,
        "ehp": 108.0,
        "dpt": 434.3,
        "survivability": 108.0,
        "utility": 0.0,
        "overall_rating": 206.1
      },
      "breakdown": {
        "critChance": 0.15,
        "critDamage": 0.5,
        "blockChance": 0,
        "healingPerTurn": 0,
        "damageTakenModifier": 0.2,
        "synergyMultiplier": 1.1
      }
    }
  ]
}
```

## Troubleshooting

### Validation Failures

**Problem:** Some characters fail validation
```
❌ Validation failed for 3 character(s)
```

**Solution:**
1. Check error messages
2. Fix malformed data in data.json
3. Or run `npm run fix:tables`

### Table Structure Issues

**Problem:** "table[0][1] has 6 columns, but header has 4"

**Solution:**
```bash
npm run fix:tables
```

This script:
- Identifies inconsistent row lengths
- Merges duplicate headers
- Pads/truncates rows to match header
- Creates backup before saving

### API Parse Failures

**Problem:** `npm run parse:abilities` fails

**Possible causes:**
- Network error (use `npm run parse:abilities:force`)
- API endpoint changed
- Cache file corrupted (delete `raw_game_info.json`)

**Solution:**
```bash
# Force fresh download
npm run parse:abilities:force

# Or delete cache
rm raw_game_info.json
npm run parse:abilities
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Update Character Ratings

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:     # Manual trigger

jobs:
  update-ratings:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: main
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      
      - name: Validate data
        run: npm run validate
      
      - name: Calculate ratings
        run: npm run calc:ratings
      
      - name: Commit if changed
        run: |
          if git diff --quiet character-ratings.*; then
            echo "No changes"
          else
            git config user.name "CI Bot"
            git config user.email "ci@example.com"
            git add character-ratings.* CHARACTER_RATINGS.md
            git commit -m "chore: update character ratings"
            git push
          fi
```

## Performance

### Processing Times

On modern hardware:
- **Validate data**: ~10ms
- **Calculate ratings**: ~50ms
- **Generate tables**: ~100ms
- **Parse API**: ~5-10s (first time with network)

### File Sizes

- `data.json`: 352KB (100 characters)
- `character-ratings.json`: 66KB (with full metrics)
- `character-ratings.csv`: 8.2KB
- `CHARACTER_RATINGS.md`: 14KB

## API Reference

### CharacterCalculator

```javascript
const { CharacterCalculator } = require('./calculate-ratings');

const calc = new CharacterCalculator(character);

// Get individual metrics
const dpt = calc.calculateDPT();
const ehp = calc.calculateEHP();
const survivability = calc.calculateSurvivability();
const utility = calc.calculateUtility();
const rating = calc.calculateOverallRating();

// Get full report
const report = calc.getFullReport();
// Returns: { name, faction, rarity, stats, calculated, breakdown }
```

### Validation Functions

```javascript
const { validateCharacter, validateAllCharacters } = require('./validate-data');

// Validate single character
const result = validateCharacter(character, index);
// Returns: { valid: boolean, errors: string[] }

// Validate all in file
const success = validateAllCharacters('data.json');
// Returns: boolean
```

## Tips & Best Practices

1. **Always validate before calculating:**
   ```bash
   npm run validate && npm run calc:ratings
   ```

2. **Keep backups:**
   - Automatic backup created by `npm run fix:tables`
   - Manual: `cp data.json data_backup_$(date +%s).json`

3. **Review generated reports:**
   - CSV for spreadsheet analysis
   - Markdown for documentation
   - JSON for programmatic use

4. **Update regularly:**
   - Add to CI/CD pipeline
   - Run daily or weekly
   - Track changes in version control

5. **Customize weights if needed:**
   - Edit `calculate-ratings.js`
   - Change line: `return dpt * 0.4 + survivability * 0.3 + utility * 0.3;`
   - Recalculate ratings

## Next Steps

1. ✅ Validate data with `npm run validate`
2. ✅ Generate ratings with `npm run calc:ratings`
3. ✅ Review `CHARACTER_RATINGS.md`
4. ✅ Integrate into UI (load `character-ratings.json`)
5. ✅ Add to CI/CD pipeline for automation

## Support

For issues or questions:
1. Check `README_RATINGS.md` for detailed documentation
2. Review error messages from validation
3. Check file formats in examples above
4. See troubleshooting section

---

**Last Updated:** 2025-11-30
**Characters:** 100
**Validation:** ✅ All valid
**Ratings Generated:** ✅ Yes
