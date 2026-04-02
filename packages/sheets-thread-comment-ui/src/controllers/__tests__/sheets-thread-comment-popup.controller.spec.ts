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

import type { Dependency } from '@univerjs/core';
import { CommandType, Injector } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetPermissionCheckController, SheetsSelectionsService } from '@univerjs/sheets';
import { IEditorBridgeService, IMarkSelectionService, ScrollToRangeOperation } from '@univerjs/sheets-ui';
import { AddCommentMutation, DeleteCommentMutation } from '@univerjs/thread-comment';
import { SetActiveCommentOperation, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { ISidebarService } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createThreadCommentUiTestBed } from '../../__tests__/create-thread-comment-ui-test-bed';
import { SheetsThreadCommentPopupService } from '../../services/sheets-thread-comment-popup.service';
import { SheetsThreadCommentPopupController } from '../sheets-thread-comment-popup.controller';

function createRootComment() {
    return {
        id: 'comment-1',
        threadId: 'thread-1',
        ref: 'A1',
        dT: '2025-01-01T00:00:00.000Z',
        personId: 'user-1',
        text: { dataStream: 'hello\r\n' },
        attachments: [],
        unitId: 'test',
        subUnitId: 'sheet1',
    };
}

function waitNextTick() {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe('SheetsThreadCommentPopupController', () => {
    let selectionMoveEnd$: Subject<any>;
    let popupService: {
        activePopup: any;
        activePopup$: BehaviorSubject<any>;
        showPopup: ReturnType<typeof vi.fn>;
        hidePopup: ReturnType<typeof vi.fn>;
    };
    let testBed: ReturnType<typeof createThreadCommentUiTestBed>;

    beforeEach(() => {
        selectionMoveEnd$ = new Subject();
        popupService = {
            activePopup$: new BehaviorSubject(null),
            activePopup: null,
            showPopup: vi.fn((popup) => {
                popupService.activePopup = popup;
                popupService.activePopup$.next(popup);
            }),
            hidePopup: vi.fn(() => {
                popupService.activePopup = null;
                popupService.activePopup$.next(null);
            }),
        };

        const dependencies: Dependency[] = [
            [ISidebarService, {
                useValue: {
                    sidebarOptions$: new BehaviorSubject({ visible: false }),
                    close: vi.fn(),
                } as unknown as ISidebarService,
            }],
            [SheetsThreadCommentPopupService, { useValue: popupService as unknown as SheetsThreadCommentPopupService }],
            [SheetPermissionCheckController, {
                useValue: {
                    permissionCheckWithRanges: vi.fn(() => true),
                } as unknown as SheetPermissionCheckController,
            }],
            [IMarkSelectionService, {
                useValue: {
                    addShape: vi.fn(() => 'shape-1'),
                    removeShape: vi.fn(),
                } as unknown as IMarkSelectionService,
            }],
            [SheetsSelectionsService, {
                useValue: {
                    selectionMoveEnd$,
                    currentSelectionParam: null,
                } as unknown as SheetsSelectionsService,
            }],
            [IEditorBridgeService, {
                useValue: {
                    visible$: new BehaviorSubject({ visible: false }),
                    isVisible: () => ({ visible: false }),
                } as unknown as IEditorBridgeService,
            }],
            [IRenderManagerService, {
                useValue: {
                    getRenderById: vi.fn(() => null),
                } as unknown as IRenderManagerService,
            }],
        ];

        testBed = createThreadCommentUiTestBed(undefined, dependencies);
        testBed.commandService.registerCommand(SetActiveCommentOperation);
        testBed.commandService.registerCommand({
            id: ScrollToRangeOperation.id,
            type: CommandType.OPERATION,
            handler: () => true,
        });
        testBed.injector.add([ThreadCommentPanelService, {
            useValue: testBed.get(Injector).createInstance(ThreadCommentPanelService),
        }]);
        testBed.get(Injector).createInstance(SheetsThreadCommentPopupController);
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('shows popup when the active comment switches to a visible sheet comment and hides when cleared', async () => {
        await testBed.commandService.executeCommand(AddCommentMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            comment: createRootComment(),
        });

        const panelService = testBed.get(ThreadCommentPanelService);
        panelService.setActiveComment({
            unitId: 'test',
            subUnitId: 'sheet1',
            commentId: 'comment-1',
            trigger: 'click',
        });
        await waitNextTick();

        expect(popupService.showPopup).toHaveBeenCalledWith({
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 0,
            col: 0,
            commentId: 'comment-1',
            trigger: 'click',
        });

        panelService.setActiveComment(undefined);
        await waitNextTick();

        expect(popupService.hidePopup).toHaveBeenCalled();
    });

    it('hides popup when the active comment is deleted through the real mutation', async () => {
        popupService.activePopup = {
            unitId: 'test',
            subUnitId: 'sheet1',
            commentId: 'comment-1',
        };

        await testBed.commandService.executeCommand(DeleteCommentMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            commentId: 'comment-1',
        });

        expect(popupService.hidePopup).toHaveBeenCalled();
    });
});
