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
import type { IWorksheetRangeThemeStyleMutationParams } from '../../basics/interfaces/mutation-interface';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { SheetRangeThemeModel } from '../../model/range-theme-model';
import { getSheetCommandTarget, getSheetMutationTarget } from '../commands/utils/target-util';

export const DeleteWorksheetRangeThemeStyleMutation: IMutation<IWorksheetRangeThemeStyleMutationParams> = {
    id: 'sheet.mutation.remove-worksheet-range-theme-style',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, subUnitId, range, themeName } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        const sheetRangeThemeModel = accessor.get(SheetRangeThemeModel);
        if (!target) return false;

        sheetRangeThemeModel.removeRangeThemeRule(themeName, { range, unitId, subUnitId });
        return true;
    },
};

export const DeleteWorksheetRangeThemeStyleMutationFactory = (accessor: IAccessor, params: IWorksheetRangeThemeStyleMutationParams) => {
    const target = getSheetMutationTarget(accessor.get(IUniverInstanceService), params);
    if (!target) {
        throw new Error('[DeleteWorksheetRangeThemeStyleMutationFactory]: worksheet is null error!');
    }

    const { worksheet } = target;
    return {
        unitId: params.unitId,
        subUnitId: worksheet.getSheetId(),
        range: params.range,
        themeName: params.themeName,
    };
};
