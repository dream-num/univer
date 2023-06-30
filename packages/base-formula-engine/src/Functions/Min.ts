import { FunctionVariantType } from '../Basics/Common';
import { FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { compareToken } from '../Basics/Token';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { ArrayValueObject } from '../ValueObject/ArrayValueObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';
import { BooleanValueObject } from '../ValueObject/BooleanValueObject';
import { NumberValueObject } from '../ValueObject/NumberValueObject';

import { BaseFunction } from './BaseFunction';

const FUNCTION_NAME = 'MIN';

export class Min extends BaseFunction {
    get name() {
        return FUNCTION_NAME;
    }

    calculate(...variants: FunctionVariantType[]) {
        let accumulatorAll: BaseValueObject = new NumberValueObject(Infinity);
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

            if (variant.isReferenceObject() || (variant.isValueObject() && (variant as BaseValueObject).isArray())) {
                (variant as BaseReferenceObject | ArrayValueObject).iterator((valueObject, row, column) => {
                    if (!valueObject.isErrorObject() && !(valueObject as BaseValueObject).isString()) {
                        accumulatorAll = this._validator(accumulatorAll, valueObject as BaseValueObject);
                    }
                });
            } else if (!(variant as BaseValueObject).isString()) {
                accumulatorAll = this._validator(accumulatorAll, variant as BaseValueObject);
            }
        }

        return accumulatorAll;
    }

    private _validator(accumulatorAll: BaseValueObject, valueObject: BaseValueObject) {
        const validator = accumulatorAll.compare(valueObject as BaseValueObject, compareToken.GREATER_THAN) as BooleanValueObject;
        if (validator.getValue()) {
            accumulatorAll = valueObject as BaseValueObject;
        }
        return accumulatorAll;
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Min.create());
