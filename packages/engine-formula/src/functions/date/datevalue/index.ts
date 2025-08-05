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
import { excelDateTimeSerial, isDate, parseFormattedDate, parseFormattedTime } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Datevalue extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override isArgumentsIgnoreNumberPattern(): boolean {
        return true;
    }

    override calculate(dateText: BaseValueObject) {
        if (dateText.isArray()) {
            return dateText.mapValue((dateTextObject) => this._handleSingleObject(dateTextObject));
        }

        return this._handleSingleObject(dateText);
    }

    private _handleSingleObject(dateTextObject: BaseValueObject) {
        if (dateTextObject.isError()) {
            return dateTextObject;
        }

        if (dateTextObject.isString()) {
            const value = `${dateTextObject.getValue()}`;
            let parsedDate = parseFormattedDate(value);
            if (parsedDate === null) {
                parsedDate = parseFormattedTime(value);
            }
            if (parsedDate) {
                let { v, z } = parsedDate;

                // currently, we the v is a number by numfmt the 3.2
                if (z && isDate(z)) {
                    if ((v as any) instanceof Date) {
                        v = excelDateTimeSerial(v as any);
                    }

                    return NumberValueObject.create(Math.trunc(+v));
                }
            }
        }

        return ErrorValueObject.create(ErrorType.VALUE);
    }
}
