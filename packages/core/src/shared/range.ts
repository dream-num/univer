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

import { AbsoluteRefType, type IRange } from '../types/interfaces/i-range';
import { Rectangle } from './rectangle';

export function moveRangeByOffset(range: IRange, refOffsetX: number, refOffsetY: number, ignoreAbsolute = false): IRange {
    let newRange = { ...range };

    const startAbsoluteRefType = newRange.startAbsoluteRefType || AbsoluteRefType.NONE;
    const endAbsoluteRefType = newRange.endAbsoluteRefType || AbsoluteRefType.NONE;

    if (!ignoreAbsolute && startAbsoluteRefType === AbsoluteRefType.ALL && endAbsoluteRefType === AbsoluteRefType.ALL) {
        return newRange;
    }

    if (ignoreAbsolute || (startAbsoluteRefType === AbsoluteRefType.NONE && endAbsoluteRefType === AbsoluteRefType.NONE)) {
        return Rectangle.moveOffset(newRange, refOffsetX, refOffsetY);
    }

    if (startAbsoluteRefType === AbsoluteRefType.NONE) {
        newRange = { ...newRange, startRow: newRange.startRow + refOffsetY, startColumn: newRange.startColumn + refOffsetX };
    } else if (startAbsoluteRefType === AbsoluteRefType.COLUMN) {
        newRange = { ...newRange, startRow: newRange.startRow + refOffsetY };
    } else if (startAbsoluteRefType === AbsoluteRefType.ROW) {
        newRange = { ...newRange, startColumn: newRange.startColumn + refOffsetX };
    }

    if (endAbsoluteRefType === AbsoluteRefType.NONE) {
        newRange = { ...newRange, endRow: newRange.endRow + refOffsetY, endColumn: newRange.endColumn + refOffsetX };
    } else if (endAbsoluteRefType === AbsoluteRefType.COLUMN) {
        newRange = { ...newRange, endRow: newRange.endRow + refOffsetY };
    } else if (endAbsoluteRefType === AbsoluteRefType.ROW) {
        newRange = { ...newRange, endColumn: newRange.endColumn + refOffsetX };
    }

    return newRange;
}
