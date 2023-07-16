import { ErrorType } from '../Basics/ErrorType';
import { FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { BaseFunction } from './BaseFunction';

const FUNCTION_NAME = 'CONCATENATE';

export class Concatenate extends BaseFunction {
    override get name() {
        return FUNCTION_NAME;
    }

    override calculate(numberVar: FunctionVariantType, powerVar: FunctionVariantType) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Concatenate.create());
