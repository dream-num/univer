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
import { getTextValueOfNumberFormat } from '../../../basics/format';
import { ErrorValueObject, formatValueForFormulaText } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import { formatExcelTextNumber } from '../../text/format-excel-text-number';

export class Encodeurl extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(text: BaseValueObject): BaseValueObject {
        if (text.isArray()) {
            const resultArray = (text as ArrayValueObject).mapValue((textObject) => this._handleSingleObject(textObject));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(text);
    }

    protected _handleSingleObject(text: BaseValueObject): BaseValueObject {
        if (text.isError()) {
            return text;
        }

        const textValue = getTextValueOfNumberFormat(text);

        return StringValueObject.create(encodeUrlComponent(textValue));
    }
}

export class ExcelEncodeurl extends Encodeurl {
    protected override _handleSingleObject(value: BaseValueObject): BaseValueObject {
        if (value.isError()) return value;
        if (value.isNull()) return StringValueObject.create('');
        const text = value.isNumber()
            ? formatExcelTextNumber(Number(value.getValue()))
            : formatValueForFormulaText(value.getValue());
        if (text.length > 32766 || /[\uD800-\uDFFF]/u.test(text)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        const encoded = encodeUrlComponent(text);
        return encoded.length > 32766 ? ErrorValueObject.create(ErrorType.VALUE) : StringValueObject.create(encoded);
    }
}

function encodeUrlComponent(value: string): string {
    return encodeURIComponent(value).replace(/[!~'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}
