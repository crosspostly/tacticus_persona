#!/usr/bin/env python3
"""
Генератор баз данных для Tacticus Matchup Analyzer v2.0
Автоматически извлекает из data.json:
  - traits_database.csv (все уникальные трейты с эффектами)
  - character_traits.csv (связи персонаж ↔ трейт)
  - conditional_bonuses.csv (условные бонусы из описаний способностей)
  - character_factions.csv (связи персонаж ↔ фракция)
  - character_attack_types.csv (типы атак персонажей)
"""

import json
import csv
import re
from collections import Counter, defaultdict
import sys

# Машины войны - исключаем из анализа
MACHINES_OF_WAR = [
    'Biovore', 'Exorcist', 'Forgefiend', 'Galatian',
    'Malleus Rocket Launcher', 'Plagueburst Crawler',
    'Rukkatrukk', "Tson'ji"
]

# Pierce ratios для типов атак
PIERCE_RATIOS = {
    'Psychic': 100, 'Direct': 100, 'Piercing': 80, 'Melta': 75,
    'Plasma': 65, 'Eviscerating': 50, 'Power': 40, 'Flame': 30,
    'Energy': 30, 'Bolter': 20, 'Chain': 20, 'Pulse': 20,
    'Blast': 15, 'Heavy Round': 15, 'Bio': 15, 'Molecular': 15,
    'Particle': 15, 'Toxic': 15, 'Las': 10, 'Projectile': 5,
    'Physical': 1
}

# Известные трейт-эффекты (для traits_database.csv)
KNOWN_TRAIT_EFFECTS = {
    'Crushing Strike': {'effect_type': 'damage_multiplier', 'effect_value': '1.25', 'implemented': 'yes'},
    'Let the Galaxy Burn': {'effect_type': 'damage_multiplier', 'effect_value': '1.15', 'implemented': 'yes'},
    'Terminator Armour': {'effect_type': 'armor_multiplier', 'effect_value': '1.4', 'implemented': 'yes'},
    'Mk X Gravis': {'effect_type': 'armor_multiplier', 'effect_value': '1.5', 'implemented': 'yes'},
    'Resilient': {'effect_type': 'damage_reduction', 'effect_value': '0.8', 'implemented': 'yes'},
    'Big Target': {'effect_type': 'damage_taken_multiplier', 'effect_value': '1.3', 'implemented': 'yes'},
    'Flying': {'effect_type': 'mobility', 'effect_value': '+50', 'implemented': 'partial'},
    'Deep Strike': {'effect_type': 'mobility', 'effect_value': '+40', 'implemented': 'partial'},
    'Psyker': {'effect_type': 'attack_type', 'effect_value': 'Psychic', 'implemented': 'yes'},
    'Rapid Assault': {'effect_type': 'hits_multiplier', 'effect_value': '1.2', 'implemented': 'partial'},
    'Final Vengeance': {'effect_type': 'damage_reflection', 'effect_value': '0.3-0.5', 'implemented': 'no'},
    'Living Metal': {'effect_type': 'regeneration', 'effect_value': 'per_turn', 'implemented': 'no'},
    'Overwatch': {'effect_type': 'first_strike', 'effect_value': 'before_enemy', 'implemented': 'no'},
    'Parry': {'effect_type': 'dodge_chance', 'effect_value': 'random', 'implemented': 'no'},
    'Terrifying': {'effect_type': 'enemy_damage_reduction', 'effect_value': '0.7', 'implemented': 'partial'}
}

def load_data():
    """Загружает data.json или data.txt"""
    try:
        with open('data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Проверяем новый формат (с meta и characters)
            if isinstance(data, dict) and 'characters' in data:
                return data['characters']
            return data
    except FileNotFoundError:
        try:
            with open('data.txt', 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, dict) and 'characters' in data:
                    return data['characters']
                return data
        except FileNotFoundError:
            print("❌ Ошибка: Не найден data.json или data.txt")
            sys.exit(1)

def is_character(entry):
    """Проверяет, является ли запись персонажем (не компонентом/бэджем)"""
    # Исключаем машины войны
    if entry.get('name') in MACHINES_OF_WAR:
        return False
    
    # Должны быть baseStats и attacks
    if not entry.get('baseStats') or not entry.get('attacks'):
        return False
    
    # Исключаем бэджи и компоненты по типу
    raw_info = entry.get('rawInfobox', {})
    if raw_info.get('Type'):
        type_str = raw_info['Type']
        if 'Badge' in type_str or 'Component' in type_str or 'Mythic' in type_str:
            return False
    
    return True

def extract_attack_info(attack_str):
    """Извлекает тип атаки и количество хитов"""
    if not attack_str or attack_str == 'N/A':
        return None, 0
    
    parts = attack_str.split('/')
    damage_type = parts[0].strip() if parts else 'Physical'
    
    hits = 1
    for part in parts:
        if 'hit' in part.lower():
            match = re.search(r'\d+', part)
            if match:
                hits = int(match.group())
    
    return damage_type, hits

def generate_traits_database(characters):
    """Генерирует traits_database.csv с эффектами трейтов"""
    all_traits = set()
    
    for char in characters:
        traits = char.get('traits', [])
        if isinstance(traits, str):
            traits = [t.strip() for t in traits.split(',')]
        all_traits.update(traits)
    
    rows = []
    for trait in sorted(all_traits):
        if trait in KNOWN_TRAIT_EFFECTS:
            effect = KNOWN_TRAIT_EFFECTS[trait]
            rows.append({
                'trait_name': trait,
                'effect_type': effect['effect_type'],
                'effect_value': effect['effect_value'],
                'implemented': effect['implemented']
            })
        else:
            rows.append({
                'trait_name': trait,
                'effect_type': 'unknown',
                'effect_value': '',
                'implemented': 'no'
            })
    
    with open('traits_database.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'trait_name', 'effect_type', 'effect_value', 'implemented'
        ])
        writer.writeheader()
        writer.writerows(rows)
    
    return len(rows)

def generate_character_traits(characters):
    """Генерирует character_traits.csv"""
    rows = []
    
    for char in characters:
        name = char.get('name')
        if not name:
            continue
        
        traits = char.get('traits', [])
        if isinstance(traits, str):
            traits = [t.strip() for t in traits.split(',')]
        
        for trait in traits:
            rows.append({
                'character': name,
                'trait': trait
            })
    
    with open('character_traits.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['character', 'trait'])
        writer.writeheader()
        writer.writerows(rows)
    
    return len(rows)

def generate_conditional_bonuses(characters):
    """Генерирует conditional_bonuses.csv с условными бонусами"""
    patterns = [
        # Против типов персонажей
        (r'against\s+psykers?|vs\.?\s*psykers?|enemy\s+psykers?|when\s+attacking\s+psykers?', 
         'trait', 'Psyker', 1.5),
        (r'against\s+daemons?|vs\.?\s*daemons?|enemy\s+daemons?', 
         'trait', 'Daemon', 1.3),
        (r'against\s+mechanical|vs\.?\s*mechanical|mechanical\s+units?', 
         'trait', 'Mechanical', 1.3),
        (r'against\s+summons?|vs\.?\s*summons?|when.*?summons?', 
         'trait', 'Summon', 1.3),
        (r'against\s+flying|vs\.?\s*flying|flying\s+enem', 
         'trait', 'Flying', 1.2),
        
        # Против фракций
        (r'against\s+orks?|enemy\s+orks?|vs\.?\s*orks?', 
         'faction', 'Orks', 1.2),
        (r'against\s+chaos|enemy\s+chaos|vs\.?\s*chaos', 
         'faction', 'Chaos', 1.2),
        (r'against\s+tyranids?|enemy\s+tyranids?|vs\.?\s*tyranids?', 
         'faction', 'Tyranids', 1.2),
        
        # Специальные условия
        (r'mk\s*x\s*gravis|gravis\s+units?', 
         'trait', 'Mk X Gravis', 1.3),
        (r'terminator\s+armou?r|terminator\s+units?', 
         'trait', 'Terminator Armour', 1.3),
        (r'big\s+target', 
         'trait', 'Big Target', 1.2),
    ]
    
    rows = []
    
    for char in characters:
        name = char.get('name')
        if not name:
            continue
        
        # Проверяем обе способности
        for ability_key, ability_type in [('activeAbility', 'active'), 
                                           ('passiveAbility', 'passive')]:
            ability = char.get(ability_key)
            if not ability or not ability.get('description'):
                continue
            
            desc = ability['description']
            desc_lower = desc.lower()
            
            for pattern, cond_type, cond_value, bonus_mult in patterns:
                if re.search(pattern, desc_lower):
                    # Пытаемся извлечь точное значение бонуса
                    bonus_value = 'unknown'
                    confidence = 'medium'
                    
                    # Ищем упоминания процентов или множителей
                    percent_match = re.search(r'(\d+)%', desc)
                    if percent_match:
                        bonus_value = percent_match.group(1)
                        confidence = 'high'
                    else:
                        # Используем предполагаемый множитель
                        bonus_value = str(int((bonus_mult - 1) * 100))
                        confidence = 'low'
                    
                    rows.append({
                        'character': name,
                        'ability_name': ability.get('name', ''),
                        'ability_type': ability_type,
                        'condition_type': cond_type,
                        'condition_value': cond_value,
                        'bonus_value': bonus_value,
                        'confidence': confidence
                    })
                    break  # Один бонус на способность
    
    with open('conditional_bonuses.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'character', 'ability_name', 'ability_type', 
            'condition_type', 'condition_value', 'bonus_value', 'confidence'
        ])
        writer.writeheader()
        writer.writerows(rows)
    
    return len(rows)

def generate_character_factions(characters):
    """Генерирует character_factions.csv"""
    rows = []
    
    for char in characters:
        name = char.get('name')
        if not name:
            continue
        
        faction = char.get('faction', 'N/A')
        rows.append({
            'character': name,
            'faction': faction
        })
    
    with open('character_factions.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['character', 'faction'])
        writer.writeheader()
        writer.writerows(rows)
    
    return len(rows)

def generate_character_attack_types(characters):
    """Генерирует character_attack_types.csv с типами атак и pierce ratios"""
    rows = []
    
    for char in characters:
        name = char.get('name')
        if not name:
            continue
        
        attacks = char.get('attacks', {})
        melee_str = attacks.get('melee', 'N/A')
        ranged_str = attacks.get('ranged', 'N/A')
        
        melee_type, melee_hits = extract_attack_info(melee_str)
        ranged_type, ranged_hits = extract_attack_info(ranged_str)
        
        # Определяем primary attack type
        primary_type = melee_type if melee_type and melee_hits > 0 else ranged_type
        primary_pierce = PIERCE_RATIOS.get(primary_type, 20) if primary_type else 0
        
        rows.append({
            'character': name,
            'melee_type': melee_type or 'N/A',
            'melee_hits': melee_hits,
            'melee_pierce': PIERCE_RATIOS.get(melee_type, 0) if melee_type else 0,
            'ranged_type': ranged_type or 'N/A',
            'ranged_hits': ranged_hits,
            'ranged_pierce': PIERCE_RATIOS.get(ranged_type, 0) if ranged_type else 0,
            'primary_type': primary_type or 'N/A',
            'primary_pierce': primary_pierce
        })
    
    with open('character_attack_types.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'character', 'melee_type', 'melee_hits', 'melee_pierce',
            'ranged_type', 'ranged_hits', 'ranged_pierce',
            'primary_type', 'primary_pierce'
        ])
        writer.writeheader()
        writer.writerows(rows)
    
    return len(rows)

def main():
    print("="*100)
    print("🔧 ГЕНЕРАТОР БАЗ ДАННЫХ v2.0 - Tacticus Matchup Analyzer")
    print("="*100)
    
    # Загружаем данные
    all_data = load_data()
    print(f"\n📦 Загружено записей: {len(all_data)}")
    
    # Фильтруем персонажей (исключаем машины войны и компоненты)
    characters = [char for char in all_data if is_character(char)]
    print(f"✅ Персонажей для анализа: {len(characters)}")
    print(f"❌ Исключено (машины войны и др.): {len(all_data) - len(characters)}")
    
    # Генерируем базы данных
    print("\n📋 Генерация баз данных...")
    
    traits_count = generate_traits_database(characters)
    print(f"  ✅ traits_database.csv ({traits_count} трейтов)")
    
    char_traits_count = generate_character_traits(characters)
    print(f"  ✅ character_traits.csv ({char_traits_count} связей)")
    
    bonuses_count = generate_conditional_bonuses(characters)
    print(f"  ✅ conditional_bonuses.csv ({bonuses_count} условных бонусов)")
    
    factions_count = generate_character_factions(characters)
    print(f"  ✅ character_factions.csv ({factions_count} записей)")
    
    attacks_count = generate_character_attack_types(characters)
    print(f"  ✅ character_attack_types.csv ({attacks_count} записей)")
    
    print("\n" + "="*100)
    print("✅ ГЕНЕРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!")
    print("="*100)
    print(f"\n📊 Статистика:")
    print(f"  • Персонажей: {len(characters)}")
    print(f"  • Уникальных трейтов: {traits_count}")
    print(f"  • Условных бонусов: {bonuses_count}")
    print(f"  • Типов атак: {attacks_count}")
    print("\n📁 Созданные файлы:")
    print("  - traits_database.csv")
    print("  - character_traits.csv")
    print("  - conditional_bonuses.csv")
    print("  - character_factions.csv")
    print("  - character_attack_types.csv")
    print("\n🔄 При обновлении data.json файлы автоматически пересоздаются через GitHub Actions")

if __name__ == '__main__':
    main()
