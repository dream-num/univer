import { Disposable } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ErrorType } from '../basics/error-type';
import { ErrorValueObject } from '../other-object/error-value-object';
import { FunctionVariantType, NodeValueType } from '../reference-object/base-reference-object';
import { BaseValueObject } from '../value-object/base-value-object';

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
