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
        description: 'Retorna a função de Bessel modificada, que equivale à função de Bessel avaliada por argumentos puramente imaginários.',
        abstract: 'Retorna a função de Bessel modificada, que equivale à função de Bessel avaliada por argumentos puramente imaginários.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Obrigatório. O valor no qual se avalia a função.' },
            n: { name: 'N', detail: 'Obrigatório. A ordem da função Bessel. Se n não for um inteiro, será truncado.' },
        },
    },
    BESSELJ: {
        description: 'Retorna a função de Bessel.',
        abstract: 'Retorna a função de Bessel.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Obrigatório. O valor no qual se avalia a função.' },
            n: { name: 'N', detail: 'Obrigatório. A ordem da função Bessel. Se n não for um inteiro, será truncado.' },
        },
    },
    BESSELK: {
        description: 'Retorna a função de Bessel modificada, que equivale às funções de Bessel avaliadas por argumentos puramente imaginários.',
        abstract: 'Retorna a função de Bessel modificada, que equivale às funções de Bessel avaliadas por argumentos puramente imaginários.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Obrigatório. O valor no qual se avalia a função.' },
            n: { name: 'N', detail: 'Obrigatório. A ordem da função. Se n não for um inteiro, será truncado.' },
        },
    },
    BESSELY: {
        description: 'Retorna a função de Bessel, também chamada de função de Weber ou de Newmann.',
        abstract: 'Retorna a função de Bessel, também chamada de função de Weber ou de Newmann.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Obrigatório. O valor no qual se avalia a função.' },
            n: { name: 'N', detail: 'Obrigatório. A ordem da função. Se n não for um inteiro, será truncado.' },
        },
    },
    BIN2DEC: {
        description: 'Converte um número binário em decimal.',
        abstract: 'Converte um número binário em decimal.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número binário que você deseja converter. Núm não pode conter mais de 10 caracteres (10 bits). O bit mais significativo de núm é o bit de sinal. Os 9 bits restantes são bits de magnitude. Os números negativos são representados através da notação de complemento a dois.' },
        },
    },
    BIN2HEX: {
        description: 'Converte um número binário em hexadecimal.',
        abstract: 'Converte um número binário em hexadecimal.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número binário que você deseja converter. Núm não pode conter mais de 10 caracteres (10 bits). O bit mais significativo de núm é o bit de sinal. Os 9 bits restantes são bits de magnitude. Os números negativos são representados através da notação de complemento a dois.' },
            places: { name: 'places', detail: 'Opcional. O número de caracteres a ser usado. Se casas for omitido, BINAHEX usará o número mínimo de caracteres necessários. Casas é útil para preencher o valor de retorno com 0s (zeros) à esquerda.' },
        },
    },
    BIN2OCT: {
        description: 'Converte um número binário em octal.',
        abstract: 'Converte um número binário em octal.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número binário que você deseja converter. Núm não pode conter mais de 10 caracteres (10 bits). O bit mais significativo de núm é o bit de sinal. Os 9 bits restantes são bits de magnitude. Os números negativos são representados através da notação de complemento a dois.' },
            places: { name: 'places', detail: 'Opcional. O número de caracteres a ser usado. Se casas for omitido, BINAOCT usará o número mínimo de caracteres necessários. Casas é útil para preencher o valor de retorno com 0s (zeros) à esquerda.' },
        },
    },
    BITAND: {
        description: 'Retorna um bit \'AND\' de dois números.',
        abstract: 'Retorna um bit \'AND\' de dois números.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obrigatório. Deve ser no formato de decimal e maior que ou igual a 0.' },
            number2: { name: 'number2', detail: 'Obrigatório. Deve ser no formato de decimal e maior que ou igual a 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Retorna um número deslocado para a esquerda em número de bits especificado.',
        abstract: 'Retorna um número deslocado para a esquerda em número de bits especificado.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número deve ser um número inteiro maior que ou igual a 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Necessário. O valor_deslocamento deve ser um número inteiro.' },
        },
    },
    BITOR: {
        description: 'Retorna um bit \'OU\' de dois números.',
        abstract: 'Retorna um bit \'OU\' de dois números.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Necessário. Deve ser no formato de decimal e maior que ou igual a 0.' },
            number2: { name: 'number2', detail: 'Necessário. Deve ser no formato de decimal e maior que ou igual a 0.' },
        },
    },
    BITRSHIFT: {
        description: 'Retorna um número deslocado para a direita em número de bits especificado.',
        abstract: 'Retorna um número deslocado para a direita em número de bits especificado.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Deve ser um número inteiro maior que ou igual a 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Necessário. Deve ser um número inteiro.' },
        },
    },
    BITXOR: {
        description: 'Retorna um bit \'XOR\' de dois números.',
        abstract: 'Retorna um bit \'XOR\' de dois números.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Necessário. Deve ser maior que ou igual a 0.' },
            number2: { name: 'number2', detail: 'Necessário. Deve ser maior que ou igual a 0.' },
        },
    },
    COMPLEX: {
        description: 'Converte coeficientes reais e imaginários em números complexos no formato x + yi ou x + yj.',
        abstract: 'Converte coeficientes reais e imaginários em números complexos no formato x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'real_num', detail: 'Necessário. O coeficiente real do número complexo.' },
            iNum: { name: 'i_num', detail: 'Necessário. O coeficiente imaginário do número complexo.' },
            suffix: { name: 'suffix', detail: 'Opcional. O sufixo para o componente imaginário do número complexo. Se for omitido, sufixo será considerado "i".' },
        },
    },
    CONVERT: {
        description: 'Converte um número de um sistema de medida para outro. Por exemplo, CONVERTER pode traduzir uma tabela de distâncias em milhas para uma tabela de distâncias em quilômetros.',
        abstract: 'Converte um número de um sistema de medida para outro. Por exemplo, CONVERTER pode traduzir uma tabela de distâncias em milhas para uma tabela de distâncias em quilômetros.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'O valor em from_unit a ser convertido.' },
            fromUnit: { name: 'from_unit', detail: 'A unidade do número.' },
            toUnit: { name: 'to_unit', detail: 'A unidade do resultado.' },
        },
    },
    DEC2BIN: {
        description: 'Converte um número decimal em binário.',
        abstract: 'Converte um número decimal em binário.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O inteiro decimal que você deseja converter. Se núm for negativo, o valor válido de casa será ignorado e DECABIN retornará um número binário de 10 caracteres (10 bits) em que o bit mais significativo é o bit de sinal. Os 9 bits restantes são bits de magnitude. Os números negativos são representados através da notação de complemento a dois.' },
            places: { name: 'places', detail: 'Opcional. O número de caracteres a ser usado. Se casas for omitido, DECABIN usa o número mínimo de caracteres necessário. Casas é útil para preencher o valor de retorno com 0s (zeros) à esquerda.' },
        },
    },
    DEC2HEX: {
        description: 'Converte um número decimal em hexadecimal.',
        abstract: 'Converte um número decimal em hexadecimal.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O inteiro decimal que você deseja converter. Se núm for negativo, casas serão ignoradas e DECAHEX retornará um número hexadecimal de 10 caracteres (40 bits) em que o bit mais significativo é o bit de sinal. Os 39 bits restantes são bits de magnitude. Os números negativos são representados com o uso de notação de complemento a dois.' },
            places: { name: 'places', detail: 'Opcional. O número de caracteres a serem usados. Se casas for omitido, DECAHEX usa o número mínimo de caracteres necessário. Casas é útil para preencher o valor de retorno com 0s (zeros) à esquerda.' },
        },
    },
    DEC2OCT: {
        description: 'Converte um número decimal em octal.',
        abstract: 'Converte um número decimal em octal.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O inteiro decimal que você deseja converter. Se núm for negativo, casas serão ignoradas e DECAOCT retornará um número octal de 10 caracteres (30 bits) em que o bit mais significativo é o bit de sinal. Os demais 29 bits são bits de magnitude. Os números negativos são representados com o uso de notação de complemento a dois.' },
            places: { name: 'places', detail: 'Opcional. O número de caracteres a ser usado. Se casas for omitido, DECAOCT usa o número mínimo de caracteres necessário. Casas é útil para preencher o valor de retorno com 0s (zeros) à esquerda.' },
        },
    },
    DELTA: {
        description: 'Testa se dois valores são iguais. Retorna 1 se núm1 = núm2; caso contrário, retornará 0. Utilize esta função para filtrar um conjunto de valores. Por exemplo, somando várias funções DELTA, você pode calcular a contagem de pares iguais. Esta função também é chamada função Kronecker Delta.',
        abstract: 'Testa se dois valores são iguais. Retorna 1 se núm1 = núm2; caso contrário, retornará 0. Utilize esta função para filtrar um conjunto de valores. Por exemplo, somando várias funções DELTA, você pode calcular a contagem de pares iguais. Esta função também é chamada função Kronecker Delta.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obrigatório. O primeiro número.' },
            number2: { name: 'number2', detail: 'Opcional. O segundo número. Se omitido, núm2 será considerado zero.' },
        },
    },
    ERF: {
        description: 'Retorna a função de erro integrada entre limite_inferior e limite_superior.',
        abstract: 'Retorna a função de erro integrada entre limite_inferior e limite_superior.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'lower_limit', detail: 'Obrigatório. O limite inferior na integração de FUNERRO.' },
            upperLimit: { name: 'upper_limit', detail: 'Opcional. O limite superior na integração de FUNERRO. Se omitido, FUNERRO integrará entre zero e limite_inferior.' },
        },
    },
    ERF_PRECISE: {
        description: 'Retorna a função de erro.',
        abstract: 'Retorna a função de erro.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O limite inferior na integração de FUNERRO.PRECISO.' },
        },
    },
    ERFC: {
        description: 'Retorna a função FUNERRO complementar integrada entre x e infinito.',
        abstract: 'Retorna a função FUNERRO complementar integrada entre x e infinito.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O limite inferior na integração de FUNERROCOMPL.' },
        },
    },
    ERFC_PRECISE: {
        description: 'Retorna a função FUNERRO complementar integrada entre x e infinito.',
        abstract: 'Retorna a função FUNERRO complementar integrada entre x e infinito.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O limite inferior na integração de ERFC.PRECISE.' },
        },
    },
    GESTEP: {
        description: 'Retorna 1 se núm ≥ passo; caso contrário, retornará 0. Use esta função para filtrar um conjunto de valores. Por exemplo, somando várias funções DEGRAU você calcula a contagem dos valores que excedem um limite.',
        abstract: 'Retorna 1 se núm ≥ passo; caso contrário, retornará 0. Use esta função para filtrar um conjunto de valores. Por exemplo, somando várias funções DEGRAU você calcula a contagem dos valores que excedem um limite.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O valor a ser testado em relação a passo.' },
            step: { name: 'step', detail: 'Opcional. O valor-limite. Se você omitir o valor para passo, DEGRAU usará zero.' },
        },
    },
    HEX2BIN: {
        description: 'Converte um número hexadecimal em binário.',
        abstract: 'Converte um número hexadecimal em binário.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número hexadecimal que você deseja converter. Núm não pode conter mais de 10 caracteres. O bit mais significativo é o bit de sinal (40° bit da direita). Os 9 bits restantes são bits de magnitude. Os números negativos são representados através da notação de complemento a dois.' },
            places: { name: 'places', detail: 'Opcional. O número de caracteres a ser usado. Se casas for omitido, HEXABIN usará o número mínimo de caracteres necessário. Casas é útil para preencher o valor retornado com 0s (zeros) à esquerda.' },
        },
    },
    HEX2DEC: {
        description: 'Converte um número hexadecimal em decimal.',
        abstract: 'Converte um número hexadecimal em decimal.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número hexadecimal que você deseja converter. Núm não pode conter mais de 10 caracteres (40 bits). O bit mais significativo de núm é o bit de sinal. Os 39 bits restantes são bits de magnitude. Os números negativos são representados com o uso de notação de complemento a dois.' },
        },
    },
    HEX2OCT: {
        description: 'Converte um número hexadecimal em octal.',
        abstract: 'Converte um número hexadecimal em octal.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número hexadecimal que você deseja converter. Núm não pode conter mais de 10 caracteres. O bit mais significativo de núm é o bit de sinal. Os 39 bits restantes são bits de magnitude. Os números negativos são representados com o uso de notação de complemento a dois.' },
            places: { name: 'places', detail: 'Opcional. O número de caracteres a ser usado. Se casas for omitido, HEXAOCT usará o número mínimo de caracteres necessário. Casas é útil para preencher o valor retornado com 0s (zeros) à esquerda.' },
        },
    },
    IMABS: {
        description: 'Retorna o valor absoluto (módulo) de um número complexo no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna o valor absoluto (módulo) de um número complexo no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo do qual você deseja obter o valor absoluto.' },
        },
    },
    IMAGINARY: {
        description: 'Retorna o coeficiente imaginário de um número complexo no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna o coeficiente imaginário de um número complexo no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obrigatório. Um número complexo do qual se deseja obter um coeficiente imaginário.' },
        },
    },
    IMARGUMENT: {
        description: 'Retorna o argumento ), um ângulo expresso em radianos, de modo que:',
        abstract: 'Retorna o argumento ), um ângulo expresso em radianos, de modo que:',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo para o qual você deseja o argumento .' },
        },
    },
    IMCONJUGATE: {
        description: 'Retorna o conjugado complexo de um número complexo no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna o conjugado complexo de um número complexo no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo do qual se deseja encontrar o conjugado.' },
        },
    },
    IMCOS: {
        description: 'Retorna o cosseno de um número complexo no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna o cosseno de um número complexo no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo do qual se deseja obter o cosseno.' },
        },
    },
    IMCOSH: {
        description: 'Retorna um cosseno hiperbólico de um número complexo em formato de texto x+yi ou x+yj.',
        abstract: 'Retorna um cosseno hiperbólico de um número complexo em formato de texto x+yi ou x+yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo do qual se deseja obter o cosseno hiperbólico.' },
        },
    },
    IMCOT: {
        description: 'Retorna a cotangente de um número complexo em formato de texto x+yi ou x+yj.',
        abstract: 'Retorna a cotangente de um número complexo em formato de texto x+yi ou x+yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'O número complexo para o qual você deseja obter a cotangente.' },
        },
    },
    IMCOTH: {
        description: 'A função IMCOTH retorna a cotangente hiperbólica do número complexo fornecido. Por exemplo, para o número complexo "x+yi", retorna "coth(x+yi)".',
        abstract: 'A função IMCOTH retorna a cotangente hiperbólica do número complexo fornecido. Por exemplo, para o número complexo "x+yi", retorna "coth(x+yi)".',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366256?hl=pt-BR',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'O número complexo para o qual você deseja obter a cotangente hiperbólica. Pode ser o resultado de COMPLEX, um número real interpretado como complexo com parte imaginária igual a 0 ou texto no formato “x+yi”, em que x e y são numéricos.' },
        },
    },
    IMCSC: {
        description: 'Retorna a cossecante de um número complexo em formato de texto x+yi ou x+yj.',
        abstract: 'Retorna a cossecante de um número complexo em formato de texto x+yi ou x+yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obrigatório. Um número complexo do qual se deseja obter a cossecante.' },
        },
    },
    IMCSCH: {
        description: 'Devolve a cossecante hiperbólica de um número complexo no formato de texto x+yi ou x+yj.',
        abstract: 'Devolve a cossecante hiperbólica de um número complexo no formato de texto x+yi ou x+yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obrigatório. Um número complexo do qual se deseja obter a cossecante hiperbólica.' },
        },
    },
    IMDIV: {
        description: 'Retorna o quociente de dois números complexos no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna o quociente de dois números complexos no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Necessário. O numerador ou dividendo complexo.' },
            inumber2: { name: 'inumber2', detail: 'Necessário. O denominador ou divisor complexo.' },
        },
    },
    IMEXP: {
        description: 'Retorna o exponencial de um número complexo no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna o exponencial de um número complexo no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo do qual se deseja obter o exponencial.' },
        },
    },
    IMLN: {
        description: 'Retorna o logaritmo natural de um número complexo no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna o logaritmo natural de um número complexo no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo do qual se deseja obter o logaritmo natural.' },
        },
    },
    IMLOG: {
        description: 'A função IMLOG retorna o logaritmo de um número complexo para uma base especificada.',
        abstract: 'A função IMLOG retorna o logaritmo de um número complexo para uma base especificada.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366486?hl=pt-BR',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'O valor de entrada da função logaritmo. Pode ser um número simples, como 1, interpretado como real, ou texto entre aspas que especifique os coeficientes real e imaginário.' },
            base: { name: 'base', detail: 'A base usada para calcular o logaritmo. Deve ser um número real positivo.' },
        },
    },
    IMLOG10: {
        description: 'Retorna o logaritmo comum (base 10) de um número complexo no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna o logaritmo comum (base 10) de um número complexo no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obrigatório. Um número complexo do qual se deseja obter o logaritmo comum.' },
        },
    },
    IMLOG2: {
        description: 'Retorna o logaritmo de base 2 de um número complexo no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna o logaritmo de base 2 de um número complexo no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obrigatório. Um número complexo do qual se deseja obter o logaritmo de base 2.' },
        },
    },
    IMPOWER: {
        description: 'Retorna o número complexo no formato de texto x + yi ou x + yj, elevado a uma potência.',
        abstract: 'Retorna o número complexo no formato de texto x + yi ou x + yj, elevado a uma potência.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obrigatório. Um número complexo que se deseja elevar a uma potência.' },
            number: { name: 'number', detail: 'Obrigatório. A potência a que se deseja elevar o número complexo.' },
        },
    },
    IMPRODUCT: {
        description: 'Retorna o produto de 1 a 255 números complexos no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna o produto de 1 a 255 números complexos no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'De 1 a 255 números complexos a multiplicar.' },
            inumber2: { name: 'inumber2', detail: 'De 1 a 255 números complexos a multiplicar.' },
        },
    },
    IMREAL: {
        description: 'Retorna o coeficiente real de um número complexo no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna o coeficiente real de um número complexo no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo do qual se deseja obter o coeficiente real.' },
        },
    },
    IMSEC: {
        description: 'Retorna a secante de um número complexo em formato de texto x+yi ou x+yj.',
        abstract: 'Retorna a secante de um número complexo em formato de texto x+yi ou x+yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo do qual se deseja obter a secante.' },
        },
    },
    IMSECH: {
        description: 'Retorna a secante hiperbólica de um número complexo em formato de texto x+yi ou x+yj.',
        abstract: 'Retorna a secante hiperbólica de um número complexo em formato de texto x+yi ou x+yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo do qual se deseja obter a secante hiperbólica.' },
        },
    },
    IMSIN: {
        description: 'Retorna o seno de um número complexo no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna o seno de um número complexo no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo do qual se deseja obter o seno.' },
        },
    },
    IMSINH: {
        description: 'A função IMSINH devolve o seno hiperbólico de um número complexo no formato de texto x+yi ou x+yj.',
        abstract: 'A função IMSINH devolve o seno hiperbólico de um número complexo no formato de texto x+yi ou x+yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obrigatório. Um número complexo do qual se deseja obter o seno hiperbólico.' },
        },
    },
    IMSQRT: {
        description: 'Retorna a raiz quadrada de um número complexo no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna a raiz quadrada de um número complexo no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo do qual se deseja obter a raiz quadrada.' },
        },
    },
    IMSUB: {
        description: 'Retorna a diferença entre dois números complexos no formato de texto x + yi ou x + yj.',
        abstract: 'Retorna a diferença entre dois números complexos no formato de texto x + yi ou x + yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Obrigatório. O número complexo do qual se deseja subtrair inúm2.' },
            inumber2: { name: 'inumber2', detail: 'Obrigatório. O número complexo do qual se deseja subtrair de inúm1.' },
        },
    },
    IMSUM: {
        description: 'Retorna a soma de dois ou mais números complexos no formato de texto x + yi ou x + yj .',
        abstract: 'Retorna a soma de dois ou mais números complexos no formato de texto x + yi ou x + yj .',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'De 1 a 255 números complexos a somar.' },
            inumber2: { name: 'inumber2', detail: 'De 1 a 255 números complexos a somar.' },
        },
    },
    IMTAN: {
        description: 'Retorna a tangente de um número complexo em formato de texto x+yi ou x+yj.',
        abstract: 'Retorna a tangente de um número complexo em formato de texto x+yi ou x+yj.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Necessário. Um número complexo do qual se deseja obter a tangente.' },
        },
    },
    IMTANH: {
        description: 'A função IMTANH retorna a tangente hiperbólica do número complexo fornecido. Por exemplo, para o número complexo "x+yi", retorna "tanh(x+yi)".',
        abstract: 'A função IMTANH retorna a tangente hiperbólica do número complexo fornecido. Por exemplo, para o número complexo "x+yi", retorna "tanh(x+yi)".',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366655?hl=pt-BR',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'O número complexo para o qual você deseja obter a tangente hiperbólica. Pode ser o resultado de COMPLEX, um número real interpretado como complexo com parte imaginária igual a 0 ou texto no formato “x+yi”, em que x e y são numéricos.' },
        },
    },
    OCT2BIN: {
        description: 'Converte um número octal em binário.',
        abstract: 'Converte um número octal em binário.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número octal que você deseja converter. O número não pode conter mais que 10 caracteres. O bit mais significativo do número é o bit de sinal. Os outros 29 bits são bits de magnitudes. Os números negativos são representados com o uso de notação de complemento a dois.' },
            places: { name: 'places', detail: 'Opcional. O número de caracteres a ser usado. Se casas for omitido, OCTABIN usará o número mínimo de caracteres necessário. Casas é útil para preencher o valor retornado com 0 (zeros) à esquerda.' },
        },
    },
    OCT2DEC: {
        description: 'Converte um número octal em decimal.',
        abstract: 'Converte um número octal em decimal.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número octal que você deseja converter. Núm não pode conter mais de 10 caracteres octais (30 bits). Os bits mais significativos de núm é o bit de sinal. Os outros 29 bits são bits de magnitudes. Os números negativos são representados com o uso de notação de complemento a dois.' },
        },
    },
    OCT2HEX: {
        description: 'Converte um número octal em hexadecimal.',
        abstract: 'Converte um número octal em hexadecimal.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número octal que você deseja converter. Núm não pode conter mais de 10 caracteres octais (30 bits). Os bits mais significativos de núm é o bit de sinal. Os outros 29 bits são bits de magnitudes. Os números negativos são representados com o uso de notação de complemento a dois.' },
            places: { name: 'places', detail: 'Opcional. O número de caracteres a ser usado. Se casas for omitido, OCTAHEX usará o número mínimo de caracteres necessário. Casas é útil para preencher o valor retornado com 0 (zeros) à esquerda.' },
        },
    },
};

export default locale;
