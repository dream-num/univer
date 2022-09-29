import { FunctionVariantType } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { compareToken } from '../Basics/Token';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { ArrayValueObject } from '../ValueObject/ArrayValueObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';
import { BooleanValueObject } from '../ValueObject/BooleanValueObject';
import { NumberValueObject } from '../ValueObject/NumberValueObject';

import { BaseFunction } from './BaseFunction';
import { Count } from './Count';
import { Sum } from './Sum';

const FUNCTION_NAME = 'AVERAGE';

class Average extends BaseFunction {
    get name() {
        return FUNCTION_NAME;
    }

    calculate(...variants: Array<FunctionVariantType>) {
        const accumulatorSum = Sum.create().calculate(...variants);
        const accumulatorCount = Count.create().calculate(...variants);

        if (accumulatorSum.isErrorObject() || accumulatorCount.isErrorObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return (accumulatorSum as BaseValueObject).divided(accumulatorCount as BaseValueObject);
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Average.create());
