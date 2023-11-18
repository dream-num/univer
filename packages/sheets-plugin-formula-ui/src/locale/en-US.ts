import arrayEnUS from './function-list/array/en-US';
import compatibilityEnUS from './function-list/compatibility/en-US';
import cubeEnUS from './function-list/cube/en-US';
import databaseEnUS from './function-list/database/en-US';
import dateEnUS from './function-list/date/en-US';
import engineeringEnUS from './function-list/engineering/en-US';
import financialEnUS from './function-list/financial/en-US';
import informationEnUS from './function-list/information/en-US';
import logicalEnUS from './function-list/logical/en-US';
import lookupEnUS from './function-list/lookup/en-US';
import mathEnUS from './function-list/math/en-US';
import statisticalEnUS from './function-list/statistical/en-US';
import textEnUS from './function-list/text/en-US';
import univerEnUS from './function-list/univer/en-US';
import webEnUS from './function-list/web/en-US';

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
            ...financialEnUS,
            ...dateEnUS,
            ...mathEnUS,
            ...statisticalEnUS,
            ...lookupEnUS,
            ...databaseEnUS,
            ...textEnUS,
            ...logicalEnUS,
            ...informationEnUS,
            ...engineeringEnUS,
            ...cubeEnUS,
            ...compatibilityEnUS,
            ...webEnUS,
            ...arrayEnUS,
            ...univerEnUS,
        },
        prompt: {
            helpExample: 'EXAMPLE',
            helpAbstract: 'ABOUT',
            required: 'Required.',
            optional: 'Optional.',
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
        },
        moreFunctions: {
            confirm: 'Confirm',
            prev: 'Previous',
            next: 'Next',
            searchFunctionPlaceholder: 'Search function',
            allFunctions: 'All Functions',
            syntax: 'SYNTAX',
        },
    },
};
