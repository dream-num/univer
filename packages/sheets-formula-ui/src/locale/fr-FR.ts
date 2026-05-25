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
    'sheets-formula-ui': {
        shortcut: {
            'quick-sum': 'Somme rapide',
        },

        insert: {
            tooltip: 'Fonctions',
            common: 'Fonctions courantes',
        },
        prompt: {
            helpExample: 'EXEMPLE',
            helpAbstract: 'À PROPOS',
            required: 'Requis.',
            optional: 'Optionnel.',
        },
        error: {
            title: 'Erreur',
            divByZero: 'Erreur de division par zéro',
            name: 'Erreur de nom invalide',
            value: 'Erreur de valeur',
            num: 'Erreur de nombre',
            na: 'Erreur de valeur non disponible',
            cycle: 'Erreur de référence circulaire',
            ref: 'Erreur de référence de cellule invalide',
            spill: "La plage de débordement n'est pas vide",
            calc: 'Erreur de calcul',
            error: 'Erreur',
            connect: 'Récupération des données',
            null: 'Erreur nulle',
        },

        functionType: {
            financial: 'Financier',
            date: 'Date & Heure',
            math: 'Math & Trigo',
            statistical: 'Statistique',
            lookup: 'Recherche & Référence',
            database: 'Base de données',
            text: 'Texte',
            logical: 'Logique',
            information: 'Information',
            engineering: 'Ingénierie',
            cube: 'Cube',
            compatibility: 'Compatibilité',
            web: 'Web',
            array: 'Tableau',
            univer: 'Univer',
            user: 'Définies par l\'utilisateur',
            definedname: 'Nom défini',
        },
        moreFunctions: {
            confirm: 'Confirmer',
            prev: 'Précédent',
            next: 'Suivant',
            searchFunctionPlaceholder: 'Rechercher une fonction',
            allFunctions: 'Toutes les fonctions',
            syntax: 'SYNTAXE',
        },
        operation: {
            copyFormulaOnly: 'Copier uniquement la formule',
            pasteFormula: 'Coller la formule',
        },

        rangeSelector: {
            title: 'Sélectionner une plage de données',
            addAnotherRange: 'Ajouter une plage',
            buttonTooltip: 'Sélectionner une plage de données',
            placeHolder: 'Sélectionner une plage ou entrer.',
            confirm: 'Confirmer',
            cancel: 'Annuler',
        },
    },
};

export default locale;
