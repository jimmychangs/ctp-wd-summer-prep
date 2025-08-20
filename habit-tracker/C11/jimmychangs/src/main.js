// state
const habits = [];

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

function handleToggleToday(event) {
  if (!event.target.classList.contains('toggle_today')) return;
  const index = Number(event.target.getAttribute('data-index'));
  const habit = habits[index];
  if (!habit) return;

  const key = todayKey();                // e.g., "2025-08-20"
  habit.logs[key] = !habit.logs[key];    // flip true/false
  renderHabits();
}
// ---------------- core functions ----------------

// add a new habit
function handleAddHabit(event) {
  event.preventDefault();
  const data = new FormData(event.target);

  const habit = {
    name: data.get('habit_name'),
    category: data.get('habit_category'),
    targetStreak: Number(data.get('target_streak')),
    dateStarted: String(data.get('date_started') || todayKey()),
    logs: {}
  };

  habits.push(habit);
  renderHabits();
  console.log(habit)
}

// render habits
function renderHabits() {
  habitList.innerHTML = habits
    .map((habit, index) => {
      const doneToday = !!habit.logs[todayKey()]; 
      return `
        <li>
          <strong>${habit.name}</strong> (${habit.category})
          Target: ${habit.targetStreak}
          • Started: ${habit.dateStarted}
          <button data-index="${index}" class="toggle_today">
            ${doneToday ? 'Undo Today' : 'Done Today'}
          </button>
          <button data-index="${index}" class="delete_habit">Delete</button>
        </li>
      `;
    })
    .join('');
}

// delete habit
function handleDeleteHabit(event) {
  if (event.target.classList.contains('delete_habit')) {
    const index = event.target.getAttribute('data-index');
    habits.splice(index, 1);
    renderHabits();
  }
}

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}