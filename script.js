// Игровое состояние
const gameState = {
    health: 10,
    reason: 10,
    funds: 5,
    cards: [],
    logEntries: ['Вы начинаете свой путь в тайных знаниях...'],
    // Храним позиции карт по их названию
    cardPositions: {},
    // Флаги для отслеживания прогресса
    hasAncientKnowledge: false,
    hasFirstFollower: false,
    cultCreated: false
};

// Типы карт
const cardTypes = {
    ASPECT: 'aspect',
    FOLLOWER: 'follower',
    LOCATION: 'location',
    LORE: 'lore',
    RESOURCE: 'resource',
    CULT: 'cult'
};

// Эмодзи для карт
const cardEmojis = {
    [cardTypes.ASPECT]: '🔮',
    [cardTypes.FOLLOWER]: '👤',
    [cardTypes.LOCATION]: '🏛️',
    [cardTypes.LORE]: '📖',
    [cardTypes.RESOURCE]: '💰',
    [cardTypes.CULT]: '☪️'
};

// Концовки
const endings = {
    ASCENSION: {
        title: 'ВОЗНЕСЕНИЕ',
        description: 'Вы собрали все необходимые компоненты и провели Великий Ритуал. Древние силы признали вас достойным и вознесли вас за пределы материального мира. Теперь вы - часть вечного космического сознания, наблюдая за миром из вневременного измерения.'
    },
    MADNESS: {
        title: 'БЕЗУМИЕ',
        description: 'Вы заглянули слишком глубоко в бездну, и бездна заглянула в вас. Ваш разум не выдержал столкновения с невыразимыми истинами. Теперь вы бродите по улицам, бормоча заклинания на забытых языках, видя то, чего не видят другие.'
    },
    CULT_LEADER: {
        title: 'ЛИДЕР КУЛЬТА',
        description: 'Ваши усилия по привлечению последователей увенчались успехом. Вы основали процветающий культ, члены которого поклоняются вам как пророку. Ваше влияние растет с каждым днем, и скоро весь город будет под вашим контролем.'
    },
    FORGOTTEN: {
        title: 'ЗАБЫТЫЙ',
        description: 'Ваши поиски привели вас в забытые уголки мира, но вы так и не нашли того, что искали. Постепенно о вас забыли, и вы стали призраком в собственной жизни, бесцельно блуждающим в поисках смысла, которого больше не существует.'
    }
};

// Инициализация игры
function initGame() {
    // Показываем стартовый экран
    document.getElementById('start-modal').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
    
    // Добавляем обработчики для стартового экрана
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('tutorial-button').addEventListener('click', showTutorial);
    document.getElementById('back-from-tutorial').addEventListener('click', hideTutorial);
    document.getElementById('back-to-start').addEventListener('click', backToStart);
    
    // Добавляем обработчики для действий
    document.getElementById('action-work').addEventListener('click', () => startAction('work'));
    document.getElementById('action-study').addEventListener('click', () => startAction('study'));
    document.getElementById('action-dream').addEventListener('click', () => startAction('dream'));
    document.getElementById('action-talk').addEventListener('click', () => startAction('talk'));
    document.getElementById('action-explore').addEventListener('click', () => startAction('explore'));
    document.getElementById('action-ritual').addEventListener('click', () => startAction('ritual'));
    document.getElementById('action-rest').addEventListener('click', () => startAction('rest'));
    document.getElementById('action-create-cult').addEventListener('click', () => startAction('create-cult'));
    
    // Восстанавливаем позиции карт из localStorage, если они есть
    const savedPositions = localStorage.getItem('cultGameCardPositions');
    if (savedPositions) {
        gameState.cardPositions = JSON.parse(savedPositions);
    }
    
    // Восстанавливаем состояние игры из localStorage
    const savedGameState = localStorage.getItem('cultGameState');
    if (savedGameState) {
        const savedState = JSON.parse(savedGameState);
        gameState.health = savedState.health || 10;
        gameState.reason = savedState.reason || 10;
        gameState.funds = savedState.funds || 5;
        gameState.cultCreated = savedState.cultCreated || false;
        gameState.hasAncientKnowledge = savedState.hasAncientKnowledge || false;
        gameState.hasFirstFollower = savedState.hasFirstFollower || false;
        gameState.logEntries = savedState.logEntries || ['Вы начинаете свой путь в тайных знаниях...'];
    }
    
    // Восстанавливаем карты из localStorage
    const savedCards = localStorage.getItem('cultGameCards');
    if (savedCards) {
        gameState.cards = JSON.parse(savedCards);
    }
}

// Начало игры
function startGame() {
    document.getElementById('start-modal').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    // Если карт нет (первый запуск), создаем начальные
    if (gameState.cards.length === 0) {
        createCard('Здоровье', 'Ваша жизненная сила', cardTypes.RESOURCE, 100, 100, gameState.health);
        createCard('Рассудок', 'Ваша ментальная стабильность', cardTypes.RESOURCE, 300, 100, gameState.reason);
        createCard('Деньги', 'Средства к существованию', cardTypes.RESOURCE, 500, 100, gameState.funds);
        createCard('Старая книга', 'Тайные знания ждут изучения', cardTypes.LORE, 200, 300);
        createCard('Таинственный незнакомец', 'Возможно, он заинтересуется вашими идеями', cardTypes.FOLLOWER, 400, 300);
    }
    
    updateUI();
    
    // Инициализируем перетаскивание карт
    initCardDrag();
    
    // Проверяем, можно ли создать культ
    checkCultCreation();
}

// Показать обучение
function showTutorial() {
    document.getElementById('start-modal').style.display = 'none';
    document.getElementById('tutorial-modal').style.display = 'flex';
}

// Скрыть обучение
function hideTutorial() {
    document.getElementById('tutorial-modal').style.display = 'none';
    document.getElementById('start-modal').style.display = 'flex';
}

// Вернуться на стартовый экран
function backToStart() {
    document.getElementById('ending-modal').style.display = 'none';
    document.getElementById('start-modal').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
    
    // Сброс состояния игры
    gameState.health = 10;
    gameState.reason = 10;
    gameState.funds = 5;
    gameState.cards = [];
    gameState.logEntries = ['Вы начинаете свой путь в тайных знаниях...'];
    gameState.hasAncientKnowledge = false;
    gameState.hasFirstFollower = false;
    gameState.cultCreated = false;
    gameState.cardPositions = {};
    
    // Очищаем localStorage
    localStorage.removeItem('cultGameCardPositions');
    localStorage.removeItem('cultGameState');
    localStorage.removeItem('cultGameCards');
    
    updateUI();
}

// Создание карты
function createCard(title, description, type, defaultX, defaultY, value = null) {
    const cardId = Date.now() + Math.random();
    
    // Проверяем, есть ли сохраненная позиция для этой карты по названию
    let finalX = defaultX;
    let finalY = defaultY;
    
    if (gameState.cardPositions[title]) {
        finalX = gameState.cardPositions[title].x;
        finalY = gameState.cardPositions[title].y;
    }
    
    const card = {
        id: cardId,
        title,
        description,
        type,
        x: finalX,
        y: finalY,
        value: value
    };
    
    gameState.cards.push(card);
    
    // Сохраняем карты в localStorage
    localStorage.setItem('cultGameCards', JSON.stringify(gameState.cards));
    
    return card;
}

// Обновление интерфейса
function updateUI() {
    // Обновляем карты ресурсов
    const healthCard = gameState.cards.find(card => card.title === 'Здоровье');
    if (healthCard) healthCard.value = gameState.health;
    
    const reasonCard = gameState.cards.find(card => card.title === 'Рассудок');
    if (reasonCard) reasonCard.value = gameState.reason;
    
    const fundsCard = gameState.cards.find(card => card.title === 'Деньги');
    if (fundsCard) fundsCard.value = gameState.funds;
    
    // Обновляем стол
    const desk = document.getElementById('desk');
    desk.innerHTML = '';
    
    gameState.cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.type}`;
        cardElement.style.left = `${card.x}px`;
        cardElement.style.top = `${card.y}px`;
        cardElement.setAttribute('data-id', card.id);
        cardElement.setAttribute('data-title', card.title);
        
        let emoji = cardEmojis[card.type] || '❓';
        
        cardElement.innerHTML = `
            <div class="card-header">${emoji} ${card.title}</div>
            <div class="card-content">${card.description}</div>
            ${card.value !== null ? `<div class="resource-value">${card.value}</div>` : ''}
        `;
        
        desk.appendChild(cardElement);
    });
    
    // Обновляем журнал
    const logEntries = document.getElementById('log-entries');
    logEntries.innerHTML = '';
    
    gameState.logEntries.slice().reverse().forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'log-entry';
        entryElement.textContent = entry;
        logEntries.appendChild(entryElement);
    });
    
    // Проверяем условия для создания культа
    checkCultCreation();
    
    // Проверяем условия концовок
    checkEndings();
    
    // Сохраняем состояние игры
    saveGameState();
}

// Сохранение состояния игры
function saveGameState() {
    const gameStateToSave = {
        health: gameState.health,
        reason: gameState.reason,
        funds: gameState.funds,
        cultCreated: gameState.cultCreated,
        hasAncientKnowledge: gameState.hasAncientKnowledge,
        hasFirstFollower: gameState.hasFirstFollower,
        logEntries: gameState.logEntries
    };
    
    localStorage.setItem('cultGameState', JSON.stringify(gameStateToSave));
    localStorage.setItem('cultGameCards', JSON.stringify(gameState.cards));
}

// Проверка возможности создания культа
function checkCultCreation() {
    const hasKnowledge = gameState.cards.some(card => 
        card.type === cardTypes.LORE && card.title.includes('Древнее знание'));
    const hasFollower = gameState.cards.some(card => card.type === cardTypes.FOLLOWER);
    
    if (hasKnowledge && hasFollower && !gameState.cultCreated) {
        document.getElementById('action-create-cult').style.display = 'block';
        gameState.hasAncientKnowledge = true;
        gameState.hasFirstFollower = true;
    } else {
        document.getElementById('action-create-cult').style.display = 'none';
    }
    
    // Показываем кнопку ритуала только после создания культа
    if (gameState.cultCreated) {
        document.getElementById('action-ritual').style.display = 'block';
    } else {
        document.getElementById('action-ritual').style.display = 'none';
    }
}

// Инициализация перетаскивания карт
function initCardDrag() {
    let draggedCard = null;
    let offsetX, offsetY;
    
    document.addEventListener('mousedown', e => {
        if (e.target.closest('.card')) {
            const cardElement = e.target.closest('.card');
            draggedCard = cardElement;
            offsetX = e.clientX - cardElement.offsetLeft;
            offsetY = e.clientY - cardElement.offsetTop;
            cardElement.style.zIndex = '100';
        }
    });
    
    document.addEventListener('mousemove', e => {
        if (draggedCard) {
            draggedCard.style.left = `${e.clientX - offsetX}px`;
            draggedCard.style.top = `${e.clientY - offsetY}px`;
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (draggedCard) {
            // Обновляем позицию карты в состоянии игры
            const cardId = draggedCard.getAttribute('data-id');
            const cardTitle = draggedCard.getAttribute('data-title');
            const card = gameState.cards.find(c => c.id == cardId);
            if (card) {
                card.x = parseInt(draggedCard.style.left);
                card.y = parseInt(draggedCard.style.top);
                
                // Сохраняем позицию в localStorage по названию карты
                gameState.cardPositions[cardTitle] = { 
                    x: card.x, 
                    y: card.y 
                };
                localStorage.setItem('cultGameCardPositions', JSON.stringify(gameState.cardPositions));
                localStorage.setItem('cultGameCards', JSON.stringify(gameState.cards));
            }
            
            draggedCard.style.zIndex = '';
            draggedCard = null;
            
            // Проверяем, можно ли создать культ после перемещения карт
            checkCultCreation();
        }
    });
}

// Начало действия
function startAction(actionType) {
    let message = '';
    let success = true;
    
    switch(actionType) {
        case 'work':
            if (gameState.health > 2) {
                gameState.funds += 2;
                gameState.health -= 1;
                message = 'Вы работаете и зарабатываете немного денег. Здоровье немного ухудшается.';
                
                // С небольшой вероятностью получаем нового последователя
                if (Math.random() > 0.8) {
                    createCard('Заинтересованный слушатель', 'Проявил интерес к вашим идеям', cardTypes.FOLLOWER, 
                              Math.random() * 600 + 100, Math.random() * 300 + 100);
                    message += ' Вы находите нового последователя.';
                }
            } else {
                success = false;
                message = 'Вы слишком истощены для работы.';
            }
            break;
            
        case 'study':
            if (gameState.reason > 1) {
                const loreCard = gameState.cards.find(card => card.type === cardTypes.LORE);
                if (loreCard) {
                    gameState.reason -= 1;
                    message = 'Вы изучаете древние тексты. Рассудок немного страдает, но знания растут.';
                    
                    // Шанс получить новую карту знания
                    if (Math.random() > 0.7) {
                        createCard('Древнее знание', 'Запретные знания предков', cardTypes.LORE, 
                                  Math.random() * 600 + 100, Math.random() * 300 + 100);
                        message += ' Вы находите древнее знание.';
                    }
                } else {
                    success = false;
                    message = 'У вас нет материалов для изучения.';
                }
            } else {
                success = false;
                message = 'Ваш рассудок слишком хрупок для изучения оккультных знаний.';
            }
            break;
            
        case 'dream':
            if (gameState.reason > 0) {
                gameState.reason -= 1;
                message = 'Вы погружаетесь в странные сны. Рассудок слегка страдает.';
                
                // Шанс получить новую карту аспекта
                if (Math.random() > 0.7) {
                    createCard('Видение', 'Образ из снов', cardTypes.ASPECT, 
                              Math.random() * 600 + 100, Math.random() * 300 + 100);
                    message += ' Вы получаете видение из снов.';
                }
            } else {
                success = false;
                message = 'Вы слишком близки к безумию, чтобы спать.';
            }
            break;
            
        case 'talk':
            message = 'Вы ищете последователей для своего культа.';
            
            // Логика привлечения последователей
            if (Math.random() > 0.5) {
                createCard('Новичок', 'Новый последователь вашего культа', cardTypes.FOLLOWER, 
                          Math.random() * 600 + 100, Math.random() * 300 + 100);
                message += ' Вы находите нового последователя.';
            } else {
                message += ' Никто не проявил интереса к вашим идеям.';
            }
            break;
            
        case 'explore':
            if (gameState.funds > 0) {
                gameState.funds -= 1;
                message = 'Вы исследуете окрестности в поисках тайн.';
                
                // Шанс найти новое место или артефакт
                if (Math.random() > 0.6) {
                    createCard('Заброшенный храм', 'Место, полное тайн', cardTypes.LOCATION, 
                              Math.random() * 600 + 100, Math.random() * 300 + 100);
                    message += ' Вы находите заброшенный храм.';
                }
            } else {
                success = false;
                message = 'У вас недостаточно денег для исследований.';
            }
            break;
            
        case 'ritual':
            // Проверяем условия для ритуалов
            if (!gameState.cultCreated) {
                success = false;
                message = 'Вы должны сначала создать культ, чтобы проводить ритуалы.';
            } else {
                const ritualResult = performRitual();
                if (ritualResult) {
                    message = ritualResult.message;
                    if (ritualResult.ending) {
                        showEnding(ritualResult.ending);
                        return;
                    }
                } else {
                    if (gameState.health > 1 && gameState.reason > 1) {
                        gameState.health -= 1;
                        gameState.reason -= 1;
                        message = 'Вы проводите таинственный ритуал.';
                        // Шанс получить могущественную карту
                        if (Math.random() > 0.8) {
                            createCard('Древний артефакт', 'Предмет невероятной силы', cardTypes.LORE, 
                                      Math.random() * 600 + 100, Math.random() * 300 + 100);
                            message += ' Ритуал увенчался успехом! Вы получаете древний артефакт.';
                        } else {
                            message += ' Ритуал не принес ожидаемых результатов.';
                        }
                    } else {
                        success = false;
                        message = 'У вас недостаточно здоровья или рассудка для проведения ритуала.';
                    }
                }
            }
            break;
            
        case 'rest':
            if (gameState.funds > 0) {
                gameState.funds -= 1;
                gameState.health = Math.min(10, gameState.health + 2);
                gameState.reason = Math.min(10, gameState.reason + 1);
                message = 'Вы отдыхаете и восстанавливаете силы.';
            } else {
                success = false;
                message = 'У вас недостаточно денег для отдыха.';
            }
            break;
            
        case 'create-cult':
            if (gameState.hasAncientKnowledge && gameState.hasFirstFollower && !gameState.cultCreated) {
                // Создаем карту культа
                createCard('Тайный культ', 'Ваша организация последователей', cardTypes.CULT, 
                          Math.random() * 600 + 100, Math.random() * 300 + 100);
                gameState.cultCreated = true;
                message = 'Вы создали Тайный культ! Теперь вы можете проводить ритуалы.';
            } else {
                success = false;
                message = 'Для создания культа вам нужно Древнее знание и хотя бы один последователь.';
            }
            break;
    }
    
    if (success) {
        addLogEntry(message);
    } else {
        addLogEntry(`Неудача: ${message}`);
    }
    
    updateUI();
    
    // Проверяем, можно ли создать культ после действия
    checkCultCreation();
}

// Выполнение ритуала
function performRitual() {
    const loreCards = gameState.cards.filter(card => card.type === cardTypes.LORE);
    const followerCards = gameState.cards.filter(card => card.type === cardTypes.FOLLOWER);
    const aspectCards = gameState.cards.filter(card => card.type === cardTypes.ASPECT);
    const locationCards = gameState.cards.filter(card => card.type === cardTypes.LOCATION);
    const cultCard = gameState.cards.find(card => card.type === cardTypes.CULT);
    
    // Ритуал вознесения: культ + 3 карты знаний + 2 карты последователей
    if (cultCard && loreCards.length >= 3 && followerCards.length >= 2) {
        return {
            message: 'Вы проводите Великий Ритуал Вознесения!',
            ending: endings.ASCENSION
        };
    }
    
    // Ритуал безумия: культ + 5 карт аспектов
    if (cultCard && aspectCards.length >= 5) {
        return {
            message: 'Ваш разум не выдерживает наплыва видений!',
            ending: endings.MADNESS
        };
    }
    
    // Ритуал лидера культа: культ + 5 карт последователей
    if (cultCard && followerCards.length >= 5) {
        return {
            message: 'Вы становитесь лидером могущественного культа!',
            ending: endings.CULT_LEADER
        };
    }
    
    // Ритуал забвения: культ + 3 карты мест
    if (cultCard && locationCards.length >= 3) {
        return {
            message: 'Вы теряетесь в лабиринте забытых мест...',
            ending: endings.FORGOTTEN
        };
    }
    
    return null;
}

// Проверка условий концовок
function checkEndings() {
    // Проверяем условия для концовки безумия (низкий рассудок)
    if (gameState.reason <= 0) {
        showEnding(endings.MADNESS);
        return;
    }
    
    // Проверяем условия для концовки забвения (низкое здоровье)
    if (gameState.health <= 0) {
        showEnding(endings.FORGOTTEN);
        return;
    }
    
    // Проверяем условия для концовки безумия (много аспектов)
    const aspectCards = gameState.cards.filter(card => card.type === cardTypes.ASPECT);
    if (aspectCards.length >= 7) {
        showEnding(endings.MADNESS);
        return;
    }
}

// Показать экран концовки
function showEnding(ending) {
    document.getElementById('ending-title').textContent = ending.title;
    document.getElementById('ending-description').textContent = ending.description;
    document.getElementById('ending-modal').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
}

// Добавление записи в журнал
function addLogEntry(entry) {
    gameState.logEntries.push(entry);
    if (gameState.logEntries.length > 20) {
        gameState.logEntries.shift();
    }
}

// Запуск игры при загрузке страницы
window.addEventListener('DOMContentLoaded', initGame);