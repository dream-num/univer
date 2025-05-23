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
import { CommandType } from '@univerjs/core';
import { SheetRangeThemeModel } from '../../model/range-theme-model';

export interface IRemoveRangeThemeMutationParams {
    unitId: string;
    subUnitId: string;
    styleName: string;
}

export const RemoveRangeThemeMutation: IMutation<IRemoveRangeThemeMutationParams> = {
    id: 'sheet.mutation.remove-range-theme',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const { styleName, unitId } = params;

        const rangeRuleModel = accessor.get(SheetRangeThemeModel);
        rangeRuleModel.unregisterRangeThemeStyle(unitId, styleName);

        return true;
    },
};
