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
import type { IRangeThemeStyleJSON } from '../../model/range-theme-util';
import { CommandType } from '@univerjs/core';
import { SheetRangeThemeModel } from '../../model/range-theme-model';
import { RangeThemeStyle } from '../../model/range-theme-util';

export interface IAddRangeThemeMutationParams {
    styleJSON: IRangeThemeStyleJSON;
    unitId: string;
    subUnitId: string;
}

export const AddRangeThemeMutation: IMutation<IAddRangeThemeMutationParams> = {
    id: 'sheet.mutation.add-range-theme',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params) => {
        if (!params) {
            return false;
        }
        const { styleJSON, unitId } = params;

        const rangeRuleModel = accessor.get(SheetRangeThemeModel);
        const rangeThemeStyle = new RangeThemeStyle(styleJSON.name);
        rangeThemeStyle.fromJson(styleJSON);
        rangeRuleModel.registerRangeThemeStyle(unitId, rangeThemeStyle);

        return true;
    },
};
