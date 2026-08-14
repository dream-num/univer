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
    'sheets-data-validation-ui': {
        title: 'Validation des données',
        ribbon: {
            setCheckbox: 'Définir la case à cocher',
            clearCheckbox: 'Effacer la case à cocher',
            dropdownPresetTitle: 'Appliquer un préréglage :',
            editDropdown: 'Modifier les options',
            clearDropdown: 'Effacer la liste déroulante',
            dateTime: 'Date et heure',
            presets: {
                yes: 'Oui',
                no: 'Non',
                notStarted: 'Non commencé',
                inProgress: 'En cours',
                completed: 'Terminé',
                option1: 'Option 1',
                option2: 'Option 2',
            },
        },
        operators: {
            legal: 'est de type légal',
        },
        validFail: {
            formulaError: 'La plage de référence contient des données invisibles, veuillez réajuster la plage',
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
        date: {
            title: 'Date',
        },
        list: {
            title: 'Liste déroulante',
            add: 'Ajouter',
            options: 'Options',
            customOptions: 'Personnalisé',
            refOptions: 'D\'une plage',
            edit: 'Éditer',
        },
        checkbox: {
            title: 'Case à cocher',
            tips: 'Utiliser des valeurs personnalisées dans les cellules',
            checked: 'Valeur sélectionnée',
            unchecked: 'Valeur non sélectionnée',
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
        permission: {
            dialog: {
                setStyleErr: 'La plage est protégée, et vous n\'avez pas la permission de définir les styles. Pour définir les styles, veuillez contacter le créateur.',
            },
        },
    },
};

export default locale;
