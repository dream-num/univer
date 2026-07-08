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
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject, formatValueForFormulaText } from '../../../engine/value-object/base-value-object';
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
        const referenceSource = textValues.find((textValue) => {
            if (!textValue.isArray()) {
                return false;
            }

            const arrayValue = textValue as ArrayValueObject;
            return (
                arrayValue.getUnitId() !== '' &&
                arrayValue.getSheetId() !== '' &&
                arrayValue.getCurrentRow() >= 0 &&
                arrayValue.getCurrentColumn() >= 0
            );
        }) as ArrayValueObject | undefined;

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

                const resultValueObjectString = resultValueObject?.isNull() ? '' : formatValueForFormulaText(resultValueObject?.getValue() ?? null);
                const textValueObjectString = textValueObject?.isNull() ? '' : formatValueForFormulaText(textValueObject?.getValue() ?? null);

                return StringValueObject.create(`${resultValueObjectString}${textValueObjectString}`);
            });
        }

        if (!result) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (referenceSource && result.isArray()) {
            const resultArray = result as ArrayValueObject;
            resultArray.setUnitId(referenceSource.getUnitId());
            resultArray.setSheetId(referenceSource.getSheetId());
            resultArray.setCurrent(referenceSource.getCurrentRow(), referenceSource.getCurrentColumn());
        }

        return result;
    }
}
