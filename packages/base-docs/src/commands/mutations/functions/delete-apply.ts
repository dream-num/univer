import { deleteContent, DocumentModel, getDocsUpdateBody, IDocumentBody } from '@univerjs/core';

import { deleteCustomBlocks, deleteCustomRanges, deleteParagraphs, deleteSectionBreaks, deleteTables, deleteTextRuns } from './common';

export function DeleteApply(document: DocumentModel, textLength: number, currentIndex: number, segmentId?: string): IDocumentBody {
    const doc = document.snapshot;

    const bodyModel = document.getBodyModel(segmentId);

    const body = getDocsUpdateBody(doc, segmentId);

    if (body == null) {
        throw new Error('no body has changed');
    }

    if (textLength <= 0) {
        return { dataStream: '' };
    }

    bodyModel.delete(currentIndex, textLength);

    const deleBody = updateAttributeByDelete(body, textLength, currentIndex);

    console.log('删除的model打印', bodyModel, body, deleBody);

    return deleBody;
}

function updateAttributeByDelete(body: IDocumentBody, textLength: number, currentIndex: number): IDocumentBody {
    const { dataStream } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;

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
