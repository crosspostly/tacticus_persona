# 🎯 ТЕХНИЧЕСКОЕ ЗАДАНИЕ ДЛЯ ИИ АГЕНТА
## Проект: tacticus_persona - Матрица противостояний персонажей

---

## 📌 ЧТО ТАКОЕ ЭТА МАТРИЦА?

**Матрица противостояний** = таблица, где указано:
- **Кого** атакует персонаж А
- **Против кого** персонаж А получает БОНУС урона
- **Кем** персонаж А лучше всего контрится (убивается)

**Пример:**
```
Tjark (психик-убийца) атакует Ahriman (психик)
→ Tjark получает +150% урона (Бонус против психиков)
```

---

## 🎮 ЦЕЛЬ ПРОЕКТА

Создать **ПОЛНУЮ СИСТЕМУ АНАЛИЗА** метагейма Tacticus:
- Какой персонаж лучше против какого типа
- Какие комбинации самые сильные
- Как строить команду для конкретного противника

---

## 📊 ЧТО НУЖНО В ИТОГЕ

### Выходные таблицы (CSV):

```
1️⃣ character_traits.csv
   character_name | trait_name
   Ahriman        | Flying
   Ahriman        | Psyker
   Ahriman        | Weaver of Fates

2️⃣ character_attack_types.csv
   character_name | melee_type | ranged_type
   Ahriman        | Flame      | Psychic
   Tjark          | Piercing   | Psychic

3️⃣ conditional_bonuses.csv
   character_name | ability_name | bonus_type | target_type | bonus_value | is_team_bonus
   Tjark          | Hunters Beyond Death | damage | Psyker | +X | false
   Aesoth         | Stand Vigil | armour | adjacent | +X | true

4️⃣ hero_roles.csv
   character_name | role | role_type | confidence
   Tjark          | Psyker Killer | counter | high
   Aesoth         | Tank | defense | high
   Ahriman        | Support | psyker | high

5️⃣ matchup_matrix.csv
   attacker | defender | matchup_type | effectiveness_percent | notes
   Tjark    | Ahriman  | vs_psyker    | 150                   | Psyker killer
   Corrodius| Actus    | vs_mechanical| 120                   | Bonus vs mech
```

---

## 🔧 АРХИТЕКТУРА: ЧТО ДОЛЖЕН ДЕЛАТЬ КАЖДЫЙ ФАЙЛ

### 1. CHARACTER_PARSER.PY ✅ ГОТОВ [56]

**ФУНКЦИЯ:** Загрузить персонажей и парсить их базовые данные

**ВХОДНОЙ ДАННЫЕ:** `data.json`
```json
{
  "characters": [
    {
      "name": "Ahriman",
      "baseStats": { "health": "80", "armour": "18", "damage": "30" },
      "attacks": { "melee": "Flame / 1 hit", "ranged": "Psychic / 1 hit" },
      "traits": ["Flying", "Psyker", "Weaver of Fates"],
      "passiveAbility": { "description": "..." }
    }
  ]
}
```

**ЧТО ДЕЛАЕТ:**
```python
parser = CharacterParser('data/data.json')
parser.load_data()

# Методы:
parser.get_psykers()                      # Все психики
parser.get_by_attack_type('Psychic')      # Все с psychic атаками
parser.get_by_role('Support')             # Все в роли support
parser.get_stats()                        # Статистика
```

**ВЫХОДНЫЕ ДАННЫЕ:** Объекты `Character` с атрибутами
- `name`, `faction`, `baseStats`
- `melee_attack`, `ranged_attack`
- `traits`, `rarity`
- `passive_ability`, `active_ability`

**ПОЛЬЗА ДЛЯ МАТРИЦЫ:**
- ✅ Автоматически определяет психиков
- ✅ Парсит типы атак (Psychic, Flame, Plasma, Energy, etc)
- ✅ Классифицирует роли персонажей
- ✅ Данные для трейтов и ролей

---

### 2. ABILITY_PARSER.PY 🔧 TODO

**ФУНКЦИЯ:** Парсить способности и извлекать из них БОНУСЫ

**ВХОДНЫЕ ДАННЫЕ:** `Character.passive_ability` и `Character.active_ability`
```
"Tjark - Hunters Beyond Death"
"Deals +X Damage against Psykers, and Enemy Psykers within 2 Hexes deal -X Damage."
```

**ЧТО ДЕЛАТЬ:**
1. Парсить описание способности
2. Искать ключевые слова:
   - `against Psyker` → БОНУС ПРОТИВ ПСИХИКОВ
   - `against Mechanical` → БОНУС ПРОТИВ МЕХАНИЧЕСКИХ
   - `adjacent` → POSITION-BASED BONUS
   - `friendly` → TEAM BONUS
   - `Heal/repair` → HEALING

3. Извлечь тип и величину бонуса

**ВЫХОДНЫЕ ДАННЫЕ:**
```python
{
    'character': 'Tjark',
    'ability': 'Hunters Beyond Death',
    'bonus_type': 'damage',
    'condition_type': 'vs_type',
    'target_type': 'Psyker',
    'bonus_value': '+X',
    'is_team_bonus': False
}
```

**ПОЛЬЗА:**
- ✅ Заполнит `conditional_bonuses.csv`
- ✅ Выявит СИЛУ персонажа против конкретных типов
- ✅ Поймёт СИНЕРГИИ в команде

---

### 3. BONUS_EXTRACTOR.PY 🔧 TODO

**ФУНКЦИЯ:** Углублённо анализировать способности и извлекать УСЛОВНЫЕ БОНУСЫ

**ВХОДНЫЕ ДАННЫЕ:** Описания всех способностей

**ПОИСК:**

#### A. БОНУСЫ ПРОТИВ ТИПОВ
```
"deals +X Damage against Chaos"      → vs_type: Chaos, +X
"against Psyker"                     → vs_type: Psyker, +X
"against Mechanical"                 → vs_type: Mechanical, +X
"against Big Target"                 → vs_type: Big Target, +X
```

#### B. ПОЗИЦИЯ-ЗАВИСИМЫЕ
```
"friendly units within 2 hexes"      → position: adjacent, +X
"adjacent"                           → position: adjacent, +X
```

#### C. СТАТУС-ЗАВИСИМЫЕ
```
"against Suppressed enemies"         → vs_status: Suppressed, +X
"if on Fire"                         → vs_status: on_Fire, +X
"at or below 50% Health"             → health_percent: 50, +X
```

**ВЫХОДНЫЕ ДАННЫЕ:** Полный список бонусов для матрицы

**ПОЛЬЗА:**
- ✅ Выявит СПЕЦИАЛИЗАЦИИ персонажей
- ✅ Поймёт КТО ЛУЧШЕ ПРОТИВ КОГО
- ✅ Основа для матрицы противостояний

---

### 4. TRAIT_GENERATOR.PY 🔧 TODO

**ФУНКЦИЯ:** Генерировать CSV `character_traits.csv`

**ВХОДНЫЕ ДАННЫЕ:** 
- Базовые трейты из `Character.traits`
- Определённые трейты (Psyker, если Psychic атака)

**КОД:**
```python
def generate(self) -> int:
    rows = []
    for char in self.parser.characters:
        traits = char.traits.copy()
        
        # Добавляем определённые трейты
        if char.is_psyker() and 'Psyker' not in traits:
            traits.append('Psyker')
        
        for trait in traits:
            rows.append({
                'character_name': char.name,
                'trait_name': trait,
                'trait_source': 'base' if trait in char.traits else 'detected',
                'is_primary': True
            })
    
    # Сохраняем в CSV
    self.save_csv('databases/character_traits.csv', rows)
    return len(rows)
```

**ВЫХОДНОЙ ФАЙЛ:** `character_traits.csv`

**ПОЛЬЗА:**
- ✅ Фундамент для анализа
- ✅ Быстрые фильтры (показать всех Flying, Mechanical, etc)
- ✅ База для SQL запросов

---

### 5. BONUS_GENERATOR.PY 🔧 TODO

**ФУНКЦИЯ:** Генерировать CSV `conditional_bonuses.csv`

**ВХОДНЫЕ ДАННЫЕ:** Результаты из `ability_parser.py` + `bonus_extractor.py`

**КОД:**
```python
def generate(self) -> int:
    rows = []
    for char in self.parser.characters:
        bonuses = extract_conditional_bonuses(char)
        for bonus in bonuses:
            rows.append({
                'character_name': bonus['character'],
                'ability_name': bonus['ability'],
                'bonus_type': bonus['type'],
                'condition_type': bonus['condition'],
                'target_type': bonus['target'],
                'bonus_value': bonus['value'],
                'is_team_bonus': bonus['is_team']
            })
    
    self.save_csv('databases/conditional_bonuses.csv', rows)
    return len(rows)
```

**ВЫХОДНОЙ ФАЙЛ:** `conditional_bonuses.csv`

**ПОЛЬЗА:**
- ✅ ГЛАВНАЯ ТАБЛИЦА для матрицы
- ✅ Показывает: Кто +150% против кого
- ✅ Основа для рекомендаций

---

### 6. ROLE_GENERATOR.PY 🔧 TODO

**ФУНКЦИЯ:** Классифицировать роли персонажей и генерировать CSV

**ВХОДНЫЕ ДАННЫЕ:** `Character` объекты + бонусы

**КЛАССИФИКАЦИЯ:**
```python
def get_role(char):
    roles = []
    
    # Tank - если Health >= 100 И Armour >= 25
    if char.baseStats.health >= 100 and char.baseStats.armour >= 25:
        roles.append('Tank')
    
    # Damage Dealer - если Damage >= 40
    if char.baseStats.damage >= 40:
        roles.append('Damage Dealer')
    
    # Support - если friendly bonuses в пассиве
    if 'friendly' in char.passive_ability['description'].lower():
        roles.append('Support')
    
    # Psyker - если Psychic атаки
    if 'Psychic' in char.get_all_attack_types():
        roles.append('Psyker')
    
    # Healer - если heal/repair в описании
    if any(x in char.passive_ability['description'] for x in ['heal', 'repair']):
        roles.append('Healer')
    
    # Control - если много CC эффектов
    if sum(1 for x in ['Suppress', 'Stun', 'Freeze'] 
           if x in char.passive_ability['description']) >= 2:
        roles.append('Control')
    
    return roles
```

**ВЫХОДНОЙ ФАЙЛ:** `hero_roles.csv`

**ПОЛЬЗА:**
- ✅ Быстро найти персонажа по роли
- ✅ Понять СИЛУ и СЛАБОСТЬ персонажа
- ✅ Составлять сбалансированные команды

---

### 7. MATRIX_GENERATOR.PY 🔧 TODO

**ФУНКЦИЯ:** Генерировать `matchup_matrix.csv` - ГЛАВНУЮ МАТРИЦУ

**ЛОГИКА:**

Для каждой пары (attacker, defender):
1. Есть ли у attacker бонусы против типа defender?
   - Проверить `conditional_bonuses` таблицу
   
2. Есть ли у defender защита от типа attacker?
   - Проверить пассивные способности

3. Вычислить `effectiveness_percent`:
   ```
   base = 100%
   + bonuses от условных бонусов
   - защита defender
   = итоговый процент
   ```

**ПРИМЕР:**
```
Tjark (психик killer) vs Ahriman (психик)
  - Tjark имеет "+X Damage against Psyker" → +50%
  - Ahriman психик, уязвим → условие совпадает
  - effectiveness = 100 + 50 = 150%
```

**КОД:**
```python
def generate(self) -> int:
    rows = []
    
    for attacker in self.parser.characters:
        for defender in self.parser.characters:
            if attacker.name == defender.name:
                continue
            
            effectiveness = self.calculate_matchup(attacker, defender)
            
            rows.append({
                'attacker': attacker.name,
                'defender': defender.name,
                'matchup_type': self.get_matchup_type(attacker, defender),
                'effectiveness_percent': effectiveness,
                'notes': self.get_notes(attacker, defender)
            })
    
    self.save_csv('databases/matchup_matrix.csv', rows)
    return len(rows)
```

**ВЫХОДНОЙ ФАЙЛ:** `matchup_matrix.csv` (10000+ строк!)

**ПОЛЬЗА:**
- ✅ ЭТО САМА МАТРИЦА ПРОТИВОСТОЯНИЙ!
- ✅ "Tjark убивает Ahriman на 150%"
- ✅ Основа для всех рекомендаций

---

### 8. DATA_VALIDATOR.PY 🔧 TODO

**ФУНКЦИЯ:** Валидировать целостность данных

**ПРОВЕРКИ:**
```python
def validate(self):
    errors = []
    
    # 1. Проверить дубликаты
    names = [char.name for char in self.parser.characters]
    if len(names) != len(set(names)):
        errors.append("Duplicate character names found")
    
    # 2. Проверить пропущенные поля
    for char in self.parser.characters:
        if not char.base_stats.health:
            errors.append(f"{char.name}: Missing health")
        if not char.base_stats.damage:
            errors.append(f"{char.name}: Missing damage")
    
    # 3. Проверить парсинг атак
    for char in self.parser.characters:
        if char.melee_attack is None and char.ranged_attack is None:
            errors.append(f"{char.name}: No attacks found")
    
    # 4. Проверить психиков
    psykers = self.parser.get_psykers()
    if len(psykers) < 5:
        errors.append(f"Only {len(psykers)} psykers found, expected 5+")
    
    return {'errors': errors, 'warnings': len(errors)}
```

**ВЫХОДНЫЕ ДАННЫЕ:** Список ошибок

**ПОЛЬЗА:**
- ✅ Гарантирует качество данных
- ✅ Выявит баги в парсерах
- ✅ Перед каждым запуском

---

## 🔄 ПОЛНЫЙ PIPELINE

```
data.json (100 персонажей)
    ↓ [character_parser.py]
    → Объекты Character с метаданными
    ↓
    ├─→ [trait_generator.py]
    │   → character_traits.csv ✅
    │
    ├─→ [ability_parser.py]
    │   → Парсинг способностей
    │       ↓ [bonus_extractor.py]
    │       → Извлечение всех бонусов
    │           ↓ [bonus_generator.py]
    │           → conditional_bonuses.csv ✅
    │
    ├─→ [role_generator.py]
    │   → hero_roles.csv ✅
    │
    └─→ [matrix_generator.py]
        → matchup_matrix.csv ✅ (ГЛАВНАЯ МАТРИЦА!)

[data_validator.py] - проверяет всё на каждом этапе
```

---

## 💡 ПОЧЕМУ НУЖНЫ ВСЕ ЭТИ ФАЙЛЫ?

**Вместо одного большого файла - делаем МОДУЛЬНУЮ АРХИТЕКТУРУ:**

| Файл | Зачем | Переиспользование |
|------|-------|-----------------|
| character_parser.py | Базовые данные | Все остальные парсеры |
| ability_parser.py | Парсинг способностей | bonus_generator |
| bonus_extractor.py | Извлечение бонусов | matrix_generator |
| trait_generator.py | CSV трейтов | Анализ паттернов |
| bonus_generator.py | CSV бонусов | Поиск синергий |
| role_generator.py | CSV ролей | Составление команд |
| matrix_generator.py | CSV матрицы | **ИТОГОВАЯ МАТРИЦА** |
| data_validator.py | QA | Качество данных |

**Преимущества:**
- ✅ Легко тестировать каждый парсер
- ✅ Легко переиспользовать код
- ✅ Легко обновлять (если изменится data.json)
- ✅ Параллельное выполнение
- ✅ Чистая архитектура

---

## 🎯 КОНЕЧНАЯ МАТРИЦА: ЧТО ОНА ПОКАЗЫВАЕТ

```
attacker    defender    matchup_type    effectiveness_percent    notes
─────────────────────────────────────────────────────────────────────────
Tjark       Ahriman     vs_psyker       150                      Psyker killer
Ahriman     Tjark       vs_daemon       80                       Weak against
Corrodius   Actus       vs_mechanical   120                      Bonus vs mech
Actus       Corrodius   neutral         100                      Equal match
Aesoth      Big Target  vs_big_target   130                      Strong tank
...         ...         ...             ...                      ...
```

**ИСПОЛЬЗОВАНИЕ:**
```sql
SELECT * FROM matchup_matrix 
WHERE attacker = 'Tjark' 
ORDER BY effectiveness_percent DESC
-- Показывает: Кого убивает Tjark и насколько эффективно

SELECT attacker, COUNT(*) as wins FROM matchup_matrix 
WHERE effectiveness_percent > 120 
GROUP BY attacker 
ORDER BY wins DESC
-- Показывает: Кто убивает больше всех (мета)
```

---

## ✅ ФИНАЛЬНЫЙ ЧЕКЛИСТ

- [ ] character_parser.py ✅ (ГОТОВ [56])
- [ ] main.py ✅ (ГОТОВ [58])
- [ ] ability_parser.py 🔧 (TODO)
- [ ] bonus_extractor.py 🔧 (TODO)
- [ ] trait_generator.py 🔧 (TODO)
- [ ] bonus_generator.py 🔧 (TODO)
- [ ] role_generator.py 🔧 (TODO)
- [ ] matrix_generator.py 🔧 (TODO)
- [ ] data_validator.py 🔧 (TODO)

**После всех файлов:**
- ✅ `character_traits.csv` → Всех персонажей + трейты
- ✅ `conditional_bonuses.csv` → Все бонусы против типов
- ✅ `hero_roles.csv` → Классификация ролей
- ✅ `matchup_matrix.csv` → **ИТОГОВАЯ МАТРИЦА ПРОТИВОСТОЯНИЙ**

---

**Версия:** 2.0  
**Дата:** 21.11.2025  
**Статус:** READY FOR DEVELOPMENT
