
(async () => {
  const characters = [
	"Atlacoya","Brother_Burchard","Corrodius","Wrask","Winged_Prime","Thaumachus","Shiron","Nauseous_Rotbone","Kut_Skoden","Lucien","Incisus","Isaak",
  ];

  function waitRandom(min, max) {
    return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
  }

  function clean(t) {
    return t.replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
  }

  // ========== ПАРСЕРЫ ==========

  function findFaction(doc) {
    let factionElements = doc.querySelectorAll('.pi-item');
    for (let el of factionElements) {
      let label = el.querySelector('.pi-data-label')?.textContent.trim();
      if (label && label.toLowerCase().includes('faction')) {
        let link = el.querySelector('.pi-data-value a');
        if (link && link.textContent.trim().length > 1) {
          return clean(link.textContent);
        }
        let value = el.querySelector('.pi-data-value')?.textContent.trim();
        if (value && value.length > 1 && !value.toLowerCase().includes('character')) {
          return clean(value);
        }
      }
    }
    
    let catLinks = Array.from(doc.querySelectorAll('#mw-normal-catlinks a, .mw-normal-catlinks a'));
    for (let i = 1; i < catLinks.length; i++) {
      let cat = catLinks[i].textContent.trim();
      if (!cat.includes('Character') && !cat.includes('character') && cat.length > 2) {
        return clean(cat);
      }
    }
    
    let firstP = doc.querySelector('.mw-parser-output > p');
    if (firstP) {
      let text = firstP.textContent;
      let m = text.match(/is a character of the\s+([^.]+?)(?:\s+faction)?\.?/i);
      if (m && m[1]) {
        return clean(m[1]);
      }
    }
    
    return "Unknown";
  }

  function parseTraits(doc) {
    const traits = [];
    
    let traitElements = doc.querySelectorAll('.pi-item');
    for (let el of traitElements) {
      let label = el.querySelector('.pi-data-label')?.textContent.trim();
      if (label && label.toLowerCase().includes('trait')) {
        let valueDiv = el.querySelector('.pi-data-value');
        if (valueDiv) {
          let links = valueDiv.querySelectorAll('a');
          if (links.length > 0) {
            links.forEach(link => {
              let text = link.textContent.trim();
              if (text && text.length > 1) {
                traits.push(text);
              }
            });
          } else {
            let text = valueDiv.textContent.trim();
            if (text && text.length > 1) {
              let parts = text.split(/[,\n/]/).map(p => clean(p)).filter(p => p.length > 1);
              traits.push(...parts);
            }
          }
          break;
        }
      }
    }
    
    return traits;
  }

  function findAbility(doc, type) {
    const typeRegex = new RegExp(`${type}\\s+Ability`, 'i');
    let abilityHeader = Array.from(doc.querySelectorAll('h2, h3')).find(h =>
      typeRegex.test(h.textContent)
    );
    if (!abilityHeader) throw new Error(`❌ ${type} Ability header not found!`);

    let name = "";
    let description = "";
    let tables = [];
    let allContent = "";
    
    let current = abilityHeader.nextElementSibling;
    while (current && !/^H[1-6]$/.test(current.tagName)) {
      if (current.tagName === 'P') {
        allContent += " " + current.textContent;
      } else if (current.tagName === 'TABLE') {
        let tableRows = [];
        current.querySelectorAll('tr').forEach(tr => {
          let row = Array.from(tr.children).map(td => clean(td.textContent));
          tableRows.push(row);
        });
        if (tableRows.length > 0) {
          tables.push(tableRows);
        }
      }
      current = current.nextElementSibling;
    }
    
    allContent = clean(allContent).trim();
    
    if (!allContent || allContent.length < 10) {
      throw new Error(`❌ ${type} Ability content is empty!`);
    }

    let firstP = abilityHeader.nextElementSibling;
    if (firstP && firstP.tagName === "P") {
      let bold = firstP.querySelector("b,strong,u,i");
      if (bold) {
        let bText = clean(bold.textContent);
        if (bText && bText.length > 2 && bText.length < 100) {
          name = bText;
        }
      }
    }

    if (!name) {
      let firstSentence = allContent.split(/[.!?]/)[0].trim();
      if (firstSentence && firstSentence.length > 2 && firstSentence.length < 100) {
        name = firstSentence;
      }
    }

    if (!name) {
      let headline = abilityHeader.querySelector('.mw-headline');
      if (headline) {
        name = clean(headline.textContent.replace(typeRegex, '')).trim();
      }
    }

    if (!name || name.length < 2) {
      throw new Error(`❌ ${type} Ability name is empty!`);
    }

    description = allContent;
    if (allContent.indexOf(name) === 0) {
      description = allContent.slice(name.length).replace(/^\s*[.\-:—]*\s*/, "").trim();
    }

    if (!description || description.length < 5) {
      throw new Error(`❌ ${type} Ability description is empty!`);
    }

    return { name, description, tables };
  }

  function parseUpgradesTable(rows, tier) {
    if (!rows || rows.length < 2) return [];
    
    const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, "_"));
    const upgrades = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const upgrade = { tier };
      
      for (let j = 0; j < headers.length; j++) {
        let cell = row[j] || "";
        
        if (headers[j] !== "current_rank") {
          let items = cell
            .split(/<\s*hr\s*\/?\s*>|\n|\s{2,}/gi)
            .map(x => clean(x))
            .filter(x => x.length > 1);
          
          upgrade[headers[j]] = items.length > 1 ? items : [cell.trim()];
        } else {
          upgrade[headers[j]] = cell.trim();
        }
      }
      
      upgrades.push(upgrade);
    }
    
    return upgrades;
  }

  function parseEquipment(doc) {
    const equipment = { slot1: null, slot2: null, slot3: null };
    
    doc.querySelectorAll('h2, h3').forEach(h => {
      if (h.textContent.includes('Equipment')) {
        let next = h.nextElementSibling;
        
        while (next && !/^H[2-3]$/.test(next.tagName)) {
          if (next.tagName === 'P') {
            let txt = next.textContent;
            
            let m1 = txt.match(/Slot\s+1[:\s]*([^(]*)\s*\(([^)]+)\)/i) || txt.match(/Slot\s+1[:\s]*([^\n]+?)(?=Slot|$)/i);
            let m2 = txt.match(/Slot\s+2[:\s]*([^(]*)\s*\(([^)]+)\)/i) || txt.match(/Slot\s+2[:\s]*([^\n]+?)(?=Slot|$)/i);
            let m3 = txt.match(/Slot\s+3[:\s]*([^(]*)\s*\(([^)]+)\)/i) || txt.match(/Slot\s+3[:\s]*([^\n]+?)(?=$)/i);
            
            if (m1) {
              let type1 = m1[1] ? clean(m1[1]) : "";
              let items1 = m1[2] ? clean(m1[2]) : "";
              equipment.slot1 = items1 ? `${type1} ${items1}`.trim() : type1;
            }
            if (m2) {
              let type2 = m2[1] ? clean(m2[1]) : "";
              let items2 = m2[2] ? clean(m2[2]) : "";
              equipment.slot2 = items2 ? `${type2} ${items2}`.trim() : type2;
            }
            if (m3) {
              let type3 = m3[1] ? clean(m3[1]) : "";
              let items3 = m3[2] ? clean(m3[2]) : "";
              equipment.slot3 = items3 ? `${type3} ${items3}`.trim() : type3;
            }
          }
          next = next.nextElementSibling;
        }
      }
    });
    
    return equipment;
  }

  function parsePageDoc(doc, name) {
    const data = {
      name: name.replace(/_/g, " "),
      faction: null,
      description: null,
      baseStats: { health: null, armour: null, damage: null },
      attacks: { melee: "N/A", ranged: "N/A" },
      movement: null,
      traits: [],
      rarity: null,
      activeAbility: { name: null, description: null, tables: [] },
      passiveAbility: { name: null, description: null, tables: [] },
      equipment: { slot1: null, slot2: null, slot3: null },
      upgrades: { description: null, tables: [] },
      images: { heroArt: null, heroIcon: null },
      rawInfobox: {}
    };

    // 1️⃣ Описание
    const p = doc.querySelector('.mw-parser-output > p');
    if (p && p.textContent.trim().length > 10) {
      data.description = clean(p.textContent);
    }

    // 2️⃣ Инфобокс
    let infoboxObj = {};
    doc.querySelectorAll('.pi-item').forEach(el => {
      const l = el.querySelector('.pi-data-label')?.textContent.trim();
      const v = el.querySelector('.pi-data-value')?.textContent.trim();
      
      if (l && v) {
        infoboxObj[l] = v;
        
        if (l.includes('Health')) data.baseStats.health = v;
        if (l.includes('Armour') || l.includes('Armor')) data.baseStats.armour = v;
        if (l.includes('Damage')) data.baseStats.damage = v;
        if (l === 'Movement') data.movement = v;
        if (l.includes('Rarity')) data.rarity = v;
        if (l.includes('Melee Attack')) data.attacks.melee = v;
        if (l.includes('Ranged Attack')) data.attacks.ranged = v;
      }
    });
    
    data.rawInfobox = infoboxObj;

    // 3️⃣ Фракция
    try {
      data.faction = findFaction(doc);
    } catch (e) {
      data.faction = "Unknown";
    }

    // 4️⃣ Черты
    try {
      data.traits = parseTraits(doc);
    } catch (e) {
      console.error(`  Traits parsing warning: ${e.message}`);
    }

    // 5️⃣ Активная способность
    try {
      const activeData = findAbility(doc, 'Active');
      data.activeAbility.name = activeData.name;
      data.activeAbility.description = activeData.description;
      data.activeAbility.tables = activeData.tables;
    } catch (e) {
      console.error(`  ${e.message}`);
      throw e;
    }

    // 6️⃣ Пассивная способность
    try {
      const passiveData = findAbility(doc, 'Passive');
      data.passiveAbility.name = passiveData.name;
      data.passiveAbility.description = passiveData.description;
      data.passiveAbility.tables = passiveData.tables;
    } catch (e) {
      console.error(`  ${e.message}`);
      throw e;
    }

    // 7️⃣ Экипировка
    data.equipment = parseEquipment(doc);

    // 8️⃣ Апгрейды
    let upgradesDescription = null;
    doc.querySelectorAll('h2, h3').forEach(h => {
      if (h.textContent.toLowerCase().includes('upgrade')) {
        let p = h.nextElementSibling;
        if (p && p.tagName === 'P') {
          upgradesDescription = clean(p.textContent);
        }
      }
    });
    
    data.upgrades.description = upgradesDescription;

    doc.querySelectorAll('table').forEach(tab => {
      let caption = tab.querySelector('caption')?.textContent.trim() || '';
      
      const tierPattern = /^(Stone|Bronze|Iron|Silver|Gold|Diamond|Adamantine)$/i;
      
      if (caption && tierPattern.test(caption)) {
        let rows = [];
        tab.querySelectorAll('tr').forEach(tr => {
          let cellData = Array.from(tr.children).map(td => clean(td.textContent));
          rows.push(cellData);
        });
        
        if (rows.length > 1) {
          const firstRowText = rows[0].join(' ').toLowerCase();
          if (firstRowText.includes('rank') || firstRowText.includes('current')) {
            let parsedUpgrades = parseUpgradesTable(rows, caption);
            data.upgrades.tables.push({
              tier: caption,
              ranks: parsedUpgrades
            });
          }
        }
      }
    });

    // 9️⃣ Images
    let heroArtImg = doc.querySelector('img[alt*="Ability"]');
    if (heroArtImg) {
      data.images.heroArt = heroArtImg.src;
    }
    
    let heroIconImg = doc.querySelector('img[alt*="Icon"]');
    if (heroIconImg) {
      data.images.heroIcon = heroIconImg.src;
    }

    return data;
  }

  // ========== РАЗДЕЛЕНИЕ ДАННЫХ НА 2 ФАЙЛА ==========

  function splitCharacterData(fullData) {
    const equipUpgrades = {
      name: fullData.name,
      faction: fullData.faction,
      equipment: fullData.equipment,
      upgrades: fullData.upgrades
    };

    const mainData = {
      name: fullData.name,
      faction: fullData.faction,
      description: fullData.description,
      baseStats: fullData.baseStats,
      attacks: fullData.attacks,
      movement: fullData.movement,
      traits: fullData.traits,
      rarity: fullData.rarity,
      activeAbility: fullData.activeAbility,
      passiveAbility: fullData.passiveAbility,
      images: fullData.images,
      rawInfobox: fullData.rawInfobox
    };

    return { equipUpgrades, mainData };
  }

  // ========== ОСНОВНОЙ ЦИКЛ ==========

  const wikiUrl = name => `https://tacticus.wiki.gg/wiki/${name}`;
  const results = [];
  const errors = [];

  console.log(`%c🚀 Начинаю парсинг ${characters.length} персонажей...`, 'color: #00ff00; font-weight: bold; font-size: 14px;');

  for (let i = 0; i < characters.length; i++) {
    const name = characters[i];
    console.log(`[${i+1}/${characters.length}] ${name}: загружаю...`);
    
    try {
      const resp = await fetch(wikiUrl(name));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      
      const html = await resp.text();
      const dom = new DOMParser().parseFromString(html, 'text/html');
      
      const parsed = parsePageDoc(dom, name);
      results.push(parsed);
      
      console.log(`✅ ${name} — OK (faction: ${parsed.faction})`);
    } catch (e) {
      console.error(`❌ ${name} — ОШИБКА: ${e.message}`);
      errors.push({ name, error: e.toString() });
      results.push({ name, error: e.toString() });
    }
    
    if (i < characters.length - 1) {
      await waitRandom(2000, 5000);
    }
  }

  // ========== РАЗДЕЛЕНИЕ И СОХРАНЕНИЕ ==========

  const equipUpgradesCharacters = [];
  const mainCharacters = [];

  results.forEach(char => {
    if (!char.error) {
      const { equipUpgrades, mainData } = splitCharacterData(char);
      equipUpgradesCharacters.push(equipUpgrades);
      mainCharacters.push(mainData);
    }
  });

  const summary = {
    total: characters.length,
    successful: results.filter(r => !r.error).length,
    failed: errors.length,
    errors: errors
  };

  console.log('\n' + '='.repeat(60));
  console.log('%c📊 ИТОГИ ПАРСИНГА:', 'color: #0099ff; font-weight: bold; font-size: 14px;');
  console.log('='.repeat(60));
  console.log(`  Всего персонажей: ${summary.total}`);
  console.log(`  %c✅ Успешно: ${summary.successful}`, 'color: #00ff00;');
  console.log(`  %c❌ Ошибок: ${summary.failed}`, 'color: #ff0000;');
  console.log('='.repeat(60) + '\n');

  // Файл 1: Экипировка + Апгрейды
  const equipUpgradesData = {
    meta: summary,
    characters: equipUpgradesCharacters
  };

  const equipUpgradesString = JSON.stringify(equipUpgradesData, null, 2);
  const equipUpgradesBlob = new Blob([equipUpgradesString], { type: 'application/json' });
  const equipUpgradesUrl = URL.createObjectURL(equipUpgradesBlob);
  
  const equipUpgradesLink = document.createElement('a');
  equipUpgradesLink.href = equipUpgradesUrl;
  equipUpgradesLink.download = 'tacticus_equipment_upgrades.json';
  equipUpgradesLink.click();

  console.log('%c💾 Файл 1: tacticus_equipment_upgrades.json скачан!', 'color: #00aa00; font-weight: bold;');

  // Файл 2: Основные данные
  setTimeout(() => {
    const mainDataObj = {
      meta: summary,
      characters: mainCharacters
    };

    const mainDataString = JSON.stringify(mainDataObj, null, 2);
    const mainDataBlob = new Blob([mainDataString], { type: 'application/json' });
    const mainDataUrl = URL.createObjectURL(mainDataBlob);
    
    const mainDataLink = document.createElement('a');
    mainDataLink.href = mainDataUrl;
    mainDataLink.download = 'tacticus_main_data.json';
    mainDataLink.click();

    console.log('%c💾 Файл 2: tacticus_main_data.json скачан!', 'color: #00aa00; font-weight: bold;');
    console.log('%c🎉 ВСЕ ФАЙЛЫ ГОТОВЫ! Используй name + faction для поиска пересечений!', 'color: #ffff00; font-weight: bold; font-size: 14px;');
  }, 500);
})();