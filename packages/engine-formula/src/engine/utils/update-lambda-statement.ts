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
import { normalizeFunctionToken } from '../../basics/function';
import { DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME, DEFAULT_TOKEN_LET_FUNCTION_NAME, DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER } from '../../basics/token-type';
import { LexerNode } from '../analysis/lexer-node';
import { getLambdaParameterDeclaration, isFirstChildParameter, normalizeLambdaVariable } from './function-definition';

export function updateLambdaStatement(
    functionStatementNode: LexerNode,
    lambdaId: string,
    currentLambdaPrivacyVar: LambdaPrivacyVarType
) {
    _bindLambdaChildren(functionStatementNode, lambdaId, currentLambdaPrivacyVar, new Set());
}

function _bindLambdaChildren(
    parent: LexerNode,
    lambdaId: string,
    scope: LambdaPrivacyVarType,
    shadowed: ReadonlySet<string>
) {
    const children = parent.getChildren();
    const token = normalizeFunctionToken(parent.getToken().trim().toUpperCase().replace(/^@\s*/, ''));
    const firstChild = children[0];
    const bodyIndex = children.length - 1;
    const letShadowing = token === DEFAULT_TOKEN_LET_FUNCTION_NAME ? new Set(shadowed) : undefined;
    let visibleShadowing = letShadowing ?? shadowed;
    let firstDeclaration = 0;
    if (token === DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME) {
        const boundNames = new Set(shadowed);
        firstDeclaration = isFirstChildParameter(firstChild) ? 1 : 0;
        for (const declaration of children.slice(firstDeclaration, bodyIndex)) {
            const name = getLambdaParameterDeclaration(declaration);
            if (name) {
                boundNames.add(normalizeLambdaVariable(name));
            }
        }
        visibleShadowing = boundNames;
    } else if (!letShadowing) {
        const name = normalizeLambdaVariable(parent.getToken());
        if (scope.has(name) && !shadowed.has(name)) {
            // The lexer gives a bare range endpoint its own node, with no call arguments.
            if (children.length === 0) parent.setToken(DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER);
            _bindLambdaNode(parent, lambdaId, scope, name);
        }
    }
    for (let i = 0; i < children.length; i++) {
        if (token === DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME && i >= firstDeclaration && i < bodyIndex) {
            continue;
        }
        if (letShadowing && i < bodyIndex && i % 2 === 0) {
            continue;
        }
        const activeShadowing = i < firstDeclaration ? shadowed : visibleShadowing;
        _bindLambdaChild(parent, i, lambdaId, scope, activeShadowing);
        if (letShadowing && i < bodyIndex) {
            const name = getLambdaParameterDeclaration(children[i - 1]);
            if (name) {
                letShadowing.add(normalizeLambdaVariable(name));
            }
        }
    }
}

function _bindLambdaChild(parent: LexerNode, index: number, lambdaId: string, scope: LambdaPrivacyVarType, shadowed: ReadonlySet<string>): void {
    const children = parent.getChildren();
    const child = children[index];
    if (child instanceof LexerNode) {
        _bindLambdaChildren(child, lambdaId, scope, shadowed);
        return;
    }
    const name = normalizeLambdaVariable(child);
    if (scope.has(name) && !shadowed.has(name)) {
        const reference = new LexerNode();
        reference.setToken(DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER);
        reference.setParent(parent);
        _bindLambdaNode(reference, lambdaId, scope, name);
        children[index] = reference;
    }
}

function _bindLambdaNode(node: LexerNode, lambdaId: string, scope: LambdaPrivacyVarType, name: string) {
    node.setLambdaId(lambdaId);
    node.setLambdaPrivacyVar(scope);
    node.setLambdaParameter(name);
}
