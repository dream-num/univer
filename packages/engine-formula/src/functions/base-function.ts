import { Disposable } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import { ErrorType } from '../basics/error-type';
import { ErrorValueObject } from '../engine/other-object/error-value-object';
import type { FunctionVariantType, NodeValueType } from '../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../engine/value-object/base-value-object';

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
