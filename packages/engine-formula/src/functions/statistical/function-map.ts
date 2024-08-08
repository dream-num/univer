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

import { FUNCTION_NAMES_STATISTICAL } from './function-names';
import { Avedev } from './avedev';
import { Average } from './average';
import { Averagea } from './averagea';
import { Averageif } from './averageif';
import { Averageifs } from './averageifs';
import { Count } from './count';
import { Counta } from './counta';
import { Countblank } from './countblank';
import { Countif } from './countif';
import { Countifs } from './countifs';
import { Max } from './max';
import { Maxa } from './maxa';
import { Maxifs } from './maxifs';
import { Min } from './min';
import { Mina } from './mina';
import { Minifs } from './minifs';
import { StdevP } from './stdev-p';
import { StdevS } from './stdev-s';
import { Stdeva } from './stdeva';
import { Stdevpa } from './stdevpa';
import { VarP } from './var-p';
import { VarS } from './var-s';
import { Vara } from './vara';
import { Varpa } from './varpa';

export const functionStatistical = [
    [Avedev, FUNCTION_NAMES_STATISTICAL.AVEDEV],
    [Average, FUNCTION_NAMES_STATISTICAL.AVERAGE],
    [Averagea, FUNCTION_NAMES_STATISTICAL.AVERAGEA],
    [Averageif, FUNCTION_NAMES_STATISTICAL.AVERAGEIF],
    [Averageifs, FUNCTION_NAMES_STATISTICAL.AVERAGEIFS],
    [Count, FUNCTION_NAMES_STATISTICAL.COUNT],
    [Counta, FUNCTION_NAMES_STATISTICAL.COUNTA],
    [Countblank, FUNCTION_NAMES_STATISTICAL.COUNTBLANK],
    [Countif, FUNCTION_NAMES_STATISTICAL.COUNTIF],
    [Countifs, FUNCTION_NAMES_STATISTICAL.COUNTIFS],
    [Max, FUNCTION_NAMES_STATISTICAL.MAX],
    [Maxa, FUNCTION_NAMES_STATISTICAL.MAXA],
    [Maxifs, FUNCTION_NAMES_STATISTICAL.MAXIFS],
    [Min, FUNCTION_NAMES_STATISTICAL.MIN],
    [Mina, FUNCTION_NAMES_STATISTICAL.MINA],
    [Minifs, FUNCTION_NAMES_STATISTICAL.MINIFS],
    [StdevP, FUNCTION_NAMES_STATISTICAL.STDEV_P],
    [StdevS, FUNCTION_NAMES_STATISTICAL.STDEV_S],
    [Stdeva, FUNCTION_NAMES_STATISTICAL.STDEVA],
    [Stdevpa, FUNCTION_NAMES_STATISTICAL.STDEVPA],
    [VarP, FUNCTION_NAMES_STATISTICAL.VAR_P],
    [VarS, FUNCTION_NAMES_STATISTICAL.VAR_S],
    [Vara, FUNCTION_NAMES_STATISTICAL.VARA],
    [Varpa, FUNCTION_NAMES_STATISTICAL.VARPA],
];
