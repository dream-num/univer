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

import type { Nullable } from '@univerjs/core';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { compareToken } from '../../../basics/token';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ArrayOrderSearchType, getMatchModeValue, getSearchModeValue } from '../../../engine/utils/compare';
import { baseValueObjectToArrayValueObject } from '../../../engine/utils/value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Xmatch extends BaseFunction {
    override minParams = 2;

    override maxParams = 4;

    override calculate(lookupValue: BaseValueObject, lookupArray: BaseValueObject, matchMode?: BaseValueObject, searchMode?: BaseValueObject): BaseValueObject {
        let _matchMode: BaseValueObject = NumberValueObject.create(0);
        if (matchMode && !matchMode.isNull()) {
            _matchMode = matchMode;
        }

        let _searchMode: BaseValueObject = NumberValueObject.create(1);
        if (searchMode && !searchMode.isNull()) {
            _searchMode = searchMode;
        }

        const maxRowLength = Math.max(
            lookupValue.isArray() ? (lookupValue as ArrayValueObject).getRowCount() : 1,
            _matchMode.isArray() ? (_matchMode as ArrayValueObject).getRowCount() : 1,
            _searchMode.isArray() ? (_searchMode as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            lookupValue.isArray() ? (lookupValue as ArrayValueObject).getColumnCount() : 1,
            _matchMode.isArray() ? (_matchMode as ArrayValueObject).getColumnCount() : 1,
            _searchMode.isArray() ? (_searchMode as ArrayValueObject).getColumnCount() : 1
        );

        const lookupValueArray = expandArrayValueObject(maxRowLength, maxColumnLength, lookupValue, ErrorValueObject.create(ErrorType.NA));
        const matchModeArray = expandArrayValueObject(maxRowLength, maxColumnLength, _matchMode, ErrorValueObject.create(ErrorType.NA));
        const searchModeArray = expandArrayValueObject(maxRowLength, maxColumnLength, _searchMode, ErrorValueObject.create(ErrorType.NA));

        const resultArray = lookupValueArray.mapValue((lookupValueObject, rowIndex, columnIndex) => {
            if (lookupValueObject.isError()) {
                return lookupValueObject;
            }

            const matchModeObject = matchModeArray.get(rowIndex, columnIndex) as BaseValueObject;
            const searchModeObject = searchModeArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (matchModeObject.isError()) {
                return matchModeObject;
            }

            if (searchModeObject.isError()) {
                return searchModeObject;
            }

            return this._handleSingleObject(lookupValueObject, lookupArray, matchModeObject, searchModeObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(lookupValue: BaseValueObject, lookupArray: BaseValueObject, matchMode: BaseValueObject, searchMode: BaseValueObject): BaseValueObject {
        const lookupArrayRowCount = lookupArray.isArray() ? (lookupArray as ArrayValueObject).getRowCount() : 1;
        const lookupArrayColumnCount = lookupArray.isArray() ? (lookupArray as ArrayValueObject).getColumnCount() : 1;

        // Single row or single column
        if (lookupArrayRowCount !== 1 && lookupArrayColumnCount !== 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let _matchMode = matchMode;

        if (matchMode.isString() || matchMode.isBoolean() || matchMode.isNull()) {
            _matchMode = matchMode.convertToNumberObjectValue();
        }

        if (_matchMode.isError()) {
            return _matchMode;
        }

        let _searchMode = searchMode;

        if (searchMode.isString() || searchMode.isBoolean() || searchMode.isNull()) {
            _searchMode = searchMode.convertToNumberObjectValue();
        }

        if (_searchMode.isError()) {
            return _searchMode;
        }

        const matchModeValue = (_matchMode as NumberValueObject).getValue();
        const searchModeValue = (_searchMode as NumberValueObject).getValue();

        if (![-1, 0, 1, 2].includes(matchModeValue) || ![-1, 1, 2].includes(searchModeValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return this._getResult(lookupValue, lookupArray, matchModeValue, searchModeValue);
    }

    private _getResult(lookupValue: BaseValueObject, lookupArray: BaseValueObject, matchMode: number, searchMode: number) {
        const _lookupArray = baseValueObjectToArrayValueObject(lookupArray);

        let rowOrColumn: Nullable<number>;

        if ((searchMode === 2 || searchMode === -2) && matchMode !== 2) {
            const searchType = getSearchModeValue(searchMode);
            const matchType = getMatchModeValue(matchMode);
            rowOrColumn = _lookupArray.binarySearch(lookupValue, searchType, matchType);
        } else if (matchMode === 2) {
            const matchObject = _lookupArray.compare(lookupValue, compareToken.EQUALS) as ArrayValueObject;

            let position: Nullable<{ row: number; column: number }>;

            if (searchMode !== -1) {
                position = matchObject.getFirstTruePosition();
            } else {
                position = matchObject.getLastTruePosition();
            }
            if (position == null) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            rowOrColumn = _lookupArray.getRowCount() === 1 ? position.column : position.row;
        } else if (matchMode === -1 || matchMode === 1) {
            const position = _lookupArray.orderSearch(lookupValue, matchMode === 1 ? ArrayOrderSearchType.MAX : ArrayOrderSearchType.MIN, searchMode === -1);

            if (position == null) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            if (position instanceof ErrorValueObject) {
                return position;
            }

            rowOrColumn = _lookupArray.getRowCount() === 1 ? position.column : position.row;
        } else {
            const matchObject = _lookupArray.isEqual(lookupValue) as ArrayValueObject;

            let position: Nullable<{ row: number; column: number }>;

            if (searchMode !== -1) {
                position = matchObject.getFirstTruePosition();
            } else {
                position = matchObject.getLastTruePosition();
            }

            if (position == null) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            rowOrColumn = _lookupArray.getRowCount() === 1 ? position.column : position.row;
        }

        if (rowOrColumn == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        return NumberValueObject.create(rowOrColumn + 1);
    }
}
