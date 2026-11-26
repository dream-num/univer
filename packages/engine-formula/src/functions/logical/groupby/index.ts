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

import type { BaseAstNode } from '../../../engine/ast-node/base-ast-node';
import type { FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { calculateGroupedArray } from '../grouping';

export class Groupby extends BaseFunction {
    override minParams = 3;
    override maxParams = 8;
    override needsReferenceObject = true;
    override needsAstChildren = true;

    override calculateAst(children: BaseAstNode[], get: (node: BaseAstNode) => FunctionVariantType | null): BaseValueObject {
        return calculateGroupedArray(false, children, get);
    }
}
