const sample = document.querySelector('#sample');
const example = document.querySelector('#sample-quote');
const status = document.querySelector('#selection-status');
const capture = document.querySelector('#capture');
const selectExample = document.querySelector('#select-example');
let selected = '';
let saved = false;
function message(text, error = false) {
  status.textContent = text;
  status.classList.toggle('error', error);
}
function setSelection(text) {
  selected = text;
  example.classList.remove('selected');
  message(text ? '已选好，点「收进来」留下这段文字。' : '可以拖选文字，也可以点「帮我选一句」。');
}
document.addEventListener('selectionchange', () => {
  if (saved) return;
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return;
  // Only accept a selection fully inside this demo article.
  if (!sample.contains(selection.anchorNode) || !sample.contains(selection.focusNode)) {
    setSelection('');
    return;
  }
  setSelection(selection.toString().trim());
});
selectExample.addEventListener('click', () => {
  window.getSelection()?.removeAllRanges();
  setSelection(example.textContent.trim());
  example.classList.add('selected');
});
capture.addEventListener('click', () => {
  if (saved) return;
  if (!selected) {
    message('还没选中文字。请在短文里拖选，或点「帮我选一句」。', true);
    return;
  }
  saved = true;
  document.querySelector('#saved-quote').textContent = selected;
  document.querySelector('#empty').hidden = true;
  document.querySelector('#captured').hidden = false;
  document.querySelector('#count').textContent = '1 条片段';
  capture.disabled = true;
  selectExample.disabled = true;
  message('已收进本次演示。你可以在收集区撤销，或重新体验。');
  document.querySelector('#undo').focus({ preventScroll: true });
  document.querySelector('#captured').scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});
function resetDemo(keepSelection) {
  saved = false;
  document.querySelector('#captured').hidden = true;
  document.querySelector('#empty').hidden = false;
  document.querySelector('#saved-quote').textContent = '';
  document.querySelector('#count').textContent = '0 条片段';
  capture.disabled = false;
  selectExample.disabled = false;
  if (keepSelection) message('已撤销，选文还在。可以再次收集。');
  else {
    window.getSelection()?.removeAllRanges();
    setSelection('');
  }
  (keepSelection ? capture : selectExample).focus();
}
document.querySelector('#undo').addEventListener('click', () => resetDemo(true));
document.querySelector('#reset').addEventListener('click', () => resetDemo(false));
