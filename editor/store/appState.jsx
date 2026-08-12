'use strict';

import { createContext, useContext, useReducer } from 'react';

// ----------------------------------------------------------
// Initial state
// ----------------------------------------------------------
const initialState = {
    activeProject:    null,
    activeConfigDir:  null,
    activePostDir:    null,
    activePostSlug:   null,
    currentView:      'welcome',
    statusMsg:        { msg: '', state: 'idle' },
    sidebarCollapsed: false,
    previewUrl:       null,
};

// ----------------------------------------------------------
// Actions
// ----------------------------------------------------------
export const Actions = {
    SET_ACTIVE_PROJECT: 'SET_ACTIVE_PROJECT',
    SET_CONFIG_DIR:     'SET_CONFIG_DIR',
    SET_POST:           'SET_POST',
    SET_VIEW:           'SET_VIEW',
    SET_STATUS:         'SET_STATUS',
    TOGGLE_SIDEBAR:     'TOGGLE_SIDEBAR',
    SET_PREVIEW_URL:    'SET_PREVIEW_URL',
};

// ----------------------------------------------------------
// Reducer
// ----------------------------------------------------------
function reducer(state, action) {
    console.trace('[appState:reducer] begins');
    console.debug('[appState:reducer] action =>', action.type, action.payload);

    let next;

    switch (action.type) {
        case Actions.SET_ACTIVE_PROJECT:
            next = { ...state, activeProject: action.payload };
            break;

        case Actions.SET_CONFIG_DIR:
            next = { ...state, activeConfigDir: action.payload };
            break;

        case Actions.SET_POST:
            next = { ...state, activePostDir: action.payload.dir, activePostSlug: action.payload.slug };
            break;

        case Actions.SET_VIEW:
            next = { ...state, currentView: action.payload };
            break;

        case Actions.SET_STATUS:
            next = { ...state, statusMsg: action.payload };
            break;

        case Actions.TOGGLE_SIDEBAR:
            next = { ...state, sidebarCollapsed: !state.sidebarCollapsed };
            break;

        case Actions.SET_PREVIEW_URL:
            next = { ...state, previewUrl: action.payload };
            break;

        default:
            console.debug('[appState:reducer] unknown action — returning current state');
            next = state;
    }

    console.trace('[appState:reducer] ends');
    return next;
}

// ----------------------------------------------------------
// Context
// ----------------------------------------------------------
export const AppStateContext = createContext(null);

// ----------------------------------------------------------
// Provider
// ----------------------------------------------------------
export function AppStateProvider({ children }) {
    console.trace('[AppStateProvider] begins');

    const [state, dispatch] = useReducer(reducer, initialState);

    console.trace('[AppStateProvider] ends');

    return (
        <AppStateContext.Provider value={{ state, dispatch }}>
            {children}
        </AppStateContext.Provider>
    );
}

// ----------------------------------------------------------
// Hook
// ----------------------------------------------------------
export function useAppState() {
    console.trace('[useAppState] begins');

    const ctx = useContext(AppStateContext);

    if (!ctx) {
        throw new Error('useAppState must be used inside AppStateProvider');
    }

    console.trace('[useAppState] ends');
    return ctx;
}

// ----------------------------------------------------------
// setStatus helper — call from any component
// state: 'idle' | 'success' | 'error' | 'warning'
// success auto-clears after 3s
// ----------------------------------------------------------
export function setStatus(dispatch, msg, state = 'idle') {
    console.trace('[setStatus] begins');
    console.debug('[setStatus] msg =>', msg, 'state =>', state);

    dispatch({ type: Actions.SET_STATUS, payload: { msg, state } });

    if (state === 'success') {
        setTimeout(() => {
            dispatch({ type: Actions.SET_STATUS, payload: { msg: '', state: 'idle' } });
        }, 3000);
    }

    console.trace('[setStatus] ends');
}
