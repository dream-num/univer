import { CalculateValueType, FunctionVariantType } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { CellReferenceObject } from '../ReferenceObject/CellReferenceObject';
import { ArrayValueObject } from '../ValueObject/ArrayValueObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';
import { NumberValueObject } from '../ValueObject/NumberValueObject';
import { BaseFunction } from './BaseFunction';

const FUNCTION_NAME = 'OFFSET';

export class Offset extends BaseFunction {
    get name() {
        return FUNCTION_NAME;
    }

    calculate(reference: FunctionVariantType, rows: FunctionVariantType, columns: FunctionVariantType, height?: FunctionVariantType, width?: FunctionVariantType) {
        return new CellReferenceObject('A5');
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Offset.create());
