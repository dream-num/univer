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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { excelSerialToDateTimeParts } from '@univerjs/core';
import { isValidDateStr } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Year extends BaseFunction {
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
            const dateSerial = +dateValue;

            if (dateSerial < 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const parts = excelSerialToDateTimeParts(dateSerial, { dateSystem: this.getDateSystem() });
            return parts ? NumberValueObject.create(parts.year) : ErrorValueObject.create(ErrorType.NUM);
        }

        const year = date.getUTCFullYear();
        const valueObject = NumberValueObject.create(year);

        return valueObject;
    }
}
