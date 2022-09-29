import { BooleanValue, CalculateValueType } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { compareToken } from '../Basics/Token';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseValueObject } from './BaseValueObject';
import { NumberValueObject } from './NumberValueObject';
export class BooleanValueObject extends BaseValueObject {
    private _value: boolean;
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

    private _convertTonNumber() {
        const currentValue = this.getValue();
        let result = 0;
        if (currentValue) {
            result = 1;
        }
        return new NumberValueObject(result, true);
    }

    getValue() {
        return this._value;
    }

    isBoolean() {
        return true;
    }

    getNegative(): CalculateValueType {
        const currentValue = this.getValue();
        let result = 0;
        if (currentValue) {
            result = 1;
        }
        return new NumberValueObject(-result, true);
    }

    getReciprocal(): CalculateValueType {
        const currentValue = this.getValue();
        if (currentValue) {
            return new NumberValueObject(1, true);
        } else {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }
    }

    plus(valueObject: BaseValueObject): CalculateValueType {
        return this._convertTonNumber().plus(valueObject);
    }

    minus(valueObject: BaseValueObject): CalculateValueType {
        return this._convertTonNumber().minus(valueObject);
    }

    multiply(valueObject: BaseValueObject): CalculateValueType {
        return this._convertTonNumber().multiply(valueObject);
    }

    divided(valueObject: BaseValueObject): CalculateValueType {
        return this._convertTonNumber().divided(valueObject);
    }

    compare(valueObject: BaseValueObject, operator: compareToken): CalculateValueType {
        return this._convertTonNumber().compare(valueObject, operator);
    }

    concatenateFront(valueObject: BaseValueObject): CalculateValueType {
        return this._convertTonNumber().concatenateFront(valueObject);
    }

    concatenateBack(valueObject: BaseValueObject): CalculateValueType {
        return this._convertTonNumber().concatenateBack(valueObject);
    }
}
