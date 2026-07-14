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
    ABS: {
        description: 'Returns the absolute value of a number. The absolute value of a number is the number without its sign.',
        abstract: 'Returns the absolute value of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The real number of which you want the absolute value.' },
        },
    },
    ACOS: {
        description: 'Returns the arccosine, or inverse cosine, of a number. The arccosine is the angle whose cosine is number. The returned angle is given in radians in the range 0 (zero) to pi.',
        abstract: 'Returns the arccosine of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The cosine of the angle you want and must be from -1 to 1.' },
        },
    },
    ACOSH: {
        description: 'Returns the inverse hyperbolic cosine of a number. The number must be greater than or equal to 1. The inverse hyperbolic cosine is the value whose hyperbolic cosine is number, so ACOSH(COSH(number)) equals number.',
        abstract: 'Returns the inverse hyperbolic cosine of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Any real number equal to or greater than 1.' },
        },
    },
    ACOT: {
        description: 'Returns the principal value of the arccotangent, or inverse cotangent, of a number.',
        abstract: 'Returns the arccotangent of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: {
                name: 'number',
                detail: 'Number is the cotangent of the angle you want. This must be a real number.',
            },
        },
    },
    ACOTH: {
        description: 'Returns the hyperbolic arccotangent of a number',
        abstract: 'Returns the hyperbolic arccotangent of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The absolute value of Number must be greater than 1.' },
        },
    },
    AGGREGATE: {
        description: 'Returns an aggregate in a list or database',
        abstract: 'Returns an aggregate in a list or database',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'A number 1 to 19 that specifies which function to use.' },
            options: { name: 'options', detail: 'A numerical value that determines which values to ignore in the evaluation range for the function.' },
            ref1: { name: 'ref1', detail: 'The first numeric argument for functions that take multiple numeric arguments for which you want the aggregate value.' },
            ref2: { name: 'ref2', detail: 'Numeric arguments 2 to 252 for which you want the aggregate value.' },
        },
    },
    ARABIC: {
        description: 'Converts a Roman numeral to an Arabic numeral.',
        abstract: 'Converts a Roman numeral to an Arabic numeral.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Required. A string enclosed in quotation marks, an empty string (""), or a reference to a cell containing text.' },
        },
    },
    ASIN: {
        description: 'Returns the arcsine, or inverse sine, of a number. The arcsine is the angle whose sine is number . The returned angle is given in radians in the range -pi/2 to pi/2.',
        abstract: 'Returns the arcsine, or inverse sine, of a number. The arcsine is the angle whose sine is number . The returned angle is given in radians in the range -pi/2 to pi/2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Required. The sine of the angle you want and must be from -1 to 1.' },
        },
    },
    ASINH: {
        description: 'Returns the inverse hyperbolic sine of a number. The inverse hyperbolic sine is the value whose hyperbolic sine is number , so ASINH(SINH(number)) equals number .',
        abstract: 'Returns the inverse hyperbolic sine of a number. The inverse hyperbolic sine is the value whose hyperbolic sine is number , so ASINH(SINH(number)) equals number .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Required. Any real number.' },
        },
    },
    ATAN: {
        description: 'Returns the arctangent of a number.',
        abstract: 'Returns the arctangent of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The tangent of the angle you want.' },
        },
    },
    ATAN2: {
        description: 'Returns the arctangent from x- and y-coordinates.',
        abstract: 'Returns the arctangent from x- and y-coordinates',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_num', detail: 'The x-coordinate of the point.' },
            yNum: { name: 'y_num', detail: 'The y-coordinate of the point.' },
        },
    },
    ATANH: {
        description: 'Returns the inverse hyperbolic tangent of a number. Number must be between -1 and 1 (excluding -1 and 1). The inverse hyperbolic tangent is the value whose hyperbolic tangent is number , so ATANH(TANH(number)) equals number .',
        abstract: 'Returns the inverse hyperbolic tangent of a number. Number must be between -1 and 1 (excluding -1 and 1). The inverse hyperbolic tangent is the value whose hyperbolic tangent is number , so ATANH(TANH(number)) equals number .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Required. Any real number between 1 and -1.' },
        },
    },
    BASE: {
        description: 'Converts a number into a text representation with the given radix (base).',
        abstract: 'Converts a number into a text representation with the given radix (base).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Required. The number that you want to convert. Must be an integer greater than or equal to 0 and less than 2^53.' },
            radix: { name: 'radix', detail: 'Required. The base radix that you want to convert the number into. Must be an integer greater than or equal to 2 and less than or equal to 36.' },
            minLength: { name: 'min_length', detail: 'Optional. The minimum length of the returned string. Must be an integer greater than or equal to 0.' },
        },
    },
    CEILING: {
        description: 'Rounds a number to the nearest integer or to the nearest multiple of significance',
        abstract: 'Rounds a number to the nearest integer or to the nearest multiple of significance',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value you want to round.' },
            significance: { name: 'significance', detail: 'The multiple to which you want to round.' },
        },
    },
    CEILING_MATH: {
        description: 'Rounds a number up, to the nearest integer or to the nearest multiple of significance',
        abstract: 'Rounds a number up, to the nearest integer or to the nearest multiple of significance',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value you want to round.' },
            significance: { name: 'significance', detail: 'The multiple to which you want to round.' },
            mode: { name: 'mode', detail: 'For negative numbers, controls whether Number is rounded toward or away from zero.' },
        },
    },
    CEILING_PRECISE: {
        description: 'Rounds a number the nearest integer or to the nearest multiple of significance. Regardless of the sign of the number, the number is rounded up.',
        abstract: 'Rounds a number the nearest integer or to the nearest multiple of significance. Regardless of the sign of the number, the number is rounded up.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value you want to round.' },
            significance: { name: 'significance', detail: 'The multiple to which you want to round.' },
        },
    },
    COMBIN: {
        description: 'Returns the number of combinations for a given number of objects',
        abstract: 'Returns the number of combinations for a given number of objects',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number of items.' },
            numberChosen: { name: 'number_chosen', detail: 'The number of items in each combination.' },
        },
    },
    COMBINA: {
        description: 'Returns the number of combinations with repetitions for a given number of items',
        abstract: 'Returns the number of combinations with repetitions for a given number of items',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number of items.' },
            numberChosen: { name: 'number_chosen', detail: 'The number of items in each combination.' },
        },
    },
    COS: {
        description: 'Returns the cosine of a number.',
        abstract: 'Returns the cosine of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The angle in radians for which you want the cosine.' },
        },
    },
    COSH: {
        description: 'Returns the hyperbolic cosine of a number',
        abstract: 'Returns the hyperbolic cosine of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Any real number for which you want to find the hyperbolic cosine.' },
        },
    },
    COT: {
        description: 'Returns the cotangent of an angle',
        abstract: 'Returns the cotangent of an angle',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The angle in radians for which you want the cotangent.' },
        },
    },
    COTH: {
        description: 'Returns the hyperbolic cotangent of a number',
        abstract: 'Returns the hyperbolic cotangent of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Any real number for which you want to find the hyperbolic cotangent.' },
        },
    },
    CSC: {
        description: 'Returns the cosecant of an angle',
        abstract: 'Returns the cosecant of an angle',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The angle in radians for which you want the cosecant.' },
        },
    },
    CSCH: {
        description: 'Returns the hyperbolic cosecant of an angle',
        abstract: 'Returns the hyperbolic cosecant of an angle',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The angle in radians for which you want the hyperbolic cosecant.' },
        },
    },
    DECIMAL: {
        description: 'Converts a text representation of a number in a given base into a decimal number',
        abstract: 'Converts a text representation of a number in a given base into a decimal number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'The string length of Text must be less than or equal to 255 characters.' },
            radix: { name: 'radix', detail: 'The base radix that you want to convert the number into. Must be an integer greater than or equal to 2 and less than or equal to 36.' },
        },
    },
    DEGREES: {
        description: 'Converts radians to degrees',
        abstract: 'Converts radians to degrees',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'The angle in radians that you want to convert.' },
        },
    },
    EVEN: {
        description: 'Rounds a number up to the nearest even integer',
        abstract: 'Rounds a number up to the nearest even integer',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value to round.' },
        },
    },
    EXP: {
        description: 'Returns e raised to the power of a given number',
        abstract: 'Returns e raised to the power of a given number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The exponent applied to the base e.' },
        },
    },
    FACT: {
        description: 'Returns the factorial of a number',
        abstract: 'Returns the factorial of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The nonnegative number for which you want the factorial. If number is not an integer, it is truncated.' },
        },
    },
    FACTDOUBLE: {
        description: 'Returns the double factorial of a number',
        abstract: 'Returns the double factorial of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The nonnegative number for which you want the double factorial. If number is not an integer, it is truncated.' },
        },
    },
    FLOOR: {
        description: 'Rounds a number down, toward zero',
        abstract: 'Rounds a number down, toward zero',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value you want to round.' },
            significance: { name: 'significance', detail: 'The multiple to which you want to round.' },
        },
    },
    FLOOR_MATH: {
        description: 'Rounds a number down, to the nearest integer or to the nearest multiple of significance',
        abstract: 'Rounds a number down, to the nearest integer or to the nearest multiple of significance',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value you want to round.' },
            significance: { name: 'significance', detail: 'The multiple to which you want to round.' },
            mode: { name: 'mode', detail: 'For negative numbers, controls whether Number is rounded toward or away from zero.' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Rounds a number down to the nearest integer or to the nearest multiple of significance. Regardless of the sign of the number, the number is rounded down.',
        abstract: 'Rounds a number down to the nearest integer or to the nearest multiple of significance.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value you want to round.' },
            significance: { name: 'significance', detail: 'The multiple to which you want to round.' },
        },
    },
    GCD: {
        description: 'Returns the greatest common divisor',
        abstract: 'Returns the greatest common divisor',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'To find the first number of the greatest common divisor, you can also use a single array or a reference to an array instead of the comma-separated parameters.' },
            number2: { name: 'number2', detail: 'The second number whose greatest common divisor is to be found. Up to 255 numbers can be specified in this way.' },
        },
    },
    INT: {
        description: 'Rounds a number down to the nearest integer',
        abstract: 'Rounds a number down to the nearest integer',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The real number you want to round down to an integer.' },
        },
    },
    ISO_CEILING: {
        description: 'Returns a number that is rounded up to the nearest integer or to the nearest multiple of significance',
        abstract: 'Returns a number that is rounded up to the nearest integer or to the nearest multiple of significance',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value you want to round.' },
            significance: { name: 'significance', detail: 'The multiple to which you want to round.' },
        },
    },
    LCM: {
        description: 'Returns the least common multiple',
        abstract: 'Returns the least common multiple',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'To find the first number of the least common multiple, you can also use a single array or a reference to an array instead of the comma-separated parameters.' },
            number2: { name: 'number2', detail: 'The second number whose least common multiple is to be found. Up to 255 numbers can be specified in this way.' },
        },
    },
    LN: {
        description: 'Returns the natural logarithm of a number',
        abstract: 'Returns the natural logarithm of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The positive real number for which you want the natural logarithm.' },
        },
    },
    LOG: {
        description: 'Returns the logarithm of a number to a specified base',
        abstract: 'Returns the logarithm of a number to a specified base',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The positive real number for which you want the logarithm.' },
            base: { name: 'base', detail: 'The base of the logarithm. If base is omitted, it is assumed to be 10.' },
        },
    },
    LOG10: {
        description: 'Returns the base-10 logarithm of a number',
        abstract: 'Returns the base-10 logarithm of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The positive real number for which you want the base-10 logarithm.' },
        },
    },
    MDETERM: {
        description: 'Returns the matrix determinant of an array',
        abstract: 'Returns the matrix determinant of an array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A numeric array with an equal number of rows and columns.' },
        },
    },
    MINVERSE: {
        description: 'Returns the matrix inverse of an array',
        abstract: 'Returns the matrix inverse of an array',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A numeric array with an equal number of rows and columns.' },
        },
    },
    MMULT: {
        description: 'Returns the matrix product of two arrays',
        abstract: 'Returns the matrix product of two arrays',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'The arrays you want to multiply.' },
            array2: { name: 'array2', detail: 'The arrays you want to multiply.' },
        },
    },
    MOD: {
        description: 'Returns the remainder after number is divided by divisor. The result has the same sign as divisor.',
        abstract: 'Returns the remainder from division',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number for which you want to find the remainder.' },
            divisor: { name: 'divisor', detail: 'The number by which you want to divide number' },
        },
    },
    MROUND: {
        description: 'Returns a number rounded to the desired multiple',
        abstract: 'Returns a number rounded to the desired multiple',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value to round.' },
            multiple: { name: 'multiple', detail: 'The multiple to which you want to round number.' },
        },
    },
    MULTINOMIAL: {
        description: 'Returns the multinomial of a set of numbers',
        abstract: 'Returns the multinomial of a set of numbers',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first value or range to use in the calculation.' },
            number2: { name: 'number2', detail: 'Additional values ​​or ranges to use in calculations.' },
        },
    },
    MUNIT: {
        description: 'Returns the unit matrix or the specified dimension',
        abstract: 'Returns the unit matrix or the specified dimension',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'dimension', detail: 'Dimension is an integer specifying the dimension of the unit matrix that you want to return. It returns an array. The dimension has to be greater than zero.' },
        },
    },
    ODD: {
        description: 'Rounds a number up to the nearest odd integer',
        abstract: 'Rounds a number up to the nearest odd integer',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The value to round.' },
        },
    },
    PI: {
        description: 'Returns the value of pi',
        abstract: 'Returns the value of pi',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'Returns the result of a number raised to a power.',
        abstract: 'Returns the result of a number raised to a power',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The base number. It can be any real number.' },
            power: { name: 'power', detail: 'The exponent to which the base number is raised.' },
        },
    },
    PRODUCT: {
        description: 'Multiplies all the numbers given as arguments and returns the product.',
        abstract: 'Multiplies its arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'The first number or range that you want to multiply.' },
            number2: { name: 'number2', detail: 'Additional numbers or ranges that you want to multiply, up to a maximum of 255 arguments.' },
        },
    },
    QUOTIENT: {
        description: 'Returns the integer portion of a division',
        abstract: 'Returns the integer portion of a division',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'numerator', detail: 'The dividend.' },
            denominator: { name: 'denominator', detail: 'The divisor.' },
        },
    },
    RADIANS: {
        description: 'Converts degrees to radians',
        abstract: 'Converts degrees to radians',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'An angle in degrees that you want to convert.' },
        },
    },
    RAND: {
        description: 'Returns a random number between 0 and 1',
        abstract: 'Returns a random number between 0 and 1',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'Returns an array of random numbers between 0 and 1. However, you can specify the number of rows and columns to fill, minimum and maximum values, and whether to return whole numbers or decimal values.',
        abstract: 'Returns an array of random numbers between 0 and 1.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'The number of rows to be returned' },
            columns: { name: 'columns', detail: 'The number of columns to be returned' },
            min: { name: 'min', detail: 'The minimum number you would like returned' },
            max: { name: 'max', detail: 'The maximum number you would like returned' },
            wholeNumber: { name: 'whole_number', detail: 'Return a whole number or a decimal value' },
        },
    },
    RANDBETWEEN: {
        description: 'Returns a random number between the numbers you specify',
        abstract: 'Returns a random number between the numbers you specify',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'bottom', detail: 'The smallest integer RANDBETWEEN will return.' },
            top: { name: 'top', detail: 'The largest integer RANDBETWEEN will return.' },
        },
    },
    ROMAN: {
        description: 'Converts an Arabic numeral to Roman, as text',
        abstract: 'Converts an Arabic numeral to Roman, as text',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The Arabic numeral you want converted.' },
            form: { name: 'form', detail: 'A number specifying the type of roman numeral you want. The roman numeral style ranges from Classic to Simplified, becoming more concise as the value of form increases.' },
        },
    },
    ROUND: {
        description: 'Rounds a number to a specified number of digits',
        abstract: 'Rounds a number to a specified number of digits',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number that you want to round.' },
            numDigits: { name: 'num_digits', detail: 'The number of digits to which you want to round the number argument.' },
        },
    },
    ROUNDBANK: {
        description: 'Rounds a number in banker\'s rounding',
        abstract: 'Rounds a number in banker\'s rounding',
        links: [
            {
                title: 'Instruction',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number that you want to round in banker\'s rounding.' },
            numDigits: { name: 'num_digits', detail: 'The number of digits to which you want to round in banker\'s rounding.' },
        },
    },
    ROUNDDOWN: {
        description: 'Rounds a number down, toward zero',
        abstract: 'Rounds a number down, toward zero',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number that you want to round.' },
            numDigits: { name: 'num_digits', detail: 'The number of digits to which you want to round the number argument.' },
        },
    },
    ROUNDUP: {
        description: 'Rounds a number up, away from zero',
        abstract: 'Rounds a number up, away from zero',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number that you want to round.' },
            numDigits: { name: 'num_digits', detail: 'The number of digits to which you want to round the number argument.' },
        },
    },
    SEC: {
        description: 'Returns the secant of an angle',
        abstract: 'Returns the secant of an angle',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Number is the angle in radians for which you want the secant.' },
        },
    },
    SECH: {
        description: 'Returns the hyperbolic secant of an angle',
        abstract: 'Returns the hyperbolic secant of an angle',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Number is the angle in radians for which you want the hyperbolic secant.' },
        },
    },
    SERIESSUM: {
        description: 'Returns the sum of a power series based on the formula',
        abstract: 'Returns the sum of a power series based on the formula',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'The input value to the power series.' },
            n: { name: 'n', detail: 'The initial power to which you want to raise x.' },
            m: { name: 'm', detail: 'The step by which to increase n for each term in the series.' },
            coefficients: { name: 'coefficients', detail: 'A set of coefficients by which each successive power of x is multiplied.' },
        },
    },
    SEQUENCE: {
        description: 'Generates a list of sequential numbers in an array, such as 1, 2, 3, 4',
        abstract: 'Generates a list of sequential numbers in an array, such as 1, 2, 3, 4',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'The number of rows to return.' },
            columns: { name: 'columns', detail: 'The number of columns to return.' },
            start: { name: 'start', detail: 'The first number in the sequence.' },
            step: { name: 'step', detail: 'The amount to increment each subsequent value in the array.' },
        },
    },
    SIGN: {
        description: 'Returns the sign of a number',
        abstract: 'Returns the sign of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Any real number.' },
        },
    },
    SIN: {
        description: 'Returns the sine of the given angle',
        abstract: 'Returns the sine of the given angle',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The angle in radians for which you want the sine.' },
        },
    },
    SINH: {
        description: 'Returns the hyperbolic sine of a number',
        abstract: 'Returns the hyperbolic sine of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Any real number.' },
        },
    },
    SQRT: {
        description: 'Returns a positive square root',
        abstract: 'Returns a positive square root',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number for which you want the square root.' },
        },
    },
    SQRTPI: {
        description: 'Returns the square root of (number * pi)',
        abstract: 'Returns the square root of (number * pi)',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number by which pi is multiplied.' },
        },
    },
    SUBTOTAL: {
        description: 'Returns a subtotal in a list or database.',
        abstract: 'Returns a subtotal in a list or database',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'The number 1-11 or 101-111 that specifies the function to use for the subtotal. 1-11 includes manually-hidden rows, while 101-111 excludes them; filtered-out cells are always excluded.' },
            ref1: { name: 'ref1', detail: 'The first named range or reference for which you want the subtotal.' },
            ref2: { name: 'ref2', detail: 'Named ranges or references 2 to 254 for which you want the subtotal.' },
        },
    },
    SUM: {
        description: 'You can add individual values, cell references or ranges or a mix of all three.',
        abstract: 'Adds its arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'Number 1',
                detail: 'The first number you want to add. The number can be like 4, a cell reference like B6, or a cell range like B2:B8.',
            },
            number2: {
                name: 'Number 2',
                detail: 'This is the second number you want to add. You can specify up to 255 numbers in this way.',
            },
        },
    },
    SUMIF: {
        description: 'Sum the values in a range that meet criteria that you specify.',
        abstract: 'Adds the cells specified by a given criteria',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: {
                name: 'range',
                detail: 'The range of cells that you want evaluated by criteria.',
            },
            criteria: {
                name: 'criteria',
                detail: 'The criteria in the form of a number, expression, a cell reference, text, or a function that defines which cells will be added. Wildcard characters can be included - a question mark (?) to match any single character, an asterisk (*) to match any sequence of characters. If you want to find an actual question mark or asterisk, type a tilde (~) preceding the character.',
            },
            sumRange: {
                name: 'sum_range',
                detail: 'The actual cells to add, if you want to add cells other than those specified in the range argument. If the sum_range argument is omitted, Excel adds the cells that are specified in the range argument (the same cells to which the criteria is applied).',
            },
        },
    },
    SUMIFS: {
        description: 'Adds all of its arguments that meet multiple criteria.',
        abstract: 'Adds all of its arguments that meet multiple criteria.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'sum_range', detail: 'The range of cells to sum.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'The range that is tested using criteria1. criteria_range1 and criteria1 set up a search pair whereby a range is searched for specific criteria. Once items in the range are found, their corresponding values in sum_range are added.' },
            criteria1: { name: 'criteria1', detail: 'The criteria that defines which cells in criteria_range1 will be added. For example, criteria can be entered as 32, ">32", B4, "apples", or "32".' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Additional ranges. You can enter up to 127 range pairs.' },
            criteria2: { name: 'criteria2', detail: 'Additional associated criteria. You can enter up to 127 criteria pairs.' },
        },
    },
    SUMPRODUCT: {
        description: 'Returns the sum of the products of corresponding array components',
        abstract: 'Returns the sum of the products of corresponding array components',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'The first array argument whose components you want to multiply and then add.' },
            array2: { name: 'array', detail: 'Array arguments 2 to 255 whose components you want to multiply and then add.' },
        },
    },
    SUMSQ: {
        description: 'Returns the sum of the squares of the arguments',
        abstract: 'Returns the sum of the squares of the arguments',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'To square and find the first number, you can also use a single array or a reference to an array instead of comma-separated parameters.' },
            number2: { name: 'number2', detail: 'The second number to be squared and summed. Up to 255 numbers can be specified in this way.' },
        },
    },
    SUMX2MY2: {
        description: 'Returns the sum of the difference of squares of corresponding values in two arrays',
        abstract: 'Returns the sum of the difference of squares of corresponding values in two arrays',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'The first array or range of values.' },
            arrayY: { name: 'array_y', detail: 'The second array or range of values.' },
        },
    },
    SUMX2PY2: {
        description: 'Returns the sum of the sum of squares of corresponding values in two arrays',
        abstract: 'Returns the sum of the sum of squares of corresponding values in two arrays',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'The first array or range of values.' },
            arrayY: { name: 'array_y', detail: 'The second array or range of values.' },
        },
    },
    SUMXMY2: {
        description: 'Returns the sum of squares of differences of corresponding values in two arrays',
        abstract: 'Returns the sum of squares of differences of corresponding values in two arrays',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'The first array or range of values.' },
            arrayY: { name: 'array_y', detail: 'The second array or range of values.' },
        },
    },
    TAN: {
        description: 'Returns the tangent of a number.',
        abstract: 'Returns the tangent of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The angle in radians for which you want the tangent.' },
        },
    },
    TANH: {
        description: 'Returns the hyperbolic tangent of a number.',
        abstract: 'Returns the hyperbolic tangent of a number',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Any real number.' },
        },
    },
    TRUNC: {
        description: 'Truncates a number to an integer',
        abstract: 'Truncates a number to an integer',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'The number you want to truncate.' },
            numDigits: { name: 'num_digits', detail: 'A number specifying the precision of the truncation. The default value for num_digits is 0 (zero).' },
        },
    },
};

export default locale;
