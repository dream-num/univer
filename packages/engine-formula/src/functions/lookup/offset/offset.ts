import type { FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import { CellReferenceObject } from '../../../engine/reference-object/cell-reference-object';
import { BaseFunction } from '../../base-function';

export class Offset extends BaseFunction {
    override calculate(
        reference: FunctionVariantType,
        rows: FunctionVariantType,
        columns: FunctionVariantType,
        height?: FunctionVariantType,
        width?: FunctionVariantType
    ) {
        return new CellReferenceObject('A5');
    }
}
