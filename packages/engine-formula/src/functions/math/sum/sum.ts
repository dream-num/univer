import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/other-object/error-value-object';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Sum extends BaseFunction {
    override calculate(...variants: FunctionVariantType[]) {
        let accumulatorAll: BaseValueObject = new NumberValueObject(0);
        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            if (variant.isErrorObject()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (variant.isReferenceObject() || (variant.isValueObject() && (variant as BaseValueObject).isArray())) {
                let isSkip = false;
                (variant as BaseReferenceObject | ArrayValueObject).iterator((valueObject, row, column) => {
                    if (valueObject.isErrorObject()) {
                        isSkip = true;
                        return false;
                    }
                    accumulatorAll = accumulatorAll.plus(valueObject as BaseValueObject) as BaseValueObject;
                });

                if (isSkip) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }
            } else {
                accumulatorAll = accumulatorAll.plus(variant as BaseValueObject) as BaseValueObject;
            }
        }

        return accumulatorAll;
    }
}
