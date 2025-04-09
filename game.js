const game = {
    player: {
        health: 100,
        strength: 5, // Новая стата для боёвки
        inventory: [],
        reputation: 0,
        tugriks: 0,
        quests: {},
        is_addicted: false,
        has_hiv: false,
        is_drunk: false,
        addictionTimer: null
    },

    locations: [
        { name: "Контейнер у 'Пятёрочки'", description: "Воняет тухлым борщом и надеждой. В углу ржавеет детская коляска.", items: ["полупустая бутылка 'Балтики'", "доширак", "ключ от квартиры", "битый кирпич"], danger_level: 2, unique_action: "разбить окно" },
        { name: "Гаражи за домом", description: "Темно, пахнет бензином и страхом. Здесь прячутся скинхеды.", items: ["чекушка 'Беленькой'", "ящик 'Жигулевского'", "ржавый гвоздь", "канистра бензина"], danger_level: 7, unique_action: "спиздить бензин" },
        { name: "Помойка у парадной", description: "Аристократическая помойка: битые чашки и шампанское.", items: ["банка тушёнки", "бабушкин суп", "кольцо с фианитом"], danger_level: 3, unique_action: "покормить кота" },
        { name: "Заброшенная квартира", description: "Заброшенная хата с ободранными обоями и запахом фентанила.", items: ["грязный шприц", "доза фентанила", "пустая пачка сигарет"], danger_level: 10, unique_action: "обыскать тайник" },
        { name: "Ломбард", description: "Тёмный закуток с мутным типом за стойкой.", items: ["ржавый гвоздь", "пустая пачка сигарет"], danger_level: 4, unique_action: "продать шмот" },
        { name: "Подвал", description: "Сырой подвал с крысами и шмотками.", items: ["старая куртка", "крысиный яд", "10 тугриков"], danger_level: 5, unique_action: "поймать крысу" },
        { name: "Парадная", description: "Обоссанная парадная с граффити 'Даня — лох'.", items: ["пакет с клеем", "мобильник без симки"], danger_level: 3, unique_action: "позвонить в домофон" }
    ],

    weather: "ясно",
    timeOfDay: "день",
    npcs: [
        { name: "Бабка с клюкой", location: "Помойка у парадной", quest: "принести суп", reward: { tugriks: 20, reputation: 10 } },
        { name: "Скинхед Петя", location: "Гаражи за домом", quest: "дать 'Жигулёвское'", reward: { strength: 2, reputation: 20 } },
        { name: "Менты", location: null, quest: null, effect: "шмон" }
    ],

    riddles: [
        {
            question: "Есть два стула — на одном пики точёные, на другом хуи дрочённые, на какой сам сядешь, на какой мать посадишь?",
            options: [
                "Сяду на пики, мать на хуи.",
                "Сяду на хуи, мать на пики.",
                "Возьму пики, срежу хуи, сам сяду на стул и мать на колени посажу.",
                "Оба стула сломаю и уйду."
            ],
            correct: 2
        }
    ],

    currentLocation: null,
    output: document.getElementById("output"),
    danyaOptions: document.getElementById("danya-options"),
    danyaActive: false,

    init() {
        this.loadGame();
        if (!this.currentLocation) this.currentLocation = this.locations[0];
        this.updateWeatherAndTime();
        this.updateGame();
    },

    saveGame() {
        localStorage.setItem("gameState", JSON.stringify({
            player: this.player,
            currentLocation: this.currentLocation,
            weather: this.weather,
            timeOfDay: this.timeOfDay
        }));
    },

    loadGame() {
        const saved = localStorage.getItem("gameState");
        if (saved) {
            const state = JSON.parse(saved);
            Object.assign(this.player, state.player);
            this.currentLocation = state.currentLocation;
            this.weather = state.weather;
            this.timeOfDay = state.timeOfDay;
        }
    },

    updateWeatherAndTime() {
        const weathers = ["ясно", "дождь", "снег"];
        const times = ["утро", "день", "вечер", "ночь"];
        if (Math.random() > 0.7) this.weather = weathers[Math.floor(Math.random() * weathers.length)];
        if (Math.random() > 0.5) this.timeOfDay = times[Math.floor(Math.random() * times.length)];
        if (this.weather === "дождь" && !this.player.inventory.includes("старая куртка")) {
            this.player.health -= 5;
            this.output.innerText += "\nДождь промочил тебя до костей. -5 HP";
        }
        if (this.timeOfDay === "ночь") {
            this.output.innerText += "\nНочь. Шмотки найти сложнее, но тугрики в тайниках.";
        }
    },

    updateStatus() {
        let status = `♥ Здоровье: ${this.player.health} | 💪 Сила: ${this.player.strength} | 🎭 Репутация: ${this.player.reputation} | 💰 Тугрики: ${this.player.tugriks}\n`;
        status += `🎒 Инвентарь: ${this.player.inventory.length > 0 ? this.player.inventory.join(", ") : "пусто"}\n`;
        status += `🌦 Погода: ${this.weather} | 🕒 Время: ${this.timeOfDay}\n`;
        if (Object.keys(this.player.quests).length > 0) status += `📜 Квесты: ${Object.keys(this.player.quests).join(", ")}\n`;
        if (this.player.is_addicted) status += "💉 Ты зависим от фентанила!\n";
        if (this.player.has_hiv) status += "🩺 У тебя ВИЧ!\n";
        if (this.player.is_drunk) status += "🍺 Ты пьяный!\n";
        document.getElementById("status").innerText = status;
    },

    updateGame() {
        let text = `Вы находитесь: ${this.currentLocation.name}\n${this.currentLocation.description}`;
        if (this.timeOfDay === "ночь") text += " Ночь скрывает мусор.";
        if (this.weather === "дождь") text += " Дождь заливает всё вокруг.";

        if (this.currentLocation.name === "Заброшенная квартира" && !this.player.has_hiv && Math.random() > 0.5) {
            text += "\nОбдолбанный нарик втыкает в тебя грязный шприц!";
            this.startAddiction();
            this.player.has_hiv = true;
            this.player.health -= 20;
            text += "\nТы стал зависимым от фентанила и заразился ВИЧ! -20 HP";
        }

        if (this.player.health <= 0) {
            if (this.player.is_addicted) {
                text += "\nТы нашёл грязный шприц на улице, ширнулся и умер от заражения крови. Конец игры.";
            } else {
                text += "\nТы сгнил в питерских помойках. Конец игры.";
            }
            document.getElementById("actions").style.display = "none";
            clearInterval(this.player.addictionTimer);
        } else if (this.player.tugriks >= 1000) {
            text += "\nТы набрал 1000 тугриков! Снял хату, нашёл работу и выбрался из этого дерьма. Победа!";
            document.getElementById("actions").style.display = "none";
            clearInterval(this.player.addictionTimer);
        } else if (this.player.reputation >= 100) {
            text += "\nТы стал королём помойки! Все уважают тебя, даже скинхеды. Победа!";
            document.getElementById("actions").style.display = "none";
            clearInterval(this.player.addictionTimer);
        } else if (this.player.is_addicted && this.player.has_hiv && this.player.health < 20) {
            text += "\nТы сгнил в подвале, но стал легендой среди нариков. Конец игры.";
            document.getElementById("actions").style.display = "none";
            clearInterval(this.player.addictionTimer);
        }

        this.output.innerText = text;
        this.updateStatus();
        this.saveGame();

        if (this.player.tugriks >= 50 && Math.random() > 0.7) {
            this.tradeOpportunity();
        }
        if (Math.random() > 0.9) {
            this.randomEvent();
        }
    },

    startAddiction() {
        this.player.is_addicted = true;
        if (!this.player.addictionTimer) {
            this.player.addictionTimer = setInterval(() => {
                if (!this.player.inventory.includes("доза фентанила")) {
                    this.player.health -= 5;
                    this.output.innerText += "\nЛомка бьёт... -5 HP";
                    this.updateGame();
                }
            }, 10000);
        }
    },

    combineItems(item1, item2) {
        let text = "";
        if (item1 === "доширак" && item2 === "чекушка 'Беленькой'" && this.player.inventory.includes(item1) && this.player.inventory.includes(item2)) {
            this.player.inventory.splice(this.player.inventory.indexOf(item1), 1);
            this.player.inventory.splice(this.player.inventory.indexOf(item2), 1);
            this.player.inventory.push("горячий дошик");
            text = "Залил дошик чекушкой. Получился горячий дошик!";
        } else if (item1 === "ржавый гвоздь" && item2 === "старая куртка" && this.player.inventory.includes(item1) && this.player.inventory.includes(item2)) {
            this.player.inventory.splice(this.player.inventory.indexOf(item1), 1);
            this.player.inventory.splice(this.player.inventory.indexOf(item2), 1);
            this.player.inventory.push("штык-куртка");
            text = "Пришил гвоздь к куртке. Теперь это штык-куртка!";
        } else {
            text = "Это не комбинируется, дебил.";
        }
        this.output.innerText += "\n" + text;
        this.updateGame();
    },

    fight(attacker) {
        const enemies = {
            "крысы": { strength: 3, loot: "крысиный яд" },
            "скинхеды": { strength: 10, loot: "ящик 'Жигулевского'" },
            "пьяный дворник": { strength: 7, loot: "10 тугриков" },
            "наркоманы": { strength: 8, loot: "грязный шприц" }
        };
        let enemy = enemies[attacker];
        let playerStrength = this.player.strength + (this.player.inventory.includes("штык-куртка") ? 5 : 0);
        let text = "";

        if (playerStrength > enemy.strength) {
            text += `Ты уделал ${attacker}! Нашёл: ${enemy.loot}.`;
            this.player.inventory.push(enemy.loot);
            this.checkQuestCompletion(enemy.loot);
        } else {
            let damage = Math.floor(Math.random() * (enemy.strength - playerStrength + 1)) + 5;
            this.player.health -= damage;
            text += `${attacker} уделали тебя! -${damage} HP`;
        }
        return text;
    },

    miniGameGuessContainer() {
        let text = "\nТри бака перед тобой. В одном — шмотка. Угадай (1, 2, 3): ";
        this.output.innerText += text;
        let choice = prompt("Выбери бак (1, 2 или 3):");
        if (!choice || isNaN(choice) || choice < 1 || choice > 3) {
            this.output.innerText += "\nТы чё, дебил? Урон -5 HP за тупость.";
            this.player.health -= 5;
            this.updateGame();
            return;
        }

        let winningContainer = Math.floor(Math.random() * 3) + 1;
        if (parseInt(choice) === winningContainer) {
            let foundItem = this.currentLocation.items[Math.floor(Math.random() * this.currentLocation.items.length)];
            if (foundItem === "10 тугриков") {
                this.player.tugriks += 10;
                this.output.innerText += "\nУгадал! Нашёл 10 тугриков.";
            } else {
                this.player.inventory.push(foundItem);
                this.output.innerText += `\nУгадал! Нашёл: ${foundItem}.`;
            }
            this.checkQuestCompletion(foundItem);
        } else {
            let damage = Math.floor(Math.random() * 10) + 5;
            this.player.health -= damage;
            this.output.innerText += `\nПусто! Пока копался, пьяный бомж пнул тебя. -${damage} HP`;
        }
        this.updateGame();
    },

    miniGameRiddle() {
        let text = "\nГопник: 'Э, петух, докажи, что не лох! Отгадай:'";
        let riddle = this.riddles[Math.floor(Math.random() * this.riddles.length)];
        text += `\n${riddle.question}`;
        riddle.options.forEach((opt, i) => text += `\n${i + 1}. ${opt}`);
        this.output.innerText += text;

        let choice = prompt("Выбери ответ (1-4):");
        if (!choice || isNaN(choice) || choice < 1 || choice > 4) {
            this.output.innerText += "\nТы чё, дебил? Урон -5 HP за тупость.";
            this.player.health -= 5;
            this.updateGame();
            return;
        }

        if (parseInt(choice) - 1 === riddle.correct) {
            let reward = Math.floor(Math.random() * 20) + 10;
            this.player.tugriks += reward;
            this.output.innerText += `\nГопник: 'Молодец, петух! Вот тебе ${reward} тугриков.'`;
        } else {
            let damage = Math.floor(Math.random() * 10) + 5;
            this.player.health -= damage;
            this.output.innerText += `\nГопник: 'Лох ты!' *бьёт в рыло* -${damage} HP`;
        }
        this.updateGame();
    },

    tradeOpportunity() {
        let discount = this.player.reputation > 50 ? 10 : 0;
        let text = `\nБарыга: 'Есть ${this.player.tugriks} тугриков? Бери шмот!'\n`;
        text += `1 — Балтика (${50 - discount} тугриков), 2 — Доза (${70 - discount} тугриков), 3 — Мобильник (${100 - discount} тугриков), 4 — Отказаться`;
        this.output.innerText += text;
        let choice = prompt("Что берёшь? (1, 2, 3, 4):");

        if (choice === "1" && this.player.tugriks >= (50 - discount)) {
            this.player.tugriks -= (50 - discount);
            this.player.inventory.push("полная бутылка 'Балтики'");
            this.output.innerText += `\nКупил 'Балтику' за ${50 - discount} тугриков!`;
        } else if (choice === "2" && this.player.tugriks >= (70 - discount)) {
            this.player.tugriks -= (70 - discount);
            this.player.inventory.push("доза фентанила");
            this.output.innerText += `\nКупил дозу за ${70 - discount} тугриков!`;
        } else if (choice === "3" && this.player.tugriks >= (100 - discount)) {
            this.player.tugriks -= (100 - discount);
            this.player.inventory.push("мобильник без симки");
            this.output.innerText += `\nКупил мобильник за ${100 - discount} тугриков!`;
        } else if (choice === "4") {
            this.output.innerText += "\nБарыга плюнул тебе под ноги и ушёл.";
        } else {
            this.output.innerText += "\n'Чё бормочешь?' — барыга уходит.";
        }
        this.updateGame();
    },

    randomEvent() {
        const events = [
            () => {
                this.player.tugriks += 50;
                return "\nНашёл кошелёк на мусорке! +50 тугриков.";
            },
            () => {
                let loss = Math.floor(this.player.tugriks / 2);
                this.player.tugriks -= loss;
                return `\nПока спал, воры спиздили ${loss} тугриков!`;
            },
            () => {
                if (this.player.inventory.includes("доза фентанила")) {
                    this.player.inventory.splice(this.player.inventory.indexOf("доза фентанила"), 1);
                    return "\nМенты шмонают район! Дозу спалили, конфисковали.";
                }
                return "\nМенты шмонают район, но у тебя ничего нет.";
            }
        ];
        let event = events[Math.floor(Math.random() * events.length)];
        this.output.innerText += event();
        this.updateGame();
    },

    action(command) {
        if (this.danyaActive) return;

        let text = "";
        let reputationMod = this.player.reputation < 0 ? 2 : 0;

        if (command === "искать") {
            let dangerRoll = Math.random() * 10;
            if (Math.random() > 0.7) {
                this.miniGameRiddle();
            } else if (dangerRoll > this.currentLocation.danger_level + reputationMod) {
                this.miniGameGuessContainer();
            } else {
                let attacker = this.currentLocation.name === "Заброшенная квартира" ? "наркоманы" : ["крысы", "скинхеды", "пьяный дворник"][Math.floor(Math.random() * 3)];
                text += this.fight(attacker);
                this.output.innerText += "\n" + text;
                this.updateGame();
            }
        } else if (command === "уйти") {
            this.currentLocation = this.locations[Math.floor(Math.random() * this.locations.length)];
            text += "Ты свалил к другой мусорке...";
            this.updateWeatherAndTime();
            this.output.innerText += "\n" + text;
            this.updateGame();
        } else if (command === "позвать Даню") {
            let danyaChance = this.player.reputation > 50 ? 0.9 : 0.7;
            if (Math.random() < danyaChance) {
                this.danyaActive = true;
                text += "\nДаня вылез: 'О, кент! Дашь на опохмел?'";
                this.danyaOptions.style.display = "block";
            } else {
                text += "\nДаня где-то нажрался и спит.";
            }
            this.output.innerText += "\n" + text;
            this.updateGame();
        } else if (command === "уникальное действие") {
            text += this.uniqueLocationAction();
            this.output.innerText += "\n" + text;
            this.updateGame();
        } else if (command === "поговорить с NPC") {
            let npc = this.npcs.find(n => n.location === this.currentLocation.name);
            if (npc && npc.quest) {
                text += this.npcInteraction(npc);
            } else {
                text += "\nТут никого нет, кроме крыс.";
            }
            this.output.innerText += "\n" + text;
            this.updateGame();
        }
    },

    uniqueLocationAction() {
        let action = this.currentLocation.unique_action;
        if (action === "разбить окно" && this.currentLocation.name === "Контейнер у 'Пятёрочки'") {
            if (this.player.inventory.includes("битый кирпич")) {
                this.player.inventory.push("чекушка 'Беленькой'");
                return "Разъебал окно 'Пятёрочки' и спиздил чекушку!";
            }
            return "Нечем бить окно, дебил.";
        } else if (action === "спиздить бензин" && this.currentLocation.name === "Гаражи за домом") {
            if (Math.random() > 0.5) {
                this.player.inventory.push("канистра бензина");
                return "Спиздил канистру бензина!";
            }
            return this.fight("скинхеды");
        } else if (action === "покормить кота" && this.currentLocation.name === "Помойка у парадной") {
            if (this.player.inventory.includes("банка тушёнки")) {
                this.player.inventory.splice(this.player.inventory.indexOf("банка тушёнки"), 1);
                this.player.reputation += 10;
                return "Покормил кота тушёнкой. Бабки уважают! +10 репутации.";
            }
            return "Нет тушёнки, кот орёт.";
        } else if (action === "обыскать тайник" && this.currentLocation.name === "Заброшенная квартира") {
            if (Math.random() > 0.7) {
                this.player.tugriks += 50;
                return "Нашёл тайник! +50 тугриков.";
            }
            return "Тайник пустой, только шприцы.";
        } else if (action === "продать шмот" && this.currentLocation.name === "Ломбард") {
            let item = prompt("Что продать?");
            if (this.player.inventory.includes(item)) {
                let price = item === "кольцо с фианитом" ? 100 : 20;
                this.player.tugriks += price;
                this.player.inventory.splice(this.player.inventory.indexOf(item), 1);
                return `Сдал ${item} за ${price} тугриков!`;
            }
            return "Такого шмота нет.";
        } else if (action === "поймать крысу" && this.currentLocation.name === "Подвал") {
            if (Math.random() > 0.5) {
                this.player.inventory.push("дохлая крыса");
                return "Поймал крысу! Может, бабка купит?";
            }
            return "Крыса укусила и сбежала. -5 HP";
        } else if (action === "позвонить в домофон" && this.currentLocation.name === "Парадная") {
            if (Math.random() > 0.8) {
                this.player.tugriks += 10;
                return "Кто-то кинул 10 тугриков с балкона!";
            }
            return "Тебя обматерили через домофон.";
        }
        return "Тут нечего делать.";
    },

    npcInteraction(npc) {
        if (npc.name === "Бабка с клюкой" && npc.quest && !(npc.quest in this.player.quests)) {
            this.player.quests[npc.quest] = { description: "Бабка хочет суп.", reward: npc.reward };
            return "\nБабка: 'Принеси суп, алкаш, дам 20 тугриков!'";
        } else if (npc.name === "Скинхед Петя" && npc.quest && !(npc.quest in this.player.quests)) {
            this.player.quests[npc.quest] = { description: "Петя хочет 'Жигулёвское'.", reward: npc.reward };
            return "\nПетя: 'Го пивка, братан, буду твой кореш!'";
        }
        return `\n${npc.name}: 'Чё надо? Вали!'`;
    },

    useItem(item) {
        if (!this.player.inventory.includes(item)) {
            this.output.innerText += "\nУ тебя нет этого.";
            return;
        }

        let text = "";
        if (item === "банка тушёнки") {
            this.player.health += 15;
            text = "Сожрал тушёнку! +15 HP";
        } else if (item === "полупустая бутылка 'Балтики'" || item === "полная бутылка 'Балтики'") {
            this.player.is_drunk = true;
            text = "Выжрал 'Балтику'. Скоро пиздец!";
            setTimeout(() => {
                this.player.health -= 15;
                this.player.reputation -= 20;
                this.player.is_drunk = false;
                this.output.innerText += "\nПроснулся в луже мочи. -15 HP, -20 репутации";
                this.updateGame();
            }, 5000);
        } else if (item === "доширак") {
            this.player.health += 5;
            text = "Сожрал сухой дошик. +5 HP";
        } else if (item === "горячий дошик") {
            this.player.health += 15;
            text = "Сожрал горячий дошик. Вкусно! +15 HP";
        } else if (item === "ключ от квартиры") {
            this.currentLocation = this.locations.find(loc => loc.name === "Заброшенная квартира");
            text = "Открыл хату...";
        } else if (item === "битый кирпич" && this.currentLocation.name === "Контейнер у 'Пятёрочки'") {
            this.player.inventory.push("чекушка 'Беленькой'");
            text = "Разъебал окно 'Пятёрочки' и спиздил чекушку!";
        } else if (item === "доза фентанила" && this.player.is_addicted) {
            this.player.health += 10;
            text = "Ширнулся. Ломка ушла! +10 HP";
        } else if (item === "грязный шприц" && this.player.inventory.includes("доза фентанила")) {
            this.startAddiction();
            this.player.has_hiv = true;
            this.player.health -= 20;
            this.player.inventory.splice(this.player.inventory.indexOf("доза фентанила"), 1);
            text = "Ширнулся грязным шприцом. Зависим и с ВИЧ! -20 HP";
        } else if (item === "бабушкин суп") {
            this.player.health += 30;
            text = "Выжрал суп. Детство вспомнил! +30 HP";
        } else if (item === "кольцо с фианитом" && this.currentLocation.name === "Ломбард") {
            this.player.tugriks += 100;
            text = "Сдал кольцо. +100 тугриков!";
        } else if (item === "пустая пачка сигарет" && this.player.inventory.includes("доза фентанила")) {
            this.player.inventory.splice(this.player.inventory.indexOf("доза фентанила"), 1);
            this.player.inventory.push("пачка с фентанилом");
            text = "Спрятал дозу в пачку.";
        } else if (item === "старая куртка") {
            this.player.reputation += 10;
            text = "Натянул куртку. Выглядишь чуть лучше! +10 репутации";
        } else if (item === "штык-куртка") {
            this.player.reputation += 20;
            this.player.strength += 2;
            text = "Натянул штык-куртку. Теперь ты опасен! +20 репутации, +2 силы";
        } else if (item === "крысиный яд") {
            this.player.health -= 10;
            text = "Случайно вдохнул крысиный яд. -10 HP";
        } else if (item === "пакет с клеем") {
            this.player.reputation += 10;
            this.player.health -= 5;
            text = "Нюхнул клей. Гопники уважают, но башка болит. +10 репутации, -5 HP";
        } else if (item === "мобильник без симки" && this.currentLocation.name === "Ломбард") {
            this.player.tugriks += 50;
            text = "Сдал мобильник. +50 тугриков!";
        } else if (item === "канистра бензина" && this.currentLocation.name === "Гаражи за домом") {
            this.player.tugriks += 30;
            text = "Сдал бензин скинхедам. +30 тугриков!";
        } else {
            text = "Не сюда и не так.";
            this.output.innerText += "\n" + text;
            return;
        }

        this.player.inventory.splice(this.player.inventory.indexOf(item), 1);
        this.output.innerText += "\n" + text;
        this.checkQuestCompletion(item);
        this.updateGame();
    },

    danyaAction(action) {
        let text = "";
        const danyaQuests = {
            "украсть заначку скинхедов": { description: "Скинхеды спрятали 'Жигулёвское' в гаражах.", reward: "история про рехаб" },
            "принести Данье тушёнку": { description: "Даня хочет жрать после вчера.", reward: "история про бабушку с супом" },
            "найти чекушку 'Беленькой'": { description: "Для 'лечения'.", reward: "история про побег от скинхедов" }
        };

        if (action === "поговорить") {
            if (Object.keys(this.player.quests).length === 0) {
                text += "\nДаня: 'Есть дело, братан...'";
                for (let quest in danyaQuests) {
                    text += `\n- '${quest}': ${danyaQuests[quest].description}`;
                }
                let questChoice = prompt("Выбери квест:").toLowerCase();
                if (questChoice in danyaQuests) {
                    this.player.quests[questChoice] = danyaQuests[questChoice];
                    text += `\nДаня: 'Сделаешь — будет ${danyaQuests[questChoice].reward}!'`;
                } else {
                    text += "\n'Ты чё, больной?' — Даня уходит.";
                }
            } else {
                text += "\nДаня: 'Делай, что взял уже!'";
            }
        } else if (action === "дать бухло") {
            if (this.player.inventory.includes("полупустая бутылка 'Балтики'")) {
                this.player.inventory.splice(this.player.inventory.indexOf("полупустая бутылка 'Балтики'"), 1);
                this.player.reputation += 30;
                text += "\nДаня глушит 'Балтику': 'В рехабе я...' *блюёт*";
            } else {
                text += "\n'Где бухло, сука?' — Даня злится.";
            }
        } else if (action === "уйти") {
            text += "\nДаня свалил.";
        }

        this.danyaActive = false;
        this.danyaOptions.style.display = "none";
        this.output.innerText += text;
        this.updateGame();
    },

    checkQuestCompletion(foundItem) {
        if (foundItem === "ящик 'Жигулевского'" && "украсть заначку скинхедов" in this.player.quests) {
            this.completeQuest("украсть заначку скинхедов");
        } else if (foundItem === "чекушка 'Беленькой'" && "найти чекушку 'Беленькой'" in this.player.quests) {
            this.completeQuest("найти чекушку 'Беленькой'");
        } else if (foundItem === "банка тушёнки" && "принести Данье тушёнку" in this.player.quests) {
            this.completeQuest("принести Данье тушёнку");
        } else if (foundItem === "бабушкин суп" && "принести суп" in this.player.quests) {
            this.completeQuest("принести суп");
        } else if (foundItem === "ящик 'Жигулевского'" && "дать 'Жигулёвское'" in this.player.quests) {
            this.completeQuest("дать 'Жигулёвское'");
        }
    },

    completeQuest(quest) {
        const stories = {
            "история про рехаб": "— В рехабе медсестра такая: 'Даня, ты в дерьме!', а я: 'Это Лёха!'",
            "история про бабушка с супом": "— Бабка орала: 'Сдохни!', а суп — заебись, с картошкой...",
            "история про побег от скинхедов": "— Бежал, а они: 'Стой, алкаш!' Я встал — пох*й."
        };
        let reward = this.player.quests[quest].reward;
        if (typeof reward === "string") {
            this.output.innerText += `\nДаня рассказывает: ${stories[reward]}`;
            this.player.reputation += 50;
        } else {
            Object.assign(this.player, reward);
            this.output.innerText += `\nКвест выполнен! Получено: ${Object.entries(reward).map(([k, v]) => `${k}: ${v}`).join(", ")}`;
        }
        delete this.player.quests[quest];
        this.updateGame();
    }
};

function showUseItemPrompt() {
    let item = prompt("Что юзнуть?").toLowerCase();
    game.useItem(item);
}

function showCombineItemsPrompt() {
    let item1 = prompt("Первый предмет:").toLowerCase();
    let item2 = prompt("Второй предмет:").toLowerCase();
    game.combineItems(item1, item2);
}

game.init();
