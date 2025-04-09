const game = {
    player: {
        health: 100,
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
        { name: "Контейнер у 'Пятёрочки'", description: "Воняет тухлым борщом и надеждой. В углу ржавеет детская коляска.", items: ["полупустая бутылка 'Балтики'", "доширак", "ключ от квартиры", "битый кирпич"], danger_level: 2 },
        { name: "Гаражи за домом", description: "Темно, пахнет бензином и страхом. Здесь прячутся скинхеды.", items: ["чекушка 'Беленькой'", "ящик 'Жигулевского'", "ржавый гвоздь"], danger_level: 7 },
        { name: "Помойка у парадной", description: "Аристократическая помойка: битые чашки и шампанское.", items: ["банка тушёнки", "бабушкин суп", "кольцо с фианитом"], danger_level: 3 },
        { name: "Заброшенная квартира", description: "Заброшенная хата с ободранными обоями и запахом фентанила.", items: ["грязный шприц", "доза фентанила", "пустая пачка сигарет"], danger_level: 10 },
        { name: "Ломбард", description: "Тёмный закуток с мутным типом за стойкой.", items: ["ржавый гвоздь", "пустая пачка сигарет"], danger_level: 4 },
        { name: "Подвал", description: "Сырой подвал с крысами и шмотками.", items: ["старая куртка", "крысиный яд", "10 тугриков"], danger_level: 5 }
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
        this.currentLocation = this.locations[0];
        this.updateGame();
    },

    updateStatus() {
        let status = `♥ Здоровье: ${this.player.health} | 🎭 Репутация: ${this.player.reputation} | 💰 Тугрики: ${this.player.tugriks}\n`;
        status += `🎒 Инвентарь: ${this.player.inventory.length > 0 ? this.player.inventory.join(", ") : "пусто"}\n`;
        if (Object.keys(this.player.quests).length > 0) status += `📜 Квесты: ${Object.keys(this.player.quests).join(", ")}\n`;
        if (this.player.is_addicted) status += "💉 Ты зависим от фентанила!\n";
        if (this.player.has_hiv) status += "🩺 У тебя ВИЧ!\n";
        if (this.player.is_drunk) status += "🍺 Ты пьяный!\n";
        document.getElementById("status").innerText = status;
    },

    updateGame() {
        let text = `Вы находитесь: ${this.currentLocation.name}\n${this.currentLocation.description}`;

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
        }

        this.output.innerText = text;
        this.updateStatus();

        if (this.player.tugriks >= 50 && Math.random() > 0.7) {
            this.tradeOpportunity();
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

    miniGameGuessContainer() {
        let text = "\nТри бака перед тобой. В одном — шмотка. Угадай (1, 2, 3): ";
        this.output.innerText += text;
        let choice = prompt("Выбери бак (1, 2 или 3):");
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
        text += `1 — Балтика (${50 - discount} тугриков), 2 — Доза (${70 - discount} тугриков), 3 — Отказаться`;
        this.output.innerText += text;
        let choice = prompt("Что берёшь? (1, 2, 3):");

        if (choice === "1" && this.player.tugriks >= (50 - discount)) {
            this.player.tugriks -= (50 - discount);
            this.player.inventory.push("полная бутылка 'Балтики'");
            this.output.innerText += `\nКупил 'Балтику' за ${50 - discount} тугриков!`;
        } else if (choice === "2" && this.player.tugriks >= (70 - discount)) {
            this.player.tugriks -= (70 - discount);
            this.player.inventory.push("доза фентанила");
            this.output.innerText += `\nКупил дозу за ${70 - discount} тугриков!`;
        } else if (choice === "3") {
            this.output.innerText += "\nБарыга плюнул тебе под ноги и ушёл.";
        } else {
            this.output.innerText += "\n'Чё бормочешь?' — барыга уходит.";
        }
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
                if (this.player.inventory.includes("ржавый гвоздь") && (attacker === "скинхеды" || attacker === "наркоманы")) {
                    text += `Ты отбился от ${attacker} ржавым гвоздём!`;
                } else {
                    let damage = Math.floor(Math.random() * 16) + 5;
                    this.player.health -= damage;
                    text += `Напали ${attacker}! -${damage} HP`;
                }
                this.output.innerText += "\n" + text;
                this.updateGame();
            }
        } else if (command === "уйти") {
            this.currentLocation = this.locations[Math.floor(Math.random() * this.locations.length)];
            text += "Ты свалил к другой мусорке...";
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
        }
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
        } else if (item === "крысиный яд") {
            this.player.health -= 10;
            text = "Случайно вдохнул крысиный яд. -10 HP";
        } else {
            text = "Не сюда и не так.";
            this.output.innerText += "\n" + text;
            return;
        }

        this.player.inventory.splice(this.player.inventory.indexOf(item), 1);
        this.output.innerText += "\n" + text;
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
        }
    },

    completeQuest(quest) {
        const stories = {
            "история про рехаб": "— В рехабе медсестра такая: 'Даня, ты в дерьме!', а я: 'Это Лёха!'",
            "история про бабушка с супом": "— Бабка орала: 'Сдохни!', а суп — заебись, с картошкой...",
            "история про побег от скинхедов": "— Бежал, а они: 'Стой, алкаш!' Я встал — пох*й."
        };
        let rewardStory = this.player.quests[quest].reward;
        this.output.innerText += `\nДаня рассказывает: ${stories[rewardStory]}`;
        this.player.reputation += 50;
        delete this.player.quests[quest];
        this.updateGame();
    }
};

function showUseItemPrompt() {
    let item = prompt("Что юзнуть?").toLowerCase();
    game.useItem(item);
}

game.init();
