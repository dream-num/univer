export const FONT_SIZE_CHILDREN = [
    {
        label: '9',
        value: 9,
    },
    {
        label: '10',
        value: 10,
    },
    {
        label: '11',
        value: 11,
    },
    {
        label: '12',
        value: 12,
    },
    {
        label: '14',
        value: 14,
    },
    {
        label: '16',
        value: 16,
    },
    {
        label: '18',
        value: 18,
    },
    {
        label: '20',
        value: 20,
    },

    {
        label: '22',
        value: 22,
    },
    {
        label: '24',
        value: 24,
    },
    {
        label: '26',
        value: 26,
    },
    {
        label: '28',
        value: 28,
    },
    {
        label: '36',
        value: 36,
    },
    {
        label: '48',
        value: 48,
    },
    {
        label: '72',
        value: 72,
    },
];

export const MORE_FORMATS_CHILDREN = [
    {
        locale: 'defaultFmt.Automatic.text',
        selected: true,
    },
    {
        locale: 'defaultFmt.PlainText.text',
        border: true,
    },
    {
        locale: 'defaultFmt.Number.text',
        suffixLocale: 'defaultFmt.Number.example',
    },
    {
        locale: 'defaultFmt.Percent.text',
        suffixLocale: 'defaultFmt.Percent.example',
    },
    {
        locale: 'defaultFmt.Scientific.text',
        suffixLocale: 'defaultFmt.Scientific.example',
        border: true,
    },
    {
        locale: 'defaultFmt.Accounting.text',
        suffixLocale: 'defaultFmt.Accounting.example',
    },
    {
        locale: 'defaultFmt.Thousand.text',
        suffixLocale: 'defaultFmt.Thousand.example',
    },
    {
        locale: 'defaultFmt.Currency.text',
        suffixLocale: 'defaultFmt.Currency.example',
    },
    {
        locale: 'defaultFmt.Digit.text',
        suffixLocale: 'defaultFmt.Digit.example',
        border: true,
    },
    {
        locale: 'defaultFmt.Date.text',
        suffixLocale: 'defaultFmt.Date.example',
    },
    {
        locale: 'defaultFmt.Time.text',
        suffixLocale: 'defaultFmt.Time.example',
    },
    {
        locale: 'defaultFmt.Time24H.text',
        suffixLocale: 'defaultFmt.Time24H.example',
    },
    {
        locale: 'defaultFmt.DateTime.text',
        suffixLocale: 'defaultFmt.DateTime.example',
    },
    {
        locale: 'defaultFmt.DateTime24H.text',
        suffixLocale: 'defaultFmt.DateTime.example',
    },
];

export const FONT_FAMILY_CHILDREN = [
    {
        locale: 'fontFamily.TimesNewRoman',
        style: { 'font-family': 'Times New Roman' },
        value: 'Times New Roman',
        selected: true,
    },
    {
        locale: 'fontFamily.Arial',
        style: { 'font-family': 'Arial' },
        value: 'Arial',
    },
    {
        locale: 'fontFamily.Tahoma',
        style: { 'font-family': 'Tahoma' },
        value: 'Tahoma',
    },
    {
        locale: 'fontFamily.Verdana',
        style: { 'font-family': 'Verdana' },
        value: 'Verdana',
    },
    {
        locale: 'fontFamily.MicrosoftAccorblack',
        style: { 'font-family': '微软雅黑' },
        value: '微软雅黑',
    },
    {
        locale: 'fontFamily.SimSun',
        style: { 'font-family': '宋体' },
        value: '宋体',
    },
    {
        locale: 'fontFamily.SimHei',
        style: { 'font-family': '黑体' },
        value: '黑体',
    },
    {
        locale: 'fontFamily.Kaiti',
        style: { 'font-family': '楷体' },
        value: '楷体',
    },
    {
        locale: 'fontFamily.FangSong',
        style: { 'font-family': '仿宋' },
        value: '仿宋',
    },
    {
        locale: 'fontFamily.NSimSun',
        style: { 'font-family': '新宋体' },
        value: '新宋体',
    },
    {
        locale: 'fontFamily.STXinwei',
        style: { 'font-family': '华文新魏' },
        value: '华文新魏',
    },
    {
        locale: 'fontFamily.STXingkai',
        style: { 'font-family': '华文行楷' },
        value: '华文行楷',
    },
    {
        locale: 'fontFamily.STLiti',
        style: { 'font-family': '华文隶书' },
        value: '华文隶书',
    },
    {
        locale: 'fontFamily.HanaleiFill',
        style: { 'font-family': 'HanaleiFill' },
        value: 'HanaleiFill',
    },
    {
        locale: 'fontFamily.Anton',
        style: { 'font-family': 'Anton' },
        value: 'Anton',
    },
    {
        locale: 'fontFamily.Pacifico',
        style: { 'font-family': 'Pacifico' },
        value: 'Pacifico',
    },
];

export const BORDER_LINE_CHILDREN = [
    {
        locale: 'borderLine.borderTop',
        suffix: 'TopBorderIcon',
        value: 'top',
    },
    {
        locale: 'borderLine.borderBottom',
        suffix: 'BottomBorderIcon',
        value: 'bottom',
    },
    {
        locale: 'borderLine.borderLeft',
        suffix: 'LeftBorderIcon',
        value: 'left',
    },
    {
        locale: 'borderLine.borderRight',
        suffix: 'RightBorderIcon',
        value: 'right',
        border: true,
    },
    {
        locale: 'borderLine.borderNone',
        suffix: 'NoneBorderIcon',
        value: 'none',
    },
    {
        locale: 'borderLine.borderAll',
        suffix: 'FullBorderIcon',
        value: 'all',
        selected: true,
    },
    {
        locale: 'borderLine.borderOutside',
        suffix: 'OuterBorderIcon',
        value: 'outside',
    },
    {
        locale: 'borderLine.borderInside',
        suffix: 'InnerBorderIcon',
        value: 'inside',
    },
    {
        locale: 'borderLine.borderHorizontal',
        suffix: 'StripingBorderIcon',
        value: 'horizontal',
    },
    {
        locale: 'borderLine.borderVertical',
        suffix: 'VerticalBorderIcon',
        value: 'vertical',
    },
];

export const MERGE_CHILDREN = [
    {
        locale: 'merge.all',
        value: 'all',
    },
    {
        locale: 'merge.vertical',
        value: 'vertical',
    },
    {
        locale: 'merge.horizontal',
        value: 'horizontal',
    },
    {
        locale: 'merge.cancel',
        value: 'cancel',
    },
];

export const HORIZONTAL_ALIGN_CHILDREN = [
    {
        locale: 'align.left',
        suffix: 'LeftAlignIcon',
        value: 1,
    },
    {
        locale: 'align.center',
        suffix: 'CenterAlignIcon',
        value: 2,
    },
    {
        locale: 'align.right',
        suffix: 'RightAlignIcon',
        value: 3,
    },
];

export const VERTICAL_ALIGN_CHILDREN = [
    {
        locale: 'align.top',
        suffix: 'TopVerticalIcon',
        value: 1,
    },
    {
        locale: 'align.middle',
        suffix: 'CenterVerticalIcon',
        value: 2,
    },
    {
        locale: 'align.bottom',
        suffix: 'BottomVerticalIcon',
        value: 3,
    },
];

export const TEXT_WRAP_CHILDREN = [
    {
        locale: 'textWrap.overflow',
        suffix: 'OverflowIcon',
        value: 1,
    },
    {
        locale: 'textWrap.wrap',
        suffix: 'BrIcon',
        value: 3,
    },
    {
        locale: 'textWrap.clip',
        suffix: 'CutIcon',
        value: 2,
    },
];

export const TEXT_ROTATE_CHILDREN = [
    {
        locale: 'textRotate.none',
        suffix: 'TextRotateIcon',
        value: 0,
    },
    {
        locale: 'textRotate.angleUp',
        suffix: 'TextRotateAngleUpIcon',
        value: -45,
    },
    {
        locale: 'textRotate.angleDown',
        suffix: 'TextRotateAngleDownIcon',
        value: 45,
    },
    {
        locale: 'textRotate.vertical',
        suffix: 'TextRotateVerticalIcon',
        value: 'v',
    },
    {
        locale: 'textRotate.rotationUp',
        suffix: 'TextRotateRotationUpIcon',
        value: -90,
    },
    {
        locale: 'textRotate.rotationDown',
        suffix: 'TextRotateRotationDownIcon',
        value: 90,
    },
];
