import { reverseCompareOperator } from '../basics/calculate';
import { BooleanValue, ConcatenateType } from '../basics/common';
import { ErrorType } from '../basics/error-type';
import { compareToken } from '../basics/token';
import { ErrorValueObject } from '../other-object/error-value-object';
import { BaseValueObject, CalculateValueType } from './base-value-object';

export class NullValueObject extends BaseValueObject {
    override isNull(): boolean {
        return true;
    }

    override plus(valueObject: BaseValueObject): CalculateValueType {
        return new NumberValueObject(0, true).plus(valueObject);
    }

    override minus(valueObject: BaseValueObject): CalculateValueType {
        return new NumberValueObject(0, true).minus(valueObject);
    }

    override multiply(valueObject: BaseValueObject): CalculateValueType {
        return new NumberValueObject(0, true).multiply(valueObject);
    }

    override divided(valueObject: BaseValueObject): CalculateValueType {
        return new NumberValueObject(0, true).divided(valueObject);
    }

    override compare(valueObject: BaseValueObject, operator: compareToken): CalculateValueType {
        if (valueObject.isString()) {
            return new StringValueObject('').compare(valueObject, operator);
        }
        if (valueObject.isBoolean()) {
            return new BooleanValueObject(false).compare(valueObject, operator);
        }
        return new NumberValueObject(0, true).compare(valueObject, operator);
    }

    override concatenateFront(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            return valueObject.concatenateBack(new StringValueObject(''));
        }
        return new StringValueObject('').concatenate(valueObject.getValue(), ConcatenateType.FRONT);
    }

    override concatenateBack(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            return valueObject.concatenateFront(new StringValueObject(''));
        }
        return new StringValueObject('').concatenate(valueObject.getValue(), ConcatenateType.BACK);
    }

    override plusBy(value: string | number | boolean): CalculateValueType {
        return new NumberValueObject(0).plusBy(value);
    }

    override minusBy(value: string | number | boolean): CalculateValueType {
        return new NumberValueObject(0).minusBy(value);
    }

    override multiplyBy(value: string | number | boolean): CalculateValueType {
        return new NumberValueObject(0).multiplyBy(value);
    }

    override dividedBy(value: string | number | boolean): CalculateValueType {
        return new NumberValueObject(0).dividedBy(value);
    }

    override compareBy(value: string | number | boolean, operator: compareToken): CalculateValueType {
        if (typeof value === 'string') {
            return new StringValueObject('').compareBy(value, operator);
        }
        if (typeof value === 'boolean') {
            return new BooleanValueObject(false).compareBy(value, operator);
        }
        return new NumberValueObject(0, true).compareBy(value, operator);
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

    override getNegative(): CalculateValueType {
        const currentValue = this.getValue();
        let result = 0;
        if (currentValue) {
            result = 1;
        }
        return new NumberValueObject(-result, true);
    }

    override getReciprocal(): CalculateValueType {
        const currentValue = this.getValue();
        if (currentValue) {
            return new NumberValueObject(1, true);
        }
        return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
    }

    override plus(valueObject: BaseValueObject): CalculateValueType {
        return this._convertTonNumber().plus(valueObject);
    }

    override minus(valueObject: BaseValueObject): CalculateValueType {
        return this._convertTonNumber().minus(valueObject);
    }

    override multiply(valueObject: BaseValueObject): CalculateValueType {
        return this._convertTonNumber().multiply(valueObject);
    }

    override divided(valueObject: BaseValueObject): CalculateValueType {
        return this._convertTonNumber().divided(valueObject);
    }

    override compare(valueObject: BaseValueObject, operator: compareToken): CalculateValueType {
        return this._convertTonNumber().compare(valueObject, operator);
    }

    override concatenateFront(valueObject: BaseValueObject): CalculateValueType {
        return this._convertTonNumber().concatenateFront(valueObject);
    }

    override concatenateBack(valueObject: BaseValueObject): CalculateValueType {
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

    override getNegative(): CalculateValueType {
        return new NumberValueObject(0).minus(this);
    }

    override getReciprocal(): CalculateValueType {
        return new NumberValueObject(1).divided(this);
    }

    override plus(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            return valueObject.plus(this);
        }
        return this.plusBy(valueObject.getValue());
    }

    equalZero() {
        return this._value === 0;
    }

    override minus(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            const o = valueObject.getNegative();
            if (o.isErrorObject()) {
                return o;
            }
            return (o as BaseValueObject).plus(this);
        }
        return this.minusBy(valueObject.getValue());
    }

    override multiply(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            return valueObject.multiply(this);
        }
        return this.multiplyBy(valueObject.getValue());
    }

    override divided(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            const o = valueObject.getReciprocal();
            if (o.isErrorObject()) {
                return o;
            }
            return (o as BaseValueObject).multiply(this);
        }
        return this.dividedBy(valueObject.getValue());
    }

    override concatenateFront(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            return valueObject.concatenateBack(this);
        }
        return this.concatenate(valueObject.getValue(), ConcatenateType.FRONT);
    }

    override concatenateBack(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            return valueObject.concatenateFront(this);
        }
        return this.concatenate(valueObject.getValue(), ConcatenateType.BACK);
    }

    override compare(valueObject: BaseValueObject, operator: compareToken): CalculateValueType {
        if (valueObject.isArray()) {
            const o = valueObject.getReciprocal();
            if (o.isErrorObject()) {
                return o;
            }
            return (o as BaseValueObject).compare(this, reverseCompareOperator(operator));
        }
        return this.compareBy(valueObject.getValue(), operator);
    }

    override plusBy(value: string | number | boolean): CalculateValueType {
        const currentValue = this.getValue();
        if (typeof value === 'string') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            this.setValue(currentValue + value);
        } else if (typeof value === 'boolean') {
            this.setValue(currentValue + (value ? 1 : 0));
        }
        return this;
    }

    override minusBy(value: string | number | boolean): CalculateValueType {
        const currentValue = this.getValue();
        if (typeof value === 'string') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            this.setValue(currentValue - value);
        } else if (typeof value === 'boolean') {
            this.setValue(currentValue - (value ? 1 : 0));
        }
        return this;
    }

    override multiplyBy(value: string | number | boolean): CalculateValueType {
        const currentValue = this.getValue();
        if (typeof value === 'string') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            this.setValue(currentValue * value);
        } else if (typeof value === 'boolean') {
            this.setValue(currentValue * (value ? 1 : 0));
        }
        return this;
    }

    override dividedBy(value: string | number | boolean): CalculateValueType {
        const currentValue = this.getValue();
        if (typeof value === 'string') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (typeof value === 'number') {
            if (value === 0) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }
            this.setValue(currentValue / value);
        } else if (typeof value === 'boolean') {
            if (value === false) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }
            this.setValue(currentValue / 1);
        }
        return this;
    }

    override compareBy(value: string | number | boolean, operator: compareToken): CalculateValueType {
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

    override concatenateFront(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            return valueObject.concatenateBack(this);
        }
        return this.concatenate(valueObject.getValue(), ConcatenateType.FRONT);
    }

    override concatenateBack(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            return valueObject.concatenateFront(this);
        }
        return this.concatenate(valueObject.getValue(), ConcatenateType.BACK);
    }

    override compare(valueObject: BaseValueObject, operator: compareToken): CalculateValueType {
        if (valueObject.isArray()) {
            const o = valueObject.getReciprocal();
            if (o.isErrorObject()) {
                return o;
            }
            return (o as BaseValueObject).compare(this, reverseCompareOperator(operator));
        }
        return this.compareBy(valueObject.getValue(), operator);
    }

    override compareBy(value: string | number | boolean, operator: compareToken): CalculateValueType {
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
}
