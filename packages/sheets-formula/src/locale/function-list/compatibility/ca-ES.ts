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
        description: 'Retorna la funció de distribució acumulada beta.',
        abstract: 'Retorna la funció de distribució acumulada beta.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor entre A i B en què s\'avalua la funció.' },
            alpha: { name: 'alfa', detail: 'Un paràmetre de la distribució.' },
            beta: { name: 'beta', detail: 'Un paràmetre de la distribució.' },
            A: { name: 'A', detail: 'Un límit inferior de l\'interval de x.' },
            B: { name: 'B', detail: 'Un límit superior de l\'interval de x.' },
        },
    },
    BETAINV: {
        description: 'Retorna la funció inversa de la funció de distribució acumulada per a una distribució beta especificada.',
        abstract: 'Retorna la funció inversa de la funció de distribució acumulada per a una distribució beta especificada.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/betainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat associada amb la distribució beta.' },
            alpha: { name: 'alfa', detail: 'Un paràmetre de la distribució.' },
            beta: { name: 'beta', detail: 'Un paràmetre de la distribució.' },
            A: { name: 'A', detail: 'Un límit inferior de l\'interval de x.' },
            B: { name: 'B', detail: 'Un límit superior de l\'interval de x.' },
        },
    },
    BINOMDIST: {
        description: 'Retorna la probabilitat d\'una variable aleatòria discreta seguint una distribució binomial.',
        abstract: 'Retorna la probabilitat d\'una variable aleatòria discreta seguint una distribució binomial.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'nombre_èxits', detail: 'El nombre d\'èxits en els assajos.' },
            trials: { name: 'assajos', detail: 'El nombre d\'assajos independents.' },
            probabilityS: { name: 'prob_èxit', detail: 'La probabilitat d\'èxit en cada assaig.' },
            cumulative: { name: 'acumulat', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DISTR.BINOM retorna la funció de distribució acumulada; si és FALS, retorna la funció de massa de probabilitat.' },
        },
    },
    CHIDIST: {
        description: 'Retorna la probabilitat de cua dreta de la distribució khi quadrat.',
        abstract: 'Retorna la probabilitat de cua dreta de la distribució khi quadrat.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en què es vol avaluar la distribució.' },
            degFreedom: { name: 'graus_llibertat', detail: 'El nombre de graus de llibertat.' },
        },
    },
    CHIINV: {
        description: 'Retorna la inversa de la probabilitat de cua dreta de la distribució khi quadrat.',
        abstract: 'Retorna la inversa de la probabilitat de cua dreta de la distribució khi quadrat.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat associada amb la distribució khi quadrat.' },
            degFreedom: { name: 'graus_llibertat', detail: 'El nombre de graus de llibertat.' },
        },
    },
    CHITEST: {
        description: 'Retorna la prova d\'independència.',
        abstract: 'Retorna la prova d\'independència.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'rang_real', detail: 'El rang de dades que conté les observacions per contrastar amb els valors esperats.' },
            expectedRange: { name: 'rang_esperat', detail: 'El rang de dades que conté la proporció del producte dels totals de fila i els totals de columna respecte al total general.' },
        },
    },
    CONFIDENCE: {
        description: 'Retorna l\'interval de confiança per a la mitjana d\'una població, utilitzant una distribució normal.',
        abstract: 'Retorna l\'interval de confiança per a la mitjana d\'una població, utilitzant una distribució normal.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alfa', detail: 'El nivell de significació utilitzat per calcular el nivell de confiança. El nivell de confiança és igual a 100*(1 - alfa)%, o en altres paraules, un alfa de 0,05 indica un nivell de confiança del 95 per cent.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la població per al rang de dades i s\'assumeix que és coneguda.' },
            size: { name: 'mida', detail: 'La mida de la mostra.' },
        },
    },
    COVAR: {
        description: 'Retorna la covariància de la població, la mitjana dels productes de les desviacions per a cada parell de punts de dades en dos conjunts de dades.',
        abstract: 'Retorna la covariància de la població.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'Un primer rang de valors de cel·la.' },
            array2: { name: 'matriu2', detail: 'Un segon rang de valors de cel·la.' },
        },
    },
    CRITBINOM: {
        description: 'Retorna el valor més petit pel qual la distribució binomial acumulada és menor o igual a un valor de criteri.',
        abstract: 'Retorna el valor més petit pel qual la distribució binomial acumulada és menor o igual a un valor de criteri.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: 'assajos', detail: 'El nombre d\'assajos de Bernoulli.' },
            probabilityS: { name: 'prob_èxit', detail: 'La probabilitat d\'èxit en cada assaig.' },
            alpha: { name: 'alfa', detail: 'El valor de criteri.' },
        },
    },
    EXPONDIST: {
        description: 'Retorna la distribució exponencial.',
        abstract: 'Retorna la distribució exponencial.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en què es vol avaluar la distribució.' },
            lambda: { name: 'lambda', detail: 'El valor del paràmetre.' },
            cumulative: { name: 'acumulat', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DISTR.EXP retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    FDIST: {
        description: 'Retorna la distribució de probabilitat F (de cua dreta).',
        abstract: 'Retorna la distribució de probabilitat F (de cua dreta).',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en què s\'avalua la funció.' },
            degFreedom1: { name: 'graus_llibertat1', detail: 'Els graus de llibertat del numerador.' },
            degFreedom2: { name: 'graus_llibertat2', detail: 'Els graus de llibertat del denominador.' },
        },
    },
    FINV: {
        description: 'Retorna la inversa de la distribució de probabilitat F (de cua dreta).',
        abstract: 'Retorna la inversa de la distribució de probabilitat F (de cua dreta).',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat associada amb la distribució F acumulada.' },
            degFreedom1: { name: 'graus_llibertat1', detail: 'Els graus de llibertat del numerador.' },
            degFreedom2: { name: 'graus_llibertat2', detail: 'Els graus de llibertat del denominador.' },
        },
    },
    FTEST: {
        description: 'Retorna el resultat d\'una prova F.',
        abstract: 'Retorna el resultat d\'una prova F.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'La primera matriu o rang de dades.' },
            array2: { name: 'matriu2', detail: 'La segona matriu o rang de dades.' },
        },
    },
    GAMMADIST: {
        description: 'Retorna la distribució gamma.',
        abstract: 'Retorna la distribució gamma.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor per al qual voleu la distribució.' },
            alpha: { name: 'alfa', detail: 'Un paràmetre de la distribució.' },
            beta: { name: 'beta', detail: 'Un paràmetre de la distribució.' },
            cumulative: { name: 'acumulat', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DISTR.GAMMA retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    GAMMAINV: {
        description: 'Retorna la inversa de la distribució gamma acumulada.',
        abstract: 'Retorna la inversa de la distribució gamma acumulada.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat associada amb la distribució gamma.' },
            alpha: { name: 'alfa', detail: 'Un paràmetre de la distribució.' },
            beta: { name: 'beta', detail: 'Un paràmetre de la distribució.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Retorna la distribució hipergeomètrica.',
        abstract: 'Retorna la distribució hipergeomètrica.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'mostra_èxit', detail: 'El nombre d\'èxits a la mostra.' },
            numberSample: { name: 'nombre_mostra', detail: 'La mida de la mostra.' },
            populationS: { name: 'població_èxit', detail: 'El nombre d\'èxits a la població.' },
            numberPop: { name: 'nombre_població', detail: 'La mida de la població.' },
        },
    },
    LOGINV: {
        description: 'Retorna la inversa de la funció de distribució logaritmiconormal acumulada.',
        abstract: 'Retorna la inversa de la funció de distribució logaritmiconormal acumulada.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat corresponent a la distribució logaritmiconormal.' },
            mean: { name: 'mitjana', detail: 'La mitjana aritmètica de la distribució.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la distribució.' },
        },
    },
    LOGNORMDIST: {
        description: 'Retorna la distribució logaritmiconormal acumulada.',
        abstract: 'Retorna la distribució logaritmiconormal acumulada.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor per al qual voleu la distribució.' },
            mean: { name: 'mitjana', detail: 'La mitjana aritmètica de la distribució.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la distribució.' },
        },
    },
    MODE: {
        description: 'Retorna el valor més comú en un conjunt de dades.',
        abstract: 'Retorna el valor més comú en un conjunt de dades.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre, referència de cel·la o rang pel qual voleu calcular la moda.' },
            number2: { name: 'nombre2', detail: 'Nombres, referències de cel·la o rangs addicionals pels quals voleu calcular la moda, fins a un màxim de 255.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Retorna la distribució binomial negativa.',
        abstract: 'Retorna la distribució binomial negativa.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'nombre_fracassos', detail: 'El nombre de fracassos.' },
            numberS: { name: 'nombre_èxits', detail: 'El nombre llindar d\'èxits.' },
            probabilityS: { name: 'prob_èxit', detail: 'La probabilitat d\'un èxit.' },
        },
    },
    NORMDIST: {
        description: 'Retorna la distribució normal acumulada.',
        abstract: 'Retorna la distribució normal acumulada.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor per al qual voleu la distribució.' },
            mean: { name: 'mitjana', detail: 'La mitjana aritmètica de la distribució.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la distribució.' },
            cumulative: { name: 'acumulat', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DISTR.NORM retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    NORMINV: {
        description: 'Retorna la inversa de la distribució normal acumulada.',
        abstract: 'Retorna la inversa de la distribució normal acumulada.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat corresponent a la distribució normal.' },
            mean: { name: 'mitjana', detail: 'La mitjana aritmètica de la distribució.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la distribució.' },
        },
    },
    NORMSDIST: {
        description: 'Retorna la distribució normal estàndard acumulada.',
        abstract: 'Retorna la distribució normal estàndard acumulada.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'El valor per al qual voleu la distribució.' },
        },
    },
    NORMSINV: {
        description: 'Retorna la inversa de la distribució normal estàndard acumulada.',
        abstract: 'Retorna la inversa de la distribució normal estàndard acumulada.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat corresponent a la distribució normal.' },
        },
    },
    PERCENTILE: {
        description: 'Retorna el k-èssim percentil dels valors d\'un conjunt de dades (inclou 0 i 1).',
        abstract: 'Retorna el k-èssim percentil dels valors d\'un conjunt de dades (inclou 0 i 1).',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de dades que defineix la posició relativa.' },
            k: { name: 'k', detail: 'El valor del percentil en el rang de 0 a 1 (inclosos).' },
        },
    },
    PERCENTRANK: {
        description: 'Retorna el rang percentual d\'un valor en un conjunt de dades (inclou 0 i 1).',
        abstract: 'Retorna el rang percentual d\'un valor en un conjunt de dades (inclou 0 i 1).',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de dades que defineix la posició relativa.' },
            x: { name: 'x', detail: 'El valor del qual voleu conèixer el rang.' },
            significance: { name: 'xifres_significatives', detail: 'Un valor que identifica el nombre de dígits significatius per al valor de percentatge retornat. Si s\'omet, RANG.PERCENTIL.INC utilitza tres dígits (0,xxx).' },
        },
    },
    POISSON: {
        description: 'Retorna la distribució de Poisson.',
        abstract: 'Retorna la distribució de Poisson.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor per al qual voleu la distribució.' },
            mean: { name: 'mitjana', detail: 'La mitjana aritmètica de la distribució.' },
            cumulative: { name: 'acumulat', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, POISSON retorna la funció de distribució acumulada; si és FALS, retorna la funció de massa de probabilitat.' },
        },
    },
    QUARTILE: {
        description: 'Retorna el quartil d\'un conjunt de dades (inclou 0 i 1).',
        abstract: 'Retorna el quartil d\'un conjunt de dades (inclou 0 i 1).',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de dades per al qual voleu els valors de quartil.' },
            quart: { name: 'quartil', detail: 'El valor de quartil a retornar.' },
        },
    },
    RANK: {
        description: 'Retorna el rang d\'un nombre en una llista de nombres.',
        abstract: 'Retorna el rang d\'un nombre en una llista de nombres.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre del qual voleu trobar el rang.' },
            ref: { name: 'ref', detail: 'Una referència a una llista de nombres. Els valors no numèrics a ref s\'ignoren.' },
            order: { name: 'ordre', detail: 'Un nombre que especifica com classificar el nombre. Si l\'ordre és 0 (zero) o s\'omet, el Microsoft Excel classifica el nombre com si ref fos una llista ordenada en ordre descendent. Si l\'ordre és qualsevol valor diferent de zero, el Microsoft Excel classifica el nombre com si ref fos una llista ordenada en ordre ascendent.' },
        },
    },
    STDEV: {
        description: 'Estima la desviació estàndard basant-se en una mostra. La desviació estàndard és una mesura de la dispersió dels valors respecte al valor mitjà (la mitjana).',
        abstract: 'Estima la desviació estàndard basant-se en una mostra.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer argument numèric corresponent a una mostra d\'una població.' },
            number2: { name: 'nombre2', detail: 'Arguments numèrics de 2 a 255 corresponents a una mostra d\'una població. També podeu utilitzar una sola matriu o una referència a una matriu en lloc d\'arguments separats per comes.' },
        },
    },
    STDEVP: {
        description: 'Calcula la desviació estàndard basant-se en la població total donada com a arguments.',
        abstract: 'Calcula la desviació estàndard basant-se en la població total.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer argument numèric corresponent a una població.' },
            number2: { name: 'nombre2', detail: 'Arguments numèrics de 2 a 255 corresponents a una població. També podeu utilitzar una sola matriu o una referència a una matriu en lloc d\'arguments separats per comes.' },
        },
    },
    TDIST: {
        description: 'Retorna la probabilitat de la distribució t de Student.',
        abstract: 'Retorna la probabilitat de la distribució t de Student.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor numèric en què s\'ha d\'avaluar la distribució.' },
            degFreedom: { name: 'graus_llibertat', detail: 'Un enter que indica el nombre de graus de llibertat.' },
            tails: { name: 'cues', detail: 'Especifica el nombre de cues de distribució a retornar. Si Cues = 1, DISTR.T retorna la distribució d\'una cua. Si Cues = 2, DISTR.T retorna la distribució de dues cues.' },
        },
    },
    TINV: {
        description: 'Retorna la inversa de la probabilitat de la distribució t de Student (dues cues).',
        abstract: 'Retorna la inversa de la probabilitat de la distribució t de Student (dues cues).',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'La probabilitat associada amb la distribució t de Student.' },
            degFreedom: { name: 'graus_llibertat', detail: 'Un enter que indica el nombre de graus de llibertat.' },
        },
    },
    TTEST: {
        description: 'Retorna la probabilitat associada amb una prova t de Student.',
        abstract: 'Retorna la probabilitat associada amb una prova t de Student.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'La primera matriu o rang de dades.' },
            array2: { name: 'matriu2', detail: 'La segona matriu o rang de dades.' },
            tails: { name: 'cues', detail: 'Especifica el nombre de cues de distribució. Si cues = 1, PROVA.T utilitza la distribució d\'una cua. Si cues = 2, PROVA.T utilitza la distribució de dues cues.' },
            type: { name: 'tipus', detail: 'El tipus de prova t a realitzar.' },
        },
    },
    VAR: {
        description: 'Estima la variància basant-se en una mostra.',
        abstract: 'Estima la variància basant-se en una mostra.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer argument numèric corresponent a una mostra d\'una població.' },
            number2: { name: 'nombre2', detail: 'Arguments numèrics de 2 a 255 corresponents a una mostra d\'una població.' },
        },
    },
    VARP: {
        description: 'Calcula la variància basant-se en la població total.',
        abstract: 'Calcula la variància basant-se en la població total.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer argument numèric corresponent a una població.' },
            number2: { name: 'nombre2', detail: 'Arguments numèrics de 2 a 255 corresponents a una població.' },
        },
    },
    WEIBULL: {
        description: 'Retorna la distribució de Weibull.',
        abstract: 'Retorna la distribució de Weibull.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor per al qual voleu la distribució.' },
            alpha: { name: 'alfa', detail: 'Un paràmetre de la distribució.' },
            beta: { name: 'beta', detail: 'Un paràmetre de la distribució.' },
            cumulative: { name: 'acumulat', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, WEIBULL retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    ZTEST: {
        description: 'Retorna el valor de probabilitat d\'una cua d\'una prova z.',
        abstract: 'Retorna el valor de probabilitat d\'una cua d\'una prova z.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/ztest-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de dades contra el qual provar x.' },
            x: { name: 'x', detail: 'El valor a provar.' },
            sigma: { name: 'sigma', detail: 'La desviació estàndard de la població (coneguda). Si s\'omet, s\'utilitza la desviació estàndard de la mostra.' },
        },
    },
};

export default locale;
