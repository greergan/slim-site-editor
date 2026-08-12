'use strict';

import React, { useState, useEffect, useRef } from 'react';
import { useAppState, setStatus }              from '../../store/appState.jsx';

// ----------------------------------------------------------
// PostConfig — per-article metadata settings form
// Ported from js/projects.js openPostConfig/onMetaChange
// Loads post.json on activePostDir/activePostSlug change
// Debounced auto-save using autoSaveDelay from store
// Preserves post body on save
// ----------------------------------------------------------
export default function PostConfig() {
    console.trace('[PostConfig] begins');

    const { state, dispatch } = useAppState();

    const [title,       setTitle]       = useState('');
    const [description, setDescription] = useState('');
    const [date,        setDate]        = useState('');
    const [tags,        setTags]        = useState('');
    const [readTime,    setReadTime]    = useState('');
    const [pinned,      setPinned]      = useState(false);
    const [pinnedOrder, setPinnedOrder] = useState('');

    const saveTimerRef = useRef(null);
    const dirRef       = useRef(null);
    const slugRef      = useRef(null);
    const bodyRef      = useRef('');   // preserved body — not edited here

    // ----------------------------------------------------------
    // Load post when activePostDir/activePostSlug changes
    // ----------------------------------------------------------
    useEffect(function () {
        console.trace('[PostConfig:useEffect:load] begins');

        const dir  = state.activePostDir;
        const slug = state.activePostSlug;

        console.debug('[PostConfig:useEffect:load] dir =>', dir, 'slug =>', slug);

        if (!dir || !slug) {
            console.debug('[PostConfig:useEffect:load] no dir/slug — skipping');
            console.trace('[PostConfig:useEffect:load] ends — no dir/slug');
            return;
        }

        dirRef.current  = dir;
        slugRef.current = slug;

        async function load() {
            try {
                const res = await window.api.getPost({ dir, slug });
                console.debug('[PostConfig:useEffect:load] result =>', res);

                if (!res.ok) {
                    setStatus(dispatch, 'Error loading post: ' + (res.error || 'unknown'), 'error');
                    console.trace('[PostConfig:useEffect:load] ends — load error');
                    return;
                }

                const post = res.post;

                console.debug('[PostConfig:useEffect:load] post loaded =>', slug);

                setTitle(post.title             || '');
                setDescription(post.description || '');
                setDate(post.date               || '');
                setTags(Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''));
                setReadTime(post.readTime       || '');
                setPinned(!!post.pinned);
                setPinnedOrder(post.pinnedOrder || '');

                // preserve body so save does not wipe it
                bodyRef.current = post.body || '';

                console.debug('[PostConfig:useEffect:load] body preserved, length =>', bodyRef.current.length);

                setStatus(dispatch, '', 'idle');
            } catch (e) {
                console.debug('[PostConfig:useEffect:load] exception =>', e.message);
                setStatus(dispatch, 'Error loading post: ' + e.message, 'error');
            }

            console.trace('[PostConfig:useEffect:load] ends');
        }

        load();

        console.trace('[PostConfig:useEffect:load] ends — load called');
    }, [state.activePostDir, state.activePostSlug, dispatch]);

    // ----------------------------------------------------------
    // scheduleSave — debounced save using autoSaveDelay from store
    // ----------------------------------------------------------
    function scheduleSave(overrides) {
        console.trace('[PostConfig:scheduleSave] begins');

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            console.debug('[PostConfig:scheduleSave] cleared existing timer');
        }

        const delay = state.autoSaveDelay || 2000;
        console.debug('[PostConfig:scheduleSave] delay =>', delay);

        saveTimerRef.current = setTimeout(async function () {
            console.debug('[PostConfig:scheduleSave] debounce fired — saving');
            saveTimerRef.current = null;

            const dir  = dirRef.current;
            const slug = slugRef.current;

            if (!dir || !slug) {
                console.debug('[PostConfig:scheduleSave] no dir/slug — skipping');
                console.trace('[PostConfig:scheduleSave] ends — no dir/slug');
                return;
            }

            const tagsRaw = overrides.tags !== undefined ? overrides.tags : tags;
            const tagList = tagsRaw.split(',').map(function (t) { return t.trim(); }).filter(Boolean);

            const post = {
                slug:        slug,
                title:       overrides.title       !== undefined ? overrides.title       : title,
                description: overrides.description !== undefined ? overrides.description : description,
                date:        overrides.date        !== undefined ? overrides.date        : date,
                readTime:    overrides.readTime    !== undefined ? overrides.readTime    : readTime,
                tags:        tagList,
                pinned:      overrides.pinned      !== undefined ? overrides.pinned      : pinned,
                pinnedOrder: overrides.pinnedOrder !== undefined ? overrides.pinnedOrder : pinnedOrder,
                body:        bodyRef.current,
            };

            console.debug('[PostConfig:scheduleSave] saving =>', slug);

            try {
                const res = await window.api.savePost({ dir, slug, post });
                console.debug('[PostConfig:scheduleSave] result =>', res);

                if (!res.ok) {
                    setStatus(dispatch, 'Save failed: ' + (res.error || 'unknown'), 'error');
                    console.trace('[PostConfig:scheduleSave] ends — save error');
                    return;
                }

                setStatus(dispatch, 'Post settings saved', 'success');
                console.trace('[PostConfig:scheduleSave] ends — saved');
            } catch (e) {
                console.debug('[PostConfig:scheduleSave] exception =>', e.message);
                setStatus(dispatch, 'Save error: ' + e.message, 'error');
                console.trace('[PostConfig:scheduleSave] ends — exception');
            }
        }, delay);

        console.trace('[PostConfig:scheduleSave] ends — timer set');
    }

    // ----------------------------------------------------------
    // Field change handlers
    // ----------------------------------------------------------
    function handleTitle(e) {
        console.trace('[PostConfig:handleTitle] begins');
        const val = e.target.value;
        setTitle(val);
        scheduleSave({ title: val });
        console.trace('[PostConfig:handleTitle] ends');
    }

    function handleDescription(e) {
        console.trace('[PostConfig:handleDescription] begins');
        const val = e.target.value;
        setDescription(val);
        scheduleSave({ description: val });
        console.trace('[PostConfig:handleDescription] ends');
    }

    function handleDate(e) {
        console.trace('[PostConfig:handleDate] begins');
        const val = e.target.value;
        setDate(val);
        scheduleSave({ date: val });
        console.trace('[PostConfig:handleDate] ends');
    }

    function handleTags(e) {
        console.trace('[PostConfig:handleTags] begins');
        const val = e.target.value;
        setTags(val);
        scheduleSave({ tags: val });
        console.trace('[PostConfig:handleTags] ends');
    }

    function handleReadTime(e) {
        console.trace('[PostConfig:handleReadTime] begins');
        const val = e.target.value;
        setReadTime(val);
        scheduleSave({ readTime: val });
        console.trace('[PostConfig:handleReadTime] ends');
    }

    function handlePinned(e) {
        console.trace('[PostConfig:handlePinned] begins');
        const val = e.target.checked;
        setPinned(val);
        scheduleSave({ pinned: val });
        console.trace('[PostConfig:handlePinned] ends');
    }

    function handlePinnedOrder(e) {
        console.trace('[PostConfig:handlePinnedOrder] begins');
        const val = e.target.value;
        setPinnedOrder(val);
        scheduleSave({ pinnedOrder: val });
        console.trace('[PostConfig:handlePinnedOrder] ends');
    }

    console.trace('[PostConfig] ends');

    return (
        <div id="post-settings-form" className="visible">

            <div id="post-settings-header">Post Settings</div>

            <div id="post-settings-fields">

                <label>Project Directory</label>
                <input
                    id="ps-projectDir"
                    type="text"
                    readOnly
                    value={state.activePostDir || ''}
                />

                <label>Article Path</label>
                <input
                    id="ps-articlePath"
                    type="text"
                    readOnly
                    value={state.activePostDir && state.activePostSlug
                        ? state.activePostDir + '/artifacts/articles/' + state.activePostSlug
                        : ''}
                />

                <label>Slug</label>
                <input
                    id="ps-slug"
                    type="text"
                    readOnly
                    value={state.activePostSlug || ''}
                />

                <label>Title</label>
                <input
                    id="field-title"
                    type="text"
                    value={title}
                    onChange={handleTitle}
                />

                <label>Description</label>
                <input
                    id="field-desc"
                    type="text"
                    value={description}
                    onChange={handleDescription}
                />

                <label>Date</label>
                <input
                    id="field-date"
                    type="date"
                    value={date}
                    onChange={handleDate}
                />

                <label>Tags (comma-sep)</label>
                <input
                    id="field-tags"
                    type="text"
                    value={tags}
                    onChange={handleTags}
                />

                <label>Read Time</label>
                <input
                    id="field-readtime"
                    type="text"
                    value={readTime}
                    onChange={handleReadTime}
                />

                <label>Pinned</label>
                <input
                    id="field-pinned"
                    type="checkbox"
                    checked={pinned}
                    onChange={handlePinned}
                />

                <label>Pinned Order</label>
                <input
                    id="field-pinned-order"
                    type="text"
                    value={pinnedOrder}
                    onChange={handlePinnedOrder}
                />

            </div>

            <div id="post-settings-status"></div>

        </div>
    );
}
