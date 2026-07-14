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
    CUBEKPIMEMBER: {
        description: 'Retorna a propriedade de um indicador chave de desempenho (KPI) e exibe o nome do KPI na célula. Um KPI é uma medida quantificável, como o lucro bruto mensal ou a rotatividade trimestral de funcionários, usada para monitorar o desempenho de uma organização.',
        abstract: 'Retorna a propriedade de um indicador chave de desempenho (KPI) e exibe o nome do KPI na célula. Um KPI é uma medida quantificável, como o lucro bruto mensal ou a rotatividade trimestral de funcionários, usada para monitorar o desempenho de uma organização.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Conexão', detail: 'Necessário. Uma cadeia de texto do nome da conexão com o cubo.' },
            kpiName: { name: 'Kpi_name', detail: 'Necessário. Uma cadeia de texto do nome do KPI no cubo.' },
            kpiProperty: { name: 'Kpi_property', detail: 'Necessário. O componente KPI retornado e pode ser uma das seguintes opções:' },
            caption: { name: 'Legenda', detail: 'Opcional. Uma cadeia de texto alternativa exibida na célula em vez de kpi_name e kpi_property.' },
        },
    },
    CUBEMEMBER: {
        description: 'Retorna um membro ou uma tupla a partir de um cubo. Use para validar a existência do membro ou da tupla no cubo.',
        abstract: 'Retorna um membro ou uma tupla a partir de um cubo. Use para validar a existência do membro ou da tupla no cubo.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Conexão', detail: 'Necessário. Uma cadeia de texto do nome da conexão com o cubo.' },
            memberExpression: { name: 'Member_expression', detail: 'Necessário. Uma cadeia de texto de uma expressão multidimensional (MDX) que resulta em um único membro no cubo. De modo alternativo, expressão_membro pode ser uma tupla, especificada como um intervalo de células ou uma constante de matriz.' },
            caption: { name: 'Legenda', detail: 'Opcional. Uma cadeia de texto exibida na célula em vez da legenda do cubo, se uma estiver definida. Quando uma tupla é retornada, a legenda usada é aquela do último membro da tupla.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'A função PROPRIEDADEMEMBROCUBO , uma das funções Cubo no Excel, devolve o valor de uma propriedade membro de um cubo. Use-a para validar a existência do nome do membro no cubo e para retornar a propriedade especificada para esse membro.',
        abstract: 'A função PROPRIEDADEMEMBROCUBO , uma das funções Cubo no Excel, devolve o valor de uma propriedade membro de um cubo. Use-a para validar a existência do nome do membro no cubo e para retornar a propriedade especificada para esse membro.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Ligação', detail: 'Obrigatório. Uma cadeia de texto do nome da conexão com o cubo.' },
            memberExpression: { name: 'Member_expression', detail: 'Obrigatório. Uma cadeia de texto de uma expressão multidimensional (MDX) de um membro no cubo.' },
            property: { name: 'Propriedade', detail: 'Obrigatório. Uma cadeia de texto do nome da propriedade retornado ou uma referência a uma célula que contém o nome da propriedade.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Retorna o enésimo membro, ou o membro ordenado, em um conjunto. Use para retornar um ou mais elementos em um conjunto, assim como o melhor vendedor ou os dez melhores alunos.',
        abstract: 'Retorna o enésimo membro, ou o membro ordenado, em um conjunto. Use para retornar um ou mais elementos em um conjunto, assim como o melhor vendedor ou os dez melhores alunos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Ligação', detail: 'Obrigatório. Uma cadeia de texto do nome da conexão com o cubo.' },
            setExpression: { name: 'Set_expression', detail: 'Obrigatório. Uma cadeia de texto de uma expressão de um conjunto, como "{[Item1].children}". Expressão_conjunto também pode ser a função CONJUNTOCUBO ou uma referência a uma célula que contém a função CONJUNTOCUBO.' },
            rank: { name: 'Classificação', detail: 'Obrigatório. Um valor inteiro que especifica o valor superior a retornar. Se a classificação for um valor 1, ela retornará o valor superior, se for um valor 2, retornará o segundo valor mais superior, e assim por diante. Para retornar os cinco valores superiores, use a função MEMBROCLASSIFICADOCUBO cinco vezes, especificando uma classificação diferente, de 1 a 5, por vez.' },
            caption: { name: 'Legenda', detail: 'Opcional. Uma cadeia de texto exibida na célula em vez da legenda do cubo, se uma estiver definida.' },
        },
    },
    CUBESET: {
        description: 'Define um conjunto calculado de membros ou tuplas enviando uma expressão do conjunto para o cubo no servidor, que cria o conjunto e o retorna para o Microsoft Excel.',
        abstract: 'Define um conjunto calculado de membros ou tuplas enviando uma expressão do conjunto para o cubo no servidor, que cria o conjunto e o retorna para o Microsoft Excel.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Conexão', detail: 'Necessário. Uma cadeia de texto do nome da conexão com o cubo.' },
            setExpression: { name: 'Set_expression', detail: 'Necessário. Uma cadeia de texto de uma expressão de um conjunto que resulta em um conjunto de membros ou tuplas. Expressão_conjunto também pode ser uma referência de célula para um intervalo do Excel que contém um ou mais membros, tuplas ou conjuntos incluídos no conjunto.' },
            caption: { name: 'Legenda', detail: 'Opcional. Uma cadeia de texto exibida na célula ao invés da legenda do cubo, se houver uma definida.' },
            sortOrder: { name: 'Sort_order', detail: 'Opcional. O tipo de classificação, se houver, a ser executada e pode corresponder a uma das seguintes opções:' },
            sortBy: { name: 'Sort_by', detail: 'Opcional. Uma cadeia de texto do valor pelo qual classificar. Por exemplo, para obter a cidade com as vendas mais altas, set_expression seria um conjunto de cidades, e sort_by seria a medida de vendas. Ou, para obter a cidade com a maior população, set_expression seria um conjunto de cidades, e sort_by seria a medida populacional. Se sort_order exigir sort_by e sort_by for omitido, o CUBESET retornará o #VALUE! mensagem de erro.' },
        },
    },
    CUBESETCOUNT: {
        description: 'Retorna o número de itens em um conjunto.',
        abstract: 'Retorna o número de itens em um conjunto.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: 'Definir', detail: 'Necessário. Uma cadeia de texto de uma expressão do Microsoft Excel que resulta em um conjunto definido pela função CONJUNTOCUBO. Conjunto também pode ser a função CONJUNTOCUBO ou uma referência a uma célula que contém a função CONJUNTOCUBO.' },
        },
    },
    CUBEVALUE: {
        description: 'Retorna um valor agregado do cubo.',
        abstract: 'Retorna um valor agregado do cubo.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Conexão', detail: 'Necessário. Uma cadeia de texto do nome da conexão com o cubo.' },
            memberExpression: { name: 'Member_expression', detail: 'Opcional. Uma cadeia de texto de uma expressão multidimensional (MDX) que resulta em um membro ou em uma tupla no cubo. De maneira alternativa, expressão_membro pode ser um conjunto definido com a função CONJUNTOCUBO. Use expressão_membro como um slicer para definir a porção do cubo para a qual o valor agregado é retornado. Se nenhuma medida for especificada na expressão_membro, será usada a medida padrão para esse cubo.' },
        },
    },
};

export default locale;
