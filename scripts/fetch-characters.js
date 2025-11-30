#!/usr/bin/env node

const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

/**
 * ГЛАВНАЯ ФУНКЦИЯ
 */
async function main() {
  console.log('🚀 НАЧАЛО ОБНОВЛЕНИЯ ДАННЫХ ПЕРСОНАЖЕЙ\n');
  
  // ============================================
  // ЭТАП 1: ЗАГРУЗКА ДАННЫХ
  // ============================================
  
  console.log('📥 Шаг 1/4: Загрузка game-info API...');
  let gameInfo;
  try {
    gameInfo = await fetchGameInfo();
    console.log(`   ✅ Загружено ${Object.keys(gameInfo.abilities).length} способностей\n`);
  } catch (error) {
    console.error('❌ Критическая ошибка на шаге 1:', error.message);
    process.exit(1);
  }
  
  console.log('📥 Шаг 2/4: Загрузка существующих данных персонажей...');
  let existingData;
  try {
    existingData = loadExistingCharacters();
    console.log(`   ✅ Загружено ${existingData.characters.length} персонажей\n`);
  } catch (error) {
    console.error('❌ Критическая ошибка на шаге 2:', error.message);
    process.exit(1);
  }
  
  // ============================================
  // ЭТАП 2: ОБРАБОТКА ПЕРСОНАЖЕЙ
  // ============================================
  
  console.log('🔄 Шаг 3/4: Обновление данных способностей...');
  const stats = updateCharacterAbilities(existingData.characters, gameInfo.abilities);
  
  console.log(`   ✅ Успешно обновлено: ${stats.matched} способностей`);
  console.log(`   ⚠️  Не найдено: ${stats.failed} способностей`);
  const successRate = stats.matched + stats.failed > 0 
    ? Math.round(stats.matched / (stats.matched + stats.failed) * 100) 
    : 0;
  console.log(`   📈 Успех: ${successRate}%\n`);
  
  // ============================================
  // ЭТАП 3: СОХРАНЕНИЕ
  // ============================================
  
  console.log('💾 Шаг 4/4: Сохранение результатов...');
  
  try {
    // Создать backup старого файла
    const backupPath = path.join(path.dirname(__dirname), 'tacticustable_heroes_stats.backup.json');
    const statsPath = path.join(path.dirname(__dirname), 'tacticustable_heroes_stats.json');
    const dataPath = path.join(path.dirname(__dirname), 'data.json');
    
    if (fs.existsSync(statsPath)) {
      fs.copyFileSync(statsPath, backupPath);
      console.log('   ✅ Создан backup: tacticustable_heroes_stats.backup.json');
    }
    
    // Обновить meta информацию
    existingData.meta = {
      lastUpdate: new Date().toISOString(),
      source: 'api.tacticustable.com',
      apiVersion: gameInfo.version || 'unknown',
      charactersCount: existingData.characters.length,
      abilitiesMatched: stats.matched,
      abilitiesFailed: stats.failed,
      successRate: `${successRate}%`
    };
    
    // Сохранить в data.json
    fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));
    console.log('   ✅ Обновлён data.json');
    
    // Также обновить основной файл
    fs.writeFileSync(statsPath, JSON.stringify(existingData, null, 2));
    console.log('   ✅ Обновлён tacticustable_heroes_stats.json');
    
    console.log('\n✅ ГОТОВО! Данные успешно обновлены.\n');
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении:', error.message);
    process.exit(1);
  }
}

/**
 * ЗАГРУЗКА ДАННЫХ ИЗ API
 */
async function fetchGameInfo() {
  try {
    const response = await fetch('https://api.tacticustable.com/game-info', {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Ошибка при загрузке game-info: ${error.message}`);
  }
}

/**
 * ЗАГРУЗКА СУЩЕСТВУЮЩИХ ДАННЫХ
 */
function loadExistingCharacters() {
  try {
    const filePath = path.join(path.dirname(__dirname), 'tacticustable_heroes_stats.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Ошибка при чтении tacticustable_heroes_stats.json: ${error.message}`);
  }
}

/**
 * ОБНОВЛЕНИЕ СПОСОБНОСТЕЙ ПЕРСОНАЖЕЙ
 */
function updateCharacterAbilities(characters, abilities) {
  let matched = 0;
  let failed = 0;
  
  const failedAbilities = [];
  
  for (const character of characters) {
    // ============================================
    // ОБРАБОТКА ACTIVE ABILITY
    // ============================================
    if (character.activeAbility && character.activeAbility.name) {
      const abilityName = String(character.activeAbility.name).trim();
      if (abilityName && abilityName !== 'null' && abilityName !== '') {
        const abilityData = findAbilityByName(abilityName, abilities);
        
        if (abilityData) {
          // ПОЛНОСТЬЮ ЗАТИРАЕМ старые данные
          character.activeAbility = {
            name: abilityData.name,
            description: abilityData.description,
            tables: convertVariablesToTables(abilityData.variables),
            constants: abilityData.constants || {}
          };
          matched++;
        } else {
          failedAbilities.push(`${character.name} → Active: "${abilityName}"`);
          // Оставляем пустые tables
          character.activeAbility.tables = [];
          character.activeAbility.constants = {};
          failed++;
        }
      }
    }
    
    // ============================================
    // ОБРАБОТКА PASSIVE ABILITY
    // ============================================
    if (character.passiveAbility && character.passiveAbility.name) {
      const abilityName = String(character.passiveAbility.name).trim();
      if (abilityName && abilityName !== 'null' && abilityName !== '') {
        const abilityData = findAbilityByName(abilityName, abilities);
        
        if (abilityData) {
          // ПОЛНОСТЬЮ ЗАТИРАЕМ старые данные
          character.passiveAbility = {
            name: abilityData.name,
            description: abilityData.description,
            tables: convertVariablesToTables(abilityData.variables),
            constants: abilityData.constants || {}
          };
          matched++;
        } else {
          failedAbilities.push(`${character.name} → Passive: "${abilityName}"`);
          // Оставляем пустые tables
          character.passiveAbility.tables = [];
          character.passiveAbility.constants = {};
          failed++;
        }
      }
    }
  }
  
  // Вывести детали не найденных способностей
  if (failedAbilities.length > 0) {
    console.log('\n   ⚠️  НЕ НАЙДЕННЫЕ СПОСОБНОСТИ:');
    failedAbilities.forEach(msg => console.log(`      - ${msg}`));
    console.log('');
  }
  
  return { matched, failed };
}

/**
 * ПОИСК СПОСОБНОСТИ ПО ИМЕНИ
 */
function findAbilityByName(abilityName, abilities) {
  // Очистить имя от HTML тегов и лишних пробелов
  const cleanName = cleanAbilityName(abilityName);
  
  for (const [abilityId, abilityData] of Object.entries(abilities)) {
    const cleanApiName = cleanAbilityName(abilityData.name);
    
    if (cleanApiName === cleanName) {
      return abilityData;
    }
  }
  
  return null;
}

/**
 * ОЧИСТКА ИМЕНИ СПОСОБНОСТИ
 */
function cleanAbilityName(name) {
  if (!name) return '';
  
  return String(name)
    .replace(/<[^>]*>/g, '')           // Удалить HTML теги
    .replace(/&[a-z]+;/gi, '')         // Удалить HTML entities
    .replace(/\s+/g, ' ')              // Заменить множественные пробелы на один
    .trim()
    .toLowerCase();
}

/**
 * КОНВЕРТАЦИЯ VARIABLES В TABLES
 */
function convertVariablesToTables(variables) {
  if (!variables || Object.keys(variables).length === 0) {
    return [];
  }
  
  const tables = [];
  
  for (const [paramName, valuesArray] of Object.entries(variables)) {
    // Конвертировать строки в числа
    const numericValues = valuesArray.map(v => {
      const num = parseFloat(v);
      return isNaN(num) ? 0 : num;
    });
    
    tables.push({
      parameter: paramName,
      type: detectParameterType(paramName),
      values: numericValues
    });
  }
  
  return tables;
}

/**
 * ОПРЕДЕЛЕНИЕ ТИПА ПАРАМЕТРА
 */
function detectParameterType(paramName) {
  const paramTypes = {
    // Health
    hp: 'health',
    hpToHeal: 'health',
    hpToRepair: 'health',
    maxHp: 'health',
    minHp: 'health',
    hpPct: 'percent',
    extraHp: 'health',
    
    // Damage
    damage: 'damage',
    minDmg: 'damage',
    maxDmg: 'damage',
    extraDmg: 'damage',
    dmg: 'damage',
    blockDmg: 'damage',
    extraCritDmg: 'damage',
    dmgReduction: 'damage',
    
    // Hits
    nrOfHits: 'hits',
    extraHits: 'hits',
    extraHit: 'hits',
    hitsReduction: 'hits',
    maxNrOfHits: 'hits',
    
    // Armor
    armor: 'armor',
    extraArmor: 'armor',
    armorReduction: 'armor',
    armorIgnored: 'armor',
    
    // Percents
    dmgReductionPct: 'percent',
    extraDmgPct: 'percent',
    healthPct: 'percent',
    chance: 'percent',
    critChance: 'percent',
    blockChance: 'percent',
    extraCritChance: 'percent',
    extraPierceRatio: 'percent',
    hpPct: 'percent',
    dmgPct: 'percent',
    
    // Distance/Range
    range: 'distance',
    nrOfTiles: 'distance',
    extraRange: 'distance',
    
    // Rounds/Cooldowns
    nrOfRounds: 'rounds',
    cooldownTurns: 'rounds',
    initialCooldownTurns: 'rounds',
    
    // Summons
    summonHp: 'summon_health',
    summonDmg: 'summon_damage',
    summonArmor: 'summon_armor',
    nrOfSummons: 'count',
    maxSummons: 'count',
    nrOfProjectiles: 'count',
    nrOfTargets: 'count',
    nrOfUnits: 'count',
    maxAdjacentTargets: 'count',
    
    // Movement
    extraMovement: 'movement',
    
    // Shield
    shieldHp: 'shield',
    
    // Other
    buffMaxLevel: 'level',
    nrOfAttacks: 'count',
    munitionsCost: 'resource'
  };
  
  return paramTypes[paramName] || 'number';
}

// ============================================
// ЗАПУСК
// ============================================
main().catch(error => {
  console.error('\n❌ КРИТИЧЕСКАЯ ОШИБКА:', error);
  process.exit(1);
});
