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

import type { IAccessor, IMutation, IStyleData, Nullable } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget, getSheetMutationTarget } from '../commands/utils/target-util';

export interface ISetWorksheetDefaultStyleMutationParams {
    unitId: string;
    subUnitId: string;
    defaultStyle: string | Nullable<IStyleData>;
}

export const SetWorksheetDefaultStyleMutation: IMutation<ISetWorksheetDefaultStyleMutationParams> = {
    id: 'sheet.mutation.set-worksheet-default-style',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { defaultStyle } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet } = target;
        if (!worksheet) {
            return false;
        }
        worksheet.setDefaultCellStyle(defaultStyle);
        return true;
    },
};

export const SetWorksheetDefaultStyleMutationFactory = (accessor: IAccessor, params: ISetWorksheetDefaultStyleMutationParams) => {
    const target = getSheetMutationTarget(accessor.get(IUniverInstanceService), params);
    if (!target) {
        throw new Error('[SetWorksheetDefaultStyleMutationFactory]: worksheet is null error!');
    }

    const { worksheet } = target;
    return {
        unitId: params.unitId,
        subUnitId: worksheet.getSheetId(),
        defaultStyle: worksheet.getDefaultCellStyle(),
    };
};
