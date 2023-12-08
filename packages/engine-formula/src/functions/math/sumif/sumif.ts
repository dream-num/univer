import { ErrorType } from '../../../basics/error-type';
import type { compareToken } from '../../../basics/token';
import { ErrorValueObject } from '../../../engine/other-object/error-value-object';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import { type ArrayValueObject, ValueObjectFactory } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import type { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

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
            // TODO@Dushusir: criteria is referenceObject
            const criteriaValueString = (criteria as BaseValueObject).getValue();
            if (criteriaValueString) {
                const token = (criteriaValueString as string).substring(0, 1) as compareToken;
                const criteriaString = (criteriaValueString as string).substring(1);
                const resultArrayObject = (range as BaseReferenceObject)
                    .toArrayValueObject()
                    .compare(ValueObjectFactory.create(criteriaString) as BaseValueObject, token);
                const resultArrayValue = (resultArrayObject as ArrayValueObject).getArrayValue();

                (range as BaseReferenceObject | ArrayValueObject).iterator((valueObject, row, column) => {
                    if (!valueObject.isErrorObject()) {
                        const arrayValue = resultArrayValue[row][column] as BaseValueObject;
                        const accumulator = arrayValue.getValue()
                            ? (valueObject as BaseValueObject)
                            : new NumberValueObject(0);
                        accumulatorAll = accumulatorAll.plus(accumulator) as BaseValueObject;
                    }
                });
            }
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
