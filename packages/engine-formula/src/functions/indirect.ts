import type { FunctionVariantType } from '../reference-object/base-reference-object';
import { CellReferenceObject } from '../reference-object/cell-reference-object';
import { BaseFunction } from './base-function';

export class Indirect extends BaseFunction {
    override calculate(refText: FunctionVariantType, a1?: FunctionVariantType) {
        return new CellReferenceObject('A5');
    }
}
