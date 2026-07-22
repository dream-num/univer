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
    BESSELI: {
        description: 'Devuelve la función de Bessel modificada In(x)',
        abstract: 'Devuelve la función de Bessel modificada In(x)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'El valor en el que se evalúa la función.' },
            n: { name: 'N', detail: 'El orden de la función de Bessel. Si n no es un entero, se trunca.' },
        },
    },
    BESSELJ: {
        description: 'Devuelve la función de Bessel Jn(x)',
        abstract: 'Devuelve la función de Bessel Jn(x)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'El valor en el que se evalúa la función.' },
            n: { name: 'N', detail: 'El orden de la función de Bessel. Si n no es un entero, se trunca.' },
        },
    },
    BESSELK: {
        description: 'Devuelve la función de Bessel modificada Kn(x)',
        abstract: 'Devuelve la función de Bessel modificada Kn(x)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'El valor en el que se evalúa la función.' },
            n: { name: 'N', detail: 'El orden de la función de Bessel. Si n no es un entero, se trunca.' },
        },
    },
    BESSELY: {
        description: 'Devuelve la función de Bessel Yn(x)',
        abstract: 'Devuelve la función de Bessel Yn(x)',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'El valor en el que se evalúa la función.' },
            n: { name: 'N', detail: 'El orden de la función de Bessel. Si n no es un entero, se trunca.' },
        },
    },
    BIN2DEC: {
        description: 'Convierte un número binario a decimal',
        abstract: 'Convierte un número binario a decimal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número binario que desea convertir.' },
        },
    },
    BIN2HEX: {
        description: 'Convierte un número binario a hexadecimal',
        abstract: 'Convierte un número binario a hexadecimal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número binario que desea convertir.' },
            places: { name: 'posiciones', detail: 'El número de caracteres que se van a usar.' },
        },
    },
    BIN2OCT: {
        description: 'Convierte un número binario a octal',
        abstract: 'Convierte un número binario a octal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número binario que desea convertir.' },
            places: { name: 'posiciones', detail: 'El número de caracteres que se van a usar.' },
        },
    },
    BITAND: {
        description: 'Devuelve una "Y bit a bit" de dos números',
        abstract: 'Devuelve una "Y bit a bit" de dos números',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'Debe estar en forma decimal y ser mayor o igual a 0.' },
            number2: { name: 'número2', detail: 'Debe estar en forma decimal y ser mayor o igual a 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Devuelve un número de valor desplazado a la izquierda por cantidad_desplazamiento bits',
        abstract: 'Devuelve un número de valor desplazado a la izquierda por cantidad_desplazamiento bits',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Número debe ser un entero mayor o igual a 0.' },
            shiftAmount: { name: 'cantidad_desplazamiento', detail: 'Cantidad_desplazamiento debe ser un entero.' },
        },
    },
    BITOR: {
        description: 'Devuelve un O bit a bit de 2 números',
        abstract: 'Devuelve un O bit a bit de 2 números',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'Debe estar en forma decimal y ser mayor o igual a 0.' },
            number2: { name: 'número2', detail: 'Debe estar en forma decimal y ser mayor o igual a 0.' },
        },
    },
    BITRSHIFT: {
        description: 'Devuelve un número de valor desplazado a la derecha por cantidad_desplazamiento bits',
        abstract: 'Devuelve un número de valor desplazado a la derecha por cantidad_desplazamiento bits',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'Número debe ser un entero mayor o igual a 0.' },
            shiftAmount: { name: 'cantidad_desplazamiento', detail: 'Cantidad_desplazamiento debe ser un entero.' },
        },
    },
    BITXOR: {
        description: 'Devuelve un "O exclusivo" bit a bit de dos números',
        abstract: 'Devuelve un "O exclusivo" bit a bit de dos números',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'Debe estar en forma decimal y ser mayor o igual a 0.' },
            number2: { name: 'número2', detail: 'Debe estar en forma decimal y ser mayor o igual a 0.' },
        },
    },
    COMPLEX: {
        description: 'Convierte coeficientes reales e imaginarios en un número complejo',
        abstract: 'Convierte coeficientes reales e imaginarios en un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'núm_real', detail: 'El coeficiente real del número complejo.' },
            iNum: { name: 'núm_i', detail: 'El coeficiente imaginario del número complejo.' },
            suffix: { name: 'sufijo', detail: 'El sufijo para el componente imaginario del número complejo. Si se omite, se supone que el sufijo es "i".' },
        },
    },
    CONVERT: {
        description: 'Convierte un número de un sistema de medida a otro',
        abstract: 'Convierte un número de un sistema de medida a otro',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'es el valor en unidades_origen que se va a convertir.' },
            fromUnit: { name: 'unidad_origen', detail: 'son las unidades de número.' },
            toUnit: { name: 'unidad_destino', detail: 'son las unidades para el resultado.' },
        },
    },
    DEC2BIN: {
        description: 'Convierte un número decimal a binario',
        abstract: 'Convierte un número decimal a binario',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número decimal que desea convertir.' },
            places: { name: 'posiciones', detail: 'El número de caracteres que se van a usar.' },
        },
    },
    DEC2HEX: {
        description: 'Convierte un número decimal a hexadecimal',
        abstract: 'Convierte un número decimal a hexadecimal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número decimal que desea convertir.' },
            places: { name: 'posiciones', detail: 'El número de caracteres que se van a usar.' },
        },
    },
    DEC2OCT: {
        description: 'Convierte un número decimal a octal',
        abstract: 'Convierte un número decimal a octal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número decimal que desea convertir.' },
            places: { name: 'posiciones', detail: 'El número de caracteres que se van a usar.' },
        },
    },
    DELTA: {
        description: 'Comprueba si dos valores son iguales',
        abstract: 'Comprueba si dos valores son iguales',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'El primer número.' },
            number2: { name: 'número2', detail: 'El segundo número. Si se omite, se supone que número2 es cero.' },
        },
    },
    ERF: {
        description: 'Devuelve la función de error',
        abstract: 'Devuelve la función de error',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'límite_inferior', detail: 'El límite inferior para integrar ERF.' },
            upperLimit: { name: 'límite_superior', detail: 'El límite superior para integrar ERF. Si se omite, ERF integra entre cero y límite_inferior.' },
        },
    },
    ERF_PRECISE: {
        description: 'Devuelve la función de error',
        abstract: 'Devuelve la función de error',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El límite inferior para integrar ERF.PRECISE.' },
        },
    },
    ERFC: {
        description: 'Devuelve la función de error complementaria',
        abstract: 'Devuelve la función de error complementaria',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El límite inferior para integrar ERFC.' },
        },
    },
    ERFC_PRECISE: {
        description: 'Devuelve la función ERF complementaria integrada entre x e infinito',
        abstract: 'Devuelve la función ERF complementaria integrada entre x e infinito',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El límite inferior para integrar ERFC.PRECISE.' },
        },
    },
    GESTEP: {
        description: 'Comprueba si un número es mayor que un valor umbral',
        abstract: 'Comprueba si un número es mayor que un valor umbral',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El valor que se va a probar contra escalón.' },
            step: { name: 'escalón', detail: 'El valor umbral. Si omite un valor para escalón, GESTEP usa cero.' },
        },
    },
    HEX2BIN: {
        description: 'Convierte un número hexadecimal a binario',
        abstract: 'Convierte un número hexadecimal a binario',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número hexadecimal que desea convertir.' },
            places: { name: 'posiciones', detail: 'El número de caracteres que se van a usar.' },
        },
    },
    HEX2DEC: {
        description: 'Convierte un número hexadecimal a decimal',
        abstract: 'Convierte un número hexadecimal a decimal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número hexadecimal que desea convertir.' },
        },
    },
    HEX2OCT: {
        description: 'Convierte un número hexadecimal a octal',
        abstract: 'Convierte un número hexadecimal a octal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número hexadecimal que desea convertir.' },
            places: { name: 'posiciones', detail: 'El número de caracteres que se van a usar.' },
        },
    },
    IMABS: {
        description: 'Devuelve el valor absoluto (módulo) de un número complejo',
        abstract: 'Devuelve el valor absoluto (módulo) de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el valor absoluto.' },
        },
    },
    IMAGINARY: {
        description: 'Devuelve el coeficiente imaginario de un número complejo',
        abstract: 'Devuelve el coeficiente imaginario de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el coeficiente imaginario.' },
        },
    },
    IMARGUMENT: {
        description: 'Devuelve el argumento (theta), un ángulo expresado en radianes, de tal forma que:',
        abstract: 'Devuelve el argumento (theta), un ángulo expresado en radianes, de tal forma que:',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Obligatorio. Es el número complejo cuyo argumento desea conocer.' },
        },
    },
    IMCONJUGATE: {
        description: 'Devuelve el conjugado complejo de un número complejo',
        abstract: 'Devuelve el conjugado complejo de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el conjugado.' },
        },
    },
    IMCOS: {
        description: 'Devuelve el coseno de un número complejo',
        abstract: 'Devuelve el coseno de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el coseno.' },
        },
    },
    IMCOSH: {
        description: 'Devuelve el coseno hiperbólico de un número complejo',
        abstract: 'Devuelve el coseno hiperbólico de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el coseno hiperbólico.' },
        },
    },
    IMCOT: {
        description: 'Devuelve la cotangente de un número complejo',
        abstract: 'Devuelve la cotangente de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener la cotangente.' },
        },
    },
    IMCOTH: {
        description: 'La función IM.COTH devuelve la cotangente hiperbólica del número complejo especificado. Por ejemplo, un número complejo dado, como "x+yi", devuelve "coth(x+yi)".',
        abstract: 'La función IM.COTH devuelve la cotangente hiperbólica del número complejo especificado. Por ejemplo, un número complejo dado, como "x+yi", devuelve "coth(x+yi)".',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/9366256?hl=es',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Número complejo del que se desea calcular la cotangente hiperbólica. Este argumento puede ser el resultado de la función COMPLEJO, un número real (que se interpreta como un número complejo con las partes imaginarias igual a 0), o una cadena con el formato "x + yi", donde x e y son números.' },
        },
    },
    IMCSC: {
        description: 'Devuelve la cosecante de un número complejo',
        abstract: 'Devuelve la cosecante de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener la cosecante.' },
        },
    },
    IMCSCH: {
        description: 'Devuelve la cosecante hiperbólica de un número complejo',
        abstract: 'Devuelve la cosecante hiperbólica de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener la cosecante hiperbólica.' },
        },
    },
    IMDIV: {
        description: 'Devuelve el cociente de dos números complejos',
        abstract: 'Devuelve el cociente de dos números complejos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'núm_imaginario1', detail: 'El numerador o dividendo complejo.' },
            inumber2: { name: 'núm_imaginario2', detail: 'El denominador o divisor complejo.' },
        },
    },
    IMEXP: {
        description: 'Devuelve el valor exponencial de un número complejo con el formato de texto x + yi o x + yj.',
        abstract: 'Devuelve el valor exponencial de un número complejo con el formato de texto x + yi o x + yj.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Obligatorio. Es el número complejo cuyo valor exponencial desea calcular.' },
        },
    },
    IMLN: {
        description: 'Devuelve el logaritmo natural de un número complejo',
        abstract: 'Devuelve el logaritmo natural de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el logaritmo natural.' },
        },
    },
    IMLOG: {
        description: 'La función IM.LOG devuelve el logaritmo de un número complejo en la base especificada.',
        abstract: 'La función IM.LOG devuelve el logaritmo de un número complejo en la base especificada.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/9366486?hl=es',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Valor introducido de la función de logaritmo. El número se puede introducir solo, por ejemplo, 1, y se interpretará como un número real. También se pueden introducir números entre comillas para especificar tanto los coeficientes reales como los complejos.' },
            base: { name: 'base', detail: 'Base que se va a usar para calcular el logaritmo. Debe ser un número real positivo.' },
        },
    },
    IMLOG10: {
        description: 'Devuelve el logaritmo en base 10 de un número complejo',
        abstract: 'Devuelve el logaritmo en base 10 de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el logaritmo común.' },
        },
    },
    IMLOG2: {
        description: 'Devuelve el logaritmo en base 2 de un número complejo',
        abstract: 'Devuelve el logaritmo en base 2 de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el logaritmo en base 2.' },
        },
    },
    IMPOWER: {
        description: 'Devuelve un número complejo elevado a una potencia entera',
        abstract: 'Devuelve un número complejo elevado a una potencia entera',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo que desea elevar a una potencia.' },
            number: { name: 'número', detail: 'La potencia a la que desea elevar el número complejo.' },
        },
    },
    IMPRODUCT: {
        description: 'Devuelve el producto de 1 a 255 números complejos',
        abstract: 'Devuelve el producto de 1 a 255 números complejos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'núm_imaginario1', detail: 'De 1 a 255 números complejos para multiplicar.' },
            inumber2: { name: 'núm_imaginario2', detail: 'De 1 a 255 números complejos para multiplicar.' },
        },
    },
    IMREAL: {
        description: 'Devuelve el coeficiente real de un número complejo',
        abstract: 'Devuelve el coeficiente real de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el coeficiente real.' },
        },
    },
    IMSEC: {
        description: 'Devuelve la secante de un número complejo',
        abstract: 'Devuelve la secante de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener la secante.' },
        },
    },
    IMSECH: {
        description: 'Devuelve la secante hiperbólica de un número complejo',
        abstract: 'Devuelve la secante hiperbólica de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener la secante hiperbólica.' },
        },
    },
    IMSIN: {
        description: 'Devuelve el seno de un número complejo',
        abstract: 'Devuelve el seno de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el seno.' },
        },
    },
    IMSINH: {
        description: 'Devuelve el seno hiperbólico de un número complejo',
        abstract: 'Devuelve el seno hiperbólico de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el seno hiperbólico.' },
        },
    },
    IMSQRT: {
        description: 'Devuelve la raíz cuadrada de un número complejo',
        abstract: 'Devuelve la raíz cuadrada de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener la raíz cuadrada.' },
        },
    },
    IMSUB: {
        description: 'Devuelve la diferencia entre dos números complejos',
        abstract: 'Devuelve la diferencia entre dos números complejos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'núm_imaginario1', detail: 'núm_imaginario1.' },
            inumber2: { name: 'núm_imaginario2', detail: 'núm_imaginario2.' },
        },
    },
    IMSUM: {
        description: 'Devuelve la suma de números complejos',
        abstract: 'Devuelve la suma de números complejos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'núm_imaginario1', detail: 'De 1 a 255 números complejos para sumar.' },
            inumber2: { name: 'núm_imaginario2', detail: 'De 1 a 255 números complejos para sumar.' },
        },
    },
    IMTAN: {
        description: 'Devuelve la tangente de un número complejo',
        abstract: 'Devuelve la tangente de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener la tangente.' },
        },
    },
    IMTANH: {
        description: 'La función IM.TANH devuelve la tangente hiperbólica del número complejo especificado. Por ejemplo, un número complejo dado, como "x+yi", devuelve "tanh(x+yi)".',
        abstract: 'La función IM.TANH devuelve la tangente hiperbólica del número complejo especificado. Por ejemplo, un número complejo dado, como "x+yi", devuelve "tanh(x+yi)".',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/9366655?hl=es',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Número complejo del que se desea calcular la tangente hiperbólica. Este argumento puede ser el resultado de la función COMPLEJO, un número real (que se interpreta como un número complejo con las partes imaginarias igual a 0), o una cadena con el formato "x + yi", donde x e y son números.' },
        },
    },
    OCT2BIN: {
        description: 'Convierte un número octal a binario',
        abstract: 'Convierte un número octal a binario',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número octal que desea convertir.' },
            places: { name: 'posiciones', detail: 'El número de caracteres que se van a usar.' },
        },
    },
    OCT2DEC: {
        description: 'Convierte un número octal a decimal',
        abstract: 'Convierte un número octal a decimal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número octal que desea convertir.' },
        },
    },
    OCT2HEX: {
        description: 'Convierte un número octal a hexadecimal',
        abstract: 'Convierte un número octal a hexadecimal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número octal que desea convertir.' },
            places: { name: 'posiciones', detail: 'El número de caracteres que se van a usar.' },
        },
    },
};

export default locale;
