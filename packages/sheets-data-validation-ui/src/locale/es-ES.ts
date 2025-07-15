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
    dataValidation: {
        title: 'Validación de datos',
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
        operators: {
            between: 'entre',
            greaterThan: 'mayor que',
            greaterThanOrEqual: 'mayor o igual que',
            lessThan: 'menor que',
            lessThanOrEqual: 'menor o igual que',
            equal: 'igual',
            notEqual: 'no igual',
            notBetween: 'no entre',
            legal: 'es tipo legal',
        },
        ruleName: {
            between: 'Está entre {FORMULA1} y {FORMULA2}',
            greaterThan: 'Es mayor que {FORMULA1}',
            greaterThanOrEqual: 'Es mayor o igual que {FORMULA1}',
            lessThan: 'Es menor que {FORMULA1}',
            lessThanOrEqual: 'Es menor o igual que {FORMULA1}',
            equal: 'Es igual a {FORMULA1}',
            notEqual: 'No es igual a {FORMULA1}',
            notBetween: 'No está entre {FORMULA1} y {FORMULA2}',
            legal: 'Es un {TYPE} legal',
        },
        errorMsg: {
            between: 'El valor debe estar entre {FORMULA1} y {FORMULA2}',
            greaterThan: 'El valor debe ser mayor que {FORMULA1}',
            greaterThanOrEqual: 'El valor debe ser mayor o igual que {FORMULA1}',
            lessThan: 'El valor debe ser menor que {FORMULA1}',
            lessThanOrEqual: 'El valor debe ser menor o igual que {FORMULA1}',
            equal: 'El valor debe ser igual a {FORMULA1}',
            notEqual: 'El valor no debe ser igual a {FORMULA1}',
            notBetween: 'El valor no debe estar entre {FORMULA1} y {FORMULA2}',
            legal: 'El valor debe ser un {TYPE} legal',
        },
        any: {
            title: 'Cualquier valor',
            error: 'El contenido de esta celda viola la regla de validación',
        },
        date: {
            title: 'Fecha',
            operators: {
                between: 'entre',
                greaterThan: 'después de',
                greaterThanOrEqual: 'en o después de',
                lessThan: 'antes de',
                lessThanOrEqual: 'en o antes de',
                equal: 'igual',
                notEqual: 'no igual',
                notBetween: 'no entre',
                legal: 'es una fecha legal',
            },
            ruleName: {
                between: 'está entre {FORMULA1} y {FORMULA2}',
                greaterThan: 'es después de {FORMULA1}',
                greaterThanOrEqual: 'es en o después de {FORMULA1}',
                lessThan: 'es antes de {FORMULA1}',
                lessThanOrEqual: 'es en o antes de {FORMULA1}',
                equal: 'es {FORMULA1}',
                notEqual: 'no es {FORMULA1}',
                notBetween: 'no está entre {FORMULA1}',
                legal: 'es una fecha legal',
            },
            errorMsg: {
                between: 'El valor debe ser una fecha legal y estar entre {FORMULA1} y {FORMULA2}',
                greaterThan: 'El valor debe ser una fecha legal y después de {FORMULA1}',
                greaterThanOrEqual: 'El valor debe ser una fecha legal y en o después de {FORMULA1}',
                lessThan: 'El valor debe ser una fecha legal y antes de {FORMULA1}',
                lessThanOrEqual: 'El valor debe ser una fecha legal y en o antes de {FORMULA1}',
                equal: 'El valor debe ser una fecha legal y {FORMULA1}',
                notEqual: 'El valor debe ser una fecha legal y no {FORMULA1}',
                notBetween: 'El valor debe ser una fecha legal y no estar entre {FORMULA1}',
                legal: 'El valor debe ser una fecha legal',
            },
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
            errorMsg: {
                between: 'La longitud del texto debe estar entre {FORMULA1} y {FORMULA2}',
                greaterThan: 'La longitud del texto debe ser mayor que {FORMULA1}',
                greaterThanOrEqual: 'La longitud del texto debe ser mayor o igual que {FORMULA1}',
                lessThan: 'La longitud del texto debe ser menor que {FORMULA1}',
                lessThanOrEqual: 'La longitud del texto debe ser menor o igual que {FORMULA1}',
                equal: 'La longitud del texto debe ser {FORMULA1}',
                notEqual: 'La longitud del texto no debe ser {FORMULA1}',
                notBetween: 'La longitud del texto no debe estar entre {FORMULA1}',
            },
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
            ruleName: 'La fórmula personalizada es {FORMULA1}',
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
    },
};

export default locale;
