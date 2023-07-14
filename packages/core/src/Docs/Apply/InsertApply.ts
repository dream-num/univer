import { IDocumentBody } from '../../Interfaces/IDocumentData';
import { sortRulesFactory } from '../../Shared/SortRules';
import { DocumentModel } from '../Domain/DocumentModel';
import { getDocsUpdateBody } from '../../Shared/Common';
import { isSameStyleTextRun } from '../../Shared/Compare';

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

    bodyModel.insert(insertBody, currentIndex);

    updateAttributeByInsert(body, insertBody, textLength, currentIndex);
}

function updateAttributeByInsert(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    processTextRuns(body, insertBody, textLength, currentIndex);

    processParagraphs(body, insertBody, textLength, currentIndex);

    processSectionBreaks(body, insertBody, textLength, currentIndex);

    processCustomBlocks(body, insertBody, textLength, currentIndex);

    processTables(body, insertBody, textLength, currentIndex);

    processCustomRanges(body, insertBody, textLength, currentIndex);
}

function processTextRuns(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { textRuns } = body;

    if (textRuns == null) {
        return;
    }

    let insertIndex = Infinity;
    for (let i = 0, len = textRuns.length; i < len; i++) {
        const textRun = textRuns[i];
        const { st, ed } = textRun;
        if (st > currentIndex) {
            textRun.st += textLength;
            textRun.ed += textLength;

            if (insertIndex === Infinity) {
                insertIndex = -Infinity;
            }
        } else if (ed >= currentIndex) {
            textRun.ed += textLength;
            insertIndex = i;
        }
    }

    const insertTextRuns = insertBody.textRuns;
    if (insertTextRuns) {
        for (let i = 0, len = insertTextRuns.length; i < len; i++) {
            const insertTextRun = insertTextRuns[i];
            insertTextRun.st += currentIndex;
            insertTextRun.ed += currentIndex;
        }
        if (insertIndex === Infinity) {
            textRuns.push(...insertTextRuns);
        }
        if (insertIndex === -Infinity) {
            textRuns.unshift(...insertTextRuns);
        } else {
            const splitTextRun = textRuns[insertIndex];
            const { st, ed } = splitTextRun;
            const startSplitTextRun = {
                ...splitTextRun,
                st,
                ed: insertTextRuns[0].st - 1,
            };

            if (isSameStyleTextRun(startSplitTextRun, insertTextRuns[0])) {
                startSplitTextRun.ed = insertTextRuns[0].ed;
                insertTextRuns.shift();
            }

            const lastInsertTextRuns = insertTextRuns[insertTextRuns.length - 1];
            const endSplitTextRun = {
                ...splitTextRun,
                st: lastInsertTextRuns.ed + 1,
                ed,
            };

            if (isSameStyleTextRun(endSplitTextRun, lastInsertTextRuns)) {
                endSplitTextRun.st = lastInsertTextRuns.st;
                insertTextRuns.pop();
            }

            textRuns.splice(
                insertIndex,
                1,
                startSplitTextRun,
                ...insertTextRuns,
                endSplitTextRun
            );
        }
    }
}

function processParagraphs(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { paragraphs } = body;

    if (paragraphs == null) {
        return;
    }
    for (let i = 0, len = paragraphs.length; i < len; i++) {
        const paragraph = paragraphs[i];
        const { startIndex } = paragraph;
        if (startIndex > currentIndex) {
            paragraph.startIndex += textLength;
        }
    }

    const insertParagraphs = insertBody.paragraphs;
    if (insertParagraphs) {
        for (let i = 0, len = insertParagraphs.length; i < len; i++) {
            const insertTextRun = insertParagraphs[i];
            insertTextRun.startIndex += currentIndex;
        }

        paragraphs.push(...insertParagraphs);
        paragraphs.sort(sortRulesFactory('startIndex'));
    }
}

function processSectionBreaks(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { sectionBreaks } = body;

    if (sectionBreaks == null) {
        return;
    }

    for (let i = 0, len = sectionBreaks.length; i < len; i++) {
        const sectionBreak = sectionBreaks[i];
        const { startIndex } = sectionBreak;
        if (startIndex > currentIndex) {
            sectionBreak.startIndex += textLength;
        }
    }

    const insertSectionBreaks = insertBody.sectionBreaks;
    if (insertSectionBreaks) {
        for (let i = 0, len = insertSectionBreaks.length; i < len; i++) {
            const sectionBreak = insertSectionBreaks[i];
            sectionBreak.startIndex += currentIndex;
        }

        sectionBreaks.push(...insertSectionBreaks);
        sectionBreaks.sort(sortRulesFactory('startIndex'));
    }
}

function processCustomBlocks(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { customBlocks } = body;

    if (customBlocks == null) {
        return;
    }

    for (let i = 0, len = customBlocks.length; i < len; i++) {
        const customBlock = customBlocks[i];
        const { startIndex } = customBlock;
        if (startIndex > currentIndex) {
            customBlock.startIndex += textLength;
        }
    }

    const insertCustomBlocks = insertBody.customBlocks;
    if (insertCustomBlocks) {
        for (let i = 0, len = insertCustomBlocks.length; i < len; i++) {
            const customBlock = insertCustomBlocks[i];
            customBlock.startIndex += currentIndex;
        }

        customBlocks.push(...insertCustomBlocks);
        customBlocks.sort(sortRulesFactory('startIndex'));
    }
}

function processTables(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { tables } = body;

    if (tables == null) {
        return;
    }

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

    const insertTables = insertBody.tables;
    if (insertTables) {
        for (let i = 0, len = insertTables.length; i < len; i++) {
            const table = insertTables[i];
            table.startIndex += currentIndex;
            table.endIndex += currentIndex;
        }

        tables.push(...insertTables);
        tables.sort(sortRulesFactory('startIndex'));
    }
}

function processCustomRanges(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { customRanges } = body;

    if (customRanges == null) {
        return;
    }

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

    const insertCustomRanges = insertBody.customRanges;
    if (insertCustomRanges) {
        for (let i = 0, len = insertCustomRanges.length; i < len; i++) {
            const customRange = insertCustomRanges[i];
            customRange.startIndex += currentIndex;
            customRange.endIndex += currentIndex;
        }

        customRanges.push(...insertCustomRanges);
        customRanges.sort(sortRulesFactory('startIndex'));
    }
}
