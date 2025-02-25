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
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

export class Textbefore extends BaseFunction {
    override minParams = 2;

    override maxParams = 6;

    override calculate(text: BaseValueObject, delimiter: BaseValueObject, instanceNum?: BaseValueObject, matchMode?: BaseValueObject, matchEnd?: BaseValueObject, ifNotFound?: BaseValueObject) {
        let instanceNumIsNull = false; // special handle
        let _instanceNum = instanceNum ?? NumberValueObject.create(1);

        if (_instanceNum.isNull()) {
            instanceNumIsNull = true;
            _instanceNum = NumberValueObject.create(1);
        }

        const onlyThreeVariant = !matchMode;
        const _matchMode = matchMode ?? NumberValueObject.create(0);
        const _matchEnd = matchEnd ?? NumberValueObject.create(0);
        const _ifNotFound = ifNotFound ?? ErrorValueObject.create(ErrorType.NA);

        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            _instanceNum.isArray() ? (_instanceNum as ArrayValueObject).getRowCount() : 1,
            _matchMode.isArray() ? (_matchMode as ArrayValueObject).getRowCount() : 1,
            _matchEnd.isArray() ? (_matchEnd as ArrayValueObject).getRowCount() : 1,
            _ifNotFound.isArray() ? (_ifNotFound as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            _instanceNum.isArray() ? (_instanceNum as ArrayValueObject).getColumnCount() : 1,
            _matchMode.isArray() ? (_matchMode as ArrayValueObject).getColumnCount() : 1,
            _matchEnd.isArray() ? (_matchEnd as ArrayValueObject).getColumnCount() : 1,
            _ifNotFound.isArray() ? (_ifNotFound as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text, ErrorValueObject.create(ErrorType.NA));
        const instanceNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, _instanceNum, ErrorValueObject.create(ErrorType.NA));
        const matchModeArray = expandArrayValueObject(maxRowLength, maxColumnLength, _matchMode, ErrorValueObject.create(ErrorType.NA));
        const matchEndArray = expandArrayValueObject(maxRowLength, maxColumnLength, _matchEnd, ErrorValueObject.create(ErrorType.NA));
        const ifNotFoundArray = expandArrayValueObject(maxRowLength, maxColumnLength, _ifNotFound, ErrorValueObject.create(ErrorType.NA));

        const resultArray = this._getResultArray(textArray, delimiter, instanceNumArray, matchModeArray, matchEndArray, ifNotFoundArray, instanceNumIsNull, onlyThreeVariant);

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as StringValueObject;
        }

        return resultArray;
    }

    private _getResultArray(
        textArray: ArrayValueObject,
        delimiter: BaseValueObject,
        instanceNumArray: ArrayValueObject,
        matchModeArray: ArrayValueObject,
        matchEndArray: ArrayValueObject,
        ifNotFoundArray: ArrayValueObject,
        instanceNumIsNull: boolean,
        onlyThreeVariant: boolean
    ): ArrayValueObject {
        const resultArray = textArray.map((textObject, rowIndex, columnIndex) => {
            const instanceNumObject = instanceNumArray.get(rowIndex, columnIndex) as BaseValueObject;
            const matchModeObject = matchModeArray.get(rowIndex, columnIndex) as BaseValueObject;
            const matchEndObject = matchEndArray.get(rowIndex, columnIndex) as BaseValueObject;
            const ifNotFoundObject = ifNotFoundArray.get(rowIndex, columnIndex) as BaseValueObject;

            // variant error order (text > instanceNum > matchMode > matchEnd > delimiter)
            const _variantsError = this._checkVariantsError(textObject, instanceNumObject, matchModeObject, matchEndObject);

            if (_variantsError.isError()) {
                return _variantsError;
            }

            const textValue = this._getStringValue(textObject);

            const delimiterValue = this._getDelimiterValue(delimiter);

            if (delimiterValue instanceof ErrorValueObject) {
                return delimiterValue;
            }

            const _variantsNumberFloorValue = this._getVariantsNumberFloorValue(instanceNumObject, matchModeObject, matchEndObject);

            if (_variantsNumberFloorValue instanceof ErrorValueObject) {
                return _variantsNumberFloorValue;
            }

            const [instanceNumValue, matchModeValue, matchEndValue] = _variantsNumberFloorValue as number[];

            if (instanceNumValue === 0 || matchModeValue < 0 || matchModeValue > 1 || matchEndValue < 0 || matchEndValue > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            // When searching with an empty delimiter value, TEXTBEFORE matches immediately.
            // It returns empty text when searching from the front (if instance_num is positive) and the entire text when searching from the end (if instance_num is negative).
            if (delimiterValue.includes('')) {
                if (instanceNumValue > 0) {
                    return StringValueObject.create('');
                } else {
                    return StringValueObject.create(textValue);
                }
            }

            // if instance_num is greater than the length of text returns a #VALUE! error
            if (!instanceNumIsNull && Math.abs(instanceNumValue) > textValue.length) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (delimiterValue.every((item) => item.length > textValue.length)) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            return this._getResult(textValue, delimiterValue, instanceNumValue, matchModeValue, matchEndValue, ifNotFoundObject, onlyThreeVariant);
        });

        return resultArray as ArrayValueObject;
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

    private _getStringValue(variant: BaseValueObject): string {
        let value = `${variant.getValue()}`;

        if (variant.isNull()) {
            value = '';
        }

        if (variant.isBoolean()) {
            value = value.toLocaleUpperCase();
        }

        return value;
    }

    private _getDelimiterValue(delimiter: BaseValueObject): string[] | ErrorValueObject {
        const delimiterValue: string[] = [];

        if (delimiter.isArray()) {
            let isError = false;
            let errorObject = ErrorValueObject.create(ErrorType.VALUE);

            (delimiter as ArrayValueObject).iterator((delimiterObject) => {
                const _delimiterObject = delimiterObject as BaseValueObject;

                if (_delimiterObject.isError()) {
                    isError = true;
                    errorObject = _delimiterObject as ErrorValueObject;
                    return false;
                }

                delimiterValue.push(this._getStringValue(_delimiterObject));
            });

            if (isError) {
                return errorObject;
            }
        } else {
            if (delimiter.isError()) {
                return delimiter as ErrorValueObject;
            }

            delimiterValue.push(this._getStringValue(delimiter));
        }

        return delimiterValue;
    }

    private _getVariantsNumberFloorValue(...variants: BaseValueObject[]) {
        const values: number[] = [];

        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

            if (variant.isString()) {
                variant = variant.convertToNumberObjectValue();
            }

            if (variant.isError()) {
                return variant;
            }

            const value = Math.floor(+variant.getValue());

            values.push(value);
        }

        return values;
    }

    private _getResult(
        textValue: string,
        delimiterValue: string[],
        instanceNumValue: number,
        matchModeValue: number,
        matchEndValue: number,
        ifNotFoundObject: BaseValueObject,
        onlyThreeVariant: boolean
    ): BaseValueObject {
        let substrText = !matchModeValue ? textValue : textValue.toLocaleLowerCase();
        const _delimiterValue = !matchModeValue ? delimiterValue : delimiterValue.map((item) => item.toLocaleLowerCase());

        let resultIndex = 0;
        let matchNum = 0;
        let preDelimiterLength = 0;

        for (let i = 0; i < Math.abs(instanceNumValue); i++) {
            if (instanceNumValue < 0) {
                const delimiterItem = _delimiterValue.map((item) => {
                    return {
                        index: substrText.lastIndexOf(item),
                        length: item.length,
                    };
                }).filter((item) => item.index !== -1).sort((a, b) => b.index - a.index)[0];

                if (!delimiterItem) {
                    break;
                }

                resultIndex = delimiterItem.index;
                substrText = substrText.substr(0, delimiterItem.index);
                matchNum++;
            } else {
                const delimiterItem = _delimiterValue.map((item) => {
                    return {
                        index: substrText.indexOf(item),
                        length: item.length,
                    };
                }).filter((item) => item.index !== -1).sort((a, b) => a.index - b.index)[0];

                if (!delimiterItem) {
                    break;
                }

                resultIndex += delimiterItem.index + preDelimiterLength;
                substrText = substrText.substr(delimiterItem.index + delimiterItem.length);
                preDelimiterLength = delimiterItem.length;
                matchNum++;
            }
        }

        // only three variant and if instance_num is greater than the number of occurrences of delimiter. returns a #N/A error
        if (matchNum && matchNum < Math.abs(instanceNumValue) && onlyThreeVariant) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (!matchNum || matchNum < Math.abs(instanceNumValue)) {
            if (matchEndValue) {
                if (instanceNumValue > 0) {
                    return StringValueObject.create(textValue);
                } else {
                    return StringValueObject.create('');
                }
            }

            return ifNotFoundObject;
        }

        const result = textValue.substr(0, resultIndex);

        return StringValueObject.create(result);
    }
}
