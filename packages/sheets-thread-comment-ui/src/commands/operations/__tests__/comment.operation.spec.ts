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

import type { IWorkbookData } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { IThreadComment } from '@univerjs/thread-comment';
import {
    ICommandService,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LocaleType,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { CellPopupManagerService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import {
    AddCommentMutation,
    IThreadCommentDataSourceService,
    ThreadCommentDataSourceService,
    ThreadCommentModel,
} from '@univerjs/thread-comment';
import { ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { DesktopSidebarService, ISidebarService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsThreadCommentPopupService } from '../../../services/sheets-thread-comment-popup.service';
import { SHEETS_THREAD_COMMENT_PANEL } from '../../../types/const';
import { ShowAddSheetCommentModalOperation, ToggleSheetCommentPanelOperation } from '../comment.operation';

const unitId = 'comment-workbook';
const subUnitId = 'sheet-1';

const workbookData: IWorkbookData = {
    id: unitId,
    appVersion: '3.0.0-alpha',
    name: 'comment workbook',
    locale: LocaleType.EN_US,
    sheetOrder: [subUnitId],
    styles: {},
    sheets: {
        [subUnitId]: {
            id: subUnitId,
            name: 'Sheet 1',
            cellData: {},
        },
    },
};

class TestCellPopupManagerService {
    showPopup() {
        return toDisposable(() => {});
    }
}

class TestSheetCanvasPopManagerService {}

function createSelection(row: number, col: number): ISelectionWithStyle {
    return {
        range: {
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
        },
        primary: {
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
            actualRow: row,
            actualColumn: col,
            isMerged: false,
            isMergedMainCell: false,
        },
        style: null,
    };
}

function createComment(id: string, ref: string): IThreadComment {
    return {
        id,
        threadId: id,
        ref,
        unitId,
        subUnitId,
        dT: '2026-06-17T00:00:00.000Z',
        personId: 'user-1',
        text: {
            dataStream: 'Review this cell.\r\n',
        },
    };
}

describe('sheet thread comment operations', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let selectionsService: SheetsSelectionsService;
    let popupService: SheetsThreadCommentPopupService;
    let panelService: ThreadCommentPanelService;
    let sidebarService: ISidebarService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([SheetsSelectionsService]);
        injector.add([IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }]);
        injector.add([ThreadCommentModel]);
        injector.add([SheetsThreadCommentModel]);
        injector.add([CellPopupManagerService, { useClass: TestCellPopupManagerService as never }]);
        injector.add([SheetCanvasPopManagerService, { useClass: TestSheetCanvasPopManagerService as never }]);
        injector.add([SheetsThreadCommentPopupService]);
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
        injector.add([ThreadCommentPanelService]);

        univer.createUnit(UniverInstanceType.UNIVER_SHEET, workbookData);
        injector.get(IUniverInstanceService).focusUnit(unitId);
        injector.get(LifecycleService).stage = LifecycleStages.Rendered;

        commandService = injector.get(ICommandService);
        commandService.registerCommand(AddCommentMutation);
        commandService.registerCommand(ShowAddSheetCommentModalOperation);
        commandService.registerCommand(ToggleSheetCommentPanelOperation);
        selectionsService = injector.get(SheetsSelectionsService);
        popupService = injector.get(SheetsThreadCommentPopupService);
        panelService = injector.get(ThreadCommentPanelService);
        sidebarService = injector.get(ISidebarService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('opens the add-comment popup at the active cell and activates the existing thread', async () => {
        await commandService.executeCommand(AddCommentMutation.id, {
            unitId,
            subUnitId,
            comment: createComment('comment-1', 'D3'),
        });
        selectionsService.setSelections(unitId, subUnitId, [createSelection(2, 3)]);

        const result = await commandService.executeCommand(ShowAddSheetCommentModalOperation.id);

        expect(result).toBe(true);
        expect(popupService.activePopup).toMatchObject({
            unitId,
            subUnitId,
            row: 2,
            col: 3,
        });
        expect(panelService.activeCommentId).toEqual({
            unitId,
            subUnitId,
            commentId: 'comment-1',
            trigger: 'context-menu',
        });
    });

    it('does not open the add-comment popup without an active cell', async () => {
        const result = await commandService.executeCommand(ShowAddSheetCommentModalOperation.id);

        expect(result).toBe(false);
        expect(popupService.activePopup).toBeUndefined();
        expect(panelService.activeCommentId).toBeUndefined();
    });

    it('toggles the sheet comment panel through the sidebar', async () => {
        const openResult = await commandService.executeCommand(ToggleSheetCommentPanelOperation.id);

        expect(openResult).toBe(true);
        expect(panelService.panelVisible).toBe(true);
        expect(sidebarService.visible).toBe(true);
        expect(sidebarService.options.children?.label).toBe(SHEETS_THREAD_COMMENT_PANEL);

        const closeResult = await commandService.executeCommand(ToggleSheetCommentPanelOperation.id);

        expect(closeResult).toBe(true);
        expect(panelService.panelVisible).toBe(false);
        expect(sidebarService.visible).toBe(false);
    });
});
