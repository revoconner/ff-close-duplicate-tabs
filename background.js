const DEFAULTS = { sameWindowOnly: false, exactMatch: true };

function matchKey(url, exact) {
    return exact ? url : url.split(/[?#]/)[0];
}

// Lowest rank survives: active tab of the clicked window, active tab elsewhere, pinned, then first found
function rank(tab, windowId) {
    if (tab.active && tab.windowId === windowId) return 0;
    if (tab.active) return 1;
    if (tab.pinned) return 2;
    return 3;
}

async function closeDuplicates(windowId, incognito) {
    const { sameWindowOnly, exactMatch } = await browser.storage.local.get(DEFAULTS);
    const found = await browser.tabs.query(sameWindowOnly ? { windowId } : {});

    // A tab that has not committed its first navigation still reports about:blank, so leave it alone
    const tabs = found.filter(t => t.incognito === incognito && !(t.status === "loading" && t.url === "about:blank"));
    tabs.sort((a, b) => rank(a, windowId) - rank(b, windowId) || a.windowId - b.windowId || a.index - b.index);

    const groups = new Map();
    for (const tab of tabs) {
        const key = matchKey(tab.url, exactMatch);
        if (groups.has(key)) groups.get(key).push(tab.id);
        else groups.set(key, []);
    }

    const closed = [...groups].filter(([, ids]) => ids.length).map(([url, ids]) => ({ url, ids }));
    await browser.tabs.remove(closed.flatMap(g => g.ids));

    const list = closed.map(g => ({ url: g.url, count: g.ids.length })).sort((a, b) => b.count - a.count);
    return { total: list.reduce((sum, g) => sum + g.count, 0), groups: list };
}

browser.runtime.onMessage.addListener(msg => {
    if (msg.type === "closeDuplicates") return closeDuplicates(msg.windowId, msg.incognito);
});
