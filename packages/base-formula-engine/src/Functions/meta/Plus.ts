import { ErrorType } from '../../Basics/ErrorType';
import { ErrorValueObject } from '../../OtherObject/ErrorValueObject';
import { BaseReferenceObject, FunctionVariantType } from '../../ReferenceObject/BaseReferenceObject';
import { BaseValueObject } from '../../ValueObject/BaseValueObject';
import { BaseFunction } from '../BaseFunction';

export class Plus extends BaseFunction {
    override calculate(variant1: FunctionVariantType, variant2: FunctionVariantType) {
        if (variant1.isErrorObject() || variant2.isErrorObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let result;

        if (this.checkArrayType(variant1) && this.checkArrayType(variant2)) {
            result = (variant1 as BaseReferenceObject)
                .toArrayValueObject()
                .plus((variant2 as BaseReferenceObject).toArrayValueObject());
        } else if (this.checkArrayType(variant1)) {
            result = (variant1 as BaseReferenceObject).toArrayValueObject().plus(variant2 as BaseValueObject);
        } else if (this.checkArrayType(variant2)) {
            result = (variant1 as BaseValueObject).plus((variant2 as BaseReferenceObject).toArrayValueObject());
        } else {
            result = (variant1 as BaseValueObject).plus(variant2 as BaseValueObject);
        }

        return result;
    }
}
