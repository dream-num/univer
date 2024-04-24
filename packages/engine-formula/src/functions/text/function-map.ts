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

import { Concatenate } from './concatenate';
import { FUNCTION_NAMES_TEXT } from './function-names';
import { Len } from './len';
import { Lenb } from './lenb';
import { Text } from './text';
import { Lower } from './lower';

export const functionText = [
    [Concatenate, FUNCTION_NAMES_TEXT.CONCATENATE],
    [Len, FUNCTION_NAMES_TEXT.LEN],
    [Lenb, FUNCTION_NAMES_TEXT.LENB],
    [Text, FUNCTION_NAMES_TEXT.TEXT],
    [Lower, FUNCTION_NAMES_TEXT.LOWER],
];
