// Sections remember being open or closed; "open" in the HTML is only the first-visit default
document.querySelectorAll('main details').forEach(d => {
    const key = 'section-' + d.querySelector('summary').textContent;
    if (localStorage.getItem(key)) d.open = localStorage.getItem(key) === 'open';
    d.ontoggle = () => localStorage.setItem(key, d.open ? 'open' : 'closed');
});
