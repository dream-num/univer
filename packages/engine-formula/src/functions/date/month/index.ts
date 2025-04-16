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

import { excelSerialToDate, isValidDateStr } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Month extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(serialNumber: BaseValueObject) {
        if (serialNumber.isArray()) {
            return serialNumber.map((serialNumberObject) => this._handleSingleObject(serialNumberObject));
        }

        return this._handleSingleObject(serialNumber);
    }

    private _handleSingleObject(serialNumberObject: BaseValueObject) {
        if (serialNumberObject.isError()) {
            return serialNumberObject;
        }

        let date: Date;
        const dateValue = serialNumberObject.getValue();

        if (serialNumberObject.isString()) {
            if (!isValidDateStr(`${dateValue}`)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            date = new Date(`${dateValue}`);
        } else {
            const dateSerial = +serialNumberObject.getValue();

            if (dateSerial < 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            // Excel serial 0 is 1900-01-00
            // Google Sheets serial 0 is 1899-12-30
            if (dateSerial === 0) {
                return NumberValueObject.create(1);
            }

            date = excelSerialToDate(dateSerial);
        }

        const month = date.getUTCMonth() + 1;
        const valueObject = NumberValueObject.create(month);

        return valueObject;
    }
}
