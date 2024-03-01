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

import { FUNCTION_NAMES_COMPATIBILITY, FunctionType, type IFunctionInfo } from '@univerjs/engine-formula';

export const FUNCTION_LIST_COMPATIBILITY: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.BETADIST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.BETADIST.description',
        abstract: 'formula.functionList.BETADIST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BETADIST.functionParameter.number1.name',
                detail: 'formula.functionList.BETADIST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BETADIST.functionParameter.number2.name',
                detail: 'formula.functionList.BETADIST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.BETAINV,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.BETAINV.description',
        abstract: 'formula.functionList.BETAINV.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BETAINV.functionParameter.number1.name',
                detail: 'formula.functionList.BETAINV.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BETAINV.functionParameter.number2.name',
                detail: 'formula.functionList.BETAINV.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.BINOMDIST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.BINOMDIST.description',
        abstract: 'formula.functionList.BINOMDIST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BINOMDIST.functionParameter.number1.name',
                detail: 'formula.functionList.BINOMDIST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BINOMDIST.functionParameter.number2.name',
                detail: 'formula.functionList.BINOMDIST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.CHIDIST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.CHIDIST.description',
        abstract: 'formula.functionList.CHIDIST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CHIDIST.functionParameter.number1.name',
                detail: 'formula.functionList.CHIDIST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CHIDIST.functionParameter.number2.name',
                detail: 'formula.functionList.CHIDIST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.CHIINV,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.CHIINV.description',
        abstract: 'formula.functionList.CHIINV.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CHIINV.functionParameter.number1.name',
                detail: 'formula.functionList.CHIINV.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CHIINV.functionParameter.number2.name',
                detail: 'formula.functionList.CHIINV.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.CHITEST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.CHITEST.description',
        abstract: 'formula.functionList.CHITEST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CHITEST.functionParameter.number1.name',
                detail: 'formula.functionList.CHITEST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CHITEST.functionParameter.number2.name',
                detail: 'formula.functionList.CHITEST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.CONFIDENCE,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.CONFIDENCE.description',
        abstract: 'formula.functionList.CONFIDENCE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CONFIDENCE.functionParameter.number1.name',
                detail: 'formula.functionList.CONFIDENCE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CONFIDENCE.functionParameter.number2.name',
                detail: 'formula.functionList.CONFIDENCE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.COVAR,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.COVAR.description',
        abstract: 'formula.functionList.COVAR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.COVAR.functionParameter.number1.name',
                detail: 'formula.functionList.COVAR.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.COVAR.functionParameter.number2.name',
                detail: 'formula.functionList.COVAR.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.CRITBINOM,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.CRITBINOM.description',
        abstract: 'formula.functionList.CRITBINOM.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CRITBINOM.functionParameter.number1.name',
                detail: 'formula.functionList.CRITBINOM.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CRITBINOM.functionParameter.number2.name',
                detail: 'formula.functionList.CRITBINOM.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.EXPONDIST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.EXPONDIST.description',
        abstract: 'formula.functionList.EXPONDIST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.EXPONDIST.functionParameter.number1.name',
                detail: 'formula.functionList.EXPONDIST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.EXPONDIST.functionParameter.number2.name',
                detail: 'formula.functionList.EXPONDIST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.FDIST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.FDIST.description',
        abstract: 'formula.functionList.FDIST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.FDIST.functionParameter.number1.name',
                detail: 'formula.functionList.FDIST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.FDIST.functionParameter.number2.name',
                detail: 'formula.functionList.FDIST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.FINV,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.FINV.description',
        abstract: 'formula.functionList.FINV.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.FINV.functionParameter.number1.name',
                detail: 'formula.functionList.FINV.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.FINV.functionParameter.number2.name',
                detail: 'formula.functionList.FINV.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.FTEST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.FTEST.description',
        abstract: 'formula.functionList.FTEST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.FTEST.functionParameter.number1.name',
                detail: 'formula.functionList.FTEST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.FTEST.functionParameter.number2.name',
                detail: 'formula.functionList.FTEST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.GAMMADIST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.GAMMADIST.description',
        abstract: 'formula.functionList.GAMMADIST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.GAMMADIST.functionParameter.number1.name',
                detail: 'formula.functionList.GAMMADIST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.GAMMADIST.functionParameter.number2.name',
                detail: 'formula.functionList.GAMMADIST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.GAMMAINV,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.GAMMAINV.description',
        abstract: 'formula.functionList.GAMMAINV.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.GAMMAINV.functionParameter.number1.name',
                detail: 'formula.functionList.GAMMAINV.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.GAMMAINV.functionParameter.number2.name',
                detail: 'formula.functionList.GAMMAINV.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.HYPGEOMDIST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.HYPGEOMDIST.description',
        abstract: 'formula.functionList.HYPGEOMDIST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.HYPGEOMDIST.functionParameter.number1.name',
                detail: 'formula.functionList.HYPGEOMDIST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.HYPGEOMDIST.functionParameter.number2.name',
                detail: 'formula.functionList.HYPGEOMDIST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.LOGINV,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.LOGINV.description',
        abstract: 'formula.functionList.LOGINV.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.LOGINV.functionParameter.number1.name',
                detail: 'formula.functionList.LOGINV.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.LOGINV.functionParameter.number2.name',
                detail: 'formula.functionList.LOGINV.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.LOGNORMDIST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.LOGNORMDIST.description',
        abstract: 'formula.functionList.LOGNORMDIST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.LOGNORMDIST.functionParameter.number1.name',
                detail: 'formula.functionList.LOGNORMDIST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.LOGNORMDIST.functionParameter.number2.name',
                detail: 'formula.functionList.LOGNORMDIST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.MODE,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.MODE.description',
        abstract: 'formula.functionList.MODE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.MODE.functionParameter.number1.name',
                detail: 'formula.functionList.MODE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MODE.functionParameter.number2.name',
                detail: 'formula.functionList.MODE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.NEGBINOMDIST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.NEGBINOMDIST.description',
        abstract: 'formula.functionList.NEGBINOMDIST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.NEGBINOMDIST.functionParameter.number1.name',
                detail: 'formula.functionList.NEGBINOMDIST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.NEGBINOMDIST.functionParameter.number2.name',
                detail: 'formula.functionList.NEGBINOMDIST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.NORMDIST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.NORMDIST.description',
        abstract: 'formula.functionList.NORMDIST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.NORMDIST.functionParameter.number1.name',
                detail: 'formula.functionList.NORMDIST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.NORMDIST.functionParameter.number2.name',
                detail: 'formula.functionList.NORMDIST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.NORMINV,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.NORMINV.description',
        abstract: 'formula.functionList.NORMINV.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.NORMINV.functionParameter.number1.name',
                detail: 'formula.functionList.NORMINV.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.NORMINV.functionParameter.number2.name',
                detail: 'formula.functionList.NORMINV.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.NORMSDIST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.NORMSDIST.description',
        abstract: 'formula.functionList.NORMSDIST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.NORMSDIST.functionParameter.number1.name',
                detail: 'formula.functionList.NORMSDIST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.NORMSDIST.functionParameter.number2.name',
                detail: 'formula.functionList.NORMSDIST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.NORMSINV,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.NORMSINV.description',
        abstract: 'formula.functionList.NORMSINV.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.NORMSINV.functionParameter.number1.name',
                detail: 'formula.functionList.NORMSINV.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.NORMSINV.functionParameter.number2.name',
                detail: 'formula.functionList.NORMSINV.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.PERCENTILE,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.PERCENTILE.description',
        abstract: 'formula.functionList.PERCENTILE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.PERCENTILE.functionParameter.number1.name',
                detail: 'formula.functionList.PERCENTILE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.PERCENTILE.functionParameter.number2.name',
                detail: 'formula.functionList.PERCENTILE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.PERCENTRANK,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.PERCENTRANK.description',
        abstract: 'formula.functionList.PERCENTRANK.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.PERCENTRANK.functionParameter.number1.name',
                detail: 'formula.functionList.PERCENTRANK.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.PERCENTRANK.functionParameter.number2.name',
                detail: 'formula.functionList.PERCENTRANK.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.POISSON,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.POISSON.description',
        abstract: 'formula.functionList.POISSON.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.POISSON.functionParameter.number1.name',
                detail: 'formula.functionList.POISSON.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.POISSON.functionParameter.number2.name',
                detail: 'formula.functionList.POISSON.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.QUARTILE,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.QUARTILE.description',
        abstract: 'formula.functionList.QUARTILE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.QUARTILE.functionParameter.number1.name',
                detail: 'formula.functionList.QUARTILE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.QUARTILE.functionParameter.number2.name',
                detail: 'formula.functionList.QUARTILE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.RANK,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.RANK.description',
        abstract: 'formula.functionList.RANK.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.RANK.functionParameter.number1.name',
                detail: 'formula.functionList.RANK.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.RANK.functionParameter.number2.name',
                detail: 'formula.functionList.RANK.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.STDEV,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.STDEV.description',
        abstract: 'formula.functionList.STDEV.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.STDEV.functionParameter.number1.name',
                detail: 'formula.functionList.STDEV.functionParameter.number1.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.STDEV.functionParameter.number2.name',
                detail: 'formula.functionList.STDEV.functionParameter.number2.detail',
                example: '2',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.STDEVP,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.STDEVP.description',
        abstract: 'formula.functionList.STDEVP.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.STDEVP.functionParameter.number1.name',
                detail: 'formula.functionList.STDEVP.functionParameter.number1.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.STDEVP.functionParameter.number2.name',
                detail: 'formula.functionList.STDEVP.functionParameter.number2.detail',
                example: '2',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.TDIST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.TDIST.description',
        abstract: 'formula.functionList.TDIST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TDIST.functionParameter.number1.name',
                detail: 'formula.functionList.TDIST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TDIST.functionParameter.number2.name',
                detail: 'formula.functionList.TDIST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.TINV,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.TINV.description',
        abstract: 'formula.functionList.TINV.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TINV.functionParameter.number1.name',
                detail: 'formula.functionList.TINV.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TINV.functionParameter.number2.name',
                detail: 'formula.functionList.TINV.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.TTEST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.TTEST.description',
        abstract: 'formula.functionList.TTEST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TTEST.functionParameter.number1.name',
                detail: 'formula.functionList.TTEST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TTEST.functionParameter.number2.name',
                detail: 'formula.functionList.TTEST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.VAR,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.VAR.description',
        abstract: 'formula.functionList.VAR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.VAR.functionParameter.number1.name',
                detail: 'formula.functionList.VAR.functionParameter.number1.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.VAR.functionParameter.number2.name',
                detail: 'formula.functionList.VAR.functionParameter.number2.detail',
                example: '2',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.VARP,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.VARP.description',
        abstract: 'formula.functionList.VARP.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.VARP.functionParameter.number1.name',
                detail: 'formula.functionList.VARP.functionParameter.number1.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.VARP.functionParameter.number2.name',
                detail: 'formula.functionList.VARP.functionParameter.number2.detail',
                example: '2',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.WEIBULL,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.WEIBULL.description',
        abstract: 'formula.functionList.WEIBULL.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.WEIBULL.functionParameter.number1.name',
                detail: 'formula.functionList.WEIBULL.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.WEIBULL.functionParameter.number2.name',
                detail: 'formula.functionList.WEIBULL.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_COMPATIBILITY.ZTEST,
        functionType: FunctionType.Compatibility,
        description: 'formula.functionList.ZTEST.description',
        abstract: 'formula.functionList.ZTEST.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ZTEST.functionParameter.number1.name',
                detail: 'formula.functionList.ZTEST.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ZTEST.functionParameter.number2.name',
                detail: 'formula.functionList.ZTEST.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
