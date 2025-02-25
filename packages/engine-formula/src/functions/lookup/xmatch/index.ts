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

import { ErrorType } from '../../../basics/error-type';
import { compareToken } from '../../../basics/token';
import { ArrayOrderSearchType, getMatchModeValue, getSearchModeValue } from '../../../engine/utils/compare';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';

export class Xmatch extends BaseFunction {
    override minParams = 2;

    override maxParams = 4;

    override calculate(
        lookupValue: BaseValueObject,
        lookupArray: ArrayValueObject,
        matchMode?: BaseValueObject,
        searchMode?: BaseValueObject
    ) {
        if (lookupValue.isError()) {
            return lookupValue;
        }

        if (lookupArray.isError()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (!lookupArray.isArray()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const rowCountLookup = lookupArray.getRowCount();

        const columnCountLookup = lookupArray.getColumnCount();

        if (rowCountLookup !== 1 && columnCountLookup !== 1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (matchMode?.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (searchMode?.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const matchModeValue = this.getIndexNumValue(matchMode || NumberValueObject.create(0));

        if (matchModeValue instanceof ErrorValueObject) {
            return matchModeValue;
        }

        const searchModeValue = this.getIndexNumValue(searchMode || NumberValueObject.create(1));

        if (searchModeValue instanceof ErrorValueObject) {
            return searchModeValue;
        }

        if (lookupValue.isArray()) {
            return lookupValue.map((value) => this._handleSingleObject(
                value,
                lookupArray,
                matchModeValue,
                searchModeValue
            ));
        }

        return this._handleSingleObject(
            lookupValue,
            lookupArray,
            matchModeValue,
            searchModeValue
        );
    }

    private _handleSingleObject(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        matchModeValue: number,
        searchModeValue: number
    ) {
        let rowOrColumn: Nullable<number>;
        if ((searchModeValue === 2 || searchModeValue === -2) && matchModeValue !== 2) {
            const searchType = getSearchModeValue(searchModeValue);
            const matchType = getMatchModeValue(matchModeValue);
            rowOrColumn = searchArray.binarySearch(value, searchType, matchType);
        } else if (matchModeValue === 2) {
            const matchObject = searchArray.compare(value, compareToken.EQUALS) as ArrayValueObject;

            let position: Nullable<{ row: number; column: number }>;

            if (searchModeValue !== -1) {
                position = matchObject.getFirstTruePosition();
            } else {
                position = matchObject.getLastTruePosition();
            }
            if (position == null) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            rowOrColumn = searchArray.getRowCount() === 1 ? position.column : position.row;
        } else if (matchModeValue === -1 || matchModeValue === 1) {
            const position = searchArray.orderSearch(value, matchModeValue === 1 ? ArrayOrderSearchType.MAX : ArrayOrderSearchType.MIN, searchModeValue === -1);

            if (position == null) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            if (position instanceof ErrorValueObject) {
                return position;
            }

            rowOrColumn = searchArray.getRowCount() === 1 ? position.column : position.row;
        } else {
            const matchObject = searchArray.isEqual(value) as ArrayValueObject;

            let position: Nullable<{ row: number; column: number }>;

            if (searchModeValue !== -1) {
                position = matchObject.getFirstTruePosition();
            } else {
                position = matchObject.getLastTruePosition();
            }

            if (position == null) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            rowOrColumn = searchArray.getRowCount() === 1 ? position.column : position.row;
        }

        if (rowOrColumn == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        return NumberValueObject.create(rowOrColumn + 1);
    }
}
