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
import { compareToken } from '../../basics/token';
import type { StringValueObject } from './primitive-object';

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
        return ErrorValueObject.create(ErrorType.NAME);
    }

    getReciprocal(): CalculateValueType {
        return ErrorValueObject.create(ErrorType.NAME);
    }

    plus(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    minus(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    multiply(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    divided(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    map(callbackFn: callbackMapFnType): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    product(valueObject: BaseValueObject, callbackFn: callbackProductFnType): CalculateValueType {
        return callbackFn(this, valueObject);
    }

    compare(valueObject: BaseValueObject, operator: compareToken): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    wildcard(valueObject: StringValueObject, operator: compareToken): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    isEqual(valueObject: BaseValueObject): CalculateValueType {
        return this.compare(valueObject as BaseValueObject, compareToken.EQUALS);
    }

    isNotEqual(valueObject: BaseValueObject): CalculateValueType {
        return this.compare(valueObject as BaseValueObject, compareToken.NOT_EQUAL);
    }

    isGreaterThanOrEqual(valueObject: BaseValueObject): CalculateValueType {
        return this.compare(valueObject as BaseValueObject, compareToken.GREATER_THAN_OR_EQUAL);
    }

    isLessThanOrEqual(valueObject: BaseValueObject): CalculateValueType {
        return this.compare(valueObject as BaseValueObject, compareToken.LESS_THAN_OR_EQUAL);
    }

    isLessThan(valueObject: BaseValueObject): CalculateValueType {
        return this.compare(valueObject as BaseValueObject, compareToken.LESS_THAN);
    }

    isGreaterThan(valueObject: BaseValueObject): CalculateValueType {
        return this.compare(valueObject as BaseValueObject, compareToken.GREATER_THAN);
    }

    concatenateFront(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    concatenateBack(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    plusBy(value: string | number | boolean): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    minusBy(value: string | number | boolean): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    multiplyBy(value: string | number | boolean): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    dividedBy(value: string | number | boolean): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    compareBy(value: string | number | boolean, operator: compareToken): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
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

    pow(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    powInverse(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    sqrt(): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    sin(): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    mean(): CalculateValueType {
        /** abstract */
        return this;
    }

    median(): CalculateValueType {
        /** abstract */
        return this;
    }
}

export class ErrorValueObject extends BaseValueObject {
    constructor(
        private _errorType: ErrorType,
        private _errorContent: string = ''
    ) {
        super(_errorType);
    }

    static create(errorType: ErrorType, errorContent?: string) {
        const errorValueObject = new ErrorValueObject(errorType, errorContent);
        return errorValueObject;
    }

    getErrorType() {
        return this._errorType;
    }

    getErrorContent() {
        return this._errorContent;
    }

    override isEqualType(object: ObjectClassType) {
        if ((object as ErrorValueObject).getErrorType() === this.getErrorType()) {
            return true;
        }
        return false;
    }

    override isErrorObject() {
        return true;
    }
}
