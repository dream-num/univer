import {
    BaselineOffset,
    BlockType,
    BorderStyleTypes,
    getColorStyle,
    HorizontalAlign,
    ICellData,
    IDocumentData,
    IElementsOrder,
    IRangeData,
    IStyleData,
    ITextDecoration,
    ParagraphElementType,
    TextDirection,
    Tools,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { nanoid } from 'nanoid';
import { pxToPt } from '@univerjs/base-render';
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
    const elements = {};
    const elementOrder: IElementsOrder[] = [];
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
            let eId = nanoid(6);

            elements[eId] = {
                eId,
                st: 0,
                ed: item.length - 1,
                et: 0,
                tr: {
                    ct: item,
                    ts: textStyle,
                },
            };

            elementOrder.push({
                elementId: eId,
                paragraphElementType: 0,
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

    const blockId = nanoid(6);
    let p = {
        id: nanoid(6),
        body: {
            blockElements: {
                [blockId]: {
                    blockId,
                    st: 0,
                    ed,
                    blockType: 0,
                    paragraph: {
                        elements,
                        elementOrder,
                    },
                },
                b: {
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
            },
            blockElementOrder: [blockId, 'b'],
        },
        documentStyle: {},
    };

    return p;
}

/**
 * Convert rich text json to DOM
 * @param p
 */
export function handleJsonToDom(p: IDocumentData): string {
    let span = '';
    // let span = `<span id="${p.documentId}">`;
    if (p.body?.blockElements) {
        for (let k in p.body.blockElements) {
            const section = p.body.blockElements[k];
            if (section.blockType !== BlockType.PARAGRAPH && section.blockType !== BlockType.SECTION_BREAK) {
                continue;
            }
            if (section.blockType === BlockType.PARAGRAPH) {
                for (let i in section.paragraph) {
                    const element = section.paragraph[i];
                    for (let j in element) {
                        const item = element[j];
                        if (item.et === ParagraphElementType.TEXT_RUN) {
                            let style = `display:inline-block;${handleStyleToString(item.tr.ts)}`;
                            span += `<span id='${item.eId}' ${style.length ? `style="${style}"` : ''} >${item.tr.ct}</span>`;
                        }
                    }
                }
            }
            // else if (section.blockType === BlockType.SECTION_BREAK) {
            //     span += '<br/>';
            // }
        }
    }

    // span += '</span>';
    return span;
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

/**
 * transform style object to string
 * @param style
 * @returns
 */
export function handleStyleToString(style: IStyleData, isCell: boolean = false) {
    let str = '';
    const styleMap = new Map([
        [
            'ff',
            () => {
                if (style.ff) {
                    str += `font-family: ${style.ff}; `;
                }
            },
        ],
        [
            'fs',
            () => {
                if (style.fs) {
                    let fs = style.fs;

                    // subscript / superscript, Font size for superscripts and subscripts is halved
                    if (style.va) {
                        fs /= 2;
                    }
                    str += `font-size: ${fs}pt; `;
                }

                // const fs = isCss ? `${style.fs}px` : `${pxToPt(style.fs || 14)}pt`;
                // str += `font-size: ${fs}; `;
            },
        ],
        [
            'it',
            () => {
                if (style.it) {
                    str += `font-style: italic; `;
                } else {
                    str += `font-style: normal; `;
                }
            },
        ],
        [
            'bl',
            () => {
                if (style.bl) {
                    str += `font-weight: bold; `;
                } else {
                    str += `font-weight: normal; `;
                }
            },
        ],
        [
            'ul',
            () => {
                if (style.ul?.s) {
                    // If there are existing lines, add new lines
                    if (str.indexOf('text-decoration-line') > -1) {
                        str = str.replace(/(?<=text-decoration-line:.*)\b(?=;)/g, ' underline');
                    } else {
                        str += `text-decoration-line: underline; `;
                    }
                    if (style.ul.cl && str.indexOf('text-decoration-color') === -1) {
                        str += `text-decoration-color: ${getColorStyle(style.ul.cl)}; `;
                    }
                    if (style.ul.t && str.indexOf('text-decoration-style') === -1) {
                        str += `text-decoration-style: ${style.ul.t} `;
                    }
                }
            },
        ],
        [
            'st',
            () => {
                if (style.st?.s) {
                    if (str.indexOf('text-decoration-line') > -1) {
                        str = str.replace(/(?<=text-decoration-line:.*)\b(?=;)/g, ' line-through');
                    } else {
                        str += `text-decoration-line: line-through; `;
                    }
                    if (style.st.cl && str.indexOf('text-decoration-color') === -1) {
                        str += `text-decoration-color: ${getColorStyle(style.st.cl)}; `;
                    }
                    if (style.st.t && str.indexOf('text-decoration-style') === -1) {
                        str += `text-decoration-style: ${style.st.t} `;
                    }
                }
            },
        ],
        [
            'ol',
            () => {
                if (style.ol?.s) {
                    if (str.indexOf('text-decoration-line') > -1) {
                        str = str.replace(/(?<=text-decoration-line:.*)\b(?=;)/g, ' overline');
                    } else {
                        str += `text-decoration-line: overline; `;
                    }
                    if (style.ol.cl && str.indexOf('text-decoration-color') === -1) {
                        str += `text-decoration-color: ${getColorStyle(style.ol.cl)}; `;
                    }
                    if (style.ol.t && str.indexOf('text-decoration-style') === -1) {
                        str += `text-decoration-style: ${style.ol.t} `;
                    }
                }
            },
        ],
        [
            'bg',
            () => {
                str += `background: ${getColorStyle(style.bg)}; `;
            },
        ],
        [
            'bd',
            () => {
                if (style.bd?.b) {
                    str += `border-bottom: ${getBorderStyle(style.bd?.b.s)} ${getColorStyle(style.bd.b.cl) ?? ''}; `;
                }
                if (style.bd?.t) {
                    str += `border-top: ${getBorderStyle(style.bd?.t.s)} ${getColorStyle(style.bd.t.cl) ?? ''}; `;
                }
                if (style.bd?.r) {
                    str += `border-right: ${getBorderStyle(style.bd?.r.s)} ${getColorStyle(style.bd.r.cl) ?? ''}; `;
                }
                if (style.bd?.l) {
                    str += `border-left: ${getBorderStyle(style.bd?.l.s)} ${getColorStyle(style.bd.l.cl) ?? ''}; `;
                }
            },
        ],
        [
            'cl',
            () => {
                str += `color: ${getColorStyle(style.cl)}; `;
            },
        ],
        [
            'va',
            () => {
                if (style.va === BaselineOffset.NORMAL) {
                    str += `vertical-align: baseline; `;
                } else if (style.va === BaselineOffset.SUBSCRIPT) {
                    str += `vertical-align: sub; `;
                } else {
                    str += `vertical-align: super; `;
                }
            },
        ],
        [
            'td',
            () => {
                if (style.td === TextDirection.UNSPECIFIED) {
                    str += `direction: inherit; `;
                } else if (style.td === TextDirection.LEFT_TO_RIGHT) {
                    str += `direction: ltr; `;
                } else {
                    str += `direction: rtl; `;
                }
            },
        ],
        [
            'tr',
            () => {
                str += `data-rotate: (${style.tr?.a}deg${style.tr?.v ? ` ,${style.tr?.v}` : ''});`;
            },
        ],
        [
            'ht',
            () => {
                if (style.ht === HorizontalAlign.UNSPECIFIED) {
                    str += `text-align: inherit; `;
                } else if (style.ht === HorizontalAlign.LEFT) {
                    str += `text-align: left; `;
                } else if (style.ht === HorizontalAlign.RIGHT) {
                    str += `text-align: right; `;
                } else if (style.ht === HorizontalAlign.CENTER) {
                    str += `text-align: center; `;
                } else {
                    str += `text-align: justify; `;
                }
            },
        ],
        [
            'vt',
            () => {
                if (style.vt === VerticalAlign.UNSPECIFIED) {
                    str += `vertical-align: inherit; `;
                } else if (style.vt === VerticalAlign.BOTTOM) {
                    str += `vertical-align: bottom; `;
                } else if (style.vt === VerticalAlign.TOP) {
                    str += `vertical-align: top; `;
                } else {
                    str += `vertical-align: middle; `;
                }
            },
        ],
        [
            'tb',
            () => {
                if (style.tb === WrapStrategy.CLIP) {
                    str += `text-overflow: clip; `;
                } else if (style.tb === WrapStrategy.OVERFLOW) {
                    str += `text-break: overflow; `;
                } else if (style.tb === WrapStrategy.WRAP) {
                    str += `word-wrap: break-word; word-break: normal; `;
                }
            },
        ],
        [
            'pd',
            () => {
                // let b = '';
                // let t = '';
                // let l = '';
                // let r = '';

                // if (isCss) {
                //     b = `${pxToPt(style.pd?.b || 0)}pt`;
                //     t = `${pxToPt(style.pd?.t || 0)}pt`;
                //     l = `${pxToPt(style.pd?.l || 0)}pt`;
                //     r = `${pxToPt(style.pd?.r || 0)}pt`;
                // } else {
                let b = `${style.pd?.b}pt`;
                let t = `${style.pd?.t}pt`;
                let l = `${style.pd?.l}pt`;
                let r = `${style.pd?.r}pt`;
                // }
                if (style.pd?.b) {
                    str += `padding-bottom: ${b}; `;
                }
                if (style.pd?.t) {
                    str += `padding-top: ${t}; `;
                }
                if (style.pd?.l) {
                    str += `padding-left: ${l}; `;
                }
                if (style.pd?.r) {
                    str += `padding-right: ${r}; `;
                }
            },
        ],
    ]);
    const cellSkip = ['bd', 'tr', 'tb'];
    for (let k in style) {
        if (isCell && cellSkip.includes(k)) continue; // Cell styles to skip when entering edit mode
        styleMap.get(k)?.();
    }
    return str;
}

function getBorderStyle(type: BorderStyleTypes) {
    let str = '';
    if (type === BorderStyleTypes.NONE) {
        str = 'none';
    } else if (type === BorderStyleTypes.THIN) {
        str = '0.5pt solid';
    } else if (type === BorderStyleTypes.HAIR) {
        str = '0.5pt double';
    } else if (type === BorderStyleTypes.DOTTED) {
        str = '0.5pt dotted';
    } else if (type === BorderStyleTypes.DASHED) {
        str = '0.5pt dashed';
    } else if (type === BorderStyleTypes.DASH_DOT) {
        str = '0.5pt dashed';
    } else if (type === BorderStyleTypes.DASH_DOT_DOT) {
        str = '0.5pt dotted';
    } else if (type === BorderStyleTypes.DOUBLE) {
        str = '0.5pt double';
    } else if (type === BorderStyleTypes.MEDIUM) {
        str = '1pt solid';
    } else if (type === BorderStyleTypes.MEDIUM_DASHED) {
        str = '1pt dashed';
    } else if (type === BorderStyleTypes.MEDIUM_DASH_DOT) {
        str = '1pt dashed';
    } else if (type === BorderStyleTypes.MEDIUM_DASH_DOT_DOT) {
        str = '1pt dotted';
    } else if (type === BorderStyleTypes.SLANT_DASH_DOT) {
        str = '0.5pt dashed';
    } else if (type === BorderStyleTypes.THICK) {
        str = '1.5pt solid';
    }
    return str;
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
