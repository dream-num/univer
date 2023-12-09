import type { FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import { CellReferenceObject } from '../../../engine/reference-object/cell-reference-object';
import { BaseFunction } from '../../base-function';

export class Indirect extends BaseFunction {
    override calculate(refText: FunctionVariantType, a1?: FunctionVariantType) {
        return new CellReferenceObject('A5');
    }
}
