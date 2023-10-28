export default {
    formula: {
        formulaLabel: 'SUM',
        formulaRightLabel: 'more formule',
        ok: 'Ok',
        cancel: 'Cancel',
        clearValidation: 'Clear Validation',
        formula: {
            sum: 'sum',
            average: 'average',
            count: 'count',
            max: 'max',
            min: 'min',
            if: 'If formula generator',
            more: 'More functions...',
        },
        functionList: {
            SUMIF: {
                d: 'Returns a conditional sum across a range.',
                p: {
                    range: {
                        name: 'range',
                        detail: 'The range which is tested against `criterion`.',
                    },
                    rangeAll: {
                        name: 'criterion',
                        detail: 'The pattern or test to apply to `range`.',
                    },
                    range1: {
                        name: 'sum_range',
                        detail: 'The range to be summed, if different from `range`.',
                    },
                },
            },
            TAN: {
                d: 'Returns the tangent of an angle provided in radians.',
                p: {
                    rangeNumber: {
                        name: 'angle',
                        detail: 'The angle to find the tangent of, in radians.',
                    },
                },
            },
            TANH: {
                d: 'Returns the hyperbolic tangent of any real number.',
                p: {
                    rangeNumber: {
                        name: 'value',
                        detail: 'Any real value to calculate the hyperbolic tangent of.',
                    },
                },
            },
            CEILING: {
                d: 'Rounds a number up to the nearest integer multiple of specified significance `factor`.',
                p: {
                    rangeNumber: {
                        name: 'value',
                        detail: 'The value to round up to the nearest integer multiple of `factor`.',
                    },
                    rangeNumber1: {
                        name: 'factor',
                        detail: 'The number to whose multiples `value` will be rounded.',
                    },
                },
            },
            ATAN: {
                d: 'Returns the inverse tangent of a value, in radians.',
                p: {
                    rangeNumber: {
                        name: 'value',
                        detail: 'The value for which to calculate the inverse tangent.',
                    },
                },
            },
            ASINH: {
                d: 'Returns the inverse hyperbolic sine of a number.',
                p: {
                    rangeNumber: {
                        name: 'value',
                        detail: 'The value for which to calculate the inverse hyperbolic sine.',
                    },
                },
            },
            ABS: {
                d: 'Returns the absolute value of a number.',
                p: {
                    rangeNumber: {
                        name: 'value',
                        detail: 'The number of which to return the absolute value.',
                    },
                },
            },
            COUNTBLANK: {
                d: 'Returns the number of empty values in a list of values and ranges.',
                p: {
                    range: {
                        name: 'value1',
                        detail: 'The first value or range in which to count the number of blanks.',
                    },
                },
            },
            COSH: {
                d: 'Returns the hyperbolic cosine of any real number.',
                p: {
                    rangeNumber: {
                        name: 'value',
                        detail: 'Any real value to calculate the hyperbolic cosine of.',
                    },
                },
            },
            COUNTIF: {
                d: 'Returns a conditional count across a range.',
                p: {
                    range: {
                        name: 'range',
                        detail: 'The range that is tested against `criterion`.',
                    },
                    rangeAll: {
                        name: 'criterion',
                        detail: 'The pattern or test to apply to `range`.',
                    },
                },
            },
            ERFC: {
                d: 'Returns the complementary Gauss error function of a value.',
                p: {
                    rangeNumber: {
                        name: 'z',
                        detail: 'The number for which to calculate the complementary Gauss error function.',
                    },
                },
            },
            VLOOKUP: {
                d: 'Vertical lookup. Searches down the first column of a range for a key and returns the value of a specified cell in the row found.',
                p: {
                    rangeAll: {
                        name: 'search_key',
                        detail: 'The value to search for. For example, `42`, `"Cats"`, or `I24`.',
                    },
                    rangeAll1: {
                        name: 'range',
                        detail: 'The range to consider for the search. The first column in the range is searched for the key specified in `search_key`. ',
                    },
                    rangeNumber: {
                        name: 'index',
                        detail: 'The column index of the value to be returned, where the first column in `range` is numbered 1.',
                    },
                    rangeAll2: {
                        name: 'is_sorted',
                        detail: 'Indicates whether the column to be searched (the first column of the specified range) is sorted, in which case the closest match for `search_key` will be returned.',
                    },
                },
            },
            TIME: {
                d: 'Converts a provided hour, minute, and second into a time.',
                p: {
                    rangeNumber: {
                        name: 'hour',
                        detail: '0The hour component of the time.',
                    },
                    rangeNumber1: {
                        name: 'minute',
                        detail: 'The minute component of the time.',
                    },
                    rangeNumber2: {
                        name: 'second',
                        detail: 'The second component of the time.',
                    },
                },
            },
            EFFECT: {
                d: 'Calculates the annual effective interest rate given the nominal rate and number of compounding periods per year.',
                p: {
                    rangeNumber: {
                        name: 'nominal_rate',
                        detail: 'The nominal interest rate per year.',
                    },
                    rangeNumber1: {
                        name: 'periods_per_year',
                        detail: 'The number of compounding periods per year.',
                    },
                },
            },
            BIN2DEC: {
                d: 'Converts a signed binary number to decimal format.',
                p: {
                    rangeAll: {
                        name: 'signed_binary_number',
                        detail: 'The signed 10-bit binary value to be converted to decimal, provided as a string.',
                    },
                },
            },
            TRUE: {
                d: 'Returns the logical value `TRUE`.',
            },
            NE: {
                d: 'Returns `TRUE` if two specified values are not equal and `FALSE` otherwise. Equivalent to the `!=` operator.',
                p: {
                    rangeAll: {
                        name: 'value1',
                        detail: 'The first value.',
                    },
                    rangeAll1: {
                        name: 'value2',
                        detail: 'The value to test against `value1` for inequality.',
                    },
                },
            },
            SEX_BY_IDCARD: {
                d: 'Calculate gender based on Chinese ID number. Support 15 or 18',
                p: {
                    rangeAll: {
                        name: 'ID number',
                        detail: '15-digit or 18-digit ID number or range.',
                    },
                },
            },
        },
        functiontype: {
            '0': 'Math',
            '1': 'Statistical',
            '2': 'Lookup',
            '3': 'UniverSheet',
            '4': 'Data Mining',
            '5': 'Database',
            '6': 'Date',
            '7': 'Filter',
            '8': 'Financial',
            '9': 'Engineering',
            '10': 'Logical',
            '11': 'Operator',
            '12': 'Text',
            '13': 'Parser',
            '14': 'Array',
            '15': 'Other',
        },
        formulaMore: {
            valueTitle: 'Value',
            tipSelectDataRange: 'Select data range',
            tipDataRangeTitle: 'Data range',
            findFunctionTitle: 'Search function',
            tipInputFunctionName: 'Function name or brief description of function',
            whole: 'Whole',

            Math: 'Math',
            Statistical: 'Statistical',
            Lookup: 'Lookup',
            universheet: 'UniverSheet',
            dataMining: 'Data Mining',
            Database: 'Database',
            Date: 'Date',
            Filter: 'Filter',
            Financial: 'Financial',
            Engineering: 'Engineering',
            Logical: 'Logical',
            Operator: 'Operator',
            Text: 'Text',
            Parser: 'Parser',
            Array: 'Array',
            other: 'Other',

            selectFunctionTitle: 'Select a function',
            calculationResult: 'Result',

            tipSuccessText: 'Success',
            tipParamErrorText: 'Parameter type error',

            helpClose: 'Close',
            helpCollapse: 'Collapse',
            helpExample: 'Example',
            helpAbstract: 'Abstract',

            execfunctionError: 'Error in the formula',
            execfunctionSelfError: 'The formula cannot refer to its own cell',
            execfunctionSelfErrorResult:
                'The formula cannot refer to its own cell, which will lead to inaccurate calculation results',

            allowRepeatText: 'Repeat',
            allowOptionText: 'Option',

            selectCategory: 'Or select a category',
        },
        ifFormula: {
            tipNotBelongToIf: 'This cell function does not belong to the if formula!',
            tipSelectCell: 'Please select the cell to insert the function',

            ifGenCompareValueTitle: 'Comparison value',
            ifGenSelectCellTitle: 'Click to select cell',
            ifGenRangeTitle: 'Range',
            ifGenRangeTo: 'to',
            ifGenRangeEvaluate: 'Range evaluate',
            ifGenSelectRangeTitle: 'Click to select range',
            ifGenCutWay: 'Partition way',
            ifGenCutSame: 'Same Partition value',
            ifGenCutNpiece: 'Partition by N',
            ifGenCutCustom: 'Custom',
            ifGenCutConfirm: 'Confirm',

            ifGenTipSelectCell: 'Select cells',
            ifGenTipSelectCellPlace: 'Please select cells',

            ifGenTipSelectRange: 'Select range',
            ifGenTipSelectRangePlace: 'Please select range',

            ifGenTipNotNullValue: 'The comparison value cannot be empty!',
            ifGenTipLableTitile: 'Label',
            ifGenTipRangeNotforNull: 'The range cannot be empty!',
            ifGenTipCutValueNotforNull: 'The partition value cannot be empty!',
            ifGenTipNotGenCondition: 'No conditions are available for generation!',
        },
    },
};
