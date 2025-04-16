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
import { DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER } from '../../basics/token-type';
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
    for (let i = 0; i < childrenCount; i++) {
        const node = children[i];
        if (isFirstChildParameter(firstChild) && i !== 0) {
            continue;
        }
        if (node instanceof LexerNode) {
            updateLambdaStatement(node, lambdaId, currentLambdaPrivacyVar);
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
