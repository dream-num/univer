import type { FunctionVariantType } from '@univerjs/engine-formula';
import { BaseFunction, ErrorType, ErrorValueObject } from '@univerjs/engine-formula';

export class Sumifs extends BaseFunction {
    override calculate(...variants: FunctionVariantType[]) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
}
