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
        accessibility: {
            menu: 'Menu',
            zoom: 'Zoom',
            zoomIn: 'Zoom avant',
            zoomOut: 'Zoom arrière',
            resetZoom: 'Réinitialiser le zoom',
        },
        objectPermission: {
            operationDenied: 'Ce contenu est protégé. Cette action est interdite.',
            remove: 'Supprimer la protection',
            roleOwner: 'Propriétaire du fichier',
            roleEditor: 'Éditeur du fichier',
            selectedCount: 'Sélectionnés : {0}',
            searchPeople: 'Rechercher des personnes',
            noMatchingPeople: 'Aucune personne correspondante',
            loadMore: 'Charger plus',
            fileHint: 'Le partage du fichier détermine les membres. Ces paramètres limitent les actions de ces membres.',
            documentParent: 'Les restrictions de modification du document s’appliquent également à cette section.',
            paragraphParent: 'Les restrictions de modification du document et de la section contenant ce paragraphe s’appliquent également.',
            documentObjectParent: 'Le document ainsi que les sections et paragraphes contenant ou ancrant cet objet peuvent également limiter sa modification.',
            slideParent: 'Les restrictions de modification de la présentation s’appliquent également.',
            slideObjectParent: 'Les restrictions de modification de la présentation et de la diapositive ou du masque contenant cet objet s’appliquent également.',
            baseParent: 'Les restrictions de modification de Base s’appliquent également.',
            baseObjectParent: 'Les restrictions de modification de Base et de la table contenant cet objet s’appliquent également.',
            recordParent: 'Les restrictions de Base et de la table restent applicables. Modifier une valeur nécessite également une autorisation sur son champ.',
            boardParent: 'Les restrictions de modification du tableau blanc s’appliquent également à cet objet.',
            ownerInherit: 'Propriétaire du fichier, accès hérité',
            peopleError: 'Impossible de charger les personnes. Veuillez réessayer.',
            document: 'Document',
            section: 'Section',
            paragraph: 'Paragraphe',
            entity: 'Objet',
            presentation: 'Présentation',
            page: 'Diapositive',
            master: 'Vue du masque',
            base: 'Base',
            table: 'Table',
            field: 'Champ',
            record: 'Enregistrement',
            view: 'Vue',
            board: 'Tableau blanc',
            objectName: '{0}: {1}',

            search: 'Rechercher des objets',
            empty: 'Aucun objet correspondant',
            more: 'Affichage des 100 premiers objets. Utilisez la recherche pour affiner la liste.',
            title: 'Autorisations',
            cancel: 'Annuler',
            save: 'Enregistrer',
            saving: 'Enregistrement…',
            loading: 'Chargement…',
            conflict: 'Les autorisations ont changé. Rechargez avant d’enregistrer.',
            error: 'Impossible de charger ou d’enregistrer les autorisations. Vos modifications ont été conservées.',
            reload: 'Recharger',
            denied: 'Vous ne pouvez pas gérer les autorisations de cet objet.',
            edit: 'Qui peut modifier',
            all: 'Tous les éditeurs du fichier',
            owner: 'Propriétaire de l’objet uniquement',
            members: 'Membres sélectionnés',
            copy: 'Autoriser les éditeurs à copier',
            print: 'Autoriser les éditeurs à imprimer',
            export: 'Autoriser les éditeurs à exporter',
            comment: 'Autoriser les éditeurs à commenter',
            parentHint: 'Les restrictions du fichier et de l’objet parent restent applicables.',
        },
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
