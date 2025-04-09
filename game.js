const game = {
    player: {
        health: 100,
        strength: 5,
        inventory: ['кирпич', 'бутылка'],
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
        { name: "Подвал", description: "Сырой подвал с крысами и шмотками.", items: ["старая куртка", "крысиный яд", "20 тугриков"], danger_level: 5, unique_action: "поймать крысу" },
        { name: "Парадная", description: "Обоссанная парадная с граффити 'Даня — лох'.", items: ["пакет с клеем", "мобильник без симки"], danger_level: 3, unique_action: "позвонить в домофон" }
    ],

    weather: "ясно",
    timeOfDay: "день",
    npcs: [
        { name: "Бабка с клюкой", location: "Помойка у парадной", quest: "принести суп", reward: { tugriks: 50, reputation: 20 } },
        { name: "Скинхед Петя", location: "Гаражи за домом", quest: "дать 'Жигулёвское'", reward: { strength: 3, reputation: 30 } },
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

    init() {
        this.loadGame();
        if (!this.currentLocation) this.currentLocation = this.locations[0];
        // Вступление с сюжетом
        this.output.innerText = "Ты — Вася, бывший работяга. Уволили за пьянку, жена выгнала, друзья слились. Теперь ты бомж у 'Пятёрочки'. Цель: накопить 1000 тугриков, чтобы снять хату, или стать королём помойки с репутацией 100. Не сдохни — Питер не прощает.";
        if (this.isGameOver()) {
            this.showGameOverState();
        } else {
            this.updateWeatherAndTime();
            this.updateGame();
        }
    },

    isGameOver() {
        return (
            this.player.health <= 0 ||
            this.player.tugriks >= 1000 ||
            this.player.reputation >= 100
        );
    },

    showGameOverState() {
        let text = `Вы находитесь: ${this.currentLocation.name}\n${this.currentLocation.description}\n`;
        if (this.player.health <= 0) {
            text += this.player.is_addicted ? "Ширнулся грязным шприцом и сгнил в подворотне. Питер тебя сломал." : "Замёрз под дождём или сдох в луже. Питер тебя сломал.";
        } else if (this.player.tugriks >= 1000) {
            text += "Накопил 1000 тугриков! Снял хату в Купчино, купил шмотки и устроился грузчиком. Сидишь с пивом у окна: 'Жизнь налаживается'. Победа!";
        } else if (this.player.reputation >= 100) {
            text += "Репутация 100! Ты — Вася Король. Скинхеды уважают, Даня зовёт к костру. Ты остался на улице, но это твоя территория. Победа!";
        }
        this.output.innerText = text;
        document.getElementById("actions").style.display = "none";
        document.getElementById("restart-btn").style.display = "inline-block";
        this.updateStatus();
    },

    restart() {
        this.player = {
            health: 100,
            strength: 5,
            inventory: ['кирпич', 'бутылка'],
            reputation: 0,
            tugriks: 0,
            quests: {},
            is_addicted: false,
            has_hiv: false,
            is_drunk: false,
            addictionTimer: null
        };
        this.currentLocation = this.locations[0];
        this.weather = "ясно";
        this.timeOfDay = "день";
        localStorage.removeItem("gameState");
        if (this.player.addictionTimer) clearInterval(this.player.addictionTimer);
        this.output.innerText = "Ты — Вася, бывший работяга. Уволили за пьянку, жена выгнала, друзья слились. Теперь ты бомж у 'Пятёрочки'. Цель: 1000 тугриков или репутация 100. Не сдохни.";
        document.getElementById("actions").style.display = "flex";
        document.getElementById("restart-btn").style.display = "none";
        this.danyaOptions.style.display = "none";
        document.body.className = "";
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
        
        document.body.className = "";
        if (this.weather === "дождь") document.body.classList.add("rain");
        if (this.weather === "снег") document.body.classList.add("snow");
        if (this.timeOfDay === "ночь") document.body.classList.add("night");

        if (this.weather === "дождь" && !this.player.inventory.includes("старая куртка")) {
            this.player.health -= 3;
            addOutput("Дождь промочил тебя. -3 HP");
        }
    },

    updateStatus() {
        if (this.player.health > 100) this.player.health = 100;
        let status = `♥ Здоровье: ${this.player.health} | 💪 Сила: ${this.player.strength} | 🎭 Репутация: ${this.player.reputation}/100 | 💰 Тугрики: ${this.player.tugriks}/1000\n`;
        status += `🎒 Инвентарь: ${this.player.inventory.length > 0 ? this.player.inventory.join(", ") : "пусто"}\n`;
        status += `🌦 Погода: ${this.weather} | 🕒 Время: ${this.timeOfDay}\n`;
        if (this.player.is_addicted) status += "💉 Зависим от фентанила! Ломка бьёт.\n";
        if (this.player.has_hiv) status += "🩺 У тебя ВИЧ! Береги здоровье.\n";
        if (this.player.is_drunk) status += "🍺 Ты пьяный! Скоро пиздец.\n";
        document.getElementById("status").innerText = status;

        const questList = document.getElementById("quest-list");
        questList.innerHTML = "";
        for (let quest in this.player.quests) {
            const li = document.createElement("li");
            li.innerText = `${quest}: ${this.player.quests[quest].description}`;
            questList.appendChild(li);
        }
    },

    updateGame() {
        let text = `Вы находитесь: ${this.currentLocation.name}\n${this.currentLocation.description}`;
        if (this.timeOfDay === "ночь") text += " Ночь скрывает мусор, но тайники богаче.";
        if (this.weather === "дождь") text += " Дождь заливает всё вокруг.";

        if (this.currentLocation.name === "Заброшенная квартира" && !this.player.has_hiv && Math.random() > 0.8) {
            this.startAddiction();
            this.player.has_hiv = true;
            this.player.health -= 10;
            text += "\nНаркоман ткнул тебя шприцом! ВИЧ и зависимость. -10 HP";
        }

        if (this.isGameOver()) {
            this.showGameOverState();
            return;
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
        if (Math.random() > 0.8) { // 20% шанс дать совет
            this.giveHint();
        }
    },

    // Новая функция для советов
    giveHint() {
        const hints = [
            "Ищи еду вроде тушёнки или супа, чтобы не сдохнуть от голода.",
            "Копи тугрики в ломбарде — сдавай кольца и мобильники, цель 1000!",
            "Дружба с Даней и скинхедами даст репутацию. Стань королём помойки!",
            "Избегай шприцов и фентанила — ломка и ВИЧ убьют быстро.",
            "Комбинируй предметы: дошик с чекушкой — это +25 HP!",
            "Ночь — время для тугриков, но берегись скинхедов.",
            "Старая куртка спасёт от дождя, штык-куртка — от драк."
        ];
        addOutput(`[Подсказка] ${hints[Math.floor(Math.random() * hints.length)]}`);
    },

    startAddiction() {
        this.player.is_addicted = true;
        if (!this.player.addictionTimer) {
            this.player.addictionTimer = setInterval(() => {
                if (!this.player.inventory.includes("доза фентанила")) {
                    this.player.health -= 3;
                    addOutput("Ломка бьёт... -3 HP");
                    this.updateGame();
                }
            }, 15000);
        }
    },

    combineItems(item1, item2) {
        let text = "";
        if (item1 === "доширак" && item2 === "чекушка 'Беленькой'") {
            this.player.inventory.splice(this.player.inventory.indexOf(item1), 1);
            this.player.inventory.splice(this.player.inventory.indexOf(item2), 1);
            this.player.inventory.push("горячий дошик");
            text = "Залил дошик чекушкой. Получился горячий дошик!";
        } else if (item1 === "ржавый гвоздь" && item2 === "старая куртка") {
            this.player.inventory.splice(this.player.inventory.indexOf(item1), 1);
            this.player.inventory.splice(this.player.inventory.indexOf(item2), 1);
            this.player.inventory.push("штык-куртка");
            text = "Пришил гвоздь к куртке. Теперь это штык-куртка!";
        } else {
            text = "Это не комбинируется.";
        }
        addOutput(text);
        this.updateGame();
    },

    fight(attacker) {
        const enemies = {
            "крысы": { strength: 3, loot: "крысиный яд" },
            "скинхеды": { strength: 10, loot: "ящик 'Жигулевского'" },
            "пьяный дворник": { strength: 7, loot: "20 тугриков" },
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
            let damage = Math.floor(Math.random() * (enemy.strength - playerStrength + 1)) + 3;
            this.player.health -= damage;
            text += `${attacker} уделали тебя! -${damage} HP`;
        }
        return text;
    },

    miniGameGuessContainer() {
        let text = "Три бака перед тобой. В одном — шмотка.";
        addOutput(text);
        let choice = prompt("Выбери бак (1, 2 или 3):");
        if (!choice || isNaN(choice) || choice < 1 || choice > 3) {
            addOutput("Неправильный выбор. -3 HP");
            this.player.health -= 3;
            hideSearchMiniGame();
            this.updateGame();
            return;
        }

        let winningContainer = Math.floor(Math.random() * 3) + 1;
        if (parseInt(choice) === winningContainer) {
            let foundItem = this.currentLocation.items[Math.floor(Math.random() * this.currentLocation.items.length)];
            if (foundItem === "20 тугриков") {
                this.player.tugriks += 20;
                addOutput("Нашёл 20 тугриков!");
            } else {
                this.player.inventory.push(foundItem);
                addOutput(`Нашёл: ${foundItem}.`);
            }
            this.checkQuestCompletion(foundItem);
        } else {
            let damage = Math.floor(Math.random() * 7) + 3;
            this.player.health -= damage;
            addOutput(`Пусто! Пьяный бомж пнул тебя. -${damage} HP`);
        }
        hideSearchMiniGame();
        this.updateGame();
    },

    miniGameRiddle() {
        let text = "Гопник: 'Отгадай или пиздец!'";
        let riddle = this.riddles[0];
        text += `\n${riddle.question}`;
        riddle.options.forEach((opt, i) => text += `\n${i + 1}. ${opt}`);
        addOutput(text);

        let choice = prompt("Выбери ответ (1-4):");
        if (!choice || isNaN(choice) || choice < 1 || choice > 4) {
            addOutput("Тупишь? -3 HP");
            this.player.health -= 3;
            this.updateGame();
            return;
        }

        if (parseInt(choice) - 1 === riddle.correct) {
            let reward = Math.floor(Math.random() * 20) + 20;
            this.player.tugriks += reward;
            addOutput(`Гопник: 'Молодец! Вот ${reward} тугриков.'`);
        } else {
            let damage = Math.floor(Math.random() * 7) + 3;
            this.player.health -= damage;
            addOutput(`Гопник бьёт в рыло. -${damage} HP`);
        }
        this.updateGame();
    },

    tradeOpportunity() {
        let discount = this.player.reputation > 50 ? 10 : 0;
        let text = `Барыга: 'Бери шмот!'\n`;
        text += `1 — Балтика (${50 - discount} тугриков), 2 — Доза (${70 - discount} тугриков), 3 — Мобильник (${100 - discount} тугриков), 4 — Отказаться`;
        addOutput(text);
        let choice = prompt("Что берёшь? (1-4):");

        if (choice === "1" && this.player.tugriks >= (50 - discount)) {
            this.player.tugriks -= (50 - discount);
            this.player.inventory.push("полная бутылка 'Балтики'");
            addOutput(`Купил 'Балтику' за ${50 - discount} тугриков!`);
        } else if (choice === "2" && this.player.tugriks >= (70 - discount)) {
            this.player.tugriks -= (70 - discount);
            this.player.inventory.push("доза фентанила");
            addOutput(`Купил дозу за ${70 - discount} тугриков!`);
        } else if (choice === "3" && this.player.tugriks >= (100 - discount)) {
            this.player.tugriks -= (100 - discount);
            this.player.inventory.push("мобильник без симки");
            addOutput(`Купил мобильник за ${100 - discount} тугриков!`);
        } else {
            addOutput("Барыга ушёл.");
        }
        this.updateGame();
    },

    randomEvent() {
        const events = [
            () => {
                this.player.tugriks += 70;
                return "Нашёл кошелёк! +70 тугриков.";
            },
            () => {
                let loss = Math.floor(this.player.tugriks / 3);
                this.player.tugriks -= loss;
                return `Воры спиздили ${loss} тугриков!`;
            },
            () => {
                if (this.player.inventory.includes("доза фентанила")) {
                    this.player.inventory.splice(this.player.inventory.indexOf("доза фентанила"), 1);
                    return "Менты конфисковали дозу!";
                }
                return "Менты прошли мимо.";
            }
        ];
        let event = events[Math.floor(Math.random() * events.length)];
        addOutput(event());
        this.updateGame();
    },

    action(command) {
        let text = "";
        let reputationMod = this.player.reputation < 0 ? 2 : 0;

        if (command === "искать") {
            let dangerRoll = Math.random() * 10;
            if (Math.random() > 0.7) {
                this.miniGameRiddle();
            } else if (dangerRoll > this.currentLocation.danger_level + reputationMod) {
                document.getElementById("search-mini-game").style.display = "flex";
            } else {
                let attacker = this.currentLocation.name === "Заброшенная квартира" ? "наркоманы" : ["крысы", "скинхеды", "пьяный дворник"][Math.floor(Math.random() * 3)];
                text += this.fight(attacker);
                addOutput(text);
                this.updateGame();
            }
        } else if (command === "уйти") {
            showLocationPrompt();
        } else if (command === "позвать Даню") {
            let danyaChance = this.player.reputation > 50 ? 0.9 : 0.7;
            if (Math.random() < danyaChance) {
                this.danyaOptions.style.display = "flex";
                text += "Даня: 'Дашь на опохмел?'";
            } else {
                text += "Даня спит где-то.";
            }
            addOutput(text);
            this.updateGame();
        } else if (command === "уникальное действие") {
            text += this.uniqueLocationAction();
            addOutput(text);
            this.updateGame();
        } else if (command === "поговорить с NPC") {
            let npc = this.npcs.find(n => n.location === this.currentLocation.name);
            if (npc && npc.quest) {
                text += this.npcInteraction(npc);
            } else {
                text += "Тут никого.";
            }
            addOutput(text);
            this.updateGame();
        }
    },

    uniqueLocationAction() {
        let action = this.currentLocation.unique_action;
        if (action === "разбить окно" && this.currentLocation.name === "Контейнер у 'Пятёрочки'") {
            if (this.player.inventory.includes("битый кирпич") || this.player.inventory.includes("кирпич")) {
                this.player.inventory.push("чекушка 'Беленькой'");
                return "Разбил окно и спиздил чекушку!";
            }
            return "Нечем бить.";
        } else if (action === "спиздить бензин" && this.currentLocation.name === "Гаражи за домом") {
            if (Math.random() > 0.5) {
                this.player.inventory.push("канистра бензина");
                return "Спиздил бензин!";
            }
            return this.fight("скинхеды");
        } else if (action === "покормить кота" && this.currentLocation.name === "Помойка у парадной") {
            if (this.player.inventory.includes("банка тушёнки")) {
                this.player.inventory.splice(this.player.inventory.indexOf("банка тушёнки"), 1);
                this.player.reputation += 20;
                return "Покормил кота. +20 репутации.";
            }
            return "Нет тушёнки.";
        } else if (action === "обыскать тайник" && this.currentLocation.name === "Заброшенная квартира") {
            if (Math.random() > 0.5) {
                this.player.tugriks += 70;
                return "Нашёл тайник! +70 тугриков.";
            }
            return "Тайник пустой.";
        } else if (action === "продать шмот" && this.currentLocation.name === "Ломбард") {
            let item = prompt("Что продать?");
            if (this.player.inventory.includes(item)) {
                let price = item === "кольцо с фианитом" ? 150 : item === "ржавый гвоздь" ? 10 : 30;
                this.player.tugriks += price;
                this.player.inventory.splice(this.player.inventory.indexOf(item), 1);
                return `Сдал ${item} за ${price} тугриков!`;
            }
            return "Нет такого.";
        } else if (action === "поймать крысу" && this.currentLocation.name === "Подвал") {
            if (Math.random() > 0.5) {
                this.player.inventory.push("дохлая крыса");
                return "Поймал крысу!";
            }
            this.player.health -= 3;
            return "Крыса укусила. -3 HP";
        } else if (action === "позвонить в домофон" && this.currentLocation.name === "Парадная") {
            if (Math.random() > 0.7) {
                this.player.tugriks += 20;
                return "Кинули 20 тугриков!";
            }
            return "Обматерили.";
        }
        return "Нечего делать.";
    },

    npcInteraction(npc) {
        if (npc.name === "Бабка с клюкой" && npc.quest && !(npc.quest in this.player.quests)) {
            this.player.quests[npc.quest] = { description: "Бабка хочет суп.", reward: npc.reward };
            return "Бабка: 'Принеси суп, дам 50 тугриков!'";
        } else if (npc.name === "Скинхед Петя" && npc.quest && !(npc.quest in this.player.quests)) {
            this.player.quests[npc.quest] = { description: "Петя хочет 'Жигулёвское'.", reward: npc.reward };
            return "Петя: 'Го пивка, братан!'";
        }
        return `${npc.name}: 'Вали!'`;
    },

    useItem(item) {
        if (!this.player.inventory.includes(item)) {
            addOutput(`Нет ${item}.`);
            hideItemPrompt();
            return;
        }

        let text = "";
        if (item === "банка тушёнки") {
            this.player.health += 20;
            text = "Сожрал тушёнку! +20 HP";
        } else if (item === "полупустая бутылка 'Балтики'" || item === "полная бутылка 'Балтики'" || item === "бутылка") {
            this.player.is_drunk = true;
            text = "Выжрал 'Балтику'.";
            setTimeout(() => {
                this.player.health -= 10;
                this.player.reputation -= 10;
                this.player.is_drunk = false;
                addOutput("Проснулся в луже. -10 HP, -10 репутации");
                this.updateGame();
            }, 5000);
        } else if (item === "доширак") {
            this.player.health += 10;
            text = "Сожрал дошик. +10 HP";
        } else if (item === "горячий дошик") {
            this.player.health += 25;
            text = "Сожрал горячий дошик! +25 HP";
        } else if (item === "ключ от квартиры") {
            this.currentLocation = this.locations.find(loc => loc.name === "Заброшенная квартира");
            text = "Открыл хату...";
        } else if ((item === "битый кирпич" || item === "кирпич") && this.currentLocation.name === "Контейнер у 'Пятёрочки'") {
            this.player.inventory.push("чекушка 'Беленькой'");
            text = "Разбил окно и спиздил чекушку!";
        } else if (item === "доза фентанила" && this.player.is_addicted) {
            this.player.health += 15;
            text = "Ширнулся. Ломка ушла! +15 HP";
        } else if (item === "грязный шприц" && this.player.inventory.includes("доза фентанила")) {
            this.startAddiction();
            this.player.has_hiv = true;
            this.player.health -= 10;
            this.player.inventory.splice(this.player.inventory.indexOf("доза фентанила"), 1);
            text = "Ширнулся грязным шприцом. ВИЧ! -10 HP";
        } else if (item === "бабушкин суп") {
            this.player.health += 40;
            text = "Выжрал суп! +40 HP";
        } else if (item === "кольцо с фианитом" && this.currentLocation.name === "Ломбард") {
            this.player.tugriks += 150;
            text = "Сдал кольцо. +150 тугриков!";
        } else if (item === "пустая пачка сигарет" && this.player.inventory.includes("доза фентанила")) {
            this.player.inventory.splice(this.player.inventory.indexOf("доза фентанила"), 1);
            this.player.inventory.push("пачка с фентанилом");
            text = "Спрятал дозу в пачку.";
        } else if (item === "старая куртка") {
            this.player.reputation += 15;
            text = "Натянул куртку. +15 репутации";
        } else if (item === "штык-куртка") {
            this.player.reputation += 25;
            this.player.strength += 3;
            text = "Натянул штык-куртку! +25 репутации, +3 силы";
        } else if (item === "крысиный яд") {
            this.player.health -= 7;
            text = "Вдохнул яд. -7 HP";
        } else if (item === "пакет с клеем") {
            this.player.reputation += 15;
            this.player.health -= 3;
            text = "Нюхнул клей. +15 репутации, -3 HP";
        } else if (item === "мобильник без симки" && this.currentLocation.name === "Ломбард") {
            this.player.tugriks += 70;
            text = "Сдал мобильник. +70 тугриков!";
        } else if (item === "канистра бензина" && this.currentLocation.name === "Гаражи за домом") {
            this.player.tugriks += 50;
            text = "Сдал бензин. +50 тугриков!";
        } else {
            text = "Не используется.";
            addOutput(text);
            hideItemPrompt();
            return;
        }

        this.player.inventory.splice(this.player.inventory.indexOf(item), 1);
        addOutput(text);
        this.checkQuestCompletion(item);
        hideItemPrompt();
        this.updateGame();
    },

    danyaAction(action) {
        let text = "";
        const danyaQuests = {
            "украсть заначку скинхедов": { description: "Скинхеды спрятали 'Жигулёвское'.", reward: "история про рехаб" },
            "принести Данье тушёнку": { description: "Даня хочет жрать.", reward: "история про бабушку с супом" },
            "найти чекушку 'Беленькой'": { description: "Для 'лечения'.", reward: "история про побег от скинхедов" }
        };

        if (action === "поговорить") {
            if (Object.keys(this.player.quests).length === 0) {
                text += "Даня: 'Есть дело...'";
                for (let quest in danyaQuests) {
                    text += `\n- '${quest}': ${danyaQuests[quest].description}`;
                }
                let questChoice = prompt("Выбери квест:").toLowerCase();
                if (questChoice in danyaQuests) {
                    this.player.quests[questChoice] = danyaQuests[questChoice];
                    text += `\nДаня: 'Сделаешь — будет ${danyaQuests[questChoice].reward}!'`;
                } else {
                    text += "\nДаня: 'Ты чё?'";
                }
            } else {
                text += "Даня: 'Делай уже!'";
            }
        } else if (action === "дать бухло") {
            if (this.player.inventory.includes("полупустая бутылка 'Балтики'") || this.player.inventory.includes("бутылка")) {
                this.player.inventory.splice(this.player.inventory.indexOf(this.player.inventory.includes("полупустая бутылка 'Балтики'") ? "полупустая бутылка 'Балтики'" : "бутылка"), 1);
                this.player.reputation += 40;
                text += "Даня глушит 'Балтику'. +40 репутации";
            } else {
                text += "Даня: 'Где бухло?'";
            }
        } else if (action === "уйти") {
            text += "Даня свалил.";
            this.danyaOptions.style.display = "none";
        }

        addOutput(text);
        this.updateGame();
    },

    checkQuestCompletion(foundItem) {
        let questToComplete = null;
        if (foundItem === "ящик 'Жигулевского'" && "украсть заначку скинхедов" in this.player.quests) {
            questToComplete = "украсть заначку скинхедов";
            this.player.inventory.splice(this.player.inventory.indexOf(foundItem), 1);
        } else if (foundItem === "чекушка 'Беленькой'" && "найти чекушку 'Беленькой'" in this.player.quests) {
            questToComplete = "найти чекушку 'Беленькой'";
            this.player.inventory.splice(this.player.inventory.indexOf(foundItem), 1);
        } else if (foundItem === "банка тушёнки" && "принести Данье тушёнку" in this.player.quests) {
            questToComplete = "принести Данье тушёнку";
            this.player.inventory.splice(this.player.inventory.indexOf(foundItem), 1);
        } else if (foundItem === "бабушкин суп" && "принести суп" in this.player.quests) {
            questToComplete = "принести суп";
            this.player.inventory.splice(this.player.inventory.indexOf(foundItem), 1);
        } else if (foundItem === "ящик 'Жигулевского'" && "дать 'Жигулёвское'" in this.player.quests) {
            questToComplete = "дать 'Жигулёвское'";
            this.player.inventory.splice(this.player.inventory.indexOf(foundItem), 1);
        }
        if (questToComplete) this.completeQuest(questToComplete);
    },

    completeQuest(quest) {
        const stories = {
            "история про рехаб": "— В рехабе медсестра такая: 'Даня, ты в дерьме!', а я: 'Это Лёха!'",
            "история про бабушку с супом": "— Бабка орала: 'Сдохни!', а суп — заебись...",
            "история про побег от скинхедов": "— Бежал, а они: 'Стой!' Я встал — пох."
        };
        let reward = this.player.quests[quest].reward;
        if (typeof reward === "string") {
            addOutput(`Даня рассказывает: ${stories[reward]}`);
            this.player.reputation += 50;
        } else {
            Object.assign(this.player, reward);
            addOutput(`Квест выполнен! Получено: ${Object.entries(reward).map(([k, v]) => `${k}: ${v}`).join(", ")}`);
        }
        delete this.player.quests[quest];
        this.updateGame();
    },

    goTo(locationName) {
        this.currentLocation = this.locations.find(loc => loc.name === locationName);
        addOutput(`Вы пошли в ${locationName}.`);
        this.updateWeatherAndTime();
        hideLocationPrompt();
        this.updateGame();
    }
};

function addOutput(text) {
    const output = document.getElementById('output');
    output.innerText += `\n${text}`;
    output.scrollTop = output.scrollHeight;
}

function showLocationPrompt() {
    const options = game.locations;
    const container = document.getElementById("location-options");
    container.innerHTML = '';
    options.forEach(loc => {
        const btn = document.createElement("button");
        btn.innerText = loc.name;
        btn.onclick = () => game.goTo(loc.name);
        container.appendChild(btn);
    });
    document.getElementById("location-prompt").style.display = "flex";
}

function hideLocationPrompt() {
    document.getElementById("location-prompt").style.display = "none";
}

function showUseItemPrompt() {
    const usableItems = game.player.inventory;
    const container = document.getElementById("item-options");
    container.innerHTML = '';
    usableItems.forEach(item => {
        const btn = document.createElement("button");
        btn.innerText = item;
        btn.onclick = () => game.useItem(item);
        container.appendChild(btn);
    });
    document.getElementById("item-prompt").style.display = "flex";
}

function hideItemPrompt() {
    document.getElementById("item-prompt").style.display = "none";
}

function showCombineItemsPrompt() {
    const items = game.player.inventory;
    const container = document.getElementById("combine-options");
    container.innerHTML = '';
    if (items.length < 2) {
        addOutput("Нужно 2 предмета!");
        return;
    }
    let selected = [];
    items.forEach(item => {
        const btn = document.createElement("button");
        btn.innerText = item;
        btn.onclick = () => {
            if (!selected.includes(item)) {
                selected.push(item);
                btn.style.backgroundColor = "#0ff";
                if (selected.length === 2) {
                    game.combineItems(selected[0], selected[1]);
                    hideCombinePrompt();
                }
            }
        };
        container.appendChild(btn);
    });
    document.getElementById("combine-prompt").style.display = "flex";
}

function hideCombinePrompt() {
    document.getElementById("combine-prompt").style.display = "none";
}

function hideSearchMiniGame() {
    document.getElementById("search-mini-game").style.display = "none";
}

game.init();
