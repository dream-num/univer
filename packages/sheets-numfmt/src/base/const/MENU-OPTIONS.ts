export const MENU_OPTIONS: Array<{ label: string; pattern: string | null } | '|'> = [
    {
        label: '常规',
        pattern: null,
    },
    {
        label: '文本',
        pattern: '@@@',
    },
    '|',
    {
        label: '数字',
        pattern: '0',
    },
    '|',
    {
        label: '会计',
        pattern: '"¥" #,##0.00_);[Red]("¥"#,##0.00)',
    },
    {
        label: '财务数值',
        pattern: '#,##0.00;[Red]#,##0.00',
    },
    {
        label: '货币',
        pattern: '"¥"#,##0.00_);[Red]("¥"#,##0.00)',
    },
    {
        label: '货币取整',
        pattern: '"¥"#,##0;[Red]"¥"#,##0',
    },
    '|',
    {
        label: '日期',
        pattern: 'yyyy-mm-dd;@',
    },
    {
        label: '时间',
        pattern: 'am/pm h":"mm":"ss',
    },
    {
        label: '日期时间',
        pattern: 'yyyy-m-d am/pm h:mm',
    },
    {
        label: '持续时间',
        pattern: 'h:mm:ss',
    },
    '|',
    {
        label: '更多格式',
        pattern: '',
    },
];
