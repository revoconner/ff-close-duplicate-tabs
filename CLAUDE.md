# CLAUDE.md

## Primary goal
A Firefox extension that closes duplicate tabs. Clicking the toolbar icon checks the open tabs, and wherever two or more tabs have the same URL it closes the extras so only one stays open.

## Functions of the extension
- Clicking the toolbar icon runs the check and closes duplicates straight away. There is no confirmation step.
- For every group of tabs sharing a URL, exactly one tab survives. 2 tabs with the same link means 1 gets closed, 5 means 4 get closed.
- Which tab survives in a group, in order of preference:
    1. The active tab of the window the icon was clicked in.
    2. An active tab of another window.
    3. A pinned tab.
    4. The first one found (lowest window, lowest tab index).
- By default the check covers tabs from every open Firefox window.
- Blank and new tab pages (`about:newtab`, `about:blank`) are treated like any other URL, so extra empty tabs get closed too.
- Private and normal windows are never mixed in one run. A run started from a normal window only looks at and closes tabs in normal windows, and a run started from a private window only touches private windows. This holds whether the window toggle is on or off. Private windows are only reachable at all if Rev allows the extension to run in them.
- A tab that is still loading and reports `about:blank` is skipped. That is a freshly opened tab whose real URL has not arrived yet, and closing it as a blank duplicate would lose the page.
- After the run, a popup reports what was closed, see UI.

## Settings
The extension has an options page, shown in the extension manager (about:addons, Options tab of the extension). It holds two toggles:

- `Only close tabs from the window it's clicked in` (default off). When on, the action only looks at and closes tabs in the window instance where the icon was clicked. Tabs in any other Firefox window are ignored entirely, both for finding duplicates and for closing.
- `Exact URL match` (default on). When on, two tabs are duplicates only if their full URLs are identical, so `page#a` and `page#b` are different tabs. When off, everything from the first `?` or `#` onwards is ignored, so `page`, `page?x=1` and `page#a` all count as the same tab. This is Rev's call, knowing it also merges pages that differ only by query string (different YouTube videos, search results).

## UI
- Toolbar icon is `icon.png` (192x192, supplied by Rev). Do not replace it.
- Clicking the icon opens a small popup that shows the result of the run it just triggered:
    - A total on top, for example `Closed 6 duplicate tabs`.
    - Below it a list, one row per URL that had duplicates, with the URL and the number of tabs closed for it, most closed first. With `Exact URL match` off the row shows the shortened URL that was compared.
    - Long URLs are cut off in the row and shown in full on hover.
    - When nothing was closed it just says no duplicate tabs were found.
- Options page: the two toggles, nothing else.
- Dark theme for both the popup and the options page.

## Technical notes
- Manifest V3, modelled on `D:\My OpenSource\Firefox Extensions\FFsaveTabs\manifest.json`. Same shape for `browser_specific_settings` (gecko id in the form `name@revoconner`, `data_collection_permissions` required `["none"]`), `icons`, `background.scripts`, and `action` with a `default_popup`.
- Differences from that manifest:
    - Add `options_ui` with `"page": "options.html"` so the toggles show up inside the extension manager.
    - Permissions are only `tabs` (needed to read tab URLs) and `storage` (the toggles). No `downloads` or `clipboardWrite`.
    - Icons point at `icon.png` instead of an svg.
- Because `default_popup` is set, `browser.action.onClicked` never fires. The popup is the trigger: on load, `popup.js` sends a message to `background.js` with the id of its own window, the background script does the closing and replies with the list of closed URLs and counts, and the popup renders that. The work lives in the background script so it still finishes if the popup loses focus and closes halfway.
- Window scope: `browser.tabs.query({ windowId })` when the window toggle is on, `browser.tabs.query({})` when off.
- The MV3 background script is a non persistent event page. Read the toggles from `browser.storage.local` on every run, never cache them in a global.
- Files: `manifest.json`, `background.js`, `popup.html`, `popup.js`, `options.html`, `options.js`, `style.css` (shared dark theme), `icon.png`. No build step, no dependencies.

## Status
- Version 1.0.0 is the first draft and covers everything in this file. Nothing is pending.
- Rev loaded it in Firefox on 2026-09-18 and confirmed it works. The grouping logic in `background.js` also passed a mock run in Node before that.
- To load it for testing: `about:debugging`, This Firefox, Load Temporary Add-on, pick `manifest.json`. The toggles are under `about:addons`, in the extension's Options tab.
- Anything added from here on is new scope, so describe it in this file first.

## Working rules
- Git is handled by Rev. Do not run git commands or remind about committing.
