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

import type { ICellData, IRange, Nullable } from '@univerjs/core';
import type {
    IArrayFormulaRangeType,
    IFeatureDirtyRangeType,
    IRuntimeOtherUnitDataType,
    IRuntimeUnitDataType,
} from '../basics/common';
import type { BaseAstNode } from '../engine/ast-node/base-ast-node';
import type { BaseReferenceObject, FunctionVariantType } from '../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import type { BaseValueObject } from '../engine/value-object/base-value-object';
import { createIdentifier, Disposable, ObjectMatrix } from '@univerjs/core';
import { isInDirtyRange } from '../basics/dirty';
import { ErrorType } from '../basics/error-type';
import { CELL_INVERTED_INDEX_CACHE } from '../basics/inverted-index-cache';
import { isNullCellForFormula } from '../basics/is-null-cell';
import { getRuntimeFeatureCell } from '../engine/utils/get-runtime-feature-cell';
import { clearNumberFormatTypeCache, clearStringToNumberPatternCache } from '../engine/utils/numfmt-kit';
import { clearReferenceToRangeCache } from '../engine/utils/reference-cache';
import { objectValueToCellValue } from '../engine/utils/value-object';
import { ErrorValueObject } from '../engine/value-object/base-value-object';
import { IFormulaCurrentConfigService } from './current-data.service';

/**
 * The formula engine has a lot of stages. IDLE and CALCULATION_COMPLETED can be considered as
 * the computing has completed.
 */
export enum FormulaExecuteStageType {
    IDLE,
    START,
    START_DEPENDENCY,
    START_CALCULATION,
    CURRENTLY_CALCULATING,
    START_DEPENDENCY_ARRAY_FORMULA,
    START_CALCULATION_ARRAY_FORMULA,
    CURRENTLY_CALCULATING_ARRAY_FORMULA,
    CALCULATION_COMPLETED,
}

export enum FormulaExecutedStateType {
    INITIAL,
    STOP_EXECUTION,
    NOT_EXECUTED,
    SUCCESS,
}

export interface IAllRuntimeData {
    unitData: IRuntimeUnitDataType;
    arrayFormulaRange: IArrayFormulaRangeType;
    unitOtherData: IRuntimeOtherUnitDataType;
    functionsExecutedState: FormulaExecutedStateType;
    arrayFormulaCellData: IRuntimeUnitDataType;
    clearArrayFormulaCellData: IRuntimeUnitDataType;

    runtimeFeatureRange: { [featureId: string]: IFeatureDirtyRangeType };
    runtimeFeatureCellData: { [featureId: string]: IRuntimeUnitDataType };
}

export interface IExecutionInProgressParams {
    totalFormulasToCalculate: number;
    completedFormulasCount: number;

    totalArrayFormulasToCalculate: number;
    completedArrayFormulasCount: number;

    formulaCycleIndex: number;

    stage: FormulaExecuteStageType;
}

export interface IFormulaRuntimeService {
    currentRow: number;

    currentColumn: number;

    currentSubUnitId: string;

    currentUnitId: string;

    dispose(): void;

    reset(): void;

    setCurrent(
        row: number,
        column: number,
        rowCount: number,
        columnCount: number,
        sheetId: string,
        unitId: string
    ): void;

    registerFunctionDefinitionPrivacyVar(lambdaId: string, lambdaVar: Map<string, Nullable<BaseAstNode>>): void;

    getFunctionDefinitionPrivacyVar(lambdaId: string): Nullable<Map<string, Nullable<BaseAstNode>>>;

    setRuntimeData(functionVariant: FunctionVariantType): void;

    getUnitData(): IRuntimeUnitDataType;

    getUnitArrayFormula(): IArrayFormulaRangeType;

    stopExecution(): void;

    setFormulaExecuteStage(type: FormulaExecuteStageType): void;

    setFormulaCycleIndex(index: number): void;

    isStopExecution(): boolean;

    getFormulaExecuteStage(): FormulaExecuteStageType;

    setRuntimeOtherData(formulaId: string, x: number, y: number, functionVariant: FunctionVariantType): void;

    getRuntimeOtherData(): IRuntimeOtherUnitDataType;

    getAllRuntimeData(): IAllRuntimeData;

    markedAsSuccessfullyExecuted(): void;

    markedAsNoFunctionsExecuted(): void;

    markedAsStopFunctionsExecuted(): void;

    markedAsInitialFunctionsExecuted(): void;

    setTotalFormulasToCalculate(value: number): void;

    getTotalFormulasToCalculate(): number;

    setCompletedFormulasCount(value: number): void;

    getCompletedFormulasCount(): number;

    getRuntimeState(): IExecutionInProgressParams;

    setTotalArrayFormulasToCalculate(value: number): void;

    getTotalArrayFormulasToCalculate(): number;

    setCompletedArrayFormulasCount(value: number): void;

    getCompletedArrayFormulasCount(): number;

    enableCycleDependency(): void;

    disableCycleDependency(): void;

    isCycleDependency(): boolean;

    getRuntimeArrayFormulaCellData(): IRuntimeUnitDataType;

    getRuntimeFeatureRange(): { [featureId: string]: IFeatureDirtyRangeType };

    getRuntimeFeatureCellData(): { [featureId: string]: IRuntimeUnitDataType };

    setRuntimeFeatureCellData(featureId: string, featureData: IRuntimeUnitDataType): void;

    setRuntimeFeatureRange(featureId: string, featureRange: IFeatureDirtyRangeType): void;

    clearReferenceAndNumberformatCache(): void;
}

export class FormulaRuntimeService extends Disposable implements IFormulaRuntimeService {
    private _formulaExecuteStage: FormulaExecuteStageType = FormulaExecuteStageType.IDLE;

    private _stopState = false;

    private _currentRow: number = -1;
    private _currentColumn: number = -1;

    private _currentRowCount: number = Number.NEGATIVE_INFINITY;
    private _currentColumnCount: number = Number.NEGATIVE_INFINITY;

    private _currentSubUnitId: string = '';
    private _currentUnitId: string = '';

    private _runtimeData: IRuntimeUnitDataType = {};

    private _runtimeOtherData: IRuntimeOtherUnitDataType = {}; // Data returned by other businesses through formula calculation, excluding the sheet.

    private _unitArrayFormulaRange: IArrayFormulaRangeType = {};

    private _runtimeArrayFormulaCellData: IRuntimeUnitDataType = {};

    private _runtimeClearArrayFormulaCellData: IRuntimeUnitDataType = {};

    private _runtimeFeatureRange: { [featureId: string]: IFeatureDirtyRangeType } = {};

    private _runtimeFeatureCellData: { [featureId: string]: IRuntimeUnitDataType } = {};

    private _functionsExecutedState: FormulaExecutedStateType = FormulaExecutedStateType.INITIAL;

    // lambdaId: { key: BaseAstNode }
    private _functionDefinitionPrivacyVar: Map<string, Map<string, Nullable<BaseAstNode>>> = new Map();

    private _totalFormulasToCalculate: number = 0;

    private _completedFormulasCount: number = 0;

    private _totalArrayFormulasToCalculate: number = 0;

    private _completedArrayFormulasCount: number = 0;

    private _formulaCycleIndex: number = 0;

    private _isCycleDependency: boolean = false;

    constructor(
        @IFormulaCurrentConfigService private readonly _currentConfigService: IFormulaCurrentConfigService
    ) {
        super();
    }

    get currentRow() {
        return this._currentRow;
    }

    get currentColumn() {
        return this._currentColumn;
    }

    get currentRowCount() {
        return this._currentRowCount;
    }

    get currentColumnCount() {
        return this._currentColumnCount;
    }

    get currentSubUnitId() {
        return this._currentSubUnitId;
    }

    get currentUnitId() {
        return this._currentUnitId;
    }

    override dispose(): void {
        super.dispose();

        this.reset();
        this._runtimeFeatureCellData = {};
        this._runtimeFeatureRange = {};
        this.clearReferenceAndNumberformatCache();
    }

    enableCycleDependency() {
        this._isCycleDependency = true;
    }

    disableCycleDependency() {
        this._isCycleDependency = false;
    }

    isCycleDependency() {
        return this._isCycleDependency;
    }

    setFormulaCycleIndex(index: number) {
        this._formulaCycleIndex = index;
    }

    getFormulaCycleIndex() {
        return this._formulaCycleIndex;
    }

    setTotalArrayFormulasToCalculate(value: number) {
        this._totalArrayFormulasToCalculate = value;
    }

    getTotalArrayFormulasToCalculate() {
        return this._totalArrayFormulasToCalculate;
    }

    setCompletedArrayFormulasCount(value: number) {
        this._completedArrayFormulasCount = value;
    }

    getCompletedArrayFormulasCount() {
        return this._completedArrayFormulasCount;
    }

    setTotalFormulasToCalculate(value: number) {
        this._totalFormulasToCalculate = value;
    }

    getTotalFormulasToCalculate() {
        return this._totalFormulasToCalculate;
    }

    setCompletedFormulasCount(value: number) {
        this._completedFormulasCount = value;
    }

    getCompletedFormulasCount() {
        return this._completedFormulasCount;
    }

    markedAsSuccessfullyExecuted() {
        this._functionsExecutedState = FormulaExecutedStateType.SUCCESS;
    }

    markedAsNoFunctionsExecuted() {
        this._functionsExecutedState = FormulaExecutedStateType.NOT_EXECUTED;
    }

    markedAsStopFunctionsExecuted() {
        this._functionsExecutedState = FormulaExecutedStateType.STOP_EXECUTION;
    }

    markedAsInitialFunctionsExecuted() {
        this._functionsExecutedState = FormulaExecutedStateType.INITIAL;
    }

    stopExecution() {
        this._stopState = true;

        this.setFormulaExecuteStage(FormulaExecuteStageType.IDLE);
    }

    isStopExecution() {
        return this._stopState;
    }

    setFormulaExecuteStage(type: FormulaExecuteStageType) {
        this._formulaExecuteStage = type;
    }

    getFormulaExecuteStage() {
        return this._formulaExecuteStage;
    }

    reset() {
        this._formulaExecuteStage = FormulaExecuteStageType.IDLE;
        this._runtimeData = {};
        this._runtimeOtherData = {};
        this._unitArrayFormulaRange = {};
        this._runtimeArrayFormulaCellData = {};
        this._runtimeClearArrayFormulaCellData = {};

        // this._runtimeFeatureCellData = {};
        // this._runtimeFeatureRange = {};

        this._functionDefinitionPrivacyVar.clear();
        this.markedAsInitialFunctionsExecuted();

        this._stopState = false;
        this._isCycleDependency = false;
        this._totalFormulasToCalculate = 0;
        this._completedFormulasCount = 0;

        this.clearReferenceAndNumberformatCache();
    }

    clearReferenceAndNumberformatCache() {
        clearNumberFormatTypeCache();
        clearStringToNumberPatternCache();
        clearReferenceToRangeCache();
    }

    setCurrent(row: number, column: number, rowCount: number, columnCount: number, sheetId: string, unitId: string) {
        this._currentRow = row;
        this._currentColumn = column;
        this._currentRowCount = rowCount;
        this._currentColumnCount = columnCount;
        this._currentSubUnitId = sheetId;
        this._currentUnitId = unitId;
    }

    clearFunctionDefinitionPrivacyVar() {
        this._functionDefinitionPrivacyVar.clear();
    }

    registerFunctionDefinitionPrivacyVar(lambdaId: string, lambdaVar: Map<string, Nullable<BaseAstNode>>) {
        this._functionDefinitionPrivacyVar.set(lambdaId, lambdaVar);
    }

    getFunctionDefinitionPrivacyVar(lambdaId: string): Nullable<Map<string, Nullable<BaseAstNode>>> {
        return this._functionDefinitionPrivacyVar.get(lambdaId);
    }

    setRuntimeOtherData(formulaId: string, x: number, y: number, functionVariant: FunctionVariantType) {
        const subUnitId = this._currentSubUnitId;
        const unitId = this._currentUnitId;

        if (this._runtimeOtherData[unitId] === undefined) {
            this._runtimeOtherData[unitId] = {};
        }

        const unitData = this._runtimeOtherData[unitId]!;

        if (unitData[subUnitId] === undefined || unitData[subUnitId] === null) {
            unitData[subUnitId] = {};
        }

        const subComponentData = unitData[subUnitId];

        let cellDatas: Nullable<ICellData>[][] = [];

        if (
            functionVariant.isReferenceObject() ||
            (functionVariant.isValueObject() && (functionVariant as BaseValueObject).isArray())
        ) {
            const objectValueRefOrArray = functionVariant as BaseReferenceObject | ArrayValueObject;
            const { startRow, startColumn } = objectValueRefOrArray.getRangePosition();
            objectValueRefOrArray.iterator((valueObject, rowIndex, columnIndex) => {
                const value = objectValueToCellValue(valueObject);

                const row = rowIndex - startRow;
                const column = columnIndex - startColumn;
                if (cellDatas[row] == null) {
                    cellDatas[row] = [];
                }

                cellDatas[row][column] = value;
            });
        } else {
            cellDatas = [[objectValueToCellValue(functionVariant as BaseValueObject)!]];
        }

        if (subComponentData[formulaId] === undefined || subComponentData[formulaId] === null) {
            subComponentData[formulaId] = {};
        }

        if (subComponentData[formulaId][y] === undefined || subComponentData[formulaId][y] === null) {
            subComponentData[formulaId][y] = {};
        }

        // x represents the column offset, y represents the row offset
        subComponentData[formulaId][y][x] = cellDatas;
    }

    // eslint-disable-next-line max-lines-per-function
    setRuntimeData(functionVariant: FunctionVariantType) {
        const row = this._currentRow;
        const column = this._currentColumn;
        const rowCount = this._currentRowCount;
        const columnCount = this.currentColumnCount;
        const sheetId = this._currentSubUnitId;
        const unitId = this._currentUnitId;

        if (this._runtimeData[unitId] == null) {
            this._runtimeData[unitId] = {};
        }

        const unitData = this._runtimeData[unitId]!;

        if (unitData[sheetId] == null) {
            unitData[sheetId] = new ObjectMatrix<Nullable<ICellData>>();
        }

        if (this._unitArrayFormulaRange[unitId] == null) {
            this._unitArrayFormulaRange[unitId] = {};
        }

        const arrayFormulaRange = this._unitArrayFormulaRange[unitId]!;

        if (arrayFormulaRange[sheetId] === null || arrayFormulaRange[sheetId] === undefined) {
            arrayFormulaRange[sheetId] = {};
        }

        const arrayData = new ObjectMatrix<IRange>(arrayFormulaRange[sheetId]);

        if (this._runtimeArrayFormulaCellData[unitId] === undefined) {
            this._runtimeArrayFormulaCellData[unitId] = {};
        }

        const runtimeArrayFormulaCellData = this._runtimeArrayFormulaCellData[unitId]!;

        if (runtimeArrayFormulaCellData[sheetId] == null) {
            runtimeArrayFormulaCellData[sheetId] = new ObjectMatrix<Nullable<ICellData>>();
        }

        if (this._runtimeClearArrayFormulaCellData[unitId] === undefined) {
            this._runtimeClearArrayFormulaCellData[unitId] = {};
        }

        const clearArrayFormulaCellData = this._runtimeClearArrayFormulaCellData[unitId]!;

        if (clearArrayFormulaCellData[sheetId] == null) {
            clearArrayFormulaCellData[sheetId] = new ObjectMatrix<Nullable<ICellData>>();
        }

        const sheetData = unitData[sheetId];

        const runtimeArrayUnitData = runtimeArrayFormulaCellData[sheetId];

        const clearArrayUnitData = clearArrayFormulaCellData[sheetId];

        if (
            functionVariant.isReferenceObject() ||
            (functionVariant.isValueObject() && (functionVariant as BaseValueObject).isArray())
        ) {
            const objectValueRefOrArray = functionVariant as BaseReferenceObject | ArrayValueObject;

            const { startRow, startColumn, endRow, endColumn } = objectValueRefOrArray.getRangePosition();

            /**
             * If the referenced range or array only contains a single value, such as A5,
             * then it is not treated as an array range and is directly assigned.
             */
            if (startRow === endRow && startColumn === endColumn) {
                const firstCell = objectValueRefOrArray.getFirstCell();
                // TODO @Dushusir set pattern style
                const valueObject = objectValueToCellValue(firstCell);
                sheetData.setValue(row, column, valueObject);
                clearArrayUnitData.setValue(row, column, valueObject);

                // Formula calculation results are saved to cache
                CELL_INVERTED_INDEX_CACHE.set(
                    unitId,
                    sheetId,
                    column,
                    firstCell.getValue(),
                    row,
                    true
                );

                return;
            }

            const arrayRange = {
                startRow: row,
                startColumn: column,
                endRow: endRow - startRow + row,
                endColumn: endColumn - startColumn + column,
            };

            // Do not use getData to synchronize arrayData to arrayFormulaRange[sheetId] anymore, they are already linked, otherwise it will cause performance issues
            arrayData.setValue(row, column, arrayRange);

            if (
                this._checkIfArrayFormulaRangeHasData(unitId, sheetId, row, column, arrayRange) ||
                this._checkIfArrayFormulaExceeded(rowCount, columnCount, arrayRange)
            ) {
                const errorObject = objectValueToCellValue(ErrorValueObject.create(ErrorType.SPILL));
                sheetData.setValue(row, column, errorObject);
                clearArrayUnitData.setValue(row, column, errorObject);

                // Formula calculation results are saved to cache
                CELL_INVERTED_INDEX_CACHE.set(
                    unitId,
                    sheetId,
                    column,
                    ErrorType.SPILL,
                    row,
                    true
                );

                /**
                 * When there are values within the array formula range, the entire formula will result in an error.
                 * In this case, you need to clear the previous range data to prevent other formulas from referencing the old values.
                 */
                const unitData = this._currentConfigService.getUnitData();
                objectValueRefOrArray.iterator((_, rowIndex, columnIndex) => {
                    const currentRow = rowIndex - startRow + row;
                    const currentColumn = columnIndex - startColumn + column;
                    const cell = unitData[unitId]?.[sheetId]?.cellData.getValue(currentRow, currentColumn);

                    if (rowIndex === startRow && columnIndex === startColumn) {
                        runtimeArrayUnitData.setValue(row, column, errorObject);
                    } else if (cell != null) {
                        if (cell.v == null) {
                            cell.v = '';
                        }
                        runtimeArrayUnitData.setValue(currentRow, currentColumn, cell);
                    } // To determine whether a cell has a value, in addition to cell != null, other array formulas may get undefined (displayed as 0). In this case, the value of the existing array formula cannot be modified.
                    else if (this._isInOtherArrayFormulaRange(unitId, sheetId, row, column, currentRow, currentColumn)) {
                        return true;
                    } else {
                        runtimeArrayUnitData.setValue(currentRow, currentColumn, { v: '' });
                    }
                });
            } else {
                const spillError = ErrorValueObject.create(ErrorType.SPILL);
                objectValueRefOrArray.iterator((valueObject, rowIndex, columnIndex) => {
                    // Formula calculation results are saved to cache
                    CELL_INVERTED_INDEX_CACHE.set(
                        unitId,
                        sheetId,
                        column - startColumn + columnIndex,
                        !valueObject ? 0 : valueObject.getValue(),
                        row - startRow + rowIndex,
                        true
                    );

                    const value = objectValueToCellValue(valueObject);
                    if (rowIndex === startRow && columnIndex === startColumn) {
                        /**
                         * If the referenced range contains an error in the spill of the array formula,
                         * then the current array formula should report an error together.
                         */
                        if (valueObject != null && valueObject.isError() && valueObject.isEqualType(spillError)) {
                            clearArrayUnitData.setValue(row, column, {});
                            sheetData.setValue(row, column, { ...objectValueToCellValue(spillError) });
                            return false;
                        }
                        sheetData.setValue(row, column, { ...value });
                    }

                    const currentRow = rowIndex - startRow + row;
                    const currentColumn = columnIndex - startColumn + column;

                    runtimeArrayUnitData.setValue(currentRow, currentColumn, value);
                });
            }
        } else {
            const valueObject = objectValueToCellValue(functionVariant as BaseValueObject);
            sheetData.setValue(row, column, valueObject);

            // Formula calculation results are saved to cache
            CELL_INVERTED_INDEX_CACHE.set(
                unitId,
                sheetId,
                column,
                (functionVariant as BaseValueObject).getValue(),
                row,
                true
            );

            clearArrayUnitData.setValue(row, column, valueObject);
        }
    }

    getUnitData() {
        return this._runtimeData;
    }

    getUnitArrayFormula() {
        return this._unitArrayFormulaRange;
    }

    getRuntimeOtherData() {
        return this._runtimeOtherData;
    }

    getRuntimeArrayFormulaCellData() {
        return this._runtimeArrayFormulaCellData;
    }

    getRuntimeClearArrayFormulaCellData() {
        return this._runtimeClearArrayFormulaCellData;
    }

    getRuntimeFeatureRange() {
        return this._runtimeFeatureRange;
    }

    setRuntimeFeatureRange(featureId: string, featureRange: IFeatureDirtyRangeType) {
        this._runtimeFeatureRange[featureId] = featureRange;
    }

    getRuntimeFeatureCellData() {
        return this._runtimeFeatureCellData;
    }

    setRuntimeFeatureCellData(featureId: string, featureData: IRuntimeUnitDataType) {
        this._runtimeFeatureCellData[featureId] = featureData;
    }

    getAllRuntimeData(): IAllRuntimeData {
        return {
            unitData: this.getUnitData(),
            arrayFormulaRange: this.getUnitArrayFormula(),
            unitOtherData: this.getRuntimeOtherData(),
            functionsExecutedState: this._functionsExecutedState,
            arrayFormulaCellData: this.getRuntimeArrayFormulaCellData(),
            clearArrayFormulaCellData: this.getRuntimeClearArrayFormulaCellData(),

            runtimeFeatureRange: this.getRuntimeFeatureRange(),
            runtimeFeatureCellData: this.getRuntimeFeatureCellData(),
        };
    }

    getRuntimeState(): IExecutionInProgressParams {
        return {
            totalFormulasToCalculate: this.getTotalFormulasToCalculate(),

            completedFormulasCount: this.getCompletedFormulasCount(),

            totalArrayFormulasToCalculate: this.getTotalArrayFormulasToCalculate(),

            completedArrayFormulasCount: this.getCompletedArrayFormulasCount(),

            stage: this.getFormulaExecuteStage(),

            formulaCycleIndex: this.getFormulaCycleIndex(),
        };
    }

    // eslint-disable-next-line complexity
    private _checkIfArrayFormulaRangeHasData(
        formulaUnitId: string,
        formulaSheetId: string,
        formulaRow: number,
        formulaColumn: number,
        arrayRange: IRange
    ) {
        const { startRow, startColumn, endRow, endColumn } = arrayRange;

        const unitData = this._currentConfigService.getUnitData();
        // this._runtimeArrayFormulaCellData data is incomplete, use the data on configService
        const arrayData = this._currentConfigService.getArrayFormulaCellData();

        const unitArrayFormulaRange =
            this._unitArrayFormulaRange[formulaUnitId]?.[formulaSheetId]?.[formulaRow]?.[formulaColumn];

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                if (r === formulaRow && formulaColumn === c) {
                    continue;
                }

                const cell = this._runtimeData?.[formulaUnitId]?.[formulaSheetId]?.getValue(r, c);

                const arrayDataCell = arrayData?.[formulaUnitId]?.[formulaSheetId]?.getValue(
                    r,
                    c
                );
                const currentCell = unitData?.[formulaUnitId]?.[formulaSheetId]?.cellData?.getValue(r, c);

                const featureCell = this._getRuntimeFeatureCellValue(r, c, formulaSheetId, formulaUnitId);

                // arrayDataCell may display 0 as {v: null}. Although it is an empty cell, it is considered to have a value.
                if (
                    !isNullCellForFormula(cell) ||
                    this._isInOtherArrayFormulaRange(formulaUnitId, formulaSheetId, formulaRow, formulaColumn, r, c) ||
                    !isNullCellForFormula(currentCell) ||
                    !isNullCellForFormula(featureCell)
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    private _getRuntimeFeatureCellValue(row: number, column: number, sheetId: string, unitId: string) {
        return getRuntimeFeatureCell(row, column, sheetId, unitId, this._runtimeFeatureCellData);
    }

    private _arrayCellHasData(cell: Nullable<ICellData>) {
        if (cell === null || cell === undefined) {
            return false;
        }

        if (cell.v !== undefined) {
            return true;
        }

        return false;
    }

    /**
     * If the current array formula in the extended area intersects with the existing array formula, a #SPILL! error will be reported. Note that if other array formulas are already #SPILL!, they will not conflict with the current array formula
     * @param formulaUnitId
     * @param formulaSheetId
     * @param formulaRow
     * @param formulaColumn
     * @param r
     * @param c
     * @returns
     */
    private _isInOtherArrayFormulaRange(formulaUnitId: string, formulaSheetId: string, formulaRow: number, formulaColumn: number, r: number, c: number) {
        const arrayFormulaRange = this._currentConfigService.getArrayFormulaRange()[formulaUnitId]?.[formulaSheetId];

        if (arrayFormulaRange == null) {
            return false;
        }

        let isCellOverlapping = false;

        const arrayFormulaRangeMatrix = new ObjectMatrix(arrayFormulaRange);
        arrayFormulaRangeMatrix.forValue((rangeRow, rangeCol, range) => {
            // skip the current range
            if (rangeRow === formulaRow && rangeCol === formulaColumn) {
                return;
            }

            // Check if the cell is part of any other range in arrayFormulaRangeMatrix, and value is not #SPILL!
            const isOverlapping = this._isInArrayFormulaRange(range, r, c);
            const cell = this._runtimeData[formulaUnitId]?.[formulaSheetId]?.getValue(rangeRow, rangeCol);
            if (isOverlapping && cell?.v !== ErrorType.SPILL) {
                isCellOverlapping = true;
            }
        });

        return isCellOverlapping;
    }

    private _isInArrayFormulaRange(range: Nullable<IRange>, r: number, c: number) {
        if (range == null) {
            return false;
        }

        const { startRow, startColumn, endRow, endColumn } = range;

        if (r >= startRow && r <= endRow && c >= startColumn && c <= endColumn) {
            return true;
        }

        return false;
    }

    private _checkIfArrayFormulaExceeded(rowCount: number, columnCount: number, arrayRange: IRange) {
        if (arrayRange.endRow >= rowCount || arrayRange.endColumn >= columnCount) {
            return true;
        }

        return false;
    }

    private _isInDirtyRange(unitId: string, sheetId: string, row: number, column: number) {
        const dirtyRanges = this._currentConfigService.getDirtyRanges();
        // Handle the deletion and add of sheet.
        if (dirtyRanges.length === 0) {
            return true;
        }
        return isInDirtyRange(dirtyRanges, unitId, sheetId, row, column);
    }
}

export const IFormulaRuntimeService = createIdentifier<FormulaRuntimeService>('univer.formula.runtime.service');
