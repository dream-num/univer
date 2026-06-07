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
        title: 'Validación de datos',
        operators: {
            legal: 'es tipo legal',
        },
        validFail: {
            value: 'Por favor, introduce un valor',
            common: 'Por favor, introduce un valor o fórmula',
            number: 'Por favor, introduce un número o fórmula',
            formula: 'Por favor, introduce una fórmula',
            integer: 'Por favor, introduce un entero o fórmula',
            date: 'Por favor, introduce una fecha o fórmula',
            list: 'Por favor, introduce opciones',
            listInvalid: 'La fuente de la lista debe ser una lista delimitada o una referencia a una sola fila o columna',
            checkboxEqual: 'Introduce valores diferentes para los contenidos de celda marcados y desmarcados.',
            formulaError: 'El rango de referencia contiene datos invisibles, ajusta el rango',
            listIntersects: 'El rango seleccionado no puede cruzarse con el ámbito de las reglas',
            primitive: 'No se permiten fórmulas para valores personalizados marcados y desmarcados.',
        },
        panel: {
            title: 'Gestión de validación de datos',
            addTitle: 'Crear nueva validación de datos',
            removeAll: 'Eliminar todo',
            add: 'Añadir regla',
            range: 'Rangos',
            type: 'Tipo',
            options: 'Opciones avanzadas',
            operator: 'Operador',
            removeRule: 'Eliminar',
            done: 'Hecho',
            formulaPlaceholder: 'Por favor, introduce valor o fórmula',
            valuePlaceholder: 'Por favor, introduce valor',
            formulaAnd: 'y',
            invalid: 'Inválido',
            showWarning: 'Mostrar advertencia',
            rejectInput: 'Rechazar entrada',
            messageInfo: 'Mensaje de ayuda',
            showInfo: 'Mostrar texto de ayuda para la celda seleccionada',
            rangeError: 'Los rangos no son válidos',
            allowBlank: 'Permitir valores en blanco',
        },
        any: {
            title: 'Cualquier valor',
            error: 'El contenido de esta celda viola la regla de validación',
        },
        date: {
            title: 'Fecha',
        },
        list: {
            title: 'Desplegable',
            name: 'El valor contiene uno del rango',
            error: 'La entrada debe estar dentro del rango especificado',
            emptyError: 'Por favor, introduce un valor',
            add: 'Añadir',
            dropdown: 'Seleccionar',
            options: 'Opciones',
            customOptions: 'Personalizado',
            refOptions: 'De un rango',
            formulaError: 'La fuente de la lista debe ser una lista delimitada de datos o una referencia a una sola fila o columna.',
            edit: 'Editar',
        },
        listMultiple: {
            title: 'Desplegable-múltiple',
            dropdown: 'Selección múltiple',
        },
        textLength: {
            title: 'Longitud del texto',
        },
        decimal: {
            title: 'Número',
        },
        whole: {
            title: 'Entero',
        },
        checkbox: {
            title: 'Casilla de verificación',
            error: 'El contenido de esta celda viola su regla de validación',
            tips: 'Usa valores personalizados dentro de las celdas',
            checked: 'Valor seleccionado',
            unchecked: 'Valor no seleccionado',
        },
        custom: {
            title: 'Fórmula personalizada',
            error: 'El contenido de esta celda viola su regla de validación',
            validFail: 'Por favor, introduce una fórmula válida',
        },
        alert: {
            title: 'Error',
            ok: 'OK',
        },
        error: {
            title: 'Inválido:',
        },
        renderMode: {
            arrow: 'Flecha',
            chip: 'Chip',
            text: 'Texto plano',
            label: 'Estilo de visualización',
        },
        showTime: {
            label: 'Mostrar selector de hora',
        },
        permission: {
            dialog: {
                setStyleErr: 'El rango está protegido y no tienes permiso para establecer estilos. Para establecer estilos, contacta al creador.',
            },
        },
    },
};

export default locale;
