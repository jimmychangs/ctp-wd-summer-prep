// state
let habits = loadHabits();


// elements
const habitForm = document.getElementById('habit_form');
const habitList = document.getElementById('habit_list');
const dateStartedInput = document.getElementById('date_started');

if (dateStartedInput && !dateStartedInput.value) {
  dateStartedInput.value = todayKey();
} 

// event listeners
habitForm.addEventListener('submit', handleAddHabit);
habitList.addEventListener('click', handleDeleteHabit);
habitList.addEventListener('click', handleToggleToday);
habitList.addEventListener('click', handleEditHabit);


function loadHabits() {
  try {
    const stored = localStorage.getItem('habits');
    const arr = stored ? JSON.parse(stored) : [];
    // normalize older entries just in case
    arr.forEach(h => {
      if (!h.logs) h.logs = {};
      if (!h.dateStarted) h.dateStarted = todayKey();
    });
    return arr;
  } catch {
    return [];
  }
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
} //saves habits to local storage


// ---------------- core functions ----------------

// add a new habit
function handleAddHabit(event) {
  event.preventDefault();
  const data = new FormData(event.target);

  const habit = {
    name: String(data.get('habit_name') || '').trim(),
    category: String(data.get('habit_category') || 'uncategorized'),
    targetStreak: Number(data.get('target_streak') || 0),
    dateStarted: String(data.get('date_started') || todayKey()),
    logs: {}
  };
  if (!habit.name) return;

  habits.push(habit);
  saveHabits();        // <-- persist
  renderHabits();
  habitForm.reset();
  console.log(habit)   
  if (dateStartedInput) dateStartedInput.value = todayKey();

}

function handleToggleToday(event) {
  if (!event.target.classList.contains('toggle_today')) return;
  const index = Number(event.target.getAttribute('data-index'));
  const habit = habits[index];
  if (!habit) return;

  const key = todayKey();                // e.g., "2025-08-20"
  habit.logs[key] = !habit.logs[key];    // flip true/false
  saveHabits(); 
  renderHabits();
}

function handleEditHabit(event) {
  if (!event.target.classList.contains('edit_habit')) return;
  const index = Number(event.target.getAttribute('data-index'));
  const habit = habits[index];
  if (!habit) return;

  // For now, a simple prompt-based edit (quick to implement):
  const newName = prompt("Edit habit name:", habit.name);
  const newCategory = prompt("Edit category:", habit.category);
  const newTarget = prompt("Edit target streak:", habit.targetStreak);

  if (newName !== null) habit.name = newName.trim() || habit.name;
  if (newCategory !== null) habit.category = newCategory.trim() || habit.category;
  if (newTarget !== null && !isNaN(newTarget)) habit.targetStreak = Number(newTarget);

  saveHabits();
  renderHabits();
}


// delete habit
function handleDeleteHabit(event) {
  if (event.target.classList.contains('delete_habit')) {
    const index = event.target.getAttribute('data-index');
    habits.splice(index, 1);
    saveHabits();
    renderHabits();
  }
}

function renderHabits() {
  habitList.innerHTML = habits
    .map((habit, index) => {
      const doneToday = !!habit.logs[todayKey()];
      const currentStreak = calculateCurrentStreak(habit);
      const longestStreak = calculateLongestStreak(habit);

      return `
        <li>
          <strong>${habit.name}</strong> | (${habit.category})
          | Target: ${habit.targetStreak} | Started: ${habit.dateStarted}<br>
           Current Streak: ${currentStreak} |  Longest Streak: ${longestStreak}
          <br>
          <button data-index="${index}" class="toggle_today">
            ${doneToday ? 'Undo Today' : 'Done Today'}
          </button>
          <button data-index="${index}" class="edit_habit">Edit</button>
          <button data-index="${index}" class="delete_habit">Delete</button>
        </li>
      `;
    })
    .join('');
}


function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---------- streak helpers ----------
function calculateCurrentStreak(habit) {
  const logs = habit.logs || {};
  let streak = 0;
  let d = new Date();

  while (logs[todayKey(d)]) {
    streak++;
    d.setDate(d.getDate() - 1); // move to previous day
  }
  return streak;
}

function calculateLongestStreak(habit) {
  const logs = habit.logs || {};
  const dates = Object.keys(logs).filter(day => logs[day]).sort();
  
  let max = 0, current = 0, prev = null;
  
  for (const day of dates) {
    if (!prev) {
      current = 1;
    } else {
      const prevDate = new Date(prev);
      prevDate.setDate(prevDate.getDate() + 1);
      current = (todayKey(prevDate) === day) ? current + 1 : 1;
    }
    max = Math.max(max, current);
    prev = day;
  }
  
  return max;
}


renderHabits();