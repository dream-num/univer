/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IDocumentData } from '@univerjs/core';
import { BooleanNumber, DocumentFlavor } from '@univerjs/core';
import { ptToPixel } from '@univerjs/engine-render';

export const DEFAULT_DOCUMENT_DATA_CN: IDocumentData = {
    id: 'd',
    tables: {},
    drawings: {
        // shapeTest1: {
        //     unitId: 'd',
        //     subUnitId: 'd',
        //     drawingType: DrawingTypeEnum.DRAWING_SHAPE,
        //     drawingId: 'shapeTest1',
        //     title: 'test shape',
        //     description: 'test shape',
        //     docTransform: {
        //         size: {
        //             width: 1484 * 0.12,
        //             height: 864 * 0.15,
        //         },
        //         positionH: {
        //             relativeFrom: ObjectRelativeFromH.MARGIN,
        //             posOffset: 100,
        //         },
        //         positionV: {
        //             relativeFrom: ObjectRelativeFromV.PAGE,
        //             posOffset: 230,
        //         },
        //         angle: 0,
        //     },
        //     layoutType: PositionedObjectLayoutType.WRAP_NONE,
        //     behindDoc: BooleanNumber.TRUE,
        //     wrapText: WrapTextType.BOTH_SIDES,
        //     distT: 0,
        //     distB: 0,
        //     distL: 0,
        //     distR: 0,
        // },
        // shapeTest2: {
        //     unitId: 'd',
        //     subUnitId: 'd',
        //     drawingType: DrawingTypeEnum.DRAWING_SHAPE,
        //     drawingId: 'shapeTest2',
        //     title: 'test shape',
        //     description: 'test shape',
        //     docTransform: {
        //         size: {
        //             width: 1484 * 0.3,
        //             height: 864 * 0.3,
        //         },
        //         positionH: {
        //             relativeFrom: ObjectRelativeFromH.PAGE,
        //             posOffset: 100,
        //         },
        //         positionV: {
        //             relativeFrom: ObjectRelativeFromV.PARAGRAPH,
        //             posOffset: 20,
        //         },
        //         angle: 0,
        //     },
        //     layoutType: PositionedObjectLayoutType.WRAP_NONE,
        //     behindDoc: BooleanNumber.FALSE,
        //     wrapText: WrapTextType.BOTH_SIDES,
        // },
        // shapeTest3: {
        //     unitId: 'd',
        //     subUnitId: 'd',
        //     drawingType: DrawingTypeEnum.DRAWING_SHAPE,
        //     drawingId: 'shapeTest3',
        //     title: 'test shape',
        //     description: 'test shape',
        //     docTransform: {
        //         size: {
        //             width: 1484 * 0.3,
        //             height: 864 * 0.3,
        //         },
        //         positionH: {
        //             relativeFrom: ObjectRelativeFromH.PAGE,
        //             posOffset: 100,
        //         },
        //         positionV: {
        //             relativeFrom: ObjectRelativeFromV.PARAGRAPH,
        //             posOffset: 200,
        //         },
        //         angle: 0,
        //     },
        //     layoutType: PositionedObjectLayoutType.INLINE,
        //     behindDoc: BooleanNumber.FALSE,
        //     wrapText: WrapTextType.BOTH_SIDES,
        // },
        // shapeTest4: {
        //     unitId: 'd',
        //     subUnitId: 'd',
        //     drawingType: DrawingTypeEnum.DRAWING_SHAPE,
        //     drawingId: 'shapeTest4',
        //     title: 'test shape',
        //     description: 'test shape',
        //     docTransform: {
        //         size: {
        //             width: 1484 * 0.3,
        //             height: 864 * 0.3,
        //         },
        //         positionH: {
        //             relativeFrom: ObjectRelativeFromH.PAGE,
        //             posOffset: 100,
        //         },
        //         positionV: {
        //             relativeFrom: ObjectRelativeFromV.LINE,
        //             posOffset: 200,
        //         },
        //         angle: 0,
        //     },
        //     layoutType: PositionedObjectLayoutType.INLINE,
        //     behindDoc: BooleanNumber.FALSE,
        //     wrapText: WrapTextType.BOTH_SIDES,
        // },
        // shapeTest5: {
        //     unitId: 'd',
        //     subUnitId: 'd',
        //     drawingType: DrawingTypeEnum.DRAWING_SHAPE,
        //     drawingId: 'shapeTest5',
        //     title: 'test shape',
        //     description: 'test shape',
        //     docTransform: {
        //         size: {
        //             width: 1484 * 0.3,
        //             height: 864 * 0.3,
        //         },
        //         positionH: {
        //             relativeFrom: ObjectRelativeFromH.PAGE,
        //             posOffset: 100,
        //         },
        //         positionV: {
        //             relativeFrom: ObjectRelativeFromV.PAGE,
        //             posOffset: 200,
        //         },
        //         angle: 0,
        //     },
        //     layoutType: PositionedObjectLayoutType.INLINE,
        //     behindDoc: BooleanNumber.FALSE,
        //     wrapText: WrapTextType.BOTH_SIDES,
        // },
        // zYeeTi: {
        //     unitId: 'd',
        //     subUnitId: 'd',
        //     drawingId: 'zYeeTi',
        //     drawingType: 0,
        //     imageSourceType: 'BASE64',
        //     source: 'data:image/jpeg;base64,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',
        //     docTransform: {
        //         size: {
        //             width: 239,
        //             height: 211,
        //         },
        //         angle: 0,
        //         positionH: {
        //             relativeFrom: 0,
        //             posOffset: 256,
        //         },
        //         positionV: {
        //             relativeFrom: ObjectRelativeFromV.PARAGRAPH,
        //             posOffset: 100,
        //         },
        //     },
        //     behindDoc: 0,
        //     title: '',
        //     description: '',
        //     wrapText: 0,
        //     distB: 0,
        //     distL: 0,
        //     distR: 0,
        //     distT: 0,
        //     layoutType: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
        // },
    },
    drawingsOrder: [
        // 'zYeeTi',
    ],
    headers: {},
    footers: {},
    body: {
        dataStream:
            '荷塘月色\r\r作者：朱自清\r\r这几天心里颇不宁静。今晚在院子里坐着乘凉，忽然想起日日走过的荷塘，在这满月的光里，总该另有一番样子吧。月亮渐渐地升高了，墙外马路上孩子们的欢笑，已经听不见了；妻在屋里拍着闰儿，迷迷糊糊地哼着眠歌。我悄悄地披了大衫，带上门出去。\r\r沿着荷塘，是一条曲折的小煤屑路。这是一条幽僻的路；白天也少人走，夜晚更加寂寞。荷塘四面，长着许多树，蓊蓊郁郁的。路图片一片是些杨柳，和一些不知道名字的树。没有月光的晚上，这路上阴森森的，有些怕人。今晚却很好，虽然月光也还是淡淡的。\r\r路上只我一个人，背着手踱着。这一片天地好像是我的；我也像超出了平常的自己，到了另一个世界里。我爱热闹，也爱冷静；爱群居，也爱独处。像今晚上，一个人在这苍茫的月下，什么都可以想，什么都可以不想，便觉是个自由的人。白天里一定要做的事，一定要说的话是现在都可不理。这是独处的妙处，我且受用这无边的荷香月色好了。\r\r曲曲折折的荷塘上面，弥望的是田田的叶子。叶子出水很高，像亭亭的舞女的裙。层层的叶子中间，零星地点缀着些白花，有袅娜地开着的，有羞涩地打着朵儿的；正如一粒粒的明珠，又如碧天里的星星，又如刚出浴的美人。微风过处，送来缕缕清香，仿佛远处高楼上渺茫的歌声似的。这时候叶子与花也有一丝的颤动，像闪电般，霎时传过荷塘的那边去了。叶子本是肩并肩密密地挨着，这便宛然有了一道凝碧的波痕。叶子底下是脉脉的流水，遮住了，不能见一些颜色；而叶子却更见风致了。\r\r月光如流水一般，静静地泻在这一片叶子和花上。薄薄的青雾浮起在荷塘里。叶子和花仿佛在牛乳中洗过一样，又像笼着轻纱的梦。虽然是满月，天上却有一层淡淡的云，所以不能朗照；但我以为这恰是到了好处——酣眠固不可少，小睡也别有风味的。月光是隔了树照过来的，高处丛生的灌木，落下参差的斑驳的黑影，峭楞楞如鬼一般；弯弯的杨柳的稀疏的倩影，却又像是画在荷叶上。塘中的月色并不均匀；但光与影有着和谐的旋律，如梵婀玲上奏着的名曲。\r\r荷塘的四面，远远近近，高高低低都是树，而杨柳最多。这些树将一片荷塘重重围住；只在小路一旁，漏着几段空隙，像是特为月光留下的。树色一例是阴阴的，乍看像一团烟雾；但杨柳的丰姿，便在烟雾里也辨得出。树梢上隐隐约约的是一带远山，只有些大意罢了。树缝里也漏着一两点路灯光，没精打采的，是渴睡人的眼。这时候最热闹的，要数树上的蝉声与水里的蛙声；但热闹是它们的，我什么也没有。\r\r忽然想起采莲的事情来了。采莲是江南的旧俗，似乎很早就有，而六朝时为盛；从诗歌里可以约略知道。采莲的是少年的女子，她们是荡着小船，唱着艳歌去的。采莲人不用说很多，还有看采莲的人。那是一个热闹的季节，也是一个风流的季节。梁元帝《采莲赋》里说得好：\r\r于是妖童女，荡舟心许；鷁首徐回，兼传羽杯；櫂将移而藻挂，船欲动而萍开。尔其纤腰束素，迁延顾步；夏始春余，叶嫩花初，恐沾裳而浅笑，畏倾船而敛裾。\r\r可见当时嬉游的光景了。这真是有趣的事，可惜我们现在早已无福消受了。\r\r于是又记起，《西洲曲》里的句子：\r\r采莲南塘秋，莲花过人头；低头弄莲子，莲子清如水。\r\r今晚若有采莲人，这儿的莲花也算得“过人头”了；只不见一些流水的影子，是不行的。这令我到底惦着江南了。——这样想着，猛一抬头，不觉已是自己的门前；轻轻地推门进去，什么声息也没有，妻已睡熟好久了。\r\r一九二七年七月，北京清华园。\r\r\r\r《荷塘月色》语言朴素典雅，准确生动，贮满诗意，满溢着朱自清的散文语言一贯有朴素的美，不用浓墨重彩，画的是淡墨水彩。\r\r朱自清先生一笔写景一笔说情，看起来松散不知所云，可仔细体会下，就能感受到先生在字里行间表述出的苦闷，而随之读者也被先生的文字所感染，被带进了他当时那苦闷而无法明喻的心情。这就是优异散文的必须品质之一。\r\r扩展资料：\r一首长诗《毁灭》奠定了朱自清在文坛新诗人的地位，而《桨声灯影里的秦淮河》则被公认为白话美文的典范。朱自清用白话美文向复古派宣战，有力地回击了复古派“白话不能作美文”之说，他是“五四”新文学运动的开拓者之一。\r\r朱自清的美文影响了一代又一代人。作家贾平凹说：来到扬州，第一个想到的人是朱自清，他是知识分子中最最了不起的人物。\r\r实际上，朱自清的写作路程是非常曲折的，他早期的时候大多数作品都是诗歌，但是他的诗歌和我国古代诗人的诗有很大区别，他的诗是用白话文写的，这其实也是他写作的惯用风格。\r\r后来，朱自清开始写一些关于社会的文章，因为那个时候社会比较混乱，这时候的作品大多抨击社会的黑暗面，文体风格大多硬朗，基调伉俪。到了后期，大多是写关于山水的文章，这类文章的写作格调大多以清丽雅致为主。\r\r朱自清的写作风格虽然在不同的时期随着他的人生阅历和社会形态的不同而发生着变化，但是他文章的主基调是没有变的，他这一生，所写的所有文章风格上都有一个非常显著的特点，那就是简约平淡，他不是类似古代花间词派的诗人们，不管是他的诗词还是他的文章从来都不用过于华丽的辞藻，他崇尚的是平淡。\r\r英国友人戴立克试过英译朱自清几篇散文，译完一读显得单薄，远远不如原文流利。他不服气，改用稍微古奥的英文重译，好多了：“那是说，朱先生外圆内方，文字尽管浅白，心思却很深沉，译笔只好朝深处经营。”朱自清的很多文章，譬如《背影》《祭亡妇》，读来自有一番只可意会不可言传的东西。\r\r平淡就是朱自清的写作风格。他不是豪放派的作家，他在创作的时候钟情于清新的风格，给人耳目一新的感觉。在他的文章中包含了他对生活的向往，由此可见他的写作风格和他待人处事的态度也是有几分相似的。他的文章非常优美，但又不会让人觉得狭隘，给人一种豁达渊博的感觉，这就是朱自清的写作风格，更是朱自清的为人品质。\r\r写有《荷塘月色》《背影》等名篇的著名散文家朱自清先生，不仅自己一生风骨正气，还用无形的家风涵养子孙。良好的家风家规意蕴深远，催人向善，是凝聚情感、涵养德行、砥砺成才的人生信条。“北有朱自清，南有朱物华，一文一武，一南一北，双星闪耀”，这是中国知识界、教育界对朱家两兄弟的赞誉。\r\r朱自清性格温和，为人和善，对待年轻人平易近人，是个平和的人。他取字“佩弦”，意思要像弓弦那样将自己绷紧，给人的感觉是自我要求高，偶尔有呆气。朱自清教学负责，对学生要求严格，修他的课的学生都受益不少。\r\r1948 年 6 月，患胃病多年的朱自清，在《抗议美国扶日政策并拒绝领取美援面粉宣言》上，一丝不苟地签下了自己的名字。随后，朱自清还将面粉配购证以及面粉票退了回去。1948 年 8 月 12 日，朱自清因不堪胃病折磨，离开人世。在新的时代即将到来时，朱自清却匆匆地离人们远去。他为人们留下了无数经典的诗歌和文字，还有永不屈服的精神。\r\r朱自清没有豪言壮语，他只是用坚定的行动、朴实的语言，向世人展示了中国知识分子在祖国危难之际坚定的革命性，体现了中国人的骨气，表现了无比高贵的民族气节，呈现了人生最有价值的一面，谱就了生命中最华丽的乐章。\r\r他以“自清”为名，自勉在困境中不丧志；他身患重病，至死拒领美援面粉，其气节令世人感佩；他的《背影》《荷塘月色》《匆匆》脍炙人口；他的文字追求“真”，没有半点矫饰，却蕴藏着动人心弦的力量。\r\r朱自清不但在文学创作方面有很高的造诣，也是一名革命民主主义战士，在反饥饿、反内战的斗争中，他始终保持着一个正直的爱国知识分子的气节和情操。毛泽东对朱自清宁肯饿死不领美国“救济粉”的精神给予称赞，赞扬他“表现了我们民族的英雄气概”。\r\n',
        textRuns: [
            {
                st: 0,
                ed: 4,
                ts: {
                    fs: 20,
                    ff: 'Microsoft YaHei',
                    cl: {
                        rgb: 'rgb(255, 255, 255)',
                    },
                    bl: BooleanNumber.TRUE,
                    bg: {
                        rgb: '#FF6670',
                    },
                    it: BooleanNumber.TRUE,
                },
            },
            {
                st: 6,
                ed: 9,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei',
                    cl: {
                        rgb: 'rgb(30, 30, 30)',
                    },
                    bl: BooleanNumber.FALSE,
                },
            },
            {
                st: 9,
                ed: 12,
                ts: {
                    fs: 16,
                    ff: 'Microsoft YaHei',
                    cl: {
                        rgb: 'rgb(30, 30, 30)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 14,
                ed: 3064,
                ts: {
                    fs: 12,
                    ff: 'Microsoft YaHei',
                    cl: {
                        rgb: 'rgb(30, 30, 30)',
                    },
                    bl: BooleanNumber.FALSE,
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 4,
                paragraphStyle: {
                    spaceAbove: { v: 0 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 5,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 12,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 13,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 127,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                    // hanging: 20,
                    // indentStart: 50,
                    // indentEnd: 50,
                    // indentFirstLine: 50,
                },
            },
            {
                startIndex: 128,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 244,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 245,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 398,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 399,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 618,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 619,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 824,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 825,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1007,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1008,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1130,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1131,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1203,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1204,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1238,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1239,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1256,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1257,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1282,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1283,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1380,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1381,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1396,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1397,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1398,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1399,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1457,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1458,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1559,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1560,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1566,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1670,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1671,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1728,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1729,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1811,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1812,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1912,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 1913,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2053,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2054,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2190,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2191,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2341,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2342,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2481,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2482,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2582,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2583,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2750,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2751,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2853,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2854,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2948,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 2949,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 3065,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
        ],
        sectionBreaks: [
            {
                startIndex: 3066,
                // columnProperties: [
                //     {
                //         width: ptToPixel(240),
                //         paddingEnd: ptToPixel(15),
                //     },
                // ],
                // columnSeparatorType: ColumnSeparatorType.NONE,
                // sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
                // textDirection: textDirectionDocument,
                // contentDirection: textDirection!,
            },
        ],
        customBlocks: [
            // {
            //     startIndex: 189,
            //     blockId: 'shapeTest1',
            // },
            // {
            //     startIndex: 367,
            //     blockId: 'shapeTest2',
            // },
            // {
            //     startIndex: 489,
            //     blockId: 'shapeTest3',
            // },
            // {
            //     startIndex: 668,
            //     blockId: 'shapeTest4',
            // },
            // {
            //     startIndex: 962,
            //     blockId: 'shapeTest5',
            // },
            // {
            //     blockId: 'zYeeTi',
            //     startIndex: 463,
            // },
        ],
    },
    documentStyle: {
        pageSize: {
            width: ptToPixel(595),
            height: ptToPixel(842),
        },
        documentFlavor: DocumentFlavor.TRADITIONAL,
        marginTop: ptToPixel(50),
        marginBottom: ptToPixel(50),
        marginRight: ptToPixel(50),
        marginLeft: ptToPixel(50),
        renderConfig: {
            vertexAngle: 0,
            centerAngle: 0,
        },
        defaultHeaderId: '',
        defaultFooterId: '',
        evenPageHeaderId: '',
        evenPageFooterId: '',
        firstPageHeaderId: '',
        firstPageFooterId: '',
        evenAndOddHeaders: BooleanNumber.FALSE,
        useFirstPageHeaderFooter: BooleanNumber.FALSE,
        marginHeader: 30,
        marginFooter: 30,
    },
};
