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
import { handleRegExp } from '../../../engine/utils/regexp-check';
import { ErrorValueObject, formatValueForFormulaText } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Regextest extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(text: BaseValueObject, pattern: BaseValueObject, caseSensitivity: BaseValueObject = NumberValueObject.create(0)): BaseValueObject {
        let lastPattern: string | undefined;
        let lastIgnoreCase: boolean | undefined;
        let regex: RegExp | null = null;
        const test = (value: BaseValueObject, patternValue: BaseValueObject, sensitivity: BaseValueObject): BaseValueObject => {
            for (const argument of [value, patternValue, sensitivity]) {
                if (argument.isError()) {
                    return argument;
                }
            }

            const flag = sensitivity.isString() ? sensitivity.convertToNumberObjectValue() : sensitivity;
            const mode = Math.floor(Number(flag.getValue()));
            if (mode !== 0 && mode !== 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
            const patternText = patternValue.isNull() ? '' : formatValueForFormulaText(patternValue.getValue());
            const inlineIgnoreCase = patternText.startsWith('(?i)');
            const ignoreCase = mode === 1 || inlineIgnoreCase;
            if (patternText !== lastPattern || ignoreCase !== lastIgnoreCase) {
                regex = handleRegExp(inlineIgnoreCase ? patternText.slice(4) : patternText, false, ignoreCase).regExp;
                lastPattern = patternText;
                lastIgnoreCase = ignoreCase;
            }
            return regex
                ? BooleanValueObject.create(regex.test(value.isNull() ? '' : formatValueForFormulaText(value.getValue())))
                : ErrorValueObject.create(ErrorType.VALUE);
        };

        const inputs = [text, pattern, caseSensitivity];
        const arrays = inputs.filter((input): input is ArrayValueObject => input.isArray());
        if (arrays.length === 0) {
            return test(text, pattern, caseSensitivity);
        }

        const rows = Math.max(...arrays.map((input) => input.getRowCount()));
        const columns = Math.max(...arrays.map((input) => input.getColumnCount()));
        const missing = ErrorValueObject.create(ErrorType.NA);
        const [values, patterns, modes] = inputs.map((input) => expandArrayValueObject(rows, columns, input, missing));
        return values.mapValue((value, row, column) => test(
            value ?? missing,
            patterns.getValueOrDefault(row, column) ?? missing,
            modes.getValueOrDefault(row, column) ?? missing
        ));
    }
}
