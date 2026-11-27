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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { MultiAreaValue } from '../../../engine/reference-object/multi-area-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import type { ISuperTableService } from '../../../services/super-table.service';
import { MAX_COLUMN_COUNT, MAX_ROW_COUNT, RANGE_TYPE, UniverInstanceType } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { regexTestColumn, regexTestMultipleRange, regexTestRow, regexTestSingeRange } from '../../../basics/regex';
import { operatorToken, suffixToken } from '../../../basics/token';
import { CellReferenceObject } from '../../../engine/reference-object/cell-reference-object';
import { ColumnReferenceObject } from '../../../engine/reference-object/column-reference-object';
import { MultiAreaReferenceObject } from '../../../engine/reference-object/multi-area-reference-object';
import { RangeReferenceObject } from '../../../engine/reference-object/range-reference-object';
import { RowReferenceObject } from '../../../engine/reference-object/row-reference-object';
import { TableReferenceObject } from '../../../engine/reference-object/table-reference-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { deserializeRangeForR1C1 } from '../../../engine/utils/r1c1-reference';
import { splitTableStructuredRef } from '../../../engine/utils/reference';
import { deserializeRangeWithSheetWithCache } from '../../../engine/utils/reference-cache';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import { resolveSpillAnchor } from '../anchorarray';

const INDIRECT_ERROR_LITERALS = [
    ErrorType.NULL,
    ErrorType.DIV_BY_ZERO,
    ErrorType.VALUE,
    ErrorType.REF,
    ErrorType.NAME,
    ErrorType.NUM,
    ErrorType.NA,
    ErrorType.CYCLE,
    ErrorType.CALC,
] as const;

export class Indirect extends BaseFunction {
    private _superTableService?: ISuperTableService;
    private _initializeReference?: (reference: BaseReferenceObject) => void;
    private _spillAnchors?: BaseReferenceObject[];

    override minParams = 1;

    override maxParams = 2;

    override needsUnitReferenceResolver = true;

    override needsReferenceObject = true;

    override isAddress() {
        return true;
    }

    setSuperTableService(service: ISuperTableService) {
        this._superTableService = service;
    }

    setReferenceInitializer(initialize: (reference: BaseReferenceObject) => void): void {
        this._initializeReference = initialize;
    }

    takeSpillAnchors(): readonly BaseReferenceObject[] | undefined {
        const anchors = this._spillAnchors;
        this._spillAnchors = undefined;
        return anchors;
    }

    override calculate(refTextInput: FunctionVariantType, a1Input?: FunctionVariantType) {
        this._spillAnchors = undefined;

        const refText = this._readArgument(refTextInput);
        const style = a1Input == null ? BooleanValueObject.create(true) : this._readArgument(a1Input);
        if (!refText.isArray() && !style.isArray()) {
            return this._calculateCell(refText, style);
        }

        const textArray = refText.isArray() ? refText as ArrayValueObject : undefined;
        const styleArray = style.isArray() ? style as ArrayValueObject : undefined;
        const rows = Math.max(textArray?.getRowCount() ?? 1, styleArray?.getRowCount() ?? 1);
        const columns = Math.max(textArray?.getColumnCount() ?? 1, styleArray?.getColumnCount() ?? 1);
        const missing = ErrorValueObject.create(ErrorType.NA);
        const textCells = expandArrayValueObject(rows, columns, refText, missing);
        const styleCells = expandArrayValueObject(rows, columns, style, missing);
        const areas: MultiAreaValue[][] = [];
        for (let row = 0; row < rows; row++) {
            const references: MultiAreaValue[] = [];
            for (let column = 0; column < columns; column++) {
                references.push(this._calculateCell(
                    textCells.get(row, column) ?? missing,
                    styleCells.get(row, column) ?? missing
                ));
            }
            areas.push(references);
        }
        return new MultiAreaReferenceObject('', areas);
    }

    private _readArgument(input: FunctionVariantType): BaseValueObject {
        if (!input.isReferenceObject()) {
            return input as BaseValueObject;
        }
        const array = (input as BaseReferenceObject).toArrayValueObject();
        return array.getRowCount() === 1 && array.getColumnCount() === 1 ? array.getFirstCell() : array;
    }

    private _calculateCell(refText: BaseValueObject, style: BaseValueObject): MultiAreaValue {
        if (refText.isError()) {
            return refText as ErrorValueObject;
        }
        if (style.isError()) {
            return style as ErrorValueObject;
        }

        let useA1 = !style.isNull() && style.getValue() !== 0 && style.getValue() !== false;
        if (style.isString()) {
            const text = String(style.getValue()).toUpperCase();
            if (text !== 'TRUE' && text !== 'FALSE') {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
            useA1 = text === 'TRUE';
        }

        return this._handleSingleObject(refText, useA1);
    }

    private _handleSingleObject(refTextObject: BaseValueObject, useA1: boolean) {
        if (refTextObject.isError()) {
            return refTextObject as ErrorValueObject;
        }
        if (!refTextObject.isString()) {
            return ErrorValueObject.create(ErrorType.REF);
        }
        const refTextValue = String(refTextObject.getValue()).trim();

        if (refTextValue.trim() === '') {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const embeddedError = this._matchErrorLiteral(refTextValue);
        if (embeddedError != null) {
            return ErrorValueObject.create(embeddedError);
        }

        const convertedText = this._convertToDefinedName(refTextValue);
        const spill = convertedText.endsWith(suffixToken.POUND);
        const refTextV = spill ? convertedText.slice(0, -1) : convertedText;

        if (!useA1 && convertedText === refTextValue) {
            const gridRange = deserializeRangeForR1C1(refTextV, this.row, this.column);

            const { range, sheetName, unitId } = gridRange;
            const invalidRows = range.rangeType !== RANGE_TYPE.COLUMN && (
                !Number.isInteger(range.startRow) || range.startRow < 0 || range.endRow >= MAX_ROW_COUNT
            );
            const invalidColumns = range.rangeType !== RANGE_TYPE.ROW && (
                !Number.isInteger(range.startColumn) || range.startColumn < 0 || range.endColumn >= MAX_COLUMN_COUNT
            );
            if (invalidRows || invalidColumns) {
                if (spill) {
                    return ErrorValueObject.create(ErrorType.REF);
                }
                return this._resolveTableReference(refTextV) ?? ErrorValueObject.create(ErrorType.REF);
            }

            const rangeReferenceObject = new RangeReferenceObject(range);

            rangeReferenceObject.setUnitQualifier(unitId);
            rangeReferenceObject.setForcedUnitIdDirect(unitId);
            rangeReferenceObject.setForcedSheetName(sheetName);

            return this._setDefault(rangeReferenceObject, spill);
        }

        if (regexTestSingeRange(refTextV)) {
            const reference = new CellReferenceObject(refTextV);
            const range = reference.getRangeData();
            // A malformed qualified reference can match the lexer regex but deserialize as a huge range.
            if (range.startRow !== range.endRow || range.startColumn !== range.endColumn || range.endRow >= MAX_ROW_COUNT || range.endColumn >= MAX_COLUMN_COUNT) {
                return ErrorValueObject.create(ErrorType.REF);
            }
            return this._setDefault(reference, spill);
        }
        if (spill) {
            return ErrorValueObject.create(ErrorType.REF);
        }
        if (regexTestRow(refTextV)) {
            return this._setDefault(new RowReferenceObject(refTextV));
        }

        if (regexTestColumn(refTextV)) {
            return this._setDefault(new ColumnReferenceObject(refTextV));
        }
        if (!regexTestMultipleRange(refTextV)) {
            return this._resolveTableReference(refTextV) ?? ErrorValueObject.create(ErrorType.REF);
        }

        const gridRange = deserializeRangeWithSheetWithCache(refTextV);

        const { range, sheetName, unitId } = gridRange;

        if (Number.isNaN(range.startRow) || range.endRow + 1 > MAX_ROW_COUNT || Number.isNaN(range.startColumn) || range.endColumn + 1 > MAX_COLUMN_COUNT) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const rangeReferenceObject = new RangeReferenceObject(range);

        rangeReferenceObject.setUnitQualifier(unitId);
        rangeReferenceObject.setForcedUnitIdDirect(unitId);
        rangeReferenceObject.setForcedSheetName(sheetName);

        return this._setDefault(rangeReferenceObject);
    }

    private _resolveTableReference(text: string) {
        if (!this._superTableService || !this._unitReferenceResolver || !this.unitId) {
            return;
        }
        const { unitQualifier, tableName, columnStruct } = splitTableStructuredRef(text);
        if (unitQualifier) {
            return;
        }
        const table = this._superTableService.getTable(this.unitId, tableName);
        const match = table ?? Array.from(this._superTableService.getTableMap(this.unitId) ?? []).find(([name]) => name.toLowerCase() === tableName.toLowerCase())?.[1];
        if (!match) {
            return;
        }
        const resolution = this._unitReferenceResolver.resolve({ hostUnitId: this.unitId, qualifier: '', referenceKind: 'table' });
        if (typeof resolution === 'string') {
            return ErrorValueObject.create(resolution);
        }
        const reference = new TableReferenceObject(text, match, columnStruct, this._superTableService.getTableOptionMap());
        if (reference.getReferenceError(this.row, resolution.unitType === UniverInstanceType.UNIVER_BASE)) {
            return ErrorValueObject.create(ErrorType.REF);
        }
        reference.setCurrentRowAndColumn(this.row, this.column);
        return this._setDefault(reference);
    }

    private _setDefault(object: BaseReferenceObject, spill = false): BaseReferenceObject | ErrorValueObject {
        if (this.unitId == null || this.subUnitId == null) {
            return ErrorValueObject.create(ErrorType.REF);
        }
        const unitQualifier = object.getUnitQualifier();
        if (unitQualifier && this._unitReferenceResolver) {
            const resolution = this._unitReferenceResolver.resolve({
                hostUnitId: this.unitId,
                qualifier: unitQualifier,
                referenceKind: 'a1',
            });
            if (typeof resolution === 'string') {
                return ErrorValueObject.create(resolution);
            }
            object.setForcedUnitIdDirect(resolution.unitId);
        }
        object.setDefaultUnitId(this.unitId);
        object.setDefaultSheetId(this.subUnitId);
        if (spill) {
            this._initializeReference?.(object);
            if (object.getRowCount() === 1 && object.getColumnCount() === 1 &&
                (!object.getForcedSheetName() || object.getForcedSheetId())) {
                (this._spillAnchors ??= []).push(object);
            }
            return resolveSpillAnchor(object, (range) => this.createReferenceObject(object, range));
        }
        return object;
    }

    /**
     * In Excel, to inject a defined name into a function that has positioning capabilities,
     * such as using the INDIRECT function to reference a named range,
     * you can write it as follows:
     * =INDIRECT("DefinedName1")
     */
    private _convertToDefinedName(refText: string) {
        const definedName = this.getDefinedName(refText);
        if (definedName == null) {
            return refText;
        }

        const formulaOrRefString = definedName.formulaOrRefString;

        if (formulaOrRefString == null) {
            return refText;
        }

        if (formulaOrRefString.startsWith(operatorToken.EQUALS)) {
            return formulaOrRefString.slice(1);
        }

        return formulaOrRefString;
    }

    private _matchErrorLiteral(refText: string) {
        const normalizedRefText = refText.toUpperCase();
        return INDIRECT_ERROR_LITERALS.find((errorType) => normalizedRefText.includes(errorType));
    }
}
