// Тестовый скрипт для проверки исправлений
const PIERCE_RATIOS = {
    'Physical': 0,
    'Power': 40,
    'Piercing': 100,
    'Rending': 80,
    'Lethal': 100,
    'Bolter': 20,
    'Flamer': 20,
    'Melta': 60,
    'Plasma': 40,
    'Grav': 30,
    'Lascannon': 100,
    'Missile': 20,
    'Sniper': 60,
    'Artillery': 30
};

function extractAttackInfo(attackStr) {
    if (!attackStr || attackStr === 'N/A') return [null, 0];
    const parts = attackStr.split('/').map(p => p.trim());
    const damageType = parts[0] || 'Physical';
    let hits = 1;
    for (const part of parts) {
        if (part.toLowerCase().includes('hit')) {
            const match = part.match(/\d+/);
            if (match) hits = parseInt(match[0]);
        }
    }
    return [damageType, hits];
}

function calculateDamage(attacker, defender) {
    const [rangedType, rangedHits] = extractAttackInfo(attacker.ranged);
    const [meleeType, meleeHits] = extractAttackInfo(attacker.melee);
    
    // Выбираем атаку с максимальным потенциальным уроном
    let atkType, atkHits;
    
    if (rangedType && rangedHits > 0 && meleeType && meleeHits > 0) {
        const rangedPierce = PIERCE_RATIOS[rangedType] || 20;
        const meleePierce = PIERCE_RATIOS[meleeType] || 20;
        
        const rangedPotentialDmg = attacker.dmg * Math.max(rangedPierce / 100, 0.1) * rangedHits;
        const meleePotentialDmg = attacker.dmg * Math.max(meleePierce / 100, 0.1) * meleeHits;
        
        console.log(`🔍 ${attacker.name} - Ranged: ${rangedType} ${rangedHits}hits (pierce ${rangedPierce}%) = ${rangedPotentialDmg.toFixed(1)}`);
        console.log(`🔍 ${attacker.name} - Melee: ${meleeType} ${meleeHits}hits (pierce ${meleePierce}%) = ${meleePotentialDmg.toFixed(1)}`);
        
        if (rangedPotentialDmg >= meleePotentialDmg) {
            [atkType, atkHits] = [rangedType, rangedHits];
            console.log(`✅ Выбрана Ranged атака`);
        } else {
            [atkType, atkHits] = [meleeType, meleeHits];
            console.log(`✅ Выбрана Melee атака`);
        }
    } else if (rangedType && rangedHits > 0) {
        [atkType, atkHits] = [rangedType, rangedHits];
        console.log(`✅ Только Ranged доступна`);
    } else {
        [atkType, atkHits] = [meleeType, meleeHits];
        console.log(`✅ Только Melee доступна`);
    }

    const pierce = PIERCE_RATIOS[atkType] || 20;
    
    let dmg = attacker.dmg;
    let armor = defender.armor;
    
    // Применяем трейты
    if (defender.traits.includes('Terminator Armour')) armor *= 1.4;
    if (defender.traits.includes('Resilient')) dmg *= 0.8;
    
    console.log(`⚔️ ${attacker.name} атакует ${defender.name}:`);
    console.log(`   Атака: ${atkType} ${atkHits}hits, Pierce ${pierce}%`);
    console.log(`   DMG: ${attacker.dmg}, Armor: ${defender.armor} → ${armor.toFixed(1)}`);
    
    // Официальная формула урона
    const dmgAfterArmor = Math.max(1, dmg - armor);
    const dmgPierce = Math.max(1, dmg * (pierce / 100));
    const dmgPerHit = Math.max(dmgAfterArmor, dmgPierce);
    
    const totalDmg = dmgPerHit * atkHits;
    const roundsToKill = defender.hp / totalDmg;
    
    console.log(`   Урон за ход: ${totalDmg.toFixed(1)} (${dmgPerHit.toFixed(1)} × ${atkHits})`);
    console.log(`   Раундов до убийства: ${roundsToKill.toFixed(1)}`);
    console.log('');
    
    return { dmgPerHit, totalDmg, roundsToKill, atkType, atkHits };
}

// Тестовые данные
const arjac = {
    name: 'Arjac',
    hp: 110,
    armor: 26,
    dmg: 19,  // Из таблицы Common Level 8
    ranged: 'N/A',
    melee: 'Power / 3 hits',
    traits: ['Terminator Armour', 'Resilient']
};

const abaddon = {
    name: 'Abaddon',
    hp: 162,  // Из таблицы Common Level 8
    armor: 25,
    dmg: 15,
    ranged: 'Bolter / 3 hits',
    melee: 'Power / 5 hits',
    traits: ['Terminator Armour', 'Resilient']
};

console.log('🧪 ТЕСТ РАСЧЕТА УРОНА');
console.log('========================');

console.log('📊 Arjac атакует Abaddon:');
const arjacVsAbaddon = calculateDamage(arjac, abaddon);

console.log('📊 Abaddon атакует Arjac:');
const abaddonVsArjac = calculateDamage(abaddon, arjac);

console.log('🎯 ИТОГИ:');
console.log(`Arjac убьет Abaddon за ${arjacVsAbaddon.roundsToKill.toFixed(1)} раундов`);
console.log(`Abaddon убьет Arjac за ${abaddonVsArjac.roundsToKill.toFixed(1)} раундов`);

if (arjacVsAbaddon.roundsToKill < abaddonVsArjac.roundsToKill) {
    console.log('✅ Arjac выигрывает!');
} else {
    console.log('✅ Abaddon выигрывает!');
}