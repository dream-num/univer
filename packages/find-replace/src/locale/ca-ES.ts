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
            'open-find-dialog': 'Obre el diàleg de cerca',
            'open-replace-dialog': 'Obre el diàleg de reemplaçament',
            'close-dialog': 'Tanca el diàleg de cerca i reemplaça',
            'go-to-next-match': 'Ves a la següent coincidència',
            'go-to-previous-match': 'Ves a la coincidència anterior',
            'focus-selection': 'Focalitza la selecció',
        },
        dialog: {
            title: 'Cerca',
            find: 'Cerca',
            replace: 'Reemplaça',
            'replace-all': 'Reemplaça-ho tot',
            'case-sensitive': 'Distingeix majúscules i minúscules',
            'find-placeholder': 'Cerca en aquest full',
            'advanced-finding': 'Cerca i reemplaçament avançats',
            'replace-placeholder': 'Introdueix el text de reemplaçament',
            'match-the-whole-cell': 'Coincideix tota la cel·la',
            'find-direction': {
                title: 'Direcció de cerca',
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
            'no-match': 'Cerca completada però no s’ha trobat cap coincidència.',
            'no-result': 'Sense resultats',
        },
        replace: {
            'all-success': 'S’han reemplaçat totes les {0} coincidències',
            'all-failure': 'Error en reemplaçar',
            confirm: {
                title: 'Esteu segur que voleu reemplaçar totes les coincidències?',
            },
        },
    },
    'find-replace-shortcuts': 'Cerca i reemplaça',
};

export default locale;
