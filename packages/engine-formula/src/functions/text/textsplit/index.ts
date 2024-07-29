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
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Textsplit extends BaseFunction {
    override minParams = 2;

    override maxParams = 6;

    override calculate(text: BaseValueObject, colDelimiter: BaseValueObject, rowDelimiter?: BaseValueObject, ignoreEmpty?: BaseValueObject, matchMode?: BaseValueObject, padWith?: BaseValueObject) {
        rowDelimiter = rowDelimiter ?? StringValueObject.create('\\s');
        ignoreEmpty = ignoreEmpty ?? NumberValueObject.create(0);
        matchMode = matchMode ?? NumberValueObject.create(0);
        padWith = padWith ?? StringValueObject.create(ErrorType.NA);

        const colDelimiterValue: string[] = [];

        if (colDelimiter.isArray()) {
            (colDelimiter as ArrayValueObject).iterator((colDelimiterObject) => {
                if (colDelimiterObject?.isError()) {
                    colDelimiter = colDelimiterObject;
                    return false;
                }

                if (colDelimiterObject?.isNull()) {
                    colDelimiter = ErrorValueObject.create(ErrorType.VALUE);
                    return false;
                }

                const delimiterValue = this._getRegExpStringValue(colDelimiterObject as BaseValueObject);

                if (delimiterValue === '') {
                    colDelimiter = ErrorValueObject.create(ErrorType.VALUE);
                    return false;
                }

                colDelimiterValue.push(delimiterValue);
            });
        } else {
            const delimiterValue = this._getRegExpStringValue(colDelimiter);

            if (delimiterValue === '') {
                colDelimiter = ErrorValueObject.create(ErrorType.VALUE);
            }

            colDelimiterValue.push(delimiterValue);
        }

        const rowDelimiterValue: string[] = [];

        if (rowDelimiter.isArray()) {
            (rowDelimiter as ArrayValueObject).iterator((rowDelimiterObject) => {
                if (rowDelimiterObject?.isError()) {
                    rowDelimiter = rowDelimiterObject;
                    return false;
                }

                if (rowDelimiterObject?.isNull()) {
                    rowDelimiter = ErrorValueObject.create(ErrorType.VALUE);
                    return false;
                }

                const delimiterValue = this._getRegExpStringValue(rowDelimiterObject as BaseValueObject);

                if (delimiterValue === '') {
                    rowDelimiter = ErrorValueObject.create(ErrorType.VALUE);
                    return false;
                }

                rowDelimiterValue.push(delimiterValue);
            });
        } else {
            const delimiterValue = this._getRegExpStringValue(rowDelimiter);

            if (delimiterValue === '') {
                rowDelimiter = ErrorValueObject.create(ErrorType.VALUE);
            }

            rowDelimiterValue.push(delimiterValue);
        }

        let padWithRowCount = 1;
        let padWithColumnCount = 1;

        if (padWith.isArray()) {
            padWithRowCount = (padWith as ArrayValueObject).getRowCount();
            padWithColumnCount = (padWith as ArrayValueObject).getColumnCount();

            if (padWithRowCount === 1 && padWithColumnCount === 1) {
                padWith = (padWith as ArrayValueObject).get(0, 0) as BaseValueObject;
            }
        }

        // get max row length
        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            ignoreEmpty.isArray() ? (ignoreEmpty as ArrayValueObject).getRowCount() : 1,
            matchMode.isArray() ? (matchMode as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            ignoreEmpty.isArray() ? (ignoreEmpty as ArrayValueObject).getColumnCount() : 1,
            matchMode.isArray() ? (matchMode as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text, ErrorValueObject.create(ErrorType.NA));
        const ignoreEmptyArray = expandArrayValueObject(maxRowLength, maxColumnLength, ignoreEmpty, ErrorValueObject.create(ErrorType.NA));
        const matchModeArray = expandArrayValueObject(maxRowLength, maxColumnLength, matchMode, ErrorValueObject.create(ErrorType.NA));

        const resultArray = textArray.map((textObject, rowIndex, columnIndex) => {
            let ignoreEmptyObject = ignoreEmptyArray.get(rowIndex, columnIndex) as BaseValueObject;
            let matchModeObject = matchModeArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (textObject.isError()) {
                return textObject;
            }

            if (colDelimiter.isError()) {
                return colDelimiter;
            }

            if ((rowDelimiter as BaseValueObject).isError()) {
                return rowDelimiter as ErrorValueObject;
            }

            if (ignoreEmptyObject.isError()) {
                return ignoreEmptyObject;
            }

            if (matchModeObject.isError()) {
                return matchModeObject;
            }

            if (textObject.isNull()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (padWithRowCount > 1 || padWithColumnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            let textValue = textObject.getValue() as string;

            if (textObject.isBoolean()) {
                textValue = textValue ? 'TRUE' : 'FALSE';
            }

            textValue += '';

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

            let padWithValue = padWith.getValue() as string;

            if (padWith.isBoolean()) {
                padWithValue = padWithValue ? 'TRUE' : 'FALSE';
            }

            padWithValue += '';

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
                if (row.length < resultColsMaxCount) {
                    row = row.concat(new Array(resultColsMaxCount - row.length).fill(padWithValue));
                }

                return row;
            });

            return ArrayValueObject.createByArray(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as ArrayValueObject;
        } else {
            return resultArray.map((item) => (item as ArrayValueObject).get(0, 0) as BaseValueObject);
        }
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
