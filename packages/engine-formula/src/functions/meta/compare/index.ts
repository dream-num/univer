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

import { compareToken } from '../../../basics/token';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Compare extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    private _compareType: compareToken = compareToken.EQUALS;

    setCompareType(token: compareToken) {
        this._compareType = token;
    }

    override calculate(variant1: BaseValueObject, variant2: BaseValueObject) {
        if (variant1.isError()) {
            return variant1;
        }

        if (variant2.isError()) {
            return variant2;
        }

        return variant1.compare(variant2, this._compareType);
    }
}
