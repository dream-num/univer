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
            'open-find-dialog': 'Ouvrir la boîte de dialogue de recherche',
            'open-replace-dialog': 'Ouvrir la boîte de dialogue de remplacement',
            'close-dialog': 'Fermer la boîte de dialogue de recherche et de remplacement',
            'go-to-next-match': 'Aller à la correspondance suivante',
            'go-to-previous-match': 'Aller à la correspondance précédente',
            'focus-selection': 'Concentrer la sélection',
            panel: 'Rechercher & Remplacer',
        },
        dialog: {
            title: 'Rechercher',
            find: 'Rechercher',
            replace: 'Remplacer',
            'replace-all': 'Remplacer tout',
            'case-sensitive': 'Sensible à la casse',
            'find-placeholder': 'Rechercher dans cette feuille',
            'advanced-finding': 'Recherche et remplacement avancés',
            'replace-placeholder': 'Saisir la chaîne de remplacement',
            'match-the-whole-cell': 'Correspondance de la cellule entière',
            'find-direction': {
                title: 'Direction de la recherche',
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
                formula: 'Rechercher une formule',
            },
            'no-match': 'Recherche terminée mais aucune correspondance trouvée.',
            'no-result': 'Aucun résultat',
        },
        replace: {
            'all-success': 'Toutes les {0} correspondances ont été remplacées',
            'partial-success': '{0} correspondances ont été remplacées, {1} ont échoué',
            'all-failure': 'Échec du remplacement',
            confirm: {
                title: 'Êtes-vous sûr de vouloir remplacer toutes les correspondances ?',
            },
        },
        button: {
            confirm: 'OK',
            cancel: 'Annuler',
        },
    },
};

export default locale;
