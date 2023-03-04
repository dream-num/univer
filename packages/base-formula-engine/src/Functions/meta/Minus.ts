import { FunctionVariantType } from '../../Basics/Common';
import { ErrorType } from '../../Basics/ErrorType';
import { FORMULA_FUNCTION_REGISTRY } from '../../Basics/Registry';
import { ErrorValueObject } from '../../OtherObject/ErrorValueObject';
import { BaseValueObject } from '../../ValueObject/BaseValueObject';
import { BaseFunction } from '../BaseFunction';

const FUNCTION_NAME = 'MINUS';

export class Minus extends BaseFunction {
    get name() {
        return FUNCTION_NAME;
    }

    calculate(variant1: FunctionVariantType, variant2: FunctionVariantType) {
        if (variant1.isErrorObject() || variant2.isErrorObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return (variant1 as BaseValueObject).minus(variant2 as BaseValueObject);
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Minus.create());
