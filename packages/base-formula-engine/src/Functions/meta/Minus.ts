import { ErrorType } from '../../Basics/ErrorType';
import { ErrorValueObject } from '../../OtherObject/ErrorValueObject';
import { FunctionVariantType } from '../../ReferenceObject/BaseReferenceObject';
import { BaseValueObject } from '../../ValueObject/BaseValueObject';
import { BaseFunction } from '../BaseFunction';

export class Minus extends BaseFunction {
    override calculate(variant1: FunctionVariantType, variant2: FunctionVariantType) {
        if (variant1.isErrorObject() || variant2.isErrorObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return (variant1 as BaseValueObject).minus(variant2 as BaseValueObject);
    }
}
