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
        label: 'fontFamily.TimesNewRoman',
        style: { 'font-family': 'Times New Roman' },
        value: 'Times New Roman',
        selected: true,
    },
    {
        label: 'fontFamily.Arial',
        style: { 'font-family': 'Arial' },
        value: 'Arial',
    },
    {
        label: 'fontFamily.Tahoma',
        style: { 'font-family': 'Tahoma' },
        value: 'Tahoma',
    },
    {
        label: 'fontFamily.Verdana',
        style: { 'font-family': 'Verdana' },
        value: 'Verdana',
    },
    {
        label: 'fontFamily.MicrosoftAccorblack',
        style: { 'font-family': '微软雅黑' },
        value: '微软雅黑',
    },
    {
        label: 'fontFamily.SimSun',
        style: { 'font-family': '宋体' },
        value: '宋体',
    },
    {
        label: 'fontFamily.SimHei',
        style: { 'font-family': '黑体' },
        value: '黑体',
    },
    {
        label: 'fontFamily.Kaiti',
        style: { 'font-family': '楷体' },
        value: '楷体',
    },
    {
        label: 'fontFamily.FangSong',
        style: { 'font-family': '仿宋' },
        value: '仿宋',
    },
    {
        label: 'fontFamily.NSimSun',
        style: { 'font-family': '新宋体' },
        value: '新宋体',
    },
    {
        label: 'fontFamily.STXinwei',
        style: { 'font-family': '华文新魏' },
        value: '华文新魏',
    },
    {
        label: 'fontFamily.STXingkai',
        style: { 'font-family': '华文行楷' },
        value: '华文行楷',
    },
    {
        label: 'fontFamily.STLiti',
        style: { 'font-family': '华文隶书' },
        value: '华文隶书',
    },
    {
        label: 'fontFamily.HanaleiFill',
        style: { 'font-family': 'HanaleiFill' },
        value: 'HanaleiFill',
    },
    {
        label: 'fontFamily.Anton',
        style: { 'font-family': 'Anton' },
        value: 'Anton',
    },
    {
        label: 'fontFamily.Pacifico',
        style: { 'font-family': 'Pacifico' },
        value: 'Pacifico',
    },
];

export const BORDER_LINE_CHILDREN = [
    {
        label: 'borderLine.borderTop',
        customSuffix: {
            name: 'TopBorderIcon',
        },
        value: 'top',
    },
    {
        label: 'borderLine.borderBottom',
        customSuffix: {
            name: 'BottomBorderIcon',
        },
        value: 'bottom',
    },
    {
        label: 'borderLine.borderLeft',
        customSuffix: {
            name: 'LeftBorderIcon',
        },
        value: 'left',
    },
    {
        label: 'borderLine.borderRight',
        customSuffix: {
            name: 'RightBorderIcon',
        },
        value: 'right',
        border: true,
    },
    {
        label: 'borderLine.borderNone',
        customSuffix: {
            name: 'NoneBorderIcon',
        },
        value: 'none',
    },
    {
        label: 'borderLine.borderAll',
        customSuffix: {
            name: 'FullBorderIcon',
        },
        value: 'all',
        selected: true,
    },
    {
        label: 'borderLine.borderOutside',
        customSuffix: {
            name: 'OuterBorderIcon',
        },
        value: 'outside',
    },
    {
        label: 'borderLine.borderInside',
        customSuffix: {
            name: 'InnerBorderIcon',
        },
        value: 'inside',
    },
    {
        label: 'borderLine.borderHorizontal',
        customSuffix: {
            name: 'StripingBorderIcon',
        },
        value: 'horizontal',
    },
    {
        label: 'borderLine.borderVertical',
        customSuffix: {
            name: 'VerticalBorderIcon',
        },
        value: 'vertical',
    },
];

export const BORDER_SIZE_CHILDREN = [
    {
        label: 'borderLine.borderNone',
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
        label: 'merge.all',
        value: 'all',
    },
    {
        label: 'merge.vertical',
        value: 'vertical',
    },
    {
        label: 'merge.horizontal',
        value: 'horizontal',
    },
    {
        label: 'merge.cancel',
        value: 'cancel',
    },
];

export const HORIZONTAL_ALIGN_CHILDREN = [
    {
        label: 'align.left',
        customSuffix: {
            name: 'LeftAlignIcon',
        },
        value: 1,
    },
    {
        label: 'align.center',
        selected: true,
        customSuffix: {
            name: 'CenterAlignIcon',
        },
        value: 2,
    },
    {
        label: 'align.right',
        customSuffix: {
            name: 'RightAlignIcon',
        },
        value: 3,
    },
];

export const VERTICAL_ALIGN_CHILDREN = [
    {
        label: 'align.top',
        customSuffix: {
            name: 'TopVerticalIcon',
        },
        value: 1,
    },
    {
        label: 'align.middle',
        customSuffix: {
            name: 'CenterVerticalIcon',
        },
        value: 2,
    },
    {
        label: 'align.bottom',
        customSuffix: {
            name: 'BottomVerticalIcon',
        },
        value: 3,
    },
];

export const TEXT_WRAP_CHILDREN = [
    {
        label: 'textWrap.overflow',
        customSuffix: {
            name: 'OverflowIcon',
        },
        value: 1,
    },
    {
        label: 'textWrap.wrap',
        customSuffix: {
            name: 'BrIcon',
        },
        value: 3,
    },
    {
        label: 'textWrap.clip',
        customSuffix: {
            name: 'CutIcon',
        },
        value: 2,
    },
];

export const TEXT_ROTATE_CHILDREN = [
    {
        label: 'textRotate.none',
        customSuffix: {
            name: 'TextRotateIcon',
        },
        value: 0,
    },
    {
        label: 'textRotate.angleUp',
        customSuffix: {
            name: 'TextRotateAngleUpIcon',
        },
        value: -45,
    },
    {
        label: 'textRotate.angleDown',
        customSuffix: {
            name: 'TextRotateAngleDownIcon',
        },
        value: 45,
    },
    {
        label: 'textRotate.vertical',
        customSuffix: {
            name: 'TextRotateVerticalIcon',
        },
        value: 'v',
    },
    {
        label: 'textRotate.rotationUp',
        customSuffix: {
            name: 'TextRotateRotationUpIcon',
        },
        value: -90,
    },
    {
        label: 'textRotate.rotationDown',
        customSuffix: {
            name: 'TextRotateRotationDownIcon',
        },
        value: 90,
    },
];
