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

import type { Nullable } from '../../../../shared';
import type { ITextRange } from '../../../../sheets/typedef';
import type { IDocumentBody } from '../../../../types/interfaces';
import type { IDeleteAction, IRetainAction } from '../action-types';
import { DeleteDirection } from '../../../../types/enum';
import { DataStreamTreeTokenType } from '../../types';
import { TextXActionType } from '../action-types';
import { isCustomRangeSplitSymbol, isIntersecting, shouldDeleteCustomRange } from './custom-range';

export function makeSelection(startOffset: number, endOffset?: number): ITextRange {
    if (typeof endOffset === 'undefined') {
        return { startOffset, endOffset: startOffset, collapsed: true };
    }

    if (endOffset < startOffset) {
        throw new Error(`Cannot make a doc selection when endOffset ${endOffset} is less than startOffset ${startOffset}.`);
    }

    return { startOffset, endOffset, collapsed: startOffset === endOffset };
}

export function normalizeSelection(selection: ITextRange): ITextRange {
    const { startOffset, endOffset, collapsed } = selection;
    const start = Math.min(startOffset, endOffset);
    const end = Math.max(startOffset, endOffset);

    return {
        startOffset: start,
        endOffset: end,
        collapsed,
    };
}

export function getSelectionWithSymbolMax(selection: ITextRange, body: IDocumentBody) {
    let { startOffset, endOffset } = normalizeSelection(selection);
    while (body.dataStream[startOffset - 1] === DataStreamTreeTokenType.CUSTOM_RANGE_START) {
        startOffset -= 1;
    }

    while (body.dataStream[startOffset] === DataStreamTreeTokenType.CUSTOM_RANGE_END) {
        startOffset += 1;
    }

    while (body.dataStream[endOffset] === DataStreamTreeTokenType.CUSTOM_RANGE_END) {
        endOffset += 1;
    }

    while (body.dataStream[endOffset - 1] === DataStreamTreeTokenType.CUSTOM_RANGE_START) {
        endOffset -= 1;
    }

    return {
        startOffset,
        endOffset,
    };
}

export function getSelectionWithNoSymbolSide(selection: ITextRange, body: IDocumentBody) {
    let { startOffset, endOffset } = normalizeSelection(selection);
    while (isCustomRangeSplitSymbol(body.dataStream[startOffset])) {
        startOffset += 1;
    }

    while (isCustomRangeSplitSymbol(body.dataStream[endOffset - 1])) {
        endOffset -= 1;
    }

    return {
        startOffset,
        endOffset,
    };
}

export function getDeleteSelection<T extends ITextRange>(selection: T, body: IDocumentBody, direction = DeleteDirection.LEFT): T {
    let { startOffset, endOffset, collapsed } = normalizeSelection(selection);

    if (collapsed) {
        if (direction === DeleteDirection.LEFT) {
            while (isCustomRangeSplitSymbol(body.dataStream[startOffset - 1])) {
                endOffset -= 1;
                startOffset -= 1;
            }
        } else {
            while (isCustomRangeSplitSymbol(body.dataStream[startOffset])) {
                endOffset += 1;
                startOffset += 1;
            }
        }
    } else {
        const selectionWithSymbolMax = getSelectionWithSymbolMax(selection, body);
        startOffset = selectionWithSymbolMax.startOffset;
        endOffset = selectionWithSymbolMax.endOffset;
    }

    collapsed = (startOffset === endOffset);

    const customRanges = body.customRanges?.filter((range) => {
        if (!range.wholeEntity) {
            return false;
        }
        if (startOffset <= range.startIndex && endOffset > range.endIndex) {
            return false;
        }
        return isSegmentIntersects(startOffset, collapsed ? endOffset : endOffset - 1, range.startIndex, range.endIndex);
    });

    if (customRanges?.length) {
        customRanges.forEach((range) => {
            startOffset = Math.min(range.startIndex, startOffset);
            endOffset = Math.max(range.endIndex + 1, endOffset);
        });
    }

    return {
        ...selection,
        startOffset,
        endOffset,
        collapsed: startOffset === endOffset,
    };
}

export function getInsertSelection<T extends ITextRange>(selection: T, body: IDocumentBody): T {
    let { startOffset, endOffset, collapsed } = normalizeSelection(selection);

    if (collapsed) {
        while (body.dataStream[endOffset] === DataStreamTreeTokenType.CUSTOM_RANGE_END) {
            endOffset += 1;
            startOffset += 1;
        }

        while (body.dataStream[endOffset - 1] === DataStreamTreeTokenType.CUSTOM_RANGE_START) {
            endOffset -= 1;
            startOffset -= 1;
        }

        return {
            ...selection,
            startOffset,
            endOffset,
            collapsed,
        };
    } else {
        return {
            ...selection,
            ...getSelectionWithSymbolMax(selection, body),
            collapsed: false,
        };
    }
}

/**
 * Ensure custom-range has a correct order,
 * when range contains range, it won't be present as intersect. <br/>
 * For Example `\s1\s2 text \s1\s2` is not allowed, expect `\s1\s2 text \s2\s1`
 */
export function getSelectionForAddCustomRange(selection: ITextRange, body: IDocumentBody): Nullable<ITextRange> {
    if (selection.startOffset === selection.endOffset) {
        return null;
    }

    const customRanges = body.customRanges;
    if (!customRanges) {
        return normalizeSelection(selection);
    }

    let { startOffset, endOffset } = getSelectionWithSymbolMax(selection, body);
    while (isCustomRangeSplitSymbol(body.dataStream[startOffset])) {
        if (body.dataStream[startOffset] === DataStreamTreeTokenType.CUSTOM_RANGE_START) {
            const customRange = customRanges.find((range) => range.startIndex === startOffset);
            if (!customRange) {
                throw new Error('No custom-range matched');
            }
            if (customRange.endIndex === endOffset - 1) {
                return {
                    startOffset,
                    endOffset,
                    collapsed: false,
                };
            } else if (customRange.endIndex < endOffset - 1) {
                break;
            }
        }

        startOffset += 1;
    }

    while (isCustomRangeSplitSymbol(body.dataStream[endOffset - 1])) {
        if (body.dataStream[startOffset] === DataStreamTreeTokenType.CUSTOM_RANGE_END) {
            const customRange = customRanges.find((range) => range.endIndex === endOffset - 1);
            if (!customRange) {
                throw new Error('No custom-range matched');
            }

            // but actually not possible
            if (customRange.startIndex === startOffset) {
                return {
                    startOffset,
                    endOffset,
                    collapsed: false,
                };
            } else if (customRange.startIndex > startOffset) {
                break;
            }
        }
        endOffset -= 1;
    }

    if (endOffset <= startOffset) {
        return null;
    }

    return {
        startOffset,
        endOffset,
        collapsed: false,
    };
}

export function isSegmentIntersects(start: number, end: number, start2: number, end2: number) {
    return Math.max(start, start2) <= Math.min(end, end2);
}

export function getRetainAndDeleteFromReplace(
    range: ITextRange,
    segmentId: string = '',
    memoryCursor: number,
    body: IDocumentBody
) {
    const { startOffset, endOffset } = range;
    const dos: Array<IRetainAction | IDeleteAction> = [];
    const textStart = startOffset - memoryCursor;
    const textEnd = endOffset - memoryCursor;
    const dataStream = body.dataStream;
    const relativeCustomRanges = body.customRanges?.filter((customRange) => isIntersecting(customRange.startIndex, customRange.endIndex, startOffset, endOffset - 1));
    const toDeleteRanges = new Set(relativeCustomRanges?.filter((customRange) => shouldDeleteCustomRange(startOffset, endOffset - startOffset, customRange, dataStream)));
    const retainPoints = new Set<number>();
    relativeCustomRanges?.forEach((range) => {
        if (toDeleteRanges.has(range)) {
            return;
        }

        // only retain when the custom-range was intersecting with but not fully contained in the text-range.
        if (range.startIndex - memoryCursor >= textStart &&
            range.startIndex - memoryCursor < textEnd &&
            range.endIndex - memoryCursor >= textEnd) {
            retainPoints.add(range.startIndex);
        }
        if (range.endIndex - memoryCursor >= textStart &&
            range.endIndex - memoryCursor < textEnd &&
            range.startIndex - memoryCursor < textStart) {
            retainPoints.add(range.endIndex);
        }
    });

    if (textStart > 0) {
        dos.push({
            t: TextXActionType.RETAIN,
            len: textStart,
            segmentId,
        });
    }

    const sortedRetains = [...retainPoints].sort((pre, aft) => pre - aft);
    let cursor = textStart;
    sortedRetains.forEach((pos) => {
        const len = pos - cursor;
        if (len > 0) {
            dos.push({
                t: TextXActionType.DELETE,
                len,
                line: 0,
                segmentId,
            });
        }
        dos.push({
            t: TextXActionType.RETAIN,
            len: 1,
            segmentId,
        });
        cursor = pos + 1;
    });

    if (cursor < textEnd) {
        dos.push({
            t: TextXActionType.DELETE,
            len: textEnd - cursor,
            line: 0,
            segmentId,
        });
        cursor = textEnd + 1;
    }

    return {
        dos,
        cursor,
        retain: retainPoints.size,
    };
}

