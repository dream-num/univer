import { FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { CellReferenceObject } from '../ReferenceObject/CellReferenceObject';
import { BaseFunction } from './BaseFunction';

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
