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
        description: 'Renvoie l’intérêt couru non échu d’un titre dont l’intérêt est perçu périodiquement.',
        abstract: 'Renvoie l’intérêt couru non échu d’un titre dont l’intérêt est perçu périodiquement.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/accrint-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: 'Obligatoire. Représente la date d’émission du titre.' },
            firstInterest: { name: 'first_interest', detail: 'Obligatoire. Représente la date du premier paiement d’intérêt du titre.' },
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux annuel du coupon du titre.' },
            par: { name: 'par', detail: 'Obligatoire. Représente la valeur nominale du titre. Si vous omettez cet argument, la fonction INTERET.ACC utilise 1 000 €.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
            calcMethod: { name: 'calc_method', detail: 'Optionnel. Représente une valeur logique qui spécifie les périodes utilisées pour calculer l’intérêt couru à partir de la date d’émission. La valeur VRAI (1) renvoie l’intérêt couru pour toutes les périodes. La valeur FAUX (0) renvoie l’intérêt couru à partir de la date du paiement du premier coupon. Si vous n’entrez pas d’argument, la valeur par défaut est VRAI.' },
        },
    },
    ACCRINTM: {
        description: 'Renvoie l’intérêt couru non échu d’un titre dont l’intérêt est perçu à l’échéance.',
        abstract: 'Renvoie l’intérêt couru non échu d’un titre dont l’intérêt est perçu à l’échéance.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/accrintm-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: 'Obligatoire. Représente la date d’émission du titre.' },
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date d’échéance du titre.' },
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux annuel du coupon du titre.' },
            par: { name: 'par', detail: 'Obligatoire. Représente la valeur nominale du titre. Si vous omettez la valeur nominale, INTERET.ACC.MAT utilise 1 000 €.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    AMORDEGRC: {
        description: 'Renvoie l’amortissement linéaire complet d’un bien à la fin d’une période fiscale donnée. Cette fonction est destinée à prendre en compte les règles comptables françaises. Si un bien est acquis en cours de période comptable, la règle du prorata temporis s’applique au calcul de l’amortissement. Cette fonction est similaire à la fonction AMORLINC, à ceci près qu’un coefficient d’amortissement est pris en compte dans le calcul, en fonction de la durée de vie du bien.',
        abstract: 'Renvoie l’amortissement linéaire complet d’un bien à la fin d’une période fiscale donnée. Cette fonction est destinée à prendre en compte les règles comptables françaises. Si un bien est acquis en cours de période comptable, la règle du prorata temporis s’applique au calcul de l’amortissement. Cette fonction est similaire à la fonction AMORLINC, à ceci près qu’un coefficient d’amortissement est pris en compte dans le calcul, en fonction de la durée de vie du bien.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/amordegrc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obligatoire. Représente le coût d’acquisition du bien.' },
            datePurchased: { name: 'date_purchased', detail: 'Obligatoire. Représente la date d’acquisition du bien.' },
            firstPeriod: { name: 'first_period', detail: 'Obligatoire. Représente la date de la fin de la première période.' },
            salvage: { name: 'salvage', detail: 'Obligatoire. Représente la valeur du bien au terme de la durée d’amortissement, ou valeur résiduelle.' },
            period: { name: 'period', detail: 'Obligatoire. Représente la période.' },
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’amortissement.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente la base annuelle à utiliser.' },
        },
    },
    AMORLINC: {
        description: 'Renvoie l’amortissement linéaire complet d’un bien à la fin d’une période fiscale donnée. Cette fonction est destinée à prendre en compte les règles comptables françaises. Si une immobilisation est acquise en cours de période comptable, la règle du prorata temporis s’applique au calcul de l’amortissement.',
        abstract: 'Renvoie l’amortissement linéaire complet d’un bien à la fin d’une période fiscale donnée. Cette fonction est destinée à prendre en compte les règles comptables françaises. Si une immobilisation est acquise en cours de période comptable, la règle du prorata temporis s’applique au calcul de l’amortissement.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/amorlinc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obligatoire. Représente le coût d’acquisition du bien.' },
            datePurchased: { name: 'date_purchased', detail: 'Obligatoire. Représente la date d’acquisition du bien.' },
            firstPeriod: { name: 'first_period', detail: 'Obligatoire. Représente la date de la fin de la première période.' },
            salvage: { name: 'salvage', detail: 'Obligatoire. Représente la valeur du bien au terme de la durée d’amortissement, ou valeur résiduelle.' },
            period: { name: 'period', detail: 'Obligatoire. Représente la période.' },
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’amortissement.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente la base annuelle à utiliser.' },
        },
    },
    COUPDAYBS: {
        description: 'La fonction NB.JOURS.COUPON.PREC renvoie le nombre de jours entre le début de la période d’un coupon et sa date de liquidation.',
        abstract: 'La fonction NB.JOURS.COUPON.PREC renvoie le nombre de jours entre le début de la période d’un coupon et sa date de liquidation.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/coupdaybs-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    COUPDAYS: {
        description: 'Affiche le nombre de jours pour la période du coupon contenant la date de liquidation.',
        abstract: 'Affiche le nombre de jours pour la période du coupon contenant la date de liquidation.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/coupdays-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    COUPDAYSNC: {
        description: 'Calcule le nombre de jours entre la date de liquidation et la date du coupon suivant la date de liquidation.',
        abstract: 'Calcule le nombre de jours entre la date de liquidation et la date du coupon suivant la date de liquidation.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/coupdaysnc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    COUPNCD: {
        description: 'Renvoie un nombre qui représente la date du coupon suivant la date de liquidation.',
        abstract: 'Renvoie un nombre qui représente la date du coupon suivant la date de liquidation.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/coupncd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    COUPNUM: {
        description: 'Renvoie le nombre de coupons dus entre la date de liquidation et la date d’échéance, arrondi au nombre entier de coupons le plus proche.',
        abstract: 'Renvoie le nombre de coupons dus entre la date de liquidation et la date d’échéance, arrondi au nombre entier de coupons le plus proche.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/coupnum-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    COUPPCD: {
        description: 'Renvoie un nombre qui représente la date du coupon précédant la date de liquidation.',
        abstract: 'Renvoie un nombre qui représente la date du coupon précédant la date de liquidation.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/couppcd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    CUMIPMT: {
        description: 'Cette fonction renvoie l’intérêt cumulé payé sur un emprunt entre l’argument période_début et l’argument période_fin.',
        abstract: 'Cette fonction renvoie l’intérêt cumulé payé sur un emprunt entre l’argument période_début et l’argument période_fin.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cumipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt.' },
            nper: { name: 'nper', detail: 'Obligatoire. Représente le nombre total de périodes de remboursement.' },
            pv: { name: 'pv', detail: 'Obligatoire. Représente la valeur actuelle.' },
            startPeriod: { name: 'start_period', detail: 'Obligatoire. Représente la première période incluse dans le calcul. Les périodes de remboursement sont numérotées à partir de 1.' },
            endPeriod: { name: 'end_period', detail: 'Obligatoire. Représente la dernière période incluse dans le calcul.' },
            type: { name: 'type', detail: 'Obligatoire. Correspond à l’échéance des remboursements.' },
        },
    },
    CUMPRINC: {
        description: 'Renvoie le principal cumulé payé sur un emprunt entre deux périodes.',
        abstract: 'Renvoie le principal cumulé payé sur un emprunt entre deux périodes.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/cumprinc-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt.' },
            nper: { name: 'nper', detail: 'Obligatoire. Représente le nombre total de périodes de remboursement.' },
            pv: { name: 'pv', detail: 'Obligatoire. Représente la valeur actuelle.' },
            startPeriod: { name: 'start_period', detail: 'Obligatoire. Représente la première période incluse dans le calcul. Les périodes de remboursement sont numérotées à partir de 1.' },
            endPeriod: { name: 'end_period', detail: 'Obligatoire. Représente la dernière période incluse dans le calcul.' },
            type: { name: 'type', detail: 'Obligatoire. Correspond à l’échéance des remboursements.' },
        },
    },
    DB: {
        description: 'Renvoie l’amortissement d’un bien pour une période donnée selon la méthode de l’amortissement dégressif à taux fixe.',
        abstract: 'Renvoie l’amortissement d’un bien pour une période donnée selon la méthode de l’amortissement dégressif à taux fixe.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/db-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obligatoire. Représente le coût initial du bien.' },
            salvage: { name: 'salvage', detail: 'Obligatoire. Représente la valeur du bien au terme de l’amortissement, aussi appelée valeur résiduelle du bien.' },
            life: { name: 'life', detail: 'Obligatoire. Représente le nombre de périodes pendant lesquelles le bien est amorti, aussi appelée durée de vie utile du bien.' },
            period: { name: 'period', detail: 'Obligatoire. Représente la période pour laquelle vous voulez calculer un amortissement. La période doit être exprimée dans la même unité que la durée.' },
            month: { name: 'month', detail: 'Optionnel. Représente le nombre de mois de la première année. Si l’argument mois est omis, sa valeur par défaut est 12.' },
        },
    },
    DDB: {
        description: 'Renvoie l’amortissement d’un bien pour une période donnée selon la méthode de l’amortissement dégressif double ou une autre méthode indiquée.',
        abstract: 'Renvoie l’amortissement d’un bien pour une période donnée selon la méthode de l’amortissement dégressif double ou une autre méthode indiquée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ddb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obligatoire. Représente le coût initial du bien.' },
            salvage: { name: 'salvage', detail: 'Obligatoire. Représente la valeur du bien au terme de l’amortissement, aussi appelée valeur résiduelle du bien. Cette valeur peut être 0.' },
            life: { name: 'life', detail: 'Obligatoire. Représente le nombre de périodes pendant lesquelles le bien est amorti, aussi appelée durée de vie utile du bien.' },
            period: { name: 'period', detail: 'Obligatoire. Représente la période pour laquelle vous voulez calculer un amortissement. La période doit être exprimée dans la même unité que la durée.' },
            factor: { name: 'factor', detail: 'Optionnel. Représente le taux de l’amortissement dégressif. Si facteur est omis, la valeur par défaut est 2, méthode de l’amortissement dégressif à taux double.' },
        },
    },
    DISC: {
        description: 'Renvoie le taux d’escompte d’un titre.',
        abstract: 'Renvoie le taux d’escompte d’un titre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/disc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'La date de règlement du titre.' },
            maturity: { name: 'maturity', detail: 'La date d’échéance du titre.' },
            pr: { name: 'pr', detail: 'Le prix du titre pour une valeur nominale de 100 $.' },
            redemption: { name: 'redemption', detail: 'La valeur de remboursement du titre pour une valeur nominale de 100 $.' },
            basis: { name: 'basis', detail: 'Le type de base de décompte des jours à utiliser.' },
        },
    },
    DOLLARDE: {
        description: 'Convertit un prix en dollars exprimé sous forme de fraction en prix en dollars exprimé sous forme décimale.',
        abstract: 'Convertit un prix en dollars exprimé sous forme de fraction en prix en dollars exprimé sous forme décimale.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dollarde-function',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: 'fractional_dollar', detail: 'Obligatoire. Représente un nombre exprimé sous la forme de parties entière et fractionnaire, séparées par un symbole décimal.' },
            fraction: { name: 'fraction', detail: 'Obligatoire. Représente le nombre entier à utiliser comme dénominateur de la fraction.' },
        },
    },
    DOLLARFR: {
        description: 'Convertit un prix en dollars exprimé sous forme décimale en prix en dollars exprimé sous forme de fraction.',
        abstract: 'Convertit un prix en dollars exprimé sous forme décimale en prix en dollars exprimé sous forme de fraction.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/dollarfr-function',
            },
        ],
        functionParameter: {
            decimalDollar: { name: 'decimal_dollar', detail: 'Obligatoire. Nombre décimal.' },
            fraction: { name: 'fraction', detail: 'Obligatoire. Représente le nombre entier à utiliser comme dénominateur de la fraction.' },
        },
    },
    DURATION: {
        description: 'La fonction DURATION , l’une des fonctions Financières , retourne la durée de Macauley pour une valeur nominale supposée de 100 $. La durée est définie comme la moyenne pondérée de la valeur actuelle des flux de trésorerie et est utilisée comme mesure de la réponse du prix d’une obligation à l’évolution du rendement.',
        abstract: 'La fonction DURATION , l’une des fonctions Financières , retourne la durée de Macauley pour une valeur nominale supposée de 100 $. La durée est définie comme la moyenne pondérée de la valeur actuelle des flux de trésorerie et est utilisée comme mesure de la réponse du prix d’une obligation à l’évolution du rendement.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/duration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            coupon: { name: 'coupon', detail: 'Obligatoire. Représente le taux annuel du coupon du titre.' },
            yld: { name: 'yld', detail: 'Obligatoire. Représente le taux de rendement annuel du titre.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    EFFECT: {
        description: 'Returns the effective annual interest rate',
        abstract: 'Returns the effective annual interest rate',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominal_rate', detail: 'The nominal interest rate.' },
            npery: { name: 'npery', detail: 'The number of compounding periods per year.' },
        },
    },
    FV: {
        description: 'VC , l’une des fonctions Financier , calcule valeur capitalisée d’un investissement sur la base d’un taux d’intérêt constant. Vous pouvez utiliser la fonction VC pour calculer des paiements périodiques, constants, ou un montant forfaitaire unique.',
        abstract: 'VC , l’une des fonctions Financier , calcule valeur capitalisée d’un investissement sur la base d’un taux d’intérêt constant. Vous pouvez utiliser la fonction VC pour calculer des paiements périodiques, constants, ou un montant forfaitaire unique.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt par période.' },
            nper: { name: 'nper', detail: 'Obligatoire. Représente le nombre total de périodes de remboursement au cours de l’opération.' },
            pmt: { name: 'pmt', detail: 'Obligatoire. Représente le montant d’un versement périodique ; celui-ci reste constant pendant toute la durée de l’opération. En règle générale, vpm comprend le principal et les intérêts, mais aucune autre charge, ni impôt. Si pmt est omis, vous devez inclure l’argument pv.' },
            pv: { name: 'pv', detail: 'Optionnel. Représente la valeur actuelle ou la somme forfaitaire représentant aujourd’hui une série de remboursements futurs. Si l’argument va n’est pas spécifié, la valeur prise en compte par défaut est 0 (zéro), et vous devez inclure l’argument vpm.' },
            type: { name: 'type', detail: 'Optionnel. Peut prendre les valeurs 0 ou 1, et indique l’échéance des paiements. Si vous ne spécifiez pas l’argument type, sa valeur par défaut est 0.' },
        },
    },
    FVSCHEDULE: {
        description: 'Calcule la valeur capitalisée d’un investissement en appliquant une série de taux d’intérêt composites. Utilisez la fonction VC.PAIEMENTS pour calculer la valeur capitalisée d’un investissement à taux variable ou révisable.',
        abstract: 'Calcule la valeur capitalisée d’un investissement en appliquant une série de taux d’intérêt composites. Utilisez la fonction VC.PAIEMENTS pour calculer la valeur capitalisée d’un investissement à taux variable ou révisable.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: 'principal', detail: 'Obligatoire. Représente la valeur actuelle.' },
            schedule: { name: 'schedule', detail: 'Obligatoire. Représente la matrice des taux d’intérêt à appliquer.' },
        },
    },
    INTRATE: {
        description: 'Affiche le taux d’intérêt d’un titre totalement investi.',
        abstract: 'Affiche le taux d’intérêt d’un titre totalement investi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            investment: { name: 'investment', detail: 'Obligatoire. Représente le montant investi dans le titre.' },
            redemption: { name: 'redemption', detail: 'Obligatoire. Représente le montant à percevoir à l’échéance.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    IPMT: {
        description: 'Renvoie, pour une période donnée, le montant des intérêts dus pour un emprunt remboursé par des versements périodiques constants, avec un taux d’intérêt constant.',
        abstract: 'Renvoie, pour une période donnée, le montant des intérêts dus pour un emprunt remboursé par des versements périodiques constants, avec un taux d’intérêt constant.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt par période.' },
            per: { name: 'per', detail: 'Obligatoire. Période pour laquelle vous souhaitez trouver l’intérêt et doit être comprise entre 1 et nper.' },
            nper: { name: 'nper', detail: 'Obligatoire. Représente le nombre total de périodes de remboursement au cours de l’opération.' },
            pv: { name: 'pv', detail: 'Obligatoire. Représente la valeur actuelle ou la somme forfaitaire représentant aujourd’hui une série de remboursements futurs.' },
            fv: { name: 'fv', detail: 'Optionnel. Représente la valeur capitalisée, c’est-à-dire le montant que vous souhaitez obtenir après le dernier paiement. Si vc est omis, la valeur par défaut est 0 (par exemple, la valeur capitalisée d’un emprunt est égale à 0).' },
            type: { name: 'type', detail: 'Optionnel. Peut prendre les valeurs 0 ou 1, et indique l’échéance des paiements. Si vous ne spécifiez pas l’argument type, sa valeur par défaut est 0.' },
        },
    },
    IRR: {
        description: 'Retourne le taux de rendement interne d’une série de flux de trésorerie représentés par les nombres en valeurs. Ces flux de trésorerie n’ont pas besoin d’être pairs, comme ils le seraient pour une annuité. Toutefois, les flux de trésorerie doivent se produire à intervalles réguliers, par exemple mensuellement ou annuellement. Le taux de rendement interne est le taux d’intérêt reçu pour un investissement composé de paiements (valeurs négatives) et de revenus (valeurs positives) qui se produisent à des périodes régulières.',
        abstract: 'Retourne le taux de rendement interne d’une série de flux de trésorerie représentés par les nombres en valeurs. Ces flux de trésorerie n’ont pas besoin d’être pairs, comme ils le seraient pour une annuité. Toutefois, les flux de trésorerie doivent se produire à intervalles réguliers, par exemple mensuellement ou annuellement. Le taux de rendement interne est le taux d’intérêt reçu pour un investissement composé de paiements (valeurs négatives) et de revenus (valeurs positives) qui se produisent à des périodes régulières.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Matrice ou référence à des cellules contenant les nombres pour lesquels vous souhaitez calculer le taux de rentabilité interne.\n1. values doit contenir au moins une valeur positive et une valeur négative.\n2. IRR utilise l’ordre des valeurs pour interpréter l’ordre des flux de trésorerie. Saisissez les paiements et recettes dans l’ordre souhaité.\n3. Si une matrice ou une référence contient du texte, des valeurs logiques ou des cellules vides, ces valeurs sont ignorées.' },
            guess: { name: 'guess', detail: 'Nombre que vous estimez proche du résultat de IRR.' },
        },
    },
    ISPMT: {
        description: 'Calcule les intérêts payés (ou reçus) pour la période spécifiée d’un prêt (ou d’un investissement) avec des paiements de capital pairs.',
        abstract: 'Calcule les intérêts payés (ou reçus) pour la période spécifiée d’un prêt (ou d’un investissement) avec des paiements de capital pairs.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt de l’investissement.' },
            per: { name: 'per', detail: 'Obligatoire. Période pour laquelle vous souhaitez trouver l’intérêt, et doit être comprise entre 1 et Nper.' },
            nper: { name: 'nper', detail: 'Obligatoire. Représente le nombre total de périodes de remboursement pour l’investissement.' },
            pv: { name: 'pv', detail: 'Obligatoire. Représente la valeur actuelle d’un investissement. Pour un prêt, Pv est le montant du prêt.' },
        },
    },
    MDURATION: {
        description: 'Renvoie la durée de Macauley modifiée pour un titre ayant une valeur nominale hypothétique de 100 €.',
        abstract: 'Renvoie la durée de Macauley modifiée pour un titre ayant une valeur nominale hypothétique de 100 €.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/mduration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            coupon: { name: 'coupon', detail: 'Obligatoire. Représente le taux annuel du coupon du titre.' },
            yld: { name: 'yld', detail: 'Obligatoire. Représente le taux de rendement annuel du titre.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    MIRR: {
        description: 'Renvoie le taux interne de rentabilité modifié, pour une série de flux financiers périodiques. TRIM prend en compte le coût de l’investissement et l’intérêt perçu sur le placement des liquidités.',
        abstract: 'Renvoie le taux interne de rentabilité modifié, pour une série de flux financiers périodiques. TRIM prend en compte le coût de l’investissement et l’intérêt perçu sur le placement des liquidités.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/mirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Obligatoire. Représente une matrice ou une référence à des cellules contenant des nombres. Ces nombres correspondent à une série de décaissements (valeurs négatives) et d’encaissements (valeurs positives) périodiques. Les valeurs doivent contenir au moins une valeur positive et une valeur négative pour calculer le taux de retour interne modifié. Sinon, la fonction MIRR renvoie le #DIV/0 ! #VALEUR!. Si une matrice ou une référence utilisée comme argument contient du texte, des valeurs logiques ou des cellules vides, ces valeurs ne sont pas prises en compte. En revanche, les cellules contenant la valeur 0 sont prises en compte.' },
            financeRate: { name: 'finance_rate', detail: 'Obligatoire. Représente le taux d’intérêt payé pour le financement de la trésorerie.' },
            reinvestRate: { name: 'reinvest_rate', detail: 'Obligatoire. Représente le taux d’intérêt perçu sur le placement de la trésorerie excédentaire.' },
        },
    },
    NOMINAL: {
        description: 'Cette fonction renvoie le taux d’intérêt nominal annuel calculé à partir du taux effectif et du nombre de périodes par an pour le calcul des intérêts composés.',
        abstract: 'Cette fonction renvoie le taux d’intérêt nominal annuel calculé à partir du taux effectif et du nombre de périodes par an pour le calcul des intérêts composés.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/nominal-function',
            },
        ],
        functionParameter: {
            effectRate: { name: 'effect_rate', detail: 'Obligatoire. Représente le taux d’intérêt effectif.' },
            npery: { name: 'npery', detail: 'Obligatoire. Représente le nombre de périodes par an pour le calcul des intérêts composés.' },
        },
    },
    NPER: {
        description: 'Renvoie le nombre de versements nécessaires pour rembourser un emprunt à taux d’intérêt constant, sachant que ces versements doivent être constants et périodiques.',
        abstract: 'Renvoie le nombre de versements nécessaires pour rembourser un emprunt à taux d’intérêt constant, sachant que ces versements doivent être constants et périodiques.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/nper-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt par période.' },
            pmt: { name: 'pmt', detail: 'Obligatoire. Représente le montant d’un versement périodique ; celui-ci reste constant pendant toute la durée de l’opération. En règle générale, vpm comprend le principal et les intérêts, mais aucune autre charge, ni impôt.' },
            pv: { name: 'pv', detail: 'Obligatoire. Représente la valeur actuelle ou la somme forfaitaire représentant aujourd’hui une série de remboursements futurs.' },
            fv: { name: 'fv', detail: 'Optionnel. Représente la valeur capitalisée, c’est-à-dire le montant que vous souhaitez obtenir après le dernier paiement. Si vc est omis, la valeur par défaut est 0 (par exemple, la valeur capitalisée d’un emprunt est égale à 0).' },
            type: { name: 'type', detail: 'Optionnel. Représente le nombre 0 ou 1, et indique quand les paiements doivent être effectués.' },
        },
    },
    NPV: {
        description: 'Calcule la valeur actuelle nette d’un investissement en utilisant un taux d’escompte ainsi qu’une série de décaissements (valeurs négatives) et d’encaissements (valeurs positives) futurs.',
        abstract: 'Calcule la valeur actuelle nette d’un investissement en utilisant un taux d’escompte ainsi qu’une série de décaissements (valeurs négatives) et d’encaissements (valeurs positives) futurs.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/npv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’actualisation pour une période.' },
            value1: { name: 'value1', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Elles représentent 1 à 254 arguments représentant les encaissements et les décaissements. valeur1, valeur2,... doivent intervenir à intervalles réguliers et à la fin de chaque période. VAN utilise l’ordre de valeur1, valeur2,... pour interpréter celui des flux financiers. Il convient donc de veiller à entrer les décaissements et encaissements dans le bon ordre. Les arguments représentant des cellules vides, des valeurs logiques ou des nombres représentés sous forme de texte, des valeurs d’erreur ou du texte ne pouvant pas être converti en nombre ne sont pas pris en compte. Si un argument est une matrice ou une référence, seuls les nombres contenus dans cette matrice ou cette référence sont pris en compte. Les cellules vides, les valeurs logiques, le texte ou les valeurs d’erreur figurant dans la matrice ou la référence ne sont pas pris en compte.' },
            value2: { name: 'value2', detail: 'Value1 est obligatoire, les valeurs suivantes sont facultatives. Elles représentent 1 à 254 arguments représentant les encaissements et les décaissements. valeur1, valeur2,... doivent intervenir à intervalles réguliers et à la fin de chaque période. VAN utilise l’ordre de valeur1, valeur2,... pour interpréter celui des flux financiers. Il convient donc de veiller à entrer les décaissements et encaissements dans le bon ordre. Les arguments représentant des cellules vides, des valeurs logiques ou des nombres représentés sous forme de texte, des valeurs d’erreur ou du texte ne pouvant pas être converti en nombre ne sont pas pris en compte. Si un argument est une matrice ou une référence, seuls les nombres contenus dans cette matrice ou cette référence sont pris en compte. Les cellules vides, les valeurs logiques, le texte ou les valeurs d’erreur figurant dans la matrice ou la référence ne sont pas pris en compte.' },
        },
    },
    ODDFPRICE: {
        description: 'Cette fonction renvoie le prix par tranche de valeur nominale de 100 € d’un titre dont la première période est irrégulière (courte ou longue).',
        abstract: 'Cette fonction renvoie le prix par tranche de valeur nominale de 100 € d’un titre dont la première période est irrégulière (courte ou longue).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/oddfprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            issue: { name: 'issue', detail: 'Obligatoire. Représente la date d’émission du titre.' },
            firstCoupon: { name: 'first_coupon', detail: 'Obligatoire. Représente la date du premier coupon du titre.' },
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt du titre.' },
            yld: { name: 'yld', detail: 'Obligatoire. Représente le taux de rendement annuel du titre.' },
            redemption: { name: 'redemption', detail: 'Obligatoire. Représente la valeur de remboursement du titre par tranche de valeur nominale de 100 €.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    ODDFYIELD: {
        description: 'Cette fonction calcule le rendement d’un titre dont la première période de coupon est irrégulière (courte ou longue).',
        abstract: 'Cette fonction calcule le rendement d’un titre dont la première période de coupon est irrégulière (courte ou longue).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/oddfyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            issue: { name: 'issue', detail: 'Obligatoire. Représente la date d’émission du titre.' },
            firstCoupon: { name: 'first_coupon', detail: 'Obligatoire. Représente la date du premier coupon du titre.' },
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt du titre.' },
            pr: { name: 'pr', detail: 'Obligatoire. Représente le prix du titre.' },
            redemption: { name: 'redemption', detail: 'Obligatoire. Représente la valeur de remboursement du titre par tranche de valeur nominale de 100 €.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    ODDLPRICE: {
        description: 'Cette fonction renvoie le prix par tranche de valeur nominale de 100 € d’un titre dont la dernière période de coupon est irrégulière (courte ou longue).',
        abstract: 'Cette fonction renvoie le prix par tranche de valeur nominale de 100 € d’un titre dont la dernière période de coupon est irrégulière (courte ou longue).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/oddlprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            lastInterest: { name: 'last_interest', detail: 'Obligatoire. Représente la date du dernier paiement d’intérêt du titre.' },
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt du titre.' },
            yld: { name: 'yld', detail: 'Obligatoire. Représente le taux de rendement annuel du titre.' },
            redemption: { name: 'redemption', detail: 'Obligatoire. Représente la valeur de remboursement du titre par tranche de valeur nominale de 100 €.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    ODDLYIELD: {
        description: 'Cette fonction calcule le rendement d’un titre dont la dernière période de coupon est irrégulière (courte ou longue).',
        abstract: 'Cette fonction calcule le rendement d’un titre dont la dernière période de coupon est irrégulière (courte ou longue).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/oddlyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            lastInterest: { name: 'last_interest', detail: 'Obligatoire. Représente la date du dernier paiement d’intérêt du titre.' },
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt du titre.' },
            pr: { name: 'pr', detail: 'Obligatoire. Représente le prix du titre.' },
            redemption: { name: 'redemption', detail: 'Obligatoire. Représente la valeur de remboursement du titre par tranche de valeur nominale de 100 €.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    PDURATION: {
        description: 'Renvoie le nombre de périodes requises pour qu’un investissement atteigne une valeur spécifiée.',
        abstract: 'Renvoie le nombre de périodes requises pour qu’un investissement atteigne une valeur spécifiée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/pduration-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obligatoire. Taux est le taux d’intérêt par période.' },
            pv: { name: 'pv', detail: 'Obligatoire. Va représente la valeur actuelle de l’investissement.' },
            fv: { name: 'fv', detail: 'Obligatoire. Vc est la valeur future souhaitée de l’investissement.' },
        },
    },
    PMT: {
        description: 'VPM , l’une des fonctions financières , calcule le remboursement d’un emprunt sur la base de remboursements et d’un taux d’intérêt constants.',
        abstract: 'VPM , l’une des fonctions financières , calcule le remboursement d’un emprunt sur la base de remboursements et d’un taux d’intérêt constants.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/pmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt de l’emprunt.' },
            nper: { name: 'nper', detail: 'Obligatoire. Représente le nombre de remboursements pour l’emprunt.' },
            pv: { name: 'pv', detail: 'Obligatoire. Représente la valeur actuelle ou la valeur que représente à la date d’aujourd’hui une série de remboursements futurs ; il s’agit du principal de l’emprunt.' },
            fv: { name: 'fv', detail: 'Optionnel. Représente la valeur capitalisée, c’est-à-dire le montant que vous souhaitez obtenir après le dernier paiement. Si vc est omis, la valeur par défaut est 0 (zéro), c’est-à-dire que la valeur capitalisée d’un emprunt est égale à 0.' },
            type: { name: 'type', detail: 'Optionnel. Représente le nombre 0 (zéro) ou 1 et indique quand les paiements doivent être effectués.' },
        },
    },
    PPMT: {
        description: 'Calcule, pour une période donnée, la part de remboursement du principal d’un investissement sur la base de remboursements périodiques et d’un taux d’intérêt constants.',
        abstract: 'Calcule, pour une période donnée, la part de remboursement du principal d’un investissement sur la base de remboursements périodiques et d’un taux d’intérêt constants.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/ppmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt par période.' },
            per: { name: 'per', detail: 'Obligatoire. Indique la période et doit être compris entre 1 et npm.' },
            nper: { name: 'nper', detail: 'Obligatoire. Représente le nombre total de périodes de remboursement au cours de l’opération.' },
            pv: { name: 'pv', detail: 'Obligatoire. Représente la valeur actuelle, c’est-à-dire la valeur que représente à la date d’aujourd’hui une série de remboursements futurs.' },
            fv: { name: 'fv', detail: 'Optionnel. Représente la valeur capitalisée, c’est-à-dire le montant que vous souhaitez obtenir après le dernier paiement. Si vc est omis, la valeur par défaut est 0 (zéro), c’est-à-dire que la valeur capitalisée d’un emprunt est égale à 0.' },
            type: { name: 'type', detail: 'Optionnel. Représente le nombre 0 ou 1, et indique quand les paiements doivent être effectués.' },
        },
    },
    PRICE: {
        description: 'Renvoie le prix d’un titre rapportant des intérêts périodiques, pour une valeur nominale de 100 €.',
        abstract: 'Renvoie le prix d’un titre rapportant des intérêts périodiques, pour une valeur nominale de 100 €.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/price-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux annuel du coupon du titre.' },
            yld: { name: 'yld', detail: 'Obligatoire. Représente le taux de rendement annuel du titre.' },
            redemption: { name: 'redemption', detail: 'Obligatoire. Représente la valeur de remboursement du titre par tranche de valeur nominale de 100 €.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    PRICEDISC: {
        description: 'Renvoie la valeur d’encaissement d’un escompte sur un titre, pour une valeur nominale de 100 €.',
        abstract: 'Renvoie la valeur d’encaissement d’un escompte sur un titre, pour une valeur nominale de 100 €.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/pricedisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            discount: { name: 'discount', detail: 'Obligatoire. Représente le taux d’escompte du titre.' },
            redemption: { name: 'redemption', detail: 'Obligatoire. Représente la valeur de remboursement du titre par tranche de valeur nominale de 100 €.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    PRICEMAT: {
        description: 'Renvoie le prix d’un titre dont la valeur nominale est 100 € et qui rapporte des intérêts à l’échéance.',
        abstract: 'Renvoie le prix d’un titre dont la valeur nominale est 100 € et qui rapporte des intérêts à l’échéance.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/pricemat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            issue: { name: 'issue', detail: 'Obligatoire. Représente la date d’émission du titre, exprimée sous la forme d’un numéro de série.' },
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt du titre à la date d’émission.' },
            yld: { name: 'yld', detail: 'Obligatoire. Représente le taux de rendement annuel du titre.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    PV: {
        description: 'VA , l’une des fonctions Financier , calcule la valeur actuelle d’un emprunt ou d’un investissement sur la base d’un taux d’intérêt constant. Vous pouvez utiliser la fonction VA pour calculer des paiements périodiques et constants (comme un crédit immobilier ou tout autre type de prêt) ou la valeur capitalisée de votre objectif d’investissement.',
        abstract: 'VA , l’une des fonctions Financier , calcule la valeur actuelle d’un emprunt ou d’un investissement sur la base d’un taux d’intérêt constant. Vous pouvez utiliser la fonction VA pour calculer des paiements périodiques et constants (comme un crédit immobilier ou tout autre type de prêt) ou la valeur capitalisée de votre objectif d’investissement.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/pv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt par période. Par exemple, si vous obtenez un emprunt pour l’achat d’une voiture à un taux d’intérêt annuel de 10 % et que vos remboursements sont mensuels, le taux d’intérêt mensuel sera de 10 %/12, soit 0,83 %. Le chiffre entré dans la formule en tant que taux peut être 10 %/12, 0,83 % ou 0,0083.' },
            nper: { name: 'nper', detail: 'Obligatoire. Représente le nombre total de périodes de paiement au cours de l’opération. Si, pour l’achat d’une voiture, vous obtenez un emprunt sur quatre ans, remboursable mensuellement, cet emprunt s’étend sur 4*12 (ou 48) périodes. Le chiffre entré dans la formule en tant qu’argument npm sera 48.' },
            pmt: { name: 'pmt', detail: 'Obligatoire. Représente le montant du paiement pour chaque période et reste constant pendant toute la durée de l’opération. En règle générale, vpm comprend le montant principal et les intérêts mais exclut toute autre charge ou tout autre impôt. Par exemple, les paiements mensuels sur un prêt auto de 10 000 $ et de quatre ans à 12 % sont de 263,33 $. Vous devez entrer -263,33 dans la formule en tant que pmt. Si pmt est omis, vous devez inclure l’argument fv.' },
            fv: { name: 'fv', detail: 'Optionnel. La valeur future ou le solde en espèces que vous souhaitez atteindre après le dernier paiement. Si vc est omis, la valeur par défaut est 0 (par exemple, la valeur capitalisée d’un emprunt est égale à 0). Ainsi, si vous souhaitez économiser 50 000 € pour financer un projet précis dans 18 ans, 50 000 € est la valeur capitalisée à atteindre. Vous pouvez faire une estimation du taux d’intérêt et déterminer le montant que vous devez épargner chaque mois. Si l’argument vc est omis, vous devez inclure l’argument vpm.' },
            type: { name: 'type', detail: 'Optionnel. Représente le nombre 0 ou 1, et indique quand les paiements doivent être effectués.' },
        },
    },
    RATE: {
        description: 'Calcule le taux d’intérêt par période d’un investissement donné. La fonction TAUX est calculée par itération et peut n’avoir aucune solution ou en avoir plusieurs. La fonction renvoie la valeur d’erreur #NOMBRE! si, après 20 itérations, les résultats ne convergent pas à 0,0000001 près.',
        abstract: 'Calcule le taux d’intérêt par période d’un investissement donné. La fonction TAUX est calculée par itération et peut n’avoir aucune solution ou en avoir plusieurs. La fonction renvoie la valeur d’erreur #NOMBRE! si, après 20 itérations, les résultats ne convergent pas à 0,0000001 près.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/rate-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Obligatoire. Représente le nombre total de périodes de remboursement au cours de l’opération.' },
            pmt: { name: 'pmt', detail: 'Obligatoire. Représente le montant du paiement pour chaque période et reste constant pendant toute la durée de l’opération. En règle générale, vpm comprend le montant principal et les intérêts mais exclut toute autre charge ou tout autre impôt. Si l’argument vpm est omis, vous devez inclure l’argument vc.' },
            pv: { name: 'pv', detail: 'Obligatoire. Représente la valeur actuelle, c’est-à-dire la valeur que représente à la date d’aujourd’hui une série de remboursements futurs.' },
            fv: { name: 'fv', detail: 'Optionnel. Représente la valeur capitalisée, c’est-à-dire le montant que vous souhaitez obtenir après le dernier paiement. Si vc est omis, la valeur par défaut est 0 (par exemple, la valeur capitalisée d’un emprunt est égale à 0). Si l’argument vc est omis, vous devez inclure l’argument vpm.' },
            type: { name: 'type', detail: 'Optionnel. Représente le nombre 0 ou 1, et indique quand les paiements doivent être effectués.' },
            guess: { name: 'guess', detail: 'Optionnel. Représente votre estimation quant à la valeur du taux. Si l’argument estimation est omis, la valeur par défaut est 10 %. Si les résultats de la fonction TAUX ne convergent pas, essayez différentes valeurs pour l’argument estimation. Normalement, les résultats de TAUX convergent si l’argument estimation est compris entre 0 et 1.' },
        },
    },
    RECEIVED: {
        description: 'Renvoie le montant perçu à l’échéance pour un titre entièrement investi.',
        abstract: 'Renvoie le montant perçu à l’échéance pour un titre entièrement investi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/received-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            investment: { name: 'investment', detail: 'Obligatoire. Représente le montant investi dans le titre.' },
            discount: { name: 'discount', detail: 'Obligatoire. Représente le taux d’escompte du titre.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    RRI: {
        description: 'Renvoie un taux d’intérêt équivalent pour la croissance d’un investissement.',
        abstract: 'Renvoie un taux d’intérêt équivalent pour la croissance d’un investissement.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/rri-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Obligatoire. Npm est le nombre de périodes pour l’investissement.' },
            pv: { name: 'pv', detail: 'Obligatoire. Va représente la valeur actuelle de l’investissement.' },
            fv: { name: 'fv', detail: 'Obligatoire. Vf est la valeur future de l’investissement.' },
        },
    },
    SLN: {
        description: 'Calcule l’amortissement linéaire d’un bien pour une période donnée.',
        abstract: 'Calcule l’amortissement linéaire d’un bien pour une période donnée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/sln-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obligatoire. Représente le coût initial du bien.' },
            salvage: { name: 'salvage', detail: 'Obligatoire. Représente la valeur du bien au terme de l’amortissement (aussi appelée valeur résiduelle du bien).' },
            life: { name: 'life', detail: 'Obligatoire. Représente le nombre de périodes pendant lesquelles le bien est amorti (aussi appelée durée de vie utile du bien).' },
        },
    },
    SYD: {
        description: 'Calcule l’amortissement d’un bien pour une période donnée sur la base de la méthode américaine Sum-of-Years Digits (amortissement dégressif à taux décroissant appliqué à une valeur constante).',
        abstract: 'Calcule l’amortissement d’un bien pour une période donnée sur la base de la méthode américaine Sum-of-Years Digits (amortissement dégressif à taux décroissant appliqué à une valeur constante).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/syd-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obligatoire. Représente le coût initial du bien.' },
            salvage: { name: 'salvage', detail: 'Obligatoire. Représente la valeur du bien au terme de l’amortissement (aussi appelée valeur résiduelle du bien).' },
            life: { name: 'life', detail: 'Obligatoire. Représente le nombre de périodes pendant lesquelles le bien est amorti (aussi appelée durée de vie utile du bien).' },
            per: { name: 'per', detail: 'Obligatoire. Représente la période et doit être exprimée dans la même unité que la durée.' },
        },
    },
    TBILLEQ: {
        description: 'Renvoie le taux d’escompte rationnel d’un bon du Trésor.',
        abstract: 'Renvoie le taux d’escompte rationnel d’un bon du Trésor.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/tbilleq-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du bon du Trésor. Cette date correspond à la date suivant la date d’émission, lorsque le bon du Trésor est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du bon du Trésor. Cette date correspond à la date d’expiration du bon du Trésor.' },
            discount: { name: 'discount', detail: 'Obligatoire. Représente le taux d’escompte du bon du Trésor.' },
        },
    },
    TBILLPRICE: {
        description: 'Renvoie le prix d’un bon du Trésor d’une valeur nominale de 100 €.',
        abstract: 'Renvoie le prix d’un bon du Trésor d’une valeur nominale de 100 €.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/tbillprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du bon du Trésor. Cette date correspond à la date suivant la date d’émission, lorsque le bon du Trésor est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du bon du Trésor. Cette date correspond à la date d’expiration du bon du Trésor.' },
            discount: { name: 'discount', detail: 'Obligatoire. Représente le taux d’escompte du bon du Trésor.' },
        },
    },
    TBILLYIELD: {
        description: 'Calcule le taux de rendement d’un bon du Trésor.',
        abstract: 'Calcule le taux de rendement d’un bon du Trésor.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/tbillyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du bon du Trésor. Cette date correspond à la date suivant la date d’émission, lorsque le bon du Trésor est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du bon du Trésor. Cette date correspond à la date d’expiration du bon du Trésor.' },
            pr: { name: 'pr', detail: 'Obligatoire. Représente le prix du bon du Trésor par tranche de valeur nominale de 100 €.' },
        },
    },
    VDB: {
        description: 'Calcule l’amortissement d’un bien pour toute période spécifiée, y compris une période partielle, en utilisant la méthode de l’amortissement dégressif à taux double ou selon un coefficient à spécifier. VDB signifie « variable declining balance », qui est l’équivalent d’amortissement dégressif à taux variable.',
        abstract: 'Calcule l’amortissement d’un bien pour toute période spécifiée, y compris une période partielle, en utilisant la méthode de l’amortissement dégressif à taux double ou selon un coefficient à spécifier. VDB signifie « variable declining balance », qui est l’équivalent d’amortissement dégressif à taux variable.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/vdb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obligatoire. Représente le coût initial du bien.' },
            salvage: { name: 'salvage', detail: 'Obligatoire. Représente la valeur du bien au terme de l’amortissement (aussi appelée valeur résiduelle du bien). Cette valeur peut être 0.' },
            life: { name: 'life', detail: 'Obligatoire. Représente le nombre de périodes pendant lesquelles le bien est amorti (aussi appelée durée de vie utile du bien).' },
            startPeriod: { name: 'start_period', detail: 'Obligatoire. Représente le début de la période pour laquelle vous voulez calculer un amortissement. L’argument période_début doit être exprimé dans la même unité que durée.' },
            endPeriod: { name: 'end_period', detail: 'Obligatoire. Représente la fin de la période pour laquelle vous voulez calculer un amortissement. L’argument période_fin doit être exprimé dans la même unité que l’argument durée.' },
            factor: { name: 'factor', detail: 'Optionnel. Représente le taux de l’amortissement dégressif. Si facteur est omis, la valeur par défaut est 2 (méthode de l’amortissement dégressif à taux double). Modifiez la valeur de facteur si vous ne souhaitez pas utiliser la méthode de l’amortissement dégressif à taux double. Pour plus d’informations sur cette méthode, reportez-vous à la fonction DDB.' },
            noSwitch: { name: 'no_switch', detail: 'Optionnel. Représente une valeur logique indiquant s’il faut utiliser la méthode de l’amortissement linéaire lorsqu’elle donne un résultat supérieur à celui obtenu avec la méthode de l’amortissement dégressif. Si valeur_log est VRAI, Microsoft Excel n’applique pas la méthode de l’amortissement linéaire, même si cette méthode donne un résultat supérieur à celui qui serait obtenu avec la méthode de l’amortissement dégressif. Si l’argument valeur_log est FAUX ou omis, Microsoft Excel applique la méthode de l’amortissement linéaire lorsque cette méthode donne un résultat supérieur à celui qui serait obtenu avec la méthode de l’amortissement dégressif.' },
        },
    },
    XIRR: {
        description: 'Calcule le taux de rentabilité interne d’un ensemble de paiements. Pour calculer le taux de rentabilité interne d’un ensemble de paiements périodiques, utilisez la fonction TRI.',
        abstract: 'Calcule le taux de rentabilité interne d’un ensemble de paiements. Pour calculer le taux de rentabilité interne d’un ensemble de paiements périodiques, utilisez la fonction TRI.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/xirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Obligatoire. Représente une série de flux nets de trésorerie correspondant à l’échéancier de paiement déterminé par l’argument date. Le premier paiement, facultatif, représente le coût ou le versement éventuellement effectué en début de période d’investissement. Si la première valeur est un coût ou un paiement, elle doit être négative. Tous les paiements qui suivent sont actualisés sur la base d’une année de 365 jours. La série de valeurs doit contenir au moins une valeur positive et une valeur négative.' },
            dates: { name: 'dates', detail: 'Obligatoire. Représente l’échéancier de paiement correspondant aux flux nets de trésorerie. Les dates peuvent se produire dans n’importe quel ordre. Les dates doivent être entrées en utilisant la fonction DATE, ou sous la forme de résultats d’autres formules ou fonctions. Par exemple, utilisez DATE(2008;5;23) pour le 23e jour du mois de mai 2008. Des problèmes peuvent survenir si les dates sont entrées sous forme de texte. .' },
            guess: { name: 'guess', detail: 'Optionnel. Représente un nombre que vous supposez proche du résultat attendu de la fonction TRI.PAIEMENTS.' },
        },
    },
    XNPV: {
        description: 'Donne la valeur actuelle nette d’un ensemble de paiements. Pour calculer la valeur actuelle nette d’un ensemble de paiements périodiques, utilisez la fonction VAN.',
        abstract: 'Donne la valeur actuelle nette d’un ensemble de paiements. Pour calculer la valeur actuelle nette d’un ensemble de paiements périodiques, utilisez la fonction VAN.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/xnpv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’actualisation applicable aux flux nets de trésorerie.' },
            values: { name: 'values', detail: 'Obligatoire. Représente une série de flux nets de trésorerie correspondant à l’échéancier de paiement déterminé par l’argument date. Le premier paiement, facultatif, représente le coût ou le versement éventuellement effectué en début de période d’investissement. Si la première valeur est un coût ou un paiement, elle doit être négative. Tous les paiements qui suivent sont actualisés sur la base d’une année de 365 jours. La série de valeurs doit contenir au moins une valeur positive et une valeur négative.' },
            dates: { name: 'dates', detail: 'Obligatoire. Représente l’échéancier de paiement correspondant aux flux nets de trésorerie. La première date de paiement indique le point de départ de l’échéancier. Toutes les autres dates doivent lui être postérieures, mais leur ordre d’intervention est indifférent.' },
        },
    },
    YIELD: {
        description: 'Calcule le rendement d’un titre rapportant des intérêts périodiquement. Utilisez la fonction RENDEMENT.TITRE pour calculer le taux de rendement d’une obligation.',
        abstract: 'Calcule le rendement d’un titre rapportant des intérêts périodiquement. Utilisez la fonction RENDEMENT.TITRE pour calculer le taux de rendement d’une obligation.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/yield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux annuel du coupon du titre.' },
            pr: { name: 'pr', detail: 'Obligatoire. Représente le prix du titre par tranche de valeur nominale de 100 €.' },
            redemption: { name: 'redemption', detail: 'Obligatoire. Représente la valeur de remboursement du titre par tranche de valeur nominale de 100 €.' },
            frequency: { name: 'frequency', detail: 'Obligatoire. Représente le nombre de coupons payés par an. Si le paiement est annuel, la fréquence = 1 ; s’il est semestriel, la fréquence = 2 ; et s’il est trimestriel, la fréquence = 4.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    YIELDDISC: {
        description: 'Calcule le taux de rendement d’un emprunt à intérêt simple.',
        abstract: 'Calcule le taux de rendement d’un emprunt à intérêt simple.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/yielddisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            pr: { name: 'pr', detail: 'Obligatoire. Représente le prix du titre par tranche de valeur nominale de 100 €.' },
            redemption: { name: 'redemption', detail: 'Obligatoire. Représente la valeur de remboursement du titre par tranche de valeur nominale de 100 €.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
    YIELDMAT: {
        description: 'Renvoie le rendement annuel d’un titre qui rapporte des intérêts à l’échéance.',
        abstract: 'Renvoie le rendement annuel d’un titre qui rapporte des intérêts à l’échéance.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/yieldmat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obligatoire. Représente la date de règlement du titre. Cette date correspond à la date suivant la date d’émission, lorsque le titre est cédé à l’acheteur.' },
            maturity: { name: 'maturity', detail: 'Obligatoire. Représente la date d’échéance du titre. Cette date correspond à la date d’expiration du titre.' },
            issue: { name: 'issue', detail: 'Obligatoire. Représente la date d’émission du titre, exprimée sous la forme d’un numéro de série.' },
            rate: { name: 'rate', detail: 'Obligatoire. Représente le taux d’intérêt du titre à la date d’émission.' },
            pr: { name: 'pr', detail: 'Obligatoire. Représente le prix du titre par tranche de valeur nominale de 100 €.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
};

export default locale;
