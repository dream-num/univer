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
    CUBEKPIMEMBER: {
        description: 'Restituisce la proprietà di un indicatore di prestazioni chiave (KPI) e visualizza il nome di tale indicatore nella cella. Un KPI è una misura quantificabile, ad esempio l\'utile lordo mensile o il fatturato trimestrale dei dipendenti, usata per il monitoraggio delle prestazioni di un\'organizzazione.',
        abstract: 'Restituisce la proprietà di un indicatore di prestazioni chiave (KPI) e visualizza il nome di tale indicatore nella cella. Un KPI è una misura quantificabile, ad esempio l\'utile lordo mensile o il fatturato trimestrale dei dipendenti, usata per il monitoraggio delle prestazioni di un\'organizzazione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connessione', detail: 'Obbligatorio. Stringa di testo che si riferisce al nome della connessione al cubo.' },
            kpiName: { name: 'Kpi_name', detail: 'Obbligatorio. Stringa di testo relativa al nome dell\'indicatore KPI nel cubo.' },
            kpiProperty: { name: 'Kpi_property', detail: 'Obbligatorio. Componente KPI restituito e può essere uno degli elementi seguenti:' },
            caption: { name: 'Didascalia', detail: 'Opzionale. Stringa di testo alternativo visualizzata nella cella che sostituisce nome_kpi e proprietà_kpi.' },
        },
    },
    CUBEMEMBER: {
        description: 'Restituisce un membro o una tupla dal cubo. Consente di verificare l\'esistenza del membro o della tupla nel cubo.',
        abstract: 'Restituisce un membro o una tupla dal cubo. Consente di verificare l\'esistenza del membro o della tupla nel cubo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connessione', detail: 'Obbligatorio. Stringa di testo che si riferisce al nome della connessione al cubo.' },
            memberExpression: { name: 'Espressione_membro', detail: 'Obbligatorio. Stringa di testo di un\'espressione multidimensionale (MDX) che restituisce un membro univoco nel cubo. In alternativa, può essere una tupla specificata come un intervallo di celle o una costante di matrice.' },
            caption: { name: 'Didascalia', detail: 'Opzionale. Stringa di testo visualizzata nella cella in sostituzione della didascalia del cubo, se ne è stata definita una. Quando viene restituita una tupla, la didascalia usata è quella relativa all\'ultimo membro della tupla.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'La funzione PROPRIETÀ.MEMBRO.CUBO , una delle funzioni cubo di Excel, restituisce il valore di una proprietà di un membro da un cubo. Consente di verificare l\'esistenza di un nome di membro all\'interno del cubo e di restituire la proprietà specificata per tale membro.',
        abstract: 'La funzione PROPRIETÀ.MEMBRO.CUBO , una delle funzioni cubo di Excel, restituisce il valore di una proprietà di un membro da un cubo. Consente di verificare l\'esistenza di un nome di membro all\'interno del cubo e di restituire la proprietà specificata per tale membro.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connessione', detail: 'Obbligatorio. Stringa di testo che si riferisce al nome della connessione al cubo.' },
            memberExpression: { name: 'Espressione_membro', detail: 'Obbligatorio. Stringa di testo di un\'espressione multidimensionale (MDX) di un membro all\'interno del cubo.' },
            property: { name: 'Proprietà', detail: 'Obbligatorio. Stringa di testo relativa al nome della proprietà restituita o riferimento a una cella che contiene il nome della proprietà.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Restituisce l\'n-esimo membro o il membro ordinato di un insieme. È possibile ottenere uno o più elementi di un insieme, ad esempio il venditore migliore o i primi 10 studenti.',
        abstract: 'Restituisce l\'n-esimo membro o il membro ordinato di un insieme. È possibile ottenere uno o più elementi di un insieme, ad esempio il venditore migliore o i primi 10 studenti.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connessione', detail: 'Obbligatorio. Stringa di testo che si riferisce al nome della connessione al cubo.' },
            setExpression: { name: 'Espressione_insieme', detail: 'Obbligatorio. Stringa di testo di un\'espressione di insieme, ad esempio "{[Elemento1].figli}". Può essere anche costituita dalla funzione SET.CUBO o da un riferimento a una cella che contiene tale funzione.' },
            rank: { name: 'Rango', detail: 'Obbligatorio. Valore intero che specifica il valore più alto da restituire. Se il valore rango è 1, viene restituito il valore più alto, se è 2, viene restituito il secondo valore più alto e così via. Per ottenere i primi 5 valori, usare cinque volte la funzione MEMBRO.CUBO.CON.RANGO specificando un rango diverso ogni volta, da 1 a 5.' },
            caption: { name: 'Didascalia', detail: 'Opzionale. Stringa di testo visualizzata nella cella in sostituzione della didascalia del cubo, se ne è stata definita una.' },
        },
    },
    CUBESET: {
        description: 'Definisce un insieme di tuple o membri calcolati mediante l\'invio di un\'espressione di insieme al cubo sul server. In questo modo l\'insieme viene creato e restituito a Microsoft Excel.',
        abstract: 'Definisce un insieme di tuple o membri calcolati mediante l\'invio di un\'espressione di insieme al cubo sul server. In questo modo l\'insieme viene creato e restituito a Microsoft Excel.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connessione', detail: 'Obbligatorio. Stringa di testo che si riferisce al nome della connessione al cubo.' },
            setExpression: { name: 'Espressione_insieme', detail: 'Obbligatorio. Stringa di testo di un\'espressione di insieme che restituisce un insieme di membri o tuple. Può essere anche costituito da un riferimento di cella in un intervallo Excel che contiene uno o più membri, tuple o insiemi inclusi nell\'insieme.' },
            caption: { name: 'Didascalia', detail: 'Opzionale. Stringa di testo visualizzata nella cella in sostituzione della didascalia del cubo, se ne è stata definita una.' },
            sortOrder: { name: 'Sort_order', detail: 'Opzionale. Tipo di ordinamento da seguire, se presente, e può essere uno tra quelli seguenti:' },
            sortBy: { name: 'Sort_by', detail: 'Opzionale. Una stringa di testo del valore di ordinamento. Ad esempio, per ottenere la città con le vendite maggiori, espressione_insieme sarà un insieme di città e ordina_per sarà la misura delle vendite. In alternativa, per ottenere la città più densamente popolata, espressione_insieme sarà un insieme di città e ordina_per sarà la misura della popolazione. Se ordinamento richiede ordina_per e questo viene omesso, SET.CUBO restituirà il messaggio di errore #VALORE! .' },
        },
    },
    CUBESETCOUNT: {
        description: 'Restituisce il numero di elementi di un insieme.',
        abstract: 'Restituisce il numero di elementi di un insieme.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: 'Impostare', detail: 'Obbligatorio. Stringa di testo di un\'espressione Microsoft Excel che restituisce un insieme definito dalla funzione SET.CUBO. Può essere anche costituito dalla funzione SET.CUBO o da un riferimento a una cella che contiene tale funzione.' },
        },
    },
    CUBEVALUE: {
        description: 'Restituisce un valore aggregato dal cubo.',
        abstract: 'Restituisce un valore aggregato dal cubo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Connessione', detail: 'Obbligatorio. Stringa di testo che si riferisce al nome della connessione al cubo.' },
            memberExpression: { name: 'Espressione_membro', detail: 'Opzionale. Stringa di testo di un\'espressione multidimensionale (MDX) che restituisce un membro o una tupla all\'interno del cubo. In alternativa, può essere un insieme definito mediante la funzione SET.CUBO. È possibile usare espressione_membro1 come filtro dei dati per la definizione della porzione del cubo per cui viene restituito il valore aggregato. Se in espressione_membro1 non viene specificata una misura, verrà usata la misura predefinita per il cubo.' },
        },
    },
};

export default locale;
