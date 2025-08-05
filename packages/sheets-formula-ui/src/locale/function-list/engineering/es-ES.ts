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
                url: 'https://support.microsoft.com/en-us/office/besseli-function-8d33855c-9a8d-444b-98e0-852267b1c0df',
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
                url: 'https://support.microsoft.com/en-us/office/besselj-function-839cb181-48de-408b-9d80-bd02982d94f7',
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
                url: 'https://support.microsoft.com/en-us/office/besselk-function-606d11bc-06d3-4d53-9ecb-2803e2b90b70',
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
                url: 'https://support.microsoft.com/en-us/office/bessely-function-f3a356b3-da89-42c3-8974-2da54d6353a2',
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
                url: 'https://support.microsoft.com/en-us/office/bin2dec-function-63905b57-b3a0-453d-99f4-647bb519cd6c',
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
                url: 'https://support.microsoft.com/en-us/office/bin2hex-function-0375e507-f5e5-4077-9af8-28d84f9f41cc',
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
                url: 'https://support.microsoft.com/en-us/office/bin2oct-function-0a4e01ba-ac8d-4158-9b29-16c25c4c23fd',
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
                url: 'https://support.microsoft.com/en-us/office/bitand-function-8a2be3d7-91c3-4b48-9517-64548008563a',
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
                url: 'https://support.microsoft.com/en-us/office/bitlshift-function-c55bb27e-cacd-4c7c-b258-d80861a03c9c',
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
                url: 'https://support.microsoft.com/en-us/office/bitor-function-f6ead5c8-5b98-4c9e-9053-8ad5234919b2',
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
                url: 'https://support.microsoft.com/en-us/office/bitrshift-function-274d6996-f42c-4743-abdb-4ff95351222c',
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
                url: 'https://support.microsoft.com/en-us/office/bitxor-function-c81306a1-03f9-4e89-85ac-b86c3cba10e4',
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
                url: 'https://support.microsoft.com/en-us/office/complex-function-f0b8f3a9-51cc-4d6d-86fb-3a9362fa4128',
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
                url: 'https://support.microsoft.com/en-us/office/convert-function-d785bef1-808e-4aac-bdcd-666c810f9af2',
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
                url: 'https://support.microsoft.com/en-us/office/dec2bin-function-0f63dd0e-5d1a-42d8-b511-5bf5c6d43838',
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
                url: 'https://support.microsoft.com/en-us/office/dec2hex-function-6344ee8b-b6b5-4c6a-a672-f64666704619',
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
                url: 'https://support.microsoft.com/en-us/office/dec2oct-function-c9d835ca-20b7-40c4-8a9e-d3be351ce00f',
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
                url: 'https://support.microsoft.com/en-us/office/delta-function-2f763672-c959-4e07-ac33-fe03220ba432',
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
                url: 'https://support.microsoft.com/en-us/office/erf-function-c53c7e7b-5482-4b6c-883e-56df3c9af349',
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
                url: 'https://support.microsoft.com/en-us/office/erf-precise-function-9a349593-705c-4278-9a98-e4122831a8e0',
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
                url: 'https://support.microsoft.com/en-us/office/erfc-function-736e0318-70ba-4e8b-8d08-461fe68b71b3',
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
                url: 'https://support.microsoft.com/en-us/office/erfc-precise-function-e90e6bab-f45e-45df-b2ac-cd2eb4d4a273',
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
                url: 'https://support.microsoft.com/en-us/office/gestep-function-f37e7d2a-41da-4129-be95-640883fca9df',
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
                url: 'https://support.microsoft.com/en-us/office/hex2bin-function-a13aafaa-5737-4920-8424-643e581828c1',
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
                url: 'https://support.microsoft.com/en-us/office/hex2dec-function-8c8c3155-9f37-45a5-a3ee-ee5379ef106e',
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
                url: 'https://support.microsoft.com/en-us/office/hex2oct-function-54d52808-5d19-4bd0-8a63-1096a5d11912',
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
                url: 'https://support.microsoft.com/en-us/office/imabs-function-b31e73c6-d90c-4062-90bc-8eb351d765a1',
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
                url: 'https://support.microsoft.com/en-us/office/imaginary-function-dd5952fd-473d-44d9-95a1-9a17b23e428a',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el coeficiente imaginario.' },
        },
    },
    IMARGUMENT: {
        description: 'Devuelve el argumento theta, un ángulo expresado en radianes',
        abstract: 'Devuelve el argumento theta, un ángulo expresado en radianes',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/imargument-function-eed37ec1-23b3-4f59-b9f3-d340358a034a',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el argumento theta.' },
        },
    },
    IMCONJUGATE: {
        description: 'Devuelve el conjugado complejo de un número complejo',
        abstract: 'Devuelve el conjugado complejo de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/imconjugate-function-2e2fc1ea-f32b-4f9b-9de6-233853bafd42',
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
                url: 'https://support.microsoft.com/en-us/office/imcos-function-dad75277-f592-4a6b-ad6c-be93a808a53c',
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
                url: 'https://support.microsoft.com/en-us/office/imcosh-function-053e4ddb-4122-458b-be9a-457c405e90ff',
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
                url: 'https://support.microsoft.com/en-us/office/imcot-function-dc6a3607-d26a-4d06-8b41-8931da36442c',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener la cotangente.' },
        },
    },
    IMCOTH: {
        description: 'Devuelve la cotangente hiperbólica de un número complejo',
        abstract: 'Devuelve la cotangente hiperbólica de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/9366256?hl=en&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener la cotangente hiperbólica.' },
        },
    },
    IMCSC: {
        description: 'Devuelve la cosecante de un número complejo',
        abstract: 'Devuelve la cosecante de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/imcsc-function-9e158d8f-2ddf-46cd-9b1d-98e29904a323',
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
                url: 'https://support.microsoft.com/en-us/office/imcsch-function-c0ae4f54-5f09-4fef-8da0-dc33ea2c5ca9',
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
                url: 'https://support.microsoft.com/en-us/office/imdiv-function-a505aff7-af8a-4451-8142-77ec3d74d83f',
            },
        ],
        functionParameter: {
            inumber1: { name: 'núm_imaginario1', detail: 'El numerador o dividendo complejo.' },
            inumber2: { name: 'núm_imaginario2', detail: 'El denominador o divisor complejo.' },
        },
    },
    IMEXP: {
        description: 'Devuelve la exponencial de un número complejo',
        abstract: 'Devuelve la exponencial de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/imexp-function-c6f8da1f-e024-4c0c-b802-a60e7147a95f',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener la exponencial.' },
        },
    },
    IMLN: {
        description: 'Devuelve el logaritmo natural de un número complejo',
        abstract: 'Devuelve el logaritmo natural de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/imln-function-32b98bcf-8b81-437c-a636-6fb3aad509d8',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener el logaritmo natural.' },
        },
    },
    IMLOG: {
        description: 'Devuelve el logaritmo de un número complejo para una base especificada',
        abstract: 'Devuelve el logaritmo de un número complejo para una base especificada',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/9366486?hl=zh-Hans&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo cuyo logaritmo a una base específica se debe calcular.' },
            base: { name: 'base', detail: 'La base que se usa al calcular el logaritmo.' },
        },
    },
    IMLOG10: {
        description: 'Devuelve el logaritmo en base 10 de un número complejo',
        abstract: 'Devuelve el logaritmo en base 10 de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/imlog10-function-58200fca-e2a2-4271-8a98-ccd4360213a5',
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
                url: 'https://support.microsoft.com/en-us/office/imlog2-function-152e13b4-bc79-486c-a243-e6a676878c51',
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
                url: 'https://support.microsoft.com/en-us/office/impower-function-210fd2f5-f8ff-4c6a-9d60-30e34fbdef39',
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
                url: 'https://support.microsoft.com/en-us/office/improduct-function-2fb8651a-a4f2-444f-975e-8ba7aab3a5ba',
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
                url: 'https://support.microsoft.com/en-us/office/imreal-function-d12bc4c0-25d0-4bb3-a25f-ece1938bf366',
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
                url: 'https://support.microsoft.com/en-us/office/imsec-function-6df11132-4411-4df4-a3dc-1f17372459e0',
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
                url: 'https://support.microsoft.com/en-us/office/imsech-function-f250304f-788b-4505-954e-eb01fa50903b',
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
                url: 'https://support.microsoft.com/en-us/office/imsin-function-1ab02a39-a721-48de-82ef-f52bf37859f6',
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
                url: 'https://support.microsoft.com/en-us/office/imsinh-function-dfb9ec9e-8783-4985-8c42-b028e9e8da3d',
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
                url: 'https://support.microsoft.com/en-us/office/imsqrt-function-e1753f80-ba11-4664-a10e-e17368396b70',
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
                url: 'https://support.microsoft.com/en-us/office/imsub-function-2e404b4d-4935-4e85-9f52-cb08b9a45054',
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
                url: 'https://support.microsoft.com/en-us/office/imsum-function-81542999-5f1c-4da6-9ffe-f1d7aaa9457f',
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
                url: 'https://support.microsoft.com/en-us/office/imtan-function-8478f45d-610a-43cf-8544-9fc0b553a132',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener la tangente.' },
        },
    },
    IMTANH: {
        description: 'Devuelve la tangente hiperbólica de un número complejo',
        abstract: 'Devuelve la tangente hiperbólica de un número complejo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/9366655?hl=en&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginario', detail: 'Un número complejo del que desea obtener la tangente hiperbólica.' },
        },
    },
    OCT2BIN: {
        description: 'Convierte un número octal a binario',
        abstract: 'Convierte un número octal a binario',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/oct2bin-function-55383471-3c56-4d27-9522-1a8ec646c589',
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
                url: 'https://support.microsoft.com/en-us/office/oct2dec-function-87606014-cb98-44b2-8dbb-e48f8ced1554',
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
                url: 'https://support.microsoft.com/en-us/office/oct2hex-function-912175b4-d497-41b4-a029-221f051b858f',
            },
        ],
        functionParameter: {
            number: { name: 'número', detail: 'El número octal que desea convertir.' },
            places: { name: 'posiciones', detail: 'El número de caracteres que se van a usar.' },
        },
    },
};

export default locale;
