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
            right: 'Elegir color',
        },
        fillColor: {
            main: 'Color de fondo de texto',
            right: 'Elegir color',
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
    doc: {
        menu: {
            paragraphSetting: 'Configuración de párrafo',
        },
        slider: {
            paragraphSetting: 'Configuración de párrafo',
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
            fixedValue: 'Valor fijo (px)',
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
    'page-settings': {
        'document-setting': 'Configuración de documento',
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
};

export default locale;
