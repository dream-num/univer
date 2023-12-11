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

import type { IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService, Tools } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetOrderMutationParams {
    order: number;
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetOrderUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetOrderMutationParams
): ISetWorksheetOrderMutationParams => {
    const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
    const config = workbook!.getConfig();
    const oldIndex = config.sheetOrder.findIndex((current: string) => current === params.worksheetId);
    return {
        ...Tools.deepClone(params),
        order: oldIndex,
    };
};

export const SetWorksheetOrderMutation: IMutation<ISetWorksheetOrderMutationParams> = {
    id: 'sheet.mutation.set-worksheet-order',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
        if (!workbook) return false;
        const config = workbook.getConfig();
        const exclude = config.sheetOrder.filter((currentId: string) => currentId !== params.worksheetId);
        exclude.splice(params.order, 0, params.worksheetId);
        config.sheetOrder = exclude;
        return true;
    },
};
