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
            'smart-toggle-filter-tooltip': 'Alterna el filtre',
            'clear-filter-criteria': 'Neteja les condicions del filtre',
            're-calc-filter-conditions': 'Recalcula les condicions del filtre',
        },
        command: {
            'not-valid-filter-range': 'L’interval seleccionat només té una fila i no és vàlid per filtrar.',
        },
        shortcut: {
            'smart-toggle-filter': 'Alterna el filtre',
        },
        panel: {
            'clear-filter': 'Neteja el filtre',
            cancel: 'Cancel·la',
            confirm: 'Confirma',
            'by-values': 'Per valors',
            'by-colors': 'Per colors',
            'filter-by-cell-fill-color': 'Filtra per color de fons de la cel·la',
            'filter-by-cell-text-color': 'Filtra per color de text de la cel·la',
            'filter-by-color-none': 'La columna només conté un color',
            'by-conditions': 'Per condicions',
            'filter-only': 'Només filtra',
            'search-placeholder': 'Utilitza espai per separar paraules clau',
            'select-all': 'Selecciona-ho tot',
            'input-values-placeholder': 'Introdueix valors',
            and: 'I',
            or: 'O',
            empty: '(buit)',
            '?': 'Utilitza “?” per representar un sol caràcter.',
            '*': 'Utilitza “*” per representar diversos caràcters.',
        },
        conditions: {
            none: 'Cap',
            empty: 'Està buit',
            'not-empty': 'No està buit',
            'text-contains': 'El text conté',
            'does-not-contain': 'El text no conté',
            'starts-with': 'El text comença amb',
            'ends-with': 'El text acaba amb',
            equals: 'El text és igual a',
            'greater-than': 'Més gran que',
            'greater-than-or-equal': 'Més gran o igual que',
            'less-than': 'Menys que',
            'less-than-or-equal': 'Menys o igual que',
            equal: 'Igual',
            'not-equal': 'No igual',
            between: 'Entre',
            'not-between': 'No entre',
            custom: 'Personalitzat',
        },
        msg: {
            'filter-header-forbidden': 'No pots moure la fila de capçalera d’un filtre.',
        },
        date: {
            1: 'Gener',
            2: 'Febrer',
            3: 'Març',
            4: 'Abril',
            5: 'Maig',
            6: 'Juny',
            7: 'Juliol',
            8: 'Agost',
            9: 'Setembre',
            10: 'Octubre',
            11: 'Novembre',
            12: 'Desembre',
        },
        sync: {
            title: 'El filtre és visible per a tothom',
            statusTips: {
                on: 'Un cop activat, tots els col·laboradors veuran els resultats del filtre',
                off: 'Un cop desactivat, només tu veuràs els resultats del filtre',
            },
            switchTips: {
                on: 'S’ha activat "El filtre és visible per a tothom", tots els col·laboradors veuran els resultats del filtre',
                off: 'S’ha desactivat "El filtre és visible per a tothom", només tu veuràs els resultats del filtre',
            },
        },
    },
};

export default locale;
