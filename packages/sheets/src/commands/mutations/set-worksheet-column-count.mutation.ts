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

import type { IAccessor, IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { getSheetMutationTarget } from '../commands/utils/target-util';

export interface ISetWorksheetColumnCountMutationParams {
    unitId: string;
    subUnitId: string;
    columnCount: number;
}

export const SetWorksheetColumnCountUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetColumnCountMutationParams
): ISetWorksheetColumnCountMutationParams => {
    const target = getSheetMutationTarget(accessor.get(IUniverInstanceService), params);
    if (!target) {
        throw new Error('[SetWorksheetColumnCountUndoMutationFactory]: worksheet is null error!');
    }

    return {
        unitId: params.unitId,
        subUnitId: params.subUnitId,
        columnCount: target.worksheet.getColumnCount(),
    };
};

export const SetWorksheetColumnCountMutation: IMutation<ISetWorksheetColumnCountMutationParams> = {
    id: 'sheet.mutation.set-worksheet-column-count',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetMutationTarget(univerInstanceService, params);
        if (!target) return false;

        target.worksheet.setColumnCount(params.columnCount);

        return true;
    },
};
