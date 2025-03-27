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

enum CharTypes {
    ROOT,
    GROUP,
    POSITION,
    SET,
    RANGE,
    REPETITION,
    REFERENCE,
    CHAR,
};

type CharRange = {
    type: CharTypes.RANGE;
    from: number;
    to: number;
} | {
    type: CharTypes.CHAR;
    value: number;
};

interface ICharSet {
    type: CharTypes.SET;
    set: CharRange[];
    not: boolean;
}

interface IToken {
    type?: CharTypes;
    value?: number | string | IToken;
    set?: Array<CharRange | ICharSet>;
    stack?: IToken[];
    options?: IToken[][];
    remember?: boolean;
    followedBy?: boolean;
    notFollowedBy?: boolean;
    not?: boolean;
    min?: number;
    max?: number;
}

interface IReference {
    reference: IToken;
    stack: IToken[];
    index: number;
}

interface IOptions {
    limit?: number;
}

// 定义数字字符集（0-9）
const numberRange = (): CharRange[] => [
    {
        type: CharTypes.RANGE,
        from: 48,
        to: 57,
    },
];

// 定义字母和数字字符集（包含下划线、a-z、A-Z、0-9）
const alphaNumericChars = (): CharRange[] => [
    {
        type: CharTypes.CHAR,
        value: 95,
    },
    {
        type: CharTypes.RANGE,
        from: 97,
        to: 122,
    },
    {
        type: CharTypes.RANGE,
        from: 65,
        to: 90,
    },
    {
        type: CharTypes.RANGE,
        from: 48,
        to: 57,
    },
];

// 定义空白字符集
const whitespaceChars = (): CharRange[] => [
    {
        type: CharTypes.CHAR,
        value: 9,
    },
    {
        type: CharTypes.CHAR,
        value: 10,
    },
    {
        type: CharTypes.CHAR,
        value: 11,
    },
    {
        type: CharTypes.CHAR,
        value: 12,
    },
    {
        type: CharTypes.CHAR,
        value: 13,
    },
    {
        type: CharTypes.CHAR,
        value: 32,
    },
    {
        type: CharTypes.CHAR,
        value: 160,
    },
    {
        type: CharTypes.CHAR,
        value: 5760,
    },
    {
        type: CharTypes.RANGE,
        from: 8192,
        to: 8202,
    },
    {
        type: CharTypes.CHAR,
        value: 8232,
    },
    {
        type: CharTypes.CHAR,
        value: 8233,
    },
    {
        type: CharTypes.CHAR,
        value: 8239,
    },
    {
        type: CharTypes.CHAR,
        value: 8287,
    },
    {
        type: CharTypes.CHAR,
        value: 12288,
    },
    {
        type: CharTypes.CHAR,
        value: 65279,
    },
];

// 定义 words 函数，返回字母数字字符集的 SET 类型
const words = (): ICharSet => ({
    type: CharTypes.SET,
    set: alphaNumericChars(),
    not: false,
});

// 定义 notWords 函数，返回字母数字字符集的 SET 类型，但取反
const notWords = (): ICharSet => ({
    type: CharTypes.SET,
    set: alphaNumericChars(),
    not: true,
});

// 定义 ints 函数，返回数字字符集的 SET 类型
const ints = (): ICharSet => ({
    type: CharTypes.SET,
    set: numberRange(),
    not: false,
});

// 定义 notInts 函数，返回数字字符集的 SET 类型，但取反
const notInts = (): ICharSet => ({
    type: CharTypes.SET,
    set: numberRange(),
    not: true,
});

// 定义 whitespace 函数，返回空白字符集的 SET 类型
const whitespace = (): ICharSet => ({
    type: CharTypes.SET,
    set: whitespaceChars(),
    not: false,
});

// 定义 notWhitespace 函数，返回空白字符集的 SET 类型，但取反
const notWhitespace = (): ICharSet => ({
    type: CharTypes.SET,
    set: whitespaceChars(),
    not: true,
});

// 定义 anyChar 函数，返回特定字符集的 SET 类型，但取反
const anyChar = (): ICharSet => ({
    type: CharTypes.SET,
    set: [
        {
            type: CharTypes.CHAR,
            value: 10,
        },
        {
            type: CharTypes.CHAR,
            value: 13,
        },
        {
            type: CharTypes.CHAR,
            value: 8232,
        },
        {
            type: CharTypes.CHAR,
            value: 8233,
        },
    ],
    not: true,
});

// eslint-disable-next-line
function tokenizer(regExpString: string) {
    const root: IToken = {
        type: CharTypes.ROOT,
        stack: [],
    };
    let currentScope: IToken = root;
    let stack: IToken[] = root.stack as IToken[];
    const groups: IToken[] = [];
    const references: IReference[] = [];
    let captureCount = 0;

    const throwError = (index: number) => {
        throw new SyntaxError(`Invalid regular expression: /${regExpString}/: Nothing to repeat at column ${index - 1}`);
    };

    const strChars = strToChars(regExpString);

    let i = 0;
    let char;

    while (i < strChars.length) {
        char = strChars[i++];

        switch (char) {
            case '\\':
                if (i === strChars.length) {
                    throw new SyntaxError(`Invalid regular expression: /${regExpString}/: \\ at end of pattern`);
                }

                char = strChars[i++];

                switch (char) {
                    case 'b':
                        stack.push({
                            type: CharTypes.POSITION,
                            value: 'b',
                        });
                        break;
                    case 'B':
                        stack.push({
                            type: CharTypes.POSITION,
                            value: 'B',
                        });
                        break;
                    case 'w':
                        stack.push(words());
                        break;
                    case 'W':
                        stack.push(notWords());
                        break;
                    case 'd':
                        stack.push(ints());
                        break;
                    case 'D':
                        stack.push(notInts());
                        break;
                    case 's':
                        stack.push(whitespace());
                        break;
                    case 'S':
                        stack.push(notWhitespace());
                        break;
                    default:
                        if (/\d/.test(char)) {
                            while (/\d/.test(strChars[i]) && i < strChars.length) {
                                char += strChars[i++];
                            }

                            const num = Number.parseInt(char, 10);

                            stack.push({
                                type: CharTypes.REFERENCE,
                                value: num,
                            });

                            references.push({
                                reference: {
                                    type: CharTypes.REFERENCE,
                                    value: num,
                                },
                                stack,
                                index: stack.length - 1,
                            });
                        } else {
                            stack.push({
                                type: CharTypes.CHAR,
                                value: char.charCodeAt(0),
                            });
                        }
                }

                break;
            case '^':
                stack.push({
                    type: CharTypes.POSITION,
                    value: '^',
                });
                break;
            case '$':
                stack.push({
                    type: CharTypes.POSITION,
                    value: '$',
                });
                break;
            case '[':
            {
                const negated = (strChars[i] === '^'); // 检查是否是否定字符类（例如 `[^a-z]`）
                if (negated) {
                    i++; // 如果是否定的，则跳过 "^" 字符
                }

                // 提取字符类的内容，并计算结束位置
                const classTokens = tokenizeClass(strChars.slice(i), regExpString);

                // 更新读取位置
                i += classTokens[1];

                // 将解析后的字符类添加到结果数组中
                stack.push({
                    type: CharTypes.SET,
                    set: classTokens[0],
                    not: negated,
                });

                break;
            }
            case '.':
                stack.push(anyChar());
                break;
            case '(':
            {
                // 初始化一个对象来表示捕获组
                const group: IToken = {
                    type: CharTypes.GROUP,
                    stack: [],
                    remember: true, // 默认情况下，捕获组是需要记住（捕获）的
                };

                // 检查是否存在 '?' 来指定组的特殊行为
                if (strChars[i] === '?') {
                    const nextChar = strChars[i + 1]; // 获取 '?' 后面的字符
                    i += 2; // 跳过 '?' 和后面的字符

                    // 根据后面的字符确定组的类型
                    if (nextChar === '=') {
                        group.followedBy = true; // 正向前瞻
                    } else if (nextChar === '!') {
                        group.notFollowedBy = true; // 负向前瞻
                    } else if (nextChar !== ':') {
                        throw new SyntaxError(`Invalid regular expression: /${regExpString}/: Invalid group, character '${nextChar}' after '?' at column ${i - 1}`);
                    }

                    group.remember = false;
                } else {
                    captureCount += 1; // 增加捕获组的计数
                }

                // 将捕获组对象添加到主栈中
                stack.push(group);

                // 保存当前状态并开始新的栈用于捕获组
                groups.push(currentScope);
                currentScope = group;
                stack = group.stack as IToken[];

                break;
            }
            case ')':
                if (groups.length === 0) {
                    throw new SyntaxError(`Invalid regular expression: /${regExpString}/: Unmatched ) at column ${i - 1}`);
                }

                currentScope = groups.pop()!;
                stack = (currentScope.options ? currentScope.options[currentScope.options.length - 1] : currentScope.stack) as IToken[];
                break;
            case '|':
            {
                // 如果当前作用域没有 'options' 属性，则初始化它
                if (!currentScope.options) {
                    currentScope.options = [currentScope.stack] as IToken[][];
                    delete currentScope.stack;
                }
                // 创建新的选项分支并添加到 'options'
                const newOption: IToken[] = [];
                currentScope.options.push(newOption);
                // 更新当前的解析栈为新的选项分支
                stack = newOption;
                break;
            }
            case '{':
            {
                const match = /^(\d+)(,(\d+)?)?\}/.exec(strChars.slice(i));

                if (match) {
                    if (stack.length === 0) {
                        throwError(i);
                    }

                    const min = Number.parseInt(match[1], 10);
                    const max = match[2] ? (match[3] ? Number.parseInt(match[3], 10) : Infinity) : min;
                    i += match[0].length;

                    stack.push({
                        type: CharTypes.REPETITION,
                        min,
                        max,
                        value: stack.pop()!,
                    });
                } else {
                    stack.push({ // Assuming 123 is the character code for '{'
                        type: CharTypes.CHAR,
                        value: 123,
                    });
                }

                break;
            }
            case '?':
                if (stack.length === 0) {
                    throwError(i);
                }

                stack.push({
                    type: CharTypes.REPETITION,
                    min: 0,
                    max: 1,
                    value: stack.pop()!,
                });
                break;
            case '+':
                if (stack.length === 0) {
                    throwError(i);
                }

                stack.push({
                    type: CharTypes.REPETITION,
                    min: 1,
                    max: Infinity,
                    value: stack.pop()!,
                });
                break;
            case '*':
                if (stack.length === 0) {
                    throwError(i);
                }

                stack.push({
                    type: CharTypes.REPETITION,
                    min: 0,
                    max: Infinity,
                    value: stack.pop()!,
                });
                break;
            default:
                stack.push({
                    type: CharTypes.CHAR,
                    value: char.charCodeAt(0),
                });
        }
    }

    if (groups.length > 0) {
        throw new SyntaxError(`Invalid regular expression: /${regExpString}/: Unterminated group`);
    }

    processReferences(references, captureCount);

    return root;
}

function tokenizeClass(input: string, pattern: string): [Array<CharRange | ICharSet>, number] {
    let match;
    const tokens: Array<CharRange | ICharSet> = [];
    const regex = /\\(?:(w)|(d)|(s)|(W)|(D)|(S))|((?:(?:\\)(.)|([^\]\\]))-(((?:\\)])|(((?:\\)?([^\]])))))|(\])|(?:\\)?([^])/g;

    // eslint-disable-next-line
    while ((match = regex.exec(input)) !== null) {
        let token: CharRange | ICharSet | null = null;
        const [, _words, _digit, _space, _notWords, _notDigit, _notSpace, range, rangeFrom, rangeTo, char] = match;

        if (_words || _digit || _space || _notWords || _notDigit || _notSpace) {
            token = ((): ICharSet => {
                let result: ICharSet = {
                    type: CharTypes.SET,
                    set: [],
                    not: false,
                };

                if (_words) { // \w
                    result = words();
                } else if (_digit) { // \d
                    result = ints();
                } else if (_space) { // \s
                    result = whitespace();
                } else if (_notWords) { // \W
                    result = notWords();
                } else if (_notDigit) { // \D
                    result = notInts();
                } else if (_notSpace) { // \S
                    result = notWhitespace();
                }

                return result;
            })();
        } else if (range && char) {
            token = {
                type: CharTypes.RANGE,
                from: (rangeFrom || rangeTo).charCodeAt(0),
                to: char.charCodeAt(char.length - 1),
            };
        } else if (match[16]) {
            token = {
                type: CharTypes.CHAR,
                value: match[16].charCodeAt(0),
            };
        }

        if (!token) {
            return [tokens, regex.lastIndex];
        }

        tokens.push(token as CharRange | ICharSet);
    }

    throw new SyntaxError(`Invalid regular expression: /${pattern}/: Unterminated character class`);
};

function strToChars(str: string): string {
    return str.replace(
        /(\[\\b\])|(\\)?\\(?:u([A-F0-9]{4})|x([A-F0-9]{2})|c([@A-Z[\\\]^?])|([0tnvfr]))/g,
        (match, backspace, escapeChar, unicode, hex, ctrl, special) => {
            if (escapeChar) {
                return match;
            }

            let charCode;

            if (backspace) {
                charCode = 8;
            } else if (unicode) {
                charCode = Number.parseInt(unicode, 16);
            } else if (hex) {
                charCode = Number.parseInt(hex, 16);
            } else if (ctrl) {
                charCode = '@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^ ?'.indexOf(ctrl);
            } else {
                const specialMode: { [key: string]: number } = {
                    0: 0,
                    t: 9,
                    n: 10,
                    v: 11,
                    f: 12,
                    r: 13,
                };
                charCode = specialMode[special];
            }

            const char = String.fromCharCode(charCode);

            return /[[\]{}^$.|?*+()]/.test(char) ? `\\${char}` : char;
        }
    );
};

function processReferences(references: IReference[], captureCount: number): void {
    for (const ref of references.reverse()) {
        const value = ref.reference.value! as number;

        if (captureCount < value) {
            ref.reference.type = CharTypes.CHAR;
            const valueStr = value.toString();
            ref.reference.value = Number.parseInt(valueStr, 8);

            if (!/^[0-7]+$/.test(valueStr)) {
                let startIndex = 0;

                while (valueStr[startIndex] !== '8' && valueStr[startIndex] !== '9' && startIndex < valueStr.length) {
                    startIndex += 1;
                }

                if (startIndex === 0) {
                    ref.reference.value = valueStr.charCodeAt(0);
                    startIndex += 1;
                } else {
                    ref.reference.value = Number.parseInt(valueStr.slice(0, startIndex), 8);
                }

                if (valueStr.length > startIndex) {
                    const remainingStack = ref.stack.splice(ref.index + 1);

                    for (const char of valueStr.slice(startIndex)) {
                        ref.stack.push({
                            type: CharTypes.CHAR,
                            value: char.charCodeAt(0),
                        });
                    }

                    ref.stack.push(...remainingStack);
                }
            }
        }
    }
};

export function handleRegExp(regExpString: string, isGlobal: boolean) {
    if (!isValidRegExp(regExpString)) {
        return {
            isError: true,
            regExp: null,
        };
    }

    try {
        const regExp = new RegExp(regExpString, isGlobal ? 'ug' : 'u');

        if (!isSafeRegExp(regExp)) {
            return {
                isError: true,
                regExp: null,
            };
        }

        return {
            isError: false,
            regExp,
        };
    } catch (error) { // eslint-disable-line
        return {
            isError: true,
            regExp: null,
        };
    }
}

function isValidRegExp(regExpString: string): boolean {
    return !(
        (/\(\?<=.*?\)/g.test(regExpString) && !/\[.*?(\?<=.*?)\]/g.test(regExpString)) ||
        (/\(\?<!.*?\)/g.test(regExpString) && !/\[.*?(\?<!.*?)\]/g.test(regExpString))
    );
}

function isSafeRegExp(regExp: RegExp, options?: IOptions): boolean {
    const limit: number = options?.limit ?? 25;

    let str;

    if (Object.prototype.toString.call(regExp) === '[object RegExp]') {
        str = regExp.source;
    } else if (regExp && typeof regExp !== 'string') {
        str = `${regExp}`;
    }

    let tokens;

    try {
        tokens = tokenizer(str as string);
    } catch (error) { // eslint-disable-line
        return false;
    }

    let count = 0;

    const validateToken = (token: IToken, depth: number): boolean => {
        let _depth = depth;

        if (token.type === CharTypes.REPETITION) {
            _depth++;
            count++;

            if (_depth > 1) {
                return false;
            }

            if (count > limit) {
                return false;
            }
        }

        if (token.options) {
            for (const option of token.options) {
                const result = validateToken({ stack: option }, _depth);

                if (!result) {
                    return false;
                }
            }
        }

        const stack = token.stack || (token.value && (token.value as IToken).stack);

        if (!stack) {
            return true;
        }

        for (const item of stack) {
            const result = validateToken(item, _depth);

            if (!result) {
                return false;
            }
        }

        return true;
    };

    return validateToken(tokens, 0);
}
