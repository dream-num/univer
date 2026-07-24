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
    ASC: {
        description: 'Para idiomas do conjunto de caracteres de dois bytes (DBCS), a função altera os caracteres de largura total (byte duplo) para caracteres de meia largura (byte único).',
        abstract: 'Para idiomas do conjunto de caracteres de dois bytes (DBCS), a função altera os caracteres de largura total (byte duplo) para caracteres de meia largura (byte único).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. O texto ou uma referência a uma célula que contém o texto a ser alterado. Se o texto não contiver letras de largura total, ele não será alterado.' },
        },
    },
    ARRAYTOTEXT: {
        description: 'A função MATRIZPARATEXTO retorna uma matriz de valores de texto de qualquer intervalo especificado. Ele passa valores de texto inalterados e converte valores não textuais em texto.',
        abstract: 'A função MATRIZPARATEXTO retorna uma matriz de valores de texto de qualquer intervalo especificado. Ele passa valores de texto inalterados e converte valores não textuais em texto.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A matriz para retornar como texto. Obrigatório.' },
            format: { name: 'format', detail: 'O formato dos dados retornados. Opcional. Pode ser um dos dois valores: 0 Padrão. Formato conciso e fácil de ler. O texto retornado será o mesmo que o texto renderizado em uma célula que possui formatação geral aplicada. 1 Formato estrito que inclui caracteres de escape e delimitadores de linha. Gera uma cadeia de caracteres que pode ser analisada quando inserida na barra de fórmulas. Encapsula cadeia de caracteres retornadas entre aspas, exceto para Booleanos, Números e Erros.' },
        },
    },
    BAHTTEXT: {
        description: 'Converte um número em texto em tailandês e adiciona o sufixo "Baht".',
        abstract: 'Converte um número em texto em tailandês e adiciona o sufixo "Baht".',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Um número que você deseja converter em texto, a referência a uma célula que contenha um número ou uma fórmula que retornará um número.' },
        },
    },
    CHAR: {
        description: 'Retorna o caractere especificado por um número. Use CARACT para converter em caracteres números de páginas de código que você pode obter em arquivos de outros tipos de computador.',
        abstract: 'Retorna o caractere especificado por um número. Use CARACT para converter em caracteres números de páginas de código que você pode obter em arquivos de outros tipos de computador.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Um número entre 1 e 255 que especifica o caractere desejado. O caractere pertence ao conjunto de caracteres usado pelo seu computador. Observação O Excel para a Web suporta apenas CHAR(9), CHAR(10), CHAR(13) e CHAR(32) e superior.' },
        },
    },
    CLEAN: {
        description: 'Remove todos os caracteres do texto que não podem ser impressos. Use TIRAR em textos importados de outros aplicativos que contêm caracteres que talvez não possam ser impressos no seu sistema operacional. Por exemplo, você pode utilizar TIRAR para remover um código de computador de baixo nível frequentemente localizado no início e no fim de arquivos de dados e que não pode ser impresso.',
        abstract: 'Remove todos os caracteres do texto que não podem ser impressos. Use TIRAR em textos importados de outros aplicativos que contêm caracteres que talvez não possam ser impressos no seu sistema operacional. Por exemplo, você pode utilizar TIRAR para remover um código de computador de baixo nível frequentemente localizado no início e no fim de arquivos de dados e que não pode ser impresso.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. Qualquer informação na planilha da qual você deseja remover caracteres não imprimíveis.' },
        },
    },
    CODE: {
        description: 'Retorna um código numérico para o primeiro caractere de uma cadeia de texto. O código retornado corresponde ao conjunto de caracteres usado pelo seu computador.',
        abstract: 'Retorna um código numérico para o primeiro caractere de uma cadeia de texto. O código retornado corresponde ao conjunto de caracteres usado pelo seu computador.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. O texto cujo código do primeiro caractere você deseja obter.' },
        },
    },
    CONCAT: {
        description: 'A função CONCAT combina o texto de vários intervalos e/ou cadeias de caracteres, mas não fornece argumentos delimitadores ou IgnoreEmpty.',
        abstract: 'A função CONCAT combina o texto de vários intervalos e/ou cadeias de caracteres, mas não fornece argumentos delimitadores ou IgnoreEmpty.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/concat-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Item de texto a ser unido. Uma cadeia de caracteres ou uma matriz de cadeias de caracteres, como um intervalo de células.' },
            text2: { name: 'text2', detail: 'Itens de texto adicionais a serem unidos. Pode haver um máximo de 253 argumentos de texto para os itens de texto. Cada um pode ser uma cadeia de caracteres ou uma matriz de cadeias de caracteres, como um intervalo de células.' },
        },
    },
    CONCATENATE: {
        description: 'Use CONCATENAR , umas das funções de texto , para unir duas ou mais cadeias de texto em uma única cadeia.',
        abstract: 'Use CONCATENAR , umas das funções de texto , para unir duas ou mais cadeias de texto em uma única cadeia.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/concatenate-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'O primeiro item a unir. Pode ser texto, número ou referência de célula.' },
            text2: { name: 'text2', detail: 'Itens de texto adicionais a unir. Você pode ter até 255 itens, totalizando até 8.192 caracteres.' },
        },
    },
    DBCS: {
        description: 'A função descrita neste tópico da Ajuda converte letras de meia largura (byte único) dentro de uma cadeia de caracteres em caracteres de largura total (bytes duplos). O nome da função (e os caracteres que ela converte) depende das suas configurações de idioma.',
        abstract: 'A função descrita neste tópico da Ajuda converte letras de meia largura (byte único) dentro de uma cadeia de caracteres em caracteres de largura total (bytes duplos). O nome da função (e os caracteres que ela converte) depende das suas configurações de idioma.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. O texto ou uma referência a uma célula que contém o texto a ser alterado. Se o texto não contiver qualquer letra de meia largura do inglês ou katakana, ele não será alterado.' },
        },
    },
    DOLLAR: {
        description: 'A função DOLLAR , uma das funções TEXT , converte um número em texto usando o formato de moeda, com os decimais arredondados para o número de lugares especificados. DOLLAR usa o $#,##0.00_); Formato de número ($#,##0.00), embora o símbolo de moeda aplicado dependa das configurações de idioma local.',
        abstract: 'A função DOLLAR , uma das funções TEXT , converte um número em texto usando o formato de moeda, com os decimais arredondados para o número de lugares especificados. DOLLAR usa o $#,##0.00_); Formato de número ($#,##0.00), embora o símbolo de moeda aplicado dependa das configurações de idioma local.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Um número, uma referência a uma célula contendo um número ou uma fórmula que avalia um número.' },
            decimals: { name: 'decimals', detail: 'Opcional. O número de dígitos à direita da vírgula decimal. Se isso for negativo, o número será arredondado para a esquerda do ponto decimal. Se você omitir decimais, ele será considerado 2.' },
        },
    },
    EXACT: {
        description: 'Compara duas cadeias de texto e retorna VERDADEIRO se elas forem exatamente iguais e FALSO caso contrário. EXATO faz diferenciação entre maiúsculas e minúsculas, mas ignora diferenças de formatação. Use EXATO para testar o texto inserido em um documento.',
        abstract: 'Compara duas cadeias de texto e retorna VERDADEIRO se elas forem exatamente iguais e FALSO caso contrário. EXATO faz diferenciação entre maiúsculas e minúsculas, mas ignora diferenças de formatação. Use EXATO para testar o texto inserido em um documento.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Necessário. A primeira cadeia de texto.' },
            text2: { name: 'text2', detail: 'Necessário. A segunda cadeia de texto.' },
        },
    },
    FIND: {
        description: 'Localiza um valor de texto dentro de outro, diferenciando maiúsculas de minúsculas.',
        abstract: 'Localiza um valor de texto dentro de outro, diferenciando maiúsculas de minúsculas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'O texto que você deseja localizar.' },
            withinText: { name: 'within_text', detail: 'O texto que contém o texto que você deseja localizar.' },
            startNum: { name: 'start_num', detail: 'Especifica o caractere no qual iniciar a pesquisa. Se omitido, será considerado 1.' },
        },
    },
    FINDB: {
        description: 'Localiza um valor de texto dentro de outro, diferenciando maiúsculas de minúsculas.',
        abstract: 'Localiza um valor de texto dentro de outro, diferenciando maiúsculas de minúsculas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'O texto que você deseja localizar.' },
            withinText: { name: 'within_text', detail: 'O texto que contém o texto que você deseja localizar.' },
            startNum: { name: 'start_num', detail: 'Especifica o caractere no qual iniciar a pesquisa. Se omitido, será considerado 1.' },
        },
    },
    FIXED: {
        description: 'Arredonda o número para o número especificado de decimais, formata o número no formato decimal usando vírgula e pontos e retorna o resultado como texto.',
        abstract: 'Arredonda o número para o número especificado de decimais, formata o número no formato decimal usando vírgula e pontos e retorna o resultado como texto.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número que você deseja arredondar e converter em texto.' },
            decimals: { name: 'decimals', detail: 'Opcional. O número de dígitos à direita da vírgula decimal.' },
            noCommas: { name: 'no_commas', detail: 'Opcional. Um valor lógico que, se VERDADEIRO, impede que DEF.NÚM.DEC inclua vírgulas no texto retornado.' },
        },
    },
    LEFT: {
        description: 'Retorna os caracteres mais à esquerda de um valor de texto.',
        abstract: 'Retorna os caracteres mais à esquerda de um valor de texto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'A cadeia de texto que contém os caracteres que você deseja extrair.' },
            numChars: { name: 'num_chars', detail: 'Especifica o número de caracteres que você deseja que ESQUERDA extraia.' },
        },
    },
    LEFTB: {
        description: 'Retorna os caracteres mais à esquerda de um valor de texto.',
        abstract: 'Retorna os caracteres mais à esquerda de um valor de texto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'A cadeia de texto que contém os caracteres que você deseja extrair.' },
            numBytes: { name: 'num_bytes', detail: 'Especifica o número de caracteres que você deseja que ESQUERDAB extraia, com base em bytes.' },
        },
    },
    LEN: {
        description: 'Retorna o número de caracteres em uma cadeia de texto.',
        abstract: 'Retorna o número de caracteres em uma cadeia de texto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'O texto cujo comprimento você deseja encontrar. Espaços contam como caracteres.' },
        },
    },
    LENB: {
        description: 'Retorna o número de bytes usados para representar os caracteres em uma cadeia de texto.',
        abstract: 'Retorna o número de bytes usados para representar os caracteres em uma cadeia de texto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'O texto cujo comprimento você deseja encontrar. Espaços contam como caracteres.' },
        },
    },
    LOWER: {
        description: 'Converte todas as letras maiúsculas em uma cadeia de texto para minúsculas.',
        abstract: 'Converte todas as letras maiúsculas em uma cadeia de texto para minúsculas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. O texto que você deseja converter para minúscula. MINÚSCULA só muda caracteres de letras para texto.' },
        },
    },
    MID: {
        description: 'Retorna um número específico de caracteres de uma cadeia de texto, a partir da posição indicada.',
        abstract: 'Retorna um número específico de caracteres de uma cadeia de texto, a partir da posição indicada.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'A cadeia de texto que contém os caracteres que você deseja extrair.' },
            startNum: { name: 'start_num', detail: 'A posição, em texto, do primeiro caractere que você deseja extrair.' },
            numChars: { name: 'num_chars', detail: 'Especifica o número de caracteres que você deseja que EXT.TEXTO extraia.' },
        },
    },
    MIDB: {
        description: 'Retorna um número específico de caracteres de uma cadeia de texto, a partir da posição indicada.',
        abstract: 'Retorna um número específico de caracteres de uma cadeia de texto, a partir da posição indicada.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'A cadeia de texto que contém os caracteres que você deseja extrair.' },
            startNum: { name: 'start_num', detail: 'A posição, em texto, do primeiro caractere que você deseja extrair.' },
            numBytes: { name: 'num_bytes', detail: 'Especifica o número de caracteres que você deseja que EXT.TEXTOB extraia, com base em bytes.' },
        },
    },
    NUMBERSTRING: {
        description: 'Converte números em cadeias de caracteres chinesas.',
        abstract: 'Converte números em cadeias de caracteres chinesas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'O valor convertido em uma cadeia de caracteres chinesa.' },
            type: { name: 'type', detail: 'O tipo do resultado retornado: 1, chinês em minúsculas; 2, chinês em maiúsculas; 3, caracteres chineses de leitura e escrita.' },
        },
    },
    NUMBERVALUE: {
        description: 'Converte texto em um número, de maneira independente de localidade.',
        abstract: 'Converte texto em um número, de maneira independente de localidade.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. O texto a ser convertido em um número.' },
            decimalSeparator: { name: 'decimal_separator', detail: 'Opcional. O caractere usado para separar o inteiro e a parte fracional do resultado.' },
            groupSeparator: { name: 'group_separator', detail: 'Opcional. O caractere usado para separar agrupamentos de números, como milhares de centenas e milhões de milhares.' },
        },
    },
    PHONETIC: {
        description: 'Extrai os caracteres fonéticos (furigana) de uma cadeia de texto.',
        abstract: 'Extrai os caracteres fonéticos (furigana) de uma cadeia de texto.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'Referência', detail: 'Necessário. Uma cadeia de texto ou uma referência a uma única célula ou a um intervalo de células que contém uma cadeia de texto furigana.' },
        },
    },
    PROPER: {
        description: 'Coloca a primeira letra de uma cadeia de texto em maiúscula e todas as outras letras do texto depois de qualquer caractere diferente de uma letra. Converte todas as outras letras para minúsculas.',
        abstract: 'Coloca a primeira letra de uma cadeia de texto em maiúscula e todas as outras letras do texto depois de qualquer caractere diferente de uma letra. Converte todas as outras letras para minúsculas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. O texto entre aspas, uma fórmula que retorna o texto ou uma referência a uma célula que contenha o texto que você deseja colocar parcialmente em maiúscula.' },
        },
    },
    REGEXEXTRACT: {
        description: 'Extrai a primeira substring correspondente de acordo com uma expressão regular.',
        abstract: 'Extrai a primeira substring correspondente de acordo com uma expressão regular.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098244?hl=pt-BR',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'O texto de entrada.' },
            regularExpression: { name: 'regular_expression', detail: 'A primeira parte do texto que corresponder a esta expressão será retornada.' },
        },
    },
    REGEXMATCH: {
        description: 'Indica se um trecho de texto corresponde a uma expressão regular.',
        abstract: 'Indica se um trecho de texto corresponde a uma expressão regular.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098292?hl=pt-BR',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'O texto a ser testado em relação à expressão regular.' },
            regularExpression: { name: 'regular_expression', detail: 'A expressão regular usada para testar o texto.' },
        },
    },
    REGEXREPLACE: {
        description: 'Substitui parte de uma cadeia de texto por outra usando expressões regulares.',
        abstract: 'Substitui parte de uma cadeia de texto por outra usando expressões regulares.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098245?hl=pt-BR',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'O texto cuja parte será substituída.' },
            regularExpression: { name: 'regular_expression', detail: 'A expressão regular. Todas as ocorrências correspondentes no texto serão substituídas.' },
            replacement: { name: 'replacement', detail: 'O texto que será inserido no texto original.' },
        },
    },
    REPLACE: {
        description: 'Substitui caracteres dentro de um texto.',
        abstract: 'Substitui caracteres dentro de um texto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'O texto no qual você deseja substituir alguns caracteres.' },
            startNum: { name: 'start_num', detail: 'A posição em old_text do caractere que você deseja substituir por new_text.' },
            numChars: { name: 'num_chars', detail: 'O número de caracteres em old_text que SUBSTITUIR deve trocar por new_text.' },
            newText: { name: 'new_text', detail: 'O texto que substituirá caracteres em old_text.' },
        },
    },
    REPLACEB: {
        description: 'Substitui caracteres dentro de um texto.',
        abstract: 'Substitui caracteres dentro de um texto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'O texto no qual você deseja substituir alguns caracteres.' },
            startNum: { name: 'start_num', detail: 'A posição em old_text do caractere que você deseja substituir por new_text.' },
            numBytes: { name: 'num_bytes', detail: 'O número de bytes em old_text que SUBSTITUIRB deve trocar por new_text.' },
            newText: { name: 'new_text', detail: 'O texto que substituirá caracteres em old_text.' },
        },
    },
    REPT: {
        description: 'Repete o texto um determinado número de vezes. Utilize REPT para preencher uma célula com um número de repetições de uma cadeia de texto.',
        abstract: 'Repete o texto um determinado número de vezes. Utilize REPT para preencher uma célula com um número de repetições de uma cadeia de texto.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/rept-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. O texto que você deseja repetir.' },
            numberTimes: { name: 'number_times', detail: 'Obrigatório. Um número positivo que especifica o número de vezes que você deseja repetir texto.' },
        },
    },
    RIGHT: {
        description: 'Retorna os caracteres mais à direita de um valor de texto.',
        abstract: 'Retorna os caracteres mais à direita de um valor de texto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'A cadeia de texto que contém os caracteres que você deseja extrair.' },
            numChars: { name: 'num_chars', detail: 'Especifica o número de caracteres que você deseja que DIREITA extraia.' },
        },
    },
    RIGHTB: {
        description: 'Retorna os caracteres mais à direita de um valor de texto.',
        abstract: 'Retorna os caracteres mais à direita de um valor de texto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'A cadeia de texto que contém os caracteres que você deseja extrair.' },
            numBytes: { name: 'num_bytes', detail: 'Especifica o número de caracteres que você deseja que DIREITAB extraia, com base em bytes.' },
        },
    },
    SEARCH: {
        description: 'Localiza um valor de texto dentro de outro, sem diferenciar maiúsculas de minúsculas.',
        abstract: 'Localiza um valor de texto dentro de outro, sem diferenciar maiúsculas de minúsculas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'O texto que você deseja localizar.' },
            withinText: { name: 'within_text', detail: 'O texto que contém o texto que você deseja localizar.' },
            startNum: { name: 'start_num', detail: 'Especifica o caractere no qual iniciar a pesquisa. Se omitido, será considerado 1.' },
        },
    },
    SEARCHB: {
        description: 'Localiza um valor de texto dentro de outro, sem diferenciar maiúsculas de minúsculas.',
        abstract: 'Localiza um valor de texto dentro de outro, sem diferenciar maiúsculas de minúsculas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'O texto que você deseja localizar.' },
            withinText: { name: 'within_text', detail: 'O texto que contém o texto que você deseja localizar.' },
            startNum: { name: 'start_num', detail: 'Especifica o caractere no qual iniciar a pesquisa. Se omitido, será considerado 1.' },
        },
    },
    SUBSTITUTE: {
        description: 'Coloca novo_texto no lugar de texto_antigo em uma cadeia de texto. Use SUBSTITUIR quando quiser substituir texto específico em uma cadeia de texto; use MUDAR quando quiser substituir qualquer texto que ocorra em um local específico de uma cadeia de texto.',
        abstract: 'Coloca novo_texto no lugar de texto_antigo em uma cadeia de texto. Use SUBSTITUIR quando quiser substituir texto específico em uma cadeia de texto; use MUDAR quando quiser substituir qualquer texto que ocorra em um local específico de uma cadeia de texto.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. O texto ou a referência a uma célula que contém o texto no qual deseja substituir caracteres.' },
            oldText: { name: 'old_text', detail: 'Obrigatório. O texto que se deseja substituir.' },
            newText: { name: 'new_text', detail: 'Obrigatório. O texto pelo qual deseja substituir texto_antigo.' },
            instanceNum: { name: 'instance_num', detail: 'Opcional. Especifica que ocorrência de texto_antigo se deseja substituir por novo_texto. Se especificar núm_da_ocorrência, apenas aquela ocorrência de texto_antigo será substituída. Caso contrário, cada ocorrência de texto_antigo no texto é alterada para novo_texto.' },
        },
    },
    T: {
        description: 'Retorna o texto referido por valor.',
        abstract: 'Retorna o texto referido por valor.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Necessário. O valor que você deseja testar.' },
        },
    },
    TEXT: {
        description: 'A função TEXTO permite que você altere a maneira de exibir um número aplicando formatação a ele com códigos de formatação . Isso é útil quando você deseja exibir números em um formato mais legível ou deseja combinar números com texto ou símbolos.',
        abstract: 'A função TEXTO permite que você altere a maneira de exibir um número aplicando formatação a ele com códigos de formatação . Isso é útil quando você deseja exibir números em um formato mais legível ou deseja combinar números com texto ou símbolos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/text-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Um valor numérico que você deseja converter em texto.' },
            formatText: { name: 'format_text', detail: 'Uma cadeia de texto que define a formatação a aplicar ao valor fornecido.' },
        },
    },
    TEXTAFTER: {
        description: 'Retorna o texto que ocorre depois de um caractere ou cadeia fornecida.',
        abstract: 'Retorna o texto que ocorre depois de um caractere ou cadeia fornecida.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/textafter-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'O texto no qual pesquisar. Caracteres curinga não são permitidos.' },
            delimiter: { name: 'delimiter', detail: 'O texto que marca o ponto após o qual você deseja extrair.' },
            instanceNum: { name: 'instance_num', detail: 'A ocorrência do delimitador após a qual você deseja extrair o texto.' },
            matchMode: { name: 'match_mode', detail: 'Determina se a pesquisa diferencia maiúsculas de minúsculas. Por padrão, diferencia.' },
            matchEnd: { name: 'match_end', detail: 'Trata o fim do texto como delimitador. Por padrão, o texto deve corresponder exatamente.' },
            ifNotFound: { name: 'if_not_found', detail: 'O valor retornado se nenhuma correspondência for encontrada. Por padrão, retorna #N/D.' },
        },
    },
    TEXTBEFORE: {
        description: 'Retorna o texto que ocorre antes de um determinado caractere ou cadeia de caracteres. É o oposto da função TEXTWAFTER .',
        abstract: 'Retorna o texto que ocorre antes de um determinado caractere ou cadeia de caracteres. É o oposto da função TEXTWAFTER .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/textbefore-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'O texto no qual pesquisar. Caracteres curinga não são permitidos.' },
            delimiter: { name: 'delimiter', detail: 'O texto que marca o ponto antes do qual você deseja extrair.' },
            instanceNum: { name: 'instance_num', detail: 'A ocorrência do delimitador antes da qual você deseja extrair o texto.' },
            matchMode: { name: 'match_mode', detail: 'Determina se a pesquisa diferencia maiúsculas de minúsculas. Por padrão, diferencia.' },
            matchEnd: { name: 'match_end', detail: 'Trata o fim do texto como delimitador. Por padrão, o texto deve corresponder exatamente.' },
            ifNotFound: { name: 'if_not_found', detail: 'O valor retornado se nenhuma correspondência for encontrada. Por padrão, retorna #N/D.' },
        },
    },
    TEXTJOIN: {
        description: 'A função UNIRTEXTO combina o texto de vários intervalos e/ou cadeias de caracteres e inclui um delimitador especificado por você entre cada valor de texto que será combinado. Se o delimitador for uma cadeia de caracteres de texto vazia, essa função concatenará efetivamente os intervalos.',
        abstract: 'A função UNIRTEXTO combina o texto de vários intervalos e/ou cadeias de caracteres e inclui um delimitador especificado por você entre cada valor de texto que será combinado. Se o delimitador for uma cadeia de caracteres de texto vazia, essa função concatenará efetivamente os intervalos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: 'delimiter', detail: 'Uma cadeia de texto, seja vazia ou com um ou mais caracteres delimitados por aspas duplas, ou uma referência a uma cadeia de texto válida. Se for fornecido um número, ele será tratado como texto.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Se VERDADEIRO, ignora as células vazias.' },
            text1: { name: 'text1', detail: 'Item de texto a ser unido. Uma cadeia de texto ou uma matriz de cadeias de caracteres, como um intervalo de células.' },
            text2: { name: 'text2', detail: 'Itens de texto adicionais a serem unidos. Pode haver, no máximo, 252 argumentos de texto para os itens de texto, incluindo texto1 . Cada um pode ser uma cadeia de caracteres ou uma matriz de cadeias de caracteres, como um intervalo de células.' },
        },
    },
    TEXTSPLIT: {
        description: 'A função DIVIDIRTEXTO funciona da mesma forma que o assistente de Texto para Colunas , mas na forma de fórmula. Ele permite dividir entre colunas ou para baixo por linhas. É o inverso da função TEXTJOIN .',
        abstract: 'A função DIVIDIRTEXTO funciona da mesma forma que o assistente de Texto para Colunas , mas na forma de fórmula. Ele permite dividir entre colunas ou para baixo por linhas. É o inverso da função TEXTJOIN .',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/textsplit-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'O texto que você deseja dividir. Obrigatório.' },
            colDelimiter: { name: 'col_delimiter', detail: 'O texto que marca o ponto em que o texto é derramado entre colunas.' },
            rowDelimiter: { name: 'row_delimiter', detail: 'O texto que marca o ponto em que o texto é derramado para baixo das linhas. Opcional.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Especifique TRUE para ignorar delimitadores consecutivos. O padrão é FALSO, que cria uma célula vazia. Opcional.' },
            matchMode: { name: 'match_mode', detail: 'Especifique 1 para executar uma correspondência sem maiúsculas de maiúsculas de minúsculas. O padrão é 0, que faz uma correspondência que diferencia maiúsculas de minúsculas. Opcional.' },
            padWith: { name: 'pad_with', detail: 'O valor com o qual adicionar o resultado. O padrão é #N/A.' },
        },
    },
    TRIM: {
        description: 'Remove todos os espaços do texto exceto os espaços únicos entre palavras. Use ARRUMAR no texto que recebeu de outro aplicativo que pode ter espaçamento irregular.',
        abstract: 'Remove todos os espaços do texto exceto os espaços únicos entre palavras. Use ARRUMAR no texto que recebeu de outro aplicativo que pode ter espaçamento irregular.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'O texto do qual você deseja que os espaços sejam removidos. O texto deve ser contido entre aspas.' },
        },
    },
    UNICHAR: {
        description: 'Retorna o caractere Unicode referenciado pelo determinado valor numérico.',
        abstract: 'Retorna o caractere Unicode referenciado pelo determinado valor numérico.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Número é o número Unicode que representa o caractere.' },
        },
    },
    UNICODE: {
        description: 'Retorna o número (ponto de código) correspondente ao primeiro caractere do texto.',
        abstract: 'Retorna o número (ponto de código) correspondente ao primeiro caractere do texto.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. Texto é o caractere para o qual você deseja o valor Unicode.' },
        },
    },
    UPPER: {
        description: 'Converte o texto em maiúsculas.',
        abstract: 'Converte o texto em maiúsculas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. O texto que se deseja converter para maiúsculas. Texto pode ser uma referência ou uma cadeia de texto.' },
        },
    },
    VALUE: {
        description: 'Converte em um número uma cadeia de texto que representa um número.',
        abstract: 'Converte em um número uma cadeia de texto que representa um número.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obrigatório. O texto entre aspas ou uma referência a uma célula que contém o texto a ser convertido.' },
        },
    },
    VALUETOTEXT: {
        description: 'A função VALORPARATEXTO retorna um texto a partir de qualquer valor especificado. Ele passa valores de texto inalterados e converte valores não textuais em texto.',
        abstract: 'A função VALORPARATEXTO retorna um texto a partir de qualquer valor especificado. Ele passa valores de texto inalterados e converte valores não textuais em texto.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'O valor para retornar como texto. Obrigatório.' },
            format: { name: 'format', detail: 'O formato dos dados retornados. Opcional. Pode ser um dos dois valores: 0 Padrão. Formato conciso e fácil de ler. O texto retornado será o mesmo que o texto renderizado em uma célula que possui formatação geral aplicada. 1 Formato estrito que inclui caracteres de escape e delimitadores de linha. Gera uma cadeia de caracteres que pode ser analisada quando inserida na barra de fórmulas. Encapsula cadeia de caracteres retornadas entre aspas, exceto para Booleanos, Números e Erros.' },
        },
    },
    CALL: {
        description: 'Chama um procedimento em uma biblioteca de vínculos dinâmicos ou recurso de código. Há duas formas de sintaxe desta função. Use a sintaxe 1 apenas com um recurso de código previamente registrado que use argumentos da função REGISTRO. Use a sintaxe 2a ou 2b para registrar e chamar simultaneamente um recurso de código.',
        abstract: 'Chama um procedimento em uma biblioteca de vínculos dinâmicos ou recurso de código. Há duas formas de sintaxe desta função. Use a sintaxe 1 apenas com um recurso de código previamente registrado que use argumentos da função REGISTRO. Use a sintaxe 2a ou 2b para registrar e chamar simultaneamente um recurso de código.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Obrigatório. Texto entre aspas que especifica o nome da DLL (biblioteca de vínculo dinâmico) que contém o procedimento no Microsoft Excel para Windows.' },
            procedure: { name: 'Procedimento', detail: 'Obrigatório. Texto que especifica o nome da função da DLL no Microsoft Excel para Windows. Você também pode usar o valor ordinal da função da instrução EXPORTS do arquivo de definição de módulo (.DEF). O valor ordinal não deve estar em forma de texto.' },
            typeText: { name: 'Type_text', detail: 'Obrigatório. Texto que especifica o tipo de dados do valor de retorno e os tipos de dados de todos os argumentos para a DLL ou o recurso de código. A primeira letra de tipo_texto especifica o valor de retorno. Os códigos usados para tipo_texto encontram-se descritos de forma detalhada em Usando as funções CHAMAR e REGISTRO . No caso de DLLs autônomas ou recursos de código (XLLs), você pode omitir este argumento.' },
            argument1: { name: 'Argumento1,...', detail: 'Opcional. Os argumentos a serem passados ao procedimento.' },
        },
    },
    EUROCONVERT: {
        description: 'Converte um número em euros, converte um número de euros em uma moeda de um membro do euro ou converte um número de uma moeda de um membro do euro em outra moeda usando o euro como intermediário (triangulação). As moedas disponíveis para conversão são aquelas de membros da União Europeia (UE) que adotaram o Euro. A função usa taxas fixas de conversão, estabelecidas pela UE.',
        abstract: 'Converte um número em euros, converte um número de euros em uma moeda de um membro do euro ou converte um número de uma moeda de um membro do euro em outra moeda usando o euro como intermediário (triangulação). As moedas disponíveis para conversão são aquelas de membros da União Europeia (UE) que adotaram o Euro. A função usa taxas fixas de conversão, estabelecidas pela UE.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'Número', detail: 'Obrigatório. O valor da moeda que você deseja converter ou a referência à célula contendo o valor.' },
            source: { name: 'Origem', detail: 'Obrigatório. Uma cadeia de três letras ou referência à célula contendo a cadeia correspondente ao código ISO para a moeda fonte. Os seguintes códigos de moeda estão disponíveis na função EUROCONVERT:' },
            target: { name: 'Destino', detail: 'Obrigatório. Uma cadeia de três letras ou referência de célula correspondente ao código ISO da moeda que você deseja converter em número. Consulte a tabela Fonte anterior para os códigos ISO.' },
            fullPrecision: { name: 'Full_precision', detail: 'Obrigatório. Um valor lógico (VERDADEIRO ou FALSO) ou uma expressão que avalia o valor de VERDADEIRO ou FALSO e que especifica como o resultado é mostrado.' },
            triangulationPrecision: { name: 'Triangulation_precision', detail: 'Necessário. Um número inteiro igual ou maior que 3 que especifica o número de dígitos significativos a ser usado para o valor intermediário do euro ao convertê-lo entre as duas moedas de membros do euro. Se você omitir esse argumento, o Excel arredondará o valor intermediário do euro. Se você incluir este argumento ao converter de uma moeda de um membro do euro para o euro, o Excel calcula o valor intermediário do euro que poderia ser convertido para uma moeda de um membro do euro.' },
        },
    },
    REGISTER_ID: {
        description: 'Retorna a identificação de registro da DLL (biblioteca de vínculo dinâmico) especificada ou o recurso de código anteriormente registrado. Se a DLL ou o recurso de código não tiver sido registrado, essa função registrará a DLL ou o recurso de código e retornará a identificação do registro.',
        abstract: 'Retorna a identificação de registro da DLL (biblioteca de vínculo dinâmico) especificada ou o recurso de código anteriormente registrado. Se a DLL ou o recurso de código não tiver sido registrado, essa função registrará a DLL ou o recurso de código e retornará a identificação do registro.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Obrigatório. O texto que especifica o nome da DLL que contém a função no Microsoft Excel para Windows.' },
            procedure: { name: 'Procedimento', detail: 'Obrigatório. Texto que especifica o nome da função da DLL no Microsoft Excel para Windows. Você também pode usar o valor ordinal da função na instrução EXPORTS no arquivo de definição de módulo (.DEF). O valor ordinal ou o número da identificação do recurso não deve estar na forma de texto.' },
            typeText: { name: 'Type_text', detail: 'Opcional. O texto que especifica o tipo de dados do valor de retorno e os tipos de dados de todos os argumentos para a DLL. A primeira letra de tipo_texto especifica o valor de retorno. Se a função ou o recurso de código já estiver registrado, você poderá omitir esse argumento.' },
        },
    },
};

export default locale;
