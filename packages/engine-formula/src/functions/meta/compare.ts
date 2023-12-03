import { ErrorType } from '../../basics/error-type';
import { compareToken } from '../../basics/token';
import { ErrorValueObject } from '../../other-object/error-value-object';
import type { BaseReferenceObject, FunctionVariantType } from '../../reference-object/base-reference-object';
import type { BaseValueObject } from '../../value-object/base-value-object';
import { BaseFunction } from '../base-function';

export class Compare extends BaseFunction {
    private _compareType: compareToken = compareToken.EQUALS;

    setCompareType(token: compareToken) {
        this._compareType = token;
    }

    override calculate(variant1: FunctionVariantType, variant2: FunctionVariantType) {
        if (variant1.isErrorObject() || variant2.isErrorObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let result;

        if (this.checkArrayType(variant1) && this.checkArrayType(variant2)) {
            result = (variant1 as BaseReferenceObject)
                .toArrayValueObject()
                .compare((variant2 as BaseReferenceObject).toArrayValueObject(), this._compareType);
        } else if (this.checkArrayType(variant1)) {
            result = (variant1 as BaseReferenceObject)
                .toArrayValueObject()
                .compare(variant2 as BaseValueObject, this._compareType);
        } else if (this.checkArrayType(variant2)) {
            result = (variant1 as BaseValueObject).compare(
                (variant2 as BaseReferenceObject).toArrayValueObject(),
                this._compareType
            );
        } else {
            result = (variant1 as BaseValueObject).compare(variant2 as BaseValueObject, this._compareType);
        }

        return result;
    }
}
