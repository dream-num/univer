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

import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import { Vector2 } from '@univerjs/engine-render';
import { serializeThreadCommentAnchor, ThreadCommentAnchorKind } from '@univerjs/thread-comment';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetsThreadCommentDrawingRenderController } from '../drawing.render-controller';

describe('SheetsThreadCommentDrawingRenderController', () => {
    it('aggregates drawing roots, follows transforms, and retains the remaining root after deletion', () => {
        const worksheet = { getSheetId: () => 'sheet-1', getZoomRatio: () => 2 };
        const activeSheet$ = new BehaviorSubject(worksheet);
        const workbook = { activeSheet$, getActiveSheet: () => worksheet };
        const drawingKey = getDrawingShapeKeyByDrawingSearch({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            drawingId: 'shape-1',
        });
        let bounds = { left: 20, top: 40, width: 80, height: 60 };
        let roots = ['first-comment', 'newest-comment'];
        const scene = {
            addObject: vi.fn(),
            getObjectIncludeInGroup: vi.fn((key: string) => key === drawingKey ? { getRealBound: () => bounds } : null),
            getObject: vi.fn(),
        };
        const context = {
            unitId: 'book-1',
            unit: workbook,
            scene,
            engine: { onTransformChange$: { subscribeEvent: vi.fn(() => ({ dispose: vi.fn() })) } },
        };
        const commentUpdate$ = new Subject<{ unitId: string }>();
        const ref = serializeThreadCommentAnchor({
            kind: ThreadCommentAnchorKind.SHEET_DRAWING,
            pageId: 'sheet-1',
            elementId: 'shape-1',
        });
        const commentModel = {
            commentUpdate$,
            query: vi.fn(() => roots.map((id) => ({ root: { id, ref } }))),
            getComment: vi.fn((_unitId: string, _subUnitId: string, commentId: string) => ({ id: commentId, ref })),
        };
        const activeCommentId$ = new BehaviorSubject({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            commentId: 'first-comment',
        });
        const hoveredCommentId$ = new BehaviorSubject<undefined>(undefined);
        const panelService = {
            activeCommentId: activeCommentId$.value,
            hoveredCommentId: hoveredCommentId$.value,
            activeCommentId$,
            hoveredCommentId$,
            setActiveComment: vi.fn(),
        };
        const drawingManager = { add$: new Subject(), update$: new Subject(), remove$: new Subject() };
        const themeService = {
            currentTheme$: new Subject(),
            getColorFromTheme: vi.fn((token: string) => token),
        };
        const controller = new SheetsThreadCommentDrawingRenderController(
            context as never,
            { executeCommand: vi.fn(() => Promise.resolve(true)) } as never,
            drawingManager as never,
            commentModel as never,
            panelService as never,
            themeService as never
        );
        const overlay = scene.addObject.mock.calls[0][0];

        expect(overlay.isHit(new Vector2(60, 101))).toBe(true);
        expect(overlay.hitCommentId).toBe('newest-comment');

        roots = ['first-comment'];
        commentUpdate$.next({ unitId: 'book-1' });
        expect(overlay.isHit(new Vector2(60, 101))).toBe(true);
        expect(overlay.hitCommentId).toBe('first-comment');

        bounds = { left: 120, top: 140, width: 100, height: 70 };
        drawingManager.update$.next([{ unitId: 'book-1' }]);
        expect(overlay.isHit(new Vector2(60, 101))).toBe(false);
        expect(overlay.isHit(new Vector2(170, 211))).toBe(true);

        roots = [];
        commentUpdate$.next({ unitId: 'book-1' });
        expect(overlay.isHit(new Vector2(170, 211))).toBe(false);
        controller.dispose();
    });
});
