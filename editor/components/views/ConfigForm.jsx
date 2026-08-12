'use strict';

import React, { useState, useEffect, useRef } from 'react';
import { useAppState, Actions, setStatus }     from '../../store/appState.jsx';

// ----------------------------------------------------------
// ConfigForm — project site config form
// Loads config.json for activeConfigDir on mount
// Debounced auto-save on any field change
// Updates sidebar project row name when siteTitle changes
// ----------------------------------------------------------
export default function ConfigForm({ onProjectNameChange }) {
    console.trace('[ConfigForm] begins');

    const { state, dispatch } = useAppState();

    const [siteTitle,   setSiteTitle]   = useState('');
    const [sitePrompt,  setSitePrompt]  = useState('');
    const [siteDesc,    setSiteDesc]    = useState('');
    const [currentYear, setCurrentYear] = useState('');
    const [siteUrl,     setSiteUrl]     = useState('');
    const [author,      setAuthor]      = useState('');

    const saveTimerRef = useRef(null);
    const dirRef       = useRef(null);

    // ----------------------------------------------------------
    // Load config when activeConfigDir changes
    // ----------------------------------------------------------
    useEffect(function () {
        console.trace('[ConfigForm:useEffect:load] begins');

        const dir = state.activeConfigDir;

        console.debug('[ConfigForm:useEffect:load] activeConfigDir =>', dir);

        if (!dir) {
            console.debug('[ConfigForm:useEffect:load] no dir — skipping');
            console.trace('[ConfigForm:useEffect:load] ends — no dir');
            return;
        }

        dirRef.current = dir;

        async function load() {
            console.debug('[ConfigForm:useEffect:load] calling getConfig for =>', dir);

            try {
                const res = await window.api.getConfig({ dir });
                console.debug('[ConfigForm:useEffect:load] result =>', res);

                if (!res.ok) {
                    setStatus(dispatch, 'Error loading config: ' + (res.error || 'unknown'), 'error');
                    console.trace('[ConfigForm:useEffect:load] ends — load error');
                    return;
                }

                const cfg = res.config;

                setSiteTitle(cfg.siteTitle    || '');
                setSitePrompt(cfg.sitePrompt  || '');
                setSiteDesc(cfg.siteDesc      || '');
                setCurrentYear(cfg.currentYear|| '');
                setSiteUrl(cfg.siteUrl        || '');
                setAuthor(cfg.author          || '');

                setStatus(dispatch, '', 'idle');

                console.debug('[ConfigForm:useEffect:load] config populated =>', JSON.stringify(cfg));
            } catch (e) {
                console.debug('[ConfigForm:useEffect:load] exception =>', e.message);
                setStatus(dispatch, 'Error loading config: ' + e.message, 'error');
            }

            console.trace('[ConfigForm:useEffect:load] ends');
        }

        load();

        console.trace('[ConfigForm:useEffect:load] ends — load called');
    }, [state.activeConfigDir, dispatch]);

    // ----------------------------------------------------------
    // scheduleSave — debounced 800ms save
    // ----------------------------------------------------------
    function scheduleSave(overrides) {
        console.trace('[ConfigForm:scheduleSave] begins');

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            console.debug('[ConfigForm:scheduleSave] cleared existing timer');
        }

        saveTimerRef.current = setTimeout(async function () {
            console.debug('[ConfigForm:scheduleSave] debounce fired — saving');
            saveTimerRef.current = null;

            const dir = dirRef.current;

            if (!dir) {
                console.debug('[ConfigForm:scheduleSave] no dir — skipping');
                console.trace('[ConfigForm:scheduleSave] ends — no dir');
                return;
            }

            // merge overrides with current state values
            const config = {
                siteTitle:   overrides.siteTitle   !== undefined ? overrides.siteTitle   : siteTitle,
                sitePrompt:  overrides.sitePrompt  !== undefined ? overrides.sitePrompt  : sitePrompt,
                siteDesc:    overrides.siteDesc     !== undefined ? overrides.siteDesc    : siteDesc,
                currentYear: overrides.currentYear !== undefined ? overrides.currentYear : currentYear,
                siteUrl:     overrides.siteUrl     !== undefined ? overrides.siteUrl     : siteUrl,
                author:      overrides.author      !== undefined ? overrides.author      : author,
            };

            console.debug('[ConfigForm:scheduleSave] config =>', JSON.stringify(config));

            try {
                const res = await window.api.saveConfig({ dir, config });
                console.debug('[ConfigForm:scheduleSave] result =>', res);

                if (!res.ok) {
                    setStatus(dispatch, 'Save failed: ' + (res.error || 'unknown'), 'error');
                    console.trace('[ConfigForm:scheduleSave] ends — save error');
                    return;
                }

                setStatus(dispatch, 'Config saved', 'success');

                // notify App to update sidebar row name
                if (onProjectNameChange && config.siteTitle !== undefined) {
                    console.debug('[ConfigForm:scheduleSave] notifying name change =>', config.siteTitle);
                    onProjectNameChange(dir, config.siteTitle);
                }

                console.trace('[ConfigForm:scheduleSave] ends — saved');
            } catch (e) {
                console.debug('[ConfigForm:scheduleSave] exception =>', e.message);
                setStatus(dispatch, 'Save error: ' + e.message, 'error');
                console.trace('[ConfigForm:scheduleSave] ends — exception');
            }
        }, 800);

        console.trace('[ConfigForm:scheduleSave] ends — timer set');
    }

    // ----------------------------------------------------------
    // Field change handlers
    // ----------------------------------------------------------
    function handleSiteTitle(e) {
        console.trace('[ConfigForm:handleSiteTitle] begins');
        const val = e.target.value;
        setSiteTitle(val);
        scheduleSave({ siteTitle: val });
        console.trace('[ConfigForm:handleSiteTitle] ends');
    }

    function handleSitePrompt(e) {
        console.trace('[ConfigForm:handleSitePrompt] begins');
        const val = e.target.value;
        setSitePrompt(val);
        scheduleSave({ sitePrompt: val });
        console.trace('[ConfigForm:handleSitePrompt] ends');
    }

    function handleSiteDesc(e) {
        console.trace('[ConfigForm:handleSiteDesc] begins');
        const val = e.target.value;
        setSiteDesc(val);
        scheduleSave({ siteDesc: val });
        console.trace('[ConfigForm:handleSiteDesc] ends');
    }

    function handleCurrentYear(e) {
        console.trace('[ConfigForm:handleCurrentYear] begins');
        const val = e.target.value;
        setCurrentYear(val);
        scheduleSave({ currentYear: val });
        console.trace('[ConfigForm:handleCurrentYear] ends');
    }

    function handleSiteUrl(e) {
        console.trace('[ConfigForm:handleSiteUrl] begins');
        const val = e.target.value;
        setSiteUrl(val);
        scheduleSave({ siteUrl: val });
        console.trace('[ConfigForm:handleSiteUrl] ends');
    }

    function handleAuthor(e) {
        console.trace('[ConfigForm:handleAuthor] begins');
        const val = e.target.value;
        setAuthor(val);
        scheduleSave({ author: val });
        console.trace('[ConfigForm:handleAuthor] ends');
    }

    console.trace('[ConfigForm] ends');

    return (
        <div id="config-form" className="visible">

            <div id="config-form-header">Project Config</div>

            <div id="config-form-fields">

                <label>Project Directory
                    <input
                        id="cfg-projectDir"
                        type="text"
                        readOnly
                        value={state.activeConfigDir || ''}
                        onChange={function () {}}
                    />
                </label>

                <label>Site Title
                    <input
                        id="cfg-siteTitle"
                        type="text"
                        value={siteTitle}
                        onChange={handleSiteTitle}
                    />
                </label>

                <label>Site Prompt
                    <input
                        id="cfg-sitePrompt"
                        type="text"
                        value={sitePrompt}
                        onChange={handleSitePrompt}
                    />
                </label>

                <label>Site Description
                    <input
                        id="cfg-siteDesc"
                        type="text"
                        value={siteDesc}
                        onChange={handleSiteDesc}
                    />
                </label>

                <label>Current Year
                    <input
                        id="cfg-currentYear"
                        type="text"
                        value={currentYear}
                        onChange={handleCurrentYear}
                    />
                </label>

                <label>Site URL
                    <input
                        id="cfg-siteUrl"
                        type="text"
                        value={siteUrl}
                        onChange={handleSiteUrl}
                    />
                </label>

                <label>Author
                    <input
                        id="cfg-author"
                        type="text"
                        value={author}
                        onChange={handleAuthor}
                    />
                </label>

            </div>

        </div>
    );
}
