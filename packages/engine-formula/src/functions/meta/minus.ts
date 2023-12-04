import { ErrorType } from '../../basics/error-type';
import { ErrorValueObject } from '../../other-object/error-value-object';
import type { FunctionVariantType } from '../../reference-object/base-reference-object';
import type { BaseValueObject } from '../../value-object/base-value-object';
import { BaseFunction } from '../base-function';

export class Minus extends BaseFunction {
    override calculate(variant1: FunctionVariantType, variant2: FunctionVariantType) {
        if (variant1.isErrorObject() || variant2.isErrorObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return (variant1 as BaseValueObject).minus(variant2 as BaseValueObject);
    }
}
