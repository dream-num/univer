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
    'sheets-numfmt-ui': {
        title: 'Formato numero',
        numfmtType: 'Tipi di formato',
        cancel: 'Annulla',
        confirm: 'Conferma',
        general: 'Generale',
        accounting: 'Contabilità',
        text: 'Testo',
        number: 'Numero',
        percent: 'Percentuale',
        scientific: 'Scientifico',
        currency: 'Valuta',
        date: 'Data',
        time: 'Ora',
        thousandthPercentile: 'Separatore delle migliaia',
        preview: 'Anteprima',
        dateTime: 'Data e ora',
        decimalLength: 'Cifre decimali',
        currencyType: 'Simbolo valuta',
        moreFmt: 'Formati',
        financialValue: 'Valore finanziario',
        roundingCurrency: 'Arrotondamento valuta',
        timeDuration: 'Durata',
        currencyDes: 'Il formato valuta è utilizzato per rappresentare valori monetari generali. Il formato contabilità allinea una colonna di valori con i punti decimali',
        accountingDes: 'Il formato numerico contabilità allinea una colonna di valori con i simboli di valuta e i punti decimali',
        dateType: 'Tipo data',
        dateDes: 'Il formato data presenta i valori di serie data e ora come valori di data.',
        negType: 'Tipo numero negativo',
        generalDes: 'Il formato generale non contiene alcun formato numerico specifico.',
        thousandthPercentileDes: 'Il formato percentuale è utilizzato per la rappresentazione di numeri ordinari. I formati monetari e contabilità forniscono un formato specializzato per i calcoli di valore monetario.',
        addDecimal: 'Aumenta cifre decimali',
        subtractDecimal: 'Diminuisci cifre decimali',
        customFormat: 'Formato personalizzato',
        customFormatDes: 'Genera formati numerici personalizzati basati sui formati esistenti.',
        info: {
            error: 'Errore',
            forceStringInfo: 'Numero memorizzato come testo',
        },
    },
};

export default locale;
