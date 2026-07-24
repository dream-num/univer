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
    ASC: {
        description: 'Nelle lingue che utilizzano set di caratteri a byte doppio (DBCS, Double-Byte Character Set), la funzione converte i caratteri latini a byte doppio (DB, Double-Byte) in caratteri a byte singolo (SB, Single-Byte).',
        abstract: 'Nelle lingue che utilizzano set di caratteri a byte doppio (DBCS, Double-Byte Character Set), la funzione converte i caratteri latini a byte doppio (DB, Double-Byte) in caratteri a byte singolo (SB, Single-Byte).',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Testo o riferimento a una cella che contiene il testo che si desidera modificare. Se il testo non contiene caratteri a byte doppio, non verrà modificato.' },
        },
    },
    ARRAYTOTEXT: {
        description: 'La funzione MATRICE.A.TESTO restituisce una matrice di valori di testo da qualsiasi intervallo specificato. Passa i valori testuali invariati e converte i valori non testuali in testo.',
        abstract: 'La funzione MATRICE.A.TESTO restituisce una matrice di valori di testo da qualsiasi intervallo specificato. Passa i valori testuali invariati e converte i valori non testuali in testo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Matrice da restituire come testo. Obbligatorio.' },
            format: { name: 'format', detail: 'Il formato dei dati restituiti. Facoltativo. Può essere uno dei due valori seguenti: 0 Impostazione predefinita. Formato conciso semplice da leggere. Il testo restituito sarà uguale al testo visualizzato in una cella a cui è applicata la formattazione generale. 1 Formato Strict che include caratteri di escape e delimitatori di riga. Genera una stringa che può essere analizzata quando viene immessa nella barra della formula. Incapsula le stringhe restituite tra virgolette, esclusi valori booleani, numeri ed errori.' },
        },
    },
    BAHTTEXT: {
        description: 'Converte un numero in testo Thai e aggiunge il suffisso "Baht".',
        abstract: 'Converte un numero in testo Thai e aggiunge il suffisso "Baht".',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero che si desidera convertire in testo, riferimento a una cella contenente un numero o formula che restituisce un numero.' },
        },
    },
    CHAR: {
        description: 'Restituisce il carattere specificato da un numero. Utilizzare CODICE.CARATT per convertire in caratteri i numeri della tabella codici eventualmente ottenuti da file residenti in altri tipi di computer.',
        abstract: 'Restituisce il carattere specificato da un numero. Utilizzare CODICE.CARATT per convertire in caratteri i numeri della tabella codici eventualmente ottenuti da file residenti in altri tipi di computer.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero compreso tra 1 e 255 che specifica il carattere desiderato. Il carattere fa parte del set di caratteri utilizzato dal computer. Nota Excel per il Web supporta solo CODICE.CARATT(9), CODICE.CARATT(10), CODICE.CARATT(13) e CODICE.CARATT(32) e versioni successive.' },
        },
    },
    CLEAN: {
        description: 'Rimuove dal testo tutti i caratteri che non possono essere stampati. Applicare la funzione LIBERA a un testo importato da altre applicazioni contenente caratteri che potrebbero non essere stampati tramite il sistema operativo in uso. È possibile, ad esempio, utilizzare LIBERA per rimuovere codici a basso livello che si trovano di frequente all\'inizio e alla fine dei file di dati e che non possono essere stampati.',
        abstract: 'Rimuove dal testo tutti i caratteri che non possono essere stampati. Applicare la funzione LIBERA a un testo importato da altre applicazioni contenente caratteri che potrebbero non essere stampati tramite il sistema operativo in uso. È possibile, ad esempio, utilizzare LIBERA per rimuovere codici a basso livello che si trovano di frequente all\'inizio e alla fine dei file di dati e che non possono essere stampati.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Qualsiasi informazione del foglio di lavoro dalla quale si desidera rimuovere i caratteri che non possono essere stampati.' },
        },
    },
    CODE: {
        description: 'Restituisce un codice numerico per il primo carattere di una stringa di testo. Il codice restituito corrisponde al set di caratteri utilizzato dal computer.',
        abstract: 'Restituisce un codice numerico per il primo carattere di una stringa di testo. Il codice restituito corrisponde al set di caratteri utilizzato dal computer.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Testo di cui si desidera il codice del primo carattere.' },
        },
    },
    CONCAT: {
        description: 'La funzione CONCAT combina il testo di più intervalli e/o stringhe, ma non fornisce delimitatore o argomenti IgnoraEmpty.',
        abstract: 'La funzione CONCAT combina il testo di più intervalli e/o stringhe, ma non fornisce delimitatore o argomenti IgnoraEmpty.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/concat-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'L\'elemento di testo da unire. Una stringa o una matrice di stringhe, ad esempio un intervallo di celle.' },
            text2: { name: 'text2', detail: 'Altri elementi di testo da unire. Per gli elementi di testo è possibile usare un massimo di 253 argomenti di testo. Ognuno può essere una stringa o una matrice di stringhe, ad esempio un intervallo di celle.' },
        },
    },
    CONCATENATE: {
        description: 'Usare CONCATENA , una delle funzioni di testo , per unire due o più stringhe di testo in una sola stringa.',
        abstract: 'Usare CONCATENA , una delle funzioni di testo , per unire due o più stringhe di testo in una sola stringa.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/concatenate-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Primo elemento da unire. Può essere testo, numero o riferimento di cella.' },
            text2: { name: 'text2', detail: 'Elementi di testo aggiuntivi da unire. Sono consentiti fino a 255 elementi, per un totale massimo di 8.192 caratteri.' },
        },
    },
    DBCS: {
        description: 'La funzione descritta in questo argomento della Guida converte i caratteri ridotti (a singolo byte) di una stringa di caratteri in caratteri interi (a doppio byte). Il nome della funzione e i caratteri oggetto della conversione dipendono dalle impostazioni della lingua.',
        abstract: 'La funzione descritta in questo argomento della Guida converte i caratteri ridotti (a singolo byte) di una stringa di caratteri in caratteri interi (a doppio byte). Il nome della funzione e i caratteri oggetto della conversione dipendono dalle impostazioni della lingua.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Testo o riferimento a una cella contenente il testo da modificare. Se il testo non contiene caratteri latini o katakana a byte singolo, non verrà modificato.' },
        },
    },
    DOLLAR: {
        description: 'La funzione VALUTA , una delle funzioni TESTO , converte un numero in testo usando il formato valuta, con i decimali arrotondati al numero di posizioni specificato. VALUTA usa il valore $#.##0,00_); Formato numero ($#,##0,00), anche se il simbolo di valuta applicato dipende dalle impostazioni della lingua locale.',
        abstract: 'La funzione VALUTA , una delle funzioni TESTO , converte un numero in testo usando il formato valuta, con i decimali arrotondati al numero di posizioni specificato. VALUTA usa il valore $#.##0,00_); Formato numero ($#,##0,00), anche se il simbolo di valuta applicato dipende dalle impostazioni della lingua locale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero, riferimento a una cella che contiene un numero oppure formula che restituisce un numero.' },
            decimals: { name: 'decimals', detail: 'Opzionale. Numero di cifre a destra della virgola decimale. Se questo valore è negativo, il numero viene arrotondato a sinistra della virgola decimale. Se decimali è omesso, verrà considerato uguale a 2.' },
        },
    },
    EXACT: {
        description: 'Confronta due stringhe di testo e restituisce VERO se le stringhe sono identiche e FALSO in caso contrario. IDENTICO rileva le maiuscole, ma ignora le differenze di formattazione. Utilizzare la funzione IDENTICO per esaminare il testo immesso in un documento.',
        abstract: 'Confronta due stringhe di testo e restituisce VERO se le stringhe sono identiche e FALSO in caso contrario. IDENTICO rileva le maiuscole, ma ignora le differenze di formattazione. Utilizzare la funzione IDENTICO per esaminare il testo immesso in un documento.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Obbligatorio. Prima stringa di testo.' },
            text2: { name: 'text2', detail: 'Obbligatorio. Seconda stringa di testo.' },
        },
    },
    FIND: {
        description: 'Trova un valore di testo all\'interno di un altro (con distinzione tra maiuscole e minuscole).',
        abstract: 'Trova un valore di testo all\'interno di un altro (con distinzione tra maiuscole e minuscole).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Testo che si desidera trovare.' },
            withinText: { name: 'within_text', detail: 'Testo che contiene il testo da trovare.' },
            startNum: { name: 'start_num', detail: 'Specifica il carattere da cui iniziare la ricerca. Se omesso, è considerato 1.' },
        },
    },
    FINDB: {
        description: 'Trova un valore di testo all\'interno di un altro (con distinzione tra maiuscole e minuscole).',
        abstract: 'Trova un valore di testo all\'interno di un altro (con distinzione tra maiuscole e minuscole).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Testo che si desidera trovare.' },
            withinText: { name: 'within_text', detail: 'Testo che contiene il testo da trovare.' },
            startNum: { name: 'start_num', detail: 'Specifica il carattere da cui iniziare la ricerca. Se omesso, è considerato 1.' },
        },
    },
    FIXED: {
        description: 'Arrotonda un numero al numero specificato di decimali, formattandolo con i separatori delle migliaia e la virgola decimale, e restituisce il risultato in forma di testo.',
        abstract: 'Arrotonda un numero al numero specificato di decimali, formattandolo con i separatori delle migliaia e la virgola decimale, e restituisce il risultato in forma di testo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero che si desidera arrotondare e convertire in testo.' },
            decimals: { name: 'decimals', detail: 'Opzionale. Numero di cifre a destra della virgola decimale.' },
            noCommas: { name: 'no_commas', detail: 'Opzionale. Un valore logico che, se VERO, non consente a FISSO di includere i separatori delle migliaia nel testo restituito.' },
        },
    },
    LEFT: {
        description: 'Restituisce i caratteri più a sinistra di un valore di testo.',
        abstract: 'Restituisce i caratteri più a sinistra di un valore di testo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Stringa di testo contenente i caratteri da estrarre.' },
            numChars: { name: 'num_chars', detail: 'Specifica il numero di caratteri che SINISTRA deve estrarre.' },
        },
    },
    LEFTB: {
        description: 'Restituisce i caratteri più a sinistra di un valore di testo.',
        abstract: 'Restituisce i caratteri più a sinistra di un valore di testo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Stringa di testo contenente i caratteri da estrarre.' },
            numBytes: { name: 'num_bytes', detail: 'Specifica il numero di caratteri che SINISTRA.B deve estrarre, in base ai byte.' },
        },
    },
    LEN: {
        description: 'Restituisce il numero di caratteri in una stringa di testo.',
        abstract: 'Restituisce il numero di caratteri in una stringa di testo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Testo di cui si desidera trovare la lunghezza. Gli spazi contano come caratteri.' },
        },
    },
    LENB: {
        description: 'Restituisce il numero di byte usati per rappresentare i caratteri in una stringa di testo.',
        abstract: 'Restituisce il numero di byte usati per rappresentare i caratteri in una stringa di testo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Testo di cui si desidera trovare la lunghezza. Gli spazi contano come caratteri.' },
        },
    },
    LOWER: {
        description: 'Converte in minuscolo tutte le lettere maiuscole contenute in una stringa di testo.',
        abstract: 'Converte in minuscolo tutte le lettere maiuscole contenute in una stringa di testo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Testo che si desidera convertire in minuscolo. La funzione MINUSC modifica solo le lettere presenti nel testo e non altri tipi di carattere.' },
        },
    },
    MID: {
        description: 'Restituisce un numero specificato di caratteri da una stringa di testo, a partire dalla posizione indicata.',
        abstract: 'Restituisce un numero specificato di caratteri da una stringa di testo, a partire dalla posizione indicata.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Stringa di testo contenente i caratteri da estrarre.' },
            startNum: { name: 'start_num', detail: 'Posizione, nel testo, del primo carattere da estrarre.' },
            numChars: { name: 'num_chars', detail: 'Specifica il numero di caratteri che STRINGA.ESTRAI deve estrarre.' },
        },
    },
    MIDB: {
        description: 'Restituisce un numero specificato di caratteri da una stringa di testo, a partire dalla posizione indicata.',
        abstract: 'Restituisce un numero specificato di caratteri da una stringa di testo, a partire dalla posizione indicata.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Stringa di testo contenente i caratteri da estrarre.' },
            startNum: { name: 'start_num', detail: 'Posizione, nel testo, del primo carattere da estrarre.' },
            numBytes: { name: 'num_bytes', detail: 'Specifica il numero di caratteri che STRINGA.ESTRAI.B deve estrarre, in base ai byte.' },
        },
    },
    NUMBERSTRING: {
        description: 'Converte i numeri in stringhe cinesi.',
        abstract: 'Converte i numeri in stringhe cinesi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Valore convertito in una stringa cinese.' },
            type: { name: 'type', detail: 'Tipo di risultato restituito: 1, cinese minuscolo; 2, cinese maiuscolo; 3, caratteri cinesi di lettura e scrittura.' },
        },
    },
    NUMBERVALUE: {
        description: 'Converte il testo in numero in modo indipendente dalle impostazioni locali.',
        abstract: 'Converte il testo in numero in modo indipendente dalle impostazioni locali.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Testo da convertire in numero.' },
            decimalSeparator: { name: 'decimal_separator', detail: 'Opzionale. Carattere usato per separare la parte intera e frazionaria del risultato.' },
            groupSeparator: { name: 'group_separator', detail: 'Opzionale. Carattere usato per separare i raggruppamenti di numeri, come le migliaia dalla centinaia e i milioni dalle migliaia.' },
        },
    },
    PHONETIC: {
        description: 'Estrae i caratteri fonetici (furigana) da una stringa di testo.',
        abstract: 'Estrae i caratteri fonetici (furigana) da una stringa di testo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'Riferimento', detail: 'Obbligatorio. Stringa di testo o riferimento a una singola cella o a un intervallo di celle contenenti una stringa di testo furigana.' },
        },
    },
    PROPER: {
        description: 'Converte in maiuscolo la prima lettera di una stringa di testo e tutte le altre lettere che seguono un qualsiasi carattere diverso da una lettera. Le rimanenti lettere vengono convertite in minuscolo.',
        abstract: 'Converte in maiuscolo la prima lettera di una stringa di testo e tutte le altre lettere che seguono un qualsiasi carattere diverso da una lettera. Le rimanenti lettere vengono convertite in minuscolo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Testo racchiuso tra virgolette, formula che restituisce del testo o riferimento a una cella contenente del testo che si desidera convertire parzialmente in maiuscolo.' },
        },
    },
    REGEXEXTRACT: {
        description: 'Estrae la prima sottostringa che corrisponde a un\'espressione regolare.',
        abstract: 'Estrae la prima sottostringa che corrisponde a un\'espressione regolare.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098244?hl=it',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Testo di input.' },
            regularExpression: { name: 'regular_expression', detail: 'Viene restituita la prima parte del testo che corrisponde a questa espressione.' },
        },
    },
    REGEXMATCH: {
        description: 'Indica se un testo corrisponde a un\'espressione regolare.',
        abstract: 'Indica se un testo corrisponde a un\'espressione regolare.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098292?hl=it',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Testo da verificare rispetto all\'espressione regolare.' },
            regularExpression: { name: 'regular_expression', detail: 'Espressione regolare con cui verificare il testo.' },
        },
    },
    REGEXREPLACE: {
        description: 'Sostituisce una parte di una stringa di testo con un\'altra stringa usando espressioni regolari.',
        abstract: 'Sostituisce una parte di una stringa di testo con un\'altra stringa usando espressioni regolari.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098245?hl=it',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Testo di cui verrà sostituita una parte.' },
            regularExpression: { name: 'regular_expression', detail: 'Espressione regolare. Tutte le occorrenze corrispondenti nel testo verranno sostituite.' },
            replacement: { name: 'replacement', detail: 'Testo che verrà inserito nel testo originale.' },
        },
    },
    REPLACE: {
        description: 'Sostituisce caratteri all\'interno di un testo.',
        abstract: 'Sostituisce caratteri all\'interno di un testo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'Testo in cui si desidera sostituire alcuni caratteri.' },
            startNum: { name: 'start_num', detail: 'Posizione in old_text del carattere che si desidera sostituire con new_text.' },
            numChars: { name: 'num_chars', detail: 'Numero di caratteri in old_text che SOSTITUISCI deve sostituire con new_text.' },
            newText: { name: 'new_text', detail: 'Testo che sostituirà i caratteri in old_text.' },
        },
    },
    REPLACEB: {
        description: 'Sostituisce caratteri all\'interno di un testo.',
        abstract: 'Sostituisce caratteri all\'interno di un testo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'Testo in cui si desidera sostituire alcuni caratteri.' },
            startNum: { name: 'start_num', detail: 'Posizione in old_text del carattere che si desidera sostituire con new_text.' },
            numBytes: { name: 'num_bytes', detail: 'Numero di byte in old_text che SOSTITUISCI.B deve sostituire con new_text.' },
            newText: { name: 'new_text', detail: 'Testo che sostituirà i caratteri in old_text.' },
        },
    },
    REPT: {
        description: 'Ripete un testo per il numero di volte specificato. Utilizzare la funzione RIPETI per riempire una cella con una stringa di testo ripetuta più volte.',
        abstract: 'Ripete un testo per il numero di volte specificato. Utilizzare la funzione RIPETI per riempire una cella con una stringa di testo ripetuta più volte.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/rept-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Testo che si desidera ripetere.' },
            numberTimes: { name: 'number_times', detail: 'Obbligatorio. Numero positivo che specifica il numero di volte che si desidera ripetere il testo.' },
        },
    },
    RIGHT: {
        description: 'Restituisce i caratteri più a destra di un valore di testo.',
        abstract: 'Restituisce i caratteri più a destra di un valore di testo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Stringa di testo contenente i caratteri da estrarre.' },
            numChars: { name: 'num_chars', detail: 'Specifica il numero di caratteri che DESTRA deve estrarre.' },
        },
    },
    RIGHTB: {
        description: 'Restituisce i caratteri più a destra di un valore di testo.',
        abstract: 'Restituisce i caratteri più a destra di un valore di testo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Stringa di testo contenente i caratteri da estrarre.' },
            numBytes: { name: 'num_bytes', detail: 'Specifica il numero di caratteri che DESTRA.B deve estrarre, in base ai byte.' },
        },
    },
    SEARCH: {
        description: 'Trova un valore di testo all\'interno di un altro (senza distinzione tra maiuscole e minuscole).',
        abstract: 'Trova un valore di testo all\'interno di un altro (senza distinzione tra maiuscole e minuscole).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Testo che si desidera trovare.' },
            withinText: { name: 'within_text', detail: 'Testo che contiene il testo da trovare.' },
            startNum: { name: 'start_num', detail: 'Specifica il carattere da cui iniziare la ricerca. Se omesso, è considerato 1.' },
        },
    },
    SEARCHB: {
        description: 'Trova un valore di testo all\'interno di un altro (senza distinzione tra maiuscole e minuscole).',
        abstract: 'Trova un valore di testo all\'interno di un altro (senza distinzione tra maiuscole e minuscole).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Testo che si desidera trovare.' },
            withinText: { name: 'within_text', detail: 'Testo che contiene il testo da trovare.' },
            startNum: { name: 'start_num', detail: 'Specifica il carattere da cui iniziare la ricerca. Se omesso, è considerato 1.' },
        },
    },
    SUBSTITUTE: {
        description: 'Sostituisce new_text a old_text in una stringa di testo. Usare SOSTITUISCI quando si vuole sostituire testo specifico in una stringa di testo; usare SOSTITUISCI quando si vuole sostituire il testo presente in una posizione specifica di una stringa di testo.',
        abstract: 'Sostituisce new_text a old_text in una stringa di testo. Usare SOSTITUISCI quando si vuole sostituire testo specifico in una stringa di testo; usare SOSTITUISCI quando si vuole sostituire il testo presente in una posizione specifica di una stringa di testo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Testo o riferimento a una cella contenente testo di cui si desidera sostituire i caratteri.' },
            oldText: { name: 'old_text', detail: 'Obbligatorio. Testo che si desidera sostituire.' },
            newText: { name: 'new_text', detail: 'Obbligatorio. Testo che si desidera sostituire a testo_prec.' },
            instanceNum: { name: 'instance_num', detail: 'Opzionale. Occorrenza di testo_prec che si desidera sostituire con nuovo_testo. Se occorrenza viene specificata, verrà sostituita solo l\'istanza di testo_prec specificata. In caso contrario, tutte le occorrenze di testo_prec contenute in testo verranno sostituite con nuovo_testo.' },
        },
    },
    T: {
        description: 'Restituisce il testo a cui si riferisce val.',
        abstract: 'Restituisce il testo a cui si riferisce val.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Valore che si desidera esaminare.' },
        },
    },
    TEXT: {
        description: 'La funzione TESTO permette di modificare il modo di visualizzare un numero tramite l\'applicazione di formattazione con codici formato . È una funzione utile in situazioni in cui si vuole visualizzare i numeri in un formato più leggibile o combinarli con testo o simboli.',
        abstract: 'La funzione TESTO permette di modificare il modo di visualizzare un numero tramite l\'applicazione di formattazione con codici formato . È una funzione utile in situazioni in cui si vuole visualizzare i numeri in un formato più leggibile o combinarli con testo o simboli.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/text-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Valore numerico da convertire in testo.' },
            formatText: { name: 'format_text', detail: 'Stringa di testo che definisce la formattazione da applicare al valore fornito.' },
        },
    },
    TEXTAFTER: {
        description: 'Restituisce il testo che si verifica dopo il carattere o la stringa specificata. È l\'opposto della funzione TESTO.DOPO .',
        abstract: 'Restituisce il testo che si verifica dopo il carattere o la stringa specificata. È l\'opposto della funzione TESTO.DOPO .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/textafter-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Testo in cui effettuare la ricerca. I caratteri jolly non sono consentiti.' },
            delimiter: { name: 'delimiter', detail: 'Testo che indica il punto dopo il quale si desidera estrarre.' },
            instanceNum: { name: 'instance_num', detail: 'Occorrenza del delimitatore dopo la quale si desidera estrarre il testo.' },
            matchMode: { name: 'match_mode', detail: 'Determina se la ricerca distingue tra maiuscole e minuscole. Per impostazione predefinita, la distinzione è attiva.' },
            matchEnd: { name: 'match_end', detail: 'Tratta la fine del testo come delimitatore. Per impostazione predefinita, il testo deve corrispondere esattamente.' },
            ifNotFound: { name: 'if_not_found', detail: 'Valore restituito se non viene trovata alcuna corrispondenza. Per impostazione predefinita viene restituito #N/D.' },
        },
    },
    TEXTBEFORE: {
        description: 'Restituisce il testo che si verifica prima di un carattere o di una stringa specificata. È l\'opposto della funzione TESTO.DOPO .',
        abstract: 'Restituisce il testo che si verifica prima di un carattere o di una stringa specificata. È l\'opposto della funzione TESTO.DOPO .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/textbefore-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Testo in cui effettuare la ricerca. I caratteri jolly non sono consentiti.' },
            delimiter: { name: 'delimiter', detail: 'Testo che indica il punto prima del quale si desidera estrarre.' },
            instanceNum: { name: 'instance_num', detail: 'Occorrenza del delimitatore prima della quale si desidera estrarre il testo.' },
            matchMode: { name: 'match_mode', detail: 'Determina se la ricerca distingue tra maiuscole e minuscole. Per impostazione predefinita, la distinzione è attiva.' },
            matchEnd: { name: 'match_end', detail: 'Tratta la fine del testo come delimitatore. Per impostazione predefinita, il testo deve corrispondere esattamente.' },
            ifNotFound: { name: 'if_not_found', detail: 'Valore restituito se non viene trovata alcuna corrispondenza. Per impostazione predefinita viene restituito #N/D.' },
        },
    },
    TEXTJOIN: {
        description: 'La funzione TESTO.UNISCI combina il testo di più intervalli e/o stringhe e include un delimitatore specificato dall\'utente tra ogni valore di testo da unire. Se il delimitatore è una stringa di testo vuota, la funzione concatena correttamente gli intervalli.',
        abstract: 'La funzione TESTO.UNISCI combina il testo di più intervalli e/o stringhe e include un delimitatore specificato dall\'utente tra ogni valore di testo da unire. Se il delimitatore è una stringa di testo vuota, la funzione concatena correttamente gli intervalli.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: 'delimiter', detail: 'Stringa di testo, vuota o costituita da uno o più caratteri racchiusi tra virgolette doppie oppure riferimento a una stringa di testo valida. Se si specifica un numero, viene trattato come testo.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Se VERO, ignora le celle vuote.' },
            text1: { name: 'text1', detail: 'L\'elemento di testo da unire. Una stringa di testo o una matrice di stringhe, ad esempio un intervallo di celle.' },
            text2: { name: 'text2', detail: 'Altri elementi di testo da unire. Per gli elementi di testo è possibile usare un massimo di 252 argomenti di testo, incluso testo1 . Ognuno può essere una stringa di testo o una matrice di stringhe, come un intervallo di celle.' },
        },
    },
    TEXTSPLIT: {
        description: 'La funzione DIVIDI.TESTO funziona come la procedura guidata Text-to-Columns , ma in forma di formula. Consente di dividere le colonne o per righe. È l\'inversa della funzione TESTO.UNISCI .',
        abstract: 'La funzione DIVIDI.TESTO funziona come la procedura guidata Text-to-Columns , ma in forma di formula. Consente di dividere le colonne o per righe. È l\'inversa della funzione TESTO.UNISCI .',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/textsplit-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Testo da dividere. Obbligatorio.' },
            colDelimiter: { name: 'col_delimiter', detail: 'Testo che indica il punto in cui si espande il testo tra le colonne.' },
            rowDelimiter: { name: 'row_delimiter', detail: 'Testo che contrassegna il punto in cui si espande il testo verso il basso nelle righe. Facoltativo.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Specificare VERO per ignorare i delimitatori consecutivi. Il valore predefinito è FALSE che crea una cella vuota. Facoltativo.' },
            matchMode: { name: 'match_mode', detail: 'Specificare 1 per eseguire una corrispondenza senza distinzione tra maiuscole e minuscole. Il valore predefinito è 0 che esegue una corrispondenza con distinzione tra maiuscole e minuscole. Facoltativo.' },
            padWith: { name: 'pad_with', detail: 'Valore con cui riempire il risultato. L\'impostazione predefinita è #N/A.' },
        },
    },
    TRIM: {
        description: 'Rimuove tutti gli spazi dal testo ad eccezione dei singoli spazi tra le parole. Utilizzare la funzione ANNULLA.SPAZI sul testo creato con altre applicazioni che può presentare una distribuzione irregolare degli spazi.',
        abstract: 'Rimuove tutti gli spazi dal testo ad eccezione dei singoli spazi tra le parole. Utilizzare la funzione ANNULLA.SPAZI sul testo creato con altre applicazioni che può presentare una distribuzione irregolare degli spazi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Testo da cui si desidera rimuovere gli spazi. Il testo deve essere racchiuso tra virgolette.' },
        },
    },
    UNICHAR: {
        description: 'Restituisce il carattere Unicode a cui fa riferimento il valore numerico assegnato.',
        abstract: 'Restituisce il carattere Unicode a cui fa riferimento il valore numerico assegnato.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Num è il numero Unicode che rappresenta il carattere.' },
        },
    },
    UNICODE: {
        description: 'Restituisce il numero (punto di codice) corrispondente al primo carattere del testo.',
        abstract: 'Restituisce il numero (punto di codice) corrispondente al primo carattere del testo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Testo è il carattere per cui si desidera il valore Unicode.' },
        },
    },
    UPPER: {
        description: 'Converte il testo in maiuscolo.',
        abstract: 'Converte il testo in maiuscolo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Testo che si desidera convertire in maiuscolo. Può essere un riferimento o una stringa di testo.' },
        },
    },
    VALUE: {
        description: 'Converte una stringa di testo rappresentante un numero nel numero corrispondente.',
        abstract: 'Converte una stringa di testo rappresentante un numero nel numero corrispondente.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Testo racchiuso tra virgolette o riferimento a una cella contenente il testo che si desidera convertire.' },
        },
    },
    VALUETOTEXT: {
        description: 'La funzione VALUETOTEXT restituisce del testo da qualsiasi valore specificato. Passa i valori testuali invariati e converte i valori non testuali in testo.',
        abstract: 'La funzione VALUETOTEXT restituisce del testo da qualsiasi valore specificato. Passa i valori testuali invariati e converte i valori non testuali in testo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Il valore da restituire come testo. Obbligatorio.' },
            format: { name: 'format', detail: 'Il formato dei dati restituiti. Facoltativo. Può essere uno dei due valori seguenti: 0 Impostazione predefinita. Formato conciso semplice da leggere. Il testo restituito sarà uguale al testo visualizzato in una cella a cui è applicata la formattazione generale. 1 Formato Strict che include caratteri di escape e delimitatori di riga. Genera una stringa che può essere analizzata quando viene immessa nella barra della formula. Incapsula le stringhe restituite tra virgolette, esclusi valori booleani, numeri ed errori.' },
        },
    },
    CALL: {
        description: 'Richiama una procedura da una libreria a collegamento dinamico o da una risorsa codice. Questa funzione dispone di due sintassi. Utilizzare la sintassi 1 solo con una risorsa codice registrata precedentemente, che utilizza gli argomenti della funzione REGISTRO. Utilizzare la sintassi 2a o 2b per registrare e contemporaneamente richiamare una risorsa codice.',
        abstract: 'Richiama una procedura da una libreria a collegamento dinamico o da una risorsa codice. Questa funzione dispone di due sintassi. Utilizzare la sintassi 1 solo con una risorsa codice registrata precedentemente, che utilizza gli argomenti della funzione REGISTRO. Utilizzare la sintassi 2a o 2b per registrare e contemporaneamente richiamare una risorsa codice.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Obbligatorio. Testo racchiuso tra virgolette nel quale è specificato il nome della DLL che contiene la procedura in Microsoft Excel per Windows.' },
            procedure: { name: 'Procedura', detail: 'Obbligatorio. Testo che specifica il nome della funzione nella DLL di Microsoft Excel per Windows. È inoltre possibile utilizzare il valore ordinale della funzione proveniente dall\'istruzione EXPORTS del file DEF (File di definizione dei moduli, Module-Definition File). Il valore ordinale non deve essere in formato testo.' },
            typeText: { name: 'Type_text', detail: 'Obbligatorio. Testo che specifica il tipo di dati del valore restituito e i tipi di dati di tutti gli argomenti nella DLL o risorsa codice. La prima lettera di tipo specifica il valore restituito. I codici da utilizzare per tipo sono descritti in dettaglio in Utilizzo delle funzioni RICHIAMA e REGISTRO . Nel caso di file DLL autonomi o di risorse codice autonome (XLL), è possibile omettere questo argomento.' },
            argument1: { name: 'Argomento1,...', detail: 'Opzionale. Argomenti da sottoporre alla procedura.' },
        },
    },
    EUROCONVERT: {
        description: 'Consente di convertire un numero in euro, un valore dal formato euro a un formato in una valuta dei paesi membri dell\'Unione Europea, oppure un valore da una delle valute dei paesi dell\'Unione Europea in quella di un altro stato utilizzando l\'euro come intermediario (triangolazione). Le valute disponibili per la conversione sono quelle dei paesi membri dell\'Unione Europea che hanno adottato l\'euro. La funzione utilizza tassi di conversione fissi stabiliti dall\'Unione Europea.',
        abstract: 'Consente di convertire un numero in euro, un valore dal formato euro a un formato in una valuta dei paesi membri dell\'Unione Europea, oppure un valore da una delle valute dei paesi dell\'Unione Europea in quella di un altro stato utilizzando l\'euro come intermediario (triangolazione). Le valute disponibili per la conversione sono quelle dei paesi membri dell\'Unione Europea che hanno adottato l\'euro. La funzione utilizza tassi di conversione fissi stabiliti dall\'Unione Europea.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'num', detail: 'Obbligatorio. Valore in valuta da convertire oppure riferimento a una cella che contiene il valore.' },
            source: { name: 'Fonte', detail: 'Obbligatorio. Stringa di tre lettere oppure riferimento a una cella che contiene la stringa che corrisponde al codice ISO della valuta di origine. Di seguito è riportato un elenco dei codici disponibili per la funzione EUROCONVERT:' },
            target: { name: 'Bersaglio', detail: 'Obbligatorio. Stringa di tre lettere o riferimento a una cella che corrisponde al codice ISO della valuta in cui convertire il valore di origine. Per un elenco dei codici ISO, vedere la tabella precedente relativa ai codici di origine.' },
            fullPrecision: { name: 'Full_precision', detail: 'Obbligatorio. Valore logico (VERO o FALSO) oppure espressione che dà come risultato un valore VERO o FALSO, in relazione all\'arrotondamento del risultato.' },
            triangulationPrecision: { name: 'Triangulation_precision', detail: 'Obbligatorio. Intero uguale o maggiore di 3 che specifica il numero di cifre significative da utilizzare per il valore intermedio dell\'euro in caso di conversione tra due valute di paesi membri dell\'Unione Europea che hanno adottato l\'euro. Se si omette tale argomento, il valore intermedio dell\'euro non verrà arrotondato. Se si include questo argomento per la conversione in euro da una valuta di uno stato membro, verrà calcolato il valore intermedio dell\'euro che potrà quindi essere utilizzato per la conversione nella valuta di un altro stato membro.' },
        },
    },
    REGISTER_ID: {
        description: 'Restituisce l\'identificatore della DLL (Libreria a collegamento dinamico, Dynamic Link Library) o della risorsa codice specificata che è stata registrata in precedenza. Qualora la registrazione del DLL o della risorsa non sia stata effettuata, la funzione provvederà ad eseguire l\'operazione, quindi visualizzerà l\'identificatore.',
        abstract: 'Restituisce l\'identificatore della DLL (Libreria a collegamento dinamico, Dynamic Link Library) o della risorsa codice specificata che è stata registrata in precedenza. Qualora la registrazione del DLL o della risorsa non sia stata effettuata, la funzione provvederà ad eseguire l\'operazione, quindi visualizzerà l\'identificatore.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Obbligatorio. Testo che specifica il nome della DLL che contiene la funzione in Microsoft Excel per Windows.' },
            procedure: { name: 'Procedura', detail: 'Obbligatorio. Testo che specifica il nome della funzione nella DLL di Microsoft Excel per Windows. È inoltre possibile utilizzare il valore ordinale della funzione proveniente dall\'istruzione EXPORTS nel file DEF (File di definizione dei moduli, Module-Definition File). Il valore ordinale o il numero ID della risorsa non devono essere in formato testo.' },
            typeText: { name: 'Type_text', detail: 'Opzionale. Testo che specifica il tipo di dati del valore restituito e i tipi di dati di tutti gli argomenti per la DLL. La prima lettera di tipo specifica il valore restituito. Se la funzione o la risorsa codice è già stata registrata, sarà possibile omettere questo argomento.' },
        },
    },
};

export default locale;
