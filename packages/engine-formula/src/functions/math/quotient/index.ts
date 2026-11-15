/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Quotient extends BaseFunction {
    override rejectsMultiCellReference = true;

    override minParams = 2;

    override maxParams = 2;

    override calculate(numerator: BaseValueObject, denominator: BaseValueObject): BaseValueObject {
        const rowCount = Math.max(numerator.isArray() ? (numerator as ArrayValueObject).getRowCount() : 1, denominator.isArray() ? (denominator as ArrayValueObject).getRowCount() : 1);
        const columnCount = Math.max(numerator.isArray() ? (numerator as ArrayValueObject).getColumnCount() : 1, denominator.isArray() ? (denominator as ArrayValueObject).getColumnCount() : 1);
        if (rowCount > 1 || columnCount > 1) {
            const left = expandArrayValueObject(rowCount, columnCount, numerator, ErrorValueObject.create(ErrorType.NA));
            const right = expandArrayValueObject(rowCount, columnCount, denominator, ErrorValueObject.create(ErrorType.NA));
            return left.mapValue((value, row, column) => this.calculate(value, right.get(row, column) as BaseValueObject));
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(numerator, denominator);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [numeratorObject, denominatorObject] = variants as BaseValueObject[];

        const numeratorValue = +numeratorObject.getValue();
        const denominatorValue = +denominatorObject.getValue();

        if (Number.isNaN(numeratorValue) || Number.isNaN(denominatorValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (denominatorValue === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        const result = Math.trunc(numeratorValue / denominatorValue);

        return NumberValueObject.create(result);
    }
}
