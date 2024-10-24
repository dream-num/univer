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

import type { ICustomTable, IParagraph, ITextRun, ITextStyle, Nullable } from '@univerjs/core';

export function hasParagraphInTable(paragraph: IParagraph, tables: ICustomTable[]) {
    return tables.some((table) => paragraph.startIndex > table.startIndex && paragraph.startIndex < table.endIndex);
}

export function getTextRunAtPosition(textRuns: ITextRun[], position: number, cacheStyle?: Nullable<ITextStyle>) {
    for (let i = textRuns.length - 1; i >= 0; i--) {
        const textRun = textRuns[i];
        const { st, ed } = textRun;

        if (position > st && position <= ed) {
            return {
                ...textRun,
                ts: {
                    ...textRun.ts,
                    ...cacheStyle,
                },
            };
        }
    }

    return cacheStyle ? { ts: cacheStyle } : null;
}
