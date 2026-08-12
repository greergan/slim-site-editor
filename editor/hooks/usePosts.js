'use strict';

// ----------------------------------------------------------
// usePosts — load and save post data via IPC
// Used by PostEditor
// ----------------------------------------------------------

// ----------------------------------------------------------
// loadPost — fetch post data from disk
// returns { ok, post } or { ok: false, error }
// ----------------------------------------------------------
export async function loadPost(dir, slug) {
    console.trace('[loadPost] begins');
    console.debug('[loadPost] dir =>', dir, 'slug =>', slug);

    try {
        const result = await window.api.getPost({ dir, slug });
        console.debug('[loadPost] result =>', result);

        if (!result.ok) {
            console.debug('[loadPost] getPost failed =>', result.error);
            console.trace('[loadPost] ends — error');
            return { ok: false, error: result.error || 'unknown' };
        }

        console.debug('[loadPost] post loaded =>', JSON.stringify(result.post).slice(0, 80));
        console.trace('[loadPost] ends');
        return { ok: true, post: result.post };
    } catch (e) {
        console.debug('[loadPost] exception =>', e.message);
        console.trace('[loadPost] ends — exception');
        return { ok: false, error: e.message };
    }
}

// ----------------------------------------------------------
// savePost — write post data to disk
// returns { ok } or { ok: false, error }
// ----------------------------------------------------------
export async function savePost(dir, slug, post) {
    console.trace('[savePost] begins');
    console.debug('[savePost] dir =>', dir, 'slug =>', slug);

    try {
        const result = await window.api.savePost({ dir, slug, post });
        console.debug('[savePost] result =>', result);

        if (!result.ok) {
            console.debug('[savePost] savePost failed =>', result.error);
            console.trace('[savePost] ends — error');
            return { ok: false, error: result.error || 'unknown' };
        }

        console.debug('[savePost] saved ok');
        console.trace('[savePost] ends');
        return { ok: true };
    } catch (e) {
        console.debug('[savePost] exception =>', e.message);
        console.trace('[savePost] ends — exception');
        return { ok: false, error: e.message };
    }
}
