import { reverseCompareOperator } from '../Basics/Calculate';
import { CalculateValueType, ConcatenateType } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { compareToken } from '../Basics/Token';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseValueObject } from './BaseValueObject';
import { BooleanValueObject } from './BooleanValueObject';

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

    getValue() {
        return this._value;
    }

    isString() {
        return true;
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

    compareBy(value: string | number | boolean, operator: compareToken): CalculateValueType {
        let currentValue = this.getValue();
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
