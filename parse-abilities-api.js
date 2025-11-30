#!/usr/bin/env node

const fs = require('fs');
const fetch = require('node-fetch');

/**
 * Parse ability tables from TacticusTable API
 * Fetches detailed ability tables with all level values
 */

/**
 * Fetch raw game info from API
 */
async function fetchGameInfo(cachePath = 'raw_game_info.json') {
  console.log(`🌐 Downloading game info from api.tacticustable.com ...`);
  
  try {
    const response = await fetch('https://api.tacticustable.com/game-info', {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    fs.writeFileSync(cachePath, JSON.stringify(json, null, 2));
    console.log(`✅ Cached raw response to ${cachePath}`);
    return json;
  } catch (error) {
    console.error(`❌ Failed to fetch API:`, error.message);
    console.log(`📂 Attempting to use cached data...`);
    
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }
    throw error;
  }
}

/**
 * Parse ability table from API data
 * Converts API format to table format for data.json
 */
function parseAbilityTable(abilityData) {
  if (!abilityData?.levels || abilityData.levels.length === 0) {
    return [];
  }

  // Build table: first row is header
  const levels = abilityData.levels;
  
  // Determine header from first level's keys
  const firstLevel = levels[0];
  const valueKeys = firstLevel.values ? Object.keys(firstLevel.values) : [];
  
  // Create header: [Level, ...value keys]
  const header = ['Level', ...valueKeys];
  
  // Create rows for each level
  const rows = [header];
  
  levels.forEach(level => {
    const row = [level.level.toString()];
    valueKeys.forEach(key => {
      const value = level.values?.[key];
      row.push(value !== undefined ? value.toString() : '');
    });
    rows.push(row);
  });

  return [rows]; // Return as array of tables (typically just one)
}

/**
 * Parse ability description and replace placeholders with values
 * Example: "Deal [minDmg]-[maxDmg] damage" -> "Deal 15-20 damage"
 */
function interpolateDescription(description, values) {
  if (!description || !values) return description;

  let result = description;
  
  // Replace placeholders
  Object.entries(values).forEach(([key, value]) => {
    // Try different placeholder formats
    const patterns = [
      new RegExp(`\\[${key}\\]`, 'gi'),
      new RegExp(`\\[${key.toLowerCase()}\\]`, 'gi'),
      new RegExp(`\\{${key}\\}`, 'gi'),
      new RegExp(`\\{${key.toLowerCase()}\\}`, 'gi')
    ];
    
    patterns.forEach(pattern => {
      result = result.replace(pattern, value.toString());
    });
  });

  return result;
}

/**
 * Convert API hero data to character format
 */
function convertHeroToCharacter(heroId, heroData, abilities) {
  const character = {
    name: heroData.longName || heroData.name || heroId,
    faction: heroData.faction || heroData.factionId || 'Unknown',
    description: heroData.description || '',
    baseStats: {
      health: '100',
      armour: '25',
      damage: '15'
    },
    attacks: {
      melee: 'N/A',
      ranged: 'N/A'
    },
    movement: '3',
    traits: heroData.traits || [],
    rarity: convertRarity(heroData.baseRarity || heroData.rarity || 'Common'),
    activeAbility: {
      name: 'Unknown',
      description: '',
      tables: []
    },
    passiveAbility: {
      name: 'Unknown',
      description: '',
      tables: []
    },
    images: {
      heroArt: `https://www.tacticustable.com/images/heroes/${heroId}.png`,
      heroIcon: `https://www.tacticustable.com/images/heroes/${heroId}-icon.png`
    },
    rawInfobox: {
      heroId,
      source: 'api.tacticustable.com',
      lastUpdated: new Date().toISOString()
    }
  };

  // Parse base stats from ranks
  if (heroData.ranks && heroData.ranks.length > 0) {
    const baseRank = heroData.ranks[0];
    character.baseStats.health = (baseRank.health || 100).toString();
    character.baseStats.armour = (baseRank.armor || baseRank.armour || 25).toString();
    character.baseStats.damage = (baseRank.damage || 15).toString();
  }

  // Parse movement
  if (heroData.movement) {
    character.movement = heroData.movement.toString();
  }

  // Parse melee weapon
  if (heroData.meleeWeapon) {
    const melee = heroData.meleeWeapon;
    const name = melee.name || 'Melee';
    const hits = melee.hits || 1;
    const dmgType = melee.damageType || melee.damageProfile || 'Physical';
    const range = melee.range ? ` / Range ${melee.range}` : '';
    character.attacks.melee = `${name} / ${hits} hit${hits > 1 ? 's' : ''}${range}`;
  }

  // Parse ranged weapon
  if (heroData.rangedWeapon || heroData.rangeWeapon) {
    const ranged = heroData.rangedWeapon || heroData.rangeWeapon;
    const name = ranged.name || 'Ranged';
    const hits = ranged.hits || 1;
    const dmgType = ranged.damageType || ranged.damageProfile || 'Energy';
    const range = ranged.range ? ` / Range ${ranged.range}` : '';
    character.attacks.ranged = `${name} / ${hits} hit${hits > 1 ? 's' : ''}${range}`;
  }

  // Parse active ability
  if (heroData.activeAbilityId && abilities[heroData.activeAbilityId]) {
    const ability = abilities[heroData.activeAbilityId];
    character.activeAbility.name = ability.name || 'Active Ability';
    character.activeAbility.description = cleanDescription(ability.description || '');
    
    // Parse ability table
    if (ability.levels && ability.levels.length > 0) {
      character.activeAbility.tables = parseAbilityTable(ability);
    }
  }

  // Parse passive ability
  if (heroData.passiveAbilityId && abilities[heroData.passiveAbilityId]) {
    const ability = abilities[heroData.passiveAbilityId];
    character.passiveAbility.name = ability.name || 'Passive Ability';
    character.passiveAbility.description = cleanDescription(ability.description || '');
    
    // Parse ability table
    if (ability.levels && ability.levels.length > 0) {
      character.passiveAbility.tables = parseAbilityTable(ability);
    }
  }

  return character;
}

/**
 * Clean ability description: remove HTML tags and extra whitespace
 */
function cleanDescription(text) {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Convert rarity name
 */
function convertRarity(rarity) {
  const map = {
    'common': 'Common',
    'uncommon': 'Uncommon',
    'rare': 'Rare',
    'epic': 'Epic',
    'legendary': 'Legendary',
    '1': 'Common',
    '2': 'Uncommon',
    '3': 'Rare',
    '4': 'Epic',
    '5': 'Legendary'
  };
  
  const key = String(rarity).toLowerCase();
  return map[key] || 'Common';
}

/**
 * Main function to parse all abilities from API
 */
async function parseAllAbilities(forceRefresh = false) {
  console.log('🚀 Parsing TacticusTable API ability tables...\n');

  const cachePath = 'raw_game_info.json';
  
  // Fetch API data
  let rawData;
  if (!forceRefresh && fs.existsSync(cachePath)) {
    console.log('📂 Loading cached game info...');
    rawData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } else {
    rawData = await fetchGameInfo(cachePath);
  }

  const heroes = rawData.heroes || {};
  const abilities = rawData.abilities || {};

  console.log(`📊 Found ${Object.keys(heroes).length} heroes`);
  console.log(`📊 Found ${Object.keys(abilities).length} abilities\n`);

  // Convert all heroes to character format
  const characters = [];
  const errors = [];

  for (const [heroId, heroData] of Object.entries(heroes)) {
    try {
      const character = convertHeroToCharacter(heroId, heroData, abilities);
      characters.push(character);
      
      const hasActiveTables = character.activeAbility.tables.length > 0 ? '📊' : '';
      const hasPassiveTables = character.passiveAbility.tables.length > 0 ? '📊' : '';
      console.log(`✅ ${character.name.padEnd(30)} ${hasActiveTables} ${hasPassiveTables}`);
    } catch (error) {
      console.error(`❌ Error parsing ${heroId}: ${error.message}`);
      errors.push({ heroId, error: error.message });
    }
  }

  // Sort by name
  characters.sort((a, b) => a.name.localeCompare(b.name));

  // Create output
  const output = {
    meta: {
      total: characters.length,
      successful: characters.length,
      failed: errors.length,
      source: 'api.tacticustable.com',
      timestamp: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined
    },
    characters
  };

  // Save output
  const outputPath = 'data_from_api.json';
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ Successfully parsed ${characters.length} heroes`);
  console.log(`❌ Failed: ${errors.length}`);
  console.log(`💾 Saved to ${outputPath}`);
  console.log(`${'='.repeat(70)}\n`);

  // Count characters with ability tables
  const withActiveTables = characters.filter(c => c.activeAbility.tables.length > 0).length;
  const withPassiveTables = characters.filter(c => c.passiveAbility.tables.length > 0).length;
  
  console.log(`📊 Statistics:`);
  console.log(`   Active abilities with tables: ${withActiveTables}/${characters.length}`);
  console.log(`   Passive abilities with tables: ${withPassiveTables}/${characters.length}`);

  return output;
}

/**
 * Main entry point
 */
if (require.main === module) {
  const forceRefresh = process.argv.includes('--force') || process.argv.includes('-f');
  
  parseAllAbilities(forceRefresh).catch(error => {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = {
  fetchGameInfo,
  parseAbilityTable,
  convertHeroToCharacter,
  cleanDescription,
  convertRarity,
  parseAllAbilities
};
