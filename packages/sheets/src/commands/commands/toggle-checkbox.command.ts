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

export interface IToggleCellCheckboxCommandParams {
    unitId: string;
    subUnitId: string;
    row: number;
    col: number;
    paragraphIndex: number;
}

export const ToggleCellCheckboxCommand: ICommand<IToggleCellCheckboxCommandParams> = {
    id: 'toggle-cell-checkbox',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, row, col, paragraphIndex } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        const sheet = workbook?.getSheetBySheetId(subUnitId);
        if (!sheet) {
            return false;
        }
        const cell = sheet.getCell(row, col);
        if (!cell?.p) {
            return false;
        }

        return true;
    },
};
