import { FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { CellReferenceObject } from '../ReferenceObject/CellReferenceObject';
import { BaseFunction } from './BaseFunction';

const FUNCTION_NAME = 'INDIRECT';

export class Indirect extends BaseFunction {
    override get name() {
        return FUNCTION_NAME;
    }

    override calculate(refText: FunctionVariantType, a1?: FunctionVariantType) {
        return new CellReferenceObject('A5');
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Indirect.create());
