'use strict';

import { setStatus }        from './editor.js';
import { openProjectConfig, openPost, openPostConfig } from './projects.js';

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
// Load article list into a project's article-list div
// Structure per project:
//   config.json          (same indent as articles)
//   ─ Article Title      (article-item)
//       config           (article-config-item, child of article)
// ----------------------------------------------------------
async function loadArticleList(dir, articleList) {
    console.trace('[loadArticleList] begins');
    console.debug('[loadArticleList] dir =>', dir);

    // project config.json — first item, same indent as articles
    const configItem = document.createElement('div');
    configItem.className   = 'config-nav-item';
    configItem.textContent = 'Site Settings';
    configItem.addEventListener('click', function(event) {
        event.stopPropagation();
        openProjectConfig(dir);
    });
    articleList.appendChild(configItem);

    console.debug('[loadArticleList] config item added');

    const data = await window.api.listPosts({ dir });

    if (!data.ok) {
        console.debug('[loadArticleList] listPosts failed =>', data.error);
        console.trace('[loadArticleList] ends');
        return;
    }

    console.debug('[loadArticleList] posts =>', data.posts.length);

    data.posts.forEach(function (post) {
        // article group wrapper
        const group = document.createElement('div');
        group.className = 'article-group';

        // article title row
        const item = document.createElement('div');
        item.className    = 'article-item';
        item.textContent  = post.title || post.slug;
        item.dataset.slug = post.slug;
        item.dataset.dir  = dir;

        item.addEventListener('click', function (event) {
            event.stopPropagation();

            // deselect all
            document.querySelectorAll('.article-item').forEach(function (el) {
                el.classList.remove('selected');
            });
            document.querySelectorAll('.article-config-item').forEach(function (el) {
                el.classList.remove('selected');
            });

            item.classList.add('selected');

            console.debug('[article-item:click] slug =>', post.slug);

            openPost(dir, post.slug);
        });

        // per-article config child link
        const articleConfig = document.createElement('div');
        articleConfig.className   = 'article-config-item';
        articleConfig.textContent = 'Settings';
        articleConfig.dataset.slug = post.slug;
        articleConfig.dataset.dir  = dir;

        articleConfig.addEventListener('click', function (event) {
            event.stopPropagation();

            document.querySelectorAll('.article-config-item').forEach(function (el) {
                el.classList.remove('selected');
            });

            articleConfig.classList.add('selected');

            console.debug('[article-config-item:click] slug =>', post.slug);

            openPostConfig(dir, post.slug);
        });

        group.appendChild(item);
        group.appendChild(articleConfig);
        articleList.appendChild(group);
    });

    console.trace('[loadArticleList] ends');
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

        // load articles async (config.json item added inside loadArticleList)
        loadArticleList(proj.dir, articleList);

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
        });

        section.appendChild(row);
        section.appendChild(articleList);
    });
}

// ----------------------------------------------------------
// Expand a project row by dir path
// Called after new/import to open the row without user click
// ----------------------------------------------------------
export function expandProjectRow(dir) {
    console.trace('[expandProjectRow] begins');

    const section     = document.getElementById('projects-section');
    const row         = section.querySelector('.project-row[data-dir="' + dir + '"]');
    const articleList = section.querySelector('.article-list[data-dir="' + dir + '"]');

    console.debug('[expandProjectRow] dir =>', dir);

    if (!row || !articleList) {
        console.debug('[expandProjectRow] row or articleList not found — skipping');
        console.trace('[expandProjectRow] ends');
        return;
    }

    row.classList.add('open');
    articleList.classList.add('open');

    console.trace('[expandProjectRow] ends');
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
            // active project highlighted in sidebar list
        }
    }
}

// ----------------------------------------------------------
// updateProjectRowName — updates project row label in place
// Called by projects.js after siteTitle save
// ----------------------------------------------------------
export function updateProjectRowName(dir, name) {
    console.trace('[updateProjectRowName] begins');
    console.debug('[updateProjectRowName] dir =>', dir, 'name =>', name);

    const section = document.getElementById('projects-section');
    const row     = section.querySelector('.project-row[data-dir="' + dir + '"]');

    if (!row) {
        console.debug('[updateProjectRowName] row not found — skipping');
        console.trace('[updateProjectRowName] ends');
        return;
    }

    // row innerHTML: <span><span class="proj-arrow">▶</span>NAME</span><span>⋯</span>
    const labelSpan = row.querySelector(':scope > span:first-child');

    if (!labelSpan) {
        console.debug('[updateProjectRowName] labelSpan not found — skipping');
        console.trace('[updateProjectRowName] ends');
        return;
    }

    const arrow = labelSpan.querySelector('.proj-arrow');
    labelSpan.textContent = '';
    if (arrow) labelSpan.appendChild(arrow);
    labelSpan.appendChild(document.createTextNode(name));

    console.trace('[updateProjectRowName] ends');
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
