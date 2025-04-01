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
import { BuildTextUtils, CellValueType } from '@univerjs/core';

/**
 * Get pure text in a cell.
 * @param cell
 * @returns pure text in this cell
 */
export function extractPureTextFromCell(cell: Nullable<ICellData>): string {
    if (!cell) {
        return '';
    }

    const richTextValue = cell.p?.body?.dataStream;
    if (richTextValue) {
        return BuildTextUtils.transform.getPlainText(richTextValue);
    }

    const rawValue = cell.v;

    if (typeof rawValue === 'string') {
        if (cell.t === CellValueType.BOOLEAN) {
            return rawValue.toUpperCase();
        }

        // the browser will automatically cache the regular expression, so we don't need to cache it manually
        return rawValue.replace(/[\r\n]/g, '');
    };

    if (typeof rawValue === 'number') {
        if (cell.t === CellValueType.BOOLEAN) return rawValue ? 'TRUE' : 'FALSE';
        return rawValue.toString();
    };

    if (typeof rawValue === 'boolean') return rawValue ? 'TRUE' : 'FALSE';

    return '';
}
