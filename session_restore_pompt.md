# slim-site-editor — Session Restore Prompt

I am building an Electron app called `slim-site-editor`. The app is a static site/blog editor. Here is the current state:

## Stack
Electron, vanilla JS (ES modules), HTML partials loaded into `editor/index.html`.

## File structure
```
app/
  main.js
  preload.js
  registry.js
  app-config.js
  scaffold/
    artifacts/
      assets/
        style.css
        theme.js
      templates/
        index.html
        post.html
        tag.html
  editor/
    index.html
    partials/
      sidebar.html
      main.html
    js/
      editor.js
      sidebar.js
      projects.js
      editor-view.js
      save-build.js
      app-config.js
    css/
      editor.css
```

## Project artifact structure
```
<projectDir>/
  artifacts/
    config.json
    assets/
      style.css
      theme.js
    templates/
      index.html
      post.html
      tag.html
    articles/
      <slug>/
        post.json
  dist/
```

## artifacts/config.json fields
`siteTitle`, `sitePrompt`, `siteDesc`, `currentYear`, `siteUrl`, `author`

## post.json fields
`slug`, `title`, `description`, `date`, `readTime`, `tags`, `pinned`, `pinnedOrder`, `body`

## preload.js — window.api exposes
`appName`, `pickDirectory`, `listProjects`, `newProject`, `importProject`, `removeProject`, `setActive`, `archiveProject`, `getAppConfig`, `saveAppConfig`, plus stubs for `listPosts`, `getPost`, `savePost`, `getConfig`, `saveConfig`, `triggerBuild`

## Completed features
- Project list with accordion in sidebar
- `⋯` context menu on each project row (Delete with confirm, Archive stub)
- Auto-fill project name from picked directory basename
- Collapse Add Project section on successful create or import
- New project scaffold: creates directory structure, copies assets/templates from `app/scaffold/`, writes `config.json` defaults, writes default first article
- `electron-reload` wired for development auto-reload
- `Makefile` with `make version` — bumps semver from commit log (`feature:` → minor, `fix:|config:|docs:` → patch), updates `package.json`, commits, tags

## Git commit message rules
- `feature:` — new functionality (triggers minor version bump)
- `fix:` — bug fix (triggers patch version bump)
- `config:` — configuration or build changes (triggers patch version bump)
- `docs:` — documentation changes (triggers patch version bump)
- rember what has changed during the session
- give git comments as a full copy/paste block when asked including all session changes



## Working rules
- Workflow plan before any code
- One transaction at a time
- full file reissued for download
- No compiling or running tests — code is given to me to compile
- No refactoring without permission
- No removing anything without permission
- Do not rewrite comments
- All functions get trace logging at start/end and debug checkpoints
- Wait for go-ahead before writing code

## Always ask to see appropriate file(s) before design
- what you need might already be involved in some way
- do not design without proper understanding of current app state
- do not guess at what is available
- do not ask me about what code should change, that is your job
- I demand a user UI workflow plan
- Do not offer a coding change plan

## App design features
**For future status updates in other parts of the app:**

Any file that needs to show a status message in the topbar just needs to:

1. Import `setStatus` from `editor.js`
2. Call it with a message and state

When you want status wired up somewhere new, tell me:

> *"Wire status into `<filename>` — use [success/error/info/warning/idle] for [describe the condition]"*

States and when to use them:

| State | Use for |
|---|---|
| `'idle'` | Clear/blank the bar |
| `'info'` | Neutral in-progress messages |
| `'success'` | Completed OK — auto-clears 3s |
| `'error'` | Failure — stays until next action |
| `'warning'` | Non-fatal alert — stays until next action |

## Remember


## Agreed next steps (not yet built, one at a time)
### UI Workflow
- The UI/UX experience should follow industry standards


I am refactoring an Electron app called `slim-site-editor` from vanilla JS (ES modules, HTML partials) to React. 

The current stack uses:
- Electron main process (main.js, preload.js, registry.js, app-config.js)
- Vanilla JS ES modules in editor/js/
- HTML partials loaded into editor/index.html
- No bundler — script tags and native ES modules

The refactor goal:
- Introduce React for the renderer (editor UI) only
- Main process files stay unchanged
- Use Vite as the bundler/dev server for the renderer
- Use functional components and hooks only
- No class components
- Preserve all existing IPC calls via window.api (preload.js unchanged)
- Preserve all existing CSS structure and variable names where possible

Current renderer file structure:
editor/
  index.html
  partials/
    sidebar.html
    main.html
  js/
    editor.js
    sidebar.js
    projects.js
    editor-view.js
    save-build.js
    app-config.js
  css/
    editor.css

Before writing any code, ask to see any files needed to understand current state. Plan each component before building it. One file at a time. Wait for go-ahead before writing code.


the target structure
editor/
  index.html               ← Vite entry point
  src/
    main.jsx               ← React root, mounts <App />
    App.jsx                ← top level layout: topbar, sidebar, main
    components/
      Topbar.jsx
      Sidebar.jsx
      Main.jsx             ← view router, renders active view
      views/
        SitePreview.jsx    ← site preview iframe
        PostEditor.jsx     ← Quill editor + save bar
        ConfigForm.jsx     ← project config.json form
        PostSettings.jsx   ← per-article settings form
        AppConfig.jsx      ← app settings form
        Welcome.jsx        ← empty state
      sidebar/
        ProjectList.jsx    ← project accordion
        ProjectRow.jsx     ← single project row + context menu
        ArticleList.jsx    ← articles under a project
        AddProject.jsx     ← new/import/remote tabs
    hooks/
      useProjects.js       ← listProjects, setActive, removeProject
      usePreview.js        ← getPreviewUrl, preview server state
      usePosts.js          ← listPosts, getPost, savePost
      useAppConfig.js      ← getAppConfig, saveAppConfig
      useProjectConfig.js  ← getConfig, saveConfig
    store/
      appState.js          ← shared state (active project, current view)
    css/
      editor.css
  vite.config.js
  
  
  # slim-site-editor — React Refactor Session Prompt

## Purpose
Copy-paste this at the start of each new session to restore context and pick up where we left off.

---

## Stack
- Electron main process — unchanged (`main.js`, `preload.js`, `registry.js`, `app-config.js`)
- Renderer — React + Vite (replacing vanilla JS ES modules)
- Functional components and hooks only
- All IPC via `window.api` (preload.js unchanged)
- Quill for post body editor

---

## File Structure — Target

```
editor/
  index.html               ← Vite entry point (DONE)
  vite.config.js           ← Vite config (DONE)
  src/
    main.jsx               ← React root, mounts <App />
    App.jsx                ← top level layout: topbar, sidebar, main
    components/
      Topbar.jsx
      Sidebar.jsx
      Main.jsx             ← view router, renders active view
      views/
        SitePreview.jsx    ← site preview iframe
        PostEditor.jsx     ← Quill editor + save bar
        ConfigForm.jsx     ← project config.json form
        PostSettings.jsx   ← per-article settings form
        AppConfig.jsx      ← app settings form
        Welcome.jsx        ← empty state
      sidebar/
        ProjectList.jsx    ← project accordion
        ProjectRow.jsx     ← single project row + context menu
        ArticleList.jsx    ← articles under a project
        AddProject.jsx     ← new/import/remote tabs
    hooks/
      useProjects.js
      usePreview.js
      usePosts.js
      useAppConfig.js
      useProjectConfig.js
    store/
      appState.js          ← shared state (activeProject, currentView, statusMsg)
    css/
      editor.css
```

---

## Shared State (appState.js)
- `activeProject` — currently active project dir path
- `currentView` — one of: `welcome` | `site-preview` | `post-editor` | `config-form` | `post-settings` | `app-config`
- `statusMsg` — `{ msg, state }` where state: `idle | info | success | error | warning`

---

## Status States
| State | Use for |
|---|---|
| `idle` | Clear/blank |
| `info` | Neutral in-progress |
| `success` | Completed OK — auto-clears 3s |
| `error` | Failure — stays until next action |
| `warning` | Non-fatal alert — stays until next action |

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
- [ ] `store/appState.js`
- [ ] `src/main.jsx`
- [ ] `src/App.jsx`
- [ ] `src/css/editor.css` (copy existing)

**Gate:** Vite dev server loads, shell renders, no errors.

---

### Phase 2 — Topbar
- [ ] `components/Topbar.jsx`

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

**Next step to pick up:** Phase 1 — `store/appState.js`
