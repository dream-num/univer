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

import { AbsoluteRefType, type IRange, serializeRange } from '@univerjs/core';

import { StringValueObject } from '../../..';
import { ErrorType } from '../../../basics/error-type';
import type { FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Address extends BaseFunction {
    override calculate(
        rowNumber: FunctionVariantType,
        columnNumber: FunctionVariantType,
        absNumber?: FunctionVariantType,
        a1?: FunctionVariantType,
        sheetText?: FunctionVariantType
    ) {
        const row = Number((rowNumber as BaseValueObject).getValue());
        const column = Number((columnNumber as BaseValueObject).getValue());

        if (Number.isNaN(row) || Number.isNaN(column)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const range: IRange = {
            startRow: row,
            startColumn: column,
            endRow: row,
            endColumn: column,
            startAbsoluteRefType: AbsoluteRefType.ALL,
            endAbsoluteRefType: AbsoluteRefType.ALL,
        };
        const rangeString = serializeRange(range);
        return new StringValueObject(rangeString);
    }
}
