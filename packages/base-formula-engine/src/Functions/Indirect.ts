import { FunctionVariantType } from '../Basics/Common';
import { FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { CellReferenceObject } from '../ReferenceObject/CellReferenceObject';
import { BaseFunction } from './BaseFunction';

const FUNCTION_NAME = 'INDIRECT';

export class Indirect extends BaseFunction {
    get name() {
        return FUNCTION_NAME;
    }

    calculate(refText: FunctionVariantType, a1?: FunctionVariantType) {
        return new CellReferenceObject('A5');
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Indirect.create());
