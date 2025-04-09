const game = {
    player: {
        health: 100,
        inventory: [],
        reputation: 0,
        quests: {},
        is_addicted: false,
        has_hiv: false,
        is_drunk: false,
        tugriks: 0
    },

    locations: [
        { name: "Контейнер у 'Пятёрочки'", description: "Воняет тухлым борщом и надеждой. В углу ржавеет детская коляска.", items: ["полупустая бутылка 'Балтики'", "доширак", "ключ от квартиры", "битый кирпич"], danger_level: 2 },
        { name: "Гаражи за домом", description: "Темно, пахнет бензином и страхом. Здесь точно прячутся скинхеды.", items: ["чекушка 'Беленькой'", "ящик 'Жигулевского'", "ржавый гвоздь"], danger_level: 7 },
        { name: "Помойка у парадной", description: "Аристократическая помойка: битые фарфоровые чашки и пустые бутылки шампанского.", items: ["банка тушёнки", "бабушкин суп", "кольцо с фианитом"], danger_level: 3 },
        { name: "Квартира", description: "Заброшенная хата с ободранными обоями и запахом фентанила. Тут шарахаются наркоманы.", items: ["грязный шприц", "доза фентанила", "пустая пачка сигарет"], danger_level: 10 },
        { name: "Ломбард", description: "Тёмный закуток с мутным типом за стойкой. Пахнет старыми шмотками и безнадёгой.", items: ["ржавый гвоздь", "пустая пачка сигарет"], danger_level: 4 }
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
        if (this.player.quests) status += `📜 Квесты: ${Object.keys(this.player.quests).join(", ")}\n`;
        if (this.player.is_addicted) status += "💉 Ты зависим от фентанила!\n";
        if (this.player.has_hiv) status += "🩺 У тебя ВИЧ!\n";
        if (this.player.is_drunk) status += "🍺 Ты пьяный!\n";
        document.getElementById("status").innerText = status;
    },

    updateGame() {
        let text = `Вы находитесь: ${this.currentLocation.name}\n${this.currentLocation.description}`;

        if (this.currentLocation.name === "Квартира" && !this.player.has_hiv) {
            text += "\nОбдолбанный наркоман подбегает и втыкает в тебя грязный шприц!";
            this.player.is_addicted = true;
            this.player.has_hiv = true;
            this.player.health -= 20;
            text += "\nТы стал зависимым от фентанила и заразился ВИЧ! -20 HP";
        }

        if (this.player.is_addicted && !this.player.inventory.includes("доза фентанила")) {
            this.player.health -= 5;
            text += "\nТы страдаешь от ломки... -5 HP";
        }

        if (this.player.is_drunk) {
            text += "\nТы вырубился от 'Балтики'... Zzz...";
            setTimeout(() => {
                text += "\nТы проснулся у мусорки, изнасилованный, с дикой болью в очке. -15 HP, -20 репутации.";
                this.player.health -= 15;
                this.player.reputation -= 20;
                this.player.is_drunk = false;
                this.updateGame();
            }, 3000);
        }

        if (this.player.health <= 0) {
            text += "\n💀 Игра окончена. Ты сгнил в питерских помойках...";
            document.getElementById("actions").style.display = "none";
        }

        this.output.innerText = text;
        this.updateStatus();

        if (this.player.tugriks >= 100 && (this.currentLocation.name === "Контейнер у 'Пятёрочки'" || this.currentLocation.name === "Гаражи за домом")) {
            let exchange = prompt(`У тебя ${this.player.tugriks} тугриков. Купить что-то? (балтика/фентанил/нет)`).toLowerCase();
            if (exchange === "балтика" && this.currentLocation.name === "Контейнер у 'Пятёрочки'") {
                this.player.tugriks -= 100;
                this.player.inventory.push("полная бутылка 'Балтики'");
                text += "\nТы купил полную бутылку 'Балтики' за 100 тугриков!";
            } else if (exchange === "фентанил" && this.currentLocation.name === "Гаражи за домом") {
                this.player.tugriks -= 100;
                this.player.inventory.push("доза фентанила");
                text += "\nТы купил дозу фентанила за 100 тугриков!";
            }
            this.output.innerText = text;
            this.updateStatus();
        }
    },

    action(command) {
        if (this.danyaActive) return;

        let text = "";
        if (command === "искать") {
            if (Math.random() * 10 > this.currentLocation.danger_level) {
                let foundItem = this.currentLocation.items[Math.floor(Math.random() * this.currentLocation.items.length)];
                this.player.inventory.push(foundItem);
                text += `Вы нашли: ${foundItem}!`;
                if (foundItem === "ящик 'Жигулевского'" && "украсть заначку скинхедов" in this.player.quests) {
                    this.completeQuest("украсть заначку скинхедов");
                } else if (foundItem === "чекушка 'Беленькой'" && "найти чекушку 'Беленькой'" in this.player.quests) {
                    this.completeQuest("найти чекушку 'Беленькой'");
                } else if (foundItem === "банка тушёнки" && "принести Данье тушёнку" in this.player.quests) {
                    this.completeQuest("принести Данье тушёнку");
                }
            } else {
                let attacker = this.currentLocation.name === "Квартира" ? "наркоманы" : ["крысы", "скинхеды", "пьяный дворник"][Math.floor(Math.random() * 3)];
                if (this.player.inventory.includes("ржавый гвоздь") && (attacker === "скинхеды" || attacker === "наркоманы")) {
                    text += `Ты отбился от ${attacker} ржавым гвоздём! Никакого урона!`;
                } else {
                    let damage = Math.floor(Math.random() * 16) + 5;
                    this.player.health -= damage;
                    text += `О нет! На вас напали: ${attacker}! -${damage} HP`;
                }
            }
        } else if (command === "уйти") {
            this.currentLocation = this.locations[Math.floor(Math.random() * this.locations.length)];
            text += "Вы переходите к следующей мусорке...";
        } else if (command === "позвать Даню") {
            if (Math.random() > 0.3) {
                this.danyaActive = true;
                text += "\nИз-за мусорного бака появляется Даня: 'О, кентавр! Дашь на пропитание?'";
                this.danyaOptions.style.display = "block";
            } else {
                text += "\nДаня не пришёл. Видимо, спит где-то в подвале или нажрался.";
            }
        }

        this.output.innerText += "\n" + text;
        this.updateGame();
    },

    useItem(item) {
        if (!this.player.inventory.includes(item)) {
            this.output.innerText += "\nУ вас нет такого предмета.";
            return;
        }

        let text = "";
        if (item === "банка тушёнки") {
            this.player.health += 15;
            text = "Вы поели тушёнки! +15 HP";
        } else if (item === "полупустая бутылка 'Балтики'" || item === "полная бутылка 'Балтики'") {
            this.player.is_drunk = true;
            text = "Ты выпил 'Балтику' и пошёл в отрыв... Скоро пожалеешь!";
        } else if (item === "доширак") {
            this.player.health += 5;
            text = "Ты открыл доширак и сожрал его сухим. +5 HP";
        } else if (item === "ключ от квартиры") {
            this.currentLocation = this.locations.find(loc => loc.name === "Квартира");
            text = "Ты открыл дверь и попал в Квартиру...";
        } else if (item === "битый кирпич" && this.currentLocation.name === "Контейнер у 'Пятёрочки'") {
            this.player.inventory.push("чекушка 'Беленькой'");
            text = "Ты разбил окно 'Пятёрочки' кирпичом и спиздил чекушку!";
        } else if (item === "доза фентанила" && this.player.is_addicted) {
            this.player.health += 10;
            text = "Ты ширнулся фентанилом. Ломка отступила! +10 HP";
        } else if (item === "грязный шприц" && this.player.inventory.includes("доза фентанила")) {
            this.player.is_addicted = true;
            this.player.has_hiv = true;
            this.player.health -= 20;
            this.player.inventory.splice(this.player.inventory.indexOf("доза фентанила"), 1);
            text = "Ты ширнулся грязным шприцом с фентанилом. Теперь ты зависим и с ВИЧ! -20 HP";
        } else if (item === "бабушкин суп") {
            this.player.health += 30;
            text = "Ты выпил бабушкин суп. Вкус детства! +30 HP";
        } else if (item === "кольцо с фианитом" && this.currentLocation.name === "Ломбард") {
            this.player.tugriks += 100;
            text = "Ты сдал кольцо в ломбард. Получил 100 тугриков!";
        } else if (item === "пустая пачка сигарет" && this.player.inventory.includes("доза фентанила")) {
            this.player.inventory.splice(this.player.inventory.indexOf("доза фентанила"), 1);
            this.player.inventory.push("пачка с фентанилом");
            text = "Ты засунул дозу фентанила в пачку сигарет.";
        } else {
            text = "Этот предмет пока нельзя использовать или не здесь.";
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
            "украсть заначку скинхедов": { description: "Даня уверен, что пацаны спрятали ящик 'Жигулевского' в гаражах.", reward: "история про рехаб" },
            "принести Данье тушёнку": { description: "Ему нужно 'заморить червячка' после вчерашнего.", reward: "история про бабушку с супом" },
            "найти чекушку 'Беленькой'": { description: "Для 'медикаментов'.", reward: "история про побег от скинхедов" }
        };

        if (action === "поговорить") {
            if (Object.keys(this.player.quests).length === 0) {
                text += "\nДаня чешет подштанник: 'Слушай, есть дельце...'";
                for (let quest in danyaQuests) {
                    text += `\n- '${quest}': ${danyaQuests[quest].description}`;
                }
                let questChoice = prompt("Выбери квест (напиши название):").toLowerCase();
                if (questChoice in danyaQuests) {
                    this.player.quests[questChoice] = danyaQuests[questChoice];
                    text += `\nДаня кивает: 'Сделаешь — расскажу байку. ${danyaQuests[questChoice].reward}!'`;
                } else {
                    text += "\n'Ты чё, не в себе?' — Даня отворачивается.";
                }
            } else {
                text += "\nДаня бубнит: 'Ты ж уже дело делаешь... Вернёшься с выполненным — байку расскажу.'";
            }
        } else if (action === "дать бухло") {
            if (this.player.inventory.includes("полупустая бутылка 'Балтики'")) {
                this.player.inventory.splice(this.player.inventory.indexOf("полупустая бутылка 'Балтики'"), 1);
                this.player.reputation += 30;
                text += "\nДаня жадно пьёт: 'Ох, браток, жизнь-то какая... Однажды в рехабе мне...' *история теряется в блевоте*";
            } else {
                text += "\n'Где бухло-то?!' — Даня злобно косится.";
            }
        } else if (action === "уйти") {
            text += "\nДаня ушёл в закат.";
        }

        this.danyaActive = false;
        this.danyaOptions.style.display = "none";
        this.output.innerText += text;
        this.updateGame();
    },

    completeQuest(quest) {
        const stories = {
            "история про рехаб": "— ...а потом медсестра мне: 'Даня, ты как в говне лежал?', а я ей: 'Это не я — это Лёха из 5-й палаты!'",
            "история про бабушка с супом": "— Бабулька орала: 'Сдохни, тварь!', но суп был вкусный... картошечка плавала...",
            "история про побег от скинхедов": "— Бежал как угорелый, а они кричат: 'Стой, алкоголик!'. Ну я и стою — мне пох*й."
        };
        let rewardStory = this.player.quests[quest].reward;
        this.output.innerText += `\nДаня рассказывает: ${stories[rewardStory]}`;
        this.player.reputation += 50;
        delete this.player.quests[quest];
    }
};

function showUseItemPrompt() {
    let item = prompt("Какой предмет использовать?").toLowerCase();
    game.useItem(item);
}

game.init();