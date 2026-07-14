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

const locale = {
    BESSELI: {
        description: 'Returns the modified Bessel function In(x)',
        abstract: 'Returns the modified Bessel function In(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'The value at which to evaluate the function.' },
            n: { name: 'N', detail: 'The order of the Bessel function. If n is not an integer, it is truncated.' },
        },
    },
    BESSELJ: {
        description: 'Returns the Bessel function Jn(x)',
        abstract: 'Returns the Bessel function Jn(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'The value at which to evaluate the function.' },
            n: { name: 'N', detail: 'The order of the Bessel function. If n is not an integer, it is truncated.' },
        },
    },
    BESSELK: {
        description: 'Returns the modified Bessel function Kn(x)',
        abstract: 'Returns the modified Bessel function Kn(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'The value at which to evaluate the function.' },
            n: { name: 'N', detail: 'The order of the Bessel function. If n is not an integer, it is truncated.' },
        },
    },
    BESSELY: {
        description: 'Returns the Bessel function Yn(x)',
        abstract: 'Returns the Bessel function Yn(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'The value at which to evaluate the function.' },
            n: { name: 'N', detail: 'The order of the Bessel function. If n is not an integer, it is truncated.' },
        },
    },
    BIN2DEC: {
        description: 'Converts a binary number to decimal',
        abstract: 'Converts a binary number to decimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The binary number you want to convert.' },
        },
    },
    BIN2HEX: {
        description: 'Converts a binary number to hexadecimal',
        abstract: 'Converts a binary number to hexadecimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The binary number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    BIN2OCT: {
        description: 'Converts a binary number to octal.',
        abstract: 'Converts a binary number to octal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Required. The binary number you want to convert. Number cannot contain more than 10 characters (10 bits). The most significant bit of number is the sign bit. The remaining 9 bits are magnitude bits. Negative numbers are represented using two\'s-complement notation.' },
            places: { name: 'places', detail: 'Optional. The number of characters to use. If places is omitted, BIN2OCT uses the minimum number of characters necessary. Places is useful for padding the return value with leading 0s (zeros).' },
        },
    },
    BITAND: {
        description: 'Returns a bitwise \'AND\' of two numbers.',
        abstract: 'Returns a bitwise \'AND\' of two numbers.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Required. Must be in decimal form and greater than or equal to 0.' },
            number2: { name: 'number2', detail: 'Required. Must be in decimal form and greater than or equal to 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Returns a value number shifted left by shift_amount bits',
        abstract: 'Returns a value number shifted left by shift_amount bits',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Number must be an integer greater than or equal to 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Shift_amount must be an integer.' },
        },
    },
    BITOR: {
        description: 'Returns a bitwise OR of 2 numbers',
        abstract: 'Returns a bitwise OR of 2 numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Must be in decimal form and greater than or equal to 0.' },
            number2: { name: 'number2', detail: 'Must be in decimal form and greater than or equal to 0.' },
        },
    },
    BITRSHIFT: {
        description: 'Returns a value number shifted right by shift_amount bits',
        abstract: 'Returns a value number shifted right by shift_amount bits',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Number must be an integer greater than or equal to 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Shift_amount must be an integer.' },
        },
    },
    BITXOR: {
        description: 'Returns a bitwise \'Exclusive Or\' of two numbers',
        abstract: 'Returns a bitwise \'Exclusive Or\' of two numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Must be in decimal form and greater than or equal to 0.' },
            number2: { name: 'number2', detail: 'Must be in decimal form and greater than or equal to 0.' },
        },
    },
    COMPLEX: {
        description: 'Converts real and imaginary coefficients into a complex number',
        abstract: 'Converts real and imaginary coefficients into a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'real_num', detail: 'The real coefficient of the complex number.' },
            iNum: { name: 'i_num', detail: 'The imaginary coefficient of the complex number.' },
            suffix: { name: 'suffix', detail: 'The suffix for the imaginary component of the complex number. If omitted, suffix is assumed to be "i".' },
        },
    },
    CONVERT: {
        description: 'Converts a number from one measurement system to another',
        abstract: 'Converts a number from one measurement system to another',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Is the value in from_units to convert.' },
            fromUnit: { name: 'from_unit', detail: 'Is the units for number.' },
            toUnit: { name: 'to_unit', detail: 'Is the units for the result.' },
        },
    },
    DEC2BIN: {
        description: 'Converts a decimal number to binary',
        abstract: 'Converts a decimal number to binary',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The decimal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    DEC2HEX: {
        description: 'Converts a decimal number to hexadecimal',
        abstract: 'Converts a decimal number to hexadecimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The decimal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    DEC2OCT: {
        description: 'Converts a decimal number to octal',
        abstract: 'Converts a decimal number to octal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The decimal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    DELTA: {
        description: 'Tests whether two values are equal',
        abstract: 'Tests whether two values are equal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number.' },
            number2: { name: 'number2', detail: 'The second number. If omitted, number2 is assumed to be zero.' },
        },
    },
    ERF: {
        description: 'Returns the error function',
        abstract: 'Returns the error function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'lower_limit', detail: 'The lower bound for integrating ERF.' },
            upperLimit: { name: 'upper_limit', detail: 'The upper bound for integrating ERF. If omitted, ERF integrates between zero and lower_limit.' },
        },
    },
    ERF_PRECISE: {
        description: 'Returns the error function',
        abstract: 'Returns the error function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The lower bound for integrating ERF.PRECISE.' },
        },
    },
    ERFC: {
        description: 'Returns the complementary error function',
        abstract: 'Returns the complementary error function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The lower bound for integrating ERFC.' },
        },
    },
    ERFC_PRECISE: {
        description: 'Returns the complementary ERF function integrated between x and infinity',
        abstract: 'Returns the complementary ERF function integrated between x and infinity',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The lower bound for integrating ERFC.PRECISE.' },
        },
    },
    GESTEP: {
        description: 'Tests whether a number is greater than a threshold value',
        abstract: 'Tests whether a number is greater than a threshold value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value to test against step.' },
            step: { name: 'step', detail: 'The threshold value. If you omit a value for step, GESTEP uses zero.' },
        },
    },
    HEX2BIN: {
        description: 'Converts a hexadecimal number to binary',
        abstract: 'Converts a hexadecimal number to binary',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The hexadecimal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    HEX2DEC: {
        description: 'Converts a hexadecimal number to decimal',
        abstract: 'Converts a hexadecimal number to decimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The hexadecimal number you want to convert.' },
        },
    },
    HEX2OCT: {
        description: 'Converts a hexadecimal number to octal',
        abstract: 'Converts a hexadecimal number to octal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The hexadecimal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    IMABS: {
        description: 'Returns the absolute value (modulus) of a complex number',
        abstract: 'Returns the absolute value (modulus) of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the absolute value.' },
        },
    },
    IMAGINARY: {
        description: 'Returns the imaginary coefficient of a complex number',
        abstract: 'Returns the imaginary coefficient of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the imaginary coefficient.' },
        },
    },
    IMARGUMENT: {
        description: 'Returns the argument theta, an angle expressed in radians',
        abstract: 'Returns the argument theta, an angle expressed in radians',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the argument theta.' },
        },
    },
    IMCONJUGATE: {
        description: 'Returns the complex conjugate of a complex number',
        abstract: 'Returns the complex conjugate of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the conjugate.' },
        },
    },
    IMCOS: {
        description: 'Returns the cosine of a complex number',
        abstract: 'Returns the cosine of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the cosine.' },
        },
    },
    IMCOSH: {
        description: 'Returns the hyperbolic cosine of a complex number',
        abstract: 'Returns the hyperbolic cosine of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the hyperbolic cosine.' },
        },
    },
    IMCOT: {
        description: 'Returns the cotangent of a complex number',
        abstract: 'Returns the cotangent of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the cotangent.' },
        },
    },
    IMCOTH: {
        description: 'The IMCOTH function returns the hyperbolic cotangent of the given complex number. For example, a given complex number "x+yi" returns "coth(x+yi)."',
        abstract: 'The IMCOTH function returns the hyperbolic cotangent of the given complex number. For example, a given complex number "x+yi" returns "coth(x+yi)."',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366256?hl=en',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'The complex number for which you want the hyperbolic cotangent. This can be either the result of the COMPLEX function, a real number interpreted as a complex number with imaginary parts equal to 0, or a string in the format “x+yi” where x and y are numeric.' },
        },
    },
    IMCSC: {
        description: 'Returns the cosecant of a complex number',
        abstract: 'Returns the cosecant of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the cosecant.' },
        },
    },
    IMCSCH: {
        description: 'Returns the hyperbolic cosecant of a complex number',
        abstract: 'Returns the hyperbolic cosecant of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the hyperbolic cosecant.' },
        },
    },
    IMDIV: {
        description: 'Returns the quotient of two complex numbers in x + yi or x + yj text format.',
        abstract: 'Returns the quotient of two complex numbers in x + yi or x + yj text format.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Required. The complex numerator or dividend.' },
            inumber2: { name: 'inumber2', detail: 'Required. The complex denominator or divisor.' },
        },
    },
    IMEXP: {
        description: 'Returns the exponential of a complex number in x + yi or x + yj text format.',
        abstract: 'Returns the exponential of a complex number in x + yi or x + yj text format.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Required. A complex number for which you want the exponential.' },
        },
    },
    IMLN: {
        description: 'Returns the natural logarithm of a complex number',
        abstract: 'Returns the natural logarithm of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the natural logarithm.' },
        },
    },
    IMLOG: {
        description: 'The IMLOG function returns the logarithm of a complex number for a specified base.',
        abstract: 'The IMLOG function returns the logarithm of a complex number for a specified base.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366486?hl=en',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'The input value of the logarithm function. The number can be written as plain numbers, e.g. 1, to be interpreted as a real number. The number can be written as quoted text in order to specify both the real and complex coefficients.' },
            base: { name: 'base', detail: 'The base to use when calculating the logarithm. Must be a positive real number.' },
        },
    },
    IMLOG10: {
        description: 'Returns the base-10 logarithm of a complex number',
        abstract: 'Returns the base-10 logarithm of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the common logarithm.' },
        },
    },
    IMLOG2: {
        description: 'Returns the base-2 logarithm of a complex number',
        abstract: 'Returns the base-2 logarithm of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the base-2 logarithm.' },
        },
    },
    IMPOWER: {
        description: 'Returns a complex number raised to an integer power',
        abstract: 'Returns a complex number raised to an integer power',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number you want to raise to a power.' },
            number: { name: 'number', detail: 'The power to which you want to raise the complex number.' },
        },
    },
    IMPRODUCT: {
        description: 'Returns the product of from 1 to 255 complex numbers',
        abstract: 'Returns the product of from 1 to 255 complex numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: '1 to 255 complex numbers to multiply.' },
            inumber2: { name: 'inumber2', detail: '1 to 255 complex numbers to multiply.' },
        },
    },
    IMREAL: {
        description: 'Returns the real coefficient of a complex number',
        abstract: 'Returns the real coefficient of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the real coefficient.' },
        },
    },
    IMSEC: {
        description: 'Returns the secant of a complex number',
        abstract: 'Returns the secant of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the secant.' },
        },
    },
    IMSECH: {
        description: 'Returns the hyperbolic secant of a complex number',
        abstract: 'Returns the hyperbolic secant of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the hyperbolic secant.' },
        },
    },
    IMSIN: {
        description: 'Returns the sine of a complex number',
        abstract: 'Returns the sine of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the sine.' },
        },
    },
    IMSINH: {
        description: 'Returns the hyperbolic sine of a complex number',
        abstract: 'Returns the hyperbolic sine of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the hyperbolic sine.' },
        },
    },
    IMSQRT: {
        description: 'Returns the square root of a complex number',
        abstract: 'Returns the square root of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the square root.' },
        },
    },
    IMSUB: {
        description: 'Returns the difference between two complex numbers',
        abstract: 'Returns the difference between two complex numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'inumber1.' },
            inumber2: { name: 'inumber2', detail: 'inumber2.' },
        },
    },
    IMSUM: {
        description: 'Returns the sum of complex numbers',
        abstract: 'Returns the sum of complex numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: '1 to 255 complex numbers to add.' },
            inumber2: { name: 'inumber2', detail: '1 to 255 complex numbers to add.' },
        },
    },
    IMTAN: {
        description: 'Returns the tangent of a complex number',
        abstract: 'Returns the tangent of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the tangent.' },
        },
    },
    IMTANH: {
        description: 'The IMTANH function returns the hyperbolic tangent of the given complex number. For example, a given complex number "x+yi" returns "tanh(x+yi)."',
        abstract: 'The IMTANH function returns the hyperbolic tangent of the given complex number. For example, a given complex number "x+yi" returns "tanh(x+yi)."',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366655?hl=en',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'The complex number for which you want the hyperbolic tangent. This can be either the result of the COMPLEX function, a real number interpreted as a complex number with imaginary parts equal to 0, or a string in the format “x+yi” where x and y are numeric.' },
        },
    },
    OCT2BIN: {
        description: 'Converts an octal number to binary',
        abstract: 'Converts an octal number to binary',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The octal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    OCT2DEC: {
        description: 'Converts an octal number to decimal',
        abstract: 'Converts an octal number to decimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The octal number you want to convert.' },
        },
    },
    OCT2HEX: {
        description: 'Converts an octal number to hexadecimal',
        abstract: 'Converts an octal number to hexadecimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The octal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
};

export default locale;
