#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Merge character data from multiple sources
 * Priority: data_from_api > data.json > defaults
 */

function mergeCharacterData(apiChar, dbChar) {
  if (!dbChar) return apiChar;
  if (!apiChar) return dbChar;

  // Merge with priority: API > DB (existing data)
  const merged = {
    name: apiChar.name || dbChar.name,
    faction: apiChar.faction || dbChar.faction,
    description: apiChar.description || dbChar.description,
    baseStats: {
      health: apiChar.baseStats?.health || dbChar.baseStats?.health || '100',
      armour: apiChar.baseStats?.armour || dbChar.baseStats?.armour || '25',
      damage: apiChar.baseStats?.damage || dbChar.baseStats?.damage || '15'
    },
    attacks: {
      melee: apiChar.attacks?.melee || dbChar.attacks?.melee || 'N/A',
      ranged: apiChar.attacks?.ranged || dbChar.attacks?.ranged || 'N/A'
    },
    movement: apiChar.movement || dbChar.movement || '3',
    traits: apiChar.traits?.length > 0 ? apiChar.traits : dbChar.traits || [],
    rarity: apiChar.rarity || dbChar.rarity || 'Common',
    activeAbility: {
      name: apiChar.activeAbility?.name || dbChar.activeAbility?.name || 'Unknown',
      description: apiChar.activeAbility?.description || dbChar.activeAbility?.description || '',
      tables: (apiChar.activeAbility?.tables?.length || 0) > 0
        ? apiChar.activeAbility.tables
        : dbChar.activeAbility?.tables || []
    },
    passiveAbility: {
      name: apiChar.passiveAbility?.name || dbChar.passiveAbility?.name || 'Unknown',
      description: apiChar.passiveAbility?.description || dbChar.passiveAbility?.description || '',
      tables: (apiChar.passiveAbility?.tables?.length || 0) > 0
        ? apiChar.passiveAbility.tables
        : dbChar.passiveAbility?.tables || []
    },
    images: {
      heroArt: apiChar.images?.heroArt || dbChar.images?.heroArt || '',
      heroIcon: apiChar.images?.heroIcon || dbChar.images?.heroIcon || '',
      heroPortrait: apiChar.images?.heroPortrait || dbChar.images?.heroPortrait || ''
    },
    rawInfobox: {
      ...(dbChar.rawInfobox || {}),
      ...(apiChar.rawInfobox || {}),
      mergedAt: new Date().toISOString()
    }
  };

  return merged;
}

/**
 * Find character by name (fuzzy match)
 */
function findCharacterByName(name, characters) {
  const exact = characters.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (exact) return exact;

  // Try fuzzy match
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const fuzzy = characters.find(c =>
    c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
  );
  return fuzzy || null;
}

/**
 * Merge data from API and database
 */
function mergeData(apiDataPath, dbDataPath, outputPath) {
  console.log('📦 Merging character data...\n');

  // Load sources
  let apiData = null;
  let dbData = null;

  if (fs.existsSync(apiDataPath)) {
    console.log(`📂 Loading API data from ${apiDataPath}...`);
    apiData = JSON.parse(fs.readFileSync(apiDataPath, 'utf8'));
    console.log(`   ✅ ${apiData.characters?.length || 0} heroes from API`);
  }

  if (fs.existsSync(dbDataPath)) {
    console.log(`📂 Loading database from ${dbDataPath}...`);
    dbData = JSON.parse(fs.readFileSync(dbDataPath, 'utf8'));
    console.log(`   ✅ ${dbData.characters?.length || 0} heroes from database`);
  }

  if (!apiData && !dbData) {
    throw new Error('No data sources found');
  }

  // Use API data as base, enhance with DB data
  const apiChars = (apiData?.characters || []).slice();
  const dbChars = dbData?.characters || [];

  console.log('\n📋 Merging...\n');

  // Merge each API character with corresponding DB character
  const merged = apiChars.map(apiChar => {
    const dbChar = findCharacterByName(apiChar.name, dbChars);
    if (dbChar) {
      console.log(`✅ Merged ${apiChar.name}`);
    } else {
      console.log(`ℹ️  New from API: ${apiChar.name}`);
    }
    return mergeCharacterData(apiChar, dbChar);
  });

  // Add DB-only characters (not in API)
  dbChars.forEach(dbChar => {
    const found = merged.find(c => c.name.toLowerCase() === dbChar.name.toLowerCase());
    if (!found) {
      console.log(`ℹ️  Legacy: ${dbChar.name}`);
      merged.push(dbChar);
    }
  });

  // Sort by name
  merged.sort((a, b) => a.name.localeCompare(b.name));

  // Create output
  const output = {
    meta: {
      total: merged.length,
      successful: merged.length,
      failed: 0,
      source: 'merged (api + database)',
      timestamp: new Date().toISOString(),
      sources: {
        api: apiData?.meta || null,
        database: dbData?.meta || null
      }
    },
    characters: merged
  };

  // Save
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ Successfully merged ${merged.length} heroes`);
  console.log(`💾 Saved to ${outputPath}`);
  console.log(`${'='.repeat(70)}\n`);

  // Count tables
  const withActiveTables = merged.filter(c => c.activeAbility?.tables?.length > 0).length;
  const withPassiveTables = merged.filter(c => c.passiveAbility?.tables?.length > 0).length;

  console.log(`📊 Ability Tables:`);
  console.log(`   Active: ${withActiveTables}/${merged.length}`);
  console.log(`   Passive: ${withPassiveTables}/${merged.length}\n`);

  return output;
}

/**
 * Main entry point
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const apiPath = args[0] || 'data_from_api.json';
  const dbPath = args[1] || 'data.json';
  const outputPath = args[2] || 'data_merged.json';

  try {
    mergeData(apiPath, dbPath, outputPath);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { mergeCharacterData, findCharacterByName, mergeData };
