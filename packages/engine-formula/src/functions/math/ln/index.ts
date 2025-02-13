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
import { BaseFunction } from '../../base-function';

export class Ln extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(variant: BaseValueObject) {
        let _variant = variant;

        if (_variant.isString()) {
            _variant = _variant.convertToNumberObjectValue();
        }

        if (_variant.isError()) {
            return _variant;
        }

        return _variant.log();
    }
}
