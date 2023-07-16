import { DocumentModel } from '../Domain/DocumentModel';
import { deleteContent, getDocsUpdateBody, horizontalLineSegmentsSubtraction } from '../../Shared/Common';
import { IDocumentBody } from '../../Interfaces/IDocumentData';

export function DeleteApply(document: DocumentModel, textLength: number, currentIndex: number, segmentId?: string) {
    const doc = document.snapshot;

    const bodyModel = document.getBodyModel(segmentId);

    const body = getDocsUpdateBody(doc, segmentId);

    if (body == null) {
        throw new Error('no body has changed');
    }

    bodyModel.delete(currentIndex, textLength);

    return updateAttributeByDelete(body, textLength, currentIndex);
}

function updateAttributeByDelete(body: IDocumentBody, textLength: number, currentIndex: number): IDocumentBody {
    const { dataStream } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;

    const removeTextRuns = processTextRuns(body, textLength, currentIndex);

    const removeParagraphs = processParagraphs(body, textLength, currentIndex);

    const removeSectionBreaks = processSectionBreaks(body, textLength, currentIndex);

    const removeCustomBlocks = processCustomBlocks(body, textLength, currentIndex);

    const removeTables = processTables(body, textLength, currentIndex);

    const removeCustomRanges = processCustomRanges(body, textLength, currentIndex);

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

function processTextRuns(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { textRuns } = body;

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
            } else if (st <= startIndex && ed >= endIndex) {
                const segments = horizontalLineSegmentsSubtraction(st, ed, startIndex, endIndex);

                if (segments.length > 2) {
                    const seg1 = segments[0];
                    const seg2 = segments[1];
                    textRun.st = seg1[0];
                    textRun.ed = seg1[1] + seg2[1] - seg2[0] + 1;
                } else {
                    textRun.st = segments[0][0];
                    textRun.ed = segments[0][1];
                }
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

    return removeTextRuns;
}

function processParagraphs(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { paragraphs } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;
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
    return removeParagraphs;
}

function processSectionBreaks(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { sectionBreaks } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;
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
    return removeSectionBreaks;
}

function processCustomBlocks(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { customBlocks } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;
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
    return removeCustomBlocks;
}

function processTables(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { tables } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;
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
            } else if (st <= startIndex && ed >= endIndex) {
                const segments = horizontalLineSegmentsSubtraction(st, ed, startIndex, endIndex);

                if (segments.length > 2) {
                    const seg1 = segments[0];
                    const seg2 = segments[1];
                    table.startIndex = seg1[0];
                    table.endIndex = seg1[1] + seg2[1] - seg2[0] + 1;
                } else {
                    table.startIndex = segments[0][0];
                    table.endIndex = segments[0][1];
                }
            } else if (endIndex < st) {
                table.startIndex -= textLength;
                table.endIndex -= textLength;
            }
            newTables.push(table);
        }
        body.tables = newTables;
    }
    return removeTables;
}

function processCustomRanges(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { customRanges } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;
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
            } else if (st <= startIndex && ed >= endIndex) {
                const segments = horizontalLineSegmentsSubtraction(st, ed, startIndex, endIndex);

                if (segments.length > 2) {
                    const seg1 = segments[0];
                    const seg2 = segments[1];
                    customRange.startIndex = seg1[0];
                    customRange.endIndex = seg1[1] + seg2[1] - seg2[0] + 1;
                } else {
                    customRange.startIndex = segments[0][0];
                    customRange.endIndex = segments[0][1];
                }
            } else if (endIndex < st) {
                customRange.startIndex -= textLength;
                customRange.endIndex -= textLength;
            }
            newCustomRanges.push(customRange);
        }
        body.customRanges = newCustomRanges;
    }
    return removeCustomRanges;
}
