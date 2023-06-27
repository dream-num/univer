import { CellValueType, ICellData, IRangeData, ObjectMatrix } from '@univerjs/core';
import { FunctionNode } from '../AstNode';
import { BaseAstNode } from '../AstNode/BaseAstNode';
import { NodeType } from '../AstNode/NodeType';
import {
    AstNodePromiseType,
    CalculateValueType,
    FunctionVariantType,
    IInterpreterDatasetConfig,
    PreCalculateNodeType,
    UnitArrayFormulaDataType,
    UnitDataType,
} from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { ArrayValueObject } from '../ValueObject/ArrayValueObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';

export class Interpreter {
    private _runtimeData: UnitDataType = {};

    private _unitArrayFormulaData: UnitArrayFormulaDataType = {};

    constructor(private _interpreterDatasetConfig?: IInterpreterDatasetConfig) {}

    // static interpreter: Interpreter;

    static create(interpreterDatasetConfig?: IInterpreterDatasetConfig) {
        return new Interpreter(interpreterDatasetConfig);
        // if (!this.interpreter) {
        //     this.interpreter = new Interpreter(interpreterCalculateProps);
        // }

        // interpreterCalculateProps && this.interpreter.setProps(interpreterCalculateProps);

        // return this.interpreter;
    }

    async executeAsync(node: BaseAstNode): Promise<FunctionVariantType> {
        // if (!this._interpreterCalculateProps) {
        //     return ErrorValueObject.create(ErrorType.ERROR);
        // }

        if (!node) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        await this._executeAsync(node);

        const value = node.getValue();

        return Promise.resolve(value);
    }

    execute(node: BaseAstNode): FunctionVariantType {
        // if (!this._interpreterCalculateProps) {
        //     return ErrorValueObject.create(ErrorType.ERROR);
        // }

        if (!node) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        this._execute(node);

        return node.getValue();
    }

    executePreCalculateNode(node: PreCalculateNodeType) {
        node.execute(this._interpreterDatasetConfig, this._runtimeData);
        return node.getValue();
    }

    checkAsyncNode(node: BaseAstNode) {
        const result: boolean[] = [];
        this._checkAsyncNode(node, result);

        for (let i = 0, len = result.length; i < len; i++) {
            const item = result[i];
            if (item === true) {
                return true;
            }
        }

        return false;
    }

    setRuntimeData(row: number, column: number, sheetId: string, unitId: string, functionVariant: FunctionVariantType) {
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
            arrayFormulaData[sheetId] = new ObjectMatrix<IRangeData>();
        }

        const sheetData = unitData[sheetId];
        const arrayData = arrayFormulaData[sheetId];
        if (functionVariant.isReferenceObject() || (functionVariant.isValueObject() && (functionVariant as BaseValueObject).isArray())) {
            const objectValueRefOrArray = functionVariant as BaseReferenceObject | ArrayValueObject;
            const { startRow, startColumn, endRow, endColumn } = objectValueRefOrArray.getRangePosition();
            objectValueRefOrArray.iterator((valueObject, rowIndex, columnIndex) => {
                sheetData.setValue(rowIndex - startRow + row, columnIndex - startColumn + column, this._objectValueToCellValue(valueObject));
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

    setProps(interpreterDatasetConfig: IInterpreterDatasetConfig) {
        this._interpreterDatasetConfig = interpreterDatasetConfig;
    }

    setCurrentPosition(row: number, column: number, sheetId: string, unitId: string) {
        if (!this._interpreterDatasetConfig) {
            return;
        }
        this._interpreterDatasetConfig.currentRow = row;
        this._interpreterDatasetConfig.currentColumn = column;
        this._interpreterDatasetConfig.currentSheetId = sheetId;
        this._interpreterDatasetConfig.currentUnitId = unitId;
    }

    private _checkAsyncNode(node: BaseAstNode, resultList: boolean[]) {
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            resultList.push(item.isAsync());
            this._checkAsyncNode(item, resultList);
        }
    }

    private async _executeAsync(node: BaseAstNode): Promise<AstNodePromiseType> {
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            this._executeAsync(item);
        }

        if (node.nodeType === NodeType.FUNCTION && (node as FunctionNode).isAsync()) {
            await node.executeAsync(this._interpreterDatasetConfig);
        } else {
            node.execute(this._interpreterDatasetConfig, this._runtimeData);
        }

        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    private _execute(node: BaseAstNode): AstNodePromiseType {
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            this._execute(item);
        }

        node.execute(this._interpreterDatasetConfig, this._runtimeData);

        return AstNodePromiseType.SUCCESS;
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
}
