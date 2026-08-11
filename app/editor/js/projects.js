'use strict';

import { setStatus }                      from './editor.js';
import { loadProjects, expandProjectRow } from './sidebar.js';
import { showView, updatePreview }        from './editor-view.js';

// ----------------------------------------------------------
// Quill instance — initialized once in initProjects
// ----------------------------------------------------------
let _quill = null;

// ----------------------------------------------------------
// Config auto-save state
// ----------------------------------------------------------
let _configDir      = null;
let _configDebounce = null;

// ----------------------------------------------------------
// Post editor state
// ----------------------------------------------------------
let _postDir      = null;
let _postSlug     = null;
let _postDebounce = null;

// ----------------------------------------------------------
// Active project artifacts dir — set when a post is opened
// ----------------------------------------------------------
let _artifactsDir = null;

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
// Open post — loads post.json, populates editor fields
// ----------------------------------------------------------
export async function openPost(dir, slug) {
    console.trace('[openPost] begins');
    console.debug('[openPost] dir =>', dir, 'slug =>', slug);

    _postDir      = dir;
    _postSlug     = slug;
    _artifactsDir = dir + '/artifacts';

    console.debug('[openPost] _artifactsDir =>', _artifactsDir);

    const data = await window.api.getPost({ dir, slug });

    if (!data.ok) {
        window.dispatchEvent(new CustomEvent('app:show-error', { detail: data.error }));
        console.trace('[openPost] ends');
        return;
    }

    const post = data.post;

    console.debug('[openPost] post loaded =>', JSON.stringify(post).slice(0, 80));

    document.getElementById('field-title').value        = post.title        || '';
    document.getElementById('field-desc').value         = post.description  || '';
    document.getElementById('field-date').value         = post.date         || '';
    document.getElementById('field-tags').value         = Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '');
    document.getElementById('field-readtime').value     = post.readTime     || '';
    document.getElementById('field-pinned').checked     = post.pinned       || false;
    document.getElementById('field-pinned-order').value = post.pinnedOrder  || '';

    // load body into Quill
    console.debug('[openPost] loading body into Quill');
    _quill.setContents([]);
    _quill.clipboard.dangerouslyPasteHTML(0, post.body || '');

    // trigger themed live preview
    updatePreview(post.body || '', _artifactsDir);

    document.getElementById('save-status').textContent = '';

    showView('post-editor');

    setStatus('post: ' + slug);

    console.trace('[openPost] ends');
}

// ----------------------------------------------------------
// Meta field change — debounced auto-save
// ----------------------------------------------------------
export function onMetaChange() {
    console.trace('[onMetaChange] begins');

    document.getElementById('save-status').textContent = 'saving...';

    clearTimeout(_postDebounce);
    _postDebounce = setTimeout(function() { savePost(); }, 500);

    console.trace('[onMetaChange] ends');
}

// ----------------------------------------------------------
// Save post to disk via IPC
// ----------------------------------------------------------
async function savePost() {
    console.trace('[savePost] begins');

    if (!_postDir || !_postSlug) {
        console.debug('[savePost] no _postDir or _postSlug — skipping');
        console.trace('[savePost] ends');
        return;
    }

    const tagsRaw = document.getElementById('field-tags').value;
    const tags    = tagsRaw.split(',').map(function(t) { return t.trim(); }).filter(Boolean);

    const body = _quill.root.innerHTML;

    console.debug('[savePost] body length =>', body.length);

    const post = {
        slug:        _postSlug,
        title:       document.getElementById('field-title').value,
        description: document.getElementById('field-desc').value,
        date:        document.getElementById('field-date').value,
        readTime:    document.getElementById('field-readtime').value,
        tags:        tags,
        pinned:      document.getElementById('field-pinned').checked,
        pinnedOrder: document.getElementById('field-pinned-order').value,
        body:        body,
    };

    console.debug('[savePost] saving =>', _postSlug);

    const result = await window.api.savePost({ dir: _postDir, slug: _postSlug, post });

    if (!result.ok) {
        window.dispatchEvent(new CustomEvent('app:show-error', { detail: result.error }));
        console.trace('[savePost] ends');
        return;
    }

    document.getElementById('save-status').textContent = 'saved';
    setStatus('post saved: ' + _postSlug);

    console.trace('[savePost] ends');
}

// ----------------------------------------------------------
// Init Quill editor
// ----------------------------------------------------------
function initQuill() {
    console.trace('[initQuill] begins');

    _quill = new Quill('#body-editor', {
        theme: 'snow',
        placeholder: 'Post body...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'header': 2 }, { 'header': 3 }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['blockquote', 'code-block'],
                ['link'],
                ['clean']
            ]
        }
    });

    console.debug('[initQuill] Quill instance created');

    // on every text change — update preview + debounced save
    _quill.on('text-change', function(delta, oldDelta, source) {
        console.debug('[quill:text-change] source =>', source);

        const html = _quill.root.innerHTML;

        updatePreview(html, _artifactsDir);

        document.getElementById('save-status').textContent = 'saving...';

        clearTimeout(_postDebounce);
        _postDebounce = setTimeout(function() { savePost(); }, 500);
    });

    console.trace('[initQuill] ends');
}

// ----------------------------------------------------------
// Open post config — structured form for per-article metadata
// Stub — form view to be built in next phase
// ----------------------------------------------------------
export function openPostConfig(dir, slug) {
    console.trace('[openPostConfig] begins');
    console.debug('[openPostConfig] dir =>', dir, 'slug =>', slug);

    // TODO: load post.json fields into a config form view
    setStatus('post config: ' + slug + ' — not yet implemented');

    console.trace('[openPostConfig] ends');
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
    window.onMetaChange     = onMetaChange;

    initQuill();

    console.trace('[initProjects] ends');
}
