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
import { ArrayOrderSearchType } from '../../../engine/utils/compare';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Match extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(
        lookupValue: BaseValueObject,
        lookupArray: ArrayValueObject,
        matchType?: BaseValueObject
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
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (matchType?.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const matchTypeValue = this.getMatchTypeValue(matchType);

        if (matchTypeValue == null) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (lookupValue.isArray()) {
            return lookupValue.map((value) => this._handleSingleObject(
                value,
                lookupArray,
                matchTypeValue
            ));
        }

        return this._handleSingleObject(
            lookupValue,
            lookupArray,
            matchTypeValue
        );
    }

    private _handleSingleObject(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        matchTypeValue: number
    ) {
        const searchType = this._getSearchModeValue(matchTypeValue);

        const result = searchArray.orderSearch(value, searchType);

        if (result == null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (result instanceof ErrorValueObject) {
            return result;
        }

        const resultNumber = searchArray.getRowCount() === 1 ? result.column + 1 : result.row + 1;

        return NumberValueObject.create(resultNumber);
    }

    private _getSearchModeValue(searchModeValue: number) {
        switch (searchModeValue) {
            case 1:
                return ArrayOrderSearchType.MIN;
            case 0:
                return ArrayOrderSearchType.NORMAL;
            case -1:
                return ArrayOrderSearchType.MAX;
        }
    }
}
