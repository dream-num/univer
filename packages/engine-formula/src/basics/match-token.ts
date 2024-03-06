/**
 * Copyright 2023-present DreamNum Inc.
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

import { compareToken, matchToken, operatorToken, prefixToken, suffixToken } from './token';

export const FORMULA_LEXER_TOKENS = [
    ...Object.values(compareToken),
    ...Object.values(operatorToken),
    ...Object.values(matchToken),
    ...Object.values(suffixToken),
    ...Object.values(prefixToken),
];

export function isFormulaLexerToken(str: string) {
    return FORMULA_LEXER_TOKENS.includes(str as compareToken);
}

export function includeFormulaLexerToken(str: string) {
    for (const token of FORMULA_LEXER_TOKENS) {
        if (str.indexOf(token) > -1) {
            return true;
        }
    }

    return false;
}

export function normalizeSheetName(sheetName: string) {
    if (sheetName[0] === "'" && sheetName[sheetName.length - 1] === "'") {
        return sheetName.substring(1, sheetName.length - 1);
    }
    return sheetName;
}

/**
 * Determine whether the character is a token keyword for the formula engine.
 * @param char
 */
export function matchRefDrawToken(char: string) {
    return (
        (isFormulaLexerToken(char) &&
                char !== matchToken.CLOSE_BRACES &&
                char !== matchToken.CLOSE_BRACKET &&
                char !== matchToken.SINGLE_QUOTATION &&
                char !== matchToken.DOUBLE_QUOTATION) ||
            char === ' '
    );
}
