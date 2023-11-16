import mathEnUS from './function-list/math/en-US';

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
            AVERAGE: {
                description: 'Returns the average (arithmetic mean) of the arguments.',
                abstract: 'Returns the average of the arguments.',
                functionParameter: {
                    number1: {
                        name: 'number1',
                        detail: 'The first number, cell reference, or range for which you want the average.',
                    },
                    number2: {
                        name: 'number2',
                        detail: 'Additional numbers, cell references or ranges for which you want the average, up to a maximum of 255.',
                    },
                },
            },
            ...mathEnUS,
        },
        formulaMore: {
            helpExample: 'EXAMPLE',
            helpAbstract: 'ABOUT',

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

            searchFunctionPlaceholder: 'Search function',
        },
        moreFunctions: {
            confirm: 'Confirm',
            prev: 'Previous',
            next: 'Next',
        },
    },
};
