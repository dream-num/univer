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
        description: 'Retorna a taxa de juros acumulados de um título que paga uma taxa periódica de juros.',
        abstract: 'Retorna a taxa de juros acumulados de um título que paga uma taxa periódica de juros.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/accrint-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: 'Obrigatório. A data de emissão do título.' },
            firstInterest: { name: 'first_interest', detail: 'Obrigatório. A primeira data de juros do título.' },
            settlement: { name: 'settlement', detail: 'Obrigatório. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de cupom anual do título.' },
            par: { name: 'par', detail: 'Obrigatório. O valor nominal do título. Se ele for omitido, JUROSACUM usará R$ 1.000.' },
            frequency: { name: 'frequency', detail: 'Obrigatório. O número de pagamentos de cupom por ano. Para pagamento anual, frequência = 1; para semestral, frequência = 2; para trimestral, frequência = 4.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
            calcMethod: { name: 'calc_method', detail: 'Opcional. Um valor lógico que especifica o modo de calcular o total de juros acumulados quando a data da liquidação for posterior à data do primeiro_juro. Um valor VERDADEIRO (1) retorna o total de juros acumulados desde a emissão até a liquidação. Um valor FALSO (0) retorna os juros acumulados de primeiro_juro até a liquidação. Se você não inserir o argumento, ele será padronizado como VERDADEIRO.' },
        },
    },
    ACCRINTM: {
        description: 'Retorna os juros acumulados de um título que paga juros no vencimento.',
        abstract: 'Retorna os juros acumulados de um título que paga juros no vencimento.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/accrintm-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: 'Necessário. A data de emissão do título.' },
            settlement: { name: 'settlement', detail: 'Necessário. A data de vencimento do título.' },
            rate: { name: 'rate', detail: 'Necessário. A taxa de cupom anual do título.' },
            par: { name: 'par', detail: 'Necessário. O valor nominal do título. Se ele for omitido, JUROSACUMV usará R$ 1.000.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    AMORDEGRC: {
        description: 'Retorna a depreciação para cada período contábil. Esta função é fornecida para o sistema contábil francês. Se um ativo for adquirido no meio do período contábil, a depreciação pro rata deverá ser considerada. A função é semelhante a AMORLINC, a única diferença é que um coeficiente de depreciação é aplicado no cálculo dependendo do tempo de vida do ativo.',
        abstract: 'Retorna a depreciação para cada período contábil. Esta função é fornecida para o sistema contábil francês. Se um ativo for adquirido no meio do período contábil, a depreciação pro rata deverá ser considerada. A função é semelhante a AMORLINC, a única diferença é que um coeficiente de depreciação é aplicado no cálculo dependendo do tempo de vida do ativo.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/amordegrc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obrigatório. O custo do ativo.' },
            datePurchased: { name: 'date_purchased', detail: 'Obrigatório. A data em que o ativo foi comprado.' },
            firstPeriod: { name: 'first_period', detail: 'Obrigatório. A data do final do primeiro período.' },
            salvage: { name: 'salvage', detail: 'Obrigatório. O valor de recuperação no final da vida útil do ativo.' },
            period: { name: 'period', detail: 'Obrigatório. O período.' },
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de depreciação.' },
            basis: { name: 'basis', detail: 'Opcional. O ano-base a ser adotado.' },
        },
    },
    AMORLINC: {
        description: 'Retorna a depreciação para cada período contábil. Esta função é fornecida para o sistema contábil francês. Se um ativo for adquirido no meio do período contábil, a depreciação pro rata deverá ser considerada.',
        abstract: 'Retorna a depreciação para cada período contábil. Esta função é fornecida para o sistema contábil francês. Se um ativo for adquirido no meio do período contábil, a depreciação pro rata deverá ser considerada.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/amorlinc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obrigatório. O custo do ativo.' },
            datePurchased: { name: 'date_purchased', detail: 'Obrigatório. A data em que o ativo foi comprado.' },
            firstPeriod: { name: 'first_period', detail: 'Obrigatório. A data do final do primeiro período.' },
            salvage: { name: 'salvage', detail: 'Obrigatório. O valor de recuperação no final da vida útil do ativo.' },
            period: { name: 'period', detail: 'Obrigatório. O período.' },
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de depreciação.' },
            basis: { name: 'basis', detail: 'Opcional. O ano-base a ser adotado.' },
        },
    },
    COUPDAYBS: {
        description: 'A função CUPDIASINLIQ retorna o número de dias entre o início do período do cupom e sua data de liquidação.',
        abstract: 'A função CUPDIASINLIQ retorna o número de dias entre o início do período do cupom e sua data de liquidação.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/coupdaybs-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Necessário. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Necessário. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            frequency: { name: 'frequency', detail: 'Necessário. O número de pagamentos de cupom por ano. Para pagamento anual, frequência = 1; para semestral, frequência = 2; para trimestral, frequência = 4.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    COUPDAYS: {
        description: 'Retorna o número de dias no período de cupom que contém a data de quitação.',
        abstract: 'Retorna o número de dias no período de cupom que contém a data de quitação.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/coupdays-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obrigatório. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Obrigatório. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            frequency: { name: 'frequency', detail: 'Obrigatório. O número de pagamentos de cupom por ano. Para pagamento anual, frequência = 1; para semestral, frequência = 2; para trimestral, frequência = 4.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    COUPDAYSNC: {
        description: 'Retorna o número de dias da data de liquidação até a data do próximo cupom.',
        abstract: 'Retorna o número de dias da data de liquidação até a data do próximo cupom.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/coupdaysnc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Necessário. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Necessário. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            frequency: { name: 'frequency', detail: 'Necessário. O número de pagamentos de cupom por ano. Para pagamento anual, frequência = 1; para semestral, frequência = 2; para trimestral, frequência = 4.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    COUPNCD: {
        description: 'Retorna um número que representa a próxima data de cupom após a data de liquidação.',
        abstract: 'Retorna um número que representa a próxima data de cupom após a data de liquidação.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/coupncd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Necessário. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Necessário. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            frequency: { name: 'frequency', detail: 'Necessário. O número de pagamentos de cupom por ano. Para pagamento anual, frequência = 1; para semestral, frequência = 2; para trimestral, frequência = 4.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    COUPNUM: {
        description: 'Retorna o número de cupons pagáveis entre a data de liquidação e a data de vencimento, arredondado para o próximo cupom inteiro.',
        abstract: 'Retorna o número de cupons pagáveis entre a data de liquidação e a data de vencimento, arredondado para o próximo cupom inteiro.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/coupnum-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Necessário. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Necessário. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            frequency: { name: 'frequency', detail: 'Necessário. O número de pagamentos de cupom por ano. Para pagamento anual, frequência = 1; para semestral, frequência = 2; para trimestral, frequência = 4.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    COUPPCD: {
        description: 'Retorna um número que representa a data de cupom antes da data de liquidação.',
        abstract: 'Retorna um número que representa a data de cupom antes da data de liquidação.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/couppcd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Necessário. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Necessário. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            frequency: { name: 'frequency', detail: 'Necessário. O número de pagamentos de cupom por ano. Para pagamento anual, frequência = 1; para semestral, frequência = 2; para trimestral, frequência = 4.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    CUMIPMT: {
        description: 'Retorna os juros acumulados pagos por um empréstimo entre início_período e final_período.',
        abstract: 'Retorna os juros acumulados pagos por um empréstimo entre início_período e final_período.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cumipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Necessário. A taxa de juros.' },
            nper: { name: 'nper', detail: 'Necessário. O número total de períodos de pagamentos.' },
            pv: { name: 'pv', detail: 'Necessário. O valor presente.' },
            startPeriod: { name: 'start_period', detail: 'Necessário. O primeiro período no cálculo. Os períodos de pagamento são numerados começando por 1.' },
            endPeriod: { name: 'end_period', detail: 'Necessário. O último período no cálculo.' },
            type: { name: 'type', detail: 'Necessário. Indica quando o pagamento será efetuado.' },
        },
    },
    CUMPRINC: {
        description: 'Retorna o capital acumulado pago sobre um empréstimo entre início_período e final_período.',
        abstract: 'Retorna o capital acumulado pago sobre um empréstimo entre início_período e final_período.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/cumprinc-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de juros.' },
            nper: { name: 'nper', detail: 'Obrigatório. O número total de períodos de pagamentos.' },
            pv: { name: 'pv', detail: 'Obrigatório. O valor presente.' },
            startPeriod: { name: 'start_period', detail: 'Obrigatório. O primeiro período no cálculo. Os períodos de pagamento são numerados começando por 1.' },
            endPeriod: { name: 'end_period', detail: 'Obrigatório. O último período no cálculo.' },
            type: { name: 'type', detail: 'Obrigatório. Indica quando o pagamento será efetuado.' },
        },
    },
    DB: {
        description: 'Retorna a depreciação de um ativo para um período especificado, usando o método de balanço de declínio fixo.',
        abstract: 'Retorna a depreciação de um ativo para um período especificado, usando o método de balanço de declínio fixo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/db-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obrigatório. O custo inicial do ativo.' },
            salvage: { name: 'salvage', detail: 'Obrigatório. O valor no final da depreciação (às vezes chamado de valor de recuperação do ativo).' },
            life: { name: 'life', detail: 'Obrigatório. O número de períodos em que o ativo está se depreciando (às vezes chamado de vida útil do ativo).' },
            period: { name: 'period', detail: 'Obrigatório. O período com relação ao qual você deseja calcular a depreciação. O período deve usar as mesmas unidades de vida útil.' },
            month: { name: 'month', detail: 'Opcional. O número de meses do primeiro ano. Se mês for omitido, será presumido como 12.' },
        },
    },
    DDB: {
        description: 'Retorna a depreciação de um ativo para um período especificado usando o método de saldo decrescente duplo ou outro método que você especificar.',
        abstract: 'Retorna a depreciação de um ativo para um período especificado usando o método de saldo decrescente duplo ou outro método que você especificar.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ddb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'O custo inicial do ativo.' },
            salvage: { name: 'salvage', detail: 'O valor ao final da depreciação, também chamado de valor residual do ativo.' },
            life: { name: 'life', detail: 'O número de períodos durante os quais o ativo será depreciado, também chamado de vida útil do ativo.' },
            period: { name: 'period', detail: 'O período para o qual você deseja calcular a depreciação.' },
            factor: { name: 'factor', detail: 'A taxa de redução do saldo. Se omitido, será considerado 2, pelo método de saldo decrescente duplo.' },
        },
    },
    DISC: {
        description: 'Retorna a taxa de desconto de um título.',
        abstract: 'Retorna a taxa de desconto de um título.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/disc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obrigatório. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Obrigatório. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            pr: { name: 'pr', detail: 'Obrigatório. O preço do título por R$ 100 de valor nominal.' },
            redemption: { name: 'redemption', detail: 'Obrigatório. O valor de resgate do título por R$ 100 de valor nominal.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    DOLLARDE: {
        description: 'Converte um preço em dólares expresso como fração em um preço em dólares expresso como número decimal.',
        abstract: 'Converte um preço em dólares expresso como fração em um preço em dólares expresso como número decimal.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dollarde-function',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: 'fractional_dollar', detail: 'Um número expresso como parte inteira e parte fracionária, separadas por um símbolo decimal.' },
            fraction: { name: 'fraction', detail: 'O inteiro a ser usado no denominador da fração.' },
        },
    },
    DOLLARFR: {
        description: 'Use MOEDAFRA para converter preços em forma decimal, em frações, como preços de seguros.',
        abstract: 'Use MOEDAFRA para converter preços em forma decimal, em frações, como preços de seguros.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/dollarfr-function',
            },
        ],
        functionParameter: {
            decimalDollar: { name: 'decimal_dollar', detail: 'Necessário. Um número decimal.' },
            fraction: { name: 'fraction', detail: 'Necessário. O inteiro a ser usado no denominador da fração.' },
        },
    },
    DURATION: {
        description: 'A função DURAÇÃO , uma das funções Financeiras , devolve a duração de Macauley para um valor nominal assumido de 100 $. A duração é definida como a média ponderada do valor atual dos fluxos monetários e é utilizada como medida da resposta do preço de uma obrigação às alterações no rendimento.',
        abstract: 'A função DURAÇÃO , uma das funções Financeiras , devolve a duração de Macauley para um valor nominal assumido de 100 $. A duração é definida como a média ponderada do valor atual dos fluxos monetários e é utilizada como medida da resposta do preço de uma obrigação às alterações no rendimento.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/duration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obrigatório. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Obrigatório. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            coupon: { name: 'coupon', detail: 'Obrigatório. A taxa de cupom anual do título.' },
            yld: { name: 'yld', detail: 'Obrigatório. O rendimento anual do título.' },
            frequency: { name: 'frequency', detail: 'Obrigatório. O número de pagamentos de cupom por ano. Para pagamento anual, frequência = 1; para semestral, frequência = 2; para trimestral, frequência = 4.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    EFFECT: {
        description: 'Retorna a taxa de juros anual efetiva, dados a taxa de juros anual nominal e o número de períodos compostos por ano.',
        abstract: 'Retorna a taxa de juros anual efetiva, dados a taxa de juros anual nominal e o número de períodos compostos por ano.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominal_rate', detail: 'Obrigatório. A taxa de juros nominal.' },
            npery: { name: 'npery', detail: 'Obrigatório. O número de períodos compostos por ano.' },
        },
    },
    FV: {
        description: 'VF , uma das funções financeiras , calcula o valor futuro de um investimento com base em uma taxa de juros constante. Você pode usar VF com pagamentos periódicos e constantes ou um pagamento de quantia única.',
        abstract: 'VF , uma das funções financeiras , calcula o valor futuro de um investimento com base em uma taxa de juros constante. Você pode usar VF com pagamentos periódicos e constantes ou um pagamento de quantia única.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de juros por período.' },
            nper: { name: 'nper', detail: 'Obrigatório. O número total de períodos de pagamento em uma anuidade.' },
            pmt: { name: 'pmt', detail: 'Obrigatório. O pagamento feito a cada período; não pode mudar durante a vigência da anuidade. Geralmente, pgto contém o capital e os juros e nenhuma outra tarifa ou taxas. Se pgto for omitido, você deverá incluir o argumento vp.' },
            pv: { name: 'pv', detail: 'Opcional. O valor presente ou a soma total correspondente ao valor presente de uma série de pagamentos futuros. Se vp for omitido, será considerado 0 (zero) e a inclusão do argumento pgto será obrigatória.' },
            type: { name: 'type', detail: 'Opcional. O número 0 ou 1 e indica as datas de vencimento dos pagamentos. Se tipo for omitido, será considerado 0.' },
        },
    },
    FVSCHEDULE: {
        description: 'Retorna o valor futuro de um capital inicial após a aplicação de uma série de taxas de juros compostos. Use VFPLANO para calcular o valor futuro de um investimento com uma taxa variável ou ajustável.',
        abstract: 'Retorna o valor futuro de um capital inicial após a aplicação de uma série de taxas de juros compostos. Use VFPLANO para calcular o valor futuro de um investimento com uma taxa variável ou ajustável.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: 'principal', detail: 'Necessário. O valor presente.' },
            schedule: { name: 'schedule', detail: 'Necessário. Uma matriz de taxas de juros a ser aplicada.' },
        },
    },
    INTRATE: {
        description: 'Retorna a taxa de juros de um título totalmente investido.',
        abstract: 'Retorna a taxa de juros de um título totalmente investido.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Necessário. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Necessário. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            investment: { name: 'investment', detail: 'Necessário. A quantia investida no título.' },
            redemption: { name: 'redemption', detail: 'Necessário. A quantia recebida no vencimento.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    IPMT: {
        description: 'Retorna o pagamento de juros para um determinado período de investimento de acordo com pagamentos periódicos e constantes e com uma taxa de juros constante.',
        abstract: 'Retorna o pagamento de juros para um determinado período de investimento de acordo com pagamentos periódicos e constantes e com uma taxa de juros constante.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de juros por período.' },
            per: { name: 'per', detail: 'Obrigatório. O período cujos juros se deseja saber e deve estar no intervalo entre 1 e nper.' },
            nper: { name: 'nper', detail: 'Obrigatório. O número total de períodos de pagamento em uma anuidade.' },
            pv: { name: 'pv', detail: 'Obrigatório. O valor presente ou a soma total correspondente ao valor presente de uma série de pagamentos futuros.' },
            fv: { name: 'fv', detail: 'Opcional. O valor futuro, ou o saldo, que você deseja obter depois do último pagamento. Se vf for omitido, será considerado 0 (o valor futuro de um empréstimo, por exemplo, é 0).' },
            type: { name: 'type', detail: 'Opcional. O número 0 ou 1 e indica as datas de vencimento dos pagamentos. Se tipo for omitido, será considerado 0.' },
        },
    },
    IRR: {
        description: 'Retorna a taxa interna de retorno de uma sequência de fluxos de caixa representada pelos números em valores. Estes fluxos de caixa não precisam ser iguais como no caso de uma anuidade. Entretanto, os fluxos de caixa devem ser feitos em intervalos regulares, como mensalmente ou anualmente. A taxa interna de retorno é a taxa de juros recebida para um investimento que consiste em pagamentos (valores negativos) e receitas (valores positivos) que ocorrem em períodos regulares.',
        abstract: 'Retorna a taxa interna de retorno de uma sequência de fluxos de caixa representada pelos números em valores. Estes fluxos de caixa não precisam ser iguais como no caso de uma anuidade. Entretanto, os fluxos de caixa devem ser feitos em intervalos regulares, como mensalmente ou anualmente. A taxa interna de retorno é a taxa de juros recebida para um investimento que consiste em pagamentos (valores negativos) e receitas (valores positivos) que ocorrem em períodos regulares.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Uma matriz ou referência a células que contêm os números para os quais você deseja calcular a taxa interna de retorno. Deve conter pelo menos um valor positivo e um negativo; texto, valores lógicos e células vazias são ignorados.' },
            guess: { name: 'guess', detail: 'Um número que você estima estar próximo do resultado de TIR.' },
        },
    },
    ISPMT: {
        description: 'Calcula os juros pagos durante um período específico de um investimento.',
        abstract: 'Calcula os juros pagos durante um período específico de um investimento.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'A taxa de juros do investimento.' },
            per: { name: 'per', detail: 'O período para o qual você deseja encontrar os juros; deve estar entre 1 e nper.' },
            nper: { name: 'nper', detail: 'O número total de períodos de pagamento do investimento.' },
            pv: { name: 'pv', detail: 'O valor presente do investimento. Para um empréstimo, pv é o valor do empréstimo.' },
        },
    },
    MDURATION: {
        description: 'Retorna a duração Macauley modificada para um título com um valor de paridade equivalente a R$ 100.',
        abstract: 'Retorna a duração Macauley modificada para um título com um valor de paridade equivalente a R$ 100.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/mduration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Necessário. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Necessário. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            coupon: { name: 'coupon', detail: 'Necessário. A taxa de cupom anual do título.' },
            yld: { name: 'yld', detail: 'Necessário. O rendimento anual do título.' },
            frequency: { name: 'frequency', detail: 'Necessário. O número de pagamentos de cupom por ano. Para pagamento anual, frequência = 1; para semestral, frequência = 2; para trimestral, frequência = 4.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    MIRR: {
        description: 'Retorna a taxa interna de retorno modificada para uma série de fluxos de caixa periódicos. MTIR considera o custo do investimento e os juros recebidos no reinvestimento do capital.',
        abstract: 'Retorna a taxa interna de retorno modificada para uma série de fluxos de caixa periódicos. MTIR considera o custo do investimento e os juros recebidos no reinvestimento do capital.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/mirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Obrigatório. Uma matriz ou referência a células que contêm números. Estes números representam uma série de pagamentos (valores negativos) e receitas (valores positivos) que ocorrem em períodos regulares. Os valores têm de conter pelo menos um valor positivo e um valor negativo para calcular a taxa interna de retorno modificada. Caso contrário, o MIRR devolve o #DIV/0! valor de erro. Se uma matriz ou argumento de referência contiver texto, valores lógicos ou células vazias, estes valores serão ignorados; no entanto, células com valor zero serão incluídas.' },
            financeRate: { name: 'finance_rate', detail: 'Obrigatório. A taxa de juros paga sobre o dinheiro usado nos fluxos de caixa.' },
            reinvestRate: { name: 'reinvest_rate', detail: 'Obrigatório. A taxa de juros recebida nos fluxos de caixa ao reinvesti-los.' },
        },
    },
    NOMINAL: {
        description: 'Retorna a taxa de juros nominal anual.',
        abstract: 'Retorna a taxa de juros nominal anual.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/nominal-function',
            },
        ],
        functionParameter: {
            effectRate: { name: 'effect_rate', detail: 'A taxa de juros efetiva.' },
            npery: { name: 'npery', detail: 'O número de períodos de capitalização por ano.' },
        },
    },
    NPER: {
        description: 'Retorna o número de períodos para investimento de acordo com pagamentos constantes e periódicos e uma taxa de juros constante.',
        abstract: 'Retorna o número de períodos para investimento de acordo com pagamentos constantes e periódicos e uma taxa de juros constante.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/nper-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de juros por período.' },
            pmt: { name: 'pmt', detail: 'Obrigatório. O pagamento feito a cada período; não pode mudar durante a vigência da anuidade. Geralmente, pgto contém o capital e os juros e nenhuma outra tarifa ou taxas.' },
            pv: { name: 'pv', detail: 'Obrigatório. O valor presente ou a soma total correspondente ao valor presente de uma série de pagamentos futuros.' },
            fv: { name: 'fv', detail: 'Opcional. O valor futuro, ou o saldo, que você deseja obter depois do último pagamento. Se vf for omitido, será considerado 0 (o valor futuro de um empréstimo, por exemplo, é 0).' },
            type: { name: 'type', detail: 'Opcional. O número 0 ou 1 e indica as datas de vencimento.' },
        },
    },
    NPV: {
        description: 'Retorna o valor presente líquido de um investimento com base em uma série de fluxos de caixa periódicos e uma taxa de desconto.',
        abstract: 'Retorna o valor presente líquido de um investimento com base em uma série de fluxos de caixa periódicos e uma taxa de desconto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/npv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'A taxa de desconto durante um período.' },
            value1: { name: 'value1', detail: 'De 1 a 254 argumentos que representam pagamentos e receitas.' },
            value2: { name: 'value2', detail: 'De 1 a 254 argumentos que representam pagamentos e receitas.' },
        },
    },
    ODDFPRICE: {
        description: 'Retorna o preço por valor nominal de $100 de um título com primeiro período irregular.',
        abstract: 'Retorna o preço por valor nominal de $100 de um título com primeiro período irregular.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/oddfprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'A data de liquidação do título.' },
            maturity: { name: 'maturity', detail: 'A data de vencimento do título.' },
            issue: { name: 'issue', detail: 'A data de emissão do título.' },
            firstCoupon: { name: 'first_coupon', detail: 'A data do primeiro cupom do título.' },
            rate: { name: 'rate', detail: 'A taxa de juros do título.' },
            yld: { name: 'yld', detail: 'O rendimento anual do título.' },
            redemption: { name: 'redemption', detail: 'O valor de resgate do título por R$ 100 de valor nominal.' },
            frequency: { name: 'frequency', detail: 'O número de pagamentos de cupom por ano: 1 para anual, 2 para semestral e 4 para trimestral.' },
            basis: { name: 'basis', detail: 'O tipo de base de contagem de dias a ser usado.' },
        },
    },
    ODDFYIELD: {
        description: 'Retorna o rendimento de um título com primeiro período irregular.',
        abstract: 'Retorna o rendimento de um título com primeiro período irregular.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/oddfyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'A data de liquidação do título.' },
            maturity: { name: 'maturity', detail: 'A data de vencimento do título.' },
            issue: { name: 'issue', detail: 'A data de emissão do título.' },
            firstCoupon: { name: 'first_coupon', detail: 'A data do primeiro cupom do título.' },
            rate: { name: 'rate', detail: 'A taxa de juros do título.' },
            pr: { name: 'pr', detail: 'O preço do título.' },
            redemption: { name: 'redemption', detail: 'O valor de resgate do título por R$ 100 de valor nominal.' },
            frequency: { name: 'frequency', detail: 'O número de pagamentos de cupom por ano: 1 para anual, 2 para semestral e 4 para trimestral.' },
            basis: { name: 'basis', detail: 'O tipo de base de contagem de dias a ser usado.' },
        },
    },
    ODDLPRICE: {
        description: 'Retorna o preço por R$ 100,00 de valor nominal de um título com um último período de cupom (curto ou longo) indefinido.',
        abstract: 'Retorna o preço por R$ 100,00 de valor nominal de um título com um último período de cupom (curto ou longo) indefinido.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/oddlprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Necessário. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Necessário. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            lastInterest: { name: 'last_interest', detail: 'Necessário. A data do último cupom do título.' },
            rate: { name: 'rate', detail: 'Necessário. A taxa de juros do título.' },
            yld: { name: 'yld', detail: 'Necessário. O rendimento anual do título.' },
            redemption: { name: 'redemption', detail: 'Necessário. O valor de resgate do título por R$ 100 de valor nominal.' },
            frequency: { name: 'frequency', detail: 'Necessário. O número de pagamentos de cupom por ano. Para pagamento anual, frequência = 1; para semestral, frequência = 2; para trimestral, frequência = 4.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    ODDLYIELD: {
        description: 'Retorna o rendimento de um título com um último período (curto ou longo) indefinido.',
        abstract: 'Retorna o rendimento de um título com um último período (curto ou longo) indefinido.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/oddlyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obrigatório. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Obrigatório. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            lastInterest: { name: 'last_interest', detail: 'Obrigatório. A data do último cupom do título.' },
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de juros do título' },
            pr: { name: 'pr', detail: 'Obrigatório. O preço do título.' },
            redemption: { name: 'redemption', detail: 'Obrigatório. O valor de resgate do título por R$ 100 de valor nominal.' },
            frequency: { name: 'frequency', detail: 'Obrigatório. O número de pagamentos de cupom por ano. Para pagamento anual, frequência = 1; para semestral, frequência = 2; para trimestral, frequência = 4.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    PDURATION: {
        description: 'Retorna o número de períodos necessários para um investimento alcançar um valor especificado.',
        abstract: 'Retorna o número de períodos necessários para um investimento alcançar um valor especificado.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/pduration-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obrigatório. Taxa é a taxa de juros por período.' },
            pv: { name: 'pv', detail: 'Obrigatório. Va é o valor atual do investimento.' },
            fv: { name: 'fv', detail: 'Obrigatório. Vf é o valor futuro desejado do investimento.' },
        },
    },
    PMT: {
        description: 'PGTO , uma das funções financeiras , calcula o pagamento de um empréstimo de acordo com pagamentos constantes e com uma taxa de juros constante.',
        abstract: 'PGTO , uma das funções financeiras , calcula o pagamento de um empréstimo de acordo com pagamentos constantes e com uma taxa de juros constante.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/pmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de juros para o empréstimo.' },
            nper: { name: 'nper', detail: 'Obrigatório. O número total de pagamentos pelo empréstimo.' },
            pv: { name: 'pv', detail: 'Obrigatório. O valor presente, ou a quantia total agora equivalente a uma série de pagamentos futuros; também conhecido como principal.' },
            fv: { name: 'fv', detail: 'Opcional. O valor futuro, ou o saldo, que você deseja obter depois do último pagamento. Se vf for omitido, será considerado 0 (o valor futuro de determinado empréstimo, por exemplo, 0).' },
            type: { name: 'type', detail: 'Opcional. O número 0 (zero) ou 1 e indica o vencimento dos pagamentos.' },
        },
    },
    PPMT: {
        description: 'Retorna o pagamento do principal de um investimento em um período determinado.',
        abstract: 'Retorna o pagamento do principal de um investimento em um período determinado.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/ppmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'A taxa de juros por período.' },
            per: { name: 'per', detail: 'O período para o qual você deseja encontrar os juros; deve estar no intervalo de 1 a nper.' },
            nper: { name: 'nper', detail: 'O número total de períodos de pagamento de uma anuidade.' },
            pv: { name: 'pv', detail: 'O valor presente, ou o valor total que uma série de pagamentos futuros vale agora.' },
            fv: { name: 'fv', detail: 'O valor futuro, ou o saldo em dinheiro que você deseja atingir após o último pagamento.' },
            type: { name: 'type', detail: 'O número 0 ou 1 que indica quando os pagamentos vencem.' },
        },
    },
    PRICE: {
        description: 'Retorna a preço por R$ 100,00 de valor nominal de um título que paga juros periódicos.',
        abstract: 'Retorna a preço por R$ 100,00 de valor nominal de um título que paga juros periódicos.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/price-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obrigatório. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Obrigatório. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de cupom anual do título.' },
            yld: { name: 'yld', detail: 'Obrigatório. O rendimento anual do título.' },
            redemption: { name: 'redemption', detail: 'Obrigatório. O valor de resgate do título por R$ 100 de valor nominal.' },
            frequency: { name: 'frequency', detail: 'Obrigatório. O número de pagamentos de cupom por ano. Para pagamento anual, frequência = 1; para semestral, frequência = 2; para trimestral, frequência = 4.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    PRICEDISC: {
        description: 'Retorna o preço por R$ 100,00 de valor nominal de um título descontado.',
        abstract: 'Retorna o preço por R$ 100,00 de valor nominal de um título descontado.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/pricedisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obrigatório. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Obrigatório. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            discount: { name: 'discount', detail: 'Obrigatório. A taxa de desconto do título.' },
            redemption: { name: 'redemption', detail: 'Obrigatório. O valor de resgate do título por R$ 100 de valor nominal.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    PRICEMAT: {
        description: 'Retorna o preço por R$ 100,00 de valor nominal de um título que paga juros no vencimento.',
        abstract: 'Retorna o preço por R$ 100,00 de valor nominal de um título que paga juros no vencimento.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/pricemat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Necessário. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Necessário. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            issue: { name: 'issue', detail: 'Necessário. A data de emissão do título, expressa como número de série de data.' },
            rate: { name: 'rate', detail: 'Necessário. A taxa de juros do título na data da emissão.' },
            yld: { name: 'yld', detail: 'Necessário. O rendimento anual do título.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    PV: {
        description: 'VP , uma das funções financeiras , calcula o valor presente de um empréstimo ou investimento com base em uma taxa de juros constante. Você pode usar VP com pagamentos periódicos e constantes (como uma hipoteca ou outro empréstimo) ou um valor futuro que é sua meta de investimento.',
        abstract: 'VP , uma das funções financeiras , calcula o valor presente de um empréstimo ou investimento com base em uma taxa de juros constante. Você pode usar VP com pagamentos periódicos e constantes (como uma hipoteca ou outro empréstimo) ou um valor futuro que é sua meta de investimento.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/pv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de juros por período. Por exemplo, se você tiver um empréstimo para um automóvel com taxa de de juros de 10% ano ano e fizer pagamentos mensais, sua taxa de juros mensal será de 10%/12 ou 0,83%. Você deveria inserir 10%/12 ou 0,83%, ou 0,0083, na fórmula como taxa.' },
            nper: { name: 'nper', detail: 'Obrigatório. O número total de períodos de pagamento em uma anuidade. Por exemplo, se você conseguir um empréstimo de carro de quatro anos e fizer pagamentos mensais, seu empréstimo terá 4*12 (ou 48) períodos. Você deveria inserir 48 na fórmula para nper.' },
            pmt: { name: 'pmt', detail: 'Obrigatório. O pagamento feito em cada período e não pode mudar durante a vigência da anuidade. Geralmente, pgto inclui o principal e os juros e nenhuma outra taxa ou tributo. Por exemplo, os pagamentos mensais de R$ 10.000 de um empréstimo de quatro anos para um carro serão de R$ 263,33. Você inseriria -263,33 na fórmula como o pmt. Se pmt for omitido, você deverá incluir o argumento fv.' },
            fv: { name: 'fv', detail: 'Opcional. O valor futuro ou um saldo em dinheiro que você deseja obter depois do último pagamento. Se vf for omitido, será considerado 0 (o valor futuro de um empréstimo, por exemplo, é 0). Por exemplo, se você deseja economizar R$ 50.000 para pagar um projeto especial em 18 anos, então o valor futuro será de R$ 50.000. Você poderia então fazer uma estimativa conservadora na taxa de juros e concluir quanto economizaria por mês. Se vf for omitido, você deverá incluir o argumento pgto.' },
            type: { name: 'type', detail: 'Opcional. O número 0 ou 1 e indica as datas de vencimento.' },
        },
    },
    RATE: {
        description: 'Retorna a taxa de juros por período de uma anuidade. A TAXA é calculada por iteração e pode ter zero ou mais soluções. Se os resultados sucessivos de RATE não convergirem para dentro de 0,0000001 após 20 iterações, RATE retornará o #NUM! valor de erro.',
        abstract: 'Retorna a taxa de juros por período de uma anuidade. A TAXA é calculada por iteração e pode ter zero ou mais soluções. Se os resultados sucessivos de RATE não convergirem para dentro de 0,0000001 após 20 iterações, RATE retornará o #NUM! valor de erro.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/rate-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Necessário. O número total de períodos de pagamento em uma anuidade.' },
            pmt: { name: 'pmt', detail: 'Necessário. O pagamento feito em cada período e não pode mudar durante a vigência da anuidade. Geralmente, pgto inclui o principal e os juros e nenhuma outra taxa ou tributo. Se pgto for omitido, você deverá incluir o argumento vf.' },
            pv: { name: 'pv', detail: 'Necessário. O valor presente — o valor total correspondente ao valor atual de uma série de pagamentos futuros.' },
            fv: { name: 'fv', detail: 'Opcional. O valor futuro, ou o saldo, que você deseja obter depois do último pagamento. Se vf for omitido, será considerado 0 (o valor futuro de um empréstimo, por exemplo, é 0). Se vf for omitido, deve-se incluir o argumento pgto.' },
            type: { name: 'type', detail: 'Opcional. O número 0 ou 1 e indica as datas de vencimento.' },
            guess: { name: 'guess', detail: 'Opcional. A sua estimativa para a taxa. Se você omitir estimativa, este argumento será considerado 10%. Se TAXA não convergir, atribua valores diferentes para estimativa. Em geral, TAXA converge se estimativa estiver entre 0 e 1.' },
        },
    },
    RECEIVED: {
        description: 'Retorna a quantia recebida no vencimento de um título totalmente investido.',
        abstract: 'Retorna a quantia recebida no vencimento de um título totalmente investido.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/received-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obrigatório. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Obrigatório. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            investment: { name: 'investment', detail: 'Obrigatório. A quantia investida no título.' },
            discount: { name: 'discount', detail: 'Obrigatório. A taxa de desconto do título.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    RRI: {
        description: 'Retorna uma taxa de juros equivalente para o crescimento de um investimento.',
        abstract: 'Retorna uma taxa de juros equivalente para o crescimento de um investimento.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/rri-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Necessário. Nper é o número de períodos para o investimento.' },
            pv: { name: 'pv', detail: 'Necessário. Va é o valor atual do investimento.' },
            fv: { name: 'fv', detail: 'Necessário. Vf é o valor futuro do investimento.' },
        },
    },
    SLN: {
        description: 'Retorna a depreciação em linha reta de um ativo durante um período.',
        abstract: 'Retorna a depreciação em linha reta de um ativo durante um período.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/sln-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Necessário. O custo inicial do ativo.' },
            salvage: { name: 'salvage', detail: 'Necessário. O valor no final da depreciação (às vezes chamado de valor de recuperação do ativo).' },
            life: { name: 'life', detail: 'Necessário. O número de períodos durante os quais o ativo é depreciado (às vezes chamado vida útil do ativo).' },
        },
    },
    SYD: {
        description: 'Retorna a depreciação dos dígitos da soma dos anos de um ativo para um período especificado.',
        abstract: 'Retorna a depreciação dos dígitos da soma dos anos de um ativo para um período especificado.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/syd-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Necessário. O custo inicial do ativo.' },
            salvage: { name: 'salvage', detail: 'Necessário. O valor no final da depreciação (às vezes chamado de valor de recuperação do ativo).' },
            life: { name: 'life', detail: 'Necessário. O número de períodos durante os quais o ativo é depreciado (às vezes chamado vida útil do ativo).' },
            per: { name: 'per', detail: 'Necessário. O período e deve utilizar as mesmas unidades de vida útil.' },
        },
    },
    TBILLEQ: {
        description: 'Retorna o rendimento de um título equivalente a uma obrigação do Tesouro.',
        abstract: 'Retorna o rendimento de um título equivalente a uma obrigação do Tesouro.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/tbilleq-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Necessário. A data de quitação da obrigação do Tesouro. A data de liquidação do título é a data após a data de emissão quando a obrigação do Tesouro é negociada com o comprador.' },
            maturity: { name: 'maturity', detail: 'Necessário. A data de vencimento da obrigação do Tesouro. A data de vencimento é a data em que a obrigação do Tesouro expira.' },
            discount: { name: 'discount', detail: 'Necessário. A taxa de desconto da obrigação do Tesouro.' },
        },
    },
    TBILLPRICE: {
        description: 'Retorna o preço por R$ 100,00 de valor nominal de uma obrigação do Tesouro.',
        abstract: 'Retorna o preço por R$ 100,00 de valor nominal de uma obrigação do Tesouro.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/tbillprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Necessário. A data de quitação da obrigação do Tesouro. A data de liquidação do título é a data após a data de emissão quando a obrigação do Tesouro é negociada com o comprador.' },
            maturity: { name: 'maturity', detail: 'Necessário. A data de vencimento da obrigação do Tesouro. A data de vencimento é a data em que a obrigação do Tesouro expira.' },
            discount: { name: 'discount', detail: 'Necessário. A taxa de desconto da obrigação do Tesouro.' },
        },
    },
    TBILLYIELD: {
        description: 'Retorna o rendimento de uma obrigação do Tesouro.',
        abstract: 'Retorna o rendimento de uma obrigação do Tesouro.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/tbillyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obrigatório. A data de quitação da obrigação do Tesouro. A data de liquidação do título é a data após a data de emissão quando a obrigação do Tesouro é negociada com o comprador.' },
            maturity: { name: 'maturity', detail: 'Obrigatório. A data de vencimento da obrigação do Tesouro. A data de vencimento é a data em que a obrigação do Tesouro expira.' },
            pr: { name: 'pr', detail: 'Obrigatório. O preço da obrigação do Tesouro por R$ 100,00 de valor nominal.' },
        },
    },
    VDB: {
        description: 'Retorna a depreciação de um ativo para o período que você especificar, incluindo períodos parciais, usando o método balanço declinante duplo ou algum outro método especificado. BDV é o balanço de declínio variável.',
        abstract: 'Retorna a depreciação de um ativo para o período que você especificar, incluindo períodos parciais, usando o método balanço declinante duplo ou algum outro método especificado. BDV é o balanço de declínio variável.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/vdb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Necessário. O custo inicial do ativo.' },
            salvage: { name: 'salvage', detail: 'Necessário. O valor no final da depreciação (às vezes chamado de valor residual do ativo). Este valor pode ser 0.' },
            life: { name: 'life', detail: 'Necessário. O número de períodos durante os quais o ativo é depreciado (às vezes chamado vida útil do ativo).' },
            startPeriod: { name: 'start_period', detail: 'Necessário. O período inicial para o qual se deseja calcular a depreciação. Início_período deve usar as mesmas unidades que vida_útil.' },
            endPeriod: { name: 'end_period', detail: 'Necessário. O período final para o qual se deseja calcular a depreciação. Final_período deve usar as mesmas unidades que vida_útil.' },
            factor: { name: 'factor', detail: 'Opcional. A taxa em que o balanço declina. Se o fator for omitido, será considerado 2 (método balanço de declínio duplo). Altere o fator caso não deseje usar o método balanço de declínio duplo. Para obter uma descrição do método balanço de declínio duplo, consulte BDD.' },
            noSwitch: { name: 'no_switch', detail: 'Opcional. Um valor lógico que especifica se deve haver mudança para depreciação de linha reta quando a depreciação for maior do que o cálculo do balanço de declínio. Se sem_mudança for VERDADEIRO, o Microsoft Excel não muda para depreciação de linha reta mesmo quando a depreciação for maior do que o cálculo do balanço declínio. Se sem_mudança for FALSO ou omitido, o Excel mudará para depreciação em linha reta quando a depreciação for maior do que o cálculo do balanço decrescente.' },
        },
    },
    XIRR: {
        description: 'Fornece a taxa interna de retorno para um programa de fluxos de caixa que não é necessariamente periódico. Para calcular a taxa interna de retorno para uma sequência de fluxos de caixa periódicos, use a função TIR.',
        abstract: 'Fornece a taxa interna de retorno para um programa de fluxos de caixa que não é necessariamente periódico. Para calcular a taxa interna de retorno para uma sequência de fluxos de caixa periódicos, use a função TIR.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/xirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Necessário. Uma sequência de fluxos de caixa que corresponde a um cronograma de pagamentos em datas. O primeiro pagamento é opcional e corresponde a um custo ou pagamento que ocorre no início do investimento. Se o primeiro valor for um custo ou pagamento, ele deverá ser negativo. Todos os pagamentos subsequentes são descontados com base em um ano de 365 dias. A série de valores deve conter pelo menos um valor positivo e um negativo.' },
            dates: { name: 'dates', detail: 'Necessário. Um cronograma de datas de pagamentos que corresponde aos pagamentos de fluxo de caixa. As datas podem ocorrer em qualquer ordem. As datas devem ser inseridas com a função DATA ou como resultado de outras fórmulas ou funções. Por exemplo, use DATA(2008;5;23) para 23 de maio de 2008. Poderão ocorrer problemas se as datas forem inseridas como texto. .' },
            guess: { name: 'guess', detail: 'Opcional. Um número que você supõe estar próximo do resultado de XTIR.' },
        },
    },
    XNPV: {
        description: 'Retorna o valor presente líquido de um programa de fluxos de caixa que não é necessariamente periódico. Para calcular o valor presente líquido para uma sequência de fluxos de caixa que é periódica, use a função VPL.',
        abstract: 'Retorna o valor presente líquido de um programa de fluxos de caixa que não é necessariamente periódico. Para calcular o valor presente líquido para uma sequência de fluxos de caixa que é periódica, use a função VPL.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/xnpv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de desconto a ser aplicada ao fluxo de caixa.' },
            values: { name: 'values', detail: 'Obrigatório. Uma sequência de fluxos de caixa que corresponde a um cronograma de pagamentos em datas. O primeiro pagamento é opcional e corresponde a um custo ou pagamento que ocorre no início do investimento. Se o primeiro valor for um custo ou pagamento, ele deverá ser negativo. Todos os pagamentos subsequentes são descontados com base em um ano de 365 dias. A série de valores deve conter pelo menos um valor positivo e um negativo.' },
            dates: { name: 'dates', detail: 'Obrigatório. Um cronograma de datas de pagamentos que corresponde aos pagamentos de fluxo de caixa. A primeira data de pagamento indica o início do cronograma de pagamentos. Todas as outras datas devem ser posteriores a essa data, mas podem estar em qualquer ordem.' },
        },
    },
    YIELD: {
        description: 'Retorna o rendimento de um título que paga juros periódicos.',
        abstract: 'Retorna o rendimento de um título que paga juros periódicos.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/yield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'A data de liquidação do título.' },
            maturity: { name: 'maturity', detail: 'A data de vencimento do título.' },
            rate: { name: 'rate', detail: 'A taxa de juros do título.' },
            pr: { name: 'pr', detail: 'O preço do título por R$ 100 de valor nominal.' },
            redemption: { name: 'redemption', detail: 'O valor de resgate do título por R$ 100 de valor nominal.' },
            frequency: { name: 'frequency', detail: 'O número de pagamentos de cupom por ano: 1 para anual, 2 para semestral e 4 para trimestral.' },
            basis: { name: 'basis', detail: 'O tipo de base de contagem de dias a ser usado.' },
        },
    },
    YIELDDISC: {
        description: 'Retorna o lucro anual de um título descontado.',
        abstract: 'Retorna o lucro anual de um título descontado.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/yielddisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Necessário. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Necessário. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            pr: { name: 'pr', detail: 'Necessário. O preço do título por R$ 100 de valor nominal.' },
            redemption: { name: 'redemption', detail: 'Necessário. O valor de resgate do título por R$ 100 de valor nominal.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
    YIELDMAT: {
        description: 'Retorna o lucro anual de um título que paga juros no vencimento.',
        abstract: 'Retorna o lucro anual de um título que paga juros no vencimento.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/yieldmat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obrigatório. A data de liquidação do título. A data de liquidação do título é a data após a data de emissão em que o título foi negociado com o cliente.' },
            maturity: { name: 'maturity', detail: 'Obrigatório. A data de vencimento do título. A data de vencimento é a data em que o título expira.' },
            issue: { name: 'issue', detail: 'Obrigatório. A data de emissão do título, expressa como número de série de data.' },
            rate: { name: 'rate', detail: 'Obrigatório. A taxa de juros do título na data da emissão.' },
            pr: { name: 'pr', detail: 'Obrigatório. O preço do título por R$ 100 de valor nominal.' },
            basis: { name: 'basis', detail: 'Opcional. O tipo de base de contagem diária a ser usado.' },
        },
    },
};

export default locale;
