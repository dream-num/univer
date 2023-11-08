import { IFormulaConfig } from '../models/formula-data.model';

export const DEFAULT_FORMULA_DATA_DEMO: IFormulaConfig = {
    formulaData: {
        'workbook-01': {
            'sheet-0003': {
                '11': {
                    '6': {
                        formula: '=E12*F12',
                        row: 11,
                        column: 6,
                        sheetId: 'sheet-0003',
                    },
                },
                '12': {
                    '6': {
                        formula: '=E13*F13',
                        row: 12,
                        column: 6,
                        sheetId: 'sheet-0003',
                    },
                },
                '13': {
                    '6': {
                        formula: '=LAMBDA(x,x+2)(E14)',
                        row: 13,
                        column: 6,
                        sheetId: 'sheet-0003',
                    },
                },
                '19': {
                    '6': {
                        formula: '=SUM(G12:G19)',
                        row: 19,
                        column: 6,
                        sheetId: 'sheet-0003',
                    },
                },
            },
        },
    },
};
