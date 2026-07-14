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
    DAVERAGE: {
        description: 'Calcola la media dei valori di un campo (colonna) di record in un elenco o database che soddisfano le condizioni specificate.',
        abstract: 'Calcola la media dei valori di un campo (colonna) di record in un elenco o database che soddisfano le condizioni specificate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'è l\'intervallo di celle che costituisce l\'elenco o il database. Un database è un elenco di dati correlati in cui le righe di informazioni correlate costituiscono i record e le colonne di dati i campi. La prima riga dell\'elenco contiene le etichette relative a ciascuna colonna.' },
            field: { name: 'field', detail: 'indica la colonna usata nella funzione. Immettere l\'etichetta di colonna racchiusa tra virgolette doppie, quale "Età" o "Rendimento", oppure immettere un numero, senza racchiuderlo tra virgolette, che rappresenta la posizione della colonna nell\'elenco, ovvero 1 per la prima colonna, 2 per la seconda colonna e così via.' },
            criteria: { name: 'criteria', detail: 'è l\'intervallo di celle che contiene le condizioni specificate. È possibile utilizzare qualsiasi intervallo per l\'argomento di criteri, purché includa almeno un\'etichetta di colonna e una cella sottostante l\'etichetta di colonna in cui specificare una condizione per la colonna.' },
        },
    },
    DCOUNT: {
        description: 'Conta le celle che contengono numeri in un campo (colonna) di record di un elenco o database che soddisfano le condizioni specificate.',
        abstract: 'Conta le celle che contengono numeri in un campo (colonna) di record di un elenco o database che soddisfano le condizioni specificate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obbligatorio. Intervallo di celle che costituisce l\'elenco o il database. Un database è un elenco di dati correlati in cui le righe di informazioni correlate costituiscono i record e le colonne di dati i campi. La prima riga dell\'elenco contiene le etichette relative a ciascuna colonna.' },
            field: { name: 'field', detail: 'Obbligatorio. Indica quale colonna viene utilizzata nella funzione. Immettere l\'etichetta di colonna racchiusa tra virgolette doppie, quale "Età" o "Rendimento", oppure immettere un numero, senza racchiuderlo tra virgolette, che rappresenta la posizione della colonna nell\'elenco, ovvero 1 per la prima colonna, 2 per la seconda colonna e così via.' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Intervallo di celle contenente le condizioni specificate. È possibile usare qualsiasi intervallo per l\'argomento di criteri, purché l\'argomento includa almeno un\'etichetta di colonna e una cella sottostante l\'etichetta di colonna in cui specificare una condizione per la colonna.' },
        },
    },
    DCOUNTA: {
        description: 'Conta le celle non vuote di un campo (colonna) di record di un elenco o database che soddisfano le condizioni specificate.',
        abstract: 'Conta le celle non vuote di un campo (colonna) di record di un elenco o database che soddisfano le condizioni specificate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obbligatorio. Intervallo di celle che costituisce l\'elenco o il database. Un database è un elenco di dati correlati in cui le righe di informazioni correlate costituiscono i record e le colonne di dati i campi. La prima riga dell\'elenco contiene le etichette relative a ciascuna colonna.' },
            field: { name: 'field', detail: 'Opzionale. Indica quale colonna viene utilizzata nella funzione. Immettere l\'etichetta di colonna racchiusa tra virgolette doppie, quale "Età" o "Rendimento", oppure immettere un numero, senza racchiuderlo tra virgolette, che rappresenta la posizione della colonna nell\'elenco, ovvero 1 per la prima colonna, 2 per la seconda colonna e così via.' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Intervallo di celle contenente le condizioni specificate. È possibile utilizzare qualsiasi intervallo per l\'argomento di criteri, purché includa almeno un\'etichetta di colonna e una cella sottostante l\'etichetta di colonna in cui specificare una condizione per la colonna.' },
        },
    },
    DGET: {
        description: 'Estrae un singolo valore da una colonna di un elenco o database che soddisfa le condizioni specificate.',
        abstract: 'Estrae un singolo valore da una colonna di un elenco o database che soddisfa le condizioni specificate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obbligatorio. Intervallo di celle che costituisce l\'elenco o il database. Un database è un elenco di dati correlati in cui le righe di informazioni correlate costituiscono i record e le colonne di dati i campi. La prima riga dell\'elenco contiene le etichette relative a ciascuna colonna.' },
            field: { name: 'field', detail: 'Obbligatorio. Indica quale colonna viene utilizzata nella funzione. Immettere l\'etichetta di colonna racchiusa tra virgolette doppie, quale "Età" o "Rendimento", oppure immettere un numero, senza racchiuderlo tra virgolette, che rappresenta la posizione della colonna nell\'elenco, ovvero 1 per la prima colonna, 2 per la seconda colonna e così via.' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Intervallo di celle contenente le condizioni specificate. È possibile utilizzare qualsiasi intervallo per l\'argomento di criteri, purché includa almeno un\'etichetta di colonna e una cella sottostante l\'etichetta di colonna in cui specificare una condizione per la colonna.' },
        },
    },
    DMAX: {
        description: 'Restituisce il numero più grande di un campo (colonna) di record di un elenco o database che soddisfa le condizioni specificate.',
        abstract: 'Restituisce il numero più grande di un campo (colonna) di record di un elenco o database che soddisfa le condizioni specificate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obbligatorio. Intervallo di celle che costituisce l\'elenco o il database. Un database è un elenco di dati correlati in cui le righe di informazioni correlate costituiscono i record e le colonne di dati i campi. La prima riga dell\'elenco contiene le etichette relative a ciascuna colonna.' },
            field: { name: 'field', detail: 'Obbligatorio. Indica quale colonna viene utilizzata nella funzione. Immettere l\'etichetta di colonna racchiusa tra virgolette doppie, quale "Età" o "Rendimento", oppure immettere un numero, senza racchiuderlo tra virgolette, che rappresenta la posizione della colonna nell\'elenco, ovvero 1 per la prima colonna, 2 per la seconda colonna e così via.' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Intervallo di celle contenente le condizioni specificate. È possibile utilizzare qualsiasi intervallo per l\'argomento di criteri, purché includa almeno un\'etichetta di colonna e una cella sottostante l\'etichetta di colonna in cui specificare una condizione per la colonna.' },
        },
    },
    DMIN: {
        description: 'Restituisce il numero più piccolo di un campo (colonna) di record di un elenco o database che soddisfa le condizioni specificate.',
        abstract: 'Restituisce il numero più piccolo di un campo (colonna) di record di un elenco o database che soddisfa le condizioni specificate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obbligatorio. Intervallo di celle che costituisce l\'elenco o il database. Un database è un elenco di dati correlati in cui le righe di informazioni correlate costituiscono i record e le colonne di dati i campi. La prima riga dell\'elenco contiene le etichette relative a ciascuna colonna.' },
            field: { name: 'field', detail: 'Obbligatorio. Indica quale colonna viene utilizzata nella funzione. Immettere l\'etichetta di colonna racchiusa tra virgolette doppie, quale "Età" o "Rendimento", oppure immettere un numero, senza racchiuderlo tra virgolette, che rappresenta la posizione della colonna nell\'elenco, ovvero 1 per la prima colonna, 2 per la seconda colonna e così via.' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Intervallo di celle contenente le condizioni specificate. È possibile utilizzare qualsiasi intervallo per l\'argomento di criteri, purché includa almeno un\'etichetta di colonna e una cella sottostante l\'etichetta di colonna in cui specificare una condizione per la colonna.' },
        },
    },
    DPRODUCT: {
        description: 'Moltiplica i valori di un campo (colonna) di record di un elenco o database che soddisfano le condizioni specificate.',
        abstract: 'Moltiplica i valori di un campo (colonna) di record di un elenco o database che soddisfano le condizioni specificate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obbligatorio. Intervallo di celle che costituisce l\'elenco o il database. Un database è un elenco di dati correlati in cui le righe di informazioni correlate costituiscono i record e le colonne di dati i campi. La prima riga dell\'elenco contiene le etichette relative a ciascuna colonna.' },
            field: { name: 'field', detail: 'Obbligatorio. Indica quale colonna viene utilizzata nella funzione. Immettere l\'etichetta di colonna racchiusa tra virgolette doppie, quale "Età" o "Rendimento", oppure immettere un numero, senza racchiuderlo tra virgolette, che rappresenta la posizione della colonna nell\'elenco, ovvero 1 per la prima colonna, 2 per la seconda colonna e così via.' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Intervallo di celle contenente le condizioni specificate. È possibile utilizzare qualsiasi intervallo per l\'argomento di criteri, purché includa almeno un\'etichetta di colonna e una cella sottostante l\'etichetta di colonna in cui specificare una condizione per la colonna.' },
        },
    },
    DSTDEV: {
        description: 'Calcola la deviazione standard di una popolazione in base a un campione utilizzando i numeri di un campo (colonna) di record di un elenco o database che soddisfano le condizioni specificate.',
        abstract: 'Calcola la deviazione standard di una popolazione in base a un campione utilizzando i numeri di un campo (colonna) di record di un elenco o database che soddisfano le condizioni specificate.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obbligatorio. Intervallo di celle che costituisce l\'elenco o il database. Un database è un elenco di dati correlati in cui le righe di informazioni correlate costituiscono i record e le colonne di dati i campi. La prima riga dell\'elenco contiene le etichette relative a ciascuna colonna.' },
            field: { name: 'field', detail: 'Obbligatorio. Indica quale colonna viene utilizzata nella funzione. Immettere l\'etichetta di colonna racchiusa tra virgolette doppie, quale "Età" o "Rendimento", oppure immettere un numero, senza racchiuderlo tra virgolette, che rappresenta la posizione della colonna nell\'elenco, ovvero 1 per la prima colonna, 2 per la seconda colonna e così via.' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Intervallo di celle contenente le condizioni specificate. È possibile utilizzare qualsiasi intervallo per l\'argomento di criteri, purché includa almeno un\'etichetta di colonna e una cella sottostante l\'etichetta di colonna in cui specificare una condizione per la colonna.' },
        },
    },
    DSTDEVP: {
        description: 'Calcola la deviazione standard di una popolazione in base all\'intera popolazione utilizzando i numeri di un campo (colonna) di record di un elenco o database che soddisfano le condizioni specificate.',
        abstract: 'Calcola la deviazione standard di una popolazione in base all\'intera popolazione utilizzando i numeri di un campo (colonna) di record di un elenco o database che soddisfano le condizioni specificate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obbligatorio. Intervallo di celle che costituisce l\'elenco o il database. Un database è un elenco di dati correlati in cui le righe di informazioni correlate costituiscono i record e le colonne di dati i campi. La prima riga dell\'elenco contiene le etichette relative a ciascuna colonna.' },
            field: { name: 'field', detail: 'Obbligatorio. Indica quale colonna viene utilizzata nella funzione. Immettere l\'etichetta di colonna racchiusa tra virgolette doppie, quale "Età" o "Rendimento", oppure immettere un numero, senza racchiuderlo tra virgolette, che rappresenta la posizione della colonna nell\'elenco, ovvero 1 per la prima colonna, 2 per la seconda colonna e così via.' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Intervallo di celle contenente le condizioni specificate. È possibile utilizzare qualsiasi intervallo per l\'argomento di criteri, purché includa almeno un\'etichetta di colonna e una cella sottostante l\'etichetta di colonna in cui specificare una condizione per la colonna.' },
        },
    },
    DSUM: {
        description: 'In un elenco o database, DB.SOMMA fornisce la somma dei numeri nei campi (colonne) dei record che corrispondono alle condizioni specificate.',
        abstract: 'In un elenco o database, DB.SOMMA fornisce la somma dei numeri nei campi (colonne) dei record che corrispondono alle condizioni specificate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obbligatorio. Questo è l\'intervallo di celle che costituisce l\'elenco o il database. Un database è un elenco di dati correlati in cui le righe di informazioni correlate sono record e le colonne di dati sono campi . La prima riga di un elenco contiene le etichette per ogni colonna contenuta.' },
            field: { name: 'field', detail: 'Obbligatorio. Specifica quale colonna viene usata nella funzione. Specificare l\'etichetta di colonna racchiusa tra virgolette doppie, ad esempio "Età" o "Rendimento". In alternativa, è possibile specificare un numero, senza virgolette, che rappresenta la posizione della colonna all\'interno dell\'elenco, ad esempio 1 per la prima colonna, 2 per la seconda colonna e così via.' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Questo è l\'intervallo di celle che contiene le condizioni specificate. È possibile utilizzare qualsiasi intervallo per l\'argomento di criteri, purché includa almeno un\'etichetta di colonna e una cella sottostante l\'etichetta di colonna in cui specificare una condizione per la colonna.' },
        },
    },
    DVAR: {
        description: 'Calcola la varianza di una popolazione sulla base di un campione utilizzando i numeri di un campo (colonna) di record di un elenco o database che soddisfano le condizioni specificate.',
        abstract: 'Calcola la varianza di una popolazione sulla base di un campione utilizzando i numeri di un campo (colonna) di record di un elenco o database che soddisfano le condizioni specificate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obbligatorio. Intervallo di celle che costituisce l\'elenco o il database. Un database è un elenco di dati correlati in cui le righe di informazioni correlate costituiscono i record e le colonne di dati i campi. La prima riga dell\'elenco contiene le etichette relative a ciascuna colonna.' },
            field: { name: 'field', detail: 'Obbligatorio. Indica quale colonna viene utilizzata nella funzione. Immettere l\'etichetta di colonna racchiusa tra virgolette doppie, quale "Età" o "Rendimento", oppure immettere un numero, senza racchiuderlo tra virgolette, che rappresenta la posizione della colonna nell\'elenco, ovvero 1 per la prima colonna, 2 per la seconda colonna e così via.' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Intervallo di celle contenente le condizioni specificate. È possibile utilizzare qualsiasi intervallo per l\'argomento di criteri, purché includa almeno un\'etichetta di colonna e una cella sottostante l\'etichetta di colonna in cui specificare una condizione per la colonna.' },
        },
    },
    DVARP: {
        description: 'Calcola la varianza di una popolazione sulla base dell\'intera popolazione utilizzando i numeri di un campo (colonna) di record di un elenco o database che soddisfano i criteri specificati.',
        abstract: 'Calcola la varianza di una popolazione sulla base dell\'intera popolazione utilizzando i numeri di un campo (colonna) di record di un elenco o database che soddisfano i criteri specificati.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Obbligatorio. Intervallo di celle che costituisce l\'elenco o il database. Un database è un elenco di dati correlati in cui le righe di informazioni correlate costituiscono i record e le colonne di dati i campi. La prima riga dell\'elenco contiene le etichette relative a ciascuna colonna.' },
            field: { name: 'field', detail: 'Obbligatorio. Indica quale colonna viene utilizzata nella funzione. Immettere l\'etichetta di colonna racchiusa tra virgolette doppie, quale "Età" o "Rendimento", oppure immettere un numero, senza racchiuderlo tra virgolette, che rappresenta la posizione della colonna nell\'elenco, ovvero 1 per la prima colonna, 2 per la seconda colonna e così via.' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Intervallo di celle contenente le condizioni specificate. È possibile utilizzare qualsiasi intervallo per l\'argomento di criteri, purché includa almeno un\'etichetta di colonna e una cella sottostante l\'etichetta di colonna in cui specificare una condizione per la colonna.' },
        },
    },
};

export default locale;
