import { ErrorType } from '../Basics/ErrorType';
import { FUNCTION_NAMES } from '../Basics/Function';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { IFunctionService } from '../Service/function.service';
import { BaseValueObject } from '../ValueObject/BaseValueObject';
import { BaseFunction } from './BaseFunction';

export class Average extends BaseFunction {
    override calculate(...variants: FunctionVariantType[]) {
        const functionService = this.accessor.get(IFunctionService);

        const accumulatorSum = functionService.getExecutor(FUNCTION_NAMES.SUM)?.calculate(...variants);
        const accumulatorCount = functionService.getExecutor(FUNCTION_NAMES.COUNT)?.calculate(...variants);

        if (
            accumulatorSum == null ||
            accumulatorCount == null ||
            accumulatorSum.isErrorObject() ||
            accumulatorCount.isErrorObject()
        ) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return (accumulatorSum as BaseValueObject).divided(accumulatorCount as BaseValueObject);
    }
}
