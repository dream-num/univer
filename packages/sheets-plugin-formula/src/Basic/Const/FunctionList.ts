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
        label: 'formula.formulaMore.Math',
    },
    {
        label: 'formula.formulaMore.Statistical',
    },
    {
        label: 'formula.formulaMore.Lookup',
    },
    {
        label: 'formula.formulaMore.universheet',
    },
    {
        label: 'formula.formulaMore.dataMining',
    },
    {
        label: 'formula.formulaMore.Database',
    },
    {
        label: 'formula.formulaMore.Date',
    },
    {
        label: 'formula.formulaMore.Filter',
    },
    {
        label: 'formula.formulaMore.Financial',
    },
    {
        label: 'formula.formulaMore.Engineering',
    },
    {
        label: 'formula.formulaMore.Logical',
    },
    {
        label: 'formula.formulaMore.Operator',
    },
    {
        label: 'formula.formulaMore.Text',
    },
    {
        label: 'formula.formulaMore.Parser',
    },
    {
        label: 'formula.formulaMore.Array',
    },
    {
        label: 'formula.formulaMore.other',
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
        n: 'TAN',
        t: 0,
        d: 'formula.functionList.TAN.d',
        p: [
            {
                name: 'formula.functionList.TAN.p.rangeNumber.name',
                detail: 'formula.functionList.TAN.p.rangeNumber.detail',
            },
        ],
    },
    {
        n: 'SUMIF2',
        t: 2,
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
