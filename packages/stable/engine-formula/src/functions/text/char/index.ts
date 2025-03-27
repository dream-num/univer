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
import { DataStreamTreeTokenType } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

// special case for some characters causing doc stream issues
const filterCodeArray = Object.values(DataStreamTreeTokenType).filter((value) => {
    return [
        DataStreamTreeTokenType.TABLE_START,
        DataStreamTreeTokenType.TABLE_ROW_START,
        DataStreamTreeTokenType.TABLE_CELL_START,
        DataStreamTreeTokenType.TABLE_CELL_END,
        DataStreamTreeTokenType.TABLE_ROW_END,
        DataStreamTreeTokenType.TABLE_END,
        DataStreamTreeTokenType.CUSTOM_BLOCK,
    ].includes(value as DataStreamTreeTokenType);
});

export class Char extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(number: BaseValueObject): BaseValueObject {
        if (number.isArray()) {
            const resultArray = (number as ArrayValueObject).mapValue((numberObject) => this._handleSingleObject(numberObject));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(number);
    }

    private _handleSingleObject(number: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(number);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [numberObject] = variants as BaseValueObject[];

        const numberValue = Math.floor(+numberObject.getValue());

        if (numberValue <= 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let result = String.fromCharCode(numberValue);

        // special case for some characters causing doc stream issues
        if (filterCodeArray.some((value) => value === result)) {
            result = String.fromCharCode(1);
        }

        return StringValueObject.create(result);
    }
}
