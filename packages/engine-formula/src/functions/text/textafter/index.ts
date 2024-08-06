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
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Textafter extends BaseFunction {
    override minParams = 2;

    override maxParams = 6;

    override calculate(text: BaseValueObject, delimiter: BaseValueObject, instanceNum?: BaseValueObject, matchMode?: BaseValueObject, matchEnd?: BaseValueObject, ifNotFound?: BaseValueObject) {
        let _delimiter = delimiter;

        if (_delimiter.isArray()) {
            _delimiter = (_delimiter as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

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

        const resultArray = this._getResultArray(textArray, _delimiter, instanceNumArray, matchModeArray, matchEndArray, ifNotFoundArray, instanceNumIsNull, onlyThreeVariant);

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as StringValueObject;
        }

        return resultArray;
    }

    private _getResultArray(
        textArray: ArrayValueObject,
        delimiterObject: BaseValueObject,
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
            const _variantsError = this._checkVariantsError(textObject, instanceNumObject, matchModeObject, matchEndObject, delimiterObject);

            if (_variantsError.isError()) {
                return _variantsError;
            }

            const textValue = this._getStringValue(textObject);
            const delimiterValue = this._getStringValue(delimiterObject);

            const _variantsNumberFloorValue = this._getVariantsNumberFloorValue(instanceNumObject, matchModeObject, matchEndObject);

            if (_variantsNumberFloorValue instanceof ErrorValueObject) {
                return _variantsNumberFloorValue;
            }

            const [instanceNumValue, matchModeValue, matchEndValue] = _variantsNumberFloorValue as number[];

            if (instanceNumValue === 0 || matchModeValue < 0 || matchModeValue > 1 || matchEndValue < 0 || matchEndValue > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            // When searching with an empty delimiter value, TEXTAFTER matches immediately.
            // It returns the entire text when searching from the front (if instance_num is positive) and empty text when searching from the end (if instance_num is negative).
            if (delimiterValue === '') {
                if (instanceNumValue > 0) {
                    return StringValueObject.create(textValue);
                } else {
                    return StringValueObject.create('');
                }
            }

            // if instance_num is greater than the length of text returns a #VALUE! error
            if (!instanceNumIsNull && Math.abs(instanceNumValue) > textValue.length) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (delimiterValue.length > textValue.length) {
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
        delimiterValue: string,
        instanceNumValue: number,
        matchModeValue: number,
        matchEndValue: number,
        ifNotFoundObject: BaseValueObject,
        onlyThreeVariant: boolean
    ): BaseValueObject {
        const matchNum = textValue.match(new RegExp(delimiterValue, `g${!matchModeValue ? '' : 'i'}`));

        // only three variant and if instance_num is greater than the number of occurrences of delimiter. returns a #N/A error
        if (matchNum && matchNum.length < Math.abs(instanceNumValue) && onlyThreeVariant) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (!matchNum || matchNum.length < Math.abs(instanceNumValue)) {
            if (matchEndValue) {
                if (instanceNumValue > 0) {
                    return StringValueObject.create('');
                } else {
                    return StringValueObject.create(textValue);
                }
            }

            return ifNotFoundObject;
        }

        let substrText = !matchModeValue ? textValue : textValue.toLocaleLowerCase();
        const _delimiterValue = !matchModeValue ? delimiterValue : delimiterValue.toLocaleLowerCase();

        let resultIndex = 0;

        for (let i = 0; i < Math.abs(instanceNumValue); i++) {
            if (instanceNumValue < 0) {
                const index = substrText.lastIndexOf(_delimiterValue);
                resultIndex = index;
                substrText = substrText.substr(0, index);
            } else {
                const index = substrText.indexOf(_delimiterValue);
                resultIndex += (index + i * _delimiterValue.length);
                substrText = substrText.substr(index + _delimiterValue.length);
            }
        }

        const result = textValue.substr(resultIndex + _delimiterValue.length);

        return StringValueObject.create(result);
    }
}
