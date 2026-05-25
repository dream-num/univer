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
    'sheets-formula-ui': {
        shortcut: {
            'quick-sum': 'Suma rápida',
        },

        insert: {
            tooltip: 'Funciones',
            common: 'Funciones comunes',
        },
        prompt: {
            helpExample: 'EJEMPLO',
            helpAbstract: 'ACERCA DE',
            required: 'Obligatorio.',
            optional: 'Opcional.',
        },
        error: {
            title: 'Error',
            divByZero: 'Error de división por cero',
            name: 'Error de nombre no válido',
            value: 'Error en el valor',
            num: 'Error numérico',
            na: 'Error de valor no disponible',
            cycle: 'Error de referencia circular',
            ref: 'Error de referencia de celda no válida',
            spill: 'El rango de desbordamiento no está vacío',
            calc: 'Error de cálculo',
            error: 'Error',
            connect: 'Obteniendo datos',
            null: 'Error nulo',
        },

        functionType: {
            financial: 'Financiera',
            date: 'Fecha y hora',
            math: 'Matemáticas y trigonometría',
            statistical: 'Estadística',
            lookup: 'Búsqueda y referencia',
            database: 'Base de datos',
            text: 'Texto',
            logical: 'Lógica',
            information: 'Información',
            engineering: 'Ingeniería',
            cube: 'Cubo',
            compatibility: 'Compatibilidad',
            web: 'Web',
            array: 'Matriz',
            univer: 'Univer',
            user: 'Definida por el usuario',
            definedname: 'Nombre definido',
        },
        moreFunctions: {
            confirm: 'Confirmar',
            prev: 'Anterior',
            next: 'Siguiente',
            searchFunctionPlaceholder: 'Buscar función',
            allFunctions: 'Todas las funciones',
            syntax: 'SINTAXIS',
        },
        operation: {
            copyFormulaOnly: 'Copiar solo fórmula',
            pasteFormula: 'Pegar fórmula',
        },

        rangeSelector: {
            title: 'Selecciona un rango de datos',
            addAnotherRange: 'Agregar rango',
            buttonTooltip: 'Seleccionar rango de datos',
            placeHolder: 'Selecciona un rango o escribe.',
            confirm: 'Confirmar',
            cancel: 'Cancelar',
        },
    },
};

export default locale;
