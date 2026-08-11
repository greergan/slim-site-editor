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
// Live preview — fires on every body keystroke
// ----------------------------------------------------------
export function onBodyInput() {
    console.trace('[onBodyInput] begins');

    const html =
        document.getElementById('body-editor').value;

    document.getElementById('preview-content').innerHTML = html;

    console.trace('[onBodyInput] ends');
}

// ----------------------------------------------------------
// Meta field change
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
    window.onBodyInput  = onBodyInput;
    window.onMetaChange = onMetaChange;
    window.showView     = showView;

    // start on welcome view
    showView('welcome');

    console.trace('[initView] ends');
}
