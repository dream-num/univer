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
                d: 'Returns a conditional sum across a range.',
                a: 'A conditional sum across a range.',
                p: {
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
                d: 'Returns the tangent of an angle provided in radians.',
                a: 'Tangent of an angle provided in radians.',
                p: {
                    angle: {
                        name: 'angle',
                        detail: 'The angle to find the tangent of, in radians.',
                    },
                },
            },
            TANH: {
                d: 'Returns the hyperbolic tangent of any real number.',
                a: 'Hyperbolic tangent of any real number.',
                p: {
                    value: {
                        name: 'value',
                        detail: 'Any real value to calculate the hyperbolic tangent of.',
                    },
                },
            },
        },
    },
};
