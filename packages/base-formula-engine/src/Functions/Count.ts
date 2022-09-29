import { FunctionVariantType } from '../Basics/Common';
import { FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { ArrayValueObject } from '../ValueObject/ArrayValueObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';
import { NumberValueObject } from '../ValueObject/NumberValueObject';

import { BaseFunction } from './BaseFunction';

const FUNCTION_NAME = 'COUNT';

export class Count extends BaseFunction {
    get name() {
        return FUNCTION_NAME;
    }

    calculate(...variants: Array<FunctionVariantType>) {
        let accumulatorAll: BaseValueObject = new NumberValueObject(0);
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[0];

            if (variant.isReferenceObject() || (variant.isValueObject() && (variant as BaseValueObject).isArray())) {
                (variant as BaseReferenceObject | ArrayValueObject).iterator((valueObject, row, column) => {
                    if (!valueObject.isErrorObject() && !(valueObject as BaseValueObject).isString()) {
                        accumulatorAll = accumulatorAll.plusBy(1) as BaseValueObject;
                    }
                });
            } else if (!(variant as BaseValueObject).isString()) {
                accumulatorAll = accumulatorAll.plusBy(1) as BaseValueObject;
            }
        }

        return accumulatorAll;
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Count.create());
