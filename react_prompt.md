# slim-site-editor — React Refactor Session Prompt

## Purpose
Copy-paste this at the start of each new session to restore context and pick up where we left off.

---

## Stack
- Electron main process — unchanged (`app/main.js`, `app/preload.js`, `app/registry.js`, `app/app-config.js`)
- Renderer — React + Vite (replacing vanilla JS ES modules)
- Functional components and hooks only
- All IPC via `window.api` (preload.js unchanged)
- Quill for post body editor

---

## Project Structure

```
slim-site-editor/
  package.json
  vite.config.js          ← project root
  index.html              ← Vite entry point, project root
  Makefile
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
  editor/                 ← React renderer source
    main.jsx
    App.jsx
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
    store/
      appState.js
    css/
      editor.css
      quill.snow.css
  dist-renderer/          ← Vite build output (gitignored)
  node_modules/
```

---

## Key Config

### vite.config.js (project root)
- `root` — project root
- `base` — `./`
- `server.port` — 5173
- `build.outDir` — `dist-renderer/`
- `resolve.alias` — `@` → `editor/`

### index.html (project root)
```html
<script type="module" src="/editor/main.jsx"></script>
```

### package.json scripts
```json
"dev":   "concurrently \"vite\" \"sleep 5 && NODE_ENV=development electron --no-sandbox app/main.js\"",
"build": "vite build",
"start": "NODE_ENV=development electron --no-sandbox app/main.js"
```

### app/main.js — renderer load
```js
if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
} else {
    win.loadFile(path.join(__dirname, '..', 'dist-renderer', 'index.html'));
}
```

---

## Shared State (store/appState.js)
- `activeProject` — currently active project dir path
- `currentView` — one of: `welcome` | `site-preview` | `post-editor` | `config-form` | `post-settings` | `app-config`
- `statusMsg` — `{ msg, state }` where state: `idle | info | success | error | warning`
- Exports: `AppStateContext`, `AppStateProvider`, `useAppState`, `Actions`, `setStatus`

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

## Logging Pattern (all JS functions)

```js
// 1st line of functional code
console.trace('[functionName] begins');

// checkpoints
console.debug('[functionName] thing =>', value);

// last line before all returns
console.trace('[functionName] ends');
```

---

## Project Artifact Structure
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

### config.json fields
`siteTitle`, `sitePrompt`, `siteDesc`, `currentYear`, `siteUrl`, `author`

### post.json fields
`slug`, `title`, `description`, `date`, `readTime`, `tags`, `pinned`, `pinnedOrder`, `body`

---

## Incremental Build Plan

### Phase 1 — Foundation
- [x] `editor/store/appState.js`
- [x] `editor/main.jsx`
- [x] `editor/App.jsx` (shell with placeholders)
- [x] `editor/css/editor.css`
- [x] `vite.config.js` — project root
- [x] `index.html` — project root
- [x] `package.json` — corrected scripts
- [x] `app/main.js` — dev/prod load fix

**Gate:** `npm run dev` launches Vite on 5173 and Electron loads React shell.

---

### Phase 2 — Topbar
- [ ] `editor/components/Topbar.jsx`
- [ ] Wire into `editor/App.jsx`

**Gate:** Status messages display correctly.

---

### Phase 3 — Sidebar
- [ ] `editor/hooks/useProjects.js`
- [ ] `editor/components/sidebar/ProjectList.jsx`
- [ ] `editor/components/sidebar/ProjectRow.jsx`
- [ ] `editor/components/sidebar/ArticleList.jsx`
- [ ] `editor/components/sidebar/AddProject.jsx`
- [ ] `editor/components/Sidebar.jsx`

**Gate:** Projects load, accordion opens, context menu works, add project works.

---

### Phase 4 — Main view router
- [ ] `editor/components/Main.jsx`
- [ ] `editor/components/views/Welcome.jsx`

**Gate:** Welcome shows on load, switching project shows correct view.

---

### Phase 5 — Site preview
- [ ] `editor/hooks/usePreview.js`
- [ ] `editor/components/views/SitePreview.jsx`

**Gate:** Preview loads on project activate.

---

### Phase 6 — Project config form
- [ ] `editor/hooks/useProjectConfig.js`
- [ ] `editor/components/views/ConfigForm.jsx`

**Gate:** Config form loads, saves, updates sidebar row name.

---

### Phase 7 — Post editor
- [ ] `editor/hooks/usePosts.js`
- [ ] `editor/components/views/PostEditor.jsx`

**Gate:** Posts open, edit, save, preview updates.

---

### Phase 8 — Post settings
- [ ] `editor/components/views/PostSettings.jsx`

**Gate:** Settings form loads and saves.

---

### Phase 9 — App config
- [ ] `editor/hooks/useAppConfig.js`
- [ ] `editor/components/views/AppConfig.jsx`

**Gate:** App config loads, saves, dir picker works.

---

### Phase 10 — Cleanup
- [ ] Delete `app/editor/` entirely
- [ ] Smoke test all views end to end

---

## Working Rules
- Always ask to see relevant files before designing
- Plan before any code — wait for go-ahead
- One file at a time, full file reissued for download
- Never do diffs or merges — always reissue full files
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

**Next step to pick up:** Verify Phase 1 gate — `npm run dev` loads React shell — then begin Phase 2 Topbar.
