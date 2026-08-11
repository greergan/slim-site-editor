'use strict';

// =============================================================
// src/registry.js — project registry
// Manages persistent list of known projects and last-active
// Storage: app.getPath('userData')/projects.json
// =============================================================

const fs   = require('fs');
const path = require('path');

// default registry shape
const DEFAULT = { lastActive: null, projects: [] };

// -------------------------------------------------------------
// load — reads registry from disk
// Returns parsed registry or default if file missing/corrupt
// -------------------------------------------------------------
function load(userDataPath) {
    const file = _filePath(userDataPath);
    if (!fs.existsSync(file)) {
        return Object.assign({}, DEFAULT, { projects: [] });
    }
    try {
        const raw = fs.readFileSync(file, 'utf8');
        const parsed = JSON.parse(raw);
        // ensure required keys exist
        if (!Array.isArray(parsed.projects)) parsed.projects = [];
        if (!('lastActive' in parsed)) parsed.lastActive = null;
        return parsed;
    } catch (e) {
        return Object.assign({}, DEFAULT, { projects: [] });
    }
}

// -------------------------------------------------------------
// save — writes registry to disk
// Returns { ok: true } or { ok: false, error }
// -------------------------------------------------------------
function save(userDataPath, reg) {
    try {
        const file = _filePath(userDataPath);
        fs.writeFileSync(file, JSON.stringify(reg, null, 2), 'utf8');
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// -------------------------------------------------------------
// addProject — adds entry, deduplicates by dir
// Mutates and returns reg
// -------------------------------------------------------------
function addProject(reg, { name, dir }) {
    // remove existing entry for same dir if present
    reg.projects = reg.projects.filter(function (p) { return p.dir !== dir; });
    reg.projects.push({ name, dir });
    return reg;
}

// -------------------------------------------------------------
// removeProject — removes entry by dir
// Mutates and returns reg
// -------------------------------------------------------------
function removeProject(reg, dir) {
    reg.projects = reg.projects.filter(function (p) { return p.dir !== dir; });
    if (reg.lastActive === dir) reg.lastActive = null;
    return reg;
}

// -------------------------------------------------------------
// setLastActive — sets lastActive dir
// Mutates and returns reg
// -------------------------------------------------------------
function setLastActive(reg, dir) {
    reg.lastActive = dir;
    return reg;
}

// -------------------------------------------------------------
// _filePath — internal helper
// -------------------------------------------------------------
function _filePath(userDataPath) {
    return path.join(userDataPath, 'projects.json');
}

module.exports = { load, save, addProject, removeProject, setLastActive };
