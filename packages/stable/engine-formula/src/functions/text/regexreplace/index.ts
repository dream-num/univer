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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsArray } from '../../../engine/utils/check-variant-error';
import { handleRegExp } from '../../../engine/utils/regexp-check';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Regexreplace extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(text: BaseValueObject, regularExpression: BaseValueObject, replacement: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArray(text, regularExpression, replacement);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [textObject, regularExpressionObject, replacementObject] = variants as BaseValueObject[];

        let textValue = textObject.getValue();

        if (textObject.isNull()) {
            textValue = '';
        }

        if (textObject.isBoolean()) {
            textValue = textValue ? 'TRUE' : 'FALSE';
        }

        textValue = `${textValue}`;

        let regularExpressionValue = regularExpressionObject.getValue();

        if (regularExpressionObject.isNull()) {
            regularExpressionValue = '';
        }

        if (regularExpressionObject.isBoolean()) {
            regularExpressionValue = regularExpressionValue ? 'TRUE' : 'FALSE';
        }

        regularExpressionValue = `${regularExpressionValue}`;

        let replacementValue = replacementObject.getValue();

        if (replacementObject.isNull()) {
            replacementValue = '';
        }

        if (replacementObject.isBoolean()) {
            replacementValue = replacementValue ? 'TRUE' : 'FALSE';
        }

        replacementValue = `${replacementValue}`;

        const { isError: isError_regExp, regExp } = handleRegExp(regularExpressionValue, true);

        if (isError_regExp) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const result = textValue.replace(regExp as RegExp, replacementValue);

        return StringValueObject.create(result);
    }
}
