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

import type { IRangeThemeStyleJSON } from '../range-theme-util';
import { BooleanNumber, BorderStyleTypes, HorizontalAlign } from '@univerjs/core';
import { RangeThemeStyle } from '../range-theme-util';

const defaultRangeThemeStyleJSON: Omit<IRangeThemeStyleJSON, 'name'> = {

    headerRowStyle: {
        bg: {
            rgb: 'rgb(68,114,196)',
        },
        cl: {
            rgb: 'rgb(255,255,255)',
        },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },
    firstRowStyle: {
        bg: {
            rgb: 'rgb(217,225,242)',
        },
    },

};

export const defaultRangeThemeStyle = new RangeThemeStyle('default', defaultRangeThemeStyleJSON);

export const defaultRangeThemeStyleJSONWithLastRowStyle = new RangeThemeStyle('default-last-row', {
    ...defaultRangeThemeStyleJSON,
    lastRowStyle: {
        bd: {
            t: {
                s: BorderStyleTypes.THIN,
                cl: {
                    rgb: 'rgb(68,114,196)',
                },
            },
        },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },
});
