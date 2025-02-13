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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Radians extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(angle: BaseValueObject) {
        if (angle.isArray()) {
            return angle.map((angleObject) => this._handleSingleObject(angleObject));
        }

        return this._handleSingleObject(angle);
    }

    private _handleSingleObject(angle: BaseValueObject) {
        let angleObject = angle;

        if (angleObject.isString()) {
            angleObject = angleObject.convertToNumberObjectValue();
        }

        if (angleObject.isError()) {
            return angleObject;
        }

        const angleValue = +angleObject.getValue();

        if (!Number.isFinite(angleValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const result = angleValue * (Math.PI / 180);

        if (Number.isNaN(result)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return NumberValueObject.create(result);
    }
}
