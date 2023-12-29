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

import type { Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';

import { ErrorType } from '../basics/error-type';
import type { IFunctionNames } from '../basics/function';
import type { FunctionVariantType, NodeValueType } from '../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../engine/value-object/base-value-object';
import type { PrimitiveValueType } from '../engine/value-object/primitive-object';

export class BaseFunction extends Disposable {
    private _unitId: Nullable<string>;
    private _subUnitId: Nullable<string>;
    private _row: number = -1;
    private _column: number = -1;

    constructor(private _name: IFunctionNames) {
        super();
    }

    get name() {
        return this._name;
    }

    get unitId() {
        return this._unitId;
    }

    get subUnitId() {
        return this._subUnitId;
    }

    get row() {
        return this._row;
    }

    get column() {
        return this._column;
    }

    isAsync() {
        return false;
    }

    isAddress() {
        return false;
    }

    isCustom() {
        return false;
    }

    setRefInfo(unitId: string, subUnitId: string, row: number, column: number) {
        this._unitId = unitId;
        this._subUnitId = subUnitId;
        this._row = row;
        this._column = column;
    }

    calculateCustom(
        ...arg: Array<PrimitiveValueType | PrimitiveValueType[][]>
    ): PrimitiveValueType | PrimitiveValueType[][] {
        return null;
    }

    calculate(...arg: BaseValueObject[]): NodeValueType {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    checkArrayType(variant: FunctionVariantType) {
        return variant.isReferenceObject() || (variant.isValueObject() && (variant as BaseValueObject).isArray());
    }

    getIndexNumValue(indexNum: BaseValueObject) {
        if (indexNum.isArray()) {
            indexNum = (indexNum as ArrayValueObject).getFirstCell();
        }

        if (indexNum.isBoolean()) {
            const colIndexNumV = indexNum.getValue() as boolean;
            if (colIndexNumV === false) {
                return new ErrorValueObject(ErrorType.VALUE);
            }

            return 1;
        }
        if (indexNum.isString()) {
            const colIndexNumV = Number(indexNum.getValue() as string);
            if (isNaN(colIndexNumV)) {
                return new ErrorValueObject(ErrorType.REF);
            }
        } else if (indexNum.isNumber()) {
            const colIndexNumV = indexNum.getValue() as number;
            return colIndexNumV;
        }

        return new ErrorValueObject(ErrorType.VALUE);
    }
}
