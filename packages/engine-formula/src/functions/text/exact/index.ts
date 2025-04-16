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
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { BooleanValueObject, NullValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Exact extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(text1: BaseValueObject, text2: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            text1.isArray() ? (text1 as ArrayValueObject).getRowCount() : 1,
            text2.isArray() ? (text2 as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            text1.isArray() ? (text1 as ArrayValueObject).getColumnCount() : 1,
            text2.isArray() ? (text2 as ArrayValueObject).getColumnCount() : 1
        );

        const text1Array = expandArrayValueObject(maxRowLength, maxColumnLength, text1, NullValueObject.create());
        const text2Array = expandArrayValueObject(maxRowLength, maxColumnLength, text2, NullValueObject.create());

        const resultArray = text1Array.mapValue((text1Object, rowIndex, columnIndex) => {
            const text2Object = text2Array.get(rowIndex, columnIndex) as BaseValueObject;

            if (text1Object.isError()) {
                return text1Object;
            }

            if (text2Object.isError()) {
                return text2Object;
            }

            return this._handleSingleObject(text1Object, text2Object);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(text1: BaseValueObject, text2: BaseValueObject): BaseValueObject {
        if (text1.isNull() || text2.isNull()) {
            const result = text1.isNull() && text2.isNull();

            return BooleanValueObject.create(result);
        }

        let text1Value = `${text1.getValue()}`;

        if (text1.isBoolean()) {
            text1Value = text1Value.toLocaleUpperCase();
        }

        let text2Value = `${text2.getValue()}`;

        if (text2.isBoolean()) {
            text2Value = text2Value.toLocaleUpperCase();
        }

        const result = text1Value === text2Value;

        return BooleanValueObject.create(result);
    }
}
