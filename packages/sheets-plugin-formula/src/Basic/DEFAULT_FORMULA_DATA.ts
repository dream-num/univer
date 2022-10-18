import { IFormulaConfig } from './IFormula';

export const DEFAULT_FORMULA_DATA: IFormulaConfig = {
    formulaData: {
        'sheet-01': {
            '12': {
                '3': {
                    fs: '=SUM(F1, G8)',
                    row: 11,
                    column: 3,
                    sheetId: 'sheet-01',
                },
            },
            '13': {
                '3': {
                    fs: '=SUM(A3:G4)',
                    row: 11,
                    column: 3,
                    sheetId: 'sheet-01',
                },
            },
            '14': {
                '3': {
                    fs: '=AVERAGE(I10, M16)',
                    row: 11,
                    column: 3,
                    sheetId: 'sheet-01',
                },
            },
        },
    },
};
