'use strict';

import { setStatus }        from './editor.js';
import { openProjectConfig } from './projects.js';

// ----------------------------------------------------------
// Reusable context menu node
// ----------------------------------------------------------
let _ctxMenu = null;
let _ctxDir  = null;

// ----------------------------------------------------------
// Sidebar toggle
// ----------------------------------------------------------
export function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// ----------------------------------------------------------
// Section accordion
// ----------------------------------------------------------
export function toggleSection(header) {
    header.classList.toggle('open');
    header.nextElementSibling.classList.toggle('open');
}

// ----------------------------------------------------------
// Picker rows (new project / import)
// ----------------------------------------------------------
export function togglePickerRow(id) {
    document.getElementById(id).classList.toggle('open');
}

// ----------------------------------------------------------
// Native directory picker — Electron IPC
// Populates target input with chosen path.
// ----------------------------------------------------------
export async function pickDir(targetInputId) {
    const dir = await window.api.pickDirectory();

    if (!dir) {
        return;
    }

    document.getElementById(targetInputId).value = dir;

    // autofill project name from directory basename
    if (targetInputId === 'new-project-parent') {
        const nameInput = document.getElementById('new-project-name');
        if (nameInput && !nameInput.value) {
            nameInput.value = dir.split('/').filter(Boolean).pop();
        }
    }
}

// ----------------------------------------------------------
// Context menu — create once, reuse
// ----------------------------------------------------------
function createContextMenu() {
    const menu = document.createElement('div');

    menu.id = 'project-ctx-menu';
    menu.style.cssText =
        'position:fixed;display:none;z-index:9999;' +
        'background:#1e1e1e;border:1px solid #444;border-radius:4px;' +
        'min-width:100px;box-shadow:0 2px 8px rgba(0,0,0,0.5);';

    const itemDelete  = document.createElement('div');
    const itemArchive = document.createElement('div');

    const itemStyle =
        'padding:6px 14px;font-size:12px;cursor:pointer;color:#ccc;';

    itemDelete.style.cssText  = itemStyle;
    itemArchive.style.cssText = itemStyle;

    itemDelete.textContent  = 'Delete';
    itemArchive.textContent = 'Archive';

    itemDelete.addEventListener('mouseenter', function() {
        itemDelete.style.background = '#2a2d2e';
    });
    itemDelete.addEventListener('mouseleave', function() {
        itemDelete.style.background = '';
    });
    itemArchive.addEventListener('mouseenter', function() {
        itemArchive.style.background = '#2a2d2e';
    });
    itemArchive.addEventListener('mouseleave', function() {
        itemArchive.style.background = '';
    });

    itemDelete.addEventListener('click', function(event) {
        event.stopPropagation();
        if (!_ctxDir) { return; }
        const dir = _ctxDir;
        const ok = confirm('Delete project "' + dir + '"?');
        hideContextMenu();
        if (!ok) { return; }
        window.api.removeProject({ dir: dir }).then(function(result) {
            if (!result.ok) {
                window.dispatchEvent(new CustomEvent('app:show-error', { detail: result.error }));
                return;
            }
            setStatus('deleted: ' + dir);
            loadProjects();
        });
    });

    itemArchive.addEventListener('click', function(event) {
        event.stopPropagation();
        if (!_ctxDir) { return; }
        const dir = _ctxDir;
        hideContextMenu();
        window.api.archiveProject({ dir: dir }).then(function() {
            setStatus('archiveProject stub — IPC not wired yet');
        });
    });

    menu.appendChild(itemDelete);
    menu.appendChild(itemArchive);
    document.body.appendChild(menu);

    return menu;
}

// ----------------------------------------------------------
// Show / hide context menu
// ----------------------------------------------------------
function showContextMenu(anchorEl, dir) {
    if (!_ctxMenu) {
        _ctxMenu = createContextMenu();
    }

    _ctxDir = dir;

    const rect = anchorEl.getBoundingClientRect();

    _ctxMenu.style.top     = (rect.bottom + 4) + 'px';
    _ctxMenu.style.left    = rect.left + 'px';
    _ctxMenu.style.display = 'block';
}

function hideContextMenu() {
    if (_ctxMenu) {
        _ctxMenu.style.display = 'none';
    }
    _ctxDir = null;
}

// ----------------------------------------------------------
// Build project accordion rows into #projects-section
// ----------------------------------------------------------
export function buildProjectAccordion(projects, lastActive) {
    const section = document.getElementById('projects-section');

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

        // project config nav item
        const configItem = document.createElement('div');

        configItem.className = 'config-nav-item';
        configItem.textContent = 'config.json';

        configItem.addEventListener('click', function(event) {
            event.stopPropagation();
            openProjectConfig(proj.dir);
        });

        articleList.appendChild(configItem);

        // ellipsis click — show context menu
        const ellipsis = row.querySelectorAll(':scope > span')[1];

        ellipsis.addEventListener('click', function(event) {
            event.stopPropagation();
            showContextMenu(ellipsis, proj.dir);
        });

        // project row click
        row.addEventListener('click', function() {
            const isOpen = row.classList.toggle('open');

            articleList.classList.toggle('open', isOpen);

            window.api.setActive({ dir: proj.dir });

            document.getElementById('project-name').textContent = proj.name;
        });

        section.appendChild(row);
        section.appendChild(articleList);
    });
}

// ----------------------------------------------------------
// Load projects — calls IPC, builds accordion
// ----------------------------------------------------------
export async function loadProjects() {
    const data = await window.api.listProjects();

    if (!data.ok) {
        window.dispatchEvent(new CustomEvent('app:show-error', { detail: data.error || 'failed to load projects' }));
        return;
    }

    buildProjectAccordion(data.projects, data.lastActive);

    // reflect last active project name in topbar
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
// Init — expose functions window needs for inline onclick handlers
// ----------------------------------------------------------
export function initSidebar() {
    window.toggleSidebar   = toggleSidebar;
    window.toggleSection   = toggleSection;
    window.togglePickerRow = togglePickerRow;
    window.pickDir         = pickDir;

    // dismiss context menu on outside click
    document.addEventListener('click', function() {
        hideContextMenu();
    });

    loadProjects();
}
