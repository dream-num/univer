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
    AVEDEV: {
        description: 'Retorna a média aritmética dos desvios médios dos pontos de dados a partir de sua média. DESV.MÉDIO é uma medida da variabilidade em um conjunto de dados.',
        abstract: 'Retorna a média aritmética dos desvios médios dos pontos de dados a partir de sua média. DESV.MÉDIO é uma medida da variabilidade em um conjunto de dados.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/avedev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Número1 é necessário, números subsequentes são opcionais. Argumentos de 1 a 255 para os quais você deseja obter a média aritmética dos desvios absolutos. Você também pode usar uma matriz única ou uma referência a matriz, em vez dos argumentos separados por ponto-e-vírgula.' },
            number2: { name: 'number2', detail: 'Número1 é necessário, números subsequentes são opcionais. Argumentos de 1 a 255 para os quais você deseja obter a média aritmética dos desvios absolutos. Você também pode usar uma matriz única ou uma referência a matriz, em vez dos argumentos separados por ponto-e-vírgula.' },
        },
    },
    AVERAGE: {
        description: 'Retorna a média aritmética dos argumentos. Por exemplo, se o intervalo A1:A20 contiver números, a fórmula =AVERAGE(A1:A20) retornará a média desses números.',
        abstract: 'Retorna a média aritmética dos argumentos. Por exemplo, se o intervalo A1:A20 contiver números, a fórmula =AVERAGE(A1:A20) retornará a média desses números.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Necessário. O primeiro número, referência de célula ou intervalo para o qual você deseja a média.' },
            number2: { name: 'number2', detail: 'Opcional. Números adicionais, referências de célula ou intervalos para os quais você deseja a média, até no máximo 255.' },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'A função AVERAGE.WEIGHTED calcula a média ponderada de um conjunto de valores usando os valores e seus pesos correspondentes.',
        abstract: 'A função AVERAGE.WEIGHTED calcula a média ponderada de um conjunto de valores usando os valores e seus pesos correspondentes.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9084098?hl=pt-BR',
            },
        ],
        functionParameter: {
            values: { name: 'valores', detail: 'Os valores cuja média será calculada. Pode ser um intervalo de células ou os próprios valores.' },
            weights: { name: 'pesos', detail: 'A lista correspondente de pesos a aplicar. Os pesos podem ser zero, mas não negativos, e pelo menos um deve ser positivo. O intervalo de pesos deve ter o mesmo número de linhas e colunas que o intervalo de valores.' },
            additionalValues: { name: 'valores_adicionais', detail: 'Valores adicionais opcionais cuja média será calculada.' },
            additionalWeights: { name: 'pesos_adicionais', detail: 'Pesos adicionais opcionais. Cada valor_adicional deve ser seguido por exatamente um peso_adicional.' },
        },
    },
    AVERAGEA: {
        description: 'Calcula a média (aritmética) dos valores na lista de argumentos.',
        abstract: 'Calcula a média (aritmética) dos valores na lista de argumentos.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/averagea-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Valor1 é obrigatório, os valores subsequentes são opcionais. De 1 a 255 células, intervalos de células ou valores cuja média você deseja obter.' },
            value2: { name: 'value2', detail: 'Valor1 é obrigatório, os valores subsequentes são opcionais. De 1 a 255 células, intervalos de células ou valores cuja média você deseja obter.' },
        },
    },
    AVERAGEIF: {
        description: 'Retorna a média (média aritmética) de todas as células em um intervalo que satisfazem um determinado critério.',
        abstract: 'Retorna a média (média aritmética) de todas as células em um intervalo que satisfazem um determinado critério.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/averageif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Necessário. Uma ou mais células a serem usadas para o cálculo da média, incluindo números ou nomes, matrizes ou referências que contêm números.' },
            criteria: { name: 'criteria', detail: 'Necessário. Os critérios na forma de um número, uma expressão, uma referência de célula ou um texto que define quais células serão usadas para o cálculo da média. Por exemplo, os critérios podem ser expressos como 32, "32", ">32", "maçãs" ou B4.' },
            averageRange: { name: 'average_range', detail: 'Opcional. O conjunto real de células que será usado para calcular a média. Se omitido, será usado o intervalo.' },
        },
    },
    AVERAGEIFS: {
        description: 'Retorna a média (média aritmética) de todas as células que satisfazem vários critérios.',
        abstract: 'Retorna a média (média aritmética) de todas as células que satisfazem vários critérios.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/averageifs-function',
            },
        ],
        functionParameter: {
            averageRange: { name: 'average_range', detail: 'Necessário. Uma ou mais células a serem usadas para o cálculo da média, incluindo números ou nomes, matrizes ou referências que contêm números.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Intervalo_critérios1 é obrigatório, intervalos_critérios subsequentes são opcionais. De 1 a 127 intervalos para avaliar os critérios associados.' },
            criteria1: { name: 'criteria1', detail: 'Critérios1 é necessário, critérios subsequentes são opcionais. Os critérios de 1 a 127 na forma de um número, uma expressão, uma referência de célula ou um texto que define quais células serão usadas para calcular a média. Por exemplo, os critérios podem ser expressos como 32, "32", ">32", "maçãs" ou B4.' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Intervalo_critérios1 é obrigatório, intervalos_critérios subsequentes são opcionais. De 1 a 127 intervalos para avaliar os critérios associados.' },
            criteria2: { name: 'criteria2', detail: 'Critérios1 é necessário, critérios subsequentes são opcionais. Os critérios de 1 a 127 na forma de um número, uma expressão, uma referência de célula ou um texto que define quais células serão usadas para calcular a média. Por exemplo, os critérios podem ser expressos como 32, "32", ">32", "maçãs" ou B4.' },
        },
    },
    BETA_DIST: {
        description: 'A distribuição beta geralmente é usada para estudar a variação na porcentagem de determinado valor em amostras, como a fração do dia que as pessoas passam assistindo televisão.',
        abstract: 'A distribuição beta geralmente é usada para estudar a variação na porcentagem de determinado valor em amostras, como a fração do dia que as pessoas passam assistindo televisão.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/beta-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor entre A e B no qual se avalia a função.' },
            alpha: { name: 'alpha', detail: 'Necessário. Um parâmetro da distribuição.' },
            beta: { name: 'beta', detail: 'Necessário. Um parâmetro da distribuição.' },
            cumulative: { name: 'cumulative', detail: 'Necessário. Um valor lógico que determina a forma da função. Se cumulativo for VERDADEIRO, DIST.BETA retornará a função de distribuição cumulativa; se for FALSO, retornará a função de densidade de probabilidade.' },
            A: { name: 'A', detail: 'Opcional. Um limite inferior para o intervalo de x.' },
            B: { name: 'B', detail: 'Opcional. Um limite superior para o intervalo de x.' },
        },
    },
    BETA_INV: {
        description: 'Se probabilidade = DIST.BETA(x,...VERDADEIRO), INV.BETA(probabilidade,...) = x. A distribuição beta pode ser usada no planejamento do projeto para criar modelos de tempos de conclusão provável de acordo com determinado tempo de conclusão e variabilidade esperados.',
        abstract: 'Se probabilidade = DIST.BETA(x,...VERDADEIRO), INV.BETA(probabilidade,...) = x. A distribuição beta pode ser usada no planejamento do projeto para criar modelos de tempos de conclusão provável de acordo com determinado tempo de conclusão e variabilidade esperados.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/beta-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Necessário. Uma probabilidade associada à distribuição beta.' },
            alpha: { name: 'alpha', detail: 'Necessário. Um parâmetro da distribuição.' },
            beta: { name: 'beta', detail: 'Necessário. Um parâmetro da distribuição.' },
            A: { name: 'A', detail: 'Opcional. Um limite inferior para o intervalo de x.' },
            B: { name: 'B', detail: 'Opcional. Um limite superior para o intervalo de x.' },
        },
    },
    BINOM_DIST: {
        description: 'Retorna a probabilidade de distribuição binomial do termo individual. Use DISTR.BINOM em problemas com um número fixo de testes ou tentativas, quando os resultados de determinada tentativa forem apenas sucesso ou fracasso, quando as tentativas forem independentes e quando a probabilidade de sucesso for constante durante toda a experiência. Por exemplo, DISTR.BINOM pode calcular a probabilidade de que dois dos próximos três bebês sejam meninos.',
        abstract: 'Retorna a probabilidade de distribuição binomial do termo individual. Use DISTR.BINOM em problemas com um número fixo de testes ou tentativas, quando os resultados de determinada tentativa forem apenas sucesso ou fracasso, quando as tentativas forem independentes e quando a probabilidade de sucesso for constante durante toda a experiência. Por exemplo, DISTR.BINOM pode calcular a probabilidade de que dois dos próximos três bebês sejam meninos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/binom-dist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Necessário. O número de tentativas bem-sucedidas.' },
            trials: { name: 'trials', detail: 'Necessário. O número de tentativas independentes.' },
            probabilityS: { name: 'probability_s', detail: 'Necessário. A probabilidade de sucesso em cada tentativa.' },
            cumulative: { name: 'cumulative', detail: 'Necessário. Um valor lógico que determina a forma da função. Se cumulativo for VERDADEIRO, DISTR.BINOM retornará a função de distribuição cumulativa, que é a probabilidade de que exista no máximo núm_s sucessos; se for FALSO, retornará a função massa de probabilidade, que é a probabilidade de que exista núm_s sucessos.' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Retorna a probabilidade de um resultado de tentativa usando uma distribuição binomial.',
        abstract: 'Retorna a probabilidade de um resultado de tentativa usando uma distribuição binomial.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/binom-dist-range-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Obrigatório. O número de tentativas independentes. Deve ser maior que ou igual a 0.' },
            probabilityS: { name: 'probability_s', detail: 'Obrigatório. A probabilidade de sucesso em cada tentativa. Deve ser maior que ou igual a 0 e menor que ou igual a 1.' },
            numberS: { name: 'number_s', detail: 'Obrigatório. O número de tentativas bem-sucedidas. Deve ser maior que ou igual a 0 e menor que ou igual a Tentativas.' },
            numberS2: { name: 'number_s2', detail: 'Opcional. Se fornecido, retorna a probabilidade de que o número de tentativas bem-sucedidas ficará entre Número_s e número _s2. Deve ser maior que ou igual a Número_s e menor que ou igual a Tentativas.' },
        },
    },
    BINOM_INV: {
        description: 'Retorna o menor valor para o qual a distribuição binomial cumulativa é maior ou igual ao valor padrão.',
        abstract: 'Retorna o menor valor para o qual a distribuição binomial cumulativa é maior ou igual ao valor padrão.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/binom-inv-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Necessário. O número de tentativas de Bernoulli.' },
            probabilityS: { name: 'probability_s', detail: 'Necessário. A probabilidade de sucesso em cada tentativa.' },
            alpha: { name: 'alpha', detail: 'Necessário. O valor padrão.' },
        },
    },
    CHISQ_DIST: {
        description: 'Retorna a probabilidade unilateral à esquerda da distribuição qui-quadrado.',
        abstract: 'Retorna a probabilidade unilateral à esquerda da distribuição qui-quadrado.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/chisq-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'O valor no qual você deseja avaliar a distribuição.' },
            degFreedom: { name: 'deg_freedom', detail: 'O número de graus de liberdade.' },
            cumulative: { name: 'cumulative', detail: 'Um valor lógico que determina a forma da função. Se for VERDADEIRO, retorna a função de distribuição cumulativa; se for FALSO, retorna a função de densidade de probabilidade.' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'A distribuição χ2 está associada ao teste χ2. Use o teste χ2 para comparar os valores observados e os esperados. Por exemplo, uma experiência genética pode gerar a hipótese de que a próxima geração de plantas exibirá determinado conjunto de cores. Comparando os resultados observados com os esperados, você poderá decidir se a hipótese original é válida.',
        abstract: 'A distribuição χ2 está associada ao teste χ2. Use o teste χ2 para comparar os valores observados e os esperados. Por exemplo, uma experiência genética pode gerar a hipótese de que a próxima geração de plantas exibirá determinado conjunto de cores. Comparando os resultados observados com os esperados, você poderá decidir se a hipótese original é válida.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/chisq-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor no qual a distribuição será avaliada.' },
            degFreedom: { name: 'deg_freedom', detail: 'Necessário. O número de graus de liberdade.' },
        },
    },
    CHISQ_INV: {
        description: 'A distribuição qui-quadrada geralmente é usada para estudar a variação na porcentagem de determinado valor em amostras, como a fração do dia que as pessoas passam assistindo televisão.',
        abstract: 'A distribuição qui-quadrada geralmente é usada para estudar a variação na porcentagem de determinado valor em amostras, como a fração do dia que as pessoas passam assistindo televisão.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/chisq-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obrigatório. Uma probabilidade associada à distribuição qui-quadrada.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obrigatório. O número de graus de liberdade.' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Se a probabilidade = DIST.QUIQUA.CD(x,...), então INV.QUIQUA.CD(probabilidade,...) = x. Use esta função para comparar os resultados observados com os esperados para decidir se a sua hipótese original é válida.',
        abstract: 'Se a probabilidade = DIST.QUIQUA.CD(x,...), então INV.QUIQUA.CD(probabilidade,...) = x. Use esta função para comparar os resultados observados com os esperados para decidir se a sua hipótese original é válida.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/chisq-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obrigatório. Uma probabilidade associada à distribuição qui-quadrada.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obrigatório. O número de graus de liberdade.' },
        },
    },
    CHISQ_TEST: {
        description: 'Retorna o teste para independência. TESTE.QUIQUA retorna o valor da distribuição qui-quadrada (χ2) para a estatística e os graus apropriados de liberdade. Você pode usar os testes χ2 para determinar se os resultados hipotéticos são verificados por uma experiência.',
        abstract: 'Retorna o teste para independência. TESTE.QUIQUA retorna o valor da distribuição qui-quadrada (χ2) para a estatística e os graus apropriados de liberdade. Você pode usar os testes χ2 para determinar se os resultados hipotéticos são verificados por uma experiência.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/chisq-test-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Necessário. O intervalo de dados que contém observações a serem comparadas com os valores esperados.' },
            expectedRange: { name: 'expected_range', detail: 'Necessário. O intervalo de dados que contém a razão entre o produto dos totais de linhas e dos totais de colunas e o total geral.' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'O intervalo de confiança é um intervalo de valores. A média das suas amostras, x, encontra-se no centro desse intervalo, e o intervalo é x ± INT.CONFIANÇA.NORM. Por exemplo, se x for a média das amostras de tempos de entrega para produtos encomendados pelo correio, x ± INT.CONFIANÇA.NORM será o intervalo de médias da população. Para toda média de população, μ0, nesse intervalo, a probabilidade de se obter uma média de amostras mais distante de μ0 que x é maior que alfa; para qualquer média da população, μ0, não nesse intervalo, a probabilidade de se obter uma média de amostras mais distante de μ0 que x é menor que alfa. Em outras palavras, suponha que utilizemos x, desv_padrão e tamanho para construir um teste bicaudal em nível alfa de significância da hipótese de que a média da população seja μ0. Depois, não rejeitaremos essa hipótese se μ0 estiver no intervalo de confiança e rejeitaremos essa hipótese se μ0 não estiver no intervalo de confiança. O intervalo de confiança não nos permite inferir se há probabilidade 1 – alfa de que nosso próximo pacote levará um tempo de entrega que esteja no intervalo de confiança.',
        abstract: 'O intervalo de confiança é um intervalo de valores. A média das suas amostras, x, encontra-se no centro desse intervalo, e o intervalo é x ± INT.CONFIANÇA.NORM. Por exemplo, se x for a média das amostras de tempos de entrega para produtos encomendados pelo correio, x ± INT.CONFIANÇA.NORM será o intervalo de médias da população. Para toda média de população, μ0, nesse intervalo, a probabilidade de se obter uma média de amostras mais distante de μ0 que x é maior que alfa; para qualquer média da população, μ0, não nesse intervalo, a probabilidade de se obter uma média de amostras mais distante de μ0 que x é menor que alfa. Em outras palavras, suponha que utilizemos x, desv_padrão e tamanho para construir um teste bicaudal em nível alfa de significância da hipótese de que a média da população seja μ0. Depois, não rejeitaremos essa hipótese se μ0 estiver no intervalo de confiança e rejeitaremos essa hipótese se μ0 não estiver no intervalo de confiança. O intervalo de confiança não nos permite inferir se há probabilidade 1 – alfa de que nosso próximo pacote levará um tempo de entrega que esteja no intervalo de confiança.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/confidence-norm-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Obrigatório. O nível de significância usado para calcular o nível de confiança. O nível de confiança é igual a 100*(1 - alfa)% ou, em outras palavras, um alfa de 0,05 indica um nível de confiança de 95%.' },
            standardDev: { name: 'standard_dev', detail: 'Obrigatório. O desvio-padrão da população para o intervalo de dados e é assumido como conhecido.' },
            size: { name: 'size', detail: 'Obrigatório. O tamanho da amostra.' },
        },
    },
    CONFIDENCE_T: {
        description: 'Retorna o intervalo de confiança para uma média da população, usando uma distribuição t de Student.',
        abstract: 'Retorna o intervalo de confiança para uma média da população, usando uma distribuição t de Student.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/confidence-t-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Necessário. O nível de significância usado para calcular o nível de confiança. O nível de confiança é igual a 100*(1 - alfa)% ou, em outras palavras, um alfa de 0,05 indica um nível de confiança de 95%.' },
            standardDev: { name: 'standard_dev', detail: 'Necessário. O desvio padrão de população para o intervalo de dados e é considerado conhecido.' },
            size: { name: 'size', detail: 'Necessário. O tamanho da amostra.' },
        },
    },
    CORREL: {
        description: 'A função CORREL devolve o coeficiente de correlação de dois intervalos de células. Use o coeficiente de correlação para determinar a relação entre duas propriedades. Por exemplo, você pode examinar a relação entre a temperatura média de um local e o uso de aparelhos de ar condicionado.',
        abstract: 'A função CORREL devolve o coeficiente de correlação de dois intervalos de células. Use o coeficiente de correlação para determinar a relação entre duas propriedades. Por exemplo, você pode examinar a relação entre a temperatura média de um local e o uso de aparelhos de ar condicionado.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/correl-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obrigatório. Um intervalo de valores de células.' },
            array2: { name: 'array2', detail: 'Obrigatório. Um segundo intervalo de valores de células.' },
        },
    },
    COUNT: {
        description: 'A função CONT.NÚM conta o número de células que contêm números e conta os números na lista de argumentos. Use a função CONT.NÚM para obter o número de entradas em um campo de número que esteja em um intervalo ou uma matriz de números. Por exemplo, você pode inserir a seguinte fórmula para contar os números no intervalo A1:A20: =CONT.NÚM(A1:A20) . Nesse exemplo, se cinco células no intervalo contiverem números, o resultado será 5 .',
        abstract: 'A função CONT.NÚM conta o número de células que contêm números e conta os números na lista de argumentos. Use a função CONT.NÚM para obter o número de entradas em um campo de número que esteja em um intervalo ou uma matriz de números. Por exemplo, você pode inserir a seguinte fórmula para contar os números no intervalo A1:A20: =CONT.NÚM(A1:A20) . Nesse exemplo, se cinco células no intervalo contiverem números, o resultado será 5 .',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/count-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value 1', detail: 'Obrigatório. O primeiro item, referência de célula ou intervalo em que você deseja contar números.' },
            value2: { name: 'value 2', detail: 'Opcional. Até 255 itens, referências de célula ou intervalos adicionais em que você deseja contar números.' },
        },
    },
    COUNTA: {
        description: 'A função CONTAR.VAL conta o número de células que não estão vazias num intervalo.',
        abstract: 'A função CONTAR.VAL conta o número de células que não estão vazias num intervalo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/counta-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Valor1 é obrigatório, os valores subsequentes são opcionais. De 1 a 255 células, intervalos de células ou valores cuja média você deseja obter.' },
            value2: { name: 'value2', detail: 'Valor1 é obrigatório, os valores subsequentes são opcionais. De 1 a 255 células, intervalos de células ou valores cuja média você deseja obter.' },
        },
    },
    COUNTBLANK: {
        description: 'Utilize a função CONTAR.VAZIO , uma das funções Estatísticas , para contar o número de células vazias num intervalo de células.',
        abstract: 'Utilize a função CONTAR.VAZIO , uma das funções Estatísticas , para contar o número de células vazias num intervalo de células.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/countblank-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Obrigatório. O intervalo no qual as células em branco serão contadas.' },
        },
    },
    COUNTIF: {
        description: 'Use CONT.SE, uma das funções estatísticas , para contar o número de células que atendem a um critério; por exemplo, para contar o número de vezes que uma cidade específica aparece em uma lista de clientes.',
        abstract: 'Use CONT.SE, uma das funções estatísticas , para contar o número de células que atendem a um critério; por exemplo, para contar o número de vezes que uma cidade específica aparece em uma lista de clientes.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/use-the-countif-function-in-microsoft-excel',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'O grupo de células que você deseja contar. Intervalo pode conter números, matrizes, um intervalo nomeado ou referências que contenham números. Valores em branco e de texto são ignorados. Saiba como selecionar intervalos em uma planilha .' },
            criteria: { name: 'criteria', detail: 'Um número, expressão, referência de célula ou cadeia de texto que determina quais células serão contadas. Por exemplo, você pode usar um número como 32, uma comparação como ">32", uma célula como B4 ou uma palavra como "maçãs". CONT.SE usa apenas um único critério. Use CONT.SES se você quiser usar vários critérios.' },
        },
    },
    COUNTIFS: {
        description: 'A função COUNTIFS aplica critérios a células em vários intervalos e conta o número de vezes que todos os critérios são atendidos.',
        abstract: 'A função COUNTIFS aplica critérios a células em vários intervalos e conta o número de vezes que todos os critérios são atendidos.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/countifs-function',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: 'criteria_range1', detail: 'Necessário. O primeiro intervalo no qual avaliar os critérios associados.' },
            criteria1: { name: 'criteria1', detail: 'Necessário. Os critérios no formato de um número, uma expressão, uma referência de célula ou um texto que define quais células serão contadas. Por exemplo, os critérios podem ser expressos como 32, ">32", B4, "maçãs" ou "32".' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Opcional. Intervalos adicionais e seus critérios associados. Até 127 intervalo/critérios pares são permitidos.' },
            criteria2: { name: 'criteria2', detail: 'Opcional. Intervalos adicionais e seus critérios associados. Até 127 intervalo/critérios pares são permitidos.' },
        },
    },
    COVARIANCE_P: {
        description: 'Retorna a covariação da população, a média dos produtos dos desvios para cada par de pontos de dados em dois conjuntos de dados. Use a covariação para determinar a relação entre dois conjuntos de dados. Por exemplo, você pode verificar se uma receita maior é acompanhada por maiores níveis de instrução.',
        abstract: 'Retorna a covariação da população, a média dos produtos dos desvios para cada par de pontos de dados em dois conjuntos de dados. Use a covariação para determinar a relação entre dois conjuntos de dados. Por exemplo, você pode verificar se uma receita maior é acompanhada por maiores níveis de instrução.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/covariance-p-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obrigatório. O primeiro intervalo de células de inteiros.' },
            array2: { name: 'array2', detail: 'Obrigatório. O segundo intervalo de células de inteiros.' },
        },
    },
    COVARIANCE_S: {
        description: 'Retorna a covariação de amostra, a média dos produtos dos desvios para cada par de pontos de dados em dois conjuntos de dados.',
        abstract: 'Retorna a covariação de amostra, a média dos produtos dos desvios para cada par de pontos de dados em dois conjuntos de dados.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/covariance-s-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obrigatório. O primeiro intervalo de células de inteiros.' },
            array2: { name: 'array2', detail: 'Obrigatório. O segundo intervalo de células de inteiros.' },
        },
    },
    DEVSQ: {
        description: 'Retorna a soma dos quadrados dos desvios de pontos de dados da média da amostra.',
        abstract: 'Retorna a soma dos quadrados dos desvios de pontos de dados da média da amostra.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/devsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Número1 é necessário, números subsequentes são opcionais. De 1 a 255 argumentos para os quais se deseja calcular a soma dos desvios quadrados. Você pode também usar uma única matriz ou referência a uma matriz em vez dos argumentos separados por ponto-e-vírgulas.' },
            number2: { name: 'number2', detail: 'Número1 é necessário, números subsequentes são opcionais. De 1 a 255 argumentos para os quais se deseja calcular a soma dos desvios quadrados. Você pode também usar uma única matriz ou referência a uma matriz em vez dos argumentos separados por ponto-e-vírgulas.' },
        },
    },
    EXPON_DIST: {
        description: 'Retorna a distribuição exponencial. Use DISTR.EXPON para criar um modelo do tempo entre os eventos, como quanto tempo determinado caixa eletrônico leva para liberar o dinheiro. Por exemplo, você pode usar DISTR.EXPON para determinar a probabilidade de que o processo leve no máximo um minuto.',
        abstract: 'Retorna a distribuição exponencial. Use DISTR.EXPON para criar um modelo do tempo entre os eventos, como quanto tempo determinado caixa eletrônico leva para liberar o dinheiro. Por exemplo, você pode usar DISTR.EXPON para determinar a probabilidade de que o processo leve no máximo um minuto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/expon-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor da função.' },
            lambda: { name: 'lambda', detail: 'Necessário. O valor do parâmetro.' },
            cumulative: { name: 'cumulative', detail: 'Necessário. Um valor lógico que indica a forma da função exponencial a ser fornecida. Se cumulativo for VERDADEIRO, DISTR.EXPON retornará a função de distribuição cumulativa; se for FALSO, retornará a função de densidade de probabilidade.' },
        },
    },
    F_DIST: {
        description: 'Retorna a distribuição de probabilidade F. Você pode usar esta função para determinar se dois conjuntos de dados têm graus de diversidade diferentes. Por exemplo, você pode examinar as pontuações de teste de homens e mulheres que entram no ensino médio e determinar se a variabilidade nas fêmeas é diferente da encontrada nos homens.',
        abstract: 'Retorna a distribuição de probabilidade F. Você pode usar esta função para determinar se dois conjuntos de dados têm graus de diversidade diferentes. Por exemplo, você pode examinar as pontuações de teste de homens e mulheres que entram no ensino médio e determinar se a variabilidade nas fêmeas é diferente da encontrada nos homens.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/f-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor no qual se avalia a função.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Necessário. O grau de liberdade do numerador.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Necessário. O grau de liberdade do denominador.' },
            cumulative: { name: 'cumulative', detail: 'Necessário. Um valor lógico que determina a forma da função. Se cumulativo for VERDADEIRO, DIST.F retornará a função de distribuição cumulativa; se for FALSO, retornará a função de densidade de probabilidade.' },
        },
    },
    F_DIST_RT: {
        description: 'Retorna a distribuição de probabilidade F (de cauda direita) (nível de diversidade) para dois conjuntos de dados. Você pode usar esta função para determinar se dois conjuntos de dados têm graus de diversidade diferentes. Por exemplo, é possível examinar os resultados dos testes de homens e mulheres que ingressam no 2º grau e determinar se a variabilidade entre as mulheres é diferente daquela encontrada entre os homens.',
        abstract: 'Retorna a distribuição de probabilidade F (de cauda direita) (nível de diversidade) para dois conjuntos de dados. Você pode usar esta função para determinar se dois conjuntos de dados têm graus de diversidade diferentes. Por exemplo, é possível examinar os resultados dos testes de homens e mulheres que ingressam no 2º grau e determinar se a variabilidade entre as mulheres é diferente daquela encontrada entre os homens.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/f-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor no qual se avalia a função.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obrigatório. O grau de liberdade do numerador.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obrigatório. O grau de liberdade do denominador.' },
        },
    },
    F_INV: {
        description: 'Devolve o inverso da distribuição da probabilidade F. Se p = DIST.F(x,...), INV.F(p,...) = x. A distribuição F pode ser usada em um teste F que compara o grau de variabilidade em dois conjuntos de dados. Por exemplo, você pode analisar as distribuições de renda nos Estados Unidos e Canadá para determinar se os dois países têm um grau de diversidade de renda semelhante.',
        abstract: 'Devolve o inverso da distribuição da probabilidade F. Se p = DIST.F(x,...), INV.F(p,...) = x. A distribuição F pode ser usada em um teste F que compara o grau de variabilidade em dois conjuntos de dados. Por exemplo, você pode analisar as distribuições de renda nos Estados Unidos e Canadá para determinar se os dois países têm um grau de diversidade de renda semelhante.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/f-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obrigatório. Uma probabilidade associada à distribuição cumulativa F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obrigatório. O grau de liberdade do numerador.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obrigatório. O grau de liberdade do denominador.' },
        },
    },
    F_INV_RT: {
        description: 'Retorna o inverso da distribuição de probabilidades F (de cauda direita). Se p = DIST.F.CD(x,...), então INV.F.CD(p,...) = x. A distribuição F pode ser usada em um teste F que compara o grau de variabilidade em dois conjuntos de dados. Por exemplo, você pode analisar as distribuições de renda nos Estados Unidos e Canadá para determinar se os dois países têm um grau de diversidade de renda semelhante.',
        abstract: 'Retorna o inverso da distribuição de probabilidades F (de cauda direita). Se p = DIST.F.CD(x,...), então INV.F.CD(p,...) = x. A distribuição F pode ser usada em um teste F que compara o grau de variabilidade em dois conjuntos de dados. Por exemplo, você pode analisar as distribuições de renda nos Estados Unidos e Canadá para determinar se os dois países têm um grau de diversidade de renda semelhante.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/f-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obrigatório. Uma probabilidade associada à distribuição cumulativa F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obrigatório. O grau de liberdade do numerador.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obrigatório. O grau de liberdade do denominador.' },
        },
    },
    F_TEST: {
        description: 'Use esta função para determinar se duas amostras possuem variações diferentes. Por exemplo, a partir de resultados de testes fornecidos por escolas públicas e particulares, você pode verificar se essas escolas têm diferentes níveis de diversidade da pontuação de teste.',
        abstract: 'Use esta função para determinar se duas amostras possuem variações diferentes. Por exemplo, a partir de resultados de testes fornecidos por escolas públicas e particulares, você pode verificar se essas escolas têm diferentes níveis de diversidade da pontuação de teste.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/f-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obrigatório. A primeira matriz ou intervalo de dados.' },
            array2: { name: 'array2', detail: 'Obrigatório. A segunda matriz ou intervalo de dados.' },
        },
    },
    FISHER: {
        description: 'Retorna a transformação Fisher em x. Essa transformação produz uma função que é normalmente distribuída em vez de distorcida. Use esta função para executar testes de hipóteses no coeficiente de correlação.',
        abstract: 'Retorna a transformação Fisher em x. Essa transformação produz uma função que é normalmente distribuída em vez de distorcida. Use esta função para executar testes de hipóteses no coeficiente de correlação.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/fisher-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. Um valor numérico para o qual se deseja a transformação.' },
        },
    },
    FISHERINV: {
        description: 'Retorna o inverso da transformação Fisher. Use esta transformação ao analisar correlações entre intervalos ou matrizes de dados. Se y = FISHER(x), então FISHERINV(y) = x.',
        abstract: 'Retorna o inverso da transformação Fisher. Use esta transformação ao analisar correlações entre intervalos ou matrizes de dados. Se y = FISHER(x), então FISHERINV(y) = x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/fisherinv-function',
            },
        ],
        functionParameter: {
            y: { name: 'y', detail: 'Obrigatório. O valor para o qual se deseja efetuar o inverso da transformação.' },
        },
    },
    FORECAST: {
        description: 'Calcule ou preveja um valor futuro com valores existentes. O valor futuro é um valor y para um determinado valor x. Os valores existentes são valores x conhecidos e valores y e o valor futuro é previsto através da regressão linear. Pode utilizar estas funções para prever futuras vendas, requisitos de inventário ou tendências de consumidor.',
        abstract: 'Calcule ou preveja um valor futuro com valores existentes. O valor futuro é um valor y para um determinado valor x. Os valores existentes são valores x conhecidos e valores y e o valor futuro é previsto através da regressão linear. Pode utilizar estas funções para prever futuras vendas, requisitos de inventário ou tendências de consumidor.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'sim O ponto de dados cujo valor você deseja prever.' },
            knownYs: { name: 'known_y\'s', detail: 'sim O intervalo de dados ou matriz dependente.' },
            knownXs: { name: 'known_x\'s', detail: 'sim O intervalo de dados ou matriz independente.' },
        },
    },
    FORECAST_ETS: {
        description: 'Prevê um valor futuro com base em valores existentes usando uma versão AAA do algoritmo de Suavização Exponencial (ETS).',
        abstract: 'Prevê um valor futuro com base em valores existentes usando uma versão AAA do algoritmo de Suavização Exponencial (ETS).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Data de destino', detail: 'O ponto de dados para o qual você deseja prever um valor.' },
            values: { name: 'Valores', detail: 'Os valores históricos usados na previsão.' },
            timeline: { name: 'Linha do tempo', detail: 'Um intervalo ou matriz independente de datas ou horas numéricas com etapa constante.' },
            seasonality: { name: 'Sazonalidade', detail: 'Opcional. 1 para detecção automática e 0 para nenhuma sazonalidade.' },
            dataCompletion: { name: 'Conclusão de dados', detail: 'Opcional. Use 1 para interpolar pontos ausentes ou 0 para tratá-los como zero.' },
            aggregation: { name: 'Agregação', detail: 'Opcional. Um valor de 1 a 7 especifica a agregação de carimbos de data/hora duplicados.' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Retorna o intervalo de confiança de um valor futuro previsto usando uma versão AAA do algoritmo de Suavização Exponencial (ETS).',
        abstract: 'Retorna o intervalo de confiança de um valor futuro previsto usando uma versão AAA do algoritmo de Suavização Exponencial (ETS).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Data de destino', detail: 'O ponto de dados para o qual você deseja prever um valor.' },
            values: { name: 'Valores', detail: 'Os valores históricos usados na previsão.' },
            timeline: { name: 'Linha do tempo', detail: 'Um intervalo ou matriz independente de datas ou horas numéricas com etapa constante.' },
            confidenceLevel: { name: 'Nível de confiança', detail: 'Opcional. Um número entre 0 e 1; o padrão é 0,95.' },
            seasonality: { name: 'Sazonalidade', detail: 'Opcional. 1 para detecção automática e 0 para nenhuma sazonalidade.' },
            dataCompletion: { name: 'Conclusão de dados', detail: 'Opcional. Use 1 para interpolar pontos ausentes ou 0 para tratá-los como zero.' },
            aggregation: { name: 'Agregação', detail: 'Opcional. Um valor de 1 a 7 especifica a agregação de carimbos de data/hora duplicados.' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Retorna a duração do padrão sazonal detectado pelo algoritmo de Suavização Exponencial (ETS).',
        abstract: 'Retorna a duração do padrão sazonal detectado pelo algoritmo de Suavização Exponencial (ETS).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: 'Valores', detail: 'Os valores históricos usados na previsão.' },
            timeline: { name: 'Linha do tempo', detail: 'Um intervalo ou matriz independente de datas ou horas numéricas com etapa constante.' },
            dataCompletion: { name: 'Conclusão de dados', detail: 'Opcional. Use 1 para interpolar pontos ausentes ou 0 para tratá-los como zero.' },
            aggregation: { name: 'Agregação', detail: 'Opcional. Um valor de 1 a 7 especifica a agregação de carimbos de data/hora duplicados.' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Retorna um valor estatístico como resultado da previsão de série temporal usando uma versão AAA do algoritmo de Suavização Exponencial (ETS).',
        abstract: 'Retorna um valor estatístico como resultado da previsão de série temporal usando uma versão AAA do algoritmo de Suavização Exponencial (ETS).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: 'Valores', detail: 'Os valores históricos usados na previsão.' },
            timeline: { name: 'Linha do tempo', detail: 'Um intervalo ou matriz independente de datas ou horas numéricas com etapa constante.' },
            statisticType: { name: 'Tipo de estatística', detail: 'Um valor de 1 a 8 especifica a estatística de previsão retornada.' },
            seasonality: { name: 'Sazonalidade', detail: 'Opcional. 1 para detecção automática e 0 para nenhuma sazonalidade.' },
            dataCompletion: { name: 'Conclusão de dados', detail: 'Opcional. Use 1 para interpolar pontos ausentes ou 0 para tratá-los como zero.' },
            aggregation: { name: 'Agregação', detail: 'Opcional. Um valor de 1 a 7 especifica a agregação de carimbos de data/hora duplicados.' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Calcule ou preveja um valor futuro com valores existentes. O valor futuro é um valor y para um determinado valor x. Os valores existentes são valores x conhecidos e valores y e o valor futuro é previsto através da regressão linear. Pode utilizar estas funções para prever futuras vendas, requisitos de inventário ou tendências de consumidor.',
        abstract: 'Calcule ou preveja um valor futuro com valores existentes. O valor futuro é um valor y para um determinado valor x. Os valores existentes são valores x conhecidos e valores y e o valor futuro é previsto através da regressão linear. Pode utilizar estas funções para prever futuras vendas, requisitos de inventário ou tendências de consumidor.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'sim O ponto de dados cujo valor você deseja prever.' },
            knownYs: { name: 'known_y\'s', detail: 'sim O intervalo de dados ou matriz dependente.' },
            knownXs: { name: 'known_x\'s', detail: 'sim O intervalo de dados ou matriz independente.' },
        },
    },
    FREQUENCY: {
        description: 'A função FREQUÊNCIA calcula a frequência com que os valores ocorrem em um intervalo de valores e, em seguida, retorna uma matriz vertical de números. Por exemplo, use FREQÜÊNCIA para contar o número de resultados de teste. Pelo fato de FREQÜÊNCIA retornar uma matriz, deve ser inserida como uma fórmula matricial.',
        abstract: 'A função FREQUÊNCIA calcula a frequência com que os valores ocorrem em um intervalo de valores e, em seguida, retorna uma matriz vertical de números. Por exemplo, use FREQÜÊNCIA para contar o número de resultados de teste. Pelo fato de FREQÜÊNCIA retornar uma matriz, deve ser inserida como uma fórmula matricial.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/frequency-function',
            },
        ],
        functionParameter: {
            dataArray: { name: 'data_array', detail: 'Necessário. Uma matriz ou uma referência a um conjunto de valores cujas frequências você deseja contar. Se matriz_dados não contiver valores, FREQÜÊNCIA retornará uma matriz de zeros.' },
            binsArray: { name: 'bins_array', detail: 'Necessário. Uma matriz ou referência a intervalos nos quais você deseja agrupar os valores contidos em matriz_dados. Se matriz_bin não contiver valores, FREQÜÊNCIA retornará o número de elementos em matriz_dados.' },
        },
    },
    GAMMA: {
        description: 'Retorna o valor da função GAMA.',
        abstract: 'Retorna o valor da função GAMA.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/gamma-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Retorna um número.' },
        },
    },
    GAMMA_DIST: {
        description: 'Retorna a distribuição gama. Você pode usar esta função para estudar variáveis que possam apresentar uma distribuição enviesada. A distribuição gama é comumente utilizada em análise de filas.',
        abstract: 'Retorna a distribuição gama. Você pode usar esta função para estudar variáveis que possam apresentar uma distribuição enviesada. A distribuição gama é comumente utilizada em análise de filas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/gamma-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor no qual a distribuição será avaliada.' },
            alpha: { name: 'alpha', detail: 'Obrigatório. Um parâmetro da distribuição.' },
            beta: { name: 'beta', detail: 'Obrigatório. Um parâmetro da distribuição. Se beta = 1, DIST.GAMA retornará a distribuição gama padrão.' },
            cumulative: { name: 'cumulative', detail: 'Obrigatório. Um valor lógico que determina a forma da função. Se cumulativo for VERDADEIRO, DIST.GAMA retornará a função de distribuição cumulativa; se for FALSO, retornará a função densidade de probabilidade.' },
        },
    },
    GAMMA_INV: {
        description: 'Retorna o inverso da distribuição cumulativa gama. Se p = DIST.GAMA(x;...), então INV.GAMA(p;...) = x. Você pode usar essa função para estudar uma variável cuja distribuição pode ser enviesada.',
        abstract: 'Retorna o inverso da distribuição cumulativa gama. Se p = DIST.GAMA(x;...), então INV.GAMA(p;...) = x. Você pode usar essa função para estudar uma variável cuja distribuição pode ser enviesada.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/gamma-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Necessário. A probabilidade associada à distribuição gama.' },
            alpha: { name: 'alpha', detail: 'Necessário. Um parâmetro da distribuição.' },
            beta: { name: 'beta', detail: 'Necessário. Um parâmetro da distribuição. Se beta = 1, INV.GAMA retornará a distribuição gama padrão.' },
        },
    },
    GAMMALN: {
        description: 'Retorna o logaritmo natural da função gama, Γ(x).',
        abstract: 'Retorna o logaritmo natural da função gama, Γ(x).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/gammaln-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor para o qual você deseja calcular LNGAMA.' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'Retorna o logaritmo natural da função gama, Γ(x).',
        abstract: 'Retorna o logaritmo natural da função gama, Γ(x).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/gammaln-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor para o qual você deseja calcular LNGAMA.PRECISO.' },
        },
    },
    GAUSS: {
        description: 'Calcula a probabilidade em que um membro de uma população padrão normal irá se situar entre a média e os desvios z padrão da média.',
        abstract: 'Calcula a probabilidade em que um membro de uma população padrão normal irá se situar entre a média e os desvios z padrão da média.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/gauss-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Obrigatório. Retorna um número.' },
        },
    },
    GEOMEAN: {
        description: 'Retorna a média geométrica de uma matriz ou de um intervalo de dados positivos. Por exemplo, você pode usar MÉDIA.GEOMÉTRICA para calcular o crescimento médio considerando-se juros compostos com taxas variáveis.',
        abstract: 'Retorna a média geométrica de uma matriz ou de um intervalo de dados positivos. Por exemplo, você pode usar MÉDIA.GEOMÉTRICA para calcular o crescimento médio considerando-se juros compostos com taxas variáveis.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/geomean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Núm1 é obrigatório, os números subsequentes são opcionais. De 1 a 255 argumentos para os quais você deseja calcular a média. Você também pode usar uma única matriz ou referência a uma matriz em vez de argumentos separados por ponto-e-vírgulas.' },
            number2: { name: 'number2', detail: 'Núm1 é obrigatório, os números subsequentes são opcionais. De 1 a 255 argumentos para os quais você deseja calcular a média. Você também pode usar uma única matriz ou referência a uma matriz em vez de argumentos separados por ponto-e-vírgulas.' },
        },
    },
    GROWTH: {
        description: 'Calcula o crescimento exponencial previsto usando dados existentes. CRESCIMENTO retorna os valores y para uma série de novos valores x que você especifica usando valores x e y existentes. Você também pode usar a função de planilha CRESCIMENTO para ajustar uma curva exponencial em valores x e y.',
        abstract: 'Calcula o crescimento exponencial previsto usando dados existentes. CRESCIMENTO retorna os valores y para uma série de novos valores x que você especifica usando valores x e y existentes. Você também pode usar a função de planilha CRESCIMENTO para ajustar uma curva exponencial em valores x e y.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/growth-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obrigatório. O conjunto de valores y que você já conhece na relação y = b*m^x. Se a matriz val_conhecidos_y estiver em uma única coluna, cada coluna de val_conhecidos_x será interpretada como uma variável separada. Se a matriz val_conhecidos_y for uma única linha, cada linha de val_conhecidos_x será interpretada como uma variável separada. Se algum dos números em known_y for 0 ou negativo, CRESCIMENTO devolve o #NUM! valor de erro.' },
            knownXs: { name: 'known_x\'s', detail: 'Opcional. Um conjunto opcional de valores x que você talvez conheça na relação y = b*m^x. A matriz val_conhecidos_x pode incluir um ou mais conjuntos de variáveis. Se apenas uma variável for usada, val_conhecidos_y e val_conhecidos_x podem ser intervalos de qualquer formato, desde que tenham dimensões iguais. Se mais de uma variável for usada, val_conhecidos_y deve ser um vetor (ou seja, um intervalo com altura de uma linha ou largura de uma coluna). Se val_conhecidos_x for omitido, pressupõe-se que a matriz {1,2,3....} é do mesmo tamanho que val_conhecidos_y.' },
            newXs: { name: 'new_x\'s', detail: 'Opcional. São novos valores x para os quais você deseja que CRESCIMENTO retorne valores y correspondentes. Novos_valores_x deve incluir uma coluna (ou linha) para cada variável independente, da mesma forma que val_conhecidos_x. Portanto, se val_conhecidos_y estiver em uma única coluna, val_conhecidos_x e novos_valores_x devem ter o mesmo número de colunas. Se val_conhecidos_y estiver em uma única linha, val_conhecidos_x e novos_valores_x devem ter o mesmo número de linhas. Se novos_valores_x for omitido, será considerado como equivalente a val_conhecidos_x. Se val_conhecidos_x e novos_valores_x forem omitidos, serão considerados como equivalentes à matriz {1,2,3,...} que é do mesmo tamanho de val_conhecidos_y.' },
            constb: { name: 'const', detail: 'Opcional. Um valor lógico que força ou não a constante b a se igualar a 1. Se constante for VERDADEIRO ou omitida, b será calculado normalmente. Se constante for FALSO, b será definido como 1 e os valores m serão ajustados para que y = m^x.' },
        },
    },
    HARMEAN: {
        description: 'Retorna a média harmônica de um conjunto de dados. A média harmônica é a recíproca da média aritmética das recíprocas.',
        abstract: 'Retorna a média harmônica de um conjunto de dados. A média harmônica é a recíproca da média aritmética das recíprocas.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/harmean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Número1 é necessário, números subsequentes são opcionais. De 1 a 255 argumentos para os quais você deseja calcular a média. Você também pode usar uma única matriz ou referência a uma matriz em vez de argumentos separados por ponto-e-vírgulas.' },
            number2: { name: 'number2', detail: 'Número1 é necessário, números subsequentes são opcionais. De 1 a 255 argumentos para os quais você deseja calcular a média. Você também pode usar uma única matriz ou referência a uma matriz em vez de argumentos separados por ponto-e-vírgulas.' },
        },
    },
    HYPGEOM_DIST: {
        description: 'Retorna a distribuição hipergeométrica. DIST.HIPERGEOM.N retorna a probabilidade de um determinado número de sucessos de uma amostra, de acordo com o tamanho da amostra, sucessos da população e tamanho da população. Use DIST.HIPERGEOM.N para problemas com uma população finita, em que cada observação é equivalente a um sucesso ou a um fracasso, e em que cada subconjunto de um determinado tamanho é escolhido com igual probabilidade.',
        abstract: 'Retorna a distribuição hipergeométrica. DIST.HIPERGEOM.N retorna a probabilidade de um determinado número de sucessos de uma amostra, de acordo com o tamanho da amostra, sucessos da população e tamanho da população. Use DIST.HIPERGEOM.N para problemas com uma população finita, em que cada observação é equivalente a um sucesso ou a um fracasso, e em que cada subconjunto de um determinado tamanho é escolhido com igual probabilidade.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/hypgeom-dist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Necessário. O número de sucessos em uma amostra.' },
            numberSample: { name: 'number_sample', detail: 'Necessário. O tamanho da amostra.' },
            populationS: { name: 'population_s', detail: 'Necessário. O número de sucessos na população.' },
            numberPop: { name: 'number_pop', detail: 'Necessário. O tamanho da população.' },
            cumulative: { name: 'cumulative', detail: 'Necessário. Um valor lógico que determina a forma da função. Se cumulativo for VERDADEIRO, DIST.HIPERGEOM.N retornará a função de distribuição cumulativa; se for FALSO, retornará a função de probabilidade de massa.' },
        },
    },
    INTERCEPT: {
        description: 'Calcula o ponto no qual uma linha irá interceptar o eixo y usando valores de x e y existentes. O ponto de interseção é baseado em uma linha de regressão de melhor ajuste plotada pelos valores de x e y conhecidos. Use a função INTERCEPÇÃO quando você quiser determinar o valor da variável dependente e a variável independente for 0 (zero). Por exemplo, você pode usar a função INTERCEPÇÃO para prever a resistência elétrica de um metal a 0°C quando os pontos de dados forem medidos em temperatura ambiente ou mais elevada.',
        abstract: 'Calcula o ponto no qual uma linha irá interceptar o eixo y usando valores de x e y existentes. O ponto de interseção é baseado em uma linha de regressão de melhor ajuste plotada pelos valores de x e y conhecidos. Use a função INTERCEPÇÃO quando você quiser determinar o valor da variável dependente e a variável independente for 0 (zero). Por exemplo, você pode usar a função INTERCEPÇÃO para prever a resistência elétrica de um metal a 0°C quando os pontos de dados forem medidos em temperatura ambiente ou mais elevada.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/intercept-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Necessário. O conjunto dependente de observações ou dados.' },
            knownXs: { name: 'known_x\'s', detail: 'Necessário. O conjunto independente de observações ou dados.' },
        },
    },
    KURT: {
        description: 'Retorna a curtose de um conjunto de dados. A curtose caracteriza uma distribuição em cume ou plana se comparada à distribuição normal. A curtose positiva indica uma distribuição relativamente em cume. A curtose negativa indica uma distribuição relativamente plana.',
        abstract: 'Retorna a curtose de um conjunto de dados. A curtose caracteriza uma distribuição em cume ou plana se comparada à distribuição normal. A curtose positiva indica uma distribuição relativamente em cume. A curtose negativa indica uma distribuição relativamente plana.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/kurt-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Núm1 é obrigatório, os números subsequentes são opcionais. De 1 a 255 argumentos para os quais você deseja calcular a curtose. Você também pode usar uma única matriz ou referência a uma matriz em vez de argumentos separados por ponto-e-vírgulas.' },
            number2: { name: 'number2', detail: 'Núm1 é obrigatório, os números subsequentes são opcionais. De 1 a 255 argumentos para os quais você deseja calcular a curtose. Você também pode usar uma única matriz ou referência a uma matriz em vez de argumentos separados por ponto-e-vírgulas.' },
        },
    },
    LARGE: {
        description: 'Retorna o maior valor k-ésimo de um conjunto de dados. Você pode usar esta função para selecionar um valor de acordo com a sua posição relativa. Por exemplo, você pode usar MAIOR para obter o primeiro, o segundo e o terceiro resultados.',
        abstract: 'Retorna o maior valor k-ésimo de um conjunto de dados. Você pode usar esta função para selecionar um valor de acordo com a sua posição relativa. Por exemplo, você pode usar MAIOR para obter o primeiro, o segundo e o terceiro resultados.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/large-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Necessário. A matriz ou intervalo de dados cujo maior valor k-ésimo você deseja determinar.' },
            k: { name: 'k', detail: 'Obrigatório. A posição (do maior) na matriz ou intervalo de célula de dados a ser fornecida.' },
        },
    },
    LINEST: {
        description: 'A função PROJ.LIN calcula as estatísticas para uma linha usando o método "quadrados mínimos" para calcular uma linha reta que melhor se ajusta aos seus dados e retorna uma matriz que descreve essa linha. Você também pode combinar a função PROJ.LIN com outras funções para calcular as estatísticas de outros tipos de modelos que são lineares nos parâmetros desconhecidos, incluindo séries polinomiais, logarítmicas, exponenciais e de potência. Como essa função retorna uma matriz de valores, ela deve ser inserida como uma fórmula de matriz. Instruções acompanham os exemplos neste artigo.',
        abstract: 'A função PROJ.LIN calcula as estatísticas para uma linha usando o método "quadrados mínimos" para calcular uma linha reta que melhor se ajusta aos seus dados e retorna uma matriz que descreve essa linha. Você também pode combinar a função PROJ.LIN com outras funções para calcular as estatísticas de outros tipos de modelos que são lineares nos parâmetros desconhecidos, incluindo séries polinomiais, logarítmicas, exponenciais e de potência. Como essa função retorna uma matriz de valores, ela deve ser inserida como uma fórmula de matriz. Instruções acompanham os exemplos neste artigo.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/linest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obrigatório. O conjunto de valores y que você já conhece na relação y = mx + b. Se o intervalo de known_y estiver em uma única coluna, cada coluna de known_x será interpretada como uma variável separada. Se o intervalo de known_y estiver contido em uma única linha, cada linha de known_x será interpretada como uma variável separada.' },
            knownXs: { name: 'known_x\'s', detail: 'Opcional. Um conjunto opcional de valores x que talvez você já conheça na relação y = mx + b. O intervalo de known_x pode incluir um ou mais conjuntos de variáveis. Se apenas uma variável for usada, known_y e known_x poderão ser intervalos de qualquer formato, desde que tenham dimensões iguais. Se mais de uma variável for usada, known_y deve ser um vetor (ou seja, um intervalo com altura de uma linha ou largura de uma coluna). Se known_x for omitido, será considerado a matriz {1,2,3,...} com o mesmo tamanho que known_y .' },
            constb: { name: 'const', detail: 'Opcional. Um valor lógico que especifica se a constante b será ou não forçada a se igualar a 0. Se constante for VERDADEIRO ou omitido, b será calculado normalmente. Se constante for FALSO, b será definido como igual a 0 e os valores m serão ajustados para se adaptarem a y = mx.' },
            stats: { name: 'stats', detail: 'Opcional. O valor lógico que especifica se estatísticas de regressão adicionais serão retornadas. Se estatística for VERDADEIRO, PROJ.LIN retornará as estatísticas de regressão adicionais; Como resultado, a matriz retornada é {mn,mn-1,...,m1,b; sen,sen-1,...,se1,seb; r 2 , sey; F,df; ssreg,ssresid} . Se estatística for FALSO ou omitido, PROJ.LIN retornará somente os coeficientes m e a constante b. Os dados estatísticos de regressão adicionais são:' },
        },
    },
    LOGEST: {
        description: 'A equação para a curva é:',
        abstract: 'A equação para a curva é:',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/logest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Necessário. O conjunto de valores y que você já conhece na relação y = b*m^x. Se a matriz val_conhecidos_y estiver em uma única coluna, cada coluna de val_conhecidos_x será interpretada como uma variável separada. Se a matriz val_conhecidos_y for uma única linha, cada linha de val_conhecidos_x será interpretada como uma variável separada.' },
            knownXs: { name: 'known_x\'s', detail: 'Opcional. Um conjunto opcional de valores x que você talvez conheça na relação y = b*m^x. A matriz val_conhecidos_x pode incluir um ou mais conjuntos de variáveis. Se apenas uma variável for usada, val_conhecidos_y e val_conhecidos_x podem ser intervalos de qualquer formato, desde que tenham dimensões iguais. Se mais de uma variável for usada, val_conhecidos_y deve ser um vetor (ou seja, um intervalo com altura de uma linha ou largura de uma coluna). Se val_conhecidos_x for omitido, pressupõe-se que a matriz {1,2,3,...} seja do mesmo tamanho que val_conhecidos_y.' },
            constb: { name: 'const', detail: 'Opcional. Um valor lógico que força ou não a constante b a se igualar a 1. Se constante for VERDADEIRO ou omitido, b será calculado normalmente. Se constante for FALSO, b será o conjunto igual a 1, e os valores m são ajustados para y = m^x.' },
            stats: { name: 'stats', detail: 'Opcional. O valor lógico que especifica se estatísticas de regressão adicionais serão retornadas. Se estatística for VERDADEIRO, PROJ.LOG retornará a estatística de regressão adicional, de forma que a matriz retornada será {mn,mn-1,...,m1,b;sen,sen-1,...,se1,seb;r 2,sey; F,df;ssreg,ssresid}. Se estatística for FALSO ou omitido, PROJ.LOG retornará apenas os coeficientes m e a constante b.' },
        },
    },
    LOGNORM_DIST: {
        description: 'Use esta função para analisar os dados que forem transformados através de logaritmos.',
        abstract: 'Use esta função para analisar os dados que forem transformados através de logaritmos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/lognorm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor no qual se avalia a função.' },
            mean: { name: 'mean', detail: 'Obrigatório. A média do ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Obrigatório. O desvio padrão do ln(x).' },
            cumulative: { name: 'cumulative', detail: 'Obrigatório. Um valor lógico que determina a forma da função. Se cumulativo for VERDADEIRO, DIST.LOGNORMAL.N retornará a função de distribuição cumulativa; se for FALSO, retornará a função de densidade de probabilidade.' },
        },
    },
    LOGNORM_INV: {
        description: 'Retorna o inverso da função de distribuição cumulativa lognormal de x, em que ln(x) normalmente é distribuída com os parâmetros Média e Desv_padrão. Se p = DIST.LOGNORMAL.N(x,...) então INV.LOGNORMAL(p,...) = x.',
        abstract: 'Retorna o inverso da função de distribuição cumulativa lognormal de x, em que ln(x) normalmente é distribuída com os parâmetros Média e Desv_padrão. Se p = DIST.LOGNORMAL.N(x,...) então INV.LOGNORMAL(p,...) = x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Necessário. Uma probabilidade associada à distribuição lognormal.' },
            mean: { name: 'mean', detail: 'Necessário. A média do ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Necessário. O desvio padrão do ln(x).' },
        },
    },
    MARGINOFERROR: {
        description: 'Esta função calcula a margem de erro a partir de um intervalo de valores e de um nível de confiança.',
        abstract: 'Esta função calcula a margem de erro a partir de um intervalo de valores e de um nível de confiança.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/12487850?hl=pt-BR',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'O intervalo de valores usado para calcular a margem de erro.' },
            confidence: { name: 'confidence', detail: 'O nível de confiança desejado entre 0 e 1.' },
        },
    },
    MAX: {
        description: 'Retorna o valor máximo de um conjunto de valores.',
        abstract: 'Retorna o valor máximo de um conjunto de valores.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/max-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Número1 é necessário, números subsequentes são opcionais. De 1 a 255 números cujo valor máximo você deseja saber.' },
            number2: { name: 'number2', detail: 'Número1 é necessário, números subsequentes são opcionais. De 1 a 255 números cujo valor máximo você deseja saber.' },
        },
    },
    MAXA: {
        description: 'Retorna o maior valor em uma lista de argumentos.',
        abstract: 'Retorna o maior valor em uma lista de argumentos.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/maxa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Obrigatório. O primeiro argumento de número para o qual você deseja localizar o maior valor.' },
            value2: { name: 'value2', detail: 'Opcional. Argumentos de número de 2 a 255 cujo valor máximo você deseja saber.' },
        },
    },
    MAXIFS: {
        description: 'A função MÁXIMOSES retorna o valor máximo entre as células especificadas por um determinado conjunto de critérios ou condições.',
        abstract: 'A função MÁXIMOSES retorna o valor máximo entre as células especificadas por um determinado conjunto de critérios ou condições.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/maxifs-function',
            },
        ],
        functionParameter: {
            maxRange: { name: 'sum_range', detail: 'O intervalo real das células em que o valor máximo vai ser determinado.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'É o conjunto de células a serem avaliadas com os critérios.' },
            criteria1: { name: 'criteria1', detail: 'São os critérios na forma de um número, expressão ou texto que definem quais células serão avaliadas como o máximo. O mesmo conjunto de critérios funciona para as funções MÍNIMOSES , SOMASES e MÉDIASES .' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Os intervalos adicionais e seus critérios associados. Você pode inserir até 126 pares de intervalo/critérios.' },
            criteria2: { name: 'criteria2', detail: 'Os intervalos adicionais e seus critérios associados. Você pode inserir até 126 pares de intervalo/critérios.' },
        },
    },
    MEDIAN: {
        description: 'Retorna a mediana dos números indicados. A mediana é o número no centro de um conjunto de números.',
        abstract: 'Retorna a mediana dos números indicados. A mediana é o número no centro de um conjunto de números.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/median-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Número1 é necessário, números subsequentes são opcionais. De 1 a 255 números dos quais você deseja obter a mediana.' },
            number2: { name: 'number2', detail: 'Número1 é necessário, números subsequentes são opcionais. De 1 a 255 números dos quais você deseja obter a mediana.' },
        },
    },
    MIN: {
        description: 'Retorna o menor número na lista de argumentos.',
        abstract: 'Retorna o menor número na lista de argumentos.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/min-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Núm1 é opcional, os números subsequentes são opcionais. De 1 a 255 números cujo valor MÍNIMO você deseja saber.' },
            number2: { name: 'number2', detail: 'Núm1 é opcional, os números subsequentes são opcionais. De 1 a 255 números cujo valor MÍNIMO você deseja saber.' },
        },
    },
    MINA: {
        description: 'Retorna o menor valor na lista de argumentos.',
        abstract: 'Retorna o menor valor na lista de argumentos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/mina-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Valor1 é obrigatório, os valores subsequentes são opcionais. De 1 a 255 valores cujo menor valor você deseja saber.' },
            value2: { name: 'value2', detail: 'Valor1 é obrigatório, os valores subsequentes são opcionais. De 1 a 255 valores cujo menor valor você deseja saber.' },
        },
    },
    MINIFS: {
        description: 'A função MÍNIMOSES retorna o valor mínimo entre as células especificadas por um determinado conjunto de critérios ou condições.',
        abstract: 'A função MÍNIMOSES retorna o valor mínimo entre as células especificadas por um determinado conjunto de critérios ou condições.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/minifs-function',
            },
        ],
        functionParameter: {
            minRange: { name: 'min_range', detail: 'O intervalo real das células em que o valor mínimo vai ser determinado.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'É o conjunto de células a serem avaliadas com os critérios.' },
            criteria1: { name: 'criteria1', detail: 'São os critérios na forma de um número, de uma expressão ou de um texto que definem quais células serão avaliadas como o mínimo. O mesmo conjunto de critérios funciona para as funções MÁXIMOSES , SOMASES e MÉDIASES .' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Os intervalos adicionais e seus critérios associados. Você pode inserir até 126 pares de intervalo/critérios.' },
            criteria2: { name: 'criteria2', detail: 'Os intervalos adicionais e seus critérios associados. Você pode inserir até 126 pares de intervalo/critérios.' },
        },
    },
    MODE_MULT: {
        description: 'Isso retornará mais de um resultado se existirem modos múltiplos. Como essa função retorna uma matriz de valores, ela deve ser inserida como uma fórmula de matriz.',
        abstract: 'Isso retornará mais de um resultado se existirem modos múltiplos. Como essa função retorna uma matriz de valores, ela deve ser inserida como uma fórmula de matriz.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/mode-mult-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Necessário. O primeiro argumento de número cujo modo você deseja calcular.' },
            number2: { name: 'number2', detail: 'Opcional. Argumentos de número de 2 a 254 para os quais você deseja calcular o modo. Você também pode usar uma única matriz ou referência a uma matriz em vez de argumentos separados por ponto-e-vírgulas.' },
        },
    },
    MODE_SNGL: {
        description: 'Retorna o valor que ocorre com mais frequência em uma matriz ou intervalo de dados.',
        abstract: 'Retorna o valor que ocorre com mais frequência em uma matriz ou intervalo de dados.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/mode-sngl-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obrigatório. O primeiro argumento cujo modo você deseja calcular.' },
            number2: { name: 'number2', detail: 'Opcional. Argumentos de 2 a 254 para os quais você deseja calcular o modo. Você também pode usar uma única matriz ou referência a uma matriz em vez de argumentos separados por ponto-e-vírgulas.' },
        },
    },
    NEGBINOM_DIST: {
        description: 'Retorna a distribuição binominal negativa, a probabilidade de ocorrer núm_f fracassos antes de núm_s-ésimo sucesso, quando a probabilidade constante de um sucesso é probabilidade_s.',
        abstract: 'Retorna a distribuição binominal negativa, a probabilidade de ocorrer núm_f fracassos antes de núm_s-ésimo sucesso, quando a probabilidade constante de um sucesso é probabilidade_s.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/negbinom-dist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Necessário. O número de insucessos.' },
            numberS: { name: 'number_s', detail: 'Necessário. O número a partir do qual se considera haver sucesso.' },
            probabilityS: { name: 'probability_s', detail: 'Necessário. A probabilidade de sucesso.' },
            cumulative: { name: 'cumulative', detail: 'Necessário. Um valor lógico que determina a forma da função. Se cumulativo for VERDADEIRO, DIST.BIN.NEG.N retornará a função de distribuição cumulativa; se for FALSO, retornará a função de densidade de probabilidade.' },
        },
    },
    NORM_DIST: {
        description: 'Retorna a distribuição cumulativa normal para a média especificada e o desvio padrão. Esta função tem uma enorme variedade de aplicações em estatística, incluindo verificação de hipóteses.',
        abstract: 'Retorna a distribuição cumulativa normal para a média especificada e o desvio padrão. Esta função tem uma enorme variedade de aplicações em estatística, incluindo verificação de hipóteses.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/norm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor cuja distribuição você deseja obter.' },
            mean: { name: 'mean', detail: 'Obrigatório. A média aritmética da distribuição.' },
            standardDev: { name: 'standard_dev', detail: 'Obrigatório. O desvio padrão da distribuição.' },
            cumulative: { name: 'cumulative', detail: 'Obrigatório. Um valor lógico que determina a forma da função. Se cumulativo for VERDADEIRO, NORM. DIST devolve a função de distribuição cumulativa; se FOR FALSO, devolve a função de densidade de probabilidade.' },
        },
    },
    NORM_INV: {
        description: 'Retorna o inverso da distribuição cumulativa normal para a média específica e o desvio padrão.',
        abstract: 'Retorna o inverso da distribuição cumulativa normal para a média específica e o desvio padrão.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/norm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Necessário. Uma probabilidade correspondente à distribuição normal.' },
            mean: { name: 'mean', detail: 'Necessário. A média aritmética da distribuição.' },
            standardDev: { name: 'standard_dev', detail: 'Necessário. O desvio padrão da distribuição.' },
        },
    },
    NORM_S_DIST: {
        description: 'A NORMA. A função DIST.S no Excel devolve a distribuição normal padrão ( ou seja, tem uma média de zero e um desvio padrão de um ). Pode utilizar esta função em vez de utilizar uma tabela de áreas curvas normais padrão.',
        abstract: 'A NORMA. A função DIST.S no Excel devolve a distribuição normal padrão ( ou seja, tem uma média de zero e um desvio padrão de um ). Pode utilizar esta função em vez de utilizar uma tabela de áreas curvas normais padrão.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/norm-s-dist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Obrigatório. Este é o valor para o qual pretende obter a distribuição.' },
            cumulative: { name: 'cumulative', detail: 'Obrigatório. O argumento cumulativo pode ser VERDADEIRO ou FALSO . Este valor lógico determina a forma da função. Se cumulativo for VERDADEIRO, NORM. DIST.S devolve a função de distribuição cumulativa . Se for FALSO, devolve a função de densidade de probabilidade .' },
        },
    },
    NORM_S_INV: {
        description: 'Retorna o inverso da distribuição cumulativa normal padrão. A distribuição possui uma média igual a zero e um desvio padrão igual a um.',
        abstract: 'Retorna o inverso da distribuição cumulativa normal padrão. A distribuição possui uma média igual a zero e um desvio padrão igual a um.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/norm-s-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Necessário. Uma probabilidade correspondente à distribuição normal.' },
        },
    },
    PEARSON: {
        description: 'Retorna o coeficiente de correlação do momento do produto Pearson, r, um índice sem dimensão situado ente -1,0 e 1.0 inclusive, que reflete a extensão de uma relação linear entre dois conjuntos de dados.',
        abstract: 'Retorna o coeficiente de correlação do momento do produto Pearson, r, um índice sem dimensão situado ente -1,0 e 1.0 inclusive, que reflete a extensão de uma relação linear entre dois conjuntos de dados.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/pearson-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Necessário. Um conjunto de valores independentes.' },
            array2: { name: 'array2', detail: 'Necessário. Um conjunto de valores dependentes.' },
        },
    },
    PERCENTILE_EXC: {
        description: 'O PERCENTIL. A função EXC devolve o percentil k de valores num intervalo, em que k está no intervalo 0..1, exclusivo.',
        abstract: 'O PERCENTIL. A função EXC devolve o percentil k de valores num intervalo, em que k está no intervalo 0..1, exclusivo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/percentile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Necessário. A matriz ou intervalo de dados que define a posição relativa.' },
            k: { name: 'k', detail: 'Obrigatório. Um valor de percentil no intervalo 0 < k < 1.' },
        },
    },
    PERCENTILE_INC: {
        description: 'Devolve o n-ésimo percentil de valores num intervalo, em que k está no intervalo de 0 a 1, inclusive.',
        abstract: 'Devolve o n-ésimo percentil de valores num intervalo, em que k está no intervalo de 0 a 1, inclusive.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/percentile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obrigatório. A matriz ou intervalo de dados que define a posição relativa.' },
            k: { name: 'k', detail: 'Obrigatório. O valor de percentil no intervalo de 0 a 1, inclusive.' },
        },
    },
    PERCENTRANK_EXC: {
        description: 'Retorna a ordem percentual de um valor em um conjunto de dados como um percentual (0..1, exclusivo) do conjunto de dados.',
        abstract: 'Retorna a ordem percentual de um valor em um conjunto de dados como um percentual (0..1, exclusivo) do conjunto de dados.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/percentrank-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obrigatório. A matriz ou intervalo de dados com valores numéricos que define uma posição relativa' },
            x: { name: 'x', detail: 'Obrigatório. O valor cuja ordem você deseja saber.' },
            significance: { name: 'significance', detail: 'Opcional. Um valor opcional que identifica o número de dígitos significativos para o valor de porcentagem retornado. Se omitido, ORDEM.PORCENTUAL.EXC usará três dígitos (0,xxx).' },
        },
    },
    PERCENTRANK_INC: {
        description: 'Retorna a ordem percentual de um valor em um conjunto de dados como um percentual (0..1, inclusivo) do conjunto de dados.',
        abstract: 'Retorna a ordem percentual de um valor em um conjunto de dados como um percentual (0..1, inclusivo) do conjunto de dados.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/percentrank-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Necessário. A matriz ou intervalo de dados com valores numéricos que define uma posição relativa.' },
            x: { name: 'x', detail: 'Obrigatório. O valor cuja ordem você deseja saber.' },
            significance: { name: 'significance', detail: 'Opcional. Um valor opcional que identifica o número de dígitos significativos para o valor de porcentagem retornado. Se omitido, ORDEM.PORCENTUAL.INC usará três dígitos (0,xxx).' },
        },
    },
    PERMUT: {
        description: 'Retorna o número de permutações para um determinado número de objetos.',
        abstract: 'Retorna o número de permutações para um determinado número de objetos.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/permut-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'O número de itens.' },
            numberChosen: { name: 'number_chosen', detail: 'O número de itens em cada permutação.' },
        },
    },
    PERMUTATIONA: {
        description: 'Retorna o número de permutações para um determinado número de objetos (com repetições) que podem ser selecionados do total de objetos.',
        abstract: 'Retorna o número de permutações para um determinado número de objetos (com repetições) que podem ser selecionados do total de objetos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/permutationa-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. Um inteiro que descreve o número total de objetos.' },
            numberChosen: { name: 'number_chosen', detail: 'Necessário. Um número inteiro que descreve o número de objetos em cada permutação.' },
        },
    },
    PHI: {
        description: 'Retorna o valor da função de densidade para uma distribuição normal padrão.',
        abstract: 'Retorna o valor da função de densidade para uma distribuição normal padrão.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/phi-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. X é o número do qual você quer a densidade da distribuição normal padrão.' },
        },
    },
    POISSON_DIST: {
        description: 'Retorna a distribuição Poisson. Uma aplicação comum da distribuição Poisson é prever o número de eventos em um determinado período de tempo, como o número de carros que chega ao ponto de pedágio em um minuto.',
        abstract: 'Retorna a distribuição Poisson. Uma aplicação comum da distribuição Poisson é prever o número de eventos em um determinado período de tempo, como o número de carros que chega ao ponto de pedágio em um minuto.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/poisson-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O número de eventos.' },
            mean: { name: 'mean', detail: 'Necessário. O valor numérico esperado.' },
            cumulative: { name: 'cumulative', detail: 'Necessário. Um valor lógico que determina a forma da distribuição de probabilidade fornecida. Se cumulativo for VERDADEIRO, DIST.POISSON retornará a probabilidade Poisson de que o número de eventos aleatórios estará entre zero e x inclusive; se FALSO, retornará a função massa da probabilidade Poisson de que o número de eventos será equivalente a x.' },
        },
    },
    PROB: {
        description: 'Retorna a probabilidade de valores em um intervalo estarem entre dois limites. Se o limite_superior não for fornecido, retornará a probabilidade de que os valores no intervalo_ x sejam iguais ao limite_inferior.',
        abstract: 'Retorna a probabilidade de valores em um intervalo estarem entre dois limites. Se o limite_superior não for fornecido, retornará a probabilidade de que os valores no intervalo_ x sejam iguais ao limite_inferior.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/prob-function',
            },
        ],
        functionParameter: {
            xRange: { name: 'x_range', detail: 'Obrigatório. O intervalo de valores numéricos de x com os quais são associadas probabilidades.' },
            probRange: { name: 'prob_range', detail: 'Obrigatório. Um conjunto de probabilidades associado com valores no intervalo_x.' },
            lowerLimit: { name: 'lower_limit', detail: 'Opcional. O limite inferior do valor cuja probabilidade você deseja obter.' },
            upperLimit: { name: 'upper_limit', detail: 'Opcional. O limite superior opcional do valor cuja probabilidade você deseja obter.' },
        },
    },
    QUARTILE_EXC: {
        description: 'Devolve o quartil do conjunto de dados, com base em valores de percentil de 0 a 1, exclusivos.',
        abstract: 'Devolve o quartil do conjunto de dados, com base em valores de percentil de 0 a 1, exclusivos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/quartile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obrigatório. A matriz ou intervalo de célula de valores numéricos cujo valor quartil você deseja obter.' },
            quart: { name: 'quart', detail: 'Obrigatório. Indica o valor a ser retornado.' },
        },
    },
    QUARTILE_INC: {
        description: 'Retorna o quartil de um conjunto de dados, com base em valores de percentil de 0..1, inclusivo.',
        abstract: 'Retorna o quartil de um conjunto de dados, com base em valores de percentil de 0..1, inclusivo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/quartile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Necessário. A matriz ou intervalo de célula de valores numéricos cujo valor quartil você deseja obter.' },
            quart: { name: 'quart', detail: 'Necessário. Indica o valor a ser retornado.' },
        },
    },
    RANK_AVG: {
        description: 'Devolve a classificação de um número numa lista de números: o respetivo tamanho em relação a outros valores na lista. Se mais do que um valor tiver a mesma classificação, é devolvida a classificação média.',
        abstract: 'Devolve a classificação de um número numa lista de números: o respetivo tamanho em relação a outros valores na lista. Se mais do que um valor tiver a mesma classificação, é devolvida a classificação média.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/rank-avg-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número cuja posição se deseja encontrar.' },
            ref: { name: 'ref', detail: 'Obrigatório. Uma matriz ou referência a uma lista de números. Valores não numéricos em Ref são ignorados.' },
            order: { name: 'order', detail: 'Opcional. Um número que especifica como posicionar um número em uma ordem.' },
        },
    },
    RANK_EQ: {
        description: 'Retorna a posição de um número em uma lista de números. Seu tamanho em relação a outros valores de uma lista; se mais de um valor tiver a mesma posição, a posição superior desse conjunto de valores será retornada.',
        abstract: 'Retorna a posição de um número em uma lista de números. Seu tamanho em relação a outros valores de uma lista; se mais de um valor tiver a mesma posição, a posição superior desse conjunto de valores será retornada.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/rank-eq-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número cuja posição se deseja encontrar.' },
            ref: { name: 'ref', detail: 'Necessário. Uma matriz ou referência a uma lista de números. Valores não numéricos em Ref são ignorados.' },
            order: { name: 'order', detail: 'Opcional. Um número que especifica como posicionar um número em uma ordem.' },
        },
    },
    RSQ: {
        description: 'Retorna o quadrado do coeficiente de correlação do momento do produto de Pearson através dos pontos de dados em val_conhecidos_y e val_conhecidos_x. Para saber mais, veja a função PEARSON . O valor r2 pode ser interpretado como a proporção da variação em y que pode ser atribuída à variação em x.',
        abstract: 'Retorna o quadrado do coeficiente de correlação do momento do produto de Pearson através dos pontos de dados em val_conhecidos_y e val_conhecidos_x. Para saber mais, veja a função PEARSON . O valor r2 pode ser interpretado como a proporção da variação em y que pode ser atribuída à variação em x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Necessário. Uma matriz ou intervalo de células de pontos de dados dependentes e numéricos.' },
            knownXs: { name: 'known_x\'s', detail: 'Necessário. O conjunto de pontos de dados independentes.' },
        },
    },
    SKEW: {
        description: 'Retorna a distorção de uma distribuição. O valor enviesado caracteriza o grau de assimetria de uma distribuição em torno de sua média. Um valor enviesado positivo indica uma distribuição com uma ponta assimétrica que se estende em direção a valores mais positivos. Um valor enviesado negativo indica uma distribuição com uma ponta assimétrica que se estende em direção a valores mais negativos.',
        abstract: 'Retorna a distorção de uma distribuição. O valor enviesado caracteriza o grau de assimetria de uma distribuição em torno de sua média. Um valor enviesado positivo indica uma distribuição com uma ponta assimétrica que se estende em direção a valores mais positivos. Um valor enviesado negativo indica uma distribuição com uma ponta assimétrica que se estende em direção a valores mais negativos.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/skew-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Número1 é necessário, números subsequentes são opcionais. Argumentos de 1 a 255 para os quais você deseja calcular a distorção. Você também pode usar uma única matriz ou referência a uma matriz em vez de argumentos separados por ponto-e-vírgula.' },
            number2: { name: 'number2', detail: 'Número1 é necessário, números subsequentes são opcionais. Argumentos de 1 a 255 para os quais você deseja calcular a distorção. Você também pode usar uma única matriz ou referência a uma matriz em vez de argumentos separados por ponto-e-vírgula.' },
        },
    },
    SKEW_P: {
        description: 'Retorna a DISTORÇÃO de uma distribuição com base em uma população: uma caracterização do grau de assimetria de uma distribuição em torno de seu meio.',
        abstract: 'Retorna a DISTORÇÃO de uma distribuição com base em uma população: uma caracterização do grau de assimetria de uma distribuição em torno de seu meio.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/skew-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'O primeiro número, referência de célula ou intervalo para o qual você deseja calcular a assimetria.' },
            number2: { name: 'number2', detail: 'Números, referências de célula ou intervalos adicionais para os quais você deseja calcular a assimetria, até o máximo de 255.' },
        },
    },
    SLOPE: {
        description: 'Retorna a inclinação da linha de regressão linear através de pontos de dados em val_conhecidos_y e val_conhecidos_x. A inclinação é a distância vertical dividida pela distância horizontal entre dois pontos quaisquer na linha, que é a taxa de mudança ao longo da linha de regressão.',
        abstract: 'Retorna a inclinação da linha de regressão linear através de pontos de dados em val_conhecidos_y e val_conhecidos_x. A inclinação é a distância vertical dividida pela distância horizontal entre dois pontos quaisquer na linha, que é a taxa de mudança ao longo da linha de regressão.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/slope-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Necessário. Uma matriz ou intervalo de células de pontos de dados dependentes e numéricos.' },
            knownXs: { name: 'known_x\'s', detail: 'Necessário. O conjunto de pontos de dados independentes.' },
        },
    },
    SMALL: {
        description: 'Retorna o menor valor k-ésimo do conjunto de dados. Use esta função para retornar valores com uma posição específica relativa em um conjunto de dados.',
        abstract: 'Retorna o menor valor k-ésimo do conjunto de dados. Use esta função para retornar valores com uma posição específica relativa em um conjunto de dados.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/small-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Necessário. Uma matriz ou intervalo de dados numéricos cujo menor valor k-ésimo você deseja determinar.' },
            k: { name: 'k', detail: 'Obrigatório. A posição (a partir do menor) na matriz ou intervalo de dados a ser fornecido.' },
        },
    },
    STANDARDIZE: {
        description: 'Retorna um valor normalizado de uma distribuição caracterizada por média e desv_padrão.',
        abstract: 'Retorna um valor normalizado de uma distribuição caracterizada por média e desv_padrão.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/standardize-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor que você deseja normalizar.' },
            mean: { name: 'mean', detail: 'Obrigatório. A média aritmética da distribuição.' },
            standardDev: { name: 'standard_dev', detail: 'Obrigatório. O desvio padrão da distribuição.' },
        },
    },
    STDEV_P: {
        description: 'O desvio padrão é uma medida do grau de dispersão dos valores em relação ao valor médio (a média).',
        abstract: 'O desvio padrão é uma medida do grau de dispersão dos valores em relação ao valor médio (a média).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/stdev-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Necessário. O primeiro argumento numérico correspondente a uma população.' },
            number2: { name: 'number2', detail: 'Opcional. Argumentos numéricos de 2 a 254 correspondentes a uma população. Você também pode usar uma única matriz ou uma referência a uma matriz em vez de argumentos separados por ponto-e-vírgula.' },
        },
    },
    STDEV_S: {
        description: 'O desvio padrão é uma medida do grau de dispersão dos valores em relação ao valor médio (a média).',
        abstract: 'O desvio padrão é uma medida do grau de dispersão dos valores em relação ao valor médio (a média).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/stdev-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Necessário. O primeiro argumento numérico correspondente a uma amostra de população. Você também pode usar uma única matriz ou uma referência a uma matriz em vez de argumentos separados por ponto-e-vírgula.' },
            number2: { name: 'number2', detail: 'Opcional. Argumentos numéricos de 2 a 254 correspondentes a uma amostra de população. Você também pode usar uma única matriz ou uma referência a uma matriz em vez de argumentos separados por ponto-e-vírgula.' },
        },
    },
    STDEVA: {
        description: 'Estima o desvio padrão com base em uma amostra. O desvio padrão é uma medida do grau de dispersão dos valores em relação ao valor médio (a média).',
        abstract: 'Estima o desvio padrão com base em uma amostra. O desvio padrão é uma medida do grau de dispersão dos valores em relação ao valor médio (a média).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/stdeva-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Valor1 é obrigatório, os valores subsequentes são opcionais. Valores de 1 a 255 correspondentes a uma amostra de população. Você também pode usar uma única matriz ou uma referência a uma matriz em vez de argumentos separados por ponto-e-vírgula.' },
            value2: { name: 'value2', detail: 'Valor1 é obrigatório, os valores subsequentes são opcionais. Valores de 1 a 255 correspondentes a uma amostra de população. Você também pode usar uma única matriz ou uma referência a uma matriz em vez de argumentos separados por ponto-e-vírgula.' },
        },
    },
    STDEVPA: {
        description: 'Calcula o desvio padrão com base na população inteira dada como argumentos, incluindo os valores lógicos e de texto. O desvio padrão é uma medida do grau de dispersão dos valores em relação ao valor médio (a média).',
        abstract: 'Calcula o desvio padrão com base na população inteira dada como argumentos, incluindo os valores lógicos e de texto. O desvio padrão é uma medida do grau de dispersão dos valores em relação ao valor médio (a média).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/stdevpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 é necessário, os valores subsequentes são opcionais. Valores de 1 a 255 correspondentes a uma população. Você também pode usar uma única matriz ou uma referência a uma matriz em vez de argumentos separados por ponto-e-vírgula.' },
            value2: { name: 'value2', detail: 'Value1 é necessário, os valores subsequentes são opcionais. Valores de 1 a 255 correspondentes a uma população. Você também pode usar uma única matriz ou uma referência a uma matriz em vez de argumentos separados por ponto-e-vírgula.' },
        },
    },
    STEYX: {
        description: 'Retorna o erro padrão do valor-y previsto para cada x da regressão. O erro padrão é uma medida da quantidade de erro na previsão de y para um x individual.',
        abstract: 'Retorna o erro padrão do valor-y previsto para cada x da regressão. O erro padrão é uma medida da quantidade de erro na previsão de y para um x individual.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/steyx-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obrigatório. Uma matriz ou intervalo de pontos de dados dependentes.' },
            knownXs: { name: 'known_x\'s', detail: 'Obrigatório. Uma matriz ou intervalo de pontos de dados independentes.' },
        },
    },
    T_DIST: {
        description: 'Retorna a distribuição t caudal esquerda de Student. A distribuição t é usada no teste de hipóteses de pequenos conjuntos de dados de amostras. Use esta função em vez de uma tabela de valores críticos para a distribuição t.',
        abstract: 'Retorna a distribuição t caudal esquerda de Student. A distribuição t é usada no teste de hipóteses de pequenos conjuntos de dados de amostras. Use esta função em vez de uma tabela de valores críticos para a distribuição t.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/t-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor numérico em que se avalia a distribuição' },
            degFreedom: { name: 'degFreedom', detail: 'Obrigatório. Um número inteiro indicando o número de graus de liberdade.' },
            cumulative: { name: 'cumulative', detail: 'Obrigatório. Um valor lógico que determina a forma da função. Se cumulativo for VERDADEIRO, DIST.T retornará a função de distribuição cumulativa; se for FALSO, retornará a função densidade de probabilidade.' },
        },
    },
    T_DIST_2T: {
        description: 'A distribuição t de Student é usada no teste de hipóteses de pequenos conjuntos de dados de amostras. Use esta função em vez de uma tabela de valores críticos para a distribuição t.',
        abstract: 'A distribuição t de Student é usada no teste de hipóteses de pequenos conjuntos de dados de amostras. Use esta função em vez de uma tabela de valores críticos para a distribuição t.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/t-dist-2t-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor numérico em que se avalia a distribuição.' },
            degFreedom: { name: 'degFreedom', detail: 'Obrigatório. Um número inteiro indicando o número de graus de liberdade.' },
        },
    },
    T_DIST_RT: {
        description: 'A distribuição t é usada no teste de hipóteses de pequenos conjuntos de dados de amostras. Use esta função em vez de uma tabela de valores críticos para a distribuição t.',
        abstract: 'A distribuição t é usada no teste de hipóteses de pequenos conjuntos de dados de amostras. Use esta função em vez de uma tabela de valores críticos para a distribuição t.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/t-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor numérico em que se avalia a distribuição.' },
            degFreedom: { name: 'degFreedom', detail: 'Obrigatório. Um número inteiro indicando o número de graus de liberdade.' },
        },
    },
    T_INV: {
        description: 'Retorna o inverso caudal esquerdo da distribuição t de Student',
        abstract: 'Retorna o inverso caudal esquerdo da distribuição t de Student',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/t-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obrigatório. A probabilidade associada à distribuição t de Student caudal esquerdo.' },
            degFreedom: { name: 'degFreedom', detail: 'Obrigatório. O número de graus de liberdade que caracteriza a distribuição.' },
        },
    },
    T_INV_2T: {
        description: 'Retorna o inverso bicaudal da distribuição t de Student',
        abstract: 'Retorna o inverso bicaudal da distribuição t de Student',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/t-inv-2t-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Necessário. A probabilidade associada à distribuição t de Student caudal esquerdo.' },
            degFreedom: { name: 'degFreedom', detail: 'Necessário. O número de graus de liberdade que caracteriza a distribuição.' },
        },
    },
    T_TEST: {
        description: 'Retorna a probabilidade associada ao teste t de Student. Use TESTE.T para determinar se duas amostras poderão ser provenientes de duas populações subjacentes que possuem a mesma média.',
        abstract: 'Retorna a probabilidade associada ao teste t de Student. Use TESTE.T para determinar se duas amostras poderão ser provenientes de duas populações subjacentes que possuem a mesma média.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/t-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Necessário. O primeiro conjunto de dados.' },
            array2: { name: 'array2', detail: 'Necessário. O segundo conjunto de dados.' },
            tails: { name: 'tails', detail: 'Necessário. Especifica o número de caudas da distribuição. Se caudas = 1, TESTE.T usará a distribuição unicaudal. Se caudas = 2, TESTE.T usará a distribuição bicaudal.' },
            type: { name: 'type', detail: 'Necessário. O tipo de Teste t a ser executado.' },
        },
    },
    TREND: {
        description: 'A função TREND retorna valores ao longo de uma tendência linear. Ele se encaixa em uma linha reta (usando o método de menos quadrados) aos known_y e known_x da matriz. TREND retorna os valores y ao longo dessa linha para a matriz de new_x que você especifica.',
        abstract: 'A função TREND retorna valores ao longo de uma tendência linear. Ele se encaixa em uma linha reta (usando o método de menos quadrados) aos known_y e known_x da matriz. TREND retorna os valores y ao longo dessa linha para a matriz de new_x que você especifica.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/trend-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'O conjunto de valores y que você já conhece na relação y = mx + b Se a matriz val_conhecidos_y estiver em uma única coluna, cada coluna de val_conhecidos_x será interpretada como uma variável separada. Se a matriz val_conhecidos_y for uma única linha, cada linha de val_conhecidos_x será interpretada como uma variável separada.' },
            knownXs: { name: 'known_x\'s', detail: 'Um conjunto opcional de valores x que você já pode conhecer na relação y = mx + b A matriz val_conhecidos_x pode incluir um ou mais conjuntos de variáveis. Se apenas uma variável for usada, val_conhecidos_y e val_conhecidos_x podem ser intervalos de qualquer formato, desde que tenham dimensões iguais. Se mais de uma variável for usada, val_conhecidos_y deve ser um vetor (ou seja, um intervalo com altura de uma linha ou largura de uma coluna). Se val_conhecidos_x for omitido, pressupõe-se que a matriz {1,2,3....} é do mesmo tamanho que val_conhecidos_y.' },
            newXs: { name: 'new_x\'s', detail: 'Novos valores x para os quais você deseja que a TREND retorne valores y correspondentes Novos_valores_x deve incluir uma coluna (ou linha) para cada variável independente, da mesma forma que val_conhecidos_x. Portanto, se val_conhecidos_y estiver em uma única coluna, val_conhecidos_x e novos_valores_x devem ter o mesmo número de colunas. Se val_conhecidos_y estiver em uma única linha, val_conhecidos_x e novos_valores_x devem ter o mesmo número de linhas. Se você omitir novos_valores_x, pressupõe-se que seja igual a val_conhecidos_x. Se você omitir val_conhecidos_x e novos_valores_x, eles serão considerados como a matriz {1,2,3,...} que é do mesmo tamanho que val_conhecidos_y.' },
            constb: { name: 'const', detail: 'Um valor lógico que especifica se deve forçar a constante b a igual a 0 Se constante for VERDADEIRO ou omitido, b será calculado normalmente. Se constante for FALSO, b será definido como 0 (zero) e os valores m serão ajustados de forma que y = mx.' },
        },
    },
    TRIMMEAN: {
        description: 'Retorna a média do interior de um conjunto de dados. MÉDIA.INTERNA calcula a média obtida excluindo-se uma porcentagem dos pontos de dados das pontas superior e inferior de um conjunto de dados. Você pode usar esta função quando quiser excluir dados externos à sua análise.',
        abstract: 'Retorna a média do interior de um conjunto de dados. MÉDIA.INTERNA calcula a média obtida excluindo-se uma porcentagem dos pontos de dados das pontas superior e inferior de um conjunto de dados. Você pode usar esta função quando quiser excluir dados externos à sua análise.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/trimmean-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obrigatório. A matriz ou intervalo de valores a se calcular a média desprezando os desvios.' },
            percent: { name: 'percent', detail: 'Obrigatório. O número fracionário de ponto de dados a ser excluído do cálculo. Por exemplo, se porcentagem = 0,2, serão arrumados 4 pontos de um conjunto de dados de 20 pontos (20 x 0,2): 2 da parte superior e 2 da parte inferior do conjunto.' },
        },
    },
    VAR_P: {
        description: 'Calcula a variação com base na população inteira (ignora valores lógicos e de texto na população).',
        abstract: 'Calcula a variação com base na população inteira (ignora valores lógicos e de texto na população).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/var-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Necessário. O primeiro argumento numérico correspondente a uma população.' },
            number2: { name: 'number2', detail: 'Opcional. Argumentos numéricos de 2 a 254 correspondentes a uma população.' },
        },
    },
    VAR_S: {
        description: 'Estima a variação com base em uma amostra (ignora valores lógicos e de texto na amostra).',
        abstract: 'Estima a variação com base em uma amostra (ignora valores lógicos e de texto na amostra).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/var-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obrigatório. O primeiro argumento numérico correspondente a uma amostra de população.' },
            number2: { name: 'number2', detail: 'Opcional. Argumentos numéricos de 2 a 254 correspondentes a uma amostra de população.' },
        },
    },
    VARA: {
        description: 'Estima a variação com base em uma amostra.',
        abstract: 'Estima a variação com base em uma amostra.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/vara-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Value1 é necessário, os valores subsequentes são opcionais. Argumentos de valor de 1 a 255 correspondentes a uma amostra de população.' },
            value2: { name: 'value2', detail: 'Value1 é necessário, os valores subsequentes são opcionais. Argumentos de valor de 1 a 255 correspondentes a uma amostra de população.' },
        },
    },
    VARPA: {
        description: 'Calcula a variação com base na população inteira.',
        abstract: 'Calcula a variação com base na população inteira.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/varpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Valor1 é obrigatório, os valores subsequentes são opcionais. Argumentos de valor de 1 a 255 correspondentes a uma população.' },
            value2: { name: 'value2', detail: 'Valor1 é obrigatório, os valores subsequentes são opcionais. Argumentos de valor de 1 a 255 correspondentes a uma população.' },
        },
    },
    WEIBULL_DIST: {
        description: 'Retorna a distribuição Weibull. Use esta distribuição na análise de confiabilidade, como no cálculo do tempo médio de falha para determinado dispositivo.',
        abstract: 'Retorna a distribuição Weibull. Use esta distribuição na análise de confiabilidade, como no cálculo do tempo médio de falha para determinado dispositivo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/weibull-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor no qual se avalia a função.' },
            alpha: { name: 'alpha', detail: 'Obrigatório. Um parâmetro da distribuição.' },
            beta: { name: 'beta', detail: 'Obrigatório. Um parâmetro da distribuição.' },
            cumulative: { name: 'cumulative', detail: 'Obrigatório. Determina a forma da função.' },
        },
    },
    Z_TEST: {
        description: 'Para ver como o TESTE.Z pode ser usado em uma fórmula para calcular um valor de probabilidade bicaudal, consulte a seção Comentários abaixo.',
        abstract: 'Para ver como o TESTE.Z pode ser usado em uma fórmula para calcular um valor de probabilidade bicaudal, consulte a seção Comentários abaixo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/z-test-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Necessário. A matriz ou o intervalo de dados em que x será testado.' },
            x: { name: 'x', detail: 'Obrigatório. O valor a ser testado.' },
            sigma: { name: 'sigma', detail: 'Opcional. O desvio padrão da população (conhecido). Quando não especificado, o desvio padrão de amostra será usado.' },
        },
    },
};

export default locale;
