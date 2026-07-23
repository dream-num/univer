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
        description: 'Retorna o valor absoluto de um número. Esse valor é o número sem o seu sinal.',
        abstract: 'Retorna o valor absoluto de um número. Esse valor é o número sem o seu sinal.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número real cujo valor absoluto você deseja obter.' },
        },
    },
    ACOS: {
        description: 'Retorna o arco cosseno ou o cosseno inverso de um número. O arco cosseno é o ângulo cujo cosseno é núm . O ângulo retornado é fornecido em radianos no intervalo de 0 (zero) a pi.',
        abstract: 'Retorna o arco cosseno ou o cosseno inverso de um número. O arco cosseno é o ângulo cujo cosseno é núm . O ângulo retornado é fornecido em radianos no intervalo de 0 (zero) a pi.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O cosseno do ângulo desejado e deve estar entre -1 e 1.' },
        },
    },
    ACOSH: {
        description: 'Retorna o cosseno hiperbólico inverso de um número. O número deve ser maior ou igual a 1. O cosseno hiperbólico inverso é o valor cujo cosseno hiperbólico é núm , de modo que ACOSH(COSH(núm)) é igual a núm .',
        abstract: 'Retorna o cosseno hiperbólico inverso de um número. O número deve ser maior ou igual a 1. O cosseno hiperbólico inverso é o valor cujo cosseno hiperbólico é núm , de modo que ACOSH(COSH(núm)) é igual a núm .',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Qualquer número real maior ou igual a 1.' },
        },
    },
    ACOT: {
        description: 'Retorna o valor principal do arco cotangente, ou cotangente inverso, de um número.',
        abstract: 'Retorna o valor principal do arco cotangente, ou cotangente inverso, de um número.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número é o cotangente do ângulo desejado. Esse deve ser um número real.' },
        },
    },
    ACOTH: {
        description: 'Retorna o cotangente hiperbólico inverso de um número.',
        abstract: 'Retorna o cotangente hiperbólico inverso de um número.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'O valor absoluto de número deve ser maior que 1.' },
        },
    },
    AGGREGATE: {
        description: 'Retorna uma agregação em uma lista ou banco de dados. A função AGREGAR pode aplicar diferentes funções de agregação a uma lista ou a um banco de dados com a opção de ignorar linhas ocultas e valores de erro.',
        abstract: 'Retorna uma agregação em uma lista ou banco de dados. A função AGREGAR pode aplicar diferentes funções de agregação a uma lista ou a um banco de dados com a opção de ignorar linhas ocultas e valores de erro.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Obrigatório. Um número de 1 a 19 que especifica qual função usar.' },
            options: { name: 'options', detail: 'Obrigatório. Um valor numérico que determina quais valores ignorar no intervalo de avaliação da função. Observação A função não ignorará linhas ocultas, subtotais aninhados ou agregados aninhados se o argumento de matriz incluir um cálculo, por exemplo: =AGREGAR(14;3;A1:A100*(A1:A100>0),1)' },
            ref1: { name: 'ref1', detail: 'Obrigatório. O primeiro argumento numérico para funções que usam vários argumentos numéricos para os quais você quer agregar o valor.' },
            ref2: { name: 'ref2', detail: 'Opcional. Argumentos numéricos de 2 a 253 dos quais você quer o valor de agregação. Para funções que usam uma matriz, ref1 é uma matriz, uma fórmula de matriz ou uma referência a um intervalo de células das quais você quer o valor de agregação. Ref2 é um segundo argumento requerido para certas funções. As funções a seguir requerem um argumento ref2:' },
        },
    },
    ARABIC: {
        description: 'Converte um algarismo romano em um arábico.',
        abstract: 'Converte um algarismo romano em um arábico.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. Uma cadeia de caracteres entre aspas, uma cadeia de caracteres vazia("") ou uma referência a uma célula que contém texto.' },
        },
    },
    ASIN: {
        description: 'Retorna o arco seno ou o seno inverso de um número. O arco seno é o ângulo cujo seno é núm . O ângulo retornado é fornecido em radianos no intervalo de -pi/2 a pi/2.',
        abstract: 'Retorna o arco seno ou o seno inverso de um número. O arco seno é o ângulo cujo seno é núm . O ângulo retornado é fornecido em radianos no intervalo de -pi/2 a pi/2.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O seno do ângulo desejado e deve estar entre -1 e 1.' },
        },
    },
    ASINH: {
        description: 'Retorna o seno hiperbólico inverso de um número. O seno hiperbólico inverso é o valor cujo seno hiperbólico é núm , de modo que ASENH(SENH(núm)) é igual a núm .',
        abstract: 'Retorna o seno hiperbólico inverso de um número. O seno hiperbólico inverso é o valor cujo seno hiperbólico é núm , de modo que ASENH(SENH(núm)) é igual a núm .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Qualquer número real.' },
        },
    },
    ATAN: {
        description: 'Retorna o arco tangente, ou a tangente inversa, de um número. O arco tangente é o ângulo cuja tangente é núm . O ângulo retornado é fornecido em radianos no intervalo -pi/2 a pi/2.',
        abstract: 'Retorna o arco tangente, ou a tangente inversa, de um número. O arco tangente é o ângulo cuja tangente é núm . O ângulo retornado é fornecido em radianos no intervalo -pi/2 a pi/2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. A tangente do ângulo desejado.' },
        },
    },
    ATAN2: {
        description: 'Retorna o arco tangente, ou a tangente inversa, das coordenadas x e y especificadas. O arco tangente é o ângulo entre eixo x e uma linha que contém a origem (0, 0) e um ponto com coordenadas (núm_x; núm_y). O ângulo é fornecido em radianos entre -pi e pi, excluindo -pi.',
        abstract: 'Retorna o arco tangente, ou a tangente inversa, das coordenadas x e y especificadas. O arco tangente é o ângulo entre eixo x e uma linha que contém a origem (0, 0) e um ponto com coordenadas (núm_x; núm_y). O ângulo é fornecido em radianos entre -pi e pi, excluindo -pi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_num', detail: 'Obrigatório. A coordenada x do ponto.' },
            yNum: { name: 'y_num', detail: 'Obrigatório. A coordenada y do ponto.' },
        },
    },
    ATANH: {
        description: 'Retorna a tangente hiperbólica inversa de um número. O número deve estar entre -1 e 1 (excluindo -1 e 1). A tangente hiperbólica inversa é o valor cuja tangente hiperbólica é núm , de modo que ATANH(TANH(núm)) é igual a núm .',
        abstract: 'Retorna a tangente hiperbólica inversa de um número. O número deve estar entre -1 e 1 (excluindo -1 e 1). A tangente hiperbólica inversa é o valor cuja tangente hiperbólica é núm , de modo que ATANH(TANH(núm)) é igual a núm .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Qualquer número real entre 1 e -1.' },
        },
    },
    BASE: {
        description: 'Converte um número em uma representação de texto com a base fornecida.',
        abstract: 'Converte um número em uma representação de texto com a base fornecida.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número que você deseja converter. Deve ser um número inteiro maior que ou igual a 0 e menor que 2^53.' },
            radix: { name: 'radix', detail: 'Obrigatório. A base para a qual você deseja converter o número. Deve ser um número inteiro maior que ou igual a 2 e menor que ou igual a 36.' },
            minLength: { name: 'min_length', detail: 'Opcional. A extensão mínima da cadeia de caracteres retornada. Deve ser um número inteiro maior que ou igual a 0.' },
        },
    },
    CEILING: {
        description: 'Retorna um núm arredondado para cima, afastando-o de zero, até o múltiplo mais próximo de significância. Por exemplo, se quiser evitar usar centavos nos preços e o seu produto custar $ 4,42, use a fórmula =TETO(4;42;0;05) para arredondar os preços para cima até o valor inteiro mais próximo.',
        abstract: 'Retorna um núm arredondado para cima, afastando-o de zero, até o múltiplo mais próximo de significância. Por exemplo, se quiser evitar usar centavos nos preços e o seu produto custar $ 4,42, use a fórmula =TETO(4;42;0;05) para arredondar os preços para cima até o valor inteiro mais próximo.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O valor que você deseja arredondar.' },
            significance: { name: 'significance', detail: 'Obrigatório. O múltiplo para o qual você deseja arredondar.' },
        },
    },
    CEILING_MATH: {
        description: 'O TETO. A função MATH arredonda um número até o inteiro mais próximo ou, opcionalmente, para o múltiplo de significado mais próximo.',
        abstract: 'O TETO. A função MATH arredonda um número até o inteiro mais próximo ou, opcionalmente, para o múltiplo de significado mais próximo.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Necessário. (deve estar entre -2.229E-308.e 9.99E+307.)' },
            significance: { name: 'significance', detail: 'Opcional. Esse é o número de dígitos significativos após o ponto decimal para o qual o número deve ser arredondado.' },
            mode: { name: 'mode', detail: 'Opcional. Isso controla se os números negativos são arredondados para ou longe de zero.' },
        },
    },
    CEILING_PRECISE: {
        description: 'Retorna um número que é arredondado para o inteiro mais próximo ou para o múltiplo mais próximo de significância. Independentemente do sinal de núm, um valor será arredondado. No entanto, se núm ou significância for zero, zero será retornado.',
        abstract: 'Retorna um número que é arredondado para o inteiro mais próximo ou para o múltiplo mais próximo de significância. Independentemente do sinal de núm, um valor será arredondado. No entanto, se núm ou significância for zero, zero será retornado.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O valor a ser arredondado.' },
            significance: { name: 'significance', detail: 'Opcional. O múltiplo para o qual o número será arredondado. Se a significância for omitida, o valor padrão será 1.' },
        },
    },
    COMBIN: {
        description: 'Retorna o número de combinações de um determinado número de itens. Use COMBIN para determinar o número total possível de grupos para determinado número de objetos.',
        abstract: 'Retorna o número de combinações de um determinado número de itens. Use COMBIN para determinar o número total possível de grupos para determinado número de objetos.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número de itens.' },
            numberChosen: { name: 'number_chosen', detail: 'Necessário. O número de itens em cada combinação.' },
        },
    },
    COMBINA: {
        description: 'Retorna o número de combinações (com repetições) de um determinado número de itens.',
        abstract: 'Retorna o número de combinações (com repetições) de um determinado número de itens.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Deve ser maior que ou igual a 0 e maior que ou igual a Núm_escolhido. Os valores que não forem inteiros serão truncados.' },
            numberChosen: { name: 'number_chosen', detail: 'Necessário. Deve ser maior que ou igual a 0. Os valores que não forem inteiros serão truncados.' },
        },
    },
    COS: {
        description: 'Retorna o cosseno do ângulo dado.',
        abstract: 'Retorna o cosseno do ângulo dado.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O ângulo em radianos cujo cosseno você deseja obter.' },
        },
    },
    COSH: {
        description: 'Retorna o cosseno hiperbólico de um número.',
        abstract: 'Retorna o cosseno hiperbólico de um número.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Qualquer número real cujo cosseno hiperbólico você deseja calcular.' },
        },
    },
    COT: {
        description: 'Retorna o cotangente de um ângulo especificado em radianos.',
        abstract: 'Retorna o cotangente de um ângulo especificado em radianos.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O ângulo em radianos para o qual você deseja o cotangente.' },
        },
    },
    COTH: {
        description: 'Devolver a cotangente hiperbólica de um ângulo hiperbólico.',
        abstract: 'Devolver a cotangente hiperbólica de um ângulo hiperbólico.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório.' },
        },
    },
    CSC: {
        description: 'Retorna a cossecante de um ângulo especificado em radianos.',
        abstract: 'Retorna a cossecante de um ângulo especificado em radianos.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório.' },
        },
    },
    CSCH: {
        description: 'Retorna a hiperbólica da cossecante de um ângulo especificado em radianos.',
        abstract: 'Retorna a hiperbólica da cossecante de um ângulo especificado em radianos.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório.' },
        },
    },
    DECIMAL: {
        description: 'Converte uma representação de texto de um número em uma determinada base em um número decimal.',
        abstract: 'Converte uma representação de texto de um número em uma determinada base em um número decimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório.' },
            radix: { name: 'radix', detail: 'Necessário. O radix deve ser um número inteiro.' },
        },
    },
    DEGREES: {
        description: 'Converte radianos em graus.',
        abstract: 'Converte radianos em graus.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Necessário. O ângulo em radianos que se deseja converter.' },
        },
    },
    EVEN: {
        description: 'Retorna o núm arredondado para o inteiro par mais próximo. Esta função pode ser usada para processar itens que aparecem em pares. Por exemplo, um engradado aceita fileiras de um ou dois itens. O engradado está cheio quando o número de itens, arredondado para mais até o par mais próximo, preencher sua capacidade.',
        abstract: 'Retorna o núm arredondado para o inteiro par mais próximo. Esta função pode ser usada para processar itens que aparecem em pares. Por exemplo, um engradado aceita fileiras de um ou dois itens. O engradado está cheio quando o número de itens, arredondado para mais até o par mais próximo, preencher sua capacidade.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O valor a ser arredondado.' },
        },
    },
    EXP: {
        description: 'Retorna e elevado à potência de núm. A constante e é igual a 2,71828182845904, a base do logaritmo natural.',
        abstract: 'Retorna e elevado à potência de núm. A constante e é igual a 2,71828182845904, a base do logaritmo natural.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O expoente aplicado à base e.' },
        },
    },
    FACT: {
        description: 'Retorna o FATORIALrial de um número. O FATORIALrial de um número é igual ao número 1*2*3*...*.',
        abstract: 'Retorna o FATORIALrial de um número. O FATORIALrial de um número é igual ao número 1*2*3*...*.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número não negativo para o qual você deseja obter o FATORIALrial. Se o número não for um inteiro, ele será truncado.' },
        },
    },
    FACTDOUBLE: {
        description: 'Retorna o fatorial duplo de um número.',
        abstract: 'Retorna o fatorial duplo de um número.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O valor para o qual você deseja retornar o fatorial duplo. Se núm não for um inteiro, será truncado.' },
        },
    },
    FLOOR: {
        description: 'A função FLOOR no Excel arredonda um número especificado para baixo para o múltiplo de significado especificado mais próximo. Os números negativos são arredondados para baixo (mais negativos) para vários inteiros mais próximos abaixo de zero.',
        abstract: 'A função FLOOR no Excel arredonda um número especificado para baixo para o múltiplo de significado especificado mais próximo. Os números negativos são arredondados para baixo (mais negativos) para vários inteiros mais próximos abaixo de zero.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O valor numérico que você deseja arredondar.' },
            significance: { name: 'significance', detail: 'Necessário. O múltiplo para o qual você deseja arredondar.' },
        },
    },
    FLOOR_MATH: {
        description: 'Arredonda um número para baixo, para o número inteiro mais próximo ou para o próximo múltiplo significativo.',
        abstract: 'Arredonda um número para baixo, para o número inteiro mais próximo ou para o próximo múltiplo significativo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número a ser arredondado para baixo.' },
            significance: { name: 'significance', detail: 'Opcional. O múltiplo para o qual você deseja arredondar.' },
            mode: { name: 'mode', detail: 'Opcional. A direção (aproximando-se ou afastando-se de 0) na qual os números negativos devem ser arredondados.' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Retorna um número que é arredondado para baixo para o inteiro mais próximo ou para o múltiplo mais próximo de significância. Independentemente do sinal do número, ele será arredondado para baixo. No entanto, se o número ou a significância for zero, zero será retornado.',
        abstract: 'Retorna um número que é arredondado para baixo para o inteiro mais próximo ou para o múltiplo mais próximo de significância. Independentemente do sinal do número, ele será arredondado para baixo. No entanto, se o número ou a significância for zero, zero será retornado.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O valor a ser arredondado.' },
            significance: { name: 'significance', detail: 'Opcional. O múltiplo para o qual o número será arredondado. Se a significância for omitida, o valor padrão será 1.' },
        },
    },
    GCD: {
        description: 'Retorna o máximo divisor comum de dois ou mais inteiros. O máximo divisor comum é o maior inteiro que divide núm1 e núm2 sem resto.',
        abstract: 'Retorna o máximo divisor comum de dois ou mais inteiros. O máximo divisor comum é o maior inteiro que divide núm1 e núm2 sem resto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Número1 é necessário, números subsequentes são opcionais. Valores de 1 a 255. Se o valor não for um inteiro, será truncado.' },
            number2: { name: 'number2', detail: 'Número1 é necessário, números subsequentes são opcionais. Valores de 1 a 255. Se o valor não for um inteiro, será truncado.' },
        },
    },
    INT: {
        description: 'Arredonda um número para baixo até o número inteiro mais próximo.',
        abstract: 'Arredonda um número para baixo até o número inteiro mais próximo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número real que se deseja arredondar para baixo até um inteiro.' },
        },
    },
    ISO_CEILING: {
        description: 'Retorna um número que é arredondado para o inteiro mais próximo ou para o múltiplo mais próximo de significância. Independentemente do sinal de núm, um valor será arredondado. No entanto, se núm ou significância for zero, zero será retornado.',
        abstract: 'Retorna um número que é arredondado para o inteiro mais próximo ou para o múltiplo mais próximo de significância. Independentemente do sinal de núm, um valor será arredondado. No entanto, se núm ou significância for zero, zero será retornado.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O valor a ser arredondado.' },
            significance: { name: 'significance', detail: 'Opcional. O múltiplo para o qual o número será arredondado. Se a significância for omitida, o valor padrão será 1.' },
        },
    },
    LCM: {
        description: 'Retorna o mínimo múltiplo comum de inteiros. O mínimo múltiplo comum é o menor inteiro positivo múltiplo de todos os argumentos inteiros núm1, núm 2, e assim por diante. Use MMC para incluir frações com denominadores diferentes.',
        abstract: 'Retorna o mínimo múltiplo comum de inteiros. O mínimo múltiplo comum é o menor inteiro positivo múltiplo de todos os argumentos inteiros núm1, núm 2, e assim por diante. Use MMC para incluir frações com denominadores diferentes.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Número1 é necessário, números subsequentes são opcionais. Valores de 1 a 255 para os quais você deseja obter o mínimo múltiplo comum. Se o valor não for um inteiro, será truncado.' },
            number2: { name: 'number2', detail: 'Número1 é necessário, números subsequentes são opcionais. Valores de 1 a 255 para os quais você deseja obter o mínimo múltiplo comum. Se o valor não for um inteiro, será truncado.' },
        },
    },
    LN: {
        description: 'Retorna o logaritmo natural de um número. Os logaritmos naturais se baseiam na constante e (2,71828182845904).',
        abstract: 'Retorna o logaritmo natural de um número. Os logaritmos naturais se baseiam na constante e (2,71828182845904).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número real positivo para o qual você deseja obter o logaritmo natural.' },
        },
    },
    LOG: {
        description: 'Retorna o logaritmo de um número de uma base especificada.',
        abstract: 'Retorna o logaritmo de um número de uma base especificada.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número real positivo para o qual você deseja obter o logaritmo.' },
            base: { name: 'base', detail: 'Opcional. A base do logaritmo. Se base for omitido, será considerado 10.' },
        },
    },
    LOG10: {
        description: 'Retorna o logaritmo de base 10 de um número.',
        abstract: 'Retorna o logaritmo de base 10 de um número.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número real positivo para o qual você deseja obter o logaritmo na base 10.' },
        },
    },
    MDETERM: {
        description: 'Retorna o determinante de uma matriz de uma variável do tipo matriz.',
        abstract: 'Retorna o determinante de uma matriz de uma variável do tipo matriz.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Necessário. Uma matriz numérica com um número igual de linhas e colunas.' },
        },
    },
    MINVERSE: {
        description: 'A função MINVERSE devolve a matriz inversa de uma matriz armazenada numa matriz.',
        abstract: 'A função MINVERSE devolve a matriz inversa de uma matriz armazenada numa matriz.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obrigatório. Uma matriz numérica com um número igual de linhas e colunas.' },
        },
    },
    MMULT: {
        description: 'A função MMULT retorna o produto de matriz de duas matrizes. O resultado é uma matriz com o mesmo número de linhas que matriz1 e com o mesmo número de colunas que matriz2.',
        abstract: 'A função MMULT retorna o produto de matriz de duas matrizes. O resultado é uma matriz com o mesmo número de linhas que matriz1 e com o mesmo número de colunas que matriz2.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'As matrizes que você deseja multiplicar.' },
            array2: { name: 'array2', detail: 'As matrizes que você deseja multiplicar.' },
        },
    },
    MOD: {
        description: 'Retorna o resto depois da divisão de número por divisor. O resultado possui o mesmo sinal que divisor.',
        abstract: 'Retorna o resto depois da divisão de número por divisor. O resultado possui o mesmo sinal que divisor.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número para o qual você deseja encontrar o resto.' },
            divisor: { name: 'divisor', detail: 'Necessário. O número pelo qual você deseja dividir o número.' },
        },
    },
    MROUND: {
        description: 'MROUND devolve um número arredondado para o múltiplo pretendido.',
        abstract: 'MROUND devolve um número arredondado para o múltiplo pretendido.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O valor a ser arredondado.' },
            multiple: { name: 'multiple', detail: 'Obrigatório. O múltiplo para o qual se deseja arredondar núm.' },
        },
    },
    MULTINOMIAL: {
        description: 'Retorna a razão do fatorial de uma soma de valores para o produto de fatoriais.',
        abstract: 'Retorna a razão do fatorial de uma soma de valores para o produto de fatoriais.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Número1 é necessário, números subsequentes são opcionais. De 1 a 255 cujo multinominal você deseja obter.' },
            number2: { name: 'number2', detail: 'Número1 é necessário, números subsequentes são opcionais. De 1 a 255 cujo multinominal você deseja obter.' },
        },
    },
    MUNIT: {
        description: 'A função MUNIT devolve a matriz de unidades para a dimensão especificada.',
        abstract: 'A função MUNIT devolve a matriz de unidades para a dimensão especificada.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'dimension', detail: 'Um inteiro que especifica a dimensão da matriz identidade a retornar. Retorna uma matriz e a dimensão deve ser maior que zero.' },
        },
    },
    ODD: {
        description: 'Retorna o número arredondado para cima até o inteiro ímpar mais próximo.',
        abstract: 'Retorna o número arredondado para cima até o inteiro ímpar mais próximo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Necessário. O valor a ser arredondado.' },
        },
    },
    PI: {
        description: 'Retorna o número 3,14159265358979, a constante matemática pi, com precisão de até 15 dígitos.',
        abstract: 'Retorna o número 3,14159265358979, a constante matemática pi, com precisão de até 15 dígitos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'Fornece o resultado de um número elevado a uma potência.',
        abstract: 'Fornece o resultado de um número elevado a uma potência.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número base. Pode ser qualquer número real.' },
            power: { name: 'power', detail: 'Necessário. O expoente para o qual a base é elevada.' },
        },
    },
    PRODUCT: {
        description: 'A função MULT multiplica todos os números dados como argumentos e retorna o produto. Por exemplo, se as células A1 e A2 contiverem números, você poderá usar a fórmula =PRODUCT(A1, A2) para multiplicar esses dois números juntos. Você também pode executar a mesma operação usando o operador matemático ( * ); por exemplo, =A1 * A2 .',
        abstract: 'A função MULT multiplica todos os números dados como argumentos e retorna o produto. Por exemplo, se as células A1 e A2 contiverem números, você poderá usar a fórmula =PRODUCT(A1, A2) para multiplicar esses dois números juntos. Você também pode executar a mesma operação usando o operador matemático ( * ); por exemplo, =A1 * A2 .',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Necessário. O primeiro número ou intervalo que você deseja multiplicar.' },
            number2: { name: 'number2', detail: 'Opcional. Números ou intervalos adicionais que você deseja multiplicar, até um máximo de 255 argumentos.' },
        },
    },
    QUOTIENT: {
        description: 'Retorna a parte inteira de uma divisão. Use esta função para descartar o resto de uma divisão.',
        abstract: 'Retorna a parte inteira de uma divisão. Use esta função para descartar o resto de uma divisão.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'numerator', detail: 'Obrigatório. O dividendo.' },
            denominator: { name: 'denominator', detail: 'Obrigatório. O divisor.' },
        },
    },
    RADIANS: {
        description: 'Converte graus em radianos.',
        abstract: 'Converte graus em radianos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Necessário. Um ângulo em graus que você deseja converter.' },
        },
    },
    RAND: {
        description: 'ALEATÓRIO retorna um número aleatório real maior que ou igual a 0 e menor que 1 distribuído uniformemente. Um novo número aleatório real é retornado sempre que a planilha é calculada.',
        abstract: 'ALEATÓRIO retorna um número aleatório real maior que ou igual a 0 e menor que 1 distribuído uniformemente. Um novo número aleatório real é retornado sempre que a planilha é calculada.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'Nos exemplos a seguir, foi criada uma matriz de 5 linhas de altura e 3 colunas de largura. O primeiro retorna um conjunto de valores aleatório entre 0 e 1, que é o comportamento padrão da MATRIZALEATÓRIA. O segundo retorna uma série de valores decimais aleatórios entre 1 e 100. Por fim, o terceiro exemplo retorna uma série de números inteiros aleatórios entre 1 e 100.',
        abstract: 'Nos exemplos a seguir, foi criada uma matriz de 5 linhas de altura e 3 colunas de largura. O primeiro retorna um conjunto de valores aleatório entre 0 e 1, que é o comportamento padrão da MATRIZALEATÓRIA. O segundo retorna uma série de valores decimais aleatórios entre 1 e 100. Por fim, o terceiro exemplo retorna uma série de números inteiros aleatórios entre 1 e 100.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'O número de linhas a serem retornadas' },
            columns: { name: 'columns', detail: 'O número de colunas a serem retornadas' },
            min: { name: 'min', detail: 'O número mínimo que você deseja que seja retornado' },
            max: { name: 'max', detail: 'O número máximo que você deseja que seja retornada' },
            wholeNumber: { name: 'whole_number', detail: 'Retornar um número inteiro ou um valor decimal VERDADEIRO para um número inteiro FALSE para um número decimal' },
        },
    },
    RANDBETWEEN: {
        description: 'Retorna um número aleatório inteiro entre os números especificados. Um novo número aleatório inteiro será retornado sempre que a planilha for calculada.',
        abstract: 'Retorna um número aleatório inteiro entre os números especificados. Um novo número aleatório inteiro será retornado sempre que a planilha for calculada.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'bottom', detail: 'Obrigatório. O menor inteiro que ALEATÓRIOENTRE retornará.' },
            top: { name: 'top', detail: 'Obrigatório. O maior inteiro que ALEATÓRIOENTRE retornará.' },
        },
    },
    ROMAN: {
        description: 'Converte um algarismo arábico em romano, como texto.',
        abstract: 'Converte um algarismo arábico em romano, como texto.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O algarismo arábico a ser convertido.' },
            form: { name: 'form', detail: 'Opcional. O algarismo que especifica o tipo de algarismo romano desejado. O estilo do algarismo romano varia de clássico a simplificado, tornando-se mais conciso à medida que o valor da forma aumenta. Consulte o exemplo de ROMANO(499,0) seguinte.' },
        },
    },
    ROUND: {
        description: 'A função ARRED arredonda um número para um número especificado de dígitos. Por exemplo, se a célula A1 contiver 23,7825 e você quiser arredondar esse valor para duas casas decimais, poderá usar a seguinte fórmula:',
        abstract: 'A função ARRED arredonda um número para um número especificado de dígitos. Por exemplo, se a célula A1 contiver 23,7825 e você quiser arredondar esse valor para duas casas decimais, poderá usar a seguinte fórmula:',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número que você deseja arredondar.' },
            numDigits: { name: 'num_digits', detail: 'Obrigatório. O número de dígitos para o qual você deseja arredondar o argumento número.' },
        },
    },
    ROUNDBANK: {
        description: 'Arredonda um número pelo método de arredondamento bancário.',
        abstract: 'Arredonda um número pelo método de arredondamento bancário.',
        links: [
            {
                title: 'Instruction',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'O número que você deseja arredondar pelo método de arredondamento bancário.' },
            numDigits: { name: 'num_digits', detail: 'O número de dígitos para o qual você deseja arredondar pelo método de arredondamento bancário.' },
        },
    },
    ROUNDDOWN: {
        description: 'Arredonda um número para baixo até zero.',
        abstract: 'Arredonda um número para baixo até zero.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Qualquer número real que se deseja arredondar para baixo.' },
            numDigits: { name: 'num_digits', detail: 'Obrigatório. O número de dígitos para o qual se deseja arredondar núm.' },
        },
    },
    ROUNDUP: {
        description: 'Arredonda um número para cima afastando-o de zero.',
        abstract: 'Arredonda um número para cima afastando-o de zero.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Qualquer número real que se deseja arredondar para cima.' },
            numDigits: { name: 'num_digits', detail: 'Obrigatório. O número de dígitos para o qual se deseja arredondar núm.' },
        },
    },
    SEC: {
        description: 'Retorna a secante de um ângulo.',
        abstract: 'Retorna a secante de um ângulo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'O ângulo em radianos para o qual você deseja obter a secante.' },
        },
    },
    SECH: {
        description: 'Retorna a secante hiperbólica de um ângulo.',
        abstract: 'Retorna a secante hiperbólica de um ângulo.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'O ângulo em radianos para o qual você deseja obter a secante hiperbólica.' },
        },
    },
    SERIESSUM: {
        description: 'Muitas funções podem ser aproximadas por uma expansão da série polinomial.',
        abstract: 'Muitas funções podem ser aproximadas por uma expansão da série polinomial.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor de entrada da série polinomial.' },
            n: { name: 'n', detail: 'Obrigatório. A potência inicial à qual você deseja elevar x.' },
            m: { name: 'm', detail: 'Obrigatório. O passo pelo qual se acrescenta n a cada termo na sequência.' },
            coefficients: { name: 'coefficients', detail: 'Necessário. Um conjunto de coeficientes pelo qual cada potência de x é multiplicada. O número de valores em coeficientes determina o número de termos na série polinomial. Por exemplo, se houver três valores em coeficientes, haverá três termos na série polinomial.' },
        },
    },
    SEQUENCE: {
        description: 'No exemplo a seguir, criamos uma matriz de 4 linhas de altura por 5 colunas de largura usando a fórmula =SEQUÊNCIA(4;5) .',
        abstract: 'No exemplo a seguir, criamos uma matriz de 4 linhas de altura por 5 colunas de largura usando a fórmula =SEQUÊNCIA(4;5) .',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'O número de linhas a serem retornadas' },
            columns: { name: 'columns', detail: 'O número de colunas a serem retornadas' },
            start: { name: 'start', detail: 'O primeiro número na sequência' },
            step: { name: 'step', detail: 'O valor a ser aumentado a cada valor subsequente na matriz' },
        },
    },
    SIGN: {
        description: 'Determina o sinal de um número. Fornece 1 se núm for positivo, zero (0) se núm for 0, e -1 se núm for negativo.',
        abstract: 'Determina o sinal de um número. Fornece 1 se núm for positivo, zero (0) se núm for 0, e -1 se núm for negativo.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Qualquer número real.' },
        },
    },
    SIN: {
        description: 'Retorna o seno de um ângulo dado.',
        abstract: 'Retorna o seno de um ângulo dado.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O ângulo em radianos para o qual você deseja obter o seno.' },
        },
    },
    SINH: {
        description: 'Retorna o seno hiperbólico de um número.',
        abstract: 'Retorna o seno hiperbólico de um número.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Qualquer número real.' },
        },
    },
    SQRT: {
        description: 'Retorna uma raiz quadrada positiva.',
        abstract: 'Retorna uma raiz quadrada positiva.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número do qual você deseja obter a raiz quadrada.' },
        },
    },
    SQRTPI: {
        description: 'Retorna a raiz quadrada de (núm* pi).',
        abstract: 'Retorna a raiz quadrada de (núm* pi).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número pelo qual se multiplica pi.' },
        },
    },
    SUBTOTAL: {
        description: 'Retorna um subtotal em uma lista ou em um banco de dados. É geralmente mais fácil criar uma lista com subtotais usando o comando Subtotais , grupo Contorno , na guia Dados no aplicativo de desktop do Excel. Assim que a lista de subtotais for criada, você poderá modificá-la editando a função SUBTOTAL.',
        abstract: 'Retorna um subtotal em uma lista ou em um banco de dados. É geralmente mais fácil criar uma lista com subtotais usando o comando Subtotais , grupo Contorno , na guia Dados no aplicativo de desktop do Excel. Assim que a lista de subtotais for criada, você poderá modificá-la editando a função SUBTOTAL.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Necessário. O número 1-11 ou 101-111 que especifica a função a ser usada para o subtotal. 1-11 inclui linhas ocultas manualmente, enquanto 101-111 as exclui; células filtradas sempre são excluídas.' },
            ref1: { name: 'ref1', detail: 'Necessário. O primeiro intervalo nomeado ou referência cujo subtotal você deseja.' },
            ref2: { name: 'ref2', detail: 'Opcional. Intervalos nomeados ou referências de 2 a 254 cujo subtotal você deseja.' },
        },
    },
    SUM: {
        description: 'A função SUM adiciona valores. É possível adicionar valores individuais, referências de célula ou intervalos, ou uma mistura dos três.',
        abstract: 'A função SUM adiciona valores. É possível adicionar valores individuais, referências de célula ou intervalos, ou uma mistura dos três.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: { name: 'Number 1', detail: 'O primeiro número que você deseja somar. O número pode ser como 4, uma referência de célula como B6 ou um intervalo de células como B2:B8.' },
            number2: { name: 'Number 2', detail: 'Este é o segundo número que você deseja somar. Você pode especificar até 255 números adicionais dessa maneira.' },
        },
    },
    SUMIF: {
        description: 'Você usa a função SUMIF para resumir os valores em um intervalo que atenda aos critérios especificados. Por exemplo, suponha que em uma coluna que contém números, você deseja somar apenas os valores maiores que 5. Você pode usar a seguinte fórmula: =SUMIF(B2:B25">5")',
        abstract: 'Você usa a função SUMIF para resumir os valores em um intervalo que atenda aos critérios especificados. Por exemplo, suponha que em uma coluna que contém números, você deseja somar apenas os valores maiores que 5. Você pode usar a seguinte fórmula: =SUMIF(B2:B25">5")',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Necessário. O intervalo de células que se deseja calcular por critérios. As células em cada intervalo devem ser números ou nomes, matrizes ou referências que contêm números. Espaços em branco e valores de texto são ignorados. O intervalo selecionado deve conter datas no formato padrão do Excel (exemplos abaixo).' },
            criteria: { name: 'criteria', detail: 'Necessário. Os critérios na forma de um número, expressão, referência de célula, texto ou função que define quais células serão adicionadas. Caracteres curinga podem ser incluídos – um ponto de interrogação (?) para corresponder a qualquer caractere, um asterisco (*) para corresponder a qualquer sequência de caracteres. Se você quiser encontrar um ponto de interrogação ou um asterisco real, digite um bloco ( ~ ) anterior ao caractere. Por exemplo, os critérios podem ser expressos como 32, ">32", B5, "3?", "apple*", "*~?", ou TODAY(). Importante Qualquer critério de texto ou qualquer critério que inclua símbolos lógicos ou matemáticos deve estar entre aspas duplas ( " ). Se os critérios forem numéricos, as aspas duplas não serão necessárias.' },
            sumRange: { name: 'sum_range', detail: 'Opcional. As células reais a serem adicionadas, se você quiser adicionar células diferentes daquelas especificadas no argumento de intervalo . Se o argumento sum_range for omitido, o Excel adicionará as células especificadas no argumento de intervalo (as mesmas células às quais os critérios são aplicados). Sum_range deve ter o mesmo tamanho e forma que o intervalo . Se não for, o desempenho poderá sofrer, e a fórmula somará um intervalo de células que começa com a primeira célula em sum_range , mas tem as mesmas dimensões que o intervalo . Por exemplo: intervalo intervalo_soma Células resumidas reais A1:A5 B1:B5 B1:B5 A1:A5 B1:K5 B1:B5' },
        },
    },
    SUMIFS: {
        description: 'A função SOMASES, uma das funções de matemática e trigonometria , adiciona todos os seus argumentos que atendem a vários critérios. Por exemplo, você usaria SOMASES para somar o número de varejistas no país/região que (1) residem em um único CEP e (2) cujos lucros excedem um valor específico em dólar.',
        abstract: 'A função SOMASES, uma das funções de matemática e trigonometria , adiciona todos os seus argumentos que atendem a vários critérios. Por exemplo, você usaria SOMASES para somar o número de varejistas no país/região que (1) residem em um único CEP e (2) cujos lucros excedem um valor específico em dólar.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'sum_range', detail: 'O intervalo de células para somar.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'O intervalo testado usando os Critérios1 . Criteria_range1 e Critérios1 configuram um par de pesquisa no qual um intervalo é pesquisado em busca de critérios específicos. Quando os itens do intervalo são encontrados, seus valores correspondentes em Sum_range são adicionados.' },
            criteria1: { name: 'criteria1', detail: 'Os critérios que definem quais células em Criteria_range1 serão adicionadas. Por exemplo, os critérios podem ser inseridos como 32 , ">32" , B4 , "maçãs" ou "32".' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Intervalos adicionais e seus critérios associados. Você pode inserir até 127 pares de intervalo/critérios.' },
            criteria2: { name: 'criteria2', detail: 'Intervalos adicionais e seus critérios associados. Você pode inserir até 127 pares de intervalo/critérios.' },
        },
    },
    SUMPRODUCT: {
        description: 'SUMPRODUCT corresponde a todas as instâncias do Item Y/Tamanho M e as soma, portanto, para este exemplo, 21 mais 41 são iguais a 62.',
        abstract: 'SUMPRODUCT corresponde a todas as instâncias do Item Y/Tamanho M e as soma, portanto, para este exemplo, 21 mais 41 são iguais a 62.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'O primeiro argumento matricial cujos componentes você deseja multiplicar e depois somar.' },
            array2: { name: 'array', detail: 'Argumentos matriciais de 2 a 255 cujos componentes você deseja multiplicar e depois somar.' },
        },
    },
    SUMSQ: {
        description: 'Retorna a soma dos quadrados dos argumentos.',
        abstract: 'Retorna a soma dos quadrados dos argumentos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Núm1 é obrigatório. Os números subsequentes são opcionais. Podem existir até 255 argumentos para os quais pretende obter a soma dos quadrados.' },
            number2: { name: 'number2', detail: 'Núm1 é obrigatório. Os números subsequentes são opcionais. Podem existir até 255 argumentos para os quais pretende obter a soma dos quadrados.' },
        },
    },
    SUMX2MY2: {
        description: 'Esta função do Excel devolve a soma da diferença dos quadrados dos valores correspondentes em duas matrizes.',
        abstract: 'Esta função do Excel devolve a soma da diferença dos quadrados dos valores correspondentes em duas matrizes.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Obrigatório. A primeira matriz ou intervalo de valores.' },
            arrayY: { name: 'array_y', detail: 'Obrigatório. A segunda matriz ou intervalo de valores.' },
        },
    },
    SUMX2PY2: {
        description: 'Retorna a soma da soma dos quadrados dos valores correspondentes em duas matrizes. A soma da soma dos quadrados é um termo comum em muitos cálculos estatísticos.',
        abstract: 'Retorna a soma da soma dos quadrados dos valores correspondentes em duas matrizes. A soma da soma dos quadrados é um termo comum em muitos cálculos estatísticos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Necessário. A primeira matriz ou intervalo de valores.' },
            arrayY: { name: 'array_y', detail: 'Necessário. A segunda matriz ou intervalo de valores.' },
        },
    },
    SUMXMY2: {
        description: 'A função SUMXMY2 devolve a soma de quadrados de diferenças dos valores correspondentes em duas matrizes.',
        abstract: 'A função SUMXMY2 devolve a soma de quadrados de diferenças dos valores correspondentes em duas matrizes.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'A primeira matriz ou intervalo de valores. Obrigatório.' },
            arrayY: { name: 'array_y', detail: 'A segunda matriz ou intervalo de valores. Obrigatório.' },
        },
    },
    TAN: {
        description: 'Retorna a tangente de um determinado ângulo.',
        abstract: 'Retorna a tangente de um determinado ângulo.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O ângulo em radianos para o qual você deseja obter a tangente.' },
        },
    },
    TANH: {
        description: 'Retorna a tangente hiperbólica de um número.',
        abstract: 'Retorna a tangente hiperbólica de um número.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Qualquer número real.' },
        },
    },
    TRUNC: {
        description: 'As funções TRUNC truncam um número para um número inteiro ao remover a parte fracionária do número.',
        abstract: 'As funções TRUNC truncam um número para um número inteiro ao remover a parte fracionária do número.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número que se deseja truncar.' },
            numDigits: { name: 'num_digits', detail: 'Opcional. Um número que especifica a precisão da operação. O valor padrão para núm_dígitos é 0 (zero).' },
        },
    },
};

export default locale;
