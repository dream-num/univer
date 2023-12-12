/**
 * Copyright 2023-present DreamNum Inc.
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

import { ConcatenateType } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import { ObjectClassType } from '../../basics/object-class-type';
import type { compareToken } from '../../basics/token';
import { ErrorValueObject } from '../other-object/error-value-object';

export type CalculateValueType = BaseValueObject | ErrorValueObject;

export type callbackMapFnType = (currentValue: CalculateValueType, row: number, column: number) => CalculateValueType;

export type callbackProductFnType = (
    currentValue: CalculateValueType,
    operationValue: CalculateValueType
) => CalculateValueType;
export interface IArrayValueObject {
    calculateValueList: CalculateValueType[][];
    rowCount: number;
    columnCount: number;
    unitId: string;
    sheetId: string;
    row: number;
    column: number;
}
export class BaseValueObject extends ObjectClassType {
    constructor(private _rawValue: string | number | boolean) {
        super();
    }

    override isValueObject() {
        return true;
    }

    getValue(): string | number | boolean {
        /** abstract */
        return 0;
    }

    getArrayValue(): CalculateValueType[][] {
        /** abstract */
        return [];
    }

    setValue(value: string | number | boolean) {
        /** abstract */
    }

    setArrayValue(value: CalculateValueType[][]) {
        /** abstract */
    }

    isArray() {
        return false;
    }

    isString() {
        return false;
    }

    isNumber() {
        return false;
    }

    isBoolean() {
        return false;
    }

    isError() {
        return false;
    }

    isNull() {
        return false;
    }

    getNegative(): CalculateValueType {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    getReciprocal(): CalculateValueType {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    plus(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    minus(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    multiply(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    divided(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    map(callbackFn: callbackMapFnType): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    product(valueObject: BaseValueObject, callbackFn: callbackProductFnType): CalculateValueType {
        return callbackFn(this, valueObject);
    }

    compare(valueObject: BaseValueObject, operator: compareToken): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    concatenateFront(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    concatenateBack(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    plusBy(value: string | number | boolean): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    minusBy(value: string | number | boolean): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    multiplyBy(value: string | number | boolean): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    dividedBy(value: string | number | boolean): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    compareBy(value: string | number | boolean, operator: compareToken): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    concatenate(value: string | number | boolean, concatenateType = ConcatenateType.FRONT): string {
        let currentValue = this.getValue().toString();
        if (typeof value === 'string') {
            if (concatenateType === ConcatenateType.FRONT) {
                currentValue = value + currentValue;
            } else {
                currentValue += value;
            }
        } else if (typeof value === 'number') {
            if (concatenateType === ConcatenateType.FRONT) {
                currentValue = value.toString() + currentValue;
            } else {
                currentValue += value.toString();
            }
        } else if (typeof value === 'boolean') {
            const booleanString = value ? 'TRUE' : 'FALSE';
            if (concatenateType === ConcatenateType.FRONT) {
                currentValue = booleanString + currentValue;
            } else {
                currentValue += booleanString;
            }
        }

        return currentValue;
    }
}
