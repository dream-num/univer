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

import { FUNCTION_NAMES_TEXT } from './function-names';
import { Concat } from './concat';
import { Concatenate } from './concatenate';
import { Len } from './len';
import { Lenb } from './lenb';
import { Lower } from './lower';
import { Rept } from './rept';
import { Text } from './text';
import { Textafter } from './textafter';
import { Textbefore } from './textbefore';

export const functionText = [
    [Concat, FUNCTION_NAMES_TEXT.CONCAT],
    [Concatenate, FUNCTION_NAMES_TEXT.CONCATENATE],
    [Len, FUNCTION_NAMES_TEXT.LEN],
    [Lenb, FUNCTION_NAMES_TEXT.LENB],
    [Lower, FUNCTION_NAMES_TEXT.LOWER],
    [Rept, FUNCTION_NAMES_TEXT.REPT],
    [Text, FUNCTION_NAMES_TEXT.TEXT],
    [Textafter, FUNCTION_NAMES_TEXT.TEXTAFTER],
    [Textbefore, FUNCTION_NAMES_TEXT.TEXTBEFORE],
];
