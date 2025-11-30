# 📊 Character Ratings System

This document explains the character rating system for Warhammer 40K: Tacticus.

## Overview

The ratings system calculates objective, science-based effectiveness scores for all characters based on game formulas, not subjective opinions. Every character gets three main metrics:

1. **DPT** (Damage Per Turn) - Offensive capability
2. **Survivability** - Defensive capability  
3. **Utility** - Support/Control ability

## Rating Formula

```
Overall Rating = (DPT × 0.4) + (Survivability × 0.3) + (Utility × 0.3)
```

- **40%** weight on Damage (most important)
- **30%** weight on Survivability (important)
- **30%** weight on Utility (important for team play)

## Metrics Explained

### Damage Per Turn (DPT)

**Formula:**
```
DPT = (MeleeDamage + RangedDamage) × Mobility × SynergyMultiplier
```

- **Melee Damage**: Average Damage Per Attack (ADPA) from melee weapon
- **Ranged Damage**: ADPA from ranged weapon (if available)
- **Mobility**: Movement stat (higher = more frequent attacks)
- **Synergy Multiplier**: Bonuses from traits (e.g., "Let the Galaxy Burn")

**Average Damage Per Attack (ADPA):**
```
ADPA = Hits × ((MinDmg + MaxDmg) / 2) × (1 + CritChance × CritDmg)
```

- **Hits**: Number of attacks
- **MinDmg/MaxDmg**: Damage range
- **CritChance**: Default 15%, modified by traits/abilities
- **CritDmg**: Critical damage multiplier (default +50%)

### Survivability Score

**Formula:**
```
Survivability = EHP × (1 + HealingPerTurn / MaxHealth) × (1 - DamageTakenModifier)
```

Where:
- **EHP** (Effective Health Pool): `Health × (1 + Armour/100) × (1 + BlockChance × BlockAmount/100)`
- **Healing Multiplier**: Per-turn healing divided by max health
- **Damage Reduction**: Negative modifiers from traits like "Resilient" or "Terminator Armour"

**Damage Reduction Examples:**
- Resilient trait: -20% damage taken
- Terminator Armour: -15% damage taken
- Maximum reduction: -75%

### Utility Score

**Formula:**
```
Utility = BuffPower + DebuffPower + SummonPower + ControlPower
```

**Components:**
- **BuffPower**: Damage/Armour/Health buffs from abilities
  - +1 Damage = 2 points
  - +1 Armour = 1 point
  - +1 Health = 0.5 points
  
- **DebuffPower**: Control abilities
  - Stun: 100 points
  - Suppress: 50 points
  - Taunt: 30 points
  - Vulnerability: 25 points

- **SummonPower**: Create allied units
  - Each summon: 50 points

- **ControlPower**: Movement/position manipulation
  - Push/Pull: 20 points each
  - Slow/Movement reduction: 30 points
  - Charge/Rush: 15 points

## Tools & Commands

### 1. Validate Data

Check if `data.json` structure is valid:

```bash
node validate-data.js
```

**Checks:**
- Required fields present
- Correct data types
- Numeric fields are actually numeric
- Valid rarity values
- Ability table structure consistency

### 2. Parse Ability Tables from API

Fetch and parse full ability tables from TacticusTable API:

```bash
node parse-abilities-api.js [--force]
```

**Options:**
- `--force` or `-f`: Force refresh from API (default uses cache)

**Output:** `data_from_api.json`

### 3. Calculate Ratings

Generate character ratings:

```bash
node generate-ratings-table.js
```

**Outputs:**
- `character-ratings.json` - Detailed ratings (JSON)
- `character-ratings.csv` - Spreadsheet-friendly format (CSV)
- `CHARACTER_RATINGS.md` - Human-readable report (Markdown)

### 4. Run Complete Workflow

Execute all steps in sequence:

```bash
node workflow-parse-and-validate.js
```

**Steps:**
1. Parse ability tables from API
2. Validate data.json
3. Calculate character ratings

## File Structure

```
.
├── validate-data.js              # Data validator
├── calculate-ratings.js          # Rating calculator class
├── generate-ratings-table.js     # Generate ratings table
├── parse-abilities-api.js        # Parse ability tables from API
├── merge-character-data.js       # Merge API + database
├── workflow-parse-and-validate.js # Full workflow
├── character-ratings.json        # Generated: JSON format
├── character-ratings.csv         # Generated: CSV format
├── CHARACTER_RATINGS.md          # Generated: Markdown report
└── data.json                     # Source: character database
```

## Example: Top Characters

| Rank | Name | Rating | DPT | Survivability |
|------|------|--------|-----|---------------|
| 1 | Kharn | 206.1 | 434.3 | 108.0 |
| 2 | Titus | 170.3 | 326.8 | 116.8 |
| 3 | Tanksmasha | 131.3 | 103.2 | 115.0 |

See `CHARACTER_RATINGS.md` for complete rankings.

## How Ratings Are Calculated

### Step 1: Parse Attack Stats
```javascript
const { hits, minDmg, maxDmg } = parser.parseAttack("Power / 5 hits");
// hits = 5, minDmg = 15, maxDmg = 20
```

### Step 2: Calculate ADPA
```javascript
const avgDmg = (15 + 20) / 2; // 17.5
const critMult = 1 + (0.15 * 0.5); // 1.075
const adpa = 5 * 17.5 * 1.075; // 94.1
```

### Step 3: Calculate DPT
```javascript
const mobility = 3;
const synergy = 1.1; // Example: 10% bonus from traits
const dpt = adpa * (mobility / 3) * synergy; // 103.5
```

### Step 4: Calculate Other Metrics
```javascript
const ehp = calculateEHP();        // From health + armour
const survivability = calculateSurvivability();
const utility = calculateUtility();
```

### Step 5: Final Rating
```javascript
const rating = (dpt * 0.4) + (survivability * 0.3) + (utility * 0.3);
```

## Trait Modifiers

**Defensive Traits:**
- Resilient: -20% damage taken
- Terminator Armour: -15% damage taken
- Ancient Armour: -15% damage taken
- Parry: 30% block chance, blocks 50 damage

**Offensive Traits:**
- Heavy Weapon: +10% crit chance
- Let the Galaxy Burn: +10% damage multiplier
- Fury of the Unchained: +15% damage multiplier

## Ability Parsing

The system parses ability descriptions to extract:

- **Damage modifiers**: "Deal [dmg] damage", "Damage by [dmg]%"
- **Control effects**: Stun, Suppress, Taunt, Push, Pull, Slow
- **Buffs**: "+X Damage", "+X Armour", "+X Health"
- **Debuffs**: Vulnerability, Weaken, etc.
- **Summons**: Create units

**Example:**
```
"Abaddon performs a double strike dealing 30-37 Piercing Damage"
→ Hits: 2, MinDmg: 30, MaxDmg: 37
→ ADPA: 2 × 33.5 × 1.075 = 72.1
```

## Data Validation

All characters must pass validation:

```
✅ Required fields: name, faction, baseStats, attacks, movement, traits, rarity, abilities
✅ Data types: health/armour/damage must be numeric strings
✅ Rarity: must be one of [Common, Uncommon, Rare, Epic, Legendary]
✅ Ability tables: all rows must have same column count
```

**Validation failures:**
- 3 characters have malformed ability tables (but still rated)
- These should be fixed in data.json

## Integration

To integrate ratings into the UI:

1. Load `character-ratings.json`
2. Sort by `calculated.overall_rating`
3. Display in table/cards
4. Filter by faction, rarity, etc.

```javascript
const ratings = await fetch('character-ratings.json').then(r => r.json());
const sorted = ratings.ratings.sort((a,b) => 
  b.calculated.overall_rating - a.calculated.overall_rating
);
```

## API Reference

### CharacterCalculator Class

```javascript
const { CharacterCalculator } = require('./calculate-ratings');

const calc = new CharacterCalculator(character);

// Get metrics
const dpt = calc.calculateDPT();
const ehp = calc.calculateEHP();
const utility = calc.calculateUtility();
const rating = calc.calculateOverallRating();

// Get full report
const report = calc.getFullReport();
```

## Future Improvements

- [ ] Parse ability tables from Wiki (fallback if API unavailable)
- [ ] Add hero images and icons
- [ ] Add faction bonuses parsing
- [ ] Implement counter database
- [ ] Add synergy scoring
- [ ] Calculate matchup matrix
- [ ] Add hero comparison tool

## Troubleshooting

**Q: Some characters have low utility scores**
- A: They may not have buffs/debuffs/control abilities. This is normal.

**Q: Why is [Character] ranked lower than I expected?**
- A: Ratings are based on individual performance metrics, not popularity or rarity. Lower-rarity characters can have high ratings if they have good stats.

**Q: How often are ratings updated?**
- A: Run `node generate-ratings-table.js` whenever data.json changes. This can be automated in CI/CD.

**Q: Can I customize the weighting?**
- A: Yes, modify the formula in `calculate-ratings.js` line: `return dpt * 0.4 + survivability * 0.3 + utility * 0.3;`

## License

Auto-generated ratings based on Warhammer 40K: Tacticus game data.
