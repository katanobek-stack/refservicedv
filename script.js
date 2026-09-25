const form = document.querySelector('#leadForm');
const toast = document.querySelector('.toast');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const text = `Здравствуйте! Меня зовут ${data.get('name')}. Телефон: ${data.get('phone')}. Задача: ${data.get('message') || 'нужна консультация по холодильному оборудованию'}`;
  toast.classList.add('show');
  window.open(`https://wa.me/79025551200?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  setTimeout(() => toast.classList.remove('show'), 5000);
});

document.querySelector('.menu-toggle')?.addEventListener('click', () => {
  document.querySelector('.desktop-nav')?.classList.toggle('mobile-open');
});

if (!document.querySelector('script[src="assistant.js"]')) {
  const assistantScript = document.createElement('script');
  assistantScript.type = 'module';
  assistantScript.src = 'assistant.js';
  document.body.appendChild(assistantScript);
}
