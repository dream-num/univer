import { CellValueType, Disposable, ICellData, IRange, Nullable, ObjectMatrix } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import { BaseAstNode } from '../ast-node/base-ast-node';
import {
    ArrayFormulaDataType,
    IRuntimeOtherUnitDataType,
    IRuntimeSheetData,
    IRuntimeUnitDataType,
    UnitArrayFormulaDataType,
} from '../basics/common';
import { ErrorValueObject } from '../other-object/error-value-object';
import { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import { ArrayValueObject } from '../value-object/array-value-object';
import { BaseValueObject, CalculateValueType } from '../value-object/base-value-object';

/**
 * IDLE: Idle phase of the formula engine.
 *
 * DEPENDENCY: Dependency calculation phase, where the formulas that need to be calculated are determined by the modified area,
 * as well as their dependencies. This outputs an array of formulas to execute.
 *
 * INTERPRETER：Formula execution phase, where the calculation of formulas begins.
 *
 */
export enum FormulaExecuteStageType {
    IDLE,
    START_DEPENDENCY,
    START_CALCULATION,
    CURRENTLY_CALCULATING,
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
    unitArrayFormulaData: UnitArrayFormulaDataType;
    unitOtherData: IRuntimeOtherUnitDataType;
    functionsExecutedState: FormulaExecutedStateType;
}

export interface IExecutionInProgressParams {
    totalFormulasToCalculate: number;
    completedFormulasCount: number;
    stage: FormulaExecuteStageType;
}

export interface IFormulaRuntimeService {
    currentRow: number;

    currentColumn: number;

    currentSubComponentId: string;

    currentUnitId: string;

    dispose(): void;

    reset(): void;

    setCurrent(row: number, column: number, sheetId: string, unitId: string): void;

    registerFunctionDefinitionPrivacyVar(lambdaId: string, lambdaVar: Map<string, Nullable<BaseAstNode>>): void;

    getFunctionDefinitionPrivacyVar(lambdaId: string): Nullable<Map<string, Nullable<BaseAstNode>>>;

    setRuntimeData(functionVariant: FunctionVariantType): void;

    getSheetData(unitId: string): IRuntimeSheetData;

    getSheetArrayFormula(unitId: string): ArrayFormulaDataType;

    getUnitData(): IRuntimeUnitDataType;

    getUnitArrayFormula(): UnitArrayFormulaDataType;

    stopExecution(): void;

    setFormulaExecuteStage(type: FormulaExecuteStageType): void;

    isStopExecution(): boolean;

    getFormulaExecuteStage(): FormulaExecuteStageType;

    setRuntimeOtherData(formulaId: string, functionVariant: FunctionVariantType): void;

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
}

export class FormulaRuntimeService extends Disposable implements IFormulaRuntimeService {
    private _formulaExecuteStage: FormulaExecuteStageType = FormulaExecuteStageType.IDLE;

    private _stopState = false;

    private _currentRow: number = 0;
    private _currentColumn: number = 0;
    private _currentSubComponentId: string = '';
    private _currentUnitId: string = '';

    private _runtimeData: IRuntimeUnitDataType = {};

    private _runtimeOtherData: IRuntimeOtherUnitDataType = {}; // Data returned by other businesses through formula calculation, excluding the sheet.

    private _unitArrayFormulaData: UnitArrayFormulaDataType = {};

    private _functionsExecutedState: FormulaExecutedStateType = FormulaExecutedStateType.INITIAL;

    // lambdaId: { key: BaseAstNode }
    private _functionDefinitionPrivacyVar: Map<string, Map<string, Nullable<BaseAstNode>>> = new Map();

    private _totalFormulasToCalculate: number = 0;

    private _completedFormulasCount: number = 0;

    get currentRow() {
        return this._currentRow;
    }

    get currentColumn() {
        return this._currentColumn;
    }

    get currentSubComponentId() {
        return this._currentSubComponentId;
    }

    get currentUnitId() {
        return this._currentUnitId;
    }

    override dispose(): void {
        this.reset();
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
        this._unitArrayFormulaData = {};
        this._functionDefinitionPrivacyVar.clear();
        this.markedAsInitialFunctionsExecuted();

        this._totalFormulasToCalculate = 0;
        this._completedFormulasCount = 0;
    }

    setCurrent(row: number, column: number, sheetId: string, unitId: string) {
        this._currentRow = row;
        this._currentColumn = column;
        this._currentSubComponentId = sheetId;
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

    setRuntimeOtherData(formulaId: string, functionVariant: FunctionVariantType) {
        const subComponentId = this._currentSubComponentId;
        const unitId = this._currentUnitId;

        if (this._runtimeOtherData[unitId] === undefined) {
            this._runtimeOtherData[unitId] = {};
        }

        const unitData = this._runtimeOtherData[unitId];

        if (unitData[subComponentId] === undefined) {
            unitData[subComponentId] = {};
        }

        const subComponentData = unitData[subComponentId];

        subComponentData[formulaId] = this._objectValueToCellValue(functionVariant as CalculateValueType)!;
    }

    setRuntimeData(functionVariant: FunctionVariantType) {
        const row = this._currentRow;
        const column = this._currentColumn;
        const sheetId = this._currentSubComponentId;
        const unitId = this._currentUnitId;

        if (this._runtimeData[unitId] === undefined) {
            this._runtimeData[unitId] = {};
        }

        const unitData = this._runtimeData[unitId];

        if (unitData[sheetId] === undefined) {
            unitData[sheetId] = new ObjectMatrix<ICellData>();
        }

        if (this._unitArrayFormulaData[unitId] === undefined) {
            this._unitArrayFormulaData[unitId] = {};
        }

        const arrayFormulaData = this._unitArrayFormulaData[unitId];

        if (arrayFormulaData[sheetId] === undefined) {
            arrayFormulaData[sheetId] = new ObjectMatrix<IRange>();
        }

        const sheetData = unitData[sheetId];
        const arrayData = arrayFormulaData[sheetId];
        if (
            functionVariant.isReferenceObject() ||
            (functionVariant.isValueObject() && (functionVariant as BaseValueObject).isArray())
        ) {
            const objectValueRefOrArray = functionVariant as BaseReferenceObject | ArrayValueObject;

            const { startRow, startColumn, endRow, endColumn } = objectValueRefOrArray.getRangePosition();

            objectValueRefOrArray.iterator((valueObject, rowIndex, columnIndex) => {
                sheetData.setValue(
                    rowIndex - startRow + row,
                    columnIndex - startColumn + column,
                    this._objectValueToCellValue(valueObject)
                );
            });

            arrayData.setValue(row, column, {
                startRow: row,
                startColumn: column,
                endRow: endRow - startRow + 1 + row,
                endColumn: endColumn - startColumn + 1 + column,
            });
        } else {
            sheetData.setValue(row, column, this._objectValueToCellValue(functionVariant as CalculateValueType));
        }
    }

    getSheetData(unitId: string) {
        return this._runtimeData[unitId];
    }

    getSheetArrayFormula(unitId: string) {
        return this._unitArrayFormulaData[unitId];
    }

    getUnitData() {
        return this._runtimeData;
    }

    getUnitArrayFormula() {
        return this._unitArrayFormulaData;
    }

    getRuntimeOtherData() {
        return this._runtimeOtherData;
    }

    getAllRuntimeData(): IAllRuntimeData {
        return {
            unitData: this.getUnitData(),
            unitArrayFormulaData: this.getUnitArrayFormula(),
            unitOtherData: this.getRuntimeOtherData(),
            functionsExecutedState: this._functionsExecutedState,
        };
    }

    getRuntimeState(): IExecutionInProgressParams {
        return {
            totalFormulasToCalculate: this.getTotalFormulasToCalculate(),

            completedFormulasCount: this.getCompletedFormulasCount(),

            stage: this.getFormulaExecuteStage(),
        };
    }

    private _objectValueToCellValue(objectValue: CalculateValueType) {
        if (objectValue.isErrorObject()) {
            return {
                v: (objectValue as ErrorValueObject).getErrorType() as string,
                t: CellValueType.STRING,
            };
        }
        if (objectValue.isValueObject()) {
            const vo = objectValue as BaseValueObject;
            const v = vo.getValue();
            if (vo.isNumber()) {
                return {
                    v,
                    t: CellValueType.NUMBER,
                };
            }
            if (vo.isBoolean()) {
                return {
                    v,
                    t: CellValueType.BOOLEAN,
                };
            }
            return {
                v,
                t: CellValueType.STRING,
            };
        }
    }

    private _checkIfArrayFormulaRangeHasData(
        formulaUnitId: number,
        formulaSheetId: number,
        formulaRow: number,
        formulaColumn: number,
        arrayRange: IRange
    ) {
        const { startRow, startColumn, endRow, endColumn } = arrayRange;

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const cell = this._runtimeData?.[formulaUnitId]?.[formulaSheetId]?.getValue(r, c);
                const formulaString = cell?.f || '';
                const formulaId = cell?.si || '';
            }
        }
    }
}

export const IFormulaRuntimeService = createIdentifier<FormulaRuntimeService>('univer.formula.runtime.service');
