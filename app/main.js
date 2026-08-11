'use strict';

// =============================================================
// main.js — Electron main process (scaffold)
// Opens editor.html in a BrowserWindow
// IPC handlers to be wired in next phase
// =============================================================

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path      = require('path');
const fs        = require('fs');
const registry  = require('./registry');
const appConfig = require('./app-config');
//const log = require('./src/log');
const log = console;

if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
        electron: require('path').join(__dirname, '..', 'node_modules', '.bin', 'electron'),
        ignored:  /quill|node_modules|\.map$/
    });
}

// -------------------------------------------------------------
// Scaffold source — bundled defaults copied into every new project
// -------------------------------------------------------------
const SCAFFOLD_DIR = path.join(__dirname, 'scaffold');

function createWindow() {
    const cfg = appConfig.load(app.getPath('userData'));

    const win = new BrowserWindow({
        width:  cfg.windowWidth,
        height: cfg.windowHeight,
        webPreferences: {
            preload:          path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration:  false
        }
    });

    win.loadFile(path.join(__dirname, 'editor/index.html'));

    // open devtools if enabled in app config
    if (cfg.devTools) win.webContents.openDevTools();
}

// -------------------------------------------------------------
// IPC — app-name
// Returns description from package.json
// Checks same dir as main.js, then one directory lower
// Throws if neither is found
// -------------------------------------------------------------
ipcMain.handle('app-name', async function (event) {
    try {
        const here  = path.join(__dirname, 'package.json');
        const upper = path.join(__dirname, '..', 'package.json');

        if (fs.existsSync(here))  return require(here).description;
        if (fs.existsSync(upper)) return require(upper).description;

        throw new Error('package.json not found in ' + __dirname + ' or ' + path.dirname(upper));
    } catch (e) {
        log.debug({func: 'app-name', msg: `error => ${e.message}`, file: __filename, line: 0});
        throw e;
    }
});

// -------------------------------------------------------------
// IPC — pick-directory
// Opens native OS directory picker
// Returns selected path string or null if cancelled
// -------------------------------------------------------------
ipcMain.handle('pick-directory', async function (event) {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory']
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        return result.filePaths[0];
    } catch (e) {
        log.debug({func: 'pick-directory', msg: `error => ${e.message}`, file: __filename, line: 0});
        return null;
    }
});

// -------------------------------------------------------------
// IPC — list-projects
// Returns registry contents: { ok, projects, lastActive }
// -------------------------------------------------------------
ipcMain.handle('list-projects', async function (event) {
    log.trace({func: 'list-projects', msg: 'begins', file: __filename, line: 0});

    try {
        const reg = registry.load(app.getPath('userData'));

        log.debug({func: 'list-projects', msg: `found ${reg.projects.length} project(s)`, file: __filename, line: 0});
        log.debug({func: 'list-projects', msg: `lastActive => ${reg.lastActive}`, file: __filename, line: 0});
        log.trace({func: 'list-projects', msg: 'ends', file: __filename, line: 0});

        return { ok: true, projects: reg.projects, lastActive: reg.lastActive };
    } catch (e) {
        log.debug({func: 'list-projects', msg: `error => ${e.message}`, file: __filename, line: 0});
        log.trace({func: 'list-projects', msg: 'ends', file: __filename, line: 0});
        return { ok: false, error: e.message, projects: [], lastActive: null };
    }
});

// -------------------------------------------------------------
// IPC — new-project
// Scaffolds a new project directory structure
// Copies bundled scaffold files into place
// Writes config.json and default first article
// Adds to registry and sets as last active
// Returns { ok, dir } or { ok, error }
// -------------------------------------------------------------
ipcMain.handle('new-project', async function (event, { parentDir, name }) {
    log.trace({func: 'new-project', msg: 'begins', file: __filename, line: 0});
    log.debug({func: 'new-project', msg: `parentDir => ${parentDir}, name => ${name}`, file: __filename, line: 0});

    try {
        if (!parentDir || !name) {
            log.debug({func: 'new-project', msg: 'missing parentDir or name', file: __filename, line: 0});
            log.trace({func: 'new-project', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'parentDir and name are required' };
        }

        const absParent = path.resolve(parentDir);

        if (!fs.existsSync(absParent)) {
            log.debug({func: 'new-project', msg: `parentDir not found => ${absParent}`, file: __filename, line: 0});
            log.trace({func: 'new-project', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'parentDir not found: ' + absParent };
        }

        // scaffold directly inside parentDir
        const projectDir = absParent;
        log.debug({func: 'new-project', msg: `project dir => ${projectDir}`, file: __filename, line: 0});

        // create directory structure
        fs.mkdirSync(path.join(projectDir, 'artifacts', 'articles'), { recursive: true });
        log.debug({func: 'new-project', msg: 'created artifacts/articles/', file: __filename, line: 0});

        fs.mkdirSync(path.join(projectDir, 'artifacts', 'assets'), { recursive: true });
        log.debug({func: 'new-project', msg: 'created artifacts/assets/', file: __filename, line: 0});

        fs.mkdirSync(path.join(projectDir, 'artifacts', 'templates'), { recursive: true });
        log.debug({func: 'new-project', msg: 'created artifacts/templates/', file: __filename, line: 0});

        fs.mkdirSync(path.join(projectDir, 'dist'), { recursive: true });
        log.debug({func: 'new-project', msg: 'created dist/', file: __filename, line: 0});

        // copy scaffold assets
        const scaffoldAssets = path.join(SCAFFOLD_DIR, 'artifacts', 'assets');
        fs.readdirSync(scaffoldAssets).forEach(function (file) {
            fs.copyFileSync(
                path.join(scaffoldAssets, file),
                path.join(projectDir, 'artifacts', 'assets', file)
            );
            log.debug({func: 'new-project', msg: `copied assets/${file}`, file: __filename, line: 0});
        });

        // copy scaffold templates
        const scaffoldTemplates = path.join(SCAFFOLD_DIR, 'artifacts', 'templates');
        fs.readdirSync(scaffoldTemplates).forEach(function (file) {
            fs.copyFileSync(
                path.join(scaffoldTemplates, file),
                path.join(projectDir, 'artifacts', 'templates', file)
            );
            log.debug({func: 'new-project', msg: `copied templates/${file}`, file: __filename, line: 0});
        });

        // write artifacts/config.json with defaults
        const config = {
            siteTitle:   'My Site',
            sitePrompt:  'user@site',
            siteDesc:    'A new site',
            currentYear: String(new Date().getFullYear()),
            siteUrl:     'https://example.com',
            author:      'author'
        };
        fs.writeFileSync(
            path.join(projectDir, 'artifacts', 'config.json'),
            JSON.stringify(config, null, 2),
            'utf8'
        );
        log.debug({func: 'new-project', msg: 'wrote artifacts/config.json', file: __filename, line: 0});

        // write default first article
        const firstArticleDir = path.join(projectDir, 'artifacts', 'articles', 'my-first-post');
        fs.mkdirSync(firstArticleDir, { recursive: true });
        const firstArticle = {
            slug:        'my-first-post',
            title:       'The Light on Rue Cler',
            description: 'A Tuesday morning in Paris that tasted like butter and went sideways by noon.',
            date:        new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            readTime:    '3 min read',
            tags:        ['travel', 'food', 'paris'],
            pinned:      true,
            pinnedOrder: 1,
            body:        '<p>The bakery on Rue Cler opens at seven, but the smell reaches the corner by six-thirty. I had been awake since five, jet-lagged and restless, watching the street lights go amber in the rain.</p><p>I ordered a croissant and a <em>caf\u00e9 serr\u00e9</em> and sat at the only table not folded against the wall. The woman behind the counter did not smile, which felt correct. This was not a place for tourists, even if tourists were the only ones sitting down.</p><h2>The Market</h2><p>By nine the street had filled. Vendors in rubber aprons arranged tomatoes by size. A man argued quietly with a cheese seller, gesturing at a wedge of something orange and ancient. Nobody was in a hurry. Everybody had somewhere to be.</p><p>I bought three things I could not name and ate two of them standing up. The third I carried in a paper bag until it went soft in the heat.</p><h2>How It Went Sideways</h2><p>The metro was closed for works. My map was a day old. I ended up in the 15th arrondissement, which is not where I intended to be, but where I found a lunch counter serving <em>pot-au-feu</em> for nine euros and a carafe of something red that tasted like it had been stored in someone\'s garage since 2019.</p><p>It was, without question, the best meal of the trip.</p><p>More cities soon.</p>'
        };
        fs.writeFileSync(
            path.join(firstArticleDir, 'post.json'),
            JSON.stringify(firstArticle, null, 2),
            'utf8'
        );
        log.debug({func: 'new-project', msg: 'wrote artifacts/articles/my-first-post/post.json', file: __filename, line: 0});

        // update registry
        const reg = registry.load(app.getPath('userData'));
        registry.addProject(reg, { name, dir: projectDir });
        registry.setLastActive(reg, projectDir);
        const saved = registry.save(app.getPath('userData'), reg);
        if (!saved.ok) {
            log.debug({func: 'new-project', msg: `registry save failed => ${saved.error}`, file: __filename, line: 0});
        }
        log.debug({func: 'new-project', msg: 'registry updated', file: __filename, line: 0});

        log.trace({func: 'new-project', msg: 'ends', file: __filename, line: 0});
        return { ok: true, dir: projectDir };
    } catch (e) {
        log.debug({func: 'new-project', msg: `error => ${e.message}`, file: __filename, line: 0});
        log.trace({func: 'new-project', msg: 'ends', file: __filename, line: 0});
        return { ok: false, error: e.message };
    }
});

// -------------------------------------------------------------
// IPC — import-project
// Validates dir contains artifacts/config.json
// Reads name from config, adds to registry
// Returns { ok, name, dir } or { ok, error }
// -------------------------------------------------------------
ipcMain.handle('import-project', async function (event, { dir }) {
    log.trace({func: 'import-project', msg: 'begins', file: __filename, line: 0});
    log.debug({func: 'import-project', msg: `dir => ${dir}`, file: __filename, line: 0});

    try {
        if (!dir) {
            log.debug({func: 'import-project', msg: 'missing dir', file: __filename, line: 0});
            log.trace({func: 'import-project', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'dir is required' };
        }

        const absDir     = path.resolve(dir);
        const configFile = path.join(absDir, 'artifacts', 'config.json');

        if (!fs.existsSync(absDir)) {
            log.debug({func: 'import-project', msg: `dir not found => ${absDir}`, file: __filename, line: 0});
            log.trace({func: 'import-project', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'directory not found: ' + absDir };
        }

        if (!fs.existsSync(configFile)) {
            log.debug({func: 'import-project', msg: `config not found => ${configFile}`, file: __filename, line: 0});
            log.trace({func: 'import-project', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'not a valid project (missing artifacts/config.json)' };
        }

        // read name from config
        let name;
        try {
            const raw    = fs.readFileSync(configFile, 'utf8');
            const config = JSON.parse(raw);
            name = config.siteTitle || path.basename(absDir);
        } catch (e) {
            log.debug({func: 'import-project', msg: `config parse error => ${e.message}`, file: __filename, line: 0});
            name = path.basename(absDir);
        }

        log.debug({func: 'import-project', msg: `name => ${name}`, file: __filename, line: 0});

        // update registry
        const reg = registry.load(app.getPath('userData'));
        registry.addProject(reg, { name, dir: absDir });
        const saved = registry.save(app.getPath('userData'), reg);
        if (!saved.ok) {
            log.debug({func: 'import-project', msg: `registry save failed => ${saved.error}`, file: __filename, line: 0});
        }
        log.debug({func: 'import-project', msg: 'registry updated', file: __filename, line: 0});

        log.trace({func: 'import-project', msg: 'ends', file: __filename, line: 0});
        return { ok: true, name, dir: absDir };
    } catch (e) {
        log.debug({func: 'import-project', msg: `error => ${e.message}`, file: __filename, line: 0});
        log.trace({func: 'import-project', msg: 'ends', file: __filename, line: 0});
        return { ok: false, error: e.message };
    }
});

// -------------------------------------------------------------
// IPC — set-active-project
// Sets lastActive in registry
// Returns { ok }
// -------------------------------------------------------------
ipcMain.handle('set-active-project', async function (event, { dir }) {
    log.trace({func: 'set-active-project', msg: 'begins', file: __filename, line: 0});
    log.debug({func: 'set-active-project', msg: `dir => ${dir}`, file: __filename, line: 0});

    try {
        const reg = registry.load(app.getPath('userData'));
        registry.setLastActive(reg, dir);
        const saved = registry.save(app.getPath('userData'), reg);
        if (!saved.ok) {
            log.debug({func: 'set-active-project', msg: `registry save failed => ${saved.error}`, file: __filename, line: 0});
        }

        log.debug({func: 'set-active-project', msg: 'registry updated', file: __filename, line: 0});
        log.trace({func: 'set-active-project', msg: 'ends', file: __filename, line: 0});

        return { ok: true };
    } catch (e) {
        log.debug({func: 'set-active-project', msg: `error => ${e.message}`, file: __filename, line: 0});
        log.trace({func: 'set-active-project', msg: 'ends', file: __filename, line: 0});
        return { ok: false, error: e.message };
    }
});

// -------------------------------------------------------------
// IPC — remove-project
// Deletes project directory from disk, removes entry from registry
// Returns { ok } or { ok, error }
// -------------------------------------------------------------
ipcMain.handle('remove-project', async function (event, { dir }) {
    log.trace({func: 'remove-project', msg: 'begins', file: __filename, line: 0});
    log.debug({func: 'remove-project', msg: `dir => ${dir}`, file: __filename, line: 0});

    try {
        if (!dir) {
            log.debug({func: 'remove-project', msg: 'missing dir', file: __filename, line: 0});
            log.trace({func: 'remove-project', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'dir is required' };
        }

        const absDir = path.resolve(dir);

        if (fs.existsSync(absDir)) {
            fs.rmSync(absDir, { recursive: true, force: true });
            log.debug({func: 'remove-project', msg: `directory deleted => ${absDir}`, file: __filename, line: 0});
        } else {
            log.debug({func: 'remove-project', msg: `directory not found on disk, skipping delete => ${absDir}`, file: __filename, line: 0});
        }

        const reg = registry.load(app.getPath('userData'));
        registry.removeProject(reg, dir);
        const saved = registry.save(app.getPath('userData'), reg);
        if (!saved.ok) {
            log.debug({func: 'remove-project', msg: `registry save failed => ${saved.error}`, file: __filename, line: 0});
        }

        log.debug({func: 'remove-project', msg: 'registry updated', file: __filename, line: 0});
        log.trace({func: 'remove-project', msg: 'ends', file: __filename, line: 0});

        return { ok: true };
    } catch (e) {
        log.debug({func: 'remove-project', msg: `error => ${e.message}`, file: __filename, line: 0});
        log.trace({func: 'remove-project', msg: 'ends', file: __filename, line: 0});
        return { ok: false, error: e.message };
    }
});

// -------------------------------------------------------------
// IPC — archive-project
// Stub — to be wired in next phase
// Returns { ok }
// -------------------------------------------------------------
ipcMain.handle('archive-project', async function (event, { dir }) {
    log.trace({func: 'archive-project', msg: 'begins', file: __filename, line: 0});
    log.debug({func: 'archive-project', msg: `dir => ${dir}`, file: __filename, line: 0});
    log.debug({func: 'archive-project', msg: 'stub — IPC not wired yet', file: __filename, line: 0});
    log.trace({func: 'archive-project', msg: 'ends', file: __filename, line: 0});

    return { ok: true };
});

// -------------------------------------------------------------
// IPC — get-app-config
// Returns current app config: { ok, config }
// -------------------------------------------------------------
ipcMain.handle('get-app-config', async function (event) {
    log.trace({func: 'get-app-config', msg: 'begins', file: __filename, line: 0});

    try {
        const config = appConfig.load(app.getPath('userData'));

        log.debug({func: 'get-app-config', msg: 'config loaded', file: __filename, line: 0});
        log.trace({func: 'get-app-config', msg: 'ends', file: __filename, line: 0});

        return { ok: true, config };
    } catch (e) {
        log.debug({func: 'get-app-config', msg: `error => ${e.message}`, file: __filename, line: 0});
        log.trace({func: 'get-app-config', msg: 'ends', file: __filename, line: 0});
        return { ok: false, error: e.message };
    }
});

// -------------------------------------------------------------
// IPC — save-app-config
// Persists app config to disk
// Returns { ok } or { ok, error }
// -------------------------------------------------------------
ipcMain.handle('save-app-config', async function (event, config) {
    log.trace({func: 'save-app-config', msg: 'begins', file: __filename, line: 0});
    log.debug({func: 'save-app-config', msg: `config => ${JSON.stringify(config)}`, file: __filename, line: 0});

    try {
        const saved = appConfig.save(app.getPath('userData'), config);
        if (!saved.ok) {
            log.debug({func: 'save-app-config', msg: `save failed => ${saved.error}`, file: __filename, line: 0});
            log.trace({func: 'save-app-config', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: saved.error };
        }

        log.debug({func: 'save-app-config', msg: 'config saved', file: __filename, line: 0});
        log.trace({func: 'save-app-config', msg: 'ends', file: __filename, line: 0});

        return { ok: true };
    } catch (e) {
        log.debug({func: 'save-app-config', msg: `error => ${e.message}`, file: __filename, line: 0});
        log.trace({func: 'save-app-config', msg: 'ends', file: __filename, line: 0});
        return { ok: false, error: e.message };
    }
});

// -------------------------------------------------------------
// IPC — get-config
// Reads artifacts/config.json from project dir
// Returns { ok, config } or { ok, error }
// -------------------------------------------------------------
ipcMain.handle('get-config', async function (event, { dir }) {
    log.trace({func: 'get-config', msg: 'begins', file: __filename, line: 0});
    log.debug({func: 'get-config', msg: `dir => ${dir}`, file: __filename, line: 0});

    try {
        if (!dir) {
            log.debug({func: 'get-config', msg: 'missing dir', file: __filename, line: 0});
            log.trace({func: 'get-config', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'dir is required' };
        }

        const configFile = path.join(path.resolve(dir), 'artifacts', 'config.json');

        if (!fs.existsSync(configFile)) {
            log.debug({func: 'get-config', msg: `config not found => ${configFile}`, file: __filename, line: 0});
            log.trace({func: 'get-config', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'config.json not found: ' + configFile };
        }

        const raw    = fs.readFileSync(configFile, 'utf8');
        const config = JSON.parse(raw);

        log.debug({func: 'get-config', msg: 'config loaded', file: __filename, line: 0});
        log.trace({func: 'get-config', msg: 'ends', file: __filename, line: 0});

        return { ok: true, config };
    } catch (e) {
        log.debug({func: 'get-config', msg: `error => ${e.message}`, file: __filename, line: 0});
        log.trace({func: 'get-config', msg: 'ends', file: __filename, line: 0});
        return { ok: false, error: e.message };
    }
});

// -------------------------------------------------------------
// IPC — save-config
// Writes artifacts/config.json to project dir
// Returns { ok } or { ok, error }
// -------------------------------------------------------------
ipcMain.handle('save-config', async function (event, { dir, config }) {
    log.trace({func: 'save-config', msg: 'begins', file: __filename, line: 0});
    log.debug({func: 'save-config', msg: `dir => ${dir}`, file: __filename, line: 0});

    try {
        if (!dir || !config) {
            log.debug({func: 'save-config', msg: 'missing dir or config', file: __filename, line: 0});
            log.trace({func: 'save-config', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'dir and config are required' };
        }

        const configFile = path.join(path.resolve(dir), 'artifacts', 'config.json');

        fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');

        log.debug({func: 'save-config', msg: 'config saved', file: __filename, line: 0});
        log.trace({func: 'save-config', msg: 'ends', file: __filename, line: 0});

        return { ok: true };
    } catch (e) {
        log.debug({func: 'save-config', msg: `error => ${e.message}`, file: __filename, line: 0});
        log.trace({func: 'save-config', msg: 'ends', file: __filename, line: 0});
        return { ok: false, error: e.message };
    }
});

// -------------------------------------------------------------
// IPC — list-posts
// Reads artifacts/articles/ dir, returns slug + title per post
// Returns { ok, posts } or { ok, error }
// -------------------------------------------------------------
ipcMain.handle('list-posts', async function (event, { dir }) {
    log.trace({func: 'list-posts', msg: 'begins', file: __filename, line: 0});
    log.debug({func: 'list-posts', msg: `dir => ${dir}`, file: __filename, line: 0});

    try {
        if (!dir) {
            log.debug({func: 'list-posts', msg: 'missing dir', file: __filename, line: 0});
            log.trace({func: 'list-posts', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'dir is required' };
        }

        const articlesDir = path.join(path.resolve(dir), 'artifacts', 'articles');

        if (!fs.existsSync(articlesDir)) {
            log.debug({func: 'list-posts', msg: `articles dir not found => ${articlesDir}`, file: __filename, line: 0});
            log.trace({func: 'list-posts', msg: 'ends', file: __filename, line: 0});
            return { ok: true, posts: [] };
        }

        const slugs = fs.readdirSync(articlesDir).filter(function (entry) {
            return fs.statSync(path.join(articlesDir, entry)).isDirectory();
        });

        log.debug({func: 'list-posts', msg: `found ${slugs.length} article(s)`, file: __filename, line: 0});

        const posts = slugs.map(function (slug) {
            const postFile = path.join(articlesDir, slug, 'post.json');
            let title = slug;

            if (fs.existsSync(postFile)) {
                try {
                    const raw  = fs.readFileSync(postFile, 'utf8');
                    const post = JSON.parse(raw);
                    title = post.title || slug;
                } catch (e) {
                    log.debug({func: 'list-posts', msg: `parse error for ${slug} => ${e.message}`, file: __filename, line: 0});
                }
            }

            return { slug, title };
        });

        log.trace({func: 'list-posts', msg: 'ends', file: __filename, line: 0});
        return { ok: true, posts };
    } catch (e) {
        log.debug({func: 'list-posts', msg: `error => ${e.message}`, file: __filename, line: 0});
        log.trace({func: 'list-posts', msg: 'ends', file: __filename, line: 0});
        return { ok: false, error: e.message };
    }
});

// -------------------------------------------------------------
// IPC — get-post
// Reads artifacts/articles/<slug>/post.json from project dir
// Returns { ok, post } or { ok, error }
// -------------------------------------------------------------
ipcMain.handle('get-post', async function (event, { dir, slug }) {
    log.trace({func: 'get-post', msg: 'begins', file: __filename, line: 0});
    log.debug({func: 'get-post', msg: `dir => ${dir}, slug => ${slug}`, file: __filename, line: 0});

    try {
        if (!dir || !slug) {
            log.debug({func: 'get-post', msg: 'missing dir or slug', file: __filename, line: 0});
            log.trace({func: 'get-post', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'dir and slug are required' };
        }

        const postFile = path.join(path.resolve(dir), 'artifacts', 'articles', slug, 'post.json');

        if (!fs.existsSync(postFile)) {
            log.debug({func: 'get-post', msg: `post not found => ${postFile}`, file: __filename, line: 0});
            log.trace({func: 'get-post', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'post.json not found: ' + postFile };
        }

        const raw  = fs.readFileSync(postFile, 'utf8');
        const post = JSON.parse(raw);

        log.debug({func: 'get-post', msg: `post loaded => ${slug}`, file: __filename, line: 0});
        log.trace({func: 'get-post', msg: 'ends', file: __filename, line: 0});

        return { ok: true, post };
    } catch (e) {
        log.debug({func: 'get-post', msg: `error => ${e.message}`, file: __filename, line: 0});
        log.trace({func: 'get-post', msg: 'ends', file: __filename, line: 0});
        return { ok: false, error: e.message };
    }
});

// -------------------------------------------------------------
// IPC — save-post
// Writes artifacts/articles/<slug>/post.json to project dir
// Returns { ok } or { ok, error }
// -------------------------------------------------------------
ipcMain.handle('save-post', async function (event, { dir, slug, post }) {
    log.trace({func: 'save-post', msg: 'begins', file: __filename, line: 0});
    log.debug({func: 'save-post', msg: `dir => ${dir}, slug => ${slug}`, file: __filename, line: 0});

    try {
        if (!dir || !slug || !post) {
            log.debug({func: 'save-post', msg: 'missing dir, slug, or post', file: __filename, line: 0});
            log.trace({func: 'save-post', msg: 'ends', file: __filename, line: 0});
            return { ok: false, error: 'dir, slug, and post are required' };
        }

        const postDir  = path.join(path.resolve(dir), 'artifacts', 'articles', slug);
        const postFile = path.join(postDir, 'post.json');

        fs.mkdirSync(postDir, { recursive: true });
        fs.writeFileSync(postFile, JSON.stringify(post, null, 2), 'utf8');

        log.debug({func: 'save-post', msg: `post saved => ${slug}`, file: __filename, line: 0});
        log.trace({func: 'save-post', msg: 'ends', file: __filename, line: 0});

        return { ok: true };
    } catch (e) {
        log.debug({func: 'save-post', msg: `error => ${e.message}`, file: __filename, line: 0});
        log.trace({func: 'save-post', msg: 'ends', file: __filename, line: 0});
        return { ok: false, error: e.message };
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
