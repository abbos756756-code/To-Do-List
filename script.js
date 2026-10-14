/**
 * ==========================================================================
 * VAZIFALAR MENEJERI (TO-DO LIST) — JAVASCRIPT ASOSIY MANTIG'I
 * Har bir bo'lim, audio sintezatori va vaqtni tekshirish mexanizmi
 * batafsil izohlab chiqilgan.
 * ==========================================================================
 */

// 1. DOM ELEMENTLARINI TANLAB OLISH
// HTML dagi barcha kerakli tugma, kiritish maydonlari va modallarni ulab olamiz.
const todoForm = document.getElementById('todoForm');
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const dueTimeInput = document.getElementById('dueTimeInput');
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

// Budilnik (Alarm) Modali elementlari
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
    createdAt: Date.now()
  },
  {
    id: '2',
    text: "Portfolio uchun ajoyib To-Do List loyihasini yaratish",
    priority: 'medium',
    dueTime: '',
    completed: false,
    notified: false,
    createdAt: Date.now()
  },
  {
    id: '3',
    text: "Eslatma vaqtini belgilab budilnikni sinab ko'rish",
    priority: 'high',
    // 1 daqiqadan so'ng avtomatik jiringlashi uchun namuna vaqt
    dueTime: new Date(Date.now() + 60000).toISOString().slice(0, 16),
    completed: false,
    notified: false,
    createdAt: Date.now()
  }
];

// LocalStorage dan ma'lumotlarni o'qiymiz
let todos = JSON.parse(localStorage.getItem('todo_list_items'));
if (!todos || todos.length === 0) {
  todos = DEFAULT_TODOS;
  saveToLocalStorage();
}

let currentFilter = 'all';
let searchQuery = '';
let currentRingingTodoId = null; // Ayni vaqtda jiringlayotgan vazifa ID si

// ==========================================================================
// 3. BUDILNIK OVOZI SINTEZATORI (Web Audio API)
// Tashqi audio fayllarsiz (mp3 yuklamasdan), toza brauzer imkoniyati bilan
// yoqimli va baland qo'ng'iroq tovushini (Chime / Bell) yaratamiz.
// ==========================================================================
let audioCtx = null;
let alarmIntervalId = null;

/**
 * 2 ta garmonik notadan iborat yoqimli qo'ng'iroq ohangini chalish
 */
function playAlarmTone() {
  try {
    // AudioContext faqat foydalanuvchi sahifaga biror marta tegingach ishga tushadi
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // 1-nota: 880 Hz (A5 notasi - baland va tiniq)
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

    // 2-nota: 1320 Hz (E6 notasi - yangroq akkord hosil qiladi)
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

/**
 * Budilnik ovozini takroriy ravishda (har 800ms da) to'xtovsiz chalish
 */
function startAlarmSound() {
  playAlarmTone();
  if (!alarmIntervalId) {
    alarmIntervalId = setInterval(playAlarmTone, 800);
  }
}

/**
 * Budilnik ovozini to'xtatish
 */
function stopAlarmSound() {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
}

/**
 * Brauzer bildirishnomalari (Notification) uchun ruxsat so'rash
 */
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ==========================================================================
// 4. VAQT VA YORDAMCHI FUNKSIYALAR
// ==========================================================================

/**
 * Bugungi sanani chiroyli o'zbek tilida chiqarish
 */
function displayCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  currentDateEl.textContent = now.toLocaleDateString('uz-UZ', options);
}

/**
 * LocalStorage ga saqlash
 */
function saveToLocalStorage() {
  localStorage.setItem('todo_list_items', JSON.stringify(todos));
}

/**
 * Muhimlik darajasiga mos parametrlar
 */
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

/**
 * Kiritilgan sanani o'qilishi qulay formatga o'tkazish (masalan: 14-Okt, 16:30)
 */
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

/**
 * XSS xavfsizligi uchun matnni tozalash
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==========================================================================
// 5. VAQTNI DOIMIY TEKSHIRISH VA JIRINGLATISH (Alarm Checker)
// ==========================================================================

/**
 * Har soniyada barcha vazifalar vaqtini hozirgi vaqt bilan solishtiradi
 */
function checkAlarms() {
  const now = new Date();

  todos.forEach(todo => {
    // Agar vazifada vaqt belgilangan bo'lsa, hali bajarilmagan va hali jiringlamagan bo'lsa
    if (todo.dueTime && !todo.completed && !todo.notified) {
      const dueDate = new Date(todo.dueTime);
      
      // Belgilangan vaqt yetib kelgan bo'lsa
      if (now >= dueDate) {
        triggerAlarm(todo);
      }
    }
  });
}

/**
 * Vaqti kelgan vazifani jiringlatish, popupni ko'rsatish va xabar berish
 */
function triggerAlarm(todo) {
  currentRingingTodoId = todo.id;
  todo.notified = true;    // Qayta-qayta jiringlamasligi uchun belgilaymiz
  todo.isRinging = true;   // Vizual kartochkada jiringlash animatsiyasi chiqishi uchun
  saveToLocalStorage();
  renderTodos();

  // 1. Ovozni ishga tushiramiz
  startAlarmSound();

  // 2. Ekranda Budilnik oynasini ochamiz
  alarmTaskTitle.textContent = todo.text;
  alarmTaskTime.textContent = `⏰ Belgilangan vaqt: ${formatDueTime(todo.dueTime)}`;
  alarmModal.classList.add('active');
  alarmModal.setAttribute('aria-hidden', 'false');

  // 3. Brauzer tizimli bildirishnomasi (boshqa oynada o'tirganda ham ko'rinadi)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('⏰ Rejalarim — Vaqt yetib keldi!', {
      body: todo.text,
      icon: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png'
    });
  }
}

/**
 * Budilnik modalini yopish va jiringlashni to'xtatish
 */
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
// 6. STATISTIKA VA PROGRESS BARNI YANGILASH
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
// 7. VAZIFALAR RO'YXATINI CHIZISH (Render)
// ==========================================================================
function renderTodos() {
  todoList.innerHTML = '';

  const now = new Date();

  // Filtr va qidiruv bo'yicha saralash
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

    // Eslatma vaqti bor bo'lsa, uni ko'rsatish tegi
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

    // <li> elementi
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <div class="todo-left">
        <!-- Maxsus Checkbox -->
        <div class="custom-checkbox" role="checkbox" aria-checked="${todo.completed}" tabindex="0">
          <i class="fa-solid fa-check"></i>
        </div>
        
        <!-- Vazifa nomi, Muhimlik va Vaqt belgilari -->
        <div class="todo-content">
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          <div class="todo-meta">
            <span class="priority-tag ${priority.className}">
              ${priority.label}
            </span>
            ${dueBadgeHtml}
          </div>
        </div>
      </div>

      <!-- Tahrirlash va O'chirish tugmalari -->
      <div class="todo-actions">
        <button type="button" class="icon-btn btn-edit" title="Tahrirlash">
          <i class="fa-regular fa-pen-to-square"></i>
        </button>
        <button type="button" class="icon-btn btn-delete" title="O'chirish">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;

    todoList.appendChild(li);
  });

  updateStats();
}

// ==========================================================================
// 8. ASOSIY CRUD AMALLARI
// ==========================================================================

/**
 * Yangi vazifa qo'shish
 */
function handleAddTodo(event) {
  event.preventDefault();

  // Foydalanuvchi biror marta forma yuborganda audio va bildirishnomaga ruxsat so'raymiz
  requestNotificationPermission();
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const dueTime = dueTimeInput.value; // 'YYYY-MM-DDTHH:MM' formati

  if (!text) return;

  const newTodo = {
    id: Date.now().toString(),
    text: text,
    priority: priority,
    dueTime: dueTime || '',
    completed: false,
    notified: false,
    createdAt: Date.now()
  };

  todos.unshift(newTodo);
  saveToLocalStorage();
  renderTodos();

  // Maydonlarni tozalash
  taskInput.value = '';
  dueTimeInput.value = '';
  taskInput.focus();
}

/**
 * Bajarilganlik statusini o'zgartirish
 */
function toggleTodoComplete(id) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      const isNowCompleted = !todo.completed;
      return { 
        ...todo, 
        completed: isNowCompleted,
        // Agar bajarilgan bo'lsa, jiringlashini to'xtatamiz
        isRinging: isNowCompleted ? false : todo.isRinging
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
// 9. HODISALAR TINGLOVCHILARI (Event Listeners)
// ==========================================================================

// Forma yuborilganda yangi vazifa qo'shish
todoForm.addEventListener('submit', handleAddTodo);

// Ro'yxatdagi bosishlar (Event Delegation)
todoList.addEventListener('click', (e) => {
  const item = e.target.closest('.todo-item');
  if (!item) return;

  const id = item.dataset.id;

  if (e.target.closest('.custom-checkbox') || e.target.closest('.todo-content')) {
    toggleTodoComplete(id);
    return;
  }

  if (e.target.closest('.btn-edit')) {
    editTodo(id);
    return;
  }

  if (e.target.closest('.btn-delete')) {
    deleteTodo(id);
    return;
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

// Budilnik modalidagi "Ovozni to'xtatish" tugmasi
dismissAlarmBtn.addEventListener('click', () => {
  closeAlarmModal();
});

// Budilnik modalidagi "Bajarildi deb belgilash" tugmasi
completeAlarmBtn.addEventListener('click', () => {
  if (currentRingingTodoId) {
    const todo = todos.find(t => t.id === currentRingingTodoId);
    if (todo) {
      todo.completed = true;
      todo.isRinging = false;
    }
  }
  closeAlarmModal();
});

// Modal foni bosilganda ham ovozni o'chirish
alarmModal.addEventListener('click', (e) => {
  if (e.target === alarmModal) {
    closeAlarmModal();
  }
});

// Klaviaturadan Escape bosilganda modalni yopish
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && alarmModal.classList.contains('active')) {
    closeAlarmModal();
  }
});

// ==========================================================================
// 10. DASTURNI ISHGA TUSHIRISH VA BUDILNIK TAYMERI
// ==========================================================================
displayCurrentDate();
renderTodos();

// Har 1 soniyada (1000 millisekund) barcha vazifalar vaqtini tekshirib turamiz
setInterval(checkAlarms, 1000);
