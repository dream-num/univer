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
                url: 'https://support.microsoft.com/ca-es/office/avedev-function-58fe8d65-2a84-4dc7-8052-f3f87b5c6639',
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
                url: 'https://support.microsoft.com/ca-es/office/average-function-047bac88-d466-426c-a32b-8f33eb960cf6',
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
        description: 'Troba la mitjana ponderada d\'un conjunt de valors, donats els valors i les ponderacions corresponents.',
        abstract: 'Troba la mitjana ponderada d\'un conjunt de valors, donats els valors i les ponderacions corresponents.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/9084098?hl=ca&ref_topic=3105600&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            values: { name: 'valors', detail: 'Els valors per calcular la mitjana.' },
            weights: { name: 'ponderacions', detail: 'La llista de ponderacions corresponents a aplicar.' },
            additionalValues: { name: 'valors_addicionals', detail: 'Altres valors per calcular la mitjana.' },
            additionalWeights: { name: 'ponderacions_addicionals', detail: 'Altres ponderacions a aplicar.' },
        },
    },
    AVERAGEA: {
        description: 'Retorna la mitjana dels seus arguments, incloent-hi nombres, text i valors lògics.',
        abstract: 'Retorna la mitjana dels seus arguments, incloent-hi nombres, text i valors lògics',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/averagea-function-f5f84098-d453-4f4c-bbba-3d2c66356091',
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
                url: 'https://support.microsoft.com/ca-es/office/averageif-function-faec8e2e-0dec-4308-af69-f5576d8ac642',
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
                url: 'https://support.microsoft.com/ca-es/office/averageifs-function-48910c45-1fc0-4389-a028-f7c5c3001690',
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
                url: 'https://support.microsoft.com/ca-es/office/beta-dist-function-11188c9c-780a-42c7-ba43-9ecb5a878d31',
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
                url: 'https://support.microsoft.com/ca-es/office/beta-inv-function-e84cb8aa-8df0-4cf6-9892-83a341d252eb',
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
                url: 'https://support.microsoft.com/ca-es/office/binom-dist-function-c5ae37b6-f39c-4be2-94c2-509a1480770c',
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
                url: 'https://support.microsoft.com/ca-es/office/binom-dist-range-function-17331329-74c7-4053-bb4c-6653a7421595',
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
                url: 'https://support.microsoft.com/ca-es/office/binom-inv-function-80a0370c-ada6-49b4-83e7-05a91ba77ac9',
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
                url: 'https://support.microsoft.com/ca-es/office/chisq-dist-function-8486b05e-5c05-4942-a9ea-f6b341518732',
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
                url: 'https://support.microsoft.com/ca-es/office/chisq-dist-rt-function-dc4832e8-ed2b-49ae-8d7c-b28d5804c0f2',
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
                url: 'https://support.microsoft.com/ca-es/office/chisq-inv-function-400db556-62b3-472d-80b3-254723e7092f',
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
                url: 'https://support.microsoft.com/ca-es/office/chisq-inv-rt-function-435b5ed8-98d5-4da6-823f-293e2cbc94fe',
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
                url: 'https://support.microsoft.com/ca-es/office/chisq-test-function-2e8a7861-b14a-4985-aa93-fb88de3f260f',
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
                url: 'https://support.microsoft.com/ca-es/office/confidence-norm-function-7cec58a6-85bb-488d-91c3-63828d4fbfd4',
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
                url: 'https://support.microsoft.com/ca-es/office/confidence-t-function-e8eca395-6c3a-4ba9-9003-79ccc61d3c53',
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
                url: 'https://support.microsoft.com/ca-es/office/correl-function-995dcef7-0c0a-4bed-a3fb-239d7b68ca92',
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
                url: 'https://support.microsoft.com/ca-es/office/count-function-a59cd7fc-b623-4d93-87a4-d23bf411294c',
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
                url: 'https://support.microsoft.com/ca-es/office/counta-function-7dc98875-d5c1-46f1-9a82-53f3219e2509',
            },
        ],
        functionParameter: {
            number1: {
                name: 'valor1',
                detail: 'El primer argument que representa els valors que voleu comptar.',
            },
            number2: {
                name: 'valor2',
                detail: 'Arguments addicionals que representen els valors que voleu comptar, fins a un màxim de 255 arguments.',
            },
        },
    },
    COUNTBLANK: {
        description: 'Compta el nombre de cel·les en blanc dins d\'un rang.',
        abstract: 'Compta el nombre de cel·les en blanc dins d\'un rang',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/countblank-function-6a92d772-675c-4bee-b346-24af6bd3ac22',
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
                url: 'https://support.microsoft.com/ca-es/office/countif-function-e0de10c6-f885-4e71-abb4-1f464816df34',
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
                url: 'https://support.microsoft.com/ca-es/office/countifs-function-dda3dc6e-f74e-4aee-88bc-aa8c2a866842',
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
                url: 'https://support.microsoft.com/ca-es/office/covariance-p-function-6f0e1e6d-956d-4e4b-9943-cfef0bf9edfc',
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
                url: 'https://support.microsoft.com/ca-es/office/covariance-s-function-0a539b74-7371-42aa-a18f-1f5320314977',
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
                url: 'https://support.microsoft.com/ca-es/office/devsq-function-8b739616-8376-4df5-8bd0-cfe0a6caf444',
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
                url: 'https://support.microsoft.com/ca-es/office/expon-dist-function-4c12ae24-e563-4155-bf3e-8b78b6ae140e',
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
                url: 'https://support.microsoft.com/ca-es/office/f-dist-function-a887efdc-7c8e-46cb-a74a-f884cd29b25d',
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
                url: 'https://support.microsoft.com/ca-es/office/f-dist-rt-function-d74cbb00-6017-4ac9-b7d7-6049badc0520',
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
                url: 'https://support.microsoft.com/ca-es/office/f-inv-function-0dda0cf9-4ea0-42fd-8c3c-417a1ff30dbe',
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
                url: 'https://support.microsoft.com/ca-es/office/f-inv-rt-function-d371aa8f-b0b1-40ef-9cc2-496f0693ac00',
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
                url: 'https://support.microsoft.com/ca-es/office/f-test-function-100a59e7-4108-46f8-8443-78ffacb6c0a7',
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
                url: 'https://support.microsoft.com/ca-es/office/fisher-function-d656523c-5076-4f95-b87b-7741bf236c69',
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
                url: 'https://support.microsoft.com/ca-es/office/fisherinv-function-62504b39-415a-4284-a285-19c8e82f86bb',
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
                url: 'https://support.microsoft.com/ca-es/office/forecast-and-forecast-linear-functions-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
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
                url: 'https://support.microsoft.com/ca-es/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'primer' },
            number2: { name: 'nombre2', detail: 'segon' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Retorna un interval de confiança per al valor de pronòstic a la data objectiu especificada',
        abstract: 'Retorna un interval de confiança per al valor de pronòstic a la data objectiu especificada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.CONFINT',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'primer' },
            number2: { name: 'nombre2', detail: 'segon' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Retorna la longitud del patró repetitiu que l\'Excel detecta per a la sèrie temporal especificada',
        abstract: 'Retorna la longitud del patró repetitiu que l\'Excel detecta per a la sèrie temporal especificada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.SEASONALITY',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'primer' },
            number2: { name: 'nombre2', detail: 'segon' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Retorna un valor estadístic com a resultat de la previsió de sèries temporals',
        abstract: 'Retorna un valor estadístic com a resultat de la previsió de sèries temporals',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.STAT',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'primer' },
            number2: { name: 'nombre2', detail: 'segon' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Retorna un valor futur basat en valors existents',
        abstract: 'Retorna un valor futur basat en valors existents',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/forecast-and-forecast-linear-functions-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
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
                url: 'https://support.microsoft.com/ca-es/office/frequency-function-44e3be2b-eca0-42cd-a3f7-fd9ea898fdb9',
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
                url: 'https://support.microsoft.com/ca-es/office/gamma-function-ce1702b1-cf55-471d-8307-f83be0fc5297',
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
                url: 'https://support.microsoft.com/ca-es/office/gamma-dist-function-9b6f1538-d11c-4d5f-8966-21f6a2201def',
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
                url: 'https://support.microsoft.com/ca-es/office/gamma-inv-function-74991443-c2b0-4be5-aaab-1aa4d71fbb18',
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
                url: 'https://support.microsoft.com/ca-es/office/gammaln-function-b838c48b-c65f-484f-9e1d-141c55470eb9',
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
                url: 'https://support.microsoft.com/ca-es/office/gammaln-precise-function-5cdfe601-4e1e-4189-9d74-241ef1caa599',
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
                url: 'https://support.microsoft.com/ca-es/office/gauss-function-069f1b4e-7dee-4d6a-a71f-4b69044a6b33',
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
                url: 'https://support.microsoft.com/ca-es/office/geomean-function-db1ac48d-25a5-40a0-ab83-0b38980e40d5',
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
                url: 'https://support.microsoft.com/ca-es/office/growth-function-541a91dc-3d5e-437d-b156-21324e68b80d',
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
                url: 'https://support.microsoft.com/ca-es/office/harmean-function-5efd9184-fab5-42f9-b1d3-57883a1d3bc6',
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
                url: 'https://support.microsoft.com/ca-es/office/hypgeom-dist-function-6dbd547f-1d12-4b1f-8ae5-b0d9e3d22fbf',
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
                url: 'https://support.microsoft.com/ca-es/office/intercept-function-2a9b74e2-9d47-4772-b663-3bca70bf63ef',
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
                url: 'https://support.microsoft.com/ca-es/office/kurt-function-bc3a265c-5da4-4dcb-b7fd-c237789095ab',
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
                url: 'https://support.microsoft.com/ca-es/office/large-function-3af0af19-1190-42bb-bb8b-01672ec00a64',
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
                url: 'https://support.microsoft.com/ca-es/office/linest-function-84d7d0d9-6e50-4101-977a-fa7abf772b6d',
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
                url: 'https://support.microsoft.com/ca-es/office/logest-function-f27462d8-3657-4030-866b-a272c1d18b4b',
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
                url: 'https://support.microsoft.com/ca-es/office/lognorm-dist-function-eb60d00b-48a9-4217-be2b-6074aee6b070',
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
                url: 'https://support.microsoft.com/ca-es/office/lognorm-inv-function-fe79751a-f1f2-4af8-a0a1-e151b2d4f600',
            },
        ],
        functionParameter: {
            probability: { name: 'probabilitat', detail: 'Una probabilitat corresponent a la distribució logarítmica normal.' },
            mean: { name: 'mitjana', detail: 'La mitjana aritmètica de la distribució.' },
            standardDev: { name: 'desv_estàndard', detail: 'La desviació estàndard de la distribució.' },
        },
    },
    MARGINOFERROR: {
        description: 'Calcula el marge d\'error a partir d\'un rang de valors i un nivell de confiança.',
        abstract: 'Calcula el marge d\'error a partir d\'un rang de valors i un nivell de confiança.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/12487850?hl=ca&sjid=11250989209896695200-AP',
            },
        ],
        functionParameter: {
            range: { name: 'rang', detail: 'El rang de valors utilitzat per calcular el marge d\'error.' },
            confidence: { name: 'confiança', detail: 'El nivell de confiança desitjat entre (0, 1).' },
        },
    },
    MAX: {
        description: 'Retorna el valor més gran d\'un conjunt de valors.',
        abstract: 'Retorna el valor màxim en una llista d\'arguments',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/max-function-e0012414-9ac8-4b34-9a47-73e662c08098',
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
                url: 'https://support.microsoft.com/ca-es/office/maxa-function-814bda1e-3840-4bff-9365-2f59ac2ee62d',
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
                url: 'https://support.microsoft.com/ca-es/office/maxifs-function-dfd611e6-da2c-488a-919b-9b6376b28883',
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
                url: 'https://support.microsoft.com/ca-es/office/median-function-d0916313-4753-414c-8537-ce85bdd967d2',
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
                url: 'https://support.microsoft.com/ca-es/office/min-function-61635d12-920f-4ce2-a70f-96f202dcc152',
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
                url: 'https://support.microsoft.com/ca-es/office/mina-function-245a6f46-7ca5-4dc7-ab49-805341bc31d3',
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
                url: 'https://support.microsoft.com/ca-es/office/minifs-function-6ca1ddaa-079b-4e74-80cc-72eef32e6599',
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
                url: 'https://support.microsoft.com/ca-es/office/mode-mult-function-50fd9464-b2ba-4191-b57a-39446689ae8c',
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
                url: 'https://support.microsoft.com/ca-es/office/mode-sngl-function-f1267c16-66c6-4386-959f-8fba5f8bb7f8',
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
                url: 'https://support.microsoft.com/ca-es/office/negbinom-dist-function-c8239f89-c2d0-45bd-b6af-172e570f8599',
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
                url: 'https://support.microsoft.com/ca-es/office/norm-dist-function-edb1cc14-a21c-4e53-839d-8082074c9f8d',
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
                url: 'https://support.microsoft.com/ca-es/office/norm-inv-function-54b30935-fee7-493c-bedb-2278a9db7e13',
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
                url: 'https://support.microsoft.com/ca-es/office/norm-s-dist-function-1e787282-3832-4520-a9ae-bd2a8d99ba88',
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
                url: 'https://support.microsoft.com/ca-es/office/norm-s-inv-function-d6d556b4-ab7f-49cd-b526-5a20918452b1',
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
                url: 'https://support.microsoft.com/ca-es/office/pearson-function-0c3e30fc-e5af-49c4-808a-3ef66e034c18',
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
                url: 'https://support.microsoft.com/ca-es/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba',
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
                url: 'https://support.microsoft.com/ca-es/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed',
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
                url: 'https://support.microsoft.com/ca-es/office/percentrank-exc-function-d8afee96-b7e2-4a2f-8c01-8fcdedaa6314',
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
                url: 'https://support.microsoft.com/ca-es/office/percentrank-inc-function-149592c9-00c0-49ba-86c1-c1f45b80463a',
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
                url: 'https://support.microsoft.com/ca-es/office/permut-function-3bd1cb9a-2880-41ab-a197-f246a7a602d3',
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
                url: 'https://support.microsoft.com/ca-es/office/permutationa-function-6c7d7fdc-d657-44e6-aa19-2857b25cae4e',
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
                url: 'https://support.microsoft.com/ca-es/office/phi-function-23e49bc6-a8e8-402d-98d3-9ded87f6295c',
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
                url: 'https://support.microsoft.com/ca-es/office/poisson-dist-function-8fe148ff-39a2-46cb-abf3-7772695d9636',
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
                url: 'https://support.microsoft.com/ca-es/office/prob-function-9ac30561-c81c-4259-8253-34f0a238fc49',
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
                url: 'https://support.microsoft.com/ca-es/office/quartile-exc-function-5a355b7a-840b-4a01-b0f1-f538c2864cad',
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
                url: 'https://support.microsoft.com/ca-es/office/quartile-inc-function-1bbacc80-5075-42f1-aed6-47d735c4819d',
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
                url: 'https://support.microsoft.com/ca-es/office/rank-avg-function-bd406a6f-eb38-4d73-aa8e-6d1c3c72e83a',
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
                url: 'https://support.microsoft.com/ca-es/office/rank-eq-function-284858ce-8ef6-450e-b662-26245be04a40',
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
                url: 'https://support.microsoft.com/ca-es/office/rsq-function-d7161715-250d-4a01-b80d-a8364f2be08f',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'La matriu o rang de dades dependent.' },
            array2: { name: 'matriu2', detail: 'La matriu o rang de dades independent.' },
        },
    },
    SKEW: {
        description: 'Retorna la biaix d\'una distribució',
        abstract: 'Retorna la biaix d\'una distribució',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/office/skew-function-bdf49d86-b1ef-4804-a046-28eaea69c9fa',
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
                url: 'https://support.microsoft.com/ca-es/office/skew-p-function-76530a5c-99b9-48a1-8392-26632d542fcb',
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
                url: 'https://support.microsoft.com/ca-es/office/slope-function-11fb8f97-3117-4813-98aa-61d7e01276b9',
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
                url: 'https://support.microsoft.com/ca-es/office/small-function-17da8222-7c82-42b2-961b-14c45384df07',
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
                url: 'https://support.microsoft.com/ca-es/office/standardize-function-81d66554-2d54-40ec-ba83-6437108ee775',
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
                url: 'https://support.microsoft.com/ca-es/office/stdev-p-function-6e917c05-31a0-496f-ade7-4f4e7462f285',
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
                url: 'https://support.microsoft.com/ca-es/office/stdev-s-function-7d69cf97-0c1f-4acf-be27-f3e83904cc23',
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
                url: 'https://support.microsoft.com/ca-es/office/stdeva-function-5ff38888-7ea5-48de-9a6d-11ed73b29e9d',
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
                url: 'https://support.microsoft.com/ca-es/office/stdevpa-function-5578d4d6-455a-4308-9991-d405afe2c28c',
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
                url: 'https://support.microsoft.com/ca-es/office/steyx-function-6ce74b2c-449d-4a6e-b9ac-f9cef5ba48ab',
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
                url: 'https://support.microsoft.com/ca-es/office/t-dist-function-4329459f-ae91-48c2-bba8-1ead1c6c21b2',
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
                url: 'https://support.microsoft.com/ca-es/office/t-dist-2t-function-198e9340-e360-4230-bd21-f52f22ff5c28',
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
                url: 'https://support.microsoft.com/ca-es/office/t-dist-rt-function-20a30020-86f9-4b35-af1f-7ef6ae683eda',
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
                url: 'https://support.microsoft.com/ca-es/office/t-inv-function-2908272b-4e61-4942-9df9-a25fec9b0e2e',
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
                url: 'https://support.microsoft.com/ca-es/office/t-inv-2t-function-ce72ea19-ec6c-4be7-bed2-b9baf2264f17',
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
                url: 'https://support.microsoft.com/ca-es/office/t-test-function-d4e08ec3-c545-485f-962e-276f7cbed055',
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
                url: 'https://support.microsoft.com/ca-es/office/trend-function-e2f135f0-8827-4096-9873-9a7cf7b51ef1',
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
                url: 'https://support.microsoft.com/ca-es/office/trimmean-function-d90c9878-a119-4746-88fa-63d988f511d3',
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
                url: 'https://support.microsoft.com/ca-es/office/var-p-function-73d1285c-108c-4843-ba5d-a51f90656f3a',
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
                url: 'https://support.microsoft.com/ca-es/office/var-s-function-913633de-136b-449d-813e-65a00b2b990b',
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
                url: 'https://support.microsoft.com/ca-es/office/vara-function-3de77469-fa3a-47b4-85fd-81758a1e1d07',
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
                url: 'https://support.microsoft.com/ca-es/office/varpa-function-59a62635-4e89-4fad-88ac-ce4dc0513b96',
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
                url: 'https://support.microsoft.com/ca-es/office/weibull-dist-function-4e783c39-9325-49be-bbc9-a83ef82b45db',
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
                url: 'https://support.microsoft.com/ca-es/office/z-test-function-d633d5a3-2031-4614-a016-92180ad82bee',
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
