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

import type { IDocumentBody } from '../../../../types/interfaces';
import { insertTextToContent } from '../../../../shared';
import {
    insertCustomBlocks,
    insertCustomDecorations,
    insertCustomRanges,
    insertParagraphs,
    insertSectionBreaks,
    insertTables,
    insertTextRuns,
} from './common';

export function updateAttributeByInsert(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    body.dataStream = insertTextToContent(body.dataStream, currentIndex, insertBody.dataStream);

    insertTextRuns(body, insertBody, textLength, currentIndex);

    insertParagraphs(body, insertBody, textLength, currentIndex);

    insertSectionBreaks(body, insertBody, textLength, currentIndex);

    insertCustomBlocks(body, insertBody, textLength, currentIndex);

    insertTables(body, insertBody, textLength, currentIndex);

    insertCustomRanges(body, insertBody, textLength, currentIndex);

    insertCustomDecorations(body, insertBody, textLength, currentIndex);
}
