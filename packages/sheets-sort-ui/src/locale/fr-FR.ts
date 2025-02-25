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
            sort: 'Trier',
            'sort-asc': 'Croissant',
            'sort-desc': 'Décroissant',
            'sort-custom': 'Tri personnalisé',
            'sort-asc-ext': 'Étendre croissant',
            'sort-desc-ext': 'Étendre décroissant',
            'sort-asc-cur': 'Croissant',
            'sort-desc-cur': 'Décroissant',
        },
        error: {
            'merge-size': 'La plage sélectionnée contient des cellules fusionnées de tailles différentes, qui ne peuvent pas être triées.',
            empty: 'La plage sélectionnée ne contient aucun contenu et ne peut pas être triée.',
            single: 'La plage sélectionnée ne contient qu\'une seule ligne et ne peut pas être triée.',
            'formula-array': 'La plage sélectionnée contient des formules matricielles et ne peut pas être triée.',
        },
        dialog: {
            'sort-reminder': 'Rappel de tri',
            'sort-reminder-desc': 'Étendre le tri de la plage ou conserver le tri de la plage?',
            'sort-reminder-ext': 'Étendre le tri de la plage',
            'sort-reminder-no': 'Conserver le tri de la plage',
            'first-row-check': 'La première ligne ne participe pas au tri',
            'add-condition': 'Ajouter une condition',
            cancel: 'Annuler',
            confirm: 'Confirmer',
        },
    },
};

export default locale;
