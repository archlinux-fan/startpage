// Pick colors, watch the preview, copy the CSS to the end of style.css
const NORD = ['#2e3440', '#3b4252', '#434c5e', '#4c566a', '#d8dee9', '#e5e9f0', '#eceff4', '#8fbcbb',
    '#88c0d0', '#81a1c1', '#5e81ac', '#bf616a', '#d08770', '#ebcb8b', '#a3be8c', '#b48ead'];
const COLORS = [ // CSS variable, label, name of the "keep as is" choice
    ['--bg', 'Background', 'Default'],
    ['--surface', 'Bookmarks', 'Default'],
    ['--text', 'Text', 'Default'],
    ['--accent', 'Arrows and highlights', 'Default'],
    ['--icons', 'Icons', 'Brand colors'],
    ['--panel', 'Tasks panel', 'Default'],
    ['--tasks-accent', 'Tasks highlight', 'Like arrows'],
];
const form = document.querySelector('form');
const pre = form.querySelector('pre');
const copy = form.querySelector('pre + button');
const frame = document.querySelector('iframe');
const picked = { 'color-scheme': 'dark' }; // style.css is dark unless told otherwise

const chip = (value, label) => `<button type="button" value="${value}">${label}</button>`;
const swatches = NORD.map((c, i) => `<button type="button" value="${c}" title="nord${i} ${c}" style="background:${c}"></button>`).join('');
copy.insertAdjacentHTML('afterend', `<fieldset name="color-scheme"><legend>Theme</legend>${chip('dark', 'Dark')}${chip('light', 'Light')}</fieldset>`
    + COLORS.map(([name, label, keep]) => `<fieldset name="${name}"><legend>${label}</legend>${chip('', keep)}${swatches}<input type="color" title="Any color"></fieldset>`).join(''));

const render = () => {
    form.querySelectorAll('fieldset button').forEach(b => b.ariaPressed = b.value === (picked[b.parentElement.name] ?? ''));
    const lines = Object.entries(picked).filter(([n, v]) => n !== 'color-scheme' || v !== 'dark').map(([n, v]) => `    ${n}: ${v};`);
    pre.textContent = lines.length ? `:root {\n${lines.join('\n')}\n}` : '/* Nothing to paste yet: these are the colors style.css already has */';
    const root = frame.contentDocument?.documentElement; // null when this page is opened as a file
    if (root) root.style.cssText = Object.entries(picked).map(([n, v]) => `${n}: ${v}`).join('; ');
};
const set = (name, value) => { value ? picked[name] = value : delete picked[name]; render(); };
form.onclick = (e) => { const b = e.target.closest('fieldset button'); if (b) set(b.parentElement.name, b.value); };
form.oninput = (e) => set(e.target.parentElement.name, e.target.value);
copy.onclick = () => navigator.clipboard.writeText(pre.textContent).then(() => {
    copy.textContent = 'Copied';
    setTimeout(() => copy.textContent = 'Copy CSS', 1500);
});

// A few sample tasks for the preview, only if this browser has none
if (!localStorage.getItem('tasks')) localStorage.setItem('tasks', JSON.stringify([
    { text: 'Renew wildcard cert before Friday', pinned: true },
    { text: 'Upgrade Proxmox, one node at a time' },
    { text: 'Move Jellyfin transcoding to the iGPU' },
    { text: 'Read the Hyprland changelog' },
]));
frame.onload = render;
frame.src = '../index_search_tasks.html';
render();
