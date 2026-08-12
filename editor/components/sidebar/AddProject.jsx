'use strict';

import React, { useState } from 'react';

// ----------------------------------------------------------
// AddProject — collapsible tabbed form for adding projects
// Tabs: New | Import | Remote
// Starts collapsed
// ----------------------------------------------------------
export default function AddProject({ onProjectAdded }) {
    console.trace('[AddProject] begins');

    const [sectionOpen, setSectionOpen] = useState(false);
    const [activeTab,   setActiveTab]   = useState('new');

    // New tab state
    const [newParentDir, setNewParentDir] = useState('');
    const [newName,      setNewName]      = useState('');

    // Import tab state
    const [importDir, setImportDir] = useState('');

    // Remote tab state — stub
    const [remoteUrl,  setRemoteUrl]  = useState('');
    const [remoteDest, setRemoteDest] = useState('');

    function handleSectionToggle() {
        console.trace('[AddProject:handleSectionToggle] begins');
        setSectionOpen(function (v) { return !v; });
        console.trace('[AddProject:handleSectionToggle] ends');
    }

    function handleTabClick(tab) {
        console.trace('[AddProject:handleTabClick] begins');
        console.debug('[AddProject:handleTabClick] tab =>', tab);
        setActiveTab(tab);
        console.trace('[AddProject:handleTabClick] ends');
    }

    // ----------------------------------------------------------
    // pickDir — opens OS directory picker
    // ----------------------------------------------------------
    async function pickDir(setter, nameAutoFill) {
        console.trace('[AddProject:pickDir] begins');

        try {
            const dir = await window.api.pickDirectory();
            console.debug('[AddProject:pickDir] picked =>', dir);

            if (!dir) {
                console.trace('[AddProject:pickDir] ends — cancelled');
                return;
            }

            setter(dir);

            if (nameAutoFill) {
                const basename = dir.split('/').filter(Boolean).pop();
                console.debug('[AddProject:pickDir] auto-fill name =>', basename);
                setNewName(function (prev) { return prev || basename; });
            }
        } catch (e) {
            console.debug('[AddProject:pickDir] exception =>', e.message);
        }

        console.trace('[AddProject:pickDir] ends');
    }

    // ----------------------------------------------------------
    // doNewProject — creates a new project via IPC
    // ----------------------------------------------------------
    async function doNewProject() {
        console.trace('[AddProject:doNewProject] begins');
        console.debug('[AddProject:doNewProject] parentDir =>', newParentDir, 'name =>', newName);

        try {
            const result = await window.api.newProject({ parentDir: newParentDir, name: newName });
            console.debug('[AddProject:doNewProject] result =>', result);

            if (!result.ok) {
                console.debug('[AddProject:doNewProject] failed =>', result.error);
                console.trace('[AddProject:doNewProject] ends — error');
                return;
            }

            setNewParentDir('');
            setNewName('');
            setSectionOpen(false);
            onProjectAdded(result.dir);

            console.trace('[AddProject:doNewProject] ends');
        } catch (e) {
            console.debug('[AddProject:doNewProject] exception =>', e.message);
            console.trace('[AddProject:doNewProject] ends — exception');
        }
    }

    // ----------------------------------------------------------
    // doImport — imports an existing project via IPC
    // ----------------------------------------------------------
    async function doImport() {
        console.trace('[AddProject:doImport] begins');
        console.debug('[AddProject:doImport] dir =>', importDir);

        try {
            const result = await window.api.importProject({ dir: importDir });
            console.debug('[AddProject:doImport] result =>', result);

            if (!result.ok) {
                console.debug('[AddProject:doImport] failed =>', result.error);
                console.trace('[AddProject:doImport] ends — error');
                return;
            }

            setImportDir('');
            setSectionOpen(false);
            onProjectAdded(result.dir);

            console.trace('[AddProject:doImport] ends');
        } catch (e) {
            console.debug('[AddProject:doImport] exception =>', e.message);
            console.trace('[AddProject:doImport] ends — exception');
        }
    }

    console.trace('[AddProject] ends');

    return (
        <>
            {/* Section header */}
            <div
                className={'sidebar-section-header' + (sectionOpen ? ' open' : '')}
                onClick={handleSectionToggle}
            >
                <span>Add Project</span>
                <span className="arrow">&#9658;</span>
            </div>

            {/* Section body */}
            <div className={'sidebar-section-body' + (sectionOpen ? ' open' : '')} id="add-project-section">

                {/* Tab strip */}
                <div id="add-project-tabs">
                    <button
                        className={'ap-tab' + (activeTab === 'new'    ? ' active' : '')}
                        onClick={function () { handleTabClick('new'); }}
                    >New</button>
                    <button
                        className={'ap-tab' + (activeTab === 'import' ? ' active' : '')}
                        onClick={function () { handleTabClick('import'); }}
                    >Import</button>
                    <button
                        className={'ap-tab' + (activeTab === 'remote' ? ' active' : '')}
                        onClick={function () { handleTabClick('remote'); }}
                    >Remote</button>
                </div>

                {/* New tab */}
                {activeTab === 'new' && (
                    <div className="ap-form" id="ap-form-new">
                        <label>Parent directory</label>
                        <div className="picker-field">
                            <input
                                id="new-project-parent"
                                type="text"
                                placeholder="/home/user/sites"
                                value={newParentDir}
                                onChange={function (e) { setNewParentDir(e.target.value); }}
                            />
                            <button
                                className="pick-btn"
                                title="Browse"
                                onClick={function () { pickDir(setNewParentDir, true); }}
                            >&#128193;</button>
                        </div>
                        <label>Project name</label>
                        <input
                            id="new-project-name"
                            type="text"
                            placeholder="My Blog"
                            value={newName}
                            onChange={function (e) { setNewName(e.target.value); }}
                        />
                        <div className="ap-form-actions">
                            <button onClick={doNewProject}>Create</button>
                        </div>
                    </div>
                )}

                {/* Import tab */}
                {activeTab === 'import' && (
                    <div className="ap-form" id="ap-form-import">
                        <label>Project directory</label>
                        <div className="picker-field">
                            <input
                                id="import-input"
                                type="text"
                                placeholder="/home/user/sites/my-blog"
                                value={importDir}
                                onChange={function (e) { setImportDir(e.target.value); }}
                            />
                            <button
                                className="pick-btn"
                                title="Browse"
                                onClick={function () { pickDir(setImportDir, false); }}
                            >&#128193;</button>
                        </div>
                        <div className="ap-form-actions">
                            <button onClick={doImport}>Import</button>
                        </div>
                    </div>
                )}

                {/* Remote tab — stub */}
                {activeTab === 'remote' && (
                    <div className="ap-form" id="ap-form-remote">
                        <label>Repo URL</label>
                        <input
                            id="remote-repo-url"
                            type="text"
                            placeholder="https://github.com/user/repo"
                            value={remoteUrl}
                            onChange={function (e) { setRemoteUrl(e.target.value); }}
                        />
                        <label>Local destination</label>
                        <input
                            id="remote-local-dest"
                            type="text"
                            readOnly
                            placeholder="loading..."
                            value={remoteDest}
                        />
                        <div className="ap-form-actions">
                            <button disabled>Import</button>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
