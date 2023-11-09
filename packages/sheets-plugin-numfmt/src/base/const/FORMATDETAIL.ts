export const CURRENCYDETAIL = [
    {
        suffix: '¥',
    },
    {
        suffix: '$',
    },
    {
        suffix: '€',
    },
    {
        suffix: '￡',
    },
    {
        suffix: '?',
    },
];

export const DATEFMTLISG = [
    {
        label: '1930-08-05',
        suffix: 'yyyy-MM-dd',
    },
    {
        label: '1930/08/05',
        suffix: 'yyyy/MM/dd',
    },
    {
        label: '1930年08月05日',
        suffix: 'yyyy"年"MM"月"dd"日"',
    },
    {
        label: '08-05',
        suffix: 'MM-dd',
    },
    {
        label: '8月5日',
        suffix: 'M"月"d"日"',
    },
    {
        label: '13:30:30',
        suffix: 'h:mm:ss',
    },
    {
        label: '13:30',
        suffix: 'h:mm',
    },
    {
        label: '下午01:30',
        suffix: '上午/下午 hh:mm',
    },
    {
        label: '下午1:30',
        suffix: '上午/下午 h:mm',
    },
    {
        label: '下午1:30:30',
        suffix: '上午/下午 h:mm:ss',
    },
    {
        label: '08-05 下午 01:30',
        suffix: 'MM-dd 上午/下午 hh:mm',
    },
];

export const NUMBERFORMAT = [
    {
        label: '(1,235)',
        suffix: '#,##0_);(#,##0)',
    },
    {
        label: '(1,235) Red',
        suffix: '#,##0_);[Red](#,##0)',
    },
    {
        label: '1,234.56',
        suffix: '#,##0.00_);(#,##0.00)',
    },
    {
        label: '1,234.56 Red',
        suffix: '#,##0.00_);[Red](#,##0.00)',
    },
    {
        label: '-1,234.56',
        suffix: '#,##0.00_);-(#,##0.00)',
    },
    {
        label: '-1,234.56 Red',
        suffix: '#,##0.00_);[Red]-(#,##0.00)',
    },
];
export const CURRENCYFORMAT = [
    {
        label: (suffix: string) => `${suffix}1,235`,
        suffix: (suffix: string) => `"${suffix}"#,##0.00_);"${suffix}"#,##0.00`,
    },
    {
        label: (suffix: string) => `${suffix}1,235 Red`,
        suffix: (suffix: string) => `"${suffix}"#,##0.00_);[Red]"${suffix}"#,##0.00`,
    },
    {
        label: (suffix: string) => `(${suffix}1,235)`,
        suffix: (suffix: string) => `"${suffix}"#,##0.00_);("${suffix}"#,##0.00)`,
    },
    {
        label: (suffix: string) => `(${suffix}1,235) Red`,
        suffix: (suffix: string) => `"${suffix}"#,##0.00_);[Red]("${suffix}"#,##0.00)`,
    },
    {
        label: (suffix: string) => `-${suffix}1,235)`,
        suffix: (suffix: string) => `"${suffix}"#,##0.00_);-"${suffix}"#,##0.00`,
    },
    {
        label: (suffix: string) => `-${suffix}1,235 Red`,
        suffix: (suffix: string) => `"${suffix}"#,##0.00_);[Red]-"${suffix}"#,##0.00`,
    },
];
