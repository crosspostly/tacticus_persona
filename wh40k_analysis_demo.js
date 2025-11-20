// WH40K Tacticus - Analysis Demo
// Shows example counter and synergy analysis for specific characters

const fs = require('fs');

// Load the complete analysis
function loadAnalysis() {
    try {
        const data = fs.readFileSync('wh40k_complete_analysis.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading analysis:', error);
        return null;
    }
}

// Display character analysis
function displayCharacterAnalysis(characterName, analysis) {
    console.log(`\n🎮 ${characterName.toUpperCase()} 🎮`);
    console.log("=".repeat(50));
    
    // Basic info
    console.log(`\n📊 Базовая информация:`);
    console.log(`   Роль: ${analysis.role.join(", ")}`);
    console.log(`   Фракция: ${analysis.faction}`);
    console.log(`   Уровень силы: ${analysis.analysis.powerLevel}`);
    console.log(`   Универсальность: ${analysis.analysis.versatility}%`);
    
    // Stats
    const char = analysis.character;
    console.log(`\n⚔️ Характеристики:`);
    console.log(`   ХП: ${char.baseStats.health}`);
    console.log(`   Броня: ${char.baseStats.armour}`);
    console.log(`   Урон: ${char.baseStats.damage}`);
    console.log(`   Редкость: ${char.rarity}`);
    console.log(`   Трейты: ${char.traits.join(", ")}`);
    console.log(`   Атака: ${char.attacks.melee.type} ${char.attacks.melee.hits}х ${char.attacks.melee.pierce}% pierce`);
    
    // Warnings
    if (analysis.warnings.length > 0) {
        console.log(`\n⚠️ Предупреждения:`);
        analysis.warnings.forEach(warning => {
            console.log(`   • ${warning}`);
        });
    }
    
    // Counters
    console.log(`\n🛡️ КОНТРЫ (Top 5):`);
    if (analysis.counters.length === 0) {
        console.log("   Контры не найдены");
    } else {
        analysis.counters.forEach((counter, index) => {
            console.log(`\n   ${index + 1}. ${counter.name} [${counter.difficulty}]`);
            console.log(`      Причина: ${counter.reason}`);
            if (counter.explanation) {
                console.log(`      Объяснение: ${counter.explanation}`);
            }
            console.log(`      Эффективность: ${(counter.score * 100).toFixed(1)}%`);
            console.log(`      Источники: ${counter.sources.join(", ")}`);
        });
    }
    
    // Synergies
    console.log(`\n🤝 СИНЕРГИИ (Top 5):`);
    if (analysis.synergies.length === 0) {
        console.log("   Синергии не найдены");
    } else {
        analysis.synergies.forEach((synergy, index) => {
            console.log(`\n   ${index + 1}. ${synergy.name} [★${synergy.stars || synergy.rating}]`);
            console.log(`      Причина: ${synergy.reason}`);
            console.log(`      Бонус: +${(synergy.bonus * 100).toFixed(1)}%`);
            console.log(`      Счет: ${(synergy.score * 100).toFixed(1)}%`);
            console.log(`      Тип: ${synergy.type}`);
            console.log(`      Источники: ${synergy.sources.join(", ")}`);
        });
    }
    
    console.log("\n" + "=".repeat(50) + "\n");
}

// Main demo
function runDemo() {
    console.log("🎮 WH40K TACTICUS - ДЕМО АНАЛИЗА КОНТРОВ И СИНЕРГИИ 🎮");
    console.log("=".repeat(60));
    
    const analysisData = loadAnalysis();
    if (!analysisData) {
        console.log("❌ Не удалось загрузить данные анализа");
        return;
    }
    
    console.log(`📊 Загружено ${analysisData.metadata.totalCharacters} персонажей`);
    console.log(`📅 Анализ создан: ${analysisData.metadata.generated}`);
    console.log(`🔧 Версия: ${analysisData.metadata.version}\n`);
    
    // Example characters to analyze
    const exampleCharacters = [
        "Abaddon The Despoiler",
        "Dante", 
        "Typhus",
        "Mephiston",
        "Kharn the Betrayer"
    ];
    
    console.log("🎯 АНАЛИЗ ПРИМЕРНЫХ ПЕРСОНАЖЕЙ:\n");
    
    exampleCharacters.forEach(charName => {
        if (analysisData.characters[charName]) {
            displayCharacterAnalysis(charName, analysisData.characters[charName]);
        } else {
            console.log(`❌ Персонаж "${charName}" не найден в анализе\n`);
        }
    });
    
    // Show summary statistics
    console.log("📈 СТАТИСТИКА ПО ВСЕМ ПЕРСОНАЖАМ:");
    console.log("-".repeat(40));
    
    try {
        const summaryData = JSON.parse(fs.readFileSync('wh40k_analysis_summary.json', 'utf8'));
        
        console.log(`\n🎯 Общая статистика:`);
        console.log(`   Всего персонажей: ${summaryData.totalCharacters}`);
        console.log(`   Средний уровень силы: ${summaryData.averagePowerLevel}`);
        
        console.log(`\n🏆 Самые синергичные персонажи:`);
        summaryData.bestSynergies.forEach((char, index) => {
            console.log(`   ${index + 1}. ${char.name} - ${(char.score * 100).toFixed(1)}%`);
        });
        
        console.log(`\n🛡️ Самые контрящие персонажи:`);
        summaryData.mostCountered.forEach((char, index) => {
            console.log(`   ${index + 1}. ${char.name} - ${char.count} контров`);
        });
        
        console.log(`\n🏛️ Распределение по фракциям:`);
        Object.entries(summaryData.factionDistribution)
            .sort((a, b) => b[1] - a[1])
            .forEach(([faction, count]) => {
                console.log(`   ${faction}: ${count} персонажей`);
            });
        
        console.log(`\n⚔️ Распределение по ролям:`);
        Object.entries(summaryData.roleDistribution)
            .sort((a, b) => b[1] - a[1])
            .forEach(([role, count]) => {
                console.log(`   ${role}: ${count} персонажей`);
            });
        
    } catch (error) {
        console.error("❌ Не удалось загрузить статистику:", error);
    }
    
    console.log("\n🎉 ДЕМО ЗАВЕРШЕНО! 🎉");
    console.log("\n📝 Для полного анализа смотрите файлы:");
    console.log("   • wh40k_complete_analysis.json - Полный анализ всех персонажей");
    console.log("   • wh40k_analysis_summary.json - Статистика и сводки");
    console.log("   • wh40k_counter_synergy_analysis.html - Интерактивный интерфейс");
}

// Run the demo
if (require.main === module) {
    runDemo();
}

module.exports = { displayCharacterAnalysis, loadAnalysis };