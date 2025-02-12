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

import { excelSerialToDateTime, getDateSerialNumberByObject } from '../../../basics/date';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Hour extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(serialNumber: BaseValueObject) {
        if (serialNumber.isError()) {
            return serialNumber;
        }

        if (serialNumber.isArray()) {
            return serialNumber.map((serialNumberObject) => {
                if (serialNumberObject.isError()) {
                    return serialNumberObject;
                }

                return this._handleSingleObject(serialNumberObject);
            });
        }

        return this._handleSingleObject(serialNumber);
    }

    private _handleSingleObject(serialNumberObject: BaseValueObject) {
        const dateSerialNumber = getDateSerialNumberByObject(serialNumberObject);

        if (typeof dateSerialNumber !== 'number') {
            return dateSerialNumber;
        }

        if (dateSerialNumber === 0) {
            return NumberValueObject.create(0);
        }

        const date = excelSerialToDateTime(dateSerialNumber);
        const hours = date.getUTCHours();

        return NumberValueObject.create(hours);
    }
}
