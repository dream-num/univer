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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Choose extends BaseFunction {
    override minParams = 2;

    override maxParams = 255;

    override needsReferenceObject = true;

    override calculate(indexNum: FunctionVariantType, ...variants: FunctionVariantType[]) {
        let _indexNum = indexNum;

        if (_indexNum.isError()) {
            return _indexNum;
        }

        if (_indexNum.isReferenceObject()) {
            _indexNum = (_indexNum as BaseReferenceObject).toArrayValueObject();
        }

        if (!_indexNum.isArray()) {
            const index = (_indexNum as BaseValueObject).convertToNumberObjectValue();

            if (index.isError()) {
                return index;
            }

            const variant = variants[Math.trunc(+index.getValue()) - 1] || ErrorValueObject.create(ErrorType.VALUE);
            // if (variant.isNull()) {
            //     variant = NumberValueObject.create(0);
            // }
            return variant;
        }

        // The size of the extended range is determined by the maximum width and height of the criteria range.
        let maxRowLength = _indexNum.isArray() ? (_indexNum as ArrayValueObject).getRowCount() : 1;
        let maxColumnLength = _indexNum.isArray() ? (_indexNum as ArrayValueObject).getColumnCount() : 1;

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

        const indexNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, _indexNum as BaseValueObject, ErrorValueObject.create(ErrorType.NA));
        const arrayValueObjectList = variants.map((variant) => {
            let _variant = variant;

            if (_variant.isReferenceObject()) {
                _variant = (_variant as BaseReferenceObject).toArrayValueObject();
            }

            return expandArrayValueObject(maxRowLength, maxColumnLength, _variant as BaseValueObject, ErrorValueObject.create(ErrorType.NA));
        });

        return indexNumArray.map((indexNumValue, row, column) => {
            if (indexNumValue.isError()) {
                return indexNumValue;
            }

            const index = indexNumValue.convertToNumberObjectValue();

            if (index.isError()) {
                return index;
            }

            const arrayValueObject = arrayValueObjectList[Math.trunc(+index.getValue()) - 1];

            let valueObject = arrayValueObject?.get(row, column) || ErrorValueObject.create(ErrorType.VALUE);
            if (valueObject?.isNull()) {
                valueObject = NumberValueObject.create(0);
            }
            return valueObject;
        });
    }
}
