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
    AND: {
        description: 'La funzione E restituisce VERO se tutti gli argomenti restituiscono VERO e restituisce FALSO se uno o più argomenti restituiscono FALSO.',
        abstract: 'La funzione E restituisce VERO se tutti gli argomenti restituiscono VERO e restituisce FALSO se uno o più argomenti restituiscono FALSO.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/and-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Prima condizione da verificare, che può restituire VERO o FALSO.' },
            logical2: { name: 'logical2', detail: 'Condizioni aggiuntive da verificare, che possono restituire VERO o FALSO, fino a un massimo di 255.' },
        },
    },
    BYCOL: {
        description: 'Applica una funzione LAMBDA a ogni colonna e restituisce una matrice dei risultati. Ad esempio, se la matrice originale è di 3 colonne per 2 righe, la matrice restituita sarà di 3 colonne per 1 riga.',
        abstract: 'Applica una funzione LAMBDA a ogni colonna e restituisce una matrice dei risultati. Ad esempio, se la matrice originale è di 3 colonne per 2 righe, la matrice restituita sarà di 3 colonne per 1 riga.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/bycol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Matrice da separare per colonna.' },
            lambda: { name: 'lambda', detail: 'Funzione LAMBDA che accetta una colonna come unico parametro e calcola un risultato. Il parametro è una colonna della matrice.' },
        },
    },
    BYROW: {
        description: 'Applica una funzione LAMBDA a ogni riga e restituisce una matrice dei risultati. Ad esempio, se la matrice originale è di 3 colonne per 2 righe, la matrice restituita sarà di 1 colonna per 2 righe.',
        abstract: 'Applica una funzione LAMBDA a ogni riga e restituisce una matrice dei risultati. Ad esempio, se la matrice originale è di 3 colonne per 2 righe, la matrice restituita sarà di 1 colonna per 2 righe.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/byrow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Matrice da separare per riga.' },
            lambda: { name: 'lambda', detail: 'Funzione LAMBDA che accetta una riga come unico parametro e calcola un risultato. Il parametro è una riga della matrice.' },
        },
    },
    FALSE: {
        description: 'Restituisce il valore logico FALSO.',
        abstract: 'Restituisce il valore logico FALSO.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/false-function',
            },
        ],
        functionParameter: {
        },
    },
    IF: {
        description: 'Ad esempio, =SE(C2="Sì";1;2) significa: SE(C2 = Sì, allora restituisci 1, altrimenti restituisci 2).',
        abstract: 'Ad esempio, =SE(C2="Sì";1;2) significa: SE(C2 = Sì, allora restituisci 1, altrimenti restituisci 2).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/if-function',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'logical_test', detail: 'Condizione da testare.' },
            valueIfTrue: { name: 'value_if_true', detail: 'Valore che si desidera venga restituito se il risultato di logical_test è VERO.' },
            valueIfFalse: { name: 'value_if_false', detail: 'Valore che si desidera venga restituito se il risultato di logical_test è FALSO.' },
        },
    },
    IFERROR: {
        description: 'È possibile usare la funzione SE.ERRORE per gestire gli errori in una formula. SE.ERRORE restituisce un valore specificato dall\'utente se la formula restituisce un errore. In caso contrario, restituisce il risultato della formula.',
        abstract: 'È possibile usare la funzione SE.ERRORE per gestire gli errori in una formula. SE.ERRORE restituisce un valore specificato dall\'utente se la formula restituisce un errore. In caso contrario, restituisce il risultato della formula.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/iferror-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Obbligatorio. Argomento in cui viene verificata la presenza di un errore.' },
            valueIfError: { name: 'value_if_error', detail: 'Obbligatorio. Valore da restituire se la formula fornisce come risultato un errore. Vengono valutati i tipi di errore seguenti: #N/D, #VALORE!, #RIF!, #DIV/0!, #NUM!, #NOME? o #NULLO!.' },
        },
    },
    IFNA: {
        description: 'La funzione SE.NON.DISP restituisce il valore specificato se una formula restituisce il valore di errore #N/D; in caso contrario, restituisce il risultato della formula.',
        abstract: 'La funzione SE.NON.DISP restituisce il valore specificato se una formula restituisce il valore di errore #N/D; in caso contrario, restituisce il risultato della formula.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/ifna-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argomento in cui viene verificata la presenza del valore di errore #N/D.' },
            valueIfNa: { name: 'value_if_na', detail: 'Valore da restituire se la formula fornisce come risultato un valore di errore #N/D.' },
        },
    },
    IFS: {
        description: 'La funzione PIÙ.SE controlla se vengono soddisfatte una o più condizioni e restituisce un valore che corrisponde alla prima condizione VERA. PIÙ.SE può essere usata al posto di più istruzioni SE annidate ed è molto più facile da leggere in presenza di più condizioni.',
        abstract: 'La funzione PIÙ.SE controlla se vengono soddisfatte una o più condizioni e restituisce un valore che corrisponde alla prima condizione VERA. PIÙ.SE può essere usata al posto di più istruzioni SE annidate ed è molto più facile da leggere in presenza di più condizioni.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/ifs-function',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'logical_test1', detail: 'Condizione che restituisce VERO o FALSO.' },
            valueIfTrue1: { name: 'value_if_true1', detail: 'Risultato da restituire se logical_test1 restituisce VERO. Può essere vuoto.' },
            logicalTest2: { name: 'logical_test2', detail: 'Condizione che restituisce VERO o FALSO.' },
            valueIfTrue2: { name: 'value_if_true2', detail: 'Risultato da restituire se logical_testN restituisce VERO. Ogni value_if_trueN corrisponde a una condizione logical_testN e può essere vuoto.' },
        },
    },
    LAMBDA: {
        description: 'È possibile creare una funzione per una formula di uso comune, eliminare la necessità di copiare e incollare la formula (che può essere soggetta ad errori) e aggiungere le proprie funzioni alla libreria di funzioni nativa di Excel. Inoltre, una funzione LAMBDA non richiede VBA, macro o JavaScript, quindi anche i non programmatori possono trarre vantaggio dal suo uso.',
        abstract: 'È possibile creare una funzione per una formula di uso comune, eliminare la necessità di copiare e incollare la formula (che può essere soggetta ad errori) e aggiungere le proprie funzioni alla libreria di funzioni nativa di Excel. Inoltre, una funzione LAMBDA non richiede VBA, macro o JavaScript, quindi anche i non programmatori possono trarre vantaggio dal suo uso.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/lambda-function',
            },
        ],
        functionParameter: {
            parameter: { name: 'parameter', detail: 'Un valore da passare alla funzione, ad esempio un riferimento di cella, una stringa o un numero. È possibile immettere fino a 253 parametri. Questo argomento è facoltativo.' },
            calculation: { name: 'calculation', detail: 'La formula da eseguire e restituire come risultato della funzione. Deve essere l\'ultimo argomento e deve restituire un risultato. Questo argomento è obbligatorio.' },
        },
    },
    LET: {
        description: 'La LET funzione assegna nomi ai risultati del calcolo. Questo consente di archiviare calcoli intermedi e valori o di definire i nomi all\'interno di una formula. Questi nomi si applicano solo all\'interno dell\'ambito della LET funzione. Analogamente alle variabili nella programmazione, LET viene eseguita tramite la sintassi nativa della formula di Excel.',
        abstract: 'La LET funzione assegna nomi ai risultati del calcolo. Questo consente di archiviare calcoli intermedi e valori o di definire i nomi all\'interno di una formula. Questi nomi si applicano solo all\'interno dell\'ambito della LET funzione. Analogamente alle variabili nella programmazione, LET viene eseguita tramite la sintassi nativa della formula di Excel.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/let-function',
            },
        ],
        functionParameter: {
            name1: { name: 'name1', detail: 'Primo nome da assegnare. Deve iniziare con una lettera e non può essere il risultato di una formula né entrare in conflitto con la sintassi degli intervalli.' },
            nameValue1: { name: 'name_value1', detail: 'Valore assegnato a name1.' },
            calculationOrName2: { name: 'calculation_or_name2', detail: 'Calcolo che usa tutti i nomi della funzione LET e deve essere l\'ultimo argomento, oppure un secondo nome da assegnare a name_value2.' },
            nameValue2: { name: 'name_value2', detail: 'Valore assegnato a calculation_or_name2.' },
            calculationOrName3: { name: 'calculation_or_name3', detail: 'Calcolo che usa tutti i nomi della funzione LET e deve essere l\'ultimo argomento, oppure un terzo nome da assegnare a name_value3.' },
        },
    },
    MAKEARRAY: {
        description: 'Restituisce una matrice calcolata di una dimensione di riga e colonna specificata applicando una funzione LAMBDA .',
        abstract: 'Restituisce una matrice calcolata di una dimensione di riga e colonna specificata applicando una funzione LAMBDA .',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/makearray-function',
            },
        ],
        functionParameter: {
            number1: { name: 'rows', detail: 'Numero di righe della matrice. Deve essere maggiore di zero.' },
            number2: { name: 'cols', detail: 'Numero di colonne della matrice. Deve essere maggiore di zero.' },
            value3: { name: 'lambda', detail: 'Funzione LAMBDA chiamata per creare la matrice. Accetta due parametri: row, indice della riga, e col, indice della colonna.' },
        },
    },
    MAP: {
        description: 'Restituisce una matrice costituita dal mapping di ogni valore delle matrici a un nuovo valore applicando un\'espressione LAMBDA per creare un nuovo valore.',
        abstract: 'Restituisce una matrice costituita dal mapping di ogni valore delle matrici a un nuovo valore applicando un\'espressione LAMBDA per creare un nuovo valore.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/map-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Prima matrice da mappare.' },
            array2: { name: 'array2', detail: 'Seconda matrice da mappare.' },
            lambda: { name: 'lambda', detail: 'Funzione LAMBDA che deve essere l\'ultimo argomento e avere un parametro per ogni matrice fornita.' },
        },
    },
    NOT: {
        description: 'La funzione NON inverte il valore dell\'argomento.',
        abstract: 'La funzione NON inverte il valore dell\'argomento.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/not-function',
            },
        ],
        functionParameter: {
            logical: { name: 'logical', detail: 'Condizione di cui si desidera invertire la logica, che può restituire VERO o FALSO.' },
        },
    },
    OR: {
        description: 'La funzione O restituisce VERO se uno degli argomenti restituisce VERO e restituisce FALSO se tutti gli argomenti restituiscono FALSO.',
        abstract: 'La funzione O restituisce VERO se uno degli argomenti restituisce VERO e restituisce FALSO se tutti gli argomenti restituiscono FALSO.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/or-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Prima condizione da verificare, che può restituire VERO o FALSO.' },
            logical2: { name: 'logical2', detail: 'Condizioni aggiuntive da verificare, che possono restituire VERO o FALSO, fino a un massimo di 255.' },
        },
    },
    REDUCE: {
        description: 'Riduce una matrice a un valore accumulato applicando un\'espressione LAMBDA a ogni valore e restituendo il valore totale nell\'accumulatore.',
        abstract: 'Riduce una matrice a un valore accumulato applicando un\'espressione LAMBDA a ogni valore e restituendo il valore totale nell\'accumulatore.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/reduce-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Imposta il valore iniziale dell\'accumulatore.' },
            array: { name: 'array', detail: 'Matrice da ridurre.' },
            lambda: { name: 'lambda', detail: 'Funzione LAMBDA chiamata per ridurre la matrice. Accetta il valore accumulato, il valore corrente della matrice e il calcolo applicato a ogni elemento.' },
        },
    },
    SCAN: {
        description: 'Analizza una matrice applicando un\'espressione LAMBDA a ogni valore e restituisce una matrice con ogni valore intermedio.',
        abstract: 'Analizza una matrice applicando un\'espressione LAMBDA a ogni valore e restituisce una matrice con ogni valore intermedio.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/scan-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Imposta il valore iniziale dell\'accumulatore.' },
            array: { name: 'array', detail: 'Matrice da analizzare.' },
            lambda: { name: 'lambda', detail: 'Espressione LAMBDA chiamata per ridurre la matrice. La funzione LAMBDA accetta tre parametri: Accumulatore Il valore è stato sommato e restituito come risultato finale. Valore Valore corrente della matrice. Corpo Calcolo applicato a ogni elemento della matrice.' },
        },
    },
    SWITCH: {
        description: 'La funzione SWITCH valuta un valore, chiamato espressione , rispetto a un elenco di valori e restituisce il risultato che equivale al primo valore corrispondente. Se non ci sono valori corrispondenti, verrà restituito un valore predefinito facoltativo.',
        abstract: 'La funzione SWITCH valuta un valore, chiamato espressione , rispetto a un elenco di valori e restituisce il risultato che equivale al primo valore corrispondente. Se non ci sono valori corrispondenti, verrà restituito un valore predefinito facoltativo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/switch-function',
            },
        ],
        functionParameter: {
            expression: { name: 'expression', detail: 'Valore, ad esempio numero, data o testo, da confrontare con value1 fino a value126.' },
            value1: { name: 'value1', detail: 'Valore da confrontare con expression.' },
            result1: { name: 'result1', detail: 'Valore da restituire quando l\'argomento valueN corrispondente coincide con expression. Deve essere fornito per ogni valueN.' },
            defaultOrValue2: { name: 'default_or_value2', detail: 'Valore da restituire se non viene trovata alcuna corrispondenza nelle espressioni valueN. Deve essere l\'ultimo argomento della funzione.' },
            result2: { name: 'result2', detail: 'Valore da restituire quando l\'argomento valueN corrispondente coincide con expression. Deve essere fornito per ogni valueN.' },
        },
    },
    TRUE: {
        description: 'Restituisce il valore logico VERO. È possibile usare questa funzione quando si vuole restituire il valore VERO in base a una condizione. Ad esempio:',
        abstract: 'Restituisce il valore logico VERO. È possibile usare questa funzione quando si vuole restituire il valore VERO in base a una condizione. Ad esempio:',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/true-function',
            },
        ],
        functionParameter: {
        },
    },
    XOR: {
        description: 'La funzione XOR restituisce un or esclusivo logico di tutti gli argomenti.',
        abstract: 'La funzione XOR restituisce un or esclusivo logico di tutti gli argomenti.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/xor-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Prima condizione da verificare, che può restituire VERO o FALSO.' },
            logical2: { name: 'logical2', detail: 'Condizioni aggiuntive da verificare, che possono restituire VERO o FALSO, fino a un massimo di 255.' },
        },
    },
};

export default locale;
