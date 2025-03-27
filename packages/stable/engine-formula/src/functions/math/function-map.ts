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

import { Abs } from './abs';
import { Acos } from './acos';
import { Acosh } from './acosh';
import { Acot } from './acot';
import { Acoth } from './acoth';
import { Arabic } from './arabic';
import { Asin } from './asin';
import { Asinh } from './asinh';
import { Atan } from './atan';
import { Atan2 } from './atan2';
import { Atanh } from './atanh';
import { Base } from './base';
import { Ceiling } from './ceiling';
import { CeilingMath } from './ceiling-math';
import { CeilingPrecise } from './ceiling-precise';
import { Combin } from './combin';
import { Combina } from './combina';
import { Cos } from './cos';
import { Cosh } from './cosh';
import { Cot } from './cot';
import { Coth } from './coth';
import { Csc } from './csc';
import { Csch } from './csch';
import { Decimal } from './decimal';
import { Degrees } from './degrees';
import { Even } from './even';
import { Exp } from './exp';
import { Fact } from './fact';
import { Factdouble } from './factdouble';
import { Floor } from './floor';
import { FloorMath } from './floor-math';
import { FloorPrecise } from './floor-precise';
import { FUNCTION_NAMES_MATH } from './function-names';
import { Gcd } from './gcd';
import { Int } from './int';
import { Lcm } from './lcm';
import { Ln } from './ln';
import { Log } from './log';
import { Log10 } from './log10';
import { Mdeterm } from './mdeterm';
import { Minverse } from './minverse';
import { Mmult } from './mmult';
import { Mod } from './mod';
import { Mround } from './mround';
import { Multinomial } from './multinomial';
import { Munit } from './munit';
import { Odd } from './odd';
import { Pi } from './pi';
import { Power } from './power';
import { Product } from './product';
import { Quotient } from './quotient';
import { Radians } from './radians';
import { Rand } from './rand';
import { Randarray } from './randarray';
import { Randbetween } from './randbetween';
import { Roman } from './roman';
import { Round } from './round';
import { Roundbank } from './roundbank';
import { Rounddown } from './rounddown';
import { Roundup } from './roundup';
import { Sec } from './sec';
import { Sech } from './sech';
import { Sequence } from './sequence';
import { Seriessum } from './seriessum';
import { Sign } from './sign';
import { Sin } from './sin';
import { Sinh } from './sinh';
import { Sqrt } from './sqrt';
import { Sqrtpi } from './sqrtpi';
import { Subtotal } from './subtotal';
import { Sum } from './sum';
import { Sumif } from './sumif';
import { Sumifs } from './sumifs';
import { Sumproduct } from './sumproduct';
import { Sumsq } from './sumsq';
import { Sumx2my2 } from './sumx2my2';
import { Sumx2py2 } from './sumx2py2';
import { Sumxmy2 } from './sumxmy2';
import { Tan } from './tan';
import { Tanh } from './tanh';
import { Trunc } from './trunc';

export const functionMath = [
    [Abs, FUNCTION_NAMES_MATH.ABS],
    [Acos, FUNCTION_NAMES_MATH.ACOS],
    [Acosh, FUNCTION_NAMES_MATH.ACOSH],
    [Acot, FUNCTION_NAMES_MATH.ACOT],
    [Acoth, FUNCTION_NAMES_MATH.ACOTH],
    [Arabic, FUNCTION_NAMES_MATH.ARABIC],
    [Asin, FUNCTION_NAMES_MATH.ASIN],
    [Asinh, FUNCTION_NAMES_MATH.ASINH],
    [Atan, FUNCTION_NAMES_MATH.ATAN],
    [Atan2, FUNCTION_NAMES_MATH.ATAN2],
    [Atanh, FUNCTION_NAMES_MATH.ATANH],
    [Base, FUNCTION_NAMES_MATH.BASE],
    [Ceiling, FUNCTION_NAMES_MATH.CEILING],
    [CeilingMath, FUNCTION_NAMES_MATH.CEILING_MATH],
    [CeilingPrecise, FUNCTION_NAMES_MATH.CEILING_PRECISE],
    [Combin, FUNCTION_NAMES_MATH.COMBIN],
    [Combina, FUNCTION_NAMES_MATH.COMBINA],
    [Cos, FUNCTION_NAMES_MATH.COS],
    [Cosh, FUNCTION_NAMES_MATH.COSH],
    [Cot, FUNCTION_NAMES_MATH.COT],
    [Coth, FUNCTION_NAMES_MATH.COTH],
    [Csc, FUNCTION_NAMES_MATH.CSC],
    [Csch, FUNCTION_NAMES_MATH.CSCH],
    [Decimal, FUNCTION_NAMES_MATH.DECIMAL],
    [Degrees, FUNCTION_NAMES_MATH.DEGREES],
    [Even, FUNCTION_NAMES_MATH.EVEN],
    [Exp, FUNCTION_NAMES_MATH.EXP],
    [Fact, FUNCTION_NAMES_MATH.FACT],
    [Factdouble, FUNCTION_NAMES_MATH.FACTDOUBLE],
    [Floor, FUNCTION_NAMES_MATH.FLOOR],
    [FloorMath, FUNCTION_NAMES_MATH.FLOOR_MATH],
    [FloorPrecise, FUNCTION_NAMES_MATH.FLOOR_PRECISE],
    [Gcd, FUNCTION_NAMES_MATH.GCD],
    [Int, FUNCTION_NAMES_MATH.INT],
    [Lcm, FUNCTION_NAMES_MATH.LCM],
    [Ln, FUNCTION_NAMES_MATH.LN],
    [Log, FUNCTION_NAMES_MATH.LOG],
    [Log10, FUNCTION_NAMES_MATH.LOG10],
    [Mdeterm, FUNCTION_NAMES_MATH.MDETERM],
    [Minverse, FUNCTION_NAMES_MATH.MINVERSE],
    [Mmult, FUNCTION_NAMES_MATH.MMULT],
    [Mod, FUNCTION_NAMES_MATH.MOD],
    [Mround, FUNCTION_NAMES_MATH.MROUND],
    [Multinomial, FUNCTION_NAMES_MATH.MULTINOMIAL],
    [Munit, FUNCTION_NAMES_MATH.MUNIT],
    [Odd, FUNCTION_NAMES_MATH.ODD],
    [Pi, FUNCTION_NAMES_MATH.PI],
    [Power, FUNCTION_NAMES_MATH.POWER],
    [Product, FUNCTION_NAMES_MATH.PRODUCT],
    [Quotient, FUNCTION_NAMES_MATH.QUOTIENT],
    [Radians, FUNCTION_NAMES_MATH.RADIANS],
    [Rand, FUNCTION_NAMES_MATH.RAND],
    [Randarray, FUNCTION_NAMES_MATH.RANDARRAY],
    [Randbetween, FUNCTION_NAMES_MATH.RANDBETWEEN],
    [Roman, FUNCTION_NAMES_MATH.ROMAN],
    [Round, FUNCTION_NAMES_MATH.ROUND],
    [Roundbank, FUNCTION_NAMES_MATH.ROUNDBANK],
    [Rounddown, FUNCTION_NAMES_MATH.ROUNDDOWN],
    [Roundup, FUNCTION_NAMES_MATH.ROUNDUP],
    [Sec, FUNCTION_NAMES_MATH.SEC],
    [Sech, FUNCTION_NAMES_MATH.SECH],
    [Seriessum, FUNCTION_NAMES_MATH.SERIESSUM],
    [Sequence, FUNCTION_NAMES_MATH.SEQUENCE],
    [Sign, FUNCTION_NAMES_MATH.SIGN],
    [Sin, FUNCTION_NAMES_MATH.SIN],
    [Sinh, FUNCTION_NAMES_MATH.SINH],
    [Sqrt, FUNCTION_NAMES_MATH.SQRT],
    [Sqrtpi, FUNCTION_NAMES_MATH.SQRTPI],
    [Subtotal, FUNCTION_NAMES_MATH.SUBTOTAL],
    [Sum, FUNCTION_NAMES_MATH.SUM],
    [Sumif, FUNCTION_NAMES_MATH.SUMIF],
    [Sumifs, FUNCTION_NAMES_MATH.SUMIFS],
    [Sumproduct, FUNCTION_NAMES_MATH.SUMPRODUCT],
    [Sumsq, FUNCTION_NAMES_MATH.SUMSQ],
    [Sumx2my2, FUNCTION_NAMES_MATH.SUMX2MY2],
    [Sumx2py2, FUNCTION_NAMES_MATH.SUMX2PY2],
    [Sumxmy2, FUNCTION_NAMES_MATH.SUMXMY2],
    [Tan, FUNCTION_NAMES_MATH.TAN],
    [Tanh, FUNCTION_NAMES_MATH.TANH],
    [Trunc, FUNCTION_NAMES_MATH.TRUNC],
];
