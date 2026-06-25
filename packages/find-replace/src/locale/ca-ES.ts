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
    'find-replace': {
        toolbar: 'Cerca i reemplaça',
        shortcut: {
            'open-find-dialog': 'Obrir el diàleg de cerca',
            'open-replace-dialog': 'Obrir el diàleg de reemplaçament',
            'close-dialog': 'Tancar el diàleg de cerca i reemplaçament',
            'go-to-next-match': 'Anar a la següent coincidència',
            'go-to-previous-match': 'Anar a la coincidència anterior',
            'focus-selection': 'Enfocar la selecció',
            panel: 'Cerca i reemplaça',
        },
        dialog: {
            title: 'Cerca',
            find: 'Cerca',
            replace: 'Reemplaça',
            'replace-all': 'Reemplaça-ho tot',
            'case-sensitive': 'Distingeix majúscules de minúscules',
            'find-placeholder': 'Cerca en aquest full',
            'advanced-finding': 'Cerca i reemplaçament avançats',
            'replace-placeholder': 'Introduïu la cadena de reemplaçament',
            'match-the-whole-cell': 'Coincidir amb la cel·la sencera',
            'find-direction': {
                title: 'Direcció de la cerca',
                row: 'Cerca per fila',
                column: 'Cerca per columna',
            },
            'find-scope': {
                title: 'Abast de la cerca',
                'current-sheet': 'Full actual',
                workbook: 'Llibre',
            },
            'find-by': {
                title: 'Cerca per',
                value: 'Cerca per valor',
                formula: 'Cerca fórmula',
            },
            'no-match': 'S\'ha completat la cerca però no s\'ha trobat cap coincidència.',
            'no-result': 'Sense resultats',
        },
        replace: {
            'all-success': 'S\'han reemplaçat totes les {0} coincidències',
            'partial-success': 'S\'han reemplaçat {0} coincidències, no s\'han pogut reemplaçar {1}',
            'all-failure': 'Error en el reemplaçament',
            confirm: {
                title: 'Esteu segur que voleu reemplaçar totes les coincidències?',
            },
        },
        button: {
            confirm: 'D\'acord',
            cancel: 'Cancel·lar',
        },
    },
};

export default locale;
