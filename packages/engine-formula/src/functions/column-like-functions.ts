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

import type { IFunctionNames } from '../basics/function';

import { FUNCTION_NAMES_DATE } from './date/function-names';
import { FUNCTION_NAMES_ENGINEERING } from './engineering/function-names';
import { FUNCTION_NAMES_FINANCIAL } from './financial/function-names';
import { FUNCTION_NAMES_INFORMATION } from './information/function-names';
import { FUNCTION_NAMES_LOGICAL } from './logical/function-names';
import { FUNCTION_NAMES_LOOKUP } from './lookup/function-names';
import { FUNCTION_NAMES_MATH } from './math/function-names';
import { FUNCTION_NAMES_STATISTICAL } from './statistical/function-names';
import { FUNCTION_NAMES_TEXT } from './text/function-names';
import { FUNCTION_NAMES_WEB } from './web/function-names';

const ALL_GROUPS = [
    FUNCTION_NAMES_DATE,
    FUNCTION_NAMES_ENGINEERING,
    FUNCTION_NAMES_FINANCIAL,
    FUNCTION_NAMES_INFORMATION,
    FUNCTION_NAMES_LOGICAL,
    FUNCTION_NAMES_LOOKUP,
    FUNCTION_NAMES_MATH,
    FUNCTION_NAMES_STATISTICAL,
    FUNCTION_NAMES_TEXT,
    FUNCTION_NAMES_WEB,
] as const;

function colLabelToIndex(label: string): number {
  // A=1 ... Z=26 ... XFD=16384
    let n = 0;
    for (let i = 0; i < label.length; i++) {
        const c = label.charCodeAt(i);
        if (c < 65 || c > 90) return -1;
        n = n * 26 + (c - 64);
    }
    return n;
}

const MAX_COL = colLabelToIndex('XFD'); // 16384

export const COLUMN_LIKE_FUNCTION_NAMES = new Set<IFunctionNames>(
    ALL_GROUPS
        .flatMap((g) => Object.values(g) as IFunctionNames[])
        .filter((name) => /^[A-Z]{1,3}$/.test(name as string))
        .filter((name) => {
            const idx = colLabelToIndex(name as string);
            return idx > 0 && idx <= MAX_COL;
        })
);
