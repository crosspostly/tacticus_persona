#!/usr/bin/env node

/**
 * Complete workflow for parsing, validating, and calculating ratings
 * Runs: parse API -> validate -> calculate ratings -> merge data
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Run a command and return output
 */
function runCommand(cmd, description) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📌 ${description}`);
  console.log(`${'='.repeat(70)}\n`);
  
  try {
    const output = execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    return false;
  }
}

/**
 * Main workflow
 */
async function runWorkflow() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  🚀 TACTICUS CHARACTER DATA PROCESSING WORKFLOW                  ║
║  Parse • Validate • Calculate • Merge                            ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const steps = [
    {
      cmd: 'node parse-abilities-api.js',
      desc: '1️⃣  Parse ability tables from TacticusTable API'
    },
    {
      cmd: 'node validate-data.js',
      desc: '2️⃣  Validate data.json structure'
    },
    {
      cmd: 'node generate-ratings-table.js',
      desc: '3️⃣  Calculate character ratings'
    }
  ];

  let allSuccess = true;

  for (const step of steps) {
    const success = runCommand(step.cmd, step.desc);
    if (!success) {
      allSuccess = false;
      // Continue anyway to see all failures
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  if (allSuccess) {
    console.log(`\n✅ All workflow steps completed successfully!\n`);
    console.log(`📋 Generated files:`);
    console.log(`   - character-ratings.json (JSON format)`);
    console.log(`   - character-ratings.csv (CSV format)`);
    console.log(`   - CHARACTER_RATINGS.md (Markdown report)\n`);
  } else {
    console.log(`\n⚠️  Some steps failed. Check output above.\n`);
    process.exit(1);
  }
  console.log(`${'='.repeat(70)}\n`);
}

/**
 * Entry point
 */
if (require.main === module) {
  runWorkflow().catch(error => {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runWorkflow };
