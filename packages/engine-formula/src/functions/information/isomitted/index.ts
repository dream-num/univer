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
import { LambdaParameterNode } from '../../../engine/ast-node/lambda-parameter-node';
import { NullNode } from '../../../engine/ast-node/null-node';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Isomitted extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override needsAstChildren = true;

    override calculateAst(children: BaseAstNode[]) {
        const child = children[0];
        return BooleanValueObject.create(
            child instanceof NullNode || (child instanceof LambdaParameterNode && child.isOmitted())
        );
    }
}
