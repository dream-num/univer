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

import type {
    ICustomBlock,
    ICustomColumnGroup,
    ICustomRange,
    ICustomTable,
    IDocumentBlockRange,
} from '../../../../types/interfaces/i-document-data';
import { DataStreamTreeTokenType } from '../../types';

/**
 * A canonical half-open interval used by document editing algorithms.
 * `startOffset` is included and `endOffset` is excluded.
 */
export interface IDocOperationalInterval {
    startOffset: number;
    endOffset: number;
}

type IInclusiveDocumentRange = Pick<IDocumentBlockRange, 'startIndex' | 'endIndex'>;
type IExclusiveDocumentRange = Pick<ICustomTable, 'startIndex' | 'endIndex'>;

/** Converts persisted inclusive indexes `[startIndex, endIndex]` to `[startOffset, endOffset)`. */
export function getInclusiveRangeInterval(range: IInclusiveDocumentRange): IDocOperationalInterval {
    return {
        startOffset: range.startIndex,
        endOffset: range.endIndex + 1,
    };
}

/** Converts persisted half-open indexes `[startIndex, endIndex)` to the operational representation. */
export function getExclusiveRangeInterval(range: IExclusiveDocumentRange): IDocOperationalInterval {
    return {
        startOffset: range.startIndex,
        endOffset: range.endIndex,
    };
}

/** A table stores an exclusive end immediately after `TABLE_END`. */
export function getTableRangeInterval(table: Pick<ICustomTable, 'startIndex' | 'endIndex'>): IDocOperationalInterval {
    return getExclusiveRangeInterval(table);
}

/** A document block stores an inclusive end that points at `BLOCK_END`. */
export function getBlockRangeInterval(blockRange: Pick<IDocumentBlockRange, 'startIndex' | 'endIndex'>): IDocOperationalInterval {
    return getInclusiveRangeInterval(blockRange);
}

/** A column group stores an inclusive end that points at `COLUMN_GROUP_END`. */
export function getColumnGroupRangeInterval(columnGroup: Pick<ICustomColumnGroup, 'startIndex' | 'endIndex'>): IDocOperationalInterval {
    return getInclusiveRangeInterval(columnGroup);
}

/** A custom range stores inclusive character indexes. */
export function getCustomRangeInterval(customRange: Pick<ICustomRange, 'startIndex' | 'endIndex'>): IDocOperationalInterval {
    return getInclusiveRangeInterval(customRange);
}

/** A custom block occupies exactly one `CUSTOM_BLOCK` sentinel. */
export function getCustomBlockInterval(customBlock: Pick<ICustomBlock, 'startIndex'>): IDocOperationalInterval {
    return {
        startOffset: customBlock.startIndex,
        endOffset: customBlock.startIndex + 1,
    };
}

/** Returns the half-open token interval for a row that starts at `startOffset`. */
export function getTableRowTokenInterval(dataStream: string, startOffset: number): IDocOperationalInterval | null {
    return getPairedTokenInterval(
        dataStream,
        startOffset,
        DataStreamTreeTokenType.TABLE_ROW_START,
        DataStreamTreeTokenType.TABLE_ROW_END
    );
}

/** Returns the half-open token interval for a cell that starts at `startOffset`. */
export function getTableCellTokenInterval(dataStream: string, startOffset: number): IDocOperationalInterval | null {
    return getPairedTokenInterval(
        dataStream,
        startOffset,
        DataStreamTreeTokenType.TABLE_CELL_START,
        DataStreamTreeTokenType.TABLE_CELL_END
    );
}

/** Tests whether a stream index belongs to a half-open operational interval. */
export function containsStreamIndex(interval: IDocOperationalInterval, index: number): boolean {
    return interval.startOffset <= index && index < interval.endOffset;
}

/**
 * Tests whether an insertion point is strictly inside a container.
 * Boundary insertion affinity must be decided by the caller.
 */
export function containsInteriorInsertionOffset(interval: IDocOperationalInterval, offset: number): boolean {
    return interval.startOffset < offset && offset < interval.endOffset;
}

/** Tests whether two half-open operational intervals overlap. */
export function intersectsOperationalIntervals(left: IDocOperationalInterval, right: IDocOperationalInterval): boolean {
    return Math.max(left.startOffset, right.startOffset) < Math.min(left.endOffset, right.endOffset);
}

/** Shifts or expands an inclusive persisted range for an insertion at `offset`. */
export function shiftInclusiveRangeOnInsert<T extends { startIndex: number; endIndex: number }>(
    range: T,
    offset: number,
    length: number
): T {
    if (range.startIndex >= offset) {
        return { ...range, startIndex: range.startIndex + length, endIndex: range.endIndex + length };
    }

    if (range.endIndex >= offset) {
        return { ...range, endIndex: range.endIndex + length };
    }

    return range;
}

/** Shifts or expands a half-open persisted range for an insertion at `offset`. */
export function shiftExclusiveRangeOnInsert<T extends { startIndex: number; endIndex: number }>(
    range: T,
    offset: number,
    length: number
): T {
    if (range.startIndex >= offset) {
        return { ...range, startIndex: range.startIndex + length, endIndex: range.endIndex + length };
    }

    if (range.endIndex > offset) {
        return { ...range, endIndex: range.endIndex + length };
    }

    return range;
}

/** Transforms an inclusive persisted range after deleting `[offset, offset + length)`. */
export function shiftInclusiveRangeOnDelete<T extends { startIndex: number; endIndex: number }>(
    range: T,
    offset: number,
    length: number
): T | null {
    if (length <= 0 || range.endIndex < offset) {
        return range;
    }

    const deleteEnd = offset + length;
    if (range.startIndex >= deleteEnd) {
        return { ...range, startIndex: range.startIndex - length, endIndex: range.endIndex - length };
    }

    const keepsLeft = range.startIndex < offset;
    const keepsRight = range.endIndex >= deleteEnd;
    if (!keepsLeft && !keepsRight) {
        return null;
    }

    const startIndex = keepsLeft ? range.startIndex : offset;
    const endIndex = keepsRight ? range.endIndex - length : offset - 1;
    return endIndex >= startIndex ? { ...range, startIndex, endIndex } : null;
}

/** Transforms a half-open persisted range after deleting `[offset, offset + length)`. */
export function shiftExclusiveRangeOnDelete<T extends { startIndex: number; endIndex: number }>(
    range: T,
    offset: number,
    length: number
): T | null {
    if (length <= 0 || range.endIndex <= offset) {
        return range;
    }

    const deleteEnd = offset + length;
    if (range.startIndex >= deleteEnd) {
        return { ...range, startIndex: range.startIndex - length, endIndex: range.endIndex - length };
    }

    const keepsLeft = range.startIndex < offset;
    const keepsRight = range.endIndex > deleteEnd;
    if (!keepsLeft && !keepsRight) {
        return null;
    }

    const startIndex = keepsLeft ? range.startIndex : offset;
    const endIndex = keepsRight ? range.endIndex - length : offset;
    return endIndex > startIndex ? { ...range, startIndex, endIndex } : null;
}

function getPairedTokenInterval(
    dataStream: string,
    startOffset: number,
    startToken: string,
    endToken: string
): IDocOperationalInterval | null {
    if (!Number.isInteger(startOffset) || startOffset < 0 || dataStream[startOffset] !== startToken) {
        return null;
    }

    let depth = 0;
    for (let offset = startOffset; offset < dataStream.length; offset++) {
        const token = dataStream[offset];
        if (token === startToken) {
            depth++;
        } else if (token === endToken) {
            depth--;
            if (depth === 0) {
                return { startOffset, endOffset: offset + 1 };
            }
        }
    }

    return null;
}
