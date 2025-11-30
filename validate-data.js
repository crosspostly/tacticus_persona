#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Validation schema for character data
 */
const VALIDATION_SCHEMA = {
  name: { type: 'string', required: true, minLength: 1 },
  faction: { type: 'string', required: true, minLength: 1 },
  description: { type: 'string', required: false },
  baseStats: {
    type: 'object',
    required: true,
    properties: {
      health: { type: 'string', pattern: /^\d+$/, required: true },
      armour: { type: 'string', pattern: /^\d+$/, required: true },
      damage: { type: 'string', pattern: /^\d+$/, required: true }
    }
  },
  attacks: {
    type: 'object',
    required: true,
    properties: {
      melee: { type: 'string', required: true },
      ranged: { type: 'string', required: true }
    }
  },
  movement: { type: 'string', pattern: /^\d+$/, required: true },
  traits: { type: 'array', required: true, elementType: 'string' },
  rarity: {
    type: 'string',
    required: true,
    enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
  },
  activeAbility: {
    type: 'object',
    required: true,
    properties: {
      name: { type: 'string', required: true },
      description: { type: 'string', required: true },
      tables: { type: 'array', required: false }
    }
  },
  passiveAbility: {
    type: 'object',
    required: true,
    properties: {
      name: { type: 'string', required: true },
      description: { type: 'string', required: true },
      tables: { type: 'array', required: false }
    }
  }
};

/**
 * Validate a single character against schema
 */
function validateCharacter(character, index) {
  const errors = [];

  // Check required fields
  if (!character.name) {
    errors.push('Missing required field: name');
  }

  if (!character.faction) {
    errors.push('Missing required field: faction');
  }

  // Validate baseStats
  if (!character.baseStats) {
    errors.push('Missing required field: baseStats');
  } else {
    if (!character.baseStats.health) {
      errors.push('baseStats.health is required');
    } else if (!/^\d+$/.test(character.baseStats.health)) {
      errors.push(`baseStats.health must be numeric string, got: ${character.baseStats.health}`);
    } else if (parseInt(character.baseStats.health) < 1) {
      errors.push('baseStats.health must be > 0');
    }

    if (!character.baseStats.armour) {
      errors.push('baseStats.armour is required');
    } else if (!/^\d+$/.test(character.baseStats.armour)) {
      errors.push(`baseStats.armour must be numeric string, got: ${character.baseStats.armour}`);
    }

    if (!character.baseStats.damage) {
      errors.push('baseStats.damage is required');
    } else if (!/^\d+$/.test(character.baseStats.damage)) {
      errors.push(`baseStats.damage must be numeric string, got: ${character.baseStats.damage}`);
    }
  }

  // Validate attacks
  if (!character.attacks) {
    errors.push('Missing required field: attacks');
  } else {
    if (!character.attacks.melee) {
      errors.push('attacks.melee is required');
    }
    if (character.attacks.ranged === undefined) {
      errors.push('attacks.ranged is required');
    }
  }

  // Validate movement
  if (!character.movement) {
    errors.push('Missing required field: movement');
  } else if (!/^\d+$/.test(character.movement)) {
    errors.push(`movement must be numeric string, got: ${character.movement}`);
  }

  // Validate traits
  if (!Array.isArray(character.traits)) {
    errors.push('traits must be an array');
  } else if (character.traits.length === 0) {
    errors.push('traits array must not be empty');
  }

  // Validate rarity
  if (!character.rarity) {
    errors.push('Missing required field: rarity');
  } else {
    const validRarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    if (!validRarities.includes(character.rarity)) {
      errors.push(`Invalid rarity: ${character.rarity}. Must be one of: ${validRarities.join(', ')}`);
    }
  }

  // Validate abilities
  if (!character.activeAbility) {
    errors.push('Missing required field: activeAbility');
  } else {
    if (!character.activeAbility.name) {
      errors.push('activeAbility.name is required');
    }
    if (!character.activeAbility.description) {
      errors.push('activeAbility.description is required');
    }
    if (character.activeAbility.tables) {
      const tableErrors = validateAbilityTable(character.activeAbility.tables);
      errors.push(...tableErrors.map(e => `activeAbility.tables: ${e}`));
    }
  }

  if (!character.passiveAbility) {
    errors.push('Missing required field: passiveAbility');
  } else {
    if (!character.passiveAbility.name) {
      errors.push('passiveAbility.name is required');
    }
    if (!character.passiveAbility.description) {
      errors.push('passiveAbility.description is required');
    }
    if (character.passiveAbility.tables) {
      const tableErrors = validateAbilityTable(character.passiveAbility.tables);
      errors.push(...tableErrors.map(e => `passiveAbility.tables: ${e}`));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    index,
    name: character.name || 'Unknown'
  };
}

/**
 * Validate ability table structure
 */
function validateAbilityTable(tables) {
  const errors = [];

  if (!Array.isArray(tables)) {
    errors.push('tables must be an array');
    return errors;
  }

  tables.forEach((table, tableIndex) => {
    if (!Array.isArray(table)) {
      errors.push(`table[${tableIndex}] must be an array`);
      return;
    }

    if (table.length === 0) {
      errors.push(`table[${tableIndex}] is empty`);
      return;
    }

    // Check that all rows have same length
    const headerRow = table[0];
    const headerLength = headerRow.length;

    for (let rowIndex = 1; rowIndex < table.length; rowIndex++) {
      const row = table[rowIndex];
      if (!Array.isArray(row)) {
        errors.push(`table[${tableIndex}][${rowIndex}] is not an array`);
      } else if (row.length !== headerLength) {
        errors.push(
          `table[${tableIndex}][${rowIndex}] has ${row.length} columns, ` +
          `but header has ${headerLength}`
        );
      }
    }
  });

  return errors;
}

/**
 * Validate all characters in data file
 */
function validateAllCharacters(dataPath = 'data.json') {
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

  const validations = data.characters.map((char, index) =>
    validateCharacter(char, index)
  );

  // Group errors by character
  const failedValidations = validations.filter(v => !v.valid);

  if (failedValidations.length === 0) {
    console.log(`✅ All ${data.characters.length} characters validated successfully`);
    return true;
  }

  console.error(`\n❌ Validation failed for ${failedValidations.length} character(s):\n`);

  failedValidations.forEach(({ index, name, errors }) => {
    console.error(`${index + 1}. ${name}:`);
    errors.forEach(err => console.error(`   ❌ ${err}`));
    console.error();
  });

  // Summary
  console.error(`\n📊 Summary:`);
  console.error(`   Total characters: ${data.characters.length}`);
  console.error(`   Valid: ${data.characters.length - failedValidations.length}`);
  console.error(`   Invalid: ${failedValidations.length}`);

  return false;
}

/**
 * Main entry point
 */
if (require.main === module) {
  const valid = validateAllCharacters();
  process.exit(valid ? 0 : 1);
}

module.exports = {
  validateCharacter,
  validateAbilityTable,
  validateAllCharacters,
  VALIDATION_SCHEMA
};
