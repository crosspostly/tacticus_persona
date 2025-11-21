(async () => {
  // Список имён персонажей
  const characters = [
    "Abaddon_The_Despoiler","Abraxas","Actus","Adamatar","Aesoth","Aethana","Ahriman","Aleph-Null",
    "Ancient_Thoread","Angrax","Anuphet","Archimatos","Arjac","Asmodai","Atlacoya","Aun'Shi","Azkor","Azrael",
    "Baraqiel","Bellator","Boss_Gulgortz","Brother_Burchard","Brother_Jaeger","Calandis","Castellan_Creed",
    "Celestine","Certus","Commissar_Yarrick","Corrodius","Dante","Darkstrider","Deathleaper","Eldryon",
    "Exitor-Rho","Forcas","Gibbascrapz","Haarken_Worldclaimer","High_Marshal_Helbrecht","Hollan","Imospekh",
    "Incisus","Isaak","Isabella","Jain_Zar","Judh","Kariyan","Kharn","Kut_Skoden","Lucien","Lucius","Macer",
    "Makhotep","Maladus","Marneus_Calgar","Marshal_Dreir","Mataneo","Maugan_Ra","Mephiston","Morvenn_Vahl",
    "Nauseous_Rotbone","Neurothrope","Nicodemus","Njal","Parasite_of_Mortrex","Pestillian","Ragnar","Re'vas",
    "Roswitha","Sarquael","Shadowsun","Shiron","Sho'syl","Sibyll_Devine","Snappawrecka","Snotflogga",
    "Sword_Brother_Godswyl","Sy-Gex","Tan_Gi'da","Tanksmasha","Tarvakh","Thaddeus_Noble","Thaumachus",
    "The_Patermine","Thutmose","Titus","Tjark","Toth","Trajann","Typhus","Tyrant_Guard","Tyrith","Ulf",
    "Varro_Tigurius","Vindicta","Vitruvius","Volk","Winged_Prime","Wrask","Xybia","Yazaghor"
  ];

  // Ждет случайную задержку от min до max (миллисекунд)
  function waitRandom(min, max) {
    return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
  }

  // Удобный парсер текста внутри тега
  function clean(t) {
    return t.replace(/\s+/g, " ").replace(/\n+/g," ").trim();
  }

  function parsePageDoc(doc, name) {
    const $ = doc.querySelector.bind(doc);

    // Имя, описание, фракция, базовые параметры
    const data = {
      name: name.replace(/_/g, " "),
      description: null,
      faction: "N/A",
      baseStats: { health: null, armour: null, damage: null },
      attacks: { melee: "N/A", ranged: "N/A" },
      movement: null,
      traits: [],
      rarity: null,
      activeAbility: { name: null, description: null },
      passiveAbility: { name: null, description: null },
      equipment: { slot1: null, slot2: null, slot3: null },
      upgrades: [],
      images: {
        heroIcon: `https://tacticus.wiki.gg/images/${name}_Icon_Large.png`
      }
    };

    // 1. Описание - первый абзац на странице
    const p = doc.querySelector('.mw-parser-output > p');
    if (p && p.textContent.trim().length > 10) data.description = clean(p.textContent);

    // 2. Инфобокс/блоки базовых статов
    doc.querySelectorAll('.pi-item').forEach(el => {
      const l = el.querySelector('.pi-data-label')?.textContent.trim();
      const v = el.querySelector('.pi-data-value')?.textContent.trim();
      if (l === 'Faction') data.faction = v;
      if (l?.includes('Health')) data.baseStats.health = v;
      if (l?.includes('Armour')) data.baseStats.armour = v;
      if (l?.includes('Damage')) data.baseStats.damage = v;
      if (l === 'Movement') data.movement = v;
      if (l?.includes('Rarity')) data.rarity = v;
      if (l?.includes('Melee Attack')) data.attacks.melee = v;
      if (l?.includes('Ranged Attack')) data.attacks.ranged = v;
    });

    // 3. Черты (traits)
    doc.querySelectorAll('a[title*="Trait"], a[href*="Traits"]').forEach(a => {
      let t = clean(a.textContent);
      if (t && !data.traits.includes(t)) data.traits.push(t);
    });

    // 4. Активная/Пассивная способность (грубый парс)
    let activeH = Array.from(doc.querySelectorAll('h2,h3'))
      .find(h => /Active Ability/i.test(h.textContent));
    if (activeH) {
      let next = activeH.nextElementSibling;
      let desc = '';
      while (next && !/^H[2-3]$/.test(next.tagName)) {
        if (next.tagName === 'P') desc += ' ' + next.textContent;
        next = next.nextElementSibling;
      }
      data.activeAbility = {
        name: (activeH.querySelector('.mw-headline')?.textContent.replace(/Active Ability/i,'') || '').trim(),
        description: clean(desc)
      };
    }

    let passiveH = Array.from(doc.querySelectorAll('h2,h3'))
      .find(h => /Passive Ability/i.test(h.textContent));
    if (passiveH) {
      let next = passiveH.nextElementSibling;
      let desc = '';
      while (next && !/^H[2-3]$/.test(next.tagName)) {
        if (next.tagName === 'P') desc += ' ' + next.textContent;
        next = next.nextElementSibling;
      }
      data.passiveAbility = {
        name: (passiveH.querySelector('.mw-headline')?.textContent.replace(/Passive Ability/i,'') || '').trim(),
        description: clean(desc)
      };
    }

    // 5. Экипировка
    doc.querySelectorAll('li').forEach(li => {
      let t = li.textContent || '';
      let m1 = t.match(/Slot 1:?\s*(.+)/i);
      let m2 = t.match(/Slot 2:?\s*(.+)/i);
      let m3 = t.match(/Slot 3:?\s*(.+)/i);
      if (m1) data.equipment.slot1 = clean(m1[1]);
      if (m2) data.equipment.slot2 = clean(m2[1]);
      if (m3) data.equipment.slot3 = clean(m3[1]);
    });

    // 6. Прокачка (таблицы)
    doc.querySelectorAll('table').forEach(tab => {
      let hdr = tab.previousElementSibling;
      if (hdr && /Upgrades/i.test(hdr.textContent)) {
        let rows=[];
        tab.querySelectorAll('tr').forEach(tr=>{
          rows.push(Array.from(tr.children).map(td=>clean(td.textContent)));
        });
        data.upgrades.push(rows);
      }
    });

    return data;
  }

  // Ссылка на страницу
  const wikiUrl = name => `https://tacticus.wiki.gg/wiki/${name}`;

  const results = [];
  for (let i = 0; i < characters.length; i++) {
    const name = characters[i];
    console.log(`[${i+1}/${characters.length}] ${name}: загружаю...`);
    try {
      const resp = await fetch(wikiUrl(name));
      const html = await resp.text();
      const dom = document.implementation.createHTMLDocument("");
      dom.documentElement.innerHTML = html;
      const parsed = parsePageDoc(dom, name);
      results.push(parsed);
      console.log(`✅ ${name} — OK`);
    } catch (e) {
      results.push({name, error: e.toString()});
      console.warn(`❌ ${name} — ERROR`);
    }
    if (i < characters.length - 1) await waitRandom(1500, 4000); // задержка 1.5–4 сек.
  }
  // Скачивание результата
  const data = JSON.stringify(results, null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tacticus_characters.json';
  a.click();

  console.log('🎉 Сбор данных завершён и сохранён!');
})();
