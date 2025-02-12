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

import type {
    IBorderData,
    ICellData,
    IDocumentData,
    IKeyValue,
    IRange,
    IStyleData,
    ITextDecoration,
    ITextRun,
} from '@univerjs/core';
import { BaselineOffset, BorderStyleTypes, ColorKit, getBorderStyleType, Tools } from '@univerjs/core';
import { ptToPx } from '@univerjs/engine-render';

import { textTrim } from './util';

const PX_TO_PT_RATIO = 0.75;
const MAX_FONT_SIZE = 78;
const MIN_FONT_SIZE = 9;
export const DEFAULT_BACKGROUND_COLOR_RGBA = 'rgba(0,0,0,0)';
export const DEFAULT_BACKGROUND_COLOR_RGB = 'rgb(0,0,0)';

// TODO: move to Utils
/**
 * The entire list of DOM spans is parsed into a rich-text JSON style sheet
 * @param $dom
 * @returns
 */
// eslint-disable-next-line max-lines-per-function
export function handleDomToJson($dom: HTMLElement): IDocumentData | string {
    let nodeList = $dom.childNodes; // skip container itself

    // no node list
    if (nodeList.length === 0) {
        return $dom.textContent as string;
    }

    // skip first div
    if (nodeList[0].nodeName === 'DIV') {
        nodeList = nodeList[0].childNodes;
    }

    // 普通单元格，非富文本
    if (nodeList.length === 1 && nodeList[0].nodeName === '#text') {
        return nodeList[0].textContent as string;
    }
    const textRuns: ITextRun[] = [];
    let st = 0;
    let ed = 0;
    let dataStream = $dom.textContent || '';
    dataStream += '\r\n';

    for (let i = 0; i < nodeList.length; i++) {
        let span = nodeList[`${i}`] as HTMLElement;
        let str: string;
        if (span.nodeName === '#text') {
            str = span.textContent ?? '';
            span = span.parentElement!;
        } else {
            str = span.innerText;
        }
        const textStyle = handleStringToStyle(span);

        // let str = span.innerText;
        const spanTexts = splitSpanText(str);

        spanTexts.forEach((item) => {
            const length = item.length;
            ed += length;
            st = ed - length;
            const sId = Tools.generateRandomId(6);

            textRuns.push({
                sId,
                st,
                ed: ed - 1,
                ts: textStyle,
            });
            // // 如果有 \n 说明有换行，另起一段
            // if (item.includes('\n')) {
            //     const pStart = cot.length > 0 ? cot[cot.length].ed : 0;
            //     block = {
            //         st: pStart,
            //         ed: pStart + ele[ele.length - 1].ed,
            //         blockType: BlockType.CUSTOM,
            //         paragraph: {
            //             elements: ele,
            //         },
            //     };
            //     cot.push(block);
            // } else if (cot.length > 0) {
            //     cot[cot.length - 1].ed = paragraphElement.ed;
            // } else {
            // const pStart = cot.length > 0 ? cot[cot.length].ed : 0;
            // block = {
            //     st: pStart,
            //     ed: paragraphElement.ed,
            //     blockType: BlockType.CUSTOM,
            //     paragraph: {
            //         elements: ele,
            //     },
            // };

            // cot.push(block);
            // }
        });
    }

    const blockId = Tools.generateRandomId(6);
    const p: IDocumentData = {
        id: Tools.generateRandomId(6),
        body: {
            dataStream,
            textRuns,
        },
        documentStyle: {},
    };

    return p;
}

/**
 * A single span parses out the ITextStyle style sheet
 * @param $dom
 * @returns
 */
export function handleStringToStyle($dom?: HTMLElement, cssStyle: string = '') {
    let cssText = $dom?.style?.cssText ?? '';
    cssText += cssStyle;
    cssText = cssText.replace(/[\r\n]+/g, '');
    if (cssText.length === 0) {
        return {};
    }
    const cssTextArray = cssText.split(';');
    const styleList: IStyleData & Record<string, unknown> = {};

    const borderInfo = {
        t: '',
        r: '',
        b: '',
        l: '',
    };

    cssTextArray.forEach((originStr) => {
        const s = originStr.toLowerCase();
        const key = textTrim(s.substr(0, s.indexOf(':')));
        const value = textTrim(s.substr(s.indexOf(':') + 1));

        // bold
        if (key === 'font-weight') {
            if (value === 'bold' || value === '700') {
                styleList.bl = 1;
            } else {
                styleList.bl = 0;
            }
        }
        // italic
        else if (key === 'font-style') {
            if (value === 'italic') {
                styleList.it = 1;
            } else {
                styleList.it = 0;
            }
        }
        // font family
        else if (key === 'font-family') {
            const trimValue = textTrim(originStr);
            const fontFamily = extractFontFamily(trimValue);
            styleList.ff = fontFamily;
        }
        // font size
        else if (key === 'font-size') {
            let fs = Number.parseInt(value);

            // Double the font size for superscripts and subscripts
            if (
                cssText.indexOf('vertical-align') > -1 &&
                (cssText.indexOf('sub') > -1 || cssText.indexOf('sup') > -1)
            ) {
                fs *= 2;
            }

            // px to pt TODO@Dushusir: px or pt?
            if (value.indexOf('px') !== -1) {
                fs = getPtFontSizeByPx(Number.parseInt(value, 10));
            }

            styleList.fs = fs;
        }
        // font color
        else if (key === 'color') {
            const colorKit = new ColorKit(value);
            styleList.cl = {
                rgb: colorKit.isValid ? colorKit.toRgbString() : 'rgb(0,0,0)',
            };
        }
        // fill color / background
        else if (key === 'background' || key === 'background-color') {
            const backgroundColor = new ColorKit(value);
            if (backgroundColor) {
                const backgroundStr = backgroundColor.toRgbString();
                if (backgroundStr !== DEFAULT_BACKGROUND_COLOR_RGBA && backgroundStr !== DEFAULT_BACKGROUND_COLOR_RGB) {
                    styleList.bg = {
                        rgb: backgroundColor.toRgbString(),
                    };
                }
            }
        }

        // text line type
        else if (key === 'text-decoration-line') {
            // underline
            if (value === 'underline') {
                if (!styleList.ul) {
                    styleList.ul = { s: 1 };
                }
                styleList.ul.s = 1;
            }

            // line through
            else if (value === 'line-through') {
                if (!styleList.st) {
                    styleList.st = { s: 1 };
                }
                styleList.st.s = 1;
            }
            // overline
            else if (value === 'overline') {
                if (!styleList.ol) {
                    styleList.ol = { s: 1 };
                }
                styleList.ol.s = 1;
            }
        }

        // text line color
        else if (key === 'text-decoration-color') {
            if (styleList.hasOwnProperty('ul')) {
                if (!styleList.ul) {
                    styleList.ul = { s: 1, cl: { rgb: value } };
                }
                (styleList.ul as ITextDecoration).cl = {
                    rgb: value,
                };
            }
            if (styleList.hasOwnProperty('st')) {
                if (!styleList.st) {
                    styleList.st = { s: 1, cl: { rgb: value } };
                }
                (styleList.st as ITextDecoration).cl = {
                    rgb: value,
                };
            }
            if (styleList.hasOwnProperty('ol')) {
                if (!styleList.ol) {
                    styleList.ol = { s: 1, cl: { rgb: value } };
                }
                (styleList.ol as ITextDecoration).cl = {
                    rgb: value,
                };
            }
        }

        // text line style
        else if (key === 'text-decoration-style') {
            if (styleList.hasOwnProperty('ul')) {
                if (!styleList.ul) {
                    styleList.ul = { s: 1, t: Number(value) };
                }
                (styleList.ul as ITextDecoration).t = Number(value);
            }
            if (styleList.hasOwnProperty('st')) {
                if (!styleList.st) {
                    styleList.st = { s: 1, t: Number(value) };
                }
                (styleList.st as ITextDecoration).t = Number(value);
            }
            if (styleList.hasOwnProperty('ol')) {
                if (!styleList.ol) {
                    styleList.ol = { s: 1, t: Number(value) };
                }
                (styleList.ol as ITextDecoration).t = Number(value);
            }
        }

        // line through
        else if (key === 'text-decoration' || key === 'univer-strike') {
            const lineValue = value.split(' ')?.[0];
            if (lineValue === 'underline') {
                if (!styleList.ul) {
                    styleList.ul = { s: 1 };
                }
                styleList.ul.s = 1;
            }

            // line through
            else if (lineValue === 'line-through') {
                if (!styleList.st) {
                    styleList.st = { s: 1 };
                }
                styleList.st.s = 1;
            }
            // overline
            else if (lineValue === 'overline') {
                if (!styleList.ol) {
                    styleList.ol = { s: 1 };
                }
                styleList.ol.s = 1;
            }
        }
        // underline
        if (key === 'univer-underline') {
            styleList.ul = {
                s: 1,
            };
        }

        if (key === 'vertical-align') {
            if (value === 'sub') {
                styleList.va = BaselineOffset.SUBSCRIPT;
            } else if (value === 'super') {
                styleList.va = BaselineOffset.SUPERSCRIPT;
            } else if (value === 'top') {
                styleList.vt = 1;
            } else if (value === 'middle') {
                styleList.vt = 2;
            } else if (value === 'bottom') {
                styleList.vt = 3;
            } else {
                styleList.va = BaselineOffset.NORMAL;
            }
        }

        if (key === 'transform') {
            const values = value.split(')');
            const index = values.findIndex((item) => item.includes('rotate'));
            if (index > -1) {
                const match = values[index].match(/\d+/g);
                let angle = 0;
                let ver = 0;
                if (match?.length) {
                    angle = +match[0];
                }
                // 竖排文字
                if ($dom?.dataset.vertical) {
                    ver = +$dom.dataset.vertical;
                }
                styleList.tr = {
                    a: angle,
                    v: ver,
                };
            }
        }

        if (key === 'text-align') {
            if (value === 'left') {
                styleList.ht = 1;
            } else if (value === 'center') {
                styleList.ht = 2;
            } else if (value === 'right') {
                styleList.ht = 3;
            } else if (value === 'justify') {
                styleList.ht = 4;
            } else {
                styleList.ht = 0;
            }
        }

        // wrap text (`white-space` property has a higher priority.)
        if (styleList.tb !== 1) {
            if (key === 'overflow-wrap' || key === 'word-wrap') {
                if (value === 'break-word') {
                    styleList.tb = 3;
                }
            } else if (key === 'text-overflow') {
                if (value === 'clip') {
                    styleList.tb = 2;
                }
            } else if (key === 'text-break') {
                if (value === 'overflow') {
                    styleList.tb = 1;
                }
            }
        }

        if (key === 'white-space') {
            if (value === 'nowrap') {
                styleList.tb = 1;
            } else if (value === 'normal') {
                styleList.tb = 3;
            } else if (value === 'clip') {
                styleList.tb = 2;
            }
        }

        if (key === 'border-color') {
            const colors = handleBorder(value, ')');
            if (!styleList.bd) {
                styleList.bd = {
                    b: {
                        cl: {
                            rgb: '#000',
                        },
                        s: 0,
                    },
                    t: {
                        cl: {
                            rgb: '#000',
                        },
                        s: 0,
                    },
                    l: {
                        cl: {
                            rgb: '#000',
                        },
                        s: 0,
                    },
                    r: {
                        cl: {
                            rgb: '#000',
                        },
                        s: 0,
                    },
                };
                for (const k in colors) {
                    (styleList.bd as IKeyValue)[k].cl.rgb = colors[k as keyof IBorderData];
                }
            } else {
                for (const k in colors) {
                    (styleList.bd as IKeyValue)[k].cl.rgb = colors[k as keyof IBorderData];
                }
            }
        }

        if (key === 'border-width' || key === 'border-style') {
            const width = handleBorder(value, ' ');
            for (const k in width) {
                (borderInfo as IKeyValue)[k] += ` ${width[k as keyof IBorderData]}`;
            }
            if (!styleList.bd) {
                styleList.bd = {
                    b: {
                        cl: {
                            rgb: '#000',
                        },
                        s: getBorderStyleType(borderInfo.b),
                    },
                    t: {
                        cl: {
                            rgb: '#000',
                        },
                        s: getBorderStyleType(borderInfo.t),
                    },
                    l: {
                        cl: {
                            rgb: '#000',
                        },
                        s: getBorderStyleType(borderInfo.l),
                    },
                    r: {
                        cl: {
                            rgb: '#000',
                        },
                        s: getBorderStyleType(borderInfo.r),
                    },
                };
            } else {
                styleList.bd.b!.s = getBorderStyleType(borderInfo.b);
                styleList.bd.t!.s = getBorderStyleType(borderInfo.t);
                styleList.bd.l!.s = getBorderStyleType(borderInfo.l);
                styleList.bd.r!.s = getBorderStyleType(borderInfo.r);
            }
        }

        if (
            key === 'border-bottom' ||
            key === 'border-top' ||
            key === 'border-left' ||
            key === 'border-right' ||
            key === 'border'
        ) {
            if (!styleList.bd) {
                styleList.bd = {};
            }
            const arr = value.split(' ');
            const type = `${arr[0]} ${arr[1]}`;
            arr.splice(0, 2);
            const color = arr.join('');
            const lineType = getBorderStyleType(type);
            if (lineType !== BorderStyleTypes.NONE && color) {
                const obj = {
                    cl: {
                        rgb: color,
                    },
                    s: getBorderStyleType(type),
                };
                if (key === 'border-bottom') {
                    styleList.bd.b = value === 'none' ? null : obj;
                } else if (key === 'border-top') {
                    styleList.bd.t = value === 'none' ? null : obj;
                } else if (key === 'border-left') {
                    styleList.bd.l = value === 'none' ? null : obj;
                } else if (key === 'border-right') {
                    styleList.bd.r = value === 'none' ? null : obj;
                } else if (key === 'border') {
                    styleList.bd = {
                        r: value === 'none' ? null : obj,
                        t: value === 'none' ? null : obj,
                        b: value === 'none' ? null : obj,
                        l: value === 'none' ? null : obj,
                    };
                }
            }
        } else if (key === '--data-rotate') {
            const regex = /[+-]?\d+/;
            const match = value.match(regex);

            if (value === '(0deg ,1)') {
                styleList.tr = { a: 0, v: 1 };
            } else if (match) {
                styleList.tr = { a: Number(match[0]) };
            }
        }

        // if (style.tb === WrapStrategy.CLIP) {
        //     str += `text-overflow: clip; `;
        // } else if (style.tb === WrapStrategy.OVERFLOW) {
        //     str += `text-break: overflow; `;
        // } else if (style.tb === WrapStrategy.WRAP) {
        //     str += `word-wrap: break-word; word-break: normal; `;
        // }
    });

    Object.keys(styleList).forEach((key) => {
        if (typeof styleList[key] === 'object' && !Object.keys(styleList[key] as object).length) {
            delete styleList[key];
        }
    });

    return styleList;
}

function handleBorder(border: string, param: string): IBorderData {
    let arr;
    if (param === ' ') {
        arr = border.trim().split(param);
    } else {
        arr = border.trim().split(param).slice(0, -1);
    }
    arr.forEach((item) => `${item.trim()})`);
    let obj = {};

    if (arr.length === 1) {
        obj = {
            t: arr[0],
            r: arr[0],
            b: arr[0],
            l: arr[0],
        };
    } else if (arr.length === 2) {
        obj = {
            t: arr[0],
            r: arr[1],
            b: arr[0],
            l: arr[1],
        };
    } else if (arr.length === 3) {
        obj = {
            t: arr[0],
            r: arr[1],
            b: arr[2],
            l: arr[1],
        };
    } else if (arr.length === 4) {
        obj = {
            t: arr[0],
            r: arr[1],
            b: arr[2],
            l: arr[3],
        };
    }

    return obj;
}

/**
 * split span text
 * @param text
 * @returns
 */
export function splitSpanText(text: string) {
    if (text === '') return [text];
    const regex = /(?:(\n+.+)|(.+))/g;
    const arr = text.match(regex)!;
    const arr1 = arr.map((item) => item.replace(/\n/g, '\r\n'));
    return arr1;
}

export function handleTableColgroup(table: string) {
    const content = document.createElement('DIV');
    const data: any[] = [];
    content.innerHTML = table;
    const colgroup = content.querySelectorAll('table col');
    if (!colgroup.length) return [];
    for (let i = 0; i < colgroup.length; i++) {
        const col = colgroup[i];
        const colSpan = col.getAttribute('span');
        if (colSpan && +colSpan > 1) {
            for (let j = 0; j < +colSpan; j++) {
                const width = getTdHeight(col.getAttribute('width'), 72);
                data.push(width);
            }
        } else {
            const width = getTdHeight(col.getAttribute('width'), 72);
            data.push(width);
        }
    }
    return data;
}

function getTdHeight(height: string | null, defaultHeight: number) {
    if (!height) return defaultHeight;
    let firstHeight;
    if (height.includes('pt')) {
        firstHeight = ptToPx(Number.parseFloat(height));
    } else if (height.includes('px')) {
        firstHeight = Number.parseFloat(height);
    } else {
        firstHeight = (Number.parseFloat(height) * 72) / 96;
    }
    return firstHeight;
}

export function handleTableRowGroup(table: string) {
    const content = document.createElement('DIV');
    const data: any[] = [];
    content.innerHTML = table;
    const rowGroup = content.querySelectorAll('table tr');
    if (!rowGroup.length) return [];
    for (let i = 0; i < rowGroup.length; i++) {
        const row = rowGroup[i];
        const tds = row.querySelectorAll('td');
        let firstHeight = getTdHeight(tds[0].style.height, 19);

        for (let k = 0; k < tds.length; k++) {
            const rowSpan = tds[k].getAttribute('rowSpan');
            // const height = getTdHeight(tds[k].style.height);
            if (rowSpan && +rowSpan > 1) {
                // for (let j = 0; j < +rowSpan; j++) {
                //     data.push(height);
                // }
                // i = i + +rowSpan - 1;
                continue;
            }
            firstHeight = getTdHeight(tds[k].style.height, 19);
            break;
        }
        data.push(firstHeight);
    }
    return data;
}

// 将table数据转为sheet数据
export function handelTableToJson(table: string) {
    let data: any[] = [];
    const content = document.createElement('DIV');
    content.innerHTML = table;
    data = new Array(content.querySelectorAll('table tr').length);
    if (!data.length) return [];
    let colLen = 0;
    const trs = content.querySelectorAll('table tr');
    const firstTds = trs[0].querySelectorAll('td');
    firstTds.forEach((item: HTMLTableCellElement) => {
        let colSpan = 0;
        const attr = item.getAttribute('colSpan');
        if (attr !== null) {
            colSpan = +attr;
        } else {
            colSpan = 1;
        }
        colLen += colSpan;
    });
    for (let i = 0; i < data.length; i++) {
        data[i] = new Array(colLen);
    }
    let r = 0;
    trs.forEach((item: any) => {
        let c = 0;
        item.querySelectorAll('td').forEach((td: HTMLTableCellElement) => {
            const cell: ICellData = {};
            if (td.querySelectorAll('span').length || td.querySelectorAll('font').length) {
                const spanStyle = handleDomToJson(td);
                if (typeof spanStyle !== 'string') {
                    cell.p = spanStyle;
                }
            }
            const txt = td.innerText;
            if (txt.trim().length === 0) {
                cell.v = '';
            } else {
                // Todo,处理格式
                cell.v = txt;
            }
            const style = handleStringToStyle(td);
            if (Tools.isPlainObject(style)) {
                cell.s = style;
            }
            while (c < colLen && data[r][c] != null) {
                c++;
            }
            if (c === colLen) {
                return;
            }
            if (data[r][c] == null) {
                data[r][c] = cell;
                const rowSpan = Number(td.getAttribute('rowSpan')) ?? 1;
                const colSpan = Number(td.getAttribute('colSpan')) ?? 1;
                if (rowSpan > 1 || colSpan > 1) {
                    const first = { rs: +rowSpan - 1, cs: +colSpan - 1, r, c };
                    data[r][c].mc = first;
                    for (let rp = 0; rp < rowSpan; rp++) {
                        for (let cp = 0; cp < colSpan; cp++) {
                            if (rp === 0 && cp === 0) {
                                continue;
                            }
                            data[r + rp][c + cp] = { mc: null };
                        }
                    }
                }
            }
            c++;
        });
        r++;
    });

    return data;
}

// 将文本格式数据转为sheet数据
export function handlePlainToJson(plain: string) {
    const data: any[] = [];
    const content = document.createElement('DIV');
    content.innerHTML = plain;
    const dataChe = plain.replace(/\r/g, '');
    const che = dataChe.split('\n');
    const colCheLen = che[0].split('\t').length;
    for (let i = 0; i < che.length; i++) {
        if (che[i].split('\t').length < colCheLen) {
            continue;
        }
        data.push(che[i].split('\t'));
    }
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (data[i][j].length) {
                data[i][j] = {
                    v: data[i][j] || '',
                    m: data[i][j] || '',
                };
            } else {
                data[i][j] = null;
            }
        }
    }

    return data;
}

// 获取最终sheet数据
export function handleTableMergeData(data: any[], selection?: IRange) {
    const copyH = data.length;
    const copyC = data[0].length;
    let minH = 0; //应用范围首尾行
    let maxH = minH + copyH - 1;
    let minC = 0; //应用范围首尾列
    let maxC = minC + copyC - 1;
    if (selection) {
        minH = selection.startRow; //应用范围首尾行
        maxH = minH + copyH - 1;
        minC = selection.startColumn; //应用范围首尾列
        maxC = minC + copyC - 1;
    }

    const mergeData = [];

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (data[i][j] && typeof data[i][j] === 'object' && 'mc' in data[i][j]) {
                if (data[i][j].mc) {
                    const mc = data[i][j].mc;
                    const startRow = mc.r + minH;
                    const endRow = startRow + mc.rs;
                    const startColumn = mc.c + minC;
                    const endColumn = startColumn + mc.cs;

                    mergeData.push({ startRow, endRow, startColumn, endColumn });
                    delete data[i][j].mc;
                } else {
                    data[i][j] = null;
                }
            }
        }
    }

    return {
        data,
        mergeData,
    };
}

export function handelExcelToJson(html: string) {
    let data: any[] = [];
    const content = document.createElement('html');
    content.innerHTML = html;
    const styleText = content.querySelector('style')?.innerText;
    if (!styleText) return;
    const excelStyle = getStyles(styleText);

    data = new Array(content.querySelectorAll('table tr').length);
    if (!data.length) return [];
    let colLen = 0;
    const trs = content.querySelectorAll('table tr');
    const firstTds = trs[0].querySelectorAll('td');
    firstTds.forEach((item: HTMLTableCellElement) => {
        let colSpan = 0;
        const attr = item.getAttribute('colSpan');
        if (attr !== null) {
            colSpan = +attr;
        } else {
            colSpan = 1;
        }
        colLen += colSpan;
    });
    for (let i = 0; i < data.length; i++) {
        data[i] = new Array(colLen);
    }
    let r = 0;
    trs.forEach((item: any) => {
        let c = 0;
        item.querySelectorAll('td').forEach((td: HTMLTableCellElement) => {
            const cell: ICellData = {};
            if (td.querySelectorAll('span').length || td.querySelectorAll('font').length) {
                const spanStyle = handleDomToJson(td);
                if (typeof spanStyle !== 'string') {
                    cell.p = spanStyle;
                }
            }
            const txt = td.innerText;
            if (txt.trim().length === 0) {
                cell.v = '';
            } else {
                // Todo,处理格式
                cell.v = txt;
            }

            let cssText = '';
            for (const attr in excelStyle) {
                if (td.classList.contains(attr)) {
                    cssText += excelStyle[attr];
                }
            }
            const style = handleStringToStyle(td, cssText);

            if (Tools.isPlainObject(style)) {
                cell.s = style;
            }
            while (c < colLen && data[r][c] != null) {
                c++;
            }
            if (c === colLen) {
                return;
            }
            if (data[r][c] == null) {
                data[r][c] = cell;
                const rowSpan = Number(td.getAttribute('rowSpan')) ?? 1;
                const colSpan = Number(td.getAttribute('colSpan')) ?? 1;

                if (rowSpan > 1 || colSpan > 1) {
                    const first = { rs: +rowSpan - 1, cs: +colSpan - 1, r, c };
                    data[r][c].mc = first;
                    for (let rp = 0; rp < rowSpan; rp++) {
                        for (let cp = 0; cp < colSpan; cp++) {
                            if (rp === 0 && cp === 0) {
                                continue;
                            }
                            data[r + rp][c + cp] = { mc: null };
                        }
                    }
                }
            }
            c++;
        });
        r++;
    });

    return data;
}

function getStyles(styleText: string): IKeyValue {
    const output: IKeyValue = {};
    const string = styleText.replaceAll('<!--', '').replaceAll('-->', '').trim();
    const style = string?.replaceAll('\t', '').replaceAll('\n', '').split('}');
    for (let i = 0; i < style.length; i++) {
        if (!style[i]) continue;
        let attr = style[i].split('{')[0].trim();
        if (attr.includes('.')) {
            attr = attr.slice(1);
        }
        const value = style[i].split('{')[1].trim();
        output[attr] = value;
    }

    return output;
}

function extractColorFromString(str: string) {
    const regex = /#([0-9a-f]{3,6})\b|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)/gi;
    const matches = str.match(regex);
    return matches ? matches[0] : null;
}

function getPtFontSizeByPx(size: number) {
    const ptSize = Math.round(size * PX_TO_PT_RATIO);

    if (ptSize < MIN_FONT_SIZE) return MIN_FONT_SIZE;
    if (ptSize > MAX_FONT_SIZE) return MAX_FONT_SIZE;
    return ptSize;
}

function extractFontFamily(styleStr: string) {
    const regex = /font-family:\s*(?:"([^"]+)"|'([^']+)'|([^;]+))/i;
    const matches = styleStr.match(regex);
    return matches ? (matches[1] || matches[2] || matches[3]).trim() : null;
}
