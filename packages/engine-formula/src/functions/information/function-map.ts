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

import { Cell } from './cell';
import { ErrorType } from './error-type';
import { FUNCTION_NAMES_INFORMATION } from './function-names';
import { Isbetween } from './isbetween';
import { Isblank } from './isblank';
import { Isdate } from './isdate';
import { Isemail } from './isemail';
import { Iserr } from './iserr';
import { Iserror } from './iserror';
import { Iseven } from './iseven/iseven';
import { Isformula } from './isformula';
import { Islogical } from './islogical';
import { Isna } from './isna';
import { Isnontext } from './isnontext';
import { Isnumber } from './isnumber';
import { Isodd } from './isodd/isodd';
import { Isref } from './isref';
import { Istext } from './istext';
import { Isurl } from './isurl';
import { N } from './n';
import { Na } from './na';
import { Sheet } from './sheet';
import { Sheets } from './sheets';
import { Type } from './type';

export const functionInformation = [
    [Cell, FUNCTION_NAMES_INFORMATION.CELL],
    [ErrorType, FUNCTION_NAMES_INFORMATION.ERROR_TYPE],
    [Isbetween, FUNCTION_NAMES_INFORMATION.ISBETWEEN],
    [Isblank, FUNCTION_NAMES_INFORMATION.ISBLANK],
    [Isdate, FUNCTION_NAMES_INFORMATION.ISDATE],
    [Isemail, FUNCTION_NAMES_INFORMATION.ISEMAIL],
    [Iserr, FUNCTION_NAMES_INFORMATION.ISERR],
    [Iserror, FUNCTION_NAMES_INFORMATION.ISERROR],
    [Iseven, FUNCTION_NAMES_INFORMATION.ISEVEN],
    [Isformula, FUNCTION_NAMES_INFORMATION.ISFORMULA],
    [Islogical, FUNCTION_NAMES_INFORMATION.ISLOGICAL],
    [Isna, FUNCTION_NAMES_INFORMATION.ISNA],
    [Isnontext, FUNCTION_NAMES_INFORMATION.ISNONTEXT],
    [Isnumber, FUNCTION_NAMES_INFORMATION.ISNUMBER],
    [Isodd, FUNCTION_NAMES_INFORMATION.ISODD],
    [Isref, FUNCTION_NAMES_INFORMATION.ISREF],
    [Istext, FUNCTION_NAMES_INFORMATION.ISTEXT],
    [Isurl, FUNCTION_NAMES_INFORMATION.ISURL],
    [N, FUNCTION_NAMES_INFORMATION.N],
    [Na, FUNCTION_NAMES_INFORMATION.NA],
    [Sheet, FUNCTION_NAMES_INFORMATION.SHEET],
    [Sheets, FUNCTION_NAMES_INFORMATION.SHEETS],
    [Type, FUNCTION_NAMES_INFORMATION.TYPE],
];
