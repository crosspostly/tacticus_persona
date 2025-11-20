#!/usr/bin/env python3
"""
Скрипт для применения упрощённой формулы расчёта урона
Использование: python apply_fix.py
"""

import re

# Новая упрощённая функция
NEW_FUNCTION = '''function calculateMatchup(attacker, defender) {
            // Получаем тип атаки и количество хитов
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
            
            // === МОДИФИКАТОРЫ УРОНА ===
            if (atkTraits.includes('Crushing Strike')) dmg *= 1.25;
            if (atkTraits.includes('Let the Galaxy Burn')) dmg *= 1.15;
            
            // === МОДИФИКАТОРЫ БРОНИ ===
            if (defTraits.includes('Terminator Armour')) armor *= 1.4;
            if (defTraits.includes('Mk X Gravis')) armor *= 1.5;
            
            // === МОДИФИКАТОРЫ ВХОДЯЩЕГО УРОНА ===
            let incomingMult = 1.0;
            if (defTraits.includes('Resilient')) incomingMult = 0.8;
            if (defTraits.includes('Big Target')) incomingMult = 1.3;
            
            // ✅ ПРАВИЛЬНАЯ ФОРМУЛА ИЗ ВИКИ:
            // Damage = MAX(Damage - Armor, Damage × Pierce%)
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
        }'''

def apply_fix():
    print("🔧 Применение исправления формулы расчёта урона...\n")
    
    # Читаем index.html
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Ищем старую функцию calculateMatchup
    # Паттерн: от начала функции до закрывающей скобки на том же уровне
    pattern = r'function calculateMatchup\(attacker, defender\) \{[^}]*(?:\{[^}]*\}[^}]*)*\}'
    
    matches = re.findall(pattern, content, re.DOTALL)
    
    if not matches:
        print("❌ Функция calculateMatchup не найдена!")
        return False
    
    print(f"✅ Найдено {len(matches)} совпадений")
    print(f"📏 Старая функция: {len(matches[0])} символов")
    print(f"📏 Новая функция: {len(NEW_FUNCTION)} символов\n")
    
    # Заменяем первое вхождение
    new_content = content.replace(matches[0], NEW_FUNCTION, 1)
    
    # Сохраняем
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ Файл index.html обновлён!")
    print("\n📝 Изменения:")
    print("   - Упрощена формула расчёта урона")
    print("   - Соответствует официальной механике")
    print("   - Более высокие и реалистичные значения\n")
    print("🔄 Теперь закоммитьте изменения:")
    print("   git add index.html")
    print("   git commit -m 'Simplify damage calculation formula'")
    print("   git push origin fix/simplified-damage-calc")
    
    return True

if __name__ == '__main__':
    try:
        apply_fix()
    except Exception as e:
        print(f"❌ Ошибка: {e}")
