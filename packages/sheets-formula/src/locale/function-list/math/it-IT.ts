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
    ABS: {
        description: 'Restituisce il valore assoluto di un numero. Il valore assoluto di un numero è il numero privo del segno corrispondente.',
        abstract: 'Restituisce il valore assoluto di un numero. Il valore assoluto di un numero è il numero privo del segno corrispondente.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale di cui si vuole ottenere il valore assoluto.' },
        },
    },
    ACOS: {
        description: 'Restituisce l\'arcocoseno, o inversa del coseno, di un numero. L\'arcocoseno è l\'angolo il cui coseno è num . L\'angolo risultante viene espresso in radianti con un valore compreso tra 0 (zero) e pi.',
        abstract: 'Restituisce l\'arcocoseno, o inversa del coseno, di un numero. L\'arcocoseno è l\'angolo il cui coseno è num . L\'angolo risultante viene espresso in radianti con un valore compreso tra 0 (zero) e pi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Coseno dell\'angolo desiderato e deve essere un valore compreso tra -1 e 1.' },
        },
    },
    ACOSH: {
        description: 'Restituisce l\'inversa del coseno iperbolico di un numero. Il numero deve essere maggiore o uguale a 1. L\'inversa del coseno iperbolico è il valore il cui coseno iperbolico è num , quindi ACOSH(COSH(num)) equivale a num .',
        abstract: 'Restituisce l\'inversa del coseno iperbolico di un numero. Il numero deve essere maggiore o uguale a 1. L\'inversa del coseno iperbolico è il valore il cui coseno iperbolico è num , quindi ACOSH(COSH(num)) equivale a num .',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale qualsiasi maggiore o uguale a 1.' },
        },
    },
    ACOT: {
        description: 'Restituisce il valore principale dell\'arcotangente, o cotangente inversa, di un numero.',
        abstract: 'Restituisce il valore principale dell\'arcotangente, o cotangente inversa, di un numero.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Num è la cotangente dell\'angolo desiderato. Questo deve essere un numero reale.' },
        },
    },
    ACOTH: {
        description: 'Restituisce l\'inversa della cotangente iperbolica di un numero.',
        abstract: 'Restituisce l\'inversa della cotangente iperbolica di un numero.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Il valore assoluto di numero deve essere maggiore di 1.' },
        },
    },
    AGGREGATE: {
        description: 'Restituisce un aggregato in un elenco o database. La funzione AGGREGA può applicare funzioni di aggregazione diverse a un elenco o database con l\'opzione di ignorare le righe nascoste e i valori di errore.',
        abstract: 'Restituisce un aggregato in un elenco o database. La funzione AGGREGA può applicare funzioni di aggregazione diverse a un elenco o database con l\'opzione di ignorare le righe nascoste e i valori di errore.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Obbligatorio. Numero compreso tra 1 e 19 che specifica la funzione da utilizzare.' },
            options: { name: 'options', detail: 'Obbligatorio. Valore numerico che determina i valori da ignorare nell\'intervallo di valutazione della funzione. Nota La funzione non ignorerà le righe nascoste, i subtotali annidati o le aggregazioni annidate se l\'argomento matrice include un calcolo, ad esempio: =AGGREGA(14;3;A1:A100*(A1:A100>0);1)' },
            ref1: { name: 'ref1', detail: 'Obbligatorio. Primo argomento numerico per le funzioni che accettano più argomenti numerici di cui si vuole calcolare il valore aggregato.' },
            ref2: { name: 'ref2', detail: 'Opzionale. Argomenti numerici da 2 a 253 di cui si desidera il valore aggregato. Per le funzioni che accettano matrici, rif1 è una matrice o una formula matrice oppure un riferimento a un intervallo di celle di cui si desidera il valore aggregato. Rif2 è un secondo argomento obbligatorio per determinate funzioni. Le funzioni seguenti richiedono un argomento rif2:' },
        },
    },
    ARABIC: {
        description: 'Converte un numero romano in numero arabo.',
        abstract: 'Converte un numero romano in numero arabo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio. Stringa tra virgolette, stringa vuota (""), o riferimento a una cella contenente testo.' },
        },
    },
    ASIN: {
        description: 'Restituisce l\'arcoseno, o inversa del seno, di un numero. L\'arcoseno è l\'angolo il cui seno è num . L\'angolo risultante viene espresso in radianti con un valore compreso tra -pi greco/2 e pi greco/2.',
        abstract: 'Restituisce l\'arcoseno, o inversa del seno, di un numero. L\'arcoseno è l\'angolo il cui seno è num . L\'angolo risultante viene espresso in radianti con un valore compreso tra -pi greco/2 e pi greco/2.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Seno dell\'angolo desiderato e deve essere un valore compreso tra -1 e 1.' },
        },
    },
    ASINH: {
        description: 'Restituisce l\'inversa del seno iperbolico di un numero. L\'inversa del seno iperbolico è il valore il cui seno iperbolico è num , quindi ASINH(SINH(num)) equivale a num .',
        abstract: 'Restituisce l\'inversa del seno iperbolico di un numero. L\'inversa del seno iperbolico è il valore il cui seno iperbolico è num , quindi ASINH(SINH(num)) equivale a num .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale.' },
        },
    },
    ATAN: {
        description: 'Restituisce l\'arcotangente, o inversa della tangente, di un numero. L\'arcotangente è l\'angolo la cui tangente è num . L\'angolo risultante viene espresso in radianti con un valore compreso tra -pi greco/2 e pi greco/2.',
        abstract: 'Restituisce l\'arcotangente, o inversa della tangente, di un numero. L\'arcotangente è l\'angolo la cui tangente è num . L\'angolo risultante viene espresso in radianti con un valore compreso tra -pi greco/2 e pi greco/2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Tangente dell\'angolo desiderato.' },
        },
    },
    ATAN2: {
        description: 'Restituisce l\'arcotangente, o inversa della tangente, delle coordinate x e y specificate. L\'arcotangente è l\'angolo compreso tra l\'asse x e una linea contenente l\'origine (0; 0) e un punto con coordinate (x; y). L\'angolo viene espresso in radianti con valori compresi tra -pi greco e pi greco, a esclusione di -pi greco.',
        abstract: 'Restituisce l\'arcotangente, o inversa della tangente, delle coordinate x e y specificate. L\'arcotangente è l\'angolo compreso tra l\'asse x e una linea contenente l\'origine (0; 0) e un punto con coordinate (x; y). L\'angolo viene espresso in radianti con valori compresi tra -pi greco e pi greco, a esclusione di -pi greco.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_num', detail: 'Obbligatorio. Ascissa del punto.' },
            yNum: { name: 'y_num', detail: 'Obbligatorio. Ordinata del punto.' },
        },
    },
    ATANH: {
        description: 'Restituisce l\'inversa della tangente iperbolica di un numero. Num deve essere compreso tra -1 e 1 (esclusi -1 e 1). L\'inversa della tangente iperbolica è il valore la cui tangente iperbolica è num , quindi ARCTANH(TANH(num)) equivale a num .',
        abstract: 'Restituisce l\'inversa della tangente iperbolica di un numero. Num deve essere compreso tra -1 e 1 (esclusi -1 e 1). L\'inversa della tangente iperbolica è il valore la cui tangente iperbolica è num , quindi ARCTANH(TANH(num)) equivale a num .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale compreso tra 1 e -1.' },
        },
    },
    BASE: {
        description: 'Converte un numero in una rappresentazione in formato testo con la radice data (base).',
        abstract: 'Converte un numero in una rappresentazione in formato testo con la radice data (base).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero da convertire. Deve essere un numero intero maggiore o uguale a 0 e minore di 2^53.' },
            radix: { name: 'radix', detail: 'Obbligatorio. Radice base nella quale si vuole convertire il numero. Deve essere un numero intero maggiore o uguale a 2 e minore o uguale a 36.' },
            minLength: { name: 'min_length', detail: 'Opzionale. Lunghezza minima della stringa restituita. Deve essere un numero intero maggiore o uguale a 0.' },
        },
    },
    CEILING: {
        description: 'Restituisce un numero arrotondato per eccesso al multiplo più vicino a peso. Se ad esempio si desidera arrotondare il prezzo di un prodotto in modo da eliminare i centesimi inferiori a 5 e il prodotto costa € 4,42, utilizzare la formula =ARROTONDA.ECCESSO(4,42;0,05).',
        abstract: 'Restituisce un numero arrotondato per eccesso al multiplo più vicino a peso. Se ad esempio si desidera arrotondare il prezzo di un prodotto in modo da eliminare i centesimi inferiori a 5 e il prodotto costa € 4,42, utilizzare la formula =ARROTONDA.ECCESSO(4,42;0,05).',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Valore che si desidera arrotondare.' },
            significance: { name: 'significance', detail: 'Obbligatorio. Multiplo a cui si desidera arrotondare il numero.' },
        },
    },
    CEILING_MATH: {
        description: 'Il SOFFITTO. La funzione MATEMATICA arrotonda un numero per eccesso all\'intero più vicino o, facoltativamente, al multiplo più vicino a peso.',
        abstract: 'Il SOFFITTO. La funzione MATEMATICA arrotonda un numero per eccesso all\'intero più vicino o, facoltativamente, al multiplo più vicino a peso.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. (deve essere compreso tra -2,229E-308.e 9,99E+307.)' },
            significance: { name: 'significance', detail: 'Opzionale. Numero di cifre significative dopo la virgola decimale a cui arrotondare num .' },
            mode: { name: 'mode', detail: 'Opzionale. Controlla se i numeri negativi vengono arrotondati per eccesso o per eccesso.' },
        },
    },
    CEILING_PRECISE: {
        description: 'Restituisce un numero arrotondato per eccesso all\'intero più vicino o al multiplo più vicino a peso. Indipendentemente dal segno di num, il numero viene arrotondato per eccesso. Se tuttavia num o peso è zero, verrà restituito il valore zero.',
        abstract: 'Restituisce un numero arrotondato per eccesso all\'intero più vicino o al multiplo più vicino a peso. Indipendentemente dal segno di num, il numero viene arrotondato per eccesso. Se tuttavia num o peso è zero, verrà restituito il valore zero.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Valore da arrotondare.' },
            significance: { name: 'significance', detail: 'Opzionale. Multiplo al quale arrotondare num. Se il valore di peso viene omesso, il valore predefinito è 1.' },
        },
    },
    COMBIN: {
        description: 'Restituisce il numero delle combinazioni per un numero assegnato di elementi, indipendentemente dal loro ordine. Utilizzare la funzione COMBINAZIONE per calcolare tutti i possibili gruppi che si possono formare con un determinato numero di elementi.',
        abstract: 'Restituisce il numero delle combinazioni per un numero assegnato di elementi, indipendentemente dal loro ordine. Utilizzare la funzione COMBINAZIONE per calcolare tutti i possibili gruppi che si possono formare con un determinato numero di elementi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero di elementi.' },
            numberChosen: { name: 'number_chosen', detail: 'Obbligatorio. Numero di elementi in ogni combinazione.' },
        },
    },
    COMBINA: {
        description: 'Restituisce il numero delle combinazioni (con ripetizioni) per un numero assegnato di elementi.',
        abstract: 'Restituisce il numero delle combinazioni (con ripetizioni) per un numero assegnato di elementi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Deve essere maggiore di o uguale a 0 e maggiore di o uguale a classe. I valori non interi vengono troncati.' },
            numberChosen: { name: 'number_chosen', detail: 'Obbligatorio. Deve essere maggiore di o uguale a 0. I valori non interi vengono troncati.' },
        },
    },
    COS: {
        description: 'Restituisce il coseno dell\'angolo specificato.',
        abstract: 'Restituisce il coseno dell\'angolo specificato.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Angolo in radianti di cui si desidera il coseno.' },
        },
    },
    COSH: {
        description: 'Restituisce il coseno iperbolico di un numero.',
        abstract: 'Restituisce il coseno iperbolico di un numero.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Qualsiasi numero reale di cui si desidera trovare il coseno iperbolico.' },
        },
    },
    COT: {
        description: 'Restituisce la COTgente di un angolo espresso in radianti.',
        abstract: 'Restituisce la COTgente di un angolo espresso in radianti.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Angolo in radianti di cui si vuole la cotangente.' },
        },
    },
    COTH: {
        description: 'Restituisce la cotangente iperbolico di un angolo iperbolico.',
        abstract: 'Restituisce la cotangente iperbolico di un angolo iperbolico.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio.' },
        },
    },
    CSC: {
        description: 'Restituisce la cosecante di un angolo espresso in radianti.',
        abstract: 'Restituisce la cosecante di un angolo espresso in radianti.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio.' },
        },
    },
    CSCH: {
        description: 'Restituisce la cosecante iperbolica di un angolo espresso in radianti.',
        abstract: 'Restituisce la cosecante iperbolica di un angolo espresso in radianti.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio.' },
        },
    },
    DECIMAL: {
        description: 'Converte la rappresentazione di un numero in formato testo di una determinata base in un numero decimale.',
        abstract: 'Converte la rappresentazione di un numero in formato testo di una determinata base in un numero decimale.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Obbligatorio.' },
            radix: { name: 'radix', detail: 'Obbligatorio. La radice deve essere un numero intero.' },
        },
    },
    DEGREES: {
        description: 'Converte i radianti in gradi.',
        abstract: 'Converte i radianti in gradi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Obbligatorio. Angolo espresso in radianti che si desidera convertire.' },
        },
    },
    EVEN: {
        description: 'Restituisce num arrotondato per eccesso all\'intero pari più vicino. Questa funzione consente di elaborare elementi disponibili a gruppi di due. Una cassa da imballaggio può contenere ad esempio alcune file di uno o due articoli. La cassa sarà piena quando ci sarà corrispondenza tra il numero degli articoli, arrotondato per eccesso ai due più vicini, e la capacità della cassa.',
        abstract: 'Restituisce num arrotondato per eccesso all\'intero pari più vicino. Questa funzione consente di elaborare elementi disponibili a gruppi di due. Una cassa da imballaggio può contenere ad esempio alcune file di uno o due articoli. La cassa sarà piena quando ci sarà corrispondenza tra il numero degli articoli, arrotondato per eccesso ai due più vicini, e la capacità della cassa.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Valore da arrotondare.' },
        },
    },
    EXP: {
        description: 'Restituisce il numero e elevato alla potenza di num. La costante e è uguale a 2,71828182845904, la base del logaritmo naturale.',
        abstract: 'Restituisce il numero e elevato alla potenza di num. La costante e è uguale a 2,71828182845904, la base del logaritmo naturale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Esponente applicato alla base e.' },
        },
    },
    FACT: {
        description: 'Restituisce il fattoriale di un numero. Il fattoriale di un numero è uguale a 1*2*3*...* num.',
        abstract: 'Restituisce il fattoriale di un numero. Il fattoriale di un numero è uguale a 1*2*3*...* num.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero non negativo di cui si desidera calcolare il fattoriale. Se num non è un numero intero, la parte decimale verrà troncata.' },
        },
    },
    FACTDOUBLE: {
        description: 'Restituisce il fattoriale doppio di un numero.',
        abstract: 'Restituisce il fattoriale doppio di un numero.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Valore di cui calcolare il fattoriale doppio. Se num non è un numero intero, la parte decimale verrà troncata.' },
        },
    },
    FLOOR: {
        description: 'La funzione ARROTONDA.DIFETTO di Excel arrotonda un numero specificato per difetto al multiplo specificato più vicino a peso. I numeri negativi vengono arrotondati per difetto (ulteriori negativi) al multiplo intero più vicino sotto lo zero.',
        abstract: 'La funzione ARROTONDA.DIFETTO di Excel arrotonda un numero specificato per difetto al multiplo specificato più vicino a peso. I numeri negativi vengono arrotondati per difetto (ulteriori negativi) al multiplo intero più vicino sotto lo zero.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Valore numerico che si desidera arrotondare.' },
            significance: { name: 'significance', detail: 'Obbligatorio. Multiplo a cui si desidera arrotondare il numero.' },
        },
    },
    FLOOR_MATH: {
        description: 'Arrotonda un numero per difetto all\'intero più vicino o al multiplo più vicino a peso.',
        abstract: 'Arrotonda un numero per difetto all\'intero più vicino o al multiplo più vicino a peso.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero da arrotondare per difetto.' },
            significance: { name: 'significance', detail: 'Opzionale. Multiplo a cui arrotondare il numero.' },
            mode: { name: 'mode', detail: 'Opzionale. Direzione (per difetto o per eccesso) in cui arrotondare i numeri negativi.' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Restituisce un numero arrotondato per difetto all\'intero più vicino o al multiplo più vicino al peso. Indipendentemente dal segno di num, il numero viene arrotondato per difetto. Se tuttavia num o peso è zero, verrà restituito il valore zero.',
        abstract: 'Restituisce un numero arrotondato per difetto all\'intero più vicino o al multiplo più vicino al peso. Indipendentemente dal segno di num, il numero viene arrotondato per difetto. Se tuttavia num o peso è zero, verrà restituito il valore zero.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Valore da arrotondare.' },
            significance: { name: 'significance', detail: 'Opzionale. Multiplo al quale arrotondare num. Se il valore di peso viene omesso, il valore predefinito è 1.' },
        },
    },
    GCD: {
        description: 'Restituisce il massimo comun divisore di due o più numeri interi. Il massimo comun divisore è il più grande numero intero che divide perfettamente sia num1 che num2.',
        abstract: 'Restituisce il massimo comun divisore di due o più numeri interi. Il massimo comun divisore è il più grande numero intero che divide perfettamente sia num1 che num2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 valori. Se uno di questi valori non è un numero intero, la relativa parte decimale verrà troncata.' },
            number2: { name: 'number2', detail: 'Num1 è obbligatorio, i numeri successivi sono facoltativi. Da 1 a 255 valori. Se uno di questi valori non è un numero intero, la relativa parte decimale verrà troncata.' },
        },
    },
    INT: {
        description: 'Arrotonda un numero per difetto all\'intero più vicino.',
        abstract: 'Arrotonda un numero per difetto all\'intero più vicino.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale che si desidera arrotondare per difetto a un intero.' },
        },
    },
    ISO_CEILING: {
        description: 'Restituisce un numero arrotondato per eccesso all\'intero più vicino o al multiplo più vicino a peso. Indipendentemente dal segno di num, il numero viene arrotondato per eccesso. Se tuttavia num o peso è zero, verrà restituito il valore zero.',
        abstract: 'Restituisce un numero arrotondato per eccesso all\'intero più vicino o al multiplo più vicino a peso. Indipendentemente dal segno di num, il numero viene arrotondato per eccesso. Se tuttavia num o peso è zero, verrà restituito il valore zero.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Valore da arrotondare.' },
            significance: { name: 'significance', detail: 'Opzionale. Multiplo al quale arrotondare num. Se il valore di peso viene omesso, il valore predefinito è 1.' },
        },
    },
    LCM: {
        description: 'Restituisce il minimo comune multiplo.',
        abstract: 'Restituisce il minimo comune multiplo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Primo numero del minimo comune multiplo. In alternativa ai parametri separati da virgole, è possibile usare una singola matrice o un riferimento a una matrice.' },
            number2: { name: 'number2', detail: 'Secondo numero di cui trovare il minimo comune multiplo. È possibile specificare fino a 255 numeri.' },
        },
    },
    LN: {
        description: 'Restituisce il logaritmo naturale di un numero. I logaritmi naturali si basano sulla costante e (2,71828182845904).',
        abstract: 'Restituisce il logaritmo naturale di un numero. I logaritmi naturali si basano sulla costante e (2,71828182845904).',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale positivo di cui si desidera calcolare il logaritmo naturale.' },
        },
    },
    LOG: {
        description: 'Restituisce il logaritmo di un numero nella base specificata.',
        abstract: 'Restituisce il logaritmo di un numero nella base specificata.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale positivo di cui si desidera calcolare il logaritmo.' },
            base: { name: 'base', detail: 'Opzionale. Base del logaritmo. Se base viene omesso, verrà considerato uguale a 10.' },
        },
    },
    LOG10: {
        description: 'Restituisce il logaritmo in base 10 di un numero.',
        abstract: 'Restituisce il logaritmo in base 10 di un numero.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale positivo di cui si desidera calcolare il logaritmo in base 10.' },
        },
    },
    MDETERM: {
        description: 'Restituisce il determinante di una matrice.',
        abstract: 'Restituisce il determinante di una matrice.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Matrice numerica con lo stesso numero di righe e colonne.' },
        },
    },
    MINVERSE: {
        description: 'La funzione MATR.INVERSA restituisce l\'inversa di una matrice memorizzata in una matrice.',
        abstract: 'La funzione MATR.INVERSA restituisce l\'inversa di una matrice memorizzata in una matrice.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice numerica quadrata.' },
        },
    },
    MMULT: {
        description: 'Restituisce il prodotto matriciale di due matrici.',
        abstract: 'Restituisce il prodotto matriciale di due matrici.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Le matrici che si desidera moltiplicare.' },
            array2: { name: 'array2', detail: 'Le matrici che si desidera moltiplicare.' },
        },
    },
    MOD: {
        description: 'Restituisce il resto quando dividendo viene diviso per divisore. Il segno del risultato coinciderà con quello di divisore.',
        abstract: 'Restituisce il resto quando dividendo viene diviso per divisore. Il segno del risultato coinciderà con quello di divisore.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero di cui si desidera calcolare il resto.' },
            divisor: { name: 'divisor', detail: 'Obbligatorio. Numero per il quale si desidera dividere il dividendo.' },
        },
    },
    MROUND: {
        description: 'ARROTONDA.MULTIPLO restituisce un numero arrotondato al multiplo desiderato.',
        abstract: 'ARROTONDA.MULTIPLO restituisce un numero arrotondato al multiplo desiderato.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Valore da arrotondare.' },
            multiple: { name: 'multiple', detail: 'Obbligatorio. Multiplo a cui si desidera arrotondare il numero.' },
        },
    },
    MULTINOMIAL: {
        description: 'Restituisce il multinomiale di un insieme di numeri.',
        abstract: 'Restituisce il multinomiale di un insieme di numeri.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Primo valore o intervallo da usare nel calcolo.' },
            number2: { name: 'number2', detail: 'Valori o intervalli aggiuntivi da usare nel calcolo.' },
        },
    },
    MUNIT: {
        description: 'La funzione MATR.UNIT restituisce la matrice unitaria per la dimensione specificata.',
        abstract: 'La funzione MATR.UNIT restituisce la matrice unitaria per la dimensione specificata.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'dimension', detail: 'Intero che specifica la dimensione della matrice unitaria da restituire. Restituisce una matrice e la dimensione deve essere maggiore di zero.' },
        },
    },
    ODD: {
        description: 'Restituisce num arrotondato per eccesso all\'intero dispari più vicino.',
        abstract: 'Restituisce num arrotondato per eccesso all\'intero dispari più vicino.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Valore da arrotondare.' },
        },
    },
    PI: {
        description: 'Restituisce il numero 3,14159265358979, la costante matematica pi, con una precisione di 15 cifre.',
        abstract: 'Restituisce il numero 3,14159265358979, la costante matematica pi, con una precisione di 15 cifre.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'Restituisce il risultato di un numero elevato a potenza.',
        abstract: 'Restituisce il risultato di un numero elevato a potenza.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero della base. Può essere qualsiasi numero reale.' },
            power: { name: 'power', detail: 'Obbligatorio. Esponente a cui elevare il numero della base.' },
        },
    },
    PRODUCT: {
        description: 'La funzione PRODOTTO moltiplica tutti i numeri assegnati come argomenti e restituisce il prodotto. Ad esempio, se le celle A1 e A2 contengono numeri, è possibile usare la formula =PRODOTTO(A1, A2) per moltiplicare questi due numeri. È anche possibile eseguire la stessa operazione usando l\'operatore matematico moltiplicazione ( * ), ad esempio =A1 * A2 .',
        abstract: 'La funzione PRODOTTO moltiplica tutti i numeri assegnati come argomenti e restituisce il prodotto. Ad esempio, se le celle A1 e A2 contengono numeri, è possibile usare la formula =PRODOTTO(A1, A2) per moltiplicare questi due numeri. È anche possibile eseguire la stessa operazione usando l\'operatore matematico moltiplicazione ( * ), ad esempio =A1 * A2 .',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo numero o intervallo da moltiplicare.' },
            number2: { name: 'number2', detail: 'Opzionale. Ulteriori numeri o intervalli da moltiplicare, fino a un massimo di 255 argomenti.' },
        },
    },
    QUOTIENT: {
        description: 'Restituisce il quoziente di una divisione. Utilizzare questa funzione quando si desidera ignorare il resto di una divisione.',
        abstract: 'Restituisce il quoziente di una divisione. Utilizzare questa funzione quando si desidera ignorare il resto di una divisione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'numerator', detail: 'Obbligatorio. Dividendo.' },
            denominator: { name: 'denominator', detail: 'Obbligatorio. Divisore.' },
        },
    },
    RADIANS: {
        description: 'Converte i gradi in radianti.',
        abstract: 'Converte i gradi in radianti.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Obbligatorio. Angolo espresso in gradi che si desidera convertire.' },
        },
    },
    RAND: {
        description: 'CASUALE restituisce un numero reale casuale distribuito in maniera uniforme maggiore o uguale a 0 e minore di 1. Un nuovo numero reale casuale viene restituito volta che il foglio di lavoro viene calcolato.',
        abstract: 'CASUALE restituisce un numero reale casuale distribuito in maniera uniforme maggiore o uguale a 0 e minore di 1. Un nuovo numero reale casuale viene restituito volta che il foglio di lavoro viene calcolato.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'Negli esempi seguenti viene creata una matrice composta da 5 righe e 3 colonne. Il primo esempio restituisce un set di valori casuali compresi tra 0 e 1, che è il comportamento predefinito di MATR.CASUALE. Il secondo esempio restituisce una serie di valori decimali casuali compresi tra 1 e 100. Infine, il terzo esempio restituisce una serie di numeri interi casuali compresi tra 1 e 100.',
        abstract: 'Negli esempi seguenti viene creata una matrice composta da 5 righe e 3 colonne. Il primo esempio restituisce un set di valori casuali compresi tra 0 e 1, che è il comportamento predefinito di MATR.CASUALE. Il secondo esempio restituisce una serie di valori decimali casuali compresi tra 1 e 100. Infine, il terzo esempio restituisce una serie di numeri interi casuali compresi tra 1 e 100.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'Il numero di righe da restituire' },
            columns: { name: 'columns', detail: 'Il numero di colonne da restituire' },
            min: { name: 'min', detail: 'Il numero minimo che si desidera venga restituito' },
            max: { name: 'max', detail: 'Il numero massimo che si desidera venga restituito' },
            wholeNumber: { name: 'whole_number', detail: 'Restituisce un numero intero o decimale VERO per un numero intero. FALSE per un numero decimale' },
        },
    },
    RANDBETWEEN: {
        description: 'Restituisce un numero intero casuale compreso tra i numeri specificati. Un nuovo numero intero casuale viene restituito ogni volta che il foglio di lavoro viene calcolato.',
        abstract: 'Restituisce un numero intero casuale compreso tra i numeri specificati. Un nuovo numero intero casuale viene restituito ogni volta che il foglio di lavoro viene calcolato.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'bottom', detail: 'Obbligatorio. Intero più piccolo restituito da CASUALE.TRA.' },
            top: { name: 'top', detail: 'Obbligatorio. Intero più grande restituito da CASUALE.TRA.' },
        },
    },
    ROMAN: {
        description: 'Restituisce il numero come numero romano sotto forma di testo.',
        abstract: 'Restituisce il numero come numero romano sotto forma di testo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero arabo che si desidera convertire.' },
            form: { name: 'form', detail: 'Opzionale. Numero che specifica il tipo di numero romano desiderato. Lo stile dei numeri romani varia da Classico a Semplificato, diventando più conciso con l\'aumentare del valore di forma. Vedere l\'esempio relativo a ROMANO(499,0) seguente.' },
        },
    },
    ROUND: {
        description: 'La funzione ARROTONDA arrotonda un numero al numero di cifre specificato. Se ad esempio la cella A1 contiene 23,7825 e si desidera arrotondare tale valore a due posizioni decimali, sarà possibile usare la formula seguente:',
        abstract: 'La funzione ARROTONDA arrotonda un numero al numero di cifre specificato. Se ad esempio la cella A1 contiene 23,7825 e si desidera arrotondare tale valore a due posizioni decimali, sarà possibile usare la formula seguente:',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero da arrotondare.' },
            numDigits: { name: 'num_digits', detail: 'Obbligatorio. Numero di cifre a cui arrotondare l\'argomento num.' },
        },
    },
    ROUNDBANK: {
        description: 'Arrotonda un numero con il metodo dell\'arrotondamento bancario.',
        abstract: 'Arrotonda un numero con il metodo dell\'arrotondamento bancario.',
        links: [
            {
                title: 'Instruction',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Numero che si desidera arrotondare con il metodo dell\'arrotondamento bancario.' },
            numDigits: { name: 'num_digits', detail: 'Numero di cifre a cui si desidera arrotondare con il metodo dell\'arrotondamento bancario.' },
        },
    },
    ROUNDDOWN: {
        description: 'Arrotonda il valore assoluto di un numero per difetto.',
        abstract: 'Arrotonda il valore assoluto di un numero per difetto.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale che si desidera arrotondare per difetto.' },
            numDigits: { name: 'num_digits', detail: 'Obbligatorio. Numero di cifre a cui si desidera arrotondare num.' },
        },
    },
    ROUNDUP: {
        description: 'Arrotonda il valore assoluto di un numero, escluso zero, per eccesso.',
        abstract: 'Arrotonda il valore assoluto di un numero, escluso zero, per eccesso.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale che si desidera arrotondare per eccesso.' },
            numDigits: { name: 'num_digits', detail: 'Obbligatorio. Numero di cifre a cui si desidera arrotondare num.' },
        },
    },
    SEC: {
        description: 'Restituisce la secante di un angolo.',
        abstract: 'Restituisce la secante di un angolo.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Angolo in radianti di cui si desidera ottenere la secante.' },
        },
    },
    SECH: {
        description: 'Restituisce la secante iperbolica di un angolo.',
        abstract: 'Restituisce la secante iperbolica di un angolo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Angolo in radianti di cui si desidera ottenere la secante iperbolica.' },
        },
    },
    SERIESSUM: {
        description: 'Molte funzioni possono essere approssimate per un\'espansione di serie di potenze.',
        abstract: 'Molte funzioni possono essere approssimate per un\'espansione di serie di potenze.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Valore di input della serie di potenze.' },
            n: { name: 'n', detail: 'Obbligatorio. Potenza iniziale alla quale si desidera elevare x.' },
            m: { name: 'm', detail: 'Obbligatorio. Incremento di n per ciascun termine della serie.' },
            coefficients: { name: 'coefficients', detail: 'Obbligatorio. Insieme di coefficienti per ogni potenza successiva di x. Il numero di valori in coefficienti determina il numero di termini nella serie di potenze. Ad esempio, se coefficienti contiene tre valori, nella serie di potenze saranno presenti tre termini.' },
        },
    },
    SEQUENCE: {
        description: 'Nell\'esempio seguente, viene creata una matrice alta 4 righe e larga 5 colonne con =SEQUENZA(4,5) .',
        abstract: 'Nell\'esempio seguente, viene creata una matrice alta 4 righe e larga 5 colonne con =SEQUENZA(4,5) .',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'Il numero di righe da restituire' },
            columns: { name: 'columns', detail: 'Il numero di colonne da restituire.' },
            start: { name: 'start', detail: 'Il primo numero della sequenza' },
            step: { name: 'step', detail: 'La quantità di incremento di ciascun valore successivo nella matrice' },
        },
    },
    SIGN: {
        description: 'Determina il segno di un numero. Restituisce 1 se il numero è positivo, zero (0) se il numero è 0 e -1 se il numero è negativo.',
        abstract: 'Determina il segno di un numero. Restituisce 1 se il numero è positivo, zero (0) se il numero è 0 e -1 se il numero è negativo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale.' },
        },
    },
    SIN: {
        description: 'Restituisce il seno dell\'angolo specificato.',
        abstract: 'Restituisce il seno dell\'angolo specificato.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Angolo in radianti di cui si desidera il seno.' },
        },
    },
    SINH: {
        description: 'Restituisce il seno iperbolico di un numero.',
        abstract: 'Restituisce il seno iperbolico di un numero.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale.' },
        },
    },
    SQRT: {
        description: 'Restituisce una radice quadrata positiva.',
        abstract: 'Restituisce una radice quadrata positiva.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero di cui si desidera la radice quadrata.' },
        },
    },
    SQRTPI: {
        description: 'Restituisce la radice quadrata di (num * pi).',
        abstract: 'Restituisce la radice quadrata di (num * pi).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero per il quale viene moltiplicato pi greco.' },
        },
    },
    SUBTOTAL: {
        description: 'Restituisce un subtotale in un elenco o in un database. In genere, risulta più semplice creare un elenco con i subtotali scegliendo Subtotale nel gruppo Struttura della scheda Dati nell\'applicazione desktop Excel. Dopo la creazione dell\'elenco con i subtotali, sarà possibile apportarvi delle modifiche modificando la funzione SUBTOTALE.',
        abstract: 'Restituisce un subtotale in un elenco o in un database. In genere, risulta più semplice creare un elenco con i subtotali scegliendo Subtotale nel gruppo Struttura della scheda Dati nell\'applicazione desktop Excel. Dopo la creazione dell\'elenco con i subtotali, sarà possibile apportarvi delle modifiche modificando la funzione SUBTOTALE.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Obbligatorio. Numero 1-11 o 101-111 che specifica la funzione da usare per il subtotale. 1-11 include le righe nascoste manualmente, mentre 101-111 le esclude; le celle filtrate sono sempre escluse.' },
            ref1: { name: 'ref1', detail: 'Obbligatorio. Primo riferimento o intervallo denominato del quale si desidera calcolare il subtotale.' },
            ref2: { name: 'ref2', detail: 'Opzionale. Da 2 a 254 riferimenti o intervalli denominati dei quali si desidera calcolare il subtotale.' },
        },
    },
    SUM: {
        description: 'La funzione SOMMA somma i valori. È possibile sommare singoli valori, riferimenti o intervalli di celle, o una combinazione dei tre.',
        abstract: 'La funzione SOMMA somma i valori. È possibile sommare singoli valori, riferimenti o intervalli di celle, o una combinazione dei tre.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: { name: 'Number 1', detail: 'Primo numero da sommare. Il numero può essere simile a 4, a un riferimento di cella come B6 o a un intervallo di celle come B2:B8.' },
            number2: { name: 'Number 2', detail: 'Secondo numero da sommare. È possibile specificare fino a 255 numeri in questo modo.' },
        },
    },
    SUMIF: {
        description: 'Usare la funzione SOMMA.SE per sommare i valori di un intervallo che soddisfano i criteri specificati. Supponiamo ad esempio di voler sommare in una colonna contenente numeri solo i valori maggiori di 5. È possibile usare la formula seguente: =SOMMA.SE(B2:B25;">5")',
        abstract: 'Usare la funzione SOMMA.SE per sommare i valori di un intervallo che soddisfano i criteri specificati. Supponiamo ad esempio di voler sommare in una colonna contenente numeri solo i valori maggiori di 5. È possibile usare la formula seguente: =SOMMA.SE(B2:B25;">5")',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Obbligatorio. Intervallo di celle da valutare in base ai criteri. Le celle di ogni intervallo devono contenere numeri oppure nomi, matrici o riferimenti che includono numeri. Le celle vuote e i valori di testo verranno ignorati. L\'intervallo selezionato può contenere date nel formato standard di Excel (vedere gli esempi di seguito).' },
            criteria: { name: 'criteria', detail: 'Obbligatorio. Criteri in forma di numero, espressione, riferimento di cella, testo o funzione che definisce le celle che verranno sommate. È possibile includere caratteri jolly: un punto interrogativo (?) per la corrispondenza con qualsiasi carattere singolo, un asterisco (*) per la corrispondenza con qualsiasi sequenza di caratteri. Per trovare un punto interrogativo o un asterisco, digitare una tilde ( ~ ) prima del carattere. Ad esempio, i criteri possono essere espressi come 32, ">32", B5, "3?", "mela*", "*~?" o OGGI(). Importante Qualsiasi criterio di testo o di altro tipo comprendente simboli logici o matematici deve essere racchiuso tra virgolette doppie ( " ). Se il criterio è numerico, le virgolette doppie non saranno necessarie.' },
            sumRange: { name: 'sum_range', detail: 'Opzionale. Celle effettive da aggiungere, se si desidera aggiungere celle diverse da quelle specificate nell\'argomento intervallo . Se l\'argomento sum_range viene omesso, Verranno sommate le celle specificate nell\'argomento intervallo , ovvero le stesse celle a cui vengono applicati i criteri. Sum_range devono avere le stesse dimensioni e la stessa forma di intervallo . In caso contrario, potrebbero verificarsi problemi di prestazioni e la formula sommerà un intervallo di celle che inizia con la prima cella di sum_range ma ha le stesse dimensioni di intervallo . Ad esempio: intervallo int_somma Celle effettive sommate A1:A5 B1:B5 B1:B5 A1:A5 B1:K5 B1:B5' },
        },
    },
    SUMIFS: {
        description: 'La funzione SOMMA.PIÙ.SE, una delle funzioni matematiche e trigonometriche , somma tutti i suoi argomenti che soddisfano più criteri. Ad esempio, si può usare SUMIFS per sommare il numero di rivenditori del paese che (1) risiedono in un singolo codice postale e (2) i cui profitti superano un determinato valore in dollari.',
        abstract: 'La funzione SOMMA.PIÙ.SE, una delle funzioni matematiche e trigonometriche , somma tutti i suoi argomenti che soddisfano più criteri. Ad esempio, si può usare SUMIFS per sommare il numero di rivenditori del paese che (1) risiedono in un singolo codice postale e (2) i cui profitti superano un determinato valore in dollari.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'sum_range', detail: 'Intervallo di celle da sommare.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Intervallo testato con Criteri1 . Criteria_range1 e Criteri1 impostano una coppia di ricerca in base alla quale viene eseguita la ricerca di criteri specifici in un intervallo. Una volta trovati gli elementi nell\'intervallo, vengono aggiunti i valori corrispondenti in Sum_range .' },
            criteria1: { name: 'criteria1', detail: 'Criteri che definiscono quali celle in Criteria_range1 verranno aggiunte. Ad esempio, i criteri possono essere immessi come 32, "32", B4 , "mele" o "32". For example, criteria can be entered as 32 , ">32" , B4, "apples" or "32".' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Intervalli aggiuntivi e criteri associati. È possibile immettere fino a 127 coppie di intervalli/criteri.' },
            criteria2: { name: 'criteria2', detail: 'Intervalli aggiuntivi e criteri associati. È possibile immettere fino a 127 coppie di intervalli/criteri.' },
        },
    },
    SUMPRODUCT: {
        description: 'MATR.SOMMA.PRODOTTO corrisponde a tutte le istanze dell\'elemento Y/Dimensione M e le somma, quindi per questo esempio 21 più 41 è uguale a 62.',
        abstract: 'MATR.SOMMA.PRODOTTO corrisponde a tutte le istanze dell\'elemento Y/Dimensione M e le somma, quindi per questo esempio 21 più 41 è uguale a 62.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Il primo argomento matrice di cui si desidera moltiplicare e quindi sommare gli elementi.' },
            array2: { name: 'array', detail: 'Argomenti matrice da 2 a 255 di cui si desidera moltiplicare e quindi sommare i componenti.' },
        },
    },
    SUMSQ: {
        description: 'Restituisce la somma dei quadrati degli argomenti.',
        abstract: 'Restituisce la somma dei quadrati degli argomenti.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Num1 è obbligatorio. I numeri successivi sono facoltativi. Possono essere presenti un massimo di 255 argomenti di cui si desidera la somma dei quadrati.' },
            number2: { name: 'number2', detail: 'Num1 è obbligatorio. I numeri successivi sono facoltativi. Possono essere presenti un massimo di 255 argomenti di cui si desidera la somma dei quadrati.' },
        },
    },
    SUMX2MY2: {
        description: 'Questa funzione di Excel restituisce la somma della differenza dei quadrati dei valori corrispondenti di due matrici.',
        abstract: 'Questa funzione di Excel restituisce la somma della differenza dei quadrati dei valori corrispondenti di due matrici.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Obbligatorio. Prima matrice o primo intervallo di valori.' },
            arrayY: { name: 'array_y', detail: 'Obbligatorio. Seconda matrice o secondo intervallo di valori.' },
        },
    },
    SUMX2PY2: {
        description: 'Restituisce la somma della somma dei quadrati dei valori corrispondenti di due matrici. La somma della somma dei quadrati è un termine ricorrente in molte funzioni di calcolo statistico.',
        abstract: 'Restituisce la somma della somma dei quadrati dei valori corrispondenti di due matrici. La somma della somma dei quadrati è un termine ricorrente in molte funzioni di calcolo statistico.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Obbligatorio. Prima matrice o primo intervallo di valori.' },
            arrayY: { name: 'array_y', detail: 'Obbligatorio. Seconda matrice o secondo intervallo di valori.' },
        },
    },
    SUMXMY2: {
        description: 'La funzione SUMXMY2 restituisce la somma dei quadrati delle differenze dei valori corrispondenti di due matrici.',
        abstract: 'La funzione SUMXMY2 restituisce la somma dei quadrati delle differenze dei valori corrispondenti di due matrici.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Prima matrice o primo intervallo di valori. Obbligatorio.' },
            arrayY: { name: 'array_y', detail: 'Seconda matrice o secondo intervallo di valori. Obbligatorio.' },
        },
    },
    TAN: {
        description: 'Restituisce la tangente dell\'angolo specificato.',
        abstract: 'Restituisce la tangente dell\'angolo specificato.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Angolo in radianti di cui si desidera la tangente.' },
        },
    },
    TANH: {
        description: 'Restituisce la tangente iperbolica di un numero.',
        abstract: 'Restituisce la tangente iperbolica di un numero.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero reale.' },
        },
    },
    TRUNC: {
        description: 'La funzione TRONCA tronca un numero in un numero intero rimuovendo la parte frazionaria del numero.',
        abstract: 'La funzione TRONCA tronca un numero in un numero intero rimuovendo la parte frazionaria del numero.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero che si desidera troncare.' },
            numDigits: { name: 'num_digits', detail: 'Opzionale. Numero che specifica la precisione del troncamento. Il valore predefinito di num_cifre è 0 (zero).' },
        },
    },
};

export default locale;
