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

import { Tools } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Cell extends BaseFunction {
    override needsReferenceObject = true;

    override minParams = 2;

    override maxParams = 2;

    override calculate(infoType: FunctionVariantType, reference: FunctionVariantType) {
        if (infoType.isError()) {
            return infoType;
        }

        if (infoType.isReferenceObject()) {
            infoType = (infoType as BaseReferenceObject).toArrayValueObject();
        }

        if (infoType.isArray()) {
            const rowCount = (infoType as ArrayValueObject).getRowCount();
            const columnCount = (infoType as ArrayValueObject).getColumnCount();

            if (rowCount === 1 && columnCount === 1) {
                const infoTypeObject = (infoType as ArrayValueObject).get(0, 0) as BaseValueObject;

                return this._handleSingleObject(infoTypeObject, reference);
            }

            return (infoType as ArrayValueObject).map((infoTypeObject) => {
                if (infoTypeObject.isError()) {
                    return infoTypeObject;
                }

                return this._handleSingleObject(infoTypeObject, reference, true);
            });
        }

        return this._handleSingleObject(infoType as BaseValueObject, reference);
    }

    private _handleSingleObject(infoType: BaseValueObject, reference: FunctionVariantType, infoTypeIsArray: boolean = false) {
        if (!reference.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const currentActiveSheetData = (reference as BaseReferenceObject).getCurrentActiveSheetData();
        const { columnData, defaultColumnWidth } = currentActiveSheetData;

        reference = (reference as BaseReferenceObject).toArrayValueObject();

        const _currentRow = (reference as ArrayValueObject).getCurrentRow();
        const _currentColumn = (reference as ArrayValueObject).getCurrentColumn();

        reference = (reference as ArrayValueObject).getFirstCell();

        const infoTypeValue = infoType.getValue();

        let result;

        switch (infoTypeValue) {
            case 'address':
                return StringValueObject.create(`$${Tools.chatAtABC(_currentColumn)}$${_currentRow + 1}`);
            case 'col':
                return NumberValueObject.create(_currentColumn + 1);
            case 'color':
                // This value is not supported in Excel for the web. return 0.
                return NumberValueObject.create(0);
            case 'contents':
                return reference;
            case 'filename':
                // This value is not supported in Excel for the web. google sheet return #VALUE!.
                return ErrorValueObject.create(ErrorType.VALUE);
            case 'format':
                // This value is not supported in Excel for the web. google sheet return G.
                return StringValueObject.create('G');
            case 'parentheses':
                // This value is not supported in Excel for the web. return 0.
                return NumberValueObject.create(0);
            case 'prefix':
                // This value is not supported in Excel for the web. return ''.
                return StringValueObject.create('');
            case 'protect':
                // This value is not supported in Excel for the web. return 1.
                return NumberValueObject.create(1);
            case 'row':
                return NumberValueObject.create(_currentRow + 1);
            case 'type':
                result = 'v';

                if (reference.isNull()) {
                    result = 'b';
                }

                if (reference.isString()) {
                    result = 'l';
                }

                return StringValueObject.create(result);
            case 'width':
                result = columnData[_currentColumn]?.w;

                if (!result && result !== 0) {
                    result = defaultColumnWidth as number;
                }

                if (infoTypeIsArray) {
                    return NumberValueObject.create(result);
                }

                result = [[result, result === defaultColumnWidth]];

                return ArrayValueObject.createByArray(result);
            default:
                return ErrorValueObject.create(ErrorType.VALUE);
        }
    }
}
