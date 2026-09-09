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
        objectPermission: {
            operationDenied: 'Este contenido está protegido. No se permite esta acción.',
            remove: 'Eliminar protección',
            roleOwner: 'Propietario del archivo',
            roleEditor: 'Editor del archivo',
            selectedCount: 'Seleccionados: {0}',
            searchPeople: 'Buscar personas',
            noMatchingPeople: 'No hay personas que coincidan',
            loadMore: 'Cargar más',
            fileHint: 'El uso compartido del archivo determina los miembros. Estos ajustes limitan las acciones de esos miembros.',
            documentParent: 'Las restricciones de edición del documento también se aplican a esta sección.',
            paragraphParent: 'Las restricciones de edición del documento y de la sección que contiene este párrafo también se aplican.',
            documentObjectParent: 'El documento y las secciones y párrafos que contienen o anclan este objeto también pueden restringir su edición.',
            slideParent: 'Las restricciones de edición de la presentación también se aplican.',
            slideObjectParent: 'Las restricciones de edición de la presentación y de la diapositiva o patrón que contiene este objeto también se aplican.',
            baseParent: 'Las restricciones de edición de Base también se aplican.',
            baseObjectParent: 'Las restricciones de edición de Base y de la tabla que contiene este objeto también se aplican.',
            recordParent: 'Las restricciones de Base y de la tabla siguen aplicándose. Editar un valor también requiere permiso para su campo.',
            boardParent: 'Las restricciones de edición de la pizarra también se aplican a este objeto.',
            ownerInherit: 'Propietario del archivo, acceso heredado',
            peopleError: 'No se pudieron cargar las personas. Vuelve a intentarlo.',
            document: 'Documento',
            section: 'Sección',
            paragraph: 'Párrafo',
            entity: 'Objeto',
            presentation: 'Presentación',
            page: 'Diapositiva',
            master: 'Vista de patrón',
            base: 'Base',
            table: 'Tabla',
            field: 'Campo',
            record: 'Registro',
            view: 'Vista',
            board: 'Pizarra',
            objectName: '{0}: {1}',

            search: 'Buscar objetos',
            empty: 'No hay objetos que coincidan',
            more: 'Se muestran los primeros 100 objetos. Usa la búsqueda para acotar la lista.',
            title: 'Permisos',
            cancel: 'Cancelar',
            save: 'Guardar',
            saving: 'Guardando…',
            loading: 'Cargando…',
            conflict: 'Los permisos han cambiado. Vuelve a cargar antes de guardar.',
            error: 'No se pudieron cargar o guardar los permisos. Se han conservado tus cambios.',
            reload: 'Volver a cargar',
            denied: 'No puedes gestionar los permisos de este objeto.',
            edit: 'Quién puede editar',
            all: 'Todos los editores del archivo',
            owner: 'Solo el propietario del objeto',
            members: 'Miembros seleccionados',
            copy: 'Permitir que los editores copien',
            print: 'Permitir que los editores impriman',
            export: 'Permitir que los editores exporten',
            comment: 'Permitir que los editores comenten',
            parentHint: 'Las restricciones del archivo y del objeto superior siguen aplicándose.',
        },
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
