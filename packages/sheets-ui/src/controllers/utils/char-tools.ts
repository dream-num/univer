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

        // covert all full width characters to normal characters
        normalStr = str.split('').map(toHalfWidth).join('');
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

function normalizeFormulaString(str: string, normalStr: string, lexerTreeBuilder: LexerTreeBuilder, functionService: IFunctionService) {
    const nodes = lexerTreeBuilder.sequenceNodesBuilder(normalStr);

    if (!nodes) return str;

    let _normalStr = normalStr;
    let totalOffset = 0; // 累积偏移量

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
            } else if (node.nodeType === sequenceNodeType.NUMBER) {
                // Process the number string
                const startIndex = node.startIndex + totalOffset + 1;
                const endIndex = node.endIndex + totalOffset + 2;
                const { processedString, offset } = processNumberStringWithSpaces(token);
                _normalStr = replaceString(processedString, _normalStr, startIndex, endIndex);

                 // 更新累积偏移量
                totalOffset += offset;
            } else if (node.nodeType !== sequenceNodeType.ARRAY) {
                const parsedValue = numfmt.parseValue(token);

                if (parsedValue == null) {
                    const startIndex = node.startIndex + totalOffset + 1;
                    const endIndex = node.endIndex + totalOffset + 2;
                    _normalStr = replaceString(str.slice(startIndex, endIndex), _normalStr, startIndex, endIndex);
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

/**
 * Entering =.07/0.1 in a cell will automatically convert to =0.07/0.1
   Entering =1.0+2.00 in a cell will automatically convert to =1+2
 * @param expr
 * @returns
 */
export function convertNumber(expr: string): string {
    let result = '';
    let i = 0;
    const length = expr.length;
    let insideQuotes = false;
    let currentQuoteChar = '';

    while (i < length) {
        const char = expr[i];

        if (char === '"' || char === "'") {
            // Toggle insideQuotes if we see a quote character
            if (insideQuotes && char === currentQuoteChar) {
                insideQuotes = false;
                currentQuoteChar = '';
            } else if (!insideQuotes) {
                insideQuotes = true;
                currentQuoteChar = char;
            }
            // Add the quote character to the result
            result += char;
            i++;
            continue;
        }

        if (insideQuotes) {
            // Inside a quoted string, just copy the character
            result += char;
            i++;
            continue;
        }

        // Not inside quotes, check for numbers
        // Use a regex to match a number at the current position
        const numberRegex = /^[+-]?(\d*\.\d+|\d+\.\d*|\d+)([eE][+-]?\d+)?%?/;
        const remainingExpr = expr.substring(i);
        const match = remainingExpr.match(numberRegex);
        if (match) {
            const numStr = match[0];
            // Process the number string
            const processedNumStr = processNumberString(numStr);
            result += processedNumStr;
            i += numStr.length;
        } else {
            // Not a number, just copy the character
            result += char;
            i++;
        }
    }

    return result;
}

function processNumberStringWithSpaces(numStr: string): { processedString: string; offset: number } {
    // 保存原始的前导和尾随空格
    const leadingSpaces = numStr.match(/^\s*/)?.[0] || '';
    const trailingSpaces = numStr.match(/\s*$/)?.[0] || '';

    // 提取实际的数字部分
    const numberPart = numStr.trim();

    // 如果去除空格后字符串为空，直接返回原始字符串，偏移量为0
    if (numberPart === '') {
        return { processedString: numStr, offset: 0 };
    }

    // 检查字符串是否为数字
    if (!isNumberString(numberPart)) {
        // 不是数字，返回原始字符串，偏移量为0
        return { processedString: numStr, offset: 0 };
    }

    // 对数字部分进行处理
    const processedNumber = processNumberString(numberPart);

    // 重新组合，保留原始的空格
    const processedString = leadingSpaces + processedNumber + trailingSpaces;

    // 计算偏移量
    const offset = processedString.length - numStr.length;

    return { processedString, offset };
}

// 判断字符串是否为数字的函数
function isNumberString(s: string): boolean {
    return /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?%?$/.test(s.trim());
}

// 原始的数字处理函数（稍作调整）
function processNumberString(numStr: string): string {
    // 这里的 numStr 已经是去除空格的数字字符串
    let sign = '';
    if (numStr.startsWith('+') || numStr.startsWith('-')) {
        sign = numStr[0];
        numStr = numStr.slice(1);
    }

    // 处理百分号
    let percent = '';
    if (numStr.endsWith('%')) {
        percent = '%';
        numStr = numStr.slice(0, -1);
    }

    // 处理指数部分
    let exponent = '';
    const exponentMatch = numStr.match(/([eE][+-]?\d+)$/);
    if (exponentMatch) {
        exponent = exponentMatch[0];
        numStr = numStr.slice(0, -exponent.length);
    }

    // 删除前导零（保留单个零或以 '0.' 开头的数字）
    if (numStr.startsWith('0') && !numStr.startsWith('0.')) {
        while (numStr.length > 1 && numStr.startsWith('0') && !numStr.startsWith('0.')) {
            numStr = numStr.slice(1);
        }
    }

    if (numStr === '') {
        numStr = '0';
    }

    // 如果数字以 '.' 开头，前面加上 '0'
    if (numStr.startsWith('.')) {
        numStr = `0${numStr}`;
    }

    // 删除小数点后不必要的尾随零
    if (numStr.includes('.')) {
        // 删除尾随零
        numStr = numStr.replace(/(\.\d*?[1-9])0+$/g, '$1');

        // 如果小数部分全为零，删除小数点和零
        numStr = numStr.replace(/(\.0+)$/, '');
        // 如果小数点后没有数字，删除小数点
        numStr = numStr.replace(/\.$/, '');
    }

    // 重新组合数字字符串
    return sign + numStr + exponent + percent;
}
