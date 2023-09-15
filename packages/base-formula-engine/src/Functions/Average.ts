import { ErrorType } from '../Basics/ErrorType';
import { FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';
import { BaseFunction } from './BaseFunction';
import { Count } from './Count';
import { Sum } from './Sum';

const FUNCTION_NAME = 'AVERAGE';

export class Average extends BaseFunction {
    override get name() {
        return FUNCTION_NAME;
    }

    override calculate(...variants: FunctionVariantType[]) {
        const accumulatorSum = Sum.create().calculate(...variants);
        const accumulatorCount = Count.create().calculate(...variants);

        if (accumulatorSum.isErrorObject() || accumulatorCount.isErrorObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return (accumulatorSum as BaseValueObject).divided(accumulatorCount as BaseValueObject);
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Average.create());
