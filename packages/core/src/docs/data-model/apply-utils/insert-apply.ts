import { insertTextToContent } from '../../../shared';
import type { IDocumentBody } from '../../../types/interfaces';
import {
    insertCustomBlocks,
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
}
