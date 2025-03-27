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
    sheet: {
        cf: {
            title: 'Mise en forme conditionnelle',
            menu: {
                manageConditionalFormatting: 'Gérer la mise en forme conditionnelle',
                createConditionalFormatting: 'Créer une mise en forme conditionnelle',
                clearRangeRules: 'Effacer les règles pour la plage sélectionnée',
                clearWorkSheetRules: 'Effacer les règles pour toute la feuille',
            },
            form: {
                lessThan: 'La valeur doit être inférieure à {0}',
                lessThanOrEqual: 'La valeur doit être inférieure ou égale à {0}',
                greaterThan: 'La valeur doit être supérieure à {0}',
                greaterThanOrEqual: 'La valeur doit être supérieure ou égale à {0}',
                rangeSelector: 'Sélectionner une plage ou entrer une valeur',
            },
            iconSet: {
                direction: 'Direction',
                shape: 'Forme',
                mark: 'Marque',
                rank: 'Rang',
                rule: 'Règle',
                icon: 'Icône',
                type: 'Type',
                value: 'Valeur',
                reverseIconOrder: 'Inverser l\'ordre des icônes',
                and: 'Et',
                when: 'Quand',
                onlyShowIcon: 'Afficher uniquement l\'icône',
            },
            symbol: {
                greaterThan: '>',
                greaterThanOrEqual: '>=',
                lessThan: '<',
                lessThanOrEqual: '<=',
            },
            panel: {
                createRule: 'Créer une règle',
                clear: 'Effacer toutes les règles',
                range: 'Appliquer la plage',
                styleType: 'Type de style',
                submit: 'Soumettre',
                cancel: 'Annuler',
                rankAndAverage: 'Haut/Bas/Moyenne',
                styleRule: 'Règle de style',
                isNotBottom: 'Haut',
                isBottom: 'Bas',
                greaterThanAverage: 'Supérieur à la moyenne',
                lessThanAverage: 'Inférieur à la moyenne',
                medianValue: 'Valeur médiane',
                fillType: 'Type de remplissage',
                pureColor: 'Couleur unie',
                gradient: 'Dégradé',
                colorSet: 'Ensemble de couleurs',
                positive: 'Positif',
                native: 'Négatif',
                workSheet: 'Toute la feuille',
                selectedRange: 'Plage sélectionnée',
                managerRuleSelect: 'Gérer les règles de {0}',
                onlyShowDataBar: 'Afficher uniquement les barres de données',
            },
            preview: {
                describe: {
                    beginsWith: 'Commence par {0}',
                    endsWith: 'Se termine par {0}',
                    containsText: 'Le texte contient {0}',
                    notContainsText: 'Le texte ne contient pas {0}',
                    equal: 'Égal à {0}',
                    notEqual: 'Différent de {0}',
                    containsBlanks: 'Contient des blancs',
                    notContainsBlanks: 'Ne contient pas de blancs',
                    containsErrors: 'Contient des erreurs',
                    notContainsErrors: 'Ne contient pas d\'erreurs',
                    greaterThan: 'Supérieur à {0}',
                    greaterThanOrEqual: 'Supérieur ou égal à {0}',
                    lessThan: 'Inférieur à {0}',
                    lessThanOrEqual: 'Inférieur ou égal à {0}',
                    notBetween: 'Pas entre {0} et {1}',
                    between: 'Entre {0} et {1}',
                    yesterday: 'Hier',
                    tomorrow: 'Demain',
                    last7Days: 'Les 7 derniers jours',
                    thisMonth: 'Ce mois-ci',
                    lastMonth: 'Le mois dernier',
                    nextMonth: 'Le mois prochain',
                    thisWeek: 'Cette semaine',
                    lastWeek: 'La semaine dernière',
                    nextWeek: 'La semaine prochaine',
                    today: 'Aujourd\'hui',
                    topN: 'Top {0}',
                    bottomN: 'Bas {0}',
                    topNPercent: 'Top {0}%',
                    bottomNPercent: 'Bas {0}%',
                },
            },
            operator: {
                beginsWith: 'Commence par',
                endsWith: 'Se termine par',
                containsText: 'Le texte contient',
                notContainsText: 'Le texte ne contient pas',
                equal: 'Égal à',
                notEqual: 'Différent de',
                containsBlanks: 'Contient des blancs',
                notContainsBlanks: 'Ne contient pas de blancs',
                containsErrors: 'Contient des erreurs',
                notContainsErrors: 'Ne contient pas d\'erreurs',
                greaterThan: 'Supérieur à',
                greaterThanOrEqual: 'Supérieur ou égal à',
                lessThan: 'Inférieur à',
                lessThanOrEqual: 'Inférieur ou égal à',
                notBetween: 'Pas entre',
                between: 'Entre',
                yesterday: 'Hier',
                tomorrow: 'Demain',
                last7Days: 'Les 7 derniers jours',
                thisMonth: 'Ce mois-ci',
                lastMonth: 'Le mois dernier',
                nextMonth: 'Le mois prochain',
                thisWeek: 'Cette semaine',
                lastWeek: 'La semaine dernière',
                nextWeek: 'La semaine prochaine',
                today: 'Aujourd\'hui',
            },
            ruleType: {
                highlightCell: 'Mettre en surbrillance la cellule',
                dataBar: 'Barre de données',
                colorScale: 'Échelle de couleurs',
                formula: 'Formule personnalisée',
                iconSet: 'Jeu d\'icônes',
                duplicateValues: 'Valeurs en double',
                uniqueValues: 'Valeurs uniques',
            },
            subRuleType: {
                uniqueValues: 'Valeurs uniques',
                duplicateValues: 'Valeurs en double',
                rank: 'Rang',
                text: 'Texte',
                timePeriod: 'Période',
                number: 'Nombre',
                average: 'Moyenne',
            },
            valueType: {
                num: 'Nombre',
                min: 'Minimum',
                max: 'Maximum',
                percent: 'Pourcentage',
                percentile: 'Percentile',
                formula: 'Formule',
                none: 'Aucun',
            },
            errorMessage: {
                notBlank: 'La condition ne peut pas être vide',
                rangeError: 'Plage invalide',
                formulaError: 'Formule incorrecte',
            },
        },
    },
};

export default locale;
