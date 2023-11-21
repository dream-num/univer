import {
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    deleteContent,
    DocumentBodyModel,
    DocumentModel,
    getDocsUpdateBody,
    IDocumentBody,
    IParagraph,
    Tools,
} from '@univerjs/core';

import {
    deleteCustomBlocks,
    deleteCustomRanges,
    deleteParagraphs,
    deleteSectionBreaks,
    deleteTables,
    deleteTextRuns,
} from './common';

export function DeleteApply(
    document: DocumentModel,
    textLength: number,
    currentIndex: number,
    segmentId?: string
): IDocumentBody {
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

    recoveryBody(bodyModel, body, deleBody); // If the last paragraph in the document is deleted, restore an initial blank document.

    // console.log('删除的model打印', bodyModel, body, deleBody);

    return deleBody;
}

function updateAttributeByDelete(body: IDocumentBody, textLength: number, currentIndex: number): IDocumentBody {
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

function recoveryBody(bodyModel: DocumentBodyModel, body: IDocumentBody, deleBody: IDocumentBody) {
    if (bodyModel.children[0].children.length === 0) {
        bodyModel.reset({
            dataStream: DEFAULT_EMPTY_DOCUMENT_VALUE,
        });
    }

    if (body.dataStream === '\n') {
        body.dataStream = DEFAULT_EMPTY_DOCUMENT_VALUE;

        const firstParagraph = deleBody.paragraphs?.[0];

        if (firstParagraph != null) {
            const newParagraph = Tools.deepClone(firstParagraph) as IParagraph;
            newParagraph.startIndex = 0;
            body.paragraphs = [newParagraph];
        }
    }
}
