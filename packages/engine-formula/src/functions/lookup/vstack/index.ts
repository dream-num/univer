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

import type { Nullable } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';

import { BaseFunction } from '../../base-function';

export class Vstack extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]) {
        const maxColumnLength = Math.max(
            ...variants.map((variantObject) => variantObject.isArray() ? (variantObject as ArrayValueObject).getColumnCount() : 1)
        );

        const result: BaseValueObject[][] = [];

        for (let i = 0; i < variants.length; i++) {
            const variantObject = variants[i];

            if (variantObject.isError()) {
                return variantObject;
            }

            const rowCount = variantObject.isArray() ? (variantObject as ArrayValueObject).getRowCount() : 1;
            const columnCount = variantObject.isArray() ? (variantObject as ArrayValueObject).getColumnCount() : 1;

            for (let r = 0; r < rowCount; r++) {
                const row: BaseValueObject[] = [];

                for (let c = 0; c < maxColumnLength; c++) {
                    let singleObject: Nullable<BaseValueObject> = variantObject;

                    if (variantObject.isArray()) {
                        singleObject = (variantObject as ArrayValueObject).get(r, c);
                    }

                    if (c > columnCount - 1 || !singleObject) {
                        row.push(ErrorValueObject.create(ErrorType.NA));
                    } else {
                        row.push(singleObject);
                    }
                }

                result.push(row);
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
