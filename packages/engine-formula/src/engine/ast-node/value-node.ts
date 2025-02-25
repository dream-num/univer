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

import type { ErrorType } from '../../basics/error-type';
import { BooleanValue } from '../../basics/common';
import { ERROR_TYPE_SET } from '../../basics/error-type';
import { LexerNode } from '../analysis/lexer-node';
import { ValueObjectFactory } from '../value-object/array-value-object';
import { BaseAstNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class ValueNode extends BaseAstNode {
    constructor(operatorString: string) {
        super(operatorString);
    }

    override get nodeType(): NodeType {
        return NodeType.VALUE;
    }

    override execute(): void {
        this.setValue(ValueObjectFactory.create(this.getToken()));
    }
}

export class ValueNodeFactory extends BaseAstNodeFactory {
    override get zIndex(): number {
        return NODE_ORDER_MAP.get(NodeType.VALUE) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    _checkValueNode(token: string): BaseAstNode | undefined {
        if (Number.isNaN(Number(token))) {
            const tokenTrim = token.trim();
            const startToken = tokenTrim.charAt(0);
            const endToken = tokenTrim.charAt(tokenTrim.length - 1);

            if (ERROR_TYPE_SET.has(tokenTrim as ErrorType)) {
                return this.create(tokenTrim);
            }

            if (startToken === '"' && endToken === '"') {
                return this.create(tokenTrim);
            }
            if (startToken === '{' && endToken === '}') {
                return this.create(tokenTrim);
            }

            const tokenTrimUpper = tokenTrim.toUpperCase();
            if (tokenTrimUpper === BooleanValue.TRUE || tokenTrimUpper === BooleanValue.FALSE) {
                return this.create(tokenTrimUpper);
            }
        } else {
            return this.create(token);
        }
    }

    override create(param: string): BaseAstNode {
        return new ValueNode(param);
    }

    override checkAndCreateNodeType(param: LexerNode | string): BaseAstNode | undefined {
        if (param instanceof LexerNode) {
            return;
        }
        return this._checkValueNode(param);
    }
}
