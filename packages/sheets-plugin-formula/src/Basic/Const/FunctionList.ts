export interface FormulaParamType {
    /**
     * formula param name locale key
     */
    name?: string;
    /**
     * formula param detail description locale key
     */
    detail?: string;
    example?: string;
    require?: string;
    repeat?: string;
    type?: string;
}

export interface FormulaType {
    /**
     * formula name
     */
    n?: string;
    t?: number;
    /**
     * detail description locale key
     */
    d?: string;
    a?: string;
    m?: number[];
    /**
     * formula params locale key
     */
    p?: FormulaParamType[];
}

export const SelectCategoryType = [
    {
        locale: 'formula.formulaMore.Math',
    },
    {
        locale: 'formula.formulaMore.Statistical',
    },
    {
        locale: 'formula.formulaMore.Lookup',
    },
    {
        locale: 'formula.formulaMore.universheet',
    },
    {
        locale: 'formula.formulaMore.dataMining',
    },
    {
        locale: 'formula.formulaMore.Database',
    },
    {
        locale: 'formula.formulaMore.Date',
    },
    {
        locale: 'formula.formulaMore.Filter',
    },
    {
        locale: 'formula.formulaMore.Financial',
    },
    {
        locale: 'formula.formulaMore.Engineering',
    },
    {
        locale: 'formula.formulaMore.Logical',
    },
    {
        locale: 'formula.formulaMore.Operator',
    },
    {
        locale: 'formula.formulaMore.Text',
    },
    {
        locale: 'formula.formulaMore.Parser',
    },
    {
        locale: 'formula.formulaMore.Array',
    },
    {
        locale: 'formula.formulaMore.other',
    },
];

export const FunList: FormulaType[] = [
    {
        n: 'SUMIF',
        t: 0,
        d: 'formula.functionList.SUMIF.d',
        p: [
            {
                name: 'formula.functionList.SUMIF.p.range.name',
                detail: 'formula.functionList.SUMIF.p.range.detail',
                example: 'A1:A10',
            },
            {
                name: 'formula.functionList.SUMIF.p.rangeAll.name',
                detail: 'formula.functionList.SUMIF.p.rangeAll.detail',
                example: '">20"',
            },
            {
                name: 'formula.functionList.SUMIF.p.range1.name',
                detail: 'formula.functionList.SUMIF.p.range1.detail',
                example: 'B1:B10',
            },
        ],
    },
    {
        n: 'SUMIF1',
        t: 1,
        d: 'formula.functionList.SUMIF.d',
    },
    {
        n: 'SUMIF2',
        t: 2,
        d: 'formula.functionList.SUMIF.d',
    },
    {
        n: 'SUMIF3',
        t: 3,
        d: 'formula.functionList.SUMIF.d',
    },
    {
        n: 'SUMIF4',
        t: 4,
        d: 'formula.functionList.SUMIF.d',
    },
    {
        n: 'SUMIF5',
        t: 5,
        d: 'formula.functionList.SUMIF.d',
    },
    {
        n: 'SUMIF6',
        t: 6,
        d: 'formula.functionList.SUMIF.d',
    },
    {
        n: 'SUMIF7',
        t: 7,
        d: 'formula.functionList.SUMIF.d',
    },
];

// export { SelectCategoryType, FunList };

// export type { FunctionList, P };
