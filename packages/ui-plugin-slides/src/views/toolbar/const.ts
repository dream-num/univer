import { BorderStyleTypes } from '@univerjs/core';

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
        label: 'fontFamily.MicrosoftYaHei',
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
        suffix: {
            name: 'UpBorder',
        },
        value: 'top',
    },
    {
        label: 'borderLine.borderBottom',
        suffix: {
            name: 'DownBorder',
        },
        value: 'bottom',
    },
    {
        label: 'borderLine.borderLeft',
        suffix: {
            name: 'LeftBorder',
        },
        value: 'left',
    },
    {
        label: 'borderLine.borderRight',
        suffix: {
            name: 'RightBorder',
        },
        value: 'right',
        border: true,
    },
    {
        label: 'borderLine.borderNone',
        suffix: {
            name: 'NoBorderSingle',
        },
        value: 'none',
    },
    {
        label: 'borderLine.borderAll',
        suffix: {
            name: 'AllBorderSingle',
        },
        value: 'all',
        selected: true,
    },
    {
        label: 'borderLine.borderOutside',
        suffix: {
            name: 'OuterBorder',
        },
        value: 'outside',
    },
    {
        label: 'borderLine.borderInside',
        suffix: {
            name: 'InnerBorder',
        },
        value: 'inside',
    },
    {
        label: 'borderLine.borderHorizontal',
        suffix: {
            name: 'InnerBorder',
        },
        value: 'horizontal',
    },
    {
        label: 'borderLine.borderVertical',
        suffix: {
            name: 'InnerBorder',
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
        label: {
            name: 'BorderThin',
        },
        value: BorderStyleTypes.THIN,
    },
    {
        label: {
            name: 'BorderHair',
        },
        value: BorderStyleTypes.HAIR,
    },
    {
        label: {
            name: 'BorderDotted',
        },
        value: BorderStyleTypes.DOTTED,
    },
    {
        label: {
            name: 'BorderDashed',
        },
        value: BorderStyleTypes.DASHED,
    },
    {
        label: {
            name: 'BorderDashDot',
        },
        value: BorderStyleTypes.DOTTED,
    },
    {
        label: {
            name: 'BorderDashDotDot',
        },
        value: BorderStyleTypes.DASH_DOT_DOT,
    },
    {
        label: {
            name: 'BorderMedium',
        },
        value: BorderStyleTypes.MEDIUM,
    },
    {
        label: {
            name: 'BorderMediumDashed',
        },
        value: BorderStyleTypes.MEDIUM_DASHED,
    },
    {
        label: {
            name: 'BorderMediumDashDot',
        },
        value: BorderStyleTypes.MEDIUM_DASH_DOT,
    },
    {
        label: {
            name: 'BorderMediumDashDotDot',
        },
        value: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
    },
    {
        label: {
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
        suffix: {
            name: 'LeftJustifyingSingle',
        },
        value: 1,
    },
    {
        label: 'align.center',
        selected: true,
        suffix: {
            name: 'HorizontallySingle',
        },
        value: 2,
    },
    {
        label: 'align.right',
        suffix: {
            name: 'RightJustifyingSingle',
        },
        value: 3,
    },
];

export const VERTICAL_ALIGN_CHILDREN = [
    {
        label: 'align.top',
        suffix: {
            name: 'AlignTopSingle',
        },
        value: 1,
    },
    {
        label: 'align.middle',
        suffix: {
            name: 'VerticalCenterSingle',
        },
        value: 2,
    },
    {
        label: 'align.bottom',
        suffix: {
            name: 'AlignBottomSingle',
        },
        value: 3,
    },
];

export const TEXT_WRAP_CHILDREN = [
    {
        label: 'textWrap.overflow',
        suffix: {
            name: 'OverflowSingle',
        },
        value: 1,
    },
    {
        label: 'textWrap.wrap',
        suffix: {
            name: 'AutowrapSingle',
        },
        value: 3,
    },
    {
        label: 'textWrap.clip',
        suffix: {
            name: 'TruncationSingle',
        },
        value: 2,
    },
];

export const TEXT_ROTATE_CHILDREN = [
    {
        label: 'textRotate.none',
        suffix: {
            name: 'NoRotationSingle',
        },
        value: 0,
    },
    {
        label: 'textRotate.angleUp',
        suffix: {
            name: 'LeftRotationFortyFiveDegreesSingle',
        },
        value: -45,
    },
    {
        label: 'textRotate.angleDown',
        suffix: {
            name: 'RightRotationFortyFiveDegreesSingle',
        },
        value: 45,
    },
    {
        label: 'textRotate.vertical',
        suffix: {
            name: 'VerticalTextSingle',
        },
        value: 'v',
    },
    {
        label: 'textRotate.rotationUp',
        suffix: {
            name: 'LeftRotationNinetyDegreesSingle',
        },
        value: -90,
    },
    {
        label: 'textRotate.rotationDown',
        suffix: {
            name: 'RightRotationNinetyDegreesSingle',
        },
        value: 90,
    },
];
