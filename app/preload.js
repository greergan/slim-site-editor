'use strict';
// =============================================================
// preload.js — context bridge
// Exposes window.api to renderer
// IPC calls to be wired in next phase
// =============================================================
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
    // app info — ipcRenderer.invoke so main process reads package.json
    appName:        () => ipcRenderer.invoke('app-name'),
    // native OS directory picker
    pickDirectory:  () => ipcRenderer.invoke('pick-directory'),
    // project registry
    listProjects:   () => ipcRenderer.invoke('list-projects'),
    newProject:     (args) => ipcRenderer.invoke('new-project', args),
    importProject:  (args) => ipcRenderer.invoke('import-project', args),
    removeProject:  (args) => ipcRenderer.invoke('remove-project', args),
    setActive:      (args) => ipcRenderer.invoke('set-active-project', args),
    archiveProject: (args) => ipcRenderer.invoke('archive-project', args),
    // app config
    getAppConfig:   () => ipcRenderer.invoke('get-app-config'),
    saveAppConfig:  (config) => ipcRenderer.invoke('save-app-config', config),
    // project config
    getConfig:      (args) => ipcRenderer.invoke('get-config', args),
    saveConfig:     (args) => ipcRenderer.invoke('save-config', args),
    // posts
    listPosts:      (args) => ipcRenderer.invoke('list-posts', args),
    getPost:        (args) => ipcRenderer.invoke('get-post', args),
    savePost:       (args) => ipcRenderer.invoke('save-post', args),
    // build
    triggerBuild:   () => ipcRenderer.invoke('trigger-build'),
});
