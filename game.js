const game = {
    player: {
        health: 100,
        inventory: [],
        reputation: 0,
        quests: {},
        is_addicted: false,
        has_hiv: false,
        is_drunk: false,
        tugriks: 0,
        addictionTimer: null
    },

    locations: [
        { name: "Контейнер у 'Пятёрочки'", description: "Воняет тухлым борщом и надеждой. В углу ржавеет детская коляска.", items: ["полупустая бутылка 'Балтики'", "доширак", "ключ от квартиры", "битый кирпич"], danger_level: 2, events: ["Пьяный грузчик спит", "Кот шипит из угла"] },
        { name: "Гаражи за домом", description: "Темно, пахнет бензином и страхом. Здесь точно прячутся скинхеды.", items: ["чекушка 'Беленькой'", "ящик 'Жигулевского'", "ржавый гвоздь"], danger_level: 7, events: ["Скинхеды пьют в углу", "Собака лает"] },
        { name: "Помойка у парадной", description: "Аристократическая помойка: битые фарфоровые чашки и шампанское.", items: ["банка тушёнки", "бабушкин суп", "кольцо с фианитом"], danger_level: 3, events: ["Бабка выносит мусор", "Гопник курит"] },
        { name: "Квартира", description: "Заброшенная хата с ободранными обоями и запахом фентанила.", items: ["грязный шприц", "доза фентанила", "пустая пачка сигарет"], danger_level: 10, events: ["Наркоман блюёт", "Таракан ползёт"] },
        { name: "Ломбард", description: "Тёмный закуток с мутным типом за стойкой. Пахнет шмотками.", items: ["ржавый гвоздь", "пустая пачка сигарет"], danger_level: 4, events: ["Тип смотрит криво", "Муха жужжит"] }
    ],

    currentLocation: null,
    output: document.getElementById("output"),
    danyaOptions: document.getElementById("danya-options"),
    danyaActive: false,

    riddles: [
        {
            question: "Есть два стула - на одном пики точёные, на другом хуи дрочённые, на какой сам сядешь, на какой мать посадишь?",
            options: [
                "Сяду на пики, мать на хуи.",
                "Сяду на хуи, мать на пики.",
                "Возьму пики, срежу хуи, сам сяду на стул и мать на колени посажу.",
                "Оба стула сломаю и уйду."
            ],
            correct: 2
        }
    ],

    init() {
        this.currentLocation = this.locations[0];
        this.updateGame();
    },

    updateStatus() {
        let status = `♥ Здоровье: ${this.player.health} | 🎭 Репутация: ${this.player.reputation} | 💰 Тугрики: ${this.player.tugriks}\n`;
        status += `🎒 Инвентарь: ${this.player.inventory.length > 0 ? this.player.inventory.join(", ") : "пусто"}\n`;
        if (this.player.quests) status += `📜 Квесты: ${Object.keys(this.player.quests).join(", ")}\n`;
        if (this.player.is_addicted) status += "💉 Ты зависим от фентанила!\n";
        if (this.player.has_hiv) status += "🩺 У тебя ВИЧ!\n";
        if (this.player.is_drunk) status += "🍺 Ты пьяный!\n";
        document.getElementById("status").innerText = status;
    },

    updateGame() {
        let text = `Вы находитесь: ${this.currentLocation.name}\n${this.currentLocation.description}`;
        let randomEvent = this.currentLocation.events[Math.floor(Math.random() * this.currentLocation.events.length)];
        text += `\nСобытие: ${randomEvent}`;

        if (this.currentLocation.name === "Квартира" && !this.player.has_hiv && Math.random() > 0.5) {
            text += "\nОбдолбанный наркоман втыкает в тебя грязный шприц!";
            this.startAddiction();
            this.player.has_hiv = true;
            this.player.health -= 20;
            text += "\nТы стал зависимым от фентанила и заразился ВИЧ! -20 HP";
        }

        if (this.player.health <= 0) {
            if (this.player.is_addicted) {
                text += "\nТы нашёл грязный шприц, ширнулся и умер от заражения крови. Конец игры.";
            } else {
                text += "\n💀 Игра окончена. Ты сгнил в питерских помойках...";
            }
            document.getElementById("actions").style.display = "none";
            clearInterval(this.player.addictionTimer);
        } else if (this.player.tugriks >= 1000) {
            text += "\nТы набрал 1000 тугриков! Снял квартиру, нашёл работу и выбрался из бомжатской жизни. Победа!";
            document.getElementById("actions").style.display = "none";
            clearInterval(this.player.addictionTimer);
        }

        this.output.innerText = text;
        this.updateStatus();

        if (this.player.tugriks >= 50) {
            this.tradeOpportunity();
        }
    },

    startAddiction() {
        this.player.is_addicted = true;
        if (!this.player.addictionTimer) {
            this.player.addictionTimer = setInterval(() => {
                if (!this.player.inventory.includes("доза фентанила")) {
                    this.player.health -= 5;
                    this.output.innerText += "\nТы страдаешь от ломки... -5 HP";
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
            this.player.inventory.push(foundItem);
            this.output.innerText += `\nУгадал! Нашёл: ${foundItem}.`;
            this.checkQuestCompletion(foundItem);
        } else {
            let damage = Math.floor(Math.random() * 10) + 5;
            this.player.health -= damage;
            this.output.innerText += `\nПусто! Пока копался, кто-то пнул тебя сзади. -${damage} HP`;
        }
        this.updateGame();
    },

    miniGameSteal() {
        let text = "\nСпящий бомж уронил сумку. Попробуй спиздить (1 — тихо, 2 — быстро): ";
        this.output.innerText += text;
        let choice = prompt("Тихо (1) или быстро (2)?");
        let successChance = this.player.reputation > 20 ? 0.7 : 0.5;

        if (Math.random() < successChance && choice === "1") {
            let loot = ["доширак", "чекушка 'Беленькой'", "10 тугриков"][Math.floor(Math.random() * 3)];
            if (loot === "10 тугриков") this.player.tugriks += 10;
            else this.player.inventory.push(loot);
            this.output.innerText += `\nТихо спиздил: ${loot}!`;
            this.checkQuestCompletion(loot);
        } else if (choice === "2" && Math.random() > 0.3) {
            let loot = ["битый кирпич", "пустая пачка сигарет"][Math.floor(Math.random() * 2)];
            this.player.inventory.push(loot);
            this.output.innerText += `\nСхватил быстро: ${loot}.`;
        } else {
            this.player.health -= 15;
            this.output.innerText += `\nБомж проснулся и втащил тебе! -15 HP`;
        }
        this.updateGame();
    },

    miniGameRiddle() {
        let text = "\nПодходит гопник: 'Э, петух, докажи, что не лох! Отгадай загадку:'";
        let riddle = this.riddles[Math.floor(Math.random() * this.riddles.length)];
        text += `\n${riddle.question}`;
        riddle.options.forEach((opt, i) => {
            text += `\n${i + 1}. ${opt}`;
        });
        this.output.innerText += text;
        let choice = prompt("Выбери ответ (1-4):");

        if (parseInt(choice) - 1 === riddle.correct) {
            let reward = Math.floor(Math.random() * 20) + 10;
            this.player.tugriks += reward;
            this.output.innerText += `\nГопник: 'Молодец, петух! Вот тебе ${reward} тугриков.'`;
        } else {
            let damage = Math.floor(Math.random() * 10) + 5;
            this.player.health -= damage;
            this.output.innerText += `\nГопник: 'Лох ты, петух!' *бьёт в рыло* -${damage} HP`;
        }
        this.updateGame();
    },

    tradeOpportunity() {
        let text = `\nК тебе подходит барыга: "Есть ${this.player.tugriks} тугриков? Меняю на шмот!"\n`;
        let discount = this.player.reputation > 50 ? 10 : 0;
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
            this.output.innerText += "\nБарыга ушёл, плюнув тебе под ноги.";
        } else {
            this.output.innerText += "\n'Чё бормочешь?' — барыга уходит.";
        }
        this.updateGame();
    },

    action(command) {
        if (this.danyaActive) return;

        let text = "";
        if (command === "искать") {
            let dangerRoll = Math.random() * 10;
            let reputationMod = this.player.reputation < 0 ? 2 : 0;
            if (dangerRoll > this.currentLocation.danger_level + reputationMod) {
                let miniGame = Math.random();
                if (miniGame > 0.8) this.miniGameGuessContainer();
                else if (miniGame > 0.6) this.miniGameSteal();
                else if (miniGame > 0.4) this.miniGameRiddle();
                else {
                    this.player.tugriks += 5;
                    this.output.innerText += "\nНашёл 5 тугриков в грязи!";
                    this.updateGame();
                }
            } else {
                let attacker = this.currentLocation.name === "Квартира" ? "наркоманы" : ["крысы", "скинхеды", "пьяный дворник"][Math.floor(Math.random() * 3)];
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
            if (Math.random() > 0.3) {
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
            this.currentLocation = this.locations.find(loc => loc.name === "Квартира");
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
