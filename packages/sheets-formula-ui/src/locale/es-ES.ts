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
import array from './function-list/array/es-ES';
import compatibility from './function-list/compatibility/es-ES';
import cube from './function-list/cube/es-ES';
import database from './function-list/database/es-ES';
import date from './function-list/date/es-ES';
import engineering from './function-list/engineering/es-ES';
import financial from './function-list/financial/es-ES';
import information from './function-list/information/es-ES';
import logical from './function-list/logical/es-ES';
import lookup from './function-list/lookup/es-ES';
import math from './function-list/math/es-ES';
import statistical from './function-list/statistical/es-ES';
import text from './function-list/text/es-ES';
import univer from './function-list/univer/es-ES';
import web from './function-list/web/es-ES';

const locale: typeof enUS = {
    shortcut: {
        'sheets-formula-ui': {
            'quick-sum': 'Suma rápida',
        },
    },
    formula: {
        insert: {
            tooltip: 'Funciones',
            sum: 'SUMA',
            average: 'PROMEDIO',
            count: 'CONTAR',
            max: 'MÁX',
            min: 'MÍN',
            more: 'Más funciones...',
        },
        functionList: {
            ...financial,
            ...date,
            ...math,
            ...statistical,
            ...lookup,
            ...database,
            ...text,
            ...logical,
            ...information,
            ...engineering,
            ...cube,
            ...compatibility,
            ...web,
            ...array,
            ...univer,
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
            pasteFormula: 'Pegar fórmula',
        },
    },
};

export default locale;
