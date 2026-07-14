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
    ACCRINT: {
        description: 'Retorna l\'interès acumulat d\'un valor que paga interessos periòdics',
        abstract: 'Retorna l\'interès acumulat d\'un valor que paga interessos periòdics',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/accrint-function',
            },
        ],
        functionParameter: {
            issue: { name: 'emissió', detail: 'La data d\'emissió del valor.' },
            firstInterest: { name: 'primer_interès', detail: 'La data del primer pagament d\'interessos del valor.' },
            settlement: { name: 'liquidació', detail: 'La data de venciment del valor.' },
            rate: { name: 'taxa', detail: 'El tipus de cupó anual del valor.' },
            par: { name: 'valor_nominal', detail: 'El valor nominal del valor.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
            calcMethod: { name: 'mètode_càlcul', detail: 'Un valor lògic: TRUE o omès indica que els interessos s\'acumulen des de la data d\'emissió; FALSE indica que s\'acumulen des de la darrera data de pagament del cupó.' },
        },
    },
    ACCRINTM: {
        description: 'Retorna l\'interès acumulat d\'un valor que paga interessos al venciment.',
        abstract: 'Retorna l\'interès acumulat d\'un valor que paga interessos al venciment.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/accrintm-function',
            },
        ],
        functionParameter: {
            issue: { name: 'emissió', detail: "La data d'emissió del valor." },
            settlement: { name: 'liquidació', detail: 'La data de venciment del valor.' },
            rate: { name: 'taxa', detail: 'El tipus de cupó anual del valor.' },
            par: { name: 'valor_nominal', detail: 'El valor nominal del valor. Si s\'omet, ACCRINTM utilitza 1.000 $.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    AMORDEGRC: {
        description: 'Retorna l\'amortització de cada període comptable mitjançant un coeficient d\'amortització.',
        abstract: 'Retorna l\'amortització de cada període comptable mitjançant un coeficient d\'amortització.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/amordegrc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: "El cost de l'actiu." },
            datePurchased: { name: 'date_purchased', detail: "La data de compra de l'actiu." },
            firstPeriod: { name: 'first_period', detail: 'La data de finalització del primer període.' },
            salvage: { name: 'salvage', detail: "El valor residual al final de la vida útil de l'actiu." },
            period: { name: 'period', detail: 'El període.' },
            rate: { name: 'rate', detail: "La taxa d'amortització." },
            basis: { name: 'basis', detail: "La base anual que s'ha d'utilitzar." },
        },
    },
    AMORLINC: {
        description: 'Retorna l\'amortització de cada període comptable.',
        abstract: 'Retorna l\'amortització de cada període comptable.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/amorlinc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: "El cost de l'actiu." },
            datePurchased: { name: 'date_purchased', detail: "La data de compra de l'actiu." },
            firstPeriod: { name: 'first_period', detail: 'La data de finalització del primer període.' },
            salvage: { name: 'salvage', detail: "El valor residual al final de la vida útil de l'actiu." },
            period: { name: 'period', detail: 'El període.' },
            rate: { name: 'rate', detail: "La taxa d'amortització." },
            basis: { name: 'basis', detail: "La base anual que s'ha d'utilitzar." },
        },
    },
    COUPDAYBS: {
        description: 'Retorna el nombre de dies des de l\'inici del període de cupó fins a la data de liquidació.',
        abstract: 'Retorna el nombre de dies des de l\'inici del període de cupó fins a la data de liquidació.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/coupdaybs-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    COUPDAYS: {
        description: 'Retorna el nombre de dies del període de cupó que conté la data de liquidació.',
        abstract: 'Retorna el nombre de dies del període de cupó que conté la data de liquidació.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/coupdays-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    COUPDAYSNC: {
        description: 'Retorna el nombre de dies des de la data de liquidació fins a la data del cupó següent.',
        abstract: 'Retorna el nombre de dies des de la data de liquidació fins a la data del cupó següent.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/coupdaysnc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    COUPNCD: {
        description: 'Retorna la data del cupó següent després de la data de liquidació.',
        abstract: 'Retorna la data del cupó següent després de la data de liquidació.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/coupncd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    COUPNUM: {
        description: 'Retorna el nombre de cupons pagables entre la data de liquidació i la data de venciment.',
        abstract: 'Retorna el nombre de cupons pagables entre la data de liquidació i la data de venciment.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/coupnum-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    COUPPCD: {
        description: 'Retorna la data del cupó anterior a la data de liquidació.',
        abstract: 'Retorna la data del cupó anterior a la data de liquidació.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/couppcd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    CUMIPMT: {
        description: 'Retorna els interessos acumulats pagats entre dos períodes.',
        abstract: 'Retorna els interessos acumulats pagats entre dos períodes.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cumipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'taxa', detail: "El tipus d'interès." },
            nper: { name: 'nper', detail: 'El nombre total de períodes de pagament.' },
            pv: { name: 'pv', detail: 'El valor actual.' },
            startPeriod: { name: 'període_inicial', detail: 'El primer període del càlcul. Els períodes de pagament es numeren a partir d’1.' },
            endPeriod: { name: 'període_final', detail: 'L’últim període del càlcul.' },
            type: { name: 'tipus', detail: 'El moment del pagament.' },
        },
    },
    CUMPRINC: {
        description: 'Retorna el principal acumulat pagat d\'un préstec entre dos períodes.',
        abstract: 'Retorna el principal acumulat pagat d\'un préstec entre dos períodes.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/cumprinc-function',
            },
        ],
        functionParameter: {
            rate: { name: 'taxa', detail: "El tipus d'interès." },
            nper: { name: 'nper', detail: 'El nombre total de períodes de pagament.' },
            pv: { name: 'pv', detail: 'El valor actual.' },
            startPeriod: { name: 'període_inicial', detail: 'El primer període del càlcul. Els períodes de pagament es numeren a partir d’1.' },
            endPeriod: { name: 'període_final', detail: 'L’últim període del càlcul.' },
            type: { name: 'tipus', detail: 'El moment del pagament.' },
        },
    },
    DB: {
        description: 'Retorna l\'amortització d\'un actiu per a un període especificat mitjançant el mètode de saldo decreixent a tipus fix.',
        abstract: 'Retorna l\'amortització d\'un actiu per a un període especificat mitjançant el mètode de saldo decreixent a tipus fix.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/db-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: "El cost inicial de l'actiu." },
            salvage: { name: 'valor_residual', detail: "El valor al final de l'amortització, també anomenat valor residual de l'actiu." },
            life: { name: 'vida_útil', detail: "El nombre de períodes durant els quals s'amortitza l'actiu, també anomenat vida útil de l'actiu." },
            period: { name: 'període', detail: "El període del qual es vol calcular l'amortització. Ha d'utilitzar les mateixes unitats que vida_útil." },
            month: { name: 'mes', detail: 'El nombre de mesos del primer any. Si s’omet, se suposa que és 12.' },
        },
    },
    DDB: {
        description: 'Retorna l\'amortització d\'un actiu per a un període especificat mitjançant el mètode de saldo decreixent doble o un altre mètode que especifiqueu.',
        abstract: 'Retorna l\'amortització d\'un actiu per a un període especificat mitjançant el mètode de saldo decreixent doble o un altre mètode que especifiqueu.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/ddb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: "El cost inicial de l'actiu." },
            salvage: { name: 'valor_residual', detail: "El valor al final de l'amortització, també anomenat valor residual de l'actiu. Pot ser 0." },
            life: { name: 'vida_útil', detail: "El nombre de períodes durant els quals s'amortitza l'actiu, també anomenat vida útil de l'actiu." },
            period: { name: 'període', detail: "El període del qual es vol calcular l'amortització. Ha d'utilitzar les mateixes unitats que vida_útil." },
            factor: { name: 'factor', detail: 'La taxa a la qual disminueix el saldo. Si s’omet, se suposa que és 2, és a dir, el mètode de saldo decreixent doble.' },
        },
    },
    DISC: {
        description: 'Retorna la taxa de descompte d\'un valor.',
        abstract: 'Retorna la taxa de descompte d\'un valor.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/disc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            pr: { name: 'preu', detail: 'El preu del valor per cada 100 $ de valor nominal.' },
            redemption: { name: 'reemborsament', detail: 'El valor de reemborsament del valor per cada 100 $ de valor nominal.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    DOLLARDE: {
        description: 'Converteix un preu en dòlars expressat com a fracció en un preu en dòlars expressat com a nombre decimal.',
        abstract: 'Converteix un preu en dòlars expressat com a fracció en un preu en dòlars expressat com a nombre decimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/dollarde-function',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: 'dòlar_fraccionari', detail: 'Un nombre expressat com una part entera i una part fraccionària, separades per un símbol decimal.' },
            fraction: { name: 'fracció', detail: 'L’enter que s’utilitza com a denominador de la fracció.' },
        },
    },
    DOLLARFR: {
        description: 'Converteix un preu en dòlars expressat com a nombre decimal en un preu en dòlars expressat com a fracció.',
        abstract: 'Converteix un preu en dòlars expressat com a nombre decimal en un preu en dòlars expressat com a fracció.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/dollarfr-function',
            },
        ],
        functionParameter: {
            decimalDollar: { name: 'dòlar_decimal', detail: 'Un nombre decimal.' },
            fraction: { name: 'fracció', detail: 'L’enter que s’utilitza com a denominador de la fracció.' },
        },
    },
    DURATION: {
        description: 'Retorna la durada anual d\'un valor amb pagaments d\'interessos periòdics.',
        abstract: 'Retorna la durada anual d\'un valor amb pagaments d\'interessos periòdics.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/duration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            coupon: { name: 'cupó', detail: 'El tipus de cupó anual del valor.' },
            yld: { name: 'rendiment', detail: 'El rendiment anual del valor.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    EFFECT: {
        description: 'Returns the effective annual interest rate',
        abstract: 'Returns the effective annual interest rate',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominal_rate', detail: 'The nominal interest rate.' },
            npery: { name: 'npery', detail: 'The number of compounding periods per year.' },
        },
    },
    FV: {
        description: 'Retorna el valor futur d\'una inversió.',
        abstract: 'Retorna el valor futur d\'una inversió.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'taxa', detail: "El tipus d'interès per període." },
            nper: { name: 'nper', detail: "El nombre total de períodes de pagament d'una anualitat." },
            pmt: { name: 'pagament', detail: "El pagament efectuat a cada període; no pot variar durant la vida de l'anualitat." },
            pv: { name: 'pv', detail: 'El valor actual, o l’import únic al qual equival ara una sèrie de pagaments futurs.' },
            type: { name: 'tipus', detail: 'El nombre 0 o 1 que indica quan s’han de fer els pagaments.' },
        },
    },
    FVSCHEDULE: {
        description: 'Retorna el valor futur d\'un principal inicial després d\'aplicar una sèrie de tipus d\'interès compostos.',
        abstract: 'Retorna el valor futur d\'un principal inicial després d\'aplicar una sèrie de tipus d\'interès compostos.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: 'principal', detail: 'El valor actual.' },
            schedule: { name: 'calendari', detail: "Una matriu de tipus d'interès que s'han d'aplicar." },
        },
    },
    INTRATE: {
        description: 'Returns the interest rate for a fully invested security',
        abstract: 'Returns the interest rate for a fully invested security',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: "The security's settlement date." },
            maturity: { name: 'maturity', detail: "The security's maturity date." },
            investment: { name: 'investment', detail: 'The amount invested in the security.' },
            redemption: { name: 'redemption', detail: 'The amount to be received at maturity.' },
            basis: { name: 'basis', detail: 'The type of day count basis to use.' },
        },
    },
    IPMT: {
        description: 'Returns the interest payment for an investment for a given period',
        abstract: 'Returns the interest payment for an investment for a given period',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/ipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'The interest rate per period.' },
            per: { name: 'per', detail: 'The period for which you want to find the interest and must be in the range 1 to nper.' },
            nper: { name: 'nper', detail: 'The total number of payment periods in an annuity.' },
            pv: { name: 'pv', detail: 'The present value, or the lump-sum amount that a series of future payments is worth right now.' },
            fv: { name: 'fv', detail: 'The future value, or a cash balance you want to attain after the last payment is made.' },
            type: { name: 'type', detail: 'The number 0 or 1 and indicates when payments are due.' },
        },
    },
    IRR: {
        description: 'Retorna la taxa interna de rendiment d\'una sèrie de fluxos d\'efectiu.',
        abstract: 'Retorna la taxa interna de rendiment d\'una sèrie de fluxos d\'efectiu.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: 'valors', detail: 'Una matriu o referència a cel·les amb nombres per als quals es vol calcular la taxa interna de rendiment. Han de contenir almenys un valor positiu i un de negatiu. IRR utilitza l’ordre dels valors per interpretar l’ordre dels fluxos d’efectiu; introduïu pagaments i ingressos en l’ordre desitjat. El text, els valors lògics i les cel·les buides s’ignoren.' },
            guess: { name: 'estimació', detail: 'Un nombre que estimeu proper al resultat d’IRR.' },
        },
    },
    ISPMT: {
        description: 'Calcula els interessos pagats durant un període específic d\'una inversió.',
        abstract: 'Calcula els interessos pagats durant un període específic d\'una inversió.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'taxa', detail: "El tipus d'interès de la inversió." },
            per: { name: 'període', detail: "El període del qual es vol obtenir l'interès; ha d'estar entre 1 i nper." },
            nper: { name: 'nper', detail: 'El nombre total de períodes de pagament de la inversió.' },
            pv: { name: 'pv', detail: 'El valor actual de la inversió. Per a un préstec, pv és l’import del préstec.' },
        },
    },
    MDURATION: {
        description: 'Retorna la durada modificada de Macaulay d\'un valor amb un valor nominal suposat de 100 dòlars.',
        abstract: 'Retorna la durada modificada de Macaulay d\'un valor amb un valor nominal suposat de 100 dòlars.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/mduration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            coupon: { name: 'cupó', detail: 'El tipus de cupó anual del valor.' },
            yld: { name: 'rendiment', detail: 'El rendiment anual del valor.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    MIRR: {
        description: 'Retorna la taxa interna de rendiment quan els fluxos d\'efectiu positius i negatius es financen a tipus diferents.',
        abstract: 'Retorna la taxa interna de rendiment quan els fluxos d\'efectiu positius i negatius es financen a tipus diferents.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/mirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'valors', detail: 'Una matriu o referència a cel·les que contenen nombres. Representen una sèrie de pagaments (valors negatius) i ingressos (valors positius) en períodes regulars. Han de contenir almenys un valor positiu i un de negatiu; en cas contrari, MIRR retorna #DIV/0!. El text, els valors lògics i les cel·les buides s’ignoren, però s’inclouen les cel·les amb valor zero.' },
            financeRate: { name: 'taxa_finançament', detail: "El tipus d'interès que es paga pels diners utilitzats en els fluxos d'efectiu." },
            reinvestRate: { name: 'taxa_reinversió', detail: "El tipus d'interès que es rep en reinvertir els fluxos d'efectiu." },
        },
    },
    NOMINAL: {
        description: 'Retorna la taxa d\'interès nominal anual.',
        abstract: 'Retorna la taxa d\'interès nominal anual.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/nominal-function',
            },
        ],
        functionParameter: {
            effectRate: { name: 'taxa_efectiva', detail: "El tipus d'interès efectiu." },
            npery: { name: 'npery', detail: 'El nombre de períodes de capitalització per any.' },
        },
    },
    NPER: {
        description: 'Retorna el nombre de períodes d\'una inversió.',
        abstract: 'Retorna el nombre de períodes d\'una inversió.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/nper-function',
            },
        ],
        functionParameter: {
            rate: { name: 'taxa', detail: "El tipus d'interès per període." },
            pmt: { name: 'pagament', detail: "El pagament efectuat a cada període; no pot variar durant la vida de l'anualitat." },
            pv: { name: 'pv', detail: 'El valor actual, o l’import únic al qual equival ara una sèrie de pagaments futurs.' },
            fv: { name: 'vf', detail: 'El valor futur, o el saldo en efectiu que es vol assolir després de l’últim pagament.' },
            type: { name: 'tipus', detail: 'El nombre 0 o 1 que indica quan s’han de fer els pagaments.' },
        },
    },
    NPV: {
        description: 'Retorna el valor actual net d\'una inversió basat en una sèrie de fluxos d\'efectiu periòdics i una taxa de descompte.',
        abstract: 'Retorna el valor actual net d\'una inversió basat en una sèrie de fluxos d\'efectiu periòdics i una taxa de descompte.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/npv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'taxa', detail: 'La taxa de descompte corresponent a la durada d’un període.' },
            value1: { name: 'valor1', detail: 'D’1 a 254 arguments que representen els pagaments i els ingressos.' },
            value2: { name: 'valor2', detail: 'D’1 a 254 arguments que representen els pagaments i els ingressos.' },
        },
    },
    ODDFPRICE: {
        description: 'Retorna el preu per un valor nominal de 100 dòlars d\'un valor amb un primer període irregular.',
        abstract: 'Retorna el preu per un valor nominal de 100 dòlars d\'un valor amb un primer període irregular.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/oddfprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            issue: { name: 'emissió', detail: "La data d'emissió del valor." },
            firstCoupon: { name: 'primer_cupó', detail: 'La data del primer cupó del valor.' },
            rate: { name: 'taxa', detail: "El tipus d'interès del valor." },
            yld: { name: 'rendiment', detail: 'El rendiment anual del valor.' },
            redemption: { name: 'reemborsament', detail: 'El valor de reemborsament del valor per cada 100 $ de valor nominal.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    ODDFYIELD: {
        description: 'Retorna el rendiment d\'un valor amb un primer període irregular.',
        abstract: 'Retorna el rendiment d\'un valor amb un primer període irregular.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/oddfyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            issue: { name: 'emissió', detail: "La data d'emissió del valor." },
            firstCoupon: { name: 'primer_cupó', detail: 'La data del primer cupó del valor.' },
            rate: { name: 'taxa', detail: "El tipus d'interès del valor." },
            pr: { name: 'preu', detail: 'El preu del valor.' },
            redemption: { name: 'reemborsament', detail: 'El valor de reemborsament del valor per cada 100 $ de valor nominal.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    ODDLPRICE: {
        description: 'Retorna el preu per un valor nominal de 100 dòlars d\'un valor amb un últim període irregular.',
        abstract: 'Retorna el preu per un valor nominal de 100 dòlars d\'un valor amb un últim període irregular.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/oddlprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            lastInterest: { name: 'últim_cupó', detail: 'La data de l’últim cupó del valor.' },
            rate: { name: 'taxa', detail: "El tipus d'interès del valor." },
            yld: { name: 'rendiment', detail: 'El rendiment anual del valor.' },
            redemption: { name: 'reemborsament', detail: 'El valor de reemborsament del valor per cada 100 $ de valor nominal.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    ODDLYIELD: {
        description: 'Retorna el rendiment d\'un valor amb un últim període irregular.',
        abstract: 'Retorna el rendiment d\'un valor amb un últim període irregular.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/oddlyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            lastInterest: { name: 'últim_cupó', detail: 'La data de l’últim cupó del valor.' },
            rate: { name: 'taxa', detail: "El tipus d'interès del valor." },
            pr: { name: 'preu', detail: 'El preu del valor.' },
            redemption: { name: 'reemborsament', detail: 'El valor de reemborsament del valor per cada 100 $ de valor nominal.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    PDURATION: {
        description: 'Retorna el nombre de períodes necessaris perquè una inversió arribi a un valor especificat.',
        abstract: 'Retorna el nombre de períodes necessaris perquè una inversió arribi a un valor especificat.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/pduration-function',
            },
        ],
        functionParameter: {
            rate: { name: 'taxa', detail: "El tipus d'interès per període." },
            pv: { name: 'pv', detail: 'El valor actual de la inversió.' },
            fv: { name: 'vf', detail: 'El valor futur desitjat de la inversió.' },
        },
    },
    PMT: {
        description: 'Retorna el pagament periòdic d\'una anualitat.',
        abstract: 'Retorna el pagament periòdic d\'una anualitat.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/pmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'taxa', detail: "El tipus d'interès del préstec." },
            nper: { name: 'nper', detail: 'El nombre total de pagaments del préstec.' },
            pv: { name: 'pv', detail: 'El valor actual, o l’import total al qual equival ara una sèrie de pagaments futurs; també anomenat principal.' },
            fv: { name: 'vf', detail: 'El valor futur, o el saldo en efectiu que es vol assolir després de l’últim pagament.' },
            type: { name: 'tipus', detail: 'El nombre 0 o 1 que indica quan s’han de fer els pagaments.' },
        },
    },
    PPMT: {
        description: 'Retorna el pagament del principal d\'una inversió per a un període determinat.',
        abstract: 'Retorna el pagament del principal d\'una inversió per a un període determinat.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/ppmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'taxa', detail: "El tipus d'interès per període." },
            per: { name: 'període', detail: "El període del qual es vol trobar el principal; ha d'estar entre 1 i nper." },
            nper: { name: 'nper', detail: "El nombre total de períodes de pagament d'una anualitat." },
            pv: { name: 'pv', detail: 'El valor actual, o l’import total al qual equival ara una sèrie de pagaments futurs.' },
            fv: { name: 'vf', detail: 'El valor futur, o el saldo en efectiu que es vol assolir després de l’últim pagament.' },
            type: { name: 'tipus', detail: 'El nombre 0 o 1 que indica quan s’han de fer els pagaments.' },
        },
    },
    PRICE: {
        description: 'Retorna el preu per un valor nominal de 100 dòlars d\'un valor que paga interessos periòdics.',
        abstract: 'Retorna el preu per un valor nominal de 100 dòlars d\'un valor que paga interessos periòdics.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/price-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            rate: { name: 'taxa', detail: "El tipus d'interès del valor." },
            yld: { name: 'rendiment', detail: 'El rendiment anual del valor.' },
            redemption: { name: 'reemborsament', detail: 'El valor de reemborsament del valor per cada 100 $ de valor nominal.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    PRICEDISC: {
        description: 'Retorna el preu per un valor nominal de 100 dòlars d\'un valor descomptat.',
        abstract: 'Retorna el preu per un valor nominal de 100 dòlars d\'un valor descomptat.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/pricedisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            discount: { name: 'descompte', detail: 'La taxa de descompte del valor.' },
            redemption: { name: 'reemborsament', detail: 'El valor de reemborsament del valor per cada 100 $ de valor nominal.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    PRICEMAT: {
        description: 'Retorna el preu per un valor nominal de 100 dòlars d\'un valor que paga interessos al venciment.',
        abstract: 'Retorna el preu per un valor nominal de 100 dòlars d\'un valor que paga interessos al venciment.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/pricemat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            issue: { name: 'emissió', detail: "La data d'emissió del valor, expressada com a número de sèrie de data." },
            rate: { name: 'taxa', detail: "El tipus d'interès del valor a la data d'emissió." },
            yld: { name: 'rendiment', detail: 'El rendiment anual del valor.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    PV: {
        description: 'Retorna el valor actual d\'una inversió.',
        abstract: 'Retorna el valor actual d\'una inversió.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/pv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'taxa', detail: "El tipus d'interès per període." },
            nper: { name: 'nper', detail: "El nombre total de períodes de pagament d'una anualitat." },
            pmt: { name: 'pagament', detail: "El pagament efectuat a cada període; no pot variar durant la vida de l'anualitat." },
            fv: { name: 'vf', detail: 'El valor futur, o el saldo en efectiu que es vol assolir després de l’últim pagament.' },
            type: { name: 'tipus', detail: 'El nombre 0 o 1 que indica quan s’han de fer els pagaments.' },
        },
    },
    RATE: {
        description: 'Retorna la taxa d\'interès per període d\'una anualitat.',
        abstract: 'Retorna la taxa d\'interès per període d\'una anualitat.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/rate-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: "El nombre total de períodes de pagament d'una anualitat." },
            pmt: { name: 'pagament', detail: "El pagament efectuat a cada període; no pot variar durant la vida de l'anualitat." },
            pv: { name: 'pv', detail: 'El valor actual, o l’import únic al qual equival ara una sèrie de pagaments futurs.' },
            fv: { name: 'vf', detail: 'El valor futur, o el saldo en efectiu que es vol assolir després de l’últim pagament.' },
            type: { name: 'tipus', detail: 'El nombre 0 o 1 que indica quan s’han de fer els pagaments.' },
            guess: { name: 'estimació', detail: 'La vostra estimació del valor que tindrà la taxa.' },
        },
    },
    RECEIVED: {
        description: 'Retorna l\'import rebut al venciment per un valor totalment invertit.',
        abstract: 'Retorna l\'import rebut al venciment per un valor totalment invertit.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/received-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            investment: { name: 'inversió', detail: 'L’import invertit en el valor.' },
            discount: { name: 'descompte', detail: 'La taxa de descompte del valor.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    RRI: {
        description: 'Retorna un tipus d\'interès equivalent per al creixement d\'una inversió.',
        abstract: 'Retorna un tipus d\'interès equivalent per al creixement d\'una inversió.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/rri-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'El nombre de períodes de la inversió.' },
            pv: { name: 'pv', detail: 'El valor actual de la inversió.' },
            fv: { name: 'vf', detail: 'El valor futur de la inversió.' },
        },
    },
    SLN: {
        description: 'Retorna l\'amortització lineal d\'un actiu per a un període.',
        abstract: 'Retorna l\'amortització lineal d\'un actiu per a un període.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sln-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: "El cost inicial de l'actiu." },
            salvage: { name: 'valor_residual', detail: "El valor al final de l'amortització, també anomenat valor residual de l'actiu." },
            life: { name: 'vida_útil', detail: "El nombre de períodes durant els quals s'amortitza l'actiu, també anomenat vida útil de l'actiu." },
        },
    },
    SYD: {
        description: 'Retorna l\'amortització d\'un actiu per a un període especificat mitjançant el mètode de la suma dels dígits dels anys.',
        abstract: 'Retorna l\'amortització d\'un actiu per a un període especificat mitjançant el mètode de la suma dels dígits dels anys.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/syd-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: "El cost inicial de l'actiu." },
            salvage: { name: 'valor_residual', detail: "El valor al final de l'amortització, també anomenat valor residual de l'actiu." },
            life: { name: 'vida_útil', detail: "El nombre de períodes durant els quals s'amortitza l'actiu, també anomenat vida útil de l'actiu." },
            per: { name: 'període', detail: 'El període; ha d’utilitzar les mateixes unitats que vida_útil.' },
        },
    },
    TBILLEQ: {
        description: 'Retorna el rendiment equivalent a un bo d\'una lletra del Tresor.',
        abstract: 'Retorna el rendiment equivalent a un bo d\'una lletra del Tresor.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/tbilleq-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: 'La data de liquidació de la lletra del Tresor.' },
            maturity: { name: 'venciment', detail: 'La data de venciment de la lletra del Tresor.' },
            discount: { name: 'descompte', detail: 'La taxa de descompte de la lletra del Tresor.' },
        },
    },
    TBILLPRICE: {
        description: 'Retorna el preu per un valor nominal de 100 dòlars d\'una lletra del Tresor.',
        abstract: 'Retorna el preu per un valor nominal de 100 dòlars d\'una lletra del Tresor.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/tbillprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: 'La data de liquidació de la lletra del Tresor.' },
            maturity: { name: 'venciment', detail: 'La data de venciment de la lletra del Tresor.' },
            discount: { name: 'descompte', detail: 'La taxa de descompte de la lletra del Tresor.' },
        },
    },
    TBILLYIELD: {
        description: 'Retorna el rendiment d\'una lletra del Tresor.',
        abstract: 'Retorna el rendiment d\'una lletra del Tresor.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/tbillyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: 'La data de liquidació de la lletra del Tresor.' },
            maturity: { name: 'venciment', detail: 'La data de venciment de la lletra del Tresor.' },
            pr: { name: 'preu', detail: 'El preu de la lletra del Tresor per cada 100 $ de valor nominal.' },
        },
    },
    VDB: {
        description: 'Retorna l\'amortització d\'un actiu per a un període especificat o parcial mitjançant un mètode de saldo decreixent.',
        abstract: 'Retorna l\'amortització d\'un actiu per a un període especificat o parcial mitjançant un mètode de saldo decreixent.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/vdb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: "El cost inicial de l'actiu." },
            salvage: { name: 'valor_residual', detail: "El valor al final de l'amortització, també anomenat valor residual de l'actiu. Pot ser 0." },
            life: { name: 'vida_útil', detail: "El nombre de períodes durant els quals s'amortitza l'actiu, també anomenat vida útil de l'actiu." },
            startPeriod: { name: 'període_inicial', detail: "El període inicial del qual es vol calcular l'amortització; ha d'utilitzar les mateixes unitats que vida_útil." },
            endPeriod: { name: 'període_final', detail: "El període final del qual es vol calcular l'amortització; ha d'utilitzar les mateixes unitats que vida_útil." },
            factor: { name: 'factor', detail: 'La taxa a la qual disminueix el saldo. Si s’omet, se suposa que és 2, és a dir, el mètode de saldo decreixent doble.' },
            noSwitch: { name: 'sense_canvi', detail: 'Un valor lògic que indica si s’ha de canviar a l’amortització lineal quan sigui superior al càlcul de saldo decreixent.' },
        },
    },
    XIRR: {
        description: 'Retorna la taxa interna de rendiment d\'un calendari de fluxos d\'efectiu que no és necessàriament periòdic.',
        abstract: 'Retorna la taxa interna de rendiment d\'un calendari de fluxos d\'efectiu que no és necessàriament periòdic.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/xirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'valors', detail: 'Una sèrie de fluxos d’efectiu que correspon a un calendari de pagaments en dates. El primer pagament és opcional i correspon a un cost o pagament a l’inici de la inversió; si és un cost o pagament, ha de ser negatiu. Els pagaments posteriors es descompten sobre la base d’un any de 365 dies. La sèrie ha de contenir almenys un valor positiu i un de negatiu.' },
            dates: { name: 'dates', detail: 'Un calendari de dates de pagament que correspon als fluxos d’efectiu. Les dates poden aparèixer en qualsevol ordre.' },
            guess: { name: 'estimació', detail: 'Un nombre que estimeu proper al resultat d’XIRR.' },
        },
    },
    XNPV: {
        description: 'Retorna el valor actual net d\'un calendari de fluxos d\'efectiu que no és necessàriament periòdic.',
        abstract: 'Retorna el valor actual net d\'un calendari de fluxos d\'efectiu que no és necessàriament periòdic.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/xnpv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'taxa', detail: 'La taxa de descompte que s’aplica als fluxos d’efectiu.' },
            values: { name: 'valors', detail: 'Una sèrie de fluxos d’efectiu que correspon a un calendari de pagaments en dates. El primer pagament és opcional i correspon a un cost o pagament a l’inici de la inversió; si és un cost o pagament, ha de ser negatiu. Els pagaments posteriors es descompten sobre la base d’un any de 365 dies. La sèrie ha de contenir almenys un valor positiu i un de negatiu.' },
            dates: { name: 'dates', detail: 'Un calendari de dates de pagament que correspon als fluxos d’efectiu. Les dates poden aparèixer en qualsevol ordre.' },
        },
    },
    YIELD: {
        description: 'Retorna el rendiment d\'un valor que paga interessos periòdics.',
        abstract: 'Retorna el rendiment d\'un valor que paga interessos periòdics.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/yield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            rate: { name: 'taxa', detail: "El tipus d'interès del valor." },
            pr: { name: 'preu', detail: 'El preu del valor per cada 100 $ de valor nominal.' },
            redemption: { name: 'reemborsament', detail: 'El valor de reemborsament del valor per cada 100 $ de valor nominal.' },
            frequency: { name: 'freqüència', detail: 'El nombre de pagaments de cupó per any. Per a pagaments anuals, freqüència = 1; semestrals, freqüència = 2; trimestrals, freqüència = 4.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    YIELDDISC: {
        description: 'Retorna el rendiment anual d\'un valor descomptat; per exemple, una lletra del Tresor.',
        abstract: 'Retorna el rendiment anual d\'un valor descomptat; per exemple, una lletra del Tresor.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/yielddisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            pr: { name: 'preu', detail: 'El preu del valor per cada 100 $ de valor nominal.' },
            redemption: { name: 'reemborsament', detail: 'El valor de reemborsament del valor per cada 100 $ de valor nominal.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
    YIELDMAT: {
        description: 'Retorna el rendiment anual d\'un valor que paga interessos al venciment.',
        abstract: 'Retorna el rendiment anual d\'un valor que paga interessos al venciment.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ca-es/excel/functions/yieldmat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidació', detail: "La data de liquidació del valor. És la data posterior a l'emissió en què el valor es negocia amb el comprador." },
            maturity: { name: 'venciment', detail: 'La data de venciment del valor. És la data en què el valor expira.' },
            issue: { name: 'emissió', detail: "La data d'emissió del valor, expressada com a número de sèrie de data." },
            rate: { name: 'taxa', detail: "El tipus d'interès del valor a la data d'emissió." },
            pr: { name: 'preu', detail: 'El preu del valor per cada 100 $ de valor nominal.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que cal utilitzar.' },
        },
    },
};

export default locale;
