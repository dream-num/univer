import { DocumentModel } from '../Domain/DocumentModel';
import { getDocsUpdateBody } from '../../Shared/Common';
import { IDocumentBody } from '../../Interfaces/IDocumentData';

export function DeleteApply(
    document: DocumentModel,
    textLength: number,
    currentIndex: number,
    segmentId?: string
) {
    const doc = document.snapshot;

    const bodyModel = document.getBodyModel(segmentId);

    const body = getDocsUpdateBody(doc, segmentId);

    if (body == null) {
        throw new Error('no body has changed');
    }

    updateAttributeByDelete(body, textLength, currentIndex);

    bodyModel.delete();
}

function updateAttributeByDelete(
    body: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const {
        textRuns,
        paragraphs,
        sectionBreaks,
        customBlocks,
        tables,
        customRanges,
        dataStream,
    } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;

    if (textRuns) {
        const newTextRuns = [];
        for (let i = 0, len = textRuns.length; i < len; i++) {
            const textRun = textRuns[i];
            const { st, ed } = textRun;
            if (startIndex >= st && startIndex <= ed) {
                textRun.ed = startIndex - 1;
            } else if (endIndex >= st && endIndex <= ed) {
                textRun.st = endIndex + 1;
            } else if (startIndex <= st && endIndex >= ed) {
                continue;
            } else if (st > endIndex) {
                textRun.st -= textLength;
                textRun.ed -= textLength;
            }
            newTextRuns.push(textRun);
        }
        body.textRuns = newTextRuns;
    }

    if (paragraphs) {
        for (let i = 0, len = paragraphs.length; i < len; i++) {
            const paragraph = paragraphs[i];
            const { startIndex } = paragraph;
            if (startIndex > currentIndex) {
                paragraph.startIndex += textLength;
            }
        }
    }

    if (sectionBreaks) {
        for (let i = 0, len = sectionBreaks.length; i < len; i++) {
            const sectionBreak = sectionBreaks[i];
            const { startIndex } = sectionBreak;
            if (startIndex > currentIndex) {
                sectionBreak.startIndex += textLength;
            }
        }
    }

    if (customBlocks) {
        for (let i = 0, len = customBlocks.length; i < len; i++) {
            const customBlock = customBlocks[i];
            const { startIndex } = customBlock;
            if (startIndex > currentIndex) {
                customBlock.startIndex += textLength;
            }
        }
    }

    if (tables) {
        for (let i = 0, len = tables.length; i < len; i++) {
            const table = tables[i];
            const { startIndex, endIndex } = table;
            if (startIndex > currentIndex) {
                table.startIndex += textLength;
                table.endIndex += textLength;
            } else if (endIndex >= currentIndex) {
                table.endIndex += textLength;
            }
        }
    }

    if (customRanges) {
        for (let i = 0, len = customRanges.length; i < len; i++) {
            const customRange = customRanges[i];
            const { startIndex, endIndex } = customRange;
            if (startIndex > currentIndex) {
                customRange.startIndex += textLength;
                customRange.endIndex += textLength;
            } else if (endIndex >= currentIndex) {
                customRange.endIndex += textLength;
            }
        }
    }

    return {
        textRuns,
        paragraphs,
        sectionBreaks,
        customBlocks,
        tables,
        customRanges,
        dataStream,
    };
}
