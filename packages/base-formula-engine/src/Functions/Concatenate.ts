import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { BaseFunction } from './BaseFunction';

export class Concatenate extends BaseFunction {
    override calculate(numberVar: FunctionVariantType, powerVar: FunctionVariantType) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
}
