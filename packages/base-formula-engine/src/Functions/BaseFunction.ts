import { Disposable } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { FunctionVariantType, NodeValueType } from '../ReferenceObject/BaseReferenceObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';

export class BaseFunction extends Disposable {
    constructor(
        readonly accessor: IAccessor,
        private _name: string
    ) {
        super();
    }

    get name() {
        return this._name;
    }

    isAsync() {
        return false;
    }

    isAddress() {
        return false;
    }

    calculate(...arg: FunctionVariantType[]): NodeValueType {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    checkArrayType(variant: FunctionVariantType) {
        return variant.isReferenceObject() || (variant.isValueObject() && (variant as BaseValueObject).isArray());
    }
}
