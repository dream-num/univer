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
import array from './function-list/array/fr-FR';
import compatibility from './function-list/compatibility/fr-FR';
import cube from './function-list/cube/fr-FR';
import database from './function-list/database/fr-FR';
import date from './function-list/date/fr-FR';
import engineering from './function-list/engineering/fr-FR';
import financial from './function-list/financial/fr-FR';
import information from './function-list/information/fr-FR';
import logical from './function-list/logical/fr-FR';
import lookup from './function-list/lookup/fr-FR';
import math from './function-list/math/fr-FR';
import statistical from './function-list/statistical/fr-FR';
import text from './function-list/text/fr-FR';
import univer from './function-list/univer/fr-FR';
import web from './function-list/web/fr-FR';

const locale: typeof enUS = {
    shortcut: {
        'sheets-formula-ui': {
            'quick-sum': 'Somme rapide',
        },
    },
    formula: {
        insert: {
            tooltip: 'Fonctions',
            sum: 'SOMME',
            average: 'MOYENNE',
            count: 'NOMBRE',
            max: 'MAX',
            min: 'MIN',
            more: 'Plus de fonctions...',
        },
        functionList: {
            ...financial,
            ...date,
            ...math,
            ...statistical,
            ...lookup,
            ...database,
            ...text,
            ...logical,
            ...information,
            ...engineering,
            ...cube,
            ...compatibility,
            ...web,
            ...array,
            ...univer,
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
            pasteFormula: 'Coller la formule',
        },
    },
};

export default locale;
