'use strict';

import React, { useEffect, useState } from 'react';

// ----------------------------------------------------------
// ArticleList — loads and renders articles for a project
// First item is always "Site Settings"
// Each article has a "Settings" child link
// ----------------------------------------------------------
export default function ArticleList({ dir, activeSlug, activeConfigSlug, onOpenConfig, onOpenPost, onOpenPostConfig }) {
    console.trace('[ArticleList] begins');

    const [posts, setPosts] = useState([]);

    // ----------------------------------------------------------
    // Load posts from IPC on mount or dir change
    // ----------------------------------------------------------
    useEffect(function () {
        console.trace('[ArticleList:useEffect:loadPosts] begins');

        async function load() {
            console.debug('[ArticleList:useEffect:loadPosts] loading dir =>', dir);

            try {
                const result = await window.api.listPosts({ dir });
                console.debug('[ArticleList:useEffect:loadPosts] result =>', result);

                if (!result.ok) {
                    console.debug('[ArticleList:useEffect:loadPosts] listPosts failed =>', result.error);
                    return;
                }

                setPosts(result.posts || []);
                console.debug('[ArticleList:useEffect:loadPosts] posts =>', result.posts.length);
            } catch (e) {
                console.debug('[ArticleList:useEffect:loadPosts] exception =>', e.message);
            }
        }

        load();

        console.trace('[ArticleList:useEffect:loadPosts] ends');
    }, [dir]);

    function handleOpenConfig(e) {
        console.trace('[ArticleList:handleOpenConfig] begins');
        e.stopPropagation();
        onOpenConfig(dir);
        console.trace('[ArticleList:handleOpenConfig] ends');
    }

    function handleOpenPost(e, slug) {
        console.trace('[ArticleList:handleOpenPost] begins');
        e.stopPropagation();
        onOpenPost(dir, slug);
        console.trace('[ArticleList:handleOpenPost] ends');
    }

    function handleOpenPostConfig(e, slug) {
        console.trace('[ArticleList:handleOpenPostConfig] begins');
        e.stopPropagation();
        onOpenPostConfig(dir, slug);
        console.trace('[ArticleList:handleOpenPostConfig] ends');
    }

    console.trace('[ArticleList] ends');

    return (
        <>
            {/* Site Settings — first child under every project */}
            <div
                className={'config-nav-item' + (activeConfigSlug === '__site__' ? ' selected' : '')}
                onClick={handleOpenConfig}
            >
                Site Settings
            </div>

            {/* Article rows */}
            {posts.map(function (post) {
                return (
                    <div key={post.slug} className="article-group">
                        <div
                            className={'article-item' + (activeSlug === post.slug ? ' selected' : '')}
                            onClick={function (e) { handleOpenPost(e, post.slug); }}
                        >
                            {post.title || post.slug}
                        </div>
                        <div
                            className={'article-config-item' + (activeConfigSlug === post.slug ? ' selected' : '')}
                            onClick={function (e) { handleOpenPostConfig(e, post.slug); }}
                        >
                            Settings
                        </div>
                    </div>
                );
            })}
        </>
    );
}
