#!/usr/bin/env node

/**
 * Character rating calculator based on game formulas
 * Calculates DPT, Survivability, Utility and overall rating
 */

class CharacterCalculator {
  constructor(character) {
    this.char = character;
  }

  /**
   * Average Damage Per Attack (ADPA)
   * ADPA = Hits × ((MinDmg + MaxDmg) / 2) × (1 + CritChance × CritDmg)
   */
  calculateADPA(attack, level = 1) {
    const { hits, minDmg, maxDmg } = this.parseAttack(attack, level);
    const critChance = this.getCritChance();
    const critDmg = this.getCritDamage();

    const avgDmg = (minDmg + maxDmg) / 2;
    const critMultiplier = 1 + critChance * critDmg;

    return hits * avgDmg * critMultiplier;
  }

  /**
   * Effective Health Pool (EHP)
   * EHP = Health × (1 + Armour / 100) × (1 + BlockChance × BlockAmount / 100)
   */
  calculateEHP() {
    const health = parseInt(this.char.baseStats.health);
    const armour = parseInt(this.char.baseStats.armour);
    const blockChance = this.getBlockChance();
    const blockAmount = this.getBlockAmount();

    const armourMultiplier = 1 + armour / 100;
    const blockMultiplier = 1 + (blockChance * blockAmount) / 100;

    return health * armourMultiplier * blockMultiplier;
  }

  /**
   * Damage Per Turn (DPT)
   * DPT = (MeleeDamage + RangedDamage) × Mobility × SynergyMultiplier
   */
  calculateDPT() {
    const meleeDamage = this.calculateADPA(this.char.attacks.melee);
    const rangedDamage =
      this.char.attacks.ranged !== 'N/A'
        ? this.calculateADPA(this.char.attacks.ranged)
        : 0;

    const mobility = parseInt(this.char.movement);
    const synergyMultiplier = this.calculateSynergyMultiplier();

    // Normalize mobility to attack frequency
    return (meleeDamage + rangedDamage) * (mobility / 3) * synergyMultiplier;
  }

  /**
   * Survivability Score
   * Survivability = EHP × (1 + HealingPerTurn / MaxHealth) × (1 - DamageTakenModifier)
   */
  calculateSurvivability() {
    const ehp = this.calculateEHP();
    const healingPerTurn = this.getHealingPerTurn();
    const maxHealth = parseInt(this.char.baseStats.health);
    const damageTakenModifier = this.getDamageTakenModifier();

    const healingMultiplier = 1 + healingPerTurn / maxHealth;
    const damageReduction = 1 - damageTakenModifier;

    return ehp * healingMultiplier * damageReduction;
  }

  /**
   * Utility Score
   * Utility = BuffPower + DebuffPower + SummonPower + ControlPower
   */
  calculateUtility() {
    const buffPower = this.calculateBuffPower();
    const debuffPower = this.calculateDebuffPower();
    const summonPower = this.calculateSummonPower();
    const controlPower = this.calculateControlPower();

    return buffPower + debuffPower + summonPower + controlPower;
  }

  /**
   * Overall Rating
   * Rating = (DPT × 0.4) + (Survivability × 0.3) + (Utility × 0.3)
   */
  calculateOverallRating() {
    const dpt = this.calculateDPT();
    const survivability = this.calculateSurvivability();
    const utility = this.calculateUtility();

    return dpt * 0.4 + survivability * 0.3 + utility * 0.3;
  }

  /**
   * Parse attack string and extract hits, minDmg, maxDmg
   * Example: "Power / 5 hits" or "Bolter / 3 hits / Range 2"
   */
  parseAttack(attackString, level = 1) {
    const parts = attackString.split('/').map(s => s.trim());

    let hits = 1;
    let minDmg = parseInt(this.char.baseStats.damage);
    let maxDmg = minDmg;

    parts.forEach(part => {
      const hitsMatch = part.match(/(\d+)\s*hits?/i);
      if (hitsMatch) {
        hits = parseInt(hitsMatch[1]);
      }
    });

    // If there's an ability table, get values from there
    if (this.char.activeAbility?.tables?.[0]?.[level]) {
      const table = this.char.activeAbility.tables[0];
      const row = table[level];
      // Look for damage columns (usually at indices 3, 4 or similar)
      if (row.length >= 5) {
        const dmgStr = row[4]; // Usually last column has damage range
        if (dmgStr && typeof dmgStr === 'string' && dmgStr.includes('-')) {
          const [min, max] = dmgStr.split('-').map(d => parseInt(d.trim()));
          if (!isNaN(min) && !isNaN(max)) {
            minDmg = min;
            maxDmg = max;
          }
        }
      }
    }

    return { hits, minDmg, maxDmg };
  }

  /**
   * Get crit chance from traits and abilities
   */
  getCritChance() {
    let critChance = 0.15; // Default 15%

    // Check traits
    if (this.char.traits?.includes('Heavy Weapon')) {
      critChance += 0.1;
    }

    // Parse ability text for crit bonuses
    const abilityText =
      this.char.activeAbility?.description +
      ' ' +
      this.char.passiveAbility?.description;

    const critMatch = abilityText.match(/\+(\d+)%\s*Crit\s*Chance/i);
    if (critMatch) {
      critChance += parseInt(critMatch[1]) / 100;
    }

    return Math.min(critChance, 1.0); // Cap at 100%
  }

  /**
   * Get crit damage multiplier from abilities
   */
  getCritDamage() {
    let critDmg = 0.5; // Default +50% damage

    const abilityText =
      this.char.activeAbility?.description +
      ' ' +
      this.char.passiveAbility?.description;

    const critDmgMatch = abilityText.match(/\+(\d+)\s*Crit\s*Damage/i);
    if (critDmgMatch) {
      critDmg += parseInt(critDmgMatch[1]) / 100;
    }

    return critDmg;
  }

  /**
   * Get block chance from traits
   */
  getBlockChance() {
    if (!this.char.traits?.includes('Parry')) return 0;
    return 0.3; // 30% block chance
  }

  /**
   * Get block amount
   */
  getBlockAmount() {
    if (!this.char.traits?.includes('Parry')) return 0;
    return 50; // Blocks 50 damage per block
  }

  /**
   * Calculate synergy multiplier from traits
   */
  calculateSynergyMultiplier() {
    let multiplier = 1.0;

    // Example bonuses (expand as needed)
    if (this.char.traits?.includes('Let the Galaxy Burn')) {
      multiplier += 0.1;
    }

    if (this.char.traits?.includes('Fury of the Unchained')) {
      multiplier += 0.15;
    }

    return multiplier;
  }

  /**
   * Get healing per turn from abilities
   */
  getHealingPerTurn() {
    const abilityText =
      this.char.activeAbility?.description +
      ' ' +
      this.char.passiveAbility?.description;

    // Look for heal patterns
    const healMatch = abilityText.match(
      /heal(?:s|ing)?\s+(?:himself|itself|herself|allies)?.*?(\d+)\s*Health/i
    );
    if (healMatch) {
      return parseInt(healMatch[1]);
    }

    const regenMatch = abilityText.match(/regenerate(?:s)?\s+(\d+)\s*Health/i);
    if (regenMatch) {
      return parseInt(regenMatch[1]);
    }

    return 0;
  }

  /**
   * Get damage reduction modifier from traits
   */
  getDamageTakenModifier() {
    let modifier = 0;

    if (this.char.traits?.includes('Resilient')) {
      modifier += 0.2; // 20% reduction
    }

    if (this.char.traits?.includes('Terminator Armour')) {
      modifier += 0.15; // 15% reduction
    }

    if (this.char.traits?.includes('Ancient Armour')) {
      modifier += 0.15;
    }

    return Math.min(modifier, 0.75); // Cap at 75% reduction
  }

  /**
   * Calculate buff power from abilities
   */
  calculateBuffPower() {
    let power = 0;

    const abilityText =
      this.char.activeAbility?.description +
      ' ' +
      this.char.passiveAbility?.description;

    // Damage buffs
    const damageBuffs = abilityText.match(/\+(\d+)\s*Damage/gi) || [];
    damageBuffs.forEach(match => {
      const value = parseInt(match.match(/\d+/)[0]);
      power += value * 2; // Higher weight for damage
    });

    // Armour buffs
    const armourBuffs = abilityText.match(/\+(\d+)\s*Armour/gi) || [];
    armourBuffs.forEach(match => {
      const value = parseInt(match.match(/\d+/)[0]);
      power += value;
    });

    // Health buffs
    const healthBuffs = abilityText.match(/\+(\d+)\s*Health/gi) || [];
    healthBuffs.forEach(match => {
      const value = parseInt(match.match(/\d+/)[0]);
      power += value * 0.5;
    });

    return power;
  }

  /**
   * Calculate debuff power from abilities
   */
  calculateDebuffPower() {
    let power = 0;

    const abilityText =
      this.char.activeAbility?.description +
      ' ' +
      this.char.passiveAbility?.description;

    // Suppress - very powerful
    if (abilityText.match(/Suppress/i)) {
      power += 50;
    }

    // Stun - extremely powerful
    if (abilityText.match(/Stun/i)) {
      power += 100;
    }

    // Taunt - moderate
    if (abilityText.match(/Taunt/i)) {
      power += 30;
    }

    // Vulnerability
    if (abilityText.match(/Vulnerable/i)) {
      power += 25;
    }

    return power;
  }

  /**
   * Calculate summon power from abilities
   */
  calculateSummonPower() {
    const abilityText =
      this.char.activeAbility?.description +
      ' ' +
      this.char.passiveAbility?.description;

    const summonMatches = abilityText.match(/summon(?:s)?\s+(?:a|an|the)?/gi) || [];
    return summonMatches.length * 50; // Each summon = 50 points
  }

  /**
   * Calculate control power (push, pull, slow)
   */
  calculateControlPower() {
    let power = 0;

    const abilityText =
      this.char.activeAbility?.description +
      ' ' +
      this.char.passiveAbility?.description;

    // Push/Pull
    if (abilityText.match(/push/i)) {
      power += 20;
    }

    if (abilityText.match(/pull/i)) {
      power += 20;
    }

    // Slow/Movement reduction
    if (abilityText.match(/slow|reduce.*movement/i)) {
      power += 30;
    }

    // Charge/Rush
    if (abilityText.match(/charge|rush/i)) {
      power += 15;
    }

    return power;
  }

  /**
   * Generate full report for character
   */
  getFullReport() {
    return {
      name: this.char.name,
      faction: this.char.faction,
      rarity: this.char.rarity,
      stats: {
        health: parseInt(this.char.baseStats.health),
        armour: parseInt(this.char.baseStats.armour),
        damage: parseInt(this.char.baseStats.damage),
        movement: parseInt(this.char.movement)
      },
      calculated: {
        adpa_melee: this.calculateADPA(this.char.attacks.melee),
        adpa_ranged:
          this.char.attacks.ranged !== 'N/A'
            ? this.calculateADPA(this.char.attacks.ranged)
            : 0,
        ehp: this.calculateEHP(),
        dpt: this.calculateDPT(),
        survivability: this.calculateSurvivability(),
        utility: this.calculateUtility(),
        overall_rating: this.calculateOverallRating()
      },
      breakdown: {
        critChance: this.getCritChance(),
        critDamage: this.getCritDamage(),
        blockChance: this.getBlockChance(),
        healingPerTurn: this.getHealingPerTurn(),
        damageTakenModifier: this.getDamageTakenModifier(),
        synergyMultiplier: this.calculateSynergyMultiplier()
      }
    };
  }
}

module.exports = { CharacterCalculator };
