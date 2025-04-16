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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Concatenate extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...textValues: BaseValueObject[]) {
        let maxRowLength = 0;
        let maxColumnLength = 0;

        textValues.forEach((textValue) => {
            if (textValue.isArray()) {
                const arrayValue = textValue as ArrayValueObject;
                maxRowLength = Math.max(maxRowLength, arrayValue.getRowCount());
                maxColumnLength = Math.max(maxColumnLength, arrayValue.getColumnCount());
            } else {
                maxRowLength = Math.max(maxRowLength, 1);
                maxColumnLength = Math.max(maxColumnLength, 1);
            }
        });

        let result: BaseValueObject | null = null;

        for (const textValue of textValues) {
            const textValueArray = expandArrayValueObject(maxRowLength, maxColumnLength, textValue, ErrorValueObject.create(ErrorType.NA));
            result = textValueArray.mapValue((textValueObject, rowIndex, columnIndex) => {
                const resultValueObject = result && (result as ArrayValueObject).get(rowIndex, columnIndex);

                if (resultValueObject?.isError()) {
                    return resultValueObject;
                }

                if (textValueObject.isError()) {
                    return textValueObject;
                }

                let resultValue = resultValueObject?.getValue();
                let textValue = textValueObject?.getValue();

                if (resultValueObject?.isBoolean()) {
                    resultValue = `${resultValue}`.toLocaleUpperCase();
                }

                if (textValueObject?.isBoolean()) {
                    textValue = `${textValue}`.toLocaleUpperCase();
                }

                const resultValueObjectString = resultValueObject?.isNull() ? '' : resultValue ?? '';
                const textValueObjectString = textValueObject?.isNull() ? '' : textValue ?? '';

                return StringValueObject.create(`${resultValueObjectString}${textValueObjectString}`);
            });
        }

        if (!result) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return result;
    }
}
