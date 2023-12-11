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

import type { IOperation } from '@univerjs/core';
import { BooleanNumber, CommandType, IUniverInstanceService } from '@univerjs/core';

export interface ISetWorksheetActiveOperationParams {
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetActiveOperation: IOperation<ISetWorksheetActiveOperationParams> = {
    id: 'sheet.operation.set-worksheet-active',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const universheet = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
        if (!universheet) return false;

        // TODO: this should be changed to a inner state
        const worksheets = universheet.getWorksheets();
        for (const [, worksheet] of worksheets) {
            if (worksheet.getSheetId() === params.worksheetId) {
                worksheet.getConfig().status = BooleanNumber.TRUE;
            } else {
                worksheet.getConfig().status = BooleanNumber.FALSE;
            }
        }

        return true;
    },
};
