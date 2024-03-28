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

import { Average } from './average';
import { Count } from './count';
import { Counta } from './counta';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';
import { Max } from './max';
import { Min } from './min';
import { StdevP } from './stdev-p';
import { StdevS } from './stdev-s';
import { Stdeva } from './stdeva';
import { Stdevpa } from './stdevpa';
import { VarP } from './var-p';
import { VarS } from './var-s';
import { Vara } from './vara';
import { Varpa } from './varpa';
import { Maxifs } from './maxifs';

export const functionStatistical = [
    [Average, FUNCTION_NAMES_STATISTICAL.AVERAGE],
    [Count, FUNCTION_NAMES_STATISTICAL.COUNT],
    [Max, FUNCTION_NAMES_STATISTICAL.MAX],
    [Min, FUNCTION_NAMES_STATISTICAL.MIN],
    [Min, FUNCTION_NAMES_STATISTICAL.MIN],
    [Counta, FUNCTION_NAMES_STATISTICAL.COUNTA],
    [StdevP, FUNCTION_NAMES_STATISTICAL.STDEV_P],
    [StdevS, FUNCTION_NAMES_STATISTICAL.STDEV_S],
    [Stdeva, FUNCTION_NAMES_STATISTICAL.STDEVA],
    [Stdevpa, FUNCTION_NAMES_STATISTICAL.STDEVPA],
    [VarP, FUNCTION_NAMES_STATISTICAL.VAR_P],
    [VarS, FUNCTION_NAMES_STATISTICAL.VAR_S],
    [Vara, FUNCTION_NAMES_STATISTICAL.VARA],
    [Varpa, FUNCTION_NAMES_STATISTICAL.VARPA],
    [Maxifs, FUNCTION_NAMES_STATISTICAL.MAXIFS],
];
