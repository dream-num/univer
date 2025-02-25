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

export class Atan2 extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(xNum: BaseValueObject, yNum: BaseValueObject) {
        let _xNum = xNum;
        let _yNum = yNum;

        if (_xNum.isString()) {
            _xNum = _xNum.convertToNumberObjectValue();
        }

        if (_xNum.isError()) {
            return _xNum;
        }

        if (_yNum.isString()) {
            _yNum = _yNum.convertToNumberObjectValue();
        }

        if (_yNum.isError()) {
            return _yNum;
        }

        // Note that the order of parameters is different from JavaScript
        return _yNum.atan2(_xNum);
    }
}
