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

import { DEFAULT_EMPTY_DOCUMENT_VALUE, type ICellData, type Nullable } from '@univerjs/core';

export function getCellValueOrigin(cell: Nullable<ICellData>) {
    if (cell === null) {
        return '';
    }

    if (cell?.p) {
        const body = cell?.p.body;

        if (body == null) {
            return '';
        }

        const data = body.dataStream;
        const lastString = data.substring(data.length - 2, data.length);
        const newDataStream = lastString === DEFAULT_EMPTY_DOCUMENT_VALUE ? data.substring(0, data.length - 2) : data;

        return newDataStream;
    }

    return cell?.v;
}
