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

export interface ISetTabColorMutationParams {
    color: string;
    unitId: string;
    subUnitId: string;
}

export const SetTabColorUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetTabColorMutationParams
): ISetTabColorMutationParams => {
    const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.unitId);
    const worksheet = workbook!.getSheetBySheetId(params.subUnitId);
    const config = worksheet!.getConfig();

    // store old tab color
    const oldTabColor = config.tabColor;
    return {
        ...Tools.deepClone(params),
        color: oldTabColor,
    };
};

export const SetTabColorMutation: IMutation<ISetTabColorMutationParams> = {
    id: 'sheet.mutation.set-tab-color',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.unitId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.subUnitId);
        if (!worksheet) return false;
        worksheet.getConfig().tabColor = params.color;

        return true;
    },
};
