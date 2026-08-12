# slim-site-editor — React Refactor Session Prompt

## Purpose
Port old vanilla JS to React
Be sure to ask for old code during the process so that I get what I want

---

## Stack
- Electron main process — unchanged (`main.js`, `preload.js`, `registry.js`, `app-config.js`)
- Renderer — React + Vite (replacing vanilla JS ES modules)
- Functional components and hooks only
- All IPC via `window.api` (preload.js unchanged)
- Quill for post body editor

---

## File Structure — Actual Current State

```
index.html                 ← Vite entry point (project root)
vite.config.mjs            ← Vite config (project root)
app/
  main.js
  preload.js
  registry.js
  app-config.js
editor/
  App.jsx                  ← top level layout shell (placeholders for Phase 2+)
  main.jsx                 ← React root, mounts <App /> inside <AppStateProvider>
  store/
    appState.jsx           ← context, reducer, useAppState, setStatus
  css/
    editor.css
    quill.snow.css
    quill.snow.css.map
```

---

## Target Structure (remaining work)

```
editor/
  components/
    Topbar.jsx
    Sidebar.jsx
    Main.jsx
    views/
      SitePreview.jsx
      PostEditor.jsx
      ConfigForm.jsx
      PostSettings.jsx
      AppConfig.jsx
      Welcome.jsx
      SitePreview.jsx
    sidebar/
      ProjectList.jsx
      ProjectRow.jsx
      ArticleList.jsx
      AddProject.jsx
  hooks/
    useProjects.js
    usePreview.js
    usePosts.js
    useAppConfig.js
    useProjectConfig.js
    usePreview.js	create
```

Note: `index.html` and `vite.config.mjs` remain at project root — do not move them.

---

## Shared State (store/appState.jsx) — DONE
- `activeProject` — active project dir path
- `currentView` — `welcome | add-project | site-preview | post-editor | config-form | post-settings | app-config`
- `statusMsg` — `{ msg, state }`
- Exports: `AppStateProvider`, `useAppState`, `setStatus`, `Actions`

---

## Status States
`info` is not used — removed.

| State | Display |
|---|---|
| `idle` | breadcrumb shown |
| `success` | message shown — restores breadcrumb after 3s |
| `error` | message stays — breadcrumb gone until next action |
| `warning` | message stays — breadcrumb gone until next action |

---

## Design Decisions

### Topbar center — breadcrumb + status
- Center of topbar shows breadcrumb of current context when `idle`
- Breadcrumb format examples:
  - nothing open → `Select or create a project`
  - add project open → `Add Project`
  - project config → `my-blog › Site Config`
  - post open → `my-blog › my-first-post`
  - post settings → `my-blog › my-first-post › Settings`
  - app config → `App Settings`
- Status message replaces breadcrumb when state is `success`, `error`, or `warning`
- `success` restores breadcrumb after 3s
- `error` and `warning` stay until next action clears them

### Sidebar collapsed state
- Decided per session — see phase notes for chosen option

---

## window.api (preload.js — do not change)
`appName`, `pickDirectory`, `listProjects`, `newProject`, `importProject`,
`removeProject`, `setActive`, `archiveProject`, `getAppConfig`, `saveAppConfig`,
`listPosts`, `getPost`, `savePost`, `getConfig`, `saveConfig`, `triggerBuild`,
`getPreviewUrl`

---

## Logging Pattern (all functions)

```js
// 1st line of functional code
console.trace('[functionName] begins');

// checkpoints
console.debug('[functionName] thing =>', value);

// last line before all returns
console.trace('[functionName] ends');
```

---

## Incremental Build Plan

### Phase 1 — Foundation
- [x] `store/appState.jsx`
- [x] `main.jsx`
- [x] `App.jsx`
- [x] `css/editor.css`

**Gate:** Vite dev server loads, shell renders, no errors.

---

### Phase 2 — Topbar
- [x] `components/Topbar.jsx`

**Gate:** Status messages display correctly.

---

### Phase 3 — Sidebar UI/UX Workflow

The sidebar is always visible on the left side of the app unless collapsed via the hamburger in the topbar.

Three sections in this order:

**App Config:**
- A single row labeled "App Config" at the top. Clicking it opens the app config form in the main area.

**Add Project:**
- A collapsible header labeled "Add Project". Clicking it expands a tabbed form below it.
- Three tabs: New, Import, Remote.
- New tab: user picks a parent directory, enters a project name, clicks Create. On success the section collapses and the new project appears in the Projects list expanded.
- Import tab: user picks an existing project directory, clicks Import. On success same as above.
- Remote tab: repo URL and local destination fields — stub, not yet wired.
- Section starts collapsed.

**Projects:**
- A collapsible header labeled "Projects". Clicking it collapses or expands the list. Starts expanded.
- Each project is a row with its name and a `⋯` button on the right.
- Clicking a project row expands it and sets it as the active project. The site preview loads in the main area. The active project row is highlighted in blue.
- Under each expanded project, the first child is "Site Settings" — clicking it opens the project config form.
- Below Site Settings, each article appears as an indented row. Clicking it opens the post editor.
- Under each article row is a "Settings" child link. Clicking it opens the post settings form for that article.
- The `⋯` button opens a context menu with Delete (with confirmation) and Archive options.

---

### Phase 3 — Testable Steps prompt me for each one before it is checked off

**App Config:**
- [x] Row renders labeled "App Config" at top of sidebar
- [x] Clicking it opens app config form in main area
- [x] Change a value and make sure the results show in the topbar status area

**Add Project section:**
- [x] Section header renders labeled "Add Project" and starts collapsed
- [x] Clicking header expands the form
- [x] Clicking header again collapses the form
- [x] New tab is active by default
- [x] Clicking Import tab switches to Import form
- [x] Clicking Remote tab switches to Remote form
- [x] New tab: picking a directory fills the parent directory field
- [x] New tab: directory basename auto-fills the project name field
- [x] New tab: clicking Create creates the project
- [x] New tab: on success section collapses and new project appears expanded in Projects list
- [x] Import tab: picking a directory fills the directory field
- [x] Import tab: clicking Import imports the project
- [x] Import tab: on success section collapses and project appears expanded in Projects list
- [x] Remote tab: renders repo URL and local destination fields — stub only

**Projects section:**
- [x] Section header renders labeled "Projects" and starts expanded
- [x] Clicking header collapses the list
- [x] Clicking header again expands the list
- [x] Projects load from IPC on mount
- [x] Each project row shows project name and `⋯` button
- [x] Active project row is highlighted in blue
- [x] Clicking a project row expands it and sets it as active
- [x] Site preview loads in main area when project is activated
- [x] First child under expanded project is "Site Settings"
- [ ] Clicking "Site Settings" opens project config form
- [x] Articles list under each project loads from IPC
- [x] Each article renders as an indented row
- [ ] Clicking an article opens the post editor
- [x] Each article has a "Settings" child link
- [ ] Clicking "Settings" opens post settings form for that article
- [x] `⋯` button opens context menu with Delete and Archive
- [x] Delete shows confirmation dialog before deleting
- [ ] Archive is a stub

---

### Phase 4 — Main view router
- [ ] `components/Main.jsx`
- [ ] `components/views/Welcome.jsx`

**Gate:** Welcome shows on load, switching project shows correct view.

---

# Phase 5 — Site Preview

## UI/UX Workflow

The site preview is an iframe that fills the entire main area. It shows the user's built site served by the local preview server.

**On app load:**
- If a project was already active when the app was last closed, the preview server starts automatically and the iframe loads that project's site immediately. The main area shows the site, not the empty state.
- If no project was active, the main area shows the empty state message.

**When a project is clicked in the sidebar:**
- The preview server switches to that project's `dist/` folder.
- The iframe reloads with the new URL.
- The main area switches to show the preview iframe.
- The topbar breadcrumb updates to `project-name › Site Preview`.

**When a different view is opened** (App Config, Site Settings, post editor, etc.):
- The iframe is hidden but the server keeps running.
- Returning to the project row or navigating back shows the preview again.

**If the preview server fails:**
- Topbar shows an error status message.
- Main area does not switch to preview.

---

### Files

- `editor/hooks/usePreview.js` — new
- `editor/components/views/SitePreview.jsx` — new
- `editor/App.jsx` — wire preview URL into main area

---

### Testable Steps

- [ ] On app load with no active project — main area shows empty state
- [ ] On app load with a previously active project — iframe loads site automatically
- [ ] Clicking a project row switches main area to preview iframe
- [ ] Topbar breadcrumb shows `project-name › Site Preview`
- [ ] Preview iframe loads and displays the built site
- [ ] Clicking a different sidebar item hides the preview without stopping the server
- [ ] Returning to the project shows the preview again
- [ ] Preview server failure shows error in topbar

---

### Phase 6 — Project config form
- [ ] `hooks/useProjectConfig.js`
- [ ] `components/views/ConfigForm.jsx`

**Gate:** Config form loads, saves, updates sidebar row name.

---

### Phase 7 — Post editor
- [ ] `hooks/usePosts.js`
- [ ] `components/views/PostEditor.jsx`

**Gate:** Posts open, edit, save, preview updates.

---

### Phase 8 — Post settings
- [ ] `components/views/PostSettings.jsx`

**Gate:** Settings form loads and saves.

---

### Phase 9 — App config
- [x] `hooks/useAppConfig.js` — handled inline in AppConfig.jsx
- [x] `components/views/AppConfig.jsx`

**Gate:** App config loads, saves, dir picker works. ✅

---

### Phase 10 — Cleanup
- [ ] Delete `editor/js/` entirely
- [ ] Delete `editor/partials/` entirely
- [ ] Confirm `editor/index.html` is Vite entry only
- [ ] Smoke test all views end to end

---

## Working Rules
- Always ask to see relevant files before designing
- Plan before any code — wait for go-ahead
- One file at a time, full file reissued for download
- write the all files that need to be updated/deleted/chaged/created then offer the complete list for download as a single transaction
  - give clearn instructions concerning the file placement
- No compiling or running tests — code given to developer to compile
- No refactoring without permission
- No removing anything without permission
- Do not rewrite comments
- All functions get trace logging at start/end and debug checkpoints
- Mark completed steps with `[x]` when done
- Always apply industry standard patterns for state, layout, and component design
- When multiple implementation options exist, identify the industry standard and recommend it with reasoning
- Shared state belongs in the store if more than one component reads or writes it
- Never prop-drill state that is consumed by more than one component level

---


## Always ask to see appropriate file(s) before design
- what you need might already be involved in some way
- do not design without proper understanding of current app state
- do not guess at what is available
- do not ask me about what code should change, that is your job
- I demand a user UI workflow plan
- Do not offer a coding change plan

---

## UI/UX Workflow Plan Requirement
Before any component design, provide a plain-English user workflow plan that describes what the user sees, what they interact with, and what happens as a result. No implementation details. No code references. Describe it as if explaining the feature to a non-technical stakeholder. Cover all states the user can encounter. Wait for approval before proceeding.

---

## Git Commit Message Rules
- `feature:` — new functionality (minor bump)
- `fix:` — bug fix (patch bump)
- `config:` — configuration or build changes (patch bump)
- `docs:` — documentation changes (patch bump)

---

# Share these files at session start:
- editor/App.jsx
- editor/store/appState.jsx
- editor/components/Topbar.jsx
- editor/components/Sidebar.jsx
- editor/components/sidebar/ProjectList.jsx
- editor/components/sidebar/ProjectRow.jsx
- editor/components/sidebar/ArticleList.jsx
- editor/components/sidebar/AddProject.jsx
- editor/components/views/AppConfig.jsx
- app/main.js
- app/preload.js


## Where we left off:

Phase 3 complete except: Clicking "Site Settings" (Phase 6), article click (Phase 7), article Settings click (Phase 8)

### Phase 3 — Testable Steps prompt me for each one before it is checked off
- start here
