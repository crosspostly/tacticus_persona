#!/usr/bin/env node

const fs = require('fs');
const fetch = require('node-fetch');

/**
 * Parse TacticusTable API data from https://api.tacticustable.com/game-info
 * and convert it to the format used in data.json
 */

async function fetchGameInfo(cachePath = 'raw_game_info.json') {
  console.log(`🌐 Downloading game info from api.tacticustable.com ...`);
  const response = await fetch('https://api.tacticustable.com/game-info');
  if (!response.ok) {
    throw new Error(`Failed to fetch game info: HTTP ${response.status}`);
  }
  const json = await response.json();
  fs.writeFileSync(cachePath, JSON.stringify(json, null, 2));
  console.log(`💾 Cached raw response to ${cachePath}`);
  return json;
}

function parseHeroFromAPI(heroId, heroData, abilities) {
  const hero = {
    name: heroData.longName || heroData.name,
    faction: heroData.factionId || 'Unknown',
    description: heroData.description || `${heroData.longName || heroData.name} is a character in Warhammer 40,000: Tacticus.`,
    baseStats: {
      health: null,
      armour: null,
      damage: null
    },
    attacks: {
      melee: 'N/A',
      ranged: 'N/A'
    },
    movement: heroData.movement?.toString() || '3',
    traits: heroData.traits || [],
    rarity: convertRarity(heroData.baseRarity),
    activeAbility: {
      name: null,
      description: null,
      tables: []
    },
    passiveAbility: {
      name: null,
      description: null,
      tables: []
    },
    images: {
      heroArt: `https://www.tacticustable.com/images/heroes/${heroId}.png`,
      heroIcon: `https://www.tacticustable.com/images/heroes/${heroId}.png`
    },
    rawInfobox: {}
  };

  // Get stats from ranks (use Stone I as base)
  if (heroData.ranks && heroData.ranks.length > 0) {
    const baseRank = heroData.ranks[0];
    hero.baseStats.health = baseRank.health?.toString() || '100';
    hero.baseStats.armour = baseRank.armor?.toString() || '25';
    hero.baseStats.damage = baseRank.damage?.toString() || '15';
  } else {
    hero.baseStats.health = '100';
    hero.baseStats.armour = '25';
    hero.baseStats.damage = '15';
  }

  // Parse melee weapon
  if (heroData.meleeWeapon) {
    const melee = heroData.meleeWeapon;
    const hits = melee.hits || 1;
    const dmgType = melee.damageProfile || 'Physical';
    const range = melee.range ? ` / Range ${melee.range}` : '';
    hero.attacks.melee = `${dmgType} / ${hits} hit${hits > 1 ? 's' : ''}${range}`;
  }

  // Parse ranged weapon
  if (heroData.rangeWeapon) {
    const ranged = heroData.rangeWeapon;
    const hits = ranged.hits || 1;
    const dmgType = ranged.damageProfile || 'Energy';
    const range = ranged.range ? ` / Range ${ranged.range}` : '';
    hero.attacks.ranged = `${dmgType} / ${hits} hit${hits > 1 ? 's' : ''}${range}`;
  }

  // Get active ability details
  if (heroData.activeAbility && abilities[heroData.activeAbility]) {
    const ability = abilities[heroData.activeAbility];
    hero.activeAbility.name = ability.name || heroData.activeAbility;
    hero.activeAbility.description = stripHtmlTags(ability.description || '');
  }

  // Get passive ability details
  if (heroData.passiveAbility && abilities[heroData.passiveAbility]) {
    const ability = abilities[heroData.passiveAbility];
    hero.passiveAbility.name = ability.name || heroData.passiveAbility;
    hero.passiveAbility.description = stripHtmlTags(ability.description || '');
  }

  return hero;
}

function convertRarity(baseRarity) {
  const rarityMap = {
    'Common': 'Common',
    'Uncommon': 'Uncommon',
    'Rare': 'Rare',
    'Epic': 'Epic',
    'Legendary': 'Legendary'
  };
  return rarityMap[baseRarity] || 'Common';
}

function stripHtmlTags(html) {
  if (!html) return '';
  return html
    .replace(/<img[^>]*>/g, '')
    .replace(/<span[^>]*>/g, '')
    .replace(/<\/span>/g, '')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/\{|\}/g, '')
    .replace(/\[\[/g, '')
    .replace(/\]\]/g, '')
    .trim();
}

async function main() {
  console.log('🚀 Parsing TacticusTable API data...\n');

  const args = process.argv.slice(2);
  const forceRefresh = args.includes('--force') || args.includes('-f');
  const cachePath = 'raw_game_info.json';

  // Fetch or read the raw API data
  let rawData;
  if (!forceRefresh && fs.existsSync(cachePath)) {
    console.log('📂 Loading cached game info...');
    rawData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } else {
    rawData = await fetchGameInfo(cachePath);
  }

  const heroes = rawData.heroes || {};
  const abilities = rawData.abilities || {};

  console.log(`📊 Found ${Object.keys(heroes).length} heroes in API data`);
  console.log(`📊 Found ${Object.keys(abilities).length} abilities in API data\n`);

  const characters = [];
  const errors = [];

  for (const [heroId, heroData] of Object.entries(heroes)) {
    try {
      const character = parseHeroFromAPI(heroId, heroData, abilities);
      characters.push(character);
      console.log(`✅ ${character.name} (${character.faction}) - HP:${character.baseStats.health}, Armour:${character.baseStats.armour}, Damage:${character.baseStats.damage}`);
    } catch (error) {
      console.error(`❌ Error parsing ${heroId}: ${error.message}`);
      errors.push({ heroId, error: error.toString() });
    }
  }

  // Create output data
  const outputData = {
    meta: {
      total: characters.length,
      successful: characters.length,
      failed: errors.length,
      source: 'api.tacticustable.com',
      apiVersion: rawData.version,
      timestamp: new Date().toISOString(),
      errors: errors
    },
    characters: characters.sort((a, b) => a.name.localeCompare(b.name))
  };

  // Save to file
  const outputPath = 'tacticustable_heroes_stats.json';
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Successfully parsed ${characters.length} heroes`);
  console.log(`❌ Failed to parse ${errors.length} heroes`);
  console.log(`💾 Saved to ${outputPath}`);
  console.log(`${'='.repeat(60)}\n`);

  // Show sample
  console.log('📋 Sample data (first 3 heroes):');
  characters.slice(0, 3).forEach((char, i) => {
    console.log(`\n${i + 1}. ${char.name} (${char.faction})`);
    console.log(`   Stats: HP ${char.baseStats.health}, Armour ${char.baseStats.armour}, Damage ${char.baseStats.damage}`);
    console.log(`   Melee: ${char.attacks.melee}`);
    console.log(`   Ranged: ${char.attacks.ranged}`);
    console.log(`   Traits: ${char.traits.join(', ') || 'None'}`);
    console.log(`   Active: ${char.activeAbility.name || 'N/A'}`);
    console.log(`   Passive: ${char.passiveAbility.name || 'N/A'}`);
  });
}

if (require.main === module) {
  main().catch(error => {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = { fetchGameInfo, parseHeroFromAPI, convertRarity, stripHtmlTags };
