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
import { CommandType, IUniverInstanceService, Tools } from '@univerjs/core';

export interface ISetWorksheetOrderMutationParams {
    fromOrder: number;
    toOrder: number;
    unitId: string;
    subUnitId: string;
}

export const SetWorksheetOrderUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetOrderMutationParams
): ISetWorksheetOrderMutationParams => {
    return {
        ...Tools.deepClone(params),
        toOrder: params.fromOrder,
        fromOrder: params.toOrder,
    };
};

export const SetWorksheetOrderMutation: IMutation<ISetWorksheetOrderMutationParams> = {
    id: 'sheet.mutation.set-worksheet-order',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.unitId);
        if (!workbook) return false;
        const config = workbook.getConfig();
        config.sheetOrder.splice(params.fromOrder, 1);
        config.sheetOrder.splice(params.toOrder, 0, params.subUnitId);
        return true;
    },
};
