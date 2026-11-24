import {
  COLUMNS, addTask, deserialise, initialTasks, removeTask, serialise, shiftTask, summarise, tasksIn,
} from './logic.js';

const KEY = 'kanban-board-tasks';
const root = document.getElementById('app');

function load() {
  try {
    const text = localStorage.getItem(KEY);
    return text ? deserialise(text) : initialTasks();
  } catch {
    return initialTasks();
  }
}

function save() {
  try { localStorage.setItem(KEY, serialise(tasks)); } catch { /* storage unavailable */ }
}

let tasks = load();

function update(next) {
  tasks = next;
  save();
  render();
}

function render() {
  const s = summarise(tasks);
  root.innerHTML = `
    <header>
      <h1>Kanban board</h1>
      <p class="sub">${s.total === 0 ? 'No tasks yet. Add the first one.' : `${s.todo} to do, ${s.doing} doing, ${s.done} done`}</p>
    </header>
    <form id="add">
      <input id="title" name="title" placeholder="Add a task…" autocomplete="off" />
      <button type="submit">Add</button>
    </form>
    <div class="board">
      ${COLUMNS.map((c, ci) => `
        <section class="column" data-status="${c.status}">
          <h2>${c.label}</h2>
          <ul>
            ${tasksIn(tasks, c.status).map((t) => `
              <li>
                <span>${escapeHtml(t.title)}</span>
                <div class="actions">
                  <button class="move" data-id="${t.id}" data-dir="-1" aria-label="Move left" ${ci === 0 ? 'disabled' : ''}>←</button>
                  <button class="move" data-id="${t.id}" data-dir="1" aria-label="Move right" ${ci === COLUMNS.length - 1 ? 'disabled' : ''}>→</button>
                  <button class="remove" data-id="${t.id}" aria-label="Delete">×</button>
                </div>
              </li>`).join('')}
          </ul>
        </section>`).join('')}
    </div>`;

  root.querySelector('#add').addEventListener('submit', (e) => {
    e.preventDefault();
    update(addTask(tasks, root.querySelector('#title').value));
  });
  for (const b of root.querySelectorAll('.move')) {
    b.addEventListener('click', () => update(shiftTask(tasks, b.dataset.id, Number(b.dataset.dir))));
  }
  for (const b of root.querySelectorAll('.remove')) {
    b.addEventListener('click', () => update(removeTask(tasks, b.dataset.id)));
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

render();
