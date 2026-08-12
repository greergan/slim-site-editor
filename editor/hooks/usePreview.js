'use strict';

import { Actions, setStatus } from '../store/appState.jsx';

// ----------------------------------------------------------
// loadInitialPreview — call once on App mount
// Checks if preview server is already running (main process
// starts it automatically for lastActive on launch).
// On success: sets previewUrl and switches to site-preview.
// On failure: silent — no project was active, empty state stays.
// ----------------------------------------------------------
export async function loadInitialPreview(dispatch) {
    console.trace('[loadInitialPreview] begins');

    try {
        const result = await window.api.getPreviewUrl();
        console.debug('[loadInitialPreview] result =>', result);

        if (result.ok && result.url) {
            dispatch({ type: Actions.SET_PREVIEW_URL, payload: result.url });
            dispatch({ type: Actions.SET_VIEW,        payload: 'site-preview' });
            console.debug('[loadInitialPreview] preview url set =>', result.url);
        } else {
            console.debug('[loadInitialPreview] no preview server running =>', result.error);
        }
    } catch (e) {
        console.debug('[loadInitialPreview] error =>', e.message);
    }

    console.trace('[loadInitialPreview] ends');
}
