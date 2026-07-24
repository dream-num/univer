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
    ADDRESS: {
        description: 'Você pode usar a função ENDEREÇO para obter o endereço de uma célula em uma planilha, com base em números de linha e de coluna. Por exemplo, ADDRESS(2,3) retorna $C$2 . Como outro exemplo, ADDRESS(77.300) retorna $KN US$ 77 . Você pode usar outras funções, como as funções LIN e COL , para fornecer os argumentos de número de linha e de coluna para a função ENDEREÇO .',
        abstract: 'Você pode usar a função ENDEREÇO para obter o endereço de uma célula em uma planilha, com base em números de linha e de coluna. Por exemplo, ADDRESS(2,3) retorna $C$2 . Como outro exemplo, ADDRESS(77.300) retorna $KN US$ 77 . Você pode usar outras funções, como as funções LIN e COL , para fornecer os argumentos de número de linha e de coluna para a função ENDEREÇO .',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/address-function',
            },
        ],
        functionParameter: {
            row_num: { name: 'row number', detail: 'Necessário. Um valor numérico que especifica o número de linha a ser usado na referência de célula.' },
            column_num: { name: 'column number', detail: 'Necessário. Um valor numérico que especifica o número de coluna a ser usado na referência de célula.' },
            abs_num: { name: 'type of reference', detail: 'Opcional. Um valor numérico que especifica o tipo de referência a ser retornado.' },
            a1: { name: 'style of reference', detail: 'Opcional. Um valor lógico que especifica o estilo de referência A1 ou L1C1. No estilo A1, as colunas são rotuladas alfabeticamente e as linhas são rotuladas numericamente. No estilo de referência L1C1, tanto as colunas quanto as linhas são rotuladas numericamente. Se o argumento A1 for VERDADEIRO ou omitido, a função ENDEREÇO retornará uma referência de estilo A1; se for FALSO, a função ENDEREÇO retornará uma referência de estilo L1C1. Observação Para alterar o estilo de referência que o Excel usa, clique na guia Arquivo , clique em Opções e clique em Fórmulas . Em Trabalhando com fórmulas , marque ou desmarque a caixa de seleção Estilo de referência L1C1 .' },
            sheet_text: { name: 'worksheet name', detail: 'Opcional. Um valor de texto que especifica o nome da planilha a ser usada como referência externa. Por exemplo, a fórmula =ADDRESS(1,1,,,"Sheet2") retorna Sheet2!$A$1 . Se o argumento sheet_text for omitido, nenhum nome da planilha será usado e o endereço retornado pela função se referirá a uma célula na planilha atual.' },
        },
    },
    AREAS: {
        description: 'Retorna o número de áreas em uma referência. Uma área é um intervalo de células contíguas ou uma célula única.',
        abstract: 'Retorna o número de áreas em uma referência. Uma área é um intervalo de células contíguas ou uma célula única.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/areas-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Necessário. Uma referência a uma célula ou a um intervalo de células e pode referir-se a várias áreas. Se você desejar especificar várias referências como um argumento único, deverá incluir grupos adicionais de parênteses para que o Microsoft Excel não interprete o ponto-e-vírgula como um separador de campo. Veja o exemplo a seguir.' },
        },
    },
    CHOOSE: {
        description: 'Use núm_índice para retornar um valor da lista de argumentos de valor. Use ESCOLHER para selecionar um valor entre 254 valores que se baseie no número de índice. Por exemplo, se do valor1 até o valor7 forem os números da semana, ESCOLHER retorna um dos dias quando um número entre 1 e 7 for usado como núm_índice.',
        abstract: 'Use núm_índice para retornar um valor da lista de argumentos de valor. Use ESCOLHER para selecionar um valor entre 254 valores que se baseie no número de índice. Por exemplo, se do valor1 até o valor7 forem os números da semana, ESCOLHER retorna um dos dias quando um número entre 1 e 7 for usado como núm_índice.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/choose-function',
            },
        ],
        functionParameter: {
            indexNum: { name: 'index_num', detail: 'Especifica qual argumento de valor será selecionado. Deve ser um número de 1 a 254, uma fórmula ou uma referência a uma célula que contenha esse número.' },
            value1: { name: 'value1', detail: 'O valor ou a ação selecionada conforme index_num. Pode ser um número, referência de célula, nome definido, fórmula, função ou texto.' },
            value2: { name: 'value2', detail: 'De 1 a 254 argumentos de valor.' },
        },
    },
    CHOOSECOLS: {
        description: 'Retorna as colunas especificadas de uma matriz.',
        abstract: 'Retorna as colunas especificadas de uma matriz.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/choosecols-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A matriz que contém as colunas a serem retornadas na nova matriz. Obrigatório.' },
            colNum1: { name: 'col_num1', detail: 'A primeira coluna a ser retornada. Obrigatório.' },
            colNum2: { name: 'col_num2', detail: 'Colunas adicionais a serem retornadas. Opcional.' },
        },
    },
    CHOOSEROWS: {
        description: 'Retorna as linhas especificadas de uma matriz.',
        abstract: 'Retorna as linhas especificadas de uma matriz.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/chooserows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A matriz que contém as colunas a devolver na nova matriz. Obrigatório.' },
            rowNum1: { name: 'row_num1', detail: 'O número da primeira linha a ser devolvido. Obrigatório.' },
            rowNum2: { name: 'row_num2', detail: 'Números de linha adicionais a serem devolvidos. Opcional.' },
        },
    },
    COLUMN: {
        description: 'A função COLUMN devolve o número de coluna da referência de célula especificada. Por exemplo, a fórmula =COLUNA(D10) devolve 4, porque a coluna D é a quarta coluna.',
        abstract: 'A função COLUMN devolve o número de coluna da referência de célula especificada. Por exemplo, a fórmula =COLUNA(D10) devolve 4, porque a coluna D é a quarta coluna.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/column-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'A célula ou o intervalo de células para o qual você deseja retornar o número da coluna.' },
        },
    },
    COLUMNS: {
        description: 'Retorna o número de colunas em uma matriz ou referência.',
        abstract: 'Retorna o número de colunas em uma matriz ou referência.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/columns-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Necessário. Uma fórmula de matriz ou matriz ou uma referência a um intervalo de células para as quais você deseja o número de colunas.' },
        },
    },
    DROP: {
        description: 'Exclui um número especificado de linhas ou colunas do início ou fim de uma matriz. Você pode achar essa função útil para remover cabeçalhos e rodapés em um relatório do Excel para retornar apenas os dados.',
        abstract: 'Exclui um número especificado de linhas ou colunas do início ou fim de uma matriz. Você pode achar essa função útil para remover cabeçalhos e rodapés em um relatório do Excel para retornar apenas os dados.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/drop-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A matriz a partir da qual remover linhas ou colunas.' },
            rows: { name: 'rows', detail: 'O número de linhas a largar. Um valor negativo cai do final da matriz.' },
            columns: { name: 'columns', detail: 'O número de colunas a excluir. Um valor negativo cai do final da matriz.' },
        },
    },
    EXPAND: {
        description: 'Expande ou preenche uma matriz para dimensões de linha e coluna especificadas.',
        abstract: 'Expande ou preenche uma matriz para dimensões de linha e coluna especificadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/expand-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A matriz a ser expandida.' },
            rows: { name: 'rows', detail: 'O número de linhas na matriz expandida. Se estiverem ausentes, as linhas não serão expandidas.' },
            columns: { name: 'columns', detail: 'O número de colunas na matriz expandida. Se estiverem ausente, as linhas não serão expandidas.' },
            padWith: { name: 'pad_with', detail: 'O valor com o qual fazer pad. O padrão é #N/A.' },
        },
    },
    FILTER: {
        description: 'No exemplo a seguir, usamos a fórmula =FILTER(A5:D20,C5:C20=H2",") para retornar todos os registros para a Apple, conforme selecionado na célula H2 e, se não houver maçãs, retorne uma cadeia de caracteres vazia ("").',
        abstract: 'No exemplo a seguir, usamos a fórmula =FILTER(A5:D20,C5:C20=H2",") para retornar todos os registros para a Apple, conforme selecionado na célula H2 e, se não houver maçãs, retorne uma cadeia de caracteres vazia ("").',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/filter-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A matriz ou intervalo a filtrar' },
            include: { name: 'include', detail: 'Uma matriz booliana cuja altura ou largura é a mesma da matriz' },
            ifEmpty: { name: 'if_empty', detail: 'O valor a retornar se todos os valores na matriz incluída estiverem vazios (o filtro não retorna nada)' },
        },
    },
    FORMULATEXT: {
        description: 'Retorna uma fórmula como uma cadeia de caracteres.',
        abstract: 'Retorna uma fórmula como uma cadeia de caracteres.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Necessário. Uma referência a uma célula ou a um intervalo de células.' },
        },
    },
    GETPIVOTDATA: {
        description: 'Retorna dados visíveis armazenados em uma Tabela Dinâmica.',
        abstract: 'Retorna dados visíveis armazenados em uma Tabela Dinâmica.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'dataField', detail: 'O nome do campo da Tabela Dinâmica que contém os dados que você deseja recuperar. Isso precisa estar entre aspas. Exemplo: =GETPIVOTDATA("Vendas", A3). Aqui, "Vendas" é o campo Valores que queremos obter. Uma vez que nenhum outro campo é especificado, GETPIVOTDATA devolve o valor total de vendas.' },
            pivotTable: { name: 'pivotTable', detail: 'Uma referência a qualquer célula, intervalo de células ou intervalo nomeado de células em uma Tabela Dinâmica. Essas informações são usadas para determinar qual Tabela Dinâmica contém os dados que você deseja recuperar. Exemplo: =GETPIVOTDATA("Vendas", A3). Aqui, a A3 é uma referência dentro da Tabela Dinâmica e indica à fórmula que tabela dinâmica deve utilizar.' },
            field1: { name: 'field1', detail: 'De 1 a 126 pares de nomes de campo e item que descrevem os dados que você deseja recuperar. Os pares podem estar em qualquer ordem. Nomes de campos e nomes para itens diferentes de datas e números devem ser colocados entre aspas. Exemplo: =GETPIVOTDATA("Vendas", A3, "Mês", "Mar"). Aqui, "Mês" é o campo e "Mar" é o item. Para especificar múltiplos itens para um campo, coloque-os entre chavetas (por exemplo: {"Mar", "Abr"}). Para Tabelas Dinâmicas OLAP , os itens podem conter o nome da fonte da dimensão e também o nome da fonte do item. Um par de campo e item de uma tabela dinâmica de OLAP poderia ter esta aparência: "[Produto]","[Produto].[Todos produtos].[Alimentos].[Confeitaria]"' },
            item1: { name: 'item1', detail: 'De 1 a 126 pares de nomes de campo e item que descrevem os dados que você deseja recuperar. Os pares podem estar em qualquer ordem. Nomes de campos e nomes para itens diferentes de datas e números devem ser colocados entre aspas. Exemplo: =GETPIVOTDATA("Vendas", A3, "Mês", "Mar"). Aqui, "Mês" é o campo e "Mar" é o item. Para especificar múltiplos itens para um campo, coloque-os entre chavetas (por exemplo: {"Mar", "Abr"}). Para Tabelas Dinâmicas OLAP , os itens podem conter o nome da fonte da dimensão e também o nome da fonte do item. Um par de campo e item de uma tabela dinâmica de OLAP poderia ter esta aparência: "[Produto]","[Produto].[Todos produtos].[Alimentos].[Confeitaria]"' },
        },
    },
    HLOOKUP: {
        description: 'Procura um valor na linha superior de uma tabela ou uma matriz de valores e retorna um valor na mesma coluna de uma linha especificada na tabela ou matriz. Use PROCH quando seus valores de comparação estiverem localizados em uma linha ao longo da parte superior de uma tabela de dados e você quiser observar um número específico de linhas mais abaixo. Use PROCV quando os valores de comparação estiverem em uma coluna à esquerda dos dados que você deseja localizar.',
        abstract: 'Procura um valor na linha superior de uma tabela ou uma matriz de valores e retorna um valor na mesma coluna de uma linha especificada na tabela ou matriz. Use PROCH quando seus valores de comparação estiverem localizados em uma linha ao longo da parte superior de uma tabela de dados e você quiser observar um número específico de linhas mais abaixo. Use PROCV quando os valores de comparação estiverem em uma coluna à esquerda dos dados que você deseja localizar.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Necessário. O valor a ser localizado na primeira linha da tabela. Valor_procurado pode ser um valor, uma referência ou uma cadeia de texto.' },
            tableArray: { name: 'table_array', detail: 'Necessário. Uma tabela de informações onde os dados devem ser procurados. Use uma referência para um intervalo ou um nome de intervalo. Os valores na primeira linha de matriz_tabela podem ser texto, números ou valores lógicos. Se procurar_intervalo for VERDADEIRO, os valores na primeira linha de matriz_tabela deverão ser colocados em ordem ascendente: ...-2, -1, 0, 1, 2,... , A-Z, FALSO, VERDADEIRO, caso contrário, PROCH pode não retornar o valor correto. Se procurar_intervalo for FALSO, matriz_tabela não precisará ser ordenada. Textos em maiúsculas e minúsculas são equivalentes. Classifique os valores em ordem crescente, da esquerda para a direita. Para saber mais, confira Classificar dados em um intervalo ou tabela .' },
            rowIndexNum: { name: 'row_index_num', detail: 'Necessário. O número da linha em table_array do qual o valor correspondente será retornado. Um row_index_num de 1 retorna o valor da primeira linha em table_array, um row_index_num de 2 retorna o valor da segunda linha em table_array e assim por diante. Se row_index_num for menor que 1, PROCH retornará o #VALUE! valor de erro; se row_index_num for maior que o número de linhas em table_array, HLOOKUP retornará o #REF! valor de erro.' },
            rangeLookup: { name: 'range_lookup', detail: 'Opcional. Um valor lógico que especifica se você quer que PROCH localize uma correspondência exata ou aproximada. Se VERDADEIRO ou omitido, uma correspondência aproximada é retornada. Em outras palavras, se uma correspondência exata não for localizada, o valor maior mais próximo que seja menor que o valor_procurado é retornado. Se FALSO, PROCH encontrará uma correspondência exata. Se nenhuma correspondência for localizada, o valor de erro #N/D será retornado.' },
        },
    },
    HSTACK: {
        description: 'Acrescenta matrizes horizontalmente e em sequência para retornar uma matriz maior.',
        abstract: 'Acrescenta matrizes horizontalmente e em sequência para retornar uma matriz maior.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'As matrizes a anexar.' },
            array2: { name: 'array', detail: 'As matrizes a anexar.' },
        },
    },
    HYPERLINK: {
        description: 'Cria um hiperlink dentro de uma célula.',
        abstract: 'Cria um hiperlink dentro de uma célula.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3093313?hl=pt-BR',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'A URL completa do destino do link entre aspas, ou uma referência a uma célula que contenha essa URL. São aceitos apenas protocolos específicos; se nenhum for informado, será usado http://.' },
            linkLabel: { name: 'link_label', detail: '[OPCIONAL — url por padrão] O texto a exibir na célula como link, entre aspas, ou uma referência a uma célula que contenha esse rótulo.' },
        },
    },
    IMAGE: {
        description: 'A função IMAGEM insere imagens em células de um local de origem juntamente com texto alternativo. Em seguida, você pode mover e redimensionar células, classificar e filtrar e trabalhar com imagens em uma tabela do Excel. Use essa função para aprimorar visualmente as listas de dados, como inventários, jogos, funcionários e conceitos matemáticos.',
        abstract: 'A função IMAGEM insere imagens em células de um local de origem juntamente com texto alternativo. Em seguida, você pode mover e redimensionar células, classificar e filtrar e trabalhar com imagens em uma tabela do Excel. Use essa função para aprimorar visualmente as listas de dados, como inventários, jogos, funcionários e conceitos matemáticos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: 'source', detail: 'O caminho da URL do arquivo de imagem, usando o protocolo "https".' },
            altText: { name: 'alt_text', detail: 'Texto alternativo que descreve a imagem para acessibilidade.' },
            sizing: { name: 'sizing', detail: 'Especifica as dimensões da imagem.' },
            height: { name: 'height', detail: 'A altura personalizada da imagem em pixels.' },
            width: { name: 'width', detail: 'A largura personalizada da imagem em pixels.' },
        },
    },
    INDEX: {
        description: 'Retorna o valor de um elemento em uma tabela ou matriz, selecionada pelos índices de número de linha e coluna.',
        abstract: 'Retorna o valor de um elemento em uma tabela ou matriz, selecionada pelos índices de número de linha e coluna.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/index-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Uma referência a um ou mais intervalos de células.' },
            rowNum: { name: 'row_num', detail: 'O número da linha em referência da qual retornar uma referência.' },
            columnNum: { name: 'column_num', detail: 'O número da coluna em referência da qual retornar uma referência.' },
            areaNum: { name: 'area_num', detail: 'Seleciona um intervalo em referência do qual retornar a interseção de row_num e column_num.' },
        },
    },
    INDIRECT: {
        description: 'Retorna a referência especificada por uma cadeia de texto. As referências são imediatamente avaliadas para exibir seu conteúdo. Use INDIRETO quando quiser mudar a referência a uma célula em uma fórmula sem mudar a própria fórmula.',
        abstract: 'Retorna a referência especificada por uma cadeia de texto. As referências são imediatamente avaliadas para exibir seu conteúdo. Use INDIRETO quando quiser mudar a referência a uma célula em uma fórmula sem mudar a própria fórmula.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/indirect-function',
            },
        ],
        functionParameter: {
            refText: { name: 'ref_text', detail: 'Necessário. Uma referência a uma célula que contém uma referência de estilo A1, uma referência no estilo R1C1, um nome definido como uma referência ou uma referência a uma célula como uma cadeia de caracteres de texto. Se ref_text não for uma referência de célula válida, o INDIRECT retornará o #REF! valor de erro. Se ref_text se referir a outra pasta de trabalho (uma referência externa), a outra pasta de trabalho deverá estar aberta. Se a pasta de trabalho de origem não estiver aberta, o INDIRECT retornará o #REF! valor de erro. Observação Não há suporte para referências externas no Excel Web App. Se ref_text se referir a um intervalo de células fora do limite de linha de 1.048.576 ou o limite de coluna de 16.384 (XFD), o INDIRECT retornará um #REF! Erro.' },
            a1: { name: 'a1', detail: 'Opcional. Um valor lógico que especifica o tipo de referência contido na célula texto_ref. Se a1 for VERDADEIRO ou omitido, texto_ref será interpretado como uma referência em estilo A1. Se a1 for FALSO, texto_ref será interpretado como uma referência em estilo L1C1.' },
        },
    },
    LOOKUP: {
        description: 'A forma vetorial de PROC procura um valor em um intervalo de uma linha ou coluna (conhecido como vetor) e retorna um valor da mesma posição em um segundo intervalo de uma linha ou coluna.',
        abstract: 'A forma vetorial de PROC procura um valor em um intervalo de uma linha ou coluna (conhecido como vetor) e retorna um valor da mesma posição em um segundo intervalo de uma linha ou coluna.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/lookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'O valor que PROC procura no primeiro vetor. Pode ser um número, texto, valor lógico, nome ou referência a um valor.' },
            lookupVectorOrArray: { name: 'lookup_vectorOrArray', detail: 'Um intervalo que contém apenas uma linha ou uma coluna.' },
            resultVector: { name: 'result_vector', detail: 'Um intervalo que contém apenas uma linha ou coluna e deve ter o mesmo tamanho de lookup_vector.' },
        },
    },
    MATCH: {
        description: 'A função CORRESP procura um item especificado em um intervalo de células e retorna a posição relativa desse item no intervalo. Por exemplo, se o intervalo A1:A3 contiver os valores 5, 25 e 38, a fórmula =CORRESP(25,A1:A3,0) retornará o número 2, porque 25 é o segundo item no intervalo.',
        abstract: 'A função CORRESP procura um item especificado em um intervalo de células e retorna a posição relativa desse item no intervalo. Por exemplo, se o intervalo A1:A3 contiver os valores 5, 25 e 38, a fórmula =CORRESP(25,A1:A3,0) retornará o número 2, porque 25 é o segundo item no intervalo.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/match-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Match localiza o maior valor que é menor ou igual a lookup_value . Os valores no argumento lookup_array devem ser colocados em ordem crescente, por exemplo: ...-2, -1, 0, 1, 2, ..., A-Z, FALSE, TRUE.' },
            lookupArray: { name: 'lookup_array', detail: 'MATCH localiza o primeiro valor exatamente igual a lookup_value . Os valores no argumento lookup_array podem estar em qualquer ordem.' },
            matchType: { name: 'match_type', detail: 'MATCH localiza o menor valor que é maior ou igual a lookup_value . Os valores no argumento lookup_array devem ser colocados em ordem decrescente, por exemplo: TRUE, FALSE, Z-A, ... 2, 1, 0, -1, -2, ..., e assim por diante.' },
        },
    },
    OFFSET: {
        description: 'Retorna uma referência para um intervalo, que é um número especificado de linhas e colunas de uma célula ou intervalo de células. A referência retornada pode ser uma única célula ou um intervalo de células. Você pode especificar o número de linhas e de colunas a serem retornadas.',
        abstract: 'Retorna uma referência para um intervalo, que é um número especificado de linhas e colunas de uma célula ou intervalo de células. A referência retornada pode ser uma única célula ou um intervalo de células. Você pode especificar o número de linhas e de colunas a serem retornadas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/offset-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Necessário. A referência da qual você quer basear o deslocamento. A referência deve ser de uma célula ou intervalo de células adjacentes. Caso contrário, DESLOC retornará #VALOR! como valor de erro.' },
            rows: { name: 'rows', detail: 'Necessário. O número de linhas, acima ou abaixo, a que se deseja que a célula superior esquerda se refira. Usar 5 como o argumento de linhas, especifica que a célula superior esquerda na referência está cinco linhas abaixo da referência. Lins podem ser positivas (que significa abaixo da referência inicial) ou negativas (acima da referência inicial).' },
            cols: { name: 'columns', detail: 'Necessário. O número de colunas, à esquerda ou à direita, a que se deseja que a célula superior esquerda do resultado se refira. Usar 5 como o argumento de colunas, especifica que a célula superior esquerda na referência está cinco colunas à direita da referência. Cols pode ser positivo (que significa à direita da referência inicial) ou negativo (à esquerda da referência inicial).' },
            height: { name: 'height', detail: 'Opcional. A altura, em número de linhas, que se deseja para a referência fornecida. Altura deve ser um número positivo.' },
            width: { name: 'width', detail: 'Opcional. A largura, em número de colunas, que se deseja para a referência fornecida. Largura deve ser um número positivo.' },
        },
    },
    ROW: {
        description: 'Retorna o número da linha de uma referência.',
        abstract: 'Retorna o número da linha de uma referência.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/row-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Opcional. A célula ou intervalo de células cujo número da linha você deseja obter. Se ref for omitido, será equivalente à referência da célula na qual a função LIN aparecer. Se referência for um intervalo de células e se LIN for introduzido como uma matriz vertical, LIN devolve os números de linha de referência como uma matriz vertical. Ref não pode se referir a áreas múltiplas.' },
        },
    },
    ROWS: {
        description: 'Retorna o número de linhas em uma referência ou matriz.',
        abstract: 'Retorna o número de linhas em uma referência ou matriz.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/rows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Necessário. Uma matriz, uma fórmula de matriz ou uma referência a um intervalo de células para as quais você deseja o número de linhas.' },
        },
    },
    RTD: {
        description: 'Recupera dados em tempo real de um programa compatível com a automação COM.',
        abstract: 'Recupera dados em tempo real de um programa compatível com a automação COM.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: 'progId', detail: 'Obrigatório. O nome do ProgID de um suplemento de automatização COM registado que foi instalado no computador local. Coloque o nome entre aspas.' },
            server: { name: 'server', detail: 'Obrigatório. O nome do servidor em que o suplemento deverá ser executado. Se não houver servidor e o programa for executado localmente, deixe o argumento em branco. Caso contrário, coloque o nome do servidor entre aspas (""). Ao usar RTD no Visual Basic for Applications (VBA), é necessário usar aspas duplas ou a propriedade NullString do VBA para o servidor, mesmo que a execução seja local.' },
            topic1: { name: 'topic1', detail: 'O tópico1 é obrigatório, os tópicos subsequentes são opcionais. Parâmetros de 1 a 253 que, juntos, representam uma parte exclusiva de dados em tempo real.' },
            topic2: { name: 'topic2', detail: 'O tópico1 é obrigatório, os tópicos subsequentes são opcionais. Parâmetros de 1 a 253 que, juntos, representam uma parte exclusiva de dados em tempo real.' },
        },
    },
    SORT: {
        description: 'Neste exemplo, classificaremos por Região, Representante de vendas e Produto individualmente usando =CLASSIFICAR(A2:A17), com valores copiados entre as células F2, H2 e J2.',
        abstract: 'Neste exemplo, classificaremos por Região, Representante de vendas e Produto individualmente usando =CLASSIFICAR(A2:A17), com valores copiados entre as células F2, H2 e J2.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sort-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'O intervalo ou uma matriz a ser classificado' },
            sortIndex: { name: 'sort_index', detail: 'Um número indicando a linha ou a coluna pela qual realizar a classificação' },
            sortOrder: { name: 'sort_order', detail: 'Um número que indica a ordem de classificação desejada; 1 para ordem crescente (padrão), -1 para ordem decrescente' },
            byCol: { name: 'by_col', detail: 'Um valor lógico que indica a direção de classificação desejada; FALSO para classificar por linha (padrão), VERDADEIRO para classificar por coluna' },
        },
    },
    SORTBY: {
        description: 'Neste exemplo, classificamos uma lista de nomes de pessoas pela respectiva idade, em ordem crescente.',
        abstract: 'Neste exemplo, classificamos uma lista de nomes de pessoas pela respectiva idade, em ordem crescente.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sortby-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A matriz ou intervalo a classificar' },
            byArray1: { name: 'by_array1', detail: 'A matriz ou intervalo no qual classificar' },
            sortOrder1: { name: 'sort_order1', detail: 'A ordem a utilizar para classificação. 1 para ordem crescente, -1 para ordem decrescente. O padrão é crescente.' },
            byArray2: { name: 'by_array2', detail: 'A matriz ou intervalo no qual classificar' },
            sortOrder2: { name: 'sort_order2', detail: 'A ordem a utilizar para classificação. 1 para ordem crescente, -1 para ordem decrescente. O padrão é crescente.' },
        },
    },
    TAKE: {
        description: 'Retorna um número especificado de linhas ou colunas contíguas do início ou do fim de uma matriz.',
        abstract: 'Retorna um número especificado de linhas ou colunas contíguas do início ou do fim de uma matriz.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/take-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A matriz da qual usar linhas ou colunas.' },
            rows: { name: 'rows', detail: 'O número de linhas a serem tomadas. Um valor negativo é removido do final da matriz.' },
            columns: { name: 'columns', detail: 'O número de colunas a serem tomadas. Um valor negativo é removido do final da matriz.' },
        },
    },
    TOCOL: {
        description: 'Retorna a matriz em uma única coluna.',
        abstract: 'Retorna a matriz em uma única coluna.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/tocol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A matriz ou referência a retornar como coluna.' },
            ignore: { name: 'ignore', detail: 'Indica se determinados tipos de valores devem ser ignorados. Por padrão, nenhum é ignorado: 0 mantém todos, 1 ignora vazios, 2 ignora erros e 3 ignora vazios e erros.' },
            scanByColumn: { name: 'scan_by_column', detail: 'Examina a matriz por coluna. Por padrão, ela é examinada por linha; isso determina se os valores são ordenados por linha ou por coluna.' },
        },
    },
    TOROW: {
        description: 'Retorna a matriz em uma única linha.',
        abstract: 'Retorna a matriz em uma única linha.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/torow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'A matriz ou referência a retornar como linha.' },
            ignore: { name: 'ignore', detail: 'Indica se determinados tipos de valores devem ser ignorados. Por padrão, nenhum é ignorado: 0 mantém todos, 1 ignora vazios, 2 ignora erros e 3 ignora vazios e erros.' },
            scanByColumn: { name: 'scan_by_column', detail: 'Examina a matriz por coluna. Por padrão, ela é examinada por linha; isso determina se os valores são ordenados por linha ou por coluna.' },
        },
    },
    TRANSPOSE: {
        description: 'Às vezes, será necessário alternar ou girar células. É possível fazer isso copiando, colando e usando a opção Transpor . Mas essa ação cria dados duplicados. Se não for isso que você deseja, digite uma fórmula que use a função TRANSPOR. Por exemplo, na imagem a seguir a fórmula =TRANSPOR(A1:B4) organiza horizontalmente as células de A1 a B4.',
        abstract: 'Às vezes, será necessário alternar ou girar células. É possível fazer isso copiando, colando e usando a opção Transpor . Mas essa ação cria dados duplicados. Se não for isso que você deseja, digite uma fórmula que use a função TRANSPOR. Por exemplo, na imagem a seguir a fórmula =TRANSPOR(A1:B4) organiza horizontalmente as células de A1 a B4.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/transpose-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Um intervalo de células ou uma matriz em uma planilha.' },
        },
    },
    UNIQUE: {
        description: 'Retornar nomes exclusivos de uma lista de nomes',
        abstract: 'Retornar nomes exclusivos de uma lista de nomes',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/unique-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'O intervalo ou matriz do qual retornar linhas ou colunas exclusivas' },
            byCol: { name: 'by_col', detail: 'O argumento by_col é um valor lógico que indica como comparar. VERDADEIRO comparará colunas umas com as outras e retornará as colunas exclusivas FALSO (ou oculto) comparará linhas umas com as outras e retornará as linhas exclusivas' },
            exactlyOnce: { name: 'exactly_once', detail: 'O argumento exactly_once é um valor lógico que retornará linhas ou colunas que ocorrem exatamente uma vez no intervalo ou na matriz. Esse é o conceito de banco de dados exclusivo. VERDADEIRO retornará todas as linhas ou colunas distintas que ocorrem exatamente uma vez do intervalo ou da matriz FALSO (ou oculto) retornará todas as linhas ou colunas do intervalo ou da matriz' },
        },
    },
    VLOOKUP: {
        description: 'Use a função PROCV para pesquisar um valor em uma tabela.',
        abstract: 'Use a função PROCV para pesquisar um valor em uma tabela.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/vlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'O valor que você deseja procurar. Ele deve estar na primeira coluna do intervalo especificado em table_array.' },
            tableArray: { name: 'table_array', detail: 'O intervalo de células em que PROCV procura lookup_value e o valor de retorno. Pode ser um intervalo nomeado ou uma tabela.' },
            colIndexNum: { name: 'col_index_num', detail: 'O número da coluna, começando em 1 para a coluna mais à esquerda de table_array, que contém o valor de retorno.' },
            rangeLookup: { name: 'range_lookup', detail: 'Um valor lógico que especifica se PROCV deve encontrar uma correspondência aproximada (1/VERDADEIRO) ou exata (0/FALSO).' },
        },
    },
    VSTACK: {
        description: 'Acrescenta matrizes verticalmente e em sequência para retornar uma matriz maior.',
        abstract: 'Acrescenta matrizes verticalmente e em sequência para retornar uma matriz maior.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/vstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'As matrizes a anexar.' },
            array2: { name: 'array', detail: 'As matrizes a anexar.' },
        },
    },
    WRAPCOLS: {
        description: 'Envolve a linha ou coluna de valores fornecida por colunas após um número especificado de elementos para formar uma nova matriz.',
        abstract: 'Envolve a linha ou coluna de valores fornecida por colunas após um número especificado de elementos para formar uma nova matriz.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/wrapcols-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'O vetor ou referência ao wrap.' },
            wrapCount: { name: 'wrap_count', detail: 'O número máximo de valores para cada coluna.' },
            padWith: { name: 'pad_with', detail: 'O valor com o qual fazer pad. O padrão é #N/A.' },
        },
    },
    WRAPROWS: {
        description: 'Envolve a linha ou coluna de valores fornecida por linhas após um número especificado de elementos para formar uma nova matriz.',
        abstract: 'Envolve a linha ou coluna de valores fornecida por linhas após um número especificado de elementos para formar uma nova matriz.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/wraprows-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'O vetor ou referência ao wrap.' },
            wrapCount: { name: 'wrap_count', detail: 'O número máximo de valores para cada linha.' },
            padWith: { name: 'pad_with', detail: 'O valor com o qual fazer pad. O padrão é #N/A.' },
        },
    },
    XLOOKUP: {
        description: 'Use a função PROCX quando precisar localizar coisas em linhas de uma tabela ou de um intervalo. Por exemplo, procure o preço de uma peça automotiva pelo número da peça ou encontre um nome de funcionário com base na ID do funcionário. Com o PROCX, você pode procurar em uma coluna por um termo de pesquisa e retornar um resultado da mesma linha em outra coluna, independentemente de qual lado a coluna de retorno esteja.',
        abstract: 'Use a função PROCX quando precisar localizar coisas em linhas de uma tabela ou de um intervalo. Por exemplo, procure o preço de uma peça automotiva pelo número da peça ou encontre um nome de funcionário com base na ID do funcionário. Com o PROCX, você pode procurar em uma coluna por um termo de pesquisa e retornar um resultado da mesma linha em outra coluna, independentemente de qual lado a coluna de retorno esteja.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/xlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'O valor a procurar *Se for omitido, PROCX devolve células em branco que encontra no lookup_array .' },
            lookupArray: { name: 'lookup_array', detail: 'A matriz ou intervalo a classificar' },
            returnArray: { name: 'return_array', detail: 'A matriz ou intervalo a retornar' },
            ifNotFound: { name: 'if_not_found', detail: 'Quando uma coincidência válida não é encontrada, retorna o texto [if_not_found] que você fornece. Se uma correspondência válida não for encontrada e [if_not_found] estiver ausente, #N/A será retornado.' },
            matchMode: { name: 'match_mode', detail: 'Especificar o tipo de correspondência: 0 – Correspondência exata. Se nenhum for encontrado, retornar #N/A. Esse é o padrão. -1 – Correspondência exata. Se nenhum for encontrado, retorna o próximo item menor. 1 – Correspondência exata. Se nenhum for encontrado, retorna o próximo item maior. 2 – Uma correspondência de curingas, em que *,? e ~ têm um significado especial .' },
            searchMode: { name: 'search_mode', detail: 'Especificar o modo de pesquisa a ser usado: 1 – Executar uma pesquisa começando do primeiro item. Esse é o padrão. -1 – Executar uma pesquisa reversa começando do último item. 2 – Executar uma pesquisa binária que dependa da classificação da matriz_procurada em ordem crescente . Caso contrário, resultados inválidos serão retornados. -2 – Executar uma pesquisa binária que dependa da classificação da matriz_procurada em ordem decrescente . Caso contrário, resultados inválidos serão retornados.' },
        },
    },
    XMATCH: {
        description: 'Suponha que tenhamos uma lista de produtos nas células C3 a C7 e que desejemos determinar em que parte da lista está localizado o produto da célula E3. Aqui, usaremos o CORRESPX para determinar a posição de um item em uma lista.',
        abstract: 'Suponha que tenhamos uma lista de produtos nas células C3 a C7 e que desejemos determinar em que parte da lista está localizado o produto da célula E3. Aqui, usaremos o CORRESPX para determinar a posição de um item em uma lista.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/xmatch-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'O valor de pesquisa' },
            lookupArray: { name: 'lookup_array', detail: 'A matriz ou intervalo a classificar' },
            matchMode: { name: 'match_mode', detail: 'Especificar o tipo de correspondência: 0 - Correspondência exata (padrão) -1 – Correspondência exata ou o próximo item menor 1 – Correspondência exata ou o próximo item maior 2 – Uma correspondência de curingas, em que *,? e ~ têm um significado especial .' },
            searchMode: { name: 'search_mode', detail: 'Especificar o tipo de pesquisa: 1 – Pesquisar do primeiro ao último (padrão) -1 – Pesquisar do último ao primeiro (pesquisa inversa). 2 – Executar uma pesquisa binária que dependa da classificação da matriz_procurada em ordem crescente . Caso contrário, resultados inválidos serão retornados. -2 – Executar uma pesquisa binária que dependa da classificação da matriz_procurada em ordem decrescente . Caso contrário, resultados inválidos serão retornados.' },
        },
    },
};

export default locale;
