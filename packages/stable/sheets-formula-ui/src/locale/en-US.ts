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

import array from './function-list/array/en-US';
import compatibility from './function-list/compatibility/en-US';
import cube from './function-list/cube/en-US';
import database from './function-list/database/en-US';
import date from './function-list/date/en-US';
import engineering from './function-list/engineering/en-US';
import financial from './function-list/financial/en-US';
import information from './function-list/information/en-US';
import logical from './function-list/logical/en-US';
import lookup from './function-list/lookup/en-US';
import math from './function-list/math/en-US';
import statistical from './function-list/statistical/en-US';
import text from './function-list/text/en-US';
import univer from './function-list/univer/en-US';
import web from './function-list/web/en-US';

export default {
    formula: {
        insert: {
            tooltip: 'Functions',
            sum: 'SUM',
            average: 'AVERAGE',
            count: 'COUNT',
            max: 'MAX',
            min: 'MIN',
            more: 'More Functions...',
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
            helpExample: 'EXAMPLE',
            helpAbstract: 'ABOUT',
            required: 'Required.',
            optional: 'Optional.',
        },
        error: {
            title: 'Error',
            divByZero: 'Divide by zero error',
            name: 'Invalid name error',
            value: 'Error in value',
            num: 'Number error',
            na: 'Value not available error',
            cycle: 'Circular reference error',
            ref: 'Invalid cell reference error',
            spill: "Spill range isn't blank",
            calc: 'Calculation error',
            error: 'Error',
            connect: 'Getting data',
            null: 'Null Error',
        },

        functionType: {
            financial: 'Financial',
            date: 'Date & Time',
            math: 'Math & Trig',
            statistical: 'Statistical',
            lookup: 'Lookup & Reference',
            database: 'Database',
            text: 'Text',
            logical: 'Logical',
            information: 'Information',
            engineering: 'Engineering',
            cube: 'Cube',
            compatibility: 'Compatibility',
            web: 'Web',
            array: 'Array',
            univer: 'Univer',
            user: 'User Defined',
            definedname: 'Defined Name',
        },
        moreFunctions: {
            confirm: 'Confirm',
            prev: 'Previous',
            next: 'Next',
            searchFunctionPlaceholder: 'Search function',
            allFunctions: 'All Functions',
            syntax: 'SYNTAX',
        },
        operation: {
            pasteFormula: 'Paste Formula',
        },
    },
};
