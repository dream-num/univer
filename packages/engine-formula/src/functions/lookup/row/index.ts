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
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import type { BaseValueObject, IArrayValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Row extends BaseFunction {
    override minParams = 0;

    override maxParams = 1;

    override calculate(
        reference?: BaseValueObject
    ) {
        if (reference == null) {
            return NumberValueObject.create(this.row + 1);
        }

        if (reference.isError()) {
            return reference;
        }

        if (!reference.isArray()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const row = (reference as ArrayValueObject).getCurrentRow();
        const rowCount = (reference as ArrayValueObject).getRowCount();

        const calculateValueList = [];
        for (let i = 0; i < rowCount; i++) {
            calculateValueList.push([NumberValueObject.create(row + i + 1)]);
        }

        const arrayValueObjectData: IArrayValueObject = {
            calculateValueList,
            rowCount,
            columnCount: 1,
            unitId: this.unitId || '',
            sheetId: this.subUnitId || '',
            row: this.row,
            column: this.column,
        };

        return ArrayValueObject.create(arrayValueObjectData);
    }
}
