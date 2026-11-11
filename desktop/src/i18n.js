/* Переключение языка RU → EN: перевод текстов интерфейса «на лету» (тексты пользователя не трогаем) */
(function () {
  'use strict';
  var D = {
    'Маленькие шаги приводят к большим результатам': 'Small steps lead to big results',
    'Имя пользователя': 'Username', 'Пароль': 'Password', 'Войти': 'Log in', 'Зарегистрироваться': 'Sign up',
    'Ежедневник': 'Daily planner', 'Заметки': 'Notes', 'Проекты': 'Projects', 'Привычки': 'Habits', 'КПД': 'KPI', 'Настройки': 'Settings',
    'день': 'day', 'дня': 'days', 'дней': 'days', 'Здорово, что ты здесь!': 'Great to see you!', 'Привет!': 'Hello!', 'Доброго дня!': 'Good day!', 'Вперёд!': 'Let’s go!', 'Новый день': 'A new day',
    'Начни с одного дела —': 'Start with one thing —', 'остальное пойдёт легче.': 'the rest will get easier.',
    'Сегодня отличный день,': 'Today is a great day', 'чтобы стать лучше.': 'to become better.',
    'Маленькие шаги': 'Small steps', 'приводят к большим целям.': 'lead to big goals.',
    'Сделай сегодня то, за что': 'Do something today that', 'завтра скажешь себе спасибо.': 'you will thank yourself for tomorrow.',
    'Новая страница.': 'A new page.', 'Напиши её сам.': 'Write it yourself.',
    'Твои действия на сегодня': 'Your actions for today', 'Действия за': 'Actions for', 'Сегодня': 'Today', 'Время действовать!': 'Time to act!',
    'Один шаг — и ты уже впереди вчерашнего себя.': 'One step and you are already ahead of yesterday’s you.',
    'Большие результаты начинаются с одного маленького действия.': 'Big results start with one small action.',
    'Добавить действие': 'Add action', 'КПД сегодня': 'KPI today', 'заданий выполнено': 'tasks completed', 'Завершить день': 'Finish the day', 'День завершён ✓': 'Day finished ✓', 'Можно завершать!': 'Ready to finish!',
    'заданий': 'tasks', 'Редактировать': 'Edit', 'Во весь экран (Alt+Enter)': 'Full screen (Alt+Enter)', 'Свернуть': 'Minimize', 'Развернуть': 'Maximize', 'Свернуть в окно': 'Restore', 'Закрыть': 'Close',
    'Серия дней': 'Day streak', 'Профиль': 'Profile', 'Закрепить на каждый день': 'Repeat every day', 'Удалить': 'Delete', 'Очистить': 'Clear',
    '✎ Рисунок': '✎ Drawing', '♥ В избранное': '♥ Favorite', '📌 Закрепить': '📌 Pin', 'Сохранить заметку': 'Save note',
    'Все': 'All', 'Закреплённые': 'Pinned', 'Избранные': 'Favorites', 'Время за заметками сегодня': 'Time with notes today',
    'Пауза': 'Pause', 'Продолжить': 'Resume', 'Старт': 'Start', 'заметок': 'notes', 'заметки': 'notes', 'заметка': 'note', 'закреплено': 'pinned', 'в избранном': 'favorites',
    'Пиши, рисуй, отмечай важное. Время, проведённое здесь, тикает в КПД. Заметку можно только дополнять — с отметкой даты.': 'Write, draw, mark what matters. Time spent here ticks into your KPI. A note can only be extended — with a date stamp.',
    'О чём ты думаешь? Любой текст, мысль, цитата…': 'What are you thinking? Any text, thought, quote…',
    'Закрепить': 'Pin', 'В избранное': 'Favorite', 'Дополнить': 'Extend', 'Здесь пока пусто': 'Nothing here yet', 'Напиши мысль, нарисуй что-нибудь или отметь заметку.': 'Write a thought, draw something or mark a note.',
    'Планируй. Выполняй. Достигай.': 'Plan. Do. Achieve.', 'Активные': 'Active', 'Завершённые': 'Completed', 'Замороженные': 'Frozen', 'Активный': 'Active', 'Завершён': 'Completed', 'Заморожен': 'Frozen',
    '＋ Создать проект': '＋ New project', 'Проектов пока нет. Создай первый!': 'No projects yet. Create the first one!', 'Выбери проект слева или создай новый.': 'Pick a project on the left or create a new one.',
    'Большие цели, разбитые на маленькие действия. Закрывай действия — проект движется вперёд.': 'Big goals split into small actions. Close actions — the project moves forward.',
    'Формируй полезные привычки.': 'Build useful habits.', 'Избавляйся от вредных.': 'Get rid of bad ones.',
    'Общий прогресс за неделю': 'Weekly progress', 'Выполнено за неделю': 'Done this week', 'XP за привычки': 'Habit XP', 'Мои привычки': 'My habits', '＋ Добавить привычку': '＋ Add habit',
    'Полезные': 'Useful', 'Вредные': 'Harmful', 'Пн': 'Mon', 'Вт': 'Tue', 'Ср': 'Wed', 'Чт': 'Thu', 'Пт': 'Fri', 'Сб': 'Sat', 'Вс': 'Sun',
    'Зайти в приложение': 'Open the app', 'Аналитика привычек': 'Habit analytics', '30 дней': '30 days', 'Полезные привычки': 'Useful habits', 'Выполнено': 'Done', 'за 30 дней': 'in 30 days',
    'Вредные привычки': 'Harmful habits', 'Воздержался': 'Resisted', 'Детальный отчёт': 'Detailed report', 'Не выполнено': 'Not done',
    'Полезные отмечай, когда сделал. Вредные — когда удержался и не сделал.': 'Mark useful habits when you do them. Harmful ones — when you resisted.',
    'Статистика КПД': 'KPI statistics', 'Твой прогресс. Вся картина в одном месте.': 'Your progress. The whole picture in one place.', 'Текущий ранг': 'Current rank',
    'Новичок': 'Newbie', 'Любитель': 'Amateur', 'Почти задрот': 'Almost a grinder', 'Постоянец': 'Regular', 'Легенда': 'Legend', 'Общий опыт': 'Total XP',
    'Динамика КПД': 'KPI trend', 'Сейчас:': 'Now:', '7д': '7d', '30д': '30d', '90д': '90d', 'Год': 'Year', 'Избранное': 'Favorites', 'Разбивка по категориям': 'Breakdown by category',
    'Общий КПД за период:': 'Total KPI for the period:', 'Настроить нагрузку': 'Set workload', 'Формула дня': 'Daily formula', '5 категорий = 5 очков = 100%': '5 categories = 5 points = 100%',
    'Средне — рекомендуется (около 20)': 'Medium — recommended (about 20)', 'Лёгкий режим': 'Light mode', 'Тяжело (около 40)': 'Hard (about 40)', 'Очень напряжённо': 'Very intense', 'Очень тяжело': 'Very hard',
    'Ключевая статистика': 'Key statistics', 'дней серии': 'day streak', 'выполненных действий': 'completed actions',
    'Итог всех категорий: насколько полно ты использовал свой день и год.': 'The sum of all categories: how fully you used your day and year.',
    'Подстрой Life Owl под себя.': 'Make Life Owl your own.', 'Внешний вид': 'Appearance', 'Сбросить': 'Reset', 'Цвет кнопок': 'Button color', 'Акцент интерфейса': 'Interface accent',
    'Цвет надписей': 'Text color', 'Для белого фона': 'For a light background', 'Для тёмного фона': 'For a dark background', 'Затемнение': 'Darkening', 'Яркость': 'Brightness',
    'Фон приложения': 'App background', 'Пресет оформления': 'Theme preset', 'Тёмный матовый': 'Dark matte', 'Белый матовый': 'White matte', 'Свой градиент': 'Custom gradient',
    'Прозрачность текста': 'Text opacity', 'От 30%, чтобы текст не пропадал': 'From 30% so text doesn’t vanish', 'Непрозрачность': 'Opacity', 'Свечение текста': 'Text glow', 'Мягкое сияние · только в режиме 3D': 'Soft glow · 3D mode only',
    'Сила свечения': 'Glow strength', 'Перелив текста': 'Text gradient', 'Градиент по тексту · только в режиме 3D': 'Gradient over text · 3D mode only', 'Выключен': 'Off', 'Включён': 'On',
    'Фоновое изображение': 'Background image', 'Своя картинка под стеклом': 'Your own picture behind the glass', 'Выбрать изображение': 'Choose image', 'Прозрачность фона': 'Background opacity',
    'Анимация фона': 'Background animation', 'Волны, снег или без анимации': 'Waves, snow, rain or none', 'Волны': 'Waves', 'Снег': 'Snow', 'Дождь': 'Rain', 'Нет': 'None',
    'Стили · огонёк, календарь, оформление': 'Styles · flame, calendar, look', 'Огонёк серии': 'Streak flame', 'Вид значка в шапке и календаре': 'Icon in the header and calendar', 'Классика': 'Classic', 'Капля': 'Drop', 'Искра': 'Spark',
    'Цвет огонька': 'Flame color', 'Цвет пламени серии': 'Streak flame color', 'Эффект огонька': 'Flame effect', 'Оформление пламени': 'Flame look', 'Обычный': 'Plain', 'Свечение': 'Glow', 'Переливающийся матовый': 'Iridescent matte',
    'Цвет выполненных дней': 'Completed days color', 'Отметка в календаре': 'Mark in the calendar', 'Приветствие': 'Greeting', 'Текст сверху в Ежедневнике': 'Text at the top of the planner', 'Каждый день новое': 'New every day',
    'Стиль задач': 'Actions style', 'Блокнот для задач на сегодня': 'Notepad for today’s actions', 'Стекло': 'Glass', 'Блокнот': 'Notebook', 'Неон': 'Neon', 'Крафт': 'Kraft',
    'Стиль дневника': 'Notes style', 'Разговоры с собой': 'Notes', 'Простой': 'Simple', 'Мармелад': 'Jelly', 'Шрифт дневника': 'Notes font', 'Курсив': 'Italic', 'Рукописный': 'Handwritten', 'Печатный': 'Typewriter', 'Жирный': 'Bold',
    'Таймер общения': 'Notes timer', 'Вид таймера': 'Timer look', 'Оба': 'Both', 'Песочные часы': 'Hourglass', 'Циферблат': 'Clock dial', 'Режим графики': 'Graphics mode', '3D — объём и блики, 2D — плоский и быстрый': '3D — depth and highlights, 2D — flat and fast',
    'Тень текста': 'Text shadow', 'Только в режиме 3D': '3D mode only', 'Без тени': 'No shadow', 'Мягкая': 'Soft', 'Объёмная': 'Full', 'Шрифт цитат': 'Quote font', 'Вкладка «Заметки»': '“Notes” tab',
    'Размер интерфейса': 'Interface size', 'Масштабирует все элементы': 'Scales every element', 'Маленький': 'Small', 'Средний': 'Medium', 'Крупный': 'Large', 'Уведомления': 'Notifications',
    'Напоминание вечером, если день не завершён': 'Evening reminder if the day isn’t finished', 'Сменить аватарку': 'Change avatar', 'Выйти': 'Log out', 'Сброс прогресса': 'Reset progress',
    'Удалит все данные аккаунта, кроме логина и пароля': 'Deletes all account data except login and password', 'Сбросить весь прогресс': 'Reset all progress', 'Свой цвет': 'Custom color',
    'Скин (цвет волн)': 'Skin (wave color)', 'Фиолетовый': 'Violet', 'Синий': 'Blue', 'Голубой': 'Cyan', 'Розовый': 'Pink', 'Язык интерфейса': 'Interface language',
    'Новое действие': 'New action', 'Изменить действие': 'Edit action', '1. Название': '1. Title', '2. Стикер': '2. Sticker', '3. Тип': '3. Type', 'Сложное действие': 'Complex action',
    'Состоит из поддействий. 3 очка вместо 1': 'Made of sub-actions. 3 points instead of 1', 'Поддействия': 'Sub-actions', 'Добавить': 'Add', 'Индикатор сложности': 'Difficulty indicator',
    'До 5 поддействий — тёмно-зелёный, больше 5 — тёмно-оранжевый, 10 и больше — тёмно-красный': 'Up to 5 sub-actions — dark green, over 5 — dark orange, 10 or more — dark red',
    'Будет появляться каждый день автоматически': 'Will appear every day automatically', 'Закрепить': 'Pin', 'Отмена': 'Cancel', 'Сохранить': 'Save', 'Что нужно сделать': 'What needs to be done',
    'Новое поддействие': 'New sub-action', 'Поддействие': 'Sub-action', 'Редактирование': 'Editing', 'Тяни блок за верхнюю полоску, размер — за угол. Блоки не наезжают друг на друга.': 'Drag a block by its top bar, resize by the corner. Blocks never overlap.',
    'Настройки стиля': 'Style settings', 'Текст': 'Text', 'Огонёк': 'Flame', 'Настройки графики': 'Graphics settings', 'Приветствие': 'Greeting', 'Фон': 'Background', 'Пол-экрана': 'Half screen', '⬍ На весь экран': '⬍ Full screen', '▭ Пол-экрана': '▭ Half screen', 'Карандаш': 'Pencil', 'Маркер': 'Marker', 'Мягкая кисть': 'Soft brush', 'Спрей': 'Spray', 'Радуга': 'Rainbow', 'Ластик': 'Eraser', 'Толщина': 'Size', 'Прозрачная': 'Transparent', 'Тёмная': 'Dark', 'Белая': 'White', 'Крафт': 'Kraft', 'Закрыть': 'Close', 'Очистить': 'Clear', '↶ Отмена': '↶ Undo', 'Изменить рисунок': 'Edit drawing', 'Редактировать заметку': 'Edit note', 'Редактировать': 'Edit', 'Сброс стилей': 'Reset styles', 'Цвет кнопок': 'Button color', 'Скин (цвет волн)': 'Skin (wave color)', 'Вредная привычка': 'Harmful habit', 'Полезная привычка': 'Useful habit', 'Пока пусто': 'Empty for now',
    'Модельки': 'Models', 'Дополнение': 'Extra', 'Инструкция': 'Guide', 'Стили': 'Styles', 'Открыть стили': 'Open styles', 'Главная моделька': 'Main model', 'Размытие стекла': 'Glass blur', 'Красивее, но тяжелее для слабых ПК': 'Prettier, but heavier on weak PCs', 'Выкл (быстро)': 'Off (fast)', 'Вкл': 'On', 'Готово': 'Done', 'Убрать блок': 'Remove block', 'Приветствие ': 'Greeting', 'Действия': 'Actions', 'Мотивашка': 'Motivation', 'Кнопка «Добавить»': '“Add” button',
    'Сфера': 'Orb', 'Луна': 'Moon', 'Планета': 'Planet', 'Кристалл': 'Crystal', 'Звезда': 'Star', 'Ракета': 'Rocket', 'Облако': 'Cloud', 'Ваши модельки': 'Your models', 'Наложить на экран (можно несколько, двигать, крутить, менять размер)': 'Layer on screen (several, move, rotate, resize)', 'Своих моделей пока нет': 'No custom models yet', 'Добавить модельку': 'Add a model',
    'Требования к своей модельке': 'Custom model requirements',
    'PNG, WebP или SVG с прозрачным фоном, квадрат (рекомендуем 512×512, минимум 128×128, до 2 МБ). Объект по центру с небольшим полем со всех сторон. Изображение автоматически приводится к 256×256 и стабилизируется — без искажений пропорций. Добавлять и менять модельки можно только в Ежедневнике.': 'PNG, WebP or SVG with a transparent background, square (512×512 recommended, minimum 128×128, up to 2 MB). Object centered with a small margin. The image is automatically fitted to 256×256 and stabilized — no distortion. Models can only be added and changed in the Daily planner.',
    'день подряд': 'day streak', 'дня подряд': 'day streak', 'дней подряд': 'day streak', 'Заморозки': 'Freezes', 'Сегодня выполнено': 'Done today',
    '10 дней серии — 1 заморозка, 25 — 2, 40 — 3 и так далее. Заморозка спасает серию, если пропустить день.': '10 streak days — 1 freeze, 25 — 2, 40 — 3 and so on. A freeze saves your streak if you skip a day.',
    'серия, дн.': 'streak, d.', 'КПД года': 'Year KPI', 'Лучшая серия': 'Best streak', 'Дней завершено': 'Days completed', 'КПД за 30 дней': '30-day KPI', 'Посмотреть профиль': 'View profile', 'Детальный КПД': 'Detailed KPI',
    'Вся твоя статистика в одном месте.': 'All your statistics in one place.', 'текущая серия': 'current streak', 'лучшая серия': 'best streak', 'дней завершено': 'days completed', 'заморозок доступно': 'freezes available',
    'КПД сегодня ': 'KPI today', 'КПД за 30 дней ': '30-day KPI', 'лучший день': 'best day', 'Вклад категорий в КПД года': 'Category contribution to year KPI', 'Мотивации': 'Favorites', 'Разговоры': 'Notes',
    'задач выполнено': 'tasks done', 'записей': 'notes', 'действий в проектах': 'project actions', 'мотиваций': 'favorites', 'привычек': 'habits', 'проектов': 'projects', 'время с собой': 'time with notes',
    'Твоя общая статистика: серия, КПД и достижения.': 'Your overall statistics: streak, KPI and achievements.', 'Новый проект': 'New project', 'Изменить проект': 'Edit project', 'Название': 'Title', 'Описание': 'Description', 'Иконка': 'Icon',
    'Или своя аватарка': 'Or your own avatar', 'нет': 'none', 'Загрузить своё изображение': 'Upload your image', 'Убрать': 'Remove', 'Создать': 'Create', 'Новая привычка': 'New habit', 'Изменить привычку': 'Edit habit',
    'Цель (например: 2 л в день)': 'Goal (e.g. 2 L a day)', 'Тип': 'Type', 'Полезная': 'Useful', 'Вредная': 'Harmful', 'Нагрузка на день': 'Daily workload',
    'Сколько заданий каждой категории засчитывается за день. Каждая категория даёт до 1 очка из 5: набрал лимит — получил очко. 5 очков = 100% КПД дня.': 'How many tasks of each category count per day. Each category gives up to 1 point out of 5: reach the cap — get the point. 5 points = 100% of the day’s KPI.',
    'Всего в день:': 'Total per day:', 'Подсказка': 'Hint', '— средняя нагрузка, рекомендуется': '— medium load, recommended', '— тяжело': '— hard', '— очень тяжело': '— very hard',
    'Прошлые дни пересчитаются по новым лимитам, остальное не меняется.': 'Past days will be recalculated with the new caps, nothing else changes.', 'По умолчанию': 'Default',
    'Действия на день. Простое действие даёт 1 очко, сложное (с поддействиями) — 3. Закрепи действие — и оно будет возвращаться каждый день.': 'Actions for the day. A simple action gives 1 point, a complex one (with sub-actions) — 3. Pin an action and it will come back every day.',
    'Подтверди действие': 'Confirm', 'Выбери день': 'Pick a day', 'Дополнить заметку': 'Extend note', 'Удалить эту заметку?': 'Delete this note?',
    'Напиши что-нибудь или нарисуй': 'Write something or draw', 'Введи название': 'Enter a title', 'Заметка сохранена!': 'Note saved!', 'Действие выполнено!': 'Action done!', 'Сложное действие выполнено!': 'Complex action done!',
    'В избранном!': 'Favorited!', 'Закреплено!': 'Pinned!', 'Будет появляться каждый день': 'Will appear every day', 'Больше не повторяется каждый день': 'No longer repeats every day', 'Прогресс сброшен': 'Progress reset', 'Сбросить': 'Reset',
    'Дневной лимит этой категории уже набран': 'The daily cap of this category is already reached', 'к КПД': 'to KPI', 'Новые мысли (старый текст сохранится, добавится отметка даты)': 'New thoughts (the old text stays, a date stamp is added)',
    'Файл больше 2 МБ': 'File is larger than 2 MB', 'Профиль ': 'Profile', 'Уровень': 'Level', 'Выбери ранг': 'Rank', 'Серия': 'Streak', 'Что-то пошло не так': 'Something went wrong',
    'Время действовать': 'Time to act', 'Ты справился со всем!': 'You did it all!', 'Хорошее начало!': 'Good start!', 'Продолжай в том же духе!': 'Keep it up!', 'Добавь первое действие на сегодня.': 'Add your first action for today.',
    'Пока пусто. Добавь первое действие на сегодня.': 'Nothing yet. Add your first action for today.', 'В этот день действий не было.': 'No actions that day.', 'Вернуться к сегодня': 'Back to today',
    'Больше не': 'No longer', 'Подтвердить': 'Confirm', 'Прогресс': 'Progress', 'Статус': 'Status', 'Детали проекта': 'Project details', 'План на сегодня': 'Plan for today', 'Прогресс проекта': 'Project progress',
    'Рост за сегодня:': 'Growth today:', '＋ Добавить действие': '＋ Add action', 'Описание проекта': 'Project description', 'Без описания': 'No description', 'Добавь первые «кирпичики» проекта.': 'Add the first building blocks of the project.',
    'Удалить проект': 'Delete project', 'Всего действий:': 'Total actions:', 'Начало:': 'Started:', 'Статус:': 'Status:', 'Сегодня выполнено:': 'Done today:',
    'Неверный пароль': 'Wrong password', 'Такой пользователь уже есть': 'This user already exists', 'Имя должно быть не короче 2 символов': 'Name must be at least 2 characters', 'Пароль должен быть не короче 4 символов': 'Password must be at least 4 characters'
  };
  var MON = { 'января': 'Jan', 'февраля': 'Feb', 'марта': 'Mar', 'апреля': 'Apr', 'мая': 'May', 'июня': 'Jun', 'июля': 'Jul', 'августа': 'Aug', 'сентября': 'Sep', 'октября': 'Oct', 'ноября': 'Nov', 'декабря': 'Dec' };
  var MONN = { 'Январь': 'January', 'Февраль': 'February', 'Март': 'March', 'Апрель': 'April', 'Май': 'May', 'Июнь': 'June', 'Июль': 'July', 'Август': 'August', 'Сентябрь': 'September', 'Октябрь': 'October', 'Ноябрь': 'November', 'Декабрь': 'December' };
  var PARTS = [
    [/(\d+) (января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря) (\d{4})/g, function (m, d, mo, y) { return MON[mo] + ' ' + d + ', ' + y; }],
    [/(\d+) (января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/g, function (m, d, mo) { return MON[mo] + ' ' + d; }],
    [/(Январь|Февраль|Март|Апрель|Май|Июнь|Июль|Август|Сентябрь|Октябрь|Ноябрь|Декабрь)/g, function (m) { return MONN[m]; }],
    [/, (пн|вт|ср|чт|пт|сб|вс)\b/gi, function (m, d) { return ', ' + { 'пн': 'Mon', 'вт': 'Tue', 'ср': 'Wed', 'чт': 'Thu', 'пт': 'Fri', 'сб': 'Sat', 'вс': 'Sun' }[d.toLowerCase()]; }],
    [/воскресенье|понедельник|вторник|среда|четверг|пятница|суббота/g, function (m) { return { 'воскресенье': 'Sunday', 'понедельник': 'Monday', 'вторник': 'Tuesday', 'среда': 'Wednesday', 'четверг': 'Thursday', 'пятница': 'Friday', 'суббота': 'Saturday' }[m]; }],
    [/(\d+) из (\d+)/g, '$1 of $2'], [/(\d+) \/ (\d+) заданий/g, '$1 / $2 tasks'], [/до (\d+) в день/g, 'up to $1 per day'], [/сегодня (\d+) \/ (\d+)/g, 'today $1 / $2'], [/\+([\d,]+)% к КПД/g, '+$1% to KPI'],
    [/Сегодня: /g, 'Today: '], [/до \+1 КПД: /g, 'to +1 KPI: '], [/до ранга «([^»]+)» осталось (\d+) XP/g, function (m, r, x) { return (D[r] || r) + ' rank in ' + x + ' XP'; }], [/до «([^»]+)»: (\d+) XP/g, function (m, r, x) { return 'to “' + (D[r] || r) + '”: ' + x + ' XP'; }],
    [/Заморозки: (\d+)/g, 'Freezes: $1'], [/(\d+) ч (\d+) мин/g, '$1 h $2 min'], [/сегодня/g, 'today'], [/сильн/g, 'strong'], [/ дней/g, ' days'], [/ день/g, ' day'], [/ дня/g, ' days'], [/(\d+) действ(ие|ия|ий)/g, '$1 actions'],
    [/привычек выполнено — /g, 'habits done — '], [/Задачи за /g, 'Tasks for '], [/Действия за /g, 'Actions for '], [/Новичок|Любитель|Почти задрот|Постоянец|Легенда/g, function (m) { return D[m]; }], [/ XP/g, ' XP'], [/\+(\d+) XP сегодня/g, '+$1 XP today']
  ];
  var RU = /[А-Яа-яЁё]/, enOn = false, busy = false, sched = 0;
  function tr(t) {
    var m = t.match(/^(\s*)([\s\S]*?)(\s*)$/), lead = m[1], core = m[2], tail = m[3], pre = '';
    if (!core) return t;
    if (core.indexOf('— ') === 0 && !D[core]) { pre = '— '; core = core.slice(2); }
    var core2 = core.replace(/^⠿ /, '');
    if (D[core]) return lead + pre + D[core] + tail;
    if (core2 !== core && D[core2]) return lead + pre + '⠿ ' + D[core2] + tail;
    var out = core;
    PARTS.forEach(function (p) { out = out.replace(p[0], p[1]); });
    return lead + pre + out + tail;
  }
  var SKIP = '.nt-txt, .n3-author, input, textarea, script, style, #lg-user';
  function walk(root, on) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (n) {
      var p = n.parentElement; if (!p || (p.closest && p.closest(SKIP))) return;
      if (n.__ru === undefined) { if (!RU.test(n.nodeValue)) return; n.__ru = n.nodeValue; n.__seen = n.nodeValue; }
      else if (n.nodeValue !== n.__seen) { if (!RU.test(n.nodeValue)) { n.__ru = n.nodeValue; n.__seen = n.nodeValue; return; } n.__ru = n.nodeValue; }
      var v = on ? tr(n.__ru) : n.__ru;
      if (n.nodeValue !== v) n.nodeValue = v;
      n.__seen = n.nodeValue;
    });
    root.querySelectorAll('[title],[placeholder]').forEach(function (e) {
      ['title', 'placeholder'].forEach(function (a) {
        var v = e.getAttribute(a); if (!v) return;
        var k = '__ru_' + a;
        if (e[k] === undefined) { if (!RU.test(v)) return; e[k] = v; } else if (v !== e['__seen_' + a]) { if (!RU.test(v)) return; e[k] = v; }
        var nv = on ? tr(e[k]) : e[k]; if (v !== nv) e.setAttribute(a, nv); e['__seen_' + a] = nv;
      });
    });
  }
  function pass(on) {
    if (on !== undefined) enOn = !!on;
    busy = true; try { walk(document.body, enOn); } finally { busy = false; }
  }
  var obs = new MutationObserver(function () {
    if (busy || sched) return;
    sched = requestAnimationFrame(function () { sched = 0; if (enOn || document.body.__hadEn) { pass(); if (enOn) document.body.__hadEn = true; } obs.takeRecords(); });
  });
  document.addEventListener('DOMContentLoaded', function () { obs.observe(document.body, { childList: true, subtree: true, characterData: true }); });
  window.LO_LANG = { pass: function (on) { pass(on); if (on) document.body.__hadEn = true; } };
})();
