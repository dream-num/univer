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
    'sheets-filter': {
        toolbar: {
            'smart-toggle-filter-tooltip': 'Inverser le filtre',
            'clear-filter-criteria': 'Effacer les conditions de filtre',
            're-calc-filter-conditions': 'Recalculer les conditions de filtre',
        },
        command: {
            'not-valid-filter-range': 'La plage sélectionnée n\'a qu\'une seule ligne et n\'est pas valide pour le filtre.',
        },
        shortcut: {
            'smart-toggle-filter': 'Inverser le filtre',
        },
        panel: {
            'clear-filter': 'Effacer le filtre',
            cancel: 'Annuler',
            confirm: 'Confirmer',
            'by-values': 'Par valeurs',
            'by-conditions': 'Par conditions',
            'filter-only': 'Filtrer uniquement',
            'search-placeholder': 'Utilisez un espace pour séparer les mots-clés',
            'select-all': 'Tout sélectionner',
            'input-values-placeholder': 'Saisir des valeurs',
            and: 'ET',
            or: 'OU',
            empty: '(vide)',
            '?': 'Utilisez “?” pour représenter un seul caractère.',
            '*': 'Utilisez “*” pour représenter plusieurs caractères.',
        },
        conditions: {
            none: 'Aucun',
            empty: 'Est vide',
            'not-empty': 'N\'est pas vide',
            'text-contains': 'Le texte contient',
            'does-not-contain': 'Le texte ne contient pas',
            'starts-with': 'Le texte commence par',
            'ends-with': 'Le texte se termine par',
            equals: 'Le texte est égal à',
            'greater-than': 'Supérieur à',
            'greater-than-or-equal': 'Supérieur ou égal à',
            'less-than': 'Inférieur à',
            'less-than-or-equal': 'Inférieur ou égal à',
            equal: 'Égal à',
            'not-equal': 'Différent de',
            between: 'Entre',
            'not-between': 'Pas entre',
            custom: 'Personnalisé',
        },
        msg: {
            'filter-header-forbidden': 'Vous ne pouvez pas déplacer la ligne d\'en-tête d\'un filtre.',
        },
        date: {
            1: 'Jan',
            2: 'Fév',
            3: 'Mar',
            4: 'Avr',
            5: 'Mai',
            6: 'Juin',
            7: 'Juil',
            8: 'Août',
            9: 'Sept',
            10: 'Oct',
            11: 'Nov',
            12: 'Déc',
        },
    },
};

export default locale;
