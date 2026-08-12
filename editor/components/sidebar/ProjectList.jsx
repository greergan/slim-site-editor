'use strict';

import React, { useState, useEffect }  from 'react';
import ProjectRow            from './ProjectRow.jsx';
import ArticleList           from './ArticleList.jsx';

// ----------------------------------------------------------
// ProjectList — collapsible accordion of all projects
// Starts expanded
// ----------------------------------------------------------
export default function ProjectList({ projects, lastActive, expandDir, onActivate, onRemove, onArchive, onOpenConfig, onOpenPost, onOpenPostConfig, activeSlug, activeConfigSlug }) {
    console.trace('[ProjectList] begins');

    const [sectionOpen, setSectionOpen] = useState(true);
    const [openDirs,    setOpenDirs]    = useState({});

    // ----------------------------------------------------------
    // Expand a specific row when expandDir changes
    // ----------------------------------------------------------
    useEffect(function () {
        console.trace('[ProjectList:useEffect:expandDir] begins');
        console.debug('[ProjectList:useEffect:expandDir] expandDir =>', expandDir);

        if (expandDir) {
            setOpenDirs(function (prev) {
                return { ...prev, [expandDir]: true };
            });
        }

        console.trace('[ProjectList:useEffect:expandDir] ends');
    }, [expandDir]);

    function handleSectionToggle() {
        console.trace('[ProjectList:handleSectionToggle] begins');
        setSectionOpen(function (v) { return !v; });
        console.trace('[ProjectList:handleSectionToggle] ends');
    }

    function handleRowToggle(dir) {
        console.trace('[ProjectList:handleRowToggle] begins');
        console.debug('[ProjectList:handleRowToggle] dir =>', dir);
        setOpenDirs(function (prev) {
            return { ...prev, [dir]: !prev[dir] };
        });
        console.trace('[ProjectList:handleRowToggle] ends');
    }

    console.trace('[ProjectList] ends');

    return (
        <>
            {/* Section header */}
            <div
                className={'sidebar-section-header' + (sectionOpen ? ' open' : '')}
                onClick={handleSectionToggle}
            >
                <span>Projects</span>
                <span className="arrow">&#9658;</span>
            </div>

            {/* Section body */}
            <div className={'sidebar-section-body' + (sectionOpen ? ' open' : '')} id="projects-section">
                {projects.map(function (proj) {
                    return (
                        <ProjectRow
                            key={proj.dir}
                            proj={proj}
                            isActive={proj.dir === lastActive}
                            isOpen={!!openDirs[proj.dir]}
                            onActivate={onActivate}
                            onToggle={handleRowToggle}
                            onRemove={onRemove}
                            onArchive={onArchive}
                        >
                            <ArticleList
                                dir={proj.dir}
                                activeSlug={activeSlug}
                                activeConfigSlug={activeConfigSlug}
                                onOpenConfig={onOpenConfig}
                                onOpenPost={onOpenPost}
                                onOpenPostConfig={onOpenPostConfig}
                            />
                        </ProjectRow>
                    );
                })}
            </div>
        </>
    );
}
