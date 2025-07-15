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
    toolbar: {
        heading: {
            normal: 'Normal',
            title: 'Títol',
            subTitle: 'Subtítol',
            1: 'Encapçalament 1',
            2: 'Encapçalament 2',
            3: 'Encapçalament 3',
            4: 'Encapçalament 4',
            5: 'Encapçalament 5',
            6: 'Encapçalament 6',
            tooltip: 'Estableix l\'encapçalament',
        },
    },
    ribbon: {
        start: 'Inici',
        startDesc: 'Inicia el full de càlcul i estableix els paràmetres bàsics.',
        insert: 'Insereix',
        insertDesc: 'Insereix files, columnes, gràfics i altres elements.',
        formulas: 'Fórmules',
        formulasDesc: 'Utilitza funcions i fórmules per a càlculs de dades.',
        data: 'Dades',
        dataDesc: 'Gestiona les dades, incloent importació, ordenació i filtratge.',
        view: 'Vista',
        viewDesc: 'Canvia els modes de vista i ajusta l\'efecte de visualització.',
        others: 'Altres',
        othersDesc: 'Altres funcions i configuracions.',
        more: 'Més',
    },
    fontFamily: {
        TimesNewRoman: 'Times New Roman',
        Arial: 'Arial',
        Tahoma: 'Tahoma',
        Verdana: 'Verdana',
        MicrosoftYaHei: 'Microsoft YaHei',
        SimSun: 'SimSun',
        SimHei: 'SimHei',
        Kaiti: 'Kaiti',
        FangSong: 'FangSong',
        NSimSun: 'NSimSun',
        STXinwei: 'STXinwei',
        STXingkai: 'STXingkai',
        STLiti: 'STLiti',
        HanaleiFill: 'HanaleiFill',
        Anton: 'Anton',
        Pacifico: 'Pacifico',
    },
    'shortcut-panel': {
        title: 'Dreceres',
    },
    shortcut: {
        undo: 'Desfer',
        redo: 'Refer',
        cut: 'Retalla',
        copy: 'Copia',
        paste: 'Enganxa',
        'shortcut-panel': 'Alterna el panell de dreceres',
    },
    'common-edit': 'Dreceres d\'edició comunes',
    'toggle-shortcut-panel': 'Alterna el panell de dreceres',
    clipboard: {
        authentication: {
            title: 'Permís denegat',
            content: 'Si us plau, permet que Univer accedeixi al teu porta-retalls.',
        },
    },
    textEditor: {
        formulaError: 'Si us plau, introdueix una fórmula vàlida, com ara =SUMA(A1)',
        rangeError: 'Si us plau, introdueix un interval vàlid, com ara A1:B10',
    },
    rangeSelector: {
        title: 'Selecciona un interval de dades',
        addAnotherRange: 'Afegeix interval',
        buttonTooltip: 'Selecciona interval de dades',
        placeHolder: 'Selecciona un interval o escriu.',
        confirm: 'Confirma',
        cancel: 'Cancel·la',
    },
    'global-shortcut': 'Drecera global',
    'zoom-slider': {
        resetTo: 'Restableix a',
    },
};

export default locale;
