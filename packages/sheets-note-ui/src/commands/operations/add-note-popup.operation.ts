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

import type { IAccessor, ICommand, Workbook } from '@univerjs/core';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsNotePopupService } from '../../services/sheets-note-popup.service';

export interface IAddNotePopupOperationParams {
    trigger?: string;
}

export const AddNotePopupOperation: ICommand = {
    id: 'sheet.operation.add-note-popup',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params?: IAddNotePopupOperationParams) => {
        const selectionService = accessor.get(SheetsSelectionsService);
        const notePopupService = accessor.get(SheetsNotePopupService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        const lastSelection = selectionService.getCurrentLastSelection();
        if (!lastSelection?.primary) {
            return false;
        }

        const { primary } = lastSelection;

        notePopupService.showPopup({
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            row: primary.actualRow,
            col: primary.actualColumn,
            temp: false,
            trigger: params?.trigger,
        });

        return true;
    },
};
