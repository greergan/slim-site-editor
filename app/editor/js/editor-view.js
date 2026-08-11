'use strict';

// ----------------------------------------------------------
// View mode: 'edit' | 'split' | 'preview'
// ----------------------------------------------------------
let _viewMode = 'split';

export function setViewMode(mode) {
    _viewMode = mode;

    const wa = document.getElementById('work-area');
    wa.className = 'mode-' + mode;

    document.querySelectorAll('.view-btn').forEach(function(b) {
        b.classList.toggle('active', b.id === 'vbtn-' + mode);
    });
}

// ----------------------------------------------------------
// Live preview — fires on every body keystroke
// ----------------------------------------------------------
export function onBodyInput() {
    const html =
        document.getElementById('body-editor').value;

    document.getElementById('preview-content').innerHTML = html;
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
    window.setViewMode  = setViewMode;
    window.onBodyInput  = onBodyInput;
    window.onMetaChange = onMetaChange;
}
