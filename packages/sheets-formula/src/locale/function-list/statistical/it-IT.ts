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
        description: 'Restituisce la media delle deviazioni assolute dei valori rispetto alla loro media. MEDIA.DEV è una misura della variabilità in un set di dati.',
        abstract: 'Restituisce la media delle deviazioni assolute dei valori rispetto alla loro media. MEDIA.DEV è una misura della variabilità in un set di dati.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/avedev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 argomenti di cui si desidera calcolare la media delle deviazioni assolute. Anziché argomenti separati da punti e virgola, è possibile utilizzare una matrice o un riferimento a una matrice.' },
            number2: { name: 'number2', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 argomenti di cui si desidera calcolare la media delle deviazioni assolute. Anziché argomenti separati da punti e virgola, è possibile utilizzare una matrice o un riferimento a una matrice.' },
        },
    },
    AVERAGE: {
        description: 'Restituisce la media aritmetica degli argomenti. Ad esempio, se l\'intervallo A1:A20 contiene numeri, la formula =MEDIA(A1:A20) restituisce la media di tali numeri.',
        abstract: 'Restituisce la media aritmetica degli argomenti. Ad esempio, se l\'intervallo A1:A20 contiene numeri, la formula =MEDIA(A1:A20) restituisce la media di tali numeri.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo numero, riferimento di cella o intervallo di cui si desidera calcolare la media.' },
            number2: { name: 'number2', detail: 'Opzionale. Altri numeri, riferimenti di cella o intervalli di cui si vuole calcolare la media, fino a un massimo di 255.' },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'La funzione AVERAGE.WEIGHTED calcola la media ponderata di un insieme di valori usando i valori e i rispettivi pesi.',
        abstract: 'La funzione AVERAGE.WEIGHTED calcola la media ponderata di un insieme di valori usando i valori e i rispettivi pesi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9084098?hl=it',
            },
        ],
        functionParameter: {
            values: { name: 'valori', detail: 'I valori di cui calcolare la media. Possono essere un intervallo di celle o i valori stessi.' },
            weights: { name: 'pesi', detail: 'L’elenco dei pesi corrispondenti da applicare. I pesi possono essere zero ma non negativi e almeno uno deve essere positivo. L’intervallo dei pesi deve avere lo stesso numero di righe e colonne dell’intervallo dei valori.' },
            additionalValues: { name: 'valori_aggiuntivi', detail: 'Valori aggiuntivi facoltativi di cui calcolare la media.' },
            additionalWeights: { name: 'pesi_aggiuntivi', detail: 'Pesi aggiuntivi facoltativi. Ogni valore_aggiuntivo deve essere seguito da un solo peso_aggiuntivo.' },
        },
    },
    AVERAGEA: {
        description: 'Restituisce la media aritmetica dei valori nell\'elenco di argomenti.',
        abstract: 'Restituisce la media aritmetica dei valori nell\'elenco di argomenti.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/averagea-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 255 celle, intervalli di celle o valori di cui si desidera calcolare la media.' },
            value2: { name: 'value2', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 255 celle, intervalli di celle o valori di cui si desidera calcolare la media.' },
        },
    },
    AVERAGEIF: {
        description: 'Restituisce la media aritmetica di tutte le celle di un intervallo che soddisfano un criterio specificato.',
        abstract: 'Restituisce la media aritmetica di tutte le celle di un intervallo che soddisfano un criterio specificato.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/averageif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Obbligatorio. Una o più celle, di cui calcolare la media, compresi numeri o nomi, matrici o riferimenti che contengono numeri.' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Criteri in forma di numeri, espressioni, riferimenti di cella o testo che determinano le celle di cui verrà calcolata la media. Ad esempio, i criteri possono essere espressi come 32, "32", ">32", "mele" o B4.' },
            averageRange: { name: 'average_range', detail: 'Opzionale. Insieme effettivo di celle di cui calcolare la media. Se omesso, viene usato il valore intervallo.' },
        },
    },
    AVERAGEIFS: {
        description: 'Restituisce la media aritmetica di tutte le celle che soddisfano più criteri.',
        abstract: 'Restituisce la media aritmetica di tutte le celle che soddisfano più criteri.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/averageifs-function',
            },
        ],
        functionParameter: {
            averageRange: { name: 'average_range', detail: 'Obbligatorio. Una o più celle, di cui calcolare la media, compresi numeri o nomi, matrici o riferimenti che contengono numeri.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Intervallo1_criteri è obbligatorio, mentre gli intervalli criteri successivi sono facoltativi. Indica da 1 a 127 intervalli in cui valutare i criteri associati.' },
            criteria1: { name: 'criteria1', detail: 'Criteri1 è obbligatorio, i criteri successivi sono facoltativi. Indica da 1 a 127 criteri in forma di numeri, espressioni, riferimenti di cella o testo che determinano le celle di cui verrà calcolata la media. Ad esempio, i criteri possono essere espressi come 32, "32", ">32", "mele" o B4.' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Intervallo1_criteri è obbligatorio, mentre gli intervalli criteri successivi sono facoltativi. Indica da 1 a 127 intervalli in cui valutare i criteri associati.' },
            criteria2: { name: 'criteria2', detail: 'Criteri1 è obbligatorio, i criteri successivi sono facoltativi. Indica da 1 a 127 criteri in forma di numeri, espressioni, riferimenti di cella o testo che determinano le celle di cui verrà calcolata la media. Ad esempio, i criteri possono essere espressi come 32, "32", ">32", "mele" o B4.' },
        },
    },
    BETA_DIST: {
        description: 'La distribuzione beta viene generalmente utilizzata per lo studio su campioni delle variazioni percentuali di un elemento o di una situazione qualsiasi, quale ad esempio il numero di ore che si trascorrono quotidianamente davanti al televisore.',
        abstract: 'La distribuzione beta viene generalmente utilizzata per lo studio su campioni delle variazioni percentuali di un elemento o di una situazione qualsiasi, quale ad esempio il numero di ore che si trascorrono quotidianamente davanti al televisore.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/beta-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore compreso tra A e B in cui calcolare la funzione.' },
            alpha: { name: 'alpha', detail: 'Obbligatorio. Parametro della distribuzione.' },
            beta: { name: 'beta', detail: 'Obbligatorio. Parametro della distribuzione.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, DISTRIB.BETA.N restituirà la funzione di distribuzione cumulativa, se è FALSO restituirà la funzione densità di probabilità.' },
            A: { name: 'A', detail: 'Optional. Valore per l\'estremo inferiore dell\'intervallo di x.' },
            B: { name: 'B', detail: 'Facoltativo. Valore per l\'estremo superiore dell\'intervallo di x.' },
        },
    },
    BETA_INV: {
        description: 'Se probabilità = DISTRIB.BETA.N(x;...VERO), si avrà INV.BETA.N(probabilità;...) = x. Dati un tempo di durata e una variabilità previsti, la distribuzione beta può essere utilizzata nella pianificazione di progetti per calcolare i tempi di durata probabili.',
        abstract: 'Se probabilità = DISTRIB.BETA.N(x;...VERO), si avrà INV.BETA.N(probabilità;...) = x. Dati un tempo di durata e una variabilità previsti, la distribuzione beta può essere utilizzata nella pianificazione di progetti per calcolare i tempi di durata probabili.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/beta-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità associata alla distribuzione beta.' },
            alpha: { name: 'alpha', detail: 'Obbligatorio. Parametro della distribuzione.' },
            beta: { name: 'beta', detail: 'Obbligatorio. Parametro della distribuzione.' },
            A: { name: 'A', detail: 'Optional. Valore per l\'estremo inferiore dell\'intervallo di x.' },
            B: { name: 'B', detail: 'Facoltativo. Valore per l\'estremo superiore dell\'intervallo di x.' },
        },
    },
    BINOM_DIST: {
        description: 'Restituisce la distribuzione binomiale per il termine individuale. Utilizzare la funzione DISTRIB.BINOM.N per risolvere problemi con un numero fisso di verifiche o di prove, quando i risultati di una prova qualsiasi sono solo positivi o negativi, quando le prove sono indipendenti e quando la probabilità di successo è costante nel corso di tutto l\'esperimento. La funzione DISTRIB.BINOM.N può calcolare ad esempio la probabilità che due neonati su tre siano maschi.',
        abstract: 'Restituisce la distribuzione binomiale per il termine individuale. Utilizzare la funzione DISTRIB.BINOM.N per risolvere problemi con un numero fisso di verifiche o di prove, quando i risultati di una prova qualsiasi sono solo positivi o negativi, quando le prove sono indipendenti e quando la probabilità di successo è costante nel corso di tutto l\'esperimento. La funzione DISTRIB.BINOM.N può calcolare ad esempio la probabilità che due neonati su tre siano maschi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/binom-dist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Obbligatorio. Numero di successi in prove.' },
            trials: { name: 'trials', detail: 'Obbligatorio. Numero di prove indipendenti.' },
            probabilityS: { name: 'probability_s', detail: 'Obbligatorio. Probabilità di successo per ogni prova.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, si tratta di BINOM. DISTRIB.N restituisce la funzione distribuzione cumulativa, ovvero la probabilità che ci siano al massimo number_s successi; se è FALSO, restituirà la funzione massa di probabilità, ovvero la probabilità che siano presenti number_s successi.' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Restituisce la probabilità del risultato di una prova usando la distribuzione binomiale.',
        abstract: 'Restituisce la probabilità del risultato di una prova usando la distribuzione binomiale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/binom-dist-range-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Obbligatorio. Numero di prove indipendenti. Deve essere maggiore o uguale a 0.' },
            probabilityS: { name: 'probability_s', detail: 'Obbligatorio. Probabilità di successo per ogni prova. Deve essere maggiore o uguale a 0 e minore o uguale a 1.' },
            numberS: { name: 'number_s', detail: 'Obbligatorio. Numero di successi nelle prove. Deve essere maggiore o uguale a 0 e minore o uguale all\'argomento prove.' },
            numberS2: { name: 'number_s2', detail: 'Opzionale. Se lo si specifica, restituisce la probabilità che il numero di prove riuscite sia compreso tra num_successi e numero_s2. Deve essere maggiore o uguale all\'argomento num_successi e minore o uguale all\'argomento prove.' },
        },
    },
    BINOM_INV: {
        description: 'Restituisce il più piccolo valore per il quale la distribuzione cumulativa binomiale risulta maggiore o uguale a un valore di criterio.',
        abstract: 'Restituisce il più piccolo valore per il quale la distribuzione cumulativa binomiale risulta maggiore o uguale a un valore di criterio.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/binom-inv-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Obbligatorio. Numero delle prove di Bernoulli.' },
            probabilityS: { name: 'probability_s', detail: 'Obbligatorio. Probabilità di successo per ogni prova.' },
            alpha: { name: 'alpha', detail: 'Obbligatorio. Valore di criterio.' },
        },
    },
    CHISQ_DIST: {
        description: 'Restituisce la distribuzione del chi quadrato.',
        abstract: 'Restituisce la distribuzione del chi quadrato.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/chisq-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore in cui si desidera calcolare la distribuzione.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obbligatorio. Numero di gradi di libertà.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, DISTRIB.CHI.QUAD restituirà la funzione di distribuzione cumulativa, se è FALSO restituirà la funzione densità di probabilità.' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'La distribuzione χ2 è associata al test χ2. Utilizzare il test χ2 per confrontare i valori osservati con i valori previsti. Ad esempio, sulla base di un esperimento genetico si potrebbe ipotizzare che la gamma di colori della prossima generazione di piante sarà diversa da quella attuale. Confrontando i risultati osservati con quelli previsti, sarà possibile stabilire la validità dell\'ipotesi formulata in origine.',
        abstract: 'La distribuzione χ2 è associata al test χ2. Utilizzare il test χ2 per confrontare i valori osservati con i valori previsti. Ad esempio, sulla base di un esperimento genetico si potrebbe ipotizzare che la gamma di colori della prossima generazione di piante sarà diversa da quella attuale. Confrontando i risultati osservati con quelli previsti, sarà possibile stabilire la validità dell\'ipotesi formulata in origine.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/chisq-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore in cui si desidera calcolare la distribuzione.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obbligatorio. Numero di gradi di libertà.' },
        },
    },
    CHISQ_INV: {
        description: 'La distribuzione del chi quadrato viene generalmente utilizzata per lo studio su campioni delle variazioni percentuali di un elemento o di una situazione qualsiasi, quale ad esempio il numero di ore che si trascorrono quotidianamente davanti al televisore.',
        abstract: 'La distribuzione del chi quadrato viene generalmente utilizzata per lo studio su campioni delle variazioni percentuali di un elemento o di una situazione qualsiasi, quale ad esempio il numero di ore che si trascorrono quotidianamente davanti al televisore.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/chisq-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità associata alla distribuzione del chi quadrato.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obbligatorio. Numero di gradi di libertà.' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Se probabilità = DISTRIB.CHI.QUAD.DS(x;...), verrà restituito INV.CHI.QUAD.DS(probabilità;...) = x. Utilizzare questa funzione per confrontare i risultati osservati con quelli previsti per stabilire se l\'ipotesi formulata in origine è valida.',
        abstract: 'Se probabilità = DISTRIB.CHI.QUAD.DS(x;...), verrà restituito INV.CHI.QUAD.DS(probabilità;...) = x. Utilizzare questa funzione per confrontare i risultati osservati con quelli previsti per stabilire se l\'ipotesi formulata in origine è valida.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/chisq-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità associata alla distribuzione del chi quadrato.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obbligatorio. Numero di gradi di libertà.' },
        },
    },
    CHISQ_TEST: {
        description: 'Restituisce il test per l\'indipendenza. La funzione TEST.CHI.QUAD restituisce il valore dalla distribuzione del chi quadrato (χ2) per un dato statistico e i gradi di libertà appropriati. È possibile utilizzare i test χ2 per stabilire se i risultati previsti vengono confermati mediante un esperimento.',
        abstract: 'Restituisce il test per l\'indipendenza. La funzione TEST.CHI.QUAD restituisce il valore dalla distribuzione del chi quadrato (χ2) per un dato statistico e i gradi di libertà appropriati. È possibile utilizzare i test χ2 per stabilire se i risultati previsti vengono confermati mediante un esperimento.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/chisq-test-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Obbligatorio. Intervallo di dati che contiene le osservazioni da confrontare con i valori previsti.' },
            expectedRange: { name: 'expected_range', detail: 'Obbligatorio. Intervallo di dati che contiene la proporzione del prodotto dei totali di riga e di colonna per il totale complessivo.' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'L\'intervallo di confidenza è un intervallo di valori x ± CONFIDENZA.NORM in cui x è la media campione al centro dell\'intervallo. Se ad esempio x è la media campione dei tempi di recapito per i prodotti ordinati tramite posta, x ± CONFIDENZA.NORM è un intervallo di medie della popolazione. Per qualsiasi media della popolazione μ0 compresa in questo intervallo, la probabilità di ottenere una media campione che si discosta maggiormente da μ0 che da x è maggiore di alfa. Per qualsiasi media della popolazione μ0 non compresa in questo intervallo, la probabilità di ottenere una media campione che si discosta maggiormente da μ0 che da x è minore di alfa. In altre parole, si supponga di utilizzare x, dev_standard, dimens per creare un test a due code al livello di significatività alfa dell\'ipotesi secondo cui la media della popolazione è μ0. Tale ipotesi non verrà quindi rifiutata se μ0 è compreso nell\'intervallo di confidenza, mentre verrà respinta se μ0 non è compreso nell\'intervallo di confidenza. L\'intervallo di confidenza non consente di dedurre che esiste una probabilità 1 – alfa che il pacchetto successivo richiederà un tempo di recapito compreso nell\'intervallo di confidenza.',
        abstract: 'L\'intervallo di confidenza è un intervallo di valori x ± CONFIDENZA.NORM in cui x è la media campione al centro dell\'intervallo. Se ad esempio x è la media campione dei tempi di recapito per i prodotti ordinati tramite posta, x ± CONFIDENZA.NORM è un intervallo di medie della popolazione. Per qualsiasi media della popolazione μ0 compresa in questo intervallo, la probabilità di ottenere una media campione che si discosta maggiormente da μ0 che da x è maggiore di alfa. Per qualsiasi media della popolazione μ0 non compresa in questo intervallo, la probabilità di ottenere una media campione che si discosta maggiormente da μ0 che da x è minore di alfa. In altre parole, si supponga di utilizzare x, dev_standard, dimens per creare un test a due code al livello di significatività alfa dell\'ipotesi secondo cui la media della popolazione è μ0. Tale ipotesi non verrà quindi rifiutata se μ0 è compreso nell\'intervallo di confidenza, mentre verrà respinta se μ0 non è compreso nell\'intervallo di confidenza. L\'intervallo di confidenza non consente di dedurre che esiste una probabilità 1 – alfa che il pacchetto successivo richiederà un tempo di recapito compreso nell\'intervallo di confidenza.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/confidence-norm-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Obbligatorio. Livello di significatività utilizzato per calcolare il livello di confidenza. Il livello di probabilità è uguale a 100*(1 - alfa)% o, in altre parole, un valore alfa di 0,05 indica un livello di probabilità del 95%.' },
            standardDev: { name: 'standard_dev', detail: 'Obbligatorio. Deviazione standard della popolazione per l\'intervallo di dati e si presuppone che sia nota.' },
            size: { name: 'size', detail: 'Obbligatorio. Dimensione del campione.' },
        },
    },
    CONFIDENCE_T: {
        description: 'Restituisce l\'intervallo di confidenza per una media di popolazione utilizzando una distribuzione t di Student.',
        abstract: 'Restituisce l\'intervallo di confidenza per una media di popolazione utilizzando una distribuzione t di Student.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/confidence-t-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Obbligatorio. Livello di significatività utilizzato per calcolare il livello di confidenza. Il livello di probabilità è uguale a 100*(1 - alfa)% o, in altre parole, un valore alfa di 0,05 indica un livello di probabilità del 95%.' },
            standardDev: { name: 'standard_dev', detail: 'Obbligatorio. Deviazione standard della popolazione per l\'intervallo di dati e si presuppone che sia nota.' },
            size: { name: 'size', detail: 'Obbligatorio. Dimensione del campione.' },
        },
    },
    CORREL: {
        description: 'La funzione CORRELAZIONE restituisce il coefficiente di correlazione di due intervalli di celle. Utilizzare il coefficiente di correlazione per stabilire la relazione tra due proprietà. È possibile ad esempio esaminare la relazione tra la temperatura media di un ambiente e l\'utilizzo di condizionatori d\'aria.',
        abstract: 'La funzione CORRELAZIONE restituisce il coefficiente di correlazione di due intervalli di celle. Utilizzare il coefficiente di correlazione per stabilire la relazione tra due proprietà. È possibile ad esempio esaminare la relazione tra la temperatura media di un ambiente e l\'utilizzo di condizionatori d\'aria.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/correl-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obbligatorio. Un intervallo di valori di cella.' },
            array2: { name: 'array2', detail: 'Obbligatorio. Secondo intervallo di valori delle celle.' },
        },
    },
    COUNT: {
        description: 'La funzione CONTA.NUMERI conta il numero di celle che contengono numeri e i numeri all\'interno dell\'elenco di argomenti. Usare la funzione CONTA.NUMERI per determinare il numero di voci di un campo numerico contenuto in un intervallo o in una matrice di numeri. È ad esempio possibile immettere la formula seguente per contare i numeri nell\'intervallo A1:A20: =CONTA.NUMERI(A1:A20) . In questo esempio, se cinque celle dell\'intervallo contengono numeri, il risultato è 5 .',
        abstract: 'La funzione CONTA.NUMERI conta il numero di celle che contengono numeri e i numeri all\'interno dell\'elenco di argomenti. Usare la funzione CONTA.NUMERI per determinare il numero di voci di un campo numerico contenuto in un intervallo o in una matrice di numeri. È ad esempio possibile immettere la formula seguente per contare i numeri nell\'intervallo A1:A20: =CONTA.NUMERI(A1:A20) . In questo esempio, se cinque celle dell\'intervallo contengono numeri, il risultato è 5 .',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/count-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value 1', detail: 'Obbligatorio. Primo elemento, riferimento di cella o intervallo in cui si desidera contare i numeri.' },
            value2: { name: 'value 2', detail: 'Opzionale. Fino a 255 elementi, riferimenti di cella o intervalli aggiuntivi in cui contare i numeri.' },
        },
    },
    COUNTA: {
        description: 'La funzione CONTA.VALORI conta il numero di celle non vuote in un intervallo.',
        abstract: 'La funzione CONTA.VALORI conta il numero di celle non vuote in un intervallo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/counta-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 255 celle, intervalli di celle o valori di cui si desidera calcolare la media.' },
            value2: { name: 'value2', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 255 celle, intervalli di celle o valori di cui si desidera calcolare la media.' },
        },
    },
    COUNTBLANK: {
        description: 'Usare la funzione CONTA.VUOTE , una delle funzioni statistiche , per contare il numero di celle vuote in un intervallo di celle.',
        abstract: 'Usare la funzione CONTA.VUOTE , una delle funzioni statistiche , per contare il numero di celle vuote in un intervallo di celle.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/countblank-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Obbligatorio. Intervallo a partire dal quale si desidera contare le celle vuote.' },
        },
    },
    COUNTIF: {
        description: 'Usare CONTA.SE, una delle funzioni statistiche , per contare il numero di celle che soddisfano un determinato criterio, ad esempio per contare il numero di volte in cui una particolare città compare in un elenco clienti.',
        abstract: 'Usare CONTA.SE, una delle funzioni statistiche , per contare il numero di celle che soddisfano un determinato criterio, ad esempio per contare il numero di volte in cui una particolare città compare in un elenco clienti.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/use-the-countif-function-in-microsoft-excel',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Il gruppo di celle da contare. L\'intervallo può contenere numeri, matrici, un intervallo denominato o riferimenti che contengono numeri. Le celle vuote e i valori di testo vengono ignorati. Informazioni su come selezionare intervalli in un foglio di lavoro .' },
            criteria: { name: 'criteria', detail: 'Numero, espressione, riferimento di cella o stringa di testo che determina quali celle verranno contate. Ad esempio, è possibile usare un numero come 32, un confronto come ">32", una cella come B4 o una parola come "mele". CONTA.SE usa un solo criterio. Se si vogliono usare più criteri, usare CONTA.PIÙ.SE .' },
        },
    },
    COUNTIFS: {
        description: 'La funzione CONTA.PIÙ.SE applica criteri alle celle di più intervalli e conta il numero di volte in cui tutti i criteri vengono soddisfatti.',
        abstract: 'La funzione CONTA.PIÙ.SE applica criteri alle celle di più intervalli e conta il numero di volte in cui tutti i criteri vengono soddisfatti.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/countifs-function',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: 'criteria_range1', detail: 'Obbligatorio. Primo intervallo in cui valutare i criteri associati.' },
            criteria1: { name: 'criteria1', detail: 'Obbligatorio. Criteri in forma di numero, espressione, riferimento di cella o testo che determinano quali celle verranno contate. Ad esempio, i criteri possono essere espressi come 32, ">32", B4, "mele" o "32".' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Opzionale. Ulteriori intervalli e criteri associati. È consentito un massimo di 127 coppie intervallo/criteri.' },
            criteria2: { name: 'criteria2', detail: 'Opzionale. Ulteriori intervalli e criteri associati. È consentito un massimo di 127 coppie intervallo/criteri.' },
        },
    },
    COVARIANCE_P: {
        description: 'Restituisce la covarianza della popolazione, vale a dire la media dei prodotti delle deviazioni di ciascuna coppia di dati in due set di dati. La covarianza consente di determinare la relazione che sussiste tra due set di dati. È possibile ad esempio stabilire se a un reddito superiore corrispondano livelli di istruzione superiori.',
        abstract: 'Restituisce la covarianza della popolazione, vale a dire la media dei prodotti delle deviazioni di ciascuna coppia di dati in due set di dati. La covarianza consente di determinare la relazione che sussiste tra due set di dati. È possibile ad esempio stabilire se a un reddito superiore corrispondano livelli di istruzione superiori.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/covariance-p-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obbligatorio. Primo intervallo di celle costituito da interi.' },
            array2: { name: 'array2', detail: 'Obbligatorio. Secondo intervallo di celle costituito da interi.' },
        },
    },
    COVARIANCE_S: {
        description: 'Restituisce la covarianza del campione, ovvero la media dei prodotti delle deviazioni di ogni coppia di coordinate in due set di dati.',
        abstract: 'Restituisce la covarianza del campione, ovvero la media dei prodotti delle deviazioni di ogni coppia di coordinate in due set di dati.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/covariance-s-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obbligatorio. Primo intervallo di celle costituito da interi.' },
            array2: { name: 'array2', detail: 'Obbligatorio. Secondo intervallo di celle costituito da interi.' },
        },
    },
    DEVSQ: {
        description: 'Restituisce la somma dei quadrati delle deviazioni dei dati dalla relativa media campione.',
        abstract: 'Restituisce la somma dei quadrati delle deviazioni dei dati dalla relativa media campione.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/devsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 argomenti di cui si desidera calcolare la somma delle deviazioni quadrate. Anziché argomenti separati da punti e virgola, è inoltre possibile utilizzare una matrice o un riferimento a una matrice.' },
            number2: { name: 'number2', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 argomenti di cui si desidera calcolare la somma delle deviazioni quadrate. Anziché argomenti separati da punti e virgola, è inoltre possibile utilizzare una matrice o un riferimento a una matrice.' },
        },
    },
    EXPON_DIST: {
        description: 'Restituisce la distribuzione esponenziale. Utilizzare la funzione DISTRIB.EXP.N per calcolare il tempo che intercorre tra due eventi, quale il tempo impiegato da uno sportello automatico per fornire la somma in contanti richiesta. È possibile ad esempio utilizzare questa funzione per determinare la probabilità che questa operazione richieda al massimo un minuto.',
        abstract: 'Restituisce la distribuzione esponenziale. Utilizzare la funzione DISTRIB.EXP.N per calcolare il tempo che intercorre tra due eventi, quale il tempo impiegato da uno sportello automatico per fornire la somma in contanti richiesta. È possibile ad esempio utilizzare questa funzione per determinare la probabilità che questa operazione richieda al massimo un minuto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/expon-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore della funzione.' },
            lambda: { name: 'lambda', detail: 'Obbligatorio. Valore del parametro.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che indica la forma della funzione esponenziale. Se cumulativo è VERO, DISTRIB.EXP.N restituirà la funzione distribuzione cumulativa, se è FALSO restituirà la funzione densità di probabilità.' },
        },
    },
    F_DIST: {
        description: 'Restituisce la distribuzione di probabilità F. È possibile utilizzare questa funzione per determinare se due set di dati presentano gradi di diversità differenti. Ad esempio, è possibile esaminare i punteggi dei test per l\'ingresso di uomini e donne al liceo e determinare se la variabilità delle donne è diversa da quella riscontrata nei maschi.',
        abstract: 'Restituisce la distribuzione di probabilità F. È possibile utilizzare questa funzione per determinare se due set di dati presentano gradi di diversità differenti. Ad esempio, è possibile esaminare i punteggi dei test per l\'ingresso di uomini e donne al liceo e determinare se la variabilità delle donne è diversa da quella riscontrata nei maschi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/f-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore in cui calcolare la funzione.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obbligatorio. Gradi di libertà al numeratore.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obbligatorio. Gradi di libertà al denominatore.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, DISTRIBF restituirà la funzione di distribuzione cumulativa, se è FALSO restituirà la funzione densità di probabilità.' },
        },
    },
    F_DIST_RT: {
        description: 'Restituisce la distribuzione di probabilità F (coda destra) (grado di diversità) per due set di dati. È possibile utilizzare questa funzione per determinare se due set di dati presentano gradi di diversità differenti. È possibile ad esempio esaminare i punteggi dei test per l\'ammissione all\'università assegnati a studentesse e a studenti e stabilire se esistono differenze di variabilità tra il gruppo femminile e quello maschile.',
        abstract: 'Restituisce la distribuzione di probabilità F (coda destra) (grado di diversità) per due set di dati. È possibile utilizzare questa funzione per determinare se due set di dati presentano gradi di diversità differenti. È possibile ad esempio esaminare i punteggi dei test per l\'ammissione all\'università assegnati a studentesse e a studenti e stabilire se esistono differenze di variabilità tra il gruppo femminile e quello maschile.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/f-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore in cui calcolare la funzione.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obbligatorio. Gradi di libertà al numeratore.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obbligatorio. Gradi di libertà al denominatore.' },
        },
    },
    F_INV: {
        description: 'Restituisce l\'inversa della distribuzione di probabilità F. Se p = DISTRIB.F.N(x,...), inV.F(p,...) = x. La distribuzione F può essere usata in un test F che confronta il grado di variabilità di due set di dati. È possibile ad esempio analizzare la distribuzione del reddito in Italia e in Francia per stabilire se i due paesi hanno un grado di diversità di reddito simile.',
        abstract: 'Restituisce l\'inversa della distribuzione di probabilità F. Se p = DISTRIB.F.N(x,...), inV.F(p,...) = x. La distribuzione F può essere usata in un test F che confronta il grado di variabilità di due set di dati. È possibile ad esempio analizzare la distribuzione del reddito in Italia e in Francia per stabilire se i due paesi hanno un grado di diversità di reddito simile.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/f-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità associata alla distribuzione cumulativa F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obbligatorio. Gradi di libertà al numeratore.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obbligatorio. Gradi di libertà al denominatore.' },
        },
    },
    F_INV_RT: {
        description: 'Restituisce l\'inversa della distribuzione di probabilità F (coda destra). Se p = DISTRIB.F.DS(x;...), si avrà INV.F.DS(p;...) = x. La distribuzione F può essere usata in un test F che confronta il grado di variabilità di due set di dati. È possibile ad esempio analizzare la distribuzione del reddito in Italia e in Francia per stabilire se i due paesi hanno un grado di diversità di reddito simile.',
        abstract: 'Restituisce l\'inversa della distribuzione di probabilità F (coda destra). Se p = DISTRIB.F.DS(x;...), si avrà INV.F.DS(p;...) = x. La distribuzione F può essere usata in un test F che confronta il grado di variabilità di due set di dati. È possibile ad esempio analizzare la distribuzione del reddito in Italia e in Francia per stabilire se i due paesi hanno un grado di diversità di reddito simile.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/f-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità associata alla distribuzione cumulativa F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obbligatorio. Gradi di libertà al numeratore.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obbligatorio. Gradi di libertà al denominatore.' },
        },
    },
    F_TEST: {
        description: 'Utilizzare questa funzione per determinare se due campioni hanno varianze diverse. Ad esempio, sulla base dei punteggi di un test effettuato in scuole pubbliche e private, è possibile verificare se la diversità dei punteggi del test di queste scuole si estende su più livelli.',
        abstract: 'Utilizzare questa funzione per determinare se due campioni hanno varianze diverse. Ad esempio, sulla base dei punteggi di un test effettuato in scuole pubbliche e private, è possibile verificare se la diversità dei punteggi del test di queste scuole si estende su più livelli.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/f-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obbligatorio. Prima matrice o primo intervallo di dati.' },
            array2: { name: 'array2', detail: 'Obbligatorio. Seconda matrice o secondo intervallo di dati.' },
        },
    },
    FISHER: {
        description: 'Restituisce la trasformazione di Fisher a x. Questa trasformazione genera una funzione caratterizzata da una distribuzione più uniforme che asimmetrica. Utilizzare questa funzione per eseguire una verifica di ipotesi sul coefficiente di correlazione.',
        abstract: 'Restituisce la trasformazione di Fisher a x. Questa trasformazione genera una funzione caratterizzata da una distribuzione più uniforme che asimmetrica. Utilizzare questa funzione per eseguire una verifica di ipotesi sul coefficiente di correlazione.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/fisher-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore numerico per il quale si desidera eseguire la trasformazione.' },
        },
    },
    FISHERINV: {
        description: 'Restituisce l\'inversa della trasformazione di Fisher. Utilizzare questa trasformazione durante l\'analisi delle correlazioni tra intervalli o matrici di dati. Se y = FISHER(x), si avrà INV.FISHER(y) = x.',
        abstract: 'Restituisce l\'inversa della trasformazione di Fisher. Utilizzare questa trasformazione durante l\'analisi delle correlazioni tra intervalli o matrici di dati. Se y = FISHER(x), si avrà INV.FISHER(y) = x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/fisherinv-function',
            },
        ],
        functionParameter: {
            y: { name: 'y', detail: 'Obbligatorio. Valore per il quale si desidera eseguire l\'inversa della trasformazione.' },
        },
    },
    FORECAST: {
        description: 'Calcolare o prevedere un valore futuro usando valori esistenti. Il valore futuro è un valore y per un valore x specificato. I valori esistenti sono valori x e y noti e il valore futuro viene previsto usando la regressione lineare. È possibile usare queste funzioni per prevedere le vendite future, i requisiti di inventario o le tendenze dei consumatori.',
        abstract: 'Calcolare o prevedere un valore futuro usando valori esistenti. Il valore futuro è un valore y per un valore x specificato. I valori esistenti sono valori x e y noti e il valore futuro viene previsto usando la regressione lineare. È possibile usare queste funzioni per prevedere le vendite future, i requisiti di inventario o le tendenze dei consumatori.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'sì Coordinata di cui si desidera prevedere un valore.' },
            knownYs: { name: 'known_y\'s', detail: 'sì Matrice o intervallo di dati dipendente.' },
            knownXs: { name: 'known_x\'s', detail: 'sì Matrice o intervallo di dati indipendente.' },
        },
    },
    FORECAST_ETS: {
        description: 'Prevede un valore futuro in base ai valori esistenti usando una versione AAA dell\'algoritmo di livellamento esponenziale ETS.',
        abstract: 'Prevede un valore futuro in base ai valori esistenti usando una versione AAA dell\'algoritmo di livellamento esponenziale ETS.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Data obiettivo', detail: 'Il punto dati per il quale prevedere un valore.' },
            values: { name: 'Valori', detail: 'I valori cronologici usati per la previsione.' },
            timeline: { name: 'Sequenza temporale', detail: 'Un intervallo o una matrice indipendente di date o ore numeriche con passo costante.' },
            seasonality: { name: 'Stagionalità', detail: 'Facoltativo. Lunghezza stagionale; 1 per il rilevamento automatico e 0 senza stagionalità.' },
            dataCompletion: { name: 'Completamento dati', detail: 'Facoltativo. Usare 1 per interpolare i punti mancanti o 0 per considerarli zero.' },
            aggregation: { name: 'Aggregazione', detail: 'Facoltativo. Un valore da 1 a 7 specifica come aggregare timestamp duplicati.' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Restituisce l\'intervallo di confidenza per un valore futuro previsto usando una versione AAA dell\'algoritmo ETS.',
        abstract: 'Restituisce l\'intervallo di confidenza per un valore futuro previsto usando una versione AAA dell\'algoritmo ETS.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Data obiettivo', detail: 'Il punto dati per il quale prevedere un valore.' },
            values: { name: 'Valori', detail: 'I valori cronologici usati per la previsione.' },
            timeline: { name: 'Sequenza temporale', detail: 'Un intervallo o una matrice indipendente di date o ore numeriche con passo costante.' },
            confidenceLevel: { name: 'Livello di confidenza', detail: 'Facoltativo. Un numero tra 0 e 1; il valore predefinito è 0,95.' },
            seasonality: { name: 'Stagionalità', detail: 'Facoltativo. Lunghezza stagionale; 1 per il rilevamento automatico e 0 senza stagionalità.' },
            dataCompletion: { name: 'Completamento dati', detail: 'Facoltativo. Usare 1 per interpolare i punti mancanti o 0 per considerarli zero.' },
            aggregation: { name: 'Aggregazione', detail: 'Facoltativo. Un valore da 1 a 7 specifica come aggregare timestamp duplicati.' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Restituisce la durata del modello stagionale rilevato dall\'algoritmo ETS.',
        abstract: 'Restituisce la durata del modello stagionale rilevato dall\'algoritmo ETS.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: 'Valori', detail: 'I valori cronologici usati per la previsione.' },
            timeline: { name: 'Sequenza temporale', detail: 'Un intervallo o una matrice indipendente di date o ore numeriche con passo costante.' },
            dataCompletion: { name: 'Completamento dati', detail: 'Facoltativo. Usare 1 per interpolare i punti mancanti o 0 per considerarli zero.' },
            aggregation: { name: 'Aggregazione', detail: 'Facoltativo. Un valore da 1 a 7 specifica come aggregare timestamp duplicati.' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Restituisce un valore statistico risultante dalla previsione di serie temporali usando una versione AAA dell\'algoritmo ETS.',
        abstract: 'Restituisce un valore statistico risultante dalla previsione di serie temporali usando una versione AAA dell\'algoritmo ETS.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: 'Valori', detail: 'I valori cronologici usati per la previsione.' },
            timeline: { name: 'Sequenza temporale', detail: 'Un intervallo o una matrice indipendente di date o ore numeriche con passo costante.' },
            statisticType: { name: 'Tipo di statistica', detail: 'Un valore da 1 a 8 specifica la statistica di previsione da restituire.' },
            seasonality: { name: 'Stagionalità', detail: 'Facoltativo. Lunghezza stagionale; 1 per il rilevamento automatico e 0 senza stagionalità.' },
            dataCompletion: { name: 'Completamento dati', detail: 'Facoltativo. Usare 1 per interpolare i punti mancanti o 0 per considerarli zero.' },
            aggregation: { name: 'Aggregazione', detail: 'Facoltativo. Un valore da 1 a 7 specifica come aggregare timestamp duplicati.' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Calcolare o prevedere un valore futuro usando valori esistenti. Il valore futuro è un valore y per un valore x specificato. I valori esistenti sono valori x e y noti e il valore futuro viene previsto usando la regressione lineare. È possibile usare queste funzioni per prevedere le vendite future, i requisiti di inventario o le tendenze dei consumatori.',
        abstract: 'Calcolare o prevedere un valore futuro usando valori esistenti. Il valore futuro è un valore y per un valore x specificato. I valori esistenti sono valori x e y noti e il valore futuro viene previsto usando la regressione lineare. È possibile usare queste funzioni per prevedere le vendite future, i requisiti di inventario o le tendenze dei consumatori.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'sì Coordinata di cui si desidera prevedere un valore.' },
            knownYs: { name: 'known_y\'s', detail: 'sì Matrice o intervallo di dati dipendente.' },
            knownXs: { name: 'known_x\'s', detail: 'sì Matrice o intervallo di dati indipendente.' },
        },
    },
    FREQUENCY: {
        description: 'La funzione FREQUENZA calcola la frequenza con cui i valori si verificano all\'interno di un intervallo di valori e quindi restituisce una matrice verticale di numeri. È ad esempio possibile usare FREQUENZA per contare il numero di test che ottengono un punteggio compreso in un dato intervallo. Dal momento che FREQUENZA restituisce una matrice, deve essere immessa come formula in forma di matrice.',
        abstract: 'La funzione FREQUENZA calcola la frequenza con cui i valori si verificano all\'interno di un intervallo di valori e quindi restituisce una matrice verticale di numeri. È ad esempio possibile usare FREQUENZA per contare il numero di test che ottengono un punteggio compreso in un dato intervallo. Dal momento che FREQUENZA restituisce una matrice, deve essere immessa come formula in forma di matrice.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/frequency-function',
            },
        ],
        functionParameter: {
            dataArray: { name: 'data_array', detail: 'Obbligatorio. Matrice o riferimento a un insieme di valori di cui si desidera calcolare la frequenza. Se matrice_dati non contiene alcun valore, FREQUENZA restituirà una matrice di zeri.' },
            binsArray: { name: 'bins_array', detail: 'Obbligatorio. Matrice o riferimento agli intervalli in cui si desidera raggruppare i valori contenuti in matrice_dati. Se matrice_classi non contiene alcun valore, FREQUENZA restituirà il numero degli elementi contenuti in matrice_dati.' },
        },
    },
    GAMMA: {
        description: 'Restituisce il valore di funzione GAMMA.',
        abstract: 'Restituisce il valore di funzione GAMMA.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/gamma-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Restituisce un numero.' },
        },
    },
    GAMMA_DIST: {
        description: 'Restituisce la distribuzione gamma. È possibile utilizzare questa funzione per studiare le variabili che potrebbero avere una distribuzione asimmetrica. La distribuzione gamma viene in genere utilizzata nell\'analisi delle code.',
        abstract: 'Restituisce la distribuzione gamma. È possibile utilizzare questa funzione per studiare le variabili che potrebbero avere una distribuzione asimmetrica. La distribuzione gamma viene in genere utilizzata nell\'analisi delle code.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/gamma-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore in cui si desidera calcolare la distribuzione.' },
            alpha: { name: 'alpha', detail: 'Obbligatorio. Parametro per la distribuzione.' },
            beta: { name: 'beta', detail: 'Obbligatorio. Parametro per la distribuzione. Se beta = 1, DISTRIB.GAMMA.N restituirà la distribuzione gamma standard.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, DISTRIB.GAMMA.N restituirà la funzione di distribuzione cumulativa, se è FALSO restituirà la funzione densità di probabilità.' },
        },
    },
    GAMMA_INV: {
        description: 'Restituisce l\'inversa della distribuzione cumulativa gamma. Se p = DISTRIB.GAMMA.N(x;...), si avrà INV.GAMMA.N(p;...) = x. È possibile usare questa funzione per studiare una variabile la cui distribuzione potrebbe essere asimmetrica.',
        abstract: 'Restituisce l\'inversa della distribuzione cumulativa gamma. Se p = DISTRIB.GAMMA.N(x;...), si avrà INV.GAMMA.N(p;...) = x. È possibile usare questa funzione per studiare una variabile la cui distribuzione potrebbe essere asimmetrica.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/gamma-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità associata alla distribuzione gamma.' },
            alpha: { name: 'alpha', detail: 'Obbligatorio. Parametro per la distribuzione.' },
            beta: { name: 'beta', detail: 'Obbligatorio. Parametro per la distribuzione. Se beta = 1, INV.GAMMA.N restituirà la distribuzione gamma standard.' },
        },
    },
    GAMMALN: {
        description: 'Restituisce il logaritmo naturale di una funzione gamma, Γ(x).',
        abstract: 'Restituisce il logaritmo naturale di una funzione gamma, Γ(x).',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/gammaln-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore per il quale si desidera calcolare LN.GAMMA.' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'Restituisce il logaritmo naturale di una funzione gamma, Γ(x).',
        abstract: 'Restituisce il logaritmo naturale di una funzione gamma, Γ(x).',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/gammaln-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore per il quale si desidera calcolare LN.GAMMA.PRECISA.' },
        },
    },
    GAUSS: {
        description: 'Calcola la probabilità che un membro di una popolazione normale standard sia compreso tra la deviazione media e la deviazione standard z rispetto alla media.',
        abstract: 'Calcola la probabilità che un membro di una popolazione normale standard sia compreso tra la deviazione media e la deviazione standard z rispetto alla media.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/gauss-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Obbligatorio. Restituisce un numero.' },
        },
    },
    GEOMEAN: {
        description: 'Restituisce la media geometrica di una matrice o di un intervallo di dati positivi. È possibile, ad esempio, utilizzare la funzione MEDIA.GEOMETRICA per calcolare il tasso di crescita media in base a un interesse composto con tassi variabili.',
        abstract: 'Restituisce la media geometrica di una matrice o di un intervallo di dati positivi. È possibile, ad esempio, utilizzare la funzione MEDIA.GEOMETRICA per calcolare il tasso di crescita media in base a un interesse composto con tassi variabili.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/geomean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 argomenti di cui si desidera calcolare il valore medio. Anziché argomenti separati da punti e virgola, è inoltre possibile utilizzare una matrice o un riferimento a una matrice.' },
            number2: { name: 'number2', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 argomenti di cui si desidera calcolare il valore medio. Anziché argomenti separati da punti e virgola, è inoltre possibile utilizzare una matrice o un riferimento a una matrice.' },
        },
    },
    GROWTH: {
        description: 'Calcola la crescita esponenziale prevista in base ai dati esistenti. CRESCITA restituisce i valori y corrispondenti a una serie di valori x nuovi, specificati in base a valori x e y esistenti. È inoltre possibile utilizzare la funzione del foglio di lavoro CRESCITA per adattare una curva esponenziale a valori x e y esistenti.',
        abstract: 'Calcola la crescita esponenziale prevista in base ai dati esistenti. CRESCITA restituisce i valori y corrispondenti a una serie di valori x nuovi, specificati in base a valori x e y esistenti. È inoltre possibile utilizzare la funzione del foglio di lavoro CRESCITA per adattare una curva esponenziale a valori x e y esistenti.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/growth-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obbligatorio. Insieme dei valori y già noti dalla relazione y = b*m^x. Se la matrice y_nota è in una singola colonna, ogni colonna di x_nota verrà interpretata come una variabile distinta. Se la matrice y_nota è in una singola riga, ogni riga di x_nota verrà interpretata come una variabile distinta. Se uno dei numeri in known_y è 0 o negativo, CRESCITA restituirà il #NUM! .' },
            knownXs: { name: 'known_x\'s', detail: 'Opzionale. Insieme facoltativo di valori x che possono essere già noti dalla relazione y = b*m^x. La matrice x_nota può comprendere uno o più insiemi di variabili. Se viene utilizzata una sola variabile, y_note e x_note potranno essere intervalli di forma qualsiasi, purché con dimensioni uguali. Se vengono utilizzate più variabili, y_note dovrà essere un vettore, ovvero un intervallo con altezza di una riga o larghezza di una colonna. Se x_note è omesso, verrà considerato uguale alla matrice {1;2;3;...} che ha le stesse dimensioni di y_note.' },
            newXs: { name: 'new_x\'s', detail: 'Opzionale. Nuovi valori x per i quali CRESCITA restituirà i valori y corrispondenti. Analogamente a x_nota, nuova_x deve includere una colonna (o una riga) per ciascuna variabile indipendente. Di conseguenza, se Y_nota è in una singola colonna, X_nota e Nuova_x dovrebbero avere lo stesso numero di colonne. Se y_nota è in una singola riga, x_nota e nuova_x dovrebbero avere lo stesso numero di righe. Se nuova_x è omesso, verrà considerato uguale a x_nota. Se entrambi x_nota e nuova_x sono omessi, verranno considerati uguali alla matrice {1;2;3;...} che ha le stesse dimensioni di y_nota.' },
            constb: { name: 'const', detail: 'Opzionale. Valore logico che specifica se la costante b deve essere uguale a 1. Se cost è VERO o è omesso, b verrà calcolata secondo la normale procedura. Se cost è FALSO, b verrà impostata a 1 e i valori m verranno corretti in modo che y = m^x.' },
        },
    },
    HARMEAN: {
        description: 'Restituisce la media armonica di un set di dati. La media armonica è il reciproco della media aritmetica dei reciproci.',
        abstract: 'Restituisce la media armonica di un set di dati. La media armonica è il reciproco della media aritmetica dei reciproci.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/harmean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 argomenti di cui si desidera calcolare il valore medio. Anziché argomenti separati da punti e virgola, è inoltre possibile utilizzare una matrice o un riferimento a una matrice.' },
            number2: { name: 'number2', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 argomenti di cui si desidera calcolare il valore medio. Anziché argomenti separati da punti e virgola, è inoltre possibile utilizzare una matrice o un riferimento a una matrice.' },
        },
    },
    HYPGEOM_DIST: {
        description: 'Restituisce la distribuzione ipergeometrica. DISTRIB.IPERGEOM.N restituisce la probabilità di un dato numero di successi campione in base alla dimensione del campione, ai successi e alla dimensione della popolazione. Usare la funzione DISTRIB.IPERGEOM.N per risolvere i problemi con una popolazione limitata, dove ciascuna osservazione può essere tanto un successo quanto un insuccesso e dove ciascun sottoinsieme di una data dimensione viene scelto con uguale probabilità.',
        abstract: 'Restituisce la distribuzione ipergeometrica. DISTRIB.IPERGEOM.N restituisce la probabilità di un dato numero di successi campione in base alla dimensione del campione, ai successi e alla dimensione della popolazione. Usare la funzione DISTRIB.IPERGEOM.N per risolvere i problemi con una popolazione limitata, dove ciascuna osservazione può essere tanto un successo quanto un insuccesso e dove ciascun sottoinsieme di una data dimensione viene scelto con uguale probabilità.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/hypgeom-dist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Obbligatorio. Numero di successi nel campione.' },
            numberSample: { name: 'number_sample', detail: 'Obbligatorio. Dimensione del campione.' },
            populationS: { name: 'population_s', detail: 'Obbligatorio. Numero di successi nella popolazione.' },
            numberPop: { name: 'number_pop', detail: 'Obbligatorio. Dimensione della popolazione.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, DISTRIB.IPERGEOM.N restituirà la funzione di distribuzione cumulativa, se è FALSO restituirà la funzione massa di probabilità.' },
        },
    },
    INTERCEPT: {
        description: 'Calcola il punto in cui una retta interseca l\'asse y utilizzando i valori x e y esistenti. Tale punto è basato su una retta di regressione lineare ottimale tracciata attraverso i valori x_nota e y_nota. Utilizzare la funzione INTERCETTA per determinare il valore della variabile dipendente nel caso in cui la variabile indipendente sia uguale a 0 (zero). Ad esempio, è possibile utilizzare la funzione INTERCETTA per stimare la resistenza elettrica di un metallo alla temperatura di 0° C nel caso in cui i dati disponibili siano stati rilevati a temperature ambiente e a temperature superiori.',
        abstract: 'Calcola il punto in cui una retta interseca l\'asse y utilizzando i valori x e y esistenti. Tale punto è basato su una retta di regressione lineare ottimale tracciata attraverso i valori x_nota e y_nota. Utilizzare la funzione INTERCETTA per determinare il valore della variabile dipendente nel caso in cui la variabile indipendente sia uguale a 0 (zero). Ad esempio, è possibile utilizzare la funzione INTERCETTA per stimare la resistenza elettrica di un metallo alla temperatura di 0° C nel caso in cui i dati disponibili siano stati rilevati a temperature ambiente e a temperature superiori.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/intercept-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obbligatorio. Insieme dipendente di osservazioni o di dati.' },
            knownXs: { name: 'known_x\'s', detail: 'Obbligatorio. Insieme indipendente di osservazioni o dati.' },
        },
    },
    KURT: {
        description: 'Restituisce la curtosi di un set di dati.',
        abstract: 'Restituisce la curtosi di un set di dati.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/kurt-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Primo numero, riferimento di cella o intervallo di cui si desidera calcolare la curtosi.' },
            number2: { name: 'number2', detail: 'Numeri, riferimenti di cella o intervalli aggiuntivi di cui si desidera calcolare la curtosi, fino a un massimo di 255.' },
        },
    },
    LARGE: {
        description: 'Restituisce il k-esimo valore più grande in un set di dati. È possibile usare questa funzione per selezionare un valore in base alla sua condizione relativa. Ad esempio, è possibile usare GRANDE per restituire il punteggio più alto, secondo o terzo posto.',
        abstract: 'Restituisce il k-esimo valore più grande in un set di dati. È possibile usare questa funzione per selezionare un valore in base alla sua condizione relativa. Ad esempio, è possibile usare GRANDE per restituire il punteggio più alto, secondo o terzo posto.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/large-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice o intervallo di dati di cui si desidera determinare il k-esimo valore più grande.' },
            k: { name: 'k', detail: 'Obbligatorio. Posizione, partendo dal valore più grande, nella matrice o nell\'intervallo di celle dei dati da restituire.' },
        },
    },
    LINEST: {
        description: 'La funzione REGR.LIN calcola le statistiche per una linea utilizzando il metodo dei minimi quadrati per calcolare la retta che meglio rappresenta i dati e restituisce una matrice che descrive la retta. È inoltre possibile combinare REGR.LIN con altre funzioni per calcolare le statistiche per altri tipi di modelli con parametri sconosciuti lineari, come le serie polinomiali, logaritmiche, esponenziali e di potenze. Dal momento che questa funzione restituisce una matrice di valori, deve essere immessa come formula in forma di matrice. Le istruzioni sono riportate dopo gli esempi di questo articolo.',
        abstract: 'La funzione REGR.LIN calcola le statistiche per una linea utilizzando il metodo dei minimi quadrati per calcolare la retta che meglio rappresenta i dati e restituisce una matrice che descrive la retta. È inoltre possibile combinare REGR.LIN con altre funzioni per calcolare le statistiche per altri tipi di modelli con parametri sconosciuti lineari, come le serie polinomiali, logaritmiche, esponenziali e di potenze. Dal momento che questa funzione restituisce una matrice di valori, deve essere immessa come formula in forma di matrice. Le istruzioni sono riportate dopo gli esempi di questo articolo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/linest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obbligatorio. Insieme dei valori y già noti nella relazione y = mx + b. Se l\'intervallo di known_y si trova in una singola colonna, ogni colonna di known_x viene interpretata come una variabile distinta. Se l\'intervallo di known_y è contenuto in una singola riga, ogni riga di known_x viene interpretata come una variabile distinta.' },
            knownXs: { name: 'known_x\'s', detail: 'Opzionale. Insieme dei valori x che possono essere già noti nella relazione y = mx + b. L\'intervallo di known_x può includere uno o più set di variabili. Se viene usata una sola variabile, known_y e known_x possono essere intervalli di qualsiasi forma, purché abbiano dimensioni uguali. Se vengono utilizzate più variabili, known_y deve essere un vettore, ovvero un intervallo con altezza di una riga o larghezza di una colonna. Se known_x\'s viene omesso, verrà considerato uguale alla matrice {1,2,3,...} che ha le stesse dimensioni di known_y .' },
            constb: { name: 'const', detail: 'Opzionale. Valore logico che specifica se la costante b deve essere uguale a 0. Se cost è VERO o è omesso, b verrà calcolata normalmente. Se cost è FALSO, b verrà impostata su 0 e i valori m verranno adattati a y = mx.' },
            stats: { name: 'stats', detail: 'Opzionale. Valore logico che specifica se restituire statistiche aggiuntive di regressione. Se stat è VERO, REGR.LIN restituirà le statistiche aggiuntive di regressione; di conseguenza, la matrice restituita è {mn,mn-1,...,m1,b; sen,sen-1,...,se1,seb; r 2 , sey; F;gdl; ssreg,ssresid} . Se stat è FALSO o è omesso, REGR.LIN restituirà solo i coefficienti m e la costante b. Le statistiche aggiuntive di regressione sono le seguenti:' },
        },
    },
    LOGEST: {
        description: 'L\'equazione della curva è:',
        abstract: 'L\'equazione della curva è:',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/logest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Obbligatorio. Insieme dei valori y già noti dalla relazione y = b*m^x. Se la matrice y_nota è in una singola colonna, ogni colonna di x_nota verrà interpretata come una variabile distinta. Se la matrice y_note è in una singola riga, ogni riga di x_note verrà interpretata come una variabile distinta.' },
            knownXs: { name: 'known_x\'s', detail: 'Opzionale. Insieme facoltativo di valori x che possono essere già noti dalla relazione y = b*m^x. La matrice x_nota può comprendere uno o più insiemi di variabili. Se viene utilizzata una sola variabile, y_nota e x_nota potranno essere intervalli di forma qualsiasi, purché con dimensioni uguali. Se vengono utilizzate più variabili, y_nota dovrà essere un intervallo di celle con altezza di una riga o larghezza di una colonna, denominato anche vettore. Se x_nota è omesso, verrà considerato uguale alla matrice {1;2;3;...} che ha le stesse dimensioni di y_nota.' },
            constb: { name: 'const', detail: 'Opzionale. Valore logico che specifica se la costante b deve essere uguale a 1. Se cost è VERO o è omesso, b verrà calcolata secondo la normale procedura. Se cost è FALSO, b verrà impostata a 1 e i valori m verranno corretti in modo che y = m^x.' },
            stats: { name: 'stats', detail: 'Opzionale. Valore logico che specifica se restituire statistiche aggiuntive di regressione. Se stat è VERO, REGR.LOG restituirà le statistiche aggiuntive di regressione. Di conseguenza, la matrice restituita sarà {mn;mn-1;...;m1;b\\sn;sn-1;...;s1;sb\\r 2;sy\\ F;gdl\\sqreg;sqres}. Se stat è FALSO o è omesso, REGR.LOG restituirà solo i coefficienti m e la costante b.' },
        },
    },
    LOGNORM_DIST: {
        description: 'Utilizzare questa funzione per analizzare i dati che sono stati trasformati in logaritmi.',
        abstract: 'Utilizzare questa funzione per analizzare i dati che sono stati trasformati in logaritmi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/lognorm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore in cui calcolare la funzione.' },
            mean: { name: 'mean', detail: 'Obbligatorio. Media di ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Obbligatorio. Deviazione standard di ln(x).' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, DISTRIB.LOGNORM.N restituirà la funzione di distribuzione cumulativa, se è FALSO restituirà la funzione densità di probabilità.' },
        },
    },
    LOGNORM_INV: {
        description: 'Restituisce l\'inversa della distribuzione lognormale cumulativa.',
        abstract: 'Restituisce l\'inversa della distribuzione lognormale cumulativa.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Probabilità corrispondente alla distribuzione lognormale.' },
            mean: { name: 'mean', detail: 'Media aritmetica della distribuzione.' },
            standardDev: { name: 'standard_dev', detail: 'Deviazione standard della distribuzione.' },
        },
    },
    MARGINOFERROR: {
        description: 'Questa funzione calcola il margine di errore da un intervallo di valori e da un livello di confidenza.',
        abstract: 'Questa funzione calcola il margine di errore da un intervallo di valori e da un livello di confidenza.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/12487850?hl=it',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Intervallo di valori usato per calcolare il margine di errore.' },
            confidence: { name: 'confidence', detail: 'Livello di confidenza desiderato compreso tra 0 e 1.' },
        },
    },
    MAX: {
        description: 'Restituisce il valore maggiore di un insieme di valori.',
        abstract: 'Restituisce il valore maggiore di un insieme di valori.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/max-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 numeri tra cui si desidera individuare il valore massimo.' },
            number2: { name: 'number2', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 numeri tra cui si desidera individuare il valore massimo.' },
        },
    },
    MAXA: {
        description: 'Restituisce il valore più grande di un elenco di argomenti.',
        abstract: 'Restituisce il valore più grande di un elenco di argomenti.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/maxa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Obbligatorio. Il primo argomento numerico di quelli tra cui si desidera individuare il più grande.' },
            value2: { name: 'value2', detail: 'Opzionale. Argomenti numerici da 2 a 255 tra cui si desidera individuare il più grande.' },
        },
    },
    MAXIFS: {
        description: 'La funzione MAX.PIÙ.SE restituisce il valore massimo tra le celle specificate da un dato set di condizioni o criteri.',
        abstract: 'La funzione MAX.PIÙ.SE restituisce il valore massimo tra le celle specificate da un dato set di condizioni o criteri.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/maxifs-function',
            },
        ],
        functionParameter: {
            maxRange: { name: 'sum_range', detail: 'L\'intervallo effettivo di celle in cui verrà determinato il valore massimo.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Il set di celle da valutare con i criteri.' },
            criteria1: { name: 'criteria1', detail: 'I criteri sotto forma di numero, espressione o testo che definiscono quali celle valutare come massimo. Lo stesso set di criteri è supportato per le funzioni MIN.PIÙ.SE , SOMMA.PIÙ.SE e MEDIA.PIÙ.SE .' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Altri intervalli e criteri associati. È possibile immettere fino a 126 coppie di intervalli/criteri.' },
            criteria2: { name: 'criteria2', detail: 'Altri intervalli e criteri associati. È possibile immettere fino a 126 coppie di intervalli/criteri.' },
        },
    },
    MEDIAN: {
        description: 'Restituisce la mediana dei numeri specificati. La mediana è il numero che occupa la posizione centrale di un insieme di numeri.',
        abstract: 'Restituisce la mediana dei numeri specificati. La mediana è il numero che occupa la posizione centrale di un insieme di numeri.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/median-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 numeri per cui si desidera calcolare il valore mediano.' },
            number2: { name: 'number2', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 numeri per cui si desidera calcolare il valore mediano.' },
        },
    },
    MIN: {
        description: 'Restituisce il numero più piccolo di un insieme di valori.',
        abstract: 'Restituisce il numero più piccolo di un insieme di valori.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/min-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Num1 è facoltativo, i numeri successivi sono facoltativi. Da 1 a 255 numeri tra cui si desidera individuare il valore minimo.' },
            number2: { name: 'number2', detail: 'Num1 è facoltativo, i numeri successivi sono facoltativi. Da 1 a 255 numeri tra cui si desidera individuare il valore minimo.' },
        },
    },
    MINA: {
        description: 'Restituisce il valore più piccolo di un elenco di argomenti.',
        abstract: 'Restituisce il valore più piccolo di un elenco di argomenti.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/mina-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 255 valori tra cui si desidera individuare il più piccolo.' },
            value2: { name: 'value2', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 255 valori tra cui si desidera individuare il più piccolo.' },
        },
    },
    MINIFS: {
        description: 'La funzione MIN.PIÙ.SE restituisce il valore minimo tra le celle specificate da un dato set di condizioni o criteri.',
        abstract: 'La funzione MIN.PIÙ.SE restituisce il valore minimo tra le celle specificate da un dato set di condizioni o criteri.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/minifs-function',
            },
        ],
        functionParameter: {
            minRange: { name: 'min_range', detail: 'L\'intervallo effettivo di celle in cui verrà determinato il valore minimo.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Il set di celle da valutare con i criteri.' },
            criteria1: { name: 'criteria1', detail: 'I criteri sotto forma di numero, espressione o testo che definiscono quali celle valutare come minimo. Lo stesso set di criteri è supportato per le funzioni MAX.PIÙ.SE , SOMMA.PIÙ.SE e MEDIA.PIÙ.SE .' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Altri intervalli e criteri associati. È possibile immettere fino a 126 coppie di intervalli/criteri.' },
            criteria2: { name: 'criteria2', detail: 'Altri intervalli e criteri associati. È possibile immettere fino a 126 coppie di intervalli/criteri.' },
        },
    },
    MODE_MULT: {
        description: 'Se sono presenti più mode, verranno restituiti più risultati. Dal momento che questa funzione restituisce una matrice di valori, deve essere immessa come una formula della matrice.',
        abstract: 'Se sono presenti più mode, verranno restituiti più risultati. Dal momento che questa funzione restituisce una matrice di valori, deve essere immessa come una formula della matrice.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/mode-mult-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo argomento numerico di cui si desidera calcolare la moda.' },
            number2: { name: 'number2', detail: 'Opzionale. Argomenti numerici da 2 a 254 di cui si desidera calcolare la moda. È inoltre possibile utilizzare un\'unica matrice o un riferimento a una matrice anziché argomenti separati da punti e virgola.' },
        },
    },
    MODE_SNGL: {
        description: 'Restituisce il valore più ricorrente o ripetitivo di una matrice o di un intervallo di dati.',
        abstract: 'Restituisce il valore più ricorrente o ripetitivo di una matrice o di un intervallo di dati.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/mode-sngl-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo argomento di cui si desidera calcolare la moda.' },
            number2: { name: 'number2', detail: 'Opzionale. Argomenti da 2 a 254 di cui si desidera calcolare la moda. È inoltre possibile utilizzare un\'unica matrice o un riferimento a una matrice anziché argomenti separati da punti e virgola.' },
        },
    },
    NEGBINOM_DIST: {
        description: 'Restituisce la distribuzione binomiale negativa, la probabilità che un numero di insuccessi pari a Num_insuccessi si verifichi prima del successo Num_successi, data la probabilità di successo Probabilità_s.',
        abstract: 'Restituisce la distribuzione binomiale negativa, la probabilità che un numero di insuccessi pari a Num_insuccessi si verifichi prima del successo Num_successi, data la probabilità di successo Probabilità_s.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/negbinom-dist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Obbligatorio. Numero degli insuccessi.' },
            numberS: { name: 'number_s', detail: 'Obbligatorio. Numero di soglia per i successi.' },
            probabilityS: { name: 'probability_s', detail: 'Obbligatorio. Probabilità di ottenere un successo.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, DISTRIB.BINOM.NEG.N restituirà la funzione di distribuzione cumulativa, se è FALSO restituirà la funzione densità di probabilità.' },
        },
    },
    NORM_DIST: {
        description: 'Restituisce la distribuzione normale per la media e la distribuzione standard specificate. Questa funzione ha una vasta gamma di applicazioni in statistica, inclusa la verifica di ipotesi.',
        abstract: 'Restituisce la distribuzione normale per la media e la distribuzione standard specificate. Questa funzione ha una vasta gamma di applicazioni in statistica, inclusa la verifica di ipotesi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/norm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore per il quale si vuole calcolare la distribuzione.' },
            mean: { name: 'mean', detail: 'Obbligatorio. Media aritmetica della distribuzione.' },
            standardDev: { name: 'standard_dev', detail: 'Obbligatorio. Deviazione standard della distribuzione.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, NORM. DISTRIB.N restituisce la funzione di distribuzione cumulativa; se è FALSO restituirà la funzione densità di probabilità.' },
        },
    },
    NORM_INV: {
        description: 'Restituisce l\'inversa della distribuzione normale cumulativa per la media e la deviazione standard specificate.',
        abstract: 'Restituisce l\'inversa della distribuzione normale cumulativa per la media e la deviazione standard specificate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/norm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità corrispondente alla distribuzione normale.' },
            mean: { name: 'mean', detail: 'Obbligatorio. Media aritmetica della distribuzione.' },
            standardDev: { name: 'standard_dev', detail: 'Obbligatorio. Deviazione standard della distribuzione.' },
        },
    },
    NORM_S_DIST: {
        description: 'La funzione NORM. La funzione DISTRIB.S.N di Excel restituisce la distribuzione normale standard , ovvero ha una media uguale a zero e una deviazione standard di uno . È possibile usare questa funzione al posto di una tabella delle aree della curva normale standard.',
        abstract: 'La funzione NORM. La funzione DISTRIB.S.N di Excel restituisce la distribuzione normale standard , ovvero ha una media uguale a zero e una deviazione standard di uno . È possibile usare questa funzione al posto di una tabella delle aree della curva normale standard.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/norm-s-dist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Obbligatorio. Questo è il valore per il quale si desidera la distribuzione.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. L\'argomento cumulativo può essere VERO o FALSO . Questo valore logico determina la forma della funzione. Se cumulativo è VERO, la funzione NORM. DISTRIB.S.N restituisce la funzione di distribuzione cumulativa . Se è FALSO, restituirà la funzione massa di probabilità .' },
        },
    },
    NORM_S_INV: {
        description: 'Restituisce l\'inversa della distribuzione normale standard cumulativa. La distribuzione ha una media uguale a zero e una deviazione standard uguale a uno.',
        abstract: 'Restituisce l\'inversa della distribuzione normale standard cumulativa. La distribuzione ha una media uguale a zero e una deviazione standard uguale a uno.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/norm-s-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità corrispondente alla distribuzione normale.' },
        },
    },
    PEARSON: {
        description: 'Restituisce il coefficiente di correlazione del momento prodotto di Pearson, r, un indice adimensionale compreso tra -1 e 1 inclusi che riflette l\'estensione di una relazione lineare tra due set di dati.',
        abstract: 'Restituisce il coefficiente di correlazione del momento prodotto di Pearson, r, un indice adimensionale compreso tra -1 e 1 inclusi che riflette l\'estensione di una relazione lineare tra due set di dati.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/pearson-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obbligatorio. Insieme di valori indipendenti.' },
            array2: { name: 'array2', detail: 'Obbligatorio. Insieme di valori dipendenti.' },
        },
    },
    PERCENTILE_EXC: {
        description: 'The PERCENTILE. La funzione ESC restituisce il k-esimo dato percentile dei valori in un intervallo, dove k si trova nell\'intervallo 0..1, valore esclusivo.',
        abstract: 'The PERCENTILE. La funzione ESC restituisce il k-esimo dato percentile dei valori in un intervallo, dove k si trova nell\'intervallo 0..1, valore esclusivo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/percentile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice o intervallo di dati che definisce la condizione relativa.' },
            k: { name: 'k', detail: 'Obbligatorio. Valore percentile nell\'intervallo 0 < k < 1.' },
        },
    },
    PERCENTILE_INC: {
        description: 'Restituisce il k-esimo dato percentile dei valori in un intervallo, dove k è compreso nell\'intervallo da 0 a 1, inclusi.',
        abstract: 'Restituisce il k-esimo dato percentile dei valori in un intervallo, dove k è compreso nell\'intervallo da 0 a 1, inclusi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/percentile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice o intervallo di dati che definisce la condizione relativa.' },
            k: { name: 'k', detail: 'Obbligatorio. Valore percentile nell\'intervallo compreso tra 0 e 1 inclusi.' },
        },
    },
    PERCENTRANK_EXC: {
        description: 'Restituisce il rango di un valore in un set di dati come percentuale (0..1, estremi esclusi) del set di dati.',
        abstract: 'Restituisce il rango di un valore in un set di dati come percentuale (0..1, estremi esclusi) del set di dati.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/percentrank-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice o intervallo di dati con valori numerici che definisce la condizione relativa.' },
            x: { name: 'x', detail: 'Obbligatorio. Valore del quale si desidera conoscere il rango.' },
            significance: { name: 'significance', detail: 'Opzionale. Valore che identifica il numero di cifre significative per la percentuale restituita. Se questo argomento viene omesso, ESC.PERCENT.RANGO utilizzerà tre cifre (0,xxx).' },
        },
    },
    PERCENTRANK_INC: {
        description: 'Questa funzione può essere utilizzata per calcolare la condizione relativa di un valore in un set di dati. È ad esempio possibile utilizzare INC.PERCENT.RANGO per calcolare la condizione di un punteggio di un test attitudinale rispetto a tutti gli altri punteggi dello stesso test.',
        abstract: 'Questa funzione può essere utilizzata per calcolare la condizione relativa di un valore in un set di dati. È ad esempio possibile utilizzare INC.PERCENT.RANGO per calcolare la condizione di un punteggio di un test attitudinale rispetto a tutti gli altri punteggi dello stesso test.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/percentrank-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice o intervallo di dati con valori numerici che definisce la condizione relativa.' },
            x: { name: 'x', detail: 'Obbligatorio. Valore del quale si desidera conoscere il rango.' },
            significance: { name: 'significance', detail: 'Opzionale. Valore che identifica il numero di cifre significative per la percentuale restituita. Se questo argomento viene omesso, INC.PERCENT.RANGO utilizzerà tre cifre (0,xxx).' },
        },
    },
    PERMUT: {
        description: 'Restituisce il numero delle permutazioni per un numero assegnato di oggetti che è possibile selezionare da oggetti numerici. Una permutazione è un qualsiasi insieme o sottoinsieme di oggetti o eventi il cui ordine interno sia significativo. Le permutazioni sono diverse dalle combinazioni il cui ordine interno non è significativo. Utilizzare questa funzione per i calcoli delle probabilità, tipo quelli che si eseguono per le lotterie.',
        abstract: 'Restituisce il numero delle permutazioni per un numero assegnato di oggetti che è possibile selezionare da oggetti numerici. Una permutazione è un qualsiasi insieme o sottoinsieme di oggetti o eventi il cui ordine interno sia significativo. Le permutazioni sono diverse dalle combinazioni il cui ordine interno non è significativo. Utilizzare questa funzione per i calcoli delle probabilità, tipo quelli che si eseguono per le lotterie.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/permut-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Intero che descrive il numero di oggetti.' },
            numberChosen: { name: 'number_chosen', detail: 'Obbligatorio. Intero che descrive il numero di oggetti per ogni permutazione.' },
        },
    },
    PERMUTATIONA: {
        description: 'Restituisce il numero delle permutazioni per un dato numero di oggetti (con ripetizioni) che possono essere selezionati dagli oggetti totali.',
        abstract: 'Restituisce il numero delle permutazioni per un dato numero di oggetti (con ripetizioni) che possono essere selezionati dagli oggetti totali.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/permutationa-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Intero che descrive il numero totale di oggetti.' },
            numberChosen: { name: 'number_chosen', detail: 'Obbligatorio. Intero che descrive il numero di oggetti in ogni permutazione.' },
        },
    },
    PHI: {
        description: 'Restituisce il valore della funzione densità per una distribuzione normale standard.',
        abstract: 'Restituisce il valore della funzione densità per una distribuzione normale standard.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/phi-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. X è il numero per cui si vuole la densità della distribuzione normale standard.' },
        },
    },
    POISSON_DIST: {
        description: 'Restituisce la distribuzione di probabilità di Poisson. La distribuzione di Poisson viene in genere applicata per la previsione del numero di eventi in un arco di tempo specifico, come il numero di automobili che transitano per un casello autostradale in 1 minuto.',
        abstract: 'Restituisce la distribuzione di probabilità di Poisson. La distribuzione di Poisson viene in genere applicata per la previsione del numero di eventi in un arco di tempo specifico, come il numero di automobili che transitano per un casello autostradale in 1 minuto.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/poisson-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Numero degli eventi.' },
            mean: { name: 'mean', detail: 'Obbligatorio. Valore numerico previsto.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma della distribuzione di probabilità restituita. Se cumulativo è VERO, POISSON. DISTRIB.N restituisce la probabilità cumulativa di Poisson che il numero di eventi casuali sia compreso tra zero e x inclusi; se è FALSO, restituirà la funzione massa di probabilità di Poisson che il numero di eventi che si verificano sarà esattamente x.' },
        },
    },
    PROB: {
        description: 'Restituisce la probabilità che dei valori in un intervallo siano compresi tra due limiti. Se limite_sup è omesso, la funzione restituirà la probabilità che i valori in int_x siano uguali a limite_inf.',
        abstract: 'Restituisce la probabilità che dei valori in un intervallo siano compresi tra due limiti. Se limite_sup è omesso, la funzione restituirà la probabilità che i valori in int_x siano uguali a limite_inf.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/prob-function',
            },
        ],
        functionParameter: {
            xRange: { name: 'x_range', detail: 'Obbligatorio. Intervallo dei valori numerici per x a cui sono associate delle probabilità.' },
            probRange: { name: 'prob_range', detail: 'Obbligatorio. Insieme delle probabilità associate ai valori di int_x.' },
            lowerLimit: { name: 'lower_limit', detail: 'Opzionale. Limite inferiore del valore per il quale si desidera calcolare la probabilità.' },
            upperLimit: { name: 'upper_limit', detail: 'Opzionale. Limite superiore del valore per il quale si desidera calcolare la probabilità.' },
        },
    },
    QUARTILE_EXC: {
        description: 'Restituisce il quartile del set di dati, in base ai valori percentili compresi tra 0 e 1, esclusi.',
        abstract: 'Restituisce il quartile del set di dati, in base ai valori percentili compresi tra 0 e 1, esclusi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/quartile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice o intervallo di celle di valori numerici per cui si desidera calcolare il valore quartile.' },
            quart: { name: 'quart', detail: 'Obbligatorio. Indica il valore da restituire.' },
        },
    },
    QUARTILE_INC: {
        description: 'I quartili vengono spesso utilizzati nelle indagini di mercato e nei dati statistici per suddividere le popolazioni in gruppi. Ad esempio, è possibile utilizzare INC.QUARTILE per trovare il 25% dei redditi più elevati in una popolazione.',
        abstract: 'I quartili vengono spesso utilizzati nelle indagini di mercato e nei dati statistici per suddividere le popolazioni in gruppi. Ad esempio, è possibile utilizzare INC.QUARTILE per trovare il 25% dei redditi più elevati in una popolazione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/quartile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice o intervallo di celle di valori numerici per cui si desidera calcolare il valore quartile.' },
            quart: { name: 'quart', detail: 'Obbligatorio. Valore da restituire.' },
        },
    },
    RANK_AVG: {
        description: 'Restituisce il rango di un numero in un elenco di numeri, ovvero la sua dimensione rispetto agli altri valori dell\'elenco. Se più valori hanno lo stesso rango, viene restituito il rango medio.',
        abstract: 'Restituisce il rango di un numero in un elenco di numeri, ovvero la sua dimensione rispetto agli altri valori dell\'elenco. Se più valori hanno lo stesso rango, viene restituito il rango medio.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/rank-avg-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero di cui si desidera trovare il rango.' },
            ref: { name: 'ref', detail: 'Obbligatorio. Matrice di numeri o riferimento a un elenco di numeri. I valori in Rif che non sono di tipo numerico vengono ignorati.' },
            order: { name: 'order', detail: 'Opzionale. Numero che specifica come classificare num.' },
        },
    },
    RANK_EQ: {
        description: 'Restituisce il rango di un numero in un elenco di numeri.',
        abstract: 'Restituisce il rango di un numero in un elenco di numeri.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/rank-eq-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Numero di cui si desidera trovare il rango.' },
            ref: { name: 'ref', detail: 'Riferimento a un elenco di numeri. I valori non numerici in ref vengono ignorati.' },
            order: { name: 'order', detail: 'Numero che specifica come classificare number. Se è 0 o omesso, viene usato un ordine decrescente; qualsiasi valore diverso da zero usa l\'ordine crescente.' },
        },
    },
    RSQ: {
        description: 'Restituisce il quadrato del coefficiente di correlazione del momento prodotto di Pearson.',
        abstract: 'Restituisce il quadrato del coefficiente di correlazione del momento prodotto di Pearson.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: "known_y's", detail: 'Matrice o intervallo di dati dipendente.' },
            knownXs: { name: "known_x's", detail: 'Matrice o intervallo di dati indipendente.' },
        },
    },
    SKEW: {
        description: 'Restituisce l\'asimmetria di una distribuzione.',
        abstract: 'Restituisce l\'asimmetria di una distribuzione.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/skew-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Primo numero, riferimento di cella o intervallo di cui si desidera calcolare l\'asimmetria.' },
            number2: { name: 'number2', detail: 'Numeri, riferimenti di cella o intervalli aggiuntivi di cui si desidera calcolare l\'asimmetria, fino a un massimo di 255.' },
        },
    },
    SKEW_P: {
        description: 'Restituisce l\'asimmetria di una distribuzione in base a un\'intera popolazione.',
        abstract: 'Restituisce l\'asimmetria di una distribuzione in base a un\'intera popolazione.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/skew-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Primo numero, riferimento di cella o intervallo di cui si desidera calcolare l\'asimmetria.' },
            number2: { name: 'number2', detail: 'Numeri, riferimenti di cella o intervalli aggiuntivi di cui si desidera calcolare l\'asimmetria, fino a un massimo di 255.' },
        },
    },
    SLOPE: {
        description: 'Restituisce la pendenza della retta di regressione lineare.',
        abstract: 'Restituisce la pendenza della retta di regressione lineare.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/slope-function',
            },
        ],
        functionParameter: {
            knownYs: { name: "known_y's", detail: 'Matrice o intervallo di dati dipendente.' },
            knownXs: { name: "known_x's", detail: 'Matrice o intervallo di dati indipendente.' },
        },
    },
    SMALL: {
        description: 'Restituisce il k-esimo valore più piccolo di un set di dati. Utilizzare questa funzione per restituire i valori con una particolare condizione relativa in un set di dati.',
        abstract: 'Restituisce il k-esimo valore più piccolo di un set di dati. Utilizzare questa funzione per restituire i valori con una particolare condizione relativa in un set di dati.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/small-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice o intervallo di dati numerici di cui si desidera determinare il k-esimo valore più piccolo.' },
            k: { name: 'k', detail: 'Obbligatorio. Posizione del valore da restituire, partendo dal più piccolo, nella matrice o nell\'intervallo.' },
        },
    },
    STANDARDIZE: {
        description: 'Restituisce un valore normalizzato da una distribuzione caratterizzata da media e dev_standard.',
        abstract: 'Restituisce un valore normalizzato da una distribuzione caratterizzata da media e dev_standard.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/standardize-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore che si desidera normalizzare.' },
            mean: { name: 'mean', detail: 'Obbligatorio. Media aritmetica della distribuzione.' },
            standardDev: { name: 'standard_dev', detail: 'Obbligatorio. Deviazione standard della distribuzione.' },
        },
    },
    STDEV_P: {
        description: 'La deviazione standard è una misura che indica quanto i valori si discostino dal valore medio (la media).',
        abstract: 'La deviazione standard è una misura che indica quanto i valori si discostino dal valore medio (la media).',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/stdev-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo argomento numerico corrispondente a una popolazione.' },
            number2: { name: 'number2', detail: 'Opzionale. Da 2 a 254 argomenti numerici corrispondenti a una popolazione. Anziché argomenti separati da punti e virgola, è inoltre possibile utilizzare una singola matrice o un riferimento a una matrice.' },
        },
    },
    STDEV_S: {
        description: 'La deviazione standard è una misura che indica quanto si discostano i valori dal valore medio, ovvero la media.',
        abstract: 'La deviazione standard è una misura che indica quanto si discostano i valori dal valore medio, ovvero la media.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/stdev-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo argomento numerico corrispondente a un campione di popolazione. Anziché argomenti separati da punti e virgola, è inoltre possibile utilizzare una singola matrice o un riferimento a una matrice.' },
            number2: { name: 'number2', detail: 'Opzionale. Da 2 a 254 argomenti numerici corrispondenti a un campione di popolazione. Anziché argomenti separati da punti e virgola, è inoltre possibile utilizzare una singola matrice o un riferimento a una matrice.' },
        },
    },
    STDEVA: {
        description: 'Stima la deviazione standard in base a un campione, includendo numeri, testo e valori logici.',
        abstract: 'Stima la deviazione standard in base a un campione, includendo numeri, testo e valori logici.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/stdeva-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Primo argomento valore corrispondente a un campione di popolazione. In alternativa agli argomenti separati da virgole, è possibile usare una singola matrice o un riferimento a una matrice.' },
            value2: { name: 'value2', detail: 'Argomenti valore da 2 a 254 corrispondenti a un campione di popolazione. In alternativa, è possibile usare una singola matrice o un riferimento a una matrice.' },
        },
    },
    STDEVPA: {
        description: 'Restituisce la deviazione standard sulla base dell\'intera popolazione specificata sotto forma di argomenti, compresi il testo e i valori logici. La deviazione standard è una misura che indica quanto i valori si discostano dal valore medio, ovvero dalla media.',
        abstract: 'Restituisce la deviazione standard sulla base dell\'intera popolazione specificata sotto forma di argomenti, compresi il testo e i valori logici. La deviazione standard è una misura che indica quanto i valori si discostano dal valore medio, ovvero dalla media.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/stdevpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 255 valori corrispondenti a una popolazione. Anziché argomenti separati dal punti e virgola, è inoltre possibile utilizzare una singola matrice o un riferimento a una matrice.' },
            value2: { name: 'value2', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 255 valori corrispondenti a una popolazione. Anziché argomenti separati dal punti e virgola, è inoltre possibile utilizzare una singola matrice o un riferimento a una matrice.' },
        },
    },
    STEYX: {
        description: 'Restituisce l\'errore standard del valore y previsto per ogni valore x nella regressione.',
        abstract: 'Restituisce l\'errore standard del valore y previsto per ogni valore x nella regressione.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/steyx-function',
            },
        ],
        functionParameter: {
            knownYs: { name: "known_y's", detail: 'Matrice o intervallo di dati dipendente.' },
            knownXs: { name: "known_x's", detail: 'Matrice o intervallo di dati indipendente.' },
        },
    },
    T_DIST: {
        description: 'Restituisce la distribuzione t a una coda sinistra di Student. La distribuzione t viene utilizzata nelle verifiche di ipotesi su piccoli set di dati presi come campione. Utilizzare questa funzione al posto di una tabella di valori critici per il calcolo della distribuzione t.',
        abstract: 'Restituisce la distribuzione t a una coda sinistra di Student. La distribuzione t viene utilizzata nelle verifiche di ipotesi su piccoli set di dati presi come campione. Utilizzare questa funzione al posto di una tabella di valori critici per il calcolo della distribuzione t.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/t-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore numerico in cui calcolare la distribuzione.' },
            degFreedom: { name: 'degFreedom', detail: 'Obbligatorio. Intero che indica il numero di gradi di libertà.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, DISTRIB.T.N restituirà la funzione di distribuzione cumulativa, se è FALSO restituirà la funzione densità di probabilità.' },
        },
    },
    T_DIST_2T: {
        description: 'Restituisce la probabilità per la distribuzione t di Student (a due code).',
        abstract: 'Restituisce la probabilità per la distribuzione t di Student (a due code).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/t-dist-2t-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Valore numerico in corrispondenza del quale valutare la distribuzione.' },
            degFreedom: { name: 'degFreedom', detail: 'Intero che indica il numero di gradi di libertà.' },
        },
    },
    T_DIST_RT: {
        description: 'Restituisce la probabilità per la distribuzione t di Student (a una coda destra).',
        abstract: 'Restituisce la probabilità per la distribuzione t di Student (a una coda destra).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/t-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Valore numerico in corrispondenza del quale valutare la distribuzione.' },
            degFreedom: { name: 'degFreedom', detail: 'Intero che indica il numero di gradi di libertà.' },
        },
    },
    T_INV: {
        description: 'Restituisce l\'inversa della probabilità per la distribuzione t di Student.',
        abstract: 'Restituisce l\'inversa della probabilità per la distribuzione t di Student.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/t-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Probabilità associata alla distribuzione t di Student.' },
            degFreedom: { name: 'degFreedom', detail: 'Intero che indica il numero di gradi di libertà.' },
        },
    },
    T_INV_2T: {
        description: 'Restituisce l\'inversa della probabilità per la distribuzione t di Student (a due code).',
        abstract: 'Restituisce l\'inversa della probabilità per la distribuzione t di Student (a due code).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/t-inv-2t-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Probabilità associata alla distribuzione t di Student.' },
            degFreedom: { name: 'degFreedom', detail: 'Intero che indica il numero di gradi di libertà.' },
        },
    },
    T_TEST: {
        description: 'Restituisce la probabilità associata a un test t di Student.',
        abstract: 'Restituisce la probabilità associata a un test t di Student.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/t-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Prima matrice o intervallo di dati.' },
            array2: { name: 'array2', detail: 'Seconda matrice o intervallo di dati.' },
            tails: { name: 'tails', detail: 'Specifica il numero di code della distribuzione. Se è 1, TEST.T usa la distribuzione a una coda; se è 2, quella a due code.' },
            type: { name: 'type', detail: 'Tipo di test t da eseguire.' },
        },
    },
    TREND: {
        description: 'La funzione TENDENZA restituisce i valori lungo una tendenza lineare. Adatta una linea retta (usando il metodo dei minimi quadrati) alle y_note e x_note della matrice. TENDENZA restituisce i valori y lungo tale riga per la matrice di Nuova_x specificata.',
        abstract: 'La funzione TENDENZA restituisce i valori lungo una tendenza lineare. Adatta una linea retta (usando il metodo dei minimi quadrati) alle y_note e x_note della matrice. TENDENZA restituisce i valori y lungo tale riga per la matrice di Nuova_x specificata.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/trend-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Insieme dei valori y già noti nella relazione y = mx + b. Se la matrice y_note è in una singola colonna, ogni colonna di x_note verrà interpretata come una variabile distinta. Se la matrice y_note è in una singola riga, ogni riga di x_note verrà interpretata come una variabile distinta.' },
            knownXs: { name: 'known_x\'s', detail: 'Insieme facoltativo di valori x che possono essere già noti dalla relazione y = mx + b La matrice x_note può comprendere uno o più insiemi di variabili. Se viene utilizzata una sola variabile, y_note e x_note potranno essere intervalli di forma qualsiasi, purché con dimensioni uguali. Se vengono utilizzate più variabili, y_note dovrà essere un vettore, ovvero un intervallo con altezza di una riga o larghezza di una colonna. Se x_note è omesso, verrà considerato uguale alla matrice {1;2;3;...} che ha le stesse dimensioni di y_note.' },
            newXs: { name: 'new_x\'s', detail: 'Nuovi valori x per i quali TENDENZA restituirà i valori y corrispondenti. Analogamente a X_nota, Nuova_x deve includere una colonna (o una riga) per ciascuna variabile indipendente. Di conseguenza, se Y_nota è in una singola colonna, X_nota e Nuova_x dovrebbero avere lo stesso numero di colonne. Se Y_nota è in una singola riga, X_nota e Nuova_x dovrebbero avere lo stesso numero di righe. Se Nuova_x è omesso, verrà considerato uguale a X_nota. Se entrambi X_nota e Nuova_x sono omessi, verranno considerati uguali alla matrice {1;2;3;...} che ha le stesse dimensioni di Y_nota.' },
            constb: { name: 'const', detail: 'Valore logico che specifica se la costante b deve essere uguale a 0. Se cost è VERO o è omesso, b verrà calcolata secondo la normale procedura. Se cost è FALSO, b verrà impostata a 0 e i valori m verranno corretti in modo che y = mx.' },
        },
    },
    TRIMMEAN: {
        description: 'Restituisce la media della parte interna di un set di dati. La funzione MEDIA.TRONCATA calcola la media ricavata dall\'esclusione di una percentuale di valori dalla coda superiore e dalla coda inferiore di un set di dati. È possibile utilizzare questa funzione quando si desidera escludere i dati esterni dall\'analisi.',
        abstract: 'Restituisce la media della parte interna di un set di dati. La funzione MEDIA.TRONCATA calcola la media ricavata dall\'esclusione di una percentuale di valori dalla coda superiore e dalla coda inferiore di un set di dati. È possibile utilizzare questa funzione quando si desidera escludere i dati esterni dall\'analisi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/trimmean-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice o intervallo di valori da troncare e di cui calcolare la media.' },
            percent: { name: 'percent', detail: 'Obbligatorio. Numero frazionario di coordinate da escludere dal calcolo. Se ad esempio percento = 0,2, verranno esclusi 4 punti da un set di dati di 20 punti (20 x 0,2), ovvero 2 punti dalla parte superiore e 2 dalla parte inferiore del set.' },
        },
    },
    VAR_P: {
        description: 'Restituisce la varianza sulla base dell\'intera popolazione. Ignora i valori logici e il testo nella popolazione.',
        abstract: 'Restituisce la varianza sulla base dell\'intera popolazione. Ignora i valori logici e il testo nella popolazione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/var-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo argomento numerico corrispondente a una popolazione.' },
            number2: { name: 'number2', detail: 'Opzionale. Da 2 a 254 argomenti numerici corrispondenti a una popolazione.' },
        },
    },
    VAR_S: {
        description: 'Stima la varianza sulla base di un campione. Ignora i valori logici e il testo nel campione.',
        abstract: 'Stima la varianza sulla base di un campione. Ignora i valori logici e il testo nel campione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/var-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo argomento numerico corrispondente a un campione di popolazione.' },
            number2: { name: 'number2', detail: 'Opzionale. Da 2 a 254 argomenti numerici corrispondenti a un campione di popolazione.' },
        },
    },
    VARA: {
        description: 'Stima la varianza sulla base di un campione.',
        abstract: 'Stima la varianza sulla base di un campione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/vara-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 255 argomenti di valori corrispondenti a un campione di popolazione.' },
            value2: { name: 'value2', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 255 argomenti di valori corrispondenti a un campione di popolazione.' },
        },
    },
    VARPA: {
        description: 'Restituisce la varianza sulla base dell\'intera popolazione.',
        abstract: 'Restituisce la varianza sulla base dell\'intera popolazione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/varpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 255 argomenti di valori corrispondenti a una popolazione.' },
            value2: { name: 'value2', detail: 'Val1 è obbligatorio, i valori successivi sono facoltativi. Da 1 a 255 argomenti di valori corrispondenti a una popolazione.' },
        },
    },
    WEIBULL_DIST: {
        description: 'Restituisce la distribuzione di Weibull. Utilizzare questa distribuzione nelle analisi di affidabilità, come il calcolo della durata media di un dispositivo.',
        abstract: 'Restituisce la distribuzione di Weibull. Utilizzare questa distribuzione nelle analisi di affidabilità, come il calcolo della durata media di un dispositivo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/weibull-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore in cui calcolare la funzione.' },
            alpha: { name: 'alpha', detail: 'Obbligatorio. Parametro per la distribuzione.' },
            beta: { name: 'beta', detail: 'Obbligatorio. Parametro per la distribuzione.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Determina la forma assunta dalla funzione.' },
        },
    },
    Z_TEST: {
        description: 'Per informazioni sulla modalità di utilizzo di TESTZ per il calcolo di un valore di probabilità a due code, vedere la sezione Osservazioni riportata di seguito.',
        abstract: 'Per informazioni sulla modalità di utilizzo di TESTZ per il calcolo di un valore di probabilità a due code, vedere la sezione Osservazioni riportata di seguito.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/z-test-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice o intervallo di dati in base al quale verificare x' },
            x: { name: 'x', detail: 'Obbligatorio. Valore da verificare.' },
            sigma: { name: 'sigma', detail: 'Opzionale. Deviazione standard della popolazione (nota). Se questo argomento viene omesso, verrà utilizzata la deviazione standard campione.' },
        },
    },
};

export default locale;
