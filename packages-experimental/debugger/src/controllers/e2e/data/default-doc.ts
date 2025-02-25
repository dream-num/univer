/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

// eslint-disable-next-line max-lines-per-function
export function getDefaultDocData(): IDocumentData {
    const DEFAULT_DOCUMENT_DATA_CN: IDocumentData = {
        id: 'd',
        tableSource: {},
        drawings: {},
        drawingsOrder: [],
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
            customBlocks: [],
            tables: [],
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
    return DEFAULT_DOCUMENT_DATA_CN;
}
