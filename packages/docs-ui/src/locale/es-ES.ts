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
    'docs-ui': {
        toolbar: {
            undo: 'Deshacer',
            redo: 'Rehacer',
            font: 'Fuente',
            fontSize: 'Tamaño de fuente',
            bold: 'Negrita',
            italic: 'Cursiva',
            strikethrough: 'Tachado',
            subscript: 'Subíndice',
            superscript: 'Superíndice',
            underline: 'Subrayado',
            textColor: {
                main: 'Color de texto',
            },
            fillColor: {
                main: 'Color de fondo de texto',
            },
            table: {
                main: 'Tabla',
                insert: 'Insertar tabla',
                colCount: 'Número de columnas',
                rowCount: 'Número de filas',
            },
            resetColor: 'Restablecer',
            order: 'Lista ordenada',
            unorder: 'Lista desordenada',
            checklist: 'Lista de tareas',
            documentFlavor: 'Modo moderno',
            alignLeft: 'Alinear a la izquierda',
            alignCenter: 'Centrar',
            alignRight: 'Alinear a la derecha',
            alignJustify: 'Justificar',
            horizontalLine: 'Línea horizontal',
            headerFooter: 'Encabezado y pie de página',
            pageSetup: 'Configuración de página',
            heading: {
                tooltip: 'Heading',
                normal: 'Normal text',
                leading1: 'Heading 1',
                leading2: 'Heading 2',
                leading3: 'Heading 3',
                leading4: 'Heading 4',
                leading5: 'Heading 5',
                title: 'Title',
                subTitle: 'Subtitle',
            },
        },
        table: {
            insert: 'Insertar',
            insertRowAbove: 'Insertar fila arriba',
            insertRowBelow: 'Insertar fila abajo',
            insertColumnLeft: 'Insertar columna a la izquierda',
            insertColumnRight: 'Insertar columna a la derecha',
            delete: 'Eliminar tabla',
            deleteRows: 'Eliminar fila',
            deleteColumns: 'Eliminar columna',
            deleteTable: 'Eliminar tabla',
        },
        headerFooter: {
            linkToPrevious: 'Link to previous',
            header: 'Encabezado',
            footer: 'Pie de página',
            panel: 'Configuración de encabezado y pie de página',
            firstPageCheckBox: 'Primera página diferente',
            oddEvenCheckBox: 'Páginas impares y pares diferentes',
            headerTopMargin: 'Margen superior del encabezado (px)',
            footerBottomMargin: 'Margen inferior del pie de página (px)',
            closeHeaderFooter: 'Cerrar encabezado y pie de página',
            disableText: 'La configuración de encabezado y pie de página está deshabilitada',
        },
        placeholder: {
            heading1: 'Título 1',
            heading2: 'Título 2',
            heading3: 'Título 3',
            heading4: 'Título 4',
            heading5: 'Título 5',
            normalText: 'Escribe texto o pulsa "/" para ver los comandos',
            listItem: 'Elemento',
        },
        doc: {
            blockMenu: {
                dragBlock: 'Arrastrar bloque',
            },

            menu: {
                paragraphSetting: 'Configuración de párrafo',
                sectionSetting: 'Section Settings',
            },
            slider: {
                paragraphSetting: 'Configuración de párrafo',
                sectionSetting: 'Section Settings',
            },
            paragraphSetting: {
                alignment: 'Alineación',
                indentation: 'Sangría',
                left: 'Izquierda',
                right: 'Derecha',
                firstLine: 'Primera línea',
                hanging: 'Colgante',
                spacing: 'Espaciado',
                before: 'Antes',
                after: 'Después',
                lineSpace: 'Espacio entre líneas',
                multiSpace: 'Espacio múltiple',
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: 'Valor fijo (px)',
            },
            sectionSetting: {
                selectedSections: '{0} sections selected',
                columnCount: 'Column count',
                columnGap: 'Column gap',
                columnSeparator: 'Separator',
                none: 'None',
                betweenColumns: 'Between columns',
                sectionStart: 'Section start',
                unspecified: 'Unspecified',
                continuous: 'Continuous',
                nextPage: 'Next page',
                evenPage: 'Even page',
                oddPage: 'Odd page',
            },
        },
        rightClick: {
            copy: 'Copiar',
            cut: 'Cortar',
            paste: 'Pegar',
            delete: 'Eliminar',
            bulletList: 'Lista de viñetas',
            orderList: 'Lista ordenada',
            checkList: 'Lista de tareas',
            insertBellow: 'Insertar debajo',
        },
        paragraphMenu: {
            alignAndIndent: 'Alineación y sangría',
            align: 'Alineación',
            indent: 'Sangría',
            color: 'Colores',
            increase: 'Aumentar',
            decrease: 'Disminuir',
            increaseIndent: 'Aumentar sangría',
            decreaseIndent: 'Disminuir sangría',
            defaultTextColor: 'Color de texto predeterminado',
            noBackground: 'Sin fondo',
        },
        'page-settings': {
            'document-setting': 'Configuración de documento',
            mode: 'Modo',
            'modern-mode': 'Moderno',
            'classic-mode': 'Clásico',
            'modern-width': 'Ancho del contenido',
            'modern-width-narrow': 'Estrecho',
            'modern-width-medium': 'Medio',
            'modern-width-wide': 'Ancho',
            'paper-size': 'Tamaño de papel',
            'page-size': {
                main: 'Tamaño de papel',
                a4: 'A4',
                a3: 'A3',
                a5: 'A5',
                b4: 'B4',
                b5: 'B5',
                letter: 'Carta',
                legal: 'Legal',
                tabloid: 'Tabloide',
                statement: 'Declaración',
                executive: 'Ejecutivo',
                folio: 'Folio',
            },
            orientation: 'Orientación',
            portrait: 'Vertical',
            landscape: 'Horizontal',
            'custom-paper-size': 'Tamaño de papel personalizado',
            top: 'Superior',
            bottom: 'Inferior',
            left: 'Izquierda',
            right: 'Derecha',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
        },
    },
};

export default locale;
