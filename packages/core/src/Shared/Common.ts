import { Tools } from './Tools';
import { Nullable } from '.';
import {
    ICellInfo,
    ISelection,
    ICellData,
    IColorStyle,
    BlockType,
    IDocumentData,
    IStyleData,
    ParagraphElementType,
} from '../Interfaces';
import { ColorBuilder } from '../Sheets/Domain';
import {
    BaselineOffset,
    TextDirection,
    HorizontalAlign,
    VerticalAlign,
    WrapStrategy,
    BorderStyleTypes,
} from '../Enum';

export function makeCellToSelection(
    cellInfo: Nullable<ICellInfo>
): Nullable<ISelection> {
    if (!cellInfo) {
        return;
    }
    let { row, column, startY, endY, startX, endX, isMerged, mergeInfo } = cellInfo;
    let startRow = row;
    let startColumn = column;
    let endRow = row;
    let endColumn = column;
    if (isMerged && mergeInfo) {
        const {
            startRow: mergeStartRow,
            startColumn: mergeStartColumn,
            endRow: mergeEndRow,
            endColumn: mergeEndColumn,
            startY: mergeStartY,
            endY: mergeEndY,
            startX: mergeStartX,
            endX: mergeEndX,
        } = mergeInfo;
        startRow = mergeStartRow;
        startColumn = mergeStartColumn;
        endRow = mergeEndRow;
        endColumn = mergeEndColumn;
        startY = mergeStartY;
        endY = mergeEndY;
        startX = mergeStartX;
        endX = mergeEndX;
    }

    return {
        startRow,
        startColumn,
        endRow,
        endColumn,
        startY,
        endY,
        startX,
        endX,
    };
}

export function isEmptyCell(cell: Nullable<ICellData>) {
    if (!cell) {
        return true;
    }

    const content = cell?.m || '';
    if (content.length === 0 && !cell.p) {
        return true;
    }
    return false;
}

export function getColorStyle(color: Nullable<IColorStyle>): Nullable<string> {
    if (color) {
        if (color.rgb) {
            return color.rgb;
        }
        if (color.th) {
            return new ColorBuilder()
                .setThemeColor(color.th)
                .asThemeColor()
                .asRgbColor()
                .getCssString();
        }
    }
    return null;
}

export function isFormulaString(value: any): boolean {
    return Tools.isString(value) && value.indexOf('=') === 0 && value.length > 1;
}

/**
 * move to Styles.getStyleByCell
 */
// export function getStyle(
//     styles: Nullable<Styles>,
//     cell: Nullable<ICellData>
// ): Nullable<IStyleData> {
//     let style;
//     if (cell && Tools.isObject(cell.s)) {
//         style = cell.s as IStyleData;
//     } else {
//         style = cell?.s && styles?.get(cell.s);
//     }

//     return style as IStyleData;
// }

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
            if (
                section.blockType !== BlockType.PARAGRAPH &&
                section.blockType !== BlockType.SECTION_BREAK
            ) {
                continue;
            }
            if (section.blockType === BlockType.PARAGRAPH) {
                for (let i in section.paragraph) {
                    const element = section.paragraph[i];
                    for (let j in element) {
                        const item = element[j];
                        if (item.et === ParagraphElementType.TEXT_RUN) {
                            let style = `display:inline-block;${handleStyleToString(
                                item.tr.ts
                            )}`;
                            span += `<span id='${item.eId}' ${
                                style.length ? `style="${style}"` : ''
                            } >${item.tr.ct}</span>`;
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
                        str = str.replace(
                            /(?<=text-decoration-line:.*)\b(?=;)/g,
                            ' underline'
                        );
                    } else {
                        str += `text-decoration-line: underline; `;
                    }
                    if (style.ul.cl && str.indexOf('text-decoration-color') === -1) {
                        str += `text-decoration-color: ${getColorStyle(
                            style.ul.cl
                        )}; `;
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
                        str = str.replace(
                            /(?<=text-decoration-line:.*)\b(?=;)/g,
                            ' line-through'
                        );
                    } else {
                        str += `text-decoration-line: line-through; `;
                    }
                    if (style.st.cl && str.indexOf('text-decoration-color') === -1) {
                        str += `text-decoration-color: ${getColorStyle(
                            style.st.cl
                        )}; `;
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
                        str = str.replace(
                            /(?<=text-decoration-line:.*)\b(?=;)/g,
                            ' overline'
                        );
                    } else {
                        str += `text-decoration-line: overline; `;
                    }
                    if (style.ol.cl && str.indexOf('text-decoration-color') === -1) {
                        str += `text-decoration-color: ${getColorStyle(
                            style.ol.cl
                        )}; `;
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
                    str += `border-bottom: ${getBorderStyle(style.bd?.b.s)} ${
                        getColorStyle(style.bd.b.cl) ?? ''
                    }; `;
                }
                if (style.bd?.t) {
                    str += `border-top: ${getBorderStyle(style.bd?.t.s)} ${
                        getColorStyle(style.bd.t.cl) ?? ''
                    }; `;
                }
                if (style.bd?.r) {
                    str += `border-right: ${getBorderStyle(style.bd?.r.s)} ${
                        getColorStyle(style.bd.r.cl) ?? ''
                    }; `;
                }
                if (style.bd?.l) {
                    str += `border-left: ${getBorderStyle(style.bd?.l.s)} ${
                        getColorStyle(style.bd.l.cl) ?? ''
                    }; `;
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
                str += `data-rotate: (${style.tr?.a}deg${
                    style.tr?.v ? ` ,${style.tr?.v}` : ''
                });`;
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
