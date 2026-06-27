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

import type { ICellData, Nullable } from '@univerjs/core';
import { CellValueType, isDefaultFormat, isTextFormat } from '@univerjs/core';
import { getPatternType } from './pattern';

export const DEFAULT_SCIENTIFIC_NOTATION_FORMAT = '0.00E+00';

export function isScientificNotationNumericCell(cell: Nullable<ICellData>): boolean {
    return cell?.t === CellValueType.NUMBER && cell.v !== undefined && cell.v !== null && /e/i.test(String(cell.v));
}

export function getScientificNotationFormatFromCell(cell: Nullable<ICellData>): string {
    const text = String(cell?.v);
    const eIndex = text.search(/e/i);
    const decimalIndex = text.indexOf('.');
    const decimalLength = eIndex > -1 && decimalIndex > -1 ? eIndex - decimalIndex - 1 : 0;

    return `0.${'0'.repeat(Math.max(2, decimalLength))}E+00`;
}

// Scientific notation numbers cannot be accurately expanded with JS number precision, so only formats that preserve
// the notation or raw text are allowed.
export function isAllowedPatternForScientificNotationNumber(pattern?: string): boolean {
    return isDefaultFormat(pattern) || isTextFormat(pattern) || getPatternType(pattern) === 'scientific';
}
