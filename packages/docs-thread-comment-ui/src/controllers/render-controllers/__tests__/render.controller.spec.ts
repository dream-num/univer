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

import { CustomDecorationType } from '@univerjs/core';
import { DOC_INTERCEPTOR_POINT, RichTextEditingMutation } from '@univerjs/docs';
import { DEFAULT_DOC_SUBUNIT_ID } from '@univerjs/docs-thread-comment';
import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import { Vector2 } from '@univerjs/engine-render';
import { serializeThreadCommentAnchor, ThreadCommentAnchorKind } from '@univerjs/thread-comment';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DocThreadCommentRenderController } from '../render.controller';

describe('DocThreadCommentRenderController', () => {
    it('should intercept decoration view-model based on active comment and resolved status', () => {
        let handler: any;
        const docInterceptorService = {
            intercept: vi.fn((point, config) => {
                if (point === DOC_INTERCEPTOR_POINT.CUSTOM_DECORATION) {
                    handler = config.handler;
                }
                return { dispose: vi.fn() };
            }),
        };

        const reRender = vi.fn();
        const docRenderController = { reRender };

        const activeCommentId$ = new Subject<any>();
        const hoveredCommentId$ = new Subject<any>();
        const threadCommentPanelService = {
            activeCommentId: { unitId: 'doc-1', subUnitId: DEFAULT_DOC_SUBUNIT_ID, commentId: 'c2' },
            activeCommentId$,
            hoveredCommentId: undefined as any,
            hoveredCommentId$,
        };

        const univerInstanceService = {
            getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => 'doc-1' })),
        };

        const commentUpdate$ = new Subject<any>();
        const threadCommentModel = {
            commentUpdate$,
            getComment: vi.fn((_unitId: string, _subUnitId: string, id: string) => (id === 'c1' ? null : { id, ref: 'text', resolved: false })),
            query: vi.fn(() => []),
            addComment: vi.fn(),
            syncThreadComments: vi.fn(),
        };

        let onCommandExecuted: any;
        const commandService = {
            onCommandExecuted: vi.fn((fn) => {
                onCommandExecuted = fn;
                return { dispose: vi.fn() };
            }),
        };

        const unit = {
            getUnitId: () => 'doc-1',
            getBody: () => ({ customDecorations: [{ id: 'c1', type: CustomDecorationType.COMMENT }, { id: 'c2', type: CustomDecorationType.COMMENT }] }),
        };
        const context = {
            unit,
            unitId: 'doc-1',
            scene: {
                addObject: vi.fn(),
                getObject: vi.fn(),
                getObjectIncludeInGroup: vi.fn(),
            },
            engine: {
                onTransformChange$: {
                    subscribeEvent: vi.fn(() => ({ dispose: vi.fn() })),
                },
            },
        };
        const drawingManagerService = {
            add$: new Subject<never[]>(),
            update$: new Subject<never[]>(),
            remove$: new Subject<never[]>(),
        };
        const themeService = {
            currentTheme$: new Subject<void>(),
            getColorFromTheme: vi.fn((token: string) => token),
        };

        const controller = new DocThreadCommentRenderController(
            context as any,
            docInterceptorService as any,
            threadCommentPanelService as any,
            docRenderController as any,
            univerInstanceService as any,
            threadCommentModel as any,
            commandService as any,
            drawingManagerService as any,
            themeService as any
        );

        expect(threadCommentModel.addComment).not.toHaveBeenCalled();

        const next = (v: any) => v;
        const outActive = handler(
            { id: 'c2' },
            {
                unitId: 'doc-1',
                index: 3,
                customDecorations: [{ id: 'c2', startIndex: 0, endIndex: 5 }],
            },
            next
        );
        expect(outActive.active).toBe(true);
        expect(outActive.show).toBe(true);

        const outResolved = handler(
            { id: 'c1' },
            {
                unitId: 'doc-1',
                index: 3,
                customDecorations: [{ id: 'c2', startIndex: 0, endIndex: 5 }],
            },
            next
        );
        expect(outResolved.show).toBe(false);

        threadCommentPanelService.hoveredCommentId = {
            unitId: 'doc-1',
            subUnitId: DEFAULT_DOC_SUBUNIT_ID,
            commentId: 'c3',
        };
        const outOverlapping = handler(
            { id: 'c2' },
            {
                unitId: 'doc-1',
                index: 3,
                customDecorations: [
                    { id: 'c2', startIndex: 0, endIndex: 5 },
                    { id: 'c3', startIndex: 2, endIndex: 4 },
                ],
            },
            next
        );
        expect(outOverlapping.active).toBe(true);
        const outHovered = handler(
            { id: 'c3' },
            {
                unitId: 'doc-1',
                index: 3,
                customDecorations: [
                    { id: 'c2', startIndex: 0, endIndex: 5 },
                    { id: 'c3', startIndex: 2, endIndex: 4 },
                ],
            },
            next
        );
        expect(outHovered.active).toBe(true);

        threadCommentPanelService.hoveredCommentId = {
            unitId: 'other-doc',
            subUnitId: DEFAULT_DOC_SUBUNIT_ID,
            commentId: 'c3',
        };
        const outActiveWithForeignHover = handler({ id: 'c2' }, { unitId: 'doc-1' }, next);
        expect(outActiveWithForeignHover.active).toBe(true);
        hoveredCommentId$.next(threadCommentPanelService.hoveredCommentId);
        expect(reRender).toHaveBeenCalledWith('doc-1');

        // resolved branch triggers rerender
        threadCommentModel.getComment.mockImplementation((_unitId: string, _subUnitId: string, id: string) => {
            if (id === 'c1') return null;
            return { id, ref: 'text', resolved: id === 'c2' };
        });
        const outResolvedComment = handler(
            { id: 'c2' },
            {
                unitId: 'doc-1',
                index: 3,
                customDecorations: [{ id: 'c2', startIndex: 0, endIndex: 5 }],
            },
            next
        );
        expect(outResolvedComment.show).toBe(false);

        // rerender on active comment changes
        activeCommentId$.next({ unitId: 'doc-1', subUnitId: DEFAULT_DOC_SUBUNIT_ID, commentId: 'c1' });
        expect(reRender).toHaveBeenCalledWith('doc-1');

        // rerender on resolve updates
        commentUpdate$.next({ type: 'resolve', unitId: 'doc-1' });
        expect(reRender).toHaveBeenCalledWith('doc-1');

        // trigger sync on rich text mutations (add new decoration)
        // NOTE: `_initSyncComments` compares sorted thread ids. We emulate that the doc body returns a stable
        // list that changes when mutation happens.
        unit.getBody = () => ({
            customDecorations: [
                { id: 'c1', type: CustomDecorationType.COMMENT },
                { id: 'c2', type: CustomDecorationType.COMMENT },
                { id: 'c3', type: CustomDecorationType.COMMENT },
            ],
        });

        onCommandExecuted({ id: RichTextEditingMutation.id, params: { unitId: 'doc-1' } });
        expect(threadCommentModel.addComment).not.toHaveBeenCalled();
        expect(threadCommentModel.syncThreadComments).toHaveBeenCalledWith('doc-1', DEFAULT_DOC_SUBUNIT_ID, ['c3']);

        controller.dispose();
    });

    it('keeps drawing comment underlines attached to the rendered object', () => {
        const ref = serializeThreadCommentAnchor({
            kind: ThreadCommentAnchorKind.DOC_DRAWING,
            pageId: 'doc-1',
            elementId: 'shape-1',
        });
        const drawingKey = getDrawingShapeKeyByDrawingSearch({
            unitId: 'doc-1',
            subUnitId: 'doc-1',
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
            unitId: 'doc-1',
            unit: { getUnitId: () => 'doc-1', getBody: () => ({ customDecorations: [] }) },
            scene,
            engine: { onTransformChange$: { subscribeEvent: vi.fn(() => ({ dispose: vi.fn() })) } },
        };
        const activeCommentId$ = new BehaviorSubject({
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            commentId: 'first-comment',
        });
        const hoveredCommentId$ = new BehaviorSubject<undefined>(undefined);
        const panelService = {
            activeCommentId: activeCommentId$.value,
            hoveredCommentId: hoveredCommentId$.value,
            activeCommentId$,
            hoveredCommentId$,
        };
        const commentUpdate$ = new Subject<{ type: string; unitId: string }>();
        const commentModel = {
            commentUpdate$,
            query: vi.fn(() => roots.map((id) => ({ root: { id, ref }, subUnitId: 'doc-1' }))),
            getComment: vi.fn((_unitId: string, _subUnitId: string, id: string) => ({ id, ref, resolved: false })),
            syncThreadComments: vi.fn(),
        };
        const drawingManager = { add$: new Subject(), update$: new Subject(), remove$: new Subject() };
        const controller = new DocThreadCommentRenderController(
            context as never,
            { intercept: vi.fn(() => ({ dispose: vi.fn() })) } as never,
            panelService as never,
            { reRender: vi.fn() } as never,
            { getCurrentUnitOfType: vi.fn(() => context.unit) } as never,
            commentModel as never,
            { executeCommand: vi.fn(() => Promise.resolve(true)), onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })) } as never,
            drawingManager as never,
            { currentTheme$: new Subject(), getColorFromTheme: vi.fn((token: string) => token) } as never
        );
        const overlay = scene.addObject.mock.calls[0][0];

        expect(overlay.isHit(new Vector2(60, 102))).toBe(true);
        expect(overlay.hitCommentId).toBe('newest-comment');

        roots = ['first-comment'];
        commentUpdate$.next({ type: 'delete', unitId: 'doc-1' });
        expect(overlay.isHit(new Vector2(60, 102))).toBe(true);
        expect(overlay.hitCommentId).toBe('first-comment');

        bounds = { left: 120, top: 140, width: 100, height: 70 };
        drawingManager.update$.next([{ unitId: 'doc-1' }]);
        expect(overlay.isHit(new Vector2(60, 102))).toBe(false);
        expect(overlay.isHit(new Vector2(170, 212))).toBe(true);

        roots = [];
        commentUpdate$.next({ type: 'resolve', unitId: 'doc-1' });
        expect(overlay.isHit(new Vector2(170, 212))).toBe(false);
        controller.dispose();
    });
});
