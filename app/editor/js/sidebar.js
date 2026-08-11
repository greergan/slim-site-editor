'use strict';

import { setStatus }        from './editor.js';
import { openProjectConfig } from './projects.js';

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

    loadProjects();
}
