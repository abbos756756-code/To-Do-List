/**
 * ==========================================================================
 * VAZIFALAR MENEJERI (TO-DO LIST) — JAVASCRIPT ASOSIY MANTIG'I
 * Katta vazifalarni aqlli maydalash (Sub-tasks / Decompose), 
 * Web Audio budilnik va to'liq CRUD tizimi bilan.
 * ==========================================================================
 */

// 1. DOM ELEMENTLARINI TANLAB OLISH
const todoForm = document.getElementById('todoForm');
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const dueTimeInput = document.getElementById('dueTimeInput');
const decomposeBtn = document.getElementById('decomposeBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const progressPercent = document.getElementById('progressPercent');
const progressBarFill = document.getElementById('progressBarFill');
const taskSummaryBadge = document.getElementById('taskSummaryBadge');
const itemsLeft = document.getElementById('itemsLeft');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const currentDateEl = document.getElementById('currentDate');

// Budilnik Modali elementlari
const alarmModal = document.getElementById('alarmModal');
const alarmTaskTitle = document.getElementById('alarmTaskTitle');
const alarmTaskTime = document.getElementById('alarmTaskTime');
const dismissAlarmBtn = document.getElementById('dismissAlarmBtn');
const completeAlarmBtn = document.getElementById('completeAlarmBtn');

// ==========================================================================
// 2. DASTUR HOLATI (State)
// ==========================================================================
const DEFAULT_TODOS = [
  {
    id: '1',
    text: "HTML, CSS va JavaScript asoslarini o'rganish",
    priority: 'high',
    dueTime: '',
    completed: true,
    notified: false,
    isDrawerOpen: false,
    createdAt: Date.now(),
    subtasks: [
      { id: '1-1', text: "HTML5 semantik teglarini o'rganish", completed: true },
      { id: '1-2', text: "CSS Flexbox va Grid bilan zamonaviy dizayn yasash", completed: true },
      { id: '1-3', text: "JavaScript DOM manipulyatsiyasi va hodisalarni o'rganish", completed: true }
    ]
  },
  {
    id: '2',
    text: "Portfolio uchun ajoyib To-Do List loyihasini yaratish",
    priority: 'medium',
    dueTime: '',
    completed: false,
    notified: false,
    isDrawerOpen: true,
    createdAt: Date.now(),
    subtasks: [
      { id: '2-1', text: "Glassmorphism va Dark Mode dizaynini ishlab chiqish", completed: true },
      { id: '2-2', text: "Web Audio API orqali budilnik jiringlashini ulash", completed: true },
      { id: '2-3', text: "Katta vazifalarni mayda bosqichlarga bo'lish (AI Decomposer) tizimini kiritish", completed: true },
      { id: '2-4', text: "Barcha kodlarni GitHub repozitoriyasiga push qilish", completed: true }
    ]
  },
  {
    id: '3',
    text: "Telegram bot yaratish",
    priority: 'high',
    dueTime: new Date(Date.now() + 60000).toISOString().slice(0, 16),
    completed: false,
    notified: false,
    isDrawerOpen: true,
    createdAt: Date.now(),
    subtasks: [
      { id: '3-1', text: "@BotFather orqali yangi bot yaratib, API Token olish", completed: false },
      { id: '3-2', text: "Node.js yoki Python muhitini tayyorlab, kutubxonani o'rnatish", completed: false },
      { id: '3-3', text: "/start va /help buyruqlari mantiqini yozish", completed: false },
      { id: '3-4', text: "Tugmalar va menyularni (Inline/Reply Keyboard) sozlash", completed: false },
      { id: '3-5', text: "Botni serverga joylash (Deploy qilish)", completed: false }
    ]
  }
];

// LocalStorage dan ma'lumotlarni o'qiymiz
let todos = JSON.parse(localStorage.getItem('todo_list_items'));
if (!todos || todos.length === 0) {
  todos = DEFAULT_TODOS;
  saveToLocalStorage();
} else {
  // Eski vazifalar bo'lsa, ularga subtasks massivini xavfsiz qo'shib qo'yamiz
  todos.forEach(t => {
    if (!Array.isArray(t.subtasks)) t.subtasks = [];
    if (typeof t.isDrawerOpen !== 'boolean') t.isDrawerOpen = false;
  });
}

let currentFilter = 'all';
let searchQuery = '';
let currentRingingTodoId = null;

// ==========================================================================
// 3. AQLLI VAZIFANI MAYDALAGICH (Smart Task Decomposer Engine)
// Har qanday katta vazifani avtomatik ravishda 4-5 ta kichik bosqichlarga ajratadi
// ==========================================================================
function decomposeTask(title) {
  const lower = title.toLowerCase().trim();

  // 1. Web sayt va Frontend
  if (lower.includes('sayt') || lower.includes('web') || lower.includes('frontend') || lower.includes('html')) {
    return [
      "Saytning semantik skeletini (HTML5) rejalashtirish va yozish",
      "CSS yordamida zamonaviy dizayn, ranglar va moslashuvchanlik (Responsive) berish",
      "JavaScript bilan interaktivlik, forma va dinamik ma'lumotlarni ulash",
      "Barcha brauzerlar va mobil telefonlarda sinovdan o'tkazish (Testing)",
      "Loyiha kodlarini GitHub-ga yuklab, deploy qilish"
    ];
  }

  // 2. Telegram Bot
  if (lower.includes('bot') || lower.includes('telegram')) {
    return [
      "@BotFather dan yangi bot ochib, API Tokenni xavfsiz saqlash",
      "Loyihaning asosiy papkasi va kerakli kutubxonalarni o'rnatish",
      "/start buyrug'i va asosiy navigatsiya tugmalarini (Keyboard) yasash",
      "Foydalanuvchi xabarlarini qayta ishlash biznes mantiqini yozish",
      "Botni serverga (VPS / Render) deploy qilib ishga tushirish"
    ];
  }

  // 3. Til o'rganish (Ingliz tili va boshqalar)
  if (lower.includes('ingliz') || lower.includes('til') || lower.includes('english') || lower.includes('kurs')) {
    return [
      "Mavzuga oid 15-20 ta yangi so'zni lug'atga yozib yodlash",
      "Bugungi grammatika qoidasini darslikdan o'qib, konspekt qilish",
      "20 daqiqa inglizcha audio eshitish (Listening) va takrorlash",
      "O'rganilgan yangi so'zlar ishtirokida 5 ta gap yoki kichik insho tuzish"
    ];
  }

  // 4. Kitob o'qish
  if (lower.includes('kitob') || lower.includes('o\'qish') || lower.includes('read')) {
    return [
      "Kitobning navbatdagi 1-bobini diqqat bilan o'qib chiqish",
      "Muhim g'oyalar va iqtiboslarni daftarga yoki telefonga belgilab borish",
      "2-bobni tugatish va asosiy savollarga javob topish",
      "O'qilgan qism bo'yicha qisqacha xulosa va taassurot yozish"
    ];
  }

  // 5. Sport va Mashg'ulot
  if (lower.includes('sport') || lower.includes('mashq') || lower.includes('zal') || lower.includes('fitness')) {
    return [
      "10 daqiqa yengil qizib olish (Warm-up) va bo'g'inlarni ochish",
      "Asosiy kuch mashqlarini texnikaga to'g'ri rioya qilib bajarish (3-4 yondashuv)",
      "15 daqiqa kardio (yugurish yoki sakrash mashqlari)",
      "Nafasni rostlash va muskullarni cho'zish (Stretching/Cool-down)"
    ];
  }

  // 6. Dasturlash / Backend / Python / Java / React
  if (lower.includes('backend') || lower.includes('python') || lower.includes('react') || lower.includes('api') || lower.includes('dastur')) {
    return [
      "Loyiha arxitekturasi va ma'lumotlar bazasi sxemasini loyihalash",
      "Asosiy API Endpointlarni (GET, POST, PUT, DELETE) yaratish",
      "Xavfsizlik, ma'lumotlar validatsiyasi va xatolarni ushlashni sozlash",
      "API so'rovlarini Postman yoki avtotestlar orqali tekshirish",
      "Hujjatlashtirish (Swagger/README) va kodni commit qilish"
    ];
  }

  // 7. Universal (Har qanday boshqa katta vazifa uchun)
  return [
    `1-bosqich: "${title}" vazifasi talablarini tahlil qilish va aniq reja tuzish`,
    "2-bosqich: Bajarish uchun zarur vositalar, ma'lumotlar va bilimlarni to'plash",
    "3-bosqich: Asosiy amaliy qismini boshlash va 1-yarmini bajarish",
    "4-bosqich: 2-yarmini yakunlab, natijani tekshirish va xatolarni to'g'rilash",
    "5-bosqich: Yakuniy sifat nazorati va natijani topshirish"
  ];
}

// ==========================================================================
// 4. BUDILNIK OVOZI SINTEZATORI (Web Audio API)
// ==========================================================================
let audioCtx = null;
let alarmIntervalId = null;

function playAlarmTone() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now + 0.15);
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.warn("Audio signali yaratishda xatolik:", err);
  }
}

function startAlarmSound() {
  playAlarmTone();
  if (!alarmIntervalId) {
    alarmIntervalId = setInterval(playAlarmTone, 800);
  }
}

function stopAlarmSound() {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ==========================================================================
// 5. YORDAMCHI FUNKSIYALAR
// ==========================================================================
function displayCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  currentDateEl.textContent = now.toLocaleDateString('uz-UZ', options);
}

function saveToLocalStorage() {
  localStorage.setItem('todo_list_items', JSON.stringify(todos));
}

function getPriorityDetails(priority) {
  switch (priority) {
    case 'high':
      return { label: 'Yuqori', className: 'priority-high' };
    case 'medium':
      return { label: "O'rta", className: 'priority-medium' };
    case 'low':
      return { label: 'Oddiy', className: 'priority-low' };
    default:
      return { label: "O'rta", className: 'priority-medium' };
  }
}

function formatDueTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}-${month}, ${hours}:${minutes}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==========================================================================
// 6. VAQTNI DOIMIY TEKSHIRISH (Alarm Checker)
// ==========================================================================
function checkAlarms() {
  const now = new Date();

  todos.forEach(todo => {
    if (todo.dueTime && !todo.completed && !todo.notified) {
      const dueDate = new Date(todo.dueTime);
      if (now >= dueDate) {
        triggerAlarm(todo);
      }
    }
  });
}

function triggerAlarm(todo) {
  currentRingingTodoId = todo.id;
  todo.notified = true;
  todo.isRinging = true;
  saveToLocalStorage();
  renderTodos();

  startAlarmSound();

  alarmTaskTitle.textContent = todo.text;
  alarmTaskTime.textContent = `⏰ Belgilangan vaqt: ${formatDueTime(todo.dueTime)}`;
  alarmModal.classList.add('active');
  alarmModal.setAttribute('aria-hidden', 'false');

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('⏰ Rejalarim — Vaqt yetib keldi!', {
      body: todo.text,
      icon: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png'
    });
  }
}

function closeAlarmModal() {
  stopAlarmSound();
  alarmModal.classList.remove('active');
  alarmModal.setAttribute('aria-hidden', 'true');

  if (currentRingingTodoId) {
    const todo = todos.find(t => t.id === currentRingingTodoId);
    if (todo) {
      todo.isRinging = false;
      saveToLocalStorage();
      renderTodos();
    }
    currentRingingTodoId = null;
  }
}

// ==========================================================================
// 7. STATISTIKA VA PROGRESS BARNI YANGILASH
// ==========================================================================
function updateStats() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressPercent.textContent = `${percentage}%`;
  progressBarFill.style.width = `${percentage}%`;
  taskSummaryBadge.textContent = `${total} vazifa`;
  itemsLeft.textContent = `${active} ta vazifa qoldi`;

  if (completed === 0) {
    clearCompletedBtn.style.opacity = '0.4';
    clearCompletedBtn.style.pointerEvents = 'none';
  } else {
    clearCompletedBtn.style.opacity = '1';
    clearCompletedBtn.style.pointerEvents = 'auto';
  }
}

// ==========================================================================
// 8. VAZIFALAR RO'YXATINI CHIZISH (Render)
// ==========================================================================
function renderTodos() {
  todoList.innerHTML = '';

  const now = new Date();

  const filteredTodos = todos.filter(todo => {
    const matchesFilter =
      currentFilter === 'all' ||
      (currentFilter === 'active' && !todo.completed) ||
      (currentFilter === 'completed' && todo.completed);

    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (filteredTodos.length === 0) {
    emptyState.classList.add('active');
  } else {
    emptyState.classList.remove('active');
  }

  filteredTodos.forEach(todo => {
    const priority = getPriorityDetails(todo.priority);

    // Eslatma vaqti bor bo'lsa tegi
    let dueBadgeHtml = '';
    if (todo.dueTime) {
      const dueDate = new Date(todo.dueTime);
      const isOverdue = now > dueDate && !todo.completed;
      const isRinging = todo.isRinging;

      let badgeClass = 'due-badge';
      let iconClass = 'fa-regular fa-clock';

      if (isRinging) {
        badgeClass += ' ringing';
        iconClass = 'fa-solid fa-bell';
      } else if (isOverdue) {
        badgeClass += ' overdue';
        iconClass = 'fa-solid fa-triangle-exclamation';
      }

      dueBadgeHtml = `
        <span class="${badgeClass}" title="Belgilangan vaqt">
          <i class="${iconClass}"></i>
          <span>${formatDueTime(todo.dueTime)}</span>
        </span>
      `;
    }

    // Subtasks hisob-kitoblari
    const subtasks = todo.subtasks || [];
    const totalSub = subtasks.length;
    const completedSub = subtasks.filter(s => s.completed).length;
    const subPercentage = totalSub === 0 ? 0 : Math.round((completedSub / totalSub) * 100);

    // Kichik qadamlar nishoni (Badge & Toggle Button)
    let subtasksToggleBtnHtml = '';
    if (totalSub > 0) {
      subtasksToggleBtnHtml = `
        <button type="button" class="subtasks-toggle-btn ${todo.isDrawerOpen ? 'open' : ''}" data-action="toggle-drawer" title="Kichik qadamlarni ochish/yopish">
          <i class="fa-solid fa-list-check"></i>
          <span>${completedSub}/${totalSub} qadam</span>
          <i class="fa-solid fa-chevron-down toggle-arrow"></i>
        </button>
      `;
    }

    // Subtask elementlari HTML i
    const subtaskItemsHtml = subtasks.map(sub => `
      <li class="subtask-row ${sub.completed ? 'completed' : ''}" data-subid="${sub.id}">
        <div class="subtask-left" data-action="toggle-subtask">
          <div class="subtask-checkbox" role="checkbox" aria-checked="${sub.completed}">
            <i class="fa-solid fa-check"></i>
          </div>
          <span class="subtask-text">${escapeHtml(sub.text)}</span>
        </div>
        <button type="button" class="subtask-del-btn" data-action="delete-subtask" title="Qadamni o'chirish">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </li>
    `).join('');

    // <li> elementi
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <!-- Asosiy qator: Checkbox, Matn, Nishonlar va Amallar -->
      <div class="todo-main-row">
        <div class="todo-left">
          <div class="custom-checkbox" role="checkbox" aria-checked="${todo.completed}" tabindex="0">
            <i class="fa-solid fa-check"></i>
          </div>
          
          <div class="todo-content">
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <div class="todo-meta">
              <span class="priority-tag ${priority.className}">
                ${priority.label}
              </span>
              ${dueBadgeHtml}
              ${subtasksToggleBtnHtml}
            </div>
          </div>
        </div>

        <div class="todo-actions">
          <button type="button" class="icon-btn btn-add-subtask" data-action="open-add-subtask" title="Kichik qadam qo'shish">
            <i class="fa-solid fa-plus"></i>
          </button>
          <button type="button" class="icon-btn btn-edit" title="Tahrirlash">
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
          <button type="button" class="icon-btn btn-delete" title="O'chirish">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </div>

      <!-- Kichik vazifalar (Subtasks) yig'iluvchi paneli -->
      <div class="subtasks-drawer ${todo.isDrawerOpen ? 'open' : ''}">
        ${totalSub > 0 ? `
          <div class="subtasks-progress-bar" title="Kichik qadamlar bajarilishi: ${subPercentage}%">
            <div class="subtasks-progress-fill" style="width: ${subPercentage}%"></div>
          </div>
        ` : ''}

        <ul class="subtasks-list">
          ${subtaskItemsHtml}
        </ul>

        <div class="subtask-add-row">
          <input type="text" class="subtask-input" placeholder="+ Yangi kichik qadam kiriting..." autocomplete="off">
          <button type="button" class="subtask-add-btn" data-action="submit-subtask">Qo'shish</button>
        </div>
      </div>
    `;

    todoList.appendChild(li);
  });

  updateStats();
}

// ==========================================================================
// 9. ASOSIY CRUD VA MAYDALASH AMALLARI
// ==========================================================================

/**
 * Oddiy vazifa qo'shish
 */
function handleAddTodo(event) {
  event.preventDefault();

  requestNotificationPermission();
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const dueTime = dueTimeInput.value;

  if (!text) return;

  const newTodo = {
    id: Date.now().toString(),
    text: text,
    priority: priority,
    dueTime: dueTime || '',
    completed: false,
    notified: false,
    isDrawerOpen: false,
    subtasks: [],
    createdAt: Date.now()
  };

  todos.unshift(newTodo);
  saveToLocalStorage();
  renderTodos();

  taskInput.value = '';
  dueTimeInput.value = '';
  taskInput.focus();
}

/**
 * Katta vazifani avtomatik mayda qismlarga bo'lib qo'shish (AI Decompose)
 */
function handleDecomposeAndAdd() {
  requestNotificationPermission();
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const dueTime = dueTimeInput.value;

  if (!text) {
    alert("Iltimos, avval rejangiz yoki katta vazifa nomini yozing!");
    taskInput.focus();
    return;
  }

  // Aqlli maydalash orqali 4-5 ta bosqich yaratamiz
  const generatedSteps = decomposeTask(text);
  const subtasks = generatedSteps.map((stepText, index) => ({
    id: `${Date.now()}-${index + 1}`,
    text: stepText,
    completed: false
  }));

  const newTodo = {
    id: Date.now().toString(),
    text: text,
    priority: priority,
    dueTime: dueTime || '',
    completed: false,
    notified: false,
    isDrawerOpen: true, // Bosqichlar ko'rinib turishi uchun ochib qo'yamiz
    subtasks: subtasks,
    createdAt: Date.now()
  };

  todos.unshift(newTodo);
  saveToLocalStorage();
  renderTodos();

  taskInput.value = '';
  dueTimeInput.value = '';
  taskInput.focus();
}

/**
 * Subtask holatini (bajarildi / bajarilmadi) o'zgartirish
 */
function toggleSubtask(todoId, subtaskId) {
  const todo = todos.find(t => t.id === todoId);
  if (!todo || !todo.subtasks) return;

  const sub = todo.subtasks.find(s => s.id === subtaskId);
  if (!sub) return;

  sub.completed = !sub.completed;

  // Agar barcha kichik qadamlar bajarilgan bo'lsa, asosiy vazifani ham bajarilgan deb belgilaymiz
  const allCompleted = todo.subtasks.every(s => s.completed);
  if (allCompleted && !todo.completed) {
    todo.completed = true;
  } else if (!allCompleted && todo.completed) {
    // Agar biror qadam qayta ochilsa, asosiy vazifa ham faol bo'ladi
    todo.completed = false;
  }

  saveToLocalStorage();
  renderTodos();
}

/**
 * Yangi kichik qadam qo'shish
 */
function addSubtask(todoId, text) {
  const todo = todos.find(t => t.id === todoId);
  if (!todo) return;

  const trimmed = text.trim();
  if (!trimmed) return;

  if (!Array.isArray(todo.subtasks)) todo.subtasks = [];

  todo.subtasks.push({
    id: `${Date.now()}-${todo.subtasks.length + 1}`,
    text: trimmed,
    completed: false
  });

  // Agar yangi qadam qo'shilsa va asosiy vazifa tugallangan bo'lsa, uni yana faol qilamiz
  if (todo.completed) {
    todo.completed = false;
  }

  todo.isDrawerOpen = true;
  saveToLocalStorage();
  renderTodos();
}

/**
 * Kichik qadamni o'chirish
 */
function deleteSubtask(todoId, subtaskId) {
  const todo = todos.find(t => t.id === todoId);
  if (!todo || !todo.subtasks) return;

  todo.subtasks = todo.subtasks.filter(s => s.id !== subtaskId);
  saveToLocalStorage();
  renderTodos();
}

/**
 * Subtasks panelini ochish yoki yopish
 */
function toggleDrawer(todoId) {
  const todo = todos.find(t => t.id === todoId);
  if (!todo) return;

  todo.isDrawerOpen = !todo.isDrawerOpen;
  saveToLocalStorage();
  renderTodos();
}

/**
 * Asosiy vazifaning bajarilganlik statusini o'zgartirish
 */
function toggleTodoComplete(id) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      const isNowCompleted = !todo.completed;
      // Agar asosiy vazifa bajarilgan qilinsa, barcha kichik qadamlarni ham bajarilgan qilamiz
      const updatedSubtasks = (todo.subtasks || []).map(s => ({
        ...s,
        completed: isNowCompleted
      }));

      return { 
        ...todo, 
        completed: isNowCompleted,
        isRinging: isNowCompleted ? false : todo.isRinging,
        subtasks: updatedSubtasks
      };
    }
    return todo;
  });

  saveToLocalStorage();
  renderTodos();
}

/**
 * Vazifani o'chirish
 */
function deleteTodo(id) {
  const itemElement = document.querySelector(`.todo-item[data-id="${id}"]`);
  
  if (itemElement) {
    itemElement.classList.add('fade-out');
    setTimeout(() => {
      todos = todos.filter(todo => todo.id !== id);
      saveToLocalStorage();
      renderTodos();
    }, 250);
  } else {
    todos = todos.filter(todo => todo.id !== id);
    saveToLocalStorage();
    renderTodos();
  }
}

/**
 * Vazifani tahrirlash
 */
function editTodo(id) {
  const todoToEdit = todos.find(todo => todo.id === id);
  if (!todoToEdit) return;

  const newText = prompt("Vazifani o'zgartiring:", todoToEdit.text);
  
  if (newText !== null && newText.trim() !== '') {
    todoToEdit.text = newText.trim();
    saveToLocalStorage();
    renderTodos();
  }
}

/**
 * Bajarilganlarni tozalash
 */
function clearCompleted() {
  const completedCount = todos.filter(t => t.completed).length;
  if (completedCount === 0) return;

  if (confirm("Barcha bajarilgan vazifalarni o'chirmoqchimisiz?")) {
    todos = todos.filter(todo => !todo.completed);
    saveToLocalStorage();
    renderTodos();
  }
}

// ==========================================================================
// 10. HODISALAR TINGLOVCHILARI (Event Listeners)
// ==========================================================================

// Oddiy qo'shish
todoForm.addEventListener('submit', handleAddTodo);

// Katta vazifani avtomatik mayda bosqichlarga ajratish tugmasi
decomposeBtn.addEventListener('click', handleDecomposeAndAdd);

// Ro'yxat ichidagi barcha bosishlar (Event Delegation)
todoList.addEventListener('click', (e) => {
  const item = e.target.closest('.todo-item');
  if (!item) return;

  const todoId = item.dataset.id;

  // 1. Asosiy vazifani belgilash (Checkbox yoki matn bosilganda)
  if (e.target.closest('.custom-checkbox') || e.target.closest('.todo-text')) {
    toggleTodoComplete(todoId);
    return;
  }

  // 2. Kichik qadamlar panelini ochish / yopish
  if (e.target.closest('[data-action="toggle-drawer"]')) {
    toggleDrawer(todoId);
    return;
  }

  // 3. Tezkor kichik qadam qo'shish tugmasi
  if (e.target.closest('[data-action="open-add-subtask"]')) {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      todo.isDrawerOpen = true;
      saveToLocalStorage();
      renderTodos();
      setTimeout(() => {
        const input = document.querySelector(`.todo-item[data-id="${todoId}"] .subtask-input`);
        if (input) input.focus();
      }, 50);
    }
    return;
  }

  // 4. Subtask holatini o'zgartirish (kichik checkbox)
  const subtaskLeft = e.target.closest('[data-action="toggle-subtask"]');
  if (subtaskLeft) {
    const subRow = subtaskLeft.closest('.subtask-row');
    if (subRow) {
      toggleSubtask(todoId, subRow.dataset.subid);
    }
    return;
  }

  // 5. Subtaskni o'chirish
  const subtaskDel = e.target.closest('[data-action="delete-subtask"]');
  if (subtaskDel) {
    const subRow = subtaskDel.closest('.subtask-row');
    if (subRow) {
      deleteSubtask(todoId, subRow.dataset.subid);
    }
    return;
  }

  // 6. Subtask qo'shish tugmasi
  if (e.target.closest('[data-action="submit-subtask"]')) {
    const input = item.querySelector('.subtask-input');
    if (input) {
      addSubtask(todoId, input.value);
    }
    return;
  }

  // 7. Tahrirlash
  if (e.target.closest('.btn-edit')) {
    editTodo(todoId);
    return;
  }

  // 8. O'chirish
  if (e.target.closest('.btn-delete')) {
    deleteTodo(todoId);
    return;
  }
});

// Subtask inputida Enter bosilganda qo'shish
todoList.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.classList.contains('subtask-input')) {
    e.preventDefault();
    const item = e.target.closest('.todo-item');
    if (item) {
      addSubtask(item.dataset.id, e.target.value);
    }
  }
});

// Qidiruv
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderTodos();
});

// Filtrlar
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

// Bajarilganlarni tozalash
clearCompletedBtn.addEventListener('click', clearCompleted);

// Budilnik modal tugmalari
dismissAlarmBtn.addEventListener('click', closeAlarmModal);

completeAlarmBtn.addEventListener('click', () => {
  if (currentRingingTodoId) {
    toggleTodoComplete(currentRingingTodoId);
  }
  closeAlarmModal();
});

alarmModal.addEventListener('click', (e) => {
  if (e.target === alarmModal) {
    closeAlarmModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && alarmModal.classList.contains('active')) {
    closeAlarmModal();
  }
});

// ==========================================================================
// 11. DASTURNI ISHGA TUSHIRISH
// ==========================================================================
displayCurrentDate();
renderTodos();
setInterval(checkAlarms, 1000);
