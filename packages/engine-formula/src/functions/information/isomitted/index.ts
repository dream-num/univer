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
import { BooleanValueObject, OmittedValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

/**
 * Returns TRUE when a LAMBDA argument was left empty in the call, such as `y` in `=LAMBDA(x,y,ISOMITTED(y))(1,)`.
 * A blank cell or an empty string is a supplied value, so it returns FALSE.
 */
export class Isomitted extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(argument: BaseValueObject) {
        return BooleanValueObject.create(argument instanceof OmittedValueObject);
    }
}
