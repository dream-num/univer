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

import { DEFAULT_TOKEN_TYPE_LAMBDA_OMIT_PARAMETER, DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER } from '../../basics/token-type';
import { LexerNode } from '../analysis/lexer-node';

export function isFirstChildParameter(lexerNode: LexerNode | string) {
    if (!(lexerNode instanceof LexerNode)) {
        return false;
    }
    return lexerNode.getToken() === DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER;
}

export function isChildRunTimeParameter(lexerNode: LexerNode | string) {
    if (!(lexerNode instanceof LexerNode)) {
        return false;
    }
    return lexerNode.getToken() === DEFAULT_TOKEN_TYPE_LAMBDA_OMIT_PARAMETER;
}
