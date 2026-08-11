'use strict';

import { setStatus }                    from './editor.js';
import { loadProjects, expandProjectRow } from './sidebar.js';
import { showView }                      from './editor-view.js';

// ----------------------------------------------------------
// Config auto-save state
// ----------------------------------------------------------
let _configDir      = null;
let _configDebounce = null;

// ----------------------------------------------------------
// Collapse Add Project section
// ----------------------------------------------------------
function collapseAddProject() {
    console.trace('[collapseAddProject] begins');

    const body   = document.getElementById('add-project-section');
    const header = body.previousElementSibling;

    header.classList.remove('open');
    body.classList.remove('open');

    console.trace('[collapseAddProject] ends');
}

// ----------------------------------------------------------
// Tab switcher
// ----------------------------------------------------------
export function setAddProjectTab(tab) {
    console.trace('[setAddProjectTab] begins');
    console.debug('[setAddProjectTab] tab =>', tab);

    document.querySelectorAll('.ap-tab').forEach(function(btn) {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === tab);
    });

    document.getElementById('ap-form-new').style.display    = tab === 'new'    ? 'flex' : 'none';
    document.getElementById('ap-form-import').style.display = tab === 'import' ? 'flex' : 'none';
    document.getElementById('ap-form-remote').style.display = tab === 'remote' ? 'flex' : 'none';

    if (tab === 'remote') {
        populateRemoteDest();
    }

    console.trace('[setAddProjectTab] ends');
}

// ----------------------------------------------------------
// Populate remote local destination from app data dir
// ----------------------------------------------------------
async function populateRemoteDest() {
    console.trace('[populateRemoteDest] begins');

    // TODO: const dir = await window.api.getAppDataDir();
    // document.getElementById('remote-local-dest').value = dir;
    document.getElementById('remote-local-dest').value = 'stub — IPC not wired yet';

    console.trace('[populateRemoteDest] ends');
}

// ----------------------------------------------------------
// New project
// ----------------------------------------------------------
export async function doNewProject() {
    console.trace('[doNewProject] begins');

    const parentDir =
        document.getElementById('new-project-parent').value.trim();

    const name =
        document.getElementById('new-project-name').value.trim();

    if (!parentDir || !name) {
        console.trace('[doNewProject] ends');
        return;
    }

    const result = await window.api.newProject({ parentDir, name });

    if (!result.ok) {
        window.dispatchEvent(new CustomEvent('app:show-error', { detail: result.error }));
        console.trace('[doNewProject] ends');
        return;
    }

    document.getElementById('new-project-parent').value = '';
    document.getElementById('new-project-name').value   = '';

    setStatus('created: ' + result.dir);

    collapseAddProject();

    await loadProjects();

    expandProjectRow(result.dir);

    console.trace('[doNewProject] ends');
}

// ----------------------------------------------------------
// Import project
// ----------------------------------------------------------
export async function doImport() {
    console.trace('[doImport] begins');

    const dir =
        document.getElementById('import-input').value.trim();

    if (!dir) {
        console.trace('[doImport] ends');
        return;
    }

    const result = await window.api.importProject({ dir });

    if (!result.ok) {
        window.dispatchEvent(new CustomEvent('app:show-error', { detail: result.error }));
        console.trace('[doImport] ends');
        return;
    }

    document.getElementById('import-input').value = '';

    setStatus('imported: ' + result.dir);

    collapseAddProject();

    await loadProjects();

    expandProjectRow(result.dir);

    console.trace('[doImport] ends');
}

// ----------------------------------------------------------
// Remote import
// ----------------------------------------------------------
export async function doRemoteImport() {
    console.trace('[doRemoteImport] begins');

    const repoUrl =
        document.getElementById('remote-repo-url').value.trim();

    const localDest =
        document.getElementById('remote-local-dest').value.trim();

    if (!repoUrl || !localDest) {
        console.trace('[doRemoteImport] ends');
        return;
    }

    // TODO: const result = await window.api.remoteImport({ repoUrl, localDest });
    setStatus('doRemoteImport stub — IPC not wired yet');

    console.trace('[doRemoteImport] ends');
}

// ----------------------------------------------------------
// Open project config — loads config.json, populates form
// ----------------------------------------------------------
export async function openProjectConfig(projectDir) {
    console.trace('[openProjectConfig] begins');
    console.debug('[openProjectConfig] projectDir =>', projectDir);

    _configDir = projectDir;

    const data = await window.api.getConfig({ dir: projectDir });

    if (!data.ok) {
        window.dispatchEvent(new CustomEvent('app:show-error', { detail: data.error }));
        console.trace('[openProjectConfig] ends');
        return;
    }

    const cfg = data.config;

    console.debug('[openProjectConfig] config loaded =>', JSON.stringify(cfg));

    document.getElementById('cfg-siteTitle').value    = cfg.siteTitle    || '';
    document.getElementById('cfg-sitePrompt').value   = cfg.sitePrompt   || '';
    document.getElementById('cfg-siteDesc').value     = cfg.siteDesc     || '';
    document.getElementById('cfg-currentYear').value  = cfg.currentYear  || '';
    document.getElementById('cfg-siteUrl').value      = cfg.siteUrl      || '';
    document.getElementById('cfg-author').value       = cfg.author       || '';

    document.getElementById('config-form-status').textContent = '';

    showView('config-form');

    setStatus('config: ' + projectDir);

    console.trace('[openProjectConfig] ends');
}

// ----------------------------------------------------------
// Config field input — debounced auto-save
// ----------------------------------------------------------
export function onConfigInput() {
    console.trace('[onConfigInput] begins');

    document.getElementById('config-form-status').textContent = 'saving...';

    clearTimeout(_configDebounce);

    _configDebounce = setTimeout(function() {
        saveConfig();
    }, 500);

    console.trace('[onConfigInput] ends');
}

// ----------------------------------------------------------
// Save config to disk via IPC
// ----------------------------------------------------------
async function saveConfig() {
    console.trace('[saveConfig] begins');

    if (!_configDir) {
        console.debug('[saveConfig] no _configDir — skipping');
        console.trace('[saveConfig] ends');
        return;
    }

    const config = {
        siteTitle:   document.getElementById('cfg-siteTitle').value,
        sitePrompt:  document.getElementById('cfg-sitePrompt').value,
        siteDesc:    document.getElementById('cfg-siteDesc').value,
        currentYear: document.getElementById('cfg-currentYear').value,
        siteUrl:     document.getElementById('cfg-siteUrl').value,
        author:      document.getElementById('cfg-author').value,
    };

    console.debug('[saveConfig] saving =>', JSON.stringify(config));

    const result = await window.api.saveConfig({ dir: _configDir, config });

    if (!result.ok) {
        window.dispatchEvent(new CustomEvent('app:show-error', { detail: result.error }));
        console.trace('[saveConfig] ends');
        return;
    }

    document.getElementById('config-form-status').textContent = 'saved';
    setStatus('config saved');

    console.trace('[saveConfig] ends');
}


// ----------------------------------------------------------
// Open post — stub until post editor is wired (item 5)
// ----------------------------------------------------------
export function openPost(dir, slug) {
    console.trace('[openPost] begins');
    console.debug('[openPost] dir =>', dir, 'slug =>', slug);

    // TODO: load post and show post-editor view (item 5)
    setStatus('openPost stub: ' + slug);

    console.trace('[openPost] ends');
}

// ----------------------------------------------------------
// Init — expose functions window needs for inline onclick handlers
// ----------------------------------------------------------
export function initProjects() {
    console.trace('[initProjects] begins');

    window.setAddProjectTab = setAddProjectTab;
    window.doNewProject     = doNewProject;
    window.doImport         = doImport;
    window.doRemoteImport   = doRemoteImport;
    window.onConfigInput    = onConfigInput;

    console.trace('[initProjects] ends');
}
