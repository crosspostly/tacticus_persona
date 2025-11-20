# 🎮 WH40K TACTICUS - ТЕХНИЧЕСКОЕ ЗАДАНИЕ
## ДЛЯ AI АГЕНТА: ПОСТРОЕНИЕ МАТРИЦЫ ПЕРСОНАЖЕЙ С ПОЛНОЙ СИНЕРГИЕЙ

**Версия:** 1.0 - COMPREHENSIVE SPECIFICATION  
**Дата:** 20 ноября 2025  
**Статус:** ГОТОВОЕ ТЗ ДЛЯ РАЗРАБОТКИ

---

## 🎯 ЦЕЛЬ ПРОЕКТА

Создать **ИНТЕРАКТИВНУЮ HTML МАТРИЦУ ПЕРСОНАЖЕЙ** для WH40K Tacticus, которая:
- ✅ Рассчитывает урон с учетом **ВСЕ 108+ характеристик персонажа**
- ✅ Показывает **синергию и командные комбинации**
- ✅ Анализирует **multi-turn потенциал** (не только первый удар)
- ✅ Учитывает **aura эффекты и buffы**
- ✅ Выдает **рекомендации по выбору команды**
- ✅ Работает на основе **реальных данных из JSON**

---

## 📊 ВХОДНЫЕ ДАННЫЕ

### Источник 1: JSON база данных (108 персонажей)

```json
{
  "name": "Dante",
  "rarity": "Legendary",
  "baseStats": {
    "health": "90",
    "armour": "23",
    "damage": "11"
  },
  "traits": ["Flying", "Deep Strike", "Final Vengeance", "Rapid Assault"],
  "passiveAbility": {
    "name": "Lord of the Host",
    "description": "All friendly surrounding units have +X damage",
    "tables": [
      ["Rarity", "Level", "Damage Bonus"],
      ["Common", "8", "20"],
      ["Legendary", "50", "200"]
    ]
  },
  "activeAbility": {
    "name": "Light of Sanguinius",
    "description": "5x Melta damage + Damage Reduction",
    "tables": [
      ["Rarity", "Level", "Damage", "DR%"],
      ["Common", "8", "22-30", "15%"],
      ["Legendary", "50", "2493-2992", "35%"]
    ]
  }
}
```

### Источник 2: Официальная Wiki информация

```
Pierce Ratios (21 тип):
  - Psychic: 100%
  - Direct: 100%
  - Piercing: 80%
  - Melta: 75%
  - Plasma: 65%
  - Molecular: 60%
  - Heavy Round: 55%
  - Eviscerating: 50%
  - Power: 40%
  - Energy: 30%
  - Bio: 30%
  - Flame: 25%
  - Toxic: 70%
  - Particle: 35%
  - Bolter: 20%
  - Chain: 20%
  - Pulse: 20%
  - Blast: 15%
  - Projectile: 15%
  - Las: 10%
  - Physical: 1%

Rarity Multipliers:
  - Common: 1.0x
  - Uncommon: 2.2x
  - Rare: 5.4x
  - Epic: 11.5x
  - Legendary: 40x
  - Mythic: 45x

Traits (46 штук, каждый меняет формулу по-своему):
  - Gravis: двойная броня на первый удар
  - Living Metal: регенерация каждый ход
  - Flying: контроль карты, +50 mobility
  - Summon: численность, exponential damage
  - Psyker: 100% pierce
  - Rapid Assault: +1-2 hits
  - Final Vengeance: reflect 30-50% damage
  - ... и 38 других
```

### Источник 3: Синергия и командные эффекты (ИЗ ФОРУМОВ И YOUTUBE)

```
FACTION SYNERGIES:
  Ultramarines: Calgar, Titus, Bellator
    → Calgar passive (+damage aura) × Titus (damage dealer) = 3x урона
  
  Death Guard: Typhus, Maladus, Corrodius
    → Typhus (Psyker) + Contagions (DoT) = exponential damage over time
  
  Chaos: Abaddon, Kharn, Haarken
    → Abaddon (tank) + Kharn (reflect) = unkillable
  
  Necrons: Aleph-Null, Imospekh, Thutmose
    → Living Metal (regen) + Overwatch = sustained damage

ROLE-BASED SYNERGIES:
  Tank + Support + DPS:
    → Galatian (tank, Overwatch) + Anuphet (healer) + Dante (DPS)
  
  Buffer + Damage Dealers:
    → Calgar (buff aura) + Titus (damage) + Kharn (reflect)
  
  Summon Spam + AOE:
    → Snotflogga (Grots) + Typhus (Psychic AOE) = clear wave
  
  Flying Team:
    → Dante (Flying) + Aethana (Flying) + Ahriman (Flying + Psyker)

ABILITY SYNERGIES:
  Heavy Weapon users + Spotter:
    → Thaddeus (spotter passive) + Maugan Ra (heavy weapon) = +crit damage
  
  Healer + Tank:
    → Anuphet (heal passive) + Galatian (tank) = unkillable combo
  
  Psyker + Psyker:
    → Mephiston (rapid assault + psyker) + Typhus (psyker + summon)

MULTI-TURN EFFECTS:
  → Overwatch (shoots BEFORE enemy attacks)
  → DOT (damage per turn: Fire, Poison, Bleed)
  → Final Vengeance (damage after death)
  → Suppression (next turn debuff)
  → Cumulative Buffs (Titus Fury, Macer Armor +)
```

---

## 🔧 ГЛАВНАЯ ФОРМУЛА РАСЧЕТА

```
DD_FINAL = 

  MAX[
    (DamVar + PreArmorMods - EnemyArmor) 
    vs 
    ((DamVar + PreArmorMods) × Pierce%)
  ]
  
  × TerrainMods (×0.5 to ×1.5)
  × Hits (с учетом Rapid Assault)
  × RarityMultiplier (1x to 45x)
  
  × TraitAttackerMods (Terrifying: ×0.7, и т.д.)
  × TraitDefenderMods (Resilient: ×0.8, и т.д.)
  
  ± Crit_Bonus (фиксированный +X damage)
  ± Block_Reduction (-X damage)
  
  + AuraBuffs (passive от соседей: +X damage)
  + AbilityBuffs (active способности: +X% damage)
  
  + MultiTurnScaling (turn 1 vs turn 5: может быть ×2-5x выше)

ГДЕ:
  DamVar = Damage × (1 ± 0.2 variance)
  PreArmorMods = Trait бонусы (Blessings of Khorne, и т.д.)
  EnemyArmor = базовая броня × Rarity (может быть ×1.5 выше)
  Pierce% = тип урона (от 1% до 100%)
  TerrainMods = High Ground ×1.5 / Trench ×0.5 / и т.д.
  Hits = удары × Rapid Assault (×1.2-2.0)
  RarityMultiplier = 1x (Common) до 45x (Mythic)
  TraitMods = все 46 traits
  Crit_Bonus = фиксированный урон (не процент!)
  AuraBuffs = пассивные аеры соседних персонажей
  AbilityBuffs = активные способности (самого персонажа и союзников)
  MultiTurnScaling = cumulative effects (Titus Fury, Macer Armor, и т.д.)
```

---

## 📋 МЕТРИКИ И ПОКАЗАТЕЛИ

### Для каждого персонажа рассчитывать:

```
1. ATTACK EFFECTIVENESS:
   Attack% = (Your_DPS / Enemy_HP) × 100%
   
   Интерпретация:
     90%+ = Очень сильно (kill за 2 хода)
     70-89% = Хорошо (kill за 3-4 хода)
     50-69% = Нормально (долгий бой)
     30-49% = Слабо (враг долго живет)
     <30% = Очень слабо (не угроза)

2. DEFENSE EFFECTIVENESS:
   Defense% = 100% - (Enemy_DPS / Your_HP) × 100%
   
   Интерпретация:
     90%+ = Очень безопасно
     70-89% = Хорошая защита
     50-69% = Нормальная защита
     30-49% = Нужна осторожность
     <30% = Опасно (враг быстро убьет)

3. AVERAGE MATCHUP:
   Average% = (Attack% + Defense%) / 2
   
   Интерпретация:
     60%+ = Выигрыш 🟢
     40-59% = Примерно равно 🟡
     <40% = Проигрыш 🔴

4. MULTI-TURN POTENTIAL:
   DPS_Turn1 vs DPS_Turn5 vs DPS_Turn10
   
   Показывать как:
     Turn 1: 300 DPS
     Turn 5: 450 DPS (+50%)
     Turn 10: 600 DPS (+100%)
   
   Пример: Titus (Fuelled by Fury) растет каждый ход!

5. SYNERGY SCORE:
   Показывать как синергия персонажа со своей командой:
     Best Partner: +X% effective damage
     Aura Bonus: +Y% from passive
     Combo Potential: ⭐⭐⭐⭐⭐ (5 звёзд)

6. TEAM COMPOSITION RATING:
   1v1 Score (как он один)
   Team Score (как он в команде)
   Best Team Comp (какие 2-3 персонажа работают вместе)
```

---

## 🎯 СТРУКТУРА ВЫВОДА (HTML)

### Главная страница:

```html
┌─────────────────────────────────────────────────────────────┐
│  🎮 WH40K TACTICUS - ПЕРСОНАЛЬНЫЙ КАЛЬКУЛЯТОР ПЕРСОНАЖЕЙ  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [🗡️ ВЫБОР ПЕРСОНАЖА]  [🛡️ ВЫБОР ВРАГА]  [⚙️ НАСТРОЙКИ]   │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ DANTE           │  │ TYPHUS          │                 │
│  │ Legendary       │  │ Legendary       │                 │
│  │ HP: 90 → 225    │  │ HP: 120 → 300   │                 │
│  │ DMG: 11 → 440   │  │ DMG: 18 → 720   │                 │
│  │ ARM: 23 → 34    │  │ ARM: 25 → 37    │                 │
│  │                 │  │                 │                 │
│  │ Piercing 80%    │  │ Psychic 100%    │                 │
│  │ 5 hits (+1)     │  │ 1 hit           │                 │
│  └─────────────────┘  └─────────────────┘                 │
│         ↓                      ↓                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📊 ПОШАГОВЫЙ РАСЧЕТ                                 │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ Step 1: DamVar = 11 × 40 = 440                     │  │
│  │ Step 2: MAX[(440-37) vs (440×0.8)] = MAX(403 vs 352) = 403 │
│  │ Step 3: 403 × 1.0 (terrain) = 403                 │  │
│  │ Step 4: 403 × 6 (hits) = 2418                     │  │
│  │ Step 5: 2418 × 0.7 (Terrifying) = 1693            │  │
│  │ Step 6: 1693 × 1.0 (no defense) = 1693            │  │
│  │ ─────────────────────────────────────────────────  │  │
│  │ ФИНАЛ: 1693 урона! ✅ DANTE ВЫИГРЫВАЕТ             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📈 МЕТРИКИ:                                         │  │
│  │  Attack%: 564% (1693/300 HP)                       │  │
│  │  Defense%: 95% (Dante очень безопасен)             │  │
│  │  Average%: 330% ← DANTE УНИЧТОЖАЕТ! 🟢🟢🟢          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 🤝 СИНЕРГИЯ И КОМАНДЫ:                              │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ ✅ ЛУЧШИЕ ПАРТНЁРЫ:                                │  │
│  │  1. Mephiston (Psyker + Rapid) ⭐⭐⭐⭐⭐           │  │
│  │     + 80% damage через Psychic стак                │  │
│  │  2. Kharn (Reflect + Rapid) ⭐⭐⭐⭐⭐              │  │
│  │     + 60% damage через Final Vengeance             │  │
│  │  3. Azrael (Overwatch) ⭐⭐⭐⭐                   │  │
│  │     + первый удар, враг не может полностью ответить│  │
│  │                                                     │  │
│  │ ⚠️ КОНТРПИКИ ПРОТИВ DANTE:                        │  │
│  │  • Galatian (Projectile 5% pierce НО Overwatch)  │  │
│  │  • Arjac (Deep Strike + Unstoppable)              │  │
│  │  • Macer (Aggressive Onslaught + tank)            │  │
│  │                                                     │  │
│  │ 🔥 ЛУЧШАЯ КОМАНДА С DANTE:                        │  │
│  │  Dante + Mephiston + Azrael = Flying Team          │  │
│  │  Synergy: +200% damage total через стак            │  │
│  │  Rating: ⭐⭐⭐⭐⭐ (10/10 for PvP)                │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📊 MULTI-TURN POTENTIAL (vs Typhus):               │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ Turn 1: 1693 damage → Typhus = 301/300 HP      │  │
│  │ Turn 2: 1693 damage → TYPHUS DEAD ☠️              │  │
│  │ Total: 2 rounds to kill                           │  │
│  │                                                     │  │
│  │ vs Galatian (Tank):                               │  │
│  │ Turn 1: 1693 damage / 200 armor = 450 final     │  │
│  │ Turn 2: 450 damage → Galatian = 1450/600 HP   │  │
│  │ Turn 3: 450 damage → Galatian = 1000/600 HP   │  │
│  │ Turn 4: 450 damage → Galatian = 550/600 HP    │  │
│  │ Turn 5: 450 damage → GALATIAN DEAD             │  │
│  │ Total: 5 rounds to kill                          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  [🔄 РАССЧИТАТЬ] [📋 ЭКСПОРТ CSV] [🎯 МАТРИЦА ВСЕХ]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 ДЕТАЛЬНАЯ ПАНЕЛЬ (при клике на персонажа)

```html
┌──────────────────────────────────────────────────────────────┐
│  DANTE - Detali Panel                                        │
├──────────┬─────────────┬─────────────┬──────────────────────┤
│ 📊      │ 🤝          │ ⚠️          │ 📈                   │
│ Анализ  │ Синергия    │ Контры      │ Динамика             │
├──────────┴─────────────┴─────────────┴──────────────────────┤
│                                                              │
│ 📋 БАЗОВЫЕ СТАТЫ:                                          │
│  HP: 90 (Legendary ×2.5) = 225 effective                   │
│  DMG: 11 (Legendary ×40) = 440 effective                   │
│  ARM: 23 (базовая)                                         │
│                                                              │
│ ⚔️ АТАКА:                                                  │
│  Melee: Piercing (80% pierce) / 5 hits (+1 from Rapid)    │
│  Ranged: Piercing (80% pierce) / 4 hits, Range 2          │
│                                                              │
│ 🎭 TRAITS (6):                                            │
│  • Flying (контроль карты, +50 mobility)                  │
│  • Deep Strike (телепортация, +40 mobility)               │
│  • Final Vengeance (отражение 30-50% damage)              │
│  • Rapid Assault (extra hit +20% damage)                  │
│  • Terrifying (враги -30% effective)                      │
│  • Parry (шанс избежать урона)                            │
│                                                              │
│ 💪 ПАССИВ: Lord of the Host                              │
│  • Все соседние союзники получают +X damage              │
│  • Common: +20, Legendary: +200 damage per ally            │
│  • Effect: +3 allies × 200 = +600 total team damage!      │
│                                                              │
│ ⚡ АКТИВ: Light of Sanguinius                             │
│  • 5x Melta damage (2493-2992 Legendary)                   │
│  • +30% Damage Reduction                                   │
│  • Heal himself: X HP                                      │
│  • Cooldown: ? turns                                       │
│                                                              │
│ 📊 РАРИТИ МАСШТАБИРОВАНИЕ:                                │
│  Common (Lv8): базовые статы × 1                          │
│  Uncommon (Lv17): × 2.2                                    │
│  Rare (Lv26): × 5.4                                        │
│  Epic (Lv35): × 11.5                                       │
│  Legendary (Lv50): × 40 ← DANTE IS HERE                   │
│  Mythic (Lv55): × 45                                       │
│                                                              │
│ 🎯 ЭФФЕКТИВНОСТЬ vs ТИПИЧНЫЕ ВРАГИ:                      │
│  vs Typhus (Psychic): Average% = 330% 🟢 ВЫИГРЫШ         │
│  vs Galatian (Projectile 5%): Average% = 120% 🟢         │
│  vs Titus (Power 40%): Average% = 240% 🟢                 │
│  vs Snotflogga (Physical 1%): Average% = 400% 🟢🟢🟢      │
│                                                              │
│ ═══════════════════════════════════════════════════════════│
│ 🤝 СИНЕРГИЯ И КОМАНДЫ:                                   │
│ ═══════════════════════════════════════════════════════════│
│                                                              │
│ ✅ ЛУЧШИЕ ПАРТНЁРЫ:                                       │
│                                                              │
│  1️⃣  MEPHISTON (Psyker + Rapid)  ⭐⭐⭐⭐⭐             │
│     Пассив: Fury of the Ancients                          │
│     → Synergy: Psychic Stack (Dante 80% + Meph 100%)     │
│     → Effect: +80% enemy vulnerability                     │
│     → Total Team Damage: +120%                            │
│     → Best For: vs Tanks                                  │
│                                                              │
│  2️⃣  KHARN (Reflect + Rapid)  ⭐⭐⭐⭐⭐               │
│     Пассив: Warmaster's Wrath                            │
│     → Synergy: Double Reflection (Dante + Kharn)         │
│     → Effect: Each hit reflects damage back              │
│     → Total Team Damage: +150% через reflection           │
│     → Best For: vs High Damage enemies                     │
│                                                              │
│  3️⃣  AZRAEL (Overwatch)  ⭐⭐⭐⭐                      │
│     Пассив: Overwatch                                    │
│     → Synergy: First Strike Advantage                    │
│     → Effect: Azrael shoots first, then Dante           │
│     → Damage Combo: Azrael (200) + Dante (1700) = 1900  │
│     → Best For: vs Fragile enemies                        │
│                                                              │
│ ⚠️ КОНТРПИКИ (как защищаться):                           │
│                                                              │
│  ❌ GALATIAN (Projectile 5% pierce, Overwatch)           │
│     Why: Low pierce doesn't work well against Dante      │
│     Counter: Use Psychic or Flying to avoid Overwatch    │
│     Defense Strategy: Don't engage close, use range       │
│                                                              │
│  ❌ ARJAC (Deep Strike + Unstoppable)                    │
│     Why: Can appear anywhere, ignore Dante's positioning  │
│     Counter: Use Rapid Assault to kill faster            │
│     Defense Strategy: Build HP buffer with support        │
│                                                              │
│  ❌ MACER (Aggressive Onslaught + tanky)                 │
│     Why: Can scale armor infinitely over turns            │
│     Counter: One-shot potential or multi-turn damage      │
│     Defense Strategy: Use team support for burst damage    │
│                                                              │
│ 💡 BEST TEAM COMPOSITIONS:                               │
│                                                              │
│  🔥 FLYING TEAM (Dante + Aethana + Ahriman):             │
│     Synergy: All Flying = map control + positioning       │
│     Effect: +100% mobility, avoid terrain ловушек         │
│     Strengths: Can position anywhere, escape easily       │
│     Weaknesses: Low tanking (all fragile)                 │
│     Rating: ⭐⭐⭐⭐⭐ (Best for Arena)                 │
│                                                              │
│  ⚔️  PSYCHIC STACK (Dante + Mephiston + Ahriman):         │
│     Synergy: All Piercing/Psychic = enemy armor useless   │
│     Effect: Average +150% damage vs armored enemies       │
│     Strengths: Works vs tanks                             │
│     Weaknesses: No healing, no tank                       │
│     Rating: ⭐⭐⭐⭐ (Best for vs Tanks)                 │
│                                                              │
│  🛡️  TANK + DPS (Dante + Galatian + Anuphet):            │
│     Synergy: Galatian tanks + Anuphet heals + Dante DPS   │
│     Effect: Sustained damage + survivability              │
│     Strengths: Can sustain long fights                    │
│     Weaknesses: Slower kill time                          │
│     Rating: ⭐⭐⭐⭐ (Best for Campaign/Raids)           │
│                                                              │
│ 📈 MULTI-TURN DAMAGE PROGRESSION:                        │
│                                                              │
│  Turn 1: 1693 DPS (базовый урон)                         │
│  Turn 2: 1693 DPS (тот же, без scale)                    │
│  BUT: If Calgar в команде:                               │
│  Turn 1: 1693 + 200 (Calgar buff) = 1893 DPS             │
│  Turn 2: 1893 + 300 (Calgar turn 2) = 2193 DPS           │
│  Turn 3: 2193 + 400 (стакующийся buff) = 2593 DPS        │
│  → Multi-turn potential: +50% damage by turn 3            │
│                                                              │
│ 🎯 РЕКОМЕНДАЦИИ:                                         │
│  ✅ Best vs: Typhus, Titus, Kharn, любой Tanк          │
│  ❌ Avoid vs: Galatian (Overwatch), Arjac (Deep Strike)  │
│  🏆 Best Placement: Backline (Flying позволяет!)        │
│  💪 Best Partners: Mephiston, Kharn, Azrael             │
│                                                              │
│ [🔄 ОБНОВИТЬ] [📊 СРАВНИТЬ С ДРУГИМ] [💾 СОХРАНИТЬ]    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ

### Backend (JSON обработка):

```javascript
1. Parse Characters Database
   ├─ Load all 108 characters
   ├─ Extract stats, traits, abilities
   └─ Calculate rarity multipliers

2. Build Synergy Matrix
   ├─ Faction detection (Ultramarines, Death Guard, и т.д.)
   ├─ Trait-based synergies (Heavy Weapon + Spotter, и т.д.)
   ├─ Role-based teams (Tank + Support + DPS)
   └─ Store synergy scores for each pair

3. Calculate All Matchups
   ├─ For each character vs each other (108×108 = 11,664)
   ├─ Apply full damage formula
   ├─ Calculate multi-turn potential
   ├─ Store results in matrix
   └─ Cache for performance

4. Generate Recommendations
   ├─ Find best partners for character
   ├─ Find counters to character
   ├─ Suggest best team compositions
   └─ Rate team synergy
```

### Frontend (UI/UX):

```html
1. Character Selection
   ├─ Dropdown с поиском
   ├─ Фото персонажа
   ├─ Быстрые статы (HP/DMG/ARM)
   └─ Traits иконки

2. Main Calculator View
   ├─ Two sides (Attacker | Defender)
   ├─ Auto-fill stats when selected
   ├─ Terrain selector
   ├─ Pairwise metrics (Attack%, Defense%, Average%)
   └─ Color-coded outcome (🟢🟡🔴)

3. Detailed Panel (modal)
   ├─ Tabs: Analysis | Synergy | Counters | Dynamics
   ├─ Stats breakdown
   ├─ Best partners list
   ├─ Counter warnings
   ├─ Multi-turn graph
   └─ Team recommendations

4. Matrix View (grid)
   ├─ 108×108 cells (or filterable subset)
   ├─ Color heat map (green/yellow/red)
   ├─ Hover to see quick stats
   ├─ Click to open detailed comparison
   ├─ Sort by: Damage, Synergy, Win Rate, и т.д.
   └─ Export as CSV/JSON

5. Team Builder
   ├─ Add characters to team (3-5 slots)
   ├─ See team synergy score
   ├─ Show best vs X comp
   ├─ Show counters to this team
   └─ Suggest improvements
```

---

## 📊 ДАННЫЕ ДЛЯ ХРАНЕНИЯ

### Per Character:

```json
{
  "id": "dante_001",
  "name": "Dante",
  "rarity": "Legendary",
  "faction": "Blood Angels",
  
  "baseStats": {
    "hp": 90,
    "dmg": 11,
    "arm": 23,
    "mov": 4
  },
  
  "rarityMultiplier": 40,
  
  "attacks": {
    "melee": {
      "type": "Piercing",
      "pierce": 80,
      "hits": 5,
      "range": 1
    },
    "ranged": {
      "type": "Piercing",
      "pierce": 80,
      "hits": 4,
      "range": 2
    }
  },
  
  "traits": [
    "Flying",
    "Deep Strike",
    "Final Vengeance",
    "Rapid Assault",
    "Terrifying",
    "Parry"
  ],
  
  "passiveAbility": {
    "name": "Lord of the Host",
    "type": "AURA_BUFF",
    "scope": "friendly_surrounding",
    "effect": "+X damage",
    "values": {
      "common": 20,
      "legendary": 200
    }
  },
  
  "activeAbility": {
    "name": "Light of Sanguinius",
    "type": "DAMAGE_WITH_BUFF",
    "damageType": "Melta",
    "values": {
      "common": "22-30",
      "legendary": "2493-2992"
    },
    "secondaryEffect": "Damage Reduction 30-35%"
  },
  
  "synergies": [
    {
      "partner": "mephiston_001",
      "bonus": 0.80,
      "reason": "Psychic Stack"
    },
    {
      "partner": "kharn_001",
      "bonus": 0.60,
      "reason": "Final Vengeance + Rapid"
    }
  ],
  
  "counters": [
    {
      "enemy": "galatian_001",
      "difficulty": "HARD",
      "reason": "Overwatch + Low Pierce"
    }
  ],
  
  "bestTeams": [
    {
      "name": "Flying Team",
      "composition": ["dante", "aethana", "ahriman"],
      "score": 9.5,
      "rating": "⭐⭐⭐⭐⭐"
    }
  ]
}
```

### Per Matchup:

```json
{
  "attacker": "dante_001",
  "defender": "typhus_001",
  
  "calculationSteps": {
    "step1_damvar": { value: 440, formula: "11 * 40" },
    "step2_armor": { value: 403, formula: "MAX(440-37 vs 440*0.8)" },
    "step3_terrain": { value: 403, formula: "403 * 1.0" },
    "step4_hits": { value: 2418, formula: "403 * 6" },
    "step5_traits": { value: 1693, formula: "2418 * 0.7" },
    "step6_defense": { value: 1693, formula: "1693 * 1.0" }
  },
  
  "finalDamage": 1693,
  "attackPercent": 564,
  "defensePercent": 95,
  "averagePercent": 330,
  "outcome": "WIN",
  
  "multiTurn": {
    "turn1": { damage: 1693, enemyHp: 300 },
    "turn2": { damage: 1693, enemyHp: 0, dead: true }
  }
}
```

---

## 🎯 ПРИОРИТЕТ ЗАДАЧ

### Phase 1 (MVP - 40% effort):
- ✅ Загрузка JSON базы
- ✅ Полная формула расчета урона
- ✅ 108×108 матрица матчапов
- ✅ Цветовая кодировка (🟢🟡🔴)
- ✅ Основной калькулятор

### Phase 2 (Core Features - 35% effort):
- ✅ Синергия и командные эффекты
- ✅ Multi-turn damage scaling
- ✅ Detailed character panels
- ✅ Best partners / Counters
- ✅ Team composition builder

### Phase 3 (Polish - 25% effort):
- ✅ UI/UX improvements
- ✅ Performance optimization
- ✅ Export (CSV, JSON)
- ✅ Mobile responsiveness
- ✅ Caching / Local storage

---

## 📦 DELIVERABLES

1. **HTML приложение** (`tacticus_matrix_v2.html`)
   - Полностью автономное
   - Работает без интернета
   - Все данные в памяти

2. **Data файл** (`tacticus_characters_matrix.json`)
   - Все 108 персонажей
   - Все 11,664 матчапа
   - Все синергии

3. **CSS/JS модули** (опционально)
   - Отдельные файлы для загрузки больших данных
   - Optimization для production

4. **Документация** (`README.md`)
   - Как использовать
   - Описание всех возможностей
   - Примеры для каждой метрики

---

## ✅ КРИТЕРИИ УСПЕХА

- ✅ Калькулятор рассчитывает урон с погрешностью <1%
- ✅ Все 108 персонажей загружаются и работают
- ✅ Матрица матчапов генерируется <3 секунд
- ✅ Синергия рекомендации работают логично
- ✅ UI интуитивен для новичков
- ✅ Performance на мобильных (50KB+ данных)

---

**📝 ГОТОВО К РАЗРАБОТКЕ!**

*Все требования, формулы, данные структуры и UI/UX переспеции определены.*  
*AI агент имеет всё необходимое для создания production-ready приложения.*

**ПУС РАЗРАБОТКА!** 🚀🎮
