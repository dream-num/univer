import { DocumentModel, getDocsUpdateBody, IDocumentBody, insertTextToContent } from '@univerjs/core';

import {
    insertCustomBlocks,
    insertCustomRanges,
    insertParagraphs,
    insertSectionBreaks,
    insertTables,
    insertTextRuns,
} from './common';

export function InsertApply(
    document: DocumentModel,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number,
    segmentId?: string
) {
    const doc = document.snapshot;

    const bodyModel = document.getBodyModel(segmentId);

    const body = getDocsUpdateBody(doc, segmentId);

    if (textLength === 0) {
        return;
    }

    if (body == null) {
        throw new Error('no body has changed');
    }

    updateAttributeByInsert(body, insertBody, textLength, currentIndex);

    if (insertBody.dataStream.length > 1 && /\r/.test(insertBody.dataStream)) {
        // TODO: @JOCS, The DocumentModel needs to be rewritten to better support the
        // large area of updates that are brought about by the paste, abstract the
        // methods associated with the DocumentModel insertion, and support atomic operations
        bodyModel.reset(body);
    } else {
        bodyModel.insert(insertBody, currentIndex);
    }

    console.log('插入的model打印', bodyModel, textLength, currentIndex);
}

function updateAttributeByInsert(
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
