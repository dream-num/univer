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

import type { IDocumentBody, ITextRange, Nullable } from '@univerjs/core';
import { DataStreamTreeTokenType } from '@univerjs/core';
import { isCustomRangeSplitSymbol } from './custom-range';

export function normalizeSelection(selection: ITextRange) {
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
    while (isCustomRangeSplitSymbol(body.dataStream[startOffset - 1])) {
        startOffset -= 1;
    }

    while (isCustomRangeSplitSymbol(body.dataStream[endOffset])) {
        endOffset += 1;
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

export function getDeleteSelection(selection: ITextRange, body: IDocumentBody) {
    let { startOffset, endOffset, collapsed } = normalizeSelection(selection);

    if (collapsed) {
        while (isCustomRangeSplitSymbol(body.dataStream[startOffset - 1])) {
            endOffset -= 1;
            startOffset -= 1;
        }

        return {
            startOffset,
            endOffset,
            collapsed,
        };
    } else {
        return {
            ...getSelectionWithSymbolMax(selection, body),
            collapsed: false,
        };
    }
}

export function getInsertSelection(selection: ITextRange, body: IDocumentBody): ITextRange {
    let { startOffset, endOffset, collapsed } = normalizeSelection(selection);

    if (collapsed) {
        while (isCustomRangeSplitSymbol(body.dataStream[endOffset])) {
            endOffset += 1;
            startOffset += 1;
        }

        return {
            startOffset,
            endOffset,
            collapsed,
        };
    } else {
        return {
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
