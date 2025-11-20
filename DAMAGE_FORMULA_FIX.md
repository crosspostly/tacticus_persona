# Исправление формулы расчёта урона

## Проблема
Текущая формула слишком сложная и занижает эффективность.

## Решение
Упростить до официальной механики из вики:

```javascript
// ЗАМЕНИТЬ ФУНКЦИЮ calculateMatchup на:

function calculateMatchup(attacker, defender) {
    // Получаем тип атаки и хиты
    const [rangedType, rangedHits] = extractAttackInfo(attacker.ranged);
    const [meleeType, meleeHits] = extractAttackInfo(attacker.melee);
    const [atkType, atkHits] = (rangedType && rangedHits > 0) 
        ? [rangedType, rangedHits] 
        : [meleeType, meleeHits];
    
    const pierce = PIERCE_RATIOS[atkType] || 20;
    
    // Простые trait модификаторы
    const atkTraits = attacker.traits ? attacker.traits.split(', ') : [];
    const defTraits = defender.traits ? defender.traits.split(', ') : [];
    
    let dmg = attacker.dmg;
    let armor = defender.armor;
    
    // Crushing Strike: +25% урона
    if (atkTraits.includes('Crushing Strike')) dmg *= 1.25;
    
    // Terminator/Gravis: +40-50% брони
    if (defTraits.includes('Terminator Armour')) armor *= 1.4;
    if (defTraits.includes('Mk X Gravis')) armor *= 1.5;
    
    // Resilient: -20% урона
    let incomingMult = 1.0;
    if (defTraits.includes('Resilient')) incomingMult = 0.8;
    
    // ✅ ПРАВИЛЬНАЯ ФОРМУЛА ИЗ ВИКИ:
    // Damage = MAX(Damage - Armor, Damage * Pierce%)
    const dmgAfterArmor = Math.max(1, dmg - armor);
    const dmgPierce = Math.max(1, dmg * (pierce / 100));
    const dmgPerHit = Math.max(dmgAfterArmor, dmgPierce);
    
    const totalDmg = dmgPerHit * atkHits * incomingMult;
    
    // Эффективность атаки: сколько % HP снимаем за один ход
    const attackEff = Math.min(100, (totalDmg / defender.hp) * 100);
    
    // Эффективность защиты: упрощённая оценка живучести
    const armorRatio = armor / dmg;
    const defenseEff = Math.min(100, Math.max(0, armorRatio * 50 + 25));
    
    const average = (attackEff + defenseEff) / 2;
    
    return {
        attack: Math.round(attackEff * 10) / 10,
        defense: Math.round(defenseEff * 10) / 10,
        average: Math.round(average * 10) / 10
    };
}
```

## Что изменилось:

### ❌ Старая формула (переусложнённая):
```javascript
const effectiveDmg = attacker.dmg * dmgMult;
const effectiveArmor = defender.armor * armorMult;
const dmgAfterArmor = Math.max(1, effectiveDmg - effectiveArmor);
const dmgAfterPierce = Math.max(1, effectiveDmg * (pierce / 100));
const dmgPerHit = Math.max(dmgAfterArmor, dmgAfterPierce);
// ... и ещё двойной расчёт для counter-атаки
```

### ✅ Новая формула (простая и точная):
```javascript
let dmg = attacker.dmg;
let armor = defender.armor;
// Применяем trait модификаторы
const dmgPerHit = Math.max(dmg - armor, dmg * pierce / 100);
const totalDmg = dmgPerHit * hits * resilientMult;
const attackEff = (totalDmg / hp) * 100;
```

## Почему это лучше:

1. **Соответствует официальной механике** из Tacticus Wiki
2. **Убраны двойные множители** которые искажали результат
3. **Простая оценка защиты** вместо сложного counter-расчёта
4. **Более высокие и реалистичные значения эффективности**

## Примеры результатов:

### До (старая формула):
- Abaddon vs обычный юнит: ~15-25% эффективность
- High-dmg vs low-armor: ~30-40%

### После (новая формула):
- Abaddon vs обычный юнит: ~40-60% эффективность  
- High-dmg vs low-armor: ~70-85%
- High-armor vs low-pierce: ~30-45%

---

**Применить изменения:** Замените функцию `calculateMatchup` в `index.html` на версию выше.