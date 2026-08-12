# slim-site-editor — React Refactor Session Prompt

## Purpose
Copy-paste at the start of each session to restore context.

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
```

Note: `index.html` and `vite.config.mjs` remain at project root — do not move them.

---

## Shared State (store/appState.jsx) — DONE
- `activeProject` — active project dir path
- `currentView` — `welcome | site-preview | post-editor | config-form | post-settings | app-config`
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
  - nothing open → _(blank)_
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

### Phase 3 — Sidebar
- [ ] `hooks/useProjects.js`
- [ ] `components/sidebar/ProjectList.jsx`
- [ ] `components/sidebar/ProjectRow.jsx`
- [ ] `components/sidebar/ArticleList.jsx`
- [ ] `components/sidebar/AddProject.jsx`
- [ ] `components/Sidebar.jsx`

**Gate:** Projects load, accordion opens, context menu works, add project works.

---

### Phase 4 — Main view router
- [ ] `components/Main.jsx`
- [ ] `components/views/Welcome.jsx`

**Gate:** Welcome shows on load, switching project shows correct view.

---

### Phase 5 — Site preview
- [ ] `hooks/usePreview.js`
- [ ] `components/views/SitePreview.jsx`

**Gate:** Preview loads on project activate.

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
- [ ] `hooks/useAppConfig.js`
- [ ] `components/views/AppConfig.jsx`

**Gate:** App config loads, saves, dir picker works.

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

## Session Handoff Instructions
At the end of each session:
1. Mark completed steps `[x]` in this document
2. Note the next step to pick up
3. Ask for a git commit block covering all session changes

**Next step to pick up:** Phase 2 — `components/Topbar.jsx`
