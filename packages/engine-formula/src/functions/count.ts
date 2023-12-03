import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { ArrayValueObject } from '../value-object/array-value-object';
import type { BaseValueObject } from '../value-object/base-value-object';
import { NumberValueObject } from '../value-object/primitive-object';
import { BaseFunction } from './base-function';

export class Count extends BaseFunction {
    override calculate(...variants: FunctionVariantType[]) {
        let accumulatorAll: BaseValueObject = new NumberValueObject(0);
        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

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
