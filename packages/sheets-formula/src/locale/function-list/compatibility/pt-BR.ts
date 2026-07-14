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
    BETADIST: {
        description: 'Retorna a função de densidade de probabilidade beta cumulativa. A distribuição beta geralmente é usada para estudar a variação na porcentagem de determinado valor em amostras, como a fração do dia que as pessoas passam assistindo televisão.',
        abstract: 'Retorna a função de densidade de probabilidade beta cumulativa. A distribuição beta geralmente é usada para estudar a variação na porcentagem de determinado valor em amostras, como a fração do dia que as pessoas passam assistindo televisão.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor entre A e B no qual se avalia a função.' },
            alpha: { name: 'alpha', detail: 'Obrigatório. Um parâmetro da distribuição.' },
            beta: { name: 'beta', detail: 'Obrigatório. Um parâmetro da distribuição.' },
            A: { name: 'A', detail: 'Um limite inferior para o intervalo de x.' },
            B: { name: 'B', detail: 'Opcional. Um limite superior para o intervalo de x.' },
        },
    },
    BETAINV: {
        description: 'Retorna o inverso da função de densidade de probabilidade beta cumulativa para uma distribuição beta especificada. Ou seja, se probabilidade = DISTBETA(x;...), BETA.ACUM.INV(probabilidade;...) = x. A distribuição beta pode ser usada no planejamento do projeto para criar modelos de tempos de conclusão provável de acordo com determinado tempo de conclusão e variabilidade esperados.',
        abstract: 'Retorna o inverso da função de densidade de probabilidade beta cumulativa para uma distribuição beta especificada. Ou seja, se probabilidade = DISTBETA(x;...), BETA.ACUM.INV(probabilidade;...) = x. A distribuição beta pode ser usada no planejamento do projeto para criar modelos de tempos de conclusão provável de acordo com determinado tempo de conclusão e variabilidade esperados.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/betainv-function',
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
    BINOMDIST: {
        description: 'Retorna a probabilidade de distribuição binomial do termo individual. Use DISTRBINOM em problemas com um número fixo de testes ou tentativas, quando os resultados de determinada tentativa forem apenas sucesso ou fracasso, quando as tentativas forem independentes e quando a probabilidade de sucesso for constante durante toda a experiência. Por exemplo, DISTRBINOM pode calcular a probabilidade de que dois dos próximos três bebês sejam meninos.',
        abstract: 'Retorna a probabilidade de distribuição binomial do termo individual. Use DISTRBINOM em problemas com um número fixo de testes ou tentativas, quando os resultados de determinada tentativa forem apenas sucesso ou fracasso, quando as tentativas forem independentes e quando a probabilidade de sucesso for constante durante toda a experiência. Por exemplo, DISTRBINOM pode calcular a probabilidade de que dois dos próximos três bebês sejam meninos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Obrigatório. O número de tentativas bem-sucedidas.' },
            trials: { name: 'trials', detail: 'Obrigatório. O número de tentativas independentes.' },
            probabilityS: { name: 'probability_s', detail: 'Obrigatório. A probabilidade de sucesso em cada tentativa.' },
            cumulative: { name: 'cumulative', detail: 'Obrigatório. Um valor lógico que determina a forma da função. Se cumulativo for VERDADEIRO, DISTRBINOM retornará a função de distribuição cumulativa, que é a probabilidade de que exista no máximo núm_s sucessos; se for FALSO, retornará a função massa de probabilidade, que é a probabilidade de que exista núm_s sucessos.' },
        },
    },
    CHIDIST: {
        description: 'Retorna a probabilidade de cauda direita da distribuição qui-quadrada. A distribuição χ2 está associada ao teste χ2. Use o teste χ2 para comparar os valores observados e os esperados. Por exemplo, uma experiência genética pode gerar a hipótese de que a próxima geração de plantas exibirá determinado conjunto de cores. Comparando os resultados observados com os esperados, você poderá decidir se a hipótese original é válida.',
        abstract: 'Retorna a probabilidade de cauda direita da distribuição qui-quadrada. A distribuição χ2 está associada ao teste χ2. Use o teste χ2 para comparar os valores observados e os esperados. Por exemplo, uma experiência genética pode gerar a hipótese de que a próxima geração de plantas exibirá determinado conjunto de cores. Comparando os resultados observados com os esperados, você poderá decidir se a hipótese original é válida.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor no qual a distribuição será avaliada.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obrigatório. O número de graus de liberdade.' },
        },
    },
    CHIINV: {
        description: 'Retorna o inverso da probabilidade de cauda direita da distribuição qui-quadrada. Se probabilidade = CHIDIST(x,...), em seguida, CHIINV(probabilidade,...) = x. Use esta função para comparar os resultados observados com os esperados para decidir se a sua hipótese original é válida.',
        abstract: 'Retorna o inverso da probabilidade de cauda direita da distribuição qui-quadrada. Se probabilidade = CHIDIST(x,...), em seguida, CHIINV(probabilidade,...) = x. Use esta função para comparar os resultados observados com os esperados para decidir se a sua hipótese original é válida.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Necessário. Uma probabilidade associada à distribuição qui-quadrada.' },
            degFreedom: { name: 'deg_freedom', detail: 'Necessário. O número de graus de liberdade.' },
        },
    },
    CHITEST: {
        description: 'Retorna o teste para independência. TESTE.QUI retorna o valor da distribuição qui-quadrada (χ2) para a estatística e os graus apropriados de liberdade. Você pode usar os testes χ2 para determinar se os resultados hipotéticos são verificados por uma experiência.',
        abstract: 'Retorna o teste para independência. TESTE.QUI retorna o valor da distribuição qui-quadrada (χ2) para a estatística e os graus apropriados de liberdade. Você pode usar os testes χ2 para determinar se os resultados hipotéticos são verificados por uma experiência.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Obrigatório. O intervalo de dados que contém observações a serem comparadas com os valores esperados.' },
            expectedRange: { name: 'expected_range', detail: 'Obrigatório. O intervalo de dados que contém a razão entre o produto dos totais de linhas e dos totais de colunas e o total geral.' },
        },
    },
    CONFIDENCE: {
        description: 'Retorna o intervalo de confiança para uma média da população, usando uma distribuição normal.',
        abstract: 'Retorna o intervalo de confiança para uma média da população, usando uma distribuição normal.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Obrigatório. O nível de significância usado para calcular o nível de confiança. O nível de confiança é igual a 100*(1 - alfa)% ou, em outras palavras, um alfa de 0,05 indica um nível de confiança de 95%.' },
            standardDev: { name: 'standard_dev', detail: 'Obrigatório. O desvio-padrão da população para o intervalo de dados e é assumido como conhecido.' },
            size: { name: 'size', detail: 'Obrigatório. O tamanho da amostra.' },
        },
    },
    COVAR: {
        description: 'Devolve covariância, a média dos produtos de desvios para cada par de pontos de dados em dois conjuntos de dados.',
        abstract: 'Devolve covariância, a média dos produtos de desvios para cada par de pontos de dados em dois conjuntos de dados.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obrigatório. O primeiro intervalo de células de inteiros.' },
            array2: { name: 'array2', detail: 'Obrigatório. O segundo intervalo de células de inteiros.' },
        },
    },
    CRITBINOM: {
        description: 'Retorna o menor valor para o qual a distribuição binomial cumulativa é maior ou igual ao valor padrão. Use esta função para aplicações de garantia de qualidade. Por exemplo, use CRIT.BINOM para determinar o número máximo de peças defeituosas que pode sair de uma linha de montagem sem rejeitar o lote inteiro.',
        abstract: 'Retorna o menor valor para o qual a distribuição binomial cumulativa é maior ou igual ao valor padrão. Use esta função para aplicações de garantia de qualidade. Por exemplo, use CRIT.BINOM para determinar o número máximo de peças defeituosas que pode sair de uma linha de montagem sem rejeitar o lote inteiro.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Obrigatório. O número de tentativas de Bernoulli.' },
            probabilityS: { name: 'probability_s', detail: 'Obrigatório. A probabilidade de sucesso em cada tentativa.' },
            alpha: { name: 'alpha', detail: 'Obrigatório. O valor padrão.' },
        },
    },
    EXPONDIST: {
        description: 'Retorna a distribuição exponencial. Use DISTEXPON para criar um modelo do tempo entre os eventos, como quanto tempo determinado caixa eletrônico leva para liberar o dinheiro. Por exemplo, você pode usar DISTEXPON para determinar a probabilidade de que o processo leve no máximo um minuto.',
        abstract: 'Retorna a distribuição exponencial. Use DISTEXPON para criar um modelo do tempo entre os eventos, como quanto tempo determinado caixa eletrônico leva para liberar o dinheiro. Por exemplo, você pode usar DISTEXPON para determinar a probabilidade de que o processo leve no máximo um minuto.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor da função.' },
            lambda: { name: 'lambda', detail: 'Obrigatório. O valor do parâmetro.' },
            cumulative: { name: 'cumulative', detail: 'Obrigatório. Um valor lógico que indica a forma da função exponencial a ser fornecida. Se cumulativo for VERDADEIRO, DISTEXPON retornará a função de distribuição cumulativa; se for FALSO, retornará a função de densidade de probabilidade.' },
        },
    },
    FDIST: {
        description: 'Retorna a distribuição de probabilidade F (de cauda direita) (nível de diversidade) para dois conjuntos de dados. Você pode usar esta função para determinar se dois conjuntos de dados têm graus de diversidade diferentes. Por exemplo, é possível examinar os resultados dos testes de homens e mulheres que ingressam no 2º grau e determinar se a variabilidade entre as mulheres é diferente daquela encontrada entre os homens.',
        abstract: 'Retorna a distribuição de probabilidade F (de cauda direita) (nível de diversidade) para dois conjuntos de dados. Você pode usar esta função para determinar se dois conjuntos de dados têm graus de diversidade diferentes. Por exemplo, é possível examinar os resultados dos testes de homens e mulheres que ingressam no 2º grau e determinar se a variabilidade entre as mulheres é diferente daquela encontrada entre os homens.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor no qual se avalia a função.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obrigatório. O grau de liberdade do numerador.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obrigatório. O grau de liberdade do denominador.' },
        },
    },
    FINV: {
        description: 'Retorna o inverso da distribuição de probabilidades F (de cauda direita). Se p = DISTF(x;...), então INVF(p;...) = x.',
        abstract: 'Retorna o inverso da distribuição de probabilidades F (de cauda direita). Se p = DISTF(x;...), então INVF(p;...) = x.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obrigatório. Uma probabilidade associada à distribuição cumulativa F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obrigatório. O grau de liberdade do numerador.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obrigatório. O grau de liberdade do denominador.' },
        },
    },
    FTEST: {
        description: 'Devolve o resultado de um teste F. Um teste F devolve a probabilidade bicaudal de que as variâncias na matriz1 e na matriz2 não são significativamente diferentes. Use esta função para determinar se duas amostras possuem variações diferentes. Por exemplo, a partir de resultados de testes fornecidos por escolas públicas e particulares, você pode verificar se essas escolas têm diferentes níveis de diversidade da pontuação de teste.',
        abstract: 'Devolve o resultado de um teste F. Um teste F devolve a probabilidade bicaudal de que as variâncias na matriz1 e na matriz2 não são significativamente diferentes. Use esta função para determinar se duas amostras possuem variações diferentes. Por exemplo, a partir de resultados de testes fornecidos por escolas públicas e particulares, você pode verificar se essas escolas têm diferentes níveis de diversidade da pontuação de teste.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obrigatório. A primeira matriz ou intervalo de dados.' },
            array2: { name: 'array2', detail: 'Obrigatório. A segunda matriz ou intervalo de dados.' },
        },
    },
    GAMMADIST: {
        description: 'Retorna a distribuição gama. Você pode usar esta função para estudar variáveis que possam apresentar uma distribuição enviesada. A distribuição gama é comumente utilizada em análise de filas.',
        abstract: 'Retorna a distribuição gama. Você pode usar esta função para estudar variáveis que possam apresentar uma distribuição enviesada. A distribuição gama é comumente utilizada em análise de filas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor no qual a distribuição será avaliada.' },
            alpha: { name: 'alpha', detail: 'Obrigatório. Um parâmetro da distribuição.' },
            beta: { name: 'beta', detail: '(em inglês) Obrigatório. Um parâmetro da distribuição. Se beta = 1, DISTGAMA retorna a distribuição gama padrão.' },
            cumulative: { name: 'cumulative', detail: 'Obrigatório. Um valor lógico que determina a forma da função. Se cumulativo for VERDADEIRO, DISTGAMA retornará a função de distribuição cumulativa; se for FALSO, retornará a função de densidade de probabilidade.' },
        },
    },
    GAMMAINV: {
        description: 'Retorna o inverso da distribuição cumulativa gama. Se p = DISTGAMA(x;...), então INVGAMA(p;...) = x. Você pode usar essa função para estudar uma variável cuja distribuição pode ser enviesada.',
        abstract: 'Retorna o inverso da distribuição cumulativa gama. Se p = DISTGAMA(x;...), então INVGAMA(p;...) = x. Você pode usar essa função para estudar uma variável cuja distribuição pode ser enviesada.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obrigatório. A probabilidade associada à distribuição gama.' },
            alpha: { name: 'alpha', detail: 'Obrigatório. Um parâmetro da distribuição.' },
            beta: { name: 'beta', detail: 'Obrigatório. Um parâmetro da distribuição. Se beta = 1, INVGAMA retornará a distribuição gama padrão.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Retorna a distribuição hipergeométrica. DIST.HIPERGEOM retorna a probabilidade de um determinado número de sucessos de uma amostra, de acordo com o tamanho da amostra, sucessos da população e tamanho da população. Use DIST.HIPERGEOM para problemas com uma população finita, onde cada observação seja equivalente a um sucesso ou a um fracasso, e onde cada subconjunto de um determinado tamanho seja escolhido com igual probabilidade.',
        abstract: 'Retorna a distribuição hipergeométrica. DIST.HIPERGEOM retorna a probabilidade de um determinado número de sucessos de uma amostra, de acordo com o tamanho da amostra, sucessos da população e tamanho da população. Use DIST.HIPERGEOM para problemas com uma população finita, onde cada observação seja equivalente a um sucesso ou a um fracasso, e onde cada subconjunto de um determinado tamanho seja escolhido com igual probabilidade.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Necessário. O número de sucessos em uma amostra.' },
            numberSample: { name: 'number_sample', detail: 'Necessário. O tamanho da amostra.' },
            populationS: { name: 'population_s', detail: 'Necessário. O número de sucessos na população.' },
            numberPop: { name: 'number_pop', detail: 'Necessário. O tamanho da população.' },
        },
    },
    LOGINV: {
        description: 'Retorna o inverso da função de distribuição cumulativa lognormal de x, em que ln(x) normalmente é distribuída com os parâmetros média e desv_padrão. Se p = DIST.LOGNORMAL(x;...) então INVLOG(p;...) = x.',
        abstract: 'Retorna o inverso da função de distribuição cumulativa lognormal de x, em que ln(x) normalmente é distribuída com os parâmetros média e desv_padrão. Se p = DIST.LOGNORMAL(x;...) então INVLOG(p;...) = x.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Necessário. Uma probabilidade associada à distribuição lognormal.' },
            mean: { name: 'mean', detail: 'Necessário. A média do ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Necessário. O desvio padrão do ln(x).' },
        },
    },
    LOGNORMDIST: {
        description: 'Retorna a distribuição log-normal de x, onde ln (x) costuma ser distribuído com média de parâmetros e desv_padrão. Use esta função para analisar os dados que forem transformados através de logaritmos.',
        abstract: 'Retorna a distribuição log-normal de x, onde ln (x) costuma ser distribuído com média de parâmetros e desv_padrão. Use esta função para analisar os dados que forem transformados através de logaritmos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor no qual se avalia a função.' },
            mean: { name: 'mean', detail: 'Necessário. A média do ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Necessário. O desvio padrão do ln(x).' },
        },
    },
    MODE: {
        description: 'Digamos que quer descobrir o número mais comum de espécies de aves avistadas numa amostra de contagem de aves numa zona húmida crítica durante um período de 30 anos, ou quer descobrir o número mais frequente de chamadas telefónicas num centro de suporte telefónico durante as horas de ponta. Para calcular o modo de um grupo de números, utilize a função MODE .',
        abstract: 'Digamos que quer descobrir o número mais comum de espécies de aves avistadas numa amostra de contagem de aves numa zona húmida crítica durante um período de 30 anos, ou quer descobrir o número mais frequente de chamadas telefónicas num centro de suporte telefónico durante as horas de ponta. Para calcular o modo de um grupo de números, utilize a função MODE .',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obrigatório. O primeiro argumento de número cujo modo você deseja calcular.' },
            number2: { name: 'number2', detail: 'Opcional. Argumentos de número de 2 a 255 para os quais você deseja calcular o modo. Você também pode usar uma única matriz ou referência a uma matriz em vez de argumentos separados por ponto-e-vírgulas.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Retorna a distribuição binomial negativa. DIST.BIN.NEG retorna a probabilidade de ocorrer núm_f fracassos antes de núm_s-ésimo sucesso, quando a probabilidade constante de um sucesso é probabilidade_s. Esta função é semelhante à distribuição binomial, exceto pelo fato de que o número de sucessos é fixo e o numero de tentativas é variável. Como ocorre na distribuição binomial, as tentativas são consideradas independentes.',
        abstract: 'Retorna a distribuição binomial negativa. DIST.BIN.NEG retorna a probabilidade de ocorrer núm_f fracassos antes de núm_s-ésimo sucesso, quando a probabilidade constante de um sucesso é probabilidade_s. Esta função é semelhante à distribuição binomial, exceto pelo fato de que o número de sucessos é fixo e o numero de tentativas é variável. Como ocorre na distribuição binomial, as tentativas são consideradas independentes.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Necessário. O número de insucessos.' },
            numberS: { name: 'number_s', detail: 'Necessário. O número a partir do qual se considera haver sucesso.' },
            probabilityS: { name: 'probability_s', detail: 'Necessário. A probabilidade de sucesso.' },
        },
    },
    NORMDIST: {
        description: 'A função NORMDIST retorna a distribuição normal para a média especificada e o desvio padrão. Essa função tem uma ampla gama de aplicativos em estatísticas, incluindo testes de hipótese.',
        abstract: 'A função NORMDIST retorna a distribuição normal para a média especificada e o desvio padrão. Essa função tem uma ampla gama de aplicativos em estatísticas, incluindo testes de hipótese.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor para o qual você deseja a distribuição' },
            mean: { name: 'mean', detail: 'Necessário. A média aritmética da distribuição' },
            standardDev: { name: 'standard_dev', detail: 'Necessário. O desvio padrão da distribuição' },
            cumulative: { name: 'cumulative', detail: 'Necessário. Um valor lógico que determina a forma da função. Se cumulativo for TRUE, NORMDIST retornará a função de distribuição cumulativa; se cumulativo for FALSE, ele retornará a função de massa de probabilidade.' },
        },
    },
    NORMINV: {
        description: 'Retorna o inverso da distribuição cumulativa normal para a média específica e o desvio padrão.',
        abstract: 'Retorna o inverso da distribuição cumulativa normal para a média específica e o desvio padrão.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obrigatório. Uma probabilidade correspondente à distribuição normal.' },
            mean: { name: 'mean', detail: 'Obrigatório. A média aritmética da distribuição.' },
            standardDev: { name: 'standard_dev', detail: 'Obrigatório. O desvio padrão da distribuição.' },
        },
    },
    NORMSDIST: {
        description: 'Retorna a função da distribuição cumulativa normal padrão. A distribuição possui uma média igual a zero e um desvio padrão igual a um. Use esta função no lugar de uma tabela de áreas de curva normal padrão.',
        abstract: 'Retorna a função da distribuição cumulativa normal padrão. A distribuição possui uma média igual a zero e um desvio padrão igual a um. Use esta função no lugar de uma tabela de áreas de curva normal padrão.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Obrigatório. O valor cuja distribuição você deseja obter.' },
        },
    },
    NORMSINV: {
        description: 'Retorna o inverso da distribuição cumulativa normal padrão. A distribuição possui uma média igual a zero e um desvio padrão igual a um.',
        abstract: 'Retorna o inverso da distribuição cumulativa normal padrão. A distribuição possui uma média igual a zero e um desvio padrão igual a um.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obrigatório. Uma probabilidade correspondente à distribuição normal.' },
        },
    },
    PERCENTILE: {
        description: 'Retorna o k-ésimo percentil de valores em um intervalo. Você pode usar esta função para estabelecer um limite de aceitação. Por exemplo, você pode decidir examinar candidatos com pontuação acima do 90º percentil.',
        abstract: 'Retorna o k-ésimo percentil de valores em um intervalo. Você pode usar esta função para estabelecer um limite de aceitação. Por exemplo, você pode decidir examinar candidatos com pontuação acima do 90º percentil.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Necessário. A matriz ou intervalo de dados que define a posição relativa.' },
            k: { name: 'k', detail: 'Obrigatório. O valor do percentil no intervalo 0..1, inclusivo.' },
        },
    },
    PERCENTRANK: {
        description: 'A função PERCENTRANK retorna a classificação de um valor em um conjunto de dados como uma porcentagem do conjunto de dados -- essencialmente, a posição relativa de um valor dentro de todo o conjunto de dados. Por exemplo, você pode usar PERCENTRANK para determinar a posição da pontuação de teste de um indivíduo entre o campo de todas as pontuações para o mesmo teste.',
        abstract: 'A função PERCENTRANK retorna a classificação de um valor em um conjunto de dados como uma porcentagem do conjunto de dados -- essencialmente, a posição relativa de um valor dentro de todo o conjunto de dados. Por exemplo, você pode usar PERCENTRANK para determinar a posição da pontuação de teste de um indivíduo entre o campo de todas as pontuações para o mesmo teste.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Necessário. O intervalo de dados (ou matriz pré-definida) de valores numéricos dentro dos quais a classificação percentual é determinada.' },
            x: { name: 'x', detail: 'Obrigatório. O valor para o qual você deseja saber a classificação dentro da matriz.' },
            significance: { name: 'significance', detail: 'Opcional. Um valor opcional que identifica o número de dígitos significativos para o valor de porcentagem retornado. Se omitido, ORDEM.PORCENTUAL usará três dígitos (0,xxx).' },
        },
    },
    POISSON: {
        description: 'Retorna a distribuição Poisson. Uma aplicação comum da distribuição Poisson é prever o número de eventos em um determinado período de tempo, como o número de carros que chega ao ponto de pedágio em um minuto.',
        abstract: 'Retorna a distribuição Poisson. Uma aplicação comum da distribuição Poisson é prever o número de eventos em um determinado período de tempo, como o número de carros que chega ao ponto de pedágio em um minuto.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O número de eventos.' },
            mean: { name: 'mean', detail: 'Obrigatório. O valor numérico esperado.' },
            cumulative: { name: 'cumulative', detail: 'Obrigatório. Um valor lógico que determina a forma da distribuição de probabilidade fornecida. Se cumulativo for VERDADEIRO, POISSON retornará a probabilidade Poisson de que o número de eventos aleatórios estará entre zero e x inclusive; se FALSO, retornará a função massa da probabilidade Poisson de que o número de eventos será equivalente a x.' },
        },
    },
    QUARTILE: {
        description: 'Retorna o quartil do conjunto de dados. Quartis são comumente usados em dados de vendas e de pesquisas para dividir a população em grupos. Por exemplo, você pode usar QUARTIL para descobrir 25% de maior renda de uma população.',
        abstract: 'Retorna o quartil do conjunto de dados. Quartis são comumente usados em dados de vendas e de pesquisas para dividir a população em grupos. Por exemplo, você pode usar QUARTIL para descobrir 25% de maior renda de uma população.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obrigatório. A matriz ou intervalo de célula de valores numéricos cujo valor quartil você deseja obter.' },
            quart: { name: 'quart', detail: 'Obrigatório. Indica o valor a ser retornado.' },
        },
    },
    RANK: {
        description: 'Retorna a posição de um número em uma lista de números. A ordem de um número é seu tamanho em relação a outros valores de uma lista. (Se você fosse classificar a lista, a ordem do número seria a sua posição.)',
        abstract: 'Retorna a posição de um número em uma lista de números. A ordem de um número é seu tamanho em relação a outros valores de uma lista. (Se você fosse classificar a lista, a ordem do número seria a sua posição.)',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obrigatório. O número cuja posição se deseja encontrar.' },
            ref: { name: 'ref', detail: 'Obrigatório. Uma referência a uma lista de números. Valores não numéricos em ref são ignorados.' },
            order: { name: 'order', detail: 'Opcional. Um número que especifica como posicionar um número em uma ordem. Se ordem for 0 ou omitido, o Microsoft Excel ordenará o número como se ref fosse uma lista classificada na ordem descendente. Se ordem for qualquer valor diferente de zero, o Microsoft Excel ordenará o número como se ref fosse uma lista classificada na ordem ascendente.' },
        },
    },
    STDEV: {
        description: 'Estima o desvio padrão com base em uma amostra. O desvio padrão é uma medida do grau de dispersão dos valores em relação ao valor médio (a média).',
        abstract: 'Estima o desvio padrão com base em uma amostra. O desvio padrão é uma medida do grau de dispersão dos valores em relação ao valor médio (a média).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obrigatório. O primeiro argumento numérico correspondente a uma amostra de população.' },
            number2: { name: 'number2', detail: 'Opcional. Argumentos numéricos de 2 a 255 correspondentes a uma amostra de população. Você também pode usar uma única matriz ou uma referência a uma matriz em vez de argumentos separados por ponto-e-vírgula.' },
        },
    },
    STDEVP: {
        description: 'Calcula o desvio padrão com base na população total fornecida como argumentos. O desvio padrão é uma medida do grau de dispersão dos valores em relação ao valor médio (a média).',
        abstract: 'Calcula o desvio padrão com base na população total fornecida como argumentos. O desvio padrão é uma medida do grau de dispersão dos valores em relação ao valor médio (a média).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Necessário. O primeiro argumento numérico correspondente a uma população.' },
            number2: { name: 'number2', detail: 'Opcional. Argumentos numéricos de 2 a 255 correspondentes a uma população. Você também pode usar uma única matriz ou uma referência a uma matriz em vez de argumentos separados por ponto-e-vírgula.' },
        },
    },
    TDIST: {
        description: 'Retorna os pontos percentuais (probabilidade) para a distribuição t de Student, onde o valor numérico (x) é um valor calculado de t para o qual os pontos percentuais devem ser computados. A distribuição t é usada no teste de hipóteses de pequenos conjuntos de dados de amostras. Use esta função em vez de uma tabela de valores críticos para a distribuição t.',
        abstract: 'Retorna os pontos percentuais (probabilidade) para a distribuição t de Student, onde o valor numérico (x) é um valor calculado de t para o qual os pontos percentuais devem ser computados. A distribuição t é usada no teste de hipóteses de pequenos conjuntos de dados de amostras. Use esta função em vez de uma tabela de valores críticos para a distribuição t.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor numérico em que se avalia a distribuição.' },
            degFreedom: { name: 'degFreedom', detail: 'Necessário. Um número inteiro indicando o número de graus de liberdade.' },
            tails: { name: 'tails', detail: 'Necessário. Especifica o número de caudas da distribuição a ser retornado. Se Caudas = 1, DISTT retornará a distribuição unicaudal. Se Caudas = 2, DISTT retornará a distribuição bicaudal.' },
        },
    },
    TINV: {
        description: 'Retorna o inverso bicaudal da distribuição t de Student',
        abstract: 'Retorna o inverso bicaudal da distribuição t de Student',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obrigatório. A probabilidade associada à distribuição t de Student bicaudal.' },
            degFreedom: { name: 'degFreedom', detail: 'Obrigatório. O número de graus de liberdade que caracteriza a distribuição.' },
        },
    },
    TTEST: {
        description: 'Retorna a probabilidade associada ao teste t de Student. Use TESTET para determinar se duas amostras poderão ser provenientes de duas populações subjacentes que possuem a mesma média.',
        abstract: 'Retorna a probabilidade associada ao teste t de Student. Use TESTET para determinar se duas amostras poderão ser provenientes de duas populações subjacentes que possuem a mesma média.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obrigatório. O primeiro conjunto de dados.' },
            array2: { name: 'array2', detail: 'Obrigatório. O segundo conjunto de dados.' },
            tails: { name: 'tails', detail: 'Obrigatório. Especifica o número de caudas da distribuição. Se caudas = 1, TESTET usará a distribuição unicaudal. Se caudas = 2, TESTET usará a distribuição bicaudal.' },
            type: { name: 'type', detail: 'Obrigatório. O tipo de Teste t a ser executado.' },
        },
    },
    VAR: {
        description: 'Estima a variação com base em uma amostra.',
        abstract: 'Estima a variação com base em uma amostra.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obrigatório. O primeiro argumento numérico correspondente a uma amostra de população.' },
            number2: { name: 'number2', detail: 'Opcional. Argumentos numéricos de 2 a 255 correspondentes a uma amostra de população.' },
        },
    },
    VARP: {
        description: 'Calcula a variação com base na população inteira.',
        abstract: 'Calcula a variação com base na população inteira.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obrigatório. O primeiro argumento numérico correspondente a uma população.' },
            number2: { name: 'number2', detail: 'Opcional. Argumentos numéricos de 2 a 255 correspondentes a uma população.' },
        },
    },
    WEIBULL: {
        description: 'Retorna a distribuição Weibull. Use esta distribuição na análise de confiabilidade, como no cálculo do tempo médio de falha para determinado dispositivo.',
        abstract: 'Retorna a distribuição Weibull. Use esta distribuição na análise de confiabilidade, como no cálculo do tempo médio de falha para determinado dispositivo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obrigatório. O valor no qual se avalia a função.' },
            alpha: { name: 'alpha', detail: 'Obrigatório. Um parâmetro da distribuição.' },
            beta: { name: 'beta', detail: '(em inglês) Obrigatório. Um parâmetro da distribuição.' },
            cumulative: { name: 'cumulative', detail: 'Obrigatório. Determina a forma da função.' },
        },
    },
    ZTEST: {
        description: 'Retorna o valor de probabilidade uni-caudal de um teste-z. Para uma média de população hipotética, μ0, TESTEZ retorna a probabilidade de que a média da população seja maior que a média de observações no conjunto de dados (matriz) — ou seja, a média da amostra observada.',
        abstract: 'Retorna o valor de probabilidade uni-caudal de um teste-z. Para uma média de população hipotética, μ0, TESTEZ retorna a probabilidade de que a média da população seja maior que a média de observações no conjunto de dados (matriz) — ou seja, a média da amostra observada.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ztest-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obrigatório. A matriz ou o intervalo de dados em que x será testado.' },
            x: { name: 'x', detail: 'Obrigatório. O valor a ser testado.' },
            sigma: { name: 'sigma', detail: 'Opcional. O desvio padrão da população (conhecido). Quando não especificado, o desvio padrão de amostra será usado.' },
        },
    },
};

export default locale;
