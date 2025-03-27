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

export enum operatorToken {
    PLUS = '+',
    MINUS = '-',
    MULTIPLY = '*',
    DIVIDED = '/',
    CONCATENATE = '&',
    POWER = '^',
    EQUALS = '=',
    NOT_EQUAL = '<>',
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>=',
    LESS_THAN = '<',
    LESS_THAN_OR_EQUAL = '<=',
}

export enum compareToken {
    EQUALS = '=',
    NOT_EQUAL = '<>',
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>=',
    LESS_THAN = '<',
    LESS_THAN_OR_EQUAL = '<=',
}

export const OPERATOR_TOKEN_PRIORITY = new Map([
    [operatorToken.NOT_EQUAL as string, 4],
    [operatorToken.LESS_THAN as string, 4],
    [operatorToken.GREATER_THAN_OR_EQUAL as string, 4],
    [operatorToken.EQUALS as string, 4],
    [operatorToken.GREATER_THAN as string, 4],
    [operatorToken.LESS_THAN_OR_EQUAL as string, 4],
    [operatorToken.CONCATENATE as string, 3],
    [operatorToken.PLUS as string, 2],
    [operatorToken.MINUS as string, 2],
    [operatorToken.DIVIDED as string, 1],
    [operatorToken.MULTIPLY as string, 1],
    [operatorToken.POWER as string, 0],
]);

export const OPERATOR_TOKEN_SET = new Set(OPERATOR_TOKEN_PRIORITY.keys());

export const OPERATOR_TOKEN_COMPARE_SET = new Set([
    operatorToken.EQUALS as string,
    operatorToken.NOT_EQUAL,
    operatorToken.GREATER_THAN,
    operatorToken.GREATER_THAN_OR_EQUAL,
    operatorToken.LESS_THAN,
    operatorToken.LESS_THAN_OR_EQUAL,
]);

export enum matchToken {
    OPEN_BRACKET = '(',
    CLOSE_BRACKET = ')',
    COMMA = ',',
    SINGLE_QUOTATION = "'",
    DOUBLE_QUOTATION = '"',
    OPEN_BRACES = '{',
    CLOSE_BRACES = '}',
    COLON = ':',
    OPEN_SQUARE_BRACKET = '[',
    CLOSE_SQUARE_BRACKET = ']',
}

export enum suffixToken {
    PERCENTAGE = '%',
    POUND = '#',
}

export const SUFFIX_TOKEN_SET = new Set([suffixToken.PERCENTAGE as string, suffixToken.POUND]);

export enum prefixToken {
    AT = '@',
    MINUS = '-',
    PLUS = '+',
}

export const SPACE_TOKEN = ' ';
