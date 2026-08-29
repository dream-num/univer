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

import type { IAccessor, ICommand } from '@univerjs/core';
import type { ISetNumfmtCommandParams } from '@univerjs/sheets-numfmt';
import { CommandType, ICommandService, Range } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { getPatternType, SetNumfmtCommand } from '@univerjs/sheets-numfmt';

export interface ISetMobileNumfmtCommandParams {
    value?: string | null;
}

export const SetMobileNumfmtCommand: ICommand<ISetMobileNumfmtCommandParams> = {
    id: 'sheet.command.mobile.numfmt.set',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params) => {
        const selections = accessor.get(SheetsSelectionsService).getCurrentSelections();
        if (!selections?.length) return false;

        const pattern = params?.value || undefined;
        const type = pattern ? getPatternType(pattern) : undefined;
        const values: ISetNumfmtCommandParams['values'] = [];
        selections.forEach((selection) => {
            Range.foreach(selection.range, (row, col) => values.push({ row, col, pattern, type }));
        });

        return accessor.get(ICommandService).executeCommand(SetNumfmtCommand.id, { values });
    },
};
