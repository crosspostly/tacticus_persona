# 📖 СТРУКТУРА ПРОЕКТА tacticus_persona

## 🎯 Цель проекта
Анализ и структурирование данных персонажей Warhammer 40K: Tacticus для создания матрицы противостояний и рекомендаций по комбинациям.

---

## 📁 СТРУКТУРА ПАПОК

```
tacticus_persona/
├── 📂 data/
│   ├── data.json                 # Исходные данные персонажей (NEW FORMAT)
│   ├── characters/               # Экспортированные данные по персонажам
│   └── generated/                # Сгенерированные БД и матрицы
│
├── 📂 scripts/
│   ├── parsers/                  # Парсеры для извлечения данных
│   │   ├── __init__.py
│   │   ├── character_parser.py   # Парсинг персонажей
│   │   ├── ability_parser.py     # Парсинг способностей
│   │   └── bonus_extractor.py    # Извлечение бонусов
│   │
│   ├── generators/               # Генераторы БД
│   │   ├── __init__.py
│   │   ├── trait_generator.py    # Генерация таблицы трейтов
│   │   ├── bonus_generator.py    # Генерация условных бонусов
│   │   └── matrix_generator.py   # Генерация матрицы противостояний
│   │
│   ├── validators/               # Валидаторы данных
│   │   ├── __init__.py
│   │   └── data_validator.py     # Проверка целостности
│   │
│   └── main.py                   # Главный скрипт
│
├── 📂 databases/
│   ├── character_traits.csv      # Трейты персонажей
│   ├── character_attack_types.csv # Типы атак
│   ├── conditional_bonuses.csv   # Условные бонусы
│   ├── hero_roles.csv            # Роли персонажей
│   └── matchup_matrix.csv        # Матрица противостояний
│
├── 📂 docs/
│   ├── README.md                 # Описание проекта
│   ├── DATA_FORMAT.md            # Описание формата data.json
│   ├── PARSING_GUIDE.md          # Руководство по парсингу
│   ├── DATABASE_SCHEMA.md        # Схема БД
│   └── TECHNICAL_SPEC.md         # Техническое задание
│
├── 📄 requirements.txt            # Зависимости Python
└── 📄 .gitignore                  # Git ignore rules

```

---

## 🔄 PIPELINE ОБРАБОТКИ

```
data.json (исходные данные)
    ↓
[Character Parser] → character metadata + stats
    ↓
[Ability Parser] → active/passive abilities, bonuses
    ↓
[Bonus Extractor] → conditional bonuses, effects
    ↓
[Trait Generator] → character_traits.csv
[Attack Type Generator] → character_attack_types.csv
[Bonus Generator] → conditional_bonuses.csv
[Role Generator] → hero_roles.csv
    ↓
[Matrix Generator] → matchup_matrix.csv
    ↓
READY FOR ANALYSIS
```

---

## 📊 ФОРМАТ DATA.JSON (NEW)

```json
{
  "meta": {
    "total": 100,
    "successful": 100,
    "failed": 0
  },
  "characters": [
    {
      "name": "Character Name",
      "faction": "Faction Name",
      "description": "...",
      "baseStats": {
        "health": "125",
        "armour": "25",
        "damage": "40"
      },
      "attacks": {
        "melee": "Plasma / 1 hit",
        "ranged": "N/A"
      },
      "movement": "2",
      "traits": ["Trait1", "Trait2"],
      "rarity": "Rare",
      "activeAbility": {
        "name": "Ability Name",
        "description": "Description text...",
        "tables": [[...]]
      },
      "passiveAbility": {
        "name": "Passive Name",
        "description": "Description text...",
        "tables": [[...]]
      },
      "images": {
        "heroArt": "URL",
        "heroIcon": "URL"
      },
      "rawInfobox": {
        "Base Health": "125",
        "Base Armour": "25",
        ...
      }
    }
  ]
}
```

---

## 🔍 ТАБЛИЦЫ БАЗ ДАННЫХ

### 1. character_traits.csv
```
character_name,trait_name,trait_source,is_primary
Corrodius,Contagions of Nurgle,base_trait,true
Corrodius,Resilient,base_trait,true
Corrodius,Psychic Attack Bonus,attack_type,false
```

### 2. character_attack_types.csv
```
character_name,attack_type,melee_type,ranged_type
Corrodius,Plasma,Plasma,N/A
Ahriman,Psychic,Flame,Psychic
```

### 3. conditional_bonuses.csv
```
character_name,ability_name,bonus_type,condition_type,target_type,bonus_value,is_team_bonus
Corrodius,Cursed Plague Bell,movement,position,Chaos Units,+1,true
High Marshal Helbrecht,Destroy The Witch,damage,vs_type,Psyker,+X,false
```

### 4. hero_roles.csv
```
character_name,role,role_type,confidence
Corrodius,Tank,defense,high
Ahriman,Psyker,support,high
```

### 5. matchup_matrix.csv
```
attacker,defender,matchup_type,effectiveness_percent,notes
Tjark,Ahriman,vs_psyker,150,Psyker killer vs Psyker
Corrodius,Actus,vs_mechanical,120,Bonus vs Mechanical
```

---

## 🚀 КАК ЗАПУСТИТЬ

### 1. Установить зависимости
```bash
pip install -r requirements.txt
```

### 2. Запустить полный pipeline
```bash
python scripts/main.py
```

### 3. Запустить отдельные парсеры
```bash
python scripts/parsers/character_parser.py
python scripts/parsers/ability_parser.py
python scripts/generators/trait_generator.py
```

### 4. Валидировать данные
```bash
python scripts/validators/data_validator.py
```

---

## ✅ ЧЕКЛИСТ ФУНКЦИОНАЛЬНОСТИ

- [ ] Парсинг персонажей из data.json
- [ ] Определение типов атак (Psychic, Flame, Plasma, etc)
- [ ] Определение психиков (по трейту И по атаке)
- [ ] Извлечение условных бонусов
- [ ] Классификация ролей персонажей
- [ ] Генерация всех CSV таблиц
- [ ] Создание матрицы противостояний
- [ ] Валидация целостности данных

---

## 📝 ССЫЛКИ НА ДОКУМЕНТАЦИЮ

- [DATA_FORMAT.md](docs/DATA_FORMAT.md) - Описание формата данных
- [PARSING_GUIDE.md](docs/PARSING_GUIDE.md) - Руководство по парсингу
- [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) - Схема БД
- [TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md) - Техническое задание

