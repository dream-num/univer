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
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Textjoin extends BaseFunction {
    override minParams = 3;

    override maxParams = 255;

    override calculate(delimiter: BaseValueObject, ignoreEmpty: BaseValueObject, ...variants: BaseValueObject[]): BaseValueObject {
        const delimiterValues = this._getDelimiterValues(delimiter);
        const textValues = this._getTextValues(variants);

        if (ignoreEmpty.isArray()) {
            const resultArray = ignoreEmpty.mapValue((ignoreEmptyObject) => this._handleSingleObject(delimiterValues, ignoreEmptyObject, textValues));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        const _ignoreEmpty = ignoreEmpty;

        if (_ignoreEmpty.isString()) {
            const ignoreEmptyValue = `${_ignoreEmpty.getValue()}`.toLocaleUpperCase();

            if (ignoreEmptyValue === 'TRUE') {
                return this._handleSingleObject(delimiterValues, BooleanValueObject.create(true), textValues);
            }

            if (ignoreEmptyValue === 'FALSE') {
                return this._handleSingleObject(delimiterValues, BooleanValueObject.create(false), textValues);
            }
        }

        return this._handleSingleObject(delimiterValues, ignoreEmpty, textValues);
    }

    private _handleSingleObject(delimiterValues: string[] | ErrorValueObject, ignoreEmpty: BaseValueObject, textValues: Array<string | null> | ErrorValueObject): BaseValueObject {
        if (delimiterValues instanceof ErrorValueObject) {
            return delimiterValues as ErrorValueObject;
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(ignoreEmpty);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        if (textValues instanceof ErrorValueObject) {
            return textValues as ErrorValueObject;
        }

        const [ignoreEmptyObject] = variants as BaseValueObject[];

        const ignoreEmptyValue = +ignoreEmptyObject.getValue();

        let _textValues = textValues;

        if (ignoreEmptyValue) {
            _textValues = textValues.filter((value) => value !== null);
        }

        let result = '';

        for (let i = 0; i < _textValues.length; i++) {
            if (_textValues[i] !== null) {
                result += _textValues[i];
            }

            if (i < _textValues.length - 1) {
                result += delimiterValues[i % delimiterValues.length];
            }
        }

        return StringValueObject.create(result);
    }

    private _getDelimiterValues(delimiter: BaseValueObject): string[] | ErrorValueObject {
        const delimiterValues: string[] = [];

        const rowCount = delimiter.isArray() ? (delimiter as ArrayValueObject).getRowCount() : 1;
        const columnCount = delimiter.isArray() ? (delimiter as ArrayValueObject).getColumnCount() : 1;

        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < columnCount; c++) {
                const valueObject = delimiter.isArray() ? (delimiter as ArrayValueObject).get(r, c) as BaseValueObject : delimiter;

                if (valueObject.isError()) {
                    return valueObject as ErrorValueObject;
                }

                let value = `${valueObject.getValue()}`;

                if (valueObject.isNull()) {
                    value = '';
                }

                if (valueObject.isBoolean()) {
                    value = value.toLocaleUpperCase();
                }

                delimiterValues.push(value);
            }
        }

        return delimiterValues;
    }

    private _getTextValues(variants: BaseValueObject[]): Array<string | null> | ErrorValueObject {
        const textValues: Array<string | null> = [];

        for (const variant of variants) {
            const rowCount = variant.isArray() ? (variant as ArrayValueObject).getRowCount() : 1;
            const columnCount = variant.isArray() ? (variant as ArrayValueObject).getColumnCount() : 1;

            for (let r = 0; r < rowCount; r++) {
                for (let c = 0; c < columnCount; c++) {
                    const valueObject = variant.isArray() ? (variant as ArrayValueObject).get(r, c) as BaseValueObject : variant;

                    if (valueObject.isError()) {
                        return valueObject as ErrorValueObject;
                    }

                    if (valueObject.isNull()) {
                        textValues.push(null);
                        continue;
                    }

                    let value = `${valueObject.getValue()}`;

                    if (valueObject.isBoolean()) {
                        value = value.toLocaleUpperCase();
                    }

                    textValues.push(value);
                }
            }
        }

        return textValues;
    }
}
