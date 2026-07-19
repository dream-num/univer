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
        description: 'Restituisce la funzione densità di probabilità cumulativa beta. La distribuzione beta viene generalmente utilizzata per lo studio su campioni delle variazioni percentuali di un elemento o di una situazione qualsiasi, quale ad esempio il numero di ore che si trascorrono quotidianamente davanti al televisore.',
        abstract: 'Restituisce la funzione densità di probabilità cumulativa beta. La distribuzione beta viene generalmente utilizzata per lo studio su campioni delle variazioni percentuali di un elemento o di una situazione qualsiasi, quale ad esempio il numero di ore che si trascorrono quotidianamente davanti al televisore.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore compreso tra A e B in cui calcolare la funzione.' },
            alpha: { name: 'alpha', detail: 'Obbligatorio. Parametro della distribuzione.' },
            beta: { name: 'beta', detail: 'Obbligatorio. Parametro della distribuzione.' },
            A: { name: 'A', detail: 'Optional. Valore per l\'estremo inferiore dell\'intervallo di x.' },
            B: { name: 'B', detail: 'Facoltativo. Valore per l\'estremo superiore dell\'intervallo di x.' },
        },
    },
    BETAINV: {
        description: 'Restituisce l\'inversa della funzione densità di probabilità cumulativa beta per una distribuzione beta specificata. Questo significa che, se probabilità = DISTRIB.BETA(x;...), si avrà INV.BETA(probabilità;...) = x. Dati un tempo di durata e una variabilità previsti, la distribuzione beta può essere utilizzata nella pianificazione di progetti per calcolare i tempi di durata probabili.',
        abstract: 'Restituisce l\'inversa della funzione densità di probabilità cumulativa beta per una distribuzione beta specificata. Questo significa che, se probabilità = DISTRIB.BETA(x;...), si avrà INV.BETA(probabilità;...) = x. Dati un tempo di durata e una variabilità previsti, la distribuzione beta può essere utilizzata nella pianificazione di progetti per calcolare i tempi di durata probabili.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/betainv-function',
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
    BINOMDIST: {
        description: 'Restituisce la distribuzione binomiale per il termine individuale. Utilizzare la funzione DISTRIB.BINOM per risolvere problemi con un numero fisso di verifiche o di prove, quando i risultati di una prova qualsiasi sono solo positivi o negativi, quando le prove sono indipendenti e quando la probabilità di successo è costante nel corso di tutto l\'esperimento. La funzione DISTRIB.BINOM può calcolare ad esempio la probabilità che due neonati su tre siano maschi.',
        abstract: 'Restituisce la distribuzione binomiale per il termine individuale. Utilizzare la funzione DISTRIB.BINOM per risolvere problemi con un numero fisso di verifiche o di prove, quando i risultati di una prova qualsiasi sono solo positivi o negativi, quando le prove sono indipendenti e quando la probabilità di successo è costante nel corso di tutto l\'esperimento. La funzione DISTRIB.BINOM può calcolare ad esempio la probabilità che due neonati su tre siano maschi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Obbligatorio. Numero di successi in prove.' },
            trials: { name: 'trials', detail: 'Obbligatorio. Numero di prove indipendenti.' },
            probabilityS: { name: 'probability_s', detail: 'Obbligatorio. Probabilità di successo per ogni prova.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, DISTRIB.BINOM restituirà la funzione distribuzione cumulativa, ovvero la probabilità che ci siano al massimo number_s successi; se è FALSO, restituirà la funzione massa di probabilità, ovvero la probabilità che siano presenti number_s successi.' },
        },
    },
    CHIDIST: {
        description: 'Restituisce la probabilità a una coda destra per la distribuzione del chi quadrato. La distribuzione χ2 è associata al test χ2. Utilizzare il test χ2 per confrontare i valori osservati con i valori previsti. Ad esempio, sulla base di un esperimento genetico si potrebbe ipotizzare che la gamma di colori della prossima generazione di piante sarà diversa da quella attuale. Confrontando i risultati osservati con quelli previsti, sarà possibile stabilire la validità dell\'ipotesi formulata in origine.',
        abstract: 'Restituisce la probabilità a una coda destra per la distribuzione del chi quadrato. La distribuzione χ2 è associata al test χ2. Utilizzare il test χ2 per confrontare i valori osservati con i valori previsti. Ad esempio, sulla base di un esperimento genetico si potrebbe ipotizzare che la gamma di colori della prossima generazione di piante sarà diversa da quella attuale. Confrontando i risultati osservati con quelli previsti, sarà possibile stabilire la validità dell\'ipotesi formulata in origine.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore in cui si desidera calcolare la distribuzione.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obbligatorio. Numero di gradi di libertà.' },
        },
    },
    CHIINV: {
        description: 'Restituisce l\'inversa della distribuzione a una coda destra del chi quadrato. Se probabilità = DISTRIB.CHI(x;...), verrà restituito INV.CHI(probabilità;...) = x. Utilizzare questa funzione per confrontare i risultati osservati con quelli previsti per stabilire se l\'ipotesi formulata in origine è valida.',
        abstract: 'Restituisce l\'inversa della distribuzione a una coda destra del chi quadrato. Se probabilità = DISTRIB.CHI(x;...), verrà restituito INV.CHI(probabilità;...) = x. Utilizzare questa funzione per confrontare i risultati osservati con quelli previsti per stabilire se l\'ipotesi formulata in origine è valida.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità associata alla distribuzione del chi quadrato.' },
            degFreedom: { name: 'deg_freedom', detail: 'Obbligatorio. Numero di gradi di libertà.' },
        },
    },
    CHITEST: {
        description: 'Restituisce il test per l\'indipendenza. La funzione TEST.CHI restituisce il valore dalla distribuzione del chi quadrato (χ2) per un dato statistico e i gradi di libertà appropriati. È possibile utilizzare i test χ2 per stabilire se i risultati previsti vengono confermati mediante un esperimento.',
        abstract: 'Restituisce il test per l\'indipendenza. La funzione TEST.CHI restituisce il valore dalla distribuzione del chi quadrato (χ2) per un dato statistico e i gradi di libertà appropriati. È possibile utilizzare i test χ2 per stabilire se i risultati previsti vengono confermati mediante un esperimento.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Obbligatorio. Intervallo di dati che contiene le osservazioni da confrontare con i valori previsti.' },
            expectedRange: { name: 'expected_range', detail: 'Obbligatorio. Intervallo di dati che contiene la proporzione del prodotto dei totali di riga e di colonna per il totale complessivo.' },
        },
    },
    CONFIDENCE: {
        description: 'Restituisce l\'intervallo di confidenza per una media di popolazione utilizzando una distribuzione normale.',
        abstract: 'Restituisce l\'intervallo di confidenza per una media di popolazione utilizzando una distribuzione normale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Obbligatorio. Livello di significatività utilizzato per calcolare il livello di confidenza. Il livello di probabilità è uguale a 100*(1 - alfa)% o, in altre parole, un valore alfa di 0,05 indica un livello di probabilità del 95%.' },
            standardDev: { name: 'standard_dev', detail: 'Obbligatorio. Deviazione standard della popolazione per l\'intervallo di dati e si presuppone che sia nota.' },
            size: { name: 'size', detail: 'Obbligatorio. Dimensione del campione.' },
        },
    },
    COVAR: {
        description: 'Restituisce la covarianza, ovvero la media dei prodotti delle deviazioni di ogni coppia di dati in due set di dati.',
        abstract: 'Restituisce la covarianza, ovvero la media dei prodotti delle deviazioni di ogni coppia di dati in due set di dati.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obbligatorio. Primo intervallo di celle costituito da interi.' },
            array2: { name: 'array2', detail: 'Obbligatorio. Secondo intervallo di celle costituito da interi.' },
        },
    },
    CRITBINOM: {
        description: 'Restituisce il più piccolo valore per il quale la distribuzione cumulativa binomiale risulta maggiore o uguale a un valore di criterio. Usare questa funzione per le applicazioni di garanzia della qualità. Ad esempio, utilizzare CRIT.BINOM per determinare il maggior numero di parti difettose che possono uscire da una linea di assemblaggio senza scartando l\'intero lotto.',
        abstract: 'Restituisce il più piccolo valore per il quale la distribuzione cumulativa binomiale risulta maggiore o uguale a un valore di criterio. Usare questa funzione per le applicazioni di garanzia della qualità. Ad esempio, utilizzare CRIT.BINOM per determinare il maggior numero di parti difettose che possono uscire da una linea di assemblaggio senza scartando l\'intero lotto.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Obbligatorio. Numero delle prove di Bernoulli.' },
            probabilityS: { name: 'probability_s', detail: 'Obbligatorio. Probabilità di successo per ogni prova.' },
            alpha: { name: 'alpha', detail: 'Obbligatorio. Valore di criterio.' },
        },
    },
    EXPONDIST: {
        description: 'Restituisce la distribuzione esponenziale. Utilizzare la funzione DISTRIB.EXP per calcolare il tempo che intercorre tra due eventi, quale il tempo impiegato da uno sportello automatico per consegnare la somma in contanti richiesta. È possibile ad esempio utilizzare DISTRIB.EXP per determinare la probabilità che questa operazione richieda al massimo un minuto.',
        abstract: 'Restituisce la distribuzione esponenziale. Utilizzare la funzione DISTRIB.EXP per calcolare il tempo che intercorre tra due eventi, quale il tempo impiegato da uno sportello automatico per consegnare la somma in contanti richiesta. È possibile ad esempio utilizzare DISTRIB.EXP per determinare la probabilità che questa operazione richieda al massimo un minuto.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore della funzione.' },
            lambda: { name: 'lambda', detail: 'Obbligatorio. Valore del parametro.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che indica la forma della funzione esponenziale. Se cumulativo è VERO, DISTRIB.EXP restituirà la funzione distribuzione cumulativa, se è FALSO restituirà la funzione densità di probabilità.' },
        },
    },
    FDIST: {
        description: 'Restituisce la distribuzione di probabilità F (coda destra) (grado di diversità) per due set di dati. È possibile utilizzare questa funzione per determinare se due set di dati presentano gradi di diversità differenti. È possibile ad esempio esaminare i punteggi dei test per l\'ammissione all\'università assegnati a studentesse e a studenti e stabilire se esistono differenze di variabilità tra il gruppo femminile e quello maschile.',
        abstract: 'Restituisce la distribuzione di probabilità F (coda destra) (grado di diversità) per due set di dati. È possibile utilizzare questa funzione per determinare se due set di dati presentano gradi di diversità differenti. È possibile ad esempio esaminare i punteggi dei test per l\'ammissione all\'università assegnati a studentesse e a studenti e stabilire se esistono differenze di variabilità tra il gruppo femminile e quello maschile.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore in cui calcolare la funzione.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obbligatorio. Gradi di libertà al numeratore.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obbligatorio. Gradi di libertà al denominatore.' },
        },
    },
    FINV: {
        description: 'Restituisce l\'inversa della distribuzione di probabilità F (coda destra). Se p = DISTRIB.F(x;...), si avrà INV.F(p;...) = x.',
        abstract: 'Restituisce l\'inversa della distribuzione di probabilità F (coda destra). Se p = DISTRIB.F(x;...), si avrà INV.F(p;...) = x.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità associata alla distribuzione cumulativa F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Obbligatorio. Gradi di libertà al numeratore.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Obbligatorio. Gradi di libertà al denominatore.' },
        },
    },
    FTEST: {
        description: 'Restituisce il risultato di un test F. Un test F restituisce la probabilità a due code che le varianze in matrice1 e matrice2 non siano significativamente diverse. Utilizzare questa funzione per determinare se due campioni hanno varianze diverse. Ad esempio, sulla base dei punteggi di un test effettuato in scuole pubbliche e private, è possibile verificare se la diversità dei punteggi del test di queste scuole si estende su più livelli.',
        abstract: 'Restituisce il risultato di un test F. Un test F restituisce la probabilità a due code che le varianze in matrice1 e matrice2 non siano significativamente diverse. Utilizzare questa funzione per determinare se due campioni hanno varianze diverse. Ad esempio, sulla base dei punteggi di un test effettuato in scuole pubbliche e private, è possibile verificare se la diversità dei punteggi del test di queste scuole si estende su più livelli.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obbligatorio. Prima matrice o primo intervallo di dati.' },
            array2: { name: 'array2', detail: 'Obbligatorio. Seconda matrice o secondo intervallo di dati.' },
        },
    },
    GAMMADIST: {
        description: 'Restituisce la distribuzione gamma. È possibile utilizzare questa funzione per studiare le variabili che potrebbero avere una distribuzione asimmetrica. La distribuzione gamma viene in genere utilizzata nell\'analisi delle code.',
        abstract: 'Restituisce la distribuzione gamma. È possibile utilizzare questa funzione per studiare le variabili che potrebbero avere una distribuzione asimmetrica. La distribuzione gamma viene in genere utilizzata nell\'analisi delle code.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore in cui si desidera calcolare la distribuzione.' },
            alpha: { name: 'alpha', detail: 'Obbligatorio. Parametro per la distribuzione.' },
            beta: { name: 'beta', detail: 'Obbligatorio. Parametro per la distribuzione. Se beta = 1, DISTRIB.GAMMA restituirà la distribuzione gamma standard.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, DISTRIB.GAMMA restituirà la funzione di distribuzione cumulativa, se è FALSO restituirà la funzione densità di probabilità.' },
        },
    },
    GAMMAINV: {
        description: 'Restituisce l\'inversa della distribuzione cumulativa gamma. Se p = DISTRIB.GAMMA(x;...), si avrà INV.GAMMA(p;...) = x. È possibile usare questa funzione per studiare una variabile la cui distribuzione potrebbe essere asimmetrica.',
        abstract: 'Restituisce l\'inversa della distribuzione cumulativa gamma. Se p = DISTRIB.GAMMA(x;...), si avrà INV.GAMMA(p;...) = x. È possibile usare questa funzione per studiare una variabile la cui distribuzione potrebbe essere asimmetrica.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità associata alla distribuzione gamma.' },
            alpha: { name: 'alpha', detail: 'Obbligatorio. Parametro per la distribuzione.' },
            beta: { name: 'beta', detail: 'Obbligatorio. Parametro per la distribuzione. Se beta = 1, INV.GAMMA restituirà la distribuzione gamma standard.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Restituisce la distribuzione ipergeometrica. DISTRIB.IPERGEOM restituisce la probabilità di un dato numero di successi campione in base alla dimensione del campione, ai successi e alla dimensione della popolazione. Utilizzare la funzione DISTRIB.IPERGEOM per risolvere i problemi con una popolazione limitata, dove ciascuna osservazione può essere tanto un successo quanto un insuccesso e dove ciascun sottoinsieme di una data dimensione viene scelto con uguale probabilità.',
        abstract: 'Restituisce la distribuzione ipergeometrica. DISTRIB.IPERGEOM restituisce la probabilità di un dato numero di successi campione in base alla dimensione del campione, ai successi e alla dimensione della popolazione. Utilizzare la funzione DISTRIB.IPERGEOM per risolvere i problemi con una popolazione limitata, dove ciascuna osservazione può essere tanto un successo quanto un insuccesso e dove ciascun sottoinsieme di una data dimensione viene scelto con uguale probabilità.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Obbligatorio. Numero di successi nel campione.' },
            numberSample: { name: 'number_sample', detail: 'Obbligatorio. Dimensione del campione.' },
            populationS: { name: 'population_s', detail: 'Obbligatorio. Numero di successi nella popolazione.' },
            numberPop: { name: 'number_pop', detail: 'Obbligatorio. Dimensione della popolazione.' },
        },
    },
    LOGINV: {
        description: 'Restituisce l\'inversa della funzione di distribuzione cumulativa lognormale di x, dove ln(x) viene in genere distribuito con i parametri media e dev_standard. Se p = DISTRIB.LOGNORM(x;...), si avrà INV.LOGNORM(p;...) = x.',
        abstract: 'Restituisce l\'inversa della funzione di distribuzione cumulativa lognormale di x, dove ln(x) viene in genere distribuito con i parametri media e dev_standard. Se p = DISTRIB.LOGNORM(x;...), si avrà INV.LOGNORM(p;...) = x.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità associata alla distribuzione lognormale.' },
            mean: { name: 'mean', detail: 'Obbligatorio. Media di ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Obbligatorio. Deviazione standard di ln(x).' },
        },
    },
    LOGNORMDIST: {
        description: 'Restituisce la distribuzione lognormale di x, dove ln(x) viene normalmente distribuito con la media dei parametri e con standard_dev. Utilizzare questa funzione per analizzare i dati che sono stati trasformati in logaritmi.',
        abstract: 'Restituisce la distribuzione lognormale di x, dove ln(x) viene normalmente distribuito con la media dei parametri e con standard_dev. Utilizzare questa funzione per analizzare i dati che sono stati trasformati in logaritmi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore in cui calcolare la funzione.' },
            mean: { name: 'mean', detail: 'Obbligatorio. Media di ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Obbligatorio. Deviazione standard di ln(x).' },
        },
    },
    MODE: {
        description: 'Si supponga di voler scoprire il numero più comune di specie di uccelli avvistate in un campione di conteggi di uccelli in una zona umida critica in un periodo di tempo di 30 anni o di voler individuare il numero di telefonate più frequenti presso un centro di supporto telefonico durante le ore non di punta. Per calcolare la modalità di un gruppo di numeri, usare la funzione MODA .',
        abstract: 'Si supponga di voler scoprire il numero più comune di specie di uccelli avvistate in un campione di conteggi di uccelli in una zona umida critica in un periodo di tempo di 30 anni o di voler individuare il numero di telefonate più frequenti presso un centro di supporto telefonico durante le ore non di punta. Per calcolare la modalità di un gruppo di numeri, usare la funzione MODA .',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo argomento numerico di cui si desidera calcolare la moda.' },
            number2: { name: 'number2', detail: 'Opzionale. Argomenti numerici da 1 a 255 di cui si desidera calcolare la moda. È inoltre possibile utilizzare un\'unica matrice o un riferimento a una matrice anziché argomenti separati da punti e virgola.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Restituisce la distribuzione binomiale negativa. DISTRIB.BINOM.NEG restituisce la probabilità che si verifichi il numero di insuccessi indicato in num_insuccessi prima del successo numero num_successi, quando la probabilità costante di un successo è probabilità_s. Questa funzione è simile alla distribuzione binomiale, tranne per il fatto che il numero di successi è fisso e che il numero delle prove è variabile. Analogamente alla distribuzione binomiale, le prove vengono considerate indipendenti.',
        abstract: 'Restituisce la distribuzione binomiale negativa. DISTRIB.BINOM.NEG restituisce la probabilità che si verifichi il numero di insuccessi indicato in num_insuccessi prima del successo numero num_successi, quando la probabilità costante di un successo è probabilità_s. Questa funzione è simile alla distribuzione binomiale, tranne per il fatto che il numero di successi è fisso e che il numero delle prove è variabile. Analogamente alla distribuzione binomiale, le prove vengono considerate indipendenti.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Obbligatorio. Numero degli insuccessi.' },
            numberS: { name: 'number_s', detail: 'Obbligatorio. Numero di soglia per i successi.' },
            probabilityS: { name: 'probability_s', detail: 'Obbligatorio. Probabilità di ottenere un successo.' },
        },
    },
    NORMDIST: {
        description: 'La funzione DISTRIB.NORM restituisce la distribuzione normale per la media e la deviazione standard specificate. Questa funzione ha un\'ampia gamma di applicazioni in statistica, incluse le verifiche di ipotesi.',
        abstract: 'La funzione DISTRIB.NORM restituisce la distribuzione normale per la media e la deviazione standard specificate. Questa funzione ha un\'ampia gamma di applicazioni in statistica, incluse le verifiche di ipotesi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore per il quale si desidera la distribuzione' },
            mean: { name: 'mean', detail: 'Obbligatorio. Media aritmetica della distribuzione' },
            standardDev: { name: 'standard_dev', detail: 'Obbligatorio. Deviazione standard della distribuzione' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma assunta dalla funzione. Se cumulativo è VERO, DISTRIB.NORM restituirà la funzione di distribuzione cumulativa; se cumulativo è FALSO, restituirà la funzione massa di probabilità.' },
        },
    },
    NORMINV: {
        description: 'Restituisce l\'inversa della distribuzione normale cumulativa per la media e la deviazione standard specificate.',
        abstract: 'Restituisce l\'inversa della distribuzione normale cumulativa per la media e la deviazione standard specificate.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità corrispondente alla distribuzione normale.' },
            mean: { name: 'mean', detail: 'Obbligatorio. Media aritmetica della distribuzione.' },
            standardDev: { name: 'standard_dev', detail: 'Obbligatorio. Deviazione standard della distribuzione.' },
        },
    },
    NORMSDIST: {
        description: 'Restituisce la funzione di distribuzione normale standard cumulativa. La distribuzione ha una media uguale a 0 (zero) e una deviazione standard uguale a uno. Utilizzare questa funzione al posto di una tabella delle aree di una curva normale standard.',
        abstract: 'Restituisce la funzione di distribuzione normale standard cumulativa. La distribuzione ha una media uguale a 0 (zero) e una deviazione standard uguale a uno. Utilizzare questa funzione al posto di una tabella delle aree di una curva normale standard.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Obbligatorio. Valore per il quale si desidera la distribuzione.' },
        },
    },
    NORMSINV: {
        description: 'Restituisce l\'inversa della distribuzione normale standard cumulativa. La distribuzione ha una media uguale a zero e una deviazione standard uguale a uno.',
        abstract: 'Restituisce l\'inversa della distribuzione normale standard cumulativa. La distribuzione ha una media uguale a zero e una deviazione standard uguale a uno.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità corrispondente alla distribuzione normale.' },
        },
    },
    PERCENTILE: {
        description: 'Restituisce il k-esimo dato percentile di valori in un intervallo. È possibile utilizzare questa funzione per stabilire una soglia di accettazione. È ad esempio possibile decidere di esaminare i candidati con un punteggio superiore al 90° percentile.',
        abstract: 'Restituisce il k-esimo dato percentile di valori in un intervallo. È possibile utilizzare questa funzione per stabilire una soglia di accettazione. È ad esempio possibile decidere di esaminare i candidati con un punteggio superiore al 90° percentile.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice o intervallo di dati che definisce la condizione relativa.' },
            k: { name: 'k', detail: 'Obbligatorio. Valore percentile nell\'intervallo da 0 a 1 compresi.' },
        },
    },
    PERCENTRANK: {
        description: 'La funzione PERCENT.RANGO restituisce il rango di un valore in un set di dati come percentuale del set di dati, ovvero la condizione relativa di un valore all\'interno dell\'intero set di dati. Ad esempio, è possibile usare PERCENT.RANGO per determinare la condizione del punteggio di un singolo test nel campo di tutti i punteggi per lo stesso test.',
        abstract: 'La funzione PERCENT.RANGO restituisce il rango di un valore in un set di dati come percentuale del set di dati, ovvero la condizione relativa di un valore all\'interno dell\'intero set di dati. Ad esempio, è possibile usare PERCENT.RANGO per determinare la condizione del punteggio di un singolo test nel campo di tutti i punteggi per lo stesso test.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Intervallo di dati (o matrice predefinita) di valori numerici entro i quali viene determinato il rango percentuale.' },
            x: { name: 'x', detail: 'Obbligatorio. Valore di cui si desidera conoscere il rango all\'interno della matrice.' },
            significance: { name: 'significance', detail: 'Opzionale. Valore che identifica il numero di cifre significative per la percentuale restituita. Se questo argomento viene omesso, PERCENT.RANGO utilizzerà tre cifre (0,xxx).' },
        },
    },
    POISSON: {
        description: 'Restituisce la distribuzione di probabilità di Poisson. La distribuzione di Poisson viene in genere applicata per la previsione del numero di eventi in un arco di tempo specifico, come il numero di automobili che transitano per un casello autostradale in 1 minuto.',
        abstract: 'Restituisce la distribuzione di probabilità di Poisson. La distribuzione di Poisson viene in genere applicata per la previsione del numero di eventi in un arco di tempo specifico, come il numero di automobili che transitano per un casello autostradale in 1 minuto.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Numero degli eventi.' },
            mean: { name: 'mean', detail: 'Obbligatorio. Valore numerico previsto.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Valore logico che determina la forma della distribuzione di probabilità restituita. Se cumulativo è VERO, POISSON restituisce la probabilità cumulativa di Poisson che il numero di eventi casuali sia compreso tra zero e x inclusi; se è FALSO, restituirà la funzione massa di probabilità di Poisson che il numero di eventi che si verificano sarà esattamente x.' },
        },
    },
    QUARTILE: {
        description: 'Restituisce il quartile di un set di dati. I quartili vengono spesso utilizzati nelle indagini di mercato e nei dati statistici per suddividere le popolazioni in gruppi. È ad esempio possibile utilizzare QUARTILE per trovare il 25% dei redditi più elevati in una popolazione.',
        abstract: 'Restituisce il quartile di un set di dati. I quartili vengono spesso utilizzati nelle indagini di mercato e nei dati statistici per suddividere le popolazioni in gruppi. È ad esempio possibile utilizzare QUARTILE per trovare il 25% dei redditi più elevati in una popolazione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice o intervallo di celle di valori numerici per cui si desidera calcolare il valore quartile.' },
            quart: { name: 'quart', detail: 'Obbligatorio. Valore da restituire.' },
        },
    },
    RANK: {
        description: 'Restituisce il rango di un numero in un elenco di numeri. Il rango di un numero è la sua dimensione in rapporto agli altri valori presenti nell\'elenco. Nel caso in cui fosse necessario ordinare l\'elenco, il rango del numero corrisponderebbe alla rispettiva posizione.',
        abstract: 'Restituisce il rango di un numero in un elenco di numeri. Il rango di un numero è la sua dimensione in rapporto agli altri valori presenti nell\'elenco. Nel caso in cui fosse necessario ordinare l\'elenco, il rango del numero corrisponderebbe alla rispettiva posizione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero di cui si desidera trovare il rango.' },
            ref: { name: 'ref', detail: 'Obbligatorio. Riferimento a un elenco di numeri. I valori in rif che non sono di tipo numerico vengono ignorati.' },
            order: { name: 'order', detail: 'Opzionale. Numero che specifica come classificare num. Se ordine è 0 o è omesso, num verrà ordinato come se rif fosse un elenco in ordine decrescente. Se ordine è un valore diverso da zero, num verrà ordinato come se rif fosse un elenco in ordine crescente.' },
        },
    },
    STDEV: {
        description: 'Stima la deviazione standard sulla base di un campione. La deviazione standard è una misura che indica quanto si discostano i valori dal valore medio, ovvero la media.',
        abstract: 'Stima la deviazione standard sulla base di un campione. La deviazione standard è una misura che indica quanto si discostano i valori dal valore medio, ovvero la media.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo argomento numerico corrispondente a un campione di popolazione.' },
            number2: { name: 'number2', detail: 'Opzionale. Da 1 a 255 argomenti numerici corrispondenti a un campione di popolazione. Anziché argomenti separati da punti e virgola, è inoltre possibile utilizzare una singola matrice o un riferimento a una matrice.' },
        },
    },
    STDEVP: {
        description: 'Calcola la deviazione standard sulla base dell\'intera popolazione specificata in forma di argomenti. La deviazione standard è una misura che indica quanto i valori si discostino dal valore medio (la media).',
        abstract: 'Calcola la deviazione standard sulla base dell\'intera popolazione specificata in forma di argomenti. La deviazione standard è una misura che indica quanto i valori si discostino dal valore medio (la media).',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo argomento numerico corrispondente a una popolazione.' },
            number2: { name: 'number2', detail: 'Opzionale. Da 1 a 255 argomenti numerici corrispondenti a una popolazione. Anziché argomenti separati da punti e virgola, è inoltre possibile utilizzare una singola matrice o un riferimento a una matrice.' },
        },
    },
    TDIST: {
        description: 'Restituisce i Punti percentuali (probabilità) della distribuzione t di Student dove il valore numerico (x) è un valore calcolato di t per cui verranno calcolati i Punti percentuali. La distribuzione t viene utilizzata nelle verifiche di ipotesi su piccoli set di dati presi come campione. Utilizzare questa funzione al posto di una tabella di valori critici per il calcolo della distribuzione t.',
        abstract: 'Restituisce i Punti percentuali (probabilità) della distribuzione t di Student dove il valore numerico (x) è un valore calcolato di t per cui verranno calcolati i Punti percentuali. La distribuzione t viene utilizzata nelle verifiche di ipotesi su piccoli set di dati presi come campione. Utilizzare questa funzione al posto di una tabella di valori critici per il calcolo della distribuzione t.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore numerico in cui calcolare la distribuzione.' },
            degFreedom: { name: 'degFreedom', detail: 'Obbligatorio. Intero che indica il numero di gradi di libertà.' },
            tails: { name: 'tails', detail: 'Obbligatorio. Specifica il numero di code di distribuzione da restituire. Se Coda = 1, DISTRIB.T restituirà la distribuzione a una coda. Se Coda = 2, DISTRIB.T restituirà la distribuzione a due code.' },
        },
    },
    TINV: {
        description: 'Restituisce l\'inversa della distribuzione t di Student a due code.',
        abstract: 'Restituisce l\'inversa della distribuzione t di Student a due code.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Obbligatorio. Probabilità associata alla distribuzione t di Student a due code.' },
            degFreedom: { name: 'degFreedom', detail: 'Obbligatorio. Numero di gradi di libertà con cui caratterizzare la distribuzione.' },
        },
    },
    TTEST: {
        description: 'Restituisce la probabilità associata a un test t di Student. Utilizzare la funzione TEST.T per determinare se due campioni possono essere derivati dalle stesse due popolazioni aventi la stessa media.',
        abstract: 'Restituisce la probabilità associata a un test t di Student. Utilizzare la funzione TEST.T per determinare se due campioni possono essere derivati dalle stesse due popolazioni aventi la stessa media.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Obbligatorio. Primo set di dati.' },
            array2: { name: 'array2', detail: 'Obbligatorio. Secondo set di dati.' },
            tails: { name: 'tails', detail: 'Obbligatorio. Specifica il numero di code di distribuzione. Se coda = 1, TEST.T utilizzerà la distribuzione a una coda. Se coda = 2, TEST.T utilizzerà la distribuzione a due code.' },
            type: { name: 'type', detail: 'Obbligatorio. Tipo di test t da eseguire.' },
        },
    },
    VAR: {
        description: 'Stima la varianza sulla base di un campione.',
        abstract: 'Stima la varianza sulla base di un campione.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo argomento numerico corrispondente a un campione di popolazione.' },
            number2: { name: 'number2', detail: 'Opzionale. Da 2 a 255 argomenti numerici corrispondenti a un campione di popolazione.' },
        },
    },
    VARP: {
        description: 'Restituisce la varianza sulla base dell\'intera popolazione.',
        abstract: 'Restituisce la varianza sulla base dell\'intera popolazione.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo argomento numerico corrispondente a una popolazione.' },
            number2: { name: 'number2', detail: 'Opzionale. Da 1 a 255 argomenti numerici corrispondenti a una popolazione.' },
        },
    },
    WEIBULL: {
        description: 'Restituisce la distribuzione di Weibull. Utilizzare questa distribuzione nelle analisi di affidabilità, come il calcolo della durata media di un dispositivo.',
        abstract: 'Restituisce la distribuzione di Weibull. Utilizzare questa distribuzione nelle analisi di affidabilità, come il calcolo della durata media di un dispositivo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore in cui calcolare la funzione.' },
            alpha: { name: 'alpha', detail: 'Obbligatorio. Parametro per la distribuzione.' },
            beta: { name: 'beta', detail: 'Obbligatorio. Parametro per la distribuzione.' },
            cumulative: { name: 'cumulative', detail: 'Obbligatorio. Determina la forma assunta dalla funzione.' },
        },
    },
    ZTEST: {
        description: 'Restituisce il valore di probabilità a una coda di un test z. Ipotizzando una determinata media della popolazione µ0, TEST.Z restituisce la probabilità che la media campione sia maggiore della media di osservazioni nel set di dati (matrice), ovvero della media campione osservata.',
        abstract: 'Restituisce il valore di probabilità a una coda di un test z. Ipotizzando una determinata media della popolazione µ0, TEST.Z restituisce la probabilità che la media campione sia maggiore della media di osservazioni nel set di dati (matrice), ovvero della media campione osservata.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/ztest-function',
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
