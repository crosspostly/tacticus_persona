import csv

# Read existing CSV
with open('passive_abilities.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Manual updates for most important characters
manual_updates = {
    'Boss Gulgortz': {
        'passive_name': "Light 'Im Up",
        'effect_type': 'additional_damage',
        'damage_multiplier': 1.0,
        'defense_multiplier': 1.0,
        'additional_damage': 285,  # 3x 95 avg = 285
        'condition': 'always',
        'rarity_required': 'Common',
        'notes': "3x95 avg Projectile per attack after normal attack"
    },
    'Abaddon The Despoiler': {
        'passive_name': 'First Among Traitors',
        'effect_type': 'scaling',
        'damage_multiplier': 1.0,
        'defense_multiplier': 1.0,
        'additional_damage': 0,
        'condition': 'per_kill',
        'rarity_required': 'Rare',
        'notes': 'Stacks +X dmg per kill for friendly Chaos'
    },
    'Shadowsun': {
        'passive_name': 'Defender of the Greater Good',
        'effect_type': 'conditional_damage',
        'damage_multiplier': 1.5,
        'defense_multiplier': 1.0,
        'additional_damage': 0,
        'condition': 'markerlight',
        'rarity_required': 'Uncommon',
        'notes': '+50% dmg with ranged attacks for adjacent units'
    },
    'Tyrant Guard': {
        'passive_name': 'Guardian Organism',
        'effect_type': 'direct_defense',
        'damage_multiplier': 1.0,
        'defense_multiplier': 0.7,
        'additional_damage': 0,
        'condition': 'synapse_or_no_move',
        'rarity_required': 'Common',
        'notes': '-30% incoming dmg when in synapse or no move'
    },
    'Mephiston': {
        'passive_name': 'Fury of Ancients',
        'effect_type': 'additional_damage',
        'damage_multiplier': 1.0,
        'defense_multiplier': 1.0,
        'additional_damage': 100,  # 2x50 avg Psychic
        'condition': 'after_move',
        'rarity_required': 'Common',
        'notes': '2x Psychic dmg after moving to adjacent enemies'
    },
    'Dante': {
        'passive_name': 'Lord of the Host',
        'effect_type': 'direct_damage',
        'damage_multiplier': 1.5,
        'defense_multiplier': 1.0,
        'additional_damage': 0,
        'condition': 'always',
        'rarity_required': 'Common',
        'notes': '+50% dmg for adjacent units with Rapid Assault/Flying'
    },
    'Trajann': {
        'passive_name': 'Legendary Commander',
        'effect_type': 'conditional_damage',
        'damage_multiplier': 1.3,
        'defense_multiplier': 1.0,
        'additional_damage': 0,
        'condition': 'adjacent_to_ability_user',
        'rarity_required': 'Rare',
        'notes': '+30% dmg to enemies adjacent to ability users'
    },
    'Morvenn Vahl': {
        'passive_name': 'Righteous Repugnance',
        'effect_type': 'additional_damage',
        'damage_multiplier': 1.0,
        'defense_multiplier': 1.0,
        'additional_damage': 150,  # 3x50 avg Power
        'condition': 'adjacent',
        'rarity_required': 'Common',
        'notes': '3x50 avg Power to target and adjacent enemies'
    },
    'Ancient Thoread': {
        'passive_name': 'Astartes Banner',
        'effect_type': 'direct_damage',
        'damage_multiplier': 1.5,
        'defense_multiplier': 1.0,
        'additional_damage': 0,
        'condition': 'always',
        'rarity_required': 'Common',
        'notes': '+1 hit with melee attacks for adjacent units'
    },
    'Kharn': {
        'passive_name': 'The Betrayer',
        'effect_type': 'additional_damage',
        'damage_multiplier': 1.0,
        'defense_multiplier': 1.0,
        'additional_damage': 200,  # 4x50 avg Eviscerating
        'condition': 'after_attack',
        'rarity_required': 'Common',
        'notes': '4x50 avg Eviscerating to adjacent enemy after attack'
    }
}

# Update rows
for row in rows:
    if row['character'] in manual_updates:
        update = manual_updates[row['character']]
        for key, value in update.items():
            row[key] = str(value)

# Write updated CSV
with open('passive_abilities.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['character', 'passive_name', 'effect_type', 'damage_multiplier', 
                  'defense_multiplier', 'additional_damage', 'condition', 
                  'rarity_required', 'notes']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print("✅ Updated passive_abilities.csv with manual markup for top characters")