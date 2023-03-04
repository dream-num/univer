import { FunctionVariantType } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseFunction } from './BaseFunction';

const FUNCTION_NAME = 'POWER';

export class Power extends BaseFunction {
    get name() {
        return FUNCTION_NAME;
    }

    calculate(numberVar: FunctionVariantType, powerVar: FunctionVariantType) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Power.create());
