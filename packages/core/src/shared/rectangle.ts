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

import type { BBox } from 'rbush';
import type { IRange, IRectLTRB } from '../sheets/typedef';
import type { Nullable } from './types';
import RBush from 'rbush';
import { AbsoluteRefType, RANGE_TYPE } from '../sheets/typedef';
import { mergeRanges, multiSubtractSingleRange, splitIntoGrid } from './range';

/**
 * This class provides a set of methods to calculate and manipulate rectangular ranges (IRange).
 * A range represents a rectangular area in a grid, defined by start/end rows and columns.
 * @example
 * ```typescript
 * // Example range representing cells from A1 to C3
 * const range: IRange = {
 *   startRow: 0,
 *   startColumn: 0,
 *   endRow: 2,
 *   endColumn: 2,
 *   rangeType: RANGE_TYPE.NORMAL
 * };
 * ```
 */
export class Rectangle {
    /**
     * Creates a deep copy of an IRange object
     * @param src
     * @example
     * ```typescript
     * const original = { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 };
     * const copy = Rectangle.clone(original);
     * // copy = { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 }
     * ```
     */
    static clone(src: IRange): IRange {
        if (src.rangeType !== undefined) {
            return {
                startRow: src.startRow,
                startColumn: src.startColumn,
                endRow: src.endRow,
                endColumn: src.endColumn,
                rangeType: src.rangeType,
            };
        }

        return {
            startRow: src.startRow,
            startColumn: src.startColumn,
            endRow: src.endRow,
            endColumn: src.endColumn,
        };
    }

    /**
     * Checks if two ranges are equal by comparing their properties
     * @param src
     * @param target
     * @example
     * ```typescript
     * const range1 = { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 };
     * const range2 = { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 };
     * const areEqual = Rectangle.equals(range1, range2); // true
     * ```
     */
    static equals(src: IRange, target: IRange): boolean {
        if (src == null || target == null) {
            return false;
        }
        return (
            src.endRow === target.endRow &&
            src.endColumn === target.endColumn &&
            src.startRow === target.startRow &&
            src.startColumn === target.startColumn &&
            (src.rangeType === target.rangeType ||
                (src.rangeType === undefined && target.rangeType === RANGE_TYPE.NORMAL) ||
                (target.rangeType === undefined && src.rangeType === RANGE_TYPE.NORMAL))
        );
    }

    /**
     * Quickly checks if two normal ranges intersect. For specialized range types,
     * use the intersects() method instead.
     * @param rangeA
     * @param rangeB
     * @example
     * ```typescript
     * const range1 = { startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 };
     * const range2 = { startRow: 1, startColumn: 1, endRow: 3, endColumn: 3 };
     * const doIntersect = Rectangle.simpleRangesIntersect(range1, range2); // true
     * ```
     */
    static simpleRangesIntersect(rangeA: IRange, rangeB: IRange): boolean {
        const { startRow: startRowA, endRow: endRowA, startColumn: startColumnA, endColumn: endColumnA } = rangeA;
        const { startRow: startRowB, endRow: endRowB, startColumn: startColumnB, endColumn: endColumnB } = rangeB;

        const rowsOverlap = (startRowA <= endRowB) && (endRowA >= startRowB);
        const columnsOverlap = (startColumnA <= endColumnB) && (endColumnA >= startColumnB);

        return rowsOverlap && columnsOverlap;
    }

    /**
     * Checks if two ranges intersect, handling special range types (ROW, COLUMN)
     * @param src
     * @param target
     * @example
     * ```typescript
     * const rowRange = {
     *   startRow: 0, endRow: 2,
     *   startColumn: NaN, endColumn: NaN,
     *   rangeType: RANGE_TYPE.ROW
     * };
     * const colRange = {
     *   startRow: NaN, endRow: NaN,
     *   startColumn: 0, endColumn: 2,
     *   rangeType: RANGE_TYPE.COLUMN
     * };
     * const doIntersect = Rectangle.intersects(rowRange, colRange); // true
     * ```
     */
    static intersects(src: IRange, target: IRange): boolean {
        if (src.rangeType === RANGE_TYPE.ROW && target.rangeType === RANGE_TYPE.COLUMN) {
            return true;
        }

        if (src.rangeType === RANGE_TYPE.COLUMN && target.rangeType === RANGE_TYPE.ROW) {
            return true;
        }

        if (src.rangeType === RANGE_TYPE.ROW && target.rangeType === RANGE_TYPE.ROW) {
            return src.startRow <= target.endRow && src.endRow >= target.startRow;
        }

        if (src.rangeType === RANGE_TYPE.COLUMN && target.rangeType === RANGE_TYPE.COLUMN) {
            return src.startColumn <= target.endColumn && src.endColumn >= target.startColumn;
        }

        const MAX = Math.floor(Number.MAX_SAFE_INTEGER / 10);
        const currentStartRow = Number.isNaN(src.startRow) ? 0 : src.startRow;
        const currentEndRow = Number.isNaN(src.endRow) ? MAX : src.endRow;
        const currentStartColumn = Number.isNaN(src.startColumn) ? 0 : src.startColumn;
        const currentEndColumn = Number.isNaN(src.endColumn) ? MAX : src.endColumn;

        const incomingStartRow = Number.isNaN(target.startRow) ? 0 : target.startRow;
        const incomingEndRow = Number.isNaN(target.endRow) ? MAX : target.endRow;
        const incomingStartColumn = Number.isNaN(target.startColumn) ? 0 : target.startColumn;
        const incomingEndColumn = Number.isNaN(target.endColumn) ? MAX : target.endColumn;

        const zx = Math.abs(currentStartColumn + currentEndColumn - incomingStartColumn - incomingEndColumn);
        const x = Math.abs(currentStartColumn - currentEndColumn) + Math.abs(incomingStartColumn - incomingEndColumn);
        const zy = Math.abs(currentStartRow + currentEndRow - incomingStartRow - incomingEndRow);
        const y = Math.abs(currentStartRow - currentEndRow) + Math.abs(incomingStartRow - incomingEndRow);

        return zx <= x && zy <= y;
    }

    /**
     * Checks if any of the ranges in the target array intersect with any of the ranges in the source array.
     * Attention! Please make sure there is no NaN in the ranges.
     * @param src
     * @param target
     * @example
     * ```typescript
     * const ranges1 = [
     *   { startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 },
     *   { startRow: 3, startColumn: 3, endRow: 5, endColumn: 5 }
     * ];
     * const ranges2 = [
     *   { startRow: 1, startColumn: 1, endRow: 4, endColumn: 4 },
     *   { startRow: 6, startColumn: 6, endRow: 8, endColumn: 8 }
     * ];
     * const doIntersect = Rectangle.doAnyRangesIntersect(ranges1, ranges2); // true
     * ```
     */
    static doAnyRangesIntersect(src: IRange[], target: IRange[]): boolean {
        const rbush = new RBush<BBox>();
        rbush.load(src.map((r) => ({ minX: r.startColumn, minY: r.startRow, maxX: r.endColumn, maxY: r.endRow })));
        return target.some((r) => rbush.search({ minX: r.startColumn, minY: r.startRow, maxX: r.endColumn, maxY: r.endRow }).length > 0);
    }

    /**
     * Gets the intersection range between two ranges
     * @param src
     * @param target
     * @deprecated use `getIntersectRange` instead
     * @example
     * ```typescript
     * const range1 = { startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 };
     * const range2 = { startRow: 1, startColumn: 1, endRow: 3, endColumn: 3 };
     * const intersection = Rectangle.getIntersects(range1, range2);
     * // intersection = { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 }
     * ```
     */
    static getIntersects(src: IRange, target: IRange): Nullable<IRange> {
        const currentStartRow = src.startRow;
        const currentEndRow = src.endRow;
        const currentStartColumn = src.startColumn;
        const currentEndColumn = src.endColumn;

        const incomingStartRow = target.startRow;
        const incomingEndRow = target.endRow;
        const incomingStartColumn = target.startColumn;
        const incomingEndColumn = target.endColumn;

        let startColumn;
        let startRow;
        let endColumn;
        let endRow;
        if (incomingStartRow <= currentEndRow) {
            if (incomingStartRow >= currentStartRow) {
                startRow = incomingStartRow;
            } else {
                startRow = currentStartRow;
            }
        } else {
            return null;
        }

        if (incomingEndRow >= currentStartRow) {
            if (incomingEndRow >= currentEndRow) {
                endRow = currentEndRow;
            } else {
                endRow = incomingEndRow;
            }
        } else {
            return null;
        }

        if (incomingStartColumn <= currentEndColumn) {
            if (incomingStartColumn > currentStartColumn) {
                startColumn = incomingStartColumn;
            } else {
                startColumn = currentStartColumn;
            }
        } else {
            return null;
        }

        if (incomingEndColumn >= currentStartColumn) {
            if (incomingEndColumn >= currentEndColumn) {
                endColumn = currentEndColumn;
            } else {
                endColumn = incomingEndColumn;
            }
        } else {
            return null;
        }

        return {
            startRow,
            endRow,
            startColumn,
            endColumn,
            rangeType: RANGE_TYPE.NORMAL, // TODO: this may not be accurate
        };
    }

    /**
     * Checks if one range completely contains another range
     * @param src
     * @param target
     * @example
     * ```typescript
     * const outer = { startRow: 0, startColumn: 0, endRow: 3, endColumn: 3 };
     * const inner = { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 };
     * const contains = Rectangle.contains(outer, inner); // true
     * ```
     */
    static contains(src: IRange, target: IRange): boolean {
        return (
            src.startRow <= target.startRow &&
            src.endRow >= target.endRow &&
            src.startColumn <= target.startColumn &&
            src.endColumn >= target.endColumn
        );
    }

    /**
     * Checks if one range strictly contains another range (not equal)
     * @param src
     * @param target
     * @example
     * ```typescript
     * const outer = { startRow: 0, startColumn: 0, endRow: 3, endColumn: 3 };
     * const same = { startRow: 0, startColumn: 0, endRow: 3, endColumn: 3 };
     * const realContains = Rectangle.realContain(outer, same); // false
     * ```
     */
    static realContain(src: IRange, target: IRange): boolean {
        return (
            Rectangle.contains(src, target) &&
            (src.startRow < target.startRow ||
                src.endRow > target.endRow ||
                src.startColumn < target.startColumn ||
                src.endColumn > target.endColumn)
        );
    }

    /**
     * Creates a union range that encompasses all input ranges
     * @param {...any} ranges
     * @example
     * ```typescript
     * const range1 = { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 };
     * const range2 = { startRow: 2, startColumn: 2, endRow: 3, endColumn: 3 };
     * const union = Rectangle.union(range1, range2);
     * // union = { startRow: 0, startColumn: 0, endRow: 3, endColumn: 3 }
     * ```
     */
    static union(...ranges: IRange[]): IRange {
        // TODO: range type may not be accurate
        return ranges.reduce(
            (acc, current) => ({
                startRow: Math.min(acc.startRow, current.startRow),
                startColumn: Math.min(acc.startColumn, current.startColumn),
                endRow: Math.max(acc.endRow, current.endRow),
                endColumn: Math.max(acc.endColumn, current.endColumn),
                rangeType: RANGE_TYPE.NORMAL,
            }),
            ranges[0]
        );
    }

    /**
     * Creates a union range considering special range types (ROW, COLUMN)
     * @param {...any} ranges
     * @example
     * ```typescript
     * const rowRange = {
     *   startRow: 0, endRow: 2,
     *   rangeType: RANGE_TYPE.ROW
     * };
     * const normalRange = {
     *   startRow: 1, startColumn: 1,
     *   endRow: 3, endColumn: 3
     * };
     * const union = Rectangle.realUnion(rowRange, normalRange);
     * // Result will have NaN for columns due to ROW type
     * ```
     */
    static realUnion(...ranges: IRange[]): IRange {
        const hasColRange = ranges.some((range) => range.rangeType === RANGE_TYPE.COLUMN);
        const hasRowRange = ranges.some((range) => range.rangeType === RANGE_TYPE.ROW);
        const res = Rectangle.union(...ranges);
        return {
            startColumn: hasRowRange ? Number.NaN : res.startColumn,
            endColumn: hasRowRange ? Number.NaN : res.endColumn,
            startRow: hasColRange ? Number.NaN : res.startRow,
            endRow: hasColRange ? Number.NaN : res.endRow,
            rangeType: hasRowRange ? RANGE_TYPE.ROW : hasColRange ? RANGE_TYPE.COLUMN : RANGE_TYPE.NORMAL,
        };
    }

    /**
     * Converts an absolute range to a relative range based on an origin range
     * @param range
     * @param originRange
     * @example
     * ```typescript
     * const range = { startRow: 5, startColumn: 5, endRow: 7, endColumn: 7 };
     * const origin = { startRow: 3, startColumn: 3, endRow: 8, endColumn: 8 };
     * const relative = Rectangle.getRelativeRange(range, origin);
     * // relative = { startRow: 2, startColumn: 2, endRow: 2, endColumn: 2 }
     * ```
     */
    static getRelativeRange = (range: IRange, originRange: IRange) =>
        ({
            startRow: range.startRow - originRange.startRow,
            endRow: range.endRow - range.startRow,
            startColumn: range.startColumn - originRange.startColumn,
            endColumn: range.endColumn - range.startColumn,
        }) as IRange;

    /**
     * Converts a relative range back to an absolute range based on origin
     * @param relativeRange
     * @param originRange
     * @param absoluteRange
     * @example
     * ```typescript
     * const relative = { startRow: 2, startColumn: 2, endRow: 2, endColumn: 2 };
     * const origin = { startRow: 3, startColumn: 3, endRow: 8, endColumn: 8 };
     * const absolute = Rectangle.getPositionRange(relative, origin);
     * // absolute = { startRow: 5, startColumn: 5, endRow: 7, endColumn: 7 }
     * ```
     */
    static getPositionRange = (relativeRange: IRange, originRange: IRange, absoluteRange?: IRange) =>
        ({
            ...(absoluteRange || {}),
            startRow: absoluteRange ? ([AbsoluteRefType.ROW, AbsoluteRefType.ALL].includes(absoluteRange.startAbsoluteRefType || 0) ? absoluteRange.startRow : relativeRange.startRow + originRange.startRow) : (relativeRange.startRow + originRange.startRow),
            endRow: absoluteRange ? ([AbsoluteRefType.ROW, AbsoluteRefType.ALL].includes(absoluteRange.endAbsoluteRefType || 0) ? absoluteRange.endRow : relativeRange.endRow + relativeRange.startRow + originRange.startRow) : (relativeRange.endRow + relativeRange.startRow + originRange.startRow),
            startColumn: absoluteRange ? ([AbsoluteRefType.COLUMN, AbsoluteRefType.ALL].includes(absoluteRange.startAbsoluteRefType || 0) ? absoluteRange.startColumn : relativeRange.startColumn + originRange.startColumn) : (relativeRange.startColumn + originRange.startColumn),
            endColumn: absoluteRange ? ([AbsoluteRefType.COLUMN, AbsoluteRefType.ALL].includes(absoluteRange.endAbsoluteRefType || 0) ? absoluteRange.endColumn : relativeRange.endColumn + relativeRange.startColumn + originRange.startColumn) : (relativeRange.endColumn + relativeRange.startColumn + originRange.startColumn),
        }) as IRange;

    /**
     * Moves a range horizontally by a specified step and optionally extends it
     * @param range
     * @param step
     * @param length
     * @example
     * ```typescript
     * const range = { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 };
     * const moved = Rectangle.moveHorizontal(range, 2, 1);
     * // moved = { startRow: 0, startColumn: 2, endRow: 1, endColumn: 4 }
     * ```
     */
    static moveHorizontal = (range: IRange, step: number = 0, length: number = 0): IRange =>
        ({
            ...range,
            startColumn: range.startColumn + step,
            endColumn: range.endColumn + step + length,
        });

    /**
     * Moves a range vertically by a specified step and optionally extends it
     * @param range
     * @param step
     * @param length
     * @example
     * ```typescript
     * const range = { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 };
     * const moved = Rectangle.moveVertical(range, 2, 1);
     * // moved = { startRow: 2, startColumn: 0, endRow: 4, endColumn: 1 }
     * ```
     */
    static moveVertical = (range: IRange, step: number = 0, length: number = 0): IRange =>
        ({
            ...range,
            startRow: range.startRow + step,
            endRow: range.endRow + step + length,
        });

    /**
     * Moves a range by specified offsets in both directions
     * @param range
     * @param offsetX
     * @param offsetY
     * @example
     * ```typescript
     * const range = { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 };
     * const moved = Rectangle.moveOffset(range, 2, 3);
     * // moved = { startRow: 3, startColumn: 2, endRow: 4, endColumn: 3 }
     * ```
     */
    static moveOffset = (range: IRange, offsetX: number, offsetY: number): IRange =>
        ({
            ...range,
            startRow: range.startRow + offsetY,
            endRow: range.endRow + offsetY,
            startColumn: range.startColumn + offsetX,
            endColumn: range.endColumn + offsetX,
        });

    /**
     * Subtracts one range from another, returning the remaining areas as separate ranges
     * @param range1
     * @param range2
     * @example
     * ```typescript
     * const range1 = { startRow: 0, startColumn: 0, endRow: 3, endColumn: 3 };
     * const range2 = { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 };
     * const result = Rectangle.subtract(range1, range2);
     * // Results in up to 4 ranges representing the non-overlapping areas
     * ```
     */
    static subtract(range1: IRange, range2: IRange): IRange[] {
        // 如果没有交集，则返回 range1
        if (
            range2.startRow > range1.endRow ||
            range2.endRow < range1.startRow ||
            range2.startColumn > range1.endColumn ||
            range2.endColumn < range1.startColumn
        ) {
            return [range1];
        }

        const ranges: IRange[] = [];

        // 上部分
        if (range2.startRow >= range1.startRow) {
            ranges.push({
                startRow: range1.startRow,
                startColumn: range1.startColumn,
                endRow: range2.startRow - 1,
                endColumn: range1.endColumn,
            });
        }

        // 下部分
        if (range2.endRow <= range1.endRow) {
            ranges.push({
                startRow: range2.endRow + 1,
                startColumn: range1.startColumn,
                endRow: range1.endRow,
                endColumn: range1.endColumn,
            });
        }

        // 左部分
        const topBoundary = Math.max(range1.startRow, range2.startRow);
        const bottomBoundary = Math.min(range1.endRow, range2.endRow);

        if (range2.startColumn >= range1.startColumn) {
            ranges.push({
                startRow: topBoundary,
                startColumn: range1.startColumn,
                endRow: bottomBoundary,
                endColumn: range2.startColumn - 1,
            });
        }

        // 右部分
        if (range2.endColumn <= range1.endColumn) {
            ranges.push({
                startRow: topBoundary,
                startColumn: range2.endColumn + 1,
                endRow: bottomBoundary,
                endColumn: range1.endColumn,
            });
        }

        const result = ranges.filter((range) => range.startRow <= range.endRow && range.startColumn <= range.endColumn);

        return result;
    }

    /**
     * Merges overlapping or adjacent ranges into larger ranges
     * @param ranges
     * @example
     * ```typescript
     * const ranges = [
     *   { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 },
     *   { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 }
     * ];
     * const merged = Rectangle.mergeRanges(ranges);
     * // Combines overlapping ranges into larger ones
     * ```
     */
    static mergeRanges(ranges: IRange[]): IRange[] {
        return mergeRanges(ranges);
    }

    /**
     * Splits overlapping ranges into a grid of non-overlapping ranges
     * @param ranges
     * @example
     * ```typescript
     * const ranges = [
     *   { startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 },
     *   { startRow: 1, startColumn: 1, endRow: 3, endColumn: 3 }
     * ];
     * const grid = Rectangle.splitIntoGrid(ranges);
     * // Splits into non-overlapping grid sections
     * ```
     */
    static splitIntoGrid(ranges: IRange[]): IRange[] {
        return splitIntoGrid(ranges);
    }

    /**
     * Subtracts multiple ranges from multiple ranges
     * @param ranges1
     * @param ranges2
     * @example
     * ```typescript
     * const ranges1 = [{ startRow: 0, startColumn: 0, endRow: 3, endColumn: 3 }];
     * const ranges2 = [
     *   { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 },
     *   { startRow: 2, startColumn: 2, endRow: 3, endColumn: 3 }
     * ];
     * const result = Rectangle.subtractMulti(ranges1, ranges2);
     * // Returns remaining non-overlapping areas
     * ```
     */
    static subtractMulti(ranges1: IRange[], ranges2: IRange[]): IRange[] {
        if (!ranges2.length) {
            return ranges1;
        }

        let res: IRange[] = ranges1;
        ranges2.forEach((range) => {
            res = multiSubtractSingleRange(res, range);
        });

        return res;
    }

    /**
     * Checks if two rectangles defined by left, top, right, bottom coordinates intersect
     * @param rect1
     * @param rect2
     * @example
     * ```typescript
     * const rect1 = { left: 0, top: 0, right: 10, bottom: 10 };
     * const rect2 = { left: 5, top: 5, right: 15, bottom: 15 };
     * const intersects = Rectangle.hasIntersectionBetweenTwoRect(rect1, rect2); // true
     * ```
     */
    static hasIntersectionBetweenTwoRect(rect1: IRectLTRB, rect2: IRectLTRB) {
        if (
            rect1.left > rect2.right || // rect1 在 rect2 右侧
            rect1.right < rect2.left || // rect1 在 rect2 左侧
            rect1.top > rect2.bottom || // rect1 在 rect2 下方
            rect1.bottom < rect2.top // rect1 在 rect2 上方
        ) {
            return false;
        }

        return true;
    }

    /**
     * Gets the intersection area between two rectangles defined by LTRB coordinates
     * @param rect1
     * @param rect2
     * @example
     * ```typescript
     * const rect1 = { left: 0, top: 0, right: 10, bottom: 10 };
     * const rect2 = { left: 5, top: 5, right: 15, bottom: 15 };
     * const intersection = Rectangle.getIntersectionBetweenTwoRect(rect1, rect2);
     * // Returns { left: 5, top: 5, right: 10, bottom: 10, width: 5, height: 5 }
     * ```
     */
    static getIntersectionBetweenTwoRect(rect1: IRectLTRB, rect2: IRectLTRB) {
        // Calculating the coordinates of the intersection part of the two rectangles
        const left = Math.max(rect1.left, rect2.left);
        const right = Math.min(rect1.right, rect2.right);
        const top = Math.max(rect1.top, rect2.top);
        const bottom = Math.min(rect1.bottom, rect2.bottom);

        // If the width or height of the intersection part is less than or equal to 0, it means that the two rectangles do not intersect
        if (right <= left || bottom <= top) {
            return null;
        }

        // Return the rectangle of the intersection part
        return {
            left,
            right,
            top,
            bottom,
            width: right - left,
            height: bottom - top,
        } as Required<IRectLTRB>;
    }

    /**
     * Sorts an array of ranges by startRow, then by startColumn
     * @param ranges
     * @example
     * ```typescript
     * const ranges = [
     *   { startRow: 1, startColumn: 0, endRow: 2, endColumn: 1 },
     *   { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 }
     * ];
     * const sorted = Rectangle.sort(ranges);
     * // Ranges will be sorted by startRow first, then startColumn
     * ```
     */
    static sort(ranges: IRange[]) {
        return ranges.sort((a, b) => a.startRow - b.startRow || a.startColumn - b.startColumn);
    }
}
