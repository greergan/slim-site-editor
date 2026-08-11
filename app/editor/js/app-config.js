'use strict';

import { setStatus } from './editor.js';
import { showView }  from './editor-view.js';

// ----------------------------------------------------------
// Debounce timer handle
// ----------------------------------------------------------
let _saveTimer = null;

// ----------------------------------------------------------
// openAppConfig — loads config from main, populates form, shows view
// ----------------------------------------------------------
export async function openAppConfig() {
    console.trace('[openAppConfig] begins');

    try {
        const res = await window.api.getAppConfig();
        console.debug('[openAppConfig] getAppConfig result =>', res);

        if (!res.ok) {
            setStatus('Error loading app config: ' + (res.error || 'unknown'), 'error');
            console.trace('[openAppConfig] ends — load error');
            return;
        }

        _populateForm(res.config, res.userDataPath);
        showView('app-config');
        setStatus('', 'idle');

        console.trace('[openAppConfig] ends');
    } catch (e) {
        console.error('[openAppConfig] exception =>', e);
        setStatus('Error loading app config: ' + e.message, 'error');
        console.trace('[openAppConfig] ends — exception');
    }
}

// ----------------------------------------------------------
// _populateForm — fills form fields from config object
// ----------------------------------------------------------
function _populateForm(config, userDataPath) {
    console.trace('[_populateForm] begins');
    console.debug('[_populateForm] config =>', config);
    console.debug('[_populateForm] userDataPath =>', userDataPath);

    document.getElementById('acfg-userDataPath').value     = userDataPath || '';
    document.getElementById('acfg-devTools').checked        = !!config.devTools;
    document.getElementById('acfg-defaultProjectDir').value = config.defaultProjectDir || '';
    document.getElementById('acfg-autoSave').checked        = !!config.autoSave;
    document.getElementById('acfg-autoSaveDelay').value     = config.autoSaveDelay ?? 2000;
    document.getElementById('acfg-buildOnSave').checked     = !!config.buildOnSave;

    console.trace('[_populateForm] ends');
}

// ----------------------------------------------------------
// _collectForm — reads form fields into a config object
// userDataPath is readonly — not included
// ----------------------------------------------------------
function _collectForm() {
    console.trace('[_collectForm] begins');

    const config = {
        devTools:          document.getElementById('acfg-devTools').checked,
        defaultProjectDir: document.getElementById('acfg-defaultProjectDir').value.trim(),
        autoSave:          document.getElementById('acfg-autoSave').checked,
        autoSaveDelay:     Number(document.getElementById('acfg-autoSaveDelay').value) || 2000,
        buildOnSave:       document.getElementById('acfg-buildOnSave').checked,
    };

    console.debug('[_collectForm] config =>', config);
    console.trace('[_collectForm] ends');
    return config;
}

// ----------------------------------------------------------
// onAppConfigInput — debounced save triggered by field changes
// ----------------------------------------------------------
export function onAppConfigInput() {
    console.trace('[onAppConfigInput] begins');

    setStatus('', 'idle');

    if (_saveTimer) {
        clearTimeout(_saveTimer);
        console.debug('[onAppConfigInput] cleared existing timer');
    }

    _saveTimer = setTimeout(async function () {
        console.debug('[onAppConfigInput] debounce fired — saving');
        _saveTimer = null;

        try {
            const config = _collectForm();
            const res    = await window.api.saveAppConfig(config);
            console.debug('[onAppConfigInput] saveAppConfig result =>', res);

            if (!res.ok) {
                setStatus('Save failed: ' + (res.error || 'unknown'), 'error');
                console.trace('[onAppConfigInput] ends — save error');
                return;
            }

            setStatus('Saved', 'success');
            console.trace('[onAppConfigInput] ends — saved');
        } catch (e) {
            console.error('[onAppConfigInput] exception =>', e);
            setStatus('Save error: ' + e.message, 'error');
            console.trace('[onAppConfigInput] ends — exception');
        }
    }, 800);

    console.trace('[onAppConfigInput] ends — timer set');
}

// ----------------------------------------------------------
// pickAppConfigDir — opens OS dir picker, fills defaultProjectDir
// ----------------------------------------------------------
export async function pickAppConfigDir() {
    console.trace('[pickAppConfigDir] begins');

    try {
        const dir = await window.api.pickDirectory();
        console.debug('[pickAppConfigDir] picked =>', dir);

        if (dir) {
            document.getElementById('acfg-defaultProjectDir').value = dir;
            onAppConfigInput();
        }

        console.trace('[pickAppConfigDir] ends');
    } catch (e) {
        console.error('[pickAppConfigDir] exception =>', e);
        setStatus('Error picking directory: ' + e.message, 'error');
        console.trace('[pickAppConfigDir] ends — exception');
    }
}

// ----------------------------------------------------------
// Init — expose functions window needs for inline onclick handlers
// ----------------------------------------------------------
export function initAppConfig() {
    console.trace('[initAppConfig] begins');

    window.openAppConfig    = openAppConfig;
    window.onAppConfigInput = onAppConfigInput;
    window.pickAppConfigDir = pickAppConfigDir;

    console.trace('[initAppConfig] ends');
}
