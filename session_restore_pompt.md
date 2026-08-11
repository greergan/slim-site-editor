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
  
