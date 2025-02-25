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
import type { IRangeThemeStyleJSON } from '../../model/range-theme-util';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { SheetRangeThemeModel } from '../../model/range-theme-model';
import { RangeThemeStyle } from '../../model/range-theme-util';
import { getSheetCommandTarget } from '../commands/utils/target-util';

export interface IRegisterWorksheetRangeThemeStyleMutationParams {
    unitId: string;
    themeName: string;
    rangeThemeStyleJson: IRangeThemeStyleJSON;
}

export const RegisterWorksheetRangeThemeStyleMutation: IMutation<IRegisterWorksheetRangeThemeStyleMutationParams> = {
    id: 'sheet.mutation.register-worksheet-range-theme-style',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, rangeThemeStyleJson, themeName } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        const sheetRangeThemeModel = accessor.get(SheetRangeThemeModel);
        if (!target) return false;

        const rangeThemeStyle = new RangeThemeStyle(themeName, rangeThemeStyleJson);
        sheetRangeThemeModel.registerRangeThemeStyle(unitId, rangeThemeStyle);
        return true;
    },
};
