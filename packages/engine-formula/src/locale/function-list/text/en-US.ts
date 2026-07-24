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

const locale = {
    ASC: {
        description: 'Changes full-width (double-byte) English letters or katakana within a character string to half-width (single-byte) characters',
        abstract: 'Changes full-width (double-byte) English letters or katakana within a character string to half-width (single-byte) characters',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text or a reference to a cell that contains the text you want to change. If text does not contain any full-width letters, text is not changed.' },
        },
    },
    ARRAYTOTEXT: {
        description: 'Returns an array of text values from any specified range',
        abstract: 'Returns an array of text values from any specified range',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'The array to return as text.' },
            format: { name: 'format', detail: 'The format of the returned data. It can be one of two values: \n0 Default. Concise format that is easy to read. \n1 Strict format that includes escape characters and row delimiters. Generates a string that can be parsed when entered into the formula bar. Encapsulates returned strings in quotes except for Booleans, Numbers and Errors.' },
        },
    },
    BAHTTEXT: {
        description: 'Converts a number to text, using the ß (baht) currency format',
        abstract: 'Converts a number to text, using the ß (baht) currency format',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'A number you want to convert to text, or a reference to a cell containing a number, or a formula that evaluates to a number.' },
        },
    },
    CHAR: {
        description: 'Returns the character specified by the code number',
        abstract: 'Returns the character specified by the code number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'A number between 1 and 255 specifying which character you want. The character is from the character set used by your computer.' },
        },
    },
    CLEAN: {
        description: 'Removes all nonprintable characters from text',
        abstract: 'Removes all nonprintable characters from text',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Any worksheet information from which you want to remove nonprintable characters.' },
        },
    },
    CODE: {
        description: 'Returns a numeric code for the first character in a text string',
        abstract: 'Returns a numeric code for the first character in a text string',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text for which you want the code of the first character.' },
        },
    },
    CONCAT: {
        description: 'Combines the text from multiple ranges and/or strings, but it doesn\'t provide the delimiter or IgnoreEmpty arguments.',
        abstract: 'Combines the text from multiple ranges and/or strings, but it doesn\'t provide the delimiter or IgnoreEmpty arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/concat-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Text item to be joined. A string, or array of strings, such as a range of cells.' },
            text2: { name: 'text2', detail: 'Additional text items to be joined. There can be a maximum of 253 text arguments for the text items. Each can be a string, or array of strings, such as a range of cells.' },
        },
    },
    CONCATENATE: {
        description: 'Joins several text items into one text item',
        abstract: 'Joins several text items into one text item',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/concatenate-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'The first item to join. The item can be a text value, number, or cell reference.' },
            text2: { name: 'text2', detail: 'Additional text items to join. You can have up to 255 items, up to a total of 8,192 characters.' },
        },
    },
    DBCS: {
        description: 'Changes half-width (single-byte) English letters or katakana within a character string to full-width (double-byte) characters',
        abstract: 'Changes half-width (single-byte) English letters or katakana within a character string to full-width (double-byte) characters',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text or a reference to a cell that contains the text you want to change. If text does not contain any half-width English letters or katakana, text is not changed.' },
        },
    },
    DOLLAR: {
        description: 'Converts a number to text using currency format',
        abstract: 'Converts a number to text using currency format',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'A number, a reference to a cell containing a number, or a formula that evaluates to a number.' },
            decimals: { name: 'decimals', detail: 'The number of digits to the right of the decimal point. If this is negative, the number is rounded to the left of the decimal point. If you omit decimals, it is assumed to be 2.' },
        },
    },
    EXACT: {
        description: 'Checks to see if two text values are identical',
        abstract: 'Checks to see if two text values are identical',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'The first text string.' },
            text2: { name: 'text2', detail: 'The second text string.' },
        },
    },
    FIND: {
        description: 'Finds one text value within another (case-sensitive)',
        abstract: 'Finds one text value within another (case-sensitive)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'The text you want to find.' },
            withinText: { name: 'within_text', detail: 'The text containing the text you want to find.' },
            startNum: { name: 'start_num', detail: 'Specifies the character at which to start the search. If you omit start_num, it is assumed to be 1.' },
        },
    },
    FINDB: {
        description: 'Finds one text value within another (case-sensitive)',
        abstract: 'Finds one text value within another (case-sensitive)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'The text you want to find.' },
            withinText: { name: 'within_text', detail: 'The text containing the text you want to find.' },
            startNum: { name: 'start_num', detail: 'Specifies the character at which to start the search. If you omit start_num, it is assumed to be 1.' },
        },
    },
    FIXED: {
        description: 'Formats a number as text with a fixed number of decimals',
        abstract: 'Formats a number as text with a fixed number of decimals',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number you want to round and convert to text.' },
            decimals: { name: 'decimals', detail: 'The number of digits to the right of the decimal point. If this is negative, the number is rounded to the left of the decimal point. If you omit decimals, it is assumed to be 2.' },
            noCommas: { name: 'no_commas', detail: 'A logical value that, if TRUE, prevents FIXED from including commas in the returned text.' },
        },
    },
    LEFT: {
        description: 'Returns the leftmost characters from a text value',
        abstract: 'Returns the leftmost characters from a text value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text string containing the characters you want to extract.' },
            numChars: { name: 'num_chars', detail: 'Specifies the number of characters you want LEFT to extract.' },
        },
    },
    LEFTB: {
        description: 'Returns the leftmost characters from a text value',
        abstract: 'Returns the leftmost characters from a text value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text string containing the characters you want to extract.' },
            numBytes: { name: 'num_bytes', detail: 'Specifies the number of characters you want LEFTB to extract, based on bytes.' },
        },
    },
    LEN: {
        description: 'Returns the number of characters in a text string',
        abstract: 'Returns the number of characters in a text string',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text whose length you want to find. Spaces count as characters.' },
        },
    },
    LENB: {
        description: 'Returns the number of bytes used to represent the characters in a text string.',
        abstract: 'Returns the number of bytes used to represent the characters in a text string',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text whose length you want to find. Spaces count as characters.' },
        },
    },
    LOWER: {
        description: 'Converts text to lowercase.',
        abstract: 'Converts text to lowercase',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text you want to convert to lowercase.' },
        },
    },
    MID: {
        description: 'Returns a specific number of characters from a text string starting at the position you specify.',
        abstract: 'Returns a specific number of characters from a text string starting at the position you specify',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text string containing the characters you want to extract.' },
            startNum: { name: 'start_num', detail: 'The position of the first character you want to extract in text.' },
            numChars: { name: 'num_chars', detail: 'Specifies the number of characters you want MID to extract.' },
        },
    },
    MIDB: {
        description: 'Returns a specific number of characters from a text string starting at the position you specify',
        abstract: 'Returns a specific number of characters from a text string starting at the position you specify',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text string containing the characters you want to extract.' },
            startNum: { name: 'start_num', detail: 'The position of the first character you want to extract in text.' },
            numBytes: { name: 'num_bytes', detail: 'Specifies the number of characters you want MIDB to extract, based on bytes.' },
        },
    },
    NUMBERSTRING: {
        description: 'Convert numbers to Chinese strings',
        abstract: 'Convert numbers to Chinese strings',
        links: [
            {
                title: 'Instruction',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value converted to a Chinese string.' },
            type: { name: 'type', detail: 'The type of the returned result. \n1. Chinese lowercase \n2. Chinese uppercase \n3. Reading and Writing Chinese Characters' },
        },
    },
    NUMBERVALUE: {
        description: 'Converts text to number in a locale-independent manner',
        abstract: 'Converts text to number in a locale-independent manner',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text to convert to a number.' },
            decimalSeparator: { name: 'decimal_separator', detail: 'The character used to separate the integer and fractional part of the result.' },
            groupSeparator: { name: 'group_separator', detail: 'The character used to separate groupings of numbers.' },
        },
    },
    PHONETIC: {
        description: 'Extracts the phonetic (furigana) characters from a text string',
        abstract: 'Extracts the phonetic (furigana) characters from a text string',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'Reference', detail: 'Required. Text string or a reference to a single cell or a range of cells that contain a furigana text string.' },
        },
    },
    PROPER: {
        description: 'Capitalizes the first letter in each word of a text value',
        abstract: 'Capitalizes the first letter in each word of a text value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text enclosed in quotation marks, a formula that returns text, or a reference to a cell containing the text you want to partially capitalize.' },
        },
    },
    REGEXEXTRACT: {
        description: 'Extracts the first matching substrings according to a regular expression.',
        abstract: 'Extracts the first matching substrings according to a regular expression.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098244?hl=en',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The input text.' },
            regularExpression: { name: 'regular_expression', detail: 'The first part of text that matches this expression will be returned.' },
        },
    },
    REGEXMATCH: {
        description: 'Whether a piece of text matches a regular expression.',
        abstract: 'Whether a piece of text matches a regular expression.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098292?hl=en',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text to be tested against the regular expression.' },
            regularExpression: { name: 'regular_expression', detail: 'The regular expression to test the text against.' },
        },
    },
    REGEXREPLACE: {
        description: 'Replaces part of a text string with a different text string using regular expressions.',
        abstract: 'Replaces part of a text string with a different text string using regular expressions.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098245?hl=en',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text, a part of which will be replaced.' },
            regularExpression: { name: 'regular_expression', detail: 'The regular expression. All matching instances in text will be replaced.' },
            replacement: { name: 'replacement', detail: 'The text which will be inserted into the original text.' },
        },
    },
    REPLACE: {
        description: 'Replaces characters within text',
        abstract: 'Replaces characters within text',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'Text in which you want to replace some characters.' },
            startNum: { name: 'start_num', detail: 'The position of the character in old_text that you want to replace with new_text.' },
            numChars: { name: 'num_chars', detail: 'The number of characters in old_text that you want REPLACE to replace with new_text.' },
            newText: { name: 'new_text', detail: 'The text that will replace characters in old_text.' },
        },
    },
    REPLACEB: {
        description: 'Replaces characters within text',
        abstract: 'Replaces characters within text',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'Text in which you want to replace some characters.' },
            startNum: { name: 'start_num', detail: 'The position of the character in old_text that you want to replace with new_text.' },
            numBytes: { name: 'num_bytes', detail: 'The number of bytes in old_text that you want REPLACEB to replace with new_text.' },
            newText: { name: 'new_text', detail: 'The text that will replace characters in old_text.' },
        },
    },
    REPT: {
        description: 'Repeats text a given number of times',
        abstract: 'Repeats text a given number of times',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/rept-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text you want to repeat.' },
            numberTimes: { name: 'number_times', detail: 'A positive number specifying the number of times to repeat text.' },
        },
    },
    RIGHT: {
        description: 'Returns the rightmost characters from a text value',
        abstract: 'Returns the rightmost characters from a text value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text string containing the characters you want to extract.' },
            numChars: { name: 'num_chars', detail: 'Specifies the number of characters you want RIGHT to extract.' },
        },
    },
    RIGHTB: {
        description: 'Returns the rightmost characters from a text value',
        abstract: 'Returns the rightmost characters from a text value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text string containing the characters you want to extract.' },
            numBytes: { name: 'num_bytes', detail: 'Specifies the number of characters you want RIGHTB to extract, based on bytes.' },
        },
    },
    SEARCH: {
        description: 'Finds one text value within another (not case-sensitive)',
        abstract: 'Finds one text value within another (not case-sensitive)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'The text you want to find.' },
            withinText: { name: 'within_text', detail: 'The text containing the text you want to find.' },
            startNum: { name: 'start_num', detail: 'Specifies the character at which to start the search. If you omit start_num, it is assumed to be 1.' },
        },
    },
    SEARCHB: {
        description: 'Finds one text value within another (not case-sensitive)',
        abstract: 'Finds one text value within another (not case-sensitive)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'The text you want to find.' },
            withinText: { name: 'within_text', detail: 'The text containing the text you want to find.' },
            startNum: { name: 'start_num', detail: 'Specifies the character at which to start the search. If you omit start_num, it is assumed to be 1.' },
        },
    },
    SUBSTITUTE: {
        description: 'Substitutes new text for old text in a text string',
        abstract: 'Substitutes new text for old text in a text string',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text or the reference to a cell containing text for which you want to substitute characters.' },
            oldText: { name: 'old_text', detail: 'The text you want to replace.' },
            newText: { name: 'new_text', detail: 'The text you want to replace old_text with.' },
            instanceNum: { name: 'instance_num', detail: 'Specifies which occurrence of old_text you want to replace with new_text. If you specify instance_num, only that instance of old_text is replaced. Otherwise, every occurrence of old_text in text is changed to new_text.' },
        },
    },
    T: {
        description: 'Converts its arguments to text',
        abstract: 'Converts its arguments to text',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'The value you want to test.' },
        },
    },
    TEXT: {
        description: 'Formats a number and converts it to text',
        abstract: 'Formats a number and converts it to text',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/text-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'A numeric value that you want to be converted into text.' },
            formatText: { name: 'format_text', detail: 'A text string that defines the formatting that you want to be applied to the supplied value.' },
        },
    },
    TEXTAFTER: {
        description: 'Returns text that occurs after given character or string',
        abstract: 'Returns text that occurs after given character or string',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/textafter-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text you are searching within. Wildcard characters not allowed.' },
            delimiter: { name: 'delimiter', detail: 'The text that marks the point after which you want to extract.' },
            instanceNum: { name: 'instance_num', detail: 'The instance of the delimiter after which you want to extract the text.' },
            matchMode: { name: 'match_mode', detail: 'Determines whether the text search is case-sensitive. The default is case-sensitive.' },
            matchEnd: { name: 'match_end', detail: 'Treats the end of text as a delimiter. By default, the text is an exact match.' },
            ifNotFound: { name: 'if_not_found', detail: 'Value returned if no match is found. By default, #N/A is returned.' },
        },
    },
    TEXTBEFORE: {
        description: 'Returns text that occurs before a given character or string',
        abstract: 'Returns text that occurs before a given character or string',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/textbefore-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text you are searching within. Wildcard characters not allowed.' },
            delimiter: { name: 'delimiter', detail: 'The text that marks the point after which you want to extract.' },
            instanceNum: { name: 'instance_num', detail: 'The instance of the delimiter after which you want to extract the text.' },
            matchMode: { name: 'match_mode', detail: 'Determines whether the text search is case-sensitive. The default is case-sensitive.' },
            matchEnd: { name: 'match_end', detail: 'Treats the end of text as a delimiter. By default, the text is an exact match.' },
            ifNotFound: { name: 'if_not_found', detail: 'Value returned if no match is found. By default, #N/A is returned.' },
        },
    },
    TEXTJOIN: {
        description: 'Text: Combines the text from multiple ranges and/or strings',
        abstract: 'Text: Combines the text from multiple ranges and/or strings',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: 'delimiter', detail: 'A text string, either empty, or one or more characters enclosed by double quotes, or a reference to a valid text string.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'If TRUE, ignores empty cells.' },
            text1: { name: 'text1', detail: 'Text item to be joined. A text string, or array of strings, such as a range of cells.' },
            text2: { name: 'text2', detail: 'Additional text items to be joined. There can be a maximum of 252 text arguments for the text items, including text1. Each can be a text string, or array of strings, such as a range of cells.' },
        },
    },
    TEXTSPLIT: {
        description: 'Splits text strings by using column and row delimiters',
        abstract: 'Splits text strings by using column and row delimiters',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/textsplit-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text to split.' },
            colDelimiter: { name: 'col_delimiter', detail: 'The character or string by which to split the column.' },
            rowDelimiter: { name: 'row_delimiter', detail: 'The character or string on which to split the line.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Whether to ignore empty cells. The default is FALSE.' },
            matchMode: { name: 'match_mode', detail: 'Searches for a delimiter match in the text. By default, a case-sensitive match is done.' },
            padWith: { name: 'pad_with', detail: 'The value to use for padding. By default, #N/A is used.' },
        },
    },
    TRIM: {
        description: 'Removes all spaces from text except for single spaces between words.',
        abstract: 'Removes spaces from text',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text from which you want spaces removed.' },
        },
    },
    UNICHAR: {
        description: 'Returns the Unicode character that is references by the given numeric value',
        abstract: 'Returns the Unicode character that is references by the given numeric value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Number is the Unicode number that represents the character.' },
        },
    },
    UNICODE: {
        description: 'Returns the number (code point) that corresponds to the first character of the text',
        abstract: 'Returns the number (code point) that corresponds to the first character of the text',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Text is the character for which you want the Unicode value.' },
        },
    },
    UPPER: {
        description: 'Converts text to uppercase',
        abstract: 'Converts text to uppercase',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text you want converted to uppercase.' },
        },
    },
    VALUE: {
        description: 'Converts a text argument to a number',
        abstract: 'Converts a text argument to a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The text enclosed in quotation marks or a reference to a cell containing the text you want to convert.' },
        },
    },
    VALUETOTEXT: {
        description: 'Returns text from any specified value',
        abstract: 'Returns text from any specified value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'The value to return as text.' },
            format: { name: 'format', detail: 'The format of the returned data. It can be one of two values: \n0 Default. Concise format that is easy to read. \n1 Strict format that includes escape characters and row delimiters. Generates a string that can be parsed when entered into the formula bar. Encapsulates returned strings in quotes except for Booleans, Numbers and Errors.' },
        },
    },
    CALL: {
        description: 'Calls a procedure in a dynamic link library or code resource',
        abstract: 'Calls a procedure in a dynamic link library or code resource',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Required. Quoted text specifying the name of the dynamic link library (DLL) that contains the procedure in Microsoft Excel for Windows.' },
            procedure: { name: 'Procedure', detail: 'Required. Text specifying the name of the function in the DLL in Microsoft Excel for Windows. You can also use the ordinal value of the function from the EXPORTS statement in the module-definition file (.DEF). The ordinal value must not be in the form of text.' },
            typeText: { name: 'Type_text', detail: 'Required. Text specifying the data type of the return value and the data types of all arguments to the DLL or code resource. The first letter of type_text specifies the return value. The codes you use for type_text are described in detail in Using the CALL and REGISTER functions . For stand-alone DLLs or code resources (XLLs), you can omit this argument.' },
            argument1: { name: 'Argument1,...', detail: 'Optional. The arguments to be passed to the procedure.' },
        },
    },
    EUROCONVERT: {
        description: 'Converts a number to euros, converts a number from euros to a euro member currency, or converts a number from one euro member currency to another by using the euro as an intermediary (triangulation)',
        abstract: 'Converts a number to euros, converts a number from euros to a euro member currency, or converts a number from one euro member currency to another by using the euro as an intermediary (triangulation)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'Number', detail: 'Required. The currency value you want to convert, or a reference to a cell containing the value.' },
            source: { name: 'Source', detail: 'Required. A three-letter string, or reference to a cell containing the string, corresponding to the ISO code for the source currency. The following currency codes are available in the EUROCONVERT function:' },
            target: { name: 'Target', detail: 'Required. A three-letter string, or cell reference, corresponding to the ISO code of the currency to which you want to convert the number. See the previous Source table for the ISO codes.' },
            fullPrecision: { name: 'Full_precision', detail: 'Required. A logical value (TRUE or FALSE), or an expression that evaluates to a value of TRUE or FALSE, that specifies how to display the result.' },
            triangulationPrecision: { name: 'Triangulation_precision', detail: 'Required. An integer equal to or greater than 3 that specifies the number of significant digits to be used for the intermediate euro value when converting between two euro member currencies. If you omit this argument, Excel does not round the intermediate euro value. If you include this argument when converting from a euro member currency to the euro, Excel calculates the intermediate euro value that could then be converted to a euro member currency.' },
        },
    },
    REGISTER_ID: {
        description: 'Returns the register ID of the specified dynamic link library (DLL) or code resource that has been previously registered',
        abstract: 'Returns the register ID of the specified dynamic link library (DLL) or code resource that has been previously registered',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Required. Text specifying the name of the DLL that contains the function in Microsoft Excel for Windows.' },
            procedure: { name: 'Procedure', detail: 'Required. Text specifying the name of the function in the DLL in Microsoft Excel for Windows. You can also use the ordinal value of the function from the EXPORTS statement in the module-definition file (.DEF). The ordinal value or resource ID number must not be in text form.' },
            typeText: { name: 'Type_text', detail: 'Optional. Text specifying the data type of the return value and the data types of all arguments to the DLL. The first letter of type_text specifies the return value. If the function or code resource is already registered, you can omit this argument.' },
        },
    },
};

export default locale;
