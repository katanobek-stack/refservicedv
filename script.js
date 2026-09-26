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

const tiger = document.createElement('button');
tiger.type = 'button';
tiger.className = 'rs-tiger is-grooming';
tiger.setAttribute('aria-label', 'Открыть чат с ИИ-помощником');
tiger.setAttribute('title', 'Поговорить с ИИ-помощником');
const tigerCanvas = document.createElement('canvas');
tigerCanvas.className = 'rs-tiger-canvas';
tigerCanvas.width = 284;
tigerCanvas.height = 340;
tiger.appendChild(tigerCanvas);
document.body.appendChild(tiger);

const tigerFrames = new Image();
tigerFrames.src = 'assets/mascot/tiger-groom-yawn-24.png?v=1';
const tigerFrameColumns = 8;
const tigerFrameRows = 3;
const tigerFrameCount = 36;
const tigerContext = tigerCanvas.getContext('2d');
function drawTiger(now) {
  tigerContext.clearRect(0, 0, tigerCanvas.width, tigerCanvas.height);
  if (tigerFrames.complete && tigerFrames.naturalWidth) {
    const frame = Math.floor(now / 130) % tigerFrameCount;
    const frameWidth = tigerFrames.naturalWidth / tigerFrameColumns;
    const frameHeight = tigerFrames.naturalHeight / tigerFrameRows;
    const sourceFrame = frame * 23 / 35;
    const firstFrame = Math.floor(sourceFrame);
    const secondFrame = Math.min(firstFrame + 1, 23);
    const blend = sourceFrame - firstFrame;
    const drawFrame = (index, opacity) => {
      const sx = (index % tigerFrameColumns) * frameWidth;
      const sy = Math.floor(index / tigerFrameColumns) * frameHeight;
      tigerContext.globalAlpha = opacity;
      tigerContext.drawImage(tigerFrames, sx, sy, frameWidth, frameHeight, 0, 0, tigerCanvas.width, tigerCanvas.height);
    };
    drawFrame(firstFrame, 1 - blend);
    if (blend) drawFrame(secondFrame, blend);
    tigerContext.globalAlpha = 1;
  }
  window.requestAnimationFrame(drawTiger);
}
window.requestAnimationFrame(drawTiger);

tiger.addEventListener('click', () => {
  const assistantToggle = document.querySelector('#rsbot-toggle');
  if (assistantToggle) {
    assistantToggle.click();
  } else {
    window.setTimeout(() => document.querySelector('#rsbot-toggle')?.click(), 400);
  }
});
