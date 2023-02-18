import { BorderStyleTypes } from "@univerjs/core";

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

export const FONT_FAMILY_CHILDREN = [
    {
        labelLocale: 'fontFamily.TimesNewRoman',
        style: { 'font-family': 'Times New Roman' },
        value: 'Times New Roman',
        selected: true,
    },
    {
        labelLocale: 'fontFamily.Arial',
        style: { 'font-family': 'Arial' },
        value: 'Arial',
    },
    {
        labelLocale: 'fontFamily.Tahoma',
        style: { 'font-family': 'Tahoma' },
        value: 'Tahoma',
    },
    {
        labelLocale: 'fontFamily.Verdana',
        style: { 'font-family': 'Verdana' },
        value: 'Verdana',
    },
    {
        labelLocale: 'fontFamily.MicrosoftAccorblack',
        style: { 'font-family': '微软雅黑' },
        value: '微软雅黑',
    },
    {
        labelLocale: 'fontFamily.SimSun',
        style: { 'font-family': '宋体' },
        value: '宋体',
    },
    {
        labelLocale: 'fontFamily.SimHei',
        style: { 'font-family': '黑体' },
        value: '黑体',
    },
    {
        labelLocale: 'fontFamily.Kaiti',
        style: { 'font-family': '楷体' },
        value: '楷体',
    },
    {
        labelLocale: 'fontFamily.FangSong',
        style: { 'font-family': '仿宋' },
        value: '仿宋',
    },
    {
        labelLocale: 'fontFamily.NSimSun',
        style: { 'font-family': '新宋体' },
        value: '新宋体',
    },
    {
        labelLocale: 'fontFamily.STXinwei',
        style: { 'font-family': '华文新魏' },
        value: '华文新魏',
    },
    {
        labelLocale: 'fontFamily.STXingkai',
        style: { 'font-family': '华文行楷' },
        value: '华文行楷',
    },
    {
        labelLocale: 'fontFamily.STLiti',
        style: { 'font-family': '华文隶书' },
        value: '华文隶书',
    },
    {
        labelLocale: 'fontFamily.HanaleiFill',
        style: { 'font-family': 'HanaleiFill' },
        value: 'HanaleiFill',
    },
    {
        labelLocale: 'fontFamily.Anton',
        style: { 'font-family': 'Anton' },
        value: 'Anton',
    },
    {
        labelLocale: 'fontFamily.Pacifico',
        style: { 'font-family': 'Pacifico' },
        value: 'Pacifico',
    },
];

export const BORDER_LINE_CHILDREN = [
    {
        labelLocale: 'borderLine.borderTop',
        customSuffix: {
            name: 'TopBorderIcon',
        },
        value: 'top',
    },
    {
        labelLocale: 'borderLine.borderBottom',
        customSuffix: {
            name: 'BottomBorderIcon',
        },
        value: 'bottom',
    },
    {
        labelLocale: 'borderLine.borderLeft',
        customSuffix: {
            name: 'LeftBorderIcon',
        },
        value: 'left',
    },
    {
        labelLocale: 'borderLine.borderRight',
        customSuffix: {
            name: 'RightBorderIcon',
        },
        value: 'right',
        border: true,
    },
    {
        labelLocale: 'borderLine.borderNone',
        customSuffix: {
            name: 'NoneBorderIcon',
        },
        value: 'none',
    },
    {
        labelLocale: 'borderLine.borderAll',
        customSuffix: {
            name: 'FullBorderIcon',
        },
        value: 'all',
        selected: true,
    },
    {
        labelLocale: 'borderLine.borderOutside',
        customSuffix: {
            name: 'OuterBorderIcon',
        },
        value: 'outside',
    },
    {
        labelLocale: 'borderLine.borderInside',
        customSuffix: {
            name: 'InnerBorderIcon',
        },
        value: 'inside',
    },
    {
        labelLocale: 'borderLine.borderHorizontal',
        customSuffix: {
            name: 'StripingBorderIcon',
        },
        value: 'horizontal',
    },
    {
        labelLocale: 'borderLine.borderVertical',
        customSuffix: {
            name: 'VerticalBorderIcon',
        },
        value: 'vertical',
    },
];

export const BORDER_SIZE_CHILDREN = [
    {
        labelLocale: 'borderLine.borderNone',
        value: BorderStyleTypes.NONE,
    },
    {
        customLabel: {
            name: 'BorderThin',
        },
        value: BorderStyleTypes.THIN,
    },
    {
        customLabel: {
            name: 'BorderHair',
        },
        value: BorderStyleTypes.HAIR,
    },
    {
        customLabel: {
            name: 'BorderDotted',
        },
        value: BorderStyleTypes.DOTTED,
    },
    {
        customLabel: {
            name: 'BorderDashed',
        },
        value: BorderStyleTypes.DASHED,
    },
    {
        customLabel: {
            name: 'BorderDashDot',
        },
        value: BorderStyleTypes.DOTTED,
    },
    {
        customLabel: {
            name: 'BorderDashDotDot',
        },
        value: BorderStyleTypes.DASH_DOT_DOT,
    },
    {
        customLabel: {
            name: 'BorderMedium',
        },
        value: BorderStyleTypes.MEDIUM,
    },
    {
        customLabel: {
            name: 'BorderMediumDashed',
        },
        value: BorderStyleTypes.MEDIUM_DASHED,
    },
    {
        customLabel: {
            name: 'BorderMediumDashDot',
        },
        value: BorderStyleTypes.MEDIUM_DASH_DOT,
    },
    {
        customLabel: {
            name: 'BorderMediumDashDotDot',
        },
        value: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
    },
    {
        customLabel: {
            name: 'BorderThick',
        },
        value: BorderStyleTypes.THICK,
    },
];

export const MERGE_CHILDREN = [
    {
        labelLocale: 'merge.all',
        value: 'all',
    },
    {
        labelLocale: 'merge.vertical',
        value: 'vertical',
    },
    {
        labelLocale: 'merge.horizontal',
        value: 'horizontal',
    },
    {
        labelLocale: 'merge.cancel',
        value: 'cancel',
    },
];

export const HORIZONTAL_ALIGN_CHILDREN = [
    {
        labelLocale: 'align.left',
        customSuffix: {
            name: 'LeftAlignIcon',
        },
        value: 1,
    },
    {
        labelLocale: 'align.center',
        selected: true,
        customSuffix: {
            name: 'CenterAlignIcon',
        },
        value: 2,
    },
    {
        labelLocale: 'align.right',
        customSuffix: {
            name: 'RightAlignIcon',
        },
        value: 3,
    },
];

export const VERTICAL_ALIGN_CHILDREN = [
    {
        labelLocale: 'align.top',
        customSuffix: {
            name: 'TopVerticalIcon',
        },
        value: 1,
    },
    {
        labelLocale: 'align.middle',
        customSuffix: {
            name: 'CenterVerticalIcon',
        },
        value: 2,
    },
    {
        labelLocale: 'align.bottom',
        customSuffix: {
            name: 'BottomVerticalIcon',
        },
        value: 3,
    },
];

export const TEXT_WRAP_CHILDREN = [
    {
        labelLocale: 'textWrap.overflow',
        customSuffix: {
            name: 'OverflowIcon',
        },
        value: 1,
    },
    {
        labelLocale: 'textWrap.wrap',
        customSuffix: {
            name: 'BrIcon',
        },
        value: 3,
    },
    {
        labelLocale: 'textWrap.clip',
        customSuffix: {
            name: 'CutIcon',
        },
        value: 2,
    },
];

export const TEXT_ROTATE_CHILDREN = [
    {
        labelLocale: 'textRotate.none',
        customSuffix: {
            name: 'TextRotateIcon',
        },
        value: 0,
    },
    {
        labelLocale: 'textRotate.angleUp',
        customSuffix: {
            name: 'TextRotateAngleUpIcon',
        },
        value: -45,
    },
    {
        labelLocale: 'textRotate.angleDown',
        customSuffix: {
            name: 'TextRotateAngleDownIcon',
        },
        value: 45,
    },
    {
        labelLocale: 'textRotate.vertical',
        customSuffix: {
            name: 'TextRotateVerticalIcon',
        },
        value: 'v',
    },
    {
        labelLocale: 'textRotate.rotationUp',
        customSuffix: {
            name: 'TextRotateRotationUpIcon',
        },
        value: -90,
    },
    {
        labelLocale: 'textRotate.rotationDown',
        customSuffix: {
            name: 'TextRotateRotationDownIcon',
        },
        value: 90,
    },
];
