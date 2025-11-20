// WH40K Tacticus - Counter & Synergy Analysis Engine
// Version: 1.0 - Complete Analysis System
// Generates comprehensive counter and synergy data from data.json

const fs = require('fs');

// Load character data
function loadData() {
    try {
        const rawData = fs.readFileSync('data.json', 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error loading data.json:', error);
        return [];
    }
}

// Constants
const RARITY_MULTIPLIERS = {
    "Common": 1,
    "Uncommon": 2,
    "Rare": 3,
    "Epic": 5,
    "Legendary": 10,
    "Mythic": 15
};

const TRAIT_HARD_COUNTERS = {
    "Flying": ["Overwatch", "Suppressive Fire", "Anti-Air"],
    "Summon": ["AOE", "Swarm_Clear", "Area_Denial"],
    "Psyker": ["Psychic_Fortress", "Mental_Block"],
    "Terminator Armour": ["Psychic", "Direct", "Molecular"],
    "Resilient": ["Burst_Damage", "Overkill_Potential"],
    "Deep Strike": ["Overwatch", "Infiltrate_Detection"],
    "Final Vengeance": ["Healing", "Shield", "Resurrection"],
    "Terrifying": ["Fearless", "Immune_To_Fear"],
    "Living Metal": ["Corrosion", "EMP", "Energy_Weapons"],
    "Parry": ["Unblockable", "Chain_Hits"],
    "Let the Galaxy Burn": ["Discipline", "Leadership", "Fearless"],
    "Contagions of Nurgle": ["Immune_To_Poison", "Living_Metal", "Purify"]
};

const TRAIT_SOFT_COUNTERS = {
    "Rapid Assault": ["Parry", "Block_Chance"],
    "Heavy Weapon": ["Evasion", "Dodge"],
    "Overwatch": ["Infiltrate", "Flying_Escape"],
    "Suppressive Fire": ["Immunity", "Counter_Attack"],
    "Terminator Armour": ["Melta", "Graviton", "Plasma"]
};

const SYNERGISTIC_TRAIT_PAIRS = {
    "Flying": ["Deep Strike", "Infiltrate", "Evasion"],
    "Final Vengeance": ["Rapid Assault", "Multi-Hit"],
    "Psyker": ["Psyker"],
    "Summon": ["Rapid Assault", "Swarm"],
    "Heavy Weapon": ["Spotter", "High Ground"],
    "Overwatch": ["Suppressive Fire", "First Strike"],
    "Resilient": ["Terminator Armour", "Living Metal"],
    "Terrifying": ["Fearless", "Leadership"],
    "Let the Galaxy Burn": ["Chaos", "Daemon", "Warp"],
    "Contagions of Nurgle": ["Plague", "Decay", "Poison"]
};

const DAMAGE_TYPE_SYNERGIES = {
    "Psychic": { "Psychic": 0.25, "Direct": 0.20, "Piercing": 0.15 },
    "Piercing": { "Psychic": 0.15, "Piercing": 0.20, "Power": 0.10 },
    "Power": { "Power": 0.15, "Flame": 0.15, "Poison": 0.15 },
    "Flame": { "Poison": 0.20, "Power": 0.15, "Direct": 0.10 },
    "Poison": { "Flame": 0.20, "Direct": 0.15, "Power": 0.10 },
    "Direct": { "Psychic": 0.20, "Power": 0.15, "Piercing": 0.10 }
};

// Parse attack string into components
function parseAttack(attackString) {
    if (!attackString) return { hits: 1, pierce: 40, type: 'Power' };
    
    let hits = 1;
    let pierce = 40;
    let type = 'Power';
    
    // Extract hits
    const hitsMatch = attackString.match(/(\d+)\s*hits?/i);
    if (hitsMatch) hits = parseInt(hitsMatch[1]);
    
    // Determine pierce and type
    const lowerAttack = attackString.toLowerCase();
    
    if (lowerAttack.includes('psychic')) {
        pierce = 100;
        type = 'Psychic';
    } else if (lowerAttack.includes('piercing')) {
        pierce = 80;
        type = 'Piercing';
    } else if (lowerAttack.includes('melta')) {
        pierce = 90;
        type = 'Direct';
    } else if (lowerAttack.includes('plasma')) {
        pierce = 70;
        type = 'Direct';
    } else if (lowerAttack.includes('flame') || lowerAttack.includes('burn')) {
        pierce = 50;
        type = 'Flame';
    } else if (lowerAttack.includes('poison') || lowerAttack.includes('venom')) {
        pierce = 60;
        type = 'Poison';
    } else if (lowerAttack.includes('bolter') || lowerAttack.includes('projectile')) {
        pierce = 30;
        type = 'Power';
    }
    
    return { hits, pierce, type };
}

// Normalize character data
function normalizeCharacter(char) {
    return {
        name: char.name,
        baseStats: {
            health: parseInt(char.baseStats?.health || 100),
            armour: parseInt(char.baseStats?.armour || 20),
            damage: parseInt(char.baseStats?.damage || 10)
        },
        rarity: char.rarity || 'Common',
        traits: char.traits ? char.traits.split(',').map(t => t.trim()).filter(t => t) : [],
        attacks: {
            melee: parseAttack(char.attacks?.melee || ''),
            ranged: parseAttack(char.attacks?.ranged || '')
        },
        passiveAbility: char.passiveAbility || null,
        activeAbility: char.activeAbility || null,
        faction: char.faction || 'Unknown',
        movement: parseInt(char.movement || 3)
    };
}

// Detect character role
function detectRole(character) {
    let role = [];
    let { health, armour, damage } = character.baseStats;
    let multiplier = RARITY_MULTIPLIERS[character.rarity] || 1;
    
    let effectiveHp = health * Math.sqrt(multiplier);
    let effectiveDmg = damage * multiplier;
    let effectiveArm = armour * Math.sqrt(multiplier);
    
    // DPS Role
    if (effectiveDmg > 200 && effectiveArm < 30) {
        role.push("DPS");
    }
    
    // Tank Role
    if (effectiveHp > 150 && effectiveArm > 25) {
        role.push("TANK");
    }
    
    // Healer Role
    if (character.passiveAbility?.description?.toLowerCase().includes("heal") ||
        character.activeAbility?.description?.toLowerCase().includes("heal")) {
        role.push("HEALER");
    }
    
    // Buffer Role
    if (character.passiveAbility?.description?.toLowerCase().includes("friendly") ||
        character.passiveAbility?.description?.toLowerCase().includes("aura") ||
        character.passiveAbility?.description?.toLowerCase().includes("bonus")) {
        role.push("BUFFER");
    }
    
    // Summoner Role
    if (character.traits.some(t => t.toLowerCase().includes("summon"))) {
        role.push("SUMMONER");
    }
    
    // Controller Role
    if (character.traits.some(t => t.toLowerCase().includes("terrifying")) ||
        character.activeAbility?.description?.toLowerCase().includes("stun") ||
        character.activeAbility?.description?.toLowerCase().includes("control")) {
        role.push("CONTROLLER");
    }
    
    return role.length > 0 ? role : ["GENERAL"];
}

// Extract faction from description
function extractFaction(character) {
    if (character.faction && character.faction !== "N/A" && character.faction !== "Unknown") {
        return character.faction;
    }
    
    const description = (character.passiveAbility?.description || "") +
                       (character.activeAbility?.description || "") +
                       (character.description || "");
    
    const FACTION_KEYWORDS = {
        "Ultramarines": ["ultramarine", "space marine", "smurf", "macragge"],
        "Death Guard": ["death guard", "nurgle", "plague", "contagion"],
        "Chaos": ["chaos", "daemon", "abaddon", "traitor", "warp"],
        "Necrons": ["necron", "living metal", "dynasty", "tomb"],
        "Tyranids": ["tyranid", "swarm", "hive", "tyrannid"],
        "Orks": ["ork", "greenskin", "waagh", "warboss"],
        "Aeldari": ["aeldari", "eldar", "craftworld", "asuryani"],
        "Drukhari": ["drukhari", "dark eldar", "commorragh", "kabal"],
        "AdMech": ["adeptus mechanicus", "tech-priest", "forge", "cog"],
        "Sisters": ["sisters of battle", "adepta sororitas", "sanctuary", "hospitaler"],
        "Grey Knights": ["grey knight", "daemonhunter", "greyknight", "ordo malleus"],
        "Blood Angels": ["blood angel", "sanguinius", "baal", "blood"],
        "Space Wolves": ["space wolf", "fenris", "wolf", "ragnar"]
    };
    
    const lowerDesc = description.toLowerCase();
    for (let faction in FACTION_KEYWORDS) {
        if (FACTION_KEYWORDS[faction].some(keyword => lowerDesc.includes(keyword))) {
            return faction;
        }
    }
    
    return "Unknown";
}

// Find Pierce Counters
function findPierceCounters(attacker, allCharacters) {
    let counters = [];
    let attackerNorm = normalizeCharacter(attacker);
    
    // LOW pierce counters
    if (attackerNorm.attacks.melee.pierce <= 20 || 
        attackerNorm.attacks.ranged.pierce <= 20) {
        
        allCharacters.forEach(defender => {
            if (defender.name !== attacker.name) {
                let defenderNorm = normalizeCharacter(defender);
                
                if (defenderNorm.baseStats.armour >= 30) {
                    if (defenderNorm.traits.includes("Terminator Armour") || 
                        defenderNorm.traits.includes("Resilient")) {
                        counters.push({
                            name: defender.name,
                            reason: "Low Pierce + High Armor + Heavy Defence = неэффективно",
                            difficulty: "VERY_HARD",
                            score: 0.15,
                            explanation: `Low Pierce (${attackerNorm.attacks.melee.pierce}%) не пробивает тяжелую броню!`,
                            sources: ["Pierce Counter"]
                        });
                    }
                }
            }
        });
    }
    
    // HIGH pierce counters
    if (attackerNorm.attacks.melee.pierce >= 80 || 
        attackerNorm.attacks.ranged.pierce >= 80) {
        
        allCharacters.forEach(defender => {
            if (defender.name !== attacker.name) {
                let defenderNorm = normalizeCharacter(defender);
                
                if (defenderNorm.traits.includes("Resilient") || 
                    defenderNorm.traits.includes("Living Metal")) {
                    counters.push({
                        name: defender.name,
                        reason: "High Pierce игнорирует броню, но Resilient/Living Metal уменьшает урон",
                        difficulty: "MEDIUM",
                        score: 0.75,
                        explanation: `High Pierce проходит, но защитные трейты -25% урона!`,
                        sources: ["Pierce Counter"]
                    });
                }
            }
        });
    }
    
    // MEDIUM pierce counters
    if (attackerNorm.attacks.melee.pierce >= 40 && attackerNorm.attacks.melee.pierce <= 60) {
        allCharacters.forEach(defender => {
            if (defender.name !== attacker.name) {
                let defenderNorm = normalizeCharacter(defender);
                
                if (defenderNorm.baseStats.armour >= 35 && 
                    defenderNorm.traits.includes("Terminator Armour")) {
                    counters.push({
                        name: defender.name,
                        reason: "Medium pierce против Heavy Armor = сниженная эффективность",
                        difficulty: "HARD",
                        score: 0.45,
                        explanation: `Medium Pierce (${attackerNorm.attacks.melee.pierce}%) частично блокируется тяжелой броней!`,
                        sources: ["Pierce Counter"]
                    });
                }
            }
        });
    }
    
    return counters;
}

// Find Trait Counters
function findTraitCounters(attacker, allCharacters) {
    let counters = [];
    let attackerNorm = normalizeCharacter(attacker);
    
    // HARD COUNTERS
    attackerNorm.traits.forEach(trait => {
        if (TRAIT_HARD_COUNTERS[trait]) {
            TRAIT_HARD_COUNTERS[trait].forEach(counterTrait => {
                allCharacters.forEach(defender => {
                    if (defender.name !== attacker.name) {
                        let defenderNorm = normalizeCharacter(defender);
                        
                        if (defenderNorm.traits.some(t => t.toLowerCase().includes(counterTrait.toLowerCase()))) {
                            counters.push({
                                name: defender.name,
                                reason: `${counterTrait} прямо контрит ${trait}`,
                                difficulty: "HARD",
                                score: 0.30,
                                traits: { attacking: trait, defending: counterTrait },
                                sources: ["Trait Counter"]
                            });
                        }
                    }
                });
            });
        }
    });
    
    // SOFT COUNTERS
    attackerNorm.traits.forEach(trait => {
        if (TRAIT_SOFT_COUNTERS[trait]) {
            TRAIT_SOFT_COUNTERS[trait].forEach(counterTrait => {
                allCharacters.forEach(defender => {
                    if (defender.name !== attacker.name) {
                        let defenderNorm = normalizeCharacter(defender);
                        
                        if (defenderNorm.traits.some(t => t.toLowerCase().includes(counterTrait.toLowerCase()))) {
                            counters.push({
                                name: defender.name,
                                reason: `${counterTrait} уменьшает эффект ${trait}`,
                                difficulty: "MEDIUM",
                                score: 0.60,
                                traits: { attacking: trait, defending: counterTrait },
                                sources: ["Trait Counter"]
                            });
                        }
                    }
                });
            });
        }
    });
    
    return counters;
}

// Find Role Counters
function findRoleCounters(attacker, allCharacters) {
    let counters = [];
    let attackerNorm = normalizeCharacter(attacker);
    let attackerRole = detectRole(attackerNorm);
    
    const ROLE_COUNTERS = {
        "DPS": ["TANK", "BUFFER"],
        "TANK": ["HIGH_PIERCE", "PSYKER"],
        "HEALER": ["BURST_DPS", "ASSASSIN"],
        "BUFFER": ["SILENCER", "ISOLATION"],
        "SUMMONER": ["AOE", "SUPPRESSION"],
        "CONTROLLER": ["UNSTOPPABLE", "IMMUNITY"]
    };
    
    attackerRole.forEach(role => {
        if (ROLE_COUNTERS[role]) {
            let counterTypes = ROLE_COUNTERS[role];
            
            allCharacters.forEach(defender => {
                if (defender.name !== attacker.name) {
                    let defenderNorm = normalizeCharacter(defender);
                    let defenderRole = detectRole(defenderNorm);
                    
                    // Check for role counters
                    if (counterTypes.some(ct => {
                        if (ct === "HIGH_PIERCE") {
                            return defenderNorm.attacks.melee.pierce >= 80;
                        } else if (ct === "PSYKER") {
                            return defenderNorm.traits.some(t => t.toLowerCase().includes("psyker"));
                        } else if (ct === "BURST_DPS") {
                            return defenderRole.includes("DPS") && defenderNorm.attacks.melee.hits >= 3;
                        } else if (ct === "AOE") {
                            return defenderNorm.traits.some(t => t.toLowerCase().includes("summon")) ||
                                   defenderRole.includes("CONTROLLER");
                        } else {
                            return defenderRole.includes(ct);
                        }
                    })) {
                        counters.push({
                            name: defender.name,
                            reason: `${defenderRole.join("/")} контрит ${role}`,
                            difficulty: "HARD",
                            score: 0.40,
                            roles: { attacking: role, defending: defenderRole },
                            sources: ["Role Counter"]
                        });
                    }
                }
            });
        }
    });
    
    return counters;
}

// Simulate matchups
function simulateMatchup(attacker, defender) {
    let attackerNorm = normalizeCharacter(attacker);
    let defenderNorm = normalizeCharacter(defender);
    
    // Calculate damage
    let attackerDamage = calculateDamage(attackerNorm, defenderNorm);
    let defenderDamage = calculateDamage(defenderNorm, attackerNorm);
    
    // Apply trait modifiers
    attackerDamage = applyTraitModifiers(attackerDamage, attackerNorm, defenderNorm);
    defenderDamage = applyTraitModifiers(defenderDamage, defenderNorm, attackerNorm);
    
    // Turns to kill
    let attackerMult = RARITY_MULTIPLIERS[attackerNorm.rarity] || 1;
    let defenderMult = RARITY_MULTIPLIERS[defenderNorm.rarity] || 1;
    
    let effectiveAttackerHp = attackerNorm.baseStats.health * attackerMult;
    let effectiveDefenderHp = defenderNorm.baseStats.health * defenderMult;
    
    // Apply defensive traits
    if (defenderNorm.traits.includes("Resilient")) {
        effectiveDefenderHp *= 1.25; // 25% effective HP increase
    }
    if (attackerNorm.traits.includes("Resilient")) {
        effectiveAttackerHp *= 1.25;
    }
    
    let ttkAttacker = Math.ceil(effectiveDefenderHp / Math.max(1, attackerDamage));
    let ttkDefender = Math.ceil(effectiveAttackerHp / Math.max(1, defenderDamage));
    
    // Win probability calculation
    let winProbability;
    if (ttkAttacker < ttkDefender) {
        winProbability = 0.7 + (0.2 * (ttkDefender - ttkAttacker) / Math.max(1, ttkDefender));
    } else if (ttkAttacker === ttkDefender) {
        winProbability = 0.5;
    } else {
        winProbability = 0.3 * (ttkDefender / Math.max(1, ttkAttacker));
    }
    
    return {
        attackerDamage,
        defenderDamage,
        ttkAttacker,
        ttkDefender,
        winProbability,
        isCounter: winProbability < 0.35
    };
}

// Calculate damage
function calculateDamage(attacker, defender) {
    let damage = attacker.baseStats.damage;
    let mult = RARITY_MULTIPLIERS[attacker.rarity] || 1;
    let damVar = damage * mult;
    
    let variant1 = Math.max(0, damVar - defender.baseStats.armour);
    let variant2 = damVar * (attacker.attacks.melee.pierce / 100);
    let damageAfterArmor = Math.max(variant1, variant2);
    
    return damageAfterArmor * attacker.attacks.melee.hits;
}

// Apply trait modifiers
function applyTraitModifiers(damage, attacker, defender) {
    let modifiedDamage = damage;
    
    // Terrifying reduces defender effectiveness
    if (attacker.traits.includes("Terrifying") && !defender.traits.includes("Fearless")) {
        modifiedDamage *= 1.15; // 15% damage boost
    }
    
    // Rapid Assault increases damage
    if (attacker.traits.includes("Rapid Assault")) {
        modifiedDamage *= 1.10; // 10% damage boost
    }
    
    // Resilient reduces incoming damage
    if (defender.traits.includes("Resilient")) {
        modifiedDamage *= 0.80; // 20% damage reduction
    }
    
    // Terminator Armour provides additional protection
    if (defender.traits.includes("Terminator Armour")) {
        modifiedDamage *= 0.85; // 15% damage reduction
    }
    
    return modifiedDamage;
}

// Find counters via simulation
function simulateMatchups(attacker, allCharacters) {
    let counters = [];
    
    allCharacters.forEach(defender => {
        if (defender.name !== attacker.name) {
            let sim = simulateMatchup(attacker, defender);
            
            if (sim.isCounter) {
                counters.push({
                    name: defender.name,
                    reason: `Симуляция: ${sim.ttkAttacker} ходов для убийства vs ${sim.ttkDefender} ходов для смерти`,
                    difficulty: sim.winProbability < 0.15 ? "VERY_HARD" : "HARD",
                    score: sim.winProbability,
                    simulation: sim,
                    sources: ["Simulation"]
                });
            }
        }
    });
    
    return counters;
}

// Rank counters
function rankCounters(countersList) {
    let uniqueCounters = {};
    countersList.forEach(counter => {
        if (!uniqueCounters[counter.name]) {
            uniqueCounters[counter.name] = { ...counter, matches: 1 };
        } else {
            uniqueCounters[counter.name].matches++;
            uniqueCounters[counter.name].score = 
                (uniqueCounters[counter.name].score + counter.score) / 2;
            uniqueCounters[counter.name].sources = [
                ...new Set([...uniqueCounters[counter.name].sources, ...counter.sources])
            ];
        }
    });
    
    let ranked = Object.values(uniqueCounters)
        .sort((a, b) => a.score - b.score)
        .slice(0, 5);
    
    ranked.forEach(counter => {
        if (counter.score < 0.2) counter.difficulty = "EXTREME";
        else if (counter.score < 0.35) counter.difficulty = "VERY_HARD";
        else if (counter.score < 0.5) counter.difficulty = "HARD";
        else if (counter.score < 0.65) counter.difficulty = "MEDIUM";
        else counter.difficulty = "EASY";
    });
    
    return ranked;
}

// Find Faction Synergies
function findFactionSynergies(character, allCharacters) {
    let synergies = [];
    let charNorm = normalizeCharacter(character);
    let faction = extractFaction(charNorm);
    
    if (faction === "Unknown") {
        return synergies;
    }
    
    allCharacters.forEach(partner => {
        if (partner.name !== character.name) {
            let partnerNorm = normalizeCharacter(partner);
            let partnerFaction = extractFaction(partnerNorm);
            
            if (partnerFaction === faction) {
                let factionBonus = 0;
                
                // Check for faction-based abilities
                if (charNorm.passiveAbility?.description?.toLowerCase().includes("friendly") ||
                    charNorm.passiveAbility?.description?.toLowerCase().includes(faction.toLowerCase())) {
                    factionBonus = 0.20;
                } else if (charNorm.activeAbility?.description?.toLowerCase().includes(faction.toLowerCase())) {
                    factionBonus = 0.15;
                } else {
                    factionBonus = 0.10; // Basic faction bonus
                }
                
                synergies.push({
                    name: partner.name,
                    reason: `Одна фракция: ${faction}`,
                    type: "FACTION",
                    bonus: factionBonus,
                    score: 0.5 + factionBonus,
                    rating: Math.ceil((0.5 + factionBonus) * 5),
                    sources: ["Faction Synergy"]
                });
            }
        }
    });
    
    return synergies;
}

// Find Trait Synergies
function findTraitSynergies(character, allCharacters) {
    let synergies = [];
    let charNorm = normalizeCharacter(character);
    
    charNorm.traits.forEach(trait => {
        if (SYNERGISTIC_TRAIT_PAIRS[trait]) {
            let synergisticTraits = SYNERGISTIC_TRAIT_PAIRS[trait];
            
            allCharacters.forEach(partner => {
                if (partner.name !== character.name) {
                    let partnerNorm = normalizeCharacter(partner);
                    let matching = partnerNorm.traits.filter(t => 
                        synergisticTraits.some(st => t.toLowerCase().includes(st.toLowerCase()))
                    );
                    
                    if (matching.length > 0) {
                        synergies.push({
                            name: partner.name,
                            reason: `${trait} синергизирует с ${matching.join(", ")}`,
                            type: "TRAIT",
                            bonus: matching.length * 0.15,
                            score: 0.6 + (matching.length * 0.15),
                            rating: Math.ceil((0.6 + matching.length * 0.15) * 5),
                            traits: { myTrait: trait, partnerTraits: matching },
                            sources: ["Trait Synergy"]
                        });
                    }
                }
            });
        }
    });
    
    return synergies;
}

// Find Role Synergies
function findRoleSynergies(character, allCharacters) {
    let synergies = [];
    let charNorm = normalizeCharacter(character);
    let charRole = detectRole(charNorm);
    
    const GOOD_TEAM_COMPOSITIONS = [
        { 
            name: "Classic Team", 
            roles: ["TANK", "HEALER", "DPS"], 
            synergy: 0.8,
            description: "Tank absorbs damage, Healer supports, DPS kills enemies"
        },
        { 
            name: "Buffer Team", 
            roles: ["BUFFER", "DPS", "DPS"], 
            synergy: 0.75,
            description: "Buffer enhances damage dealers for maximum output"
        },
        { 
            name: "Control Team", 
            roles: ["CONTROLLER", "SUMMONER", "DPS"], 
            synergy: 0.70,
            description: "Control enemies, summon units, finish with DPS"
        },
        { 
            name: "Chaos Team", 
            roles: ["PSYKER", "TANK", "DPS"], 
            synergy: 0.65,
            description: "Psychic power, tanky front, damage backline"
        }
    ];
    
    GOOD_TEAM_COMPOSITIONS.forEach(comp => {
        comp.roles.forEach(neededRole => {
            allCharacters.forEach(partner => {
                if (partner.name !== character.name) {
                    let partnerNorm = normalizeCharacter(partner);
                    let partnerRole = detectRole(partnerNorm);
                    
                    if (partnerRole.includes(neededRole)) {
                        synergies.push({
                            name: partner.name,
                            reason: `${neededRole} для команды "${comp.name}"`,
                            type: "ROLE",
                            composition: comp.name,
                            bonus: comp.synergy * 0.1,
                            score: 0.4 + comp.synergy * 0.1,
                            rating: Math.ceil(comp.synergy * 5),
                            roles: { myRole: charRole, partnerRole: partnerRole },
                            sources: ["Role Synergy"]
                        });
                    }
                }
            });
        });
    });
    
    return synergies;
}

// Find Damage Type Synergies
function findDamageTypeSynergies(character, allCharacters) {
    let synergies = [];
    let charNorm = normalizeCharacter(character);
    let myDamageType = charNorm.attacks.melee.type;
    
    if (DAMAGE_TYPE_SYNERGIES[myDamageType]) {
        allCharacters.forEach(partner => {
            if (partner.name !== character.name) {
                let partnerNorm = normalizeCharacter(partner);
                let partnerDamageType = partnerNorm.attacks.melee.type;
                
                if (DAMAGE_TYPE_SYNERGIES[myDamageType][partnerDamageType]) {
                    let bonus = DAMAGE_TYPE_SYNERGIES[myDamageType][partnerDamageType];
                    
                    synergies.push({
                        name: partner.name,
                        reason: `${myDamageType} + ${partnerDamageType} синергия урона`,
                        type: "DAMAGE_TYPE",
                        bonus: bonus,
                        score: 0.5 + bonus,
                        rating: Math.ceil((0.5 + bonus) * 5),
                        damageTypes: { mine: myDamageType, theirs: partnerDamageType },
                        sources: ["Damage Type Synergy"]
                    });
                }
            }
        });
    }
    
    return synergies;
}

// Find Ability Synergies
function findAbilitySynergies(character, allCharacters) {
    let synergies = [];
    let charNorm = normalizeCharacter(character);
    
    // Passive Aura synergies
    if (charNorm.passiveAbility?.description?.toLowerCase().includes("friendly") ||
        charNorm.passiveAbility?.description?.toLowerCase().includes("aura") ||
        charNorm.passiveAbility?.description?.toLowerCase().includes("nearby")) {
        
        allCharacters.forEach(partner => {
            if (partner.name !== character.name) {
                synergies.push({
                    name: partner.name,
                    reason: `Пассивная аура: ${charNorm.passiveAbility.name} усиливает союзников`,
                    type: "ABILITY",
                    bonus: 0.20,
                    score: 0.7,
                    rating: 4,
                    abilityName: charNorm.passiveAbility.name,
                    sources: ["Ability Synergy"]
                });
            }
        });
    }
    
    // Active ability synergies
    if (charNorm.activeAbility?.description?.toLowerCase().includes("buff") ||
        charNorm.activeAbility?.description?.toLowerCase().includes("heal")) {
        
        allCharacters.forEach(partner => {
            if (partner.name !== character.name) {
                synergies.push({
                    name: partner.name,
                    reason: `Активная способность: ${charNorm.activeAbility.name} помогает союзникам`,
                    type: "ABILITY",
                    bonus: 0.15,
                    score: 0.65,
                    rating: 3,
                    abilityName: charNorm.activeAbility.name,
                    sources: ["Ability Synergy"]
                });
            }
        });
    }
    
    return synergies;
}

// Rank synergies
function rankSynergies(synergiesList) {
    let uniqueSynergies = {};
    synergiesList.forEach(syn => {
        if (!uniqueSynergies[syn.name]) {
            uniqueSynergies[syn.name] = { ...syn, matches: 1 };
        } else {
            uniqueSynergies[syn.name].matches++;
            uniqueSynergies[syn.name].score = 
                (uniqueSynergies[syn.name].score + syn.score) / 2;
            uniqueSynergies[syn.name].sources = [
                ...new Set([...uniqueSynergies[syn.name].sources, ...syn.sources])
            ];
        }
    });
    
    let ranked = Object.values(uniqueSynergies)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    
    ranked.forEach(syn => {
        syn.stars = Math.min(5, Math.ceil(syn.score * 5));
    });
    
    return ranked;
}

// Generate warnings for character
function generateWarnings(character) {
    let warnings = [];
    let charNorm = normalizeCharacter(character);
    let role = detectRole(charNorm);
    
    // Low health warning
    if (charNorm.baseStats.health < 80) {
        warnings.push("Низкое здоровье - персонаж уязвим к быстрому уничтожению");
    }
    
    // Low armor warning
    if (charNorm.baseStats.armour < 20) {
        warnings.push("Низкая броня - получает много урона");
    }
    
    // Low damage warning
    if (charNorm.baseStats.damage < 10) {
        warnings.push("Низкий урон - медленно уничтожает врагов");
    }
    
    // No traits warning
    if (charNorm.traits.length === 0) {
        warnings.push("Нет трейтов - отсутствуют уникальные способности");
    }
    
    // Trait conflicts
    if (charNorm.traits.includes("Flying") && charNorm.traits.includes("Terminator Armour")) {
        warnings.push("Конфликт трейтов: Flying + Terminator Armour снижает мобильность");
    }
    
    // Role mismatch
    if (role.includes("TANK") && charNorm.baseStats.health < 120) {
        warnings.push("Роль TANK но низкое здоровье - неэффективный танк");
    }
    
    if (role.includes("DPS") && charNorm.baseStats.damage < 12) {
        warnings.push("Роль DPS но низкий урон - неэффективный damage dealer");
    }
    
    return warnings;
}

// Main analysis function
function analyzeCharacter(characterName, allCharacters) {
    let character = allCharacters.find(c => c.name === characterName);
    if (!character) return null;
    
    let counters = rankCounters([
        ...findPierceCounters(character, allCharacters),
        ...findTraitCounters(character, allCharacters),
        ...findRoleCounters(character, allCharacters),
        ...simulateMatchups(character, allCharacters)
    ]);
    
    let synergies = rankSynergies([
        ...findFactionSynergies(character, allCharacters),
        ...findTraitSynergies(character, allCharacters),
        ...findRoleSynergies(character, allCharacters),
        ...findDamageTypeSynergies(character, allCharacters),
        ...findAbilitySynergies(character, allCharacters)
    ]);
    
    let charNorm = normalizeCharacter(character);
    let role = detectRole(charNorm);
    let faction = extractFaction(charNorm);
    
    return {
        name: character.name,
        character: charNorm,
        role: role,
        faction: faction,
        counters: counters,
        synergies: synergies,
        warnings: generateWarnings(character),
        analysis: {
            totalCounterScore: counters.reduce((sum, c) => sum + c.score, 0) / Math.max(1, counters.length),
            totalSynergyScore: synergies.reduce((sum, s) => sum + s.score, 0) / Math.max(1, synergies.length),
            powerLevel: calculatePowerLevel(charNorm),
            versatility: calculateVersatility(charNorm, role)
        }
    };
}

// Calculate character power level
function calculatePowerLevel(character) {
    let { health, armour, damage } = character.baseStats;
    let mult = RARITY_MULTIPLIERS[character.rarity] || 1;
    
    let effectiveHp = health * Math.sqrt(mult);
    let effectiveDmg = damage * mult;
    let effectiveArm = armour * Math.sqrt(mult);
    
    let powerScore = (effectiveHp * 0.4) + (effectiveDmg * 0.4) + (effectiveArm * 0.2);
    
    // Trait bonuses
    powerScore += character.traits.length * 5;
    
    // Ability bonuses
    if (character.passiveAbility) powerScore += 10;
    if (character.activeAbility) powerScore += 10;
    
    return Math.round(powerScore);
}

// Calculate character versatility
function calculateVersatility(character, role) {
    let versatility = 0;
    
    // Multiple roles
    versatility += role.length * 20;
    
    // Multiple damage types
    if (character.attacks.melee.type !== character.attacks.ranged.type) {
        versatility += 15;
    }
    
    // Trait diversity
    let traitTypes = new Set();
    character.traits.forEach(trait => {
        if (trait.toLowerCase().includes("flying")) traitTypes.add("mobility");
        if (trait.toLowerCase().includes("psyker")) traitTypes.add("psychic");
        if (trait.toLowerCase().includes("resilient")) traitTypes.add("defense");
        if (trait.toLowerCase().includes("summon")) traitTypes.add("support");
    });
    versatility += traitTypes.size * 10;
    
    return Math.min(100, versatility);
}

// Generate complete analysis
function generateCompleteAnalysis() {
    console.log("Loading character data...");
    const allCharacters = loadData();
    
    if (allCharacters.length === 0) {
        console.error("No characters loaded!");
        return;
    }
    
    console.log(`Loaded ${allCharacters.length} characters`);
    console.log("Starting analysis...");
    
    const results = {};
    let processed = 0;
    
    for (let character of allCharacters) {
        try {
            const analysis = analyzeCharacter(character.name, allCharacters);
            if (analysis) {
                results[character.name] = analysis;
                processed++;
                
                if (processed % 10 === 0) {
                    console.log(`Processed ${processed}/${allCharacters.length} characters...`);
                }
            }
        } catch (error) {
            console.error(`Error analyzing ${character.name}:`, error);
        }
    }
    
    console.log(`Analysis complete! Processed ${processed} characters`);
    
    // Save results
    const outputData = {
        metadata: {
            generated: new Date().toISOString(),
            version: "1.0",
            totalCharacters: processed,
            description: "WH40K Tacticus - Complete Counter & Synergy Analysis"
        },
        characters: results
    };
    
    fs.writeFileSync('wh40k_complete_analysis.json', JSON.stringify(outputData, null, 2));
    console.log("Results saved to wh40k_complete_analysis.json");
    
    // Generate summary statistics
    generateSummaryStatistics(results);
    
    return outputData;
}

// Generate summary statistics
function generateSummaryStatistics(results) {
    const stats = {
        totalCharacters: Object.keys(results).length,
        averagePowerLevel: 0,
        mostCountered: [],
        leastCountered: [],
        bestSynergies: [],
        factionDistribution: {},
        roleDistribution: {}
    };
    
    const characterNames = Object.keys(results);
    let totalPower = 0;
    let counterCounts = [];
    let synergyScores = [];
    
    characterNames.forEach(name => {
        const analysis = results[name];
        
        // Power level
        totalPower += analysis.analysis.powerLevel;
        
        // Counter count
        counterCounts.push({ name, count: analysis.counters.length });
        
        // Synergy score
        const avgSynergyScore = analysis.synergies.length > 0 ? 
            analysis.synergies.reduce((sum, s) => sum + s.score, 0) / analysis.synergies.length : 0;
        synergyScores.push({ name, score: avgSynergyScore });
        
        // Faction distribution
        const faction = analysis.faction;
        stats.factionDistribution[faction] = (stats.factionDistribution[faction] || 0) + 1;
        
        // Role distribution
        analysis.role.forEach(role => {
            stats.roleDistribution[role] = (stats.roleDistribution[role] || 0) + 1;
        });
    });
    
    stats.averagePowerLevel = Math.round(totalPower / stats.totalCharacters);
    stats.mostCountered = counterCounts.sort((a, b) => b.count - a.count).slice(0, 5);
    stats.leastCountered = counterCounts.sort((a, b) => a.count - b.count).slice(0, 5);
    stats.bestSynergies = synergyScores.sort((a, b) => b.score - a.score).slice(0, 5);
    
    fs.writeFileSync('wh40k_analysis_summary.json', JSON.stringify(stats, null, 2));
    console.log("Summary statistics saved to wh40k_analysis_summary.json");
    
    return stats;
}

// Run the analysis
if (require.main === module) {
    generateCompleteAnalysis();
}

module.exports = {
    analyzeCharacter,
    generateCompleteAnalysis,
    findPierceCounters,
    findTraitCounters,
    findRoleCounters,
    simulateMatchups,
    findFactionSynergies,
    findTraitSynergies,
    findRoleSynergies,
    findDamageTypeSynergies,
    findAbilitySynergies
};