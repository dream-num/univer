/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICommand, Workbook } from '@univerjs/core';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { SelectionManagerService } from '@univerjs/sheets';
import { SheetsThreadCommentPopupService } from '../../services/sheets-thread-comment-popup.service';

export const ShowAddSheetCommentModalOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'sheets.operation.toggle-comment-modal',
    handler(accessor) {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetsThreadCommentPopupService = accessor.get(SheetsThreadCommentPopupService);
        const activeCell = selectionManagerService.getFirst()?.primary;
        const current = selectionManagerService.getCurrent();

        if (!current || !activeCell) {
            return false;
        }

        const { unitId, sheetId } = current;
        const workbook = univerInstanceService.getUnit<Workbook>(current.unitId, UniverInstanceType.SHEET);
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getSheetBySheetId(sheetId);
        if (!worksheet) {
            return false;
        }
        const location: ISheetLocation = {
            workbook,
            worksheet,
            unitId,
            subUnitId: sheetId,
            row: activeCell.actualRow,
            col: activeCell.startColumn,
        };

        sheetsThreadCommentPopupService.showPopup(location);
        return true;
    },
};

