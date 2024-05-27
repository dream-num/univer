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

import { deleteContent } from '../../../../shared';
import type { IDocumentBody } from '../../../../types/interfaces';
import {
    deleteCustomBlocks,
    deleteCustomRanges,
    deleteParagraphs,
    deleteSectionBreaks,
    deleteTables,
    deleteTextRuns,
} from './common';

export function updateAttributeByDelete(body: IDocumentBody, textLength: number, currentIndex: number): IDocumentBody {
    const { dataStream } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength;

    const removeTextRuns = deleteTextRuns(body, textLength, currentIndex);

    const removeParagraphs = deleteParagraphs(body, textLength, currentIndex);

    const removeSectionBreaks = deleteSectionBreaks(body, textLength, currentIndex);

    const removeCustomBlocks = deleteCustomBlocks(body, textLength, currentIndex);

    const removeTables = deleteTables(body, textLength, currentIndex);

    const removeCustomRanges = deleteCustomRanges(body, textLength, currentIndex);

    let removeDataStream = '';
    if (dataStream) {
        body.dataStream = deleteContent(dataStream, startIndex, endIndex);

        removeDataStream = dataStream.slice(startIndex, endIndex);
    }

    return {
        dataStream: removeDataStream,
        textRuns: removeTextRuns,
        paragraphs: removeParagraphs,
        sectionBreaks: removeSectionBreaks,
        customBlocks: removeCustomBlocks,
        tables: removeTables,
        customRanges: removeCustomRanges,
    };
}

// export function recoveryBody(bodyModel: DocumentViewModel, body: IDocumentBody, deleBody: IDocumentBody) {
//     if (bodyModel.children[0].children.length === 0) {
//         bodyModel.reset({
//             dataStream: DEFAULT_EMPTY_DOCUMENT_VALUE,
//         });
//     }

//     if (body.dataStream === '\n') {
//         body.dataStream = DEFAULT_EMPTY_DOCUMENT_VALUE;

//         const firstParagraph = deleBody.paragraphs?.[0];

//         if (firstParagraph != null) {
//             const newParagraph = Tools.deepClone(firstParagraph) as IParagraph;
//             newParagraph.startIndex = 0;
//             body.paragraphs = [newParagraph];
//         }
//     }
// }
