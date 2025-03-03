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

/* eslint-disable antfu/consistent-list-newline */
import type { IFunctionService, ISequenceNode, LexerTreeBuilder } from '@univerjs/engine-formula';
import { LocaleType, numfmt } from '@univerjs/core';
import { matchToken, sequenceNodeType } from '@univerjs/engine-formula';

const fullWidthToHalfWidthMap: { [key: string]: string } = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
    Ａ: 'A', Ｂ: 'B', Ｃ: 'C', Ｄ: 'D', Ｅ: 'E',
    Ｆ: 'F', Ｇ: 'G', Ｈ: 'H', Ｉ: 'I', Ｊ: 'J',
    Ｋ: 'K', Ｌ: 'L', Ｍ: 'M', Ｎ: 'N', Ｏ: 'O',
    Ｐ: 'P', Ｑ: 'Q', Ｒ: 'R', Ｓ: 'S', Ｔ: 'T',
    Ｕ: 'U', Ｖ: 'V', Ｗ: 'W', Ｘ: 'X', Ｙ: 'Y',
    Ｚ: 'Z', ａ: 'a', ｂ: 'b', ｃ: 'c', ｄ: 'd',
    ｅ: 'e', ｆ: 'f', ｇ: 'g', ｈ: 'h', ｉ: 'i',
    ｊ: 'j', ｋ: 'k', ｌ: 'l', ｍ: 'm', ｎ: 'n',
    ｏ: 'o', ｐ: 'p', ｑ: 'q', ｒ: 'r', ｓ: 's',
    ｔ: 't', ｕ: 'u', ｖ: 'v', ｗ: 'w', ｘ: 'x',
    ｙ: 'y', ｚ: 'z', '％': '%', '－': '-', '．': '.',
    '：': ':', '／': '/', '＋': '+', '＠': '@', '＆': '&',
    '＊': '*', '＃': '#', '＝': '=', '＞': '>', '＜': '<',
    '＄': '$', '＂': '"', '＇': "'", '（': '(', '）': ')', '　': ' ',
    '，': ',', '！': '!', '？': '?', '；': ';', '［': '[', '］': ']',
    '｛': '{', '｝': '}',
};

// Boolean conversion
const booleanMap: { [key: string]: string } = {
    true: 'TRUE',
    false: 'FALSE',
};

// TODO@Dushusir: add more locales
export function isCJKLocale(locale: LocaleType) {
    return [LocaleType.ZH_CN, LocaleType.ZH_TW].includes(locale);
}

/**
 * Convert all full-width characters to half-width characters and try to parse them. If the parsing is successful, apply them. If the parsing is not successful, return them to full-width characters.
 *
 * Convert full-width characters to half-width characters
 * 1. Formula
 * 2. Boolean
 * 3. Formatted number
 *
 * Not converted
 * 1. Force string
 * 2. Chinese single and double quotation marks
 * 3. Characters between single and double quotes in formulas
 * 4. Other text that cannot be recognized as formulas, Boolean values, or numbers
 *
 * @param str
 * @param lexerTreeBuilder
 * @returns
 */
export function normalizeString(str: string, lexerTreeBuilder: LexerTreeBuilder, currentLocale: LocaleType, functionService: IFunctionService) {
    let normalStr = str;

    if (isCJKLocale(currentLocale)) {
        // Check if it is a mandatory string with single quotes
        if (str.startsWith('＇') || str.startsWith("'")) {
            return `'${str.slice(1)}`;
        }

        // Handle quoted parts separately (e.g., sheet names)
        normalStr = handleQuotedParts(normalStr);
    }

    // Check if it is a formula
    if (normalStr.startsWith('=')) {
        return normalizeFormulaString(str, normalStr, lexerTreeBuilder, functionService);
    }

    // Check if it is a boolean value
    const lowerCaseStr = normalStr.toLowerCase();
    if (booleanMap[lowerCaseStr]) {
        return booleanMap[lowerCaseStr];
    }

    // Formatting Numbers
    const parsedValue = numfmt.parseValue(normalStr);

    return parsedValue == null ? str : normalStr;
}

// Helper function to handle sheet names with quotes
function handleQuotedParts(str: string): string {
    const sheetNamePattern = /['"].*?['"]/g; // Pattern to match quoted parts (sheet names)
    const quotedParts: string[] = [];
    const parts = str.split(sheetNamePattern);

    // Save quoted parts and remove them from the string temporarily
    str.replace(sheetNamePattern, (match) => {
        quotedParts.push(match);
        return ''; // Remove quoted parts for now
    });

    // Convert all full-width characters to half-width characters in non-quoted parts
    let normalStr = parts.join('').split('').map(toHalfWidth).join('');

    // Reinserting the quoted parts into the final string
    quotedParts.forEach((part, idx) => {
        normalStr = normalStr.slice(0, idx * 2) + part + normalStr.slice((idx + 1) * 2);
    });

    return normalStr;
}

function normalizeFormulaString(str: string, normalStr: string, lexerTreeBuilder: LexerTreeBuilder, functionService: IFunctionService) {
    const nodes = lexerTreeBuilder.sequenceNodesBuilder(normalStr);

    if (!nodes) return str;

    let _normalStr = normalStr;
    let totalOffset = 0; // Cumulative offset

    nodes.forEach((node, index) => {
        if (typeof node === 'object') {
            const token = node.token;

            // boolean or function name
            if (booleanMap[token.toLowerCase()]) {
                const startIndex = node.startIndex + totalOffset + 1;
                const endIndex = node.endIndex + totalOffset + 2;

                _normalStr = replaceString(token.toLocaleUpperCase(), _normalStr, startIndex, endIndex);
            } else if ((node.nodeType === sequenceNodeType.FUNCTION && hasFunctionName(token, functionService, nodes, index)) || node.nodeType === sequenceNodeType.REFERENCE) {
                const sheetNameIndex = token.indexOf('!');

                if (sheetNameIndex > -1) {
                    const refBody = token.substring(sheetNameIndex + 1);
                    const startIndex = node.startIndex + totalOffset + (sheetNameIndex + 1) + 1;
                    const endIndex = node.endIndex + totalOffset + 2;

                    _normalStr = replaceString(refBody.toLocaleUpperCase(), _normalStr, startIndex, endIndex);
                } else {
                    const startIndex = node.startIndex + totalOffset + 1;
                    const endIndex = node.endIndex + totalOffset + 2;

                    _normalStr = replaceString(token.toLocaleUpperCase(), _normalStr, startIndex, endIndex);
                }
            } else if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
                const startIndex = node.startIndex + totalOffset + 2;
                const endIndex = node.endIndex + totalOffset + 1;
                _normalStr = replaceString(str.slice(startIndex, endIndex), _normalStr, startIndex, endIndex);
            } else if (node.nodeType !== sequenceNodeType.ARRAY) {
                const parsedValue = numfmt.parseValue(token);

                if (parsedValue == null) {
                    const startIndex = node.startIndex + totalOffset + 1;
                    const endIndex = node.endIndex + totalOffset + 2;
                    _normalStr = replaceString(str.slice(startIndex, endIndex), _normalStr, startIndex, endIndex);
                }
                // Entering =.07/0.1 in a cell will automatically convert to =0.07/0.1
                // Entering =1.0+2.00 in a cell will automatically convert to =1+2
                else if (typeof parsedValue.v === 'number' && (parsedValue.z === undefined || !numfmt.isDate(parsedValue.z))) {
                    const v = `${parsedValue.v}`;
                    const startIndex = node.startIndex + totalOffset + 1;
                    const endIndex = node.endIndex + totalOffset + 2;
                    const { processedString, offset } = processNumberStringWithSpaces(token, v);
                    _normalStr = replaceString(processedString, _normalStr, startIndex, endIndex);

                    // Update cumulative offset
                    totalOffset += offset;
                }
            }
        }
    });

    return _normalStr;
}

function hasFunctionName(name: string, functionService: IFunctionService, nodes: (string | ISequenceNode)[], index: number) {
    const functionList = functionService.getDescriptions();

    if (nodes[index + 1] !== matchToken.OPEN_BRACKET) {
        return false;
    }

    return functionList.get(removeLeadingAtSymbols(name).toLocaleUpperCase()) !== undefined;
}

function removeLeadingAtSymbols(str: string): string {
    const regex = /^@+/;
    return str.replace(regex, '');
}

// Full-width character conversion function
function toHalfWidth(char: string): string {
    return fullWidthToHalfWidthMap[char] || char;
}

function replaceString(replacedString: string, normalStr: string, startIndex: number, endIndex: number): string {
    return normalStr.substring(0, startIndex) + replacedString + normalStr.substring(endIndex);
}

function processNumberStringWithSpaces(token: string, numStr: string): { processedString: string; offset: number } {
    // Preserve original leading and trailing spaces
    const leadingSpaces = token.match(/^\s*/)?.[0] || '';
    const trailingSpaces = token.match(/\s*$/)?.[0] || '';

    // Reassemble, keeping the original spaces
    const processedString = leadingSpaces + numStr + trailingSpaces;

    // Calculating the offset
    const offset = processedString.length - token.length;

    return { processedString, offset };
}
