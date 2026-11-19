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

import type { ICellData, IRange, Nullable, Styles } from '@univerjs/core';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NullValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

const PIVOT_SCAN_ROW_LIMIT = 200;
const PIVOT_SCAN_COLUMN_LIMIT = 50;
const PIVOT_TOTAL_SUFFIX = ' TOTAL';
const PIVOT_GRAND_TOTAL_LABEL = 'Grand Total';
const PIVOT_YEAR_FIELD = 'YEAR';

/**
 * Excel reports aggregated value fields as `Sum of <field>`, `Count of <field>`, etc.
 * `GETPIVOTDATA` also accepts the source field name in that position.
 */
const PIVOT_AGGREGATE_PREFIXES = [
    'sum of ',
    'count of ',
    'average of ',
    'max of ',
    'min of ',
    'product of ',
    'count numbers of ',
    'stddev of ',
    'stddevp of ',
    'var of ',
];

type PivotFieldPair = [string, string];

interface IPivotColumnItemMatch {
    index: number;
    column: number;
}

interface IPivotCellReader {
    text(row: number, column: number): string;
    leftPadding(row: number, column: number): number;
    value(row: number, column: number): BaseValueObject;
}

/**
 * The visible PivotTable report is scanned from the anchor cell. The reader resolves the
 * runtime value first so cells recalculated in this session win over the stored snapshot.
 */
class PivotCellReader implements IPivotCellReader {
    private readonly _styles: Nullable<Styles>;

    constructor(private readonly _anchor: BaseReferenceObject) {
        this._styles = _anchor.getCurrentStylesData();
    }

    text(row: number, column: number): string {
        const cell = this._readCell(row, column);
        if (cell?.v == null) {
            return '';
        }
        return String(cell.v);
    }

    leftPadding(row: number, column: number): number {
        const cell = this._storedCell(row, column);
        if (cell == null) {
            return 0;
        }
        const style = typeof cell.s === 'object' && cell.s != null
            ? cell.s
            : this._styles?.getStyleByCell(cell);
        const padding = style?.pd?.l;
        return typeof padding === 'number' ? padding : 0;
    }

    value(row: number, column: number): BaseValueObject {
        const cell = this._readCell(row, column);
        if (cell == null) {
            return NullValueObject.create();
        }
        return this._anchor.getCellValueObject(cell);
    }

    private _readCell(row: number, column: number): Nullable<ICellData> {
        const runtimeCell = this._anchor.getCurrentRuntimeSheetData()?.getValue(row, column);
        return runtimeCell ?? this._storedCell(row, column);
    }

    private _storedCell(row: number, column: number): Nullable<ICellData> {
        return this._anchor.getCurrentActiveSheetData()?.cellData.getValue(row, column) ?? null;
    }
}

export class Getpivotdata extends BaseFunction {
    override minParams = 2;

    override maxParams = 254;

    override needsReferenceObject = true;

    override calculate(...variants: FunctionVariantType[]): BaseValueObject {
        if (variants.length < 2 || variants.length % 2 !== 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const anchor = variants[1];
        if (!anchor.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const reference = anchor as BaseReferenceObject;
        const range = reference.getRangePosition();
        if (range.startRow !== range.endRow || range.startColumn !== range.endColumn) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const fieldPairs: PivotFieldPair[] = [];
        for (let index = 2; index < variants.length; index += 2) {
            fieldPairs.push([this._textArgument(variants[index]), this._textArgument(variants[index + 1])]);
        }

        const result = visiblePivotGet(
            new PivotCellReader(reference),
            range,
            this._textArgument(variants[0]).trim(),
            fieldPairs
        );

        return result ?? ErrorValueObject.create(ErrorType.REF);
    }

    private _textArgument(variant: FunctionVariantType): string {
        let valueObject: BaseValueObject;
        if (variant.isReferenceObject()) {
            valueObject = (variant as BaseReferenceObject).getCellByPosition();
        } else {
            valueObject = variant as BaseValueObject;
        }

        if (valueObject.isArray()) {
            valueObject = (valueObject as ArrayValueObject).getFirstCell();
        }

        const value = valueObject.getValue();
        return value == null ? '' : String(value);
    }
}

function visiblePivotGet(
    reader: IPivotCellReader,
    anchorRange: IRange,
    dataField: string,
    fieldPairs: PivotFieldPair[]
): Nullable<BaseValueObject> {
    if (fieldPairs.some((pair) => isInvalidPivotItem(pair[1]))) {
        return null;
    }

    const startRow = anchorRange.startRow;
    const startColumn = anchorRange.startColumn;
    const maxRow = startRow + PIVOT_SCAN_ROW_LIMIT;
    const maxColumn = startColumn + PIVOT_SCAN_COLUMN_LIMIT;

    for (let headerRow = startRow; headerRow <= maxRow; headerRow++) {
        const dataColumn = findPivotDataColumn(reader, headerRow, startColumn, maxColumn, dataField);
        if (dataColumn == null) {
            continue;
        }

        const columnMatch = findPivotColumnItemMatch(reader, headerRow, dataColumn, maxRow, maxColumn, fieldPairs);
        const resolvedColumn = columnMatch?.column ?? dataColumn;
        const rowPairs = columnMatch == null
            ? fieldPairs
            : fieldPairs.filter((_, index) => index !== columnMatch.index);

        let row: Nullable<number>;
        if (rowPairs.length === 0) {
            row = findRowlessPivotRow(reader, headerRow, startColumn, maxRow)
                ?? findGrandTotalRow(reader, headerRow, startColumn, maxRow);
        } else {
            row = findTabularPivotRow(reader, headerRow, startColumn, resolvedColumn, maxRow, rowPairs)
                ?? findHierarchyPivotRow(reader, headerRow, startColumn, maxRow, rowPairs);
        }

        if (row == null) {
            return null;
        }

        return reader.value(row, resolvedColumn);
    }

    return null;
}

function findPivotDataColumn(
    reader: IPivotCellReader,
    headerRow: number,
    startColumn: number,
    maxColumn: number,
    dataField: string
): Nullable<number> {
    for (let column = startColumn; column <= maxColumn; column++) {
        if (samePivotDataField(reader.text(headerRow, column), dataField)) {
            return column;
        }
    }
    return null;
}

/**
 * A column field renders its items as a header row above the first data row. When the
 * requested item is found there, it selects a data column instead of a row.
 */
function findPivotColumnItemMatch(
    reader: IPivotCellReader,
    headerRow: number,
    dataColumn: number,
    maxRow: number,
    maxColumn: number,
    fieldPairs: PivotFieldPair[]
): Nullable<IPivotColumnItemMatch> {
    const firstDataRow = findFirstPivotDataRow(reader, headerRow, dataColumn, maxRow, maxColumn);
    if (firstDataRow == null) {
        return null;
    }

    const lastHeaderRow = firstDataRow - 1;
    if (dataColumn >= maxColumn || lastHeaderRow < headerRow) {
        return null;
    }

    for (let index = 0; index < fieldPairs.length; index++) {
        const item = fieldPairs[index][1];
        for (let row = headerRow; row <= lastHeaderRow; row++) {
            for (let column = dataColumn + 1; column <= maxColumn; column++) {
                if (samePivotText(reader.text(row, column), item)) {
                    return { index, column };
                }
            }
        }
    }

    return null;
}

function findFirstPivotDataRow(
    reader: IPivotCellReader,
    headerRow: number,
    dataColumn: number,
    maxRow: number,
    maxColumn: number
): Nullable<number> {
    for (let row = headerRow + 1; row <= maxRow; row++) {
        for (let column = dataColumn; column <= maxColumn; column++) {
            if (parsePivotNumber(reader.text(row, column)) != null) {
                return row;
            }
        }
    }
    return null;
}

/**
 * A PivotTable without row fields renders the measure captions above a single value row
 * and does not emit a `Grand Total` label.
 */
function findRowlessPivotRow(
    reader: IPivotCellReader,
    headerRow: number,
    startColumn: number,
    maxRow: number
): Nullable<number> {
    if (headerRow + 2 > maxRow) {
        return null;
    }
    if (pivotAggregateSourceName(reader.text(headerRow, startColumn)) == null) {
        return null;
    }
    if (parsePivotNumber(reader.text(headerRow + 1, startColumn)) == null) {
        return null;
    }
    if (reader.text(headerRow + 2, startColumn).trim().length > 0) {
        return null;
    }
    return headerRow + 1;
}

function findGrandTotalRow(
    reader: IPivotCellReader,
    headerRow: number,
    startColumn: number,
    maxRow: number
): Nullable<number> {
    for (let row = headerRow + 1; row <= maxRow; row++) {
        if (samePivotText(reader.text(row, startColumn), PIVOT_GRAND_TOTAL_LABEL)) {
            return row;
        }
    }
    return null;
}

/**
 * Tabular reports repeat the field name as a header and the item as a label, followed by
 * an `<item> Total` subtotal row when subtotals are enabled.
 */
function findTabularPivotRow(
    reader: IPivotCellReader,
    headerRow: number,
    startColumn: number,
    dataColumn: number,
    maxRow: number,
    fieldPairs: PivotFieldPair[]
): Nullable<number> {
    const [field, item] = fieldPairs[0];
    const itemText = item.trim();

    let fieldColumn: Nullable<number> = null;
    for (let column = startColumn; column <= dataColumn; column++) {
        if (samePivotText(reader.text(headerRow, column), field)) {
            fieldColumn = column;
            break;
        }
    }
    if (fieldColumn == null) {
        return null;
    }

    let matchedRow: Nullable<number> = null;
    for (let row = headerRow + 1; row <= maxRow; row++) {
        if (samePivotText(reader.text(row, fieldColumn), itemText)) {
            matchedRow = row;
            break;
        }
    }
    if (matchedRow == null) {
        return null;
    }

    const subtotalLabel = `${itemText} Total`;
    for (let row = matchedRow + 1; row <= maxRow; row++) {
        const label = reader.text(row, fieldColumn).trim();
        if (label.length === 0) {
            continue;
        }
        if (samePivotText(label, subtotalLabel)) {
            return row;
        }
        break;
    }

    return matchedRow;
}

function findHierarchyPivotRow(
    reader: IPivotCellReader,
    headerRow: number,
    startColumn: number,
    maxRow: number,
    fieldPairs: PivotFieldPair[]
): Nullable<number> {
    if (hasPivotIndentation(reader, headerRow, startColumn, maxRow)) {
        return findIndentedPivotRow(reader, headerRow, startColumn, maxRow, fieldPairs);
    }
    return findSequentialPivotRow(reader, headerRow, startColumn, maxRow, fieldPairs);
}

/**
 * Compact reports encode row ancestry as left indentation, so only indented labels are
 * meaningful ancestors of the current row.
 */
function hasPivotIndentation(
    reader: IPivotCellReader,
    headerRow: number,
    startColumn: number,
    maxRow: number
): boolean {
    for (let row = headerRow + 1; row <= maxRow; row++) {
        if (reader.text(row, startColumn).trim().length === 0) {
            return false;
        }
        if (reader.leftPadding(row, startColumn) > 0) {
            return true;
        }
    }
    return false;
}

function findIndentedPivotRow(
    reader: IPivotCellReader,
    headerRow: number,
    startColumn: number,
    maxRow: number,
    fieldPairs: PivotFieldPair[]
): Nullable<number> {
    const ancestors: Array<{ padding: number; label: string }> = [];
    for (let row = headerRow + 1; row <= maxRow; row++) {
        const label = reader.text(row, startColumn);
        if (label.trim().length === 0) {
            continue;
        }

        const padding = reader.leftPadding(row, startColumn);
        while (ancestors.length > 0 && ancestors[ancestors.length - 1].padding >= padding) {
            ancestors.pop();
        }
        ancestors.push({ padding, label });

        const matched = fieldPairs.every((pair) =>
            ancestors.some((ancestor) => samePivotText(ancestor.label, pair[1])));
        if (matched) {
            return row;
        }
    }
    return null;
}

/**
 * Non-indented reports fall back to the original layout inference: remember the last
 * matching item per field and require every requested item to be active on the same row.
 */
function findSequentialPivotRow(
    reader: IPivotCellReader,
    headerRow: number,
    startColumn: number,
    maxRow: number,
    fieldPairs: PivotFieldPair[]
): Nullable<number> {
    const active: Array<Nullable<string>> = fieldPairs.map(() => null);

    for (let row = headerRow + 1; row <= maxRow; row++) {
        const label = reader.text(row, startColumn).trim();
        if (label.length === 0) {
            continue;
        }

        fieldPairs.forEach((pair, index) => {
            if (!samePivotText(label, pair[1].trim())) {
                return;
            }
            active[index] = pair[1].trim();
            if (!samePivotText(pair[0], PIVOT_YEAR_FIELD)) {
                clearYearItems(active, fieldPairs);
            }
        });

        const matched = fieldPairs.every((pair, index) => {
            const activeItem = active[index];
            return activeItem != null && samePivotText(activeItem, pair[1].trim());
        });
        if (matched) {
            return row;
        }
    }
    return null;
}

function clearYearItems(active: Array<Nullable<string>>, fieldPairs: PivotFieldPair[]): void {
    fieldPairs.forEach((pair, index) => {
        if (samePivotText(pair[0], PIVOT_YEAR_FIELD)) {
            active[index] = null;
        }
    });
}

function isInvalidPivotItem(item: string): boolean {
    const text = item.trim();
    return text.length === 0 || text.toUpperCase().endsWith(PIVOT_TOTAL_SUFFIX);
}

function parsePivotNumber(text: string): Nullable<number> {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
        return null;
    }
    const value = Number(trimmed);
    return Number.isFinite(value) ? value : null;
}

function samePivotText(left: string, right: string): boolean {
    return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function samePivotDataField(visibleCaption: string, requestedField: string): boolean {
    if (samePivotText(visibleCaption, requestedField)) {
        return true;
    }
    const sourceName = pivotAggregateSourceName(visibleCaption);
    return sourceName != null && samePivotText(sourceName, requestedField);
}

function pivotAggregateSourceName(caption: string): Nullable<string> {
    const text = caption.trim();
    const lowerCaseText = text.toLowerCase();
    for (const prefix of PIVOT_AGGREGATE_PREFIXES) {
        if (lowerCaseText.startsWith(prefix)) {
            return text.slice(prefix.length).trim();
        }
    }
    return null;
}
