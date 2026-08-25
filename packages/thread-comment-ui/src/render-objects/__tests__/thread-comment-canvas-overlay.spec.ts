/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Vector2 } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { groupThreadCommentCanvasMarkers, ThreadCommentCanvasOverlay } from '../thread-comment-canvas-overlay';

describe('ThreadCommentCanvasOverlay', () => {
    it('groups comments at the same canvas anchor and keeps the newest one clickable', () => {
        expect(groupThreadCommentCanvasMarkers([
            { commentId: 'first-comment', x: 100, y: 100 },
            { commentId: 'other-position', x: 120, y: 100 },
            { commentId: 'newest-comment', x: 100, y: 100 },
        ])).toEqual([
            {
                commentId: 'newest-comment',
                commentIds: ['first-comment', 'newest-comment'],
                count: 2,
                x: 100,
                y: 100,
            },
            {
                commentId: 'other-position',
                commentIds: ['other-position'],
                count: 1,
                x: 120,
                y: 100,
            },
        ]);
    });

    it('decrements and removes an anchor marker as root comments resolve or delete', () => {
        const comments = [
            { commentId: 'first-comment', x: 100, y: 100 },
            { commentId: 'second-comment', x: 100, y: 100 },
        ];

        expect(groupThreadCommentCanvasMarkers(comments)[0]).toEqual(expect.objectContaining({ count: 2 }));
        expect(groupThreadCommentCanvasMarkers(comments.slice(1))[0]).toEqual(expect.objectContaining({ count: 1 }));
        expect(groupThreadCommentCanvasMarkers([])).toEqual([]);
    });

    it('repaints pointer previews immediately without debounce', () => {
        const overlay = new ThreadCommentCanvasOverlay('test-comment-preview', {
            accentColor: 'yellow',
            foregroundColor: 'black',
            outlineColor: 'white',
            zoomRatio: 1,
            markers: [],
            underlines: [],
        });
        const immediate = vi.spyOn(overlay, 'makeDirtyNoDebounce');
        const debounced = vi.spyOn(overlay, 'makeDirty');

        overlay.updateState({ previewMarker: { x: 10, y: 20 }, previewUnderline: null });

        expect(immediate).toHaveBeenCalledWith(true);
        expect(debounced).not.toHaveBeenCalled();
    });

    it('hits saved position markers and element underlines at the current zoom', () => {
        const overlay = new ThreadCommentCanvasOverlay('test-comment-overlay', {
            accentColor: 'yellow',
            foregroundColor: 'black',
            outlineColor: 'white',
            zoomRatio: 2,
            markers: [{ commentId: 'position-comment', x: 100, y: 100 }],
            underlines: [{ commentId: 'element-comment', left: 20, top: 40, width: 60 }],
            previewMarker: { x: 200, y: 200 },
        });

        expect(overlay.isHit(new Vector2(105, 100))).toBe(true);
        expect(overlay.hitCommentId).toBe('position-comment');
        expect(overlay.isHit(new Vector2(50, 41))).toBe(true);
        expect(overlay.hitCommentId).toBe('element-comment');
        expect(overlay.isHit(new Vector2(200, 200))).toBe(false);
        expect(overlay.hitCommentId).toBeNull();
    });

    it('clears a stale hit when its comment is removed or resolved', () => {
        const overlay = new ThreadCommentCanvasOverlay('test-comment-overlay', {
            accentColor: 'yellow',
            foregroundColor: 'black',
            outlineColor: 'white',
            zoomRatio: 1,
            markers: [{ commentId: 'removed-comment', x: 100, y: 100 }],
            underlines: [],
        });

        expect(overlay.isHit(new Vector2(100, 100))).toBe(true);
        expect(overlay.hitCommentId).toBe('removed-comment');

        overlay.updateState({ markers: [] });

        expect(overlay.hitCommentId).toBeNull();
        expect(overlay.isHit(new Vector2(100, 100))).toBe(false);
    });

    it('uses the topmost saved marker for overlapping comments', () => {
        const overlay = new ThreadCommentCanvasOverlay('test-comment-overlay', {
            accentColor: 'yellow',
            foregroundColor: 'black',
            outlineColor: 'white',
            zoomRatio: 0.5,
            markers: [
                { commentId: 'first-comment', x: 100, y: 100 },
                { commentId: 'top-comment', x: 100, y: 100 },
            ],
            underlines: [{ commentId: 'element-comment', left: 80, top: 100, width: 40 }],
        });

        expect(overlay.isHit(new Vector2(100, 100))).toBe(true);
        expect(overlay.hitCommentId).toBe('top-comment');
    });

    it('keeps an aggregated marker focused for every comment at the same anchor', () => {
        const overlay = new ThreadCommentCanvasOverlay('test-comment-group', {
            accentColor: 'yellow',
            foregroundColor: 'black',
            outlineColor: 'white',
            zoomRatio: 1,
            markers: [{
                commentId: 'newest-comment',
                commentIds: ['older-comment', 'newest-comment'],
                count: 2,
                x: 100,
                y: 100,
            }],
            underlines: [],
            focusedCommentIds: ['older-comment'],
        });
        const renderMarker = vi.fn();
        Reflect.set(overlay, '_renderMarker', renderMarker);

        overlay.render(undefined as never, undefined as never);

        expect(renderMarker).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({ commentId: 'newest-comment', count: 2 }),
            1,
            1
        );
        expect(overlay.isHit(new Vector2(100, 100))).toBe(true);
        expect(overlay.hitCommentId).toBe('newest-comment');
    });

    it('reconciles underline hit geometry after an object transform and restore', () => {
        const overlay = new ThreadCommentCanvasOverlay('test-comment-overlay', {
            accentColor: 'yellow',
            foregroundColor: 'black',
            outlineColor: 'white',
            zoomRatio: 1.25,
            markers: [],
            underlines: [{ commentId: 'element-comment', left: 20, top: 40, width: 60 }],
        });

        expect(overlay.isHit(new Vector2(50, 41))).toBe(true);

        overlay.updateState({
            underlines: [{ commentId: 'element-comment', left: 140, top: 180, width: 120 }],
        });
        expect(overlay.isHit(new Vector2(50, 41))).toBe(false);
        expect(overlay.isHit(new Vector2(200, 181))).toBe(true);

        overlay.updateState({ underlines: [] });
        expect(overlay.isHit(new Vector2(200, 181))).toBe(false);
        overlay.updateState({
            underlines: [{ commentId: 'element-comment', left: 140, top: 180, width: 120 }],
        });
        expect(overlay.isHit(new Vector2(200, 181))).toBe(true);
    });

    it('renders outlines for both selected and hovered object comments', () => {
        const overlay = new ThreadCommentCanvasOverlay('test-comment-focus', {
            accentColor: 'yellow',
            foregroundColor: 'black',
            outlineColor: 'white',
            zoomRatio: 1,
            markers: [],
            underlines: [],
            focusedCommentIds: ['selected-comment', 'hovered-comment'],
            focusOutlines: [
                { left: 10, top: 20, width: 100, height: 60 },
                { left: 140, top: 80, width: 120, height: 80 },
            ],
        });
        const renderOutline = vi.fn();
        Reflect.set(overlay, '_renderOutline', renderOutline);

        Reflect.apply(overlay.render, overlay, [undefined, undefined]);

        expect(renderOutline).toHaveBeenCalledTimes(2);
    });
});
