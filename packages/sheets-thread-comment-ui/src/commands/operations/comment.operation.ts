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

import type { IOperation, Workbook } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { ThreadCommentAnchorKind } from '@univerjs/thread-comment';
import { ThreadCommentDraftService, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { ISidebarService } from '@univerjs/ui';
import { SheetsThreadCommentPopupService } from '../../services/sheets-thread-comment-popup.service';
import { SHEETS_THREAD_COMMENT_PANEL } from '../../types/const';

export const ShowAddSheetCommentModalOperation: IOperation = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.show-comment-modal',
    handler(accessor) {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const sheetsThreadCommentPopupService = accessor.get(SheetsThreadCommentPopupService);
        const threadCommentPanelService = accessor.get(ThreadCommentPanelService);
        const activeCell = selectionManagerService.getCurrentLastSelection()?.primary;
        const model = accessor.get(SheetsThreadCommentModel);

        if (!activeCell) {
            return false;
        }

        const result = getSheetCommandTarget(univerInstanceService);
        if (!result) {
            return false;
        }

        const { workbook, worksheet, unitId, subUnitId } = result;
        const location: ISheetLocation = {
            workbook,
            worksheet,
            unitId,
            subUnitId,
            row: activeCell.startRow,
            col: activeCell.startColumn,
        };

        sheetsThreadCommentPopupService.showPopup(location);
        const rootId = model.getByLocation(unitId, subUnitId, activeCell.startRow, activeCell.startColumn);
        if (rootId) {
            threadCommentPanelService.setActiveComment({
                unitId,
                subUnitId,
                commentId: rootId,
                trigger: 'context-menu',
            });
        }
        return true;
    },
};

export const ToggleSheetCommentPanelOperation: IOperation = {
    id: 'sheet.operation.toggle-comment-panel',
    type: CommandType.OPERATION,
    handler(accessor) {
        const sidebarService = accessor.get(ISidebarService);
        const panelService = accessor.get(ThreadCommentPanelService);

        if (panelService.panelVisible) {
            sidebarService.close();
            panelService.setPanelVisible(false);
        } else {
            openSheetCommentPanel(sidebarService, panelService);
        }

        return true;
    },
};

export const OpenSheetCommentPanelOperation: IOperation = {
    id: 'sheet.operation.open-comment-panel',
    type: CommandType.OPERATION,
    handler(accessor) {
        openSheetCommentPanel(
            accessor.get(ISidebarService),
            accessor.get(ThreadCommentPanelService)
        );
        return true;
    },
};

function openSheetCommentPanel(
    sidebarService: ISidebarService,
    panelService: ThreadCommentPanelService
): void {
    if (!panelService.panelVisible || sidebarService.options.children?.label !== SHEETS_THREAD_COMMENT_PANEL) {
        sidebarService.open({
            header: { title: 'sheets-thread-comment-ui.panel.title' },
            children: { label: SHEETS_THREAD_COMMENT_PANEL },
            width: 360,
            onClose: () => panelService.setPanelVisible(false),
        });
    }
    panelService.setPanelVisible(true);
}

export const AddSheetDrawingCommentOperation: IOperation = {
    id: 'sheet.operation.add-drawing-comment',
    type: CommandType.OPERATION,
    handler(accessor) {
        const drawing = accessor.get(IDrawingManagerService).getFocusDrawings()[0];
        const workbook = accessor.get(IUniverInstanceService)
            .getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (
            !drawing
            || !workbook
            || drawing.unitId !== workbook.getUnitId()
            || drawing.subUnitId !== workbook.getActiveSheet()?.getSheetId()
        ) {
            return false;
        }
        accessor.get(ThreadCommentDraftService).place({
            unitId: drawing.unitId,
            subUnitId: drawing.subUnitId,
            anchor: {
                kind: ThreadCommentAnchorKind.SHEET_DRAWING,
                pageId: drawing.subUnitId,
                elementId: drawing.drawingId,
            },
        });
        const panelService = accessor.get(ThreadCommentPanelService);
        accessor.get(ISidebarService).open({
            header: { title: 'sheets-thread-comment-ui.panel.title' },
            children: { label: SHEETS_THREAD_COMMENT_PANEL },
            width: 360,
            onClose: () => panelService.setPanelVisible(false),
        });
        panelService.setPanelVisible(true);
        return true;
    },
};
