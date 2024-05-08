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
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Lower extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(text: BaseValueObject) {
        if (text.isError()) {
            return text;
        }

        if (text.isArray()) {
            return text.mapValue((textValue: BaseValueObject) => {
                return this._handleSingleText(textValue);
            });
        }

        return this._handleSingleText(text);
    }

    private _handleSingleText(text: BaseValueObject) {
        if (text.isError()) {
            return text;
        }

        if (text.isNull()) {
            return StringValueObject.create('');
        }

        if (text.isString() || text.isBoolean() || text.isNumber()) {
            const textValue = text.getValue().toString().toLowerCase();
            return StringValueObject.create(textValue);
        }

        return ErrorValueObject.create(ErrorType.VALUE);
    }
}
