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

import { excelDateTimeSerial, isDate, parseFormattedValue } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { getFractionalPart } from '../../../engine/utils/math-kit';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Timevalue extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(timeText: BaseValueObject) {
        if (timeText.isError()) {
            return timeText;
        }

        if (timeText.isArray()) {
            return timeText.map((timeTextObject) => this._handleSingleObject(timeTextObject));
        }

        return this._handleSingleObject(timeText);
    }

    private _handleSingleObject(timeTextObject: BaseValueObject) {
        if (timeTextObject.isString()) {
            const value = `${timeTextObject.getValue()}`;
            const parsedTime = parseFormattedValue(value);
            if (parsedTime) {
                let { v, z } = parsedTime;

                if (z && isDate(z)) {
                    if (v instanceof Date) {
                        v = excelDateTimeSerial(v);
                    }

                    return NumberValueObject.create(getFractionalPart(+v));
                }
            }
        }

        return ErrorValueObject.create(ErrorType.VALUE);
    }
}
