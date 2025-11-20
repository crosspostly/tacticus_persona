# Tacticus Matchup Analyzer

## 📦 File Structure

```
├── index.html              # Main page
├── data.json              # Character data (JSON)
├── data.txt               # Character data (TXT) - Priority
├── synergy_database.json  # Synergy database (JSON)
├── synergy_database.txt   # Synergy database (TXT) - Priority
├── counter_database.json  # Counter database (JSON)
└── counter_database.txt   # Counter database (TXT) - Priority
```

## 🚀 Quick Start

### 1. Auto-Sync on Load
**Nothing to do!** When opening `index.html`:
- Automatically loads from `.txt` files (priority)
- Falls back to `.json` if `.txt` not found
- Shows loading status

### 2. Sync Button
Click "🔄 Sync" in top-right:
- Refreshes all databases
- Shows status for each
- Rebuilds table

### 3. Manual Upload
Click "📤 Upload TXT":
- Accepts `.txt` or `.json`
- Supports both formats
- For testing local files

## 📝 File Format

All files contain JSON (even .txt files):

```json
// data.txt / data.json
[
  {
    "name": "Character Name",
    "baseStats": { "health": "100", "armour": "25", "damage": "15" },
    "attacks": { "melee": "Power / 5 hits", "ranged": "Bolter / 3 hits" },
    "traits": "Trait1, Trait2",
    "faction": "Faction Name"
  }
]
```

## ⚠️ Important

1. **File Priority:**
   - `.txt` loads first
   - `.json` as fallback
   - Both must contain valid JSON

2. **Auto-Excluded:**
   - War machines automatically ignored

3. **Status Icons:**
   - ✅ = Data loaded
   - ⚠️ = Empty/not found
   - ❌ = Error

## 👨‍💻 Development

### Update Data
1. Update `.json` files
2. Copy content to `.txt` (same JSON)
3. Commit both
4. GitHub Pages auto-updates

### Test Locally
```bash
python -m http.server 8000
# Open: http://localhost:8000
```

## 🌟 Features

✅ Auto-sync on load  
✅ Priority `.txt` files  
✅ Fallback to `.json`  
✅ Status logs  
✅ Manual upload  
✅ Auto-ignore war machines  

---

🚀 **Ready to use!** Just open `index.html` and click "🔄 Sync"