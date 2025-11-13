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
     * 二维结构：
     * - 第一维：按“行”存放
     * - 第二维：这一行里的每一个 AreaValue
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
     * 追加一个 area：
     * - 传单个 AreaValue 时，自动包成一行；
     * - 传 AreaValue[] 时，当成一整“行”插入。
     */
    addArea(area: MultiAreaValue | MultiAreaValue[]): void {
        if (Array.isArray(area)) {
            this._areas.push(area);
        } else {
            this._areas.push([area]);
        }
    }

    /** 扁平化二维 areas，方便重用一维逻辑 */
    private _flatAreas(): MultiAreaValue[] {
        // TS 4.x 对 flat 的类型不太聪明时，可以手写 reduce：
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
     * 注意：这里是“先行后列”的顺序：
     *   先按 _areas 的行顺序遍历，再在每一行内按 area 顺序遍历。
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
            // 如果你们有专门的空数组工厂，这里可以替换为对应实现
            return createNewArray([], 0, 0);
        }

        // 按第一行的长度作为列数（假设各行长度一致；如果不一致多出来的你可以后面再补）
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

                // 如果本身就是错误值，直接塞进去
                if (area.isError()) {
                    result[r][c] = area as ErrorValueObject;
                    continue;
                }

                // 否则取该 area 的第一个单元格
                let firstValue: Nullable<BaseValueObject> = null;

                (area as BaseReferenceObject).iterator((v) => {
                    firstValue = v ?? null;
                    // 只要第一个，立刻终止遍历
                    return false;
                });

                if (firstValue != null) {
                    result[r][c] = firstValue as BaseValueObject;
                }
                // 如果 firstValue 也是 null，你可以视需求：
                // - 保持为空（ArrayValueObject 默认空值）
                // - 或者填一个 NullValueObject / EmptyValueObject
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
