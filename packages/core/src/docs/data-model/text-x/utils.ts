/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { ICustomBlock, ICustomDecoration, ICustomRange, IDocumentBody, IParagraph, ISectionBreak, ITextRun } from '../../../types/interfaces/i-document-data';
import type { IRetainAction } from './action-types';
import { UpdateDocsAttributeType } from '../../../shared/command-enum';
import { Tools } from '../../../shared/tools';
import { normalizeTextRuns } from './apply-utils/common';
import { coverTextRuns } from './apply-utils/update-apply';

export enum SliceBodyType {
    copy,
    cut,
}

export function getTextRunSlice(
    body: IDocumentBody,
    startOffset: number,
    endOffset: number,
    returnEmptyTextRuns = true
) {
    const { textRuns } = body;

    if (textRuns) {
        const newTextRuns: ITextRun[] = [];

        for (const textRun of textRuns) {
            const clonedTextRun = Tools.deepClone(textRun);
            const { st, ed } = clonedTextRun;

            if (Tools.hasIntersectionBetweenTwoRanges(st, ed, startOffset, endOffset)) {
                if (startOffset >= st && startOffset <= ed) {
                    newTextRuns.push({
                        ...clonedTextRun,
                        st: startOffset,
                        ed: Math.min(endOffset, ed),
                    });
                } else if (endOffset >= st && endOffset <= ed) {
                    newTextRuns.push({
                        ...clonedTextRun,
                        st: Math.max(startOffset, st),
                        ed: endOffset,
                    });
                } else {
                    newTextRuns.push(clonedTextRun);
                }
            }
        }

        return normalizeTextRuns(
            newTextRuns.map((tr) => {
                const { st, ed } = tr;
                return {
                    ...tr,
                    st: st - startOffset,
                    ed: ed - startOffset,
                };
            })
        );
    } else if (returnEmptyTextRuns) {
        // In the case of no style before, add the style, removeTextRuns will be empty,
        // in this case, you need to add an empty textRun for undo.
        return [{
            st: 0,
            ed: endOffset - startOffset,
            ts: {},
        }];
    }
}

export function getTableSlice(
    body: IDocumentBody,
    startOffset: number,
    endOffset: number
) {
    const { tables = [] } = body;
    const newTables = [];
    for (const table of tables) {
        const clonedTable = Tools.deepClone(table);
        const { startIndex, endIndex } = clonedTable;

        if (startIndex >= startOffset && endIndex <= endOffset) {
            newTables.push({
                ...clonedTable,
                startIndex: startIndex - startOffset,
                endIndex: endIndex - startOffset,
            });
        }
    }
    return newTables;
}

export function getParagraphsSlice(
    body: IDocumentBody,
    startOffset: number,
    endOffset: number
) {
    const { paragraphs = [] } = body;
    const newParagraphs: IParagraph[] = [];

    for (const paragraph of paragraphs) {
        const { startIndex } = paragraph;
        if (startIndex >= startOffset && startIndex < endOffset) {
            const copy = Tools.deepClone(paragraph);
            newParagraphs.push(copy);
        }
    }

    if (newParagraphs.length) {
        return newParagraphs.map((p) => ({
            ...p,
            startIndex: p.startIndex - startOffset,
        }));
    }
}

export function getSectionBreakSlice(
    body: IDocumentBody,
    startOffset: number,
    endOffset: number
) {
    const { sectionBreaks = [] } = body;
    const newSectionBreaks: ISectionBreak[] = [];

    for (const sectionBreak of sectionBreaks) {
        const { startIndex } = sectionBreak;
        if (startIndex >= startOffset && startIndex <= endOffset) {
            newSectionBreaks.push(Tools.deepClone(sectionBreak));
        }
    }

    if (newSectionBreaks.length) {
        return newSectionBreaks.map((sb) => ({
            ...sb,
            startIndex: sb.startIndex - startOffset,
        }));
    }
}

export function getCustomBlockSlice(
    body: IDocumentBody,
    startOffset: number,
    endOffset: number
) {
    const { customBlocks = [] } = body;
    const newCustomBlocks: ICustomBlock[] = [];

    for (const block of customBlocks) {
        const { startIndex } = block;
        if (startIndex >= startOffset && startIndex < endOffset) {
            newCustomBlocks.push(Tools.deepClone(block));
        }
    }

    if (newCustomBlocks.length) {
        return newCustomBlocks.map((b) => ({
            ...b,
            startIndex: b.startIndex - startOffset,
        }));
    }
}

export function getBodySlice(
    body: IDocumentBody,
    startOffset: number,
    endOffset: number,
    returnEmptyArray = true,
    type = SliceBodyType.cut
): IDocumentBody {
    const { dataStream } = body;

    const docBody: IDocumentBody = {
        dataStream: dataStream.slice(startOffset, endOffset),
    };

    docBody.textRuns = getTextRunSlice(body, startOffset, endOffset, returnEmptyArray);

    const newTables = getTableSlice(body, startOffset, endOffset);
    if (newTables.length) {
        docBody.tables = newTables;
    }

    docBody.paragraphs = getParagraphsSlice(body, startOffset, endOffset);

    if (type === SliceBodyType.cut) {
        const customDecorations = getCustomDecorationSlice(body, startOffset, endOffset);
        if (customDecorations) {
            docBody.customDecorations = customDecorations;
        } else if (returnEmptyArray) {
            docBody.customDecorations = [];
        }
    }
    const { customRanges } = getCustomRangeSlice(body, startOffset, endOffset);
    if (customRanges) {
        docBody.customRanges = customRanges;
    } else if (returnEmptyArray) {
        docBody.customRanges = [];
    }

    docBody.customBlocks = getCustomBlockSlice(body, startOffset, endOffset);

    return docBody;
}

export function normalizeBody(body: IDocumentBody): IDocumentBody {
    const { dataStream, textRuns, paragraphs, customRanges, customDecorations, tables } = body;
    let leftOffset = 0;
    let rightOffset = 0;

    customRanges?.forEach((range) => {
        if (range.startIndex < 0) {
            leftOffset = Math.max(leftOffset, -range.startIndex);
        }

        if (range.endIndex > dataStream.length - 1) {
            rightOffset = Math.max(rightOffset, range.endIndex - dataStream.length + 1);
        }
    });

    const newData = `${dataStream}`;

    if (textRuns) {
        if (textRuns[0]) {
            textRuns[0].st = textRuns[0].st - leftOffset;
        }

        if (textRuns[textRuns.length - 1]) {
            textRuns[textRuns.length - 1].ed = textRuns[textRuns.length - 1].ed + rightOffset;
        }
    }

    textRuns?.forEach((textRun) => {
        textRun.st += leftOffset;
        textRun.ed += leftOffset;
    });

    paragraphs?.forEach((p) => {
        p.startIndex += leftOffset;
    });

    customRanges?.forEach((range) => {
        range.startIndex += leftOffset;
        range.endIndex += leftOffset;
    });

    customDecorations?.forEach((d) => {
        d.startIndex += leftOffset;
        d.endIndex += rightOffset;
    });

    tables?.forEach((table) => {
        table.startIndex += leftOffset;
        table.endIndex += rightOffset;
    });

    return {
        ...body,
        dataStream: newData,
        textRuns,
        paragraphs,
        customRanges,
        customDecorations,
        tables,
    };
}

export function getCustomRangeSlice(body: IDocumentBody, startOffset: number, endOffset: number) {
    if (body.customRanges == null) {
        return {};
    }

    const { customRanges } = body;
    const leftOffset = 0;
    const rightOffset = 0;
    const relativeCustomRanges = customRanges
        .filter((customRange) => Math.max(customRange.startIndex, startOffset) <= Math.min(customRange.endIndex, endOffset - 1))
        .map((range) => ({
            ...range,
            startIndex: Math.max(range.startIndex, startOffset),
            endIndex: Math.min(range.endIndex, endOffset - 1),
        }));

    return {
        customRanges: relativeCustomRanges.map((range) => ({
            ...range,
            startIndex: range.startIndex - startOffset,
            endIndex: range.endIndex - startOffset,
        })),
        leftOffset,
        rightOffset,
    };
}

export function getCustomDecorationSlice(body: IDocumentBody, startOffset: number, endOffset: number) {
    if (body.customDecorations == null) {
        return;
    }

    const { customDecorations = [] } = body;
    const customDecorationSlice: ICustomDecoration[] = [];
    customDecorations.forEach((range) => {
        // 34 35
        // ranges and selection has overlap
        if (Math.max(range.startIndex, startOffset) <= Math.min(range.endIndex, endOffset - 1)) {
            const copy = Tools.deepClone(range);
            customDecorationSlice.push({
                ...copy,
                startIndex: Math.max(copy.startIndex - startOffset, 0),
                endIndex: Math.min(copy.endIndex, endOffset - 1) - startOffset,
            });
        }
    });

    return customDecorationSlice;
}

function composeTextRuns(
    updateDataTextRuns: ITextRun[] | undefined,
    originTextRuns: ITextRun[] | undefined,
    coverType: UpdateDocsAttributeType
): ITextRun[] | undefined {
    if (updateDataTextRuns == null || originTextRuns == null) {
        return updateDataTextRuns ?? originTextRuns;
    }

    return coverTextRuns(updateDataTextRuns, originTextRuns, coverType);
}

function composeCustomRanges(
    updateDataCustomRanges: ICustomRange[] | undefined,
    originCustomRanges: ICustomRange[] | undefined,
    coverType: UpdateDocsAttributeType
): ICustomRange[] | undefined {
    if (updateDataCustomRanges == null || originCustomRanges == null) {
        return updateDataCustomRanges ?? originCustomRanges;
    }

    if (originCustomRanges.length === 0 || updateDataCustomRanges.length === 0) {
        return updateDataCustomRanges;
    }

    if (originCustomRanges.length > 1 || updateDataCustomRanges.length > 1) {
        throw new Error('Cannot cover multiple customRanges');
    }

    if (coverType === UpdateDocsAttributeType.REPLACE) {
        return [{
            ...updateDataCustomRanges[0],
        }];
    } else {
        return [{
            ...originCustomRanges[0],
            ...updateDataCustomRanges[0],
        }];
    }
}

function composeCustomDecorations(
    updateDataCustomDecorations: ICustomDecoration[],
    originCustomDecorations: ICustomDecoration[],
    coverType: UpdateDocsAttributeType
) {
    if (originCustomDecorations.length === 0 || updateDataCustomDecorations.length === 0) {
        return updateDataCustomDecorations;
    }

    if (coverType === UpdateDocsAttributeType.REPLACE) {
        return updateDataCustomDecorations;
    } else {
        return [
            ...updateDataCustomDecorations,
            ...originCustomDecorations.filter((originCustomDecoration) => {
                return !updateDataCustomDecorations.some((updateDataCustomDecoration) => {
                    return originCustomDecoration.id === updateDataCustomDecoration.id;
                });
            }),
        ];
    }
}

export function composeBody(
    thisBody: IDocumentBody,
    otherBody: IDocumentBody,
    coverType: UpdateDocsAttributeType = UpdateDocsAttributeType.COVER
): IDocumentBody {
    if (otherBody.dataStream !== '') {
        throw new Error('Cannot compose other body with non-empty dataStream');
    }

    const retBody: IDocumentBody = {
        dataStream: thisBody.dataStream,
    };

    const {
        textRuns: thisTextRuns,
        paragraphs: thisParagraphs = [],
        customRanges: thisCustomRanges,
        customDecorations: thisCustomDecorations = [],
    } = thisBody;
    const {
        textRuns: otherTextRuns,
        paragraphs: otherParagraphs = [],
        customRanges: otherCustomRanges,
        customDecorations: otherCustomDecorations = [],
    } = otherBody;

    retBody.textRuns = composeTextRuns(otherTextRuns, thisTextRuns, coverType);

    retBody.customRanges = composeCustomRanges(otherCustomRanges, thisCustomRanges, coverType);

    const customDecorations = composeCustomDecorations(otherCustomDecorations, thisCustomDecorations, coverType);
    if (customDecorations.length) {
        retBody.customDecorations = customDecorations;
    }

    const paragraphs: IParagraph[] = [];

    let thisIndex = 0;
    let otherIndex = 0;

    while (thisIndex < thisParagraphs.length && otherIndex < otherParagraphs.length) {
        const thisParagraph = thisParagraphs[thisIndex];
        const otherParagraph = otherParagraphs[otherIndex];

        const { startIndex: thisStart } = thisParagraph;
        const { startIndex: otherStart } = otherParagraph;

        if (thisStart === otherStart) {
            paragraphs.push(Tools.deepMerge(thisParagraph, otherParagraph));
            thisIndex++;
            otherIndex++;
        } else if (thisStart < otherStart) {
            paragraphs.push(Tools.deepClone(thisParagraph));
            thisIndex++;
        } else {
            paragraphs.push(Tools.deepClone(otherParagraph));
            otherIndex++;
        }
    }

    if (thisIndex < thisParagraphs.length) {
        paragraphs.push(...thisParagraphs.slice(thisIndex));
    }

    if (otherIndex < otherParagraphs.length) {
        paragraphs.push(...otherParagraphs.slice(otherIndex));
    }

    if (paragraphs.length) {
        retBody.paragraphs = paragraphs;
    }

    return retBody;
}

export function isUselessRetainAction(action: IRetainAction): boolean {
    const { body } = action;

    if (body == null) {
        return true;
    }

    const { textRuns, paragraphs, customRanges, customBlocks, customDecorations, tables } = body;

    if (textRuns == null && paragraphs == null && customRanges == null && customBlocks == null && customDecorations == null && tables == null) {
        return true;
    }

    return false;
}
