import { ErrorType } from '../basics/error-type';
import { FUNCTION_NAMES } from '../basics/function';
import { ErrorValueObject } from '../other-object/error-value-object';
import { FunctionVariantType } from '../reference-object/base-reference-object';
import { IFunctionService } from '../services/function.service';
import { BaseValueObject } from '../value-object/base-value-object';
import { BaseFunction } from './base-function';

export class Average extends BaseFunction {
    override calculate(...variants: FunctionVariantType[]) {
        const functionService = this.accessor.get(IFunctionService);

        const accumulatorSum = functionService.getExecutor(FUNCTION_NAMES.SUM)?.calculate(...variants);
        const accumulatorCount = functionService.getExecutor(FUNCTION_NAMES.COUNT)?.calculate(...variants);
        //TODO@DR-Univer: accumulatorCount should be calculated by numeric type count instead of all counts

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
