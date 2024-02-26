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

import { excelSerialToDate } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Day extends BaseFunction {
    override calculate(serialNumber: BaseValueObject) {
        if (serialNumber == null) {
            return new ErrorValueObject(ErrorType.NA);
        }

        if (serialNumber.isError()) {
            return serialNumber;
        }

        if (serialNumber.isArray()) {
            return serialNumber.map((serialNumberObject) => {
                if (serialNumberObject.isError()) {
                    return serialNumberObject;
                }

                if (serialNumberObject.isString() || serialNumberObject.isNull()) {
                    return new ErrorValueObject(ErrorType.VALUE);
                }

                const dateSerial = +serialNumberObject.getValue();

                if (dateSerial < 0) {
                    return new ErrorValueObject(ErrorType.NUM);
                }

                // Excel serial 0 is 1900-01-00
                // Google Sheets serial 0 is 1899-12-30
                if (dateSerial === 0) {
                    return new NumberValueObject(0);
                }

                const date = excelSerialToDate(dateSerial);

                const month = date.getDate();
                const valueObject = new NumberValueObject(month);

                return valueObject;
            });
        }

        return new NumberValueObject(excelSerialToDate(+serialNumber.getValue()).getDate());
    }
}
