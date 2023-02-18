import { BlockType, ICellData, IDocumentData, IElement, IRangeData, IStyleData, ITextDecoration, Tools } from '@univer/core';
import { pxToPt } from '@univer/base-render';
import { textTrim } from '../Utils';

// TODO: move to Utils
/**
 * The entire list of DOM spans is parsed into a rich-text JSON style sheet
 * @param $dom
 * @returns
 */
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
    const elements: IElement[] = [];
    let ed = 0;

    for (let i = 0; i < nodeList.length; i++) {
        let span = nodeList[`${i}`] as HTMLElement;
        let str: string;
        if (span.nodeName === '#text') {
            str = span.textContent ?? '';
            span = span.parentElement!;
        } else {
            str = span.innerText;
        }
        let textStyle = handleStringToStyle(span);

        // let str = span.innerText;
        let spanTexts = splitSpanText(str);

        spanTexts.forEach((item) => {
            ed = +item.length;
            let eId = Tools.generateRandomId(6);

            elements.push({
                eId,
                st: 0,
                ed: item.length - 1,
                et: 0,
                tr: {
                    ct: item,
                    ts: textStyle,
                },
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
    let p = {
        id: Tools.generateRandomId(6),
        body: {
            blockElements: [
                {
                    blockId,
                    st: 0,
                    ed,
                    blockType: 0,
                    paragraph: {
                        elements,
                    },
                },
                {
                    blockId: 'b',
                    st: 0,
                    ed: 0,
                    blockType: BlockType.SECTION_BREAK,
                    sectionBreak: {
                        columnProperties: [],
                        columnSeparatorType: 1,
                        sectionType: 0,
                    },
                },
            ],
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
export function handleStringToStyle($dom: HTMLElement) {
    const cssText = $dom.style.cssText;
    if (cssText == null || cssText.length === 0) {
        return {};
    }
    let cssTextArray = cssText.split(';');
    let styleList: IStyleData = {};
    cssTextArray.forEach((s) => {
        s = s.toLowerCase();
        let key = textTrim(s.substr(0, s.indexOf(':')));
        let value = textTrim(s.substr(s.indexOf(':') + 1));

        // bold
        if (key === 'font-weight') {
            if (value === 'bold') {
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
            styleList.ff = value;
        }
        // font size
        else if (key === 'font-size') {
            let fs = parseInt(value);

            // Double the font size for superscripts and subscripts
            if (cssText.indexOf('vertical-align') > -1 && (cssText.indexOf('sub') > -1 || cssText.indexOf('sup') > -1)) {
                fs *= 2;
            }

            // px to pt
            if (value.indexOf('px') !== -1) {
                fs = pxToPt(parseInt(value));
            }

            styleList.fs = fs;
        }
        // font color
        else if (key === 'color') {
            styleList.cl = {
                rgb: value,
            };
        }
        // fill color / background
        else if (key === 'background' || key === 'background-color') {
            styleList.bg = {
                rgb: value,
            };
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
            styleList.st = {
                s: 1,
            };
        }
        // underline
        if (key === 'univer-underline') {
            styleList.ul = {
                s: 1,
            };
        }

        if (key === 'vertical-align') {
            if (value === 'sub') {
                styleList.va = 1;
            } else if (value === 'super') {
                styleList.va = 2;
            } else if (value === 'top') {
                styleList.vt = 1;
            } else if (value === 'middle') {
                styleList.vt = 2;
            } else if (value === 'bottom') {
                styleList.vt = 3;
            } else {
                styleList.va = 0;
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
                if ($dom.dataset.vertical) {
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

        if (key === 'overflow-wrap' || key === 'overflowWrap') {
            if (value === 'break-word') {
                styleList.tb = 3;
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

    return styleList;
}

/**
 * split span text
 * @param text
 * @returns
 */
export function splitSpanText(text: string) {
    if (text === '') return [text];
    const regex = /(?:(\n+.+)|(.+))/g;
    let arr = text.match(regex)!;
    let arr1 = arr.map((item) => item.replace(/\n/g, '\r\n'));
    return arr1;
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
            let cell: ICellData = {};
            if (td.querySelectorAll('span').length || td.querySelectorAll('font').length) {
                const spanStyle = handleDomToJson(td);
                if (typeof spanStyle !== 'string') {
                    cell.p = spanStyle;
                }
            }
            let txt = td.innerText;
            if (txt.trim().length === 0) {
                cell.v = '';
                cell.m = '';
            } else {
                // Todo,处理格式
                cell.v = txt;
                cell.m = txt;
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
                let rowSpan = Number(td.getAttribute('rowSpan'));
                let colSpan = Number(td.getAttribute('colSpan'));
                if (Number.isNaN(rowSpan)) {
                    rowSpan = 1;
                }
                if (Number.isNaN(colSpan)) {
                    colSpan = 1;
                }
                if (rowSpan > 1 || colSpan > 1) {
                    let first = { rs: rowSpan - 1, cs: colSpan - 1, r, c };
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
    let data: any[] = [];
    const content = document.createElement('DIV');
    content.innerHTML = plain;
    let dataChe = plain.replace(/\r/g, '');
    let che = dataChe.split('\n');
    let colCheLen = che[0].split('\t').length;
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
export function handleTableMergeData(data: any[], selection?: IRangeData) {
    let copyH = data.length;
    let copyC = data[0].length;
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
