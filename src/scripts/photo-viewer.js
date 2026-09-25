const viewer = document.querySelector('.photo-viewer');
let photoTrigger;
for (const button of document.querySelectorAll('.photo-open')) {
  button.addEventListener('click', () => {
    photoTrigger = button;
    const image = button.querySelector('img');
    const full = viewer.querySelector('img');
    full.src = image.src;
    full.alt = image.alt;
    viewer.querySelector('figcaption').textContent = button.closest('figure').querySelector('figcaption').innerText;
    viewer.showModal();
  });
}
viewer.querySelector('.photo-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener('close', () => photoTrigger?.focus({ preventScroll: true }));
