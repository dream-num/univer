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
        operators: {
            legal: 'és tipus legal',
        },
        validFail: {
            value: 'Si us plau, introdueix un valor',
            common: 'Si us plau, introdueix un valor o una fórmula',
            number: 'Si us plau, introdueix un número o una fórmula',
            formula: 'Si us plau, introdueix una fórmula',
            integer: 'Si us plau, introdueix un enter o una fórmula',
            date: 'Si us plau, introdueix una data o una fórmula',
            list: 'Si us plau, introdueix opcions',
            listInvalid: 'La font de la llista ha de ser una llista delimitada o una referència a una sola fila o columna',
            checkboxEqual: 'Introdueix valors diferents per als continguts de cel·la marcats i desmarcats.',
            formulaError: 'L’interval de referència conté dades invisibles, ajusta l’interval',
            listIntersects: 'L’interval seleccionat no pot creuar-se amb l’àmbit de les regles',
            primitive: 'No es permeten fórmules per a valors personalitzats marcats i desmarcats.',
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
        any: {
            title: 'Qualsevol valor',
            error: 'El contingut d’aquesta cel·la incompleix la regla de validació',
        },
        date: {
            title: 'Data',
        },
        list: {
            title: 'Desplegable',
            name: 'El valor conté un del rang',
            error: 'L’entrada ha d’estar dins del rang especificat',
            emptyError: 'Si us plau, introdueix un valor',
            add: 'Afegeix',
            dropdown: 'Selecciona',
            options: 'Opcions',
            customOptions: 'Personalitzat',
            refOptions: 'D’un interval',
            formulaError: 'La font de la llista ha de ser una llista delimitada de dades o una referència a una sola fila o columna.',
            edit: 'Edita',
        },
        listMultiple: {
            title: 'Desplegable-múltiple',
            dropdown: 'Selecció múltiple',
        },
        textLength: {
            title: 'Longitud del text',
        },
        decimal: {
            title: 'Número',
        },
        whole: {
            title: 'Enter',
        },
        checkbox: {
            title: 'Casella de selecció',
            error: 'El contingut d’aquesta cel·la incompleix la seva regla de validació',
            tips: 'Utilitza valors personalitzats dins de les cel·les',
            checked: 'Valor seleccionat',
            unchecked: 'Valor no seleccionat',
        },
        custom: {
            title: 'Fórmula personalitzada',
            error: 'El contingut d’aquesta cel·la incompleix la seva regla de validació',
            validFail: 'Si us plau, introdueix una fórmula vàlida',
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
