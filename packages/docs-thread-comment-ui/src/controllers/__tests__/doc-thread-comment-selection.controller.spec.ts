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

import { SetTextSelectionsOperation } from '@univerjs/docs';
import { SetActiveCommentOperation } from '@univerjs/thread-comment-ui';

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ShowCommentPanelOperation } from '../../commands/operations/show-comment-panel.operation';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../common/const';
import { DocThreadCommentSelectionController } from '../doc-thread-comment-selection.controller';

describe('DocThreadCommentSelectionController', () => {
    it('should show comment panel when selection enters a comment decoration', () => {
        const activeCommentId$ = new Subject<any>();
        const threadCommentPanelService = {
            activeCommentId: null,
            activeCommentId$,
        };

        const doc = {
            getBody: () => ({ customDecorations: [{ id: 'c1', startIndex: 0, endIndex: 5 }] }),
        };

        const univerInstanceService = {
            getUnit: vi.fn(() => doc),
        };

        let onExecutedHandler: any;
        const executeCommand = vi.fn();
        const commandService = {
            onCommandExecuted: vi.fn((fn) => {
                onExecutedHandler = fn;
                return { dispose: vi.fn() };
            }),
            executeCommand,
        };

        const docThreadCommentService = { addingComment: null, endAdd: vi.fn() };
        const renderManagerService = { getRenderById: vi.fn(() => null) };
        const threadCommentModel = { getComment: vi.fn(() => ({ resolved: false })) };

        const controller = new DocThreadCommentSelectionController(
            threadCommentPanelService as any,
            univerInstanceService as any,
            commandService as any,
            docThreadCommentService as any,
            renderManagerService as any,
            threadCommentModel as any
        );

        onExecutedHandler({
            id: SetTextSelectionsOperation.id,
            params: {
                unitId: 'doc-1',
                ranges: [{ startOffset: 1, endOffset: 2, collapsed: true }],
            },
        });

        expect(executeCommand).toHaveBeenCalledWith(ShowCommentPanelOperation.id, {
            activeComment: { unitId: 'doc-1', subUnitId: DEFAULT_DOC_SUBUNIT_ID, commentId: 'c1' },
        });

        controller.dispose();
    });

    it('should reset active comment when selection moves out', () => {
        const activeCommentId$ = new Subject<any>();
        const threadCommentPanelService = {
            activeCommentId: { unitId: 'doc-1', subUnitId: DEFAULT_DOC_SUBUNIT_ID, commentId: 'c1' },
            activeCommentId$,
        };

        const doc = {
            getBody: () => ({ customDecorations: [{ id: 'c1', startIndex: 0, endIndex: 5 }] }),
        };

        const univerInstanceService = { getUnit: vi.fn(() => doc) };

        let onExecutedHandler: any;
        const executeCommand = vi.fn();
        const commandService = {
            onCommandExecuted: vi.fn((fn) => {
                onExecutedHandler = fn;
                return { dispose: vi.fn() };
            }),
            executeCommand,
        };

        const docThreadCommentService = { addingComment: null, endAdd: vi.fn() };
        const renderManagerService = { getRenderById: vi.fn(() => null) };
        const threadCommentModel = { getComment: vi.fn(() => ({ resolved: false })) };

        const controller = new DocThreadCommentSelectionController(
            threadCommentPanelService as any,
            univerInstanceService as any,
            commandService as any,
            docThreadCommentService as any,
            renderManagerService as any,
            threadCommentModel as any
        );

        onExecutedHandler({
            id: SetTextSelectionsOperation.id,
            params: {
                unitId: 'doc-1',
                ranges: [{ startOffset: 10, endOffset: 10, collapsed: true }],
            },
        });

        expect(executeCommand).toHaveBeenCalledWith(SetActiveCommentOperation.id);

        controller.dispose();
    });
});
