/**
 * Copyright 2023-present DreamNum Inc.
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

import { UpdateDocsAttributeType } from '../../../shared/command-enum';
import { Tools } from '../../../shared/tools';
import type { ICustomBlock, ICustomDecoration, IDocumentBody, IParagraph, ITextRun } from '../../../types/interfaces/i-document-data';
import { DataStreamTreeTokenType } from '../types';
import type { IRetainAction } from './action-types';
import { coverTextRuns } from './apply-utils/update-apply';

// TODO: Support other properties like custom ranges, tables, etc.
// eslint-disable-next-line max-lines-per-function
export function getBodySlice(
    body: IDocumentBody,
    startOffset: number,
    endOffset: number,
    returnEmptyTextRun = false
): IDocumentBody {
    const { dataStream, textRuns = [], paragraphs = [], customBlocks = [] } = body;

    const docBody: IDocumentBody = {
        dataStream: dataStream.slice(startOffset, endOffset),
    };

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

    if (newTextRuns.length) {
        docBody.textRuns = newTextRuns.map((tr) => {
            const { st, ed } = tr;
            return {
                ...tr,
                st: st - startOffset,
                ed: ed - startOffset,
            };
        });
    } else if (returnEmptyTextRun) {
        // In the case of no style before, add the style, removeTextRuns will be empty,
        // in this case, you need to add an empty textRun for undo.
        docBody.textRuns = [{
            st: 0,
            ed: endOffset - startOffset,
            ts: {},
        }];
    }

    const newParagraphs: IParagraph[] = [];

    for (const paragraph of paragraphs) {
        const { startIndex } = paragraph;
        if (startIndex >= startOffset && startIndex <= endOffset) {
            newParagraphs.push(Tools.deepClone(paragraph));
        }
    }

    if (newParagraphs.length) {
        docBody.paragraphs = newParagraphs.map((p) => ({
            ...p,
            startIndex: p.startIndex - startOffset,
        }));
    }

    docBody.customDecorations = getCustomDecorationSlice(body, startOffset, endOffset);
    const { customRanges } = getCustomRangeSlice(body, startOffset, endOffset);
    docBody.customRanges = customRanges;

    const newCustomBlocks: ICustomBlock[] = [];

    for (const block of customBlocks) {
        const { startIndex } = block;
        if (startIndex >= startOffset && startIndex <= endOffset) {
            newCustomBlocks.push(Tools.deepClone(block));
        }
    }

    if (newCustomBlocks.length) {
        docBody.customBlocks = newCustomBlocks.map((b) => ({
            ...b,
            startIndex: b.startIndex - startOffset,
        }));
    }

    return docBody;
}

export function normalizeBody(body: IDocumentBody): IDocumentBody {
    const { dataStream, textRuns, paragraphs, customRanges, customDecorations } = body;
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

    const newData = `${DataStreamTreeTokenType.CUSTOM_RANGE_START.repeat(leftOffset)}${dataStream}${DataStreamTreeTokenType.CUSTOM_RANGE_END.repeat(rightOffset)}`;

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

    return {
        ...body,
        dataStream: newData,
        textRuns,
        paragraphs,
        customRanges,
        customDecorations,
    };
}

export function getCustomRangeSlice(body: IDocumentBody, startOffset: number, endOffset: number) {
    const { customRanges = [] } = body;
    let leftOffset = 0;
    let rightOffset = 0;
    const relativeCustomRanges = customRanges
        .filter((customRange) => Math.max(customRange.startIndex, startOffset) <= Math.min(customRange.endIndex, endOffset - 1))
        .map((range) => ({
            ...range,
            startIndex: range.startIndex,
            endIndex: range.endIndex,
        }));

    if (relativeCustomRanges.length) {
        relativeCustomRanges.forEach((customRange) => {
            if (customRange.startIndex < startOffset) {
                leftOffset += 1;
            }
            if (customRange.endIndex > (endOffset - 1)) {
                rightOffset += 1;
            }
        });

        for (let i = 0; i < leftOffset; i++) {
            const range = relativeCustomRanges[i];
            range.startIndex = startOffset - leftOffset + i;
        }
        if (rightOffset) {
            const sorted = [...relativeCustomRanges].sort((pre, aft) => aft.endIndex - pre.endIndex);
            for (let i = 0; i < rightOffset; i++) {
                const range = sorted[i];
                range.endIndex = endOffset + rightOffset - i - 1;
            }
        }
    }

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
                endIndex: Math.min(copy.endIndex, endOffset) - startOffset,
            });
        }
    });

    return customDecorationSlice;
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

    const { textRuns: thisTextRuns = [], paragraphs: thisParagraphs = [] } = thisBody;
    const { textRuns: otherTextRuns = [], paragraphs: otherParagraphs = [] } = otherBody;

    const textRuns = coverTextRuns(otherTextRuns, thisTextRuns, coverType);
    if (textRuns.length) {
        retBody.textRuns = textRuns;
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

    const { textRuns = [], paragraphs = [] } = body;

    if (textRuns.length === 0 && paragraphs.length === 0) {
        return true;
    }

    return false;
}
