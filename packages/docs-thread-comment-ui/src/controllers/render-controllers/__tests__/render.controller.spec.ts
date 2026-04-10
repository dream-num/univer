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
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_DOC_SUBUNIT_ID } from '../../../common/const';
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
        const threadCommentPanelService = {
            activeCommentId: { unitId: 'doc-1', subUnitId: DEFAULT_DOC_SUBUNIT_ID, commentId: 'c2' },
            activeCommentId$,
        };

        const univerInstanceService = {
            getCurrentUnitForType: vi.fn(() => ({ getUnitId: () => 'doc-1' })),
        };

        const commentUpdate$ = new Subject<any>();
        const threadCommentModel = {
            commentUpdate$,
            getComment: vi.fn((_unitId: string, _subUnitId: string, id: string) => (id === 'c1' ? null : { id, resolved: false })),
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
        const context = { unit };

        const controller = new DocThreadCommentRenderController(
            context as any,
            docInterceptorService as any,
            threadCommentPanelService as any,
            docRenderController as any,
            univerInstanceService as any,
            threadCommentModel as any,
            commandService as any
        );

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

        // resolved branch triggers rerender
        threadCommentModel.getComment.mockImplementation((_unitId: string, _subUnitId: string, id: string) => {
            if (id === 'c1') return null;
            return { id, resolved: id === 'c2' };
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
        expect(threadCommentModel.syncThreadComments).toHaveBeenCalledWith('doc-1', DEFAULT_DOC_SUBUNIT_ID, ['c3']);

        controller.dispose();
    });
});
