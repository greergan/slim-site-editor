'use strict';

import React, { useState, useEffect, useRef } from 'react';
import Quill                                   from 'quill';
import { useAppState, setStatus }              from '../../store/appState.jsx';
import { loadPost, savePost }                  from '../../hooks/usePosts.js';

// ----------------------------------------------------------
// PostEditor — Quill rich text editor with split live preview
// Loads post on activePostDir/activePostSlug change
// Debounced auto-save on text or meta change
// ----------------------------------------------------------
export default function PostEditor() {
    console.trace('[PostEditor] begins');

    const { state, dispatch } = useAppState();

    const [viewMode,     setViewMode]     = useState('split');
    const [title,        setTitle]        = useState('');
    const [description,  setDescription]  = useState('');
    const [date,         setDate]         = useState('');
    const [tags,         setTags]         = useState('');
    const [readTime,     setReadTime]     = useState('');
    const [pinned,       setPinned]       = useState(false);
    const [pinnedOrder,  setPinnedOrder]  = useState('');

    const quillRef       = useRef(null);  // Quill instance
    const editorDivRef   = useRef(null);  // DOM node Quill mounts into
    const saveTimerRef   = useRef(null);
    const dirRef         = useRef(null);
    const slugRef        = useRef(null);
    const artifactsDirRef = useRef(null);

    // ----------------------------------------------------------
    // Init Quill once on mount
    // ----------------------------------------------------------
    useEffect(function () {
        console.trace('[PostEditor:useEffect:initQuill] begins');

        if (quillRef.current) {
            console.debug('[PostEditor:useEffect:initQuill] already initialized — skipping');
            console.trace('[PostEditor:useEffect:initQuill] ends — skip');
            return;
        }

        if (!editorDivRef.current) {
            console.debug('[PostEditor:useEffect:initQuill] editorDivRef not ready');
            console.trace('[PostEditor:useEffect:initQuill] ends — no ref');
            return;
        }

        quillRef.current = new Quill(editorDivRef.current, {
            theme: 'snow',
            placeholder: 'Post body...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'header': 2 }, { 'header': 3 }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['blockquote', 'code-block'],
                    ['link'],
                    ['clean'],
                ],
            },
        });

        console.debug('[PostEditor:useEffect:initQuill] Quill instance created');

        // on text change — update preview + debounced save
        quillRef.current.on('text-change', function (delta, oldDelta, source) {
            console.debug('[PostEditor:quill:text-change] source =>', source);
            const html = quillRef.current.root.innerHTML;
            updatePreview(html);
            scheduleSave({ body: html });
        });

        console.trace('[PostEditor:useEffect:initQuill] ends');
    }, []);

    // ----------------------------------------------------------
    // Load post when activePostDir/activePostSlug changes
    // ----------------------------------------------------------
    useEffect(function () {
        console.trace('[PostEditor:useEffect:loadPost] begins');

        const dir  = state.activePostDir;
        const slug = state.activePostSlug;

        console.debug('[PostEditor:useEffect:loadPost] dir =>', dir, 'slug =>', slug);

        if (!dir || !slug) {
            console.debug('[PostEditor:useEffect:loadPost] no dir/slug — skipping');
            console.trace('[PostEditor:useEffect:loadPost] ends — no dir/slug');
            return;
        }

        dirRef.current          = dir;
        slugRef.current         = slug;
        artifactsDirRef.current = dir + '/artifacts';

        console.debug('[PostEditor:useEffect:loadPost] artifactsDir =>', artifactsDirRef.current);

        async function load() {
            const res = await loadPost(dir, slug);

            if (!res.ok) {
                setStatus(dispatch, 'Error loading post: ' + res.error, 'error');
                console.trace('[PostEditor:useEffect:loadPost] ends — load error');
                return;
            }

            const post = res.post;

            console.debug('[PostEditor:useEffect:loadPost] post loaded =>', slug);

            setTitle(post.title           || '');
            setDescription(post.description || '');
            setDate(post.date             || '');
            setTags(Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''));
            setReadTime(post.readTime     || '');
            setPinned(!!post.pinned);
            setPinnedOrder(post.pinnedOrder || '');

            // load body into Quill
            if (quillRef.current) {
                quillRef.current.setContents([]);
                quillRef.current.clipboard.dangerouslyPasteHTML(0, post.body || '');
                console.debug('[PostEditor:useEffect:loadPost] Quill body loaded');
                updatePreview(post.body || '');
            }

            setStatus(dispatch, '', 'idle');
        }

        load();

        console.trace('[PostEditor:useEffect:loadPost] ends — load called');
    }, [state.activePostDir, state.activePostSlug, dispatch]);

    // ----------------------------------------------------------
    // updatePreview — writes themed srcdoc into preview iframe
    // ----------------------------------------------------------
    function updatePreview(body) {
        console.trace('[PostEditor:updatePreview] begins');

        const frame        = document.getElementById('post-preview-frame');
        const artifactsDir = artifactsDirRef.current;

        if (!frame) {
            console.debug('[PostEditor:updatePreview] frame not found — skipping');
            console.trace('[PostEditor:updatePreview] ends — no frame');
            return;
        }

        if (!artifactsDir) {
            console.debug('[PostEditor:updatePreview] no artifactsDir — rendering plain');
            frame.srcdoc = body || '';
            console.trace('[PostEditor:updatePreview] ends — plain');
            return;
        }

        const cssPath = 'file://' + artifactsDir + '/assets/style.css';
        const jsPath  = 'file://' + artifactsDir + '/assets/theme.js';

        console.debug('[PostEditor:updatePreview] cssPath =>', cssPath);

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
            '</html>',
        ].join('\n');

        frame.srcdoc = srcdoc;

        console.trace('[PostEditor:updatePreview] ends');
    }

    // ----------------------------------------------------------
    // scheduleSave — debounced 800ms save
    // ----------------------------------------------------------
    function scheduleSave(overrides) {
        console.trace('[PostEditor:scheduleSave] begins');

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            console.debug('[PostEditor:scheduleSave] cleared existing timer');
        }

        saveTimerRef.current = setTimeout(async function () {
            console.debug('[PostEditor:scheduleSave] debounce fired — saving');
            saveTimerRef.current = null;

            const dir  = dirRef.current;
            const slug = slugRef.current;

            if (!dir || !slug) {
                console.debug('[PostEditor:scheduleSave] no dir/slug — skipping');
                console.trace('[PostEditor:scheduleSave] ends — no dir/slug');
                return;
            }

            const tagsRaw = overrides.tags !== undefined ? overrides.tags : tags;
            const tagList = tagsRaw.split(',').map(function (t) { return t.trim(); }).filter(Boolean);

            const post = {
                slug:        slug,
                title:       overrides.title        !== undefined ? overrides.title        : title,
                description: overrides.description  !== undefined ? overrides.description  : description,
                date:        overrides.date         !== undefined ? overrides.date         : date,
                readTime:    overrides.readTime     !== undefined ? overrides.readTime     : readTime,
                tags:        tagList,
                pinned:      overrides.pinned       !== undefined ? overrides.pinned       : pinned,
                pinnedOrder: overrides.pinnedOrder  !== undefined ? overrides.pinnedOrder  : pinnedOrder,
                body:        overrides.body         !== undefined ? overrides.body         : (quillRef.current ? quillRef.current.root.innerHTML : ''),
            };

            console.debug('[PostEditor:scheduleSave] saving =>', slug);

            const res = await savePost(dir, slug, post);

            if (!res.ok) {
                setStatus(dispatch, 'Save failed: ' + res.error, 'error');
                console.trace('[PostEditor:scheduleSave] ends — save error');
                return;
            }

            setStatus(dispatch, 'post saved: ' + slug, 'success');
            console.trace('[PostEditor:scheduleSave] ends — saved');
        }, 800);

        console.trace('[PostEditor:scheduleSave] ends — timer set');
    }

    // ----------------------------------------------------------
    // View mode toggle
    // ----------------------------------------------------------
    function handleViewMode(mode) {
        console.trace('[PostEditor:handleViewMode] begins');
        console.debug('[PostEditor:handleViewMode] mode =>', mode);
        setViewMode(mode);
        console.trace('[PostEditor:handleViewMode] ends');
    }

    // ----------------------------------------------------------
    // Meta field change handlers
    // ----------------------------------------------------------
    function handleTitle(e) {
        console.trace('[PostEditor:handleTitle] begins');
        const val = e.target.value;
        setTitle(val);
        scheduleSave({ title: val });
        console.trace('[PostEditor:handleTitle] ends');
    }

    function handleDescription(e) {
        console.trace('[PostEditor:handleDescription] begins');
        const val = e.target.value;
        setDescription(val);
        scheduleSave({ description: val });
        console.trace('[PostEditor:handleDescription] ends');
    }

    function handleDate(e) {
        console.trace('[PostEditor:handleDate] begins');
        const val = e.target.value;
        setDate(val);
        scheduleSave({ date: val });
        console.trace('[PostEditor:handleDate] ends');
    }

    function handleTags(e) {
        console.trace('[PostEditor:handleTags] begins');
        const val = e.target.value;
        setTags(val);
        scheduleSave({ tags: val });
        console.trace('[PostEditor:handleTags] ends');
    }

    function handleReadTime(e) {
        console.trace('[PostEditor:handleReadTime] begins');
        const val = e.target.value;
        setReadTime(val);
        scheduleSave({ readTime: val });
        console.trace('[PostEditor:handleReadTime] ends');
    }

    function handlePinned(e) {
        console.trace('[PostEditor:handlePinned] begins');
        const val = e.target.checked;
        setPinned(val);
        scheduleSave({ pinned: val });
        console.trace('[PostEditor:handlePinned] ends');
    }

    function handlePinnedOrder(e) {
        console.trace('[PostEditor:handlePinnedOrder] begins');
        const val = e.target.value;
        setPinnedOrder(val);
        scheduleSave({ pinnedOrder: val });
        console.trace('[PostEditor:handlePinnedOrder] ends');
    }

    const workAreaClass = 'mode-' + viewMode;

    console.trace('[PostEditor] ends');

    return (
        <div id="post-editor" className="visible">

            {/* View mode toggle bar */}
            <div id="view-bar" className="visible">
                <button
                    className={'view-btn' + (viewMode === 'edit'    ? ' active' : '')}
                    id="vbtn-edit"
                    onClick={function () { handleViewMode('edit'); }}
                >Edit</button>
                <button
                    className={'view-btn' + (viewMode === 'split'   ? ' active' : '')}
                    id="vbtn-split"
                    onClick={function () { handleViewMode('split'); }}
                >Split</button>
                <button
                    className={'view-btn' + (viewMode === 'preview' ? ' active' : '')}
                    id="vbtn-preview"
                    onClick={function () { handleViewMode('preview'); }}
                >Preview</button>
            </div>

            {/* Work area */}
            <div id="work-area" className={'visible ' + workAreaClass}>

                {/* Edit pane */}
                <div id="edit-pane">
                    <div id="body-editor" ref={editorDivRef}></div>

                    {/* Save bar */}
                    <div id="save-bar">
                        <span id="save-status"></span>
                    </div>
                </div>

                {/* Preview pane */}
                <div id="preview-pane">
                    <div id="preview-label">Live Preview</div>
                    <iframe
                        id="post-preview-frame"
                        sandbox="allow-scripts allow-same-origin"
                    ></iframe>
                </div>

            </div>

        </div>
    );
}
