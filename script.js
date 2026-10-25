// GitHub Pages is a static site. This form prepares a message; it does not
// create a CRM record, send a notification, or claim delivery to the engineer.
const form = document.querySelector('#leadForm');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const message = String(data.get('message') || '').trim();
    const status = form.querySelector('.form-status');
    if (!message) {
      form.querySelector('[name="message"]').setCustomValidity('Опишите задачу.');
      form.reportValidity();
      return;
    }
    const service = form.dataset.service || 'Консультация по холодильному оборудованию';
    const text = [
      'Здравствуйте! Обращение с сайта RefServiceDV.',
      `Услуга: ${service}`,
      name ? `Имя: ${name}` : '',
      `Задача: ${message}`,
      `Страница: https://refservicedv.ru${window.location.pathname}`
    ].filter(Boolean).join('\n');
    const whatsappUrl = `https://wa.me/79025551200?text=${encodeURIComponent(text)}`;
    status.replaceChildren(document.createTextNode('Сообщение ещё не отправлено. Нажмите «Отправить» в WhatsApp. Если приложение не открылось: '));
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'открыть подготовленное сообщение';
    status.append(link);
    status.hidden = false;
    // Keep the text and fallback link available even when a popup is blocked.
    // A new tab is not evidence that a message has been delivered.
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });
  form.querySelector('[name="message"]').addEventListener('input', (event) => event.target.setCustomValidity(''));
}

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
if (menuToggle && nav) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-controls', 'main-navigation');
  nav.id = 'main-navigation';
  const setMenu = (open) => {
    nav.classList.toggle('mobile-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };
  menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('mobile-open')));
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
}
