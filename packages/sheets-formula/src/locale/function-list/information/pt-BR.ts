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
    CELL: {
        description: 'A função CÉL retorna informações sobre a formatação, o local ou o conteúdo de uma célula. Por exemplo, se você deseja verificar se uma célula contém um valor numérico em vez de texto antes de realizar um cálculo nela, use a seguinte fórmula:',
        abstract: 'A função CÉL retorna informações sobre a formatação, o local ou o conteúdo de uma célula. Por exemplo, se você deseja verificar se uma célula contém um valor numérico em vez de texto antes de realizar um cálculo nela, use a seguinte fórmula:',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cell-function',
            },
        ],
        functionParameter: {
            infoType: { name: 'info_type', detail: 'Um valor de texto que especifica que tipo de informações de célula você deseja retornar. A lista a seguir mostra os valores possíveis do argumento tipo_info e os resultados correspondentes.' },
            reference: { name: 'reference', detail: 'A célula sobre a qual você deseja informações. Se omitido, as informações especificadas no argumento info_type serão retornadas para a célula selecionada no momento do cálculo. Se o argumento de referência for um intervalo de células, a função CÉL retornará as informações para a célula ativa no intervalo selecionado. Importante: Embora tecnicamente a referência seja opcional, é recomendável incluí-la em sua fórmula, a menos que você entenda o efeito que sua ausência tem sobre o resultado da fórmula e queira que esse efeito seja aplicado. Omitir o argumento de referência não produz informações confiáveis sobre uma célula específica, pelos seguintes motivos: No modo de cálculo automático, quando uma célula é modificada por um usuário, o cálculo pode ser disparado antes ou depois do progresso da seleção, dependendo da plataforma que você estiver usando para o Excel. Por exemplo, o Excel para Windows atualmente dispara o cálculo antes das alterações de seleção, mas Excel para a Web o dispara posteriormente. Quando Co-Authoring com outro usuário que faz uma edição, esta função relatará sua célula ativa em vez da do editor. Qualquer recálculo, por exemplo, pressionando F9, fará com que a função retorne um novo resultado, mesmo que nenhuma edição de célula tenha ocorrido.' },
        },
    },
    ERROR_TYPE: {
        description: 'Retorna um número que corresponde a um dos valores de erro do Microsoft Excel ou retorna o erro #N/D se não houver erro. Você pode usar TIPO.ERRO em uma função SE para testar um valor de erro e retornar uma cadeia de texto, como uma mensagem, em vez de um valor de erro.',
        abstract: 'Retorna um número que corresponde a um dos valores de erro do Microsoft Excel ou retorna o erro #N/D se não houver erro. Você pode usar TIPO.ERRO em uma função SE para testar um valor de erro e retornar uma cadeia de texto, como uma mensagem, em vez de um valor de erro.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/error-type-function',
            },
        ],
        functionParameter: {
            errorVal: { name: 'error_val', detail: 'Necessário. O valor de erro cujo número de identificação você deseja localizar. Apesar de val_erro poder ser o valor de erro real, ele será normalmente uma referência a uma célula que contenha uma fórmula que se deseje testar.' },
        },
    },
    INFO: {
        description: 'Retorna informações sobre o ambiente operacional atual.',
        abstract: 'Retorna informações sobre o ambiente operacional atual.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: 'Type_text', detail: 'Necessário. O texto que especifica o tipo de informação a ser retornado.' },
        },
    },
    ISBETWEEN: {
        description: 'Verifica se um número fornecido está entre outros dois números, de forma inclusiva ou exclusiva.',
        abstract: 'Verifica se um número fornecido está entre outros dois números, de forma inclusiva ou exclusiva.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/10538337?hl=pt-BR',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'value_to_compare', detail: 'O valor a testar para verificar se está entre `lower_value` e `upper_value`.' },
            lowerValue: { name: 'lower_value', detail: 'O limite inferior do intervalo de valores no qual `value_to_compare` pode estar.' },
            upperValue: { name: 'upper_value', detail: 'O limite superior do intervalo de valores no qual `value_to_compare` pode estar.' },
            lowerValueIsInclusive: { name: 'lower_value_is_inclusive', detail: 'Indica se o intervalo de valores inclui `lower_value`. Por padrão, é VERDADEIRO.' },
            upperValueIsInclusive: { name: 'upper_value_is_inclusive', detail: 'Indica se o intervalo de valores inclui `upper_value`. Por padrão, é VERDADEIRO.' },
        },
    },
    ISBLANK: {
        description: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        abstract: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obrigatório. O valor que você deseja testar. O argumento de valor pode ser um espaço em branco (célula vazia), um erro, um valor lógico, um texto, um número ou um valor de referência ou ainda um nome que faz referência a qualquer um desses elementos.' },
        },
    },
    ISDATE: {
        description: 'A função ISDATE informa se um valor é uma data.',
        abstract: 'A função ISDATE informa se um valor é uma data.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9061381?hl=pt-BR',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'O valor a ser verificado como data.' },
        },
    },
    ISEMAIL: {
        description: 'A função ISEMAIL verifica se um valor é um endereço de e-mail válido. Ela verifica se o valor segue um formato de e-mail geralmente aceito, mas não confirma se o endereço existe.',
        abstract: 'A função ISEMAIL verifica se um valor é um endereço de e-mail válido. Ela verifica se o valor segue um formato de e-mail geralmente aceito, mas não confirma se o endereço existe.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256503?hl=pt-BR',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'O valor a ser verificado como endereço de e-mail.' },
        },
    },
    ISERR: {
        description: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        abstract: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obrigatório. O valor que você deseja testar. O argumento de valor pode ser um espaço em branco (célula vazia), um erro, um valor lógico, um texto, um número ou um valor de referência ou ainda um nome que faz referência a qualquer um desses elementos.' },
        },
    },
    ISERROR: {
        description: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        abstract: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obrigatório. O valor que você deseja testar. O argumento de valor pode ser um espaço em branco (célula vazia), um erro, um valor lógico, um texto, um número ou um valor de referência ou ainda um nome que faz referência a qualquer um desses elementos.' },
        },
    },
    ISEVEN: {
        description: 'Retorna VERDADEIRO se o número for par, ou FALSO caso o número seja ímpar.',
        abstract: 'Retorna VERDADEIRO se o número for par, ou FALSO caso o número seja ímpar.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obrigatório. O valor a ser testado. Se núm não for um inteiro, será truncado.' },
        },
    },
    ISFORMULA: {
        description: 'Verifica se há uma referência a uma célula que contenha uma fórmula e retorna VERDADEIRO ou FALSO.',
        abstract: 'Verifica se há uma referência a uma célula que contenha uma fórmula e retorna VERDADEIRO ou FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Necessário. Referência é uma referência à célula que você deseja testar. Referência pode ser uma referência de célula, uma fórmula ou um nome que faça referência a uma célula.' },
        },
    },
    ISLOGICAL: {
        description: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        abstract: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obrigatório. O valor que você deseja testar. O argumento de valor pode ser um espaço em branco (célula vazia), um erro, um valor lógico, um texto, um número ou um valor de referência ou ainda um nome que faz referência a qualquer um desses elementos.' },
        },
    },
    ISNA: {
        description: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        abstract: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obrigatório. O valor que você deseja testar. O argumento de valor pode ser um espaço em branco (célula vazia), um erro, um valor lógico, um texto, um número ou um valor de referência ou ainda um nome que faz referência a qualquer um desses elementos.' },
        },
    },
    ISNONTEXT: {
        description: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        abstract: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obrigatório. O valor que você deseja testar. O argumento de valor pode ser um espaço em branco (célula vazia), um erro, um valor lógico, um texto, um número ou um valor de referência ou ainda um nome que faz referência a qualquer um desses elementos.' },
        },
    },
    ISNUMBER: {
        description: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        abstract: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obrigatório. O valor que você deseja testar. O argumento de valor pode ser um espaço em branco (célula vazia), um erro, um valor lógico, um texto, um número ou um valor de referência ou ainda um nome que faz referência a qualquer um desses elementos.' },
        },
    },
    ISODD: {
        description: 'Retorna VERDADEIRO se núm for ímpar, ou FALSO se núm for par.',
        abstract: 'Retorna VERDADEIRO se núm for ímpar, ou FALSO se núm for par.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/isodd-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obrigatório. O valor a ser testado. Se núm não for um inteiro, será truncado.' },
        },
    },
    ISOMITTED: {
        description: 'Verifica se o valor em um LAMBDA está ausente e retorna TRUE ou FALSE.',
        abstract: 'Verifica se o valor em um LAMBDA está ausente e retorna TRUE ou FALSE.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: 'Argumento', detail: 'O valor que você deseja testar, como um parâmetro LAMBDA.' },
        },
    },
    ISREF: {
        description: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        abstract: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obrigatório. O valor que você deseja testar. O argumento de valor pode ser um espaço em branco (célula vazia), um erro, um valor lógico, um texto, um número ou um valor de referência ou ainda um nome que faz referência a qualquer um desses elementos.' },
        },
    },
    ISTEXT: {
        description: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        abstract: 'Cada uma dessas funções, chamada coletivamente de funções É , verifica o valor especificado e retorna VERDADEIRO ou FALSO, dependendo do resultado. Por exemplo, a função ÉCÉL.VAZIA retornará o valor lógico VERDADEIRO se o argumento de valor for uma referência a uma célula vazia; caso contrário, ele retornará FALSO.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obrigatório. O valor que você deseja testar. O argumento de valor pode ser um espaço em branco (célula vazia), um erro, um valor lógico, um texto, um número ou um valor de referência ou ainda um nome que faz referência a qualquer um desses elementos.' },
        },
    },
    ISURL: {
        description: 'Verifica se um valor é uma URL válida.',
        abstract: 'Verifica se um valor é uma URL válida.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256501?hl=pt-BR',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'O valor a ser verificado como URL.' },
        },
    },
    N: {
        description: 'Retorna um valor convertido em um número.',
        abstract: 'Retorna um valor convertido em um número.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/n-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Necessário. O valor que você deseja converter. N converte os valores listados na tabela abaixo.' },
        },
    },
    NA: {
        description: 'Retorna o valor de erro #N/D. #N/D é o valor de erro que significa que "não existe nenhum valor disponível". Utilize NA para marcar células vazias. Ao inserir #N/D nas células onde estão faltando informações, você pode evitar o problema de incluir, não intencionalmente, células vazias nos seus cálculos. Quando uma fórmula se refere a uma célula que contém #N/D, a fórmula retornará o valor de erro #N/D.',
        abstract: 'Retorna o valor de erro #N/D. #N/D é o valor de erro que significa que "não existe nenhum valor disponível". Utilize NA para marcar células vazias. Ao inserir #N/D nas células onde estão faltando informações, você pode evitar o problema de incluir, não intencionalmente, células vazias nos seus cálculos. Quando uma fórmula se refere a uma célula que contém #N/D, a fórmula retornará o valor de erro #N/D.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/na-function',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: 'A função SHEET retorna o número da planilha especificada ou outra referência.',
        abstract: 'A função SHEET retorna o número da planilha especificada ou outra referência.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sheet-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argumento opcional. Use isso para especificar o nome de uma planilha ou uma referência para a qual você deseja obter o número da planilha. Caso contrário, a função retornará o número da planilha que contém a função SHEET.' },
        },
    },
    SHEETS: {
        description: 'Retorna o número de PLANS em uma referência.',
        abstract: 'Retorna o número de PLANS em uma referência.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sheets-function',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: 'Retorna o tipo de valor. Use TIPO quando o comportamento de outra função depender do tipo de valor de uma determinada célula.',
        abstract: 'Retorna o tipo de valor. Use TIPO quando o comportamento de outra função depender do tipo de valor de uma determinada célula.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Necessário. Pode ser qualquer valor do Microsoft Excel, como um número, texto, valor lógico e assim por diante.' },
        },
    },
};

export default locale;
