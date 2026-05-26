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
            sort: 'Sortieren',
            'sort-asc': 'Aufsteigend',
            'sort-desc': 'Absteigend',
            'sort-custom': 'Benutzerdefiniertes Sortieren',
            'sort-asc-ext': 'Aufsteigend erweitern',
            'sort-desc-ext': 'Absteigend erweitern',
            'sort-asc-cur': 'Aufsteigend',
            'sort-desc-cur': 'Absteigend',
        },
        error: {
            'merge-size': 'Der ausgewählte Bereich enthält verbundene Zellen unterschiedlicher Größe und kann nicht sortiert werden.',
            empty: 'Der ausgewählte Bereich hat keinen Inhalt und kann nicht sortiert werden.',
            single: 'Der ausgewählte Bereich hat nur eine Zeile und kann nicht sortiert werden.',
            'formula-array': 'Der ausgewählte Bereich enthält Matrixformeln und kann nicht sortiert werden.',
        },
        dialog: {
            'sort-reminder': 'Sortierhinweis',
            'sort-reminder-desc': 'Bereichssortierung erweitern oder beibehalten?',
            'sort-reminder-ext': 'Bereichssortierung erweitern',
            'sort-reminder-no': 'Bereichssortierung beibehalten',
            'first-row-check': 'Erste Zeile nimmt nicht am Sortieren teil',
            'add-condition': 'Bedingung hinzufügen',
            cancel: 'Abbrechen',
            confirm: 'Bestätigen',
        },
        info: {
            tooltip: 'Tooltip',
        },
    },
};

export default locale;
