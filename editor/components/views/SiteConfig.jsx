'use strict';

import React, { useState, useEffect, useRef } from 'react';
import { useAppState, setStatus, Actions }     from '../../store/appState.jsx';

// ----------------------------------------------------------
// SiteConfig — project config form
// Ported from js/projects.js openProjectConfig/saveConfig
// Loads config.json on activeConfigDir change
// Debounced auto-save using autoSaveDelay from store
// ----------------------------------------------------------
export default function SiteConfig({ onProjectNameChange }) {
    console.trace('[SiteConfig] begins');

    const { state, dispatch } = useAppState();

    const [siteTitle,  setSiteTitle]  = useState('');
    const [sitePrompt, setSitePrompt] = useState('');
    const [siteDesc,   setSiteDesc]   = useState('');
    const [currentYear,setCurrentYear]= useState('');
    const [siteUrl,    setSiteUrl]    = useState('');
    const [author,     setAuthor]     = useState('');

    const saveTimerRef = useRef(null);
    const dirRef       = useRef(null);

    // ----------------------------------------------------------
    // Load config when activeConfigDir changes
    // ----------------------------------------------------------
    useEffect(function () {
        console.trace('[SiteConfig:useEffect:load] begins');

        const dir = state.activeConfigDir;
        console.debug('[SiteConfig:useEffect:load] dir =>', dir);

        if (!dir) {
            console.debug('[SiteConfig:useEffect:load] no dir — skipping');
            console.trace('[SiteConfig:useEffect:load] ends — no dir');
            return;
        }

        dirRef.current = dir;

        async function load() {
            try {
                const res = await window.api.getConfig({ dir });
                console.debug('[SiteConfig:useEffect:load] result =>', res);

                if (!res.ok) {
                    setStatus(dispatch, 'Error loading config: ' + (res.error || 'unknown'), 'error');
                    console.trace('[SiteConfig:useEffect:load] ends — load error');
                    return;
                }

                const cfg = res.config;

                setSiteTitle(cfg.siteTitle   || '');
                setSitePrompt(cfg.sitePrompt || '');
                setSiteDesc(cfg.siteDesc     || '');
                setCurrentYear(cfg.currentYear || '');
                setSiteUrl(cfg.siteUrl       || '');
                setAuthor(cfg.author         || '');

                setStatus(dispatch, '', 'idle');

                console.debug('[SiteConfig:useEffect:load] config populated');
            } catch (e) {
                console.debug('[SiteConfig:useEffect:load] exception =>', e.message);
                setStatus(dispatch, 'Error loading config: ' + e.message, 'error');
            }

            console.trace('[SiteConfig:useEffect:load] ends');
        }

        load();

        console.trace('[SiteConfig:useEffect:load] ends — load called');
    }, [state.activeConfigDir, dispatch]);

    // ----------------------------------------------------------
    // scheduleSave — debounced save using autoSaveDelay from store
    // ----------------------------------------------------------
    function scheduleSave(overrides) {
        console.trace('[SiteConfig:scheduleSave] begins');

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            console.debug('[SiteConfig:scheduleSave] cleared existing timer');
        }

        const delay = state.autoSaveDelay || 2000;
        console.debug('[SiteConfig:scheduleSave] delay =>', delay);

        saveTimerRef.current = setTimeout(async function () {
            console.debug('[SiteConfig:scheduleSave] debounce fired — saving');
            saveTimerRef.current = null;

            const dir = dirRef.current;

            if (!dir) {
                console.debug('[SiteConfig:scheduleSave] no dir — skipping');
                console.trace('[SiteConfig:scheduleSave] ends — no dir');
                return;
            }

            const config = {
                siteTitle:   overrides.siteTitle   !== undefined ? overrides.siteTitle   : siteTitle,
                sitePrompt:  overrides.sitePrompt  !== undefined ? overrides.sitePrompt  : sitePrompt,
                siteDesc:    overrides.siteDesc    !== undefined ? overrides.siteDesc    : siteDesc,
                currentYear: overrides.currentYear !== undefined ? overrides.currentYear : currentYear,
                siteUrl:     overrides.siteUrl     !== undefined ? overrides.siteUrl     : siteUrl,
                author:      overrides.author      !== undefined ? overrides.author      : author,
            };

            console.debug('[SiteConfig:scheduleSave] config =>', config);

            try {
                const res = await window.api.saveConfig({ dir, config });
                console.debug('[SiteConfig:scheduleSave] result =>', res);

                if (!res.ok) {
                    setStatus(dispatch, 'Save failed: ' + (res.error || 'unknown'), 'error');
                    console.trace('[SiteConfig:scheduleSave] ends — save error');
                    return;
                }

                setStatus(dispatch, 'Config saved', 'success');

                // update sidebar project row name to reflect new siteTitle
                if (onProjectNameChange) {
                    onProjectNameChange(dir, config.siteTitle);
                    console.debug('[SiteConfig:scheduleSave] sidebar name updated =>', config.siteTitle);
                }

                console.trace('[SiteConfig:scheduleSave] ends — saved');
            } catch (e) {
                console.debug('[SiteConfig:scheduleSave] exception =>', e.message);
                setStatus(dispatch, 'Save error: ' + e.message, 'error');
                console.trace('[SiteConfig:scheduleSave] ends — exception');
            }
        }, delay);

        console.trace('[SiteConfig:scheduleSave] ends — timer set');
    }

    // ----------------------------------------------------------
    // Field change handlers
    // ----------------------------------------------------------
    function handleSiteTitle(e) {
        console.trace('[SiteConfig:handleSiteTitle] begins');
        const val = e.target.value;
        setSiteTitle(val);
        scheduleSave({ siteTitle: val });
        console.trace('[SiteConfig:handleSiteTitle] ends');
    }

    function handleSitePrompt(e) {
        console.trace('[SiteConfig:handleSitePrompt] begins');
        const val = e.target.value;
        setSitePrompt(val);
        scheduleSave({ sitePrompt: val });
        console.trace('[SiteConfig:handleSitePrompt] ends');
    }

    function handleSiteDesc(e) {
        console.trace('[SiteConfig:handleSiteDesc] begins');
        const val = e.target.value;
        setSiteDesc(val);
        scheduleSave({ siteDesc: val });
        console.trace('[SiteConfig:handleSiteDesc] ends');
    }

    function handleCurrentYear(e) {
        console.trace('[SiteConfig:handleCurrentYear] begins');
        const val = e.target.value;
        setCurrentYear(val);
        scheduleSave({ currentYear: val });
        console.trace('[SiteConfig:handleCurrentYear] ends');
    }

    function handleSiteUrl(e) {
        console.trace('[SiteConfig:handleSiteUrl] begins');
        const val = e.target.value;
        setSiteUrl(val);
        scheduleSave({ siteUrl: val });
        console.trace('[SiteConfig:handleSiteUrl] ends');
    }

    function handleAuthor(e) {
        console.trace('[SiteConfig:handleAuthor] begins');
        const val = e.target.value;
        setAuthor(val);
        scheduleSave({ author: val });
        console.trace('[SiteConfig:handleAuthor] ends');
    }

    console.trace('[SiteConfig] ends');

    return (
        <div id="config-form" className="visible">

            <div id="config-form-header">Site Config</div>

            <div id="config-form-fields">

                <label>Project Directory</label>
                <input
                    id="cfg-projectDir"
                    type="text"
                    readOnly
                    value={state.activeConfigDir || ''}
                />

                <label>Site Title</label>
                <input
                    id="cfg-siteTitle"
                    type="text"
                    value={siteTitle}
                    onChange={handleSiteTitle}
                />

                <label>Site Prompt</label>
                <input
                    id="cfg-sitePrompt"
                    type="text"
                    value={sitePrompt}
                    onChange={handleSitePrompt}
                />

                <label>Site Description</label>
                <input
                    id="cfg-siteDesc"
                    type="text"
                    value={siteDesc}
                    onChange={handleSiteDesc}
                />

                <label>Current Year</label>
                <input
                    id="cfg-currentYear"
                    type="text"
                    value={currentYear}
                    onChange={handleCurrentYear}
                />

                <label>Site URL</label>
                <input
                    id="cfg-siteUrl"
                    type="text"
                    value={siteUrl}
                    onChange={handleSiteUrl}
                />

                <label>Author</label>
                <input
                    id="cfg-author"
                    type="text"
                    value={author}
                    onChange={handleAuthor}
                />

            </div>

            <div id="config-form-status"></div>

        </div>
    );
}
