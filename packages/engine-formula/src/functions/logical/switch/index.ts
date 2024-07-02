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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Switch extends BaseFunction {
    override minParams = 3;

    override maxParams = 255;

    override calculate(expression: BaseValueObject, ...casesAndResults: BaseValueObject[]): BaseValueObject {
        if (expression.isError()) {
            return expression;
        }

        // Check if the expression is an array and whether it has more than one cell
        if (expression.isArray()) {
            const arrayValueObject = expression as ArrayValueObject;
            if (arrayValueObject.getRowCount() > 1 || arrayValueObject.getColumnCount() > 1) {
                return new ErrorValueObject(ErrorType.VALUE);
            }
        }

        const expressionValue = this._getSingleValue(expression);
        let defaultValue: BaseValueObject | null = null;

        // Iterate over the cases and results
        for (let i = 0; i < casesAndResults.length; i += 2) {
            if (i + 1 >= casesAndResults.length) {
                // Handle default case
                defaultValue = casesAndResults[i];
                if (defaultValue.isError()) {
                    return defaultValue;
                }
                break;
            }

            const caseValue = casesAndResults[i];
            const resultValue = casesAndResults[i + 1];

            if (caseValue.isError()) {
                return caseValue;
            }

            if (resultValue.isError()) {
                return resultValue;
            }

            const caseValueSingle = this._getSingleValue(caseValue);

            if (expressionValue === caseValueSingle) {
                return resultValue;
            }
        }

        // Return default value if no match found
        return defaultValue || new ErrorValueObject(ErrorType.NA);
    }

    private _getSingleValue(valueObject: BaseValueObject): string | number | boolean {
        if (valueObject.isArray()) {
            const arrayValueObject = valueObject as ArrayValueObject;
            if (arrayValueObject.getRowCount() === 1 && arrayValueObject.getColumnCount() === 1) {
                return arrayValueObject.getFirstCell().getValue();
            }
            // In case it's an array, but we are only handling single cell arrays here
            return arrayValueObject.getValue();
        }
        return valueObject.getValue();
    }
}
