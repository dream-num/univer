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
        title: 'Validació de dades',
        ribbon: {
            setCheckbox: 'Defineix la casella de selecció',
            clearCheckbox: 'Esborra la casella de selecció',
            dropdownPresetTitle: 'Aplica una predefinició:',
            editDropdown: 'Edita les opcions',
            clearDropdown: 'Esborra el menú desplegable',
            dateTime: 'Data i hora',
            presets: {
                yes: 'Sí',
                no: 'No',
                notStarted: 'No iniciat',
                inProgress: 'En curs',
                completed: 'Completat',
                option1: 'Opció 1',
                option2: 'Opció 2',
            },
        },
        operators: {
            legal: 'és tipus legal',
        },
        validFail: {
            formulaError: 'L’interval de referència conté dades invisibles, ajusta l’interval',
        },
        panel: {
            title: 'Gestió de la validació de dades',
            addTitle: 'Crea una nova validació de dades',
            removeAll: 'Elimina-ho tot',
            add: 'Afegeix regla',
            range: 'Intervals',
            type: 'Tipus',
            options: 'Opcions avançades',
            operator: 'Operador',
            removeRule: 'Elimina',
            done: 'Fet',
            formulaPlaceholder: 'Si us plau, introdueix valor o fórmula',
            valuePlaceholder: 'Si us plau, introdueix valor',
            formulaAnd: 'i',
            invalid: 'Invàlid',
            showWarning: 'Mostra advertència',
            rejectInput: 'Rebutja l’entrada',
            messageInfo: 'Missatge d’ajuda',
            showInfo: 'Mostra text d’ajuda per a la cel·la seleccionada',
            rangeError: 'Els intervals no són vàlids',
            allowBlank: 'Permet valors en blanc',
        },
        date: {
            title: 'Data',
        },
        list: {
            title: 'Desplegable',
            add: 'Afegeix',
            options: 'Opcions',
            customOptions: 'Personalitzat',
            refOptions: 'D’un interval',
            edit: 'Edita',
        },
        checkbox: {
            title: 'Casella de selecció',
            tips: 'Utilitza valors personalitzats dins de les cel·les',
            checked: 'Valor seleccionat',
            unchecked: 'Valor no seleccionat',
        },
        alert: {
            title: 'Error',
            ok: 'OK',
        },
        error: {
            title: 'Invàlid:',
        },
        renderMode: {
            arrow: 'Fletxa',
            chip: 'Xip',
            text: 'Text pla',
            label: 'Estil de visualització',
        },
        showTime: {
            label: 'Mostra el selector d’hora',
        },
        permission: {
            dialog: {
                setStyleErr: 'L\'interval està protegit i no teniu permís per establir estils. Per establir estils, contacteu amb el creador.',
            },
        },
    },
};

export default locale;
