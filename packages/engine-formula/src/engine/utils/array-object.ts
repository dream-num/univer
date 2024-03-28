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

import { ArrayValueObject } from '../value-object/array-value-object';
import type { BaseValueObject, IArrayValueObject } from '../value-object/base-value-object';
import { NullValueObject } from '../value-object/primitive-object';

export function expandArrayValueObject(rowCount: number, columnCount: number, valueObject: BaseValueObject, defaultValue?: BaseValueObject) {
    const result: BaseValueObject[][] = [];

    if (valueObject.isArray()) {
        const valueRowCount = (valueObject as ArrayValueObject).getRowCount();
        const valueColumnCount = (valueObject as ArrayValueObject).getColumnCount();

        if (valueRowCount === 1 && valueColumnCount === 1) {
            const v = (valueObject as ArrayValueObject).getFirstCell() as BaseValueObject;
            for (let r = 0; r < rowCount; r++) {
                const row = [];
                for (let c = 0; c < columnCount; c++) {
                    row.push(v);
                }
                result.push(row);
            }
        } else if (valueRowCount === 1 && valueColumnCount > 1) {
            for (let r = 0; r < rowCount; r++) {
                const row = [];
                for (let c = 0; c < columnCount; c++) {
                    const v = (valueObject as ArrayValueObject).getRealValue(0, c) as BaseValueObject || (defaultValue ?? NullValueObject.create());
                    row.push(v);
                }
                result.push(row);
            }
        } else if (valueColumnCount === 1 && valueRowCount > 1) {
            for (let r = 0; r < rowCount; r++) {
                const row = [];
                for (let c = 0; c < columnCount; c++) {
                    const v = (valueObject as ArrayValueObject).getRealValue(r, 0) as BaseValueObject || (defaultValue ?? NullValueObject.create());
                    row.push(v);
                }
                result.push(row);
            }
        } else {
            for (let r = 0; r < rowCount; r++) {
                const row = [];
                for (let c = 0; c < columnCount; c++) {
                    const v = (valueObject as ArrayValueObject).getRealValue(r, c) as BaseValueObject || (defaultValue ?? NullValueObject.create());
                    row.push(v);
                }
                result.push(row);
            }
        }
    } else {
        for (let r = 0; r < rowCount; r++) {
            const row = [];
            for (let c = 0; c < columnCount; c++) {
                row.push(valueObject);
            }
            result.push(row);
        }
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
