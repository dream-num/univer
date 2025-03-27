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

import type { LambdaPrivacyVarType } from './base-ast-node';
import { ErrorType } from '../../basics/error-type';
import { DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER } from '../../basics/token-type';
import { LexerNode } from '../analysis/lexer-node';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

function getRootLexerNode(node: Nullable<BaseAstNode>): Nullable<BaseAstNode> {
    if (!node) {
        return;
    }
    if (node.getToken() !== DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER) {
        return node;
    }

    const parameterNode = node as LambdaParameterNode;
    const currentLambdaPrivacyVar = parameterNode.getCurrentLambdaPrivacyVar();
    const lambdaParameter = parameterNode.getLambdaParameter();

    if (!currentLambdaPrivacyVar) {
        return;
    }

    return getRootLexerNode(currentLambdaPrivacyVar.get(lambdaParameter));
}

export class LambdaParameterNode extends BaseAstNode {
    constructor(
        token: string,
        private _lambdaParameter: string,
        private _currentLambdaPrivacyVar: LambdaPrivacyVarType
    ) {
        super(token);
    }

    getLambdaParameter() {
        return this._lambdaParameter;
    }

    getCurrentLambdaPrivacyVar() {
        return this._currentLambdaPrivacyVar;
    }

    override get nodeType() {
        return NodeType.LAMBDA_PARAMETER;
    }

    override execute() {
        /**
         * In the case of =lambda(x,y,lambda(a,b,a*b)(x,y))(1,2)
         */
        const node = getRootLexerNode(this._currentLambdaPrivacyVar.get(this._lambdaParameter));
        if (!node) {
            const value = this.getValue();
            if (value == null || value.isError()) {
                this.setValue(ErrorValueObject.create(ErrorType.NAME));
            }
        } else {
            this.setValue(node.getValue());
        }
    }
}

export class LambdaParameterNodeFactory extends BaseAstNodeFactory {
    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.LAMBDA_PARAMETER) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override create(param: LexerNode): BaseAstNode {
        // const lambdaId = param.getLambdaId();
        const currentLambdaPrivacyVar = param.getFunctionDefinitionPrivacyVar();
        const lambdaParameter = param.getLambdaParameter();

        if (!currentLambdaPrivacyVar) {
            return new ErrorNode(ErrorType.NAME);
        }

        return new LambdaParameterNode(param.getToken(), lambdaParameter, currentLambdaPrivacyVar);
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return;
        }

        const token = param.getToken().trim();
        if (token !== DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER) {
            return;
        }

        return this.create(param);
    }
}
