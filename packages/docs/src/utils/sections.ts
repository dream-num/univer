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

import type { IDocumentBody, ISectionBreak } from '@univerjs/core';
import { DataStreamTreeTokenType } from '@univerjs/core';

/** Returns document-level section breaks, excluding table-cell and modern-column sentinels. */
export function getTopLevelSectionBreaks(body: IDocumentBody): ISectionBreak[] {
    const sectionBreakByIndex = new Map((body.sectionBreaks ?? []).map((sectionBreak) => [sectionBreak.startIndex, sectionBreak]));
    const result: ISectionBreak[] = [];
    let tableCellDepth = 0;
    let columnDepth = 0;

    for (let index = 0; index < body.dataStream.length; index++) {
        const token = body.dataStream[index];
        if (token === DataStreamTreeTokenType.TABLE_CELL_START) {
            tableCellDepth++;
        } else if (token === DataStreamTreeTokenType.TABLE_CELL_END) {
            tableCellDepth = Math.max(0, tableCellDepth - 1);
        } else if (token === DataStreamTreeTokenType.COLUMN_START) {
            columnDepth++;
        } else if (token === DataStreamTreeTokenType.COLUMN_END) {
            columnDepth = Math.max(0, columnDepth - 1);
        } else if (token === DataStreamTreeTokenType.SECTION_BREAK && tableCellDepth === 0 && columnDepth === 0) {
            const sectionBreak = sectionBreakByIndex.get(index);
            if (sectionBreak) {
                result.push(sectionBreak);
            }
        }
    }

    return result;
}
