'use strict';

// ----------------------------------------------------------
// View mode: 'edit' | 'split' | 'preview'
// ----------------------------------------------------------
let _viewMode = 'split';

// ----------------------------------------------------------
// Named view switcher
// Views: 'welcome' | 'config-form' | 'post-editor'
// ----------------------------------------------------------
export function showView(name) {
    console.trace('[showView] begins');
    console.debug('[showView] name =>', name);

    const emptyState = document.getElementById('empty-state');
    const viewBar    = document.getElementById('view-bar');
    const workArea   = document.getElementById('work-area');
    const rawEditor  = document.getElementById('raw-editor');
    const configForm = document.getElementById('config-form');

    // hide all views first
    emptyState.classList.remove('visible');
    viewBar.classList.remove('visible');
    workArea.classList.remove('visible');
    rawEditor.classList.remove('visible');
    configForm.classList.remove('visible');

    if (name === 'welcome') {
        emptyState.classList.add('visible');
        console.debug('[showView] showing welcome');
    } else if (name === 'config-form') {
        configForm.classList.add('visible');
        console.debug('[showView] showing config-form');
    } else if (name === 'post-editor') {
        viewBar.classList.add('visible');
        workArea.classList.add('visible');
        console.debug('[showView] showing post-editor');
    } else {
        console.debug('[showView] unknown view name — falling back to welcome');
        emptyState.classList.add('visible');
    }

    console.trace('[showView] ends');
}

export function setViewMode(mode) {
    console.trace('[setViewMode] begins');
    console.debug('[setViewMode] mode =>', mode);

    _viewMode = mode;

    const wa = document.getElementById('work-area');
    wa.className = 'mode-' + mode;

    document.querySelectorAll('.view-btn').forEach(function(b) {
        b.classList.toggle('active', b.id === 'vbtn-' + mode);
    });

    console.trace('[setViewMode] ends');
}

// ----------------------------------------------------------
// Live preview — writes themed srcdoc into iframe
// artifactsDir: absolute path to project's artifacts/ dir
// body: raw HTML string from body-editor
// ----------------------------------------------------------
export function updatePreview(body, artifactsDir) {
    console.trace('[updatePreview] begins');
    console.debug('[updatePreview] artifactsDir =>', artifactsDir);

    const frame = document.getElementById('preview-frame');

    if (!frame) {
        console.debug('[updatePreview] preview-frame not found — skipping');
        console.trace('[updatePreview] ends');
        return;
    }

    if (!artifactsDir) {
        console.debug('[updatePreview] no artifactsDir — rendering plain body');
        frame.srcdoc = body || '';
        console.trace('[updatePreview] ends');
        return;
    }

    const cssPath = 'file://' + artifactsDir + '/assets/style.css';
    const jsPath  = 'file://' + artifactsDir + '/assets/theme.js';

    console.debug('[updatePreview] cssPath =>', cssPath);
    console.debug('[updatePreview] jsPath  =>', jsPath);

    const srcdoc = [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '<meta charset="utf-8">',
        '<link rel="stylesheet" href="' + cssPath + '">',
        '</head>',
        '<body>',
        '<div class="site-wrap">',
        '<article>',
        '<div class="post-body">',
        body || '',
        '</div>',
        '</article>',
        '</div>',
        '<script src="' + jsPath + '"><\/script>',
        '</body>',
        '</html>'
    ].join('\n');

    frame.srcdoc = srcdoc;

    console.trace('[updatePreview] ends');
}

// ----------------------------------------------------------
// onBodyInput — called from projects.js, not wired to window here
// projects.js owns body input handling and calls updatePreview directly
// ----------------------------------------------------------
export function onMetaChange() {
    // marks post dirty — save button enable logic goes here
}

// ----------------------------------------------------------
// Init — expose functions window needs for inline onclick handlers
// ----------------------------------------------------------
export function initView() {
    console.trace('[initView] begins');

    window.setViewMode  = setViewMode;
    window.onMetaChange = onMetaChange;
    window.showView     = showView;

    // start on welcome view
    showView('welcome');

    console.trace('[initView] ends');
}
