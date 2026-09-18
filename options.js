const DEFAULTS = { sameWindowOnly: false, exactMatch: true };

async function init() {
    const settings = await browser.storage.local.get(DEFAULTS);
    for (const key of Object.keys(DEFAULTS)) {
        const box = document.getElementById(key);
        box.checked = settings[key];
        box.addEventListener("change", () => browser.storage.local.set({ [key]: box.checked }));
    }
}

init();
