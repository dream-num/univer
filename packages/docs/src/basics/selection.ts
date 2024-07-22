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
import { DeleteDirection } from '../types/enums/delete-direction';
import { isCustomRangeSplitSymbol } from './custom-range';

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

    while (body.dataStream[endOffset] === DataStreamTreeTokenType.CUSTOM_RANGE_END) {
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

export function getInsertSelection(selection: ITextRange, body: IDocumentBody): ITextRange {
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
const tags = [
    DataStreamTreeTokenType.PARAGRAPH, // 段落
    DataStreamTreeTokenType.SECTION_BREAK, // 章节
    DataStreamTreeTokenType.TABLE_START, // 表格开始
    DataStreamTreeTokenType.TABLE_ROW_START, // 表格开始
    DataStreamTreeTokenType.TABLE_CELL_START, // 表格开始
    DataStreamTreeTokenType.TABLE_CELL_END, // 表格开始
    DataStreamTreeTokenType.TABLE_ROW_END, // 表格开始
    DataStreamTreeTokenType.TABLE_END, // 表格结束
    DataStreamTreeTokenType.CUSTOM_RANGE_START, // 自定义范围开始
    DataStreamTreeTokenType.CUSTOM_RANGE_END, // 自定义范围结束
    DataStreamTreeTokenType.COLUMN_BREAK, // 换列
    DataStreamTreeTokenType.PAGE_BREAK, // 换页
    DataStreamTreeTokenType.DOCS_END, // 文档结尾
    DataStreamTreeTokenType.TAB, // 制表符
    DataStreamTreeTokenType.CUSTOM_BLOCK, // 图片 mention 等不参与文档流的场景

];
export function getSelectionText(dataStream: string, start: number, end: number) {
    const text = dataStream.slice(start, end);
    return tags.reduce((res, curr) => res.replaceAll(curr, ''), text);
}

export function isSegmentIntersects(start: number, end: number, start2: number, end2: number) {
    return Math.max(start, start2) <= Math.min(end, end2);
}

