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

import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Choose extends BaseFunction {
    override minParams = 2;

    override maxParams = 255;

    override calculate(indexNum: BaseValueObject, ...variants: BaseValueObject[]) {
        if (indexNum.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        // The size of the extended range is determined by the maximum width and height of the criteria range.
        let maxRowLength = indexNum.isArray() ? (indexNum as ArrayValueObject).getRowCount() : 1;
        let maxColumnLength = indexNum.isArray() ? (indexNum as ArrayValueObject).getColumnCount() : 1;

        variants.forEach((variant, i) => {
            if (variant.isArray()) {
                const arrayValue = variant as ArrayValueObject;
                maxRowLength = Math.max(maxRowLength, arrayValue.getRowCount());
                maxColumnLength = Math.max(maxColumnLength, arrayValue.getColumnCount());
            } else {
                maxRowLength = Math.max(maxRowLength, 1);
                maxColumnLength = Math.max(maxColumnLength, 1);
            }
        });

        const indexNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, indexNum, ErrorValueObject.create(ErrorType.NA));
        const arrayValueObjectList = variants.map((variant) => expandArrayValueObject(maxRowLength, maxColumnLength, variant, ErrorValueObject.create(ErrorType.NA)));

        return indexNumArray.map((indexNumValue, row, column) => {
            if (indexNumValue.isError()) {
                return indexNumValue;
            }

            const index = indexNumValue.convertToNumberObjectValue();

            if (index.isError()) {
                return index;
            }

            const arrayValueObject = arrayValueObjectList[Number(index.getValue()) - 1];

            let valueObject = arrayValueObject?.get(row, column) || ErrorValueObject.create(ErrorType.VALUE);
            if (valueObject?.isNull()) {
                valueObject = NumberValueObject.create(0);
            }
            return valueObject;
        });
    }
}
