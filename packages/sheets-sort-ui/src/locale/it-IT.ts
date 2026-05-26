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
    'sheets-sort-ui': {
        general: {
            sort: 'Ordinamento',
            'sort-asc': 'Crescente',
            'sort-desc': 'Decrescente',
            'sort-custom': 'Ordinamento personalizzato',
            'sort-asc-ext': 'Espandi crescente',
            'sort-desc-ext': 'Espandi decrescente',
            'sort-asc-cur': 'Crescente',
            'sort-desc-cur': 'Decrescente',
        },
        error: {
            'merge-size': "L'intervallo selezionato contiene celle unite di dimensioni diverse e non può essere ordinato.",
            empty: "L'intervallo selezionato non ha contenuto e non può essere ordinato.",
            single: "L'intervallo selezionato ha una sola riga e non può essere ordinato.",
            'formula-array': "L'intervallo selezionato contiene formule matriciali e non può essere ordinato.",
        },
        dialog: {
            'sort-reminder': 'Promemoria ordinamento',
            'sort-reminder-desc': 'Estendere l\'ordinamento all\'intervallo o mantenerlo?',
            'sort-reminder-ext': 'Estendi ordinamento intervallo',
            'sort-reminder-no': 'Mantieni ordinamento intervallo',
            'first-row-check': 'La prima riga non partecipa all\'ordinamento',
            'add-condition': 'Aggiungi condizione',
            cancel: 'Annulla',
            confirm: 'Conferma',
        },
        info: {
            tooltip: 'Suggerimento',
        },
    },
};

export default locale;
