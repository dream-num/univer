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

import type { CustomData, Nullable } from '@univerjs/core';
import { FormulaAstLRU } from '../../basics/cache-lru';
import { ConcatenateType } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import { ObjectClassType } from '../../basics/object-class-type';
import { compareToken } from '../../basics/token';

export type callbackMapFnType = (currentValue: BaseValueObject, row: number, column: number) => BaseValueObject;

export interface IArrayValueObject {
    calculateValueList: Nullable<BaseValueObject>[][];
    rowCount: number;
    columnCount: number;
    unitId: string;
    sheetId: string;
    row: number;
    column: number;
}
export class BaseValueObject extends ObjectClassType {
    private _customData: CustomData;

    constructor(private _rawValue: string | number | boolean) {
        super();
    }

    override isValueObject() {
        return true;
    }

    toUnitRange() {
        return {
            range: {
                startColumn: -1,
                startRow: -1,
                endRow: -1,
                endColumn: -1,
            },
            sheetId: '',
            unitId: '',
        };
    }

    getValue(): string | number | boolean {
        /** abstract */
        return 0;
    }

    getArrayValue(): Nullable<BaseValueObject>[][] {
        /** abstract */
        return [];
    }

    setValue(value: string | number | boolean) {
        /** abstract */
    }

    setArrayValue(value: BaseValueObject[][]) {
        /** abstract */
    }

    withCustomData(data: CustomData) {
        this._customData = data;
        return this;
    }

    getCustomData() {
        return this._customData;
    }

    isCube() {
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

    isLambda() {
        return false;
    }

    override isError() {
        return false;
    }

    isNull() {
        return false;
    }

    sum(): BaseValueObject {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    max(): BaseValueObject {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    min(): BaseValueObject {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    count(): BaseValueObject {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    countA(): BaseValueObject {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    countBlank(): BaseValueObject {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    getNegative(): BaseValueObject {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    getReciprocal(): BaseValueObject {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    plus(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    minus(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    multiply(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    divided(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    mod(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    /**
     * return every value in the array after the callback function, excluding the error value
     * @param callbackFn
     * @returns
     */
    map(callbackFn: callbackMapFnType): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    /**
     * return every value in the array after the callback function
     * @param callbackFn
     * @returns
     */
    mapValue(callbackFn: callbackMapFnType): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    compare(valueObject: BaseValueObject, operator: compareToken, isCaseSensitive: boolean = false): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    isEqual(valueObject: BaseValueObject): BaseValueObject {
        return this.compare(valueObject as BaseValueObject, compareToken.EQUALS);
    }

    isNotEqual(valueObject: BaseValueObject): BaseValueObject {
        return this.compare(valueObject as BaseValueObject, compareToken.NOT_EQUAL);
    }

    isGreaterThanOrEqual(valueObject: BaseValueObject): BaseValueObject {
        return this.compare(valueObject as BaseValueObject, compareToken.GREATER_THAN_OR_EQUAL);
    }

    isLessThanOrEqual(valueObject: BaseValueObject): BaseValueObject {
        return this.compare(valueObject as BaseValueObject, compareToken.LESS_THAN_OR_EQUAL);
    }

    isLessThan(valueObject: BaseValueObject): BaseValueObject {
        return this.compare(valueObject as BaseValueObject, compareToken.LESS_THAN);
    }

    isGreaterThan(valueObject: BaseValueObject): BaseValueObject {
        return this.compare(valueObject as BaseValueObject, compareToken.GREATER_THAN);
    }

    concatenateFront(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    concatenateBack(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.NAME);
    }

    plusBy(value: string | number | boolean): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    minusBy(value: string | number | boolean): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    multiplyBy(value: string | number | boolean): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    dividedBy(value: string | number | boolean): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    modInverse(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    compareBy(value: string | number | boolean, operator: compareToken): BaseValueObject {
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

    pow(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    powInverse(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    sqrt(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    cbrt(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    cos(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    cosh(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    acos(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    acosh(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    sin(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    sinh(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    asin(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    asinh(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    tan(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    tanh(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    atan(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    atan2(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    atan2Inverse(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    atanh(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    /**
     * Calculate the mean of the entire array.
     *
     * reference https://numpy.org/doc/stable/reference/generated/numpy.mean.html#numpy.mean
     *
     */
    mean(): BaseValueObject {
        /** abstract */
        return this;
    }

    /**
     * Calculate the median of the entire array.
     *
     * reference https://numpy.org/doc/stable/reference/generated/numpy.median.html
     *
     */
    median(): BaseValueObject {
        /** abstract */
        return this;
    }

    /**
     * Calculate the variance of the entire array.
     *
     * reference https://numpy.org/doc/stable/reference/generated/numpy.var.html
     */
    var(): BaseValueObject {
        /** abstract */
        return this;
    }

    /**
     * Calculate the standard deviation of the entire array.
     *
     * reference https://numpy.org/doc/stable/reference/generated/numpy.std.html
     */
    std(): BaseValueObject {
        /** abstract */
        return this;
    }

    log(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    log10(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    exp(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    abs(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    round(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    roundInverse(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    floor(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    floorInverse(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    ceil(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    ceilInverse(valueObject: BaseValueObject): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    convertToNumberObjectValue(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    convertToBooleanObjectValue(): BaseValueObject {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }
}

const Error_CACHE_LRU_COUNT = 1000;

export const ErrorValueObjectCache = new FormulaAstLRU<ErrorValueObject>(Error_CACHE_LRU_COUNT);
export class ErrorValueObject extends BaseValueObject {
    static create(errorType: ErrorType, errorContent: string = '') {
        const key = `${errorType}-${errorContent}`;
        const cached = ErrorValueObjectCache.get(key);
        if (cached) {
            return cached;
        }
        const instance = new ErrorValueObject(errorType, errorContent);
        ErrorValueObjectCache.set(key, instance);
        return instance;
    }

    constructor(
        private _errorType: ErrorType,
        private _errorContent: string = ''
    ) {
        super(_errorType);
    }

    override getValue() {
        return this._errorType;
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

    override isError() {
        return true;
    }
}
