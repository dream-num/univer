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
import { ERROR_TYPE_SET, ErrorType } from '../../basics/error-type';
import { compareToken } from '../../basics/token';
import { compareWithWildcard, isWildcard } from '../utils/compare';
import { ceil, floor, mod, pow, round } from '../utils/math-kit';
import { BaseValueObject, ErrorValueObject } from './base-value-object';

export type PrimitiveValueType = string | boolean | number | null;

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

    override mod(valueObject: BaseValueObject): BaseValueObject {
        return new NumberValueObject(0, true).mod(valueObject);
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
        return new NumberValueObject(0, true).sqrt();
    }

    override cbrt(): BaseValueObject {
        return new NumberValueObject(0, true).cbrt();
    }

    override cos(): BaseValueObject {
        return new NumberValueObject(0, true).cos();
    }

    override acos(): BaseValueObject {
        return new NumberValueObject(0, true).acos();
    }

    override acosh(): BaseValueObject {
        return new NumberValueObject(0, true).acosh();
    }

    override sin(): BaseValueObject {
        return new NumberValueObject(0, true).sin();
    }

    override asin(): BaseValueObject {
        return new NumberValueObject(0, true).asin();
    }

    override asinh(): BaseValueObject {
        return new NumberValueObject(0, true).asinh();
    }

    override tan(): BaseValueObject {
        return new NumberValueObject(0, true).tan();
    }

    override tanh(): BaseValueObject {
        return new NumberValueObject(0, true).tanh();
    }

    override atan(): BaseValueObject {
        return new NumberValueObject(0, true).atan();
    }

    override atan2(valueObject: BaseValueObject): BaseValueObject {
        return new NumberValueObject(0, true).atan2(valueObject);
    }

    override atanh(): BaseValueObject {
        return new NumberValueObject(0, true).atanh();
    }

    override log(): BaseValueObject {
        return new ErrorValueObject(ErrorType.NUM);
    }

    override log10(): BaseValueObject {
        return new ErrorValueObject(ErrorType.NUM);
    }

    override exp(): BaseValueObject {
        return new NumberValueObject(0, true).exp();
    }

    override abs(): BaseValueObject {
        return new NumberValueObject(0, true).abs();
    }

    override round(valueObject: BaseValueObject): BaseValueObject {
        return new NumberValueObject(0, true).round(valueObject);
    }

    override floor(valueObject: BaseValueObject): BaseValueObject {
        return new NumberValueObject(0, true).floor(valueObject);
    }

    override ceil(valueObject: BaseValueObject): BaseValueObject {
        return new NumberValueObject(0, true).ceil(valueObject);
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
        return new ErrorValueObject(ErrorType.DIV_BY_ZERO);
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

    override mod(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().mod(valueObject);
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
        return this._convertTonNumber().sqrt();
    }

    override cbrt(): BaseValueObject {
        return this._convertTonNumber().cbrt();
    }

    override cos(): BaseValueObject {
        return this._convertTonNumber().cos();
    }

    override acos(): BaseValueObject {
        return this._convertTonNumber().acos();
    }

    override acosh(): BaseValueObject {
        return this._convertTonNumber().acosh();
    }

    override sin(): BaseValueObject {
        return this._convertTonNumber().sin();
    }

    override asin(): BaseValueObject {
        return this._convertTonNumber().asin();
    }

    override asinh(): BaseValueObject {
        return this._convertTonNumber().asinh();
    }

    override tan(): BaseValueObject {
        return this._convertTonNumber().tan();
    }

    override tanh(): BaseValueObject {
        return this._convertTonNumber().tanh();
    }

    override atan(): BaseValueObject {
        return this._convertTonNumber().atan();
    }

    override atan2(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().atan2(valueObject);
    }

    override atanh(): BaseValueObject {
        return this._convertTonNumber().atanh();
    }

    override log(): BaseValueObject {
        return this._convertTonNumber().log();
    }

    override log10(): BaseValueObject {
        return this._convertTonNumber().log10();
    }

    override exp(): BaseValueObject {
        return this._convertTonNumber().exp();
    }

    override abs(): BaseValueObject {
        return this._convertTonNumber().abs();
    }

    override round(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().round(valueObject);
    }

    override floor(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().floor(valueObject);
    }

    override ceil(valueObject: BaseValueObject): BaseValueObject {
        return this._convertTonNumber().ceil(valueObject);
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

        // = 1 + #NAME? gets #NAME?, = 1 + #VALUE! gets #VALUE!
        if (object.isError()) {
            return object;
        }

        // Set number format
        object.setPattern(this.getPattern() || valueObject.getPattern());

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

        // Set number format
        object.setPattern(this.getPattern() || valueObject.getPattern());

        return object;
    }

    override multiply(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.multiply(this);
        }
        const object = this.multiplyBy(valueObject.getValue());

        // Set number format
        object.setPattern(this.getPattern() || valueObject.getPattern());

        return object;
    }

    override divided(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            const o = valueObject.getReciprocal();
            if (o.isError()) {
                return o;
            }
            return (o as BaseValueObject).multiply(this);
        }
        const object = this.dividedBy(valueObject.getValue());

        // Set number format
        object.setPattern(this.getPattern() || valueObject.getPattern());

        return object;
    }

    override mod(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.modInverse(this);
        }

        const currentValue = this.getValue();
        const value = valueObject.getValue();

        if (valueObject.isNull()) {
            return new ErrorValueObject(ErrorType.DIV_BY_ZERO);
        }

        if (typeof value === 'string') {
            return new ErrorValueObject(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (value === 0) {
                return new ErrorValueObject(ErrorType.DIV_BY_ZERO);
            }

            if (!Number.isFinite(currentValue) || !Number.isFinite(value)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            const result = mod(currentValue, value);

            if (!Number.isFinite(result)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            return new NumberValueObject(result);
        }
        if (typeof value === 'boolean') {
            const booleanValue = value ? 1 : 0;

            if (booleanValue === 0) {
                return new ErrorValueObject(ErrorType.DIV_BY_ZERO);
            }

            return new NumberValueObject(mod(currentValue, booleanValue));
        }

        return this;
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
            return valueObject.compare(this, reverseCompareOperator(operator));
        }
        return this.compareBy(valueObject.getValue(), operator);
    }

    override plusBy(value: string | number | boolean): BaseValueObject {
        const currentValue = this.getValue();
        if (typeof value === 'string') {
            // = 1 + #NAME? gets #NAME?, = 1 + #VALUE! gets #VALUE!
            if (ERROR_TYPE_SET.has(value as ErrorType)) {
                return new ErrorValueObject(value as ErrorType);
            }
            return new ErrorValueObject(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (!Number.isFinite(currentValue) || !Number.isFinite(value)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            const result = Big(currentValue).plus(value).toNumber();

            if (!Number.isFinite(result)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            return new NumberValueObject(result);
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
            return new ErrorValueObject(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (!Number.isFinite(currentValue) || !Number.isFinite(value)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            const result = Big(currentValue).minus(value).toNumber();

            if (!Number.isFinite(result)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            return new NumberValueObject(result);
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
            return new ErrorValueObject(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (!Number.isFinite(currentValue) || !Number.isFinite(value)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            const result = Big(currentValue).times(value).toNumber();

            if (!Number.isFinite(result)) {
                return new ErrorValueObject(ErrorType.NUM);
            }
            return new NumberValueObject(result);
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
            return new ErrorValueObject(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (value === 0) {
                return new ErrorValueObject(ErrorType.DIV_BY_ZERO);
            }
            if (!Number.isFinite(currentValue) || !Number.isFinite(value)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            const result = Big(currentValue).div(value).toNumber();

            if (!Number.isFinite(result)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            return new NumberValueObject(result);
        }
        if (typeof value === 'boolean') {
            if (value === false) {
                return new ErrorValueObject(ErrorType.DIV_BY_ZERO);
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
            if (!Number.isFinite(currentValue) || !Number.isFinite(value)) {
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
            return new ErrorValueObject(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (!Number.isFinite(currentValue) || !Number.isFinite(value)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            const result = pow(currentValue, value);

            if (!Number.isFinite(result)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            return new NumberValueObject(result);
        }
        if (typeof value === 'boolean') {
            return new NumberValueObject(pow(currentValue, value ? 1 : 0));
        }

        return this;
    }

    override sqrt(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Big(currentValue).sqrt().toNumber();

        if (!Number.isFinite(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override cbrt(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.cbrt(currentValue);

        if (!Number.isFinite(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override cos(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.cos(currentValue);

        if (!Number.isFinite(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override acos(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.acos(currentValue);

        if (Number.isNaN(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override acosh(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.acosh(currentValue);

        if (Number.isNaN(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override sin(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.sin(currentValue);

        if (!Number.isFinite(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override asin(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.asin(currentValue);

        if (Number.isNaN(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override asinh(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.asinh(currentValue);

        if (Number.isNaN(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override tan(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.tan(currentValue);

        if (!Number.isFinite(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override tanh(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.tanh(currentValue);

        if (!Number.isFinite(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override atan(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.atan(currentValue);

        if (!Number.isFinite(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override atan2(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.atan2Inverse(this);
        }

        const currentValue = this.getValue();
        const value = valueObject.getValue();

        if (typeof value === 'string') {
            return new ErrorValueObject(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (!Number.isFinite(currentValue) || !Number.isFinite(value)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            const result = Math.atan2(currentValue, value);

            if (!Number.isFinite(result)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            return new NumberValueObject(result);
        }
        if (typeof value === 'boolean') {
            return new NumberValueObject(Math.atan2(currentValue, value ? 1 : 0));
        }

        return this;
    }

    override atanh(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.atanh(currentValue);

        if (!Number.isFinite(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override log(): BaseValueObject {
        const currentValue = this.getValue();

        if (typeof currentValue === 'number' && currentValue <= 0) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.log(currentValue);

        if (!Number.isFinite(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override log10(): BaseValueObject {
        const currentValue = this.getValue();

        if (typeof currentValue === 'number' && currentValue <= 0) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.log10(currentValue);

        if (!Number.isFinite(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override exp(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.exp(currentValue);

        if (!Number.isFinite(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override abs(): BaseValueObject {
        const currentValue = this.getValue();

        if (!Number.isFinite(currentValue)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        const result = Math.abs(currentValue);

        if (!Number.isFinite(result)) {
            return new ErrorValueObject(ErrorType.NUM);
        }

        return new NumberValueObject(result);
    }

    override round(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.roundInverse(this);
        }

        const currentValue = this.getValue();
        const value = valueObject.getValue();

        if (typeof value === 'string') {
            return new ErrorValueObject(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (!Number.isFinite(currentValue) || !Number.isFinite(value)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            const result = round(currentValue, value);

            if (!Number.isFinite(result)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            return new NumberValueObject(result);
        }
        if (typeof value === 'boolean') {
            return new NumberValueObject(round(currentValue, value ? 1 : 0));
        }

        return this;
    }

    override floor(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.floorInverse(this);
        }

        const currentValue = this.getValue();
        const value = valueObject.getValue();

        if (typeof value === 'string') {
            return new ErrorValueObject(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (!Number.isFinite(currentValue) || !Number.isFinite(value)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            const result = floor(currentValue, value);

            if (!Number.isFinite(result)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            return new NumberValueObject(result);
        }
        if (typeof value === 'boolean') {
            return new NumberValueObject(floor(currentValue, value ? 1 : 0));
        }

        return this;
    }

    override ceil(valueObject: BaseValueObject): BaseValueObject {
        if (valueObject.isArray()) {
            return valueObject.ceilInverse(this);
        }

        const currentValue = this.getValue();
        const value = valueObject.getValue();

        if (typeof value === 'string') {
            return new ErrorValueObject(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (!Number.isFinite(currentValue) || !Number.isFinite(value)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            const result = ceil(currentValue, value);

            if (!Number.isFinite(result)) {
                return new ErrorValueObject(ErrorType.NUM);
            }

            return new NumberValueObject(result);
        }
        if (typeof value === 'boolean') {
            return new NumberValueObject(ceil(currentValue, value ? 1 : 0));
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
            return valueObject.compare(this, reverseCompareOperator(operator));
        }
        return this.compareBy(valueObject.getValue(), operator);
    }

    override compareBy(value: string | number | boolean, operator: compareToken): BaseValueObject {
        const currentValue = this.getValue();
        let result = false;
        if (typeof value === 'string') {
            if (isWildcard(value)) {
                return this._checkWildcard(value, operator);
            }

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
                case compareToken.NOT_EQUAL:
                case compareToken.GREATER_THAN:
                case compareToken.GREATER_THAN_OR_EQUAL:
                    result = true;
                    break;

                case compareToken.EQUALS:
                case compareToken.LESS_THAN:
                case compareToken.LESS_THAN_OR_EQUAL:
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
