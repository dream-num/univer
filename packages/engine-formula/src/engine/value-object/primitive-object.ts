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

import Big from 'big.js';

import { reverseCompareOperator } from '../../basics/calculate';
import { BooleanValue, ConcatenateType } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import { compareToken } from '../../basics/token';
import { compareWithWildcard } from '../utils/compare';
import { round } from '../utils/math-kit';
import { BaseValueObject, ErrorValueObject } from './base-value-object';

export class NullValueObject extends BaseValueObject {
    override isNull(): boolean {
        return true;
    }

    override plus(valueObject: BaseValueObject): BaseValueObject {
        return new NumberValueObject(0, true).plus(valueObject);
    }

    override minus(valueObject: BaseValueObject): BaseValueObject {
        return new NumberValueObject(0, true).minus(valueObject);
    }

    override multiply(valueObject: BaseValueObject): BaseValueObject {
        return new NumberValueObject(0, true).multiply(valueObject);
    }

    override divided(valueObject: BaseValueObject): BaseValueObject {
        return new NumberValueObject(0, true).divided(valueObject);
    }

    override compare(valueObject: BaseValueObject, operator: compareToken): BaseValueObject {
        if (valueObject.isString()) {
            return new StringValueObject('').compare(valueObject, operator);
        }
        if (valueObject.isBoolean()) {
            return new BooleanValueObject(false).compare(valueObject, operator);
        }
        return new NumberValueObject(0, true).compare(valueObject, operator);
    }

    override concatenateFront(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.concatenateBack(new StringValueObject(''));
        }
        return new StringValueObject(this.concatenate(valueObject.getValue(), ConcatenateType.FRONT));
    }

    override concatenateBack(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.concatenateFront(new StringValueObject(''));
        }
        return new StringValueObject(this.concatenate(valueObject.getValue(), ConcatenateType.BACK));
    }

    override plusBy(value: string | number | boolean): BaseValueObject {
        return new NumberValueObject(0).plusBy(value);
    }

    override minusBy(value: string | number | boolean): BaseValueObject {
        return new NumberValueObject(0).minusBy(value);
    }

    override multiplyBy(value: string | number | boolean): BaseValueObject {
        return new NumberValueObject(0).multiplyBy(value);
    }

    override dividedBy(value: string | number | boolean): BaseValueObject {
        return new NumberValueObject(0).dividedBy(value);
    }

    override compareBy(value: string | number | boolean, operator: compareToken): BaseValueObject {
        if (typeof value === 'string') {
            return new StringValueObject('').compareBy(value, operator);
        }
        if (typeof value === 'boolean') {
            return new BooleanValueObject(false).compareBy(value, operator);
        }
        return new NumberValueObject(0, true).compareBy(value, operator);
    }

    override pow(valueObject: BaseValueObject): BaseValueObject {
        return new NumberValueObject(0, true).pow(valueObject);
    }

    override sqrt(): BaseValueObject {
        return new NumberValueObject(0, true);
    }

    override sin(): BaseValueObject {
        return new NumberValueObject(0, true);
    }

    override round(valueObject: BaseValueObject): BaseValueObject {
        return new NumberValueObject(0, true).round(valueObject);
    }
}

export class BooleanValueObject extends BaseValueObject {
    private _value: boolean = false;

    constructor(rawValue: string | number | boolean, isForce = false) {
        super(rawValue);
        if (isForce) {
            this._value = rawValue as boolean;
            return;
        }

        if (typeof rawValue === 'boolean') {
            this._value = rawValue;
        } else if (typeof rawValue === 'string') {
            const rawValueUpper = rawValue.toLocaleUpperCase();
            if (rawValueUpper === BooleanValue.TRUE) {
                this._value = true;
            } else if (rawValueUpper === BooleanValue.FALSE) {
                this._value = false;
            }
        } else {
            if (rawValue === 1) {
                this._value = true;
            } else {
                this._value = false;
            }
        }
    }

    override getValue() {
        return this._value;
    }

    override isBoolean() {
        return true;
    }

    override getNegative(): BaseValueObject {
        const currentValue = this.getValue();
        let result = 0;
        if (currentValue) {
            result = 1;
        }
        return new NumberValueObject(-result, true);
    }

    override getReciprocal(): BaseValueObject {
        const currentValue = this.getValue();
        if (currentValue) {
            return new NumberValueObject(1, true);
        }
        return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
    }

    override plus(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().plus(valueObject);
    }

    override minus(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().minus(valueObject);
    }

    override multiply(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().multiply(valueObject);
    }

    override divided(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().divided(valueObject);
    }

    override compare(valueObject: BaseValueObject, operator: compareToken): BaseValueObject {
        return this._convertTonNumber().compare(valueObject, operator);
    }

    override concatenateFront(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().concatenateFront(valueObject);
    }

    override concatenateBack(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().concatenateBack(valueObject);
    }

    private _convertTonNumber() {
        const currentValue = this.getValue();
        let result = 0;
        if (currentValue) {
            result = 1;
        }
        return new NumberValueObject(result, true);
    }

    override pow(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().pow(valueObject);
    }

    override sqrt(): BaseValueObject {
        return this._convertTonNumber();
    }

    override sin(): BaseValueObject {
        return this._convertTonNumber().sin();
    }

    override round(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().round(valueObject);
    }
}

export class NumberValueObject extends BaseValueObject {
    private _value: number = 0;

    constructor(rawValue: string | number | boolean, isForce = false) {
        super(rawValue);
        if (isForce) {
            this._value = rawValue as number;
            return;
        }
        this._value = Number(rawValue);
    }

    override getValue() {
        return this._value;
    }

    override setValue(value: number) {
        this._value = value;
    }

    override isNumber() {
        return true;
    }

    override getNegative(): BaseValueObject {
        return new NumberValueObject(0).minus(this);
    }

    override getReciprocal(): BaseValueObject {
        return new NumberValueObject(1).divided(this);
    }

    override plus(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.plus(this);
        }
        const object = this.plusBy(valueObject.getValue());
        if (object.isError()) {
            return this;
        }

        return object;
    }

    equalZero() {
        return this._value === 0;
    }

    override minus(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            const o = valueObject.getNegative();
            if (o.isError()) {
                return o;
            }
            return (o as BaseValueObject).plus(this);
        }
        const object = this.minusBy(valueObject.getValue());
        if (object.isError()) {
            return this;
        }

        return object;
    }

    override multiply(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.multiply(this);
        }
        return this.multiplyBy(valueObject.getValue());
    }

    override divided(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            const o = valueObject.getReciprocal();
            if (o.isError()) {
                return o;
            }
            return (o as BaseValueObject).multiply(this);
        }
        return this.dividedBy(valueObject.getValue());
    }

    override concatenateFront(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.concatenateBack(this);
        }
        return new StringValueObject(this.concatenate(valueObject.getValue(), ConcatenateType.FRONT));
    }

    override concatenateBack(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.concatenateFront(this);
        }
        return new StringValueObject(this.concatenate(valueObject.getValue(), ConcatenateType.BACK));
    }

    override compare(valueObject: BaseValueObject, operator: compareToken): BaseValueObject {
        if (valueObject.isArray()) {
            return (valueObject as BaseValueObject).compare(this, reverseCompareOperator(operator));
        }
        return this.compareBy(valueObject.getValue(), operator);
    }

    override plusBy(value: string | number | boolean): BaseValueObject {
        const currentValue = this.getValue();
        if (typeof value === 'string') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (Math.abs(currentValue) === Infinity || Math.abs(value) === Infinity) {
                return new NumberValueObject(currentValue + value);
            }
            return new NumberValueObject(Big(currentValue).plus(value).toNumber());
        }
        if (typeof value === 'boolean') {
            return new NumberValueObject(
                Big(currentValue)
                    .plus(value ? 1 : 0)
                    .toNumber()
            );
        }
        return this;
    }

    override minusBy(value: string | number | boolean): BaseValueObject {
        const currentValue = this.getValue();
        if (typeof value === 'string') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (Math.abs(currentValue) === Infinity || Math.abs(value) === Infinity) {
                return new NumberValueObject(currentValue - value);
            }
            return new NumberValueObject(Big(currentValue).minus(value).toNumber());
        }
        if (typeof value === 'boolean') {
            return new NumberValueObject(
                Big(currentValue)
                    .minus(value ? 1 : 0)
                    .toNumber()
            );
        }
        return this;
    }

    override multiplyBy(value: string | number | boolean): BaseValueObject {
        const currentValue = this.getValue();
        if (typeof value === 'string') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (Math.abs(currentValue) === Infinity || Math.abs(value) === Infinity) {
                return new NumberValueObject(currentValue * value);
            }
            return new NumberValueObject(Big(currentValue).times(value).toNumber());
        }
        if (typeof value === 'boolean') {
            return new NumberValueObject(
                Big(currentValue)
                    .times(value ? 1 : 0)
                    .toNumber()
            );
        }
        return this;
    }

    override dividedBy(value: string | number | boolean): BaseValueObject {
        const currentValue = this.getValue();
        if (typeof value === 'string') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (value === 0) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }
            if (Math.abs(currentValue) === Infinity || Math.abs(value) === Infinity) {
                return new NumberValueObject(currentValue / value);
            }
            return new NumberValueObject(Big(currentValue).div(value).toNumber());
        }
        if (typeof value === 'boolean') {
            if (value === false) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }
            return new NumberValueObject(Big(currentValue).div(1).toNumber());
        }
        return this;
    }

    override compareBy(value: string | number | boolean, operator: compareToken): BaseValueObject {
        const currentValue = this.getValue();
        let result = false;
        if (typeof value === 'string') {
            switch (operator) {
                case compareToken.EQUALS:
                case compareToken.GREATER_THAN:
                case compareToken.GREATER_THAN_OR_EQUAL:
                    result = false;
                    break;
                case compareToken.LESS_THAN:
                case compareToken.LESS_THAN_OR_EQUAL:
                case compareToken.NOT_EQUAL:
                    result = true;
                    break;
            }
        } else if (typeof value === 'number') {
            if (Math.abs(currentValue) === Infinity || Math.abs(value) === Infinity) {
                result = this._compareInfinity(currentValue, value, operator);
            } else {
                switch (operator) {
                    case compareToken.EQUALS:
                        result = Big(currentValue).eq(value);
                        break;
                    case compareToken.GREATER_THAN:
                        result = Big(currentValue).gt(value);
                        break;
                    case compareToken.GREATER_THAN_OR_EQUAL:
                        result = Big(currentValue).gte(value);
                        break;
                    case compareToken.LESS_THAN:
                        result = Big(currentValue).lt(value);
                        break;
                    case compareToken.LESS_THAN_OR_EQUAL:
                        result = Big(currentValue).lte(value);
                        break;
                    case compareToken.NOT_EQUAL:
                        result = !Big(currentValue).eq(value);
                        break;
                }
            }
        } else if (typeof value === 'boolean') {
            switch (operator) {
                case compareToken.EQUALS:
                case compareToken.GREATER_THAN:
                case compareToken.GREATER_THAN_OR_EQUAL:
                    result = false;
                    break;
                case compareToken.LESS_THAN:
                case compareToken.LESS_THAN_OR_EQUAL:
                case compareToken.NOT_EQUAL:
                    result = true;
                    break;
            }
        }
        return new BooleanValueObject(result);
    }

    override pow(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.powInverse(this);
        }

        const currentValue = this.getValue();
        const value = valueObject.getValue();

        if (typeof value === 'string') {
            return this;
        }
        if (typeof value === 'number') {
            if (Math.abs(currentValue) === Infinity || Math.abs(value) === Infinity) {
                return new NumberValueObject(Infinity);
            }
            return new NumberValueObject(Big(currentValue).pow(value).toNumber());
        }
        if (typeof value === 'boolean') {
            return new NumberValueObject(
                Big(currentValue)
                    .pow(value ? 1 : 0)
                    .toNumber()
            );
        }

        return this;
    }

    override sqrt(): BaseValueObject {
        const currentValue = this.getValue();

        if (Math.abs(currentValue) === Infinity) {
            return new NumberValueObject(Infinity);
        }
        return new NumberValueObject(Big(currentValue).sqrt().toNumber());
    }

    override sin(): BaseValueObject {
        const currentValue = this.getValue();

        if (Math.abs(currentValue) === Infinity) {
            return new NumberValueObject(Infinity);
        }
        return new NumberValueObject(Math.sin(currentValue));
    }

    override round(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.roundInverse(this);
        }

        const currentValue = this.getValue();
        const value = valueObject.getValue();

        if (typeof value === 'string') {
            return this;
        }
        if (typeof value === 'number') {
            if (Math.abs(currentValue) === Infinity || Math.abs(value) === Infinity) {
                return new NumberValueObject(Infinity);
            }
            return new NumberValueObject(round(currentValue, value));
        }
        if (typeof value === 'boolean') {
            return new NumberValueObject(round(currentValue, value ? 1 : 0));
        }

        return this;
    }

    private _compareInfinity(currentValue: number, value: number, operator: compareToken) {
        let result = false;
        switch (operator) {
            case compareToken.EQUALS:
                result = currentValue === value;
                break;
            case compareToken.GREATER_THAN:
                result = currentValue > value;
                break;
            case compareToken.GREATER_THAN_OR_EQUAL:
                result = currentValue >= value;
                break;
            case compareToken.LESS_THAN:
                result = currentValue < value;
                break;
            case compareToken.LESS_THAN_OR_EQUAL:
                result = currentValue <= value;
                break;
            case compareToken.NOT_EQUAL:
                result = currentValue !== value;
                break;
        }

        return result;
    }
}

export class StringValueObject extends BaseValueObject {
    private _value: string;

    constructor(rawValue: string | number | boolean, isForce = false) {
        super(rawValue);
        if (isForce) {
            this._value = rawValue as string;
            return;
        }
        let value = rawValue.toString();

        if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
            value = value.slice(1, -1);
            value = value.replace(/""/g, '"');
        }

        this._value = value;
    }

    override getValue() {
        return this._value;
    }

    override isString() {
        return true;
    }

    override concatenateFront(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.concatenateBack(this);
        }
        return new StringValueObject(this.concatenate(valueObject.getValue(), ConcatenateType.FRONT));
    }

    override concatenateBack(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.concatenateFront(this);
        }
        return new StringValueObject(this.concatenate(valueObject.getValue(), ConcatenateType.BACK));
    }

    override compare(valueObject: BaseValueObject, operator: compareToken): BaseValueObject {
        if (valueObject.isArray()) {
            // const o = valueObject.getReciprocal();
            // if (o.isError()) {
            //     return o;
            // }
            return (valueObject as BaseValueObject).compare(this, reverseCompareOperator(operator));
        }
        return this.compareBy(valueObject.getValue(), operator);
    }

    override wildcard(valueObject: StringValueObject, operator: compareToken): BaseValueObject {
        if (valueObject.isArray()) {
            // const o = valueObject.getReciprocal();
            // if (o.isError()) {
            //     return o;
            // }
            return valueObject.wildcard(this, reverseCompareOperator(operator));
        }
        return this._checkWildcard(valueObject.getValue(), operator);
    }

    override compareBy(value: string | number | boolean, operator: compareToken): BaseValueObject {
        const currentValue = this.getValue();
        let result = false;
        if (typeof value === 'string') {
            switch (operator) {
                case compareToken.EQUALS:
                    result = currentValue === value;
                    break;
                case compareToken.GREATER_THAN:
                    result = currentValue > value;
                    break;
                case compareToken.GREATER_THAN_OR_EQUAL:
                    result = currentValue >= value;
                    break;
                case compareToken.LESS_THAN:
                    result = currentValue < value;
                    break;
                case compareToken.LESS_THAN_OR_EQUAL:
                    result = currentValue <= value;
                    break;
                case compareToken.NOT_EQUAL:
                    result = currentValue !== value;
                    break;
            }
        } else if (typeof value === 'number') {
            switch (operator) {
                case compareToken.EQUALS:
                case compareToken.GREATER_THAN:
                case compareToken.GREATER_THAN_OR_EQUAL:
                    result = true;
                    break;
                case compareToken.LESS_THAN:
                case compareToken.LESS_THAN_OR_EQUAL:
                case compareToken.NOT_EQUAL:
                    result = false;
                    break;
            }
        } else if (typeof value === 'boolean') {
            switch (operator) {
                case compareToken.EQUALS:
                case compareToken.GREATER_THAN:
                case compareToken.GREATER_THAN_OR_EQUAL:
                    result = false;
                    break;
                case compareToken.LESS_THAN:
                case compareToken.LESS_THAN_OR_EQUAL:
                case compareToken.NOT_EQUAL:
                    result = true;
                    break;
            }
        }
        return new BooleanValueObject(result);
    }

    private _checkWildcard(value: string, operator: compareToken) {
        const currentValue = this.getValue().toLocaleLowerCase();
        const result = compareWithWildcard(currentValue, value, operator);

        return new BooleanValueObject(result);
    }
}
