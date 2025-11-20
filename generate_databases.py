#!/usr/bin/env python3
"""
Генератор баз данных для Tacticus Matchup Analyzer
Автоматически извлекает из data.json:
  - traits_database.csv (все уникальные трейты)
  - character_traits.csv (связи персонаж ↔ трейт)
  - conditional_bonuses.csv (условные бонусы из описаний)
  - character_factions.csv (связи персонаж ↔ фракция)
"""

import json
import csv
import re
from collections import Counter
import sys

def load_data():
    """Загружает data.json или data.txt"""
    try:
        # Пробуем data.json
        with open('data.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        # Фоллбэк на data.txt
        try:
            with open('data.txt', 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ Ошибка: Не найден data.json или data.txt")
            sys.exit(1)

def generate_traits_database(data):
    """Генерирует traits_database.csv"""
    all_traits = set()
    
    for char in data:
        if char.get('traits'):
            traits = [t.strip() for t in char['traits'].split(',')]
            all_traits.update(traits)
    
    rows = [{'trait_name': trait} for trait in sorted(all_traits)]
    
    with open('traits_database.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['trait_name'])
        writer.writeheader()
        writer.writerows(rows)
    
    return len(rows)

def generate_character_traits(data):
    """Генерирует character_traits.csv"""
    rows = []
    
    for char in data:
        name = char.get('name')
        if not name or not char.get('traits'):
            continue
        
        traits = [t.strip() for t in char['traits'].split(',')]
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

def generate_conditional_bonuses(data):
    """Генерирует conditional_bonuses.csv"""
    patterns = [
        (r'against.*?psyker|vs\.?\s*psyker|enemy\s+psyker', 'trait', 'Psyker'),
        (r'against.*?daemon|vs\.?\s*daemon|enemy\s+daemon', 'trait', 'Daemon'),
        (r'against.*?mechanical|vs\.?\s*mechanical|mechanical\s+unit', 'trait', 'Mechanical'),
        (r'against.*?summon|vs\.?\s*summon|when.*?summon|summon\s+moves', 'trait', 'Summon'),
        (r'against.*?flying|vs\.?\s*flying|flying\s+enem', 'trait', 'Flying'),
        (r'mk\s*x\s*gravis|gravis\s+unit', 'trait', 'Mk X Gravis'),
        (r'terminator\s+armour|terminator\s+unit', 'trait', 'Terminator Armour'),
        (r'big\s+target', 'trait', 'Big Target'),
        (r'against.*?ork|enemy\s+ork', 'trait', 'Ork'),
    ]
    
    rows = []
    
    for char in data:
        name = char.get('name')
        if not name:
            continue
        
        for ability_key, ability_type in [('activeAbility', 'active'), ('passiveAbility', 'passive')]:
            ability = char.get(ability_key)
            if not ability or not ability.get('description'):
                continue
            
            desc = ability['description']
            desc_lower = desc.lower()
            
            for pattern, cond_type, cond_value in patterns:
                if re.search(pattern, desc_lower):
                    rows.append({
                        'character': name,
                        'ability_name': ability.get('name', ''),
                        'ability_type': ability_type,
                        'condition_type': cond_type,
                        'condition_value': cond_value,
                        'bonus_type': 'damage_multiplier',
                        'bonus_value': 'unknown',
                        'confidence': 'medium',
                        'full_description': desc[:200]
                    })
                    break
    
    with open('conditional_bonuses.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'character', 'ability_name', 'ability_type', 'condition_type',
            'condition_value', 'bonus_type', 'bonus_value', 'confidence', 'full_description'
        ])
        writer.writeheader()
        writer.writerows(rows)
    
    return len(rows)

def generate_character_factions(data):
    """Генерирует character_factions.csv"""
    rows = []
    
    for char in data:
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

def main():
    print("="*100)
    print("🔧 ГЕНЕРАТОР БАЗ ДАННЫХ - Tacticus Matchup Analyzer")
    print("="*100)
    
    # Загружаем данные
    data = load_data()
    print(f"\n✅ Загружено {len(data)} персонажей")
    
    # Генерируем базы данных
    print("\n📋 Генерация баз данных...")
    
    traits_count = generate_traits_database(data)
    print(f"  ✅ traits_database.csv ({traits_count} трейтов)")
    
    char_traits_count = generate_character_traits(data)
    print(f"  ✅ character_traits.csv ({char_traits_count} связей)")
    
    bonuses_count = generate_conditional_bonuses(data)
    print(f"  ✅ conditional_bonuses.csv ({bonuses_count} бонусов)")
    
    factions_count = generate_character_factions(data)
    print(f"  ✅ character_factions.csv ({factions_count} записей)")
    
    print("\n" + "="*100)
    print("✅ ГЕНЕРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!")
    print("="*100)
    print("\n📁 Созданные файлы:")
    print("  - traits_database.csv")
    print("  - character_traits.csv")
    print("  - conditional_bonuses.csv")
    print("  - character_factions.csv")
    print("\n🔄 При обновлении data.json файлы автоматически пересоздаются")

if __name__ == '__main__':
    main()