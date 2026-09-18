async function run() {
    const summary = document.getElementById("summary");
    const list = document.getElementById("list");
    try {
        const win = await browser.windows.getCurrent();
        const result = await browser.runtime.sendMessage({ type: "closeDuplicates", windowId: win.id, incognito: win.incognito });
        if (!result.total) {
            summary.textContent = "No duplicate tabs found";
            return;
        }
        summary.textContent = `Closed ${result.total} duplicate ${result.total === 1 ? "tab" : "tabs"}`;
        for (const group of result.groups) {
            const row = document.createElement("li");
            const url = document.createElement("span");
            const count = document.createElement("span");
            url.className = "url";
            url.textContent = url.title = group.url;
            count.className = "count";
            count.textContent = group.count;
            row.append(url, count);
            list.append(row);
        }
    } catch (e) {
        summary.textContent = `Could not close tabs: ${e.message}`;
    }
}

run();
