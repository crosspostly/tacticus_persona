#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { CharacterCalculator } = require('./calculate-ratings');

/**
 * Generate ratings table for all characters
 */
function generateRatingsTable(dataPath = 'data.json', outputDir = '.') {
  let data;
  try {
    const content = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error reading or parsing ${dataPath}:`, error.message);
    process.exit(1);
  }

  if (!data.characters || !Array.isArray(data.characters)) {
    console.error('❌ data.json must have a "characters" array');
    process.exit(1);
  }

  console.log(`📊 Calculating ratings for ${data.characters.length} characters...`);

  // Calculate ratings for all characters
  const ratings = data.characters.map(char => {
    try {
      const calc = new CharacterCalculator(char);
      return calc.getFullReport();
    } catch (error) {
      console.warn(`⚠️  Error calculating rating for ${char.name}:`, error.message);
      return {
        name: char.name,
        faction: char.faction,
        rarity: char.rarity,
        stats: {
          health: parseInt(char.baseStats?.health) || 0,
          armour: parseInt(char.baseStats?.armour) || 0,
          damage: parseInt(char.baseStats?.damage) || 0,
          movement: parseInt(char.movement) || 0
        },
        calculated: {
          adpa_melee: 0,
          adpa_ranged: 0,
          ehp: 0,
          dpt: 0,
          survivability: 0,
          utility: 0,
          overall_rating: 0
        },
        error: error.message
      };
    }
  });

  // Sort by overall rating (descending)
  ratings.sort((a, b) => b.calculated.overall_rating - a.calculated.overall_rating);

  // Add ranks
  ratings.forEach((char, index) => {
    char.rank = index + 1;
  });

  // Save JSON
  const jsonPath = path.join(outputDir, 'character-ratings.json');
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        meta: {
          total: ratings.length,
          generated: new Date().toISOString(),
          version: '1.0'
        },
        ratings
      },
      null,
      2
    )
  );
  console.log(`✅ Saved JSON ratings to ${jsonPath}`);

  // Generate CSV
  const csvPath = path.join(outputDir, 'character-ratings.csv');
  const csv = generateCSV(ratings);
  fs.writeFileSync(csvPath, csv);
  console.log(`✅ Saved CSV ratings to ${csvPath}`);

  // Generate Markdown
  const markdownPath = path.join(outputDir, 'CHARACTER_RATINGS.md');
  const markdown = generateMarkdown(ratings);
  fs.writeFileSync(markdownPath, markdown);
  console.log(`✅ Saved Markdown ratings to ${markdownPath}`);

  // Print top 10
  console.log(`\n📈 Top 10 Characters:\n`);
  ratings.slice(0, 10).forEach(char => {
    console.log(`${char.rank}. ${char.name.padEnd(30)} - Rating: ${char.calculated.overall_rating.toFixed(1)}`);
  });

  return { jsonPath, csvPath, markdownPath, ratings };
}

/**
 * Generate CSV from ratings
 */
function generateCSV(ratings) {
  const header =
    'Rank,Name,Faction,Rarity,Health,Armour,Damage,Movement,' +
    'ADPA Melee,ADPA Ranged,EHP,DPT,Survivability,Utility,Overall Rating\n';

  const rows = ratings
    .map(char => {
      return [
        char.rank,
        `"${char.name}"`,
        `"${char.faction}"`,
        char.rarity,
        char.stats.health,
        char.stats.armour,
        char.stats.damage,
        char.stats.movement,
        char.calculated.adpa_melee.toFixed(1),
        char.calculated.adpa_ranged.toFixed(1),
        char.calculated.ehp.toFixed(1),
        char.calculated.dpt.toFixed(1),
        char.calculated.survivability.toFixed(1),
        char.calculated.utility.toFixed(1),
        char.calculated.overall_rating.toFixed(1)
      ].join(',');
    })
    .join('\n');

  return header + rows;
}

/**
 * Generate Markdown table from ratings
 */
function generateMarkdown(ratings) {
  let md = '# 📊 Character Ratings Report\n\n';
  md += `**Generated:** ${new Date().toISOString()}\n\n`;

  md += '## Methodology\n\n';
  md += '### Overall Rating Formula\n';
  md += '```\nRating = (DPT × 0.4) + (Survivability × 0.3) + (Utility × 0.3)\n```\n\n';

  md += '### Metrics Definition\n';
  md += '- **DPT** (Damage Per Turn): Average damage output per turn\n';
  md += '  - Calculated: `ADPA × Mobility × Synergy Multiplier`\n';
  md += '- **ADPA** (Average Damage Per Attack): `Hits × AvgDmg × CritMultiplier`\n';
  md += '- **EHP** (Effective Health Pool): `Health × Armour Modifier × Block Modifier`\n';
  md += '- **Survivability**: `EHP × Healing Multiplier × Damage Reduction`\n';
  md += '- **Utility**: `Buffs + Debuffs + Summons + Control`\n\n';

  md += '---\n\n';
  md += '## Top 20 Characters\n\n';
  md +=
    '| Rank | Name | Faction | Rarity | Movement | DPT | Survivability | Utility | **Overall** |\n';
  md +=
    '|------|------|---------|--------|----------|-----|---------------|---------|-------------|\n';

  ratings.slice(0, 20).forEach(char => {
    const dpt = char.calculated.dpt.toFixed(1);
    const surv = char.calculated.survivability.toFixed(1);
    const util = char.calculated.utility.toFixed(1);
    const overall = char.calculated.overall_rating.toFixed(1);
    md += `| ${char.rank} | ${char.name} | ${char.faction} | ${char.rarity} | ${char.stats.movement} | ${dpt} | ${surv} | ${util} | **${overall}** |\n`;
  });

  md += '\n---\n\n';
  md += '## Complete Rankings\n\n';
  md += '<details>\n<summary>Click to expand full ranking</summary>\n\n';
  md += '| Rank | Name | Faction | Rarity | Overall Rating |\n';
  md += '|------|------|---------|--------|----------------|\n';

  ratings.forEach(char => {
    const overall = char.calculated.overall_rating.toFixed(1);
    md += `| ${char.rank} | ${char.name} | ${char.faction} | ${char.rarity} | ${overall} |\n`;
  });

  md += '\n</details>\n\n';

  // Stats by faction
  md += '## Characters by Faction\n\n';
  const byFaction = {};
  ratings.forEach(char => {
    if (!byFaction[char.faction]) {
      byFaction[char.faction] = [];
    }
    byFaction[char.faction].push(char);
  });

  Object.entries(byFaction).forEach(([faction, chars]) => {
    const avgRating =
      chars.reduce((sum, c) => sum + c.calculated.overall_rating, 0) / chars.length;
    md += `### ${faction} (${chars.length} characters)\n`;
    md += `**Avg Rating:** ${avgRating.toFixed(1)}\n\n`;
    md += '| Name | Rating | DPT | Survivability |\n';
    md += '|------|--------|-----|---------------|\n';
    chars.slice(0, 5).forEach(char => {
      md += `| ${char.name} | ${char.calculated.overall_rating.toFixed(1)} | ${char.calculated.dpt.toFixed(1)} | ${char.calculated.survivability.toFixed(1)} |\n`;
    });
    md += '\n';
  });

  // Stats by rarity
  md += '## Characters by Rarity\n\n';
  const byRarity = {};
  ratings.forEach(char => {
    if (!byRarity[char.rarity]) {
      byRarity[char.rarity] = [];
    }
    byRarity[char.rarity].push(char);
  });

  Object.entries(byRarity).forEach(([rarity, chars]) => {
    const avgRating =
      chars.reduce((sum, c) => sum + c.calculated.overall_rating, 0) / chars.length;
    md += `### ${rarity} (${chars.length} characters)\n`;
    md += `**Avg Rating:** ${avgRating.toFixed(1)}\n`;
    md += `**Range:** ${chars[0].calculated.overall_rating.toFixed(1)} - ${chars[chars.length - 1].calculated.overall_rating.toFixed(1)}\n\n`;
  });

  md += '\n---\n';
  md += '*Report auto-generated. Rankings based on game formulas and character data.*\n';

  return md;
}

/**
 * Main entry point
 */
if (require.main === module) {
  try {
    generateRatingsTable();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating ratings table:', error.message);
    process.exit(1);
  }
}

module.exports = { generateRatingsTable, generateCSV, generateMarkdown };
