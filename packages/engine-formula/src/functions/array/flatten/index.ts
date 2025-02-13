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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { BaseFunction } from '../../base-function';

export class Flatten extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]): BaseValueObject {
        const resultArray: BaseValueObject[][] = [];

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];
            const rowCount = variant.isArray() ? (variant as ArrayValueObject).getRowCount() : 1;
            const columnCount = variant.isArray() ? (variant as ArrayValueObject).getColumnCount() : 1;

            for (let r = 0; r < rowCount; r++) {
                for (let c = 0; c < columnCount; c++) {
                    const valueObject = variant.isArray() ? (variant as ArrayValueObject).get(r, c) as BaseValueObject : variant;
                    resultArray.push([valueObject]);
                }
            }
        }

        return ArrayValueObject.create({
            calculateValueList: resultArray,
            rowCount: resultArray.length,
            columnCount: 1,
            unitId: this.unitId as string,
            sheetId: this.subUnitId as string,
            row: this.row,
            column: this.column,
        });
    }
}
