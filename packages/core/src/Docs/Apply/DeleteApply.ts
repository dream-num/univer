import { DocumentModel } from '../Domain/DocumentModel';
import { deleteContent, getDocsUpdateBody } from '../../Shared/Common';
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

    bodyModel.delete(currentIndex, textLength);

    return updateAttributeByDelete(body, textLength, currentIndex);
}

function updateAttributeByDelete(
    body: IDocumentBody,
    textLength: number,
    currentIndex: number
): IDocumentBody {
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

    const removeTextRuns = [];
    if (textRuns) {
        const newTextRuns = [];
        for (let i = 0, len = textRuns.length; i < len; i++) {
            const textRun = textRuns[i];
            const { st, ed } = textRun;

            if (startIndex <= st && endIndex >= ed) {
                removeTextRuns.push({
                    ...textRun,
                    st: st - currentIndex,
                    ed: ed - currentIndex,
                });
                continue;
            } else if (startIndex >= st && startIndex <= ed) {
                removeTextRuns.push({
                    ...textRun,
                    st: startIndex - currentIndex,
                    ed: ed - currentIndex,
                });
                textRun.ed = startIndex - 1;
            } else if (endIndex >= st && endIndex <= ed) {
                removeTextRuns.push({
                    ...textRun,
                    st: st - currentIndex,
                    ed: endIndex - currentIndex,
                });
                textRun.st = endIndex + 1;
            } else if (st > endIndex) {
                textRun.st -= textLength;
                textRun.ed -= textLength;
            }
            newTextRuns.push(textRun);
        }
        body.textRuns = newTextRuns;
    }

    const removeParagraphs = [];
    if (paragraphs) {
        const newParagraphs = [];
        for (let i = 0, len = paragraphs.length; i < len; i++) {
            const paragraph = paragraphs[i];
            const { startIndex: index } = paragraph;
            if (index >= startIndex && index <= endIndex) {
                removeParagraphs.push({
                    ...paragraph,
                    startIndex: index - currentIndex,
                });
                continue;
            } else if (index > endIndex) {
                paragraph.startIndex -= textLength;
            }

            newParagraphs.push(paragraph);
        }
        body.paragraphs = newParagraphs;
    }

    const removeSectionBreaks = [];
    if (sectionBreaks) {
        const newSectionBreaks = [];
        for (let i = 0, len = sectionBreaks.length; i < len; i++) {
            const sectionBreak = sectionBreaks[i];
            const { startIndex: index } = sectionBreak;
            if (index >= startIndex && index <= endIndex) {
                removeSectionBreaks.push({
                    ...sectionBreak,
                    startIndex: index - currentIndex,
                });
                continue;
            } else if (index > endIndex) {
                sectionBreak.startIndex -= textLength;
            }

            newSectionBreaks.push(sectionBreak);
        }
        body.sectionBreaks = newSectionBreaks;
    }

    const removeCustomBlocks = [];
    if (customBlocks) {
        const newCustomBlocks = [];
        for (let i = 0, len = customBlocks.length; i < len; i++) {
            const customBlock = customBlocks[i];
            const { startIndex: index } = customBlock;
            if (index >= startIndex && index <= endIndex) {
                removeCustomBlocks.push({
                    ...customBlock,
                    startIndex: index - currentIndex,
                });
                continue;
            } else if (index > endIndex) {
                customBlock.startIndex -= textLength;
            }

            newCustomBlocks.push(customBlock);
        }
        body.customBlocks = newCustomBlocks;
    }

    const removeTables = [];
    if (tables) {
        const newTables = [];
        for (let i = 0, len = tables.length; i < len; i++) {
            const table = tables[i];
            const { startIndex: st, endIndex: ed } = table;
            if (startIndex <= st && endIndex >= ed) {
                removeTables.push({
                    ...table,
                    st: st - currentIndex,
                    ed: ed - currentIndex,
                });
                continue;
            } else if (endIndex < st) {
                table.startIndex -= textLength;
                table.endIndex -= textLength;
            }
            newTables.push(table);
        }
        body.tables = newTables;
    }

    const removeCustomRanges = [];
    if (customRanges) {
        const newCustomRanges = [];
        for (let i = 0, len = customRanges.length; i < len; i++) {
            const customRange = customRanges[i];
            const { startIndex: st, endIndex: ed } = customRange;
            if (startIndex <= st && endIndex >= ed) {
                removeCustomRanges.push({
                    ...customRange,
                    st: st - currentIndex,
                    ed: ed - currentIndex,
                });
                continue;
            } else if (endIndex < st) {
                customRange.startIndex -= textLength;
                customRange.endIndex -= textLength;
            }
            newCustomRanges.push(customRange);
        }
        body.customRanges = newCustomRanges;
    }

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
