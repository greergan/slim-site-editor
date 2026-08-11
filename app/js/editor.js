'use strict';

// ----------------------------------------------------------
// View mode: 'edit' | 'split' | 'preview'
// ----------------------------------------------------------
let _viewMode = 'split';

function setViewMode(mode) {
    _viewMode = mode;

    const wa = document.getElementById('work-area');
    wa.className = 'mode-' + mode;

    document.querySelectorAll('.view-btn').forEach(function(b) {
        b.classList.toggle('active', b.id === 'vbtn-' + mode);
    });
}

// ----------------------------------------------------------
// Sidebar toggle
// ----------------------------------------------------------
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// ----------------------------------------------------------
// Section accordion
// ----------------------------------------------------------
function toggleSection(header) {
    header.classList.toggle('open');
    header.nextElementSibling.classList.toggle('open');
}

// ----------------------------------------------------------
// Picker rows (new project / import)
// ----------------------------------------------------------
function togglePickerRow(id) {
    document.getElementById(id).classList.toggle('open');
}

// ----------------------------------------------------------
// Native directory picker — Electron IPC
// Populates target input with chosen path.
// ----------------------------------------------------------
async function pickDir(targetInputId) {
    const dir = await window.api.pickDirectory();

    if (!dir) {
        return;
    }

    document.getElementById(targetInputId).value = dir;
}

// ----------------------------------------------------------
// Error modal
// ----------------------------------------------------------
function showError(msg) {
    document.getElementById('error-modal-msg').textContent = msg;
    document.getElementById('error-modal-overlay').classList.add('visible');
}

function hideError() {
    document.getElementById('error-modal-overlay').classList.remove('visible');
    document.getElementById('error-modal-msg').textContent = '';
}

// ----------------------------------------------------------
// Build project accordion rows into #projects-section
// Inserts before the "+ New Project" button
// ----------------------------------------------------------
function buildProjectAccordion(projects, lastActive) {
    const section = document.getElementById('projects-section');
    const newBtn = section.querySelector('.sidebar-action.top-level');

    // remove previously injected rows
    section.querySelectorAll('.project-row, .article-list').forEach(function(el) {
        el.remove();
    });

    if (!projects || projects.length === 0) {
        return;
    }

    projects.forEach(function(proj) {
        // project row
        const row = document.createElement('div');

        row.className =
            'project-row' +
            (proj.dir === lastActive ? ' active-project' : '');

        row.dataset.dir = proj.dir;

        row.innerHTML =
            '<span><span class="proj-arrow">&#9658;</span>' +
            proj.name +
            '</span>' +
            '<span style="font-size:10px;color:#555;" title="' +
            proj.dir +
            '">&#8943;</span>';

        // child list for project
        const articleList = document.createElement('div');

        articleList.className = 'article-list';
        articleList.dataset.dir = proj.dir;

        // project config
        const configItem = document.createElement('div');

        configItem.className = 'config-nav-item';
        configItem.textContent = 'config.json';

        configItem.addEventListener('click', function(event) {
            event.stopPropagation();
            openProjectConfig(proj.dir);
        });

        articleList.appendChild(configItem);

        // project row click
        row.addEventListener('click', function() {
            const isOpen = row.classList.toggle('open');

            articleList.classList.toggle('open', isOpen);

            window.api.setActive({
                dir: proj.dir
            });

            document.getElementById('project-name').textContent = proj.name;
        });

        section.insertBefore(row, newBtn);
        section.insertBefore(articleList, newBtn);
    });
}

// ----------------------------------------------------------
// Load projects — calls IPC, builds accordion
// ----------------------------------------------------------
async function loadProjects() {
    const data = await window.api.listProjects();

    if (!data.ok) {
        showError(data.error || 'failed to load projects');
        return;
    }

    buildProjectAccordion(data.projects, data.lastActive);

    // if a lastActive project exists, reflect its name in the topbar
    if (data.lastActive) {
        const active = data.projects.find(function(p) {
            return p.dir === data.lastActive;
        });

        if (active) {
            document.getElementById('project-name').textContent = active.name;
        }
    }
}

// ----------------------------------------------------------
// New project
// ----------------------------------------------------------
async function doNewProject() {
    const parentDir =
        document.getElementById('new-project-parent').value.trim();

    const name =
        document.getElementById('new-project-name').value.trim();

    if (!parentDir || !name) {
        return;
    }

    const result = await window.api.newProject({
        parentDir,
        name
    });

    if (!result.ok) {
        showError(result.error);
        return;
    }

    document.getElementById('new-project-parent').value = '';
    document.getElementById('new-project-name').value = '';

    document
        .getElementById('new-project-row')
        .classList.remove('open');

    setStatus('created: ' + result.dir);

    await loadProjects();
}

// ----------------------------------------------------------
// Import project
// ----------------------------------------------------------
async function doImport() {
    const dir =
        document.getElementById('import-input').value.trim();

    if (!dir) {
        return;
    }

    const result = await window.api.importProject({
        dir
    });

    if (!result.ok) {
        showError(result.error);
        return;
    }

    document.getElementById('import-input').value = '';

    document
        .getElementById('import-row')
        .classList.remove('open');

    setStatus('imported: ' + result.dir);

    await loadProjects();
}

// ----------------------------------------------------------
// Open project config
// ----------------------------------------------------------
async function openProjectConfig(projectDir) {
    // TODO: const data = await window.api.getConfig({ dir: projectDir });
    // show raw-editor with data.config
    setStatus('openProjectConfig stub — IPC not wired yet');
}

// ----------------------------------------------------------
// Save
// ----------------------------------------------------------
async function doSave() {
    // TODO: await window.api.savePost({
    //     slug: _currentSlug,
    //     post: currentPost()
    // });

    setSaveStatus('saved');
    setStatus('doSave stub — IPC not wired yet');
}

// ----------------------------------------------------------
// Build
// ----------------------------------------------------------
async function doBuild() {
    // TODO: await window.api.triggerBuild();
    setStatus('doBuild stub — IPC not wired yet');
}

// ----------------------------------------------------------
// Live preview — fires on every body keystroke
// ----------------------------------------------------------
function onBodyInput() {
    const html =
        document.getElementById('body-editor').value;

    document.getElementById('preview-content').innerHTML = html;
}

// ----------------------------------------------------------
// Meta field change
// ----------------------------------------------------------
function onMetaChange() {
    // marks post dirty — save button enable logic goes here
}

// ----------------------------------------------------------
// Status helpers
// ----------------------------------------------------------
function setStatus(msg) {
    document.getElementById('status').textContent = msg;
}

function setSaveStatus(msg) {
    document.getElementById('save-status').textContent = msg;
}

// ----------------------------------------------------------
// Init
// ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', async function() {
    // show work-area and view-bar only when a post is open
    document.getElementById('work-area').classList.remove('visible');
    document.getElementById('view-bar').classList.remove('visible');

    // set app name from package.json
    const name = await window.api.appName();

    document.title = name;
    document.getElementById('app-name').textContent = name;

    await loadProjects();
});
