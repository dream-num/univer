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
        description: 'Retorna la mitjana de les desviacions absolutes dels punts de dades respecte a la seva mitjana.',
        abstract: 'Retorna la mitjana de les desviacions absolutes dels punts de dades respecte a la seva mitjana',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/avedev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre, referència de cel·la o rang del qual voleu la mitjana.' },
            number2: { name: 'nombre2', detail: 'Nombres addicionals, referències de cel·la o rangs dels quals voleu la mitjana, fins a un màxim de 255.' },
        },
    },
    AVERAGE: {
        description: 'Retorna la mitjana (mitjana aritmètica) dels arguments.',
        abstract: 'Retorna la mitjana dels seus arguments',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'nombre1',
                detail: 'El primer nombre, referència de cel·la o rang del qual voleu la mitjana.',
            },
            number2: {
                name: 'nombre2',
                detail: 'Nombres addicionals, referències de cel·la o rangs dels quals voleu la mitjana, fins a un màxim de 255.',
            },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'La funció AVERAGE.WEIGHTED troba la mitjana ponderada d\'un conjunt de valors, tenint en compte els valors i les ponderacions corresponents.',
        abstract: 'La funció AVERAGE.WEIGHTED troba la mitjana ponderada d\'un conjunt de valors, tenint en compte els valors i les ponderacions corresponents.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/9084098?hl=ca',
            },
        ],
        functionParameter: {
            values: { name: 'valors', detail: 'Valors de què es calcula la mitjana. Pot fer referència a un interval de cel·les o pot contenir els valors mateixos.' },
            weights: { name: 'ponderacions', detail: 'Llista de ponderacions corresponent que cal aplicar. Pot fer referència a un interval de cel·les o pot contenir les ponderacions mateixes. Les ponderacions no poden ser negatives, però sí que poden ser zero. Almenys una de les ponderacions ha de ser positiva. Si utilitzeu un interval de cel·les, ha de tenir el mateix nombre de files i de columnes que l\'interval de valors.' },
            additionalValues: { name: 'valors_addicionals', detail: 'Valors extra de què es calcula la mitjana. Els valors addicionals són opcionals.' },
            additionalWeights: { name: 'ponderacions_addicionals', detail: 'Ponderacions extra que cal aplicar. Les ponderacions addicionals són opcionals, però cada valor_addicional ha d\'anar seguit d\'exactament una ponderació_addicional .' },
        },
    },
    AVERAGEA: {
        description: 'Retorna la mitjana dels seus arguments, incloent-hi nombres, text i valors lògics.',
        abstract: 'Retorna la mitjana dels seus arguments, incloent-hi nombres, text i valors lògics',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/averagea-function',
            },
        ],
        functionParameter: {
            value1: {
                name: 'valor1',
                detail: 'El primer nombre, referència de cel·la o rang del qual voleu la mitjana.',
            },
            value2: {
                name: 'valor2',
                detail: 'Nombres addicionals, referències de cel·la o rangs dels quals voleu la mitjana, fins a un màxim de 255.',
            },
        },
    },
    AVERAGEIF: {
        description: 'Retorna la mitjana (mitjana aritmètica) de totes les cel·les d\'un rang que compleixen un criteri determinat.',
        abstract: 'Retorna la mitjana (mitjana aritmètica) de totes les cel·les d\'un rang que compleixen un criteri determinat',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/averageif-function',
            },
        ],
        functionParameter: {
            range: { name: 'rang', detail: 'Una o més cel·les per fer la mitjana, incloent-hi nombres o noms, matrius o referències que continguin nombres.' },
            criteria: { name: 'criteri', detail: 'El criteri en forma de nombre, expressió, referència de cel·la o text que defineix quines cel·les es fan la mitjana. Per exemple, el criteri es pot expressar com 32, "32", ">32", "pomes" o B4.' },
            averageRange: { name: 'rang_mitjana', detail: 'El conjunt real de cel·les per fer la mitjana. Si s\'omet, s\'utilitza el rang.' },
        },
    },
    AVERAGEIFS: {
        description: 'Retorna la mitjana (mitjana aritmètica) de totes les cel·les que compleixen múltiples criteris.',
        abstract: 'Retorna la mitjana (mitjana aritmètica) de totes les cel·les que compleixen múltiples criteris',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/averageifs-function',
            },
        ],
        functionParameter: {
            averageRange: { name: 'rang_mitjana', detail: 'Una o més cel·les per fer la mitjana, incloent-hi nombres o noms, matrius o referències que continguin nombres.' },
            criteriaRange1: { name: 'rang_criteris1', detail: 'És el conjunt de cel·les a avaluar amb el criteri.' },
            criteria1: { name: 'criteri1', detail: 'S\'utilitza per definir les cel·les de les quals es calcularà la mitjana. Per exemple, el criteri es pot expressar com 32, "32", ">32", "poma" o B4' },
            criteriaRange2: { name: 'rang_criteris2', detail: 'Rangs addicionals. Podeu introduir fins a 127 rangs.' },
            criteria2: { name: 'criteri2', detail: 'Criteris addicionals associats. Podeu introduir fins a 127 criteris.' },
        },
    },
    BETA_DIST: {
        description: 'Retorna la funció de distribució acumulada beta',
        abstract: 'Retorna la funció de distribució acumulada beta',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/beta-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor entre A i B en què s\'avalua la funció.' },
            alpha: { name: 'alfa', detail: 'Un paràmetre de la distribució.' },
            beta: { name: 'beta', detail: 'Un paràmetre de la distribució.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DIST.BETA retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
            A: { name: 'A', detail: 'Un límit inferior de l\'interval de x.' },
            B: { name: 'B', detail: 'Un límit superior de l\'interval de x.' },
        },
    },
    BETA_INV: {
        description: 'Retorna la inversa de la funció de distribució acumulada per a una distribució beta especificada',
        abstract: 'Retorna la inversa de la funció de distribució acumulada per a una distribució beta especificada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/beta-inv-function',
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
    BINOM_DIST: {
        description: 'Retorna la probabilitat d\'una variable aleatòria discreta seguint una distribució binomial',
        abstract: 'Retorna la probabilitat d\'una variable aleatòria discreta seguint una distribució binomial',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/binom-dist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'nombre_èxits', detail: 'El nombre d\'èxits en els assajos.' },
            trials: { name: 'assajos', detail: 'El nombre d\'assajos independents.' },
            probabilityS: { name: 'prob_èxit', detail: 'La probabilitat d\'èxit en cada assaig.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DIST.BINOM retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Retorna la probabilitat d\'un resultat d\'assaig utilitzant una distribució binomial',
        abstract: 'Retorna la probabilitat d\'un resultat d\'assaig utilitzant una distribució binomial',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/binom-dist-range-function',
            },
        ],
        functionParameter: {
            trials: { name: 'assajos', detail: 'El nombre d\'assajos independents.' },
            probabilityS: { name: 'prob_èxit', detail: 'La probabilitat d\'èxit en cada assaig.' },
            numberS: { name: 'nombre_èxits', detail: 'El nombre d\'èxits en els assajos.' },
            numberS2: { name: 'nombre_èxits2', detail: 'Si es proporciona, retorna la probabilitat que el nombre d\'assajos reeixits caigui entre nombre_èxits i nombre_èxits2.' },
        },
    },
    BINOM_INV: {
        description: 'Retorna el valor més petit pel qual la distribució binomial acumulada és menor o igual a un valor de criteri',
        abstract: 'Retorna el valor més petit pel qual la distribució binomial acumulada és menor o igual a un valor de criteri',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/binom-inv-function',
            },
        ],
        functionParameter: {
            trials: { name: 'assajos', detail: 'El nombre d\'assajos de Bernoulli.' },
            probabilityS: { name: 'prob_èxit', detail: 'La probabilitat d\'èxit en cada assaig.' },
            alpha: { name: 'alfa', detail: 'El valor de criteri.' },
        },
    },
    CHISQ_DIST: {
        description: 'Retorna la probabilitat de cua esquerra de la distribució khi quadrat.',
        abstract: 'Retorna la probabilitat de cua esquerra de la distribució khi quadrat.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/chisq-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en què es vol avaluar la distribució.' },
            degFreedom: { name: 'graus_llibertat', detail: 'El nombre de graus de llibertat.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DIST.CHI retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'Retorna la probabilitat de cua dreta de la distribució khi quadrat.',
        abstract: 'Retorna la probabilitat de cua dreta de la distribució khi quadrat.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/chisq-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en què es vol avaluar la distribució.' },
            degFreedom: { name: 'graus_llibertat', detail: 'El nombre de graus de llibertat.' },
        },
    },
    CHISQ_INV: {
        description: 'Retorna la inversa de la probabilitat de cua esquerra de la distribució khi quadrat.',
        abstract: 'Retorna la inversa de la probabilitat de cua esquerra de la distribució khi quadrat.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/chisq-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat associada amb la distribució khi quadrat.' },
            degFreedom: { name: 'graus_llibertat', detail: 'El nombre de graus de llibertat.' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Retorna la inversa de la probabilitat de cua dreta de la distribució khi quadrat.',
        abstract: 'Retorna la inversa de la probabilitat de cua dreta de la distribució khi quadrat.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/chisq-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat associada amb la distribució khi quadrat.' },
            degFreedom: { name: 'graus_llibertat', detail: 'El nombre de graus de llibertat.' },
        },
    },
    CHISQ_TEST: {
        description: 'Retorna la prova d\'independència',
        abstract: 'Retorna la prova d\'independència',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/chisq-test-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'rang_real', detail: 'El rang de dades que conté les observacions per contrastar amb els valors esperats.' },
            expectedRange: { name: 'rang_esperat', detail: 'El rang de dades que conté la proporció del producte dels totals de fila i els totals de columna respecte al total general.' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'Retorna l\'interval de confiança per a la mitjana d\'una població, utilitzant una distribució normal.',
        abstract: 'Retorna l\'interval de confiança per a la mitjana d\'una població, utilitzant una distribució normal.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/confidence-norm-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alfa', detail: 'El nivell de significació utilitzat per calcular el nivell de confiança. El nivell de confiança és igual a 100*(1 - alfa)%, o en altres paraules, un alfa de 0,05 indica un nivell de confiança del 95 per cent.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la població per al rang de dades i s\'assumeix que és coneguda.' },
            size: { name: 'mida', detail: 'La mida de la mostra.' },
        },
    },
    CONFIDENCE_T: {
        description: 'Retorna l\'interval de confiança per a la mitjana d\'una població, utilitzant una distribució t de Student',
        abstract: 'Retorna l\'interval de confiança per a la mitjana d\'una població, utilitzant una distribució t de Student',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/confidence-t-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alfa', detail: 'El nivell de significació utilitzat per calcular el nivell de confiança. El nivell de confiança és igual a 100*(1 - alfa)%, o en altres paraules, un alfa de 0,05 indica un nivell de confiança del 95 per cent.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la població per al rang de dades i s\'assumeix que és coneguda.' },
            size: { name: 'mida', detail: 'La mida de la mostra.' },
        },
    },
    CORREL: {
        description: 'Retorna el coeficient de correlació entre dos conjunts de dades',
        abstract: 'Retorna el coeficient de correlació entre dos conjunts de dades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/correl-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'Un primer rang de valors de cel·la.' },
            array2: { name: 'matriu2', detail: 'Un segon rang de valors de cel·la.' },
        },
    },
    COUNT: {
        description: 'Compta el nombre de cel·les que contenen nombres i compta els nombres dins de la llista d\'arguments.',
        abstract: 'Compta quants nombres hi ha a la llista d\'arguments',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/count-function',
            },
        ],
        functionParameter: {
            value1: {
                name: 'valor1',
                detail: 'El primer element, referència de cel·la o rang dins del qual voleu comptar nombres.',
            },
            value2: {
                name: 'valor2',
                detail: 'Fins a 255 elements, referències de cel·la o rangs addicionals dins dels quals voleu comptar nombres.',
            },
        },
    },
    COUNTA: {
        description: `Compta les cel·les que contenen qualsevol tipus d'informació, incloent-hi valors d'error i text buit ("")
        Si no necessiteu comptar valors lògics, text o valors d'error`,
        abstract: 'Compta quants valors hi ha a la llista d\'arguments',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/counta-function',
            },
        ],
        functionParameter: {
            value1: {
                name: 'valor1',
                detail: 'El primer nombre, referència de cel·la o rang del qual voleu la mitjana.',
            },
            value2: {
                name: 'valor2',
                detail: 'Nombres addicionals, referències de cel·la o rangs dels quals voleu la mitjana, fins a un màxim de 255.',
            },
        },
    },
    COUNTBLANK: {
        description: 'Compta el nombre de cel·les en blanc dins d\'un rang.',
        abstract: 'Compta el nombre de cel·les en blanc dins d\'un rang',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/countblank-function',
            },
        ],
        functionParameter: {
            range: { name: 'rang', detail: 'El rang des del qual voleu comptar les cel·les en blanc.' },
        },
    },
    COUNTIF: {
        description: 'Compta el nombre de cel·les dins d\'un rang que compleixen el criteri donat.',
        abstract: 'Compta el nombre de cel·les dins d\'un rang que compleixen el criteri donat',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/use-the-countif-function-in-microsoft-excel',
            },
        ],
        functionParameter: {
            range: { name: 'rang', detail: 'El grup de cel·les que voleu comptar. El rang pot contenir nombres, matrius, un rang amb nom o referències que continguin nombres. Els valors en blanc i de text s\'ignoren.' },
            criteria: { name: 'criteri', detail: 'Un nombre, expressió, referència de cel·la o cadena de text que determina quines cel·les es comptaran.\nPer exemple, podeu utilitzar un nombre com 32, una comparació com ">32", una cel·la com B4 o una paraula com "pomes".\nCOMPTA.SI utilitza només un únic criteri. Utilitzeu COMPTA.SI.CONJUNT si voleu utilitzar múltiples criteris.' },
        },
    },
    COUNTIFS: {
        description: 'Compta el nombre de cel·les dins d\'un rang que compleixen múltiples criteris.',
        abstract: 'Compta el nombre de cel·les dins d\'un rang que compleixen múltiples criteris',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/countifs-function',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: 'rang_criteris1', detail: 'El primer rang en què avaluar els criteris associats.' },
            criteria1: { name: 'criteri1', detail: 'El criteri en forma de nombre, expressió, referència de cel·la o text que defineix quines cel·les es comptaran. Per exemple, els criteris es poden expressar com 32, ">32", B4, "pomes" o "32".' },
            criteriaRange2: { name: 'rang_criteris2', detail: 'Rangs addicionals. Podeu introduir fins a 127 rangs.' },
            criteria2: { name: 'criteri2', detail: 'Criteris addicionals associats. Podeu introduir fins a 127 criteris.' },
        },
    },
    COVARIANCE_P: {
        description: 'Retorna la covariància de la població, la mitjana dels productes de les desviacions per a cada parell de punts de dades en dos conjunts de dades.',
        abstract: 'Retorna la covariància de la població',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/covariance-p-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'Un primer rang de valors de cel·la.' },
            array2: { name: 'matriu2', detail: 'Un segon rang de valors de cel·la.' },
        },
    },
    COVARIANCE_S: {
        description: 'Retorna la covariància de la mostra, la mitjana dels productes de les desviacions per a cada parell de punts de dades en dos conjunts de dades.',
        abstract: 'Retorna la covariància de la mostra',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/covariance-s-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'Un primer rang de valors de cel·la.' },
            array2: { name: 'matriu2', detail: 'Un segon rang de valors de cel·la.' },
        },
    },
    DEVSQ: {
        description: 'Retorna la suma dels quadrats de les desviacions',
        abstract: 'Retorna la suma dels quadrats de les desviacions',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/devsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer argument pel qual voleu calcular la suma de les desviacions al quadrat.' },
            number2: { name: 'nombre2', detail: 'Els arguments del 2 al 255 pels quals voleu calcular la suma de les desviacions al quadrat.' },
        },
    },
    EXPON_DIST: {
        description: 'Retorna la distribució exponencial',
        abstract: 'Retorna la distribució exponencial',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/expon-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en què es vol avaluar la distribució.' },
            lambda: { name: 'lambda', detail: 'El valor del paràmetre.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DISTR.EXP retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    F_DIST: {
        description: 'Retorna la distribució de probabilitat F',
        abstract: 'Retorna la distribució de probabilitat F',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/f-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en què s\'avalua la funció.' },
            degFreedom1: { name: 'graus_llibertat1', detail: 'Els graus de llibertat del numerador.' },
            degFreedom2: { name: 'graus_llibertat2', detail: 'Els graus de llibertat del denominador.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DISTR.F retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    F_DIST_RT: {
        description: 'Retorna la distribució de probabilitat F (de cua dreta)',
        abstract: 'Retorna la distribució de probabilitat F (de cua dreta)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/f-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor en què s\'avalua la funció.' },
            degFreedom1: { name: 'graus_llibertat1', detail: 'Els graus de llibertat del numerador.' },
            degFreedom2: { name: 'graus_llibertat2', detail: 'Els graus de llibertat del denominador.' },
        },
    },
    F_INV: {
        description: 'Retorna la inversa de la distribució de probabilitat F',
        abstract: 'Retorna la inversa de la distribució de probabilitat F',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/f-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat associada amb la distribució F acumulada.' },
            degFreedom1: { name: 'graus_llibertat1', detail: 'Els graus de llibertat del numerador.' },
            degFreedom2: { name: 'graus_llibertat2', detail: 'Els graus de llibertat del denominador.' },
        },
    },
    F_INV_RT: {
        description: 'Retorna la inversa de la distribució de probabilitat F (de cua dreta)',
        abstract: 'Retorna la inversa de la distribució de probabilitat F (de cua dreta)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/f-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat associada amb la distribució F acumulada.' },
            degFreedom1: { name: 'graus_llibertat1', detail: 'Els graus de llibertat del numerador.' },
            degFreedom2: { name: 'graus_llibertat2', detail: 'Els graus de llibertat del denominador.' },
        },
    },
    F_TEST: {
        description: 'Retorna el resultat d\'una prova F',
        abstract: 'Retorna el resultat d\'una prova F',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/f-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'La primera matriu o rang de dades.' },
            array2: { name: 'matriu2', detail: 'La segona matriu o rang de dades.' },
        },
    },
    FISHER: {
        description: 'Retorna la transformació de Fisher',
        abstract: 'Retorna la transformació de Fisher',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/fisher-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Un valor numèric per al qual voleu la transformació.' },
        },
    },
    FISHERINV: {
        description: 'Retorna la inversa de la transformació de Fisher',
        abstract: 'Retorna la inversa de la transformació de Fisher',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/fisherinv-function',
            },
        ],
        functionParameter: {
            y: { name: 'y', detail: 'El valor per al qual voleu realitzar la inversa de la transformació.' },
        },
    },
    FORECAST: {
        description: 'Retorna un valor al llarg d\'una tendència lineal',
        abstract: 'Retorna un valor al llarg d\'una tendència lineal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El punt de dades per al qual voleu predir un valor.' },
            knownYs: { name: 'conegut_y', detail: 'La matriu o rang de dades dependent.' },
            knownXs: { name: 'conegut_x', detail: 'La matriu o rang de dades independent.' },
        },
    },
    FORECAST_ETS: {
        description: 'Retorna un valor futur basat en valors existents (històrics) utilitzant la versió AAA de l\'algorisme de Suavització Exponencial (ETS)',
        abstract: 'Retorna un valor futur basat en valors existents (històrics) utilitzant la versió AAA de l\'algorisme de Suavització Exponencial (ETS)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Data objectiu', detail: 'El punt de dades per al qual voleu predir un valor.' },
            values: { name: 'Valors', detail: 'Els valors històrics utilitzats per a la previsió.' },
            timeline: { name: 'Cronologia', detail: 'Un interval o una matriu independent de dates o hores numèriques amb un pas constant.' },
            seasonality: { name: 'Estacionalitat', detail: 'Opcional. Longitud estacional; 1 per a detecció automàtica i 0 sense estacionalitat.' },
            dataCompletion: { name: 'Compleció de dades', detail: 'Opcional. Feu servir 1 per interpolar els punts que falten o 0 per tractar-los com a zero.' },
            aggregation: { name: 'Agregació', detail: 'Opcional. Un valor de l’1 al 7 que especifica com agregar marques de temps duplicades.' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Retorna un interval de confiança per al valor de pronòstic a la data objectiu especificada',
        abstract: 'Retorna un interval de confiança per al valor de pronòstic a la data objectiu especificada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Data objectiu', detail: 'El punt de dades per al qual voleu predir un valor.' },
            values: { name: 'Valors', detail: 'Els valors històrics utilitzats per a la previsió.' },
            timeline: { name: 'Cronologia', detail: 'Un interval o una matriu independent de dates o hores numèriques amb un pas constant.' },
            confidenceLevel: { name: 'Nivell de confiança', detail: 'Opcional. Un nombre entre 0 i 1; el valor per defecte és 0,95.' },
            seasonality: { name: 'Estacionalitat', detail: 'Opcional. Longitud estacional; 1 per a detecció automàtica i 0 sense estacionalitat.' },
            dataCompletion: { name: 'Compleció de dades', detail: 'Opcional. Feu servir 1 per interpolar els punts que falten o 0 per tractar-los com a zero.' },
            aggregation: { name: 'Agregació', detail: 'Opcional. Un valor de l’1 al 7 que especifica com agregar marques de temps duplicades.' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Retorna la longitud del patró repetitiu que l\'Excel detecta per a la sèrie temporal especificada',
        abstract: 'Retorna la longitud del patró repetitiu que l\'Excel detecta per a la sèrie temporal especificada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: 'Valors', detail: 'Els valors històrics utilitzats per a la previsió.' },
            timeline: { name: 'Cronologia', detail: 'Un interval o una matriu independent de dates o hores numèriques amb un pas constant.' },
            dataCompletion: { name: 'Compleció de dades', detail: 'Opcional. Feu servir 1 per interpolar els punts que falten o 0 per tractar-los com a zero.' },
            aggregation: { name: 'Agregació', detail: 'Opcional. Un valor de l’1 al 7 que especifica com agregar marques de temps duplicades.' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Retorna un valor estadístic com a resultat de la previsió de sèries temporals',
        abstract: 'Retorna un valor estadístic com a resultat de la previsió de sèries temporals',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: 'Valors', detail: 'Els valors històrics utilitzats per a la previsió.' },
            timeline: { name: 'Cronologia', detail: 'Un interval o una matriu independent de dates o hores numèriques amb un pas constant.' },
            statisticType: { name: 'Tipus d’estadística', detail: 'Un valor de l’1 al 8 que especifica l’estadística de previsió que cal retornar.' },
            seasonality: { name: 'Estacionalitat', detail: 'Opcional. Longitud estacional; 1 per a detecció automàtica i 0 sense estacionalitat.' },
            dataCompletion: { name: 'Compleció de dades', detail: 'Opcional. Feu servir 1 per interpolar els punts que falten o 0 per tractar-los com a zero.' },
            aggregation: { name: 'Agregació', detail: 'Opcional. Un valor de l’1 al 7 que especifica com agregar marques de temps duplicades.' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Retorna un valor futur basat en valors existents',
        abstract: 'Retorna un valor futur basat en valors existents',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El punt de dades per al qual voleu predir un valor.' },
            knownYs: { name: 'conegut_y', detail: 'La matriu o rang de dades dependent.' },
            knownXs: { name: 'conegut_x', detail: 'La matriu o rang de dades independent.' },
        },
    },
    FREQUENCY: {
        description: 'Retorna una distribució de freqüència com una matriu vertical',
        abstract: 'Retorna una distribució de freqüència com una matriu vertical',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/frequency-function',
            },
        ],
        functionParameter: {
            dataArray: { name: 'matriu_dades', detail: 'Una matriu o referència a un conjunt de valors per als quals voleu comptar freqüències. Si matriu_dades no conté valors, FREQÜÈNCIA retorna una matriu de zeros.' },
            binsArray: { name: 'matriu_bins', detail: 'Una matriu o referència a intervals en els quals voleu agrupar els valors de matriu_dades. Si matriu_bins no conté valors, FREQÜÈNCIA retorna el nombre d\'elements a matriu_dades.' },
        },
    },
    GAMMA: {
        description: 'Retorna el valor de la funció Gamma',
        abstract: 'Retorna el valor de la funció Gamma',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/gamma-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Valor d\'entrada a la funció gamma.' },
        },
    },
    GAMMA_DIST: {
        description: 'Retorna la distribució gamma',
        abstract: 'Retorna la distribució gamma',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/gamma-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor per al qual voleu la distribució.' },
            alpha: { name: 'alfa', detail: 'Un paràmetre de la distribució.' },
            beta: { name: 'beta', detail: 'Un paràmetre de la distribució.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DIST.GAMMA retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    GAMMA_INV: {
        description: 'Retorna la inversa de la distribució gamma acumulada',
        abstract: 'Retorna la inversa de la distribució gamma acumulada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/gamma-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat associada amb la distribució gamma.' },
            alpha: { name: 'alfa', detail: 'Un paràmetre de la distribució.' },
            beta: { name: 'beta', detail: 'Un paràmetre de la distribució.' },
        },
    },
    GAMMALN: {
        description: 'Retorna el logaritme natural de la funció gamma, Γ(x)',
        abstract: 'Retorna el logaritme natural de la funció gamma, Γ(x)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/gammaln-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor pel qual voleu calcular GAMMALN.' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'Retorna el logaritme natural de la funció gamma, Γ(x)',
        abstract: 'Retorna el logaritme natural de la funció gamma, Γ(x)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/gammaln-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor pel qual voleu calcular GAMMALN.PRECÍS.' },
        },
    },
    GAUSS: {
        description: 'Retorna 0,5 menys que la distribució normal acumulada estàndard',
        abstract: 'Retorna 0,5 menys que la distribució normal acumulada estàndard',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/gauss-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'El valor per al qual voleu la distribució.' },
        },
    },
    GEOMEAN: {
        description: 'Retorna la mitjana geomètrica',
        abstract: 'Retorna la mitjana geomètrica',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/geomean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre, referència de cel·la o rang del qual voleu la mitjana geomètrica.' },
            number2: { name: 'nombre2', detail: 'Nombres addicionals, referències de cel·la o rangs dels quals voleu la mitjana geomètrica, fins a un màxim de 255.' },
        },
    },
    GROWTH: {
        description: 'Retorna valors al llarg d\'una tendència exponencial',
        abstract: 'Retorna valors al llarg d\'una tendència exponencial',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/growth-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conegut_y', detail: 'El conjunt de valors y que ja coneixeu a la relació y = b*m^x.' },
            knownXs: { name: 'conegut_x', detail: 'El conjunt de valors x que ja coneixeu a la relació y = b*m^x.' },
            newXs: { name: 'nou_x', detail: 'Són nous valors x per als quals voleu que CREIXEMENT retorni els valors y corresponents.' },
            constb: { name: 'constant', detail: 'Un valor lògic que especifica si s\'ha de forçar que la constant b sigui igual a 1.' },
        },
    },
    HARMEAN: {
        description: 'Retorna la mitjana harmònica',
        abstract: 'Retorna la mitjana harmònica',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/harmean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre, referència de cel·la o rang del qual voleu la mitjana harmònica.' },
            number2: { name: 'nombre2', detail: 'Nombres addicionals, referències de cel·la o rangs dels quals voleu la mitjana harmònica, fins a un màxim de 255.' },
        },
    },
    HYPGEOM_DIST: {
        description: 'Retorna la distribució hipergeomètrica',
        abstract: 'Retorna la distribució hipergeomètrica',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/hypgeom-dist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'mostra_èxit', detail: 'El nombre d\'èxits a la mostra.' },
            numberSample: { name: 'nombre_mostra', detail: 'La mida de la mostra.' },
            populationS: { name: 'població_èxit', detail: 'El nombre d\'èxits a la població.' },
            numberPop: { name: 'nombre_població', detail: 'La mida de la població.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DIST.HIPERGEOM retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    INTERCEPT: {
        description: 'Retorna la intercepció de la línia de regressió lineal',
        abstract: 'Retorna la intercepció de la línia de regressió lineal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/intercept-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conegut_y', detail: 'La matriu o rang de dades dependent.' },
            knownXs: { name: 'conegut_x', detail: 'La matriu o rang de dades independent.' },
        },
    },
    KURT: {
        description: 'Retorna la curtosi d\'un conjunt de dades',
        abstract: 'Retorna la curtosi d\'un conjunt de dades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/kurt-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre, referència de cel·la o rang del qual voleu la curtosi.' },
            number2: { name: 'nombre2', detail: 'Nombres addicionals, referències de cel·la o rangs dels quals voleu la curtosi, fins a un màxim de 255.' },
        },
    },
    LARGE: {
        description: 'Retorna el k-èssim valor més gran d\'un conjunt de dades',
        abstract: 'Retorna el k-èssim valor més gran d\'un conjunt de dades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/large-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de dades per al qual voleu determinar el k-èssim valor més gran.' },
            k: { name: 'k', detail: 'La posició (des del més gran) a la matriu o rang de cel·les de dades a retornar.' },
        },
    },
    LINEST: {
        description: 'Retorna els paràmetres d\'una tendència lineal',
        abstract: 'Retorna els paràmetres d\'una tendència lineal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/linest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conegut_y', detail: 'El conjunt de valors y que ja coneixeu a la relació y = m*x+b.' },
            knownXs: { name: 'conegut_x', detail: 'El conjunt de valors x que ja coneixeu a la relació y = m*x+b.' },
            constb: { name: 'constant', detail: 'Un valor lògic que especifica si s\'ha de forçar que la constant b sigui igual a 0.' },
            stats: { name: 'estadístiques', detail: 'Un valor lògic que especifica si s\'han de retornar estadístiques de regressió addicionals.' },
        },
    },
    LOGEST: {
        description: 'Retorna els paràmetres d\'una tendència exponencial',
        abstract: 'Retorna els paràmetres d\'una tendència exponencial',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/logest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conegut_y', detail: 'El conjunt de valors y que ja coneixeu a la relació y = b*m^x.' },
            knownXs: { name: 'conegut_x', detail: 'El conjunt de valors x que ja coneixeu a la relació y = b*m^x.' },
            constb: { name: 'constant', detail: 'Un valor lògic que especifica si s\'ha de forçar que la constant b sigui igual a 1.' },
            stats: { name: 'estadístiques', detail: 'Un valor lògic que especifica si s\'han de retornar estadístiques de regressió addicionals.' },
        },
    },
    LOGNORM_DIST: {
        description: 'Retorna la distribució logarítmica normal acumulada',
        abstract: 'Retorna la distribució logarítmica normal acumulada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/lognorm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor per al qual voleu la distribució.' },
            mean: { name: 'mitjana', detail: 'La mitjana aritmètica de la distribució.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la distribució.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DIST.LOGNORM retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    LOGNORM_INV: {
        description: 'Retorna la inversa de la distribució logarítmica normal acumulada',
        abstract: 'Retorna la inversa de la distribució logarítmica normal acumulada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat corresponent a la distribució logarítmica normal.' },
            mean: { name: 'mitjana', detail: 'La mitjana aritmètica de la distribució.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la distribució.' },
        },
    },
    MARGINOFERROR: {
        description: 'Aquesta funció calcula el marge d\'error a partir d\'un interval de valors i d\'un nivell de confiança.',
        abstract: 'Aquesta funció calcula el marge d\'error a partir d\'un interval de valors i d\'un nivell de confiança.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/12487850?hl=ca',
            },
        ],
        functionParameter: {
            range: { name: 'rang', detail: 'MARGINOFERROR(A1:C3; 0,99)' },
            confidence: { name: 'confiança', detail: 'El nivell de confiança desitjat entre (0, 1).' },
        },
    },
    MAX: {
        description: 'Retorna el valor més gran d\'un conjunt de valors.',
        abstract: 'Retorna el valor màxim en una llista d\'arguments',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/max-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'nombre1',
                detail: 'El primer nombre, referència de cel·la o rang del qual calcular el valor màxim.',
            },
            number2: {
                name: 'nombre2',
                detail: 'Nombres addicionals, referències de cel·la o rangs dels quals calcular el valor màxim, fins a un màxim de 255.',
            },
        },
    },
    MAXA: {
        description: 'Retorna el valor màxim en una llista d\'arguments, incloent-hi nombres, text i valors lògics.',
        abstract: 'Retorna el valor màxim en una llista d\'arguments, incloent-hi nombres, text i valors lògics',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/maxa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'valor1', detail: 'El primer argument numèric pel qual voleu trobar el valor més gran.' },
            value2: { name: 'valor2', detail: 'Arguments numèrics de 2 a 255 pels quals voleu trobar el valor més gran.' },
        },
    },
    MAXIFS: {
        description: 'Retorna el valor màxim entre les cel·les especificades per un conjunt donat de condicions o criteris.',
        abstract: 'Retorna el valor màxim entre les cel·les especificades per un conjunt donat de condicions o criteris',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/maxifs-function',
            },
        ],
        functionParameter: {
            maxRange: { name: 'rang_max', detail: 'El rang de cel·les a maximitzar.' },
            criteriaRange1: { name: 'rang_criteris1', detail: 'És el conjunt de cel·les a avaluar amb el criteri.' },
            criteria1: { name: 'criteri1', detail: 'És el criteri en forma de nombre, expressió o text que defineix quines cel·les s\'avaluaran com a màxim.' },
            criteriaRange2: { name: 'rang_criteris2', detail: 'Rangs addicionals. Podeu introduir fins a 127 rangs.' },
            criteria2: { name: 'criteri2', detail: 'Criteris addicionals associats. Podeu introduir fins a 127 criteris.' },
        },
    },
    MEDIAN: {
        description: 'Retorna la mediana dels nombres donats',
        abstract: 'Retorna la mediana dels nombres donats',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/median-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre, referència de cel·la o rang pel qual voleu els nombres donats.' },
            number2: { name: 'nombre2', detail: 'Nombres addicionals, referències de cel·la o rangs pels quals voleu els nombres donats, fins a un màxim de 255.' },
        },
    },
    MIN: {
        description: 'Retorna el nombre més petit d\'un conjunt de valors.',
        abstract: 'Retorna el valor mínim en una llista d\'arguments',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/min-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'nombre1',
                detail: 'El primer nombre, referència de cel·la o rang del qual calcular el valor mínim.',
            },
            number2: {
                name: 'nombre2',
                detail: 'Nombres addicionals, referències de cel·la o rangs dels quals calcular el valor mínim, fins a un màxim de 255.',
            },
        },
    },
    MINA: {
        description: 'Retorna el valor més petit en una llista d\'arguments, incloent-hi nombres, text i valors lògics',
        abstract: 'Retorna el valor més petit en una llista d\'arguments, incloent-hi nombres, text i valors lògics',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/mina-function',
            },
        ],
        functionParameter: {
            value1: { name: 'valor1', detail: 'El primer nombre, referència de cel·la o rang del qual calcular el valor mínim.' },
            value2: { name: 'valor2', detail: 'Nombres addicionals, referències de cel·la o rangs dels quals calcular el valor mínim, fins a un màxim de 255.' },
        },
    },
    MINIFS: {
        description: 'Retorna el valor mínim entre les cel·les especificades per un conjunt donat de condicions o criteris.',
        abstract: 'Retorna el valor mínim entre les cel·les especificades per un conjunt donat de condicions o criteris',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/minifs-function',
            },
        ],
        functionParameter: {
            minRange: { name: 'rang_min', detail: 'El rang real de cel·les en què es determinarà el valor mínim.' },
            criteriaRange1: { name: 'rang_criteris1', detail: 'És el conjunt de cel·les a avaluar amb el criteri.' },
            criteria1: { name: 'criteri1', detail: 'És el criteri en forma de nombre, expressió o text que defineix quines cel·les s\'avaluaran com a mínim. El mateix conjunt de criteris funciona per a les funcions MAXIFS, SUMIFS i AVERAGEIFS.' },
            criteriaRange2: { name: 'rang_criteris2', detail: 'Rangs addicionals. Podeu introduir fins a 127 rangs.' },
            criteria2: { name: 'criteri2', detail: 'Criteris addicionals associats. Podeu introduir fins a 127 criteris.' },
        },
    },
    MODE_MULT: {
        description: 'Retorna una matriu vertical dels valors més freqüents o repetitius en una matriu o rang de dades',
        abstract: 'Retorna una matriu vertical dels valors més freqüents o repetitius en una matriu o rang de dades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/mode-mult-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre, referència de cel·la o rang pel qual voleu calcular la moda.' },
            number2: { name: 'nombre2', detail: 'Nombres addicionals, referències de cel·la o rangs pels quals voleu calcular la moda, fins a un màxim de 255.' },
        },
    },
    MODE_SNGL: {
        description: 'Retorna el valor més comú en un conjunt de dades',
        abstract: 'Retorna el valor més comú en un conjunt de dades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/mode-sngl-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre, referència de cel·la o rang pel qual voleu calcular la moda.' },
            number2: { name: 'nombre2', detail: 'Nombres addicionals, referències de cel·la o rangs pels quals voleu calcular la moda, fins a un màxim de 255.' },
        },
    },
    NEGBINOM_DIST: {
        description: 'Retorna la distribució binomial negativa',
        abstract: 'Retorna la distribució binomial negativa',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/negbinom-dist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'nombre_fracassos', detail: 'El nombre de fracassos.' },
            numberS: { name: 'nombre_èxits', detail: 'El nombre llindar d\'èxits.' },
            probabilityS: { name: 'prob_èxit', detail: 'La probabilitat d\'un èxit.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DIST.NEGBINOM retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    NORM_DIST: {
        description: 'Retorna la distribució normal acumulada',
        abstract: 'Retorna la distribució normal acumulada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/norm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor per al qual voleu la distribució.' },
            mean: { name: 'mitjana', detail: 'La mitjana aritmètica de la distribució.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la distribució.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DIST.NORM retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    NORM_INV: {
        description: 'Retorna la inversa de la distribució normal acumulada',
        abstract: 'Retorna la inversa de la distribució normal acumulada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/norm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat corresponent a la distribució normal.' },
            mean: { name: 'mitjana', detail: 'La mitjana aritmètica de la distribució.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la distribució.' },
        },
    },
    NORM_S_DIST: {
        description: 'Retorna la distribució normal estàndard acumulada',
        abstract: 'Retorna la distribució normal estàndard acumulada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/norm-s-dist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'El valor per al qual voleu la distribució.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DIST.NORM.S retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    NORM_S_INV: {
        description: 'Retorna la inversa de la distribució normal estàndard acumulada',
        abstract: 'Retorna la inversa de la distribució normal estàndard acumulada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/norm-s-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat corresponent a la distribució normal.' },
        },
    },
    PEARSON: {
        description: 'Retorna el coeficient de correlació del producte-moment de Pearson',
        abstract: 'Retorna el coeficient de correlació del producte-moment de Pearson',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/pearson-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'La matriu o rang de dades dependent.' },
            array2: { name: 'matriu2', detail: 'La matriu o rang de dades independent.' },
        },
    },
    PERCENTILE_EXC: {
        description: 'Retorna el k-èssim percentil dels valors d\'un conjunt de dades (exclou 0 i 1).',
        abstract: 'Retorna el k-èssim percentil dels valors d\'un conjunt de dades (exclou 0 i 1).',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/percentile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de dades que defineix la posició relativa.' },
            k: { name: 'k', detail: 'El valor del percentil en el rang 0 i 1 (exclou 0 i 1).' },
        },
    },
    PERCENTILE_INC: {
        description: 'Retorna el k-èssim percentil dels valors d\'un conjunt de dades (inclou 0 i 1)',
        abstract: 'Retorna el k-èssim percentil dels valors d\'un conjunt de dades (inclou 0 i 1)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/percentile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de dades que defineix la posició relativa.' },
            k: { name: 'k', detail: 'El valor del percentil en el rang 0 i 1 (inclou 0 i 1).' },
        },
    },
    PERCENTRANK_EXC: {
        description: 'Retorna el rang percentual d\'un valor en un conjunt de dades (exclou 0 i 1)',
        abstract: 'Retorna el rang percentual d\'un valor en un conjunt de dades (exclou 0 i 1)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/percentrank-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de dades que defineix la posició relativa.' },
            x: { name: 'x', detail: 'El valor del qual voleu conèixer el rang.' },
            significance: { name: 'xifres_significatives', detail: 'Un valor que identifica el nombre de dígits significatius per al valor de percentatge retornat. Si s\'omet, RANG.PERCENTIL.EXC utilitza tres dígits (0,xxx).' },
        },
    },
    PERCENTRANK_INC: {
        description: 'Retorna el rang percentual d\'un valor en un conjunt de dades (inclou 0 i 1)',
        abstract: 'Retorna el rang percentual d\'un valor en un conjunt de dades (inclou 0 i 1)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/percentrank-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de dades que defineix la posició relativa.' },
            x: { name: 'x', detail: 'El valor del qual voleu conèixer el rang.' },
            significance: { name: 'xifres_significatives', detail: 'Un valor que identifica el nombre de dígits significatius per al valor de percentatge retornat. Si s\'omet, RANG.PERCENTIL.INC utilitza tres dígits (0,xxx).' },
        },
    },
    PERMUT: {
        description: 'Retorna el nombre de permutacions per a un nombre donat d\'objectes',
        abstract: 'Retorna el nombre de permutacions per a un nombre donat d\'objectes',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/permut-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre d\'elements.' },
            numberChosen: { name: 'nombre_escollit', detail: 'El nombre d\'elements en cada permutació.' },
        },
    },
    PERMUTATIONA: {
        description: 'Retorna el nombre de permutacions per a un nombre donat d\'objectes (amb repeticions) que es poden seleccionar del total d\'objectes',
        abstract: 'Retorna el nombre de permutacions per a un nombre donat d\'objectes (amb repeticions) que es poden seleccionar del total d\'objectes',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/permutationa-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre d\'elements.' },
            numberChosen: { name: 'nombre_escollit', detail: 'El nombre d\'elements en cada permutació.' },
        },
    },
    PHI: {
        description: 'Retorna el valor de la funció de densitat per a una distribució normal estàndard',
        abstract: 'Retorna el valor de la funció de densitat per a una distribució normal estàndard',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/phi-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'X és el nombre pel qual voleu la densitat de la distribució normal estàndard.' },
        },
    },
    POISSON_DIST: {
        description: 'Retorna la distribució de Poisson',
        abstract: 'Retorna la distribució de Poisson',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/poisson-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor per al qual voleu la distribució.' },
            mean: { name: 'mitjana', detail: 'La mitjana aritmètica de la distribució.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, POISSON.DIST retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    PROB: {
        description: 'Retorna la probabilitat que els valors d\'un rang estiguin entre dos límits',
        abstract: 'Retorna la probabilitat que els valors d\'un rang estiguin entre dos límits',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/prob-function',
            },
        ],
        functionParameter: {
            xRange: { name: 'rang_x', detail: 'El rang de valors numèrics de x amb els quals hi ha probabilitats associades.' },
            probRange: { name: 'rang_prob', detail: 'Un conjunt de probabilitats associades amb els valors a rang_x.' },
            lowerLimit: { name: 'límit_inferior', detail: 'El límit inferior del valor per al qual voleu una probabilitat.' },
            upperLimit: { name: 'límit_superior', detail: 'El límit superior del valor per al qual voleu una probabilitat.' },
        },
    },
    QUARTILE_EXC: {
        description: 'Retorna el quartil d\'un conjunt de dades (exclou 0 i 1)',
        abstract: 'Retorna el quartil d\'un conjunt de dades (exclou 0 i 1)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/quartile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de dades per al qual voleu els valors de quartil.' },
            quart: { name: 'quartil', detail: 'El valor de quartil a retornar.' },
        },
    },
    QUARTILE_INC: {
        description: 'Retorna el quartil d\'un conjunt de dades (inclou 0 i 1)',
        abstract: 'Retorna el quartil d\'un conjunt de dades (inclou 0 i 1)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/quartile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de dades per al qual voleu els valors de quartil.' },
            quart: { name: 'quartil', detail: 'El valor de quartil a retornar.' },
        },
    },
    RANK_AVG: {
        description: 'Retorna el rang d\'un nombre en una llista de nombres',
        abstract: 'Retorna el rang d\'un nombre en una llista de nombres',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/rank-avg-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre del qual voleu trobar el rang.' },
            ref: { name: 'ref', detail: 'Una referència a una llista de nombres. Els valors no numèrics a ref s\'ignoren.' },
            order: { name: 'ordre', detail: 'Un nombre que especifica com classificar el nombre. Si l\'ordre és 0 (zero) o s\'omet, el Microsoft Excel classifica el nombre com si ref fos una llista ordenada en ordre descendent. Si l\'ordre és qualsevol valor diferent de zero, el Microsoft Excel classifica el nombre com si ref fos una llista ordenada en ordre ascendent.' },
        },
    },
    RANK_EQ: {
        description: 'Retorna el rang d\'un nombre en una llista de nombres',
        abstract: 'Retorna el rang d\'un nombre en una llista de nombres',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/rank-eq-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre del qual voleu trobar el rang.' },
            ref: { name: 'ref', detail: 'Una referència a una llista de nombres. Els valors no numèrics a ref s\'ignoren.' },
            order: { name: 'ordre', detail: 'Un nombre que especifica com classificar el nombre. Si l\'ordre és 0 (zero) o s\'omet, el Microsoft Excel classifica el nombre com si ref fos una llista ordenada en ordre descendent. Si l\'ordre és qualsevol valor diferent de zero, el Microsoft Excel classifica el nombre com si ref fos una llista ordenada en ordre ascendent.' },
        },
    },
    RSQ: {
        description: 'Retorna el quadrat del coeficient de correlació del producte-moment de Pearson',
        abstract: 'Retorna el quadrat del coeficient de correlació del producte-moment de Pearson',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conegut_y', detail: 'La matriu o rang de dades dependent.' },
            knownXs: { name: 'conegut_x', detail: 'La matriu o rang de dades independent.' },
        },
    },
    SKEW: {
        description: 'Retorna la biaix d\'una distribució',
        abstract: 'Retorna la biaix d\'una distribució',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/skew-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre, referència de cel·la o rang del qual voleu la biaix.' },
            number2: { name: 'nombre2', detail: 'Nombres addicionals, referències de cel·la o rangs dels quals voleu la biaix, fins a un màxim de 255.' },
        },
    },
    SKEW_P: {
        description: 'Retorna la biaix d\'una distribució basada en una població',
        abstract: 'Retorna la biaix d\'una distribució basada en una població',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/skew-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre, referència de cel·la o rang del qual voleu la biaix.' },
            number2: { name: 'nombre2', detail: 'Nombres addicionals, referències de cel·la o rangs dels quals voleu la biaix, fins a un màxim de 255.' },
        },
    },
    SLOPE: {
        description: 'Retorna el pendent de la línia de regressió lineal',
        abstract: 'Retorna el pendent de la línia de regressió lineal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/slope-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conegut_y', detail: 'La matriu o rang de dades dependent.' },
            knownXs: { name: 'conegut_x', detail: 'La matriu o rang de dades independent.' },
        },
    },
    SMALL: {
        description: 'Retorna el k-èssim valor més petit d\'un conjunt de dades',
        abstract: 'Retorna el k-èssim valor més petit d\'un conjunt de dades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/small-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de dades per al qual voleu determinar el k-èssim valor més petit.' },
            k: { name: 'k', detail: 'La posició (des del més petit) a la matriu o rang de cel·les de dades a retornar.' },
        },
    },
    STANDARDIZE: {
        description: 'Retorna un valor normalitzat',
        abstract: 'Retorna un valor normalitzat',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/standardize-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor que voleu normalitzar.' },
            mean: { name: 'mitjana', detail: 'La mitjana aritmètica de la distribució.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la distribució.' },
        },
    },
    STDEV_P: {
        description: 'Calcula la desviació estàndard basada en tota la població donada com a arguments (ignora valors lògics i text).',
        abstract: 'Calcula la desviació estàndard basada en tota la població',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/stdev-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer argument numèric corresponent a una població.' },
            number2: { name: 'nombre2', detail: 'Arguments numèrics de 2 a 254 corresponents a una població. També podeu utilitzar una única matriu o una referència a una matriu en lloc d\'arguments separats per comes.' },
        },
    },
    STDEV_S: {
        description: 'Estima la desviació estàndard basada en una mostra (ignora valors lògics i text a la mostra).',
        abstract: 'Estima la desviació estàndard basada en una mostra',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/stdev-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer argument numèric corresponent a una mostra d\'una població. També podeu utilitzar una única matriu o una referència a una matriu en lloc d\'arguments separats per comes.' },
            number2: { name: 'nombre2', detail: 'Arguments numèrics de 2 a 254 corresponents a una mostra d\'una població. També podeu utilitzar una única matriu o una referència a una matriu en lloc d\'arguments separats per comes.' },
        },
    },
    STDEVA: {
        description: 'Estima la desviació estàndard basada en una mostra, incloent-hi nombres, text i valors lògics.',
        abstract: 'Estima la desviació estàndard basada en una mostra, incloent-hi nombres, text i valors lògics',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/stdeva-function',
            },
        ],
        functionParameter: {
            value1: { name: 'valor1', detail: 'El primer argument de valor corresponent a una mostra d\'una població. També podeu utilitzar una única matriu o una referència a una matriu en lloc d\'arguments separats per comes.' },
            value2: { name: 'valor2', detail: 'Arguments de valor de 2 a 254 corresponents a una mostra d\'una població. També podeu utilitzar una única matriu o una referència a una matriu en lloc d\'arguments separats per comes.' },
        },
    },
    STDEVPA: {
        description: 'Calcula la desviació estàndard basada en tota la població donada com a arguments, incloent-hi text i valors lògics.',
        abstract: 'Calcula la desviació estàndard basada en tota la població, incloent-hi nombres, text i valors lògics',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/stdevpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'valor1', detail: 'El primer argument de valor corresponent a una població.' },
            value2: { name: 'valor2', detail: 'Arguments de valor de 2 a 254 corresponents a una població. També podeu utilitzar una única matriu o una referència a una matriu en lloc d\'arguments separats per comes.' },
        },
    },
    STEYX: {
        description: 'Retorna l\'error estàndard del valor y predit per a cada x a la regressió',
        abstract: 'Retorna l\'error estàndard del valor y predit per a cada x a la regressió',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/steyx-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conegut_y', detail: 'La matriu o rang de dades dependent.' },
            knownXs: { name: 'conegut_x', detail: 'La matriu o rang de dades independent.' },
        },
    },
    T_DIST: {
        description: 'Retorna la probabilitat per a la distribució t de Student',
        abstract: 'Retorna la probabilitat per a la distribució t de Student',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/t-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor numèric en què avaluar la distribució' },
            degFreedom: { name: 'graus_llibertat', detail: 'Un enter que indica el nombre de graus de llibertat.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, DIST.T retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    T_DIST_2T: {
        description: 'Retorna la probabilitat per a la distribució t de Student (dues cues)',
        abstract: 'Retorna la probabilitat per a la distribució t de Student (dues cues)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/t-dist-2t-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor numèric en què avaluar la distribució' },
            degFreedom: { name: 'graus_llibertat', detail: 'Un enter que indica el nombre de graus de llibertat.' },
        },
    },
    T_DIST_RT: {
        description: 'Retorna la probabilitat per a la distribució t de Student (cua dreta)',
        abstract: 'Retorna la probabilitat per a la distribució t de Student (cua dreta)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/t-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor numèric en què avaluar la distribució' },
            degFreedom: { name: 'graus_llibertat', detail: 'Un enter que indica el nombre de graus de llibertat.' },
        },
    },
    T_INV: {
        description: 'Retorna la inversa de la probabilitat per a la distribució t de Student',
        abstract: 'Retorna la inversa de la probabilitat per a la distribució t de Student',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/t-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'La probabilitat associada amb la distribució t de Student.' },
            degFreedom: { name: 'graus_llibertat', detail: 'Un enter que indica el nombre de graus de llibertat.' },
        },
    },
    T_INV_2T: {
        description: 'Retorna la inversa de la probabilitat per a la distribució t de Student (dues cues)',
        abstract: 'Retorna la inversa de la probabilitat per a la distribució t de Student (dues cues)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/t-inv-2t-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'La probabilitat associada amb la distribució t de Student.' },
            degFreedom: { name: 'graus_llibertat', detail: 'Un enter que indica el nombre de graus de llibertat.' },
        },
    },
    T_TEST: {
        description: 'Retorna la probabilitat associada amb una prova t de Student',
        abstract: 'Retorna la probabilitat associada amb una prova t de Student',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/t-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'La primera matriu o rang de dades.' },
            array2: { name: 'matriu2', detail: 'La segona matriu o rang de dades.' },
            tails: { name: 'cues', detail: 'Especifica el nombre de cues de distribució. Si cues = 1, PROVA.T utilitza la distribució d\'una cua. Si cues = 2, PROVA.T utilitza la distribució de dues cues.' },
            type: { name: 'tipus', detail: 'El tipus de prova t a realitzar.' },
        },
    },
    TREND: {
        description: 'Retorna valors al llarg d\'una tendència lineal',
        abstract: 'Retorna valors al llarg d\'una tendència lineal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/trend-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'conegut_y', detail: 'El conjunt de valors y que ja coneixeu a la relació y = m*x+b.' },
            knownXs: { name: 'conegut_x', detail: 'El conjunt de valors x que ja coneixeu a la relació y = m*x+b.' },
            newXs: { name: 'nou_x', detail: 'Són nous valors x per als quals voleu que TENDÈNCIA retorni els valors y corresponents.' },
            constb: { name: 'constant', detail: 'Un valor lògic que especifica si s\'ha de forçar que la constant b sigui igual a 0.' },
        },
    },
    TRIMMEAN: {
        description: 'Retorna la mitjana de l\'interior d\'un conjunt de dades',
        abstract: 'Retorna la mitjana de l\'interior d\'un conjunt de dades',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/trimmean-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o rang de valors a retallar i fer la mitjana.' },
            percent: { name: 'percentatge', detail: 'El nombre fraccionari de punts de dades a excloure del càlcul.' },
        },
    },
    VAR_P: {
        description: 'Calcula la variància basada en tota la població (ignora valors lògics i text a la població).',
        abstract: 'Calcula la variància basada en tota la població',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/var-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer argument numèric corresponent a una població.' },
            number2: { name: 'nombre2', detail: 'Arguments numèrics de 2 a 254 corresponents a una població.' },
        },
    },
    VAR_S: {
        description: 'Estima la variància basada en una mostra (ignora valors lògics i text a la mostra).',
        abstract: 'Estima la variància basada en una mostra',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/var-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer argument numèric corresponent a una mostra d\'una població.' },
            number2: { name: 'nombre2', detail: 'Arguments numèrics de 2 a 254 corresponents a una mostra d\'una població.' },
        },
    },
    VARA: {
        description: 'Estima la variància basada en una mostra, incloent-hi nombres, text i valors lògics',
        abstract: 'Estima la variància basada en una mostra, incloent-hi nombres, text i valors lògics',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/vara-function',
            },
        ],
        functionParameter: {
            value1: { name: 'valor1', detail: 'El primer argument de valor corresponent a una mostra d\'una població.' },
            value2: { name: 'valor2', detail: 'Arguments de valor de 2 a 254 corresponents a una mostra d\'una població.' },
        },
    },
    VARPA: {
        description: 'Calcula la variància basada en tota la població, incloent-hi nombres, text i valors lògics',
        abstract: 'Calcula la variància basada en tota la població, incloent-hi nombres, text i valors lògics',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/varpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'valor1', detail: 'El primer argument de valor corresponent a una població.' },
            value2: { name: 'valor2', detail: 'Arguments de valor de 2 a 254 corresponents a una població.' },
        },
    },
    WEIBULL_DIST: {
        description: 'Retorna la distribució de Weibull',
        abstract: 'Retorna la distribució de Weibull',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/weibull-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor per al qual voleu la distribució.' },
            alpha: { name: 'alfa', detail: 'Un paràmetre de la distribució.' },
            beta: { name: 'beta', detail: 'Un paràmetre de la distribució.' },
            cumulative: { name: 'acumulatiu', detail: 'Un valor lògic que determina la forma de la funció. Si és CERT, WEIBULL.DIST retorna la funció de distribució acumulada; si és FALS, retorna la funció de densitat de probabilitat.' },
        },
    },
    Z_TEST: {
        description: 'Retorna el valor de probabilitat d\'una cua d\'una prova z',
        abstract: 'Retorna el valor de probabilitat d\'una cua d\'una prova z',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/z-test-function',
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
