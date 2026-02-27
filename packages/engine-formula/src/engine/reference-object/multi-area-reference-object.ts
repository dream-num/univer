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

import type { Nullable } from '@univerjs/core';
import type { ArrayValueObject } from '../value-object/array-value-object';
import type { BaseValueObject, ErrorValueObject } from '../value-object/base-value-object';
import { createNewArray } from '../utils/array-object';
import { NullValueObject } from '../value-object/primitive-object';
import { BaseReferenceObject } from './base-reference-object';

export type MultiAreaValue = BaseReferenceObject | ErrorValueObject;

export class MultiAreaReferenceObject extends BaseReferenceObject {
    /**
     * 2D structure:
     * - First dimension: stored by rows
     * - Second dimension: each AreaValue within that row
     */
    private _areas: MultiAreaValue[][] = [];

    constructor(token: string, areas: MultiAreaValue[][] = []) {
        // The parent class's rangeData becomes meaningless for multi-area.
        // We only reuse the generic infrastructure from BaseReferenceObject.
        super(token);
        this._areas = areas;
    }

    override dispose(): void {
        this._areas.forEach((row) => {
            row.forEach((a) => a.dispose());
        });
        this._areas = [];
        super.dispose();
    }

    // ------------------------------------------------------------
    // Area Management
    // ------------------------------------------------------------

    getAreas(): MultiAreaValue[][] {
        return this._areas;
    }

    setAreas(areas: MultiAreaValue[][]): void {
        this._areas = areas;
    }

    /**
     * Append an area:
     * - If a single AreaValue is passed, it will be wrapped as one row.
     * - If an AreaValue[] is passed, it will be inserted as an entire row.
     */
    addArea(area: MultiAreaValue | MultiAreaValue[]): void {
        if (Array.isArray(area)) {
            this._areas.push(area);
        } else {
            this._areas.push([area]);
        }
    }

    /** Flatten the 2D areas to reuse 1D logic */
    private _flatAreas(): MultiAreaValue[] {
        // When TS 4.x isn't smart about flat's types, you can handwrite reduce:
        // return this._areas.reduce<AreaValue[]>((acc, row) => acc.concat(row), []);
        return this._areas.flat();
    }

    // ------------------------------------------------------------
    // Multi-area identification
    // ------------------------------------------------------------

    override isMultiArea(): boolean {
        return true;
    }

    override isRange(): boolean {
        // A multi-area reference is not a single rectangle.
        return false;
    }

    override isCell(): boolean {
        return false;
    }

    override isRow(): boolean {
        return false;
    }

    override isColumn(): boolean {
        return false;
    }

    // ------------------------------------------------------------
    // Range-related queries
    // ------------------------------------------------------------

    override getRowCount(): number {
        // Total rows across all areas
        let total = 0;
        for (const a of this._flatAreas()) {
            if (a.isError()) {
                continue;
            }
            total += (a as BaseReferenceObject).getRowCount();
        }
        return total;
    }

    override getColumnCount(): number {
        // Column count is ambiguous across disjoint areas.
        // Excel usually treats multi-area as NOT having a single column count.
        // Returning the sum is the safest for aggregations.
        let total = 0;
        for (const a of this._flatAreas()) {
            if (a.isError()) {
                continue;
            }
            total += (a as BaseReferenceObject).getColumnCount();
        }
        return total;
    }

    override isExceedRange(): boolean {
        return this._flatAreas().some((a) => {
            if (a.isError()) {
                return false;
            }
            return (a as BaseReferenceObject).isExceedRange();
        });
    }

    override setRefOffset(x = 0, y = 0): void {
        super.setRefOffset(x, y);
        // Propagate offset to sub-areas
        this._flatAreas().forEach((a) => {
            if (a.isError()) {
                return;
            }
            (a as BaseReferenceObject).setRefOffset(x, y);
        });
    }

    private _getReferenceArea(): BaseReferenceObject | undefined {
        const flat = this._flatAreas();
        const first = flat.find((a) => !a.isError()) as BaseReferenceObject | undefined;
        return first;
    }

    // ------------------------------------------------------------
    // Unit/Sheet resolution
    // ------------------------------------------------------------

    /**
     * Multi-area reference may span multiple sheets, but Excel requires
     * them to be in the same sheet for most functions. We follow Excel semantics
     * by returning the first area’s identifiers.
     */
    override getUnitId(): string {
        return this._getReferenceArea()?.getUnitId() ?? super.getUnitId();
    }

    override getSheetId(): string {
        return this._getReferenceArea()?.getSheetId() ?? super.getSheetId();
    }

    override getActiveSheetRowCount(): number {
        return this._getReferenceArea()?.getActiveSheetRowCount() ?? 0;
    }

    override getActiveSheetColumnCount(): number {
        return this._getReferenceArea()?.getActiveSheetColumnCount() ?? 0;
    }

    // ------------------------------------------------------------
    // Cell traversal
    // ------------------------------------------------------------

    /**
     * Iterate through all areas in order, flattening the multi-area into
     * a sequence of cells.
     *
     * Note: The order here is "row-major":
     *   iterate by the row order of _areas, then within each row by the area order.
     */
    override iterator(
        callback: (v: Nullable<BaseValueObject>, row: number, col: number) => Nullable<boolean>
    ) {
        for (const row of this._areas) {
            let stopRow = false;

            for (const area of row) {
                if (area.isError()) {
                    continue;
                }

                let stopArea = false;
                (area as BaseReferenceObject).iterator((v, r, c) => {
                    const res = callback(v, r, c);
                    if (res === false) {
                        stopArea = true;
                        stopRow = true;
                        return false;
                    }
                    return res;
                });

                if (stopArea) {
                    break;
                }
            }

            if (stopRow) {
                return;
            }
        }
    }

    /**
     * Excel defines the "first cell" of a multi-area reference
     * as the first cell of the first area.
     */
    override getFirstCell() {
        const first = this._getReferenceArea();
        if (!first) {
            return super.getFirstCell(); // fallback
        }
        return first.getFirstCell();
    }

    // ------------------------------------------------------------
    // Conversion to Array or Cube
    // ------------------------------------------------------------

    /**
     * For multi-area, we only take the *first cell* of each area and
     * arrange them into a 2D ArrayValueObject:
     *
     * - outer `_areas` dimension => rows
     * - inner `_areas[row]` dimension => columns
     */
    override toArrayValueObject(): ArrayValueObject {
        const rows = this._areas.length;

        if (rows === 0) {
            // If you have a dedicated empty-array factory, replace with your implementation
            return createNewArray([], 0, 0);
        }

        // Use the first row's length as the column count (assuming rows are consistent; otherwise fill extras later)
        const cols = this._areas[0]?.length ?? 0;

        const result: BaseValueObject[][] = [];

        for (let r = 0; r < rows; r++) {
            const rowAreas = this._areas[r];
            if (!rowAreas) continue;

            result[r] = result[r] || [];

            for (let c = 0; c < cols; c++) {
                const area = rowAreas[c];
                if (!area) {
                    continue;
                }

                // If it's already an error value, put it directly
                if (area.isError()) {
                    result[r][c] = area as ErrorValueObject;
                    continue;
                }

                // Otherwise take the first cell of that area
                let firstValue: Nullable<BaseValueObject> = null;

                (area as BaseReferenceObject).iterator((v) => {
                    firstValue = v ?? null;
                    // Only need the first one; stop iteration immediately
                    return false;
                });

                if (firstValue != null) {
                    result[r][c] = firstValue as BaseValueObject;
                }
                // If firstValue is also null, depending on needs:
                // - keep it empty (ArrayValueObject's default empty value)
                // - or fill a NullValueObject / EmptyValueObject
                result[r][c] = NullValueObject.create();
            }
        }

        return createNewArray(result, rows, cols);
    }

    override getRangePosition() {
        const flat = this._flatAreas();

        // If there is no area, fall back to BaseReferenceObject behavior.
        if (!flat.length) {
            return super.getRangePosition();
        }

        let minStartRow = Number.POSITIVE_INFINITY;
        let minStartColumn = Number.POSITIVE_INFINITY;
        let maxEndRow = Number.NEGATIVE_INFINITY;
        let maxEndColumn = Number.NEGATIVE_INFINITY;

        for (const area of flat) {
            if (area.isError()) {
                continue;
            }

            const { startRow, startColumn, endRow, endColumn } = (area as BaseReferenceObject).getRangePosition();

            // Skip any invalid range silently.
            if (
                !Number.isFinite(startRow) ||
                !Number.isFinite(startColumn) ||
                !Number.isFinite(endRow) ||
                !Number.isFinite(endColumn)
            ) {
                continue;
            }

            if (startRow < minStartRow) minStartRow = startRow;
            if (startColumn < minStartColumn) minStartColumn = startColumn;
            if (endRow > maxEndRow) maxEndRow = endRow;
            if (endColumn > maxEndColumn) maxEndColumn = maxEndColumn < endColumn ? endColumn : maxEndColumn;
        }

        // If all areas were invalid, defer to the parent implementation.
        if (
            !Number.isFinite(minStartRow) ||
            !Number.isFinite(minStartColumn) ||
            !Number.isFinite(maxEndRow) ||
            !Number.isFinite(maxEndColumn)
        ) {
            return super.getRangePosition();
        }

        return {
            startRow: minStartRow,
            startColumn: minStartColumn,
            endRow: maxEndRow,
            endColumn: maxEndColumn,
        };
    }

    override toUnitRange() {
        // For a multi-area reference, this returns the bounding rectangle
        // that covers all areas, along with the representative unitId/sheetId.
        //
        // This is useful for features that only need an approximate outer range,
        // such as viewport calculations or rough dependency tracking.
        const range = this.getRangePosition();

        return {
            range,
            sheetId: this.getSheetId(),
            unitId: this.getUnitId(),
        };
    }

    override getRangeData() {
        const flat = this._flatAreas();

        // No areas: fall back to the base implementation (which usually returns the
        // internal _rangeData or some default).
        if (!flat.length) {
            return super.getRangeData();
        }

        let minStartRow = Number.POSITIVE_INFINITY;
        let minStartColumn = Number.POSITIVE_INFINITY;
        let maxEndRow = Number.NEGATIVE_INFINITY;
        let maxEndColumn = Number.NEGATIVE_INFINITY;

        for (const area of flat) {
            if (area.isError()) {
                continue;
            }
            // Use the raw rangeData (without offset) of each area
            const { startRow, startColumn, endRow, endColumn } = (area as BaseReferenceObject).getRangeData();

            // Skip invalid/NaN ranges silently
            if (
                !Number.isFinite(startRow) ||
                !Number.isFinite(startColumn) ||
                !Number.isFinite(endRow) ||
                !Number.isFinite(endColumn)
            ) {
                continue;
            }

            if (startRow < minStartRow) minStartRow = startRow;
            if (startColumn < minStartColumn) minStartColumn = startColumn;
            if (endRow > maxEndRow) maxEndRow = endRow;
            if (endColumn > maxEndColumn) maxEndColumn = endColumn;
        }

        // If all areas were invalid, reuse the parent behavior.
        if (
            !Number.isFinite(minStartRow) ||
            !Number.isFinite(minStartColumn) ||
            !Number.isFinite(maxEndRow) ||
            !Number.isFinite(maxEndColumn)
        ) {
            return super.getRangeData();
        }

        return {
            startRow: minStartRow,
            startColumn: minStartColumn,
            endRow: maxEndRow,
            endColumn: maxEndColumn,
        };
    }
}
