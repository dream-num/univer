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

import { And } from './and';
import { False } from './false';
import { FUNCTION_NAMES_LOGICAL } from './function-names';
import { If } from './if';
import { Iferror } from './iferror';
import { Ifna } from './ifna';
import { Ifs } from './ifs';
import { Lambda } from './lambda';
import { Makearray } from './makearray';
import { Not } from './not';
import { Or } from './or';
import { Switch } from './switch';
import { True } from './true';
import { Xor } from './xor';

export const functionLogical = [
    [And, FUNCTION_NAMES_LOGICAL.AND],
    [False, FUNCTION_NAMES_LOGICAL.FALSE],
    [If, FUNCTION_NAMES_LOGICAL.IF],
    [Ifna, FUNCTION_NAMES_LOGICAL.IFNA],
    [Ifs, FUNCTION_NAMES_LOGICAL.IFS],
    [Lambda, FUNCTION_NAMES_LOGICAL.LAMBDA],
    [Makearray, FUNCTION_NAMES_LOGICAL.MAKEARRAY],
    [Not, FUNCTION_NAMES_LOGICAL.NOT],
    [Or, FUNCTION_NAMES_LOGICAL.OR],
    [Iferror, FUNCTION_NAMES_LOGICAL.IFERROR],
    [Switch, FUNCTION_NAMES_LOGICAL.SWITCH],
    [True, FUNCTION_NAMES_LOGICAL.TRUE],
    [Xor, FUNCTION_NAMES_LOGICAL.XOR],
];
