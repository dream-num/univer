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

import type { Nullable } from '@univerjs/core';

import { LexerNode } from '../analysis/lexer-node';
import { BaseAstNode } from './base-ast-node';

export const DEFAULT_AST_NODE_FACTORY_Z_INDEX = 100;

export abstract class BaseAstNodeFactory {
    get zIndex() {
        return 0;
    }

    dispose(): void {

    }

    create(param: LexerNode | string, currentRow?: number, currentColumn?: number): BaseAstNode {
        let token;
        if (param instanceof LexerNode) {
            token = param.getToken();
        } else {
            token = param;
        }
        return new BaseAstNode(token);
    }

    abstract checkAndCreateNodeType(param: LexerNode | string): Nullable<BaseAstNode>;
}
