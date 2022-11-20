import {
    IDocumentData,
    BlockType,
    ParagraphElementType,
    BaselineOffset,
    IWorkbookConfig,
    LocaleType,
    BooleanNumber,
    BorderStyleTypes,
    HorizontalAlign,
    VerticalAlign,
    WrapStrategy,
    SheetTypes,
    Tools,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    WrapTextType,
    BulletAlignment,
    GlyphType,
} from '@univer/core';

const richTextTestFloat: IDocumentData = {
    documentId: 'd',
    drawings: {
        shapeTest1: {
            objectId: 'shapeTest1',
            objectProperties: {
                title: 'test shape',
                description: 'test shape',
                size: {
                    width: 100,
                    height: 400,
                },
                positionH: {
                    relativeFrom: ObjectRelativeFromH.COLUMN,
                    posOffset: 100,
                },
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PARAGRAPH,
                    posOffset: 160,
                },
                angle: 0,
                imageProperties: {
                    contentUrl: 'https://cnbabylon.com/assets/img/agents.png',
                },
            },
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            behindDoc: BooleanNumber.FALSE,
            wrapText: WrapTextType.BOTH_SIDES,
        },
    },
    lists: {
        unorderedTest: {
            listId: 'unorderedTest',
            nestingLevel: [
                {
                    bulletAlignment: BulletAlignment.START,
                    glyphFormat: ' %0',
                    textStyle: {
                        fs: 12,
                    },
                    startNumber: 0,
                    glyphSymbol: '\u25CF',
                    hanging: 21,
                    indentStart: 21,
                },
                {
                    bulletAlignment: BulletAlignment.START,
                    glyphFormat: ' %1',
                    textStyle: {
                        fs: 12,
                    },
                    startNumber: 0,
                    glyphSymbol: '\u25A0',
                    hanging: 21,
                    indentStart: 42,
                },
                {
                    bulletAlignment: BulletAlignment.START,
                    glyphFormat: ' %1',
                    textStyle: {
                        fs: 12,
                    },
                    startNumber: 0,
                    glyphSymbol: '\u25C6',
                    hanging: 21,
                    indentStart: 63,
                },
            ],
        },
        testBullet: {
            listId: 'testBullet',
            nestingLevel: [
                {
                    bulletAlignment: BulletAlignment.START,
                    glyphFormat: ' %1.',
                    textStyle: {
                        fs: 12,
                    },
                    startNumber: 0,
                    glyphType: GlyphType.ROMAN,
                    hanging: 21,
                    indentStart: 21,
                },
                {
                    bulletAlignment: BulletAlignment.START,
                    glyphFormat: ' %1.%2)',
                    textStyle: {
                        fs: 12,
                    },
                    startNumber: 0,
                    glyphType: GlyphType.ROMAN,
                    hanging: 21,
                    indentStart: 42,
                },
                {
                    bulletAlignment: BulletAlignment.START,
                    glyphFormat: ' %1.%2.%3.',
                    textStyle: {
                        fs: 12,
                    },
                    startNumber: 0,
                    glyphType: GlyphType.ROMAN,
                    hanging: 21,
                    indentStart: 63,
                },
            ],
        },
    },
    body: {
        blockElements: {
            oneParagraph: {
                blockId: 'oneParagraph',
                st: 0,
                ed: 15,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 0,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '在“第1题”工作表中完成以下操作',
                                ts: {
                                    fs: 12,
                                    bg: {
                                        rgb: 'rgb(200,0,90)',
                                    },
                                    cl: {
                                        rgb: 'rgb(255,130,0)',
                                    },
                                },
                            },
                        },
                        smallSub: {
                            eId: 'smallSub',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '上标',
                                ts: {
                                    fs: 14,
                                    bg: {
                                        rgb: 'rgb(2,128,2)',
                                    },
                                    cl: {
                                        rgb: 'rgb(0,1,55)',
                                    },
                                    va: BaselineOffset.SUPERSCRIPT,
                                },
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '日期列单元格数据验证，限制只能输入日期（介于1949年1月1日至2099年1月1日）',
                                ts: {
                                    fs: 14,
                                    bg: {
                                        rgb: 'rgb(90,128,255)',
                                    },
                                    cl: {
                                        rgb: 'rgb(0,1,255)',
                                    },
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'shapeTest1',
                            paragraphElementType: ParagraphElementType.DRAWING,
                        },
                        {
                            elementId: 'smallSub',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            twoParagraph: {
                blockId: 'twoParagraph',
                st: 0,
                ed: 15,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 1,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '细化埋点上报链路和指标方案梳理',
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '目前通过每日定时任务发送报告',
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            threeParagraph: {
                blockId: 'threeParagraph',
                st: 0,
                ed: 15,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 0,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '自2018年首届进博会举办以来，进博会已经成为全球新品的首发地、前沿技术的首选地、创新服务的首推地。',
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '中国这十年”对外开放成就展湖北展区主要以图文、图表、数据、视频、企业展品、实物模型、光电科技等体现湖北十年开放成就、重大开放平台及产业。湖北省共计17家企业、机构的展品将在这一展区展示',
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            fourParagraph: {
                blockId: 'fourParagraph',
                st: 0,
                ed: 15,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 1,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '国家主席习近平以视频方式出席在上海举行的第五届中国国际进口博览会开幕式并发表题为《共创开放繁荣的美好未来》的致辞',
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '中国将推动各国各方共享深化国际合作机遇，全面深入参与世界贸易组织改革谈判',
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
            fiveParagraph: {
                blockId: 'fiveParagraph',
                st: 0,
                ed: 15,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    bullet: {
                        listId: 'testBullet',
                        nestingLevel: 2,
                        textStyle: {
                            fs: 20,
                        },
                    },
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '中国男排两名现役国手彭世坤和张秉龙分别效力的三得利太阳鸟和东京大熊本轮遭遇。',
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '双方经过激战，主场作战的卫冕冠军三得利技高一筹3-2逆转击败对手，力夺第3场胜利',
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
        },
        blockElementOrder: ['oneParagraph', 'twoParagraph', 'threeParagraph', 'fourParagraph', 'fiveParagraph'],
    },
    documentStyle: {
        pageSize: {
            width: Infinity,
            height: Infinity,
        },
        marginTop: 0,
        marginBottom: 0,
        marginRight: 2,
        marginLeft: 2,
    },
};

const richTextTest: IDocumentData = {
    documentId: 'd',
    body: {
        blockElements: {
            oneParagraph: {
                blockId: 'oneParagraph',
                st: 0,
                ed: 15,
                blockType: BlockType.PARAGRAPH,
                paragraph: {
                    elements: {
                        oneElement: {
                            eId: 'oneElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '在“第1题”工作表中完成以下操作',
                                ts: {
                                    fs: 12,
                                    bg: {
                                        rgb: 'rgb(200,0,90)',
                                    },
                                    cl: {
                                        rgb: 'rgb(255,130,0)',
                                    },
                                },
                            },
                        },
                        smallSub: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '上标',
                                ts: {
                                    fs: 14,
                                    bg: {
                                        rgb: 'rgb(2,128,2)',
                                    },
                                    cl: {
                                        rgb: 'rgb(0,1,55)',
                                    },
                                    va: BaselineOffset.SUPERSCRIPT,
                                },
                            },
                        },
                        twoElement: {
                            eId: 'twoElement',
                            st: 0,
                            ed: 15,
                            et: ParagraphElementType.TEXT_RUN,
                            tr: {
                                ct: '日期列单元格数据验证，限制只能输入日期（介于1949年1月1日至2099年1月1日）',
                                ts: {
                                    fs: 14,
                                    bg: {
                                        rgb: 'rgb(90,128,255)',
                                    },
                                    cl: {
                                        rgb: 'rgb(0,1,255)',
                                    },
                                },
                            },
                        },
                    },
                    elementOrder: [
                        {
                            elementId: 'oneElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'smallSub',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                        {
                            elementId: 'twoElement',
                            paragraphElementType: ParagraphElementType.TEXT_RUN,
                        },
                    ],
                },
            },
        },
        blockElementOrder: ['oneParagraph'],
    },
    documentStyle: {
        pageSize: {
            width: Infinity,
            height: Infinity,
        },
        marginTop: 0,
        marginBottom: 0,
        marginRight: 2,
        marginLeft: 2,
    },
};

/**
 * Default workbook data
 */
export const DEFAULT_WORKBOOK_DATA: IWorkbookConfig = {
    id: 'workbook-01',
    theme: 'default',
    locale: LocaleType.EN,
    creator: 'univer',
    name: 'universheet',
    skin: 'default',
    socketUrl: '',
    socketEnable: BooleanNumber.FALSE,
    extensions: [],
    sheetOrder: [],
    pluginMeta: {},
    styles: {
        '1': {
            cl: {
                rgb: 'blue',
            },
            fs: 16,
            bd: {
                t: {
                    s: BorderStyleTypes.MEDIUM_DASHED,
                    cl: {
                        rgb: 'black',
                    },
                },
                l: {
                    s: BorderStyleTypes.MEDIUM_DASHED,
                    cl: {
                        rgb: 'black',
                    },
                },
                r: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'black',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'red',
                    },
                },
            },
            ht: 3,
        },
        '2': {
            bg: {
                rgb: 'rgb(200, 2, 0)',
            },
            fs: 24,
            ht: HorizontalAlign.RIGHT,
            vt: VerticalAlign.TOP,
        },
        '3': {
            ht: HorizontalAlign.RIGHT,
            vt: VerticalAlign.MIDDLE,
            tb: WrapStrategy.WRAP,
            // va: BaselineOffset.SUPERSCRIPT,
            // cl: {
            //     rgb: 'rgb(0, 255, 0)',
            // },
            // st: {
            //     s: BooleanNumber.TRUE, // show
            // },
            bg: {
                rgb: 'rgb(255, 255, 0)',
            },
            tr: {
                a: 45,
                v: BooleanNumber.FALSE,
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'black',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'black',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'black',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'red',
                    },
                },
            },
        },
        '4': {
            bg: {
                rgb: 'rgb(0, 0, 255)',
            },
        },
        '5': {
            tb: WrapStrategy.WRAP,
        },
    },
    timeZone: 'GMT+8',
    createdTime: '2021-11-28 12:10:10',
    modifiedTime: '2021-11-29 12:10:10',
    appVersion: '3.0.0-alpha',
    lastModifiedBy: 'univer',
    sheets: {
        'sheet-01': {
            type: SheetTypes.GRID,
            id: 'sheet-01',
            cellData: {
                '0': {
                    '0': {
                        s: '1',
                        v: 1,
                        m: '1',
                    },
                    '1': {
                        s: '1',
                        v: 1,
                        m: '1',
                    },
                    '5': {
                        s: '1',
                        v: 8,
                        m: '8',
                    },
                    '6': {
                        s: '2',
                        v: 8,
                        m: '8',
                    },
                },
                '1': {
                    '0': {
                        v: 1,
                        m: '1',
                    },
                    '1': {
                        v: 1,
                        m: '1',
                    },
                    '2': {
                        v: 80,
                        m: '80',
                        s: '3',
                    },
                    '3': {
                        v: '富文本编辑',
                        m: '富文本编辑',
                        s: '2',
                    },
                },
                '2': {
                    '0': {
                        v: 1111,
                        m: '1111',
                    },
                    '1': {
                        v: 1111,
                        m: '1111',
                    },
                    '5': {
                        s: '1',
                        v: 8,
                        m: '8',
                    },
                    '6': {
                        s: '1',
                        v: 8,
                        m: '8',
                    },
                    '7': {
                        s: '1',
                        v: 8,
                        m: '8',
                    },
                    '8': {
                        s: '1',
                        v: 8,
                        m: '8',
                    },
                },
                '3': {
                    '0': {
                        v: 1111,
                        m: '1111',
                    },
                    '1': {
                        v: 1111,
                        m: '1111',
                    },
                },
                '10': {
                    '9': {
                        v: 1111,
                        s: '2',
                        m: '1111',
                    },
                },
                '13': {
                    '9': {
                        v: 1111,
                        s: '4',
                        m: '1111',
                    },
                },
                '17': {
                    '3': {
                        v: '做移动端开发和前端开发的人员，对 MVC、MVP、MVVM 这几个名词应该都不陌生，这是三个最常用的应用架构模式，目的都是为了将业务和视图的实现代码分离',
                        s: '3',
                        p: richTextTest,
                    },
                },
                '20': {
                    '10': {
                        v: '北京马拉松组委会办公室一位接电话的女士证实，的确有这项规定，她还称2014年马拉松的预登记工作将在本周启动。北京马拉松比赛将在10月19日举行。',
                        s: '3',
                    },
                    '12': {
                        s: '4',
                    },
                },
                '29': {
                    '13': {
                        p: Tools.deepClone(richTextTest),
                        s: '4',
                    },
                },
                '32': {
                    '3': {
                        p: richTextTestFloat,
                        s: '5',
                    },
                },
            },
            name: 'sheet1',
            tabColor: 'red',
            hidden: BooleanNumber.FALSE,
            freezeColumn: 1,
            rowCount: 1000,
            columnCount: 20,
            freezeRow: 1,
            zoomRatio: 1,
            scrollTop: 200,
            scrollLeft: 100,
            defaultColumnWidth: 93,
            defaultRowHeight: 27,
            mergeData: [
                {
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                },
                {
                    startRow: 2,
                    endRow: 6,
                    startColumn: 5,
                    endColumn: 10,
                },
                {
                    startRow: 10,
                    endRow: 12,
                    startColumn: 9,
                    endColumn: 12,
                },
                {
                    startRow: 10,
                    endRow: 12,
                    startColumn: 9,
                    endColumn: 12,
                },
                {
                    startRow: 17,
                    endRow: 21,
                    startColumn: 3,
                    endColumn: 6,
                },
                {
                    startRow: 13,
                    endRow: 15,
                    startColumn: 9,
                    endColumn: 10,
                },
                {
                    startRow: 24,
                    endRow: 27,
                    startColumn: 9,
                    endColumn: 10,
                },
                {
                    startRow: 32,
                    endRow: 53,
                    startColumn: 3,
                    endColumn: 5,
                },
            ],
            rowData: {
                '3': {
                    h: 50,
                    hd: BooleanNumber.FALSE,
                },
                '4': {
                    h: 60,
                    hd: BooleanNumber.FALSE,
                },
                '29': {
                    h: 200,
                    hd: BooleanNumber.FALSE,
                },
            },
            columnData: {
                '5': {
                    w: 100,
                    hd: BooleanNumber.FALSE,
                },
                '6': {
                    w: 200,
                    hd: BooleanNumber.FALSE,
                },
                '13': {
                    w: 300,
                    hd: BooleanNumber.FALSE,
                },
            },
            status: 1,
            showGridlines: 1,
            hideRow: [],
            hideColumn: [],
            rowTitle: {
                width: 46,
                hidden: BooleanNumber.FALSE,
            },
            columnTitle: {
                height: 20,
                hidden: BooleanNumber.FALSE,
            },
            selections: ['A2'],
            rightToLeft: BooleanNumber.FALSE,
            pluginMeta: {},
            // metaData: [],
        },
        'sheet-02': {
            type: SheetTypes.GRID,
            id: 'sheet-02',
            name: 'sheet2',
            cellData: {
                '0': {
                    '0': {
                        s: '1',
                        v: 1,
                        m: '1',
                    },
                    '1': {
                        s: '1',
                        v: 1,
                        m: '1',
                    },
                    '5': {
                        s: '1',
                        v: 8,
                        m: '8',
                    },
                    '6': {
                        s: '2',
                        v: 8,
                        m: '8',
                    },
                },
                '20': {
                    '0': {
                        v: 'sheet2',
                        m: 'sheet2',
                    },
                    '1': {
                        v: 'sheet2 - 2',
                        m: 'sheet2 - 2',
                    },
                },
            },
        },
        'sheet-03': {
            type: SheetTypes.GRID,
            id: 'sheet-03',
            name: 'sheet3',
        },
        'sheet-04': {
            type: SheetTypes.GRID,
            id: 'sheet-04',
            name: 'sheet4',
        },
        'sheet-05': {
            type: SheetTypes.GRID,
            id: 'sheet-05',
            name: 'sheet5',
        },
        'sheet-06': {
            type: SheetTypes.GRID,
            id: 'sheet-06',
            name: 'sheet6',
        },
    },
    namedRanges: [],
};
/**
 * Default workbook data
 */
export const DEFAULT_WORKBOOK_DATA_DOWN: IWorkbookConfig = {
    id: 'workbook-02',
    theme: 'default',
    locale: LocaleType.EN,
    creator: 'univer',
    name: 'universheet',
    skin: 'default',
    socketUrl: '',
    socketEnable: BooleanNumber.FALSE,
    extensions: [],
    sheetOrder: [],
    pluginMeta: {},
    styles: {
        '1': {
            cl: {
                rgb: 'green',
            },
            fs: 16,
            bd: {
                t: {
                    s: BorderStyleTypes.MEDIUM_DASHED,
                    cl: {
                        rgb: 'black',
                    },
                },
                l: {
                    s: BorderStyleTypes.MEDIUM_DASHED,
                    cl: {
                        rgb: 'black',
                    },
                },
                r: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'black',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'blue',
                    },
                },
            },
            ht: 3,
        },
        '2': {
            bg: {
                rgb: 'rgb(2, 200, 0)',
            },
            fs: 24,
        },
        '3': {
            ht: HorizontalAlign.RIGHT,
            vt: VerticalAlign.TOP,
            tb: WrapStrategy.WRAP,
            // va: BaselineOffset.SUPERSCRIPT,
            // cl: {
            //     rgb: 'rgb(0, 255, 0)',
            // },
            // st: {
            //     s: BooleanNumber.TRUE, // show
            // },
            bg: {
                rgb: 'rgb(255, 255, 0)',
            },
            tr: {
                a: 45,
                v: BooleanNumber.FALSE,
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'black',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'black',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'black',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'red',
                    },
                },
            },
        },
        '4': {
            bg: {
                rgb: 'rgb(0, 0, 255)',
            },
        },
    },
    timeZone: 'GMT+8',
    createdTime: '2021-11-28 12:10:10',
    modifiedTime: '2021-11-29 12:10:10',
    appVersion: '3.0.0-alpha',
    lastModifiedBy: 'univer',
    sheets: {
        'sheet-0001': {
            type: SheetTypes.GRID,
            id: 'sheet-0001',
            cellData: {
                '0': {
                    '0': {
                        s: '1',
                        v: 2,
                        m: '2',
                    },
                    '1': {
                        s: '1',
                        v: 1,
                        m: '1',
                    },
                    '5': {
                        s: '1',
                        v: 8,
                        m: '8',
                    },
                    '6': {
                        s: '2',
                        v: 8,
                        m: '8',
                    },
                },
                '1': {
                    '0': {
                        v: 22,
                        m: '22',
                    },
                    '1': {
                        v: 22,
                        m: '22',
                    },
                    '2': {
                        v: 80,
                        m: '80',
                        s: '3',
                    },
                    '3': {
                        v: '富文本编辑',
                        m: '富文本编辑',
                        s: '2',
                    },
                },
                '2': {
                    '0': {
                        v: 2222,
                        m: '2222',
                    },
                    '1': {
                        v: 2222,
                        m: '2222',
                    },
                    '5': {
                        s: '1',
                        v: 8,
                        m: '8',
                    },
                    '6': {
                        s: '1',
                        v: 8,
                        m: '8',
                    },
                    '7': {
                        s: '1',
                        v: 8,
                        m: '8',
                    },
                    '8': {
                        s: '1',
                        v: 8,
                        m: '8',
                    },
                },
                '3': {
                    '0': {
                        v: 1111,
                        m: '1111',
                    },
                    '1': {
                        v: 1111,
                        m: '1111',
                    },
                },
                '10': {
                    '9': {
                        v: 1111,
                        s: '2',
                        m: '1111',
                    },
                },
                '13': {
                    '9': {
                        v: 1111,
                        s: '4',
                        m: '1111',
                    },
                },
                '17': {
                    '3': {
                        v: '做移动端开发和前端开发的人员，对 MVC、MVP、MVVM 这几个名词应该都不陌生，这是三个最常用的应用架构模式，目的都是为了将业务和视图的实现代码分离',
                        s: '3',
                        p: richTextTest,
                    },
                },
                '20': {
                    '10': {
                        v: '北京马拉松组委会办公室一位接电话的女士证实，的确有这项规定，她还称2014年马拉松的预登记工作将在本周启动。北京马拉松比赛将在10月19日举行。',
                        s: '3',
                    },
                    '12': {
                        s: '4',
                    },
                },
                '29': {
                    '13': {
                        p: Tools.deepClone(richTextTest),
                        s: '4',
                    },
                },
            },
            name: 'sheet0001',
            tabColor: 'green',
            hidden: BooleanNumber.FALSE,
            freezeColumn: 1,
            rowCount: 1000,
            columnCount: 20,
            freezeRow: 1,
            zoomRatio: 1,
            scrollTop: 200,
            scrollLeft: 100,
            defaultColumnWidth: 93,
            defaultRowHeight: 27,
            mergeData: [
                {
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                },
                {
                    startRow: 2,
                    endRow: 6,
                    startColumn: 5,
                    endColumn: 10,
                },
                {
                    startRow: 10,
                    endRow: 12,
                    startColumn: 9,
                    endColumn: 12,
                },
                {
                    startRow: 10,
                    endRow: 12,
                    startColumn: 9,
                    endColumn: 12,
                },
                {
                    startRow: 17,
                    endRow: 21,
                    startColumn: 3,
                    endColumn: 6,
                },
                {
                    startRow: 13,
                    endRow: 15,
                    startColumn: 9,
                    endColumn: 10,
                },
                {
                    startRow: 24,
                    endRow: 27,
                    startColumn: 9,
                    endColumn: 10,
                },
            ],
            rowData: {
                '3': {
                    h: 50,
                    hd: BooleanNumber.FALSE,
                },
                '4': {
                    h: 60,
                    hd: BooleanNumber.FALSE,
                },
                '29': {
                    h: 200,
                    hd: BooleanNumber.FALSE,
                },
            },
            columnData: {
                '5': {
                    w: 100,
                    hd: BooleanNumber.FALSE,
                },
                '6': {
                    w: 200,
                    hd: BooleanNumber.FALSE,
                },
                '13': {
                    w: 300,
                    hd: BooleanNumber.FALSE,
                },
            },
            status: 1,
            showGridlines: 1,
            hideRow: [],
            hideColumn: [],
            rowTitle: {
                width: 46,
                hidden: BooleanNumber.FALSE,
            },
            columnTitle: {
                height: 20,
                hidden: BooleanNumber.FALSE,
            },
            selections: ['A2'],
            rightToLeft: BooleanNumber.FALSE,
            pluginMeta: {},
            // metaData: [],
        },
        'sheet-0002': {
            type: SheetTypes.GRID,
            id: 'sheet-0002',
            name: 'sheet0003',
        },
    },
    namedRanges: [],
};
