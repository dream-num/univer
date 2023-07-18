import { IDocumentBody } from '../../Interfaces/IDocumentData';
import { horizontalLineSegmentsSubtraction } from '../../Shared/Common';
import { isSameStyleTextRun } from '../../Shared/Compare';
import { sortRulesFactory } from '../../Shared/SortRules';

export function insertTextRuns(body: IDocumentBody, insertBody: IDocumentBody, textLength: number, currentIndex: number) {
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

            textRuns.splice(insertIndex, 1, startSplitTextRun, ...insertTextRuns, endSplitTextRun);
        }
    }
}

export function insertParagraphs(body: IDocumentBody, insertBody: IDocumentBody, textLength: number, currentIndex: number) {
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

export function insertSectionBreaks(body: IDocumentBody, insertBody: IDocumentBody, textLength: number, currentIndex: number) {
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

export function insertCustomBlocks(body: IDocumentBody, insertBody: IDocumentBody, textLength: number, currentIndex: number) {
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

export function insertTables(body: IDocumentBody, insertBody: IDocumentBody, textLength: number, currentIndex: number) {
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

export function insertCustomRanges(body: IDocumentBody, insertBody: IDocumentBody, textLength: number, currentIndex: number) {
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

export function deleteTextRuns(body: IDocumentBody, textLength: number, currentIndex: number) {
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

export function deleteParagraphs(body: IDocumentBody, textLength: number, currentIndex: number) {
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

export function deleteSectionBreaks(body: IDocumentBody, textLength: number, currentIndex: number) {
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

export function deleteCustomBlocks(body: IDocumentBody, textLength: number, currentIndex: number) {
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

export function deleteTables(body: IDocumentBody, textLength: number, currentIndex: number) {
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

export function deleteCustomRanges(body: IDocumentBody, textLength: number, currentIndex: number) {
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
