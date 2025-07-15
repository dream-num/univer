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
    'sheets-sort': {
        general: {
            sort: 'Ordena',
            'sort-asc': 'Ascendent',
            'sort-desc': 'Descendent',
            'sort-custom': 'Ordre personalitzat',
            'sort-asc-ext': 'Expandeix ascendent',
            'sort-desc-ext': 'Expandeix descendent',
            'sort-asc-cur': 'Ascendent',
            'sort-desc-cur': 'Descendent',
        },
        error: {
            'merge-size': 'L\'interval seleccionat conté cel·les combinades de diferents mides, que no es poden ordenar.',
            empty: 'L\'interval seleccionat no té contingut i no es pot ordenar.',
            single: 'L\'interval seleccionat només té una fila i no es pot ordenar.',
            'formula-array': 'L\'interval seleccionat té fórmules de matriu i no es pot ordenar.',
        },
        dialog: {
            'sort-reminder': 'Recordatori d\'ordenació',
            'sort-reminder-desc': 'Estendre l\'interval d\'ordenació o mantenir-lo?',
            'sort-reminder-ext': 'Estendre l\'interval d\'ordenació',
            'sort-reminder-no': 'Mantenir l\'interval d\'ordenació',
            'first-row-check': 'La primera fila no participa en l\'ordenació',
            'add-condition': 'Afegeix condició',
            cancel: 'Cancel·lar',
            confirm: 'Confirmar',
        },
    },
};

export default locale;
