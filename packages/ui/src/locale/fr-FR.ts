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
import emojiLocale from './emoji-locale/fr-FR.generated';

const locale: typeof enUS = {
    ui: {
        featureSearch: {
            title: 'Rechercher des fonctionnalités',
            placeholder: 'Saisissez une fonctionnalité ou un nom de menu...',
            empty: 'Aucune fonctionnalité disponible trouvée',
            ribbon: 'Ruban',
            contextMenu: 'Menu contextuel',
        },
        emojiPicker: {
            search: 'Rechercher',
            random: 'Emoji aléatoire',
            recents: 'Récents',
            emojis: 'Emojis',
            animals: 'Animaux',
            food: 'Nourriture',
            activities: 'Activités',
            places: 'Lieux',
            objects: 'Objets',
            symbols: 'Symboles',
            searchResults: 'Résultats de recherche',
            noResults: 'Aucun emoji trouvé',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: 'Mathématiques',
            greek: 'Grec',
            common: 'Courants',
        },
        toolbar: {
            heading: {
                normal: 'Normal',
                title: 'Titre',
                subTitle: 'Sous-titre',
                1: 'Titre 1',
                2: 'Titre 2',
                3: 'Titre 3',
                4: 'Titre 4',
                5: 'Titre 5',
            },
        },
        ribbon: {
            start: 'Démarrer',
            startDesc: 'Initialiser la feuille de calcul et définir les paramètres de base.',
            insert: 'Insérer',
            insertDesc: 'Insérer des lignes, des colonnes, des graphiques et divers autres éléments.',
            formulas: 'Formules',
            formulasDesc: 'Utiliser des fonctions et des formules pour les calculs de données.',
            data: 'Données',
            dataDesc: 'Gérer les données, y compris l\'importation, le tri et le filtrage.',
            view: 'Vue',
            viewDesc: 'Changer les modes d\'affichage et ajuster l\'effet d\'affichage.',
            others: 'Autres',
            othersDesc: 'Autres fonctions et paramètres.',
            more: 'Plus',
        },
        fontFamily: {
            'not-supported': 'Aucune police de ce type trouvée dans le système, utilisation de la police par défaut.',
        },
        'shortcut-panel': {
            title: 'Raccourcis',
        },
        shortcut: {
            undo: 'Annuler',
            redo: 'Refaire',
            cut: 'Couper',
            copy: 'Copier',
            paste: 'Coller',
            'shortcut-panel': 'Basculer le panneau de raccourcis',
        },
        'common-edit': 'Raccourcis d\'édition courants',
        'toggle-shortcut-panel': 'Basculer le panneau de raccourcis',
        navigation: {
            back: 'Retour',
            previous: 'Précédent',
            next: 'Suivant',
        },
        sidebar: {
            panel: 'Panneau latéral',
            resize: 'Redimensionner le panneau latéral',
            close: 'Fermer le panneau latéral',
        },
        beforeClose: {
            title: 'Certaines modifications n\'ont pas été enregistrées',
        },
        clipboard: {
            authentication: {
                title: 'Permission refusée',
                content: 'Veuillez autoriser Univer à accéder à votre presse-papiers.',
            },
        },
        rangeSelector: {
            cancel: 'Annuler',
        },
        'global-shortcut': 'Raccourci global',
        row: 'Ligne',
        column: 'Colonne',
    },
};

export default locale;
