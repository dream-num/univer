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
    CELL: {
        description: 'La funzione CELLA restituisce informazioni sulla formattazione, la posizione o il contenuto di una cella. Se ad esempio si desidera verificare che in una cella sia contenuto un valore numerico anziché testo prima di eseguire un calcolo basato su tale cella, è possibile utilizzare la formula seguente:',
        abstract: 'La funzione CELLA restituisce informazioni sulla formattazione, la posizione o il contenuto di una cella. Se ad esempio si desidera verificare che in una cella sia contenuto un valore numerico anziché testo prima di eseguire un calcolo basato su tale cella, è possibile utilizzare la formula seguente:',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/cell-function',
            },
        ],
        functionParameter: {
            infoType: { name: 'info_type', detail: 'Valore di testo che indica il tipo di dati della cella che devono essere restituiti. Nell\'elenco seguente vengono illustrati i possibili valori dell\'argomento Info e i risultati corrispondenti.' },
            reference: { name: 'reference', detail: 'Cella di cui si desidera ottenere informazioni. Se omesso, le informazioni specificate nell\'argomento info_type vengono restituite per la cella selezionata al momento del calcolo. Se l\'argomento rif è un intervallo di celle, la funzione CELLA restituirà le informazioni per la cella attiva nell\'intervallo selezionato. Importante: Anche se tecnicamente il riferimento è facoltativo, è consigliabile includerlo nella formula, a meno che non si capisca l\'effetto della sua assenza sul risultato della formula e non si voglia applicare tale effetto. Se si omette l\'argomento rif, le informazioni su una cella specifica non vengono produrrà in modo affidabile per i motivi seguenti: In modalità di calcolo automatico, quando una cella viene modificata da un utente, il calcolo può essere attivato prima o dopo l\'avanzamento della selezione, a seconda della piattaforma in uso per Excel. Ad esempio, Excel per Windows attiva attualmente il calcolo prima delle modifiche alla selezione, ma Excel per il web lo attiva in un secondo momento. Quando Co-Authoring con un altro utente che apporta una modifica, questa funzione segnala la cella attiva anziché quella dell\'editor. Qualsiasi ricalcolo, ad esempio premendo F9, farà sì che la funzione restituisca un nuovo risultato anche se non si è verificata alcuna modifica della cella.' },
        },
    },
    ERROR_TYPE: {
        description: 'Restituisce un numero corrispondente a uno dei valori di errore di Microsoft Excel oppure restituisce l\'errore #N/D se non vi è alcun errore. È possibile utilizzare la funzione ERRORE.TIPO all\'interno di una funzione SE, in modo da determinare il tipo di errore verificatosi e restituire una stringa di testo, come un messaggio, invece del valore di errore.',
        abstract: 'Restituisce un numero corrispondente a uno dei valori di errore di Microsoft Excel oppure restituisce l\'errore #N/D se non vi è alcun errore. È possibile utilizzare la funzione ERRORE.TIPO all\'interno di una funzione SE, in modo da determinare il tipo di errore verificatosi e restituire una stringa di testo, come un messaggio, invece del valore di errore.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/error-type-function',
            },
        ],
        functionParameter: {
            errorVal: { name: 'error_val', detail: 'Obbligatorio. Valore di errore di cui si desidera trovare il numero di identificazione. Sebbene errore possa essere il valore di errore stesso, si tratta in genere di un riferimento a una cella contenente una formula che si desidera verificare.' },
        },
    },
    INFO: {
        description: 'Restituisce informazioni sull\'ambiente operativo corrente.',
        abstract: 'Restituisce informazioni sull\'ambiente operativo corrente.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: 'Type_text', detail: 'Obbligatorio. Testo che specifica il tipo di informazioni che si desidera venga restituito.' },
        },
    },
    ISBETWEEN: {
        description: 'Verifica se un numero specificato è compreso tra altri due numeri, includendo o escludendo gli estremi.',
        abstract: 'Verifica se un numero specificato è compreso tra altri due numeri, includendo o escludendo gli estremi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/10538337?hl=it',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'value_to_compare', detail: 'Valore da verificare per stabilire se è compreso tra `lower_value` e `upper_value`.' },
            lowerValue: { name: 'lower_value', detail: 'Limite inferiore dell\'intervallo di valori in cui può rientrare `value_to_compare`.' },
            upperValue: { name: 'upper_value', detail: 'Limite superiore dell\'intervallo di valori in cui può rientrare `value_to_compare`.' },
            lowerValueIsInclusive: { name: 'lower_value_is_inclusive', detail: 'Indica se l\'intervallo di valori include `lower_value`. Per impostazione predefinita è VERO.' },
            upperValueIsInclusive: { name: 'upper_value_is_inclusive', detail: 'Indica se l\'intervallo di valori include `upper_value`. Per impostazione predefinita è VERO.' },
        },
    },
    ISBLANK: {
        description: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        abstract: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore da esaminare. L\'argomento val può essere una cella vuota, un valore logico, numerico, di errore, di testo o di riferimento oppure un nome che si riferisce a uno di questi valori.' },
        },
    },
    ISDATE: {
        description: 'La funzione ISDATE indica se un valore è una data.',
        abstract: 'La funzione ISDATE indica se un valore è una data.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9061381?hl=it',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Valore da verificare come data.' },
        },
    },
    ISEMAIL: {
        description: 'La funzione ISEMAIL verifica se un valore è un indirizzo e-mail valido. Controlla che il valore rispetti un formato comunemente accettato per gli indirizzi e-mail, ma non verifica che l\'indirizzo esista.',
        abstract: 'La funzione ISEMAIL verifica se un valore è un indirizzo e-mail valido. Controlla che il valore rispetti un formato comunemente accettato per gli indirizzi e-mail, ma non verifica che l\'indirizzo esista.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256503?hl=it',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Valore da verificare come indirizzo e-mail.' },
        },
    },
    ISERR: {
        description: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        abstract: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore da esaminare. L\'argomento val può essere una cella vuota, un valore logico, numerico, di errore, di testo o di riferimento oppure un nome che si riferisce a uno di questi valori.' },
        },
    },
    ISERROR: {
        description: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        abstract: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore da esaminare. L\'argomento val può essere una cella vuota, un valore logico, numerico, di errore, di testo o di riferimento oppure un nome che si riferisce a uno di questi valori.' },
        },
    },
    ISEVEN: {
        description: 'Restituisce VERO se num è pari oppure FALSO se num è dispari.',
        abstract: 'Restituisce VERO se num è pari oppure FALSO se num è dispari.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore da esaminare. Se num non è un numero intero, la parte decimale verrà troncata.' },
        },
    },
    ISFORMULA: {
        description: 'Controlla se esiste un riferimento a una cella che contiene una formula e restituisce VERO o FALSO.',
        abstract: 'Controlla se esiste un riferimento a una cella che contiene una formula e restituisce VERO o FALSO.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Obbligatorio. L\'argomento è un riferimento alla cella che si vuole verificare. Il valore può essere un riferimento di cella, una formula o un nome che fa riferimento a una cella.' },
        },
    },
    ISLOGICAL: {
        description: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        abstract: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore da esaminare. L\'argomento val può essere una cella vuota, un valore logico, numerico, di errore, di testo o di riferimento oppure un nome che si riferisce a uno di questi valori.' },
        },
    },
    ISNA: {
        description: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        abstract: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore da esaminare. L\'argomento val può essere una cella vuota, un valore logico, numerico, di errore, di testo o di riferimento oppure un nome che si riferisce a uno di questi valori.' },
        },
    },
    ISNONTEXT: {
        description: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        abstract: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore da esaminare. L\'argomento val può essere una cella vuota, un valore logico, numerico, di errore, di testo o di riferimento oppure un nome che si riferisce a uno di questi valori.' },
        },
    },
    ISNUMBER: {
        description: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        abstract: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore da esaminare. L\'argomento val può essere una cella vuota, un valore logico, numerico, di errore, di testo o di riferimento oppure un nome che si riferisce a uno di questi valori.' },
        },
    },
    ISODD: {
        description: 'Restituisce VERO se num è dispari oppure FALSO se num è pari.',
        abstract: 'Restituisce VERO se num è dispari oppure FALSO se num è pari.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/isodd-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore da esaminare. Se num non è un numero intero, la parte decimale verrà troncata.' },
        },
    },
    ISOMITTED: {
        description: 'Controlla se il valore in un\'espressione LAMBDA non è presente e restituisce VERO o FALSO.',
        abstract: 'Controlla se il valore in un\'espressione LAMBDA non è presente e restituisce VERO o FALSO.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: 'discussione', detail: 'Valore da testare, ad esempio un parametro LAMBDA.' },
        },
    },
    ISREF: {
        description: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        abstract: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore da esaminare. L\'argomento val può essere una cella vuota, un valore logico, numerico, di errore, di testo o di riferimento oppure un nome che si riferisce a uno di questi valori.' },
        },
    },
    ISTEXT: {
        description: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        abstract: 'Ognuna di queste funzioni, definite collettivamente funzioni VAL , esamina il valore specificato e restituisce VERO o FALSO a seconda dell\'esito. La funzione VAL.VUOTO ad esempio restituirà il valore logico VERO se l\'argomento val è un riferimento a una cella vuota e il valore logico FALSO in caso contrario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore da esaminare. L\'argomento val può essere una cella vuota, un valore logico, numerico, di errore, di testo o di riferimento oppure un nome che si riferisce a uno di questi valori.' },
        },
    },
    ISURL: {
        description: 'Verifica se un valore è un URL valido.',
        abstract: 'Verifica se un valore è un URL valido.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256501?hl=it',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Valore da verificare come URL.' },
        },
    },
    N: {
        description: 'Restituisce un valore convertito in numero.',
        abstract: 'Restituisce un valore convertito in numero.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/n-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore che si desidera convertire. NUM converte i valori elencati nella tabella seguente.' },
        },
    },
    NA: {
        description: 'Restituisce il valore di errore #N/D. #N/D è il valore di errore che indica che non è disponibile alcun valore. Usare ND per contrassegnare le celle vuote. Immettendo #N/D nelle celle in cui mancano delle informazioni, si può evitare di includere inavvertitamente delle celle vuote nei calcoli. Quando una formula si riferisce a una cella contenente #N/D, restituisce il valore di errore #N/D.',
        abstract: 'Restituisce il valore di errore #N/D. #N/D è il valore di errore che indica che non è disponibile alcun valore. Usare ND per contrassegnare le celle vuote. Immettendo #N/D nelle celle in cui mancano delle informazioni, si può evitare di includere inavvertitamente delle celle vuote nei calcoli. Quando una formula si riferisce a una cella contenente #N/D, restituisce il valore di errore #N/D.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/na-function',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: 'La funzione FOGLIO restituisce il numero del foglio specificato o di un altro riferimento.',
        abstract: 'La funzione FOGLIO restituisce il numero del foglio specificato o di un altro riferimento.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/sheet-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argomento facoltativo. Consente di specificare il nome di un foglio o di un riferimento per il quale si desidera ottenere il numero del foglio. In caso contrario, la funzione restituirà il numero del foglio contenente la funzione FOGLIO.' },
        },
    },
    SHEETS: {
        description: 'Restituisce il numero di fogli in un riferimento.',
        abstract: 'Restituisce il numero di fogli in un riferimento.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/sheets-function',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: 'Restituisce un numero indicante il tipo di dati di un valore. Utilizzare la funzione TIPO quando il comportamento di un\'altra funzione dipende dal tipo di valore contenuto in una determinata cella.',
        abstract: 'Restituisce un numero indicante il tipo di dati di un valore. Utilizzare la funzione TIPO quando il comportamento di un\'altra funzione dipende dal tipo di valore contenuto in una determinata cella.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Qualsiasi valore di Microsoft Excel, ad esempio un numero, del testo, un valore logico e così via.' },
        },
    },
};

export default locale;
