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

import { FUNCTION_NAMES_MATH } from './function-names';
import { Abs } from './abs';
import { Acos } from './acos';
import { Acosh } from './acosh';
import { Acot } from './acot';
import { Acoth } from './acoth';
import { Asin } from './asin';
import { Asinh } from './asinh';
import { Atan } from './atan';
import { Atan2 } from './atan2';
import { Atanh } from './atanh';
import { Base } from './base';
import { Ceiling } from './ceiling';
import { CeilingMath } from './ceiling-math';
import { CeilingPrecise } from './ceiling-precise';
import { Cos } from './cos';
import { Cosh } from './cosh';
import { Cot } from './cot';
import { Coth } from './coth';
import { Csc } from './csc';
import { Csch } from './csch';
import { Floor } from './floor';
import { FloorMath } from './floor-math';
import { FloorPrecise } from './floor-precise';
import { Mod } from './mod';
import { Mround } from './mround';
import { Power } from './power';
import { Product } from './product';
import { Round } from './round';
import { Rounddown } from './rounddown';
import { Roundup } from './roundup';
import { Sin } from './sin';
import { Sinh } from './sinh';
import { Subtotal } from './subtotal';
import { Sum } from './sum';
import { Sumif } from './sumif';
import { Sumifs } from './sumifs';
import { Sumproduct } from './sumproduct';
import { Tan } from './tan';
import { Tanh } from './tanh';

export const functionMath = [
    [Abs, FUNCTION_NAMES_MATH.ABS],
    [Acos, FUNCTION_NAMES_MATH.ACOS],
    [Acosh, FUNCTION_NAMES_MATH.ACOSH],
    [Acot, FUNCTION_NAMES_MATH.ACOT],
    [Acoth, FUNCTION_NAMES_MATH.ACOTH],
    [Asin, FUNCTION_NAMES_MATH.ASIN],
    [Asinh, FUNCTION_NAMES_MATH.ASINH],
    [Atan, FUNCTION_NAMES_MATH.ATAN],
    [Atan2, FUNCTION_NAMES_MATH.ATAN2],
    [Atanh, FUNCTION_NAMES_MATH.ATANH],
    [Base, FUNCTION_NAMES_MATH.BASE],
    [Ceiling, FUNCTION_NAMES_MATH.CEILING],
    [CeilingMath, FUNCTION_NAMES_MATH.CEILING_MATH],
    [CeilingPrecise, FUNCTION_NAMES_MATH.CEILING_PRECISE],
    [Cos, FUNCTION_NAMES_MATH.COS],
    [Cosh, FUNCTION_NAMES_MATH.COSH],
    [Cot, FUNCTION_NAMES_MATH.COT],
    [Coth, FUNCTION_NAMES_MATH.COTH],
    [Csc, FUNCTION_NAMES_MATH.CSC],
    [Csch, FUNCTION_NAMES_MATH.CSCH],
    [Floor, FUNCTION_NAMES_MATH.FLOOR],
    [FloorMath, FUNCTION_NAMES_MATH.FLOOR_MATH],
    [FloorPrecise, FUNCTION_NAMES_MATH.FLOOR_PRECISE],
    [Mod, FUNCTION_NAMES_MATH.MOD],
    [Mround, FUNCTION_NAMES_MATH.MROUND],
    [Power, FUNCTION_NAMES_MATH.POWER],
    [Product, FUNCTION_NAMES_MATH.PRODUCT],
    [Round, FUNCTION_NAMES_MATH.ROUND],
    [Rounddown, FUNCTION_NAMES_MATH.ROUNDDOWN],
    [Roundup, FUNCTION_NAMES_MATH.ROUNDUP],
    [Sin, FUNCTION_NAMES_MATH.SIN],
    [Sinh, FUNCTION_NAMES_MATH.SINH],
    [Subtotal, FUNCTION_NAMES_MATH.SUBTOTAL],
    [Sum, FUNCTION_NAMES_MATH.SUM],
    [Sumif, FUNCTION_NAMES_MATH.SUMIF],
    [Sumifs, FUNCTION_NAMES_MATH.SUMIFS],
    [Sumproduct, FUNCTION_NAMES_MATH.SUMPRODUCT],
    [Tan, FUNCTION_NAMES_MATH.TAN],
    [Tanh, FUNCTION_NAMES_MATH.TANH],
];
