/**
 * Copyright 2023-present DreamNum Inc.
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

import { Rectangle } from '../shared';
import type { IRange, IUnitRange } from './typedef';

export const isRangesEqual = (oldRanges: IRange[], ranges: IRange[]): boolean => {
    return ranges.length === oldRanges.length && !oldRanges.some((oldRange) => ranges.some((range) => !Rectangle.equals(range, oldRange)));
};

export const isUnitRangesEqual = (oldRanges: IUnitRange[], ranges: IUnitRange[]): boolean => {
    return ranges.length === oldRanges.length && oldRanges.every((oldRange, i) => {
        const current = ranges[i];
        return current.unitId === oldRange.unitId && current.sheetId === oldRange.sheetId && Rectangle.equals(oldRange.range, current.range);
    });
};

