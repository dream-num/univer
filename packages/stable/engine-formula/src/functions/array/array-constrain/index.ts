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
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsArray, checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class ArrayConstrain extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(inputRange: BaseValueObject, numRows: BaseValueObject, numCols: BaseValueObject): BaseValueObject {
        if (inputRange.isError()) {
            return inputRange;
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsArray(numRows, numCols);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const { isError: _isError, errorObject: _errorObject, variants: _variants } = checkVariantsErrorIsStringToNumber(...variants as BaseValueObject[]);

        if (_isError) {
            return _errorObject as ErrorValueObject;
        }

        const [numRowsObject, numColsObject] = _variants as BaseValueObject[];

        const numRowsValue = Math.floor(+numRowsObject.getValue());
        const numColsValue = Math.floor(+numColsObject.getValue());

        if (numRowsValue < 0 || numColsValue < 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (numRowsValue === 0 || numColsValue === 0) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const rowCount = inputRange.isArray() ? (inputRange as ArrayValueObject).getRowCount() : 1;
        const columnCount = inputRange.isArray() ? (inputRange as ArrayValueObject).getColumnCount() : 1;

        if (rowCount === 1 && columnCount === 1) {
            return inputRange.isArray() ? (inputRange as ArrayValueObject).get(0, 0) as BaseValueObject : inputRange;
        }

        const maxRowCount = numRowsValue > rowCount ? rowCount : numRowsValue;
        const maxColumnCount = numColsValue > columnCount ? columnCount : numColsValue;

        return (inputRange as ArrayValueObject).slice([0, maxRowCount], [0, maxColumnCount]) as ArrayValueObject;
    }
}
