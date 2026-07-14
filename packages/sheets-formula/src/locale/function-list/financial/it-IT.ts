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
        description: 'Restituisce l\'interesse maturato di un titolo che paga interessi periodici.',
        abstract: 'Restituisce l\'interesse maturato di un titolo che paga interessi periodici.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/accrint-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: 'Obbligatorio. Data di emissione del titolo.' },
            firstInterest: { name: 'first_interest', detail: 'Obbligatorio. Data della prima cedola.' },
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse annuo del titolo.' },
            par: { name: 'par', detail: 'Obbligatorio. Valore nominale del titolo. Se viene omesso, INT.MATURATO.PER utilizzerà € 1.000.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
            calcMethod: { name: 'calc_method', detail: 'Opzionale. Valore logico che specifica come calcolare l\'interesse maturato totale quando la data liquid è successiva alla data primo_int. Il valore VERO (1) restituisce l\'interesse maturato totale da emiss a liquid. Il valore FALSO (0) restituisce l\'interesse maturato da primo_int a liquid. Se non si immette l\'argomento, verrà utilizzato per impostazione predefinita il valore VERO.' },
        },
    },
    ACCRINTM: {
        description: 'Restituisce l\'interesse maturato di un titolo che paga interessi alla scadenza.',
        abstract: 'Restituisce l\'interesse maturato di un titolo che paga interessi alla scadenza.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/accrintm-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: 'Obbligatorio. Data di emissione del titolo.' },
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di scadenza del titolo.' },
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse annuo del titolo.' },
            par: { name: 'par', detail: 'Obbligatorio. Valore nominale del titolo. Se val_nom viene omesso, INT.MATURATO.SCAD userà € 1.000.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    AMORDEGRC: {
        description: 'Restituisce l\'ammortamento per ogni periodo contabile. Questa funzione è fornita per il sistema contabile francese. Se un bene viene acquistato a metà del periodo, sarà preso in considerazione l\'ammortamento ripartito proporzionalmente. Questa funzione è simile ad AMMORT.PER, tranne per il fatto che il coefficiente di deprezzamento viene applicato al calcolo a seconda della vita del bene.',
        abstract: 'Restituisce l\'ammortamento per ogni periodo contabile. Questa funzione è fornita per il sistema contabile francese. Se un bene viene acquistato a metà del periodo, sarà preso in considerazione l\'ammortamento ripartito proporzionalmente. Questa funzione è simile ad AMMORT.PER, tranne per il fatto che il coefficiente di deprezzamento viene applicato al calcolo a seconda della vita del bene.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/amordegrc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obbligatorio. Costo del bene.' },
            datePurchased: { name: 'date_purchased', detail: 'Obbligatorio. Data di acquisto del bene.' },
            firstPeriod: { name: 'first_period', detail: 'Obbligatorio. Data finale del primo periodo.' },
            salvage: { name: 'salvage', detail: 'Obbligatorio. Valore residuo al termine della vita del bene.' },
            period: { name: 'period', detail: 'Obbligatorio. Periodo.' },
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di ammortamento.' },
            basis: { name: 'basis', detail: 'Opzionale. Base annua da utilizzare.' },
        },
    },
    AMORLINC: {
        description: 'Restituisce l\'ammortamento per ogni periodo contabile. Questa funzione è fornita per il sistema contabile francese. Se un bene viene acquistato a metà del periodo, sarà preso in considerazione l\'ammortamento ripartito proporzionalmente.',
        abstract: 'Restituisce l\'ammortamento per ogni periodo contabile. Questa funzione è fornita per il sistema contabile francese. Se un bene viene acquistato a metà del periodo, sarà preso in considerazione l\'ammortamento ripartito proporzionalmente.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/amorlinc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obbligatorio. Costo del bene.' },
            datePurchased: { name: 'date_purchased', detail: 'Obbligatorio. Data di acquisto del bene.' },
            firstPeriod: { name: 'first_period', detail: 'Obbligatorio. Data finale del primo periodo.' },
            salvage: { name: 'salvage', detail: 'Obbligatorio. Valore residuo al termine della vita del bene.' },
            period: { name: 'period', detail: 'Obbligatorio. Periodo.' },
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di ammortamento.' },
            basis: { name: 'basis', detail: 'Opzionale. Base annua da utilizzare.' },
        },
    },
    COUPDAYBS: {
        description: 'La funzione GIORNI.CED.INIZ.LIQ restituisce il numero di giorni dall\'inizio del periodo di una cedola alla data di liquidazione.',
        abstract: 'La funzione GIORNI.CED.INIZ.LIQ restituisce il numero di giorni dall\'inizio del periodo di una cedola alla data di liquidazione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/coupdaybs-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    COUPDAYS: {
        description: 'Restituisce il numero dei giorni relativi alla durata della cedola che contiene la data di liquidazione.',
        abstract: 'Restituisce il numero dei giorni relativi alla durata della cedola che contiene la data di liquidazione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/coupdays-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    COUPDAYSNC: {
        description: 'Restituisce il numero dei giorni che vanno dalla data di liquidazione alla data della nuova cedola.',
        abstract: 'Restituisce il numero dei giorni che vanno dalla data di liquidazione alla data della nuova cedola.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/coupdaysnc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    COUPNCD: {
        description: 'Restituisce un numero che rappresenta la data della cedola successiva dopo la data di liquidazione.',
        abstract: 'Restituisce un numero che rappresenta la data della cedola successiva dopo la data di liquidazione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/coupncd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    COUPNUM: {
        description: 'Restituisce il numero di cedole pagabili tra la data di liquidazione e la data di scadenza, arrotondato al numero intero di cedola più vicino.',
        abstract: 'Restituisce il numero di cedole pagabili tra la data di liquidazione e la data di scadenza, arrotondato al numero intero di cedola più vicino.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/coupnum-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    COUPPCD: {
        description: 'Restituisce un numero che rappresenta la data della cedola precedente prima della data di liquidazione.',
        abstract: 'Restituisce un numero che rappresenta la data della cedola precedente prima della data di liquidazione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/couppcd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    CUMIPMT: {
        description: 'Restituisce l\'interesse cumulativo pagato per estinguere un debito tra iniz_per e fine_per.',
        abstract: 'Restituisce l\'interesse cumulativo pagato per estinguere un debito tra iniz_per e fine_per.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/cumipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse.' },
            nper: { name: 'nper', detail: 'Obbligatorio. Numero totale di periodi di pagamento.' },
            pv: { name: 'pv', detail: 'Obbligatorio. Valore attuale.' },
            startPeriod: { name: 'start_period', detail: 'Obbligatorio. Primo periodo nel calcolo. I periodi di pagamento vengono numerati a partire da 1.' },
            endPeriod: { name: 'end_period', detail: 'Obbligatorio. Ultimo periodo nel calcolo.' },
            type: { name: 'type', detail: 'Obbligatorio. Scadenza per il pagamento.' },
        },
    },
    CUMPRINC: {
        description: 'Restituisce il capitale cumulativo pagato per estinguere un debito tra iniz_per e fine_per.',
        abstract: 'Restituisce il capitale cumulativo pagato per estinguere un debito tra iniz_per e fine_per.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/cumprinc-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse.' },
            nper: { name: 'nper', detail: 'Obbligatorio. Numero totale di periodi di pagamento.' },
            pv: { name: 'pv', detail: 'Obbligatorio. Valore attuale.' },
            startPeriod: { name: 'start_period', detail: 'Obbligatorio. Primo periodo nel calcolo. I periodi di pagamento vengono numerati a partire da 1.' },
            endPeriod: { name: 'end_period', detail: 'Obbligatorio. Ultimo periodo nel calcolo.' },
            type: { name: 'type', detail: 'Obbligatorio. Scadenza per il pagamento.' },
        },
    },
    DB: {
        description: 'Restituisce l\'ammortamento di un bene per un periodo specificato utilizzando il metodo a quote fisse proporzionali ai valori residui.',
        abstract: 'Restituisce l\'ammortamento di un bene per un periodo specificato utilizzando il metodo a quote fisse proporzionali ai valori residui.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/db-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obbligatorio. Costo iniziale del bene.' },
            salvage: { name: 'salvage', detail: 'Obbligatorio. Valore ottenuto alla fine dell\'ammortamento, noto anche come valore residuo del bene.' },
            life: { name: 'life', detail: 'Obbligatorio. Numero di periodi in cui il bene viene ammortizzato, noto anche come vita utile del bene.' },
            period: { name: 'period', detail: 'Obbligatorio. Periodo per il quale si calcola l\'ammortamento. Per periodo deve essere utilizzata la stessa unità di misura di Vita_utile.' },
            month: { name: 'month', detail: 'Opzionale. Numero di mesi nel primo anno. Se mese viene omesso, verrà considerato uguale a 12.' },
        },
    },
    DDB: {
        description: 'Restituisce l\'ammortamento di un bene per un periodo specificato utilizzando il metodo a doppie quote proporzionali ai valori residui o un altro metodo specificato.',
        abstract: 'Restituisce l\'ammortamento di un bene per un periodo specificato utilizzando il metodo a doppie quote proporzionali ai valori residui o un altro metodo specificato.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/ddb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obbligatorio. Costo iniziale del bene.' },
            salvage: { name: 'salvage', detail: 'Obbligatorio. Valore ottenuto alla fine dell\'ammortamento, noto anche come valore residuo del bene. Questo valore può essere 0.' },
            life: { name: 'life', detail: 'Obbligatorio. Numero di periodi in cui il bene viene ammortizzato, noto anche come vita utile del bene.' },
            period: { name: 'period', detail: 'Obbligatorio. Periodo per il quale si calcola l\'ammortamento. Per periodo deve essere utilizzata la stessa unità di misura di Vita_utile.' },
            factor: { name: 'factor', detail: 'Opzionale. Tasso di diminuzione delle quote proporzionali ai valori residui. Se fattore viene omesso, verrà considerato uguale a 2, che corrisponde al metodo di ammortamento a doppie quote proporzionali ai valori residui.' },
        },
    },
    DISC: {
        description: 'Restituisce il tasso di sconto di un titolo.',
        abstract: 'Restituisce il tasso di sconto di un titolo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/disc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            pr: { name: 'pr', detail: 'Obbligatorio. Prezzo del titolo per valore nominale di € 100.' },
            redemption: { name: 'redemption', detail: 'Obbligatorio. Valore di rimborso del titolo per valore nominale di € 100.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    DOLLARDE: {
        description: 'Converte un prezzo espresso in numero intero e in frazione, ad esempio 1,02, in un prezzo espresso in numero decimale. I numeri espressi in frazione sono talvolta utilizzati per i prezzi dei titoli.',
        abstract: 'Converte un prezzo espresso in numero intero e in frazione, ad esempio 1,02, in un prezzo espresso in numero decimale. I numeri espressi in frazione sono talvolta utilizzati per i prezzi dei titoli.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dollarde-function',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: 'fractional_dollar', detail: 'Obbligatorio. Numero espresso con un numero intero e una frazione, separati da un simbolo decimale.' },
            fraction: { name: 'fraction', detail: 'Obbligatorio. Intero da utilizzare nel denominatore della frazione.' },
        },
    },
    DOLLARFR: {
        description: 'Utilizzare la funzione VALUTA.FRAZ per convertire i numeri decimali in prezzi espressi in frazione.',
        abstract: 'Utilizzare la funzione VALUTA.FRAZ per convertire i numeri decimali in prezzi espressi in frazione.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/dollarfr-function',
            },
        ],
        functionParameter: {
            decimalDollar: { name: 'decimal_dollar', detail: 'Obbligatorio. Numero decimale.' },
            fraction: { name: 'fraction', detail: 'Obbligatorio. Intero da utilizzare nel denominatore della frazione.' },
        },
    },
    DURATION: {
        description: 'La funzione DURATA , una delle funzioni finanziarie , restituisce la durata Macauley per un valore nominale presunto di $ 100. La durata è definita come la media ponderata del valore attuale dei flussi di cassa e viene utilizzata come misura della risposta del prezzo di un\'obbligazione alle variazioni del rendimento.',
        abstract: 'La funzione DURATA , una delle funzioni finanziarie , restituisce la durata Macauley per un valore nominale presunto di $ 100. La durata è definita come la media ponderata del valore attuale dei flussi di cassa e viene utilizzata come misura della risposta del prezzo di un\'obbligazione alle variazioni del rendimento.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/duration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            coupon: { name: 'coupon', detail: 'Obbligatorio. Tasso di interesse annuo del titolo.' },
            yld: { name: 'yld', detail: 'Obbligatorio. Rendimento annuo del titolo.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    EFFECT: {
        description: 'Restituisce il tasso di interesse annuo effettivo in base al tasso di interesse nominale annuo ed al numero dei periodi di capitalizzazione per anno.',
        abstract: 'Restituisce il tasso di interesse annuo effettivo in base al tasso di interesse nominale annuo ed al numero dei periodi di capitalizzazione per anno.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominal_rate', detail: 'Obbligatorio. Tasso di interesse nominale.' },
            npery: { name: 'npery', detail: 'Obbligatorio. Numero di periodi di capitalizzazione per anno.' },
        },
    },
    FV: {
        description: 'VAL.FUT , una delle funzioni finanziarie , calcola il valore futuro di un investimento sulla base di un tasso di interesse costante. È possibile usare VAL.FUT con pagamenti periodici costanti o con un unico pagamento forfettario.',
        abstract: 'VAL.FUT , una delle funzioni finanziarie , calcola il valore futuro di un investimento sulla base di un tasso di interesse costante. È possibile usare VAL.FUT con pagamenti periodici costanti o con un unico pagamento forfettario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse per periodo.' },
            nper: { name: 'nper', detail: 'Obbligatorio. Numero totale dei periodi di pagamento in un\'annualità.' },
            pmt: { name: 'pmt', detail: 'Obbligatorio. Pagamento effettuato in ciascun periodo e non può variare nel corso dell\'annualità. In genere, pagam include il capitale e gli interessi, ma non altre imposte o spese. Se pagam viene omesso, si deve includere l\'argomento val_attuale.' },
            pv: { name: 'pv', detail: 'Opzionale. Valore attuale o somma forfettaria che rappresenta il valore attuale di una serie di pagamenti futuri. Se val_attuale è omesso, verrà considerato uguale a 0 (zero) e si dovrà includere l\'argomento pagam.' },
            type: { name: 'type', detail: 'Opzionale. Corrisponde a 0 o a 1 e indica le scadenze dei pagamenti. Se tipo è omesso, verrà considerato uguale a 0.' },
        },
    },
    FVSCHEDULE: {
        description: 'Restituisce il valore futuro di un capitale iniziale soggetto a una serie di interessi composti. Utilizzare la funzione VAL.FUT.CAPITALE per calcolare il valore futuro di un investimento con una variabile o un tasso variabile.',
        abstract: 'Restituisce il valore futuro di un capitale iniziale soggetto a una serie di interessi composti. Utilizzare la funzione VAL.FUT.CAPITALE per calcolare il valore futuro di un investimento con una variabile o un tasso variabile.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: 'principal', detail: 'Obbligatorio. Valore attuale.' },
            schedule: { name: 'schedule', detail: 'Obbligatorio. Matrice di tassi di interesse da applicare.' },
        },
    },
    INTRATE: {
        description: 'Restituisce il tasso di interesse di un titolo interamente investito.',
        abstract: 'Restituisce il tasso di interesse di un titolo interamente investito.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            investment: { name: 'investment', detail: 'Obbligatorio. Importo investito nel titolo.' },
            redemption: { name: 'redemption', detail: 'Obbligatorio. Importo da ricevere alla scadenza.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    IPMT: {
        description: 'Restituisce il pagamento degli interessi relativi a un investimento per un dato periodo sulla base di pagamenti periodici e costanti e di un tasso di interesse costante.',
        abstract: 'Restituisce il pagamento degli interessi relativi a un investimento per un dato periodo sulla base di pagamenti periodici e costanti e di un tasso di interesse costante.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/ipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse per periodo.' },
            per: { name: 'per', detail: 'Obbligatorio. Periodo per il quale si desidera trovare l\'interesse e deve essere compreso tra 1 e periodi.' },
            nper: { name: 'nper', detail: 'Obbligatorio. Numero totale dei periodi di pagamento in un\'annualità.' },
            pv: { name: 'pv', detail: 'Obbligatorio. Valore attuale o somma forfettaria che rappresenta il valore attuale di una serie di pagamenti futuri.' },
            fv: { name: 'fv', detail: 'Opzionale. Valore futuro o saldo in contanti che si desidera raggiungere dopo aver effettuato l\'ultimo pagamento. Se val_futuro viene omesso, verrà considerato uguale a 0, ovvero il valore futuro di un prestito, ad esempio, sarà 0.' },
            type: { name: 'type', detail: 'Opzionale. Corrisponde a 0 o a 1 e indica le scadenze dei pagamenti. Se tipo è omesso, verrà considerato uguale a 0.' },
        },
    },
    IRR: {
        description: 'Restituisce il tasso di rendimento interno di una serie di flussi di cassa rappresentati dai numeri in valori. Questi flussi di cassa non devono necessariamente essere pari, come sarebbero per un\'annualità. Tuttavia, i flussi di cassa devono essere a intervalli regolari, ad esempio mensilmente o annualmente. Il tasso di rendimento interno è il tasso di interesse ricevuto per un investimento costituito da pagamenti (valori negativi) e entrate (valori positivi) che si verificano a periodi regolari.',
        abstract: 'Restituisce il tasso di rendimento interno di una serie di flussi di cassa rappresentati dai numeri in valori. Questi flussi di cassa non devono necessariamente essere pari, come sarebbero per un\'annualità. Tuttavia, i flussi di cassa devono essere a intervalli regolari, ad esempio mensilmente o annualmente. Il tasso di rendimento interno è il tasso di interesse ricevuto per un investimento costituito da pagamenti (valori negativi) e entrate (valori positivi) che si verificano a periodi regolari.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Matrice o riferimento a celle contenenti i numeri per i quali calcolare il tasso di rendimento interno. Deve contenere almeno un valore positivo e uno negativo; testo, valori logici e celle vuote vengono ignorati.' },
            guess: { name: 'guess', detail: 'Numero che si stima sia vicino al risultato di TIR.' },
        },
    },
    ISPMT: {
        description: 'Calcola l\'interesse pagato (o ricevuto) per il periodo specificato di un prestito (o investimento) con pagamenti di capitale pari.',
        abstract: 'Calcola l\'interesse pagato (o ricevuto) per il periodo specificato di un prestito (o investimento) con pagamenti di capitale pari.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse per l\'investimento.' },
            per: { name: 'per', detail: 'Obbligatorio. Periodo per il quale si desidera trovare l\'interesse e deve essere compreso tra 1 e Periodi.' },
            nper: { name: 'nper', detail: 'Obbligatorio. Numero complessivo dei periodi di pagamento per l\'investimento.' },
            pv: { name: 'pv', detail: 'Obbligatorio. Valore attuale dell\'investimento. Per un prestito, Valatt è l\'importo del prestito.' },
        },
    },
    MDURATION: {
        description: 'Restituisce la durata Macauley modificata per un titolo con un valore nominale presunto di € 100.',
        abstract: 'Restituisce la durata Macauley modificata per un titolo con un valore nominale presunto di € 100.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/mduration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            coupon: { name: 'coupon', detail: 'Obbligatorio. Tasso di interesse annuo del titolo.' },
            yld: { name: 'yld', detail: 'Obbligatorio. Rendimento annuo del titolo.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    MIRR: {
        description: 'Restituisce il tasso di rendimento interno modificato relativo a una serie di flussi di cassa periodici. La funzione TIR.VAR considera sia il costo dell\'investimento che gli interessi maturati dal contante reinvestito.',
        abstract: 'Restituisce il tasso di rendimento interno modificato relativo a una serie di flussi di cassa periodici. La funzione TIR.VAR considera sia il costo dell\'investimento che gli interessi maturati dal contante reinvestito.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/mirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Obbligatorio. Matrice o riferimento a celle contenenti numeri. Questi numeri rappresentano una serie di pagamenti (valori negativi) e di entrate (valori positivi) che si verificano a intervalli regolari. I valori devono contenere almeno un valore positivo e uno negativo per calcolare il tasso di rendimento interno modificato. In caso contrario, TIR.RR restituirà il #DIV/0! . Se una matrice o un riferimento contiene testo, valori logici o celle vuote, tali valori verranno ignorati. Le celle contenenti il valore zero verranno invece incluse nel calcolo.' },
            financeRate: { name: 'finance_rate', detail: 'Obbligatorio. Tasso di interesse corrisposto sul contante utilizzato per i flussi di cassa.' },
            reinvestRate: { name: 'reinvest_rate', detail: 'Obbligatorio. Tasso di interesse percepito sui flussi di cassa nel momento in cui il contante viene reinvestito.' },
        },
    },
    NOMINAL: {
        description: 'Restituisce il tasso di interesse nominale annuo in base al tasso effettivo e al numero di periodi di capitalizzazione per anno.',
        abstract: 'Restituisce il tasso di interesse nominale annuo in base al tasso effettivo e al numero di periodi di capitalizzazione per anno.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/nominal-function',
            },
        ],
        functionParameter: {
            effectRate: { name: 'effect_rate', detail: 'Obbligatorio. Tasso di interesse effettivo.' },
            npery: { name: 'npery', detail: 'Obbligatorio. Numero di periodi di capitalizzazione per anno.' },
        },
    },
    NPER: {
        description: 'Restituisce il numero di periodi relativi a un investimento che prevede pagamenti periodici e costanti e un tasso di interesse costante.',
        abstract: 'Restituisce il numero di periodi relativi a un investimento che prevede pagamenti periodici e costanti e un tasso di interesse costante.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/nper-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse per periodo.' },
            pmt: { name: 'pmt', detail: 'Obbligatorio. Pagamento effettuato in ciascun periodo e non può variare nel corso dell\'annualità. In genere, pagam include il capitale e gli interessi, ma non altre imposte o spese.' },
            pv: { name: 'pv', detail: 'Obbligatorio. Valore attuale o somma forfettaria che rappresenta il valore attuale di una serie di pagamenti futuri.' },
            fv: { name: 'fv', detail: 'Opzionale. Valore futuro o saldo in contanti che si desidera raggiungere dopo aver effettuato l\'ultimo pagamento. Se val_futuro viene omesso, verrà considerato uguale a 0, ovvero il valore futuro di un prestito, ad esempio, sarà 0.' },
            type: { name: 'type', detail: 'Opzionale. Corrisponde a 0 o a 1 e indica le scadenze dei pagamenti.' },
        },
    },
    NPV: {
        description: 'Calcola il valore attuale netto di un investimento utilizzando un tasso di sconto e una serie di pagamenti (valori negativi) e di entrate (valori positivi).',
        abstract: 'Calcola il valore attuale netto di un investimento utilizzando un tasso di sconto e una serie di pagamenti (valori negativi) e di entrate (valori positivi).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/npv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di sconto durante uno dei periodi.' },
            value1: { name: 'value1', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 254 argomenti che rappresentano i pagamenti e le entrate. Valore1, valore2, ... devono essere collocati a distanze di tempo regolari e al termine di ogni periodo. VAN utilizza utilizza l\'ordine di successione di valore1, valore2, ... dei valori per interpretare l\'ordine di successione dei flussi di cassa. Assicurarsi di immettere i valori relativi alle entrate e alle uscite nella sequenza desiderata. Gli argomenti rappresentati da celle vuote, valori logici, rappresentazioni di numeri come testo, valori di errore o testo non convertibile in numeri verranno ignorati. Se un argomento è rappresentato da una matrice o da un riferimento, verranno contati solo i numeri inclusi in tale matrice o riferimento. Le celle vuote, i valori logici, il testo o i valori di errore verranno ignorati.' },
            value2: { name: 'value2', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 254 argomenti che rappresentano i pagamenti e le entrate. Valore1, valore2, ... devono essere collocati a distanze di tempo regolari e al termine di ogni periodo. VAN utilizza utilizza l\'ordine di successione di valore1, valore2, ... dei valori per interpretare l\'ordine di successione dei flussi di cassa. Assicurarsi di immettere i valori relativi alle entrate e alle uscite nella sequenza desiderata. Gli argomenti rappresentati da celle vuote, valori logici, rappresentazioni di numeri come testo, valori di errore o testo non convertibile in numeri verranno ignorati. Se un argomento è rappresentato da una matrice o da un riferimento, verranno contati solo i numeri inclusi in tale matrice o riferimento. Le celle vuote, i valori logici, il testo o i valori di errore verranno ignorati.' },
        },
    },
    ODDFPRICE: {
        description: 'Restituisce il prezzo di un titolo dal valore nominale di € 100 avente il primo periodo (breve o lungo) di durata irregolare.',
        abstract: 'Restituisce il prezzo di un titolo dal valore nominale di € 100 avente il primo periodo (breve o lungo) di durata irregolare.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/oddfprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            issue: { name: 'issue', detail: 'Obbligatorio. Data di emissione del titolo.' },
            firstCoupon: { name: 'first_coupon', detail: 'Obbligatorio. Data della prima cedola.' },
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse del titolo.' },
            yld: { name: 'yld', detail: 'Obbligatorio. Rendimento annuo del titolo.' },
            redemption: { name: 'redemption', detail: 'Obbligatorio. Valore di rimborso del titolo per valore nominale di € 100.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    ODDFYIELD: {
        description: 'Restituisce il rendimento di un titolo avente il primo periodo, breve o lungo, di durata irregolare.',
        abstract: 'Restituisce il rendimento di un titolo avente il primo periodo, breve o lungo, di durata irregolare.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/oddfyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            issue: { name: 'issue', detail: 'Obbligatorio. Data di emissione del titolo.' },
            firstCoupon: { name: 'first_coupon', detail: 'Obbligatorio. Data della prima cedola.' },
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse del titolo.' },
            pr: { name: 'pr', detail: 'Obbligatorio. Prezzo del titolo.' },
            redemption: { name: 'redemption', detail: 'Obbligatorio. Valore di rimborso del titolo per valore nominale di € 100.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    ODDLPRICE: {
        description: 'Restituisce il prezzo di un titolo dal valore nominale di € 100 avente l\'ultimo periodo (breve o lungo) di durata irregolare.',
        abstract: 'Restituisce il prezzo di un titolo dal valore nominale di € 100 avente l\'ultimo periodo (breve o lungo) di durata irregolare.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/oddlprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            lastInterest: { name: 'last_interest', detail: 'Obbligatorio. Data dell\'ultima cedola.' },
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse del titolo.' },
            yld: { name: 'yld', detail: 'Obbligatorio. Rendimento annuo del titolo.' },
            redemption: { name: 'redemption', detail: 'Obbligatorio. Valore di rimborso del titolo per valore nominale di € 100.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    ODDLYIELD: {
        description: 'Restituisce il rendimento di un titolo avente l\'ultimo periodo, breve o lungo, di durata irregolare.',
        abstract: 'Restituisce il rendimento di un titolo avente l\'ultimo periodo, breve o lungo, di durata irregolare.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/oddlyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            lastInterest: { name: 'last_interest', detail: 'Obbligatorio. Data dell\'ultima cedola.' },
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse del titolo.' },
            pr: { name: 'pr', detail: 'Obbligatorio. Prezzo del titolo.' },
            redemption: { name: 'redemption', detail: 'Obbligatorio. Valore di rimborso del titolo per valore nominale di € 100.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    PDURATION: {
        description: 'Restituisce il numero di periodi necessari affinché un investimento raggiunga un valore specificato.',
        abstract: 'Restituisce il numero di periodi necessari affinché un investimento raggiunga un valore specificato.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/pduration-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso_int è il tasso di interesse per il periodo.' },
            pv: { name: 'pv', detail: 'Obbligatorio. Val_attuale è il valore attuale dell\'investimento.' },
            fv: { name: 'fv', detail: 'Obbligatorio. Val_futuro è il valore futuro desiderato dell\'investimento.' },
        },
    },
    PMT: {
        description: 'RATA , una delle funzioni finanziarie , calcola il pagamento per un prestito in base a pagamenti costanti e a un tasso di interesse costante.',
        abstract: 'RATA , una delle funzioni finanziarie , calcola il pagamento per un prestito in base a pagamenti costanti e a un tasso di interesse costante.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/pmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse per il prestito.' },
            nper: { name: 'nper', detail: 'Obbligatorio. Numero totale di pagamenti per il prestito.' },
            pv: { name: 'pv', detail: 'Obbligatorio. Valore attuale ovvero l\'importo totale che rappresenta il valore attuale di una serie di pagamenti futuri, noto anche come capitale.' },
            fv: { name: 'fv', detail: 'Opzionale. Valore futuro o saldo in contanti che si desidera raggiungere dopo aver effettuato l\'ultimo pagamento. Se val_futuro è omesso, verrà considerato uguale a 0, ovvero il valore futuro di un prestito è pari a 0.' },
            type: { name: 'type', detail: 'Opzionale. Corrisponde a 0 (zero) o a 1 e indica le scadenze dei pagamenti.' },
        },
    },
    PPMT: {
        description: 'Restituisce il pagamento sul capitale di un investimento per un dato periodo sulla base di pagamenti periodici e costanti e di un tasso di interesse costante.',
        abstract: 'Restituisce il pagamento sul capitale di un investimento per un dato periodo sulla base di pagamenti periodici e costanti e di un tasso di interesse costante.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/ppmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse per periodo.' },
            per: { name: 'per', detail: 'Obbligatorio. Specifica il periodo e deve essere compreso tra 1 e periodi.' },
            nper: { name: 'nper', detail: 'Obbligatorio. Numero totale dei periodi di pagamento in un\'annualità.' },
            pv: { name: 'pv', detail: 'Obbligatorio. Valore attuale o importo totale che rappresenta il valore attuale di una serie di pagamenti futuri.' },
            fv: { name: 'fv', detail: 'Opzionale. Valore futuro o saldo in contanti che si desidera raggiungere dopo aver effettuato l\'ultimo pagamento. Se val_futuro è omesso, verrà considerato uguale a 0, ovvero il valore futuro di un prestito è pari a 0.' },
            type: { name: 'type', detail: 'Opzionale. Corrisponde a 0 o a 1 e indica le scadenze dei pagamenti.' },
        },
    },
    PRICE: {
        description: 'Restituisce il prezzo di un titolo dal valore nominale di € 100 che paga interessi periodici.',
        abstract: 'Restituisce il prezzo di un titolo dal valore nominale di € 100 che paga interessi periodici.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/price-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse annuo del titolo.' },
            yld: { name: 'yld', detail: 'Obbligatorio. Rendimento annuo del titolo.' },
            redemption: { name: 'redemption', detail: 'Obbligatorio. Valore di rimborso del titolo per valore nominale di € 100.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    PRICEDISC: {
        description: 'Restituisce il prezzo di un titolo scontato dal valore nominale di € 100.',
        abstract: 'Restituisce il prezzo di un titolo scontato dal valore nominale di € 100.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/pricedisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            discount: { name: 'discount', detail: 'Obbligatorio. Tasso di sconto del titolo.' },
            redemption: { name: 'redemption', detail: 'Obbligatorio. Valore di rimborso del titolo per valore nominale di € 100.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    PRICEMAT: {
        description: 'Restituisce il prezzo di un titolo dal valore nominale di € 100 che paga interessi alla scadenza.',
        abstract: 'Restituisce il prezzo di un titolo dal valore nominale di € 100 che paga interessi alla scadenza.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/pricemat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            issue: { name: 'issue', detail: 'Obbligatorio. Data di emissione del titolo espressa come numero seriale.' },
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse del titolo alla data di emissione.' },
            yld: { name: 'yld', detail: 'Obbligatorio. Rendimento annuo del titolo.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    PV: {
        description: 'VALATT , una delle funzioni finanziarie , calcola il valore attuale futuro di un prestito o un investimento sulla base di un tasso di interesse costante. È possibile usare VALATT con pagamenti periodici costanti (come un mutuo o un\'altra forma di prestito) o con un valore futuro che rappresenta l\'obiettivo dell\'investimento.',
        abstract: 'VALATT , una delle funzioni finanziarie , calcola il valore attuale futuro di un prestito o un investimento sulla base di un tasso di interesse costante. È possibile usare VALATT con pagamenti periodici costanti (come un mutuo o un\'altra forma di prestito) o con un valore futuro che rappresenta l\'obiettivo dell\'investimento.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/pv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse per periodo. Se, ad esempio, si ottiene un prestito per l\'acquisto di un\'automobile a un tasso di interesse annuo del 10% e si effettuano pagamenti mensili, il tasso di interesse mensile sarà 10%/12 o 0,83%. Nella formula sarà possibile immettere 10%/12, 0,83% o 0,0083 come tasso.' },
            nper: { name: 'nper', detail: 'Obbligatorio. Numero totale dei periodi di pagamento in un\'annualità. Se, ad esempio, si ottiene un prestito quadriennale per l\'acquisto di un\'automobile e si effettuano pagamenti mensili, il prestito comprenderà 4*12 (o 48) periodi. Nella formula sarà possibile immettere 48 per periodi.' },
            pmt: { name: 'pmt', detail: 'Obbligatorio. Pagamento effettuato in ciascun periodo e non può variare nel corso dell\'annualità. In genere, pagam include il capitale e gli interessi, ma non altre imposte o spese. Ad esempio, i pagamenti mensili di un prestito quadriennale di € 10.000 al 12% per l\'acquisto di un\'automobile saranno di € 263,33. Si immetterebbe -263,33 nella formula come pagam. Se pagam viene omesso, è necessario includere l\'argomento val_futuro.' },
            fv: { name: 'fv', detail: 'Opzionale. Valore futuro o saldo in contanti che si desidera raggiungere dopo l\'ultimo pagamento. Se val_futuro viene omesso, verrà considerato uguale a 0, ovvero il valore futuro di un prestito, ad esempio, sarà 0. Ad esempio, se si vuole risparmiare $ 50.000 per pagare un progetto speciale in 18 anni, $ 50.000 è il valore futuro. Si potrebbe quindi fare un\'ipotesi conservatrice a un tasso di interesse e determinare quanto è necessario risparmiare ogni mese. Se val_futuro viene omesso, è necessario includere l\'argomento pagam.' },
            type: { name: 'type', detail: 'Opzionale. Corrisponde a 0 o a 1 e indica le scadenze dei pagamenti.' },
        },
    },
    RATE: {
        description: 'Restituisce il tasso di interesse per periodo di un\'annualità. La funzione TASSO viene calcolata per iterazione e può avere zero o più soluzioni. Se i risultati successivi di TASSO non convergono entro 0,0000001 dopo 20 iterazioni, TASSO restituirà il #NUM! .',
        abstract: 'Restituisce il tasso di interesse per periodo di un\'annualità. La funzione TASSO viene calcolata per iterazione e può avere zero o più soluzioni. Se i risultati successivi di TASSO non convergono entro 0,0000001 dopo 20 iterazioni, TASSO restituirà il #NUM! .',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/rate-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Obbligatorio. Numero totale dei periodi di pagamento in un\'annualità.' },
            pmt: { name: 'pmt', detail: 'Obbligatorio. Pagamento effettuato in ciascun periodo e non può variare nel corso dell\'annualità. Pagam include in genere il capitale e gli interessi, ma non altre imposte o spese. Se pagam viene omesso, sarà necessario includere l\'argomento val_futuro.' },
            pv: { name: 'pv', detail: 'Obbligatorio. Valore attuale o importo totale che rappresenta il valore attuale di una serie di pagamenti futuri.' },
            fv: { name: 'fv', detail: 'Opzionale. Valore futuro o saldo in contanti che si desidera raggiungere dopo aver effettuato l\'ultimo pagamento. Se val_futuro viene omesso, verrà considerato uguale a 0, ovvero il valore futuro di un prestito, ad esempio, sarà 0. Se val_futuro viene omesso, è necessario includere l\'argomento pagam.' },
            type: { name: 'type', detail: 'Opzionale. Corrisponde a 0 o a 1 e indica le scadenze dei pagamenti.' },
            guess: { name: 'guess', detail: 'Opzionale. Previsione del tasso di interesse. Se ipotesi è omesso, verrà considerato uguale a 10%. Se i risultati di TASSO non convergono, provare a utilizzare dei valori differenti per ipotesi. In genere, i risultati di TASSO convergono se ipotesi è compreso tra 0 e 1.' },
        },
    },
    RECEIVED: {
        description: 'Restituisce l\'ammontare ricevuto alla scadenza di un titolo interamente investito.',
        abstract: 'Restituisce l\'ammontare ricevuto alla scadenza di un titolo interamente investito.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/received-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            investment: { name: 'investment', detail: 'Obbligatorio. Importo investito nel titolo.' },
            discount: { name: 'discount', detail: 'Obbligatorio. Tasso di sconto del titolo.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    RRI: {
        description: 'Restituisce un tasso di interesse equivalente per la crescita di un investimento.',
        abstract: 'Restituisce un tasso di interesse equivalente per la crescita di un investimento.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/rri-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Obbligatorio. Periodi è il numero di periodi per l\'investimento.' },
            pv: { name: 'pv', detail: 'Obbligatorio. Val_attuale è il valore attuale dell\'investimento.' },
            fv: { name: 'fv', detail: 'Obbligatorio. Val_futuro è il valore futuro dell\'investimento.' },
        },
    },
    SLN: {
        description: 'Restituisce l\'ammortamento costante di un bene per un periodo.',
        abstract: 'Restituisce l\'ammortamento costante di un bene per un periodo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/sln-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obbligatorio. Costo iniziale del bene.' },
            salvage: { name: 'salvage', detail: 'Obbligatorio. Valore ottenuto alla fine dell\'ammortamento, noto anche come valore residuo del bene.' },
            life: { name: 'life', detail: 'Obbligatorio. Numero di periodi in cui il bene viene ammortizzato, noto anche come vita utile del bene.' },
        },
    },
    SYD: {
        description: 'Restituisce l\'ammortamento pluriennale in cifre di un bene per un determinato periodo.',
        abstract: 'Restituisce l\'ammortamento pluriennale in cifre di un bene per un determinato periodo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/syd-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obbligatorio. Costo iniziale del bene.' },
            salvage: { name: 'salvage', detail: 'Obbligatorio. Valore ottenuto alla fine dell\'ammortamento, noto anche come valore residuo del bene.' },
            life: { name: 'life', detail: 'Obbligatorio. Numero di periodi in cui il bene viene ammortizzato, noto anche come vita utile del bene.' },
            per: { name: 'per', detail: 'Obbligatorio. Definisce il periodo per il quale devono essere utilizzate le stesse unità di misura di vita_utile.' },
        },
    },
    TBILLEQ: {
        description: 'Restituisce il rendimento equivalente a un\'obbligazione per un Buono ordinario del Tesoro.',
        abstract: 'Restituisce il rendimento equivalente a un\'obbligazione per un Buono ordinario del Tesoro.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/tbilleq-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del Buono del Tesoro. La data di liquidazione del titolo è la data successiva alla data di emissione in cui il Buono del Tesoro viene scambiato con l\'acquirente.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del Buono del Tesoro. La data di scadenza è la data in cui scade il Buono del Tesoro.' },
            discount: { name: 'discount', detail: 'Obbligatorio. Tasso di sconto del Buono del Tesoro.' },
        },
    },
    TBILLPRICE: {
        description: 'Restituisce il prezzo di un Buono del Tesoro dal valore nominale di € 100.',
        abstract: 'Restituisce il prezzo di un Buono del Tesoro dal valore nominale di € 100.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/tbillprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del Buono del Tesoro. La data di liquidazione del titolo è la data successiva alla data di emissione in cui il Buono del Tesoro viene scambiato con l\'acquirente.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del Buono del Tesoro. La data di scadenza è la data in cui scade il Buono del Tesoro.' },
            discount: { name: 'discount', detail: 'Obbligatorio. Tasso di sconto del Buono del Tesoro.' },
        },
    },
    TBILLYIELD: {
        description: 'Restituisce il rendimento di un Buono del Tesoro.',
        abstract: 'Restituisce il rendimento di un Buono del Tesoro.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/tbillyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del Buono del Tesoro. La data di liquidazione del titolo è la data successiva alla data di emissione in cui il Buono del Tesoro viene scambiato con l\'acquirente.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del Buono del Tesoro. La data di scadenza è la data in cui scade il Buono del Tesoro.' },
            pr: { name: 'pr', detail: 'Obbligatorio. Prezzo del Buono del Tesoro per valore nominale di € 100.' },
        },
    },
    VDB: {
        description: 'Restituisce l\'ammortamento di un bene per un periodo specificato, inclusi periodi parziali, utilizzando il metodo a doppie quote proporzionali o un altro metodo specificato. VDB significa residuo variabile decrescente.',
        abstract: 'Restituisce l\'ammortamento di un bene per un periodo specificato, inclusi periodi parziali, utilizzando il metodo a doppie quote proporzionali o un altro metodo specificato. VDB significa residuo variabile decrescente.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/vdb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Obbligatorio. Costo iniziale del bene.' },
            salvage: { name: 'salvage', detail: 'Obbligatorio. Valore ottenuto alla fine dell\'ammortamento, noto anche come valore residuo del bene. Questo valore può essere 0.' },
            life: { name: 'life', detail: 'Obbligatorio. Numero di periodi in cui il bene viene ammortizzato, noto anche come vita utile del bene.' },
            startPeriod: { name: 'start_period', detail: 'Obbligatorio. Periodo iniziale per il quale si desidera calcolare l\'ammortamento. Inizio deve essere espresso nella stessa unità di misura di vita_utile.' },
            endPeriod: { name: 'end_period', detail: 'Obbligatorio. Periodo finale per il quale si desidera calcolare l\'ammortamento. Fine deve essere espresso nella stessa unità di misura di vita_utile.' },
            factor: { name: 'factor', detail: 'Opzionale. Tasso di diminuzione delle quote proporzionali ai valori residui. Se fattore viene omesso, verrà considerato uguale a 2, che corrisponde al metodo di ammortamento a doppie quote proporzionali ai valori residui. Modificare fattore se non si desidera usare questo metodo. Per una descrizione del metodo di ammortamento a doppie quote proporzionali ai valori residui, vedere la funzione AMMORT.' },
            noSwitch: { name: 'no_switch', detail: 'Opzionale. Valore logico che specifica se è necessario passare all\'ammortamento costante se l\'ammortamento è maggiore della quota decrescente calcolata. Se nessuna_opzione è VERO, il passaggio all\'ammortamento costante non avverrà anche se l\'ammortamento sarà maggiore rispetto alla quota decrescente calcolata. Se nessuna_opzione è FALSO o è omesso, il passaggio all\'ammortamento costante avverrà quando l\'ammortamento sarà maggiore rispetto alla quota decrescente calcolata.' },
        },
    },
    XIRR: {
        description: 'Restituisce il tasso di rendimento interno di un impiego di flussi di cassa. Per calcolare il tasso di rendimento interno di una serie di flussi di cassa periodici, utilizzare la funzione TIR.COST.',
        abstract: 'Restituisce il tasso di rendimento interno di un impiego di flussi di cassa. Per calcolare il tasso di rendimento interno di una serie di flussi di cassa periodici, utilizzare la funzione TIR.COST.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/xirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Obbligatorio. Serie di flussi di cassa che corrispondono a scadenze di pagamento. Il primo pagamento è facoltativo e corrisponde a un costo o a un pagamento che avviene all\'inizio dell\'investimento. Se il primo valore è un costo o un pagamento, questo dovrà essere un valore negativo. Tutti i pagamenti successivi vengono scontati secondo una base annua di 365 giorni. È necessario che la serie di valori contenga almeno un valore positivo e uno negativo.' },
            dates: { name: 'dates', detail: 'Obbligatorio. Scadenze di pagamento che corrispondono ai pagamenti dei flussi di cassa. Le date possono essere ordinate in qualsiasi ordine. Le date devono essere immesse utilizzando la funzione DATA o devono essere il risultato di altre formule o funzioni. Usare ad esempio DATA(2008;5;23) per il 23 maggio 2008. Possono verificarsi dei problemi se le date vengono immesse come testo. .' },
            guess: { name: 'guess', detail: 'Opzionale. Numero che si suppone vicino al risultato di TIR.X.' },
        },
    },
    XNPV: {
        description: 'Restituisce il valore attuale netto di un impiego di flussi di cassa. Per calcolare il valore attuale netto di una serie di flussi di cassa periodici, utilizzare la funzione VAN.',
        abstract: 'Restituisce il valore attuale netto di un impiego di flussi di cassa. Per calcolare il valore attuale netto di una serie di flussi di cassa periodici, utilizzare la funzione VAN.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/xnpv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di sconto da applicare ai flussi di cassa.' },
            values: { name: 'values', detail: 'Obbligatorio. Serie di flussi di cassa che corrispondono a scadenze di pagamento. Il primo pagamento è facoltativo e corrisponde a un costo o a un pagamento che avviene all\'inizio dell\'investimento. Se il primo valore è un costo o un pagamento, questo dovrà essere un valore negativo. Tutti i pagamenti successivi vengono scontati secondo una base annua di 365 giorni. È necessario che la serie di valori contenga almeno un valore positivo e uno negativo.' },
            dates: { name: 'dates', detail: 'Obbligatorio. Scadenze di pagamento che corrispondono ai pagamenti dei flussi di cassa. L\'inizio delle scadenze di pagamento è indicato dalla data del primo pagamento. Tutte le altre date devono essere posteriori, ma non è necessario che seguano un ordine particolare.' },
        },
    },
    YIELD: {
        description: 'Restituisce il rendimento di un titolo che frutta interessi periodici. Utilizzare la funzione REND per calcolare il rendimento di obbligazioni.',
        abstract: 'Restituisce il rendimento di un titolo che frutta interessi periodici. Utilizzare la funzione REND per calcolare il rendimento di obbligazioni.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/yield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse annuo del titolo.' },
            pr: { name: 'pr', detail: 'Obbligatorio. Prezzo del titolo per valore nominale di € 100.' },
            redemption: { name: 'redemption', detail: 'Obbligatorio. Valore di rimborso del titolo per valore nominale di € 100.' },
            frequency: { name: 'frequency', detail: 'Obbligatorio. Numero di pagamenti per anno. Se i pagamenti sono annuali, num_rate = 1; se sono semestrali, num_rate = 2; se sono trimestrali, num_rate = 4.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    YIELDDISC: {
        description: 'Restituisce il rendimento annuo di un titolo scontato.',
        abstract: 'Restituisce il rendimento annuo di un titolo scontato.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/yielddisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            pr: { name: 'pr', detail: 'Obbligatorio. Prezzo del titolo per valore nominale di € 100.' },
            redemption: { name: 'redemption', detail: 'Obbligatorio. Valore di rimborso del titolo per valore nominale di € 100.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
    YIELDMAT: {
        description: 'Restituisce il rendimento annuo alla scadenza di un titolo che paga interessi.',
        abstract: 'Restituisce il rendimento annuo alla scadenza di un titolo che paga interessi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/yieldmat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Obbligatorio. Data di liquidazione del titolo. La data di liquidazione del titolo è la data, successiva alla data di emissione, in cui il titolo viene venduto al compratore.' },
            maturity: { name: 'maturity', detail: 'Obbligatorio. Data di scadenza del titolo. È la data in cui il titolo scade.' },
            issue: { name: 'issue', detail: 'Obbligatorio. Data di emissione del titolo espressa come numero seriale.' },
            rate: { name: 'rate', detail: 'Obbligatorio. Tasso di interesse del titolo alla data di emissione.' },
            pr: { name: 'pr', detail: 'Obbligatorio. Prezzo del titolo per valore nominale di € 100.' },
            basis: { name: 'basis', detail: 'Opzionale. Tipo di base da utilizzare per il conteggio dei giorni.' },
        },
    },
};

export default locale;
