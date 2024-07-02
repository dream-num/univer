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

import { Abs } from './abs';
import { Acos } from './acos';
import { Acosh } from './acosh';
import { Acot } from './acot';
import { Asin } from './asin';
import { Asinh } from './asinh';
import { Atan } from './atan';
import { Atan2 } from './atan2';
import { Atanh } from './atanh';
import { Cos } from './cos';
import { FUNCTION_NAMES_MATH } from './function-names';
import { Mod } from './mod';
import { Power } from './power';
import { Product } from './product';
import { Subtotal } from './subtotal';
import { Sum } from './sum';
import { Sumif } from './sumif';
import { Sumifs } from './sumifs';
import { Tan } from './tan';
import { Tanh } from './tanh';

export const functionMath = [
    [Abs, FUNCTION_NAMES_MATH.ABS],
    [Acos, FUNCTION_NAMES_MATH.ACOS],
    [Acosh, FUNCTION_NAMES_MATH.ACOSH],
    [Acot, FUNCTION_NAMES_MATH.ACOT],
    [Asin, FUNCTION_NAMES_MATH.ASIN],
    [Asinh, FUNCTION_NAMES_MATH.ASINH],
    [Atan, FUNCTION_NAMES_MATH.ATAN],
    [Atan2, FUNCTION_NAMES_MATH.ATAN2],
    [Atanh, FUNCTION_NAMES_MATH.ATANH],
    [Cos, FUNCTION_NAMES_MATH.COS],
    [Mod, FUNCTION_NAMES_MATH.MOD],
    [Power, FUNCTION_NAMES_MATH.POWER],
    [Product, FUNCTION_NAMES_MATH.PRODUCT],
    [Subtotal, FUNCTION_NAMES_MATH.SUBTOTAL],
    [Sum, FUNCTION_NAMES_MATH.SUM],
    [Sumif, FUNCTION_NAMES_MATH.SUMIF],
    [Sumifs, FUNCTION_NAMES_MATH.SUMIFS],
    [Tan, FUNCTION_NAMES_MATH.TAN],
    [Tanh, FUNCTION_NAMES_MATH.TANH],
];
