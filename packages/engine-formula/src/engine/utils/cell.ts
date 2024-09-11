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

import { DataStreamTreeTokenType, DEFAULT_EMPTY_DOCUMENT_VALUE } from '@univerjs/core';
import type { ICellData, Nullable } from '@univerjs/core';

export function getCellValue(cell: Nullable<ICellData>) {
    if (cell === null) {
        return 0;
    }

    // TODO: @weird94 this method is need to unified to a same handler function
    if (cell?.p) {
        const body = cell?.p.body;

        if (body == null) {
            return 0;
        }

        const data = body.dataStream;
        const lastString = data.substring(data.length - 2, data.length);
        const newDataStream = lastString === DEFAULT_EMPTY_DOCUMENT_VALUE ?
            data.substring(0, data.length - 2)
                .replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_START, '')
                .replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_END, '')
            : data;

        return newDataStream;
    }

    return cell?.v || 0;
}
