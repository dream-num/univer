import { CellValueType, ICellData, ICellV, ObjectMatrix } from '@univer/core';
import { BaseAstNode } from '../AstNode/BaseAstNode';
import { NodeType } from '../AstNode/NodeType';
import { AstNodePromiseType, CalculateValueType, FunctionVariantType, IInterpreterDatasetConfig, UnitDataType } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { ArrayValueObject } from '../ValueObject/ArrayValueObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';
import { BooleanValueObject } from '../ValueObject/BooleanValueObject';
import { NumberValueObject } from '../ValueObject/NumberValueObject';

export class Interpreter {
    private _runtimeData: UnitDataType = {};

    private _unitId: string;

    private async _execute(node: BaseAstNode): Promise<AstNodePromiseType> {
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            this._execute(item);
            // if (item.nodeType === NodeType.FUNCTION) {
            //     await item.executeAsync(this._interpreterCalculateProps);
            // } else {
            //     item.execute(this._interpreterCalculateProps);
            // }
        }

        if (node.nodeType === NodeType.FUNCTION) {
            await node.executeAsync(this._interpreterDatasetConfig);
        } else {
            node.execute(this._interpreterDatasetConfig, this._runtimeData);
        }

        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    private _objectValueToCellValue(objectValue: CalculateValueType) {
        if (objectValue.isErrorObject()) {
            return {
                v: (objectValue as ErrorValueObject).getErrorType() as string,
                t: CellValueType.STRING,
            };
        } else if (objectValue.isValueObject()) {
            const vo = objectValue as BaseValueObject;
            const v = vo.getValue();
            if (vo.isNumber()) {
                return {
                    v,
                    t: CellValueType.NUMBER,
                };
            } else if (vo.isBoolean()) {
                return {
                    v,
                    t: CellValueType.BOOLEAN,
                };
            } else {
                return {
                    v,
                    t: CellValueType.STRING,
                };
            }
        }
    }

    constructor(private _interpreterDatasetConfig?: IInterpreterDatasetConfig) {}

    async execute(node: BaseAstNode): Promise<FunctionVariantType> {
        // if (!this._interpreterCalculateProps) {
        //     return ErrorValueObject.create(ErrorType.ERROR);
        // }

        if (!node) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        await this._execute(node);

        return Promise.resolve(node.getValue());
    }

    setRuntimeData(row: number, column: number, sheetId: string, functionVariant: FunctionVariantType) {
        if (this._runtimeData[this._unitId] === null) {
            this._runtimeData[this._unitId] = {};
        }

        const unitData = this._runtimeData[this._unitId];

        if (unitData[sheetId] === null) {
            unitData[sheetId] = new ObjectMatrix<ICellData>();
        }

        const sheetData = unitData[sheetId];
        if (functionVariant.isReferenceObject() || (functionVariant as BaseValueObject).isArray()) {
            const objectValueRefOrArray = functionVariant as BaseReferenceObject | ArrayValueObject;
            objectValueRefOrArray.iterator((valueObject, rowIndex, columnIndex) => {
                sheetData.setValue(rowIndex, columnIndex, this._objectValueToCellValue(valueObject));
            });
        } else {
            sheetData.setValue(row, column, this._objectValueToCellValue(functionVariant as CalculateValueType));
        }
    }

    setProps(interpreterDatasetConfig: IInterpreterDatasetConfig) {
        this._interpreterDatasetConfig = interpreterDatasetConfig;
    }

    // static interpreter: Interpreter;

    static create(interpreterDatasetConfig?: IInterpreterDatasetConfig) {
        return new Interpreter(interpreterDatasetConfig);
        // if (!this.interpreter) {
        //     this.interpreter = new Interpreter(interpreterCalculateProps);
        // }

        // interpreterCalculateProps && this.interpreter.setProps(interpreterCalculateProps);

        // return this.interpreter;
    }
}
