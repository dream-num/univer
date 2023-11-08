import { FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { CellReferenceObject } from '../ReferenceObject/CellReferenceObject';
import { BaseFunction } from './BaseFunction';

export class Indirect extends BaseFunction {
    override calculate(refText: FunctionVariantType, a1?: FunctionVariantType) {
        return new CellReferenceObject('A5');
    }
}
