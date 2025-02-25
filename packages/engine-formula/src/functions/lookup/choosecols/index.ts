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

import { ErrorType } from '../../../basics/error-type';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';

import { BaseFunction } from '../../base-function';

export class Choosecols extends BaseFunction {
    override minParams = 2;

    override maxParams = 255;

    override calculate(array: BaseValueObject, ...variants: BaseValueObject[]) {
        if (array.isError()) {
            return array;
        }

        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        const result: BaseValueObject[][] = [];

        for (let i = 0; i < variants.length; i++) {
            let variantObject = variants[i];

            if (variantObject.isArray()) {
                const variantRowCount = (variantObject as ArrayValueObject).getRowCount();
                const variantColumnCount = (variantObject as ArrayValueObject).getColumnCount();

                if (variantRowCount > 1 || variantColumnCount > 1) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                variantObject = (variantObject as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            if (variantObject.isString()) {
                variantObject = variantObject.convertToNumberObjectValue();
            }

            if (variantObject.isError()) {
                return variantObject;
            }

            const variantValue = Math.trunc(+variantObject.getValue());

            if (variantValue === 0 || Math.abs(variantValue) > arrayColumnCount) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            let searchColArray = array;

            if (arrayColumnCount > 1) {
                if (variantValue < 0) {
                    searchColArray = (array as ArrayValueObject).slice(undefined, [variantValue + arrayColumnCount, variantValue + 1 + arrayColumnCount]) as BaseValueObject;
                } else {
                    searchColArray = (array as ArrayValueObject).slice(undefined, [variantValue - 1, variantValue]) as BaseValueObject;
                }
            }

            for (let r = 0; r < arrayRowCount; r++) {
                if (!result[r]) {
                    result[r] = [];
                }

                if (array.isArray()) {
                    result[r].push((searchColArray as ArrayValueObject).get(r, 0) as BaseValueObject);
                } else {
                    result[r].push(array);
                }
            }
        }

        return ArrayValueObject.create({
            calculateValueList: result,
            rowCount: result.length,
            columnCount: result[0].length || 0,
            unitId: this.unitId as string,
            sheetId: this.subUnitId as string,
            row: this.row,
            column: this.column,
        });
    }
}
