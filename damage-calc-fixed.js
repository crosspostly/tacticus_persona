// УПРОЩЁННАЯ ФОРМУЛА РАСЧЁТА ЭФФЕКТИВНОСТИ
// Соответствует официальной механике Warhammer 40K: Tacticus

function calculateMatchup(attacker, defender) {
    // Получаем тип атаки и количество хитов
    const [rangedType, rangedHits] = extractAttackInfo(attacker.ranged);
    const [meleeType, meleeHits] = extractAttackInfo(attacker.melee);
    
    // Приоритет ranged атакам, если есть
    const [atkType, atkHits] = (rangedType && rangedHits > 0) 
        ? [rangedType, rangedHits] 
        : [meleeType, meleeHits];
    
    const pierce = PIERCE_RATIOS[atkType] || 20;
    
    // Парсим traits
    const atkTraits = attacker.traits ? attacker.traits.split(', ') : [];
    const defTraits = defender.traits ? defender.traits.split(', ') : [];
    
    let dmg = attacker.dmg;
    let armor = defender.armor;
    
    // === МОДИФИКАТОРЫ УРОНА ===
    if (atkTraits.includes('Crushing Strike')) dmg *= 1.25;
    
    // === МОДИФИКАТОРЫ БРОНИ ===
    if (defTraits.includes('Terminator Armour')) armor *= 1.4;
    if (defTraits.includes('Mk X Gravis')) armor *= 1.5;
    
    // === МОДИФИКАТОРЫ ВХОДЯЩЕГО УРОНА ===
    let incomingMult = 1.0;
    if (defTraits.includes('Resilient')) incomingMult = 0.8;
    if (defTraits.includes('Big Target')) incomingMult = 1.3;
    
    // === ОСНОВНАЯ ФОРМУЛА ===
    // Damage Dealt = MAX(Damage - Armor, Damage × Pierce%)
    const dmgAfterArmor = Math.max(1, dmg - armor);
    const dmgPierce = Math.max(1, dmg * (pierce / 100));
    const dmgPerHit = Math.max(dmgAfterArmor, dmgPierce);
    
    // Общий урон за ход
    const totalDmg = dmgPerHit * atkHits * incomingMult;
    
    // === ЭФФЕКТИВНОСТЬ АТАКИ ===
    // Сколько % HP защитника снимаем за один ход
    const attackEff = Math.min(100, (totalDmg / defender.hp) * 100);
    
    // === ЭФФЕКТИВНОСТЬ ЗАЩИТЫ ===
    // Упрощённая оценка: отношение брони к урону
    const armorRatio = armor / dmg;
    const defenseEff = Math.min(100, Math.max(0, armorRatio * 50 + 25));
    
    // === СРЕДНЯЯ ЭФФЕКТИВНОСТЬ ===
    const average = (attackEff + defenseEff) / 2;
    
    return {
        attack: Math.round(attackEff * 10) / 10,
        defense: Math.round(defenseEff * 10) / 10,
        average: Math.round(average * 10) / 10
    };
}

// Как применить:
// 1. Откройте index.html
// 2. Найдите старую функцию calculateMatchup
// 3. Замените её на эту версию
// 4. Сохраните и обновите страницу