import type {
    ArrayValueObject,
    BaseReferenceObject,
    BaseValueObject,
    BooleanValueObject,
    compareToken,
    FunctionVariantType,
} from '@univerjs/base-formula-engine';
import { BaseFunction, ErrorType, ErrorValueObject, NumberValueObject } from '@univerjs/base-formula-engine';

export class Sumif extends BaseFunction {
    override calculate(...variants: FunctionVariantType[]) {
        // 1. Check whether the number of parameters is correct,
        // TODO@Dushusir: Report the allowed parameter number range and the actual number of parameters
        if (variants.length < 2 || variants.length > 3) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const range = variants[0];
        const criteria = variants[1];
        const sumRange = variants[2];

        // 2. Check whether all parameter types meet the requirements
        if (range.isErrorObject() || criteria.isErrorObject() || (sumRange && sumRange.isErrorObject())) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let accumulatorAll: BaseValueObject = new NumberValueObject(0);

        if (range.isReferenceObject() || (range.isValueObject() && (range as BaseValueObject).isArray())) {
            (range as BaseReferenceObject | ArrayValueObject).iterator((valueObject, row, column) => {
                if (!valueObject.isErrorObject() && criteria.isValueObject()) {
                    // TODO@Dushusir: criteria is referenceObject
                    const accumulator = this._validator(valueObject as BaseValueObject, criteria as BaseValueObject);
                    accumulatorAll = accumulatorAll.plus(accumulator) as BaseValueObject;
                }
            });
        } else if (criteria.isValueObject()) {
            // TODO@Dushusir: criteria is referenceObject
            accumulatorAll = this._validator(range as BaseValueObject, criteria as BaseValueObject);
        }

        return accumulatorAll;
    }

    private _validator(rangeValue: BaseValueObject, criteriaValue: BaseValueObject) {
        const criteriaValueString = criteriaValue.getValue();
        if (criteriaValueString) {
            // TODO@Dushusir: support ==, !=, >, >=, <, <=, <>, *, ?, ~?, ~*
            const token = (criteriaValueString as string).substring(0, 1) as compareToken;
            const criteriaString = (criteriaValueString as string).substring(1);
            // TODO@Dushusir: support string value
            const validator = rangeValue.compare(new NumberValueObject(criteriaString), token) as BooleanValueObject;
            const validatorValue = validator.getValue();
            if (!validatorValue) {
                rangeValue = new NumberValueObject(0);
            }
        }

        return rangeValue;
    }
}
