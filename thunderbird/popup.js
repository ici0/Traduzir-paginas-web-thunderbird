document.addEventListener('DOMContentLoaded', init);

async function init() {
  const engineSel = document.getElementById('engine');
  const targetSel = document.getElementById('target');
  const actionBtn = document.getElementById('action');

  const settings = await browser.runtime.sendMessage({ type: 'GET_SETTINGS' });
  engineSel.value = settings.engine;
  targetSel.value = settings.target;

  engineSel.addEventListener('change', async () => {
    await browser.runtime.sendMessage({ type: 'SET_SETTINGS', settings: { engine: engineSel.value } });
  });
  targetSel.addEventListener('change', async () => {
    await browser.runtime.sendMessage({ type: 'SET_SETTINGS', settings: { target: targetSel.value } });
  });

  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  let translated = false;
  try {
    translated = await browser.tabs.sendMessage(tab.id, { type: 'STATUS' });
  } catch (e) {
    translated = false;
  }
  updateButton(translated);

  actionBtn.addEventListener('click', async () => {
    await browser.tabs.sendMessage(tab.id, { type: 'TOGGLE', engine: engineSel.value, to: targetSel.value });
    translated = !translated;
    updateButton(translated);
  });
}

function updateButton(translated) {
  const actionBtn = document.getElementById('action');
  actionBtn.textContent = translated ? 'Restore' : 'Translate';
}
