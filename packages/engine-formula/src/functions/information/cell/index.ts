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

import type { IColumnData, IObjectArrayPrimitiveType } from '@univerjs/core';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import { Tools } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Cell extends BaseFunction {
    override needsReferenceObject = true;

    override minParams = 2;

    override maxParams = 2;

    override calculate(infoType: FunctionVariantType, reference: FunctionVariantType) {
        let _infoType = infoType;

        if (_infoType.isError()) {
            return _infoType;
        }

        if (_infoType.isReferenceObject()) {
            _infoType = (_infoType as BaseReferenceObject).toArrayValueObject();
        }

        if (_infoType.isArray()) {
            const rowCount = (_infoType as ArrayValueObject).getRowCount();
            const columnCount = (_infoType as ArrayValueObject).getColumnCount();

            if (rowCount === 1 && columnCount === 1) {
                const infoTypeObject = (_infoType as ArrayValueObject).get(0, 0) as BaseValueObject;

                return this._handleSingleObject(infoTypeObject, reference);
            }

            return (_infoType as ArrayValueObject).map((infoTypeObject) => {
                if (infoTypeObject.isError()) {
                    return infoTypeObject;
                }

                return this._handleSingleObject(infoTypeObject, reference, true);
            });
        }

        return this._handleSingleObject(_infoType as BaseValueObject, reference);
    }

    private _handleSingleObject(infoType: BaseValueObject, reference: FunctionVariantType, infoTypeIsArray: boolean = false) {
        let _reference = reference;

        if (_reference.isError()) {
            return _reference as ErrorValueObject;
        }

        if (!_reference.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const currentActiveSheetData = (_reference as BaseReferenceObject).getCurrentActiveSheetData();
        const { columnData, defaultColumnWidth } = currentActiveSheetData;

        _reference = (_reference as BaseReferenceObject).toArrayValueObject();

        const _currentRow = (_reference as ArrayValueObject).getCurrentRow();
        const _currentColumn = (_reference as ArrayValueObject).getCurrentColumn();

        _reference = (_reference as ArrayValueObject).getFirstCell();

        const infoTypeValue = `${infoType.getValue()}`;

        let result;

        switch (infoTypeValue.toLocaleLowerCase()) {
            case 'address':
                return StringValueObject.create(`$${Tools.chatAtABC(_currentColumn)}$${_currentRow + 1}`);
            case 'col':
                return NumberValueObject.create(_currentColumn + 1);
            case 'color':
                // This value is not supported in Excel for the web. return 0.
                return NumberValueObject.create(0);
            case 'contents':
                return _reference;
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

                if (_reference.isNull()) {
                    result = 'b';
                }

                if (_reference.isString()) {
                    result = 'l';
                }

                return StringValueObject.create(result);
            case 'width':
                return this._getWidthResult(columnData, defaultColumnWidth as number, _currentColumn, infoTypeIsArray);
            default:
                return ErrorValueObject.create(ErrorType.VALUE);
        }
    }

    private _getWidthResult(columnData: IObjectArrayPrimitiveType<Partial<IColumnData>>, defaultColumnWidth: number, _currentColumn: number, infoTypeIsArray: boolean): BaseValueObject {
        let result = columnData[_currentColumn]?.w;

        if (!result && result !== 0) {
            result = defaultColumnWidth as number;
        }

        if (infoTypeIsArray) {
            return NumberValueObject.create(result);
        }

        const resultArray = [[result, result === defaultColumnWidth]];

        return ArrayValueObject.createByArray(resultArray);
    }
}
