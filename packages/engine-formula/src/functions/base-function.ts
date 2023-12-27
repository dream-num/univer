/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Disposable } from '@univerjs/core';

import type { IFunctionNames } from '..';
import { ErrorType } from '../basics/error-type';
import type { FunctionVariantType, NodeValueType } from '../engine/reference-object/base-reference-object';
import { type BaseValueObject, ErrorValueObject } from '../engine/value-object/base-value-object';

export class BaseFunction extends Disposable {
    constructor(private _name: IFunctionNames) {
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

    calculate(...arg: BaseValueObject[]): NodeValueType {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    checkArrayType(variant: FunctionVariantType) {
        return variant.isReferenceObject() || (variant.isValueObject() && (variant as BaseValueObject).isArray());
    }
}
