interface P {
    name?: string;
    detail?: string;
    example?: string;
    require?: string;
    repeat?: string;
    type?: string;
}
interface FunctionList {
    n?: string;
    t?: number;
    d?: string;
    dLocale?: string;
    a?: string;
    m?: number[];
    p?: P[];
}

const SelectCategoryType = [
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

const FunList = [
    {
        n: 'SUMIF',
        t: 0,
        dLocale: 'formula.functionList.SUMIF.d',
        p: [
            {
                nameLocale: 'formula.functionList.SUMIF.p.range.name',
                detailLocale: 'formula.functionList.SUMIF.p.range.detail',
                example: 'A1:A10',
            },
            {
                nameLocale: 'formula.functionList.SUMIF.p.rangeAll.name',
                detailLocale: 'formula.functionList.SUMIF.p.rangeAll.detail',
                example: '">20"',
            },
            {
                nameLocale: 'formula.functionList.SUMIF.p.range1.name',
                detailLocale: 'formula.functionList.SUMIF.p.range1.detail',
                example: 'B1:B10',
            },
        ],
    },
    {
        n: 'SUMIF1',
        t: 1,
        dLocale: 'formula.functionList.SUMIF.d',
    },
    {
        n: 'SUMIF2',
        t: 2,
        dLocale: 'formula.functionList.SUMIF.d',
    },
    {
        n: 'SUMIF3',
        t: 3,
        dLocale: 'formula.functionList.SUMIF.d',
    },
    {
        n: 'SUMIF4',
        t: 4,
        dLocale: 'formula.functionList.SUMIF.d',
    },
    {
        n: 'SUMIF5',
        t: 5,
        dLocale: 'formula.functionList.SUMIF.d',
    },
    {
        n: 'SUMIF6',
        t: 6,
        dLocale: 'formula.functionList.SUMIF.d',
    },
    {
        n: 'SUMIF7',
        t: 7,
        dLocale: 'formula.functionList.SUMIF.d',
    },
];

export { SelectCategoryType, FunList };

export type { FunctionList, P };
