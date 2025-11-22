import json
import csv
import re

# Загружаем data.json
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

if isinstance(data, dict) and 'characters' in data:
    characters = data['characters']
else:
    characters = data

results = []
unrecognized = []  # Список для неопознанных пассивок

# Паттерны для парсинга
PATTERNS = {
    'additional_hits': r'(\d+)x\s*(\d+(?:-\d+)?)\s*(\w+)\s+[Dd]amage',
    'percentage_boost': r'\+(\d+)%\s*[Dd]amage',
    'flat_boost': r'\+(\d+)\s*[Dd]amage',
    'damage_reduction': r'-(\d+)%?\s*[Dd]amage',
    'heal': r'[Rr]egenerates?\s+(\d+)\s*[Hh]ealth',
    'repair': r'[Rr]epairs?\s+.*?(\d+)\s*[Hh]ealth',
    'shield': r'[Ss]hield.*?(\d+)\s*[Hh]ealth',
    'extra_hit': r'\+(\d+)\s+hit',
    'pierce_boost': r'\+(\d+)%\s*pierce',
    'block_boost': r'\+(\d+)%\s*[Bb]lock',
    'crit_boost': r'\+(\d+)%\s*[Cc]rit'
}

for char in characters:
    name = char.get('name', '')
    passive = char.get('passiveAbility', {})
    
    if not passive:
        results.append({
            'character': name,
            'passive_name': 'None',
            'effect_type': 'none',
            'damage_multiplier': 1.0,
            'defense_multiplier': 1.0,
            'additional_damage': 0,
            'condition': 'none',
            'rarity_required': 'Common',
            'notes': 'No passive ability'
        })
        continue
    
    passive_name = passive.get('name', '')
    description = passive.get('description', '')
    
    if not description:
        results.append({
            'character': name,
            'passive_name': passive_name,
            'effect_type': 'unknown',
            'damage_multiplier': 1.0,
            'defense_multiplier': 1.0,
            'additional_damage': 0,
            'condition': 'unknown',
            'rarity_required': 'Common',
            'notes': 'Empty description'
        })
        continue
    
    effect_type = 'unknown'
    damage_mult = 1.0
    defense_mult = 1.0
    additional_dmg = 0
    condition = 'always'
    rarity_required = 'Common'
    
    desc_lower = description.lower()
    
    # 1. ДОПОЛНИТЕЛЬНЫЙ УРОН (приоритет 1)
    match = re.search(PATTERNS['additional_hits'], description, re.IGNORECASE)
    if match:
        hits = int(match.group(1))
        damage_range = match.group(2)
        
        if '-' in damage_range:
            min_d, max_d = map(int, damage_range.split('-'))
            avg_dmg = (min_d + max_d) / 2
        else:
            avg_dmg = int(damage_range)
        
        additional_dmg = hits * avg_dmg
        effect_type = 'additional_damage'
    
    # 2. ПРОЦЕНТНЫЙ БУСТ УРОНА
    if effect_type == 'unknown':
        match = re.search(PATTERNS['percentage_boost'], description, re.IGNORECASE)
        if match:
            bonus = int(match.group(1))
            damage_mult = 1.0 + (bonus / 100.0)
            effect_type = 'direct_damage'
    
    # 3. ФИКСИРОВАННЫЙ БУСТ УРОНА
    if effect_type == 'unknown' and '+' in description and 'damage' in desc_lower:
        match = re.search(PATTERNS['flat_boost'], description, re.IGNORECASE)
        if match:
            additional_dmg = int(match.group(1))
            effect_type = 'additional_damage'
    
    # 4. СНИЖЕНИЕ УРОНА (ЗАЩИТА)
    if effect_type == 'unknown':
        match = re.search(PATTERNS['damage_reduction'], description, re.IGNORECASE)
        if match:
            reduction = int(match.group(1))
            if '%' in match.group(0):
                defense_mult = 1.0 - (reduction / 100.0)
            else:
                defense_mult = 0.8  # Примерная оценка
            effect_type = 'direct_defense'
    
    # 5. ХИЛ/РЕГЕН
    if 'regenerate' in desc_lower or 'heal' in desc_lower or 'restore' in desc_lower:
        match = re.search(PATTERNS['heal'], description, re.IGNORECASE)
        if match:
            effect_type = 'utility_heal'
    
    # 6. РЕМОНТ (для механических)
    if 'repair' in desc_lower:
        match = re.search(PATTERNS['repair'], description, re.IGNORECASE)
        if match:
            effect_type = 'utility_repair'
    
    # 7. ЩИТ
    if 'shield' in desc_lower:
        match = re.search(PATTERNS['shield'], description, re.IGNORECASE)
        if match:
            effect_type = 'utility_shield'
    
    # 8. ДОПОЛНИТЕЛЬНЫЕ ХИТЫ
    if '+' in description and 'hit' in desc_lower:
        match = re.search(PATTERNS['extra_hit'], description, re.IGNORECASE)
        if match:
            extra_hits = int(match.group(1))
            # Примерная оценка: +1 hit = +50% урона
            damage_mult = 1.0 + (extra_hits * 0.5)
            effect_type = 'direct_damage'
    
    # 9. САММОНЫ
    if 'summon' in desc_lower:
        effect_type = 'utility_summon'
    
    # 10. ОПРЕДЕЛЕНИЕ УСЛОВИЙ
    if any(word in desc_lower for word in ['against', 'when', 'if', 'while', 'after', 'during']):
        if effect_type.startswith('direct'):
            effect_type = 'conditional_' + effect_type.split('_')[1]
        elif effect_type == 'additional_damage':
            effect_type = 'conditional_additional_damage'
        condition = 'conditional'
        
        # Определяем конкретное условие
        if 'psyker' in desc_lower:
            condition = 'vs_psyker'
        elif 'mechanical' in desc_lower:
            condition = 'vs_mechanical'
        elif 'chaos' in desc_lower:
            condition = 'vs_chaos'
        elif 'below' in desc_lower and 'health' in desc_lower:
            condition = 'low_health'
        elif 'adjacent' in desc_lower:
            condition = 'adjacent'
    
    # 11. ОПРЕДЕЛЕНИЕ РЕДКОСТИ
    # Обычно пассивки доступны с Common, особые - с Rare+
    if any(word in desc_lower for word in ['legendary', 'master', 'supreme']):
        rarity_required = 'Rare'
    
    # Если не удалось распознать - помечаем для ручной разметки
    if effect_type == 'unknown':
        unrecognized.append({
            'character': name,
            'passive_name': passive_name,
            'description': description[:150]
        })
    
    results.append({
        'character': name,
        'passive_name': passive_name,
        'effect_type': effect_type,
        'damage_multiplier': damage_mult,
        'defense_multiplier': defense_mult,
        'additional_damage': additional_dmg,
        'condition': condition,
        'rarity_required': rarity_required,
        'notes': description[:200]
    })

# Записываем в CSV
with open('passive_abilities.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['character', 'passive_name', 'effect_type', 'damage_multiplier', 
                  'defense_multiplier', 'additional_damage', 'condition', 
                  'rarity_required', 'notes']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(results)

# Записываем неопознанные для ручной разметки
with open('unrecognized_passives.txt', 'w', encoding='utf-8') as f:
    f.write(f"НЕОПОЗНАННЫЕ ПАССИВКИ ({len(unrecognized)} шт.):\n")
    f.write("="*80 + "\n\n")
    for item in unrecognized:
        f.write(f"Character: {item['character']}\n")
        f.write(f"Passive: {item['passive_name']}\n")
        f.write(f"Description: {item['description']}\n")
        f.write("-"*80 + "\n\n")

print(f"✅ Создан passive_abilities.csv с {len(results)} записями")
print(f"✅ Опознано: {len([r for r in results if r['effect_type'] != 'unknown'])} пассивок")
print(f"⚠️  Неопознано: {len(unrecognized)} пассивок")
print(f"📝 Список неопознанных сохранён в unrecognized_passives.txt")