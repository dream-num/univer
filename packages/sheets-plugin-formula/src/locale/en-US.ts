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
            SUMIF: {
                aliasFunctionName: '33IF',
                description: 'Returns a conditional sum across a range.',
                abstract: 'A conditional sum across a range.',
                functionParameter: {
                    range: {
                        name: 'range',
                        detail: 'The range which is tested against `criterion`.',
                    },
                    criterion: {
                        name: 'criterion',
                        detail: 'The pattern or test to apply to `range`.',
                    },
                    sum_range: {
                        name: 'sum_range',
                        detail: 'The range to be summed, if different from `range`.',
                    },
                },
            },
            TAN: {
                description: 'Returns the tangent of an angle provided in radians.',
                abstract: 'Tangent of an angle provided in radians.',
                functionParameter: {
                    angle: {
                        name: 'angle',
                        detail: 'The angle to find the tangent of, in radians.',
                    },
                },
            },
            // TANH: {
            //     description: 'Returns the hyperbolic tangent of any real number.',
            //     abstract: 'Hyperbolic tangent of any real number.',
            //     functionParameter: {
            //         value: {
            //             name: 'value',
            //             detail: 'Any real value to calculate the hyperbolic tangent of.',
            //         },
            //     },
            // },
        },

        formulaMore: {
            helpExample: 'EXAMPLE',
            helpAbstract: 'ABOUT',
        },
    },
};
