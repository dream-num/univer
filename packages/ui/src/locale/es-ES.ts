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
import emojiLocale from './emoji-locale/es-ES.generated';

const locale: typeof enUS = {
    ui: {
        featureSearch: {
            title: 'Buscar funciones',
            placeholder: 'Escribe una función o nombre de menú...',
            empty: 'No se encontraron funciones disponibles',
            ribbon: 'Cinta',
            contextMenu: 'Menú contextual',
        },
        emojiPicker: {
            search: 'Buscar',
            random: 'Emoji aleatorio',
            recents: 'Recientes',
            emojis: 'Emojis',
            animals: 'Animales',
            food: 'Comida',
            activities: 'Actividades',
            places: 'Lugares',
            objects: 'Objetos',
            symbols: 'Símbolos',
            searchResults: 'Resultados de búsqueda',
            noResults: 'No se encontraron emojis',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: 'Matemáticas',
            greek: 'Griego',
            common: 'Comunes',
        },
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
            'not-supported': 'No se encontró esta fuente en el sistema, se utiliza la fuente predeterminada.',
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
        navigation: {
            back: 'Atrás',
            previous: 'Anterior',
            next: 'Siguiente',
        },
        sidebar: {
            panel: 'Panel lateral',
            resize: 'Cambiar el tamaño del panel lateral',
            close: 'Cerrar el panel lateral',
        },
        beforeClose: {
            title: 'Algunos cambios no se han guardado',
        },
        clipboard: {
            authentication: {
                title: 'Permiso denegado',
                content: 'Por favor, permite que Univer acceda a tu portapapeles.',
            },
        },
        rangeSelector: {
            cancel: 'Cancelar',
        },
        'global-shortcut': 'Atajo global',
        row: 'Fila',
        column: 'Columna',
    },
};

export default locale;
