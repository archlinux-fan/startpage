// Tasks panel: list icon opens it, its arrow closes it, pinned first, drag the grip to reorder,
// click text to edit (Shift+Enter = new line), Ctrl+Z undoes
const aside = document.querySelector('aside');
const setTasks = (hidden) => { aside.inert = hidden; localStorage.setItem('tasksHidden', hidden ? 1 : ''); };
setTasks(!!localStorage.getItem('tasksHidden'));
document.querySelector('body > button').onclick = () => setTasks(false);
aside.querySelector(':scope > button').onclick = () => setTasks(true);

const form = aside.querySelector('form');
const ul = aside.querySelector('ul');
const undo = [];
const pinnedFirst = (list) => [...list.filter(t => t.pinned), ...list.filter(t => !t.pinned)];
let tasks = JSON.parse(localStorage.getItem('tasks') || localStorage.getItem('todos') || '[]')
    .map(t => typeof t === 'string' ? { text: t } : t); // older versions saved plain strings under 'todos'
let dragged;

const store = (next) => {
    tasks = pinnedFirst(next);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    ul.replaceChildren(...tasks.map((task, i) => {
        const li = document.createElement('li');
        li.task = task;
        li.toggleAttribute('data-pinned', !!task.pinned);
        li.innerHTML = '<i class="fa-solid fa-grip-vertical"></i><span contenteditable="plaintext-only"></span>'
            + '<button title="Pin"><i class="fa-solid fa-thumbtack"></i></button><button title="Remove">×</button>';
        const [grip, span, pin, x] = li.children;
        span.textContent = task.text;
        span.onkeydown = (e) => {
            if (e.key === 'Escape') span.textContent = task.text;
            if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) { e.preventDefault(); span.blur(); }
        };
        span.onblur = () => {
            const t = span.textContent.trim();
            if (t !== task.text) save(t ? tasks.with(i, { ...task, text: t }) : tasks.toSpliced(i, 1));
        };
        pin.onclick = () => save(tasks.with(i, { ...task, pinned: !task.pinned }));
        x.onclick = () => save(tasks.toSpliced(i, 1));
        grip.onpointerdown = () => li.draggable = true;
        grip.onpointerup = () => li.draggable = false;
        li.ondragstart = () => dragged = li;
        // Others move live while dragging, but only within the same group (pinned / not)
        li.ondragover = (e) => {
            if (!dragged || li === dragged || li.task.pinned !== dragged.task.pinned) return;
            const r = li.getBoundingClientRect();
            const after = e.clientY > r.top + r.height / 2;
            if ((after ? li.nextElementSibling : li.previousElementSibling) !== dragged) flip(() => li[after ? 'after' : 'before'](dragged));
        };
        li.ondragend = (e) => {
            li.draggable = false;
            dragged = undefined;
            const next = [...ul.children].map(el => el.task);
            if (e.dataTransfer.dropEffect === 'none') store(tasks); // cancelled: put it back
            else if (next.some((t, k) => t !== tasks[k])) save(next);
        };
        return li;
    }));
};
ul.ondragover = ul.ondrop = (e) => e.preventDefault();

// Slide items from their old to their new position after a DOM move
const flip = (move) => {
    const items = [...ul.children];
    const before = items.map(el => el.getBoundingClientRect().top);
    move();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    items.forEach((el, k) => {
        const dy = before[k] - el.getBoundingClientRect().top;
        if (dy) el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 180, easing: 'ease-out' });
    });
};
const save = (next) => { undo.push(tasks); store(next); };

form.onsubmit = (e) => {
    e.preventDefault();
    const t = form.task.value.trim();
    if (t) save([{ text: t }, ...tasks]);
    form.reset();
};
store(tasks);

// Ctrl+Z undoes the last task change, but not while typing
document.addEventListener('keydown', (e) => {
    const t = e.target;
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z' && undo.length && !t.value && !t.isContentEditable) {
        e.preventDefault();
        store(undo.pop());
    }
});
