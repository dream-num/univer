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
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Munit extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(dimension: BaseValueObject): BaseValueObject {
        if (dimension.isArray()) {
            const rowCount = (dimension as ArrayValueObject).getRowCount();
            const columnCount = (dimension as ArrayValueObject).getColumnCount();

            const resultArray = (dimension as ArrayValueObject).mapValue((dimensionObject) => {
                const result = this._handleSingleObject(dimensionObject);

                if (result.isError()) {
                    return result;
                }

                if (rowCount > 1 || columnCount > 1) {
                    return (result as ArrayValueObject).get(0, 0) as BaseValueObject;
                }

                return result;
            });

            if (rowCount === 1 && columnCount === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(dimension);
    }

    private _handleSingleObject(dimension: BaseValueObject): BaseValueObject {
        let _dimension = dimension;

        if (_dimension.isString()) {
            _dimension = _dimension.convertToNumberObjectValue();
        }

        if (_dimension.isError()) {
            return _dimension;
        }

        const dimensionValue = Math.floor(+_dimension.getValue());

        if (dimensionValue <= 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const result: Array<Array<0 | 1>> = [];

        for (let r = 0; r < dimensionValue; r++) {
            result[r] = [];

            for (let c = 0; c < dimensionValue; c++) {
                result[r][c] = r === c ? 1 : 0;
            }
        }

        return ArrayValueObject.createByArray(result);
    }
}
