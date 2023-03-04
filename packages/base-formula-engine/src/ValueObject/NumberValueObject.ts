import { reverseCompareOperator } from '../Basics/Calculate';
import { CalculateValueType, ConcatenateType } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { compareToken } from '../Basics/Token';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseValueObject } from './BaseValueObject';
import { BooleanValueObject } from './BooleanValueObject';

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

    getValue() {
        return this._value;
    }

    setValue(value: number) {
        this._value = value;
    }

    isNumber() {
        return true;
    }

    getNegative(): CalculateValueType {
        return new NumberValueObject(0).minus(this);
    }

    getReciprocal(): CalculateValueType {
        return new NumberValueObject(1).divided(this);
    }

    plus(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            return valueObject.plus(this);
        }
        return this.plusBy(valueObject.getValue());
    }

    equalZero() {
        return this._value === 0;
    }

    minus(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            const o = valueObject.getNegative();
            if (o.isErrorObject()) {
                return o;
            }
            return (o as BaseValueObject).plus(this);
        }
        return this.minusBy(valueObject.getValue());
    }

    multiply(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            return valueObject.multiply(this);
        }
        return this.multiplyBy(valueObject.getValue());
    }

    divided(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            const o = valueObject.getReciprocal();
            if (o.isErrorObject()) {
                return o;
            }
            return (o as BaseValueObject).multiply(this);
        }
        return this.dividedBy(valueObject.getValue());
    }

    concatenateFront(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            return valueObject.concatenateBack(this);
        }
        return this.concatenate(valueObject.getValue(), ConcatenateType.FRONT);
    }

    concatenateBack(valueObject: BaseValueObject): CalculateValueType {
        if (valueObject.isArray()) {
            return valueObject.concatenateFront(this);
        }
        return this.concatenate(valueObject.getValue(), ConcatenateType.BACK);
    }

    compare(valueObject: BaseValueObject, operator: compareToken): CalculateValueType {
        if (valueObject.isArray()) {
            const o = valueObject.getReciprocal();
            if (o.isErrorObject()) {
                return o;
            }
            return (o as BaseValueObject).compare(this, reverseCompareOperator(operator));
        }
        return this.compareBy(valueObject.getValue(), operator);
    }

    plusBy(value: string | number | boolean): CalculateValueType {
        let currentValue = this.getValue();
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

    minusBy(value: string | number | boolean): CalculateValueType {
        let currentValue = this.getValue();
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

    multiplyBy(value: string | number | boolean): CalculateValueType {
        let currentValue = this.getValue();
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

    dividedBy(value: string | number | boolean): CalculateValueType {
        let currentValue = this.getValue();
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

    compareBy(value: string | number | boolean, operator: compareToken): CalculateValueType {
        let currentValue = this.getValue();
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
