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

import { BetaInv } from '../statistical/beta-inv';
import { BinomDist } from '../statistical/binom-dist';
import { BinomInv } from '../statistical/binom-inv';
import { ChisqDistRt } from '../statistical/chisq-dist-rt';
import { ChisqInvRt } from '../statistical/chisq-inv-rt';
import { ChisqTest } from '../statistical/chisq-test';
import { ConfidenceNorm } from '../statistical/confidence-norm';
import { CovarianceP } from '../statistical/covariance-p';
import { ExponDist } from '../statistical/expon-dist';
import { FDistRt } from '../statistical/f-dist-rt';
import { FInvRt } from '../statistical/f-inv-rt';
import { FTest } from '../statistical/f-test';
import { NormDist } from '../statistical/norm-dist';
import { NormInv } from '../statistical/norm-inv';
import { NormSInv } from '../statistical/norm-s-inv';
import { StdevP } from '../statistical/stdev-p';
import { StdevS } from '../statistical/stdev-s';
import { VarP } from '../statistical/var-p';
import { VarS } from '../statistical/var-s';
import { Betadist } from './betadist';
import { FUNCTION_NAMES_COMPATIBILITY } from './function-names';
import { Normsdist } from './normsdist';
import { Rank } from './rank';

export const functionCompatibility = [
    [Betadist, FUNCTION_NAMES_COMPATIBILITY.BETADIST],
    [BetaInv, FUNCTION_NAMES_COMPATIBILITY.BETAINV],
    [BinomDist, FUNCTION_NAMES_COMPATIBILITY.BINOMDIST],
    [ChisqDistRt, FUNCTION_NAMES_COMPATIBILITY.CHIDIST],
    [ChisqInvRt, FUNCTION_NAMES_COMPATIBILITY.CHIINV],
    [ChisqTest, FUNCTION_NAMES_COMPATIBILITY.CHITEST],
    [ConfidenceNorm, FUNCTION_NAMES_COMPATIBILITY.CONFIDENCE],
    [CovarianceP, FUNCTION_NAMES_COMPATIBILITY.COVAR],
    [BinomInv, FUNCTION_NAMES_COMPATIBILITY.CRITBINOM],
    [ExponDist, FUNCTION_NAMES_COMPATIBILITY.EXPONDIST],
    [FDistRt, FUNCTION_NAMES_COMPATIBILITY.FDIST],
    [FInvRt, FUNCTION_NAMES_COMPATIBILITY.FINV],
    [FTest, FUNCTION_NAMES_COMPATIBILITY.FTEST],
    [NormDist, FUNCTION_NAMES_COMPATIBILITY.NORMDIST],
    [NormInv, FUNCTION_NAMES_COMPATIBILITY.NORMINV],
    [Normsdist, FUNCTION_NAMES_COMPATIBILITY.NORMSDIST],
    [NormSInv, FUNCTION_NAMES_COMPATIBILITY.NORMSINV],
    [Rank, FUNCTION_NAMES_COMPATIBILITY.RANK],
    [StdevS, FUNCTION_NAMES_COMPATIBILITY.STDEV],
    [StdevP, FUNCTION_NAMES_COMPATIBILITY.STDEVP],
    [VarS, FUNCTION_NAMES_COMPATIBILITY.VAR],
    [VarP, FUNCTION_NAMES_COMPATIBILITY.VARP],
];
