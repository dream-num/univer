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
import { ErrorValueObject, formatValueForFormulaText } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Concat extends BaseFunction {
    override minParams = 1;
    override maxParams = 255;

    override calculate(...textValues: BaseValueObject[]) {
        let concatenatedString = '';
        let isError: BaseValueObject | null = null;
        let exceedsCellLimit = false;

        const appendText = (text: string) => {
            if (exceedsCellLimit) {
                return;
            }

            if (concatenatedString.length + text.length > 32767) {
                exceedsCellLimit = true;
            } else {
                concatenatedString += text;
            }
        };

        for (const textValue of textValues) {
            if (textValue.isError()) {
                return textValue;
            }

            if (textValue.isArray()) {
                (textValue as ArrayValueObject).iterator((valueObject) => {
                    if (valueObject == null || valueObject.isNull()) {
                        return true; // continue
                    }

                    if (valueObject.isError()) {
                        isError = valueObject;
                        return false; // break
                    }

                    appendText(formatValueForFormulaText(valueObject.getValue()));
                });

                if (isError) {
                    return isError;
                }
            } else if (!textValue.isNull()) {
                // Direct concatenation if it's a single value
                appendText(formatValueForFormulaText(textValue.getValue()));
            }
        }

        return exceedsCellLimit ? ErrorValueObject.create(ErrorType.VALUE) : StringValueObject.create(concatenatedString);
    }
}
