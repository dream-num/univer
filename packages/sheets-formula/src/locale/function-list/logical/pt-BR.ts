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
    AND: {
        description: 'A função E retornará VERDADEIRO se todos os seus argumentos forem avaliados como VERDADEIRO e retornará FALSO se um ou mais argumentos forem avaliados como FALSO.',
        abstract: 'A função E retornará VERDADEIRO se todos os seus argumentos forem avaliados como VERDADEIRO e retornará FALSO se um ou mais argumentos forem avaliados como FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/and-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'A primeira condição que você deseja testar, que pode resultar em VERDADEIRO ou FALSO.' },
            logical2: { name: 'logical2', detail: 'Condições adicionais que você deseja testar, que podem resultar em VERDADEIRO ou FALSO, até o máximo de 255 condições.' },
        },
    },
    BYCOL: {
        description: 'Aplica um LAMBDA a cada coluna e devolve uma matriz dos resultados. Por exemplo, se a matriz original é 3 colunas por 2 linhas, a matriz retornada é 3 colunas por 1 linha.',
        abstract: 'Aplica um LAMBDA a cada coluna e devolve uma matriz dos resultados. Por exemplo, se a matriz original é 3 colunas por 2 linhas, a matriz retornada é 3 colunas por 1 linha.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/bycol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Uma matriz a ser separada por coluna.' },
            lambda: { name: 'lambda', detail: 'Um LAMBDA que recebe uma coluna como único parâmetro e calcula um resultado. O parâmetro é uma coluna da matriz.' },
        },
    },
    BYROW: {
        description: 'Aplica um LAMBDA a cada linha e retorna uma matriz dos resultados. Por exemplo, se a matriz original é de 3 colunas por 2 linhas, a matriz devolvida é de 1 coluna por 2 linhas.',
        abstract: 'Aplica um LAMBDA a cada linha e retorna uma matriz dos resultados. Por exemplo, se a matriz original é de 3 colunas por 2 linhas, a matriz devolvida é de 1 coluna por 2 linhas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/byrow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Uma matriz a ser separada por linha.' },
            lambda: { name: 'lambda', detail: 'Um LAMBDA que recebe uma linha como único parâmetro e calcula um resultado. O parâmetro é uma linha da matriz.' },
        },
    },
    FALSE: {
        description: 'Retorna o valor lógico FALSO.',
        abstract: 'Retorna o valor lógico FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/false-function',
            },
        ],
        functionParameter: {
        },
    },
    IF: {
        description: 'Por exemplo, =SE(C2 =”Sim”, 1,2) diz SE(C2 = Sim, então retorne a 1, caso contrário retorne a 2).',
        abstract: 'Por exemplo, =SE(C2 =”Sim”, 1,2) diz SE(C2 = Sim, então retorne a 1, caso contrário retorne a 2).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/if-function',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'logical_test', detail: 'A condição que você deseja testar.' },
            valueIfTrue: { name: 'value_if_true', detail: 'O valor que você deseja retornar se o resultado de logical_test for TRUE.' },
            valueIfFalse: { name: 'value_if_false', detail: 'O valor que você deseja retornar se o resultado de logical_test for FALSO.' },
        },
    },
    IFERROR: {
        description: 'Você pode usar a função SEERRO para lidar com erros em uma fórmula. SEERRO retornará um valor que você especificará se uma fórmula for avaliada como um erro; caso contrário, ele retornará o resultado da fórmula.',
        abstract: 'Você pode usar a função SEERRO para lidar com erros em uma fórmula. SEERRO retornará um valor que você especificará se uma fórmula for avaliada como um erro; caso contrário, ele retornará o resultado da fórmula.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/iferror-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obrigatório. O argumento verificado quanto ao erro.' },
            valueIfError: { name: 'value_if_error', detail: 'Obrigatório. O valor a ser retornado se a fórmula for avaliada como um erro. Os seguintes tipos de erro são avaliados: # n/d, #VALOR!, #REF!, #DIV/0!, #NÚM!, #NOME? ou #NOME!.' },
        },
    },
    IFNA: {
        description: 'A função IFNA retorna o valor que você especifica se uma fórmula retorna o valor de erro #N/A; caso contrário, ele retorna o resultado da fórmula.',
        abstract: 'A função IFNA retorna o valor que você especifica se uma fórmula retorna o valor de erro #N/A; caso contrário, ele retorna o resultado da fórmula.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ifna-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'O argumento que é verificado para o valor de erro #N/D.' },
            valueIfNa: { name: 'value_if_na', detail: 'O valor a retornar se a fórmula é avaliada com o valor de erro #N/D.' },
        },
    },
    IFS: {
        description: 'A função SES verifica se uma ou mais condições são satisfeitas e retorna um valor que corresponde à primeira condição VERDADEIRO. A função SES pode ser usada como substituta de várias instruções SE aninhadas, além de ser muito mais fácil de ser lida quando condições múltiplas são usadas.',
        abstract: 'A função SES verifica se uma ou mais condições são satisfeitas e retorna um valor que corresponde à primeira condição VERDADEIRO. A função SES pode ser usada como substituta de várias instruções SE aninhadas, além de ser muito mais fácil de ser lida quando condições múltiplas são usadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ifs-function',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'logical_test1', detail: 'Uma condição que resulta em VERDADEIRO ou FALSO.' },
            valueIfTrue1: { name: 'value_if_true1', detail: 'O resultado retornado se logical_test1 resultar em VERDADEIRO. Pode estar vazio.' },
            logicalTest2: { name: 'logical_test2', detail: 'Uma condição que resulta em VERDADEIRO ou FALSO.' },
            valueIfTrue2: { name: 'value_if_true2', detail: 'O resultado retornado se logical_testN resultar em VERDADEIRO. Cada value_if_trueN corresponde a uma condição logical_testN e pode estar vazio.' },
        },
    },
    LAMBDA: {
        description: 'Você pode criar uma função para uma fórmula comumente usada, eliminar a necessidade de copiar e colar essa fórmula (que pode ser propensa a erros) e adicionar efetivamente suas próprias funções à biblioteca de funções nativas do Excel. Além disso, uma função LAMBDA não requer VBA, macros ou JavaScript, pelo que os não programadores também podem beneficiar da sua utilização.',
        abstract: 'Você pode criar uma função para uma fórmula comumente usada, eliminar a necessidade de copiar e colar essa fórmula (que pode ser propensa a erros) e adicionar efetivamente suas próprias funções à biblioteca de funções nativas do Excel. Além disso, uma função LAMBDA não requer VBA, macros ou JavaScript, pelo que os não programadores também podem beneficiar da sua utilização.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/lambda-function',
            },
        ],
        functionParameter: {
            parameter: { name: 'parameter', detail: 'Um valor que você deseja passar para a função, como uma referência de célula, cadeia de caracteres ou número. Você pode incluir até 253 destinatários. O segundo argumento é opcional.' },
            calculation: { name: 'calculation', detail: 'A fórmula que você deseja executar e retornar como resultado da função. Ele deve ser o último argumento e deve retornar um resultado. Esse argumento é necessário.' },
        },
    },
    LET: {
        description: 'A LET função atribui nomes a resultados de cálculo. Isso permite armazenar cálculos intermediários, valores ou definir nomes dentro de uma fórmula. Estes nomes só se aplicam no âmbito da LET função. Semelhante às variáveis na programação, LET é realizado através da sintaxe da fórmula nativa do Excel.',
        abstract: 'A LET função atribui nomes a resultados de cálculo. Isso permite armazenar cálculos intermediários, valores ou definir nomes dentro de uma fórmula. Estes nomes só se aplicam no âmbito da LET função. Semelhante às variáveis na programação, LET é realizado através da sintaxe da fórmula nativa do Excel.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/let-function',
            },
        ],
        functionParameter: {
            name1: { name: 'name1', detail: 'O primeiro nome a atribuir. Deve começar com uma letra e não pode ser o resultado de uma fórmula nem conflitar com a sintaxe de intervalo.' },
            nameValue1: { name: 'name_value1', detail: 'O valor atribuído a name1.' },
            calculationOrName2: { name: 'calculation_or_name2', detail: 'Um cálculo que usa todos os nomes de LET e deve ser seu último argumento, ou um segundo nome a atribuir a name_value2.' },
            nameValue2: { name: 'name_value2', detail: 'O valor atribuído a calculation_or_name2.' },
            calculationOrName3: { name: 'calculation_or_name3', detail: 'Um cálculo que usa todos os nomes de LET e deve ser seu último argumento, ou um terceiro nome a atribuir a name_value3.' },
        },
    },
    MAKEARRAY: {
        description: 'Retorna uma matriz calculada de uma linha especificada e tamanho de coluna, aplicando uma função LAMBDA .',
        abstract: 'Retorna uma matriz calculada de uma linha especificada e tamanho de coluna, aplicando uma função LAMBDA .',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/makearray-function',
            },
        ],
        functionParameter: {
            number1: { name: 'rows', detail: 'O número de linhas da matriz. Deve ser maior que zero.' },
            number2: { name: 'cols', detail: 'O número de colunas da matriz. Deve ser maior que zero.' },
            value3: { name: 'lambda', detail: 'O LAMBDA chamado para criar a matriz. Recebe dois parâmetros: row, o índice da linha, e col, o índice da coluna.' },
        },
    },
    MAP: {
        description: 'Devolve uma matriz formada ao mapear cada valor nas matrizes para um novo valor ao aplicar um LAMBDA para criar um novo valor.',
        abstract: 'Devolve uma matriz formada ao mapear cada valor nas matrizes para um novo valor ao aplicar um LAMBDA para criar um novo valor.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/map-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Uma primeira matriz a ser mapeada.' },
            array2: { name: 'array2', detail: 'Uma segunda matriz a ser mapeada.' },
            lambda: { name: 'lambda', detail: 'Um LAMBDA que deve ser o último argumento e ter um parâmetro para cada matriz fornecida.' },
        },
    },
    NOT: {
        description: 'A função NÃO inverte o valor do argumento.',
        abstract: 'A função NÃO inverte o valor do argumento.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/not-function',
            },
        ],
        functionParameter: {
            logical: { name: 'logical', detail: 'A condição cuja lógica você deseja inverter, que pode resultar em VERDADEIRO ou FALSO.' },
        },
    },
    OR: {
        description: 'A função OU retornará VERDADEIRO se qualquer um dos argumentos for avaliado como VERDADEIRO e retornará FALSO se todos os argumentos forem avaliados como FALSO.',
        abstract: 'A função OU retornará VERDADEIRO se qualquer um dos argumentos for avaliado como VERDADEIRO e retornará FALSO se todos os argumentos forem avaliados como FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/or-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'A primeira condição que você deseja testar, que pode resultar em VERDADEIRO ou FALSO.' },
            logical2: { name: 'logical2', detail: 'Condições adicionais que você deseja testar, que podem resultar em VERDADEIRO ou FALSO, até o máximo de 255 condições.' },
        },
    },
    REDUCE: {
        description: 'Reduz uma matriz a um valor acumulado aplicando um LAMBDA a cada valor e retornando o valor total no acumulador.',
        abstract: 'Reduz uma matriz a um valor acumulado aplicando um LAMBDA a cada valor e retornando o valor total no acumulador.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/reduce-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Define o valor inicial do acumulador.' },
            array: { name: 'array', detail: 'Uma matriz a ser reduzida.' },
            lambda: { name: 'lambda', detail: 'Um LAMBDA chamado para reduzir a matriz. Recebe três parâmetros: o valor acumulado, o valor atual da matriz e o cálculo aplicado a cada elemento.' },
        },
    },
    SCAN: {
        description: 'Verifica uma matriz aplicando um LAMBDA a cada valor e retorna uma matriz que tem cada valor intermediário.',
        abstract: 'Verifica uma matriz aplicando um LAMBDA a cada valor e retorna uma matriz que tem cada valor intermediário.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/scan-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Define o valor inicial do acumulador.' },
            array: { name: 'array', detail: 'Uma matriz a ser examinada.' },
            lambda: { name: 'lambda', detail: 'Um LAMBDA que é chamado para reduzir a matriz. O LAMBDA usa três parâmetros: Acumulador O valor totalizado e retornado como o resultado final. Valor O valor atual da matriz. Corpo O cálculo aplicado a cada elemento na matriz.' },
        },
    },
    SWITCH: {
        description: 'A função PARÂMETRO avalia um valor (chamado de expressão) em relação a uma lista de valores e retorna o resultado correspondente ao primeiro valor coincidente. Se não houver nenhuma correspondência, um valor padrão opcional poderá ser retornado.',
        abstract: 'A função PARÂMETRO avalia um valor (chamado de expressão) em relação a uma lista de valores e retorna o resultado correspondente ao primeiro valor coincidente. Se não houver nenhuma correspondência, um valor padrão opcional poderá ser retornado.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/switch-function',
            },
        ],
        functionParameter: {
            expression: { name: 'expression', detail: 'O valor, como número, data ou texto, que será comparado com value1 a value126.' },
            value1: { name: 'value1', detail: 'Um valor que será comparado com expression.' },
            result1: { name: 'result1', detail: 'O valor retornado quando o argumento valueN correspondente coincidir com expression. Deve ser fornecido para cada valueN.' },
            defaultOrValue2: { name: 'default_or_value2', detail: 'O valor retornado se não houver correspondência nas expressões valueN. Deve ser o último argumento da função.' },
            result2: { name: 'result2', detail: 'O valor retornado quando o argumento valueN correspondente coincidir com expression. Deve ser fornecido para cada valueN.' },
        },
    },
    TRUE: {
        description: 'Retorna o valor lógico VERDADEIRO. Pode utilizar esta função quando pretender devolver o valor VERDADEIRO com base numa condição. Por exemplo:',
        abstract: 'Retorna o valor lógico VERDADEIRO. Pode utilizar esta função quando pretender devolver o valor VERDADEIRO com base numa condição. Por exemplo:',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/true-function',
            },
        ],
        functionParameter: {
        },
    },
    XOR: {
        description: 'A função XOR devolve um Exclusivo lógico Ou de todos os argumentos.',
        abstract: 'A função XOR devolve um Exclusivo lógico Ou de todos os argumentos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/xor-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'A primeira condição que você deseja testar, que pode resultar em VERDADEIRO ou FALSO.' },
            logical2: { name: 'logical2', detail: 'Condições adicionais que você deseja testar, que podem resultar em VERDADEIRO ou FALSO, até o máximo de 255 condições.' },
        },
    },
};

export default locale;
