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
            title: 'Título',
            subTitle: 'Subtítulo',
            1: 'Encabezado 1',
            2: 'Encabezado 2',
            3: 'Encabezado 3',
            4: 'Encabezado 4',
            5: 'Encabezado 5',
            6: 'Encabezado 6',
            tooltip: 'Establecer encabezado',
        },
    },
    ribbon: {
        start: 'Inicio',
        startDesc: 'Inicia la hoja de cálculo y establece los parámetros básicos.',
        insert: 'Insertar',
        insertDesc: 'Inserta filas, columnas, gráficos y otros elementos.',
        formulas: 'Fórmulas',
        formulasDesc: 'Utiliza funciones y fórmulas para cálculos de datos.',
        data: 'Datos',
        dataDesc: 'Gestiona los datos, incluyendo importación, ordenación y filtrado.',
        view: 'Vista',
        viewDesc: 'Cambia los modos de vista y ajusta el efecto de visualización.',
        others: 'Otros',
        othersDesc: 'Otras funciones y configuraciones.',
        more: 'Más',
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
        title: 'Atajos',
    },
    shortcut: {
        undo: 'Deshacer',
        redo: 'Rehacer',
        cut: 'Cortar',
        copy: 'Copiar',
        paste: 'Pegar',
        'shortcut-panel': 'Alternar panel de atajos',
    },
    'common-edit': 'Atajos de edición comunes',
    'toggle-shortcut-panel': 'Alternar panel de atajos',
    clipboard: {
        authentication: {
            title: 'Permiso denegado',
            content: 'Por favor, permite que Univer acceda a tu portapapeles.',
        },
    },
    textEditor: {
        formulaError: 'Por favor, introduce una fórmula válida, como =SUMA(A1)',
        rangeError: 'Por favor, introduce un rango válido, como A1:B10',
    },
    rangeSelector: {
        title: 'Selecciona un rango de datos',
        addAnotherRange: 'Agregar rango',
        buttonTooltip: 'Seleccionar rango de datos',
        placeHolder: 'Selecciona un rango o escribe.',
        confirm: 'Confirmar',
        cancel: 'Cancelar',
    },
    'global-shortcut': 'Atajo global',
    'zoom-slider': {
        resetTo: 'Restablecer a',
    },
};

export default locale;
