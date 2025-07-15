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
                url: 'https://support.microsoft.com/en-us/office/accrint-function-fe45d089-6722-4fb3-9379-e1f911d8dc74',
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
                url: 'https://support.microsoft.com/en-us/office/accrintm-function-f62f01f9-5754-4cc4-805b-0e70199328a7',
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
                url: 'https://support.microsoft.com/en-us/office/amordegrc-function-a14d0ca1-64a4-42eb-9b3d-b0dededf9e51',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    AMORLINC: {
        description: 'Devuelve la depreciación de cada periodo contable',
        abstract: 'Devuelve la depreciación de cada periodo contable',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/amorlinc-function-7d417b45-f7f5-4dba-a0a5-3451a81079a8',
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
                url: 'https://support.microsoft.com/en-us/office/coupdaybs-function-eb9a8dfb-2fb2-4c61-8e5d-690b320cf872',
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
                url: 'https://support.microsoft.com/en-us/office/coupdays-function-cc64380b-315b-4e7b-950c-b30b0a76f671',
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
                url: 'https://support.microsoft.com/en-us/office/coupdaysnc-function-5ab3f0b2-029f-4a8b-bb65-47d525eea547',
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
                url: 'https://support.microsoft.com/en-us/office/coupncd-function-fd962fef-506b-4d9d-8590-16df5393691f',
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
                url: 'https://support.microsoft.com/en-us/office/coupnum-function-a90af57b-de53-4969-9c99-dd6139db2522',
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
                url: 'https://support.microsoft.com/en-us/office/couppcd-function-2eb50473-6ee9-4052-a206-77a9a385d5b3',
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
                url: 'https://support.microsoft.com/en-us/office/cumipmt-function-61067bb0-9016-427d-b95b-1a752af0e606',
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
                url: 'https://support.microsoft.com/en-us/office/cumprinc-function-94a4516d-bd65-41a1-bc16-053a6af4c04d',
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
                url: 'https://support.microsoft.com/en-us/office/db-function-354e7d28-5f93-4ff1-8a52-eb4ee549d9d7',
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
                url: 'https://support.microsoft.com/en-us/office/ddb-function-519a7a37-8772-4c96-85c0-ed2c209717a5',
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
                url: 'https://support.microsoft.com/en-us/office/disc-function-71fce9f3-3f05-4acf-a5a3-eac6ef4daa53',
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
                url: 'https://support.microsoft.com/en-us/office/dollarde-function-db85aab0-1677-428a-9dfd-a38476693427',
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
                url: 'https://support.microsoft.com/en-us/office/dollarfr-function-0835d163-3023-4a33-9824-3042c5d4f495',
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
                url: 'https://support.microsoft.com/en-us/office/duration-function-b254ea57-eadc-4602-a86a-c8e369334038',
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
                url: 'https://support.microsoft.com/en-us/office/effect-function-910d4e4c-79e2-4009-95e6-507e04f11bc4',
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
                url: 'https://support.microsoft.com/en-us/office/fv-function-2eef9f44-a084-4c61-bdd8-4fe4bb1b71b3',
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
                url: 'https://support.microsoft.com/en-us/office/fvschedule-function-bec29522-bd87-4082-bab9-a241f3fb251d',
            },
        ],
        functionParameter: {
            principal: { name: 'capital', detail: 'El valor actual.' },
            schedule: { name: 'programa', detail: 'Una matriz de tasas de interés que aplicar.' },
        },
    },
    INTRATE: {
        description: 'Devuelve la tasa de interés de un valor completamente invertido',
        abstract: 'Devuelve la tasa de interés de un valor completamente invertido',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/intrate-function-5cb34dde-a221-4cb6-b3eb-0b9e55e1316f',
            },
        ],
        functionParameter: {
            settlement: { name: 'liquidación', detail: 'La fecha de liquidación del valor.' },
            maturity: { name: 'vencimiento', detail: 'La fecha de vencimiento del valor.' },
            investment: { name: 'inversión', detail: 'La cantidad invertida en el valor.' },
            redemption: { name: 'rescate', detail: 'La cantidad que se recibirá al vencimiento.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se usará.' },
        },
    },
    IPMT: {
        description: 'Devuelve el pago de intereses de una inversión durante un periodo determinado',
        abstract: 'Devuelve el pago de intereses de una inversión durante un periodo determinado',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/ipmt-function-5cce0ad6-8402-4a41-8d29-61a0b054cb6f',
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
        description: 'Devuelve la tasa interna de retorno para una serie de flujos de efectivo',
        abstract: 'Devuelve la tasa interna de retorno para una serie de flujos de efectivo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/irr-function-64925eaa-9988-495b-b290-3ad0c163c1bc',
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
                url: 'https://support.microsoft.com/en-us/office/ispmt-function-fa58adb6-9d39-4ce0-8f43-75399cea56cc',
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
                url: 'https://support.microsoft.com/en-us/office/mduration-function-b3786a69-4f20-469a-94ad-33e5b90a763c',
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
                url: 'https://support.microsoft.com/en-us/office/mirr-function-b020f038-7492-4fb4-93c1-35c345b53524',
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
                url: 'https://support.microsoft.com/en-us/office/nominal-function-7f1ae29b-6b92-435e-b950-ad8b190ddd2b',
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
                url: 'https://support.microsoft.com/en-us/office/nper-function-240535b5-6653-4d2d-bfcf-b6a38151d815',
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
                url: 'https://support.microsoft.com/en-us/office/npv-function-8672cb67-2576-4d07-b67b-ac28acf2a568',
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
                url: 'https://support.microsoft.com/en-us/office/oddfprice-function-d7d664a8-34df-4233-8d2b-922bcf6a69e1',
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
                url: 'https://support.microsoft.com/en-us/office/oddfyield-function-66bc8b7b-6501-4c93-9ce3-2fd16220fe37',
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
                url: 'https://support.microsoft.com/en-us/office/oddlprice-function-fb657749-d200-4902-afaf-ed5445027fc4',
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
                url: 'https://support.microsoft.com/en-us/office/oddlyield-function-c873d088-cf40-435f-8d41-c8232fee9238',
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
                url: 'https://support.microsoft.com/en-us/office/pduration-function-44f33460-5be5-4c90-b857-22308892adaf',
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
                url: 'https://support.microsoft.com/en-us/office/pmt-function-0214da64-9a63-4996-bc20-214433fa6441',
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
                url: 'https://support.microsoft.com/en-us/office/ppmt-function-c370d9e3-7749-4ca4-beea-b06c6ac95e1b',
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
                url: 'https://support.microsoft.com/en-us/office/price-function-3ea9deac-8dfa-436f-a7c8-17ea02c21b0a',
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
                url: 'https://support.microsoft.com/en-us/office/pricedisc-function-d06ad7c1-380e-4be7-9fd9-75e3079acfd3',
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
                url: 'https://support.microsoft.com/en-us/office/pricemat-function-52c3b4da-bc7e-476a-989f-a95f675cae77',
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
                url: 'https://support.microsoft.com/en-us/office/pv-function-23879d31-0e02-4321-be01-da16e8168cbd',
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
                url: 'https://support.microsoft.com/en-us/office/rate-function-9f665657-4a7e-4bb7-a030-83fc59e748ce',
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
                url: 'https://support.microsoft.com/en-us/office/received-function-7a3f8b93-6611-4f81-8576-828312c9b5e5',
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
                url: 'https://support.microsoft.com/en-us/office/rri-function-6f5822d8-7ef1-4233-944c-79e8172930f4',
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
                url: 'https://support.microsoft.com/en-us/office/sln-function-cdb666e5-c1c6-40a7-806a-e695edc2f1c8',
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
                url: 'https://support.microsoft.com/en-us/office/syd-function-069f8106-b60b-4ca2-98e0-2a0f206bdb27',
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
                url: 'https://support.microsoft.com/en-us/office/tbilleq-function-2ab72d90-9b4d-4efe-9fc2-0f81f2c19c8c',
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
                url: 'https://support.microsoft.com/en-us/office/tbillprice-function-eacca992-c29d-425a-9eb8-0513fe6035a2',
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
                url: 'https://support.microsoft.com/en-us/office/tbillyield-function-6d381232-f4b0-4cd5-8e97-45b9c03468ba',
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
                url: 'https://support.microsoft.com/en-us/office/vdb-function-dde4e207-f3fa-488d-91d2-66d55e861d73',
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
                url: 'https://support.microsoft.com/en-us/office/xirr-function-de1242ec-6477-445b-b11b-a303ad9adc9d',
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
                url: 'https://support.microsoft.com/en-us/office/xnpv-function-1b42bbf6-370f-4532-a0eb-d67c16b664b7',
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
                url: 'https://support.microsoft.com/en-us/office/yield-function-f5f5ca43-c4bd-434f-8bd2-ed3c9727a4fe',
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
                url: 'https://support.microsoft.com/en-us/office/yielddisc-function-a9dbdbae-7dae-46de-b995-615faffaaed7',
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
                url: 'https://support.microsoft.com/en-us/office/yieldmat-function-ba7d1809-0d33-4bcb-96c7-6c56ec62ef6f',
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
