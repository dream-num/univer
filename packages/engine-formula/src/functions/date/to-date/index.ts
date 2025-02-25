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
import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class ToDate extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override needsReferenceObject = true;

    override calculate(value: FunctionVariantType): BaseValueObject {
        const isReferenceObject = value.isReferenceObject();

        let _value = value;

        if (isReferenceObject) {
            _value = (value as BaseReferenceObject).toArrayValueObject();
        }

        if (_value.isArray()) {
            const rowCount = (_value as ArrayValueObject).getRowCount();
            const columnCount = (_value as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _value = (_value as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (
            (_value as BaseValueObject).isError() ||
            (_value as BaseValueObject).isNull() ||
            (_value as BaseValueObject).isBoolean() ||
            (_value as BaseValueObject).isString()
        ) {
            return _value as BaseValueObject;
        }

        if (!isReferenceObject && (_value as BaseValueObject).isNumber() && _value.getPattern() !== '') {
            return _value as BaseValueObject;
        }

        const val = +(_value as BaseValueObject).getValue();

        return NumberValueObject.create(val, 'yyyy-MM-dd hh:mm:ss AM/PM');
    }
}
