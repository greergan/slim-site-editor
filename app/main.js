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

        fs.mkdirSync(path.join(projectDir, 'artifacts'), { recursive: true });
        log.debug({func: 'new-project', msg: 'created artifacts/', file: __filename, line: 0});

        fs.mkdirSync(path.join(projectDir, 'artifacts', 'articles'), { recursive: true });
        log.debug({func: 'new-project', msg: 'created artifacts/articles/', file: __filename, line: 0});

        fs.mkdirSync(path.join(projectDir, 'templates'), { recursive: true });
        log.debug({func: 'new-project', msg: 'created templates/', file: __filename, line: 0});

        fs.mkdirSync(path.join(projectDir, 'dist'), { recursive: true });
        log.debug({func: 'new-project', msg: 'created dist/', file: __filename, line: 0});

        // scaffold artifacts/config.json
        const config = {
            name,
            siteTitle:   name,
            siteUrl:     '',
            author:      '',
            currentYear: new Date().getFullYear()
        };
        fs.writeFileSync(
            path.join(projectDir, 'artifacts', 'config.json'),
            JSON.stringify(config, null, 2),
            'utf8'
        );
        log.debug({func: 'new-project', msg: 'wrote artifacts/config.json', file: __filename, line: 0});

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
            name = config.name || path.basename(absDir);
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
// Removes entry from registry by dir
// Returns { ok }
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

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
