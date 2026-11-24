/**
 * Everything this application knows how to do, as pure functions.
 *
 * Nothing here touches the DOM, which is what lets the test suite import it
 * directly. Behaviour lives here; the screen lives in app.js.
 */

/** @typedef {'todo' | 'doing' | 'done'} Status */
/** @typedef {{ id: string, title: string, status: Status }} Task */

export const COLUMNS = [
  { status: 'todo', label: 'To do' },
  { status: 'doing', label: 'Doing' },
  { status: 'done', label: 'Done' },
];

const STATUSES = COLUMNS.map((c) => c.status);

/** @returns {Task[]} */
export function initialTasks() {
  return [];
}

function nextId(tasks) {
  let max = 0;
  for (const t of tasks) {
    const n = Number(String(t.id).replace(/^task-/, ''));
    if (Number.isInteger(n) && n > max) max = n;
  }
  return `task-${max + 1}`;
}

/** Adds a task to To do. Blank titles are ignored. Returns a new list. */
export function addTask(tasks, title) {
  const trimmed = String(title ?? '').trim();
  if (!trimmed) return tasks;
  return [...tasks, { id: nextId(tasks), title: trimmed, status: 'todo' }];
}

/** Moves a task to the given column. Unknown ids or statuses change nothing. */
export function moveTask(tasks, id, status) {
  if (!STATUSES.includes(status)) return tasks;
  return tasks.map((t) => (t.id === id ? { ...t, status } : t));
}

/** Moves a task one column left (-1) or right (1), stopping at the ends. */
export function shiftTask(tasks, id, direction) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return tasks;
  const idx = STATUSES.indexOf(task.status) + (direction < 0 ? -1 : 1);
  if (idx < 0 || idx >= STATUSES.length) return tasks;
  return moveTask(tasks, id, STATUSES[idx]);
}

/** Removes a task. */
export function removeTask(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}

/** Tasks in one column, in the order they were added. */
export function tasksIn(tasks, status) {
  return tasks.filter((t) => t.status === status);
}

/** Counts per column. */
export function summarise(tasks) {
  return {
    total: tasks.length,
    todo: tasksIn(tasks, 'todo').length,
    doing: tasksIn(tasks, 'doing').length,
    done: tasksIn(tasks, 'done').length,
  };
}

/** @returns {string} */
export function serialise(tasks) {
  return JSON.stringify(tasks);
}

/** Reads saved tasks; anything corrupt yields an empty board or drops bad entries. */
export function deserialise(text) {
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) return [];
    return data
      .filter((t) => t && typeof t.id === 'string' && typeof t.title === 'string' && STATUSES.includes(t.status))
      .map((t) => ({ id: t.id, title: t.title, status: t.status }));
  } catch {
    return [];
  }
}
