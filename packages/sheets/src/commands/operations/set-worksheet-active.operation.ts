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

import type { IOperation } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';

export interface ISetWorksheetActiveOperationParams {
    unitId: string;
    subUnitId: string;
}

export const SetWorksheetActiveOperation: IOperation<ISetWorksheetActiveOperationParams> = {
    id: 'sheet.operation.set-worksheet-active',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.unitId);

        if (!workbook) return false;

        const worksheets = workbook.getWorksheets();
        for (const [, worksheet] of worksheets) {
            if (worksheet.getSheetId() === params.subUnitId) {
                workbook.setActiveSheet(worksheet);
                return true;
            }
        }

        return false;
    },
};
