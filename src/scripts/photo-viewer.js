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
viewer.addEventListener('click', event => {
  const bounds = viewer.getBoundingClientRect();
  if (event.target === viewer && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) viewer.close();
});
viewer.addEventListener('close', () => photoTrigger?.focus({ preventScroll: true }));
