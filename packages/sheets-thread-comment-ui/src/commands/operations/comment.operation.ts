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

import type { ICommand } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { SheetsThreadCommentPopupService } from '../../services/sheets-thread-comment-popup.service';

export const ShowAddSheetCommentModalOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'sheets.operation.show-comment-modal',
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
