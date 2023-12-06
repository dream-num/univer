export const MENU_OPTIONS: Array<{ label: string; pattern: string | null } | '|'> = [
    {
        label: 'sheet.numfmt.general',
        pattern: null,
    },
    {
        label: 'sheet.numfmt.text',
        pattern: '@@@',
    },
    '|',
    {
        label: 'sheet.numfmt.number',
        pattern: '0',
    },
    '|',
    {
        label: 'sheet.numfmt.accounting',
        pattern: '"¥" #,##0.00_);[Red]("¥"#,##0.00)',
    },
    {
        label: 'sheet.numfmt.financialValue',
        pattern: '#,##0.00;[Red]#,##0.00',
    },
    {
        label: 'sheet.numfmt.currency',
        pattern: '"¥"#,##0.00_);[Red]("¥"#,##0.00)',
    },
    {
        label: 'sheet.numfmt.roundingCurrency',
        pattern: '"¥"#,##0;[Red]"¥"#,##0',
    },
    '|',
    {
        label: 'sheet.numfmt.date',
        pattern: 'yyyy-mm-dd;@',
    },
    {
        label: 'sheet.numfmt.time',
        pattern: 'am/pm h":"mm":"ss',
    },
    {
        label: 'sheet.numfmt.dateTime',
        pattern: 'yyyy-m-d am/pm h:mm',
    },
    {
        label: 'sheet.numfmt.timeDuration',
        pattern: 'h:mm:ss',
    },
    '|',
    {
        label: 'sheet.numfmt.moreFmt',
        pattern: '',
    },
];
