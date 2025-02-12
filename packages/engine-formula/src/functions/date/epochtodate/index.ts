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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { excelDateTimeSerial } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Epochtodate extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override needsReferenceObject = true;

    override calculate(timestamp: FunctionVariantType, unit?: FunctionVariantType): BaseValueObject {
        const _unit = unit ?? NumberValueObject.create(1);

        const { isError, errorObject, timestampIsReferenceObject, timestampObject, unitObject } = this._checkVariants(timestamp, _unit);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        if ((timestampObject as BaseValueObject).isNull() || (timestampObject as BaseValueObject).isBoolean() || (timestampObject as BaseValueObject).isString()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (!timestampIsReferenceObject && (timestampObject as BaseValueObject).isNumber() && (timestampObject as BaseValueObject).getPattern() !== '') {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let timestampValue = +(timestampObject as BaseValueObject).getValue();

        const { isError: _isError, errorObject: _errorObject, variants } = checkVariantsErrorIsStringToNumber(unitObject as BaseValueObject);

        if (_isError) {
            return _errorObject as ErrorValueObject;
        }

        const [_unitObject] = variants as BaseValueObject[];

        const unitValue = Math.floor(+_unitObject.getValue());

        if (timestampValue < 0 || unitValue < 1 || unitValue > 3) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (unitValue === 1) {
            timestampValue = timestampValue * 1000;
        }

        if (unitValue === 3) {
            timestampValue = timestampValue / 1000;
        }

        const date = new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0) + timestampValue);

        if (!Number.isNaN(date.getTime())) {
            const dateSerialNumber = excelDateTimeSerial(date);

            return NumberValueObject.create(dateSerialNumber, 'yyyy-MM-dd AM/PM hh:mm:ss');
        } else {
            const result = 25569 + timestampValue / 86400000;

            return NumberValueObject.create(result);
        }
    }

    private _checkVariants(timestamp: FunctionVariantType, unit: FunctionVariantType) {
        const timestampIsReferenceObject = timestamp.isReferenceObject();
        const unitIsReferenceObject = unit.isReferenceObject();

        let _timestamp = timestamp;

        if (timestampIsReferenceObject) {
            _timestamp = (timestamp as BaseReferenceObject).toArrayValueObject();
        }

        if (_timestamp.isArray()) {
            const rowCount = (_timestamp as ArrayValueObject).getRowCount();
            const columnCount = (_timestamp as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return {
                    isError: true,
                    errorObject: ErrorValueObject.create(ErrorType.VALUE),
                };
            }

            _timestamp = (_timestamp as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_timestamp.isError()) {
            return {
                isError: true,
                errorObject: _timestamp as ErrorValueObject,
            };
        }

        let _unit = unit;

        if (unitIsReferenceObject) {
            _unit = (unit as BaseReferenceObject).toArrayValueObject();
        }

        if (_unit.isArray()) {
            const rowCount = (_unit as ArrayValueObject).getRowCount();
            const columnCount = (_unit as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return {
                    isError: true,
                    errorObject: ErrorValueObject.create(ErrorType.VALUE),
                };
            }

            _unit = (_unit as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_unit.isError()) {
            return {
                isError: true,
                errorObject: _unit as ErrorValueObject,
            };
        }

        return {
            isError: false,
            errorObject: null,
            timestampIsReferenceObject,
            timestampObject: _timestamp as BaseValueObject,
            unitIsReferenceObject,
            unitObject: _unit as BaseValueObject,
        };
    }
}
