import { ErrorType } from '../Basics/ErrorType';
import { FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseReferenceObject, FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { ArrayValueObject } from '../ValueObject/ArrayValueObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';
import { NumberValueObject } from '../ValueObject/PrimitiveObject';
import { BaseFunction } from './BaseFunction';

const FUNCTION_NAME = 'SUM';

export class Sum extends BaseFunction {
    override get name() {
        return FUNCTION_NAME;
    }

    override calculate(...variants: FunctionVariantType[]) {
        let accumulatorAll: BaseValueObject = new NumberValueObject(0);
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

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

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Sum.create());
