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

import type { IFunctionInfo } from '../../../basics/function';
import { FunctionType } from '../../../basics/function';
import { FUNCTION_NAMES_ENGINEERING } from '../../../functions/engineering/function-names';

export const FUNCTION_LIST_ENGINEERING: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BESSELI,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.BESSELI.description',
        abstract: 'engine-formula.functionList.BESSELI.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.BESSELI.functionParameter.x.name',
                detail: 'engine-formula.functionList.BESSELI.functionParameter.x.detail',
                example: '1.5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.BESSELI.functionParameter.n.name',
                detail: 'engine-formula.functionList.BESSELI.functionParameter.n.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BESSELJ,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.BESSELJ.description',
        abstract: 'engine-formula.functionList.BESSELJ.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.BESSELJ.functionParameter.x.name',
                detail: 'engine-formula.functionList.BESSELJ.functionParameter.x.detail',
                example: '1.5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.BESSELJ.functionParameter.n.name',
                detail: 'engine-formula.functionList.BESSELJ.functionParameter.n.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BESSELK,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.BESSELK.description',
        abstract: 'engine-formula.functionList.BESSELK.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.BESSELK.functionParameter.x.name',
                detail: 'engine-formula.functionList.BESSELK.functionParameter.x.detail',
                example: '1.5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.BESSELK.functionParameter.n.name',
                detail: 'engine-formula.functionList.BESSELK.functionParameter.n.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BESSELY,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.BESSELY.description',
        abstract: 'engine-formula.functionList.BESSELY.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.BESSELY.functionParameter.x.name',
                detail: 'engine-formula.functionList.BESSELY.functionParameter.x.detail',
                example: '1.5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.BESSELY.functionParameter.n.name',
                detail: 'engine-formula.functionList.BESSELY.functionParameter.n.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BIN2DEC,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.BIN2DEC.description',
        abstract: 'engine-formula.functionList.BIN2DEC.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.BIN2DEC.functionParameter.number.name',
                detail: 'engine-formula.functionList.BIN2DEC.functionParameter.number.detail',
                example: '1100100',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BIN2HEX,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.BIN2HEX.description',
        abstract: 'engine-formula.functionList.BIN2HEX.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.BIN2HEX.functionParameter.number.name',
                detail: 'engine-formula.functionList.BIN2HEX.functionParameter.number.detail',
                example: '11111011',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.BIN2HEX.functionParameter.places.name',
                detail: 'engine-formula.functionList.BIN2HEX.functionParameter.places.detail',
                example: '4',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BIN2OCT,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.BIN2OCT.description',
        abstract: 'engine-formula.functionList.BIN2OCT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.BIN2OCT.functionParameter.number.name',
                detail: 'engine-formula.functionList.BIN2OCT.functionParameter.number.detail',
                example: '1001',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.BIN2OCT.functionParameter.places.name',
                detail: 'engine-formula.functionList.BIN2OCT.functionParameter.places.detail',
                example: '3',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BITAND,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.BITAND.description',
        abstract: 'engine-formula.functionList.BITAND.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.BITAND.functionParameter.number1.name',
                detail: 'engine-formula.functionList.BITAND.functionParameter.number1.detail',
                example: '13',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.BITAND.functionParameter.number2.name',
                detail: 'engine-formula.functionList.BITAND.functionParameter.number2.detail',
                example: '25',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BITLSHIFT,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.BITLSHIFT.description',
        abstract: 'engine-formula.functionList.BITLSHIFT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.BITLSHIFT.functionParameter.number.name',
                detail: 'engine-formula.functionList.BITLSHIFT.functionParameter.number.detail',
                example: '4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.BITLSHIFT.functionParameter.shiftAmount.name',
                detail: 'engine-formula.functionList.BITLSHIFT.functionParameter.shiftAmount.detail',
                example: '2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BITOR,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.BITOR.description',
        abstract: 'engine-formula.functionList.BITOR.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.BITOR.functionParameter.number1.name',
                detail: 'engine-formula.functionList.BITOR.functionParameter.number1.detail',
                example: '23',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.BITOR.functionParameter.number2.name',
                detail: 'engine-formula.functionList.BITOR.functionParameter.number2.detail',
                example: '10',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BITRSHIFT,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.BITRSHIFT.description',
        abstract: 'engine-formula.functionList.BITRSHIFT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.BITRSHIFT.functionParameter.number.name',
                detail: 'engine-formula.functionList.BITRSHIFT.functionParameter.number.detail',
                example: '13',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.BITRSHIFT.functionParameter.shiftAmount.name',
                detail: 'engine-formula.functionList.BITRSHIFT.functionParameter.shiftAmount.detail',
                example: '2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BITXOR,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.BITXOR.description',
        abstract: 'engine-formula.functionList.BITXOR.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.BITXOR.functionParameter.number1.name',
                detail: 'engine-formula.functionList.BITXOR.functionParameter.number1.detail',
                example: '5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.BITXOR.functionParameter.number2.name',
                detail: 'engine-formula.functionList.BITXOR.functionParameter.number2.detail',
                example: '3',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.COMPLEX,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.COMPLEX.description',
        abstract: 'engine-formula.functionList.COMPLEX.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.COMPLEX.functionParameter.realNum.name',
                detail: 'engine-formula.functionList.COMPLEX.functionParameter.realNum.detail',
                example: '3',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.COMPLEX.functionParameter.iNum.name',
                detail: 'engine-formula.functionList.COMPLEX.functionParameter.iNum.detail',
                example: '4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.COMPLEX.functionParameter.suffix.name',
                detail: 'engine-formula.functionList.COMPLEX.functionParameter.suffix.detail',
                example: '"i"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.CONVERT,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.CONVERT.description',
        abstract: 'engine-formula.functionList.CONVERT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.CONVERT.functionParameter.number.name',
                detail: 'engine-formula.functionList.CONVERT.functionParameter.number.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CONVERT.functionParameter.fromUnit.name',
                detail: 'engine-formula.functionList.CONVERT.functionParameter.fromUnit.detail',
                example: '"lbm"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.CONVERT.functionParameter.toUnit.name',
                detail: 'engine-formula.functionList.CONVERT.functionParameter.toUnit.detail',
                example: '"kg"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.DEC2BIN,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.DEC2BIN.description',
        abstract: 'engine-formula.functionList.DEC2BIN.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DEC2BIN.functionParameter.number.name',
                detail: 'engine-formula.functionList.DEC2BIN.functionParameter.number.detail',
                example: '9',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DEC2BIN.functionParameter.places.name',
                detail: 'engine-formula.functionList.DEC2BIN.functionParameter.places.detail',
                example: '4',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.DEC2HEX,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.DEC2HEX.description',
        abstract: 'engine-formula.functionList.DEC2HEX.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DEC2HEX.functionParameter.number.name',
                detail: 'engine-formula.functionList.DEC2HEX.functionParameter.number.detail',
                example: '100',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DEC2HEX.functionParameter.places.name',
                detail: 'engine-formula.functionList.DEC2HEX.functionParameter.places.detail',
                example: '4',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.DEC2OCT,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.DEC2OCT.description',
        abstract: 'engine-formula.functionList.DEC2OCT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DEC2OCT.functionParameter.number.name',
                detail: 'engine-formula.functionList.DEC2OCT.functionParameter.number.detail',
                example: '58',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DEC2OCT.functionParameter.places.name',
                detail: 'engine-formula.functionList.DEC2OCT.functionParameter.places.detail',
                example: '3',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.DELTA,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.DELTA.description',
        abstract: 'engine-formula.functionList.DELTA.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.DELTA.functionParameter.number1.name',
                detail: 'engine-formula.functionList.DELTA.functionParameter.number1.detail',
                example: '5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.DELTA.functionParameter.number2.name',
                detail: 'engine-formula.functionList.DELTA.functionParameter.number2.detail',
                example: '4',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.ERF,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.ERF.description',
        abstract: 'engine-formula.functionList.ERF.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ERF.functionParameter.lowerLimit.name',
                detail: 'engine-formula.functionList.ERF.functionParameter.lowerLimit.detail',
                example: '0.745',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.ERF.functionParameter.upperLimit.name',
                detail: 'engine-formula.functionList.ERF.functionParameter.upperLimit.detail',
                example: '2',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.ERF_PRECISE,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.ERF_PRECISE.description',
        abstract: 'engine-formula.functionList.ERF_PRECISE.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ERF_PRECISE.functionParameter.x.name',
                detail: 'engine-formula.functionList.ERF_PRECISE.functionParameter.x.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.ERFC,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.ERFC.description',
        abstract: 'engine-formula.functionList.ERFC.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ERFC.functionParameter.x.name',
                detail: 'engine-formula.functionList.ERFC.functionParameter.x.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.ERFC_PRECISE,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.ERFC_PRECISE.description',
        abstract: 'engine-formula.functionList.ERFC_PRECISE.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.ERFC_PRECISE.functionParameter.x.name',
                detail: 'engine-formula.functionList.ERFC_PRECISE.functionParameter.x.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.GESTEP,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.GESTEP.description',
        abstract: 'engine-formula.functionList.GESTEP.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.GESTEP.functionParameter.number.name',
                detail: 'engine-formula.functionList.GESTEP.functionParameter.number.detail',
                example: '5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.GESTEP.functionParameter.step.name',
                detail: 'engine-formula.functionList.GESTEP.functionParameter.step.detail',
                example: '4',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.HEX2BIN,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.HEX2BIN.description',
        abstract: 'engine-formula.functionList.HEX2BIN.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.HEX2BIN.functionParameter.number.name',
                detail: 'engine-formula.functionList.HEX2BIN.functionParameter.number.detail',
                example: '"F"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.HEX2BIN.functionParameter.places.name',
                detail: 'engine-formula.functionList.HEX2BIN.functionParameter.places.detail',
                example: '8',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.HEX2DEC,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.HEX2DEC.description',
        abstract: 'engine-formula.functionList.HEX2DEC.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.HEX2DEC.functionParameter.number.name',
                detail: 'engine-formula.functionList.HEX2DEC.functionParameter.number.detail',
                example: '"A5"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.HEX2OCT,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.HEX2OCT.description',
        abstract: 'engine-formula.functionList.HEX2OCT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.HEX2OCT.functionParameter.number.name',
                detail: 'engine-formula.functionList.HEX2OCT.functionParameter.number.detail',
                example: '"F"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.HEX2OCT.functionParameter.places.name',
                detail: 'engine-formula.functionList.HEX2OCT.functionParameter.places.detail',
                example: '3',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMABS,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMABS.description',
        abstract: 'engine-formula.functionList.IMABS.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMABS.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMABS.functionParameter.inumber.detail',
                example: '"5+12i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMAGINARY,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMAGINARY.description',
        abstract: 'engine-formula.functionList.IMAGINARY.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMAGINARY.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMAGINARY.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMARGUMENT,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMARGUMENT.description',
        abstract: 'engine-formula.functionList.IMARGUMENT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMARGUMENT.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMARGUMENT.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCONJUGATE,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMCONJUGATE.description',
        abstract: 'engine-formula.functionList.IMCONJUGATE.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMCONJUGATE.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMCONJUGATE.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCOS,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMCOS.description',
        abstract: 'engine-formula.functionList.IMCOS.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMCOS.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMCOS.functionParameter.inumber.detail',
                example: '"1+i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCOSH,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMCOSH.description',
        abstract: 'engine-formula.functionList.IMCOSH.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMCOSH.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMCOSH.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCOT,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMCOT.description',
        abstract: 'engine-formula.functionList.IMCOT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMCOT.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMCOT.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCOTH,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMCOTH.description',
        abstract: 'engine-formula.functionList.IMCOTH.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMCOTH.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMCOTH.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCSC,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMCSC.description',
        abstract: 'engine-formula.functionList.IMCSC.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMCSC.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMCSC.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCSCH,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMCSCH.description',
        abstract: 'engine-formula.functionList.IMCSCH.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMCSCH.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMCSCH.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMDIV,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMDIV.description',
        abstract: 'engine-formula.functionList.IMDIV.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMDIV.functionParameter.inumber1.name',
                detail: 'engine-formula.functionList.IMDIV.functionParameter.inumber1.detail',
                example: '"-238+240i"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.IMDIV.functionParameter.inumber2.name',
                detail: 'engine-formula.functionList.IMDIV.functionParameter.inumber2.detail',
                example: '"10+24i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMEXP,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMEXP.description',
        abstract: 'engine-formula.functionList.IMEXP.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMEXP.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMEXP.functionParameter.inumber.detail',
                example: '"1+i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMLN,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMLN.description',
        abstract: 'engine-formula.functionList.IMLN.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMLN.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMLN.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMLOG,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMLOG.description',
        abstract: 'engine-formula.functionList.IMLOG.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMLOG.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMLOG.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.IMLOG.functionParameter.base.name',
                detail: 'engine-formula.functionList.IMLOG.functionParameter.base.detail',
                example: '10',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMLOG10,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMLOG10.description',
        abstract: 'engine-formula.functionList.IMLOG10.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMLOG10.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMLOG10.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMLOG2,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMLOG2.description',
        abstract: 'engine-formula.functionList.IMLOG2.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMLOG2.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMLOG2.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMPOWER,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMPOWER.description',
        abstract: 'engine-formula.functionList.IMPOWER.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMPOWER.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMPOWER.functionParameter.inumber.detail',
                example: '"2+3i"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.IMPOWER.functionParameter.number.name',
                detail: 'engine-formula.functionList.IMPOWER.functionParameter.number.detail',
                example: '3',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMPRODUCT,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMPRODUCT.description',
        abstract: 'engine-formula.functionList.IMPRODUCT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMPRODUCT.functionParameter.inumber1.name',
                detail: 'engine-formula.functionList.IMPRODUCT.functionParameter.inumber1.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.IMPRODUCT.functionParameter.inumber2.name',
                detail: 'engine-formula.functionList.IMPRODUCT.functionParameter.inumber2.detail',
                example: '"5-3i"',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMREAL,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMREAL.description',
        abstract: 'engine-formula.functionList.IMREAL.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMREAL.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMREAL.functionParameter.inumber.detail',
                example: '"6-9i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSEC,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMSEC.description',
        abstract: 'engine-formula.functionList.IMSEC.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMSEC.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMSEC.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSECH,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMSECH.description',
        abstract: 'engine-formula.functionList.IMSECH.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMSECH.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMSECH.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSIN,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMSIN.description',
        abstract: 'engine-formula.functionList.IMSIN.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMSIN.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMSIN.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSINH,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMSINH.description',
        abstract: 'engine-formula.functionList.IMSINH.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMSINH.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMSINH.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSQRT,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMSQRT.description',
        abstract: 'engine-formula.functionList.IMSQRT.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMSQRT.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMSQRT.functionParameter.inumber.detail',
                example: '"1+i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSUB,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMSUB.description',
        abstract: 'engine-formula.functionList.IMSUB.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMSUB.functionParameter.inumber1.name',
                detail: 'engine-formula.functionList.IMSUB.functionParameter.inumber1.detail',
                example: '"13+4i"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.IMSUB.functionParameter.inumber2.name',
                detail: 'engine-formula.functionList.IMSUB.functionParameter.inumber2.detail',
                example: '"5+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSUM,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMSUM.description',
        abstract: 'engine-formula.functionList.IMSUM.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMSUM.functionParameter.inumber1.name',
                detail: 'engine-formula.functionList.IMSUM.functionParameter.inumber1.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.IMSUM.functionParameter.inumber2.name',
                detail: 'engine-formula.functionList.IMSUM.functionParameter.inumber2.detail',
                example: '"5-3i"',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMTAN,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMTAN.description',
        abstract: 'engine-formula.functionList.IMTAN.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMTAN.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMTAN.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMTANH,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.IMTANH.description',
        abstract: 'engine-formula.functionList.IMTANH.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.IMTANH.functionParameter.inumber.name',
                detail: 'engine-formula.functionList.IMTANH.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.OCT2BIN,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.OCT2BIN.description',
        abstract: 'engine-formula.functionList.OCT2BIN.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.OCT2BIN.functionParameter.number.name',
                detail: 'engine-formula.functionList.OCT2BIN.functionParameter.number.detail',
                example: '3',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.OCT2BIN.functionParameter.places.name',
                detail: 'engine-formula.functionList.OCT2BIN.functionParameter.places.detail',
                example: '3',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.OCT2DEC,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.OCT2DEC.description',
        abstract: 'engine-formula.functionList.OCT2DEC.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.OCT2DEC.functionParameter.number.name',
                detail: 'engine-formula.functionList.OCT2DEC.functionParameter.number.detail',
                example: '54',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.OCT2HEX,
        functionType: FunctionType.Engineering,
        description: 'engine-formula.functionList.OCT2HEX.description',
        abstract: 'engine-formula.functionList.OCT2HEX.abstract',
        functionParameter: [
            {
                name: 'engine-formula.functionList.OCT2HEX.functionParameter.number.name',
                detail: 'engine-formula.functionList.OCT2HEX.functionParameter.number.detail',
                example: '100',
                require: 1,
                repeat: 0,
            },
            {
                name: 'engine-formula.functionList.OCT2HEX.functionParameter.places.name',
                detail: 'engine-formula.functionList.OCT2HEX.functionParameter.places.detail',
                example: '4',
                require: 0,
                repeat: 0,
            },
        ],
    },
];
