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
import { createIdentifier } from '@univerjs/core';
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

export interface IPivotFormulaReport {
    /** The body is last, following any page field ranges. */
    ranges: readonly IRange[];
    dataFields: readonly { sourceName: string; displayName: string }[];
    fields: readonly string[];
    columnFields: readonly string[];
    layout?: {
        firstDataRow?: number;
        grandTotalLabel?: string;
        columnFieldNames?: readonly (readonly string[])[];
        /** Worksheet columns belonging to the rendered column grand totals, in measure order. */
        columnGrandTotals?: readonly number[];
        subtotalLabel?: string;
        rightToLeft?: boolean;
        pageFields?: readonly { names: readonly string[]; value: string; displayValue?: string }[];
    };
}

export interface IPivotFormulaReportLookup {
    getPivotFormulaReport(unitId: string, sheetId: string, anchor: IRange): IPivotFormulaReport | undefined;
}

export const IPivotFormulaReportLookup = createIdentifier<IPivotFormulaReportLookup>('univer.formula.pivot-report-lookup');

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

    constructor(private readonly _anchor: BaseReferenceObject, private readonly _range?: IRange, private readonly _rightToLeft = false) {
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
        const cell = this._storedCell(row, this._physicalColumn(column));
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
        const physicalColumn = this._physicalColumn(column);
        if (!this._contains(row, physicalColumn)) {
            return null;
        }
        const runtimeCell = this._anchor.getCurrentRuntimeSheetData()?.getValue(row, physicalColumn);
        return runtimeCell ?? (this._range && this._anchor.getRuntimeFeatureCellValue(row, physicalColumn)) ?? this._storedCell(row, physicalColumn);
    }

    private _physicalColumn(column: number): number {
        return this._rightToLeft && this._range ? this._range.startColumn + this._range.endColumn - column : column;
    }

    private _storedCell(row: number, column: number): Nullable<ICellData> {
        return this._contains(row, column) ? this._anchor.getCurrentActiveSheetData()?.cellData.getValue(row, column) : null;
    }

    private _contains(row: number, column: number): boolean {
        const range = this._range;
        return !range || (row >= range.startRow && row <= range.endRow && column >= range.startColumn && column <= range.endColumn);
    }
}

export class Getpivotdata extends BaseFunction {
    override minParams = 2;

    override maxParams = 254;

    override needsReferenceObject = true;

    protected get pivotReportLookup(): IPivotFormulaReportLookup | undefined {
        return undefined;
    }

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
        const lookup = this.pivotReportLookup;
        if (!lookup && (range.startRow !== range.endRow || range.startColumn !== range.endColumn)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        const report = lookup?.getPivotFormulaReport(reference.getUnitId(), reference.getSheetId(), range);
        const body = report?.ranges[report.ranges.length - 1];
        if (lookup && !body) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const fieldPairs: PivotFieldPair[] = [];
        for (let index = 2; index < variants.length; index += 2) {
            const field = this._textArgument(variants[index]);
            const item = this._textArgument(variants[index + 1]);
            const pageField = report?.layout?.pageFields?.find(({ names }) => names.some((name) => samePivotText(name, field)));
            if (pageField) {
                const { value, displayValue } = pageField;
                if (!value || (!samePivotText(value, item) && (displayValue === undefined || !samePivotText(displayValue, item)))) {
                    return ErrorValueObject.create(ErrorType.REF);
                }
            } else {
                fieldPairs.push([field, item]);
            }
        }

        let dataField = this._textArgument(variants[0]).trim();
        if (report) {
            const measure = report.dataFields.find((field) => samePivotText(field.displayName, dataField)) ??
                report.dataFields.find((field) => samePivotText(field.sourceName, dataField));
            if (!measure || fieldPairs.some(([field]) => !report.fields.some((name) => samePivotText(name, field)))) {
                return ErrorValueObject.create(ErrorType.REF);
            }
            dataField = measure.displayName || measure.sourceName;
        }
        const result = visiblePivotGet(new PivotCellReader(reference, body, report?.layout?.rightToLeft), body ?? range, dataField, fieldPairs, report);

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
    fieldPairs: PivotFieldPair[],
    report?: IPivotFormulaReport
): Nullable<BaseValueObject> {
    if (fieldPairs.some((pair) => isInvalidPivotItem(pair[1]))) {
        return null;
    }

    const startRow = anchorRange.startRow;
    const startColumn = anchorRange.startColumn;
    const maxRow = report ? anchorRange.endRow : startRow + PIVOT_SCAN_ROW_LIMIT;
    const maxColumn = report ? anchorRange.endColumn : startColumn + PIVOT_SCAN_COLUMN_LIMIT;

    const firstDataRow = report?.layout?.firstDataRow;
    const grandTotalLabel = report?.layout?.grandTotalLabel ?? PIVOT_GRAND_TOTAL_LABEL;
    const lastHeaderRow = firstDataRow == null ? maxRow : Math.min(maxRow, firstDataRow - 1);
    const columnFields = report?.columnFields;
    const columnFieldNames = report?.layout?.columnFieldNames;
    const hierarchy = columnFieldNames && columnFieldNames.length > 1 ? columnFieldNames : undefined;
    const columnFieldIndex = (field: string) => hierarchy
        ? hierarchy.findIndex((names) => names.some((name) => samePivotText(name, field)))
        : (columnFields?.findIndex((name) => samePivotText(name, field)) ?? -1);
    const columnPairs = report ? fieldPairs.filter(([field]) => columnFieldIndex(field) >= 0) : fieldPairs;
    const sortedColumnPairs = report ? [...columnPairs].sort(([left], [right]) => columnFieldIndex(left) - columnFieldIndex(right)) : [];
    const columnItems = sortedColumnPairs.map(([, item]) => item);
    if (hierarchy && sortedColumnPairs.some(([field], level) => columnFieldIndex(field) !== level)) {
        return null;
    }
    for (let headerRow = startRow; headerRow <= lastHeaderRow; headerRow++) {
        const dataColumn = findPivotDataColumn(reader, headerRow, startColumn, maxColumn, dataField);
        if (dataColumn == null) {
            continue;
        }

        const hasHeaderItems = columnItems.length > 1 || (columnItems.length === 1 && (dataColumn > startColumn || hierarchy != null));
        const columnMatch = columnPairs.length && !hasHeaderItems
            ? findPivotColumnItemMatch(reader, headerRow, dataColumn, maxRow, maxColumn, columnPairs, firstDataRow)
            : null;
        const matchedColumn = hasHeaderItems
            ? findPivotColumnByHeaderItems(
                reader,
                anchorRange,
                headerRow,
                dataColumn,
                dataField,
                columnItems,
                firstDataRow,
                hierarchy?.length,
                report?.layout?.subtotalLabel
            )
            : columnMatch?.column;
        if (hasHeaderItems && matchedColumn == null) {
            continue;
        }
        const needsTotalColumn = report?.columnFields.length && !columnPairs.length;
        const totalColumn = needsTotalColumn
            ? findPivotGrandTotalColumn(reader, headerRow, dataColumn, anchorRange, dataField, report, grandTotalLabel, firstDataRow)
            : undefined;
        if ((report && columnPairs.length && matchedColumn == null) || (needsTotalColumn && totalColumn == null)) {
            return null;
        }
        const resolvedColumn = matchedColumn ?? totalColumn ?? dataColumn;
        const rowPairs = report
            ? fieldPairs.filter(([field]) => columnFieldIndex(field) < 0)
            : fieldPairs.filter((_, index) => index !== columnMatch?.index);

        let row: Nullable<number>;
        if (rowPairs.length === 0) {
            row = findRowlessPivotRow(reader, headerRow, startColumn, maxRow)
                ?? findGrandTotalRow(reader, headerRow, startColumn, maxRow, grandTotalLabel);
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

function findPivotGrandTotalColumn(
    reader: IPivotCellReader,
    headerRow: number,
    dataColumn: number,
    range: IRange,
    dataField: string,
    report: IPivotFormulaReport,
    label: string,
    firstDataRow?: number
): number | undefined {
    const totalColumns = report.layout?.columnGrandTotals;
    if (totalColumns && totalColumns.length === report.dataFields.length) {
        let measure = report.dataFields.findIndex(({ displayName }) => samePivotText(displayName, dataField));
        if (measure < 0) {
            measure = report.dataFields.findIndex(({ sourceName }) => samePivotDataField(sourceName, dataField));
        }
        const column = totalColumns[measure];
        if (column == null || column < range.startColumn || column > range.endColumn) return;
        return report.layout?.rightToLeft ? range.startColumn + range.endColumn - column : column;
    }
    if (totalColumns?.length === 0) return;
    if (dataColumn > range.startColumn) {
        // Measure-specific totals can sit above the row of detail measure captions.
        for (let row = range.startRow; row <= headerRow; row++) {
            for (let column = range.endColumn; column > dataColumn; column--) {
                const physicalColumn = report.layout?.rightToLeft ? range.startColumn + range.endColumn - column : column;
                if (totalColumns && !totalColumns.includes(physicalColumn)) continue;
                const caption = reader.text(row, column).trim();
                for (const total of ['Total', label]) {
                    const prefix = `${total} `;
                    const suffix = ` ${total}`;
                    if ((caption.toLowerCase().startsWith(prefix.toLowerCase()) && samePivotDataField(caption.slice(prefix.length), dataField)) ||
                        (caption.toLowerCase().endsWith(suffix.toLowerCase()) && samePivotDataField(caption.slice(0, -suffix.length), dataField))) {
                        return column;
                    }
                }
            }
        }
        return;
    }
    const dataStart = firstDataRow ?? findFirstPivotDataRow(reader, headerRow, dataColumn, range.endRow, range.endColumn);
    if (dataStart == null) return;
    for (let row = headerRow; row < dataStart; row++) {
        for (let column = range.endColumn; column > dataColumn; column--) {
            if (samePivotText(reader.text(row, column), label)) return column;
        }
    }
}

function findPivotColumnByHeaderItems(
    reader: IPivotCellReader,
    range: IRange,
    headerRow: number,
    dataColumn: number,
    dataField: string,
    items: readonly string[],
    dataStartRow?: number,
    levels = items.length,
    subtotalLabel = 'Total'
): number | undefined {
    const { startRow, startColumn, endRow, endColumn } = range;
    const hasMeasureRow = dataColumn > startColumn;
    const firstDataRow = dataStartRow ?? findFirstPivotDataRow(
        reader,
        hasMeasureRow ? headerRow : headerRow + levels,
        dataColumn,
        endRow,
        endColumn
    );
    if (firstDataRow == null) return;
    const lastItemRow = (hasMeasureRow ? headerRow : firstDataRow) - 1;
    const firstItemRow = lastItemRow - levels + 1;
    if (firstItemRow < startRow || lastItemRow >= firstDataRow) return;

    const labels: string[] = [];
    const requestsSubtotal = items.length < levels;
    const subtotalItem = items[items.length - 1];
    const subtotalSuffix = `${subtotalItem} ${subtotalLabel}`;
    const subtotalPrefix = `${subtotalLabel} ${subtotalItem}`;
    for (let column = startColumn + 1; column <= endColumn; column++) {
        let parentChanged = false;
        for (let level = 0; level < items.length; level++) {
            const label = reader.text(firstItemRow + level, column).trim();
            const subtotalLevel = level === items.length - 1 && requestsSubtotal;
            if (subtotalLevel && (
                samePivotText(label, subtotalSuffix) || samePivotText(label, subtotalPrefix)
            )) {
                if (items.slice(0, level).every((parent, index) => samePivotText(labels[index] ?? '', parent)) &&
                    (!hasMeasureRow || samePivotDataField(reader.text(headerRow, column), dataField))) {
                    return column;
                }
            }
            // A merged parent caption carries over to the next column in its group.
            if (parentChanged || (label !== '' && !samePivotText(labels[level] ?? '', label))) {
                labels[level] = label;
                parentChanged = true;
            }
        }
        if (!requestsSubtotal && items.every((item, level) => samePivotText(labels[level] ?? '', item)) &&
            (!hasMeasureRow || samePivotDataField(reader.text(headerRow, column), dataField))) {
            return column;
        }
    }
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
    fieldPairs: PivotFieldPair[],
    dataStartRow?: number
): Nullable<IPivotColumnItemMatch> {
    const firstDataRow = dataStartRow ?? findFirstPivotDataRow(reader, headerRow, dataColumn, maxRow, maxColumn);
    if (firstDataRow == null) {
        return null;
    }

    const lastHeaderRow = Math.min(maxRow, firstDataRow - 1);
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
    if (headerRow >= maxRow) {
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
    maxRow: number,
    label: string
): Nullable<number> {
    for (let row = headerRow + 1; row <= maxRow; row++) {
        if (samePivotText(reader.text(row, startColumn), label)) {
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
