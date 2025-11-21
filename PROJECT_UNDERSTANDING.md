# 🧠 ОБЪЯСНЕНИЕ: ЧТО Я ПОНИМАЮ О ПРОЕКТЕ

**Написано для тебя - чтобы ты понимал мою логику 🤖**

---

## 🎯 СУТЬ ПРОЕКТА (как я её вижу)

### ЦЕЛЬ:
**Создать матрицу, которая ответит на вопрос:**
> "Если я атакую персонажем X против персонажа Y, какой у меня будет шанс выиграть?"

### МЕТОД:
1. Загрузить 100 персонажей из data.json
2. Анализировать их СПОСОБНОСТИ и ТРЕЙТЫ
3. Выявить бонусы ("+150% урон против психиков")
4. Создать таблицу: Attacker → Defender = Effectiveness%
5. На основе таблицы давать РЕКОМЕНДАЦИИ

---

## 💾 ЧТО Я СОБРАЛ (и почему):

### ❌ ЧТО БЫЛО (старый подход):
- Один большой файл с парсингом всего
- Неясная структура
- Сложно расширять
- Непонятно, что за что отвечает

### ✅ ЧТО Я СОЗДАЛ (новый подход):

**[56] character_parser.py** - ОСНОВА ВСЕГО
```
Загружает 100 персонажей
↓
Парсит базовые данные (health, damage, armour)
↓
Определяет типы атак (Psychic, Flame, Plasma...)
↓
Определяет психиков (по трейту ИЛИ по атаке)
↓
Классифицирует роли (Tank, Support, Damage, etc)
↓
ВЫВОДИТ: Объекты Character, готовые для анализа
```

**[58] main.py** - ОРКЕСТРАТОР
```
Запускает pipeline:
  1. Загрузить персонажей (character_parser)
  2. Валидировать (data_validator) ← проверить, что всё ОК
  3. Генерировать traits (trait_generator) ← CSV файл
  4. Генерировать бонусы (bonus_generator) ← CSV файл
  5. Генерировать роли (role_generator) ← CSV файл
  6. Генерировать матрицу (matrix_generator) ← ГЛАВНЫЙ CSV!
```

**🔧 TODO файлы** - КОНКРЕТНЫЕ ПАРСЕРЫ:
```
ability_parser.py
├─ Парсит каждую способность
├─ Ищет "+X Damage against Psyker"
└─ Выдаёт: {character, ability, bonus_type, target_type, bonus_value}

bonus_extractor.py
├─ Углубленный анализ описаний
├─ Находит: against Chaos, within 2 hexes, at 50% HP, etc
└─ Выдаёт: Все условные бонусы

trait_generator.py
├─ Берёт Character.traits
├─ Добавляет определённые (Psyker, если Psychic)
└─ Сохраняет: character_traits.csv

bonus_generator.py
├─ Берёт результат из ability_parser
├─ Организует в таблицу
└─ Сохраняет: conditional_bonuses.csv

role_generator.py
├─ Анализирует stats (Health, Damage, Armour)
├─ Анализирует способности
├─ Классифицирует: Tank, DPS, Support, Healer, Control
└─ Сохраняет: hero_roles.csv

matrix_generator.py
├─ Для каждой пары (A, B)
├─ Проверяет: Есть ли у A бонус против B?
├─ Вычисляет: Effectiveness% = 100 + бонусы - защита
└─ Сохраняет: matchup_matrix.csv ← ЭТА ТАБЛИЦА ГЛАВНАЯ!

data_validator.py
├─ Проверяет: Нет ли дубликатов?
├─ Проверяет: Все ли поля заполнены?
├─ Проверяет: Правильно ли распарсено?
└─ Выдаёт: Список ошибок (если есть)
```

---

## 🧩 КАК ЭТО РАБОТАЕТ ВМЕСТЕ

```
┌─────────────────────┐
│    data.json        │ (100 персонажей)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  character_parser.py ✅ [56]         │
│  Загружает + парсит базовые данные  │
│  Определяет психиков и роли         │
└──────────┬──────────────────────────┘
           │
      ┌────┴────┬──────────┬──────────┬──────────┐
      │          │          │          │          │
      ▼          ▼          ▼          ▼          ▼
 trait_gen  ability_par  bonus_gen  role_gen  matrix_gen
 (CSV 1)    (парсинг)    (CSV 2)    (CSV 3)   (CSV 4)
      │          │          │          │          │
      │          ▼          │          │          │
      │    bonus_extract    │          │          │
      │    (углублённо)     │          │          │
      │          │          │          │          │
      └────┬─────┴─────┬────┴──────────┴──────────┘
           │           │
           ▼           ▼
    character_traits  conditional_bonuses ← эти 2 идут в matrix
         .csv              .csv
           │           │
           └─────┬─────┘
                 │
                 ▼
      ┌───────────────────────┐
      │  matrix_generator.py  │
      │  Рассчитывает: Tjark  │
      │  +150% против Ahriman │
      └──────────┬────────────┘
                 │
                 ▼
        ┌───────────────────┐
        │ matchup_matrix.csv │
        │ (ГЛАВНАЯ МАТРИЦА)  │
        └───────────────────┘
```

---

## 📊 ПРИМЕРЫ: ЧТО БУДУТ СОДЕРЖАТЬ CSV ФАЙЛЫ

### 1. character_traits.csv
```
character_name,trait_name
Ahriman,Flying
Ahriman,Psyker
Ahriman,Weaver of Fates
Tjark,Psyker Killer (определена автоматически!)
Corrodius,Resilient
Corrodius,Contagions of Nurgle
```

### 2. conditional_bonuses.csv
```
character_name,ability_name,bonus_type,target_type,bonus_value,is_team_bonus
Tjark,Hunters Beyond Death,damage,Psyker,+X,false
Aesoth,Stand Vigil,armour,adjacent,+X,true
Abaddon,First Among Traitors,damage,Chaos,+X,true
Actus,Galvanic Field,damage,Mechanical,X%,true
```

### 3. hero_roles.csv
```
character_name,role,role_type,confidence
Tjark,Psyker Killer,counter,high
Aesoth,Tank,defense,high
Ahriman,Psyker Support,support,high
Corrodius,Resilient DPS,damage,high
Actus,Support Healer,support,medium
```

### 4. matchup_matrix.csv
```
attacker,defender,matchup_type,effectiveness_percent,notes
Tjark,Ahriman,vs_psyker,150,Psyker killer vs Psyker
Tjark,Corrodius,neutral,100,No special bonus
Aesoth,Corrodius,vs_resilient,95,Small malus
Corrodius,Actus,vs_mechanical,120,Bonus vs Mechanical
Ahriman,Tjark,cc_support,85,Can CC Tjark
```

**ЭТА ТАБЛИЦА ОТВЕЧАЕТ:**
- ✅ "Кто убивает кого?"
- ✅ "На сколько процентов эффективнее?"
- ✅ "Почему такой результат?"

---

## 🎯 ПОЧЕМУ Я ВЫБРАЛ ЭТУ АРХИТЕКТУРУ

### ❌ ВАРИАНТ 1: Один большой файл
```python
def generate_everything():
    # 5000 строк кода
    # Всё в одном месте
    # Если что-то сломается - ломается всё
    # Невозможно переиспользовать части
```

### ✅ ВАРИАНТ 2: Модульная архитектура (ТО, ЧТО Я ПРЕДЛОЖИЛ)
```
character_parser.py (базовая загрузка и парсинг)
        ↓ (данные)
    ├─ ability_parser.py (парсинг способностей)
    ├─ trait_generator.py (генерация трейтов)
    ├─ role_generator.py (классификация ролей)
    └─ bonus_extractor.py (анализ бонусов)
        ↓ (результаты)
    └─ matrix_generator.py (создание матрицы)
        ↓
    matchup_matrix.csv (РЕЗУЛЬТАТ)
```

**Преимущества:**
- ✅ Каждый файл делает ОДНО (Single Responsibility Principle)
- ✅ Легко тестировать (каждый парсер отдельно)
- ✅ Легко обновлять (if data.json изменится)
- ✅ Легко расширять (добавить новый парсер просто)
- ✅ Понятный код (читать и понимать просто)
- ✅ Можно запускать параллельно

---

## 🔍 КАК Я ПОНИМАЮ ЗАДАЧУ

### ВОПРОС 1: "Зачем парсеры, если есть data.json?"

**ОТВЕТ:**
data.json - это СЫРЫЕ ДАННЫЕ. Просто текст.

Парсеры - это АНАЛИЗ:
```
data.json: "Tjark deals +X Damage against Psykers"
           ↓ (ability_parser)
parsed:    {character: Tjark, target: Psyker, bonus: +X}
           ↓ (matrix_generator)
matrix:    Tjark → Psyker = 150% effective
```

Без парсеров: просто текст
С парсерами: **ПОНИМАЕМЫЕ ДАННЫЕ** → рекомендации

### ВОПРОС 2: "Какова ЦЕЛЬ каждого парсера?"

1. **character_parser** → Загрузить персонажей как объекты
2. **ability_parser** → Найти бонусы в описаниях способностей
3. **bonus_extractor** → Классифицировать бонусы
4. **trait_generator** → Создать CSV с трейтами
5. **bonus_generator** → Создать CSV с бонусами
6. **role_generator** → Создать CSV с ролями
7. **matrix_generator** → Создать ГЛАВНУЮ матрицу
8. **data_validator** → Проверить качество

**ИТОГ:**
```
character_parser + (7 других парсеров) = matchup_matrix.csv
                                        = МАТРИЦА ПРОТИВОСТОЯНИЙ
```

### ВОПРОС 3: "Что нужно делать дальше?"

**ДАЛЬШЕ:**
1. Реализовать 7 TODO парсеров
2. Запустить main.py
3. Получить 4 CSV файла:
   - character_traits.csv
   - conditional_bonuses.csv
   - hero_roles.csv
   - matchup_matrix.csv ← **ЭТА ТАБЛИЦА - РЕЗУЛЬТАТ**

**ПОТОМ:**
- Анализировать матрицу
- Выявлять мету (кто убивает всех)
- Давать рекомендации (если видишь Ahriman - бери Tjark)

---

## 💯 ИТОГ

### Я ПОНИМАЮ ПРОЕКТ КАК:

**ЭТО НЕ "просто парсер"**

**ЭТО СИСТЕМА АНАЛИЗА:**
1. Загружаем персонажей (100 штук)
2. Парсим их СПОСОБНОСТИ
3. Выявляем БОНУСЫ ("+150% против психиков")
4. Классифицируем РОЛИ (Tank, Support, DPS)
5. Создаём МАТРИЦУ (Attacker → Defender = Effectiveness%)
6. ИСПОЛЬЗУЕМ матрицу для рекомендаций

### МОИ ФАЙЛЫ ДЕЛАЮТ:

- ✅ **character_parser** [56] - Загружает и парсит персонажей
- ✅ **main.py** [58] - Запускает весь pipeline
- 🔧 **Остальные 6 парсеров** - Генерируют CSV таблицы

### КОНЕЧНЫЙ РЕЗУЛЬТАТ:

**matchup_matrix.csv** - таблица, которая показывает:
```
Tjark атакует Ahriman = 150% effective (убивает его!)
Aesoth атакует Ahriman = 90% effective (слабо)
Ahriman атакует Tjark = 85% effective (CC помешает)
```

---

**Дата:** 21.11.2025  
**Статус:** Я готов писать парсеры! 🚀

