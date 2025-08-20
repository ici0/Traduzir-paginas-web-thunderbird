function init() {
  document.getElementById("engine-label").textContent = browser.i18n.getMessage("engine_label");
  document.getElementById("lang-label").textContent = browser.i18n.getMessage("language_label");
  document.getElementById("translate").textContent = browser.i18n.getMessage("translate_button");
  document.getElementById("restore").textContent = browser.i18n.getMessage("restore_button");

  document.getElementById("translate").addEventListener("click", async () => {
    const engine = document.getElementById("engine").value;
    const to = document.getElementById("lang").value;
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    browser.tabs.sendMessage(tab.id, { type: "translate", engine, to });
  });

  document.getElementById("restore").addEventListener("click", async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    browser.tabs.sendMessage(tab.id, { type: "restore" });
  });
}

document.addEventListener("DOMContentLoaded", init);
