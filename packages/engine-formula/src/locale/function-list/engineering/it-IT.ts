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
    BESSELI: {
        description: 'Restituisce la funzione di Bessel modificata, che equivale alla funzione di Bessel calcolata in base ad argomenti del tutto immaginari.',
        abstract: 'Restituisce la funzione di Bessel modificata, che equivale alla funzione di Bessel calcolata in base ad argomenti del tutto immaginari.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Obbligatorio. Valore in cui calcolare la funzione.' },
            n: { name: 'N', detail: 'Obbligatorio. Ordine della funzione di Bessel. Se n non è un numero intero, la parte decimale verrà troncata.' },
        },
    },
    BESSELJ: {
        description: 'Restituisce la funzione di Bessel Jn(x).',
        abstract: 'Restituisce la funzione di Bessel Jn(x).',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Obbligatorio. Valore in cui calcolare la funzione.' },
            n: { name: 'N', detail: 'Obbligatorio. Ordine della funzione di Bessel. Se n non è un numero intero, la parte decimale verrà troncata.' },
        },
    },
    BESSELK: {
        description: 'Restituisce la funzione di Bessel modificata, che equivale alle funzioni di Bessel calcolate in base ad argomenti del tutto immaginari.',
        abstract: 'Restituisce la funzione di Bessel modificata, che equivale alle funzioni di Bessel calcolate in base ad argomenti del tutto immaginari.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Obbligatorio. Valore in cui calcolare la funzione.' },
            n: { name: 'N', detail: 'Obbligatorio. Ordine della funzione. Se n non è un numero intero, la parte decimale verrà troncata.' },
        },
    },
    BESSELY: {
        description: 'Restituisce la funzione di Bessel, definita anche funzione di Weber o di Neumann.',
        abstract: 'Restituisce la funzione di Bessel, definita anche funzione di Weber o di Neumann.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Obbligatorio. Valore in cui calcolare la funzione.' },
            n: { name: 'N', detail: 'Obbligatorio. Ordine della funzione. Se n non è un numero intero, la parte decimale verrà troncata.' },
        },
    },
    BIN2DEC: {
        description: 'Converte un numero binario in decimale.',
        abstract: 'Converte un numero binario in decimale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero binario che si desidera convertire. Num non può essere costituito da più di 10 caratteri, ovvero 10 bit. Il bit più significativo di num è il bit del segno. I rimanenti 9 bit sono i bit del valore da convertire. I numeri negativi vengono rappresentati sotto forma di notazione in complemento a due.' },
        },
    },
    BIN2HEX: {
        description: 'Converte un numero binario in esadecimale.',
        abstract: 'Converte un numero binario in esadecimale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero binario che si desidera convertire. Num non può essere costituito da più di 10 caratteri, ovvero 10 bit. Il bit più significativo di num è il bit del segno. I rimanenti 9 bit sono i bit del valore da convertire. I numeri negativi vengono rappresentati sotto forma di notazione in complemento a due.' },
            places: { name: 'places', detail: 'Opzionale. Numero di caratteri da utilizzare. Se cifre viene omesso, BINARIO.HEX utilizzerà il minor numero di caratteri necessario. Cifre è utile per aggiungere zeri iniziali al valore restituito.' },
        },
    },
    BIN2OCT: {
        description: 'Converte un numero binario in ottale.',
        abstract: 'Converte un numero binario in ottale.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero binario che si desidera convertire. Num non può essere costituito da più di 10 caratteri, ovvero 10 bit. Il bit più significativo di num è il bit del segno. I rimanenti 9 bit sono i bit del valore da convertire. I numeri negativi vengono rappresentati sotto forma di notazione in complemento a due.' },
            places: { name: 'places', detail: 'Opzionale. Numero di caratteri da utilizzare. Se cifre viene omesso, BINARIO.OCT utilizzerà il minor numero di caratteri necessario. Cifre è utile per aggiungere zeri iniziali al valore restituito.' },
        },
    },
    BITAND: {
        description: 'Restituisce un confronto "AND" bit per bit di due numeri.',
        abstract: 'Restituisce un confronto "AND" bit per bit di due numeri.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Deve essere in formato decimale e maggiore o uguale a 0.' },
            number2: { name: 'number2', detail: 'Obbligatorio. Deve essere in formato decimale e maggiore o uguale a 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Restituisce un numero spostato a sinistra del numero di bit specificato.',
        abstract: 'Restituisce un numero spostato a sinistra del numero di bit specificato.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Deve essere un numero intero maggiore o uguale a 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Obbligatorio. Deve essere un numero intero.' },
        },
    },
    BITOR: {
        description: 'Restituisce un confronto "OR" bit per bit di due numeri.',
        abstract: 'Restituisce un confronto "OR" bit per bit di due numeri.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Deve essere in formato decimale e maggiore o uguale a 0.' },
            number2: { name: 'number2', detail: 'Obbligatorio. Deve essere in formato decimale e maggiore o uguale a 0.' },
        },
    },
    BITRSHIFT: {
        description: 'Restituisce un numero spostato a destra del numero di bit specificato.',
        abstract: 'Restituisce un numero spostato a destra del numero di bit specificato.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Deve essere un numero intero maggiore o uguale a 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Obbligatorio. Deve essere un numero intero.' },
        },
    },
    BITXOR: {
        description: 'Restituisce uno \'XOR\' bit per bit di due numeri.',
        abstract: 'Restituisce uno \'XOR\' bit per bit di due numeri.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Deve essere maggiore di o uguale a 0.' },
            number2: { name: 'number2', detail: 'Obbligatorio. Deve essere maggiore di o uguale a 0.' },
        },
    },
    COMPLEX: {
        description: 'Converte la parte reale e il coefficiente dell\'immaginario in un numero complesso di tipo x + yi o x + yj.',
        abstract: 'Converte la parte reale e il coefficiente dell\'immaginario in un numero complesso di tipo x + yi o x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'real_num', detail: 'Obbligatorio. Parte reale del numero complesso.' },
            iNum: { name: 'i_num', detail: 'Obbligatorio. Coefficiente immaginario del numero complesso.' },
            suffix: { name: 'suffix', detail: 'Opzionale. Suffisso per la componente immaginaria del numero complesso. Se suffisso viene omesso, verrà considerato uguale a "i".' },
        },
    },
    CONVERT: {
        description: 'Converte un numero da un sistema di unità di misura a un altro. Ad esempio, CONVERTI può convertire in chilometri una tabella di distanze espresse in miglia.',
        abstract: 'Converte un numero da un sistema di unità di misura a un altro. Ad esempio, CONVERTI può convertire in chilometri una tabella di distanze espresse in miglia.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Valore in from_unit da convertire.' },
            fromUnit: { name: 'from_unit', detail: 'Unità di misura del numero.' },
            toUnit: { name: 'to_unit', detail: 'Unità di misura del risultato.' },
        },
    },
    DEC2BIN: {
        description: 'Converte un numero decimale in binario.',
        abstract: 'Converte un numero decimale in binario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. L’intero decimale da convertire. Se num è negativo, i valori di posizione validi vengono ignorati e DEC2BIN restituisce un numero binario di 10 caratteri (10 bit) in cui il bit più significativo è il bit del segno. I rimanenti 9 bit sono i bit del valore da convertire. I numeri negativi vengono rappresentati sotto forma di notazione in complemento a due.' },
            places: { name: 'places', detail: 'Facoltativo. Numero di caratteri da utilizzare. Se cifre viene omesso, DECIMALE.BINARIO utilizzerà il minor numero di caratteri necessario. Cifre è utile per aggiungere gli zeri iniziali al valore restituito.' },
        },
    },
    DEC2HEX: {
        description: 'Converte un numero decimale in esadecimale.',
        abstract: 'Converte un numero decimale in esadecimale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. L’intero decimale da convertire. Se num è negativo, cifre verrà ignorato e DEC2HEX restituirà un numero esadecimale di 10 caratteri (40 bit) in cui il bit più significativo è il bit del segno. I rimanenti 39 bit sono i bit del valore da convertire. I numeri negativi vengono rappresentati sotto forma di notazione in complemento a due.' },
            places: { name: 'places', detail: 'Opzionale. Numero di caratteri da utilizzare. Se cifre viene omesso, DECIMALE.HEX utilizzerà il minor numero di caratteri necessario. Cifre è utile per aggiungere gli zeri iniziali al valore restituito.' },
        },
    },
    DEC2OCT: {
        description: 'Converte un numero decimale in ottale.',
        abstract: 'Converte un numero decimale in ottale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. L’intero decimale da convertire. Se num è negativo, le cifre verranno ignorate e DECIMALE.OCT restituirà un numero ottale (30 bit) di 10 caratteri in cui il bit più significativo è il bit sign. I rimanenti 29 bit sono i bit del valore da convertire. I numeri negativi vengono rappresentati sotto forma di notazione in complemento a due.' },
            places: { name: 'places', detail: 'Facoltativo. Numero di caratteri da utilizzare. Se cifre viene omesso, DECIMALE.OCT utilizzerà il minor numero di caratteri necessario. Cifre è utile per aggiungere gli zeri iniziali al valore restituito.' },
        },
    },
    DELTA: {
        description: 'Verifica se due valori sono uguali. Restituisce 1 se num1 = num2, altrimenti restituisce 0. Utilizzare questa funzione per esaminare un insieme di valori. Se si sommano ad esempio più funzioni DELTA, si effettuerà il conteggio di coppie uguali. La funzione è anche nota come funzione Kronecker Delta.',
        abstract: 'Verifica se due valori sono uguali. Restituisce 1 se num1 = num2, altrimenti restituisce 0. Utilizzare questa funzione per esaminare un insieme di valori. Se si sommano ad esempio più funzioni DELTA, si effettuerà il conteggio di coppie uguali. La funzione è anche nota come funzione Kronecker Delta.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Obbligatorio. Primo numero.' },
            number2: { name: 'number2', detail: 'Opzionale. Secondo numero. Se num2 viene omesso, verrà considerato uguale a zero.' },
        },
    },
    ERF: {
        description: 'Restituisce la funzione di errore integrata tra limite_inf e limite_sup.',
        abstract: 'Restituisce la funzione di errore integrata tra limite_inf e limite_sup.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'lower_limit', detail: 'Obbligatorio. Limite inferiore di integrazione per FUNZ.ERRORE.' },
            upperLimit: { name: 'upper_limit', detail: 'Opzionale. Limite superiore di integrazione per FUNZ.ERRORE. Se viene omesso, FUNZ.ERRORE effettuerà l\'integrazione tra zero e limite_inf.' },
        },
    },
    ERF_PRECISE: {
        description: 'Restituisce la funzione di errore.',
        abstract: 'Restituisce la funzione di errore.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Limite inferiore di integrazione per FUNZ.ERRORE.PRECISA.' },
        },
    },
    ERFC: {
        description: 'Restituisce la funzione FUNZ.ERRORE complementare integrata tra x e infinito.',
        abstract: 'Restituisce la funzione FUNZ.ERRORE complementare integrata tra x e infinito.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Limite inferiore di integrazione per FUNZ.ERRORE.COMP.' },
        },
    },
    ERFC_PRECISE: {
        description: 'Restituisce la funzione FUNZ.ERRORE complementare integrata tra x e infinito.',
        abstract: 'Restituisce la funzione FUNZ.ERRORE complementare integrata tra x e infinito.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Obbligatorio. Limite inferiore di integrazione per FUNZ.ERRORE.COMP.PRECISA.' },
        },
    },
    GESTEP: {
        description: 'Restituisce 1 se num ≥ val_soglia e 0 (zero) in caso contrario. Questa funzione consente di esaminare un insieme di valori. Sommando ad esempio più funzioni SOGLIA, è possibile effettuare il conteggio dei valori che superano una determinata soglia.',
        abstract: 'Restituisce 1 se num ≥ val_soglia e 0 (zero) in caso contrario. Questa funzione consente di esaminare un insieme di valori. Sommando ad esempio più funzioni SOGLIA, è possibile effettuare il conteggio dei valori che superano una determinata soglia.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Valore da confrontare con val_soglia.' },
            step: { name: 'step', detail: 'Opzionale. Valore di soglia. Se si omette, SOGLIA userà il valore zero.' },
        },
    },
    HEX2BIN: {
        description: 'Converte un numero esadecimale in binario.',
        abstract: 'Converte un numero esadecimale in binario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero esadecimale che si desidera convertire. Num non può essere costituito da più di 10 caratteri. Il bit più significativo di num è il bit del segno, ovvero il 40° bit da destra. I rimanenti 9 bit sono i bit del valore da convertire. I numeri negativi vengono rappresentati sotto forma di notazione in complemento a due.' },
            places: { name: 'places', detail: 'Facoltativo. Numero di caratteri da utilizzare. Se cifre viene omesso, HEX.BINARIO utilizzerà il minor numero di caratteri necessario. Cifre è utile per aggiungere gli zeri iniziali al valore restituito.' },
        },
    },
    HEX2DEC: {
        description: 'Converte un numero esadecimale in decimale.',
        abstract: 'Converte un numero esadecimale in decimale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero esadecimale che si desidera convertire. Num non può essere costituito da più di 10 caratteri, ovvero 40 bit. Il bit più significativo di num è il bit del segno. I rimanenti 39 bit sono i bit del valore da convertire. I numeri negativi vengono rappresentati sotto forma di notazione in complemento a due.' },
        },
    },
    HEX2OCT: {
        description: 'Converte un numero esadecimale in ottale.',
        abstract: 'Converte un numero esadecimale in ottale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero esadecimale che si desidera convertire. Num non può essere costituito da più di 10 caratteri. Il bit più significativo di num è il bit del segno. I rimanenti 39 bit sono i bit del valore da convertire. I numeri negativi vengono rappresentati sotto forma di notazione in complemento a due.' },
            places: { name: 'places', detail: 'Facoltativo. Numero di caratteri da utilizzare. Se cifre viene omesso, HEX.OCT utilizzerà il minor numero di caratteri necessario. Cifre è utile per aggiungere gli zeri iniziali al valore restituito.' },
        },
    },
    IMABS: {
        description: 'Restituisce il valore assoluto (modulo) di un numero complesso in formato testo x + yi o x + yj.',
        abstract: 'Restituisce il valore assoluto (modulo) di un numero complesso in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si desidera il valore assoluto.' },
        },
    },
    IMAGINARY: {
        description: 'Restituisce il coefficiente dell\'immaginario di un numero complesso in formato testo x + yi o x + yj.',
        abstract: 'Restituisce il coefficiente dell\'immaginario di un numero complesso in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si desidera il coefficiente dell\'immaginario.' },
        },
    },
    IMARGUMENT: {
        description: 'Restituisce l\'argomento ), un angolo espresso in radianti, in base al quale:',
        abstract: 'Restituisce l\'argomento ), un angolo espresso in radianti, in base al quale:',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si desidera l\'argomento .' },
        },
    },
    IMCONJUGATE: {
        description: 'Restituisce il complesso coniugato di un numero complesso in formato testo x + yi o x + yj.',
        abstract: 'Restituisce il complesso coniugato di un numero complesso in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si desidera il coniugato.' },
        },
    },
    IMCOS: {
        description: 'Restituisce il coseno di un numero complesso in formato testo x + yi o x + yj.',
        abstract: 'Restituisce il coseno di un numero complesso in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si desidera il coseno.' },
        },
    },
    IMCOSH: {
        description: 'Restituisce il coseno iperbolico di un numero complesso in formato testo x+yi o x+yj.',
        abstract: 'Restituisce il coseno iperbolico di un numero complesso in formato testo x+yi o x+yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si vuole calcolare il coseno iperbolico.' },
        },
    },
    IMCOT: {
        description: 'Restituisce la cotangente di un numero complesso in formato testo x+yi o x+yj.',
        abstract: 'Restituisce la cotangente di un numero complesso in formato testo x+yi o x+yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Numero complesso di cui si desidera ottenere la cotangente.' },
        },
    },
    IMCOTH: {
        description: 'La funzione IMCOTH restituisce la cotangente iperbolica del numero complesso specificato. Ad esempio, per il numero complesso "x+yi" restituisce "coth(x+yi)".',
        abstract: 'La funzione IMCOTH restituisce la cotangente iperbolica del numero complesso specificato. Ad esempio, per il numero complesso "x+yi" restituisce "coth(x+yi)".',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366256?hl=it',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Numero complesso di cui si desidera ottenere la cotangente iperbolica. Può essere il risultato di COMPLESSO, un numero reale interpretato come complesso con parte immaginaria 0 o testo nel formato “x+yi”, in cui x e y sono numerici.' },
        },
    },
    IMCSC: {
        description: 'Restituisce la cosecante di un numero complesso in formato testo x+yi o x+yj.',
        abstract: 'Restituisce la cosecante di un numero complesso in formato testo x+yi o x+yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si vuole calcolare la cosecante.' },
        },
    },
    IMCSCH: {
        description: 'Restituisce la cosecante iperbolica di un numero complesso in formato testo x+yi o x+yj.',
        abstract: 'Restituisce la cosecante iperbolica di un numero complesso in formato testo x+yi o x+yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si vuole calcolare la cosecante iperbolica.' },
        },
    },
    IMDIV: {
        description: 'Restituisce il quoziente di due numeri complessi in formato testo x + yi o x + yj.',
        abstract: 'Restituisce il quoziente di due numeri complessi in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Obbligatorio. Numeratore o dividendo complesso.' },
            inumber2: { name: 'inumber2', detail: 'Obbligatorio. Denominatore o divisore complesso.' },
        },
    },
    IMEXP: {
        description: 'Restituisce l\'esponenziale di un numero complesso in formato testo x + yi o x + yj.',
        abstract: 'Restituisce l\'esponenziale di un numero complesso in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si desidera l\'esponenziale.' },
        },
    },
    IMLN: {
        description: 'Restituisce il logaritmo naturale di un numero complesso in formato testo x + yi o x + yj.',
        abstract: 'Restituisce il logaritmo naturale di un numero complesso in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si desidera il logaritmo naturale.' },
        },
    },
    IMLOG: {
        description: 'La funzione IMLOG restituisce il logaritmo di un numero complesso per una base specificata.',
        abstract: 'La funzione IMLOG restituisce il logaritmo di un numero complesso per una base specificata.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366486?hl=it',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Valore di input della funzione logaritmo. Può essere scritto come numero semplice, ad esempio 1, interpretato come reale, oppure come testo tra virgolette che specifichi i coefficienti reale e immaginario.' },
            base: { name: 'base', detail: 'Base da usare per calcolare il logaritmo. Deve essere un numero reale positivo.' },
        },
    },
    IMLOG10: {
        description: 'Restituisce il logaritmo in base 10 di un numero complesso in formato testo x + yi o x + yj.',
        abstract: 'Restituisce il logaritmo in base 10 di un numero complesso in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si desidera il logaritmo.' },
        },
    },
    IMLOG2: {
        description: 'Restituisce il logaritmo in base 2 di un numero complesso in formato testo x + yi o x + yj.',
        abstract: 'Restituisce il logaritmo in base 2 di un numero complesso in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si desidera il logaritmo in base 2.' },
        },
    },
    IMPOWER: {
        description: 'Restituisce un numero complesso in formato testo x + yi o x + yj elevato a una potenza.',
        abstract: 'Restituisce un numero complesso in formato testo x + yi o x + yj elevato a una potenza.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso che si desidera elevare a potenza.' },
            number: { name: 'number', detail: 'Obbligatorio. Potenza alla quale si desidera elevare il numero complesso.' },
        },
    },
    IMPRODUCT: {
        description: 'Restituisce il prodotto di 2 fino a 255 numeri complessi in formato testo x + yi o x + yj.',
        abstract: 'Restituisce il prodotto di 2 fino a 255 numeri complessi in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Da 1 a 255 numeri complessi da moltiplicare.' },
            inumber2: { name: 'inumber2', detail: 'Da 1 a 255 numeri complessi da moltiplicare.' },
        },
    },
    IMREAL: {
        description: 'Restituisce la parte reale di un numero complesso in formato testo x + yi o x + yj.',
        abstract: 'Restituisce la parte reale di un numero complesso in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si desidera la parte reale.' },
        },
    },
    IMSEC: {
        description: 'Restituisce la secante di un numero complesso in formato testo x+yi o x+yj.',
        abstract: 'Restituisce la secante di un numero complesso in formato testo x+yi o x+yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si vuole calcolare la secante.' },
        },
    },
    IMSECH: {
        description: 'Restituisce la secante iperbolica di un numero complesso in formato testo x+yi o x+yj.',
        abstract: 'Restituisce la secante iperbolica di un numero complesso in formato testo x+yi o x+yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si vuole calcolare la secante iperbolica.' },
        },
    },
    IMSIN: {
        description: 'Restituisce il seno di un numero complesso in formato testo x + yi o x + yj.',
        abstract: 'Restituisce il seno di un numero complesso in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si desidera il seno.' },
        },
    },
    IMSINH: {
        description: 'La funzione COMP.SENH restituisce il seno iperbolico di un numero complesso in formato testo x+yi o x+yj.',
        abstract: 'La funzione COMP.SENH restituisce il seno iperbolico di un numero complesso in formato testo x+yi o x+yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si vuole calcolare il seno iperbolico.' },
        },
    },
    IMSQRT: {
        description: 'Restituisce la radice quadrata di un numero complesso in formato testo x + yi o x + yj.',
        abstract: 'Restituisce la radice quadrata di un numero complesso in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si desidera la radice quadrata.' },
        },
    },
    IMSUB: {
        description: 'Restituisce la differenza tra due numeri complessi in formato testo x + yi o x + yj.',
        abstract: 'Restituisce la differenza tra due numeri complessi in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Obbligatorio. Numero complesso da cui si desidera sottrarre num_comp2.' },
            inumber2: { name: 'inumber2', detail: 'Obbligatorio. Numero complesso da sottrarre da num_comp1.' },
        },
    },
    IMSUM: {
        description: 'Restituisce la somma di due o più numeri complessi in formato testo x + yi o x + yj.',
        abstract: 'Restituisce la somma di due o più numeri complessi in formato testo x + yi o x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Num_comp1 è obbligatorio, i numeri successivi no. Da 1 a 255 numeri complessi da addizionare.' },
            inumber2: { name: 'inumber2', detail: 'Num_comp1 è obbligatorio, i numeri successivi no. Da 1 a 255 numeri complessi da addizionare.' },
        },
    },
    IMTAN: {
        description: 'Restituisce la tangente di un numero complesso in formato testo x+yi o x+yj.',
        abstract: 'Restituisce la tangente di un numero complesso in formato testo x+yi o x+yj.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Obbligatorio. Numero complesso del quale si vuole calcolare la tangente.' },
        },
    },
    IMTANH: {
        description: 'La funzione IMTANH restituisce la tangente iperbolica del numero complesso specificato. Ad esempio, per il numero complesso "x+yi" restituisce "tanh(x+yi)".',
        abstract: 'La funzione IMTANH restituisce la tangente iperbolica del numero complesso specificato. Ad esempio, per il numero complesso "x+yi" restituisce "tanh(x+yi)".',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366655?hl=it',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Numero complesso di cui si desidera ottenere la tangente iperbolica. Può essere il risultato di COMPLESSO, un numero reale interpretato come complesso con parte immaginaria 0 o testo nel formato “x+yi”, in cui x e y sono numerici.' },
        },
    },
    OCT2BIN: {
        description: 'Converte un numero ottale in binario.',
        abstract: 'Converte un numero ottale in binario.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero ottale che si desidera convertire. Num non può essere costituito da più di 10 caratteri. Il bit più significativo di num è il bit del segno. I rimanenti 29 bit sono i bit del valore da convertire. I numeri negativi vengono rappresentati sotto forma di notazione in complemento a due.' },
            places: { name: 'places', detail: 'Opzionale. Numero di caratteri da usare. Se cifre viene omesso, OCT.BINARIO userà il minor numero di caratteri necessario. Cifre è utile per aggiungere zeri iniziali al valore restituito.' },
        },
    },
    OCT2DEC: {
        description: 'Converte un numero ottale in decimale.',
        abstract: 'Converte un numero ottale in decimale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero ottale che si desidera convertire. Num non può essere costituito da più di 10 caratteri ottali, ovvero 30 bit. Il bit più significativo di num è il bit del segno. I rimanenti 29 bit sono i bit del valore da convertire. I numeri negativi vengono rappresentati sotto forma di notazione in complemento a due.' },
        },
    },
    OCT2HEX: {
        description: 'Converte un numero ottale in esadecimale.',
        abstract: 'Converte un numero ottale in esadecimale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Obbligatorio. Numero ottale che si desidera convertire. Num non può essere costituito da più di 10 caratteri ottali, ovvero 30 bit. Il bit più significativo di num è il bit del segno. I rimanenti 29 bit sono i bit del valore da convertire. I numeri negativi vengono rappresentati sotto forma di notazione in complemento a due.' },
            places: { name: 'places', detail: 'Facoltativo. Numero di caratteri da utilizzare. Se cifre viene omesso, OCT.HEX utilizzerà il minor numero di caratteri necessario. Cifre è utile per aggiungere gli zeri iniziali al valore restituito.' },
        },
    },
};

export default locale;
