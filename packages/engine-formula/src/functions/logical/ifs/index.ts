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
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NullValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Ifs extends BaseFunction {
    override minParams = 2;

    override maxParams = 255;

    override calculate(...params: BaseValueObject[]) {
        if (params.length % 2 !== 0) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        // Check for errors in input parameters
        for (let i = 0; i < params.length; i++) {
            if (params[i].isError()) {
                return params[i];
            }
        }

        // Determine max row and column length
        const maxRowLength = Math.max(
            ...params.map((param) => (param.isArray() ? (param as ArrayValueObject).getRowCount() : 1))
        );
        const maxColumnLength = Math.max(
            ...params.map((param) => (param.isArray() ? (param as ArrayValueObject).getColumnCount() : 1))
        );

        // Expand all array values to the same size
        const expandedParams = params.map((param) =>
            expandArrayValueObject(maxRowLength, maxColumnLength, param, ErrorValueObject.create(ErrorType.NA))
        );

        const resultArray = expandedParams[0].map((_, rowIndex, columnIndex) => {
            for (let i = 0; i < expandedParams.length; i += 2) {
                const condition = expandedParams[i].get(rowIndex, columnIndex) || NullValueObject.create();
                const result = expandedParams[i + 1].get(rowIndex, columnIndex) || NullValueObject.create();

                if (condition.isNull()) {
                    continue;
                }

                if (condition.isError()) {
                    return condition;
                }

                const conditionValue = condition.getValue();

                if (condition.isString()) {
                    if (`${conditionValue}`.toLocaleUpperCase() === 'TRUE') {
                        return result;
                    }

                    if (`${conditionValue}`.toLocaleUpperCase() === 'FALSE') {
                        continue;
                    }

                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                if (+conditionValue) {
                    return result.isNull() ? ErrorValueObject.create(ErrorType.NA) : result;
                }
            }

            return ErrorValueObject.create(ErrorType.NA);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}
