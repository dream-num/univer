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

import type { LambdaPrivacyVarType } from '../ast-node/base-ast-node';
import { DEFAULT_TOKEN_LET_FUNCTION_NAME, DEFAULT_TOKEN_TYPE_LAMBDA_CALL, DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER, DEFAULT_TOKEN_TYPE_PARAMETER } from '../../basics/token-type';
import { LexerNode } from '../analysis/lexer-node';
import { isFirstChildParameter } from './function-definition';

export function updateLambdaStatement(
    functionStatementNode: LexerNode,
    lambdaId: string,
    currentLambdaPrivacyVar: LambdaPrivacyVarType
) {
    const children = functionStatementNode.getChildren();
    const childrenCount = children.length;
    const firstChild = children[0];
    const isLet = functionStatementNode.getToken().trim().toUpperCase() === DEFAULT_TOKEN_LET_FUNCTION_NAME;
    for (let i = 0; i < childrenCount; i++) {
        const node = children[i];
        if (isLet && i % 2 === 0 && i < childrenCount - 1) {
            continue;
        }
        if (isFirstChildParameter(firstChild) && i !== 0) {
            continue;
        }
        if (node instanceof LexerNode) {
            updateLambdaStatement(node, lambdaId, currentLambdaPrivacyVar);
            const firstArgument = node.getChildren()[0];
            const isScopedCall = node.getToken() === DEFAULT_TOKEN_TYPE_LAMBDA_CALL && node.getLambdaId() != null;
            const hasArguments = firstArgument instanceof LexerNode && firstArgument.getToken() === DEFAULT_TOKEN_TYPE_PARAMETER;
            if (isScopedCall || hasArguments || firstArgument === undefined) {
                const scopedCallee = isScopedCall && firstArgument instanceof LexerNode ? firstArgument.getChildren()[0] : undefined;
                const token = (scopedCallee instanceof LexerNode ? scopedCallee.getLambdaParameter() : node.getToken().trim()).toUpperCase();
                const binding = [...currentLambdaPrivacyVar.keys()].find((name) => name.toUpperCase() === token);
                if (binding === undefined) {
                    continue;
                }
                const callee = scopedCallee instanceof LexerNode ? scopedCallee : new LexerNode();
                callee.setToken(DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER);
                callee.setLambdaId(lambdaId);
                callee.setLambdaPrivacyVar(currentLambdaPrivacyVar);
                callee.setLambdaParameter(binding);
                if (!isScopedCall) {
                    const calleeParameter = new LexerNode();
                    calleeParameter.setToken(DEFAULT_TOKEN_TYPE_PARAMETER);
                    callee.changeToParent(calleeParameter);
                    node.setToken(DEFAULT_TOKEN_TYPE_LAMBDA_CALL);
                    node.setLambdaId(lambdaId);
                    node.addChildrenFirst(calleeParameter);
                    calleeParameter.setParent(node);
                }
            }
        } else {
            const token = node.trim();
            if (currentLambdaPrivacyVar.has(token)) {
                const newNode = new LexerNode();
                newNode.setToken(DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER);
                newNode.setLambdaId(lambdaId);
                newNode.setLambdaPrivacyVar(currentLambdaPrivacyVar);
                newNode.setLambdaParameter(token);
                children[i] = newNode;
            }
        }
    }
}
