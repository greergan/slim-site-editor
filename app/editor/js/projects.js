'use strict';

import { setStatus } from './editor.js';
import { loadProjects } from './sidebar.js';

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

    document.getElementById('new-project-row').classList.remove('open');

    setStatus('created: ' + result.dir);

    await loadProjects();
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

    document.getElementById('import-row').classList.remove('open');

    setStatus('imported: ' + result.dir);

    await loadProjects();
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
    window.doNewProject = doNewProject;
    window.doImport     = doImport;
}
