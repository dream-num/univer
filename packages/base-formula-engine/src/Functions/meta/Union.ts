import { FunctionVariantType } from '../../Basics/Common';
import { ErrorType } from '../../Basics/ErrorType';
import { FORMULA_FUNCTION_REGISTRY } from '../../Basics/Registry';
import { compareToken } from '../../Basics/Token';
import { ErrorValueObject } from '../../OtherObject/ErrorValueObject';
import { BaseReferenceObject } from '../../ReferenceObject/BaseReferenceObject';
import { BaseFunction } from '../BaseFunction';

const FUNCTION_NAME = 'UNION';

export class Union extends BaseFunction {
    private _compareType: compareToken;

    get name() {
        return FUNCTION_NAME;
    }

    setCompareType(token: compareToken) {
        this._compareType = token;
    }

    calculate(variant1: FunctionVariantType, variant2: FunctionVariantType) {
        if (variant1.isErrorObject() || variant2.isErrorObject()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (!variant1.isReferenceObject() || !variant2.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        variant1 = variant1 as BaseReferenceObject;

        variant2 = variant2 as BaseReferenceObject;

        if (variant1.isCell() && variant2.isCell()) {
            return variant1.unionBy(variant2);
        }
        if (variant1.isRow() && variant2.isRow()) {
            return variant1.unionBy(variant2);
        }
        if (variant1.isColumn() && variant2.isColumn()) {
            return variant1.unionBy(variant2);
        }

        return ErrorValueObject.create(ErrorType.REF);
    }
}

FORMULA_FUNCTION_REGISTRY.add(FUNCTION_NAME, Union.create());
