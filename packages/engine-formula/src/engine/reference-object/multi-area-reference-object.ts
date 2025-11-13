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
import type { BaseValueObject } from '../value-object/base-value-object';
import { CubeValueObject } from '../value-object/cube-value-object';
import { BaseReferenceObject } from './base-reference-object';

export class MultiAreaReferenceObject extends BaseReferenceObject {
    private _areas: BaseReferenceObject[] = [];

    constructor(token: string, areas: BaseReferenceObject[] = []) {
        // The parent class's rangeData becomes meaningless for multi-area.
        // We only reuse the generic infrastructure from BaseReferenceObject.
        super(token);
        this._areas = areas;
    }

    override dispose(): void {
        this._areas.forEach((a) => a.dispose());
        this._areas = [];
        super.dispose();
    }

    // ------------------------------------------------------------
    // Area Management
    // ------------------------------------------------------------

    getAreas(): BaseReferenceObject[] {
        return this._areas;
    }

    setAreas(areas: BaseReferenceObject[]): void {
        this._areas = areas;
    }

    addArea(area: BaseReferenceObject): void {
        this._areas.push(area);
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
        for (const a of this._areas) {
            total += a.getRowCount();
        }
        return total;
    }

    override getColumnCount(): number {
        // Column count is ambiguous across disjoint areas.
        // Excel usually treats multi-area as NOT having a single column count.
        // Returning the sum is the safest for aggregations.
        let total = 0;
        for (const a of this._areas) {
            total += a.getColumnCount();
        }
        return total;
    }

    override isExceedRange(): boolean {
        return this._areas.some((a) => a.isExceedRange());
    }

    override setRefOffset(x = 0, y = 0): void {
        super.setRefOffset(x, y);
        // Propagate offset to sub-areas
        this._areas.forEach((a) => a.setRefOffset(x, y));
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
        return this._areas[0]?.getUnitId() ?? super.getUnitId();
    }

    override getSheetId(): string {
        return this._areas[0]?.getSheetId() ?? super.getSheetId();
    }

    override getActiveSheetRowCount(): number {
        return this._areas[0]?.getActiveSheetRowCount() ?? 0;
    }

    override getActiveSheetColumnCount(): number {
        return this._areas[0]?.getActiveSheetColumnCount() ?? 0;
    }

    // ------------------------------------------------------------
    // Cell traversal
    // ------------------------------------------------------------

    /**
     * Iterate through all areas in order, flattening the multi-area into
     * a sequence of cells.
     */
    override iterator(
        callback: (v: Nullable<BaseValueObject>, row: number, col: number) => Nullable<boolean>
    ) {
        for (const area of this._areas) {
            let stop = false;
            area.iterator((v, r, c) => {
                const res = callback(v, r, c);
                if (res === false) {
                    stop = true;
                    return false;
                }
                return res;
            });
            if (stop) return;
        }
    }

    /**
     * Excel defines the "first cell" of a multi-area reference
     * as the first cell of the first area.
     */
    override getFirstCell() {
        const first = this._areas[0];
        if (!first) {
            return super.getFirstCell(); // fallback
        }
        return first.getFirstCell();
    }

    // ------------------------------------------------------------
    // Conversion to Array or Cube
    // ------------------------------------------------------------

    /**
     * Multi-area cannot be flattened into a rectangular ArrayValueObject.
     * Excel also rejects A1:A3,C1:C3 as a single array.
     */
    override toArrayValueObject(useCache = true): ArrayValueObject {
        const areas = this.toCubeValueObject(useCache);
        return areas.toArrayValueObject();
    }

    /**
     * Convert each area to ArrayValueObject and wrap them into a CubeValueObject.
     * This is the correct representation for discontiguous references.
     */
    toCubeValueObject(useCache = true): CubeValueObject {
        const arrays = this._areas.map((a) => a.toArrayValueObject(useCache));
        return CubeValueObject.create(arrays);
    }

    override getRangePosition() {
        // If there is no area, fall back to BaseReferenceObject behavior.
        const areas = this._areas;
        if (!areas.length) {
            return super.getRangePosition();
        }

        let minStartRow = Number.POSITIVE_INFINITY;
        let minStartColumn = Number.POSITIVE_INFINITY;
        let maxEndRow = Number.NEGATIVE_INFINITY;
        let maxEndColumn = Number.NEGATIVE_INFINITY;

        for (const area of areas) {
            const { startRow, startColumn, endRow, endColumn } = area.getRangePosition();

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
            if (endColumn > maxEndColumn) maxEndColumn = endColumn;
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
        const areas = this._areas;

        // No areas: fall back to the base implementation (which usually returns the
        // internal _rangeData or some default).
        if (!areas.length) {
            return super.getRangeData();
        }

        let minStartRow = Number.POSITIVE_INFINITY;
        let minStartColumn = Number.POSITIVE_INFINITY;
        let maxEndRow = Number.NEGATIVE_INFINITY;
        let maxEndColumn = Number.NEGATIVE_INFINITY;

        for (const area of areas) {
            // Use the raw rangeData (without offset) of each area
            const { startRow, startColumn, endRow, endColumn } = area.getRangeData();

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
