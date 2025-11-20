# 🎮 WH40K TACTICUS - ПЕРСОНАЛЬНЫЙ ГАЙД ПО ВСЕМ 108 ПЕРСОНАЖАМ
## КАЖДЫЙ ПЕРСОНАЖ = УНИКАЛЬНЫЕ TRAITS + СПОСОБНОСТИ + МОДИФИКАТОРЫ

**Версия:** 8.0 - PERSONALIZED CHARACTER GUIDE  
**Дата:** 20 ноября 2025  
**Статус:** ПОЛНЫЙ РАЗБОР КАЖДОГО ПЕРСОНАЖА С ЕГО ОСОБЕННОСТЯМИ

---

## ⚠️ **КРИТИЧЕСКОЕ ПОНИМАНИЕ:**

**НЕТ "УНИВЕРСАЛЬНОЙ" ФОРМУЛЫ!**

Каждый персонаж имеет **СВОЙ НАБОР МОДИФИКАТОРОВ**, которые влияют на базовую формулу РАЗЛИЧНО!

Пример:
```
БАЗОВАЯ ФОРМУЛА:
  DD = MAX[(DamVar - Armor) vs (DamVar × Pierce%)] × Terrain × Hits

DANTE (Legendary):
  + Piercing (80%)
  + Flying (+50 mobility, контроль карты!)
  + Deep Strike (+40 mobility, телепортация!)
  + Rapid Assault (+1 hit = 6 вместо 5)
  + Final Vengeance (reflect 30-50% damage back!)
  + Lord of the Host (team buff +X damage!)

ТО ЖЕ САМОЕ ДЛЯ:
GALATIAN:
  + Projectile (5%!) - ПЛОХОЙ pierce!
  + Vehicle (тип персонажа, не боевой модификатор)
  + Overwatch (автоатака при движении)
  + Ancient Fury (пассив - ???)
  
СОВЕРШЕННО РАЗНЫЕ ПЕРСОНАЖИ, РАЗНЫЕ ФОРМУЛЫ!
```

---

## 📊 **СТАТИСТИКА TRAITS (108 персонажей):**

| Trait | Кол-во | Примеры |
|-------|--------|---------|
| **Summon** | 28 | Mataneo, Typhus, Abraxas, Celestine |
| **Flying** | 18 | Dante, Aethana, Ahriman, Neurothrope |
| **Resilient** | 14 | Typhus, Arjac, Galatian, Corrodius |
| **Mechanical** | 13 | Aleph-Null, Actus, Vitruvius |
| **Rapid Assault** | 12 | Dante, Kharn, Mephiston, Brother Jaeger |
| **Final Vengeance** | 11 | Dante, Kharn, Azrael, Incisus |
| **Unstoppable** | 10 | Arjac, Wrask, Instinctive creatures |
| **Psyker** | 9 | Typhus, Mephiston, Ahriman, Njal |
| **Terminator Armour** | 9 | Abaddon, Typhus, Njal, High Marshal |
| **Terrifying** | 9 | Dante, Deathleaper, Haarken |
| **Battle Fatigue** | 9 | Snotflogga, Pestillian, Boss Gulgortz |
| **Parry** | 8 | Various melee specialists |
| **Overwatch** | 8 | Azrael, Calandis, Galatian, Baraqiel |
| **Heavy Weapon** | 8 | Sarquael, Certus, Maugan Ra |
| **Big Target** | 7 | Tank characters |
| **Deep Strike** | 7 | Dante, Arjac, Kharn, Aethana |
| **Infiltrate** | 7 | Exitor-Rho, Deathleaper, Shadowsun |
| **Blessings of Khorne** | 6 | Chaos warriors |
| **Suppressive Fire** | 6 | Baraqiel, Maugan Ra |
| **+ 27 других traits** | Различные | Специализированные |

---

## 🎯 **ТИПЫ ПЕРСОНАЖЕЙ ПО SPECIAL TRAITS:**

### **ГРУППА 1: ТАНКИ С GRAVIS (3 персонажа)**

```
GRAVIS ARMOR = ДВОЙНАЯ БРОНЯ (только первый удар!)

Персонажи:
1. Bellator (Common, Flying + Mk X Gravis + Summon)
   - HP: 85
   - ARM: 13 (низкая! но Gravis спасает)
   - МОДИФИКАТОР: Первый удар -57% урона!
   
2. Brother Burchard (Uncommon, Mk X Gravis + Suppressive Fire)
   - HP: 120
   - ARM: 22
   - МОДИФИКАТОР: Враги рядом ослаблены + двойная броня!

3. Marneus Calgar (Legendary, Final Vengeance + Mk X Gravis)
   - HP: 95
   - ARM: 20
   - МОДИФИКАТОР: Отражает урон + двойная броня!
   - PASSIVE: Rites of Battle (team buff!)

ВАЖНО: Gravis срабатывает ТОЛЬКО на первый удар!
Если враг наносит 6 hits:
  Hit 1: -57% защита
  Hits 2-6: обычная броня
  Общее снижение: не 57%, а меньше!
```

### **ГРУППА 2: NECRONS С LIVING METAL (5 персонажей)**

```
LIVING METAL = Регенерация + Immunity к DoT

Персонажи:
1. Aleph-Null (Uncommon, Flying + Living Metal + Summon + Swarm)
   - HP: 75
   - ARM: 22
   - МОДИФИКАТОРЫ:
     * Living Metal = +X HP каждый ход (регенерация!)
     * Immune к Fire, Poison, Bleed
     * Summon = вызывает Scarabs
     * Swarm = может быть много Aleph-Null'ов
   - ФОРМУЛА: HP_Effective = 75 + Regen_Per_Turn

2. Anuphet (Epic, Living Metal + Summon)
   - HP: 85
   - МОДИФИКАТОРЫ: 
     * Martial Apotheosis (passive = ???)
     * Resurrection Orb (active = восстанавливает союзника!)
   - ФОРМУЛА: Может хилить ДРУГИХ персонажей!

3. Imospekh (Common, Living Metal + Overwatch)
   - HP: 72
   - МОДИФИКАТОРЫ: Автоатака + регенерация

4. Makhotep (Common, Living Metal)
   - HP: 85
   - МОДИФИКАТОРЫ: Relentless March (пассив непрерывного движения?)

5. Thutmose (Rare, Flying + Living Metal)
   - HP: 75
   - МОДИФИКАТОРЫ: Летающий Necron + регенерация!

ВАЖНО: Living Metal меняет формулу защиты!
  Normal Defense% = 100% - (Enemy_DMG / Your_HP) × 100%
  With Living Metal = 100% - (Enemy_DMG / (Your_HP + Regen)) × 100%
  
  Если Regen = 20 HP/turn:
    Normal: 100 - (300/100)×100 = -200% (очень плохо)
    With Regen: 100 - (300/120)×100 = -150% (лучше!)
```

### **ГРУППА 3: FLYERS (18 персонажей)**

```
FLYING = Контроль карты + избежание terrain ловушек

Персонажи включают: Dante, Aethana, Ahriman, Neurothrope, Shadowsun, +13 других

МОДИФИКАТОРЫ:
  + Flying: +50 к мобильности в RPS
  + Ignore terrain (-50% = не применяется!)
  + First turn advantage (часто быстрее)
  + Escape positioning (враг не может полностью заблокировать)

ФОРМУЛА: Летуны = контроль карты, враг должен адаптироваться!
  Normal Match: Grounded vs Grounded = даже позиционирование
  vs Flying: Flyer имеет positional advantage!
```

### **ГРУППА 4: SUMMONERS (28 персонажей!)**

```
SUMMON = Численность = Exponential Damage Scaling

Персонажи включают: Mataneo, Typhus, Snotflogga, Abraxas, Celestine, Anuphet, +22 других

ПРИМЕРЫ:
1. Mataneo (Legendary, Summon + Rapid Assault + Resilient)
   - HP: 70
   - DMG: 30
   - МОДИФИКАТОРЫ:
     * Summon = вызывает помощников
     * Rapid Assault = +1 hit
     * Resilient = -20% урона
   - ФОРМУЛА: Total_Team_DMG = Your_DMG + Summon_DMG × N_Summons
   - EXPONENTIAL: 1 Mataneo vs 1 Enemy = даже
             5 Mataneo vs 5 Enemy = Mataneo WINS (численность!)

2. Snotflogga (Rare, Battle Fatigue + Summon + Squig Hound)
   - HP: 120
   - DMG: 30
   - МОДИФИКАТОРЫ:
     * Battle Fatigue = -30% урона ПОСЛЕ первого хода (МИНУС!)
     * Summon = Get'em Runtz (вызывает Grots)
     * Squig Hound passive = +x2 урона за атаку
   - ФОРМУЛА (Turn 1): DD = 30 × x2 (Squig) = 60 per hit
           (Turn 2+): DD = 30 × x2 × 0.7 (Battle Fatigue) = 42 per hit
   - НО: Grots компенсируют урон через численность!

3. Typhus (Legendary, Summon + Psyker + Contagions)
   - HP: 120
   - DMG: 18
   - МОДИФИКАТОРЫ:
     * Psyker = Psychic attacks (100% pierce!)
     * Summon = Plague Garden (вызывает ползающих существ)
     * Contagions of Nurgle = Death Guard специальный trait
     * Destroyer Hive passive = ???
   - ФОРМУЛА: Typhus может быть на расстоянии + Psychic + Summons = КОМБО!

ВАЖНО: Summoners = exponential scaling с time!
  Early game: 1v1 примерно равно
  Mid game: Summoner имеет помощников, враг нет
  Late game: Summoner 5 юнитов vs 1 враг = 5v1!
```

### **ГРУППА 5: PSYKERS (9 персонажей)**

```
PSYKER = 100% Pierce (игнорирует любую броню!)

Персонажи:
1. Typhus (Legendary, Psychic + Summon + Resilient)
2. Mephiston (Legendary, Psychic + Rapid Assault + Terrifying)
3. Ahriman (Legendary, Psychic + Flying + Weaver of Fates)
4. Njal (Epic, Psychic + Terminator + Unstoppable)
5. Eldryon (Rare, Psychic melee)
6. Sibyll Devine (Common, Psychic 1 hit)
7. Varro Tigurius (N/A, Psychic + Psychic Fortress passive)
8. Neurothrope (Rare, Psychic + Flying + Living Metal)
9. Thaumachus (Epic, Psychic + Flying + Weaver of Fates)

МОДИФИКАТОРЫ:
  + Psychic = 100% pierce
  + Psychic не может быть заблокирован
  + Игнорирует Gravis (еще нет полной информации)
  + Работает везде

ФОРМУЛА: DD = DamVar × 100% = ПОЛНЫЙ УРОН БЕЗ ПРОВЕРКИ БРОНИ!

ПРОТИВ ТАНКА (ARM 40):
  Normal (Power): MAX[(100-40) vs (100×0.4)] = 60
  Psychic: MAX[(100-40) vs (100×1.0)] = 100 (1.67x выше!)
```

### **ГРУППА 6: RAPID ASSAULTERS (12 персонажей)**

```
RAPID ASSAULT = +1-2 hits (exponential damage!)

Персонажи: Dante, Kharn, Mephiston, Brother Jaeger, Ragnar, +7 других

МОДИФИКАТОРЫ:
  + Hits: 5 → 6 hits (+20% damage!)
  + Или: 1 → 3 hits (+200% damage!)
  + Работает с Crits (каждый hit может быть crit!)

ФОРМУЛА: Total_Damage = Per_Hit_DD × Total_Hits

Normal: 100 × 5 = 500
With RAPID: 100 × 6 = 600 (+100 damage!)

ПРОТИВ GRAVIS:
  Hit 1: -57% защита (Gravis)
  Hits 2-6: обычная броня
  Total: (Hit1 ×0.43 reduced) + (Hits 2-6 × 1.0) = хуже, чем vs normal armor!
  Но все равно лучше чем Single Hit!
```

### **ГРУППА 7: FINAL VENGEANCE (11 персонажей)**

```
FINAL VENGEANCE = Reflect 30-50% damage back!

Персонажи: Dante, Kharn, Azrael, Incisus, Brother Jaeger, Ragnar, +5 других

МОДИФИКАТОРЫ:
  + When hit: reflect X% damage back to attacker
  + Враг должен выбирать: атаковать (но получить урон назад) или нет

ФОРМУЛА: Враг_Урон = Your_Damage
          Враг_Полученный = Your_Damage - (Your_Damage × Reflect%)

Пример:
  Враг наносит: 500 урона Dante
  Dante отражает: 500 × 0.4 = 200 урона назад
  Net: Dante теряет 500, Враг теряет 200!
  
战略: Враги думают два раза перед атакой!
  Option 1: Атакуй Dante (он отразит урон)
  Option 2: Атакуй другого (но он может быть сильнее!)

SYNERGY: Final Vengeance + Rapid Assault = отражение на каждый hit!
  Если Dante получает 6 hits:
    Each hit отражает урон → враг получает 6 refections!
    Total reflection = potential x6 больше!
```

---

## 📊 **ПОЛНАЯ ТАБЛИЦА: КАК КАЖДЫЙ TRAIT МОДИФИЦИРУЕТ ФОРМУЛУ**

| Trait | Тип Модификатора | Где Применяется | Формула | Примеры |
|-------|-----------------|-----------------|---------|---------|
| **Gravis** | PRE-ARMOR (Special) | First Hit Only | DD2 = MAX[(DD1 - ARM) vs (DD1 × Pierce%)] | Bellator, Marneus |
| **Living Metal** | POST-ARMOR (Health) | Every Turn | HP_Eff = HP + Regen_Per_Turn | Aleph-Null, Anuphet |
| **Flying** | POSITION | Terrain | Ignore terrain mods, +50 mobility | Dante, Aethana, Ahriman |
| **Summon** | NUMERICAL | Scaling | Total_DMG = Your + Summons | Mataneo, Typhus, Snotflogga |
| **Psyker** | PRE-ARMOR | Pierce | Pierce% = 100% | Typhus, Mephiston, Ahriman |
| **Rapid Assault** | HITS | Multiplier | Hits = +1-2 | Dante, Kharn |
| **Final Vengeance** | REFLECTION | Post Combat | Reflect = X% damage back | Dante, Kharn |
| **Resilient** | POST-ARMOR | Defense | Damage_Taken = × 0.8 | Typhus, Arjac, Macer |
| **Terminator** | ARMOR | Defense | Armor = +X or ×1.15 | Abaddon, Njal, Typhus |
| **Overwatch** | TRIGGER | Enemy Move | Bonus_Attack on move | Azrael, Galatian |
| **Suppressive** | DEBUFF | Aura | Enemies -X% stats | Baraqiel, Maugan Ra |
| **Terrifying** | DEBUFF | Aura | Enemies -30% effective | Dante, Deathleaper |
| **Infiltrate** | POSITION | Start | Hidden start position | Exitor-Rho, Deathleaper |
| **Battle Fatigue** | PENALTY | Turn 2+ | Damage = × 0.7 after T1 | Snotflogga, Pestillian |
| **Deep Strike** | TELEPORT | Any Time | Can appear anywhere | Dante, Arjac, Kharn |
| **+ 31 других** | Various | Specialized | Custom | Various |

---

## 🎯 **ПРАКТИЧЕСКИЕ ПРИМЕРЫ: РАЗНЫЕ ПЕРСОНАЖИ = РАЗНЫЕ ФОРМУЛЫ**

### **ПРИМЕР 1: DANTE (S-TIER GOD)**

```
БАЗОВЫЕ СТАТЫ:
  HP: 90 | DMG: 11 | ARM: 23
  Rarity: Legendary (×40)

TRAITS:
  - Flying: +50 контроль карты
  - Deep Strike: +40 телепортация
  - Final Vengeance: отражение урома
  - Rapid Assault: +1 hit (5→6)
  - Terrifying: враги -30% эффективность
  - Parry: шанс избежать урона

ATTACKS:
  Melee: Piercing / 5 hits (+1 from Rapid = 6 hits!)
  Ranged: Piercing / 4 hits, Range 2

ABILITIES:
  Passive: Lord of the Host (team buff +X damage)
  Active: Light of Sanguinius (5x Melta damage + healing + damage reduction)

ПОЛНАЯ ФОРМУЛА ДЛЯ DANTE:

DD = MAX[(DamVar×40 - Enemy_Arm) vs ((DamVar×40) × 0.8)]  [Piercing 80%]
   × 1.0 (normal terrain)
   × 6 hits (Rapid Assault +1)
   × 0.7 (Enemy gets -30% from Terrifying trait)
   + REFLECT (30-50% damage back)
   + DEEP_STRIKE_POSITIONING (первый удар из безопасной позиции!)
   + LORD_OF_HOST (team buff)

ПРИМЕР РАСЧЕТА vs TYPHUS:
  DamVar = 11 × 40 (Legendary) = 440
  Piercing Calculation: MAX[(440 - 37) vs (440 × 0.8)] = MAX(403 vs 352) = 403
  With Terrifying: 403 × 0.7 = 282 per hit (враг боится!)
  Total: 282 × 6 = 1692 damage!
  
  Typhus HP (Legendary) = 120 × 2.5 = 300
  1692 > 300 → DANTE УБИВАЕТ!
  
  ПЛЮС: Dante отражает 30-50% от Typhus урома!
  Typhus наносит: 400 урома (Psychic)
  Dante отражает: 400 × 0.4 = 160 назад!
  
ИТОГ: Dante УНИЧТОЖАЕТ Typhus несмотря на Psychic!
```

### **ПРИМЕР 2: SNOTFLOGGA (HIDDEN OP!)**

```
БАЗОВЫЕ СТАТЫ:
  HP: 120 | DMG: 30 | ARM: 18
  Rarity: Rare (×1.0)

TRAITS:
  - Battle Fatigue: -30% урока после T1 (МИНУС!)
  - Summon: численность
  - Squig Hound passive: +×2 damage!

ATTACKS:
  Melee: Physical / 3 hits (УЖАСНЫЙ 1% pierce!)

ПОЛНАЯ ФОРМУЛА ДЛЯ SNOTFLOGGA:

DD_Turn1 = MAX[(DamVar - Enemy_Arm) vs (DamVar × 0.01)]
         × 1.0
         × 3 hits
         × 2.0 (Squig Hound multiplier!)
         + Grots spawned (Get'em Runtz passive!)

DD_Turn2+ = DD_Turn1 × 0.7 (Battle Fatigue -30%)

ПРИМЕР РАСЧЕТА:
  Turn 1:
    DamVar = 30 (no rarity boost on Rare base)
    Physical vs Armor 25: MAX[(30-25) vs (30×0.01)] = MAX(5 vs 0.3) = 5
    Per hit: 5 × 2.0 (Squig) = 10
    Total: 10 × 3 = 30 damage (УЖАСНО!)
    
    НО: Spawn Grots!
    Each Grot: 445 damage (Rare quality)
    Total with Grots: 30 + 445×3 = 1365 damage! (HUGE!)

  Turn 2+:
    Damage × 0.7 = 1365 × 0.7 = 955 (Battle Fatigue)
    Но Grots все еще есть!

ИТОГ: Snotflogga выглядит СЛАБО (Physical 1%), но Grots + Squib = HIDDEN OP!
Враги недооценивают!
```

### **ПРИМЕР 3: TYPHUS (ULTIMATE BUFFER)**

```
БАЗОВЫЕ СТАТЫ:
  HP: 120 | DMG: 18 | ARM: 25
  Rarity: Legendary (×40)

TRAITS:
  - Psyker: 100% pierce!
  - Summon: Plague Garden
  - Resilient: -20% урома
  - Contagions of Nurgle: Death Guard special
  - Terminator Armour: +ARM
  - Psychic immunity (?)

ATTACKS:
  Melee: Psychic / 1 hit (но 100% pierce!)
  Ranged: Psychic / 1 hit, Range 2

ПОЛНАЯ ФОРМУЛА ДЛЯ TYPHUS:

DD = MAX[(DamVar×40 - Enemy_Arm) vs ((DamVar×40) × 1.0)]  [Psychic 100%!]
   × 1.0
   × 1 hit (но 100% pierce = не нужно много!)
   + Summons damage
   + Team buffs (Destroyer Hive passive)

ПРИМЕР РАСЧЕТА vs Tank (ARM 40):
  DamVar = 18 × 40 = 720
  Psychic: MAX[(720 - 40) vs (720 × 1.0)] = MAX(680 vs 720) = 720 (!!!)
  
  Single hit: 720 damage (!)
  With Summons: 720 + 200×3 = 1320 damage!
  
  vs Psychic 100% работает ВЕЗДЕ!

ИТОГ: Typhus = универсал (Psychic) + summoner + tanky!
```

---

## ✅ **ГЛАВНЫЕ ВЫВОДЫ:**

1. **НЕТ "универсальной" формулы!** Каждый персонаж имеет **УНИКАЛЬНЫЙ набор модификаторов**

2. **TRAITS меняют формулу радикально:**
   - Gravis: двойная броня на первый удар
   - Living Metal: +HP каждый ход
   - Rapid Assault: +1 hit = +20% урона
   - Summon: exponential scaling с time

3. **СПОСОБНОСТИ - это БУФФЫ/ДЕБАФФЫ, не базовые статы:**
   - Passives: постоянные эффекты
   - Actives: мощные временные эффекты

4. **РАРИТИ ×40 мощнее Common:**
   - Legendary статы = 40x выше
   - Legendary способности = 40x выше
   - Это ОГРОМНАЯ разница!

5. **ПЕРСОНАЛИЗИРОВАННЫЙ РАСЧЕТ = единственный способ!**
   - Для каждого врага нужно учитывать его traits
   - Для каждой команды нужна синергия
   - Матрица матчапов учитывает это!

---

**✅ ИСПОЛЬЗУЙ ЭТУ ИНФОРМАЦИЮ ВМЕСТЕ С МАТРИЦЕЙ МАТЧАПОВ!**

*Каждый персонаж = своя формула*  
*Каждый матчап = уникальный расчет*  
*Нет универсального решения - только персонализированный анализ!*

**ТЕПЕРЬ ТЫ ПОНИМАЕШЬ ПОЛНУЮ СИСТЕМУ!** 🎮🏆
