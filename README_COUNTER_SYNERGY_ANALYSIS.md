# WH40K Tacticus - Counter & Synergy Analysis System

## 🎮 Overview

This is a comprehensive counter and synergy analysis system for WH40K Tacticus characters, built entirely based on the `data.json` file. The system automatically analyzes all characters to determine their counters and synergies using advanced algorithms.

## 📁 Files Created

### 1. **wh40k_counter_synergy_analysis.html**
Interactive web interface for analyzing individual characters
- Real-time character selection
- Visual display of counters and synergies
- Detailed explanations and difficulty ratings
- Export functionality

### 2. **wh40k_analysis_engine.js**
Core analysis engine with all algorithms
- Counter detection (Pierce, Trait, Role, Simulation)
- Synergy analysis (Faction, Trait, Role, Damage Type, Abilities)
- Character role detection and power level calculation
- Complete batch processing of all characters

### 3. **wh40k_complete_analysis.json**
Full analysis results for all 100 characters
- Complete counter and synergy data
- Character statistics and warnings
- Power levels and versatility scores
- Detailed explanations for each relationship

### 4. **wh40k_analysis_summary.json**
Statistical overview and rankings
- Most/least countered characters
- Best synergy partners
- Faction and role distributions
- Overall game balance metrics

### 5. **wh40k_analysis_demo.js**
Demonstration script showing example analyses
- Sample character analysis outputs
- Summary statistics display
- Usage examples

## 🔧 How to Use

### Web Interface
1. Open `wh40k_counter_synergy_analysis.html` in a web browser
2. Select a character from the dropdown
3. Click "🔍 АНАЛИЗИРОВАТЬ" to see detailed analysis
4. Use "📊 АНАЛИЗ ВСЕХ" for batch processing
5. Export results with "💾 ЭКСПОРТ"

### Command Line Analysis
```bash
# Generate complete analysis
node wh40k_analysis_engine.js

# Run demonstration
node wh40k_analysis_demo.js
```

## 🎯 Analysis Algorithms

### Counter Detection
1. **Pierce Counters**: Analyzes armor vs pierce relationships
2. **Trait Counters**: Hard/soft trait counters (Flying→Overwatch, etc.)
3. **Role Counters**: DPS vs Tank, Summoner vs AOE, etc.
4. **Match Simulation**: Calculates win probabilities via combat simulation

### Synergy Analysis
1. **Faction Synergy**: Same faction bonuses and abilities
2. **Trait Synergy**: Complementary trait combinations
3. **Role Synergy**: Optimal team compositions
4. **Damage Type Synergy**: Stacking damage types (Psychic+Psychic, etc.)
5. **Ability Synergy**: Passive/active ability combinations

### Character Metrics
- **Power Level**: Overall combat effectiveness
- **Versatility**: Multi-role capability
- **Role Detection**: Automatic role assignment based on stats
- **Warnings**: Potential build issues and conflicts

## 📊 Key Features

### Automated Analysis
- 100% data-driven from `data.json`
- No hardcoded values or manual entries
- Scalable to any number of characters
- Consistent and objective analysis

### Detailed Explanations
Every counter and synergy includes:
- Clear reasoning
- Difficulty rating (EXTREME to EASY)
- Effectiveness scores
- Source algorithms used
- Specific trait/role interactions

### Comprehensive Coverage
- All character interactions analyzed
- Multiple analysis methods per relationship
- Ranked results with confidence scores
- Statistical summaries and trends

## 🎮 Example Analysis Output

```
🎮 ABADDON THE DESPOILER 🎮
==================================================

📊 Базовая информация:
   Роль: TANK, BUFFER, CONTROLLER
   Фракция: Chaos
   Уровень силы: 245
   Универсальность: 55%

⚔️ Характеристики:
   ХП: 100
   Броня: 25
   Урон: 15
   Редкость: Legendary
   Трейты: Let the Galaxy Burn, Resilient, Terminator Armour
   Атака: Power 5х 40% pierce

🛡️ КОНТРЫ (Top 5):
   1. Kharn [EXTREME]
      Причина: Симуляция: 3 ходов для убийства vs 1 ходов для смерти
      Эффективность: 10.0%
      Источники: Simulation

🤝 СИНЕРГИИ (Top 5):
   1. Volk [★4]
      Причина: Let the Galaxy Burn синергизирует с Daemon
      Бонус: +15.0%
      Счет: 67.5%
      Тип: TRAIT
      Источники: Trait Synergy
```

## 📈 Statistics Summary

- **Total Characters Analyzed**: 100
- **Average Power Level**: 149
- **Most Synergistic Character**: Sibyll Devine (70%)
- **Most Countered Characters**: Abaddon, Abraxas, Actus, Adamatar, Aesoth
- **Largest Faction**: Unknown (67 characters)
- **Most Common Role**: Tank (53 characters)

## 🔍 Technical Details

### Data Processing
- Parses attack strings for damage types and pierce values
- Normalizes character data across different formats
- Calculates effective stats based on rarity multipliers
- Detects factions from descriptions and abilities

### Simulation Engine
- Turn-based combat simulation
- Trait-based damage modifiers
- Rarity-based stat scaling
- Win probability calculations

### Ranking System
- Multi-source aggregation (combines different analysis methods)
- Confidence scoring based on algorithm agreement
- Difficulty classification based on effectiveness
- Top-5 filtering for clarity

## 🚀 Future Enhancements

The system is designed to be easily extensible:
- Add new trait relationships
- Implement advanced combat mechanics
- Include equipment and upgrade analysis
- Team composition optimization
- Meta-analysis and tier rankings

## 📝 Requirements

- Node.js (for command-line analysis)
- Modern web browser (for HTML interface)
- `data.json` file in the same directory

## 🎯 Generated Files

After running the analysis, you'll have:
1. Complete character analysis database
2. Interactive web interface
3. Statistical summaries
4. Example demonstrations
5. Ready-to-use analysis tools

All analysis is based purely on the `data.json` file - no external data sources required!