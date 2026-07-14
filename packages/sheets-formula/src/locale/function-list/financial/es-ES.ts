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
        description: 'Devuelve el interés acumulado de un valor que paga intereses periódicos',
        abstract: 'Devuelve el interés acumulado de un valor que paga intereses periódicos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/accrint-function',
            },
        ],
        functionParameter: {
            issue: { name: 'emisión', detail: 'La fecha de emisión del valor.' },
            firstInterest: { name: 'primer_interés', detail: 'La fecha del primer interés del valor.' },
            settlement: { name: 'liquidación', detail: 'La fecha de vencimiento del valor.' },
            rate: { name: 'tasa', detail: 'La tasa de cupón anual del valor.' },
            par: { name: 'valor_nominal', detail: 'El valor nominal del valor.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
            calcMethod: { name: 'método_cálculo', detail: 'Es un valor lógico: el interés se acumula desde la fecha de emisión = VERDADERO o se ignora; el interés se acumula desde la fecha del último pago de cupón = FALSO.' },
        },
    },
    ACCRINTM: {
        description: 'Devuelve el interés acumulado de un valor que paga intereses al vencimiento',
        abstract: 'Devuelve el interés acumulado de un valor que paga intereses al vencimiento',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/accrintm-function',
            },
        ],
        functionParameter: {
            issue: { name: 'emisión', detail: 'La fecha de emisión del valor.' },
            settlement: { name: 'liquidación', detail: 'La fecha de vencimiento del valor.' },
            rate: { name: 'tasa', detail: 'La tasa de cupón anual del valor.' },
            par: { name: 'valor_nominal', detail: 'El valor nominal del valor.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    AMORDEGRC: {
        description: 'Devuelve la depreciación de cada periodo contable mediante un coeficiente de depreciación',
        abstract: 'Devuelve la depreciación de cada periodo contable mediante un coeficiente de depreciación',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/amordegrc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'costo', detail: 'El costo del activo.' },
            datePurchased: { name: 'fecha_compra', detail: 'La fecha de compra del activo.' },
            firstPeriod: { name: 'primer_periodo', detail: 'La fecha del final del primer periodo.' },
            salvage: { name: 'valor_residual', detail: 'El valor residual al final de la vida del activo.' },
            period: { name: 'periodo', detail: 'El periodo.' },
            rate: { name: 'tasa', detail: 'La tasa de depreciación.' },
            basis: { name: 'base', detail: 'La base del año que se usará.' },
        },
    },
    AMORLINC: {
        description: 'Devuelve la depreciación de cada periodo contable',
        abstract: 'Devuelve la depreciación de cada periodo contable',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/amorlinc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'costo', detail: 'El costo del activo.' },
            datePurchased: { name: 'fecha_compra', detail: 'La fecha de compra del activo.' },
            firstPeriod: { name: 'primer_periodo', detail: 'La fecha del final del primer periodo.' },
            salvage: { name: 'valor_residual', detail: 'El valor residual al final de la vida del activo.' },
            period: { name: 'periodo', detail: 'El periodo.' },
            rate: { name: 'tasa', detail: 'La tasa de depreciación.' },
            basis: { name: 'base', detail: 'La base del año que se usará.' },
        },
    },
    COUPDAYBS: {
        description: 'Devuelve el número de días desde el principio del periodo de cupón hasta la fecha de liquidación',
        abstract: 'Devuelve el número de días desde el principio del periodo de cupón hasta la fecha de liquidación',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/coupdaybs-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    COUPDAYS: {
        description: 'Devuelve el número de días del periodo de cupón que contiene la fecha de liquidación',
        abstract: 'Devuelve el número de días del periodo de cupón que contiene la fecha de liquidación',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/coupdays-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    COUPDAYSNC: {
        description: 'Devuelve el número de días desde la fecha de liquidación hasta la siguiente fecha de cupón',
        abstract: 'Devuelve el número de días desde la fecha de liquidación hasta la siguiente fecha de cupón',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/coupdaysnc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    COUPNCD: {
        description: 'Devuelve la siguiente fecha de cupón después de la fecha de liquidación',
        abstract: 'Devuelve la siguiente fecha de cupón después de la fecha de liquidación',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/coupncd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    COUPNUM: {
        description: 'Devuelve el número de cupones pagaderos entre la fecha de liquidación y la fecha de vencimiento',
        abstract: 'Devuelve el número de cupones pagaderos entre la fecha de liquidación y la fecha de vencimiento',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/coupnum-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    COUPPCD: {
        description: 'Devuelve la fecha de cupón anterior antes de la fecha de liquidación',
        abstract: 'Devuelve la fecha de cupón anterior antes de la fecha de liquidación',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/couppcd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    CUMIPMT: {
        description: 'Devuelve el interés acumulativo pagado entre dos periodos',
        abstract: 'Devuelve el interés acumulativo pagado entre dos periodos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/cumipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'tasa', detail: 'La tasa de interés.' },
            nper: { name: 'núm_pagos', detail: 'El número total de periodos de pago.' },
            pv: { name: 'va', detail: 'El valor actual.' },
            startPeriod: { name: 'periodo_inicial', detail: 'El primer periodo en el cálculo. Los periodos de pago se numeran comenzando con 1.' },
            endPeriod: { name: 'periodo_final', detail: 'El último periodo en el cálculo.' },
            type: { name: 'tipo', detail: 'El momento del pago.' },
        },
    },
    CUMPRINC: {
        description: 'Devuelve el capital acumulativo pagado de un préstamo entre dos periodos',
        abstract: 'Devuelve el capital acumulativo pagado de un préstamo entre dos periodos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/cumprinc-function',
            },
        ],
        functionParameter: {
            rate: { name: 'tasa', detail: 'La tasa de interés.' },
            nper: { name: 'núm_pagos', detail: 'El número total de periodos de pago.' },
            pv: { name: 'va', detail: 'El valor actual.' },
            startPeriod: { name: 'periodo_inicial', detail: 'El primer periodo en el cálculo. Los periodos de pago se numeran comenzando con 1.' },
            endPeriod: { name: 'periodo_final', detail: 'El último periodo en el cálculo.' },
            type: { name: 'tipo', detail: 'El momento del pago.' },
        },
    },
    DB: {
        description: 'Devuelve la depreciación de un activo durante un periodo especificado, usando el método de saldo de disminución fija',
        abstract: 'Devuelve la depreciación de un activo durante un periodo especificado, usando el método de saldo de disminución fija',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/db-function',
            },
        ],
        functionParameter: {
            cost: { name: 'costo', detail: 'El costo inicial del activo.' },
            salvage: { name: 'valor_residual', detail: 'El valor al final de la depreciación (a veces llamado el valor residual del activo).' },
            life: { name: 'vida', detail: 'El número de periodos durante los cuales se deprecia el activo (a veces llamado la vida útil del activo).' },
            period: { name: 'periodo', detail: 'El periodo para el cual desea calcular la depreciación.' },
            month: { name: 'mes', detail: 'El número de meses del primer año. Si se omite el mes, se supone que es 12.' },
        },
    },
    DDB: {
        description: 'Devuelve la depreciación de un activo durante un periodo especificado usando el método de saldo de doble disminución u otro método que especifique',
        abstract: 'Devuelve la depreciación de un activo durante un periodo especificado usando el método de saldo de doble disminución u otro método que especifique',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/ddb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'costo', detail: 'El costo inicial del activo.' },
            salvage: { name: 'valor_residual', detail: 'El valor al final de la depreciación (a veces llamado el valor residual del activo).' },
            life: { name: 'vida', detail: 'El número de periodos durante los cuales se deprecia el activo (a veces llamado la vida útil del activo).' },
            period: { name: 'periodo', detail: 'El periodo para el cual desea calcular la depreciación.' },
            factor: { name: 'factor', detail: 'La tasa a la que disminuye el saldo. Si se omite el factor, se supone que es 2 (el método de saldo de doble disminución).' },
        },
    },
    DISC: {
        description: 'Devuelve la tasa de descuento de un valor',
        abstract: 'Devuelve la tasa de descuento de un valor',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/disc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            pr: { name: 'precio', detail: 'El precio del valor por $100 de valor nominal.' },
            redemption: { name: 'rescate', detail: 'El valor de rescate del valor por $100 de valor nominal.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    DOLLARDE: {
        description: 'Convierte un precio en dólares, expresado como fracción, en un precio en dólares, expresado como número decimal',
        abstract: 'Convierte un precio en dólares, expresado como fracción, en un precio en dólares, expresado como número decimal',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dollarde-function',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: 'dólar_fraccionario', detail: 'Un número expresado como una parte entera y una parte fraccionaria, separadas por un símbolo decimal.' },
            fraction: { name: 'fracción', detail: 'El entero que se usará en el denominador de la fracción.' },
        },
    },
    DOLLARFR: {
        description: 'Convierte un precio en dólares, expresado como número decimal, en un precio en dólares, expresado como fracción',
        abstract: 'Convierte un precio en dólares, expresado como número decimal, en un precio en dólares, expresado como fracción',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/dollarfr-function',
            },
        ],
        functionParameter: {
            decimalDollar: { name: 'dólar_decimal', detail: 'Un número decimal.' },
            fraction: { name: 'fracción', detail: 'El entero que se usará en el denominador de la fracción.' },
        },
    },
    DURATION: {
        description: 'Devuelve la duración anual de un valor con pagos de intereses periódicos',
        abstract: 'Devuelve la duración anual de un valor con pagos de intereses periódicos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/duration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            coupon: { name: 'cupón', detail: 'La tasa de cupón anual del valor.' },
            yld: { name: 'rendimiento', detail: 'El rendimiento anual del valor.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    EFFECT: {
        description: 'Devuelve la tasa de interés anual efectiva',
        abstract: 'Devuelve la tasa de interés anual efectiva',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'tasa_nominal', detail: 'La tasa de interés nominal.' },
            npery: { name: 'núm_per_año', detail: 'El número de periodos de composición por año.' },
        },
    },
    FV: {
        description: 'Devuelve el valor futuro de una inversión',
        abstract: 'Devuelve el valor futuro de una inversión',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'tasa', detail: 'La tasa de interés por periodo.' },
            nper: { name: 'núm_pagos', detail: 'El número total de periodos de pago en una anualidad.' },
            pmt: { name: 'pago', detail: 'El pago realizado cada periodo; no puede cambiar durante la vida de la anualidad.' },
            pv: { name: 'va', detail: 'El valor actual, o la cantidad total que vale ahora una serie de pagos futuros.' },
            type: { name: 'tipo', detail: 'El número 0 o 1 e indica cuándo vencen los pagos.' },
        },
    },
    FVSCHEDULE: {
        description: 'Devuelve el valor futuro de un capital inicial después de aplicar una serie de tasas de interés compuesto',
        abstract: 'Devuelve el valor futuro de un capital inicial después de aplicar una serie de tasas de interés compuesto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: 'capital', detail: 'El valor actual.' },
            schedule: { name: 'programa', detail: 'Una matriz de tasas de interés que aplicar.' },
        },
    },
    INTRATE: {
        description: 'Devuelve la tasa de interés para la inversión total en un valor bursátil.',
        abstract: 'Devuelve la tasa de interés para la inversión total en un valor bursátil.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'Obligatorio. La fecha de liquidación del valor bursátil. La fecha de liquidación del valor bursátil es la fecha posterior a la fecha de emisión en la que el comprador adquiere el valor bursátil.' },
            maturity: { name: 'vencimiento', detail: 'Obligatorio. La fecha de vencimiento del valor bursátil. La fecha de vencimiento es aquella en la que expira el valor bursátil.' },
            investment: { name: 'inversión', detail: 'Obligatorio. Es la cantidad de dinero invertido en el valor bursátil.' },
            redemption: { name: 'rescate', detail: 'Obligatorio. Es el valor que se recibirá en la fecha de vencimiento.' },
            basis: { name: 'base', detail: 'Opcional. Determina en qué tipo de base deben contarse los días.' },
        },
    },
    IPMT: {
        description: 'Devuelve el pago de intereses de una inversión durante un periodo determinado',
        abstract: 'Devuelve el pago de intereses de una inversión durante un periodo determinado',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/ipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'tasa', detail: 'La tasa de interés por periodo.' },
            per: { name: 'periodo', detail: 'El periodo para el cual desea buscar el interés y debe estar en el rango de 1 a núm_pagos.' },
            nper: { name: 'núm_pagos', detail: 'El número total de periodos de pago en una anualidad.' },
            pv: { name: 'va', detail: 'El valor actual, o la cantidad total que vale ahora una serie de pagos futuros.' },
            fv: { name: 'vf', detail: 'El valor futuro, o un saldo en efectivo que desea lograr después de realizar el último pago.' },
            type: { name: 'tipo', detail: 'El número 0 o 1 e indica cuándo vencen los pagos.' },
        },
    },
    IRR: {
        description: 'Devuelve la tasa interna de retorno de los flujos de caja representados por los números del argumento valores. Estos flujos de caja no tienen por qué ser constantes, como es el caso en una anualidad. Sin embargo, los flujos de caja deben ocurrir en intervalos regulares, como meses o años. La tasa interna de retorno equivale a la tasa de interés producida por un proyecto de inversión con pagos (valores negativos) e ingresos (valores positivos) que se producen en períodos regulares.',
        abstract: 'Devuelve la tasa interna de retorno de los flujos de caja representados por los números del argumento valores. Estos flujos de caja no tienen por qué ser constantes, como es el caso en una anualidad. Sin embargo, los flujos de caja deben ocurrir en intervalos regulares, como meses o años. La tasa interna de retorno equivale a la tasa de interés producida por un proyecto de inversión con pagos (valores negativos) e ingresos (valores positivos) que se producen en períodos regulares.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: 'valores', detail: 'Una matriz o una referencia a celdas que contienen números para los cuales desea calcular la tasa interna de retorno.\n1.Los valores deben contener al menos un valor positivo y uno negativo para calcular la tasa interna de retorno.\n2.TIR usa el orden de valores para interpretar el orden de los flujos de efectivo. Asegúrese de introducir los valores de pago e ingresos en la secuencia que desee.\n3.Si un argumento de matriz o referencia contiene texto, valores lógicos o celdas vacías, esos valores se ignoran.' },
            guess: { name: 'estimación', detail: 'Un número que estima está cerca del resultado de TIR.' },
        },
    },
    ISPMT: {
        description: 'Calcula el interés pagado durante un periodo específico de una inversión',
        abstract: 'Calcula el interés pagado durante un periodo específico de una inversión',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'tasa', detail: 'La tasa de interés para la inversión.' },
            per: { name: 'periodo', detail: 'El periodo para el cual desea buscar el interés, y debe estar entre 1 y Núm_pagos.' },
            nper: { name: 'núm_pagos', detail: 'El número total de periodos de pago para la inversión.' },
            pv: { name: 'va', detail: 'El valor actual de la inversión. Para un préstamo, Va es la cantidad del préstamo.' },
        },
    },
    MDURATION: {
        description: 'Devuelve la duración modificada de Macauley para un valor con un valor nominal asumido de $100',
        abstract: 'Devuelve la duración modificada de Macauley para un valor con un valor nominal asumido de $100',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/mduration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            coupon: { name: 'cupón', detail: 'La tasa de cupón anual del valor.' },
            yld: { name: 'rendimiento', detail: 'El rendimiento anual del valor.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    MIRR: {
        description: 'Devuelve la tasa interna de retorno donde los flujos de efectivo positivos y negativos se financian a diferentes tasas',
        abstract: 'Devuelve la tasa interna de retorno donde los flujos de efectivo positivos y negativos se financian a diferentes tasas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/mirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'valores', detail: 'Una matriz o una referencia a celdas que contienen números. Estos números representan una serie de pagos (valores negativos) e ingresos (valores positivos) que ocurren en periodos regulares.\n1.Los valores deben contener al menos un valor positivo y uno negativo para calcular la tasa interna de retorno modificada. De lo contrario, TIRM devuelve el valor de error #¡DIV/0!.\n2.Si un argumento de matriz o referencia contiene texto, valores lógicos o celdas vacías, esos valores se ignoran; sin embargo, se incluyen las celdas con el valor cero.' },
            financeRate: { name: 'tasa_financiamiento', detail: 'La tasa de interés que paga sobre el dinero usado en los flujos de efectivo.' },
            reinvestRate: { name: 'tasa_reinversión', detail: 'La tasa de interés que recibe sobre los flujos de efectivo cuando los reinvierte.' },
        },
    },
    NOMINAL: {
        description: 'Devuelve la tasa de interés nominal anual',
        abstract: 'Devuelve la tasa de interés nominal anual',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/nominal-function',
            },
        ],
        functionParameter: {
            effectRate: { name: 'tasa_efectiva', detail: 'La tasa de interés efectiva.' },
            npery: { name: 'núm_per_año', detail: 'El número de periodos de composición por año.' },
        },
    },
    NPER: {
        description: 'Devuelve el número de periodos para una inversión',
        abstract: 'Devuelve el número de periodos para una inversión',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/nper-function',
            },
        ],
        functionParameter: {
            rate: { name: 'tasa', detail: 'La tasa de interés por periodo.' },
            pmt: { name: 'pago', detail: 'El pago realizado cada periodo; no puede cambiar durante la vida de la anualidad.' },
            pv: { name: 'va', detail: 'El valor actual, o la cantidad total que vale ahora una serie de pagos futuros.' },
            fv: { name: 'vf', detail: 'El valor futuro, o un saldo en efectivo que desea lograr después de realizar el último pago.' },
            type: { name: 'tipo', detail: 'El número 0 o 1 e indica cuándo vencen los pagos.' },
        },
    },
    NPV: {
        description: 'Devuelve el valor actual neto de una inversión basada en una serie de flujos de efectivo periódicos y una tasa de descuento',
        abstract: 'Devuelve el valor actual neto de una inversión basada en una serie de flujos de efectivo periódicos y una tasa de descuento',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/npv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'tasa', detail: 'La tasa de descuento durante la duración de un periodo.' },
            value1: { name: 'valor1', detail: 'De 1 a 254 argumentos que representan los pagos e ingresos.' },
            value2: { name: 'valor2', detail: 'De 1 a 254 argumentos que representan los pagos e ingresos.' },
        },
    },
    ODDFPRICE: {
        description: 'Devuelve el precio por $100 de valor nominal de un valor con un primer periodo impar',
        abstract: 'Devuelve el precio por $100 de valor nominal de un valor con un primer periodo impar',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/oddfprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            issue: { name: 'emisión', detail: 'La fecha de emisión del valor.' },
            firstCoupon: { name: 'primer_cupón', detail: 'La fecha del primer cupón del valor.' },
            rate: { name: 'tasa', detail: 'La tasa de interés del valor.' },
            yld: { name: 'rendimiento', detail: 'El rendimiento anual del valor.' },
            redemption: { name: 'rescate', detail: 'El valor de rescate del valor por $100 de valor nominal.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año. Para pagos anuales, frecuencia = 1; para semestrales, frecuencia = 2; para trimestrales, frecuencia = 4.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    ODDFYIELD: {
        description: 'Devuelve el rendimiento de un valor con un primer periodo impar',
        abstract: 'Devuelve el rendimiento de un valor con un primer periodo impar',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/oddfyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            issue: { name: 'emisión', detail: 'La fecha de emisión del valor.' },
            firstCoupon: { name: 'primer_cupón', detail: 'La fecha del primer cupón del valor.' },
            rate: { name: 'tasa', detail: 'La tasa de interés del valor.' },
            pr: { name: 'precio', detail: 'El precio del valor.' },
            redemption: { name: 'rescate', detail: 'El valor de rescate del valor por $100 de valor nominal.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año. Para pagos anuales, frecuencia = 1; para semestrales, frecuencia = 2; para trimestrales, frecuencia = 4.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    ODDLPRICE: {
        description: 'Devuelve el precio por $100 de valor nominal de un valor con un último periodo impar',
        abstract: 'Devuelve el precio por $100 de valor nominal de un valor con un último periodo impar',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/oddlprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            lastInterest: { name: 'último_interés', detail: 'La fecha del último cupón del valor.' },
            rate: { name: 'tasa', detail: 'La tasa de interés del valor.' },
            yld: { name: 'rendimiento', detail: 'El rendimiento anual del valor.' },
            redemption: { name: 'rescate', detail: 'El valor de rescate del valor por $100 de valor nominal.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año. Para pagos anuales, frecuencia = 1; para semestrales, frecuencia = 2; para trimestrales, frecuencia = 4.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    ODDLYIELD: {
        description: 'Devuelve el rendimiento de un valor con un último periodo impar',
        abstract: 'Devuelve el rendimiento de un valor con un último periodo impar',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/oddlyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            lastInterest: { name: 'último_interés', detail: 'La fecha del último cupón del valor.' },
            rate: { name: 'tasa', detail: 'La tasa de interés del valor.' },
            pr: { name: 'precio', detail: 'El precio del valor.' },
            redemption: { name: 'rescate', detail: 'El valor de rescate del valor por $100 de valor nominal.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año. Para pagos anuales, frecuencia = 1; para semestrales, frecuencia = 2; para trimestrales, frecuencia = 4.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    PDURATION: {
        description: 'Devuelve el número de periodos requeridos por una inversión para alcanzar un valor especificado',
        abstract: 'Devuelve el número de periodos requeridos por una inversión para alcanzar un valor especificado',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/pduration-function',
            },
        ],
        functionParameter: {
            rate: { name: 'tasa', detail: 'Tasa es la tasa de interés por periodo.' },
            pv: { name: 'va', detail: 'Va es el valor actual de la inversión.' },
            fv: { name: 'vf', detail: 'Vf es el valor futuro deseado de la inversión.' },
        },
    },
    PMT: {
        description: 'Devuelve el pago periódico de una anualidad',
        abstract: 'Devuelve el pago periódico de una anualidad',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/pmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'tasa', detail: 'La tasa de interés por periodo.' },
            nper: { name: 'núm_pagos', detail: 'El número total de periodos de pago en una anualidad.' },
            pv: { name: 'va', detail: 'El valor actual, o la cantidad total que vale ahora una serie de pagos futuros.' },
            fv: { name: 'vf', detail: 'El valor futuro, o un saldo en efectivo que desea lograr después de realizar el último pago.' },
            type: { name: 'tipo', detail: 'El número 0 o 1 e indica cuándo vencen los pagos.' },
        },
    },
    PPMT: {
        description: 'Devuelve el pago del capital de una inversión durante un periodo determinado',
        abstract: 'Devuelve el pago del capital de una inversión durante un periodo determinado',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/ppmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'tasa', detail: 'La tasa de interés por periodo.' },
            per: { name: 'periodo', detail: 'El periodo para el cual desea buscar el interés y debe estar en el rango de 1 a núm_pagos.' },
            nper: { name: 'núm_pagos', detail: 'El número total de periodos de pago en una anualidad.' },
            pv: { name: 'va', detail: 'El valor actual, o la cantidad total que vale ahora una serie de pagos futuros.' },
            fv: { name: 'vf', detail: 'El valor futuro, o un saldo en efectivo que desea lograr después de realizar el último pago.' },
            type: { name: 'tipo', detail: 'El número 0 o 1 e indica cuándo vencen los pagos.' },
        },
    },
    PRICE: {
        description: 'Devuelve el precio por $100 de valor nominal de un valor que paga intereses periódicos',
        abstract: 'Devuelve el precio por $100 de valor nominal de un valor que paga intereses periódicos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/price-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            rate: { name: 'tasa', detail: 'La tasa de interés del valor.' },
            yld: { name: 'rendimiento', detail: 'El rendimiento anual del valor.' },
            redemption: { name: 'rescate', detail: 'El valor de rescate del valor por $100 de valor nominal.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año. Para pagos anuales, frecuencia = 1; para semestrales, frecuencia = 2; para trimestrales, frecuencia = 4.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    PRICEDISC: {
        description: 'Devuelve el precio por $100 de valor nominal de un valor descontado',
        abstract: 'Devuelve el precio por $100 de valor nominal de un valor descontado',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/pricedisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            discount: { name: 'descuento', detail: 'La tasa de descuento del valor.' },
            redemption: { name: 'rescate', detail: 'El valor de rescate del valor por $100 de valor nominal.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    PRICEMAT: {
        description: 'Devuelve el precio por $100 de valor nominal de un valor que paga intereses al vencimiento',
        abstract: 'Devuelve el precio por $100 de valor nominal de un valor que paga intereses al vencimiento',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/pricemat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            issue: { name: 'emisión', detail: 'La fecha de emisión del valor.' },
            rate: { name: 'tasa', detail: 'La tasa de interés del valor.' },
            yld: { name: 'rendimiento', detail: 'El rendimiento anual del valor.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    PV: {
        description: 'Devuelve el valor actual de una inversión',
        abstract: 'Devuelve el valor actual de una inversión',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/pv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'tasa', detail: 'La tasa de interés por periodo.' },
            nper: { name: 'núm_pagos', detail: 'El número total de periodos de pago en una anualidad.' },
            pmt: { name: 'pago', detail: 'El pago realizado cada periodo; no puede cambiar durante la vida de la anualidad.' },
            fv: { name: 'vf', detail: 'El valor futuro, o un saldo en efectivo que desea lograr después de realizar el último pago.' },
            type: { name: 'tipo', detail: 'El número 0 o 1 e indica cuándo vencen los pagos.' },
        },
    },
    RATE: {
        description: 'Devuelve la tasa de interés por periodo de una anualidad',
        abstract: 'Devuelve la tasa de interés por periodo de una anualidad',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/rate-function',
            },
        ],
        functionParameter: {
            nper: { name: 'núm_pagos', detail: 'El número total de periodos de pago en una anualidad.' },
            pmt: { name: 'pago', detail: 'El pago realizado cada periodo; no puede cambiar durante la vida de la anualidad.' },
            pv: { name: 'va', detail: 'El valor actual, o la cantidad total que vale ahora una serie de pagos futuros.' },
            fv: { name: 'vf', detail: 'El valor futuro, o un saldo en efectivo que desea lograr después de realizar el último pago.' },
            type: { name: 'tipo', detail: 'El número 0 o 1 e indica cuándo vencen los pagos.' },
            guess: { name: 'estimación', detail: 'Su estimación de cuál será la tasa.' },
        },
    },
    RECEIVED: {
        description: 'Devuelve la cantidad recibida al vencimiento para un valor completamente invertido',
        abstract: 'Devuelve la cantidad recibida al vencimiento para un valor completamente invertido',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/received-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            investment: { name: 'inversión', detail: 'La cantidad invertida en el valor.' },
            discount: { name: 'descuento', detail: 'La tasa de descuento del valor.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    RRI: {
        description: 'Devuelve una tasa de interés equivalente para el crecimiento de una inversión',
        abstract: 'Devuelve una tasa de interés equivalente para el crecimiento de una inversión',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/rri-function',
            },
        ],
        functionParameter: {
            nper: { name: 'núm_pagos', detail: 'Núm_pagos es el número de periodos para la inversión.' },
            pv: { name: 'va', detail: 'Va es el valor actual de la inversión.' },
            fv: { name: 'vf', detail: 'Vf es el valor futuro de la inversión.' },
        },
    },
    SLN: {
        description: 'Devuelve la depreciación por método directo de un activo en un periodo',
        abstract: 'Devuelve la depreciación por método directo de un activo en un periodo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/sln-function',
            },
        ],
        functionParameter: {
            cost: { name: 'costo', detail: 'El costo inicial del activo.' },
            salvage: { name: 'valor_residual', detail: 'El valor al final de la depreciación (a veces llamado el valor residual del activo).' },
            life: { name: 'vida', detail: 'El número de periodos durante los cuales se deprecia el activo (a veces llamado la vida útil del activo).' },
        },
    },
    SYD: {
        description: 'Devuelve la depreciación por suma de años de los dígitos de un activo durante un periodo especificado',
        abstract: 'Devuelve la depreciación por suma de años de los dígitos de un activo durante un periodo especificado',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/syd-function',
            },
        ],
        functionParameter: {
            cost: { name: 'costo', detail: 'El costo inicial del activo.' },
            salvage: { name: 'valor_residual', detail: 'El valor al final de la depreciación (a veces llamado el valor residual del activo).' },
            life: { name: 'vida', detail: 'El número de periodos durante los cuales se deprecia el activo (a veces llamado la vida útil del activo).' },
            per: { name: 'periodo', detail: 'El periodo y debe usar las mismas unidades que vida.' },
        },
    },
    TBILLEQ: {
        description: 'Devuelve el rendimiento equivalente de un bono del Tesoro',
        abstract: 'Devuelve el rendimiento equivalente de un bono del Tesoro',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/tbilleq-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del pagaré del Tesoro.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del pagaré del Tesoro.' },
            discount: { name: 'descuento', detail: 'La tasa de descuento del pagaré del Tesoro.' },
        },
    },
    TBILLPRICE: {
        description: 'Devuelve el precio por $100 de valor nominal de un pagaré del Tesoro',
        abstract: 'Devuelve el precio por $100 de valor nominal de un pagaré del Tesoro',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/tbillprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del pagaré del Tesoro.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del pagaré del Tesoro.' },
            discount: { name: 'descuento', detail: 'La tasa de descuento del pagaré del Tesoro.' },
        },
    },
    TBILLYIELD: {
        description: 'Devuelve el rendimiento de un pagaré del Tesoro',
        abstract: 'Devuelve el rendimiento de un pagaré del Tesoro',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/tbillyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del pagaré del Tesoro.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del pagaré del Tesoro.' },
            pr: { name: 'precio', detail: 'El precio del pagaré del Tesoro por $100 de valor nominal.' },
        },
    },
    VDB: {
        description: 'Devuelve la depreciación de un activo durante un periodo especificado o parcial usando un método de saldo decreciente',
        abstract: 'Devuelve la depreciación de un activo durante un periodo especificado o parcial usando un método de saldo decreciente',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/vdb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'costo', detail: 'El costo inicial del activo.' },
            salvage: { name: 'valor_residual', detail: 'El valor al final de la depreciación (a veces llamado el valor residual del activo).' },
            life: { name: 'vida', detail: 'El número de periodos durante los cuales se está depreciando el activo (a veces llamado la vida útil del activo).' },
            startPeriod: { name: 'periodo_inicial', detail: 'El periodo inicial para el cual desea calcular la depreciación.' },
            endPeriod: { name: 'periodo_final', detail: 'El periodo final para el cual desea calcular la depreciación.' },
            factor: { name: 'factor', detail: 'La tasa a la que disminuye el saldo. Si se omite el factor, se supone que es 2 (el método de saldo de doble disminución).' },
            noSwitch: { name: 'no_cambiar', detail: 'Un valor lógico que especifica si se debe cambiar a depreciación en línea recta cuando la depreciación es mayor que el cálculo de saldo decreciente.' },
        },
    },
    XIRR: {
        description: 'Devuelve la tasa interna de retorno para un flujo de efectivo que no es necesariamente periódico',
        abstract: 'Devuelve la tasa interna de retorno para un flujo de efectivo que no es necesariamente periódico',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/xirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'valores', detail: 'Una serie de flujos de efectivo que corresponde a un programa de pagos en fechas. El primer pago es opcional y corresponde a un costo o pago que ocurre al principio de la inversión. Si el primer valor es un costo o pago, debe ser un valor negativo. Todos los pagos sucesivos se descuentan basándose en un año de 365 días. La serie de valores debe contener al menos un valor positivo y uno negativo.' },
            dates: { name: 'fechas', detail: 'Un programa de fechas de pago que corresponde a los pagos de flujo de efectivo. Las fechas pueden ocurrir en cualquier orden.' },
            guess: { name: 'estimación', detail: 'Un número que estima está cerca del resultado de TIRX.' },
        },
    },
    XNPV: {
        description: 'Devuelve el valor actual neto para un flujo de efectivo que no es necesariamente periódico',
        abstract: 'Devuelve el valor actual neto para un flujo de efectivo que no es necesariamente periódico',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/xnpv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'tasa', detail: 'La tasa de descuento que aplicar a los flujos de efectivo.' },
            values: { name: 'valores', detail: 'Una serie de flujos de efectivo que corresponde a un programa de pagos en fechas. El primer pago es opcional y corresponde a un costo o pago que ocurre al principio de la inversión. Si el primer valor es un costo o pago, debe ser un valor negativo. Todos los pagos sucesivos se descuentan basándose en un año de 365 días. La serie de valores debe contener al menos un valor positivo y uno negativo.' },
            dates: { name: 'fechas', detail: 'Un programa de fechas de pago que corresponde a los pagos de flujo de efectivo. Las fechas pueden ocurrir en cualquier orden.' },
        },
    },
    YIELD: {
        description: 'Devuelve el rendimiento de un valor que paga intereses periódicos',
        abstract: 'Devuelve el rendimiento de un valor que paga intereses periódicos',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/yield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            rate: { name: 'tasa', detail: 'La tasa de interés del valor.' },
            pr: { name: 'precio', detail: 'El precio del valor por $100 de valor nominal.' },
            redemption: { name: 'rescate', detail: 'El valor de rescate del valor por $100 de valor nominal.' },
            frequency: { name: 'frecuencia', detail: 'El número de pagos de cupón por año. Para pagos anuales, frecuencia = 1; para semestrales, frecuencia = 2; para trimestrales, frecuencia = 4.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    YIELDDISC: {
        description: 'Devuelve el rendimiento anual de un valor descontado; por ejemplo, un pagaré del Tesoro',
        abstract: 'Devuelve el rendimiento anual de un valor descontado; por ejemplo, un pagaré del Tesoro',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/yielddisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            pr: { name: 'precio', detail: 'El precio del valor por $100 de valor nominal.' },
            redemption: { name: 'rescate', detail: 'El valor de rescate del valor por $100 de valor nominal.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    YIELDMAT: {
        description: 'Devuelve el rendimiento anual de un valor que paga intereses al vencimiento',
        abstract: 'Devuelve el rendimiento anual de un valor que paga intereses al vencimiento',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/yieldmat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            issue: { name: 'emisión', detail: 'La fecha de emisión del valor.' },
            rate: { name: 'tasa', detail: 'La tasa de interés del valor.' },
            pr: { name: 'precio', detail: 'El precio del valor por $100 de valor nominal.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
};

export default locale;
