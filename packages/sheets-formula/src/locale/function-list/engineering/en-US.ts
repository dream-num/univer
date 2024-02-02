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

export default {
    BESSELI: {
        description: 'Returns the modified Bessel function In(x)',
        abstract: 'Returns the modified Bessel function In(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/besseli-function-8d33855c-9a8d-444b-98e0-852267b1c0df',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BESSELJ: {
        description: 'Returns the Bessel function Jn(x)',
        abstract: 'Returns the Bessel function Jn(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/besselj-function-839cb181-48de-408b-9d80-bd02982d94f7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BESSELK: {
        description: 'Returns the modified Bessel function Kn(x)',
        abstract: 'Returns the modified Bessel function Kn(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/besselk-function-606d11bc-06d3-4d53-9ecb-2803e2b90b70',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BESSELY: {
        description: 'Returns the Bessel function Yn(x)',
        abstract: 'Returns the Bessel function Yn(x)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/bessely-function-f3a356b3-da89-42c3-8974-2da54d6353a2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BIN2DEC: {
        description: 'Converts a binary number to decimal',
        abstract: 'Converts a binary number to decimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/bin2dec-function-63905b57-b3a0-453d-99f4-647bb519cd6c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BIN2HEX: {
        description: 'Converts a binary number to hexadecimal',
        abstract: 'Converts a binary number to hexadecimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/bin2hex-function-0375e507-f5e5-4077-9af8-28d84f9f41cc',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BIN2OCT: {
        description: 'Converts a binary number to octal',
        abstract: 'Converts a binary number to octal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/bin2oct-function-0a4e01ba-ac8d-4158-9b29-16c25c4c23fd',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BITAND: {
        description: 'Returns a \'Bitwise And\' of two numbers',
        abstract: 'Returns a \'Bitwise And\' of two numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/bitand-function-8a2be3d7-91c3-4b48-9517-64548008563a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BITLSHIFT: {
        description: 'Returns a value number shifted left by shift_amount bits',
        abstract: 'Returns a value number shifted left by shift_amount bits',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/bitlshift-function-c55bb27e-cacd-4c7c-b258-d80861a03c9c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BITOR: {
        description: 'Returns a bitwise OR of 2 numbers',
        abstract: 'Returns a bitwise OR of 2 numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/bitor-function-f6ead5c8-5b98-4c9e-9053-8ad5234919b2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BITRSHIFT: {
        description: 'Returns a value number shifted right by shift_amount bits',
        abstract: 'Returns a value number shifted right by shift_amount bits',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/bitrshift-function-274d6996-f42c-4743-abdb-4ff95351222c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BITXOR: {
        description: 'Returns a bitwise \'Exclusive Or\' of two numbers',
        abstract: 'Returns a bitwise \'Exclusive Or\' of two numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/bitxor-function-c81306a1-03f9-4e89-85ac-b86c3cba10e4',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COMPLEX: {
        description: 'Converts real and imaginary coefficients into a complex number',
        abstract: 'Converts real and imaginary coefficients into a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/complex-function-f0b8f3a9-51cc-4d6d-86fb-3a9362fa4128',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CONVERT: {
        description: 'Converts a number from one measurement system to another',
        abstract: 'Converts a number from one measurement system to another',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/convert-function-d785bef1-808e-4aac-bdcd-666c810f9af2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DEC2BIN: {
        description: 'Converts a decimal number to binary',
        abstract: 'Converts a decimal number to binary',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/dec2bin-function-0f63dd0e-5d1a-42d8-b511-5bf5c6d43838',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DEC2HEX: {
        description: 'Converts a decimal number to hexadecimal',
        abstract: 'Converts a decimal number to hexadecimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/dec2hex-function-6344ee8b-b6b5-4c6a-a672-f64666704619',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DEC2OCT: {
        description: 'Converts a decimal number to octal',
        abstract: 'Converts a decimal number to octal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/dec2oct-function-c9d835ca-20b7-40c4-8a9e-d3be351ce00f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DELTA: {
        description: 'Tests whether two values are equal',
        abstract: 'Tests whether two values are equal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/delta-function-2f763672-c959-4e07-ac33-fe03220ba432',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ERF: {
        description: 'Returns the error function',
        abstract: 'Returns the error function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/erf-function-c53c7e7b-5482-4b6c-883e-56df3c9af349',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ERF_PRECISE: {
        description: 'Returns the error function',
        abstract: 'Returns the error function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/erf-precise-function-9a349593-705c-4278-9a98-e4122831a8e0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ERFC: {
        description: 'Returns the complementary error function',
        abstract: 'Returns the complementary error function',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/erfc-function-736e0318-70ba-4e8b-8d08-461fe68b71b3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ERFC_PRECISE: {
        description: 'Returns the complementary ERF function integrated between x and infinity',
        abstract: 'Returns the complementary ERF function integrated between x and infinity',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/erfc-precise-function-e90e6bab-f45e-45df-b2ac-cd2eb4d4a273',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GESTEP: {
        description: 'Tests whether a number is greater than a threshold value',
        abstract: 'Tests whether a number is greater than a threshold value',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/gestep-function-f37e7d2a-41da-4129-be95-640883fca9df',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HEX2BIN: {
        description: 'Converts a hexadecimal number to binary',
        abstract: 'Converts a hexadecimal number to binary',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/hex2bin-function-a13aafaa-5737-4920-8424-643e581828c1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HEX2DEC: {
        description: 'Converts a hexadecimal number to decimal',
        abstract: 'Converts a hexadecimal number to decimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/hex2dec-function-8c8c3155-9f37-45a5-a3ee-ee5379ef106e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HEX2OCT: {
        description: 'Converts a hexadecimal number to octal',
        abstract: 'Converts a hexadecimal number to octal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/hex2oct-function-54d52808-5d19-4bd0-8a63-1096a5d11912',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMABS: {
        description: 'Returns the absolute value (modulus) of a complex number',
        abstract: 'Returns the absolute value (modulus) of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imabs-function-b31e73c6-d90c-4062-90bc-8eb351d765a1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMAGINARY: {
        description: 'Returns the imaginary coefficient of a complex number',
        abstract: 'Returns the imaginary coefficient of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imaginary-function-dd5952fd-473d-44d9-95a1-9a17b23e428a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMARGUMENT: {
        description: 'Returns the argument theta, an angle expressed in radians',
        abstract: 'Returns the argument theta, an angle expressed in radians',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imargument-function-eed37ec1-23b3-4f59-b9f3-d340358a034a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMCONJUGATE: {
        description: 'Returns the complex conjugate of a complex number',
        abstract: 'Returns the complex conjugate of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imconjugate-function-2e2fc1ea-f32b-4f9b-9de6-233853bafd42',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMCOS: {
        description: 'Returns the cosine of a complex number',
        abstract: 'Returns the cosine of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imcos-function-dad75277-f592-4a6b-ad6c-be93a808a53c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMCOSH: {
        description: 'Returns the hyperbolic cosine of a complex number',
        abstract: 'Returns the hyperbolic cosine of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imcosh-function-053e4ddb-4122-458b-be9a-457c405e90ff',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMCOT: {
        description: 'Returns the cotangent of a complex number',
        abstract: 'Returns the cotangent of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imcot-function-dc6a3607-d26a-4d06-8b41-8931da36442c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMCSC: {
        description: 'Returns the cosecant of a complex number',
        abstract: 'Returns the cosecant of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imcsc-function-9e158d8f-2ddf-46cd-9b1d-98e29904a323',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMCSCH: {
        description: 'Returns the hyperbolic cosecant of a complex number',
        abstract: 'Returns the hyperbolic cosecant of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imcsch-function-c0ae4f54-5f09-4fef-8da0-dc33ea2c5ca9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMDIV: {
        description: 'Returns the quotient of two complex numbers',
        abstract: 'Returns the quotient of two complex numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imdiv-function-a505aff7-af8a-4451-8142-77ec3d74d83f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMEXP: {
        description: 'Returns the exponential of a complex number',
        abstract: 'Returns the exponential of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imexp-function-c6f8da1f-e024-4c0c-b802-a60e7147a95f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMLN: {
        description: 'Returns the natural logarithm of a complex number',
        abstract: 'Returns the natural logarithm of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imln-function-32b98bcf-8b81-437c-a636-6fb3aad509d8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMLOG10: {
        description: 'Returns the base-10 logarithm of a complex number',
        abstract: 'Returns the base-10 logarithm of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imlog10-function-58200fca-e2a2-4271-8a98-ccd4360213a5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMLOG2: {
        description: 'Returns the base-2 logarithm of a complex number',
        abstract: 'Returns the base-2 logarithm of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imlog2-function-152e13b4-bc79-486c-a243-e6a676878c51',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMPOWER: {
        description: 'Returns a complex number raised to an integer power',
        abstract: 'Returns a complex number raised to an integer power',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/impower-function-210fd2f5-f8ff-4c6a-9d60-30e34fbdef39',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMPRODUCT: {
        description: 'Returns the product of from 2 to 255 complex numbers',
        abstract: 'Returns the product of from 2 to 255 complex numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/improduct-function-2fb8651a-a4f2-444f-975e-8ba7aab3a5ba',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMREAL: {
        description: 'Returns the real coefficient of a complex number',
        abstract: 'Returns the real coefficient of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imreal-function-d12bc4c0-25d0-4bb3-a25f-ece1938bf366',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMSEC: {
        description: 'Returns the secant of a complex number',
        abstract: 'Returns the secant of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imsec-function-6df11132-4411-4df4-a3dc-1f17372459e0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMSECH: {
        description: 'Returns the hyperbolic secant of a complex number',
        abstract: 'Returns the hyperbolic secant of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imsech-function-f250304f-788b-4505-954e-eb01fa50903b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMSIN: {
        description: 'Returns the sine of a complex number',
        abstract: 'Returns the sine of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imsin-function-1ab02a39-a721-48de-82ef-f52bf37859f6',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMSINH: {
        description: 'Returns the hyperbolic sine of a complex number',
        abstract: 'Returns the hyperbolic sine of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imsinh-function-dfb9ec9e-8783-4985-8c42-b028e9e8da3d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMSQRT: {
        description: 'Returns the square root of a complex number',
        abstract: 'Returns the square root of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imsqrt-function-e1753f80-ba11-4664-a10e-e17368396b70',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMSUB: {
        description: 'Returns the difference between two complex numbers',
        abstract: 'Returns the difference between two complex numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imsub-function-2e404b4d-4935-4e85-9f52-cb08b9a45054',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMSUM: {
        description: 'Returns the sum of complex numbers',
        abstract: 'Returns the sum of complex numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imsum-function-81542999-5f1c-4da6-9ffe-f1d7aaa9457f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMTAN: {
        description: 'Returns the tangent of a complex number',
        abstract: 'Returns the tangent of a complex number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/imtan-function-8478f45d-610a-43cf-8544-9fc0b553a132',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    OCT2BIN: {
        description: 'Converts an octal number to binary',
        abstract: 'Converts an octal number to binary',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/oct2bin-function-55383471-3c56-4d27-9522-1a8ec646c589',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    OCT2DEC: {
        description: 'Converts an octal number to decimal',
        abstract: 'Converts an octal number to decimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/oct2dec-function-87606014-cb98-44b2-8dbb-e48f8ced1554',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    OCT2HEX: {
        description: 'Converts an octal number to hexadecimal',
        abstract: 'Converts an octal number to hexadecimal',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/oct2hex-function-912175b4-d497-41b4-a029-221f051b858f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
