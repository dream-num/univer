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

const locale = {
    'sheets-table': {
        title: 'Tableau',
        selectRange: 'Sélectionner la plage du tableau',
        rename: 'Renommer le tableau',
        updateRange: 'Mettre à jour la plage du tableau',
        tableRangeWithMergeError: 'La plage du tableau ne peut pas chevaucher des cellules fusionnées',
        tableRangeWithOtherTableError: 'La plage du tableau ne peut pas chevaucher d\'autres tableaux',
        tableRangeSingleRowError: 'La plage du tableau ne peut pas être une seule ligne',
        updateError: 'Impossible de définir la plage du tableau sur une zone qui ne chevauche pas l\'original et n\'est pas sur la même ligne',
        tableStyle: 'Style du tableau',
        defaultStyle: 'Style par défaut',
        customStyle: 'Style personnalisé',
        customTooMore: 'Le nombre de thèmes personnalisés dépasse la limite maximale, veuillez supprimer certains thèmes inutiles et les ajouter à nouveau',
        setTheme: 'Définir le thème du tableau',
        removeTable: 'Supprimer le tableau',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        header: 'En-tête',
        footer: 'Pied de page',
        firstLine: 'Première ligne',
        secondLine: 'Deuxième ligne',
        columnPrefix: 'Colonne',
        tablePrefix: 'Tableau',

        insert: {
            main: 'Insérer un tableau',
            row: 'Insérer une ligne de tableau',
            col: 'Insérer une colonne de tableau',
        },

        remove: {
            main: 'Supprimer le tableau',
            row: 'Supprimer une ligne de tableau',
            col: 'Supprimer une colonne de tableau',
        },

        condition: {
            string: 'Texte',
            number: 'Nombre',
            date: 'Date',

            empty: '(Vide)',
        },
        string: {
            compare: {
                equal: 'Égal à',
                notEqual: 'Différent de',
                contains: 'Contient',
                notContains: 'Ne contient pas',
                startsWith: 'Commence par',
                endsWith: 'Se termine par',
            },
        },
        number: {
            compare: {
                equal: 'Égal à',
                notEqual: 'Différent de',
                greaterThan: 'Supérieur à',
                greaterThanOrEqual: 'Supérieur ou égal à',
                lessThan: 'Inférieur à',
                lessThanOrEqual: 'Inférieur ou égal à',
                between: 'Entre',
                notBetween: 'Pas entre',
                above: 'Supérieur à',
                below: 'Inférieur à',
                topN: 'Top {0}',
            },
        },
        date: {
            compare: {
                equal: 'Égal à',
                notEqual: 'Différent de',
                after: 'Après',
                afterOrEqual: 'Après ou égal à',
                before: 'Avant',
                beforeOrEqual: 'Avant ou égal à',
                between: 'Entre',
                notBetween: 'Pas entre',
                today: "Aujourd'hui",
                yesterday: 'Hier',
                tomorrow: 'Demain',
                thisWeek: 'Cette semaine',
                lastWeek: 'La semaine dernière',
                nextWeek: 'La semaine prochaine',
                thisMonth: 'Ce mois-ci',
                lastMonth: 'Le mois dernier',
                nextMonth: 'Le mois prochain',
                thisQuarter: 'Ce trimestre',
                lastQuarter: 'Le trimestre dernier',
                nextQuarter: 'Le trimestre prochain',
                thisYear: 'Cette année',
                nextYear: "L'année prochaine",
                lastYear: "L'année dernière",
                quarter: 'Par trimestre',
                month: 'Par mois',
                q1: 'Premier trimestre',
                q2: 'Deuxième trimestre',
                q3: 'Troisième trimestre',
                q4: 'Quatrième trimestre',
                m1: 'Janvier',
                m2: 'Février',
                m3: 'Mars',
                m4: 'Avril',
                m5: 'Mai',
                m6: 'Juin',
                m7: 'Juillet',
                m8: 'Août',
                m9: 'Septembre',
                m10: 'Octobre',
                m11: 'Novembre',
                m12: 'Décembre',
            },
        },
    },
};

export default locale;
