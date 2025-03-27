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

import type { IDocumentData } from '@univerjs/core';
import { DataStreamTreeTokenType } from '@univerjs/core';

export function findFirstCursorOffset(snapshot: IDocumentData) {
    const { dataStream } = snapshot.body ?? {};
    const EXCLUDE_TOKENS: string[] = [
        DataStreamTreeTokenType.TABLE_START,
        DataStreamTreeTokenType.TABLE_CELL_END,
        DataStreamTreeTokenType.TABLE_CELL_START,
        DataStreamTreeTokenType.TABLE_END,
        DataStreamTreeTokenType.TABLE_ROW_END,
        DataStreamTreeTokenType.TABLE_ROW_START,
        DataStreamTreeTokenType.COLUMN_BREAK,
        DataStreamTreeTokenType.PAGE_BREAK,
        DataStreamTreeTokenType.TAB,
        DataStreamTreeTokenType.DOCS_END,
        DataStreamTreeTokenType.CUSTOM_BLOCK,
    ];

    if (typeof dataStream === 'string') {
        for (let i = 0; i < dataStream.length; i++) {
            const char = dataStream[i];
            if (!EXCLUDE_TOKENS.includes(char)) {
                return i;
            }
        }
    }

    return 0;
}
