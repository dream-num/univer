import { HorizontalAlign, VerticalAlign, WrapStrategy } from '@univerjs/core';

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

export const HORIZONTAL_ALIGN_CHILDREN = [
    {
        label: 'align.left',
        icon: 'LeftAlignIcon',
        value: HorizontalAlign.LEFT,
    },
    {
        label: 'align.center',
        icon: 'CenterAlignIcon',
        value: HorizontalAlign.CENTER,
    },
    {
        label: 'align.right',
        icon: 'RightAlignIcon',
        value: HorizontalAlign.RIGHT,
    },
];

export const VERTICAL_ALIGN_CHILDREN = [
    {
        label: 'align.top',
        icon: 'TopVerticalIcon',
        value: VerticalAlign.TOP,
    },
    {
        label: 'align.middle',
        icon: 'CenterVerticalIcon',
        value: VerticalAlign.MIDDLE,
    },
    {
        label: 'align.bottom',
        icon: 'BottomVerticalIcon',
        value: VerticalAlign.BOTTOM,
    },
];

export const TEXT_WRAP_CHILDREN = [
    {
        label: 'textWrap.overflow',
        icon: 'OverflowIcon',
        value: WrapStrategy.OVERFLOW,
    },
    {
        label: 'textWrap.wrap',
        icon: 'BrIcon',
        value: WrapStrategy.WRAP,
    },
    {
        label: 'textWrap.clip',
        icon: 'CutIcon',
        value: WrapStrategy.CLIP,
    },
];

export const TEXT_ROTATE_CHILDREN = [
    {
        label: 'textRotate.none',
        icon: 'TextRotateIcon',
        value: 0,
    },
    {
        label: 'textRotate.angleUp',
        icon: 'TextRotateAngleUpIcon',
        value: -45,
    },
    {
        label: 'textRotate.angleDown',
        icon: 'TextRotateAngleDownIcon',
        value: 45,
    },
    {
        label: 'textRotate.vertical',
        icon: 'TextRotateVerticalIcon',
        value: 'v',
    },
    {
        label: 'textRotate.rotationUp',
        icon: 'TextRotateRotationUpIcon',
        value: -90,
    },
    {
        label: 'textRotate.rotationDown',
        icon: 'TextRotateRotationDownIcon',
        value: 90,
    },
];
