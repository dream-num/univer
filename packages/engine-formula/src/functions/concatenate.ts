import { ErrorType } from '../basics/error-type';
import { ErrorValueObject } from '../other-object/error-value-object';
import type { FunctionVariantType } from '../reference-object/base-reference-object';
import { BaseFunction } from './base-function';

export class Concatenate extends BaseFunction {
    override calculate(numberVar: FunctionVariantType, powerVar: FunctionVariantType) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
}
