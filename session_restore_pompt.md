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

## If you give me files and I complain
- if I complain that something didn't work after you give me updates ask if my disk cache is slow


## Agreed next steps (not yet built, one at a time)
