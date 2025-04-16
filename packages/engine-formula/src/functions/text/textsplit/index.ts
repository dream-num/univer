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
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Textsplit extends BaseFunction {
    override minParams = 2;

    override maxParams = 6;

    override calculate(text: BaseValueObject, colDelimiter: BaseValueObject, rowDelimiter?: BaseValueObject, ignoreEmpty?: BaseValueObject, matchMode?: BaseValueObject, padWith?: BaseValueObject) {
        let _rowDelimiter = rowDelimiter ?? StringValueObject.create('\\s');
        const _ignoreEmpty = ignoreEmpty ?? NumberValueObject.create(0);
        const _matchMode = matchMode ?? NumberValueObject.create(0);
        const _padWith = padWith ?? StringValueObject.create(ErrorType.NA);

        const { _variant: _colDelimiter, values: colDelimiterValue } = this._getStringValues(colDelimiter);

        const { _variant, values: rowDelimiterValue } = this._getStringValues(_rowDelimiter, false);
        _rowDelimiter = _variant;

        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            _ignoreEmpty.isArray() ? (_ignoreEmpty as ArrayValueObject).getRowCount() : 1,
            _matchMode.isArray() ? (_matchMode as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            _ignoreEmpty.isArray() ? (_ignoreEmpty as ArrayValueObject).getColumnCount() : 1,
            _matchMode.isArray() ? (_matchMode as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text, ErrorValueObject.create(ErrorType.NA));
        const ignoreEmptyArray = expandArrayValueObject(maxRowLength, maxColumnLength, _ignoreEmpty, ErrorValueObject.create(ErrorType.NA));
        const matchModeArray = expandArrayValueObject(maxRowLength, maxColumnLength, _matchMode, ErrorValueObject.create(ErrorType.NA));

        const resultArray = this._getResultArray(
            textArray,
            _colDelimiter,
            _rowDelimiter,
            ignoreEmptyArray,
            matchModeArray,
            _padWith,
            colDelimiterValue,
            rowDelimiterValue
        );

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as ArrayValueObject;
        } else {
            return resultArray.map((item) => (item as ArrayValueObject).get(0, 0) as BaseValueObject);
        }
    }

    private _getStringValues(variant: BaseValueObject, isNotNull = true) {
        let _variant = variant;
        const values: string[] = [];

        if (_variant.isArray()) {
            (_variant as ArrayValueObject).iterator((variantObject) => {
                if (variantObject?.isError()) {
                    _variant = variantObject;
                    return false;
                }

                if (variantObject?.isNull() && isNotNull) {
                    _variant = ErrorValueObject.create(ErrorType.VALUE);
                    return false;
                }

                const value = this._getRegExpStringValue(variantObject as BaseValueObject);

                if (value === '') {
                    _variant = ErrorValueObject.create(ErrorType.VALUE);
                    return false;
                }

                values.push(value);
            });
        } else {
            if (_variant.isNull() && isNotNull) {
                _variant = ErrorValueObject.create(ErrorType.VALUE);
            }

            const value = this._getRegExpStringValue(_variant);

            if (value === '') {
                _variant = ErrorValueObject.create(ErrorType.VALUE);
            }

            values.push(value);
        }

        return {
            _variant,
            values,
        };
    }

    private _getResultArray(
        textArray: ArrayValueObject,
        colDelimiter: BaseValueObject,
        rowDelimiter: BaseValueObject,
        ignoreEmptyArray: ArrayValueObject,
        matchModeArray: ArrayValueObject,
        padWith: BaseValueObject,
        colDelimiterValue: string[],
        rowDelimiterValue: string[]
    ) {
        const resultArray = textArray.map((textObject, rowIndex, columnIndex) => {
            let ignoreEmptyObject = ignoreEmptyArray.get(rowIndex, columnIndex) as BaseValueObject;
            let matchModeObject = matchModeArray.get(rowIndex, columnIndex) as BaseValueObject;

            const _variantsError = this._checkVariantsError(textObject, colDelimiter, rowDelimiter, ignoreEmptyObject, matchModeObject);

            if (_variantsError.isError()) {
                return _variantsError;
            }

            if (textObject.isNull()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            let _padWith = padWith;

            if (_padWith.isArray()) {
                const padWithRowCount = (_padWith as ArrayValueObject).getRowCount();
                const padWithColumnCount = (_padWith as ArrayValueObject).getColumnCount();

                if (padWithRowCount > 1 || padWithColumnCount > 1) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                _padWith = (_padWith as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            let textValue = `${textObject.getValue()}`;

            if (textObject.isBoolean()) {
                textValue = textValue.toLocaleUpperCase();
            }

            if (ignoreEmptyObject.isString()) {
                ignoreEmptyObject = ignoreEmptyObject.convertToNumberObjectValue();

                if (ignoreEmptyObject.isError()) {
                    return ignoreEmptyObject;
                }
            }

            const ignoreEmptyValue = Math.floor(+ignoreEmptyObject.getValue());

            if (matchModeObject.isString()) {
                matchModeObject = matchModeObject.convertToNumberObjectValue();

                if (matchModeObject.isError()) {
                    return matchModeObject;
                }
            }

            const matchModeValue = Math.floor(+matchModeObject.getValue());

            if (matchModeValue < 0 || matchModeValue > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            let padWithValue = `${_padWith.getValue()}`;

            if (_padWith.isBoolean()) {
                padWithValue = padWithValue.toLocaleUpperCase();
            }

            return this._getResult(textValue, colDelimiterValue, rowDelimiterValue, ignoreEmptyValue, matchModeValue, padWithValue);
        });

        return resultArray;
    }

    private _getResult(
        textValue: string,
        colDelimiterValue: string[],
        rowDelimiterValue: string[],
        ignoreEmptyValue: number,
        matchModeValue: number,
        padWithValue: string
    ) {
        const rowDelimiterRegExp = new RegExp(rowDelimiterValue.join('|'), `g${!matchModeValue ? '' : 'i'}`);
        const colDelimiterRegExp = new RegExp(colDelimiterValue.join('|'), `g${!matchModeValue ? '' : 'i'}`);

        const resultRows = textValue.split(rowDelimiterRegExp);

        let resultColsMaxCount = 1;

        let result = resultRows.map((row) => {
            let cols = row.split(colDelimiterRegExp);

            if (ignoreEmptyValue) {
                cols = cols.filter((col) => col !== '');
            }

            resultColsMaxCount = Math.max(resultColsMaxCount, cols.length);

            return cols;
        });

        result = result.map((row) => {
            let _row = row;

            if (_row.length < resultColsMaxCount) {
                _row = _row.concat(new Array(resultColsMaxCount - _row.length).fill(padWithValue));
            }

            return _row;
        });

        return ArrayValueObject.createByArray(result);
    }

    private _checkVariantsError(...variantas: BaseValueObject[]) {
        for (let i = 0; i < variantas.length; i++) {
            const variant = variantas[i];

            if (variant.isError()) {
                return variant;
            }
        }

        return BooleanValueObject.create(true);
    }

    private _getRegExpStringValue(valueObject: BaseValueObject): string {
        let value = valueObject.getValue() as string;

        if (valueObject.isNull()) {
            value = '\\s';
        }

        if (valueObject.isBoolean()) {
            value = value ? 'TRUE' : 'FALSE';
        }

        value += '';

        return this._escapeRegExp(value);
    }

    private _escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
