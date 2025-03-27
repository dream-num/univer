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

import type { BaseValueObject, IArrayValueObject } from '../value-object/base-value-object';
import { ArrayValueObject } from '../value-object/array-value-object';
import { NullValueObject } from '../value-object/primitive-object';

export function expandArrayValueObject(rowCount: number, columnCount: number, valueObject: BaseValueObject, defaultValue?: BaseValueObject) {
    const valueRowCount = valueObject.isArray() ? (valueObject as ArrayValueObject).getRowCount() : 1;
    const valueColumnCount = valueObject.isArray() ? (valueObject as ArrayValueObject).getColumnCount() : 1;

    const result: BaseValueObject[][] = [];

    for (let r = 0; r < rowCount; r++) {
        const row = [];

        for (let c = 0; c < columnCount; c++) {
            if (valueRowCount === 1 && valueColumnCount === 1) {
                const value = valueObject.isArray() ? (valueObject as ArrayValueObject).get(0, 0) as BaseValueObject : valueObject;
                row.push(value);
                continue;
            }

            if (valueRowCount === 1 && c < valueColumnCount) {
                const value = (valueObject as ArrayValueObject).get(0, c) as BaseValueObject;
                row.push(value);
                continue;
            }

            if (valueColumnCount === 1 && r < valueRowCount) {
                const value = (valueObject as ArrayValueObject).get(r, 0) as BaseValueObject;
                row.push(value);
                continue;
            }

            if (r >= valueRowCount || c >= valueColumnCount) {
                row.push(defaultValue ?? NullValueObject.create());
                continue;
            }

            const value = (valueObject as ArrayValueObject).get(r, c) as BaseValueObject;
            row.push(value);
        }

        result.push(row);
    }

    return createNewArray(result, rowCount, columnCount);
}

export function createNewArray(
    result: BaseValueObject[][],
    rowCount: number,
    columnCount: number,
    unitId = '',
    sheetId = ''
) {
    const arrayValueObjectData: IArrayValueObject = {
        calculateValueList: result,
        rowCount,
        columnCount,
        unitId,
        sheetId,
        row: -1,
        column: -1,
    };

    return ArrayValueObject.create(arrayValueObjectData);
}
