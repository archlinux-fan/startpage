// Bookmark search: type anywhere, Enter opens the first match, Esc clears
const search = document.querySelector('main > input');
search.oninput = () => {
    const q = search.value.toLowerCase();
    document.querySelectorAll('nav a').forEach(a => a.hidden = !a.textContent.toLowerCase().includes(q));
};
search.onkeydown = (e) => {
    if (e.key === 'Enter') document.querySelector('nav a:not([hidden])')?.click();
    if (e.key === 'Escape') { search.value = ''; search.oninput(); search.blur(); }
};
// Any key typed outside a field starts a search
document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (/^\S$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey && !t.matches('input') && !t.isContentEditable) search.focus();
});
