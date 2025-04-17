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
    dataValidation: {
        title: 'Validation des données',
        validFail: {
            value: 'Veuillez entrer une valeur',
            common: 'Veuillez entrer une valeur ou une formule',
            number: 'Veuillez entrer un nombre ou une formule',
            formula: 'Veuillez entrer une formule',
            integer: 'Veuillez entrer un entier ou une formule',
            date: 'Veuillez entrer une date ou une formule',
            list: 'Veuillez entrer des options',
            listInvalid: 'La source de la liste doit être une liste délimitée ou une référence à une seule ligne ou colonne',
            checkboxEqual: 'Entrez des valeurs différentes pour les contenus des cellules cochées et décochées.',
            formulaError: 'La plage de référence contient des données invisibles, veuillez réajuster la plage',
            listIntersects: 'La plage sélectionnée ne peut pas croiser le champ des règles',
            primitive: 'Les formules ne sont pas autorisées pour les valeurs personnalisées cochées et décochées.',
        },
        panel: {
            title: 'Gestion de la validation des données',
            addTitle: 'Créer une nouvelle validation des données',
            removeAll: 'Tout supprimer',
            add: 'Ajouter une règle',
            range: 'Plages',
            type: 'Type',
            options: 'Options avancées',
            operator: 'Opérateur',
            removeRule: 'Supprimer',
            done: 'Terminé',
            formulaPlaceholder: 'Veuillez entrer une valeur ou une formule',
            valuePlaceholder: 'Veuillez entrer une valeur',
            formulaAnd: 'et',
            invalid: 'Invalide',
            showWarning: 'Afficher un avertissement',
            rejectInput: 'Rejeter l\'entrée',
            messageInfo: 'Message d\'aide',
            showInfo: 'Afficher le texte d\'aide pour une cellule sélectionnée',
            rangeError: 'Les plages ne sont pas légales',
            allowBlank: 'Autoriser les valeurs vides',
        },
        operators: {
            between: 'entre',
            greaterThan: 'supérieur à',
            greaterThanOrEqual: 'supérieur ou égal à',
            lessThan: 'inférieur à',
            lessThanOrEqual: 'inférieur ou égal à',
            equal: 'égal à',
            notEqual: 'différent de',
            notBetween: 'pas entre',
            legal: 'est de type légal',
        },
        ruleName: {
            between: 'est entre {FORMULA1} et {FORMULA2}',
            greaterThan: 'est supérieur à {FORMULA1}',
            greaterThanOrEqual: 'est supérieur ou égal à {FORMULA1}',
            lessThan: 'est inférieur à {FORMULA1}',
            lessThanOrEqual: 'est inférieur ou égal à {FORMULA1}',
            equal: 'est égal à {FORMULA1}',
            notEqual: 'est différent de {FORMULA1}',
            notBetween: 'n\'est pas entre {FORMULA1} et {FORMULA2}',
            legal: 'est un {TYPE} légal',
        },
        errorMsg: {
            between: 'La valeur doit être entre {FORMULA1} et {FORMULA2}',
            greaterThan: 'La valeur doit être supérieure à {FORMULA1}',
            greaterThanOrEqual: 'La valeur doit être supérieure ou égale à {FORMULA1}',
            lessThan: 'La valeur doit être inférieure à {FORMULA1}',
            lessThanOrEqual: 'La valeur doit être inférieure ou égale à {FORMULA1}',
            equal: 'La valeur doit être égale à {FORMULA1}',
            notEqual: 'La valeur doit être différente de {FORMULA1}',
            notBetween: 'La valeur ne doit pas être entre {FORMULA1} et {FORMULA2}',
            legal: 'La valeur doit être un {TYPE} légal',
        },
        any: {
            title: 'N\'importe quelle valeur',
            error: 'Le contenu de cette cellule viole la règle de validation',
        },
        date: {
            title: 'Date',
            operators: {
                between: 'entre',
                greaterThan: 'après',
                greaterThanOrEqual: 'le ou après',
                lessThan: 'avant',
                lessThanOrEqual: 'le ou avant',
                equal: 'égal à',
                notEqual: 'différent de',
                notBetween: 'pas entre',
                legal: 'est une date légale',
            },
            ruleName: {
                between: 'est entre {FORMULA1} et {FORMULA2}',
                greaterThan: 'est après {FORMULA1}',
                greaterThanOrEqual: 'est le ou après {FORMULA1}',
                lessThan: 'est avant {FORMULA1}',
                lessThanOrEqual: 'est le ou avant {FORMULA1}',
                equal: 'est {FORMULA1}',
                notEqual: 'n\'est pas {FORMULA1}',
                notBetween: 'n\'est pas entre {FORMULA1}',
                legal: 'est une date légale',
            },
            errorMsg: {
                between: 'La valeur doit être une date légale et entre {FORMULA1} et {FORMULA2}',
                greaterThan: 'La valeur doit être une date légale et après {FORMULA1}',
                greaterThanOrEqual: 'La valeur doit être une date légale et le ou après {FORMULA1}',
                lessThan: 'La valeur doit être une date légale et avant {FORMULA1}',
                lessThanOrEqual: 'La valeur doit être une date légale et le ou avant {FORMULA1}',
                equal: 'La valeur doit être une date légale et {FORMULA1}',
                notEqual: 'La valeur doit être une date légale et non {FORMULA1}',
                notBetween: 'La valeur doit être une date légale et non entre {FORMULA1}',
                legal: 'La valeur doit être une date légale',
            },
        },
        list: {
            title: 'Liste déroulante',
            name: 'La valeur contient une de la plage',
            error: 'L\'entrée doit être dans la plage spécifiée',
            emptyError: 'Veuillez entrer une valeur',
            add: 'Ajouter',
            dropdown: 'Sélectionner',
            options: 'Options',
            customOptions: 'Personnalisé',
            refOptions: 'D\'une plage',
            formulaError: 'La source de la liste doit être une liste délimitée de données, ou une référence à une seule ligne ou colonne.',
            edit: 'Éditer',
        },
        listMultiple: {
            title: 'Liste déroulante-Multiple',
            dropdown: 'Sélection multiple',
        },
        textLength: {
            title: 'Longueur du texte',
            errorMsg: {
                between: 'La longueur du texte doit être entre {FORMULA1} et {FORMULA2}',
                greaterThan: 'La longueur du texte doit être supérieure à {FORMULA1}',
                greaterThanOrEqual: 'La longueur du texte doit être supérieure ou égale à {FORMULA1}',
                lessThan: 'La longueur du texte doit être inférieure à {FORMULA1}',
                lessThanOrEqual: 'La longueur du texte doit être inférieure ou égale à {FORMULA1}',
                equal: 'La longueur du texte doit être {FORMULA1}',
                notEqual: 'La longueur du texte doit être différente de {FORMULA1}',
                notBetween: 'La longueur du texte ne doit pas être entre {FORMULA1} et {FORMULA2}',
            },
        },
        decimal: {
            title: 'Nombre',
        },
        whole: {
            title: 'Entier',
        },
        checkbox: {
            title: 'Case à cocher',
            error: 'Le contenu de cette cellule viole sa règle de validation',
            tips: 'Utiliser des valeurs personnalisées dans les cellules',
            checked: 'Valeur sélectionnée',
            unchecked: 'Valeur non sélectionnée',
        },
        custom: {
            title: 'Formule personnalisée',
            error: 'Le contenu de cette cellule viole sa règle de validation',
            validFail: 'Veuillez entrer une formule valide',
            ruleName: 'La formule personnalisée est {FORMULA1}',
        },
        alert: {
            title: 'Erreur',
            ok: 'OK',
        },
        error: {
            title: 'Invalide :',
        },
        renderMode: {
            arrow: 'Flèche',
            chip: 'Puce',
            text: 'Texte brut',
            label: 'Style d\'affichage',
        },
        showTime: {
            label: 'Afficher le sélecteur de temps',
        },
    },
};

export default locale;
