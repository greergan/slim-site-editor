'use strict';

import React, { useState, useEffect, useRef } from 'react';

// ----------------------------------------------------------
// ProjectRow — single project row with expand/collapse
// and context menu for Delete and Archive
// ----------------------------------------------------------
export default function ProjectRow({ proj, isActive, isOpen, onActivate, onToggle, onRemove, onArchive, children }) {
    console.trace('[ProjectRow] begins');

    const [menuVisible, setMenuVisible] = useState(false);
    const menuRef                        = useRef(null);
    const ellipsisRef                    = useRef(null);

    // ----------------------------------------------------------
    // Close context menu on outside click
    // ----------------------------------------------------------
    useEffect(function () {
        console.trace('[ProjectRow:useEffect:outsideClick] begins');

        function handleOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target) &&
                ellipsisRef.current && !ellipsisRef.current.contains(e.target)) {
                setMenuVisible(false);
            }
        }

        document.addEventListener('click', handleOutside);

        console.trace('[ProjectRow:useEffect:outsideClick] ends');
        return function () {
            document.removeEventListener('click', handleOutside);
        };
    }, []);

    function handleRowClick() {
        console.trace('[ProjectRow:handleRowClick] begins');
        onToggle(proj.dir);
        onActivate(proj.dir);
        console.trace('[ProjectRow:handleRowClick] ends');
    }

    function handleEllipsis(e) {
        console.trace('[ProjectRow:handleEllipsis] begins');
        e.stopPropagation();
        setMenuVisible(function (v) { return !v; });
        console.trace('[ProjectRow:handleEllipsis] ends');
    }

    function handleDelete(e) {
        console.trace('[ProjectRow:handleDelete] begins');
        e.stopPropagation();
        setMenuVisible(false);
        const ok = window.confirm('Delete project "' + proj.dir + '"?');
        if (!ok) {
            console.trace('[ProjectRow:handleDelete] ends — cancelled');
            return;
        }
        onRemove(proj.dir);
        console.trace('[ProjectRow:handleDelete] ends');
    }

    function handleArchive(e) {
        console.trace('[ProjectRow:handleArchive] begins');
        e.stopPropagation();
        setMenuVisible(false);
        onArchive(proj.dir);
        console.trace('[ProjectRow:handleArchive] ends');
    }

    const rowClass = [
        'project-row',
        isActive ? 'active-project' : '',
        isOpen   ? 'open'           : '',
    ].filter(Boolean).join(' ');

    console.trace('[ProjectRow] ends');

    return (
        <>
            <div className={rowClass} onClick={handleRowClick}>
                <span>
                    <span className="proj-arrow">&#9658;</span>
                    {proj.name}
                </span>
                <span
                    ref={ellipsisRef}
                    style={{ fontSize: '10px', color: '#555' }}
                    title={proj.dir}
                    onClick={handleEllipsis}
                >
                    &#8943;
                </span>

                {/* Context menu */}
                {menuVisible && (
                    <div
                        ref={menuRef}
                        style={{
                            position:    'absolute',
                            right:       '8px',
                            top:         '100%',
                            zIndex:      9999,
                            background:  '#1e1e1e',
                            border:      '1px solid #444',
                            borderRadius:'4px',
                            minWidth:    '100px',
                            boxShadow:   '0 2px 8px rgba(0,0,0,0.5)',
                        }}
                    >
                        <div
                            className="ctx-menu-item"
                            onClick={handleDelete}
                            style={{ padding: '6px 14px', fontSize: '12px', cursor: 'pointer', color: '#ccc' }}
                        >
                            Delete
                        </div>
                        <div
                            className="ctx-menu-item"
                            onClick={handleArchive}
                            style={{ padding: '6px 14px', fontSize: '12px', cursor: 'pointer', color: '#ccc' }}
                        >
                            Archive
                        </div>
                    </div>
                )}
            </div>

            {/* Article list — shown when open */}
            {isOpen && (
                <div className={'article-list open'}>
                    {children}
                </div>
            )}
        </>
    );
}
