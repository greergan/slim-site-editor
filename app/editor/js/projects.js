'use strict';

import { setStatus }   from './editor.js';
import { loadProjects, expandProjectRow } from './sidebar.js';

// ----------------------------------------------------------
// Collapse Add Project section
// ----------------------------------------------------------
function collapseAddProject() {
    const body   = document.getElementById('add-project-section');
    const header = body.previousElementSibling;

    header.classList.remove('open');
    body.classList.remove('open');
}

// ----------------------------------------------------------
// Tab switcher
// ----------------------------------------------------------
export function setAddProjectTab(tab) {
    document.querySelectorAll('.ap-tab').forEach(function(btn) {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === tab);
    });

    document.getElementById('ap-form-new').style.display    = tab === 'new'    ? 'flex' : 'none';
    document.getElementById('ap-form-import').style.display = tab === 'import' ? 'flex' : 'none';
    document.getElementById('ap-form-remote').style.display = tab === 'remote' ? 'flex' : 'none';

    if (tab === 'remote') {
        populateRemoteDest();
    }
}

// ----------------------------------------------------------
// Populate remote local destination from app data dir
// ----------------------------------------------------------
async function populateRemoteDest() {
    // TODO: const dir = await window.api.getAppDataDir();
    // document.getElementById('remote-local-dest').value = dir;
    document.getElementById('remote-local-dest').value = 'stub — IPC not wired yet';
}

// ----------------------------------------------------------
// New project
// ----------------------------------------------------------
export async function doNewProject() {
    const parentDir =
        document.getElementById('new-project-parent').value.trim();

    const name =
        document.getElementById('new-project-name').value.trim();

    if (!parentDir || !name) {
        return;
    }

    const result = await window.api.newProject({ parentDir, name });

    if (!result.ok) {
        window.dispatchEvent(new CustomEvent('app:show-error', { detail: result.error }));
        return;
    }

    document.getElementById('new-project-parent').value = '';
    document.getElementById('new-project-name').value   = '';

    setStatus('created: ' + result.dir);

    collapseAddProject();

    await loadProjects();

    expandProjectRow(result.dir);
}

// ----------------------------------------------------------
// Import project
// ----------------------------------------------------------
export async function doImport() {
    const dir =
        document.getElementById('import-input').value.trim();

    if (!dir) {
        return;
    }

    const result = await window.api.importProject({ dir });

    if (!result.ok) {
        window.dispatchEvent(new CustomEvent('app:show-error', { detail: result.error }));
        return;
    }

    document.getElementById('import-input').value = '';

    setStatus('imported: ' + result.dir);

    collapseAddProject();

    await loadProjects();

    expandProjectRow(result.dir);
}

// ----------------------------------------------------------
// Remote import
// ----------------------------------------------------------
export async function doRemoteImport() {
    const repoUrl =
        document.getElementById('remote-repo-url').value.trim();

    const localDest =
        document.getElementById('remote-local-dest').value.trim();

    if (!repoUrl || !localDest) {
        return;
    }

    // TODO: const result = await window.api.remoteImport({ repoUrl, localDest });
    setStatus('doRemoteImport stub — IPC not wired yet');
}

// ----------------------------------------------------------
// Open project config
// ----------------------------------------------------------
export async function openProjectConfig(projectDir) {
    // TODO: const data = await window.api.getConfig({ dir: projectDir });
    // show raw-editor with data.config
    setStatus('openProjectConfig stub — IPC not wired yet');
}

// ----------------------------------------------------------
// Init — expose functions window needs for inline onclick handlers
// ----------------------------------------------------------
export function initProjects() {
    window.setAddProjectTab = setAddProjectTab;
    window.doNewProject     = doNewProject;
    window.doImport         = doImport;
    window.doRemoteImport   = doRemoteImport;
}
