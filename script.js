// Добавьте этот код в начало функции initApp()
async function initApp() {
    try {
        // Проверка интернет-соединения
        if (!navigator.onLine) {
            window.location.href = 'Dino.html';
            return;
        }

        // Добавьте обработчик события изменения состояния сети
        window.addEventListener('offline', () => {
            window.location.href = 'Dino.html';
        });

        // Остальной код инициализации...
        await loadDatabase();
        setTheme(localStorage.getItem('searchTheme') || 'light');
        handleUrlParams();
        setupEventListeners();
        initChatbot();
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        showError('Произошла ошибка при загрузке приложения. Пожалуйста, обновите страницу.');
    }
}

// Также добавьте проверку при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (!navigator.onLine) {
        window.location.href = 'Dino.html';
    } else {
        initApp();
    }
});

// Конфигурация
const config = {
    databaseUrl: 'database.json',
    popularQueries: [
        "JavaScript",
        "Python",
        "Москва",
        "Санкт-Петербург",
        "Рецепты",
        "Игры",
        "Новости",
        "Спорт"
    ]
};

// База знаний для чат-бота
const chatbotKnowledge = {
    "привет": "Привет! Я Алёнушка, ваш виртуальный помощник в системе Алёнка_Turbo. Чем могу помочь?",
    "здравствуйте": "Здравствуйте! Я могу помочь вам с поиском информации или ответить на вопросы о работе системы.",
    "помощь": "Я могу:\n1. Помочь с поиском информации\n2. Ответить на вопросы о работе системы\n3. Подсказать, как улучшить результаты поиска\nЧто вас интересует?",
    "контакты": "Связаться с поддержкой можно:\n📧 Email: alyonushka-store@yandex.ru\n📞 Телефон: +7 (923) 174-27-02",
    "оператор": "Сейчас я попробую соединить вас с живым оператором...\nК сожалению, все операторы сейчас заняты. Вы можете оставить свой вопрос, и мы ответим вам в течение часа.",
    "спасибо": "Всегда пожалуйста! 😊 Если будут ещё вопросы - я всегда здесь.",
    "пока": "До свидания! Если будут вопросы - просто напишите мне.",
    "поиск": "Чтобы выполнить поиск:\n1. Введите запрос в поле поиска\n2. Нажмите кнопку 'Найти' или Enter\n3. Просмотрите результаты\nМожет я могу найти что-то для вас?",
    "настройки": "Вы можете:\n1. Сменить тему (светлая/тёмная)\n2. Использовать подсказки для уточнения запроса\n3. Фильтровать результаты по категориям",
    "ошибка": "Извините, что-то пошло не так. Попробуйте:\n1. Переформулировать вопрос\n2. Проверить соединение с интернетом\n3. Обратиться в поддержку",
    "алёнка": "Алёнка_Turbo - это умная поисковая система с персональным помощником (это я!). Мы помогаем быстро находить нужную информацию.",
    "алёнушка": "Да, это я! 😊 Ваш виртуальный помощник в системе Алёнка_Turbo. Чем могу помочь?",
    "как пользоваться": "Вот как работает система:\n1. Введите запрос в поле поиска\n2. Уточните его при необходимости\n3. Просматривайте результаты\n4. Используйте фильтры для точного поиска\nХотите, чтобы я помогла с конкретным запросом?"
};

// Часто задаваемые вопросы
const faqOptions = [
    "Как выполнить поиск?",
    "Где найти контакты?",
    "Как сменить тему?",
    "Как связаться с оператором?",
    "Что такое Алёнка_Turbo?"
];

// Глобальные переменные
let database = [];
let currentTheme = 'light';
let currentQuery = '';

// DOM элементы
const domElements = {
    searchInput: document.getElementById('search-input'),
    searchButton: document.getElementById('search-button'),
    searchResults: document.getElementById('search-results'),
    searchStats: document.getElementById('search-stats'),
    themeButtons: document.querySelectorAll('.theme-btn'),
    loadingElement: document.getElementById('loading'),
    suggestionsElement: document.getElementById('suggestions'),
    searchTips: document.querySelector('.search-tips')
};

// Инициализация приложения
async function initApp() {
    try {
        // Загрузка базы данных
        await loadDatabase();
        
        // Установка темы
        setTheme(localStorage.getItem('searchTheme') || 'light');
        
        // Обработка параметров URL
        handleUrlParams();
        
        // Настройка обработчиков событий
        setupEventListeners();
        
        // Инициализация чат-бота
        initChatbot();
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        showError('Произошла ошибка при загрузке приложения. Пожалуйста, обновите страницу.');
    }
}

// Загрузка базы данных из JSON файла
async function loadDatabase() {
    try {
        const response = await fetch(config.databaseUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        database = await response.json();
    } catch (error) {
        console.error('Ошибка загрузки базы данных:', error);
        throw error;
    }
}

// Обработка параметров URL
function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('q');
    
    if (searchParam && domElements.searchInput) {
        domElements.searchInput.value = searchParam;
        performSearch(searchParam);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Поиск
    if (domElements.searchButton) {
        domElements.searchButton.addEventListener('click', () => performSearch(domElements.searchInput.value));
    }

    if (domElements.searchInput) {
        domElements.searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(domElements.searchInput.value);
                domElements.suggestionsElement.style.display = 'none';
            }
        });
        
        domElements.searchInput.addEventListener('input', function() {
            showSuggestions();
        });
    }

    // Подсказки
    if (domElements.suggestionsElement) {
        domElements.suggestionsElement.addEventListener('click', function(e) {
            if (e.target.classList.contains('suggestion-item')) {
                domElements.searchInput.value = e.target.textContent;
                domElements.suggestionsElement.style.display = 'none';
                performSearch(domElements.searchInput.value);
            }
        });
    }

    // Клик вне подсказок скрывает их
    document.addEventListener('click', function(e) {
        if (domElements.suggestionsElement && !e.target.closest('.search-form')) {
            domElements.suggestionsElement.style.display = 'none';
        }
    });

    // Тема
    domElements.themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(btn.dataset.theme);
        });
    });

    // Подсказки поиска
    if (domElements.searchTips) {
        domElements.searchTips.addEventListener('click', function(e) {
            if (e.target.tagName === 'SPAN') {
                domElements.searchInput.value = e.target.textContent;
                performSearch(e.target.textContent);
            }
        });
    }
}

// Функция поиска
function performSearch(query) {
    query = query.toLowerCase().trim();
    currentQuery = query;
    
    if (query === '') {
        showEmptyQueryMessage();
        return;
    }

    showLoadingIndicator();
    
    // Имитация задержки поиска
    setTimeout(() => {
        try {
            const results = searchInDatabase(query);
            displaySearchResults(results, query);
        } catch (error) {
            console.error('Ошибка поиска:', error);
            showError('Произошла ошибка при выполнении поиска.');
        } finally {
            hideLoadingIndicator();
        }
    }, 800);
}

// Поиск в базе данных
function searchInDatabase(query) {
    return database.filter(item => {
        return item.title.toLowerCase().includes(query) || 
               item.snippet.toLowerCase().includes(query) ||
               item.category.toLowerCase().includes(query);
    });
}

// Отображение сообщения о пустом запросе
function showEmptyQueryMessage() {
    const message = '<div class="no-results">Пожалуйста, введите поисковый запрос</div>';
    domElements.searchResults.innerHTML = message;
    domElements.searchStats.textContent = '';
}

// Показать индикатор загрузки
function showLoadingIndicator() {
    domElements.loadingElement.style.display = 'block';
    domElements.searchResults.innerHTML = '';
}

// Скрыть индикатор загрузки
function hideLoadingIndicator() {
    domElements.loadingElement.style.display = 'none';
}

// Отображение результатов поиска
function displaySearchResults(results, query) {
    if (results.length === 0) {
        showNoResultsMessage(query);
        return;
    }

    const statsText = `Найдено ${results.length} ${formatResultsCount(results.length)} по запросу "${query}"`;
    domElements.searchStats.textContent = statsText;
    domElements.searchStats.classList.add('animate__animated', 'animate__fadeIn');

    const html = generateResultsHtml(results, query);
    domElements.searchResults.innerHTML = html;
}

// Генерация HTML для результатов
function generateResultsHtml(results, query) {
    return results.map((result, index) => `
        <div class="result-item animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
            <a href="${result.url}" class="result-title">${highlightText(result.title, query)}</a>
            <div class="result-url">${result.url}</div>
            <div class="result-snippet">${highlightText(result.snippet, query)}</div>
            <div class="result-category">Категория: ${result.category}</div>
        </div>
    `).join('');
}

// Сообщение об отсутствии результатов
function showNoResultsMessage(query) {
    const message = `
        <div class="no-results animate__animated animate__fadeIn">
            Ничего не найдено по запросу "${query}". Попробуйте изменить запрос.
        </div>
    `;
    domElements.searchResults.innerHTML = message;
}

// Форматирование счетчика результатов
function formatResultsCount(count) {
    if (count % 10 === 1 && count % 100 !== 11) {
        return 'результат';
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
        return 'результата';
    }
    return 'результатов';
}

// Подсветка текста в результатах
function highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Показать подсказки
function showSuggestions() {
    const query = domElements.searchInput.value.toLowerCase().trim();
    
    if (query.length < 2) {
        domElements.suggestionsElement.style.display = 'none';
        return;
    }
    
    const filtered = config.popularQueries.filter(q => q.toLowerCase().includes(query));
    
    if (filtered.length === 0) {
        domElements.suggestionsElement.style.display = 'none';
        return;
    }
    
    domElements.suggestionsElement.innerHTML = filtered.map(item => 
        `<div class="suggestion-item">${item}</div>`
    ).join('');
    domElements.suggestionsElement.style.display = 'block';
}

// Установка темы
function setTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    currentTheme = theme;
    
    domElements.themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
    
    localStorage.setItem('searchTheme', theme);
}

// Показать сообщение об ошибке
function showError(message) {
    const errorHtml = `<div class="no-results error">${message}</div>`;
    domElements.searchResults.innerHTML = errorHtml;
}

// Инициализация чат-бота
function initChatbot() {
    // Обработчики событий
    document.getElementById('chatbot-toggle').addEventListener('click', toggleChatbot);
    document.getElementById('chatbot-close').addEventListener('click', toggleChatbot);
    document.getElementById('chatbot-send').addEventListener('click', sendMessage);
    document.getElementById('chatbot-user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Приветственное сообщение
    setTimeout(() => {
        addBotMessage("Привет! Я Алёнушка, ваш помощник в системе Алёнка_Turbo. Чем могу помочь?");
        showOptions(faqOptions);
    }, 1500);
}

// Переключение видимости чата
function toggleChatbot() {
    const chatbot = document.getElementById('chatbot-container');
    chatbot.classList.toggle('active');
    
    if (chatbot.classList.contains('active')) {
        document.getElementById('chatbot-user-input').focus();
    }
}

// Добавление сообщения пользователя
function addUserMessage(text) {
    const messages = document.getElementById('chatbot-messages');
    const message = document.createElement('div');
    message.className = 'message user-message';
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
}

// Добавление сообщения бота
function addBotMessage(text) {
    const messages = document.getElementById('chatbot-messages');
    const message = document.createElement('div');
    message.className = 'message bot-message';
    
    // Сохраняем переносы строк
    message.innerHTML = text.replace(/\n/g, '<br>');
    
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
}

// Показать индикатор набора сообщения
function showTypingIndicator() {
    const messages = document.getElementById('chatbot-messages');
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(indicator);
    messages.scrollTop = messages.scrollHeight;
    return indicator;
}

// Скрыть индикатор набора сообщения
function hideTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

// Показать варианты ответов
function showOptions(options) {
    const messages = document.getElementById('chatbot-messages');
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'chatbot-options';
    
    options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'chatbot-option';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => {
            addUserMessage(option);
            processUserInput(option);
        });
        optionsContainer.appendChild(optionElement);
    });
    
    messages.appendChild(optionsContainer);
    messages.scrollTop = messages.scrollHeight;
}

// Отправка сообщения
function sendMessage() {
    const input = document.getElementById('chatbot-user-input');
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message);
        input.value = '';
        processUserInput(message);
    }
}

// Обработка ввода пользователя
function processUserInput(input) {
    const lowerInput = input.toLowerCase();
    let response = "";
    const typingIndicator = showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator(typingIndicator);
        
        // Проверка базы знаний
        for (const [key, value] of Object.entries(chatbotKnowledge)) {
            if (lowerInput.includes(key)) {
                response = value;
                break;
            }
        }
        
        // Если не найдено в базе знаний
        if (!response) {
            if (lowerInput.includes("поиск") || lowerInput.includes("найти")) {
                response = "Я могу помочь с поиском. Введите ваш запрос в поле поиска вверху страницы. Например:\n\n- JavaScript\n- Москва\n- Рецепты блинов\n\nХотите, чтобы я выполнила поиск за вас?";
            } else if (lowerInput.includes("тема") || lowerInput.includes("оформление")) {
                response = "Вы можете изменить тему сайта с помощью переключателя в правом верхнем углу. Доступны:\n\n- Светлая тема\n- Тёмная тема\n\nКакую тему предпочитаете?";
            } else {
                response = "Извините, я не совсем поняла ваш вопрос. Попробуйте переформулировать или выберите один из вариантов:";
                addBotMessage(response);
                showOptions(faqOptions);
                return;
            }
        }
        
        addBotMessage(response);
        
        // Дополнительные действия для некоторых ответов
        if (response.includes("оператор")) {
            setTimeout(() => {
                addBotMessage("Вы также можете написать нам на alyonushka-store@yandex.ru или позвонить по номеру +7 (923) 174-27-02.");
            }, 2000);
        }
    }, 1000 + Math.random() * 1000);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);