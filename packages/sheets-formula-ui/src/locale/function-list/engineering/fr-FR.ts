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

export default {
    BESSELI: {
        description: 'Returns the modified Bessel function In(x)',
        abstract: 'Returns the modified Bessel function In(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/besseli-function-8d33855c-9a8d-444b-98e0-852267b1c0df',
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
                url: 'https://support.microsoft.com/fr-fr/office/besselj-function-839cb181-48de-408b-9d80-bd02982d94f7',
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
                url: 'https://support.microsoft.com/fr-fr/office/besselk-function-606d11bc-06d3-4d53-9ecb-2803e2b90b70',
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
                url: 'https://support.microsoft.com/fr-fr/office/bessely-function-f3a356b3-da89-42c3-8974-2da54d6353a2',
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
                url: 'https://support.microsoft.com/fr-fr/office/bin2dec-function-63905b57-b3a0-453d-99f4-647bb519cd6c',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The binary number you want to convert.' },
        },
    },
    BIN2HEX: {
        description: 'Converts a binary number to hexadecimal',
        abstract: 'Converts a binary number to hexadecimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/bin2hex-function-0375e507-f5e5-4077-9af8-28d84f9f41cc',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The binary number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    BIN2OCT: {
        description: 'Converts a binary number to octal',
        abstract: 'Converts a binary number to octal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/bin2oct-function-0a4e01ba-ac8d-4158-9b29-16c25c4c23fd',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The binary number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    BITAND: {
        description: 'Returns a \'Bitwise And\' of two numbers',
        abstract: 'Returns a \'Bitwise And\' of two numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/bitand-function-8a2be3d7-91c3-4b48-9517-64548008563a',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'Must be in decimal form and greater than or equal to 0.' },
            number2: { name: 'nombre2', detail: 'Must be in decimal form and greater than or equal to 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Returns a value number shifted left by shift_amount bits',
        abstract: 'Returns a value number shifted left by shift_amount bits',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/bitlshift-function-c55bb27e-cacd-4c7c-b258-d80861a03c9c',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Number must be an integer greater than or equal to 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Shift_amount must be an integer.' },
        },
    },
    BITOR: {
        description: 'Returns a bitwise OR of 2 numbers',
        abstract: 'Returns a bitwise OR of 2 numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/bitor-function-f6ead5c8-5b98-4c9e-9053-8ad5234919b2',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'Must be in decimal form and greater than or equal to 0.' },
            number2: { name: 'nombre2', detail: 'Must be in decimal form and greater than or equal to 0.' },
        },
    },
    BITRSHIFT: {
        description: 'Returns a value number shifted right by shift_amount bits',
        abstract: 'Returns a value number shifted right by shift_amount bits',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/bitrshift-function-274d6996-f42c-4743-abdb-4ff95351222c',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Number must be an integer greater than or equal to 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Shift_amount must be an integer.' },
        },
    },
    BITXOR: {
        description: 'Returns a bitwise \'Exclusive Or\' of two numbers',
        abstract: 'Returns a bitwise \'Exclusive Or\' of two numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/bitxor-function-c81306a1-03f9-4e89-85ac-b86c3cba10e4',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'Must be in decimal form and greater than or equal to 0.' },
            number2: { name: 'nombre2', detail: 'Must be in decimal form and greater than or equal to 0.' },
        },
    },
    COMPLEX: {
        description: 'Converts real and imaginary coefficients into a complex number',
        abstract: 'Converts real and imaginary coefficients into a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/complex-function-f0b8f3a9-51cc-4d6d-86fb-3a9362fa4128',
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
                url: 'https://support.microsoft.com/fr-fr/office/convert-function-d785bef1-808e-4aac-bdcd-666c810f9af2',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'is the value in from_units to convert.' },
            fromUnit: { name: 'from_unit', detail: 'is the units for number.' },
            toUnit: { name: 'to_unit', detail: 'is the units for the result.' },
        },
    },
    DEC2BIN: {
        description: 'Converts a decimal number to binary',
        abstract: 'Converts a decimal number to binary',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dec2bin-function-0f63dd0e-5d1a-42d8-b511-5bf5c6d43838',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The decimal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    DEC2HEX: {
        description: 'Converts a decimal number to hexadecimal',
        abstract: 'Converts a decimal number to hexadecimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dec2hex-function-6344ee8b-b6b5-4c6a-a672-f64666704619',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The decimal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    DEC2OCT: {
        description: 'Converts a decimal number to octal',
        abstract: 'Converts a decimal number to octal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/dec2oct-function-c9d835ca-20b7-40c4-8a9e-d3be351ce00f',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The decimal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    DELTA: {
        description: 'Tests whether two values are equal',
        abstract: 'Tests whether two values are equal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/delta-function-2f763672-c959-4e07-ac33-fe03220ba432',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'The first number.' },
            number2: { name: 'nombre2', detail: 'The second number. If omitted, number2 is assumed to be zero.' },
        },
    },
    ERF: {
        description: 'Returns the error function',
        abstract: 'Returns the error function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/erf-function-c53c7e7b-5482-4b6c-883e-56df3c9af349',
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
                url: 'https://support.microsoft.com/fr-fr/office/erf-precise-function-9a349593-705c-4278-9a98-e4122831a8e0',
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
                url: 'https://support.microsoft.com/fr-fr/office/erfc-function-736e0318-70ba-4e8b-8d08-461fe68b71b3',
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
                url: 'https://support.microsoft.com/fr-fr/office/erfc-precise-function-e90e6bab-f45e-45df-b2ac-cd2eb4d4a273',
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
                url: 'https://support.microsoft.com/fr-fr/office/gestep-function-f37e7d2a-41da-4129-be95-640883fca9df',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The value to test against step.' },
            step: { name: 'step', detail: 'The threshold value. If you omit a value for step, GESTEP uses zero.' },
        },
    },
    HEX2BIN: {
        description: 'Converts a hexadecimal number to binary',
        abstract: 'Converts a hexadecimal number to binary',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/hex2bin-function-a13aafaa-5737-4920-8424-643e581828c1',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The hexadecimal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    HEX2DEC: {
        description: 'Converts a hexadecimal number to decimal',
        abstract: 'Converts a hexadecimal number to decimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/hex2dec-function-8c8c3155-9f37-45a5-a3ee-ee5379ef106e',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The hexadecimal number you want to convert.' },
        },
    },
    HEX2OCT: {
        description: 'Converts a hexadecimal number to octal',
        abstract: 'Converts a hexadecimal number to octal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/hex2oct-function-54d52808-5d19-4bd0-8a63-1096a5d11912',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The hexadecimal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    IMABS: {
        description: 'Returns the absolute value (modulus) of a complex number',
        abstract: 'Returns the absolute value (modulus) of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/imabs-function-b31e73c6-d90c-4062-90bc-8eb351d765a1',
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
                url: 'https://support.microsoft.com/fr-fr/office/imaginary-function-dd5952fd-473d-44d9-95a1-9a17b23e428a',
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
                url: 'https://support.microsoft.com/fr-fr/office/imargument-function-eed37ec1-23b3-4f59-b9f3-d340358a034a',
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
                url: 'https://support.microsoft.com/fr-fr/office/imconjugate-function-2e2fc1ea-f32b-4f9b-9de6-233853bafd42',
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
                url: 'https://support.microsoft.com/fr-fr/office/imcos-function-dad75277-f592-4a6b-ad6c-be93a808a53c',
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
                url: 'https://support.microsoft.com/fr-fr/office/imcosh-function-053e4ddb-4122-458b-be9a-457c405e90ff',
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
                url: 'https://support.microsoft.com/fr-fr/office/imcot-function-dc6a3607-d26a-4d06-8b41-8931da36442c',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the cotangent.' },
        },
    },
    IMCSC: {
        description: 'Returns the cosecant of a complex number',
        abstract: 'Returns the cosecant of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/imcsc-function-9e158d8f-2ddf-46cd-9b1d-98e29904a323',
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
                url: 'https://support.microsoft.com/fr-fr/office/imcsch-function-c0ae4f54-5f09-4fef-8da0-dc33ea2c5ca9',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the hyperbolic cosecant.' },
        },
    },
    IMDIV: {
        description: 'Returns the quotient of two complex numbers',
        abstract: 'Returns the quotient of two complex numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/imdiv-function-a505aff7-af8a-4451-8142-77ec3d74d83f',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'The complex numerator or dividend.' },
            inumber2: { name: 'inumber2', detail: 'The complex denominator or divisor.' },
        },
    },
    IMEXP: {
        description: 'Returns the exponential of a complex number',
        abstract: 'Returns the exponential of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/imexp-function-c6f8da1f-e024-4c0c-b802-a60e7147a95f',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the exponential.' },
        },
    },
    IMLN: {
        description: 'Returns the natural logarithm of a complex number',
        abstract: 'Returns the natural logarithm of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/imln-function-32b98bcf-8b81-437c-a636-6fb3aad509d8',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the natural logarithm.' },
        },
    },
    IMLOG10: {
        description: 'Returns the base-10 logarithm of a complex number',
        abstract: 'Returns the base-10 logarithm of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/imlog10-function-58200fca-e2a2-4271-8a98-ccd4360213a5',
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
                url: 'https://support.microsoft.com/fr-fr/office/imlog2-function-152e13b4-bc79-486c-a243-e6a676878c51',
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
                url: 'https://support.microsoft.com/fr-fr/office/impower-function-210fd2f5-f8ff-4c6a-9d60-30e34fbdef39',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number you want to raise to a power.' },
            number: { name: 'nombre', detail: 'The power to which you want to raise the complex number.' },
        },
    },
    IMPRODUCT: {
        description: 'Returns the product of from 2 to 255 complex numbers',
        abstract: 'Returns the product of from 2 to 255 complex numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/improduct-function-2fb8651a-a4f2-444f-975e-8ba7aab3a5ba',
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
                url: 'https://support.microsoft.com/fr-fr/office/imreal-function-d12bc4c0-25d0-4bb3-a25f-ece1938bf366',
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
                url: 'https://support.microsoft.com/fr-fr/office/imsec-function-6df11132-4411-4df4-a3dc-1f17372459e0',
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
                url: 'https://support.microsoft.com/fr-fr/office/imsech-function-f250304f-788b-4505-954e-eb01fa50903b',
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
                url: 'https://support.microsoft.com/fr-fr/office/imsin-function-1ab02a39-a721-48de-82ef-f52bf37859f6',
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
                url: 'https://support.microsoft.com/fr-fr/office/imsinh-function-dfb9ec9e-8783-4985-8c42-b028e9e8da3d',
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
                url: 'https://support.microsoft.com/fr-fr/office/imsqrt-function-e1753f80-ba11-4664-a10e-e17368396b70',
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
                url: 'https://support.microsoft.com/fr-fr/office/imsub-function-2e404b4d-4935-4e85-9f52-cb08b9a45054',
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
                url: 'https://support.microsoft.com/fr-fr/office/imsum-function-81542999-5f1c-4da6-9ffe-f1d7aaa9457f',
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
                url: 'https://support.microsoft.com/fr-fr/office/imtan-function-8478f45d-610a-43cf-8544-9fc0b553a132',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'A complex number for which you want the tangent.' },
        },
    },
    OCT2BIN: {
        description: 'Converts an octal number to binary',
        abstract: 'Converts an octal number to binary',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/oct2bin-function-55383471-3c56-4d27-9522-1a8ec646c589',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The octal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
    OCT2DEC: {
        description: 'Converts an octal number to decimal',
        abstract: 'Converts an octal number to decimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/oct2dec-function-87606014-cb98-44b2-8dbb-e48f8ced1554',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The octal number you want to convert.' },
        },
    },
    OCT2HEX: {
        description: 'Converts an octal number to hexadecimal',
        abstract: 'Converts an octal number to hexadecimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/office/oct2hex-function-912175b4-d497-41b4-a029-221f051b858f',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'The octal number you want to convert.' },
            places: { name: 'places', detail: 'The number of characters to use.' },
        },
    },
};
