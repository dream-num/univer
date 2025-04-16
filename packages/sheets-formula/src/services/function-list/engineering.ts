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

import { FUNCTION_NAMES_ENGINEERING, FunctionType, type IFunctionInfo } from '@univerjs/engine-formula';

export const FUNCTION_LIST_ENGINEERING: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BESSELI,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.BESSELI.description',
        abstract: 'formula.functionList.BESSELI.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BESSELI.functionParameter.x.name',
                detail: 'formula.functionList.BESSELI.functionParameter.x.detail',
                example: '1.5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BESSELI.functionParameter.n.name',
                detail: 'formula.functionList.BESSELI.functionParameter.n.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BESSELJ,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.BESSELJ.description',
        abstract: 'formula.functionList.BESSELJ.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BESSELJ.functionParameter.x.name',
                detail: 'formula.functionList.BESSELJ.functionParameter.x.detail',
                example: '1.5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BESSELJ.functionParameter.n.name',
                detail: 'formula.functionList.BESSELJ.functionParameter.n.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BESSELK,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.BESSELK.description',
        abstract: 'formula.functionList.BESSELK.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BESSELK.functionParameter.x.name',
                detail: 'formula.functionList.BESSELK.functionParameter.x.detail',
                example: '1.5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BESSELK.functionParameter.n.name',
                detail: 'formula.functionList.BESSELK.functionParameter.n.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BESSELY,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.BESSELY.description',
        abstract: 'formula.functionList.BESSELY.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BESSELY.functionParameter.x.name',
                detail: 'formula.functionList.BESSELY.functionParameter.x.detail',
                example: '1.5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BESSELY.functionParameter.n.name',
                detail: 'formula.functionList.BESSELY.functionParameter.n.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BIN2DEC,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.BIN2DEC.description',
        abstract: 'formula.functionList.BIN2DEC.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BIN2DEC.functionParameter.number.name',
                detail: 'formula.functionList.BIN2DEC.functionParameter.number.detail',
                example: '1100100',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BIN2HEX,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.BIN2HEX.description',
        abstract: 'formula.functionList.BIN2HEX.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BIN2HEX.functionParameter.number.name',
                detail: 'formula.functionList.BIN2HEX.functionParameter.number.detail',
                example: '11111011',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BIN2HEX.functionParameter.places.name',
                detail: 'formula.functionList.BIN2HEX.functionParameter.places.detail',
                example: '4',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BIN2OCT,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.BIN2OCT.description',
        abstract: 'formula.functionList.BIN2OCT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BIN2OCT.functionParameter.number.name',
                detail: 'formula.functionList.BIN2OCT.functionParameter.number.detail',
                example: '1001',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BIN2OCT.functionParameter.places.name',
                detail: 'formula.functionList.BIN2OCT.functionParameter.places.detail',
                example: '3',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BITAND,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.BITAND.description',
        abstract: 'formula.functionList.BITAND.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BITAND.functionParameter.number1.name',
                detail: 'formula.functionList.BITAND.functionParameter.number1.detail',
                example: '13',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BITAND.functionParameter.number2.name',
                detail: 'formula.functionList.BITAND.functionParameter.number2.detail',
                example: '25',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BITLSHIFT,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.BITLSHIFT.description',
        abstract: 'formula.functionList.BITLSHIFT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BITLSHIFT.functionParameter.number.name',
                detail: 'formula.functionList.BITLSHIFT.functionParameter.number.detail',
                example: '4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BITLSHIFT.functionParameter.shiftAmount.name',
                detail: 'formula.functionList.BITLSHIFT.functionParameter.shiftAmount.detail',
                example: '2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BITOR,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.BITOR.description',
        abstract: 'formula.functionList.BITOR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BITOR.functionParameter.number1.name',
                detail: 'formula.functionList.BITOR.functionParameter.number1.detail',
                example: '23',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BITOR.functionParameter.number2.name',
                detail: 'formula.functionList.BITOR.functionParameter.number2.detail',
                example: '10',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BITRSHIFT,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.BITRSHIFT.description',
        abstract: 'formula.functionList.BITRSHIFT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BITRSHIFT.functionParameter.number.name',
                detail: 'formula.functionList.BITRSHIFT.functionParameter.number.detail',
                example: '13',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BITRSHIFT.functionParameter.shiftAmount.name',
                detail: 'formula.functionList.BITRSHIFT.functionParameter.shiftAmount.detail',
                example: '2',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.BITXOR,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.BITXOR.description',
        abstract: 'formula.functionList.BITXOR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BITXOR.functionParameter.number1.name',
                detail: 'formula.functionList.BITXOR.functionParameter.number1.detail',
                example: '5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BITXOR.functionParameter.number2.name',
                detail: 'formula.functionList.BITXOR.functionParameter.number2.detail',
                example: '3',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.COMPLEX,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.COMPLEX.description',
        abstract: 'formula.functionList.COMPLEX.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.COMPLEX.functionParameter.realNum.name',
                detail: 'formula.functionList.COMPLEX.functionParameter.realNum.detail',
                example: '3',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.COMPLEX.functionParameter.iNum.name',
                detail: 'formula.functionList.COMPLEX.functionParameter.iNum.detail',
                example: '4',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.COMPLEX.functionParameter.suffix.name',
                detail: 'formula.functionList.COMPLEX.functionParameter.suffix.detail',
                example: '"i"',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.CONVERT,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.CONVERT.description',
        abstract: 'formula.functionList.CONVERT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CONVERT.functionParameter.number.name',
                detail: 'formula.functionList.CONVERT.functionParameter.number.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CONVERT.functionParameter.fromUnit.name',
                detail: 'formula.functionList.CONVERT.functionParameter.fromUnit.detail',
                example: '"lbm"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CONVERT.functionParameter.toUnit.name',
                detail: 'formula.functionList.CONVERT.functionParameter.toUnit.detail',
                example: '"kg"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.DEC2BIN,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.DEC2BIN.description',
        abstract: 'formula.functionList.DEC2BIN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DEC2BIN.functionParameter.number.name',
                detail: 'formula.functionList.DEC2BIN.functionParameter.number.detail',
                example: '9',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DEC2BIN.functionParameter.places.name',
                detail: 'formula.functionList.DEC2BIN.functionParameter.places.detail',
                example: '4',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.DEC2HEX,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.DEC2HEX.description',
        abstract: 'formula.functionList.DEC2HEX.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DEC2HEX.functionParameter.number.name',
                detail: 'formula.functionList.DEC2HEX.functionParameter.number.detail',
                example: '100',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DEC2HEX.functionParameter.places.name',
                detail: 'formula.functionList.DEC2HEX.functionParameter.places.detail',
                example: '4',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.DEC2OCT,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.DEC2OCT.description',
        abstract: 'formula.functionList.DEC2OCT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DEC2OCT.functionParameter.number.name',
                detail: 'formula.functionList.DEC2OCT.functionParameter.number.detail',
                example: '58',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DEC2OCT.functionParameter.places.name',
                detail: 'formula.functionList.DEC2OCT.functionParameter.places.detail',
                example: '3',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.DELTA,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.DELTA.description',
        abstract: 'formula.functionList.DELTA.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DELTA.functionParameter.number1.name',
                detail: 'formula.functionList.DELTA.functionParameter.number1.detail',
                example: '5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DELTA.functionParameter.number2.name',
                detail: 'formula.functionList.DELTA.functionParameter.number2.detail',
                example: '4',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.ERF,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.ERF.description',
        abstract: 'formula.functionList.ERF.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ERF.functionParameter.lowerLimit.name',
                detail: 'formula.functionList.ERF.functionParameter.lowerLimit.detail',
                example: '0.745',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ERF.functionParameter.upperLimit.name',
                detail: 'formula.functionList.ERF.functionParameter.upperLimit.detail',
                example: '2',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.ERF_PRECISE,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.ERF_PRECISE.description',
        abstract: 'formula.functionList.ERF_PRECISE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ERF_PRECISE.functionParameter.x.name',
                detail: 'formula.functionList.ERF_PRECISE.functionParameter.x.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.ERFC,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.ERFC.description',
        abstract: 'formula.functionList.ERFC.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ERFC.functionParameter.x.name',
                detail: 'formula.functionList.ERFC.functionParameter.x.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.ERFC_PRECISE,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.ERFC_PRECISE.description',
        abstract: 'formula.functionList.ERFC_PRECISE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ERFC_PRECISE.functionParameter.x.name',
                detail: 'formula.functionList.ERFC_PRECISE.functionParameter.x.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.GESTEP,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.GESTEP.description',
        abstract: 'formula.functionList.GESTEP.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.GESTEP.functionParameter.number.name',
                detail: 'formula.functionList.GESTEP.functionParameter.number.detail',
                example: '5',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.GESTEP.functionParameter.step.name',
                detail: 'formula.functionList.GESTEP.functionParameter.step.detail',
                example: '4',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.HEX2BIN,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.HEX2BIN.description',
        abstract: 'formula.functionList.HEX2BIN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.HEX2BIN.functionParameter.number.name',
                detail: 'formula.functionList.HEX2BIN.functionParameter.number.detail',
                example: '"F"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.HEX2BIN.functionParameter.places.name',
                detail: 'formula.functionList.HEX2BIN.functionParameter.places.detail',
                example: '8',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.HEX2DEC,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.HEX2DEC.description',
        abstract: 'formula.functionList.HEX2DEC.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.HEX2DEC.functionParameter.number.name',
                detail: 'formula.functionList.HEX2DEC.functionParameter.number.detail',
                example: '"A5"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.HEX2OCT,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.HEX2OCT.description',
        abstract: 'formula.functionList.HEX2OCT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.HEX2OCT.functionParameter.number.name',
                detail: 'formula.functionList.HEX2OCT.functionParameter.number.detail',
                example: '"F"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.HEX2OCT.functionParameter.places.name',
                detail: 'formula.functionList.HEX2OCT.functionParameter.places.detail',
                example: '3',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMABS,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMABS.description',
        abstract: 'formula.functionList.IMABS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMABS.functionParameter.inumber.name',
                detail: 'formula.functionList.IMABS.functionParameter.inumber.detail',
                example: '"5+12i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMAGINARY,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMAGINARY.description',
        abstract: 'formula.functionList.IMAGINARY.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMAGINARY.functionParameter.inumber.name',
                detail: 'formula.functionList.IMAGINARY.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMARGUMENT,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMARGUMENT.description',
        abstract: 'formula.functionList.IMARGUMENT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMARGUMENT.functionParameter.inumber.name',
                detail: 'formula.functionList.IMARGUMENT.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCONJUGATE,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMCONJUGATE.description',
        abstract: 'formula.functionList.IMCONJUGATE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMCONJUGATE.functionParameter.inumber.name',
                detail: 'formula.functionList.IMCONJUGATE.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCOS,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMCOS.description',
        abstract: 'formula.functionList.IMCOS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMCOS.functionParameter.inumber.name',
                detail: 'formula.functionList.IMCOS.functionParameter.inumber.detail',
                example: '"1+i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCOSH,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMCOSH.description',
        abstract: 'formula.functionList.IMCOSH.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMCOSH.functionParameter.inumber.name',
                detail: 'formula.functionList.IMCOSH.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCOT,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMCOT.description',
        abstract: 'formula.functionList.IMCOT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMCOT.functionParameter.inumber.name',
                detail: 'formula.functionList.IMCOT.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCOTH,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMCOTH.description',
        abstract: 'formula.functionList.IMCOTH.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMCOTH.functionParameter.inumber.name',
                detail: 'formula.functionList.IMCOTH.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCSC,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMCSC.description',
        abstract: 'formula.functionList.IMCSC.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMCSC.functionParameter.inumber.name',
                detail: 'formula.functionList.IMCSC.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMCSCH,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMCSCH.description',
        abstract: 'formula.functionList.IMCSCH.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMCSCH.functionParameter.inumber.name',
                detail: 'formula.functionList.IMCSCH.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMDIV,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMDIV.description',
        abstract: 'formula.functionList.IMDIV.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMDIV.functionParameter.inumber1.name',
                detail: 'formula.functionList.IMDIV.functionParameter.inumber1.detail',
                example: '"-238+240i"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IMDIV.functionParameter.inumber2.name',
                detail: 'formula.functionList.IMDIV.functionParameter.inumber2.detail',
                example: '"10+24i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMEXP,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMEXP.description',
        abstract: 'formula.functionList.IMEXP.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMEXP.functionParameter.inumber.name',
                detail: 'formula.functionList.IMEXP.functionParameter.inumber.detail',
                example: '"1+i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMLN,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMLN.description',
        abstract: 'formula.functionList.IMLN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMLN.functionParameter.inumber.name',
                detail: 'formula.functionList.IMLN.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMLOG,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMLOG.description',
        abstract: 'formula.functionList.IMLOG.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMLOG.functionParameter.inumber.name',
                detail: 'formula.functionList.IMLOG.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IMLOG.functionParameter.base.name',
                detail: 'formula.functionList.IMLOG.functionParameter.base.detail',
                example: '10',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMLOG10,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMLOG10.description',
        abstract: 'formula.functionList.IMLOG10.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMLOG10.functionParameter.inumber.name',
                detail: 'formula.functionList.IMLOG10.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMLOG2,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMLOG2.description',
        abstract: 'formula.functionList.IMLOG2.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMLOG2.functionParameter.inumber.name',
                detail: 'formula.functionList.IMLOG2.functionParameter.inumber.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMPOWER,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMPOWER.description',
        abstract: 'formula.functionList.IMPOWER.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMPOWER.functionParameter.inumber.name',
                detail: 'formula.functionList.IMPOWER.functionParameter.inumber.detail',
                example: '"2+3i"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IMPOWER.functionParameter.number.name',
                detail: 'formula.functionList.IMPOWER.functionParameter.number.detail',
                example: '3',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMPRODUCT,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMPRODUCT.description',
        abstract: 'formula.functionList.IMPRODUCT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMPRODUCT.functionParameter.inumber1.name',
                detail: 'formula.functionList.IMPRODUCT.functionParameter.inumber1.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IMPRODUCT.functionParameter.inumber2.name',
                detail: 'formula.functionList.IMPRODUCT.functionParameter.inumber2.detail',
                example: '"5-3i"',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMREAL,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMREAL.description',
        abstract: 'formula.functionList.IMREAL.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMREAL.functionParameter.inumber.name',
                detail: 'formula.functionList.IMREAL.functionParameter.inumber.detail',
                example: '"6-9i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSEC,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMSEC.description',
        abstract: 'formula.functionList.IMSEC.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMSEC.functionParameter.inumber.name',
                detail: 'formula.functionList.IMSEC.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSECH,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMSECH.description',
        abstract: 'formula.functionList.IMSECH.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMSECH.functionParameter.inumber.name',
                detail: 'formula.functionList.IMSECH.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSIN,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMSIN.description',
        abstract: 'formula.functionList.IMSIN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMSIN.functionParameter.inumber.name',
                detail: 'formula.functionList.IMSIN.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSINH,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMSINH.description',
        abstract: 'formula.functionList.IMSINH.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMSINH.functionParameter.inumber.name',
                detail: 'formula.functionList.IMSINH.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSQRT,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMSQRT.description',
        abstract: 'formula.functionList.IMSQRT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMSQRT.functionParameter.inumber.name',
                detail: 'formula.functionList.IMSQRT.functionParameter.inumber.detail',
                example: '"1+i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSUB,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMSUB.description',
        abstract: 'formula.functionList.IMSUB.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMSUB.functionParameter.inumber1.name',
                detail: 'formula.functionList.IMSUB.functionParameter.inumber1.detail',
                example: '"13+4i"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IMSUB.functionParameter.inumber2.name',
                detail: 'formula.functionList.IMSUB.functionParameter.inumber2.detail',
                example: '"5+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMSUM,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMSUM.description',
        abstract: 'formula.functionList.IMSUM.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMSUM.functionParameter.inumber1.name',
                detail: 'formula.functionList.IMSUM.functionParameter.inumber1.detail',
                example: '"3+4i"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IMSUM.functionParameter.inumber2.name',
                detail: 'formula.functionList.IMSUM.functionParameter.inumber2.detail',
                example: '"5-3i"',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMTAN,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMTAN.description',
        abstract: 'formula.functionList.IMTAN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMTAN.functionParameter.inumber.name',
                detail: 'formula.functionList.IMTAN.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.IMTANH,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.IMTANH.description',
        abstract: 'formula.functionList.IMTANH.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMTANH.functionParameter.inumber.name',
                detail: 'formula.functionList.IMTANH.functionParameter.inumber.detail',
                example: '"4+3i"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.OCT2BIN,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.OCT2BIN.description',
        abstract: 'formula.functionList.OCT2BIN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.OCT2BIN.functionParameter.number.name',
                detail: 'formula.functionList.OCT2BIN.functionParameter.number.detail',
                example: '3',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.OCT2BIN.functionParameter.places.name',
                detail: 'formula.functionList.OCT2BIN.functionParameter.places.detail',
                example: '3',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.OCT2DEC,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.OCT2DEC.description',
        abstract: 'formula.functionList.OCT2DEC.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.OCT2DEC.functionParameter.number.name',
                detail: 'formula.functionList.OCT2DEC.functionParameter.number.detail',
                example: '54',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_ENGINEERING.OCT2HEX,
        functionType: FunctionType.Engineering,
        description: 'formula.functionList.OCT2HEX.description',
        abstract: 'formula.functionList.OCT2HEX.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.OCT2HEX.functionParameter.number.name',
                detail: 'formula.functionList.OCT2HEX.functionParameter.number.detail',
                example: '100',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.OCT2HEX.functionParameter.places.name',
                detail: 'formula.functionList.OCT2HEX.functionParameter.places.detail',
                example: '4',
                require: 0,
                repeat: 0,
            },
        ],
    },
];
