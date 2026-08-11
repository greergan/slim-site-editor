'use strict';

// =============================================================
// app-config.js — application configuration
// Manages persistent app-level settings
// Storage: app.getPath('userData')/app-config.json
// =============================================================

const fs   = require('fs');
const path = require('path');

// default app config shape
const DEFAULT = {
    devTools:           false,
    windowWidth:        1400,
    windowHeight:       900,
    defaultProjectDir:  '',
    theme:              'dark',
    autoSave:           false,
    autoSaveDelay:      2000,
    buildOnSave:        false,
    previewPort:        3333
};

// -------------------------------------------------------------
// load — reads app config from disk
// Returns parsed config merged with defaults if file missing/corrupt
// -------------------------------------------------------------
function load(userDataPath) {
    const file = _filePath(userDataPath);
    if (!fs.existsSync(file)) {
        return Object.assign({}, DEFAULT);
    }
    try {
        const raw    = fs.readFileSync(file, 'utf8');
        const parsed = JSON.parse(raw);
        // merge with defaults so missing keys are always present
        return Object.assign({}, DEFAULT, parsed);
    } catch (e) {
        return Object.assign({}, DEFAULT);
    }
}

// -------------------------------------------------------------
// save — writes app config to disk
// Returns { ok: true } or { ok: false, error }
// -------------------------------------------------------------
function save(userDataPath, config) {
    try {
        const file = _filePath(userDataPath);
        fs.writeFileSync(file, JSON.stringify(config, null, 2), 'utf8');
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// -------------------------------------------------------------
// _filePath — internal helper
// -------------------------------------------------------------
function _filePath(userDataPath) {
    return path.join(userDataPath, 'app-config.json');
}

module.exports = { load, save, DEFAULT };
