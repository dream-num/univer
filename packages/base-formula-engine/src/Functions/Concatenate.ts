import { CalculateValueType, FunctionVariantType } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { ArrayValueObject } from '../ValueObject/ArrayValueObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';
import { NumberValueObject } from '../ValueObject/NumberValueObject';
import { BaseFunction } from './BaseFunction';

const FUNCTION_NAME = 'CONCATENATE';

export class Concatenate extends BaseFunction {
    get name() {
        return FUNCTION_NAME;
    }

    calculate(numberVar: FunctionVariantType, powerVar: FunctionVariantType) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Concatenate.create());
