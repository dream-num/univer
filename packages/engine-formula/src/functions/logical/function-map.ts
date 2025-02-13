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

import { And } from './and';
import { Bycol } from './bycol';
import { Byrow } from './byrow';
import { False } from './false';
import { FUNCTION_NAMES_LOGICAL } from './function-names';
import { If } from './if';
import { Iferror } from './iferror';
import { Ifna } from './ifna';
import { Ifs } from './ifs';
import { Lambda } from './lambda';
import { Let } from './let';
import { Makearray } from './makearray';
import { Map } from './map';
import { Not } from './not';
import { Or } from './or';
import { Reduce } from './reduce';
import { Scan } from './scan';
import { Switch } from './switch';
import { True } from './true';
import { Xor } from './xor';

export const functionLogical = [
    [And, FUNCTION_NAMES_LOGICAL.AND],
    [Bycol, FUNCTION_NAMES_LOGICAL.BYCOL],
    [Byrow, FUNCTION_NAMES_LOGICAL.BYROW],
    [False, FUNCTION_NAMES_LOGICAL.FALSE],
    [If, FUNCTION_NAMES_LOGICAL.IF],
    [Iferror, FUNCTION_NAMES_LOGICAL.IFERROR],
    [Ifna, FUNCTION_NAMES_LOGICAL.IFNA],
    [Ifs, FUNCTION_NAMES_LOGICAL.IFS],
    [Lambda, FUNCTION_NAMES_LOGICAL.LAMBDA],
    [Let, FUNCTION_NAMES_LOGICAL.LET],
    [Makearray, FUNCTION_NAMES_LOGICAL.MAKEARRAY],
    [Map, FUNCTION_NAMES_LOGICAL.MAP],
    [Not, FUNCTION_NAMES_LOGICAL.NOT],
    [Or, FUNCTION_NAMES_LOGICAL.OR],
    [Reduce, FUNCTION_NAMES_LOGICAL.REDUCE],
    [Scan, FUNCTION_NAMES_LOGICAL.SCAN],
    [Switch, FUNCTION_NAMES_LOGICAL.SWITCH],
    [True, FUNCTION_NAMES_LOGICAL.TRUE],
    [Xor, FUNCTION_NAMES_LOGICAL.XOR],
];
