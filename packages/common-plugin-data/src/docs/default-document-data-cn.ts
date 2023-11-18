import { BooleanNumber, IDocumentData, TextDecoration } from '@univerjs/core';

export const DEFAULT_DOCUMENT_DATA_CN: IDocumentData = {
    id: 'd',
    body: {
        dataStream:
            '零.  开篇\r上标和小标：HO2 5X 删除线：我是被删除的内容 下划线：我是下划线\r这篇文章旨在帮助新人快速熟悉开源项目univer的架构及代码，也是我过去一段时间参与到 univer 开发中的学习和总结，肯定有不够准确或者理解偏差，欢迎大家评论指正\r第壹章，会聊聊我对univer架构的理解，univer是如何拆分模块，以及模块之间的依赖关系。然后将univer放入MMV的架构模式中，分别分析下其模型层、视图层、控制器的边界和职责\r第贰章，我们先来看看 univer sheet 的模型层数据结构设计，如何区分 workbook、sheet、row、column、style 等，了解他们的包含关系，这对后面深入理解代码是有帮助的\r第叁、肆章，我将从两条控制链路来分析 univer 的代码，一条链路是 univer 启动和初始化渲染的过程。在这条链路中，是从模型层到视图层的过程。另外一条链路是 univer 响应用户事件，并且触发模型层数据变更，页面重新渲染，在这条链路中，是从视图层到模型层的过程。在这两部分，我们会涉及到大量的源码分析，在保留代码主逻辑的前提，删除了边界 case 的代码。同时在每个代码块第一行，表示该代码块所在的 TS 文件，这样便于直接阅读源码\r\n',
        textRuns: [
            {
                st: 0,
                ed: 2,
                ts: {
                    fs: 24,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(255, 255, 255)',
                    },
                    bl: BooleanNumber.TRUE,
                    bg: {
                        rgb: 'rgb(255, 0, 0)',
                    },
                },
            },
            {
                st: 2,
                ed: 4,
                ts: {
                    fs: 9,
                    ff: '"Times New Roman"',
                    cl: {
                        rgb: 'rgb(255, 255, 255)',
                    },
                    bl: BooleanNumber.TRUE,
                    bg: {
                        rgb: 'rgb(255, 0, 0)',
                    },
                },
            },
            {
                st: 4,
                ed: 6,
                ts: {
                    fs: 24,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(255, 255, 255)',
                    },
                    bl: BooleanNumber.TRUE,
                    bg: {
                        rgb: 'rgb(255, 0, 0)',
                    },
                },
            },
            {
                st: 7,
                ed: 13,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 13,
                ed: 15,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 15,
                ed: 16,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    va: 1,
                },
            },
            {
                st: 16,
                ed: 18,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 18,
                ed: 19,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    va: 2,
                },
            },
            {
                st: 19,
                ed: 20,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 20,
                ed: 24,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 24,
                ed: 33,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    st: {
                        s: BooleanNumber.TRUE,
                    },
                },
            },
            {
                st: 33,
                ed: 37,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 37,
                ed: 42,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    ul: {
                        s: BooleanNumber.TRUE,
                        cl: {
                            rgb: 'rgb(255, 0, 0)',
                        },
                        t: TextDecoration.DASH_DOT_DOT_HEAVY,
                    },
                },
            },
            {
                st: 43,
                ed: 47,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(255, 255, 255)',
                    },
                    bg: {
                        rgb: 'rgb(255, 0, 255)',
                    },
                },
            },
            {
                st: 47,
                ed: 61,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 61,
                ed: 67,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(255, 192, 0)',
                    },
                    bl: BooleanNumber.TRUE,
                    ul: {
                        s: BooleanNumber.TRUE,
                    },
                },
            },
            {
                st: 67,
                ed: 87,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 87,
                ed: 93,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(255, 192, 0)',
                    },
                    bl: BooleanNumber.TRUE,
                    ul: {
                        s: BooleanNumber.TRUE,
                    },
                },
            },
            {
                st: 93,
                ed: 94,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 94,
                ed: 126,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 127,
                ed: 130,
                ts: {
                    fs: 21.333333333333332,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 130,
                ed: 136,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 136,
                ed: 142,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 142,
                ed: 148,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 148,
                ed: 154,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 154,
                ed: 177,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 177,
                ed: 183,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    bl: BooleanNumber.TRUE,
                    ul: {
                        s: BooleanNumber.TRUE,
                    },
                },
            },
            {
                st: 183,
                ed: 185,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 185,
                ed: 188,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 188,
                ed: 218,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 219,
                ed: 222,
                ts: {
                    fs: 21,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 222,
                ed: 229,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 229,
                ed: 243,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 243,
                ed: 259,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 259,
                ed: 267,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    it: BooleanNumber.TRUE,
                    ul: {
                        s: BooleanNumber.TRUE,
                        t: TextDecoration.DASHED_HEAVY,
                    },
                },
            },
            {
                st: 267,
                ed: 268,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    it: BooleanNumber.TRUE,
                },
            },
            {
                st: 268,
                ed: 273,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    it: BooleanNumber.TRUE,
                    ul: {
                        s: BooleanNumber.TRUE,
                        t: TextDecoration.DASH_DOT_DOT_HEAVY,
                    },
                },
            },
            {
                st: 273,
                ed: 274,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    it: BooleanNumber.TRUE,
                },
            },
            {
                st: 274,
                ed: 277,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    it: BooleanNumber.TRUE,
                    ul: {
                        s: BooleanNumber.TRUE,
                        t: TextDecoration.DASH_LONG,
                    },
                },
            },
            {
                st: 277,
                ed: 278,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    it: BooleanNumber.TRUE,
                },
            },
            {
                st: 278,
                ed: 284,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    it: BooleanNumber.TRUE,
                    ul: {
                        s: BooleanNumber.TRUE,
                        t: TextDecoration.DASH_LONG_HEAVY,
                    },
                },
            },
            {
                st: 284,
                ed: 285,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    it: BooleanNumber.TRUE,
                },
            },
            {
                st: 285,
                ed: 290,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    it: BooleanNumber.TRUE,
                    ul: {
                        s: BooleanNumber.TRUE,
                        t: TextDecoration.DOT_DOT_DASH,
                    },
                },
            },
            {
                st: 290,
                ed: 291,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 291,
                ed: 318,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 319,
                ed: 324,
                ts: {
                    fs: 21,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 324,
                ed: 337,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 337,
                ed: 345,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 345,
                ed: 354,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 354,
                ed: 362,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 362,
                ed: 401,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 401,
                ed: 409,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 409,
                ed: 492,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 492,
                ed: 498,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 498,
                ed: 523,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 523,
                ed: 527,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
            {
                st: 527,
                ed: 540,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei"',
                    cl: {
                        rgb: 'rgb(47, 85, 151)',
                    },
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 6,
                paragraphStyle: {
                    spaceAbove: 0,
                    lineSpacing: 2,
                    spaceBelow: 20,
                },
            },
            {
                startIndex: 42,
                paragraphStyle: {
                    spaceAbove: 20,
                    lineSpacing: 2,
                    spaceBelow: 0,
                },
            },
            {
                startIndex: 126,
                paragraphStyle: {
                    spaceAbove: 20,
                    lineSpacing: 2,
                    spaceBelow: 0,
                },
            },
            {
                startIndex: 218,
                paragraphStyle: {
                    spaceAbove: 20,
                    lineSpacing: 2,
                    spaceBelow: 0,
                },
            },
            {
                startIndex: 318,
                paragraphStyle: {
                    spaceAbove: 20,
                    lineSpacing: 2,
                    spaceBelow: 0,
                },
            },
            {
                startIndex: 540,
                paragraphStyle: {
                    spaceAbove: 20,
                    lineSpacing: 2,
                    spaceBelow: 0,
                },
            },
        ],
    },
    documentStyle: {
        pageSize: {
            width: 595,
            height: 842,
        },
        marginTop: 50,
        marginBottom: 50,
        marginRight: 70,
        marginLeft: 70,
    },
};
