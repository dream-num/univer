import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/other-object/error-value-object';
import type { FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import { BaseFunction } from '../../base-function';

export class Sumifs extends BaseFunction {
    override calculate(...variants: FunctionVariantType[]) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
}
