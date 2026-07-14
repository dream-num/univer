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

import type enUS from './en-US';

const locale: typeof enUS = {
    ABS: {
        description: 'Retorna el valor absolut d\'un nombre. El valor absolut d\'un nombre és el nombre sense el seu signe.',
        abstract: 'Retorna el valor absolut d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre real del qual voleu obtenir el valor absolut.' },
        },
    },
    ACOS: {
        description: 'Retorna l\'arccosinus, o cosinus invers, d\'un nombre. L\'arccosinus és l\'angle el cosinus del qual és el nombre. L\'angle retornat es dóna en radians en el rang de 0 (zero) a pi.',
        abstract: 'Retorna l\'arccosinus d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El cosinus de l\'angle que voleu i ha d\'estar entre -1 i 1.' },
        },
    },
    ACOSH: {
        description: 'Retorna el cosinus hiperbòlic invers d\'un nombre. El nombre ha de ser més gran o igual a 1. El cosinus hiperbòlic invers és el valor el cosinus hiperbòlic del qual és el nombre, de manera que ACOSH(COSH(nombre)) és igual a nombre.',
        abstract: 'Retorna el cosinus hiperbòlic invers d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real igual o superior a 1.' },
        },
    },
    ACOT: {
        description: 'Retorna el valor principal de l\'arccotangent, o cotangent inversa, d\'un nombre.',
        abstract: 'Retorna l\'arccotangent d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: {
                name: 'nombre',
                detail: 'El nombre és la cotangent de l\'angle que voleu. Ha de ser un nombre real.',
            },
        },
    },
    ACOTH: {
        description: 'Retorna l\'arccotangent hiperbòlica d\'un nombre',
        abstract: 'Retorna l\'arccotangent hiperbòlica d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor absolut del Nombre ha de ser més gran que 1.' },
        },
    },
    AGGREGATE: {
        description: 'Retorna un agregat en una llista o base de dades',
        abstract: 'Retorna un agregat en una llista o base de dades',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'núm_función', detail: 'Un número de 1 a 19 que especifica la función que se usará.' },
            options: { name: 'opciones', detail: 'Un valor numérico que determina qué valores del rango de evaluación de la función se omitirán.' },
            ref1: { name: 'ref1', detail: 'El primer argumento numérico para las funciones que tienen varios argumentos numéricos de los que desea obtener el valor agregado.' },
            ref2: { name: 'ref2', detail: 'Argumentos numéricos 2 a 252 cuyo valor agregado desea obtener.' },
        },
    },
    ARABIC: {
        description: 'Converteix un nombre romà a aràbic, com a nombre',
        abstract: 'Converteix un nombre romà a aràbic, com a nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Una cadena entre cometes, una cadena buida (""), o una referència a una cel·la que conté text.' },
        },
    },
    ASIN: {
        description: 'Retorna l\'arcsinus d\'un nombre.',
        abstract: 'Retorna l\'arcsinus d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El sinus de l\'angle que voleu i ha d\'estar entre -1 i 1.' },
        },
    },
    ASINH: {
        description: 'Retorna el sinus hiperbòlic invers d\'un nombre.',
        abstract: 'Retorna el sinus hiperbòlic invers d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real.' },
        },
    },
    ATAN: {
        description: 'Retorna l\'arctangent d\'un nombre.',
        abstract: 'Retorna l\'arctangent d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'La tangent de l\'angle que voleu.' },
        },
    },
    ATAN2: {
        description: 'Retorna l\'arctangent de les coordenades x i y.',
        abstract: 'Retorna l\'arctangent de les coordenades x i y',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_núm', detail: 'La coordenada x del punt.' },
            yNum: { name: 'y_núm', detail: 'La coordenada y del punt.' },
        },
    },
    ATANH: {
        description: 'Retorna la tangent hiperbòlica inversa d\'un nombre.',
        abstract: 'Retorna la tangent hiperbòlica inversa d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real entre 1 i -1.' },
        },
    },
    BASE: {
        description: 'Converteix un nombre en una representació de text amb la base donada (arrel)',
        abstract: 'Converteix un nombre en una representació de text amb la base donada (arrel)',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu convertir. Ha de ser un enter major o igual a 0 i menor que 2^53.' },
            radix: { name: 'base', detail: 'La base a la qual voleu convertir el nombre. Ha de ser un enter major o igual a 2 i menor o igual a 36.' },
            minLength: { name: 'longitud_mínima', detail: 'La longitud mínima de la cadena retornada. Ha de ser un enter major o igual a 0.' },
        },
    },
    CEILING: {
        description: 'Arrodoneix un nombre a l\'enter més proper o al múltiple més proper de la xifra significativa',
        abstract: 'Arrodoneix un nombre a l\'enter més proper o al múltiple més proper de la xifra significativa',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
        },
    },
    CEILING_MATH: {
        description: 'Arrodoneix un nombre cap amunt, a l\'enter més proper o al múltiple més proper de la xifra significativa',
        abstract: 'Arrodoneix un nombre cap amunt, a l\'enter més proper o al múltiple més proper de la xifra significativa',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
            mode: { name: 'mode', detail: 'Per a nombres negatius, controla si el Nombre s\'arrodoneix cap a zero o en direcció contrària a zero.' },
        },
    },
    CEILING_PRECISE: {
        description: 'Arrodoneix un nombre a l\'enter més proper o al múltiple més proper de la xifra significativa. Independentment del signe del nombre, el nombre s\'arrodoneix cap amunt.',
        abstract: 'Arrodoneix un nombre a l\'enter més proper o al múltiple més proper de la xifra significativa. Independentment del signe del nombre, el nombre s\'arrodoneix cap amunt.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
        },
    },
    COMBIN: {
        description: 'Retorna el nombre de combinacions per a un nombre donat d\'objectes',
        abstract: 'Retorna el nombre de combinacions per a un nombre donat d\'objectes',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre d\'elements.' },
            numberChosen: { name: 'nombre_triat', detail: 'El nombre d\'elements en cada combinació.' },
        },
    },
    COMBINA: {
        description: 'Retorna el nombre de combinacions amb repeticions per a un nombre donat d\'elements',
        abstract: 'Retorna el nombre de combinacions amb repeticions per a un nombre donat d\'elements',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre d\'elements.' },
            numberChosen: { name: 'nombre_triat', detail: 'El nombre d\'elements en cada combinació.' },
        },
    },
    COS: {
        description: 'Retorna el cosinus d\'un nombre.',
        abstract: 'Retorna el cosinus d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'angle en radians del qual voleu el cosinus.' },
        },
    },
    COSH: {
        description: 'Retorna el cosinus hiperbòlic d\'un nombre',
        abstract: 'Retorna el cosinus hiperbòlic d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real del qual vulgueu trobar el cosinus hiperbòlic.' },
        },
    },
    COT: {
        description: 'Retorna la cotangent d\'un angle',
        abstract: 'Retorna la cotangent d\'un angle',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'angle en radians del qual voleu la cotangent.' },
        },
    },
    COTH: {
        description: 'Retorna la cotangent hiperbòlica d\'un nombre',
        abstract: 'Retorna la cotangent hiperbòlica d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real del qual vulgueu trobar la cotangent hiperbòlica.' },
        },
    },
    CSC: {
        description: 'Retorna la cosecant d\'un angle',
        abstract: 'Retorna la cosecant d\'un angle',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'angle en radians del qual voleu la cosecant.' },
        },
    },
    CSCH: {
        description: 'Retorna la cosecant hiperbòlica d\'un angle',
        abstract: 'Retorna la cosecant hiperbòlica d\'un angle',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'angle en radians del qual voleu la cosecant hiperbòlica.' },
        },
    },
    DECIMAL: {
        description: 'Converteix una representació de text d\'un nombre en una base donada en un nombre decimal',
        abstract: 'Converteix una representació de text d\'un nombre en una base donada en un nombre decimal',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'La longitud de la cadena de Text ha de ser menor o igual a 255 caràcters.' },
            radix: { name: 'base', detail: 'La base a la qual voleu convertir el nombre. Ha de ser un enter major o igual a 2 i menor o igual a 36.' },
        },
    },
    DEGREES: {
        description: 'Converteix radians a graus',
        abstract: 'Converteix radians a graus',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'L\'angle en radians que voleu convertir.' },
        },
    },
    EVEN: {
        description: 'Arrodoneix un nombre cap amunt a l\'enter parell més proper',
        abstract: 'Arrodoneix un nombre cap amunt a l\'enter parell més proper',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor a arrodonir.' },
        },
    },
    EXP: {
        description: 'Retorna e elevat a la potència d\'un nombre donat',
        abstract: 'Retorna e elevat a la potència d\'un nombre donat',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'exponent aplicat a la base e.' },
        },
    },
    FACT: {
        description: 'Retorna el factorial d\'un nombre',
        abstract: 'Retorna el factorial d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre no negatiu del qual voleu el factorial. Si el nombre no és un enter, es trunca.' },
        },
    },
    FACTDOUBLE: {
        description: 'Retorna el doble factorial d\'un nombre',
        abstract: 'Retorna el doble factorial d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre no negatiu del qual voleu el doble factorial. Si el nombre no és un enter, es trunca.' },
        },
    },
    FLOOR: {
        description: 'Arrodoneix un nombre cap avall, cap a zero',
        abstract: 'Arrodoneix un nombre cap avall, cap a zero',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
        },
    },
    FLOOR_MATH: {
        description: 'Arrodoneix un nombre cap avall, a l\'enter més proper o al múltiple més proper de la xifra significativa',
        abstract: 'Arrodoneix un nombre cap avall, a l\'enter més proper o al múltiple més proper de la xifra significativa',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
            mode: { name: 'mode', detail: 'Per a nombres negatius, controla si el Nombre s\'arrodoneix cap a zero o en direcció contrària a zero.' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Arrodoneix un nombre cap avall a l\'enter més proper o al múltiple més proper de la xifra significativa. Independentment del signe del nombre, el nombre s\'arrodoneix cap avall.',
        abstract: 'Arrodoneix un nombre cap avall a l\'enter més proper o al múltiple més proper de la xifra significativa.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
        },
    },
    GCD: {
        description: 'Retorna el màxim comú divisor',
        abstract: 'Retorna el màxim comú divisor',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'Per trobar el primer nombre del màxim comú divisor, també podeu utilitzar una sola matriu o una referència a una matriu en lloc dels paràmetres separats per comes.' },
            number2: { name: 'nombre2', detail: 'El segon nombre del qual s\'ha de trobar el màxim comú divisor. Es poden especificar fins a 255 nombres d\'aquesta manera.' },
        },
    },
    INT: {
        description: 'Arrodoneix un nombre cap avall a l\'enter més proper',
        abstract: 'Arrodoneix un nombre cap avall a l\'enter més proper',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre real que voleu arrodonir cap avall a un enter.' },
        },
    },
    ISO_CEILING: {
        description: 'Retorna un nombre que s\'arrodoneix cap amunt a l\'enter més proper o al múltiple més proper de la xifra significativa',
        abstract: 'Retorna un nombre que s\'arrodoneix cap amunt a l\'enter més proper o al múltiple més proper de la xifra significativa',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
        },
    },
    LCM: {
        description: 'Retorna el mínim comú múltiple',
        abstract: 'Retorna el mínim comú múltiple',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'Per trobar el primer nombre del mínim comú múltiple, també podeu utilitzar una sola matriu o una referència a una matriu en lloc dels paràmetres separats per comes.' },
            number2: { name: 'nombre2', detail: 'El segon nombre del qual s\'ha de trobar el mínim comú múltiple. Es poden especificar fins a 255 nombres d\'aquesta manera.' },
        },
    },
    LN: {
        description: 'Retorna el logaritme natural d\'un nombre',
        abstract: 'Retorna el logaritme natural d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre real positiu del qual voleu el logaritme natural.' },
        },
    },
    LOG: {
        description: 'Retorna el logaritme d\'un nombre en una base especificada',
        abstract: 'Retorna el logaritme d\'un nombre en una base especificada',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre real positiu del qual voleu el logaritme.' },
            base: { name: 'base', detail: 'La base del logaritme. Si s\'omet la base, s\'assumeix que és 10.' },
        },
    },
    LOG10: {
        description: 'Retorna el logaritme en base 10 d\'un nombre',
        abstract: 'Retorna el logaritme en base 10 d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre real positiu del qual voleu el logaritme en base 10.' },
        },
    },
    MDETERM: {
        description: 'Retorna el determinant matricial d\'una matriu',
        abstract: 'Retorna el determinant matricial d\'una matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'Una matriu numèrica amb un nombre igual de files i columnes.' },
        },
    },
    MINVERSE: {
        description: 'Retorna la matriu inversa d\'una matriu',
        abstract: 'Retorna la matriu inversa d\'una matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'Una matriu numèrica amb un nombre igual de files i columnes.' },
        },
    },
    MMULT: {
        description: 'Retorna el producte matricial de dues matrius',
        abstract: 'Retorna el producte matricial de dues matrius',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'Les matrius que voleu multiplicar.' },
            array2: { name: 'matriu2', detail: 'Les matrius que voleu multiplicar.' },
        },
    },
    MOD: {
        description: 'Retorna el residu després que el nombre es divideixi pel divisor. El resultat té el mateix signe que el divisor.',
        abstract: 'Retorna el residu de la divisió',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre del qual voleu trobar el residu.' },
            divisor: { name: 'divisor', detail: 'El nombre pel qual voleu dividir el nombre.' },
        },
    },
    MROUND: {
        description: 'Retorna un nombre arrodonit al múltiple desitjat',
        abstract: 'Retorna un nombre arrodonit al múltiple desitjat',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor a arrodonir.' },
            multiple: { name: 'múltiple', detail: 'El múltiple al qual voleu arrodonir el nombre.' },
        },
    },
    MULTINOMIAL: {
        description: 'Retorna el multinomial d\'un conjunt de nombres',
        abstract: 'Retorna el multinomial d\'un conjunt de nombres',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer valor o rang a utilitzar en el càlcul.' },
            number2: { name: 'nombre2', detail: 'Valors o rangs addicionals a utilitzar en els càlculs.' },
        },
    },
    MUNIT: {
        description: 'Retorna la matriu unitària o la dimensió especificada',
        abstract: 'Retorna la matriu unitària o la dimensió especificada',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'dimensió', detail: 'Dimensió és un enter que especifica la dimensió de la matriu unitària que voleu retornar. Retorna una matriu. La dimensió ha de ser més gran que zero.' },
        },
    },
    ODD: {
        description: 'Arrodoneix un nombre cap amunt a l\'enter senar més proper',
        abstract: 'Arrodoneix un nombre cap amunt a l\'enter senar més proper',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor a arrodonir.' },
        },
    },
    PI: {
        description: 'Retorna el valor de pi',
        abstract: 'Retorna el valor de pi',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'Retorna el resultat d\'un nombre elevat a una potència.',
        abstract: 'Retorna el resultat d\'un nombre elevat a una potència',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre base. Pot ser qualsevol nombre real.' },
            power: { name: 'potència', detail: 'L\'exponent al qual s\'eleva el nombre base.' },
        },
    },
    PRODUCT: {
        description: 'Multiplica tots els nombres donats com a arguments i retorna el producte.',
        abstract: 'Multiplica els seus arguments',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre o rang que voleu multiplicar.' },
            number2: { name: 'nombre2', detail: 'Nombres o rangs addicionals que voleu multiplicar, fins a un màxim de 255 arguments.' },
        },
    },
    QUOTIENT: {
        description: 'Retorna la part entera d\'una divisió',
        abstract: 'Retorna la part entera d\'una divisió',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'numerador', detail: 'El dividend.' },
            denominator: { name: 'denominador', detail: 'El divisor.' },
        },
    },
    RADIANS: {
        description: 'Converteix graus a radians',
        abstract: 'Converteix graus a radians',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Un angle en graus que voleu convertir.' },
        },
    },
    RAND: {
        description: 'Retorna un nombre aleatori entre 0 i 1',
        abstract: 'Retorna un nombre aleatori entre 0 i 1',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'Retorna una matriu de nombres aleatoris entre 0 i 1. Tanmateix, podeu especificar el nombre de files i columnes a omplir, els valors mínims i màxims, i si es retornen nombres enters o valors decimals.',
        abstract: 'Retorna una matriu de nombres aleatoris entre 0 i 1.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'files', detail: 'El nombre de files que es retornaran' },
            columns: { name: 'columnes', detail: 'El nombre de columnes que es retornaran' },
            min: { name: 'min', detail: 'El nombre mínim que us agradaria que es retornés' },
            max: { name: 'max', detail: 'El nombre màxim que us agradaria que es retornés' },
            wholeNumber: { name: 'nombre_sencer', detail: 'Retornar un nombre sencer o un valor decimal' },
        },
    },
    RANDBETWEEN: {
        description: 'Retorna un nombre aleatori entre els nombres que especifiqueu',
        abstract: 'Retorna un nombre aleatori entre els nombres que especifiqueu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'inferior', detail: 'L\'enter més petit que retornarà RANDBETWEEN.' },
            top: { name: 'superior', detail: 'L\'enter més gran que retornarà RANDBETWEEN.' },
        },
    },
    ROMAN: {
        description: 'Converteix un nombre aràbic a romà, com a text',
        abstract: 'Converteix un nombre aràbic a romà, com a text',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre aràbic que voleu convertir.' },
            form: { name: 'forma', detail: 'Un nombre que especifica el tipus de nombre romà que voleu. L\'estil del nombre romà varia de Clàssic a Simplificat, tornant-se més concís a mesura que augmenta el valor de la forma.' },
        },
    },
    ROUND: {
        description: 'Arrodoneix un nombre a un nombre especificat de dígits',
        abstract: 'Arrodoneix un nombre a un nombre especificat de dígits',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu arrodonir.' },
            numDigits: { name: 'núm_dígits', detail: 'El nombre de dígits al qual voleu arrodonir l\'argument del nombre.' },
        },
    },
    ROUNDBANK: {
        description: 'Arrodoneix un nombre amb arrodoniment bancari',
        abstract: 'Arrodoneix un nombre amb arrodoniment bancari',
        links: [
            {
                title: 'Instrucció',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu arrodonir amb arrodoniment bancari.' },
            numDigits: { name: 'núm_dígits', detail: 'El nombre de dígits al qual voleu arrodonir amb arrodoniment bancari.' },
        },
    },
    ROUNDDOWN: {
        description: 'Arrodoneix un nombre cap avall, cap a zero',
        abstract: 'Arrodoneix un nombre cap avall, cap a zero',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu arrodonir.' },
            numDigits: { name: 'núm_dígits', detail: 'El nombre de dígits al qual voleu arrodonir l\'argument del nombre.' },
        },
    },
    ROUNDUP: {
        description: 'Arrodoneix un nombre cap amunt, en direcció contrària a zero',
        abstract: 'Arrodoneix un nombre cap amunt, en direcció contrària a zero',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu arrodonir.' },
            numDigits: { name: 'núm_dígits', detail: 'El nombre de dígits al qual voleu arrodonir l\'argument del nombre.' },
        },
    },
    SEC: {
        description: 'Retorna la secant d\'un angle',
        abstract: 'Retorna la secant d\'un angle',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre és l\'angle en radians del qual voleu la secant.' },
        },
    },
    SECH: {
        description: 'Retorna la secant hiperbòlica d\'un angle',
        abstract: 'Retorna la secant hiperbòlica d\'un angle',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre és l\'angle en radians del qual voleu la secant hiperbòlica.' },
        },
    },
    SERIESSUM: {
        description: 'Retorna la suma d\'una sèrie de potències basada en la fórmula',
        abstract: 'Retorna la suma d\'una sèrie de potències basada en la fórmula',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor d\'entrada a la sèrie de potències.' },
            n: { name: 'n', detail: 'La potència inicial a la qual voleu elevar x.' },
            m: { name: 'm', detail: 'El pas pel qual augmentar n per a cada terme de la sèrie.' },
            coefficients: { name: 'coeficients', detail: 'Un conjunt de coeficients pels quals es multiplica cada potència successiva de x.' },
        },
    },
    SEQUENCE: {
        description: 'Genera una llista de nombres seqüencials en una matriu, com 1, 2, 3, 4',
        abstract: 'Genera una llista de nombres seqüencials en una matriu, com 1, 2, 3, 4',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'files', detail: 'El nombre de files a retornar.' },
            columns: { name: 'columnes', detail: 'El nombre de columnes a retornar.' },
            start: { name: 'inici', detail: 'El primer nombre de la seqüència.' },
            step: { name: 'pas', detail: 'La quantitat a incrementar cada valor subsegüent a la matriu.' },
        },
    },
    SIGN: {
        description: 'Retorna el signe d\'un nombre',
        abstract: 'Retorna el signe d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real.' },
        },
    },
    SIN: {
        description: 'Retorna el sinus de l\'angle donat',
        abstract: 'Retorna el sinus de l\'angle donat',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'angle en radians del qual voleu el sinus.' },
        },
    },
    SINH: {
        description: 'Retorna el sinus hiperbòlic d\'un nombre',
        abstract: 'Retorna el sinus hiperbòlic d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real.' },
        },
    },
    SQRT: {
        description: 'Retorna una arrel quadrada positiva',
        abstract: 'Retorna una arrel quadrada positiva',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre del qual voleu l\'arrel quadrada.' },
        },
    },
    SQRTPI: {
        description: 'Retorna l\'arrel quadrada de (nombre * pi)',
        abstract: 'Retorna l\'arrel quadrada de (nombre * pi)',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre pel qual es multiplica pi.' },
        },
    },
    SUBTOTAL: {
        description: 'Retorna un subtotal en una llista o base de dades.',
        abstract: 'Retorna un subtotal en una llista o base de dades',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'núm_funció', detail: 'El nombre 1-11 o 101-111 que especifica la funció a utilitzar per al subtotal. 1-11 inclou files ocultes manualment, mentre que 101-111 les exclou; les cel·les filtrades sempre s\'exclouen.' },
            ref1: { name: 'ref1', detail: 'El primer rang amb nom o referència per al qual voleu el subtotal.' },
            ref2: { name: 'ref2', detail: 'Rangs amb nom o referències de 2 a 254 per als quals voleu el subtotal.' },
        },
    },
    SUM: {
        description: 'Podeu sumar valors individuals, referències de cel·la o rangs, o una barreja de tots tres.',
        abstract: 'Suma els seus arguments',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'Nombre 1',
                detail: 'El primer nombre que voleu sumar. El nombre pot ser com 4, una referència de cel·la com B6, o un rang de cel·les com B2:B8.',
            },
            number2: {
                name: 'Nombre 2',
                detail: 'Aquest és el segon nombre que voleu sumar. Podeu especificar fins a 255 nombres d\'aquesta manera.',
            },
        },
    },
    SUMIF: {
        description: 'Suma els valors en un rang que compleixen els criteris que especifiqueu.',
        abstract: 'Suma les cel·les especificades per un criteri donat',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: {
                name: 'rang',
                detail: 'El rang de cel·les que voleu avaluar per criteris.',
            },
            criteria: {
                name: 'criteri',
                detail: 'El criteri en forma de nombre, expressió, una referència de cel·la, text o una funció que defineix quines cel·les se sumaran. Es poden incloure caràcters comodí: un signe d\'interrogació (?) per coincidir amb qualsevol caràcter individual, un asterisc (*) per coincidir amb qualsevol seqüència de caràcters. Si voleu trobar un signe d\'interrogació o un asterisc real, escriviu una titlla (~) abans del caràcter.',
            },
            sumRange: {
                name: 'rang_suma',
                detail: 'Les cel·les reals a sumar, si voleu sumar cel·les diferents de les especificades a l\'argument de rang. Si s\'omet l\'argument rang_suma, l\'Excel suma les cel·les especificades a l\'argument de rang (les mateixes cel·les a les quals s\'aplica el criteri).',
            },
        },
    },
    SUMIFS: {
        description: 'Suma tots els seus arguments que compleixen múltiples criteris.',
        abstract: 'Suma tots els seus arguments que compleixen múltiples criteris.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'rang_suma', detail: 'El rang de cel·les a sumar.' },
            criteriaRange1: { name: 'rang_criteri1 ', detail: 'El rang que es prova utilitzant el criteri1. rang_criteri1 i criteri1 estableixen una parella de cerca mitjançant la qual es busca un rang per a criteris específics. Un cop es troben els elements al rang, se sumen els seus valors corresponents a rang_suma.' },
            criteria1: { name: 'criteri1', detail: 'El criteri que defineix quines cel·les de rang_criteri1 se sumaran. Per exemple, el criteri es pot introduir com a 32, ">32", B4, "pomes" o "32".' },
            criteriaRange2: { name: 'rang_criteri2', detail: 'Rangs addicionals. Podeu introduir fins a 127 parelles de rangs.' },
            criteria2: { name: 'criteri2', detail: 'Criteris associats addicionals. Podeu introduir fins a 127 parelles de criteris.' },
        },
    },
    SUMPRODUCT: {
        description: 'Retorna la suma dels productes dels components corresponents de la matriu',
        abstract: 'Retorna la suma dels productes dels components corresponents de la matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu', detail: 'El primer argument de matriu els components del qual voleu multiplicar i després sumar.' },
            array2: { name: 'matriu', detail: 'Arguments de matriu de 2 a 255 els components del qual voleu multiplicar i després sumar.' },
        },
    },
    SUMSQ: {
        description: 'Retorna la suma dels quadrats dels arguments',
        abstract: 'Retorna la suma dels quadrats dels arguments',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'Per elevar al quadrat i trobar el primer nombre, també podeu utilitzar una sola matriu o una referència a una matriu en lloc de paràmetres separats per comes.' },
            number2: { name: 'nombre2', detail: 'El segon nombre que s\'elevarà al quadrat i se sumarà. Es poden especificar fins a 255 nombres d\'aquesta manera.' },
        },
    },
    SUMX2MY2: {
        description: 'Retorna la suma de la diferència de quadrats dels valors corresponents en dues matrius',
        abstract: 'Retorna la suma de la diferència de quadrats dels valors corresponents en dues matrius',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'matriu_x', detail: 'La primera matriu o rang de valors.' },
            arrayY: { name: 'matriu_y', detail: 'La segona matriu o rang de valors.' },
        },
    },
    SUMX2PY2: {
        description: 'Retorna la suma de la suma de quadrats dels valors corresponents en dues matrius',
        abstract: 'Retorna la suma de la suma de quadrats dels valors corresponents en dues matrius',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'matriu_x', detail: 'La primera matriu o rang de valors.' },
            arrayY: { name: 'matriu_y', detail: 'La segona matriu o rang de valors.' },
        },
    },
    SUMXMY2: {
        description: 'Retorna la suma dels quadrats de les diferències dels valors corresponents en dues matrius',
        abstract: 'Retorna la suma dels quadrats de les diferències dels valors corresponents en dues matrius',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'matriu_x', detail: 'La primera matriu o rang de valors.' },
            arrayY: { name: 'matriu_y', detail: 'La segona matriu o rang de valors.' },
        },
    },
    TAN: {
        description: 'Retorna la tangent d\'un nombre.',
        abstract: 'Retorna la tangent d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'angle en radians del qual voleu la tangent.' },
        },
    },
    TANH: {
        description: 'Retorna la tangent hiperbòlica d\'un nombre.',
        abstract: 'Retorna la tangent hiperbòlica d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real.' },
        },
    },
    TRUNC: {
        description: 'Trunca un nombre a un enter',
        abstract: 'Trunca un nombre a un enter',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu truncar.' },
            numDigits: { name: 'núm_dígits', detail: 'Un nombre que especifica la precisió del truncament. El valor per defecte per a núm_dígits és 0 (zero).' },
        },
    },
};

export default locale;
