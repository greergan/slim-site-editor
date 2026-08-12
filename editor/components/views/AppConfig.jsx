'use strict';

import React, { useState, useEffect, useRef } from 'react';
import { useAppState, setStatus, Actions }     from '../../store/appState.jsx';

// ----------------------------------------------------------
// AppConfig — app settings form
// Ported from js/app-config.js + partials/main.html
// Loads config on mount, debounced save on any field change
// ----------------------------------------------------------
export default function AppConfig() {
    console.trace('[AppConfig] begins');

    const { dispatch } = useAppState();

    const [userDataPath,      setUserDataPath]      = useState('');
    const [defaultProjectDir, setDefaultProjectDir] = useState('');
    const [buildOnSave,       setBuildOnSave]       = useState(false);
    const [devTools,          setDevTools]           = useState(false);
    const [autoSave,          setAutoSave]           = useState(false);
    const [autoSaveDelay,     setAutoSaveDelay]      = useState(2000);
    const [previewPort,       setPreviewPort]         = useState(3333);

    const saveTimerRef = useRef(null);

    // ----------------------------------------------------------
    // Load config on mount
    // ----------------------------------------------------------
    useEffect(function () {
        console.trace('[AppConfig:useEffect:load] begins');

        async function load() {
            console.debug('[AppConfig:useEffect:load] calling getAppConfig');

            try {
                const res = await window.api.getAppConfig();
                console.debug('[AppConfig:useEffect:load] result =>', res);

                if (!res.ok) {
                    setStatus(dispatch, 'Error loading app config: ' + (res.error || 'unknown'), 'error');
                    console.trace('[AppConfig:useEffect:load] ends — load error');
                    return;
                }

                const cfg = res.config;
                setUserDataPath(res.userDataPath || '');
                setDefaultProjectDir(cfg.defaultProjectDir || '');
                setBuildOnSave(!!cfg.buildOnSave);
                setDevTools(!!cfg.devTools);
                setAutoSave(!!cfg.autoSave);
                setAutoSaveDelay(cfg.autoSaveDelay ?? 2000);
                setPreviewPort(cfg.previewPort ?? 3333);

                setStatus(dispatch, '', 'idle');

                console.debug('[AppConfig:useEffect:load] config populated');
            } catch (e) {
                console.debug('[AppConfig:useEffect:load] exception =>', e.message);
                setStatus(dispatch, 'Error loading app config: ' + e.message, 'error');
            }

            console.trace('[AppConfig:useEffect:load] ends');
        }

        load();

        console.trace('[AppConfig:useEffect:load] ends — load called');
    }, [dispatch]);

    // ----------------------------------------------------------
    // scheduleSave — debounced 800ms save
    // ----------------------------------------------------------
    function scheduleSave(overrides) {
        console.trace('[AppConfig:scheduleSave] begins');

        setStatus(dispatch, '', 'idle');

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            console.debug('[AppConfig:scheduleSave] cleared existing timer');
        }

        saveTimerRef.current = setTimeout(async function () {
            console.debug('[AppConfig:scheduleSave] debounce fired — saving');
            saveTimerRef.current = null;

            // merge overrides with current state values
            const config = {
                devTools:          overrides.devTools          !== undefined ? overrides.devTools          : devTools,
                defaultProjectDir: overrides.defaultProjectDir !== undefined ? overrides.defaultProjectDir : defaultProjectDir,
                autoSave:          overrides.autoSave          !== undefined ? overrides.autoSave          : autoSave,
                autoSaveDelay:     overrides.autoSaveDelay     !== undefined ? overrides.autoSaveDelay     : autoSaveDelay,
                buildOnSave:       overrides.buildOnSave       !== undefined ? overrides.buildOnSave       : buildOnSave,
                previewPort:       overrides.previewPort       !== undefined ? overrides.previewPort       : previewPort,
            };

            console.debug('[AppConfig:scheduleSave] config =>', config);

            try {
                const res = await window.api.saveAppConfig(config);
                console.debug('[AppConfig:scheduleSave] result =>', res);

                if (!res.ok) {
                    setStatus(dispatch, 'Save failed: ' + (res.error || 'unknown'), 'error');
                    console.trace('[AppConfig:scheduleSave] ends — save error');
                    return;
                }

                setStatus(dispatch, 'Saved', 'success');
                console.trace('[AppConfig:scheduleSave] ends — saved');
            } catch (e) {
                console.debug('[AppConfig:scheduleSave] exception =>', e.message);
                setStatus(dispatch, 'Save error: ' + e.message, 'error');
                console.trace('[AppConfig:scheduleSave] ends — exception');
            }
        }, 800);

        console.trace('[AppConfig:scheduleSave] ends — timer set');
    }

    // ----------------------------------------------------------
    // pickDefaultProjectDir — opens OS dir picker
    // ----------------------------------------------------------
    async function pickDefaultProjectDir() {
        console.trace('[AppConfig:pickDefaultProjectDir] begins');

        try {
            const dir = await window.api.pickDirectory();
            console.debug('[AppConfig:pickDefaultProjectDir] picked =>', dir);

            if (dir) {
                setDefaultProjectDir(dir);
                scheduleSave({ defaultProjectDir: dir });
            }
        } catch (e) {
            console.debug('[AppConfig:pickDefaultProjectDir] exception =>', e.message);
            setStatus(dispatch, 'Error picking directory: ' + e.message, 'error');
        }

        console.trace('[AppConfig:pickDefaultProjectDir] ends');
    }

    // ----------------------------------------------------------
    // Field change handlers
    // ----------------------------------------------------------
    function handleDefaultProjectDir(e) {
        console.trace('[AppConfig:handleDefaultProjectDir] begins');
        const val = e.target.value;
        setDefaultProjectDir(val);
        scheduleSave({ defaultProjectDir: val });
        console.trace('[AppConfig:handleDefaultProjectDir] ends');
    }

    function handleBuildOnSave(e) {
        console.trace('[AppConfig:handleBuildOnSave] begins');
        const val = e.target.checked;
        setBuildOnSave(val);
        scheduleSave({ buildOnSave: val });
        console.trace('[AppConfig:handleBuildOnSave] ends');
    }

    function handleDevTools(e) {
        console.trace('[AppConfig:handleDevTools] begins');
        const val = e.target.checked;
        setDevTools(val);
        scheduleSave({ devTools: val });
        console.trace('[AppConfig:handleDevTools] ends');
    }

    function handleAutoSave(e) {
        console.trace('[AppConfig:handleAutoSave] begins');
        const val = e.target.checked;
        setAutoSave(val);
        scheduleSave({ autoSave: val });
        console.trace('[AppConfig:handleAutoSave] ends');
    }

    function handleAutoSaveDelay(e) {
        console.trace('[AppConfig:handleAutoSaveDelay] begins');
        const val = Number(e.target.value) || 2000;
        setAutoSaveDelay(val);
        dispatch({ type: Actions.SET_AUTO_SAVE_DELAY, payload: val });
        console.debug('[AppConfig:handleAutoSaveDelay] dispatched autoSaveDelay =>', val);
        scheduleSave({ autoSaveDelay: val });
        console.trace('[AppConfig:handleAutoSaveDelay] ends');
    }

    function handlePreviewPort(e) {
        console.trace('[AppConfig:handlePreviewPort] begins');
        const val = Number(e.target.value) || 3333;
        setPreviewPort(val);
        scheduleSave({ previewPort: val });
        console.trace('[AppConfig:handlePreviewPort] ends');
    }

    console.trace('[AppConfig] ends');

    return (
        <div id="app-config-form" className="visible">

            <div id="app-config-form-header">App Config</div>

            <div id="app-config-form-body">

                {/* Storage */}
                <div className="acfg-section">
                    <div className="acfg-section-label">Storage</div>

                    <div className="acfg-field">
                        <span className="acfg-label">App Data Directory</span>
                        <input
                            id="acfg-userDataPath"
                            type="text"
                            readOnly
                            value={userDataPath}
                            onChange={function () {}}
                        />
                    </div>

                    <div className="acfg-field">
                        <span className="acfg-label">Default Project Directory</span>
                        <div className="picker-field">
                            <input
                                id="acfg-defaultProjectDir"
                                type="text"
                                value={defaultProjectDir}
                                onChange={handleDefaultProjectDir}
                            />
                            <button
                                className="pick-btn"
                                title="Browse"
                                onClick={pickDefaultProjectDir}
                            >&#128193;</button>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="acfg-section">
                    <div className="acfg-section-label">Preview</div>

                    <div className="acfg-field">
                        <span className="acfg-label">Preview Server Port</span>
                        <div className="acfg-input-with-unit">
                            <input
                                id="acfg-previewPort"
                                type="number"
                                min="1024"
                                max="65535"
                                step="1"
                                value={previewPort}
                                onChange={handlePreviewPort}
                            />
                            <span className="acfg-unit">port</span>
                        </div>
                    </div>
                </div>

                {/* Build */}
                <div className="acfg-section">
                    <div className="acfg-section-label">Build</div>

                    <div className="acfg-field acfg-field-check">
                        <span className="acfg-label">Enable Build on Save</span>
                        <input
                            id="acfg-buildOnSave"
                            type="checkbox"
                            checked={buildOnSave}
                            onChange={handleBuildOnSave}
                        />
                    </div>
                </div>

                {/* Editor */}
                <div className="acfg-section">
                    <div className="acfg-section-label">Editor</div>

                    <div className="acfg-field acfg-field-check">
                        <span className="acfg-label">Enable Developer Tools</span>
                        <input
                            id="acfg-devTools"
                            type="checkbox"
                            checked={devTools}
                            onChange={handleDevTools}
                        />
                    </div>

                    <div className="acfg-field acfg-field-check">
                        <span className="acfg-label">Enable Auto Save</span>
                        <input
                            id="acfg-autoSave"
                            type="checkbox"
                            checked={autoSave}
                            onChange={handleAutoSave}
                        />
                    </div>

                    <div className="acfg-field">
                        <span className="acfg-label">Auto Save Delay</span>
                        <div className="acfg-input-with-unit">
                            <input
                                id="acfg-autoSaveDelay"
                                type="number"
                                min="500"
                                step="100"
                                value={autoSaveDelay}
                                onChange={handleAutoSaveDelay}
                            />
                            <span className="acfg-unit">ms</span>
                        </div>
                    </div>
                </div>

            </div>

            <div id="app-config-form-status"></div>

        </div>
    );
}
