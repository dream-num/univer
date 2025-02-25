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

import type { IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { SheetRangeThemeModel } from '../../model/range-theme-model';
import { getSheetCommandTarget } from '../commands/utils/target-util';

export interface IUnregisterWorksheetRangeThemeStyleMutationParams {
    unitId: string;
    themeName: string;
}

export const UnregisterWorksheetRangeThemeStyleMutation: IMutation<IUnregisterWorksheetRangeThemeStyleMutationParams> = {
    id: 'sheet.mutation.unregister-worksheet-range-theme-style',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, themeName } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        const sheetRangeThemeModel = accessor.get(SheetRangeThemeModel);
        if (!target) return false;

        sheetRangeThemeModel.unregisterRangeThemeStyle(unitId, themeName);
        return true;
    },
};
