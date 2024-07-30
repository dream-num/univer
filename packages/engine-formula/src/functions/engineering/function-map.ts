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

import { FUNCTION_NAMES_ENGINEERING } from './function-names';
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
import { Dec2bin } from './dec2bin';
import { Dec2hex } from './dec2hex';
import { Dec2oct } from './dec2oct';
import { Hex2bin } from './hex2bin';
import { Hex2dec } from './hex2dec';
import { Hex2oct } from './hex2oct';
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
    [Dec2bin, FUNCTION_NAMES_ENGINEERING.DEC2BIN],
    [Dec2hex, FUNCTION_NAMES_ENGINEERING.DEC2HEX],
    [Dec2oct, FUNCTION_NAMES_ENGINEERING.DEC2OCT],
    [Hex2bin, FUNCTION_NAMES_ENGINEERING.HEX2BIN],
    [Hex2dec, FUNCTION_NAMES_ENGINEERING.HEX2DEC],
    [Hex2oct, FUNCTION_NAMES_ENGINEERING.HEX2OCT],
    [Oct2bin, FUNCTION_NAMES_ENGINEERING.OCT2BIN],
    [Oct2dec, FUNCTION_NAMES_ENGINEERING.OCT2DEC],
    [Oct2hex, FUNCTION_NAMES_ENGINEERING.OCT2HEX],
];
