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
        toolbar: 'Rechercher & Remplacer',
        shortcut: {
            'open-find-dialog': 'Ouvrir la boîte de dialogue Rechercher',
            'open-replace-dialog': 'Ouvrir la boîte de dialogue Remplacer',
            'close-dialog': 'Fermer la boîte de dialogue Rechercher & Remplacer',
            'go-to-next-match': 'Aller à la correspondance suivante',
            'go-to-previous-match': 'Aller à la correspondance précédente',
            'focus-selection': 'Focus sur la sélection',
        },
        dialog: {
            title: 'Rechercher',
            find: 'Rechercher',
            replace: 'Remplacer',
            'replace-all': 'Remplacer tout',
            'case-sensitive': 'Sensible à la casse',
            'find-placeholder': 'Rechercher dans cette feuille',
            'advanced-finding': 'Recherche avancée & Remplacer',
            'replace-placeholder': 'Entrer la chaîne de remplacement',
            'match-the-whole-cell': 'Correspondre à toute la cellule',
            'find-direction': {
                title: 'Direction de recherche',
                row: 'Rechercher par ligne',
                column: 'Rechercher par colonne',
            },
            'find-scope': {
                title: 'Plage de recherche',
                'current-sheet': 'Feuille actuelle',
                workbook: 'Classeur',
            },
            'find-by': {
                title: 'Rechercher par',
                value: 'Rechercher par valeur',
                formula: 'Rechercher par formule',
            },
            'no-match': 'Recherche terminée mais aucune correspondance trouvée.',
            'no-result': 'Aucun résultat',
        },
        replace: {
            'all-success': 'Remplacé toutes les {0} correspondances',
            'all-failure': 'Échec du remplacement',
            confirm: {
                title: 'Êtes-vous sûr de vouloir remplacer toutes les correspondances?',
            },
        },
    },
    'find-replace-shortcuts': 'Rechercher & Remplacer',
};

export default locale;
