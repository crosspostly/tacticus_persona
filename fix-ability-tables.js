#!/usr/bin/env node

/**
 * Fix malformed ability tables in data.json
 * Identifies and repairs inconsistent table row lengths
 */

const fs = require('fs');

/**
 * Fix a single table
 */
function fixTable(table, abilityName) {
  if (!Array.isArray(table) || table.length < 2) {
    return table;
  }

  // Check if first two rows look like headers (both are arrays of strings)
  const firstRow = table[0];
  const secondRow = table[1];
  
  let headerRow = firstRow;
  let dataStartIndex = 1;
  
  // If second row has different length or looks like header, use it as merged header
  if (Array.isArray(secondRow) && 
      secondRow.length > firstRow.length &&
      secondRow.every(v => typeof v === 'string')) {
    // Merge headers - use second row as authoritative
    headerRow = secondRow;
    dataStartIndex = 2;
  }
  
  const headerLength = headerRow.length;
  let fixed = false;

  const fixedTable = [headerRow];
  
  for (let i = dataStartIndex; i < table.length; i++) {
    const row = table[i];

    if (!Array.isArray(row)) {
      console.warn(`  ⚠️  Row ${i} is not an array, skipping`);
      fixedTable.push(row);
      continue;
    }

    if (row.length === headerLength) {
      fixedTable.push(row); // Already correct length
      continue;
    }

    if (row.length < headerLength) {
      // Pad with empty strings
      const padded = [...row];
      while (padded.length < headerLength) {
        padded.push('');
      }
      fixed = true;
      fixedTable.push(padded);
    } else if (row.length > headerLength) {
      // Truncate to header length
      fixed = true;
      fixedTable.push(row.slice(0, headerLength));
    }
  }

  if (fixed || dataStartIndex > 1) {
    console.log(`  ✅ Fixed ${abilityName} table (${headerLength} columns, removed header rows: ${dataStartIndex - 1})`);
  }

  return fixedTable;
}

/**
 * Fix all ability tables in data
 */
function fixAllTables(data) {
  const fixed = { ...data };
  let charCount = 0;
  let tableCount = 0;

  fixed.characters = data.characters.map((char, index) => {
    const fixedChar = { ...char };
    let charFixed = false;

    // Fix active ability tables
    if (char.activeAbility?.tables?.length > 0) {
      const oldLength = char.activeAbility.tables[0]?.length || 0;
      fixedChar.activeAbility.tables = char.activeAbility.tables.map(table =>
        fixTable(table, `${char.name}/Active`)
      );
      const newLength = fixedChar.activeAbility.tables[0]?.length || 0;
      if (oldLength !== newLength) {
        charFixed = true;
        tableCount++;
      }
    }

    // Fix passive ability tables
    if (char.passiveAbility?.tables?.length > 0) {
      const oldLength = char.passiveAbility.tables[0]?.length || 0;
      fixedChar.passiveAbility.tables = char.passiveAbility.tables.map(table =>
        fixTable(table, `${char.name}/Passive`)
      );
      const newLength = fixedChar.passiveAbility.tables[0]?.length || 0;
      if (oldLength !== newLength) {
        charFixed = true;
        tableCount++;
      }
    }

    if (charFixed) {
      charCount++;
    }

    return fixedChar;
  });

  return { fixed, charCount, tableCount };
}

/**
 * Main
 */
function main() {
  console.log('🔧 Fixing ability tables in data.json\n');

  // Load data
  const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

  console.log(`📊 Analyzing ${data.characters.length} characters...\n`);

  // Fix tables
  const { fixed, charCount, tableCount } = fixAllTables(data);

  if (tableCount === 0) {
    console.log('✅ No tables needed fixing!\n');
    return;
  }

  console.log(`\n✅ Fixed ${tableCount} tables in ${charCount} characters`);

  // Save backup
  const backupPath = 'data_backup_before_fix.json';
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  console.log(`💾 Backup saved to ${backupPath}`);

  // Save fixed data
  fs.writeFileSync('data.json', JSON.stringify(fixed, null, 2));
  console.log(`💾 Saved fixed data to data.json\n`);

  // Validate fixed data
  console.log('📋 Validating fixed data...\n');
  const { execSync } = require('child_process');
  try {
    execSync('node validate-data.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Validation still failing, check the tables manually');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixTable, fixAllTables };
