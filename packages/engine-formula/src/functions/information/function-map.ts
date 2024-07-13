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

import { FUNCTION_NAMES_INFORMATION } from './function-names';
import { Cell } from './cell';
import { Isblank } from './isblank';
import { Iserr } from './iserr';
import { Iserror } from './iserror';
import { Iseven } from './iseven/iseven';
import { Islogical } from './islogical';
import { Isna } from './isna';
import { Isnontext } from './isnontext';
import { Isnumber } from './isnumber';
import { Isodd } from './isodd/isodd';
import { Isref } from './isref';
import { Istext } from './istext';

export const functionInformation = [
    [Cell, FUNCTION_NAMES_INFORMATION.CELL],
    [Isblank, FUNCTION_NAMES_INFORMATION.ISBLANK],
    [Iserr, FUNCTION_NAMES_INFORMATION.ISERR],
    [Iseven, FUNCTION_NAMES_INFORMATION.ISEVEN],
    [Isodd, FUNCTION_NAMES_INFORMATION.ISODD],
    [Iserror, FUNCTION_NAMES_INFORMATION.ISERROR],
    [Islogical, FUNCTION_NAMES_INFORMATION.ISLOGICAL],
    [Isna, FUNCTION_NAMES_INFORMATION.ISNA],
    [Isnontext, FUNCTION_NAMES_INFORMATION.ISNONTEXT],
    [Isnumber, FUNCTION_NAMES_INFORMATION.ISNUMBER],
    [Isref, FUNCTION_NAMES_INFORMATION.ISREF],
    [Istext, FUNCTION_NAMES_INFORMATION.ISTEXT],
];
