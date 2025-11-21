#!/usr/bin/env python3
"""
character_parser.py - Парсер персонажей для НОВОГО формата data.json
"""

import json
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum


class AttackType(Enum):
    """Типы атак"""
    PSYCHIC = "Psychic"
    FLAME = "Flame"
    PLASMA = "Plasma"
    ENERGY = "Energy"
    MOLECULAR = "Molecular"
    PHYSICAL = "Physical"
    PIERCING = "Piercing"
    BIO = "Bio"
    TOXIC = "Toxic"
    EVISCERATING = "Eviscerating"
    POWER = "Power"
    BOLTER = "Bolter"
    LAS = "Las"
    PARTICLE = "Particle"


@dataclass
class BaseStats:
    """Базовые статистики"""
    health: int
    armour: int
    damage: int
    
    @classmethod
    def from_dict(cls, data: dict) -> 'BaseStats':
        return cls(
            health=int(data.get('health', 0)),
            armour=int(data.get('armour', 0)),
            damage=int(data.get('damage', 0))
        )


@dataclass
class Attack:
    """Описание атаки"""
    attack_type: str
    damage_count: int
    damage_type: str
    range_distance: Optional[int] = None
    
    @classmethod
    def from_string(cls, attack_str: str) -> 'Attack':
        """
        Парсит строку атаки вида:
        - "Plasma / 1 hit"
        - "Psychic / 2 hits / Range 2"
        - "N/A"
        """
        if attack_str == "N/A" or not attack_str:
            return None
        
        parts = [p.strip() for p in attack_str.split('/')]
        
        damage_type = parts[0] if parts else "Unknown"
        damage_count = 1
        range_distance = None
        
        if len(parts) > 1:
            # Парсим количество хитов
            hit_match = re.search(r'(\d+)\s+hit', parts[1])
            if hit_match:
                damage_count = int(hit_match.group(1))
        
        if len(parts) > 2:
            # Парсим дальность
            range_match = re.search(r'Range\s+(\d+)', parts[2])
            if range_match:
                range_distance = int(range_match.group(1))
        
        return cls(
            attack_type=damage_type,
            damage_count=damage_count,
            damage_type=damage_type,
            range_distance=range_distance
        )


@dataclass
class Character:
    """Класс персонажа"""
    name: str
    faction: str
    description: str
    base_stats: BaseStats
    melee_attack: Optional[Attack]
    ranged_attack: Optional[Attack]
    movement: int
    traits: List[str]
    rarity: str
    active_ability: Dict[str, Any]
    passive_ability: Dict[str, Any]
    images: Dict[str, str]
    
    def get_all_attack_types(self) -> List[str]:
        """Возвращает все типы атак персонажа"""
        types = set()
        
        if self.melee_attack and self.melee_attack.attack_type:
            types.add(self.melee_attack.attack_type)
        
        if self.ranged_attack and self.ranged_attack.attack_type:
            types.add(self.ranged_attack.attack_type)
        
        return list(types)
    
    def is_psyker(self) -> bool:
        """Проверяет, является ли персонаж психиком"""
        # По трейту
        if 'Psyker' in self.traits:
            return True
        
        # По атаке
        if 'Psychic' in self.get_all_attack_types():
            return True
        
        # По описанию способности
        passive_desc = self.passive_ability.get('description', '')
        active_desc = self.active_ability.get('description', '')
        
        if 'Psychic' in passive_desc or 'Psychic' in active_desc:
            return True
        
        return False
    
    def get_hero_role(self) -> List[str]:
        """Определяет роль персонажа"""
        roles = []
        
        # Tank
        if self.base_stats.armour >= 25 and self.base_stats.health >= 100:
            roles.append('Tank')
        
        # Damage Dealer
        if self.base_stats.damage >= 40:
            roles.append('Damage Dealer')
        
        # Psyker
        if self.is_psyker():
            roles.append('Psyker')
        
        # Support (если есть бонусы для союзников)
        passive_desc = self.passive_ability.get('description', '')
        if 'friendly' in passive_desc.lower() or 'adjacent' in passive_desc.lower():
            roles.append('Support')
        
        # Healer
        if 'heal' in passive_desc.lower() or 'repair' in passive_desc.lower():
            roles.append('Healer')
        
        # Control (если есть CC эффекты)
        if any(x in passive_desc for x in ['Suppress', 'Stun', 'Freeze', 'Taunt']):
            roles.append('Control')
        
        return roles if roles else ['Unknown']
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Character':
        """Создаёт персонажа из словаря"""
        return cls(
            name=data.get('name', 'Unknown'),
            faction=data.get('faction', 'Unknown'),
            description=data.get('description', ''),
            base_stats=BaseStats.from_dict(data.get('baseStats', {})),
            melee_attack=Attack.from_string(data.get('attacks', {}).get('melee', 'N/A')),
            ranged_attack=Attack.from_string(data.get('attacks', {}).get('ranged', 'N/A')),
            movement=int(data.get('movement', 0)),
            traits=data.get('traits', []),
            rarity=data.get('rarity', 'Common'),
            active_ability=data.get('activeAbility', {}),
            passive_ability=data.get('passiveAbility', {}),
            images=data.get('images', {}),
        )


class CharacterParser:
    """Главный парсер персонажей"""
    
    def __init__(self, data_path: str):
        self.data_path = data_path
        self.characters: List[Character] = []
        self.meta = {}
    
    def load_data(self) -> bool:
        """Загружает данные из JSON"""
        try:
            with open(self.data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Проверяем формат
            if not isinstance(data, dict) or 'characters' not in data:
                print("❌ Ошибка: Неверный формат data.json")
                return False
            
            # Сохраняем meta информацию
            self.meta = data.get('meta', {})
            
            # Парсим персонажей
            characters_data = data.get('characters', [])
            self.characters = [Character.from_dict(char) for char in characters_data]
            
            print(f"✅ Загружено {len(self.characters)} персонажей")
            return True
        
        except Exception as e:
            print(f"❌ Ошибка при загрузке: {e}")
            return False
    
    def get_character(self, name: str) -> Optional[Character]:
        """Получить персонажа по имени"""
        for char in self.characters:
            if char.name == name:
                return char
        return None
    
    def get_psykers(self) -> List[Character]:
        """Получить всех психиков"""
        return [char for char in self.characters if char.is_psyker()]
    
    def get_by_faction(self, faction: str) -> List[Character]:
        """Получить персонажей по фракции"""
        return [char for char in self.characters if char.faction == faction]
    
    def get_by_attack_type(self, attack_type: str) -> List[Character]:
        """Получить персонажей с конкретным типом атаки"""
        result = []
        for char in self.characters:
            if attack_type in char.get_all_attack_types():
                result.append(char)
        return result
    
    def get_by_role(self, role: str) -> List[Character]:
        """Получить персонажей по роли"""
        result = []
        for char in self.characters:
            if role in char.get_hero_role():
                result.append(char)
        return result
    
    def get_stats(self) -> Dict[str, Any]:
        """Получить статистику"""
        return {
            'total': len(self.characters),
            'psykers': len(self.get_psykers()),
            'by_faction': self._count_by_faction(),
            'by_rarity': self._count_by_rarity(),
            'meta': self.meta
        }
    
    def _count_by_faction(self) -> Dict[str, int]:
        """Подсчитать персонажей по фракциям"""
        counts = {}
        for char in self.characters:
            counts[char.faction] = counts.get(char.faction, 0) + 1
        return counts
    
    def _count_by_rarity(self) -> Dict[str, int]:
        """Подсчитать персонажей по редкости"""
        counts = {}
        for char in self.characters:
            counts[char.rarity] = counts.get(char.rarity, 0) + 1
        return counts


# ═══════════════════════════════════════════════════════════════════════════
# ПРИМЕР ИСПОЛЬЗОВАНИЯ
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    parser = CharacterParser('data.json')
    
    if parser.load_data():
        print("\n" + "="*100)
        print("📊 СТАТИСТИКА:")
        print("="*100)
        
        stats = parser.get_stats()
        print(f"\n✅ Всего персонажей: {stats['total']}")
        print(f"✅ Психиков: {stats['psykers']}")
        
        print(f"\n📋 По фракциям:")
        for faction, count in stats['by_faction'].items():
            print(f"   {faction}: {count}")
        
        print(f"\n⭐ По редкости:")
        for rarity, count in stats['by_rarity'].items():
            print(f"   {rarity}: {count}")
        
        # Примеры использования
        print("\n" + "="*100)
        print("🔍 ПРИМЕРЫ:")
        print("="*100)
        
        psykers = parser.get_psykers()
        print(f"\n🧠 Психики ({len(psykers)}):")
        for char in psykers[:5]:
            print(f"   - {char.name} ({char.faction})")
        
        psychic_users = parser.get_by_attack_type('Psychic')
        print(f"\n🔮 Пользователи Psychic атак ({len(psychic_users)}):")
        for char in psychic_users[:5]:
            print(f"   - {char.name}")
        
        support = parser.get_by_role('Support')
        print(f"\n🛡️ Support персонажи ({len(support)}):")
        for char in support[:5]:
            print(f"   - {char.name}")
