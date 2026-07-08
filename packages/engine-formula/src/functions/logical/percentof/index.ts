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
import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

/**
 * PERCENTOF is an Excel GROUPBY aggregator token. It is evaluated by GROUPBY's
 * AST path, not as a standalone scalar function.
 */
export class Percentof extends BaseFunction {
    override minParams = 0;

    override maxParams = 0;

    override calculate(..._variants: BaseValueObject[]) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
}
