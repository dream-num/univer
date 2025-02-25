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

import { Daverage } from './daverage';
import { Dcount } from './dcount';
import { Dcounta } from './dcounta';
import { Dget } from './dget';
import { Dmax } from './dmax';
import { Dmin } from './dmin';
import { Dproduct } from './dproduct';
import { Dstdev } from './dstdev';
import { Dstdevp } from './dstdevp';
import { Dsum } from './dsum';
import { Dvar } from './dvar';
import { Dvarp } from './dvarp';
import { FUNCTION_NAMES_DATABASE } from './function-names';

export const functionDatabase = [
    [Daverage, FUNCTION_NAMES_DATABASE.DAVERAGE],
    [Dcount, FUNCTION_NAMES_DATABASE.DCOUNT],
    [Dcounta, FUNCTION_NAMES_DATABASE.DCOUNTA],
    [Dget, FUNCTION_NAMES_DATABASE.DGET],
    [Dmax, FUNCTION_NAMES_DATABASE.DMAX],
    [Dmin, FUNCTION_NAMES_DATABASE.DMIN],
    [Dproduct, FUNCTION_NAMES_DATABASE.DPRODUCT],
    [Dstdev, FUNCTION_NAMES_DATABASE.DSTDEV],
    [Dstdevp, FUNCTION_NAMES_DATABASE.DSTDEVP],
    [Dsum, FUNCTION_NAMES_DATABASE.DSUM],
    [Dvar, FUNCTION_NAMES_DATABASE.DVAR],
    [Dvarp, FUNCTION_NAMES_DATABASE.DVARP],
];
