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
    'sheets-data-validation': {
        operators: {
            between: 'tra',
            greaterThan: 'maggiore di',
            greaterThanOrEqual: 'maggiore o uguale a',
            lessThan: 'minore di',
            lessThanOrEqual: 'minore o uguale a',
            equal: 'uguale a',
            notEqual: 'diverso da',
            notBetween: 'non tra',
            legal: 'è un tipo valido',
        },
        ruleName: {
            between: 'È tra {FORMULA1} e {FORMULA2}',
            greaterThan: 'È maggiore di {FORMULA1}',
            greaterThanOrEqual: 'È maggiore o uguale a {FORMULA1}',
            lessThan: 'È minore di {FORMULA1}',
            lessThanOrEqual: 'È minore o uguale a {FORMULA1}',
            equal: 'È uguale a {FORMULA1}',
            notEqual: 'È diverso da {FORMULA1}',
            notBetween: 'Non è tra {FORMULA1} e {FORMULA2}',
            legal: 'È un {TYPE} valido',
        },
        errorMsg: {
            between: 'Il valore deve essere tra {FORMULA1} e {FORMULA2}',
            greaterThan: 'Il valore deve essere maggiore di {FORMULA1}',
            greaterThanOrEqual: 'Il valore deve essere maggiore o uguale a {FORMULA1}',
            lessThan: 'Il valore deve essere minore di {FORMULA1}',
            lessThanOrEqual: 'Il valore deve essere minore o uguale a {FORMULA1}',
            equal: 'Il valore deve essere uguale a {FORMULA1}',
            notEqual: 'Il valore deve essere diverso da {FORMULA1}',
            notBetween: 'Il valore non deve essere tra {FORMULA1} e {FORMULA2}',
            legal: 'Il valore deve essere un {TYPE} valido',
        },
        date: {
            operators: {
                between: 'tra',
                greaterThan: 'dopo',
                greaterThanOrEqual: 'il giorno o dopo',
                lessThan: 'prima',
                lessThanOrEqual: 'il giorno o prima',
                equal: 'uguale',
                notEqual: 'diverso',
                notBetween: 'non tra',
                legal: 'è una data valida',
            },
            ruleName: {
                between: 'è tra {FORMULA1} e {FORMULA2}',
                greaterThan: 'è dopo {FORMULA1}',
                greaterThanOrEqual: 'è il giorno o dopo {FORMULA1}',
                lessThan: 'è prima di {FORMULA1}',
                lessThanOrEqual: 'è il giorno o prima di {FORMULA1}',
                equal: 'è {FORMULA1}',
                notEqual: 'non è {FORMULA1}',
                notBetween: 'non è tra {FORMULA1} e {FORMULA2}',
                legal: 'è una data valida',
            },
            errorMsg: {
                between: 'Il valore deve essere una data valida e tra {FORMULA1} e {FORMULA2}',
                greaterThan: 'Il valore deve essere una data valida e dopo {FORMULA1}',
                greaterThanOrEqual: 'Il valore deve essere una data valida e il giorno o dopo {FORMULA1}',
                lessThan: 'Il valore deve essere una data valida e prima di {FORMULA1}',
                lessThanOrEqual: 'Il valore deve essere una data valida e il giorno o prima di {FORMULA1}',
                equal: 'Il valore deve essere una data valida e {FORMULA1}',
                notEqual: 'Il valore deve essere una data valida e non {FORMULA1}',
                notBetween: 'Il valore deve essere una data valida e non tra {FORMULA1} e {FORMULA2}',
                legal: 'Il valore deve essere una data valida',
            },
            title: 'Data',
        },
        textLength: {
            errorMsg: {
                between: 'La lunghezza del testo deve essere tra {FORMULA1} e {FORMULA2}',
                greaterThan: 'La lunghezza del testo deve essere maggiore di {FORMULA1}',
                greaterThanOrEqual: 'La lunghezza del testo deve essere maggiore o uguale a {FORMULA1}',
                lessThan: 'La lunghezza del testo deve essere minore di {FORMULA1}',
                lessThanOrEqual: 'La lunghezza del testo deve essere minore o uguale a {FORMULA1}',
                equal: 'La lunghezza del testo deve essere {FORMULA1}',
                notEqual: 'La lunghezza del testo deve essere diversa da {FORMULA1}',
                notBetween: 'La lunghezza del testo non deve essere tra {FORMULA1} e {FORMULA2}',
            },
            title: 'Lunghezza testo',
        },
        custom: {
            ruleName: 'La formula personalizzata è {FORMULA1}',
            title: 'Formula personalizzata',
            validFail: 'Inserire una formula valida',
            error: 'Il contenuto di questa cella viola la regola di convalida',
        },
        validFail: {
            value: 'Inserire un valore',
            common: 'Inserire valore o formula',
            number: 'Inserire numero o formula',
            formula: 'Inserire formula',
            integer: 'Inserire numero intero o formula',
            date: 'Inserire data o formula',
            list: 'Inserire opzioni',
            listInvalid: 'L\'origine dell\'elenco deve essere un elenco delimitato o un riferimento a una singola riga o colonna',
            checkboxEqual: 'Inserire valori diversi per i contenuti delle celle selezionate e non selezionate.',
            formulaError: 'L\'intervallo di riferimento contiene dati invisibili, riaggiustare l\'intervallo',
            listIntersects: 'L\'intervallo selezionato non può intersecarsi con l\'ambito delle regole',
            primitive: 'Le formule non sono consentite per i valori personalizzati di selezionato e non selezionato.',
        },
        any: {
            title: 'Qualsiasi valore',
            error: 'Il contenuto di questa cella viola la regola di convalida',
        },
        list: {
            title: 'Menu a discesa',
            name: 'Il valore contiene uno dall\'intervallo',
            error: 'L\'input deve rientrare nell\'intervallo specificato',
            emptyError: 'Inserire un valore',
            add: 'Aggiungi',
            dropdown: 'Seleziona',
            options: 'Opzioni',
            customOptions: 'Personalizzato',
            refOptions: 'Da un intervallo',
            formulaError: 'L\'origine dell\'elenco deve essere un elenco delimitato di dati o un riferimento a una singola riga o colonna.',
            edit: 'Modifica',
        },
        listMultiple: {
            title: 'Menu a discesa - Multiplo',
            dropdown: 'Selezione multipla',
        },
        decimal: {
            title: 'Numero',
        },
        whole: {
            title: 'Numero intero',
        },
        checkbox: {
            title: 'Casella di controllo',
            error: 'Il contenuto di questa cella viola la regola di convalida',
            tips: 'Usa valori personalizzati nelle celle',
            checked: 'Valore selezionato',
            unchecked: 'Valore non selezionato',
        },
    },
};

export default locale;
