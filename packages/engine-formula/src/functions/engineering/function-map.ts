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

import { Besseli } from './besseli';
import { Besselj } from './besselj';
import { Besselk } from './besselk';
import { Bessely } from './bessely';
import { Bin2dec } from './bin2dec';
import { Bin2hex } from './bin2hex';
import { Bin2oct } from './bin2oct';
import { Bitand } from './bitand';
import { Bitlshift } from './bitlshift';
import { Bitor } from './bitor';
import { Bitrshift } from './bitrshift';
import { Bitxor } from './bitxor';
import { Complex } from './complex';
import { Convert } from './convert';
import { Dec2bin } from './dec2bin';
import { Dec2hex } from './dec2hex';
import { Dec2oct } from './dec2oct';
import { Delta } from './delta';
import { Erf } from './erf';
import { ErfPrecise } from './erf-precise';
import { Erfc } from './erfc';
import { ErfcPrecise } from './erfc-precise';
import { FUNCTION_NAMES_ENGINEERING } from './function-names';
import { Gestep } from './gestep';
import { Hex2bin } from './hex2bin';
import { Hex2dec } from './hex2dec';
import { Hex2oct } from './hex2oct';
import { Imabs } from './imabs';
import { Imaginary } from './imaginary';
import { Imargument } from './imargument';
import { Imconjugate } from './imconjugate';
import { Imcos } from './imcos';
import { Imcosh } from './imcosh';
import { Imcot } from './imcot';
import { Imcoth } from './imcoth';
import { Imcsc } from './imcsc';
import { Imcsch } from './imcsch';
import { Imdiv } from './imdiv';
import { Imexp } from './imexp';
import { Imln } from './imln';
import { Imlog } from './imlog';
import { Imlog2 } from './imlog2';
import { Imlog10 } from './imlog10';
import { Impower } from './impower';
import { Improduct } from './improduct';
import { Imreal } from './imreal';
import { Imsec } from './imsec';
import { Imsech } from './imsech';
import { Imsin } from './imsin';
import { Imsinh } from './imsinh';
import { Imsqrt } from './imsqrt';
import { Imsub } from './imsub';
import { Imsum } from './imsum';
import { Imtan } from './imtan';
import { Imtanh } from './imtanh';
import { Oct2bin } from './oct2bin';
import { Oct2dec } from './oct2dec';
import { Oct2hex } from './oct2hex';

export const functionEngineering = [
    [Besseli, FUNCTION_NAMES_ENGINEERING.BESSELI],
    [Besselj, FUNCTION_NAMES_ENGINEERING.BESSELJ],
    [Besselk, FUNCTION_NAMES_ENGINEERING.BESSELK],
    [Bessely, FUNCTION_NAMES_ENGINEERING.BESSELY],
    [Bin2dec, FUNCTION_NAMES_ENGINEERING.BIN2DEC],
    [Bin2hex, FUNCTION_NAMES_ENGINEERING.BIN2HEX],
    [Bin2oct, FUNCTION_NAMES_ENGINEERING.BIN2OCT],
    [Bitand, FUNCTION_NAMES_ENGINEERING.BITAND],
    [Bitlshift, FUNCTION_NAMES_ENGINEERING.BITLSHIFT],
    [Bitor, FUNCTION_NAMES_ENGINEERING.BITOR],
    [Bitrshift, FUNCTION_NAMES_ENGINEERING.BITRSHIFT],
    [Bitxor, FUNCTION_NAMES_ENGINEERING.BITXOR],
    [Complex, FUNCTION_NAMES_ENGINEERING.COMPLEX],
    [Convert, FUNCTION_NAMES_ENGINEERING.CONVERT],
    [Dec2bin, FUNCTION_NAMES_ENGINEERING.DEC2BIN],
    [Dec2hex, FUNCTION_NAMES_ENGINEERING.DEC2HEX],
    [Dec2oct, FUNCTION_NAMES_ENGINEERING.DEC2OCT],
    [Delta, FUNCTION_NAMES_ENGINEERING.DELTA],
    [Erf, FUNCTION_NAMES_ENGINEERING.ERF],
    [ErfPrecise, FUNCTION_NAMES_ENGINEERING.ERF_PRECISE],
    [Erfc, FUNCTION_NAMES_ENGINEERING.ERFC],
    [ErfcPrecise, FUNCTION_NAMES_ENGINEERING.ERFC_PRECISE],
    [Gestep, FUNCTION_NAMES_ENGINEERING.GESTEP],
    [Hex2bin, FUNCTION_NAMES_ENGINEERING.HEX2BIN],
    [Hex2dec, FUNCTION_NAMES_ENGINEERING.HEX2DEC],
    [Hex2oct, FUNCTION_NAMES_ENGINEERING.HEX2OCT],
    [Imabs, FUNCTION_NAMES_ENGINEERING.IMABS],
    [Imaginary, FUNCTION_NAMES_ENGINEERING.IMAGINARY],
    [Imargument, FUNCTION_NAMES_ENGINEERING.IMARGUMENT],
    [Imconjugate, FUNCTION_NAMES_ENGINEERING.IMCONJUGATE],
    [Imcos, FUNCTION_NAMES_ENGINEERING.IMCOS],
    [Imcosh, FUNCTION_NAMES_ENGINEERING.IMCOSH],
    [Imcot, FUNCTION_NAMES_ENGINEERING.IMCOT],
    [Imcoth, FUNCTION_NAMES_ENGINEERING.IMCOTH],
    [Imcsc, FUNCTION_NAMES_ENGINEERING.IMCSC],
    [Imcsch, FUNCTION_NAMES_ENGINEERING.IMCSCH],
    [Imdiv, FUNCTION_NAMES_ENGINEERING.IMDIV],
    [Imexp, FUNCTION_NAMES_ENGINEERING.IMEXP],
    [Imln, FUNCTION_NAMES_ENGINEERING.IMLN],
    [Imlog, FUNCTION_NAMES_ENGINEERING.IMLOG],
    [Imlog10, FUNCTION_NAMES_ENGINEERING.IMLOG10],
    [Imlog2, FUNCTION_NAMES_ENGINEERING.IMLOG2],
    [Impower, FUNCTION_NAMES_ENGINEERING.IMPOWER],
    [Improduct, FUNCTION_NAMES_ENGINEERING.IMPRODUCT],
    [Imreal, FUNCTION_NAMES_ENGINEERING.IMREAL],
    [Imsec, FUNCTION_NAMES_ENGINEERING.IMSEC],
    [Imsech, FUNCTION_NAMES_ENGINEERING.IMSECH],
    [Imsin, FUNCTION_NAMES_ENGINEERING.IMSIN],
    [Imsinh, FUNCTION_NAMES_ENGINEERING.IMSINH],
    [Imsqrt, FUNCTION_NAMES_ENGINEERING.IMSQRT],
    [Imsub, FUNCTION_NAMES_ENGINEERING.IMSUB],
    [Imsum, FUNCTION_NAMES_ENGINEERING.IMSUM],
    [Imtan, FUNCTION_NAMES_ENGINEERING.IMTAN],
    [Imtanh, FUNCTION_NAMES_ENGINEERING.IMTANH],
    [Oct2bin, FUNCTION_NAMES_ENGINEERING.OCT2BIN],
    [Oct2dec, FUNCTION_NAMES_ENGINEERING.OCT2DEC],
    [Oct2hex, FUNCTION_NAMES_ENGINEERING.OCT2HEX],
];
