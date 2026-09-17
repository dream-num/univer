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

import type { IDocumentBody } from '../../../../types/interfaces/i-document-data';
import { insertTextToContent } from '../../../../shared/doc-tool';
import {
    insertBlockRanges,
    insertColumnGroups,
    insertCustomBlocks,
    insertCustomDecorations,
    insertCustomRanges,
    insertDocxExportExcludedRanges,
    insertDocxRawBlocks,
    insertDocxRawCustomBlocks,
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
    const originalDataStream = body.dataStream;
    body.dataStream = insertTextToContent(body.dataStream, currentIndex, insertBody.dataStream);

    if (body.renderedPageBreaks != null || insertBody.renderedPageBreaks != null) {
        body.renderedPageBreaks = [
            ...(body.renderedPageBreaks ?? []).map((offset) => offset >= currentIndex ? offset + textLength : offset),
            ...(insertBody.renderedPageBreaks ?? []).map((offset) => offset + currentIndex),
        ].sort((left, right) => left - right);
    }

    insertTextRuns(body, insertBody, textLength, currentIndex);

    insertParagraphs(body, insertBody, textLength, currentIndex, false, originalDataStream);

    insertSectionBreaks(body, insertBody, textLength, currentIndex);

    insertCustomBlocks(body, insertBody, textLength, currentIndex);

    insertDocxRawCustomBlocks(body, insertBody, textLength, currentIndex);

    insertDocxRawBlocks(body, insertBody, textLength, currentIndex);

    insertDocxExportExcludedRanges(body, insertBody, textLength, currentIndex);

    insertTables(body, insertBody, textLength, currentIndex);

    insertColumnGroups(body, insertBody, textLength, currentIndex);

    insertBlockRanges(body, insertBody, textLength, currentIndex);

    insertCustomRanges(body, insertBody, textLength, currentIndex);

    insertCustomDecorations(body, insertBody, textLength, currentIndex);
}
