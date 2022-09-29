import { ISelectButton } from '@univer/base-component';

export const FONT_SIZE_CHILDREN = [
    {
        label: '9',
        value: 9,
    },
    {
        label: '10',
        value: 10,
        selected: true,
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
        name: 'defaultFmt.Automatic.text',
        selected: true,
    },
    {
        name: 'defaultFmt.PlainText.text',
        selected: false,
    },
    {
        name: 'defaultFmt.Number.text',
        iconName: 'defaultFmt.Number.example',
        selected: false,
        border: true,
    },
    {
        name: 'defaultFmt.Percent.text',
        iconName: 'defaultFmt.Percent.example',
        selected: false,
    },
    {
        name: 'defaultFmt.Scientific.text',
        iconName: 'defaultFmt.Scientific.example',
        selected: false,
    },
    {
        name: 'defaultFmt.Accounting.text',
        iconName: 'defaultFmt.Accounting.example',
        selected: false,
        border: true,
    },
    {
        name: 'defaultFmt.Thousand.text',
        iconName: 'defaultFmt.Thousand.example',
        selected: false,
    },
    {
        name: 'defaultFmt.Currency.text',
        iconName: 'defaultFmt.Currency.example',
        selected: false,
    },
    {
        name: 'defaultFmt.Digit.text',
        iconName: 'defaultFmt.Digit.example',
        selected: false,
    },
    {
        name: 'defaultFmt.Date.text',
        selected: false,
        iconName: 'defaultFmt.Date.example',
        border: true,
    },
    {
        name: 'defaultFmt.Time.text',
        iconName: 'defaultFmt.Time.example',
        selected: false,
    },
    {
        name: 'defaultFmt.Time24H.text',
        iconName: 'defaultFmt.Time24H.example',
        selected: false,
    },
    {
        name: 'defaultFmt.DateTime.text',
        iconName: 'defaultFmt.DateTime.example',
        selected: false,
    },
    {
        name: 'defaultFmt.DateTime24H.text',
        iconName: 'defaultFmt.DateTime.example',
        selected: false,
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
        icon: 'TopBorderIcon',
        value: 'top',
    },
    {
        locale: 'borderLine.borderBottom',
        icon: 'BottomBorderIcon',
        value: 'bottom',
    },
    {
        locale: 'borderLine.borderLeft',
        icon: 'LeftBorderIcon',
        value: 'left',
    },
    {
        locale: 'borderLine.borderRight',
        icon: 'RightBorderIcon',
        value: 'right',
    },
    {
        locale: 'borderLine.borderNone',
        icon: 'NoneBorderIcon',
        value: 'none',
    },
    {
        locale: 'borderLine.borderAll',
        icon: 'FullBorderIcon',
        value: 'all',
        selected: true,
    },
    {
        locale: 'borderLine.borderOutside',
        icon: 'OuterBorderIcon',
        value: 'outside',
    },
    {
        locale: 'borderLine.borderInside',
        icon: 'InnerBorderIcon',
        value: 'inside',
    },
    {
        locale: 'borderLine.borderHorizontal',
        icon: 'StripingBorderIcon',
        value: 'horizontal',
    },
    {
        locale: 'borderLine.borderVertical',
        icon: 'VerticalBorderIcon',
        value: 'vertical',
    },
    {
        locale: 'borderLine.borderColor',
        icon: 'RightIcon',
        children: [
            {
                label: 'BorderLineColorPicker',
                selectType: ISelectButton.JSX,
                value: '#000',
            },
        ],
    },
    {
        locale: 'borderLine.borderSize',
        icon: 'RightIcon',
        needChange: true,
        value: 1,
        children: [
            { locale: 'borderLine.borderNone', label: '', value: 0 },
            { locale: '', label: 'BorderThin', value: 1 },
            { locale: '', label: 'BorderHair', value: 2 },
            { locale: '', label: 'BorderDotted', value: 3 },
            { locale: '', label: 'BorderDashed', value: 4 },
            { locale: '', label: 'BorderDashDot', value: 5 },
            { locale: '', label: 'BorderDashDotDot', value: 6 },
            { locale: '', label: 'BorderMedium', value: 7 },
            { locale: '', label: 'BorderMediumDashed', value: 8 },
            { locale: '', label: 'BorderMediumDashDot', value: 9 },
            { locale: '', label: 'BorderMediumDashDotDot', value: 10 },
            { locale: '', label: 'BorderThick', value: 12 },
        ],
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
        icon: 'LeftAlignIcon',
        value: 1,
    },
    {
        locale: 'align.center',
        icon: 'CenterAlignIcon',
        value: 2,
    },
    {
        locale: 'align.right',
        icon: 'RightAlignIcon',
        value: 3,
    },
];

export const VERTICAL_ALIGN_CHILDREN = [
    {
        locale: 'align.top',
        icon: 'TopVerticalIcon',
        value: 1,
    },
    {
        locale: 'align.middle',
        icon: 'CenterVerticalIcon',
        value: 2,
    },
    {
        locale: 'align.bottom',
        icon: 'BottomVerticalIcon',
        value: 3,
    },
];

export const TEXT_WRAP_CHILDREN = [
    {
        locale: 'textWrap.overflow',
        icon: 'OverflowIcon',
        value: 1,
    },
    {
        locale: 'textWrap.wrap',
        icon: 'BrIcon',
        value: 3,
    },
    {
        locale: 'textWrap.clip',
        icon: 'CutIcon',
        value: 2,
    },
];

export const TEXT_ROTATE_CHILDREN = [
    {
        locale: 'textRotate.none',
        icon: 'TextRotateIcon',
        value: 0,
    },
    {
        locale: 'textRotate.angleUp',
        icon: 'TextRotateAngleUpIcon',
        value: -45,
    },
    {
        locale: 'textRotate.angleDown',
        icon: 'TextRotateAngleDownIcon',
        value: 45,
    },
    {
        locale: 'textRotate.vertical',
        icon: 'TextRotateVerticalIcon',
        value: 'v',
    },
    {
        locale: 'textRotate.rotationUp',
        icon: 'TextRotateRotationUpIcon',
        value: -90,
    },
    {
        locale: 'textRotate.rotationDown',
        icon: 'TextRotateRotationDownIcon',
        value: 90,
    },
];
