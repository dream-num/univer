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
import { CommandType } from '@univerjs/core';
import { SheetRangeThemeModel } from '../../model/range-theme-model';

export interface ISetRangeThemeMutationParams {
    unitId: string;
    subUnitId: string;
    styleName: string;
    style: Omit<IRangeThemeStyleJSON, 'name'>;
}

export const SetRangeThemeMutation: IMutation<ISetRangeThemeMutationParams> = {
    id: 'sheet.mutation.set-range-theme',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const { unitId, styleName, style } = params;
        const rangeThemeModel = accessor.get(SheetRangeThemeModel);
        const rangeThemeStyle = rangeThemeModel.getRangeThemeStyle(unitId, styleName);
        if (rangeThemeStyle) {
            if (style.headerRowStyle) {
                rangeThemeStyle.setHeaderRowStyle(style.headerRowStyle);
            }
            if (style.firstRowStyle) {
                rangeThemeStyle.setFirstRowStyle(style.firstRowStyle);
            }
            if (style.secondRowStyle) {
                rangeThemeStyle.setSecondRowStyle(style.secondRowStyle);
            }
            if (style.lastRowStyle) {
                rangeThemeStyle.setLastRowStyle(style.lastRowStyle);
            }
            // TODO add other style
        }

        return true;
    },
};
