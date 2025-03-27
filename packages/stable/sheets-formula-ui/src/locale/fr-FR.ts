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

import array from './function-list/array/en-US';
import compatibility from './function-list/compatibility/en-US';
import cube from './function-list/cube/en-US';
import database from './function-list/database/en-US';
import date from './function-list/date/en-US';
import engineering from './function-list/engineering/en-US';
import financial from './function-list/financial/en-US';
import information from './function-list/information/en-US';
import logical from './function-list/logical/en-US';
import lookup from './function-list/lookup/en-US';
import math from './function-list/math/en-US';
import statistical from './function-list/statistical/en-US';
import text from './function-list/text/en-US';
import univer from './function-list/univer/en-US';
import web from './function-list/web/en-US';

export default {
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
