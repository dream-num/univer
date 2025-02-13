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

import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Not extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(logical: BaseValueObject) {
        if (logical.isArray()) {
            return logical.map((logicalObject) => this._handleSingleObject(logicalObject));
        }

        return this._handleSingleObject(logical);
    }

    private _handleSingleObject(logical: BaseValueObject) {
        if (logical.isError()) {
            return logical;
        }

        const logicalValue = +logical.getValue();

        if (Number.isNaN(logicalValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return BooleanValueObject.create(!logicalValue);
    }
}
