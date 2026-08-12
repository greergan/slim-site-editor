'use strict';

import { useState, useCallback } from 'react';

// ----------------------------------------------------------
// useProjects — wraps project-related IPC calls
// Returns:
//   projects     — array of { name, dir }
//   lastActive   — dir string of last active project
//   loadProjects — reload projects from IPC
//   activateProject — set active project via IPC
//   removeProject   — delete project via IPC
//   archiveProject  — archive project via IPC (stub)
// ----------------------------------------------------------
export function useProjects() {
    console.trace('[useProjects] begins');

    const [projects,   setProjects]   = useState([]);
    const [lastActive, setLastActive] = useState(null);

    // ----------------------------------------------------------
    // loadProjects — fetches project list from main process
    // ----------------------------------------------------------
    const loadProjects = useCallback(async function () {
        console.trace('[useProjects:loadProjects] begins');

        try {
            const result = await window.api.listProjects();
            console.debug('[useProjects:loadProjects] result =>', result);

            if (!result.ok) {
                console.debug('[useProjects:loadProjects] listProjects failed =>', result.error);
                console.trace('[useProjects:loadProjects] ends — error');
                return { ok: false, error: result.error };
            }

            setProjects(result.projects || []);
            setLastActive(result.lastActive || null);

            console.debug('[useProjects:loadProjects] projects =>', result.projects.length);
            console.trace('[useProjects:loadProjects] ends');
            return { ok: true };
        } catch (e) {
            console.debug('[useProjects:loadProjects] exception =>', e.message);
            console.trace('[useProjects:loadProjects] ends — exception');
            return { ok: false, error: e.message };
        }
    }, []);

    // ----------------------------------------------------------
    // activateProject — sets active project, starts preview server
    // Returns { ok, url } or { ok, error }
    // ----------------------------------------------------------
    const activateProject = useCallback(async function (dir) {
        console.trace('[useProjects:activateProject] begins');
        console.debug('[useProjects:activateProject] dir =>', dir);

        try {
            const result = await window.api.setActive({ dir });
            console.debug('[useProjects:activateProject] result =>', result);

            if (!result.ok) {
                console.debug('[useProjects:activateProject] setActive failed =>', result.error);
                console.trace('[useProjects:activateProject] ends — error');
                return { ok: false, error: result.error };
            }

            setLastActive(dir);

            console.trace('[useProjects:activateProject] ends');
            return { ok: true, url: result.url || null };
        } catch (e) {
            console.debug('[useProjects:activateProject] exception =>', e.message);
            console.trace('[useProjects:activateProject] ends — exception');
            return { ok: false, error: e.message };
        }
    }, []);

    // ----------------------------------------------------------
    // removeProject — deletes project from disk and registry
    // Returns { ok } or { ok, error }
    // ----------------------------------------------------------
    const removeProject = useCallback(async function (dir) {
        console.trace('[useProjects:removeProject] begins');
        console.debug('[useProjects:removeProject] dir =>', dir);

        try {
            const result = await window.api.removeProject({ dir });
            console.debug('[useProjects:removeProject] result =>', result);

            if (!result.ok) {
                console.debug('[useProjects:removeProject] removeProject failed =>', result.error);
                console.trace('[useProjects:removeProject] ends — error');
                return { ok: false, error: result.error };
            }

            // refresh project list after delete
            await loadProjects();

            console.trace('[useProjects:removeProject] ends');
            return { ok: true };
        } catch (e) {
            console.debug('[useProjects:removeProject] exception =>', e.message);
            console.trace('[useProjects:removeProject] ends — exception');
            return { ok: false, error: e.message };
        }
    }, [loadProjects]);

    // ----------------------------------------------------------
    // archiveProject — stub, IPC not yet wired
    // Returns { ok }
    // ----------------------------------------------------------
    const archiveProject = useCallback(async function (dir) {
        console.trace('[useProjects:archiveProject] begins');
        console.debug('[useProjects:archiveProject] dir =>', dir, '— stub');

        try {
            const result = await window.api.archiveProject({ dir });
            console.debug('[useProjects:archiveProject] result =>', result);
            console.trace('[useProjects:archiveProject] ends');
            return { ok: true };
        } catch (e) {
            console.debug('[useProjects:archiveProject] exception =>', e.message);
            console.trace('[useProjects:archiveProject] ends — exception');
            return { ok: false, error: e.message };
        }
    }, []);

    console.trace('[useProjects] ends');

    return {
        projects,
        lastActive,
        loadProjects,
        activateProject,
        removeProject,
        archiveProject,
    };
}
