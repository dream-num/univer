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

import type { IFunctionNames } from '@univerjs/engine-formula';
import { numfmt } from '@univerjs/core';
import { FUNCTION_NAMES_MATH, FUNCTION_NAMES_STATISTICAL, FUNCTION_NAMES_TEXT } from '@univerjs/engine-formula';

export interface IStatisticItem {
    name: IFunctionNames;
    value: number;
    show: boolean;
    disable: boolean;
    pattern: string | null;
}

const allowPatternFunctions: IFunctionNames[] = [
    FUNCTION_NAMES_MATH.SUM,
    FUNCTION_NAMES_STATISTICAL.AVERAGE,
    FUNCTION_NAMES_STATISTICAL.MIN,
    FUNCTION_NAMES_STATISTICAL.MAX,
];

export const functionDisplayNames: IFunctionNameMap = {
    [FUNCTION_NAMES_MATH.SUM]: 'sheets-ui.statusbar.sum',
    [FUNCTION_NAMES_STATISTICAL.AVERAGE]: 'sheets-ui.statusbar.average',
    [FUNCTION_NAMES_STATISTICAL.MIN]: 'sheets-ui.statusbar.min',
    [FUNCTION_NAMES_STATISTICAL.MAX]: 'sheets-ui.statusbar.max',
    [FUNCTION_NAMES_STATISTICAL.COUNT]: 'sheets-ui.statusbar.count',
    [FUNCTION_NAMES_STATISTICAL.COUNTA]: 'sheets-ui.statusbar.countA',
    [FUNCTION_NAMES_TEXT.CONCATENATE]: 'concatenate',
};

interface IFunctionNameMap {
    [key: string]: string;
}

export function formatNumber(item: IStatisticItem) {
    const { pattern, value: num } = item;
    if (typeof num !== 'number') {
        return 0;
    }

    if (pattern && allowPatternFunctions.includes(item.name)) {
        return numfmt.format(pattern, num, { throws: false });
    }

    return num.toLocaleString();
}
