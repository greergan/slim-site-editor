'use strict';

import React          from 'react';
import { useAppState } from '../../store/appState.jsx';

// ----------------------------------------------------------
// SitePreview — iframe that fills the main area
// Shown when currentView === 'site-preview'
// iframe stays mounted when hidden so server keeps running
// ----------------------------------------------------------
export default function SitePreview() {
    console.trace('[SitePreview] begins');

    const { state } = useAppState();

    console.debug('[SitePreview] previewUrl =>', state.previewUrl);
    console.debug('[SitePreview] currentView =>', state.currentView);

    const visible = state.currentView === 'site-preview';

    console.trace('[SitePreview] ends');

    return (
        <iframe
            id="site-preview-frame"
            src={state.previewUrl || ''}
            sandbox="allow-scripts allow-same-origin"
            style={{ display: visible ? 'block' : 'none' }}
        />
    );
}
