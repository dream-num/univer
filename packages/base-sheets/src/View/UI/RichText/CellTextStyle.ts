import { $$, selectTextContent, selectTextContentCross, textTrim } from '@univer/base-component';
import { Color } from '@univer/core';
import styles from './index.module.less';

interface IStyleSetting {
    bl?: string; // font-weight
    it?: string; // font-style
    ff?: string; // font-family
    fs?: number; // font-size
    fc?: string; // color
    bg?: string; // background
    cl?: string; // text-decoration(Strikethrough)
    un?: string; // border-bottom(Underline)
    // attr is  un
    _fontSize?: number;
    _color?: string;
}

/**
 * update rich text style
 */
export class CellTextStyle {
    inlineStyleAffectAttribute: {
        [key: string]: number;
    };

    inlineStyleAffectCssName: {
        [key: string]: number;
    };

    univerToCssName: {
        [key: string]: string;
    };

    editor: HTMLDivElement;

    constructor(ele: HTMLDivElement) {
        this.inlineStyleAffectAttribute = { bl: 1, it: 1, ff: 1, cl: 1, un: 1, fs: 1, fc: 1, bg: 1 };
        this.inlineStyleAffectCssName = { 'font-weight': 1, 'font-style': 1, 'font-family': 1, 'text-decoration': 1, 'border-bottom': 1, 'font-size': 1, color: 1, background: 1 };

        this.univerToCssName = {
            bl: 'font-weight',
            it: 'font-style',
            ff: 'font-family',
            fs: 'font-size',
            fc: 'color',
            bg: 'background',
            cl: 'text-decoration',
            un: 'border-bottom',
        };
        this.editor = ele;
    }

    // TODO:指定单元格更新
    updateFormat(attr: string, foucsStatus: number | string) {
        if (attr in this.inlineStyleAffectAttribute) {
            // TODO: 不要使用 $$
            let value = this.editor.textContent!;
            if (value.substr(0, 1) !== '=') {
                this.updateInlineStringFormat(attr, foucsStatus);
            }
        }
    }

    updateInlineStringFormat(attr: string, value: number | string) {
        let w = window.getSelection();
        let range;
        if (w?.type === 'None') {
            // range = Store.inlineStringEditRange;
        } else {
            range = w?.getRangeAt(0);
        }

        if (!range) return;

        // TODO: 不要使用 $$
        let $textEditor = this.editor;

        let endContainer = range.endContainer;
        let startContainer = range.startContainer;
        let endOffset = range.endOffset;
        let startOffset = range.startOffset;

        if ($textEditor) {
            if (startContainer === endContainer) {
                let span = startContainer.parentNode as HTMLElement;
                let spanIndex;
                let inherit = false;

                let content = span.innerHTML;

                let fullContent = $textEditor.innerHTML;
                if (fullContent.substr(0, 5) !== '<span') {
                    inherit = true;
                }

                let left = '';
                let mid = '';
                let right = '';
                let s1 = 0;
                let s2 = startOffset;
                let s3 = endOffset;
                let s4 = content.length;
                left = content.substring(s1, s2);
                mid = content.substring(s2, s3);
                right = content.substring(s3, s4);

                let cont = '';
                if (left !== '') {
                    let cssText = span.style.cssText;
                    if (inherit) {
                        let box = span.closest(`.${styles.richTextEditorContainer}`) as HTMLElement;
                        if (box != null) {
                            cssText = this.extendCssText(box.style.cssText, cssText);
                        }
                    }
                    cont += `<span style='${cssText}'>${left}</span>`;
                }

                if (mid !== '') {
                    let cssText = this.getCssText(span.style.cssText, attr, value);

                    if (inherit) {
                        let box = span.closest(`.${styles.richTextEditorContainer}`) as HTMLElement;
                        if (box != null) {
                            cssText = this.extendCssText(box.style.cssText, cssText);
                        }
                    }

                    cont += `<span style='${cssText}'>${mid}</span>`;
                }

                if (right !== '') {
                    let cssText = span.style.cssText;
                    if (inherit) {
                        let box = span.closest(`.${styles.richTextEditorContainer}`) as HTMLElement;
                        if (box != null) {
                            cssText = this.extendCssText(box.style.cssText, cssText);
                        }
                    }
                    cont += `<span style='${cssText}'>${right}</span>`;
                }

                if ((startContainer.parentNode as HTMLElement).tagName === 'SPAN') {
                    spanIndex = $$('span', $textEditor).indexOf(span);
                    // spanIndex = $textEditor.find('span').index(span);
                    let spanP = span.parentElement?.innerHTML;
                    let spanText = span.outerHTML.replace('\\', '');
                    const newS = spanP?.replace(spanText, cont);
                    span.parentElement!.innerHTML = newS!;
                    // span.replaceWith(cont);
                } else {
                    spanIndex = 0;
                    span.innerHTML = cont;
                }

                let seletedNodeIndex = 0;
                if (s1 === s2) {
                    seletedNodeIndex = spanIndex;
                } else {
                    seletedNodeIndex = spanIndex + 1;
                }

                selectTextContent($textEditor.querySelectorAll('span')[seletedNodeIndex]);
            } else if ((startContainer.parentNode as HTMLElement).tagName === 'SPAN' && (endContainer.parentNode as HTMLElement).tagName === 'SPAN') {
                let startSpan = startContainer.parentNode as HTMLElement;
                let startSpanIndex;
                let endSpan = endContainer.parentNode as HTMLElement;
                let endSpanIndex;

                startSpanIndex = $$('span', $textEditor).indexOf(startSpan);
                endSpanIndex = $$('span', $textEditor).indexOf(endSpan);
                // startSpanIndex = $textEditor.find('span').index(startSpan);
                // endSpanIndex = $textEditor.find('span').index(endSpan);

                let startContent = (startSpan as HTMLElement).innerHTML;
                let endContent = (endSpan as HTMLElement).innerHTML;
                let sleft = '';
                let sright = '';
                let eleft = '';
                let eright = '';
                let s1 = 0;
                let s2 = startOffset;
                let s3 = endOffset;
                let s4 = endContent.length;

                sleft = startContent.substring(s1, s2);
                sright = startContent.substring(s2, startContent.length);

                eleft = endContent.substring(0, s3);
                eright = endContent.substring(s3, s4);
                let spans = Array.prototype.slice.call($textEditor.querySelectorAll('span'));
                let replaceSpans = spans.slice(startSpanIndex, endSpanIndex + 1);
                let cont = '';
                for (let i = 0; i < startSpanIndex; i++) {
                    // let span = spans.get(i),
                    let span: HTMLElement = spans[`${i}`];
                    let content = span.innerHTML;
                    cont += `<span style='${span.style.cssText}'>${content}</span>`;
                }
                if (sleft !== '') {
                    cont += `<span style='${startSpan.style.cssText}'>${sleft}</span>`;
                }

                if (sright !== '') {
                    let cssText = this.getCssText(startSpan.style.cssText, attr, value);
                    cont += `<span style='${cssText}'>${sright}</span>`;
                }

                if (startSpanIndex < endSpanIndex) {
                    for (let i = startSpanIndex + 1; i < endSpanIndex; i++) {
                        // let span = spans.get(i),
                        let span = spans[`${i}`];
                        let content = span.innerHTML;
                        let cssText = this.getCssText(span.style.cssText, attr, value);
                        cont += `<span style='${cssText}'>${content}</span>`;
                    }
                }

                if (eleft !== '') {
                    let cssText = this.getCssText(endSpan.style.cssText, attr, value);
                    cont += `<span style='${cssText}'>${eleft}</span>`;
                }

                if (eright !== '') {
                    cont += `<span style='${endSpan.style.cssText}'>${eright}</span>`;
                }

                for (let i = endSpanIndex + 1; i < spans.length; i++) {
                    // let span = spans.get(i),
                    let span = spans[`${i}`];
                    let content = span.innerHTML;
                    cont += `<span style='${span.style.cssText}'>${content}</span>`;
                }

                $textEditor.innerHTML = cont;

                // console.log(replaceSpans, cont);
                // replaceSpans.replaceWith(cont);

                let startSeletedNodeIndex;
                let endSeletedNodeIndex;
                if (s1 === s2) {
                    startSeletedNodeIndex = startSpanIndex;
                    endSeletedNodeIndex = endSpanIndex;
                } else {
                    startSeletedNodeIndex = startSpanIndex + 1;
                    endSeletedNodeIndex = endSpanIndex + 1;
                }

                // spans = $textEditor.find('span');
                spans = $textEditor.querySelectorAll('span') as unknown as [];

                // selectTextContentCross(spans.get(startSeletedNodeIndex), spans.get(endSeletedNodeIndex));

                selectTextContentCross(spans[`${startSeletedNodeIndex}`], spans[`${endSeletedNodeIndex}`]);
            }
        }
    }

    extendCssText(origin: string, cover: string, isLimit = true) {
        let originArray = origin.split(';');
        let coverArray = cover.split(';');
        let newCss = '';

        let addKeyList = {};
        for (let i = 0; i < originArray.length; i++) {
            let so = originArray[i];
            let isAdd = true;
            so = so.toLowerCase();
            let okey = textTrim(so.substr(0, so.indexOf(':')));

            /* 不设置文字的大小，解决设置删除线等后字体变大的问题 */
            if (okey === 'font-size') {
                continue;
            }

            let ovalue = textTrim(so.substr(so.indexOf(':') + 1));

            if (isLimit) {
                if (!(okey in this.inlineStyleAffectCssName)) {
                    continue;
                }
            }

            for (let a = 0; a < coverArray.length; a++) {
                let sc = coverArray[a];
                sc = sc.toLowerCase();
                let ckey = textTrim(sc.substr(0, sc.indexOf(':')));
                let cvalue = textTrim(sc.substr(sc.indexOf(':') + 1));

                if (okey === ckey) {
                    newCss += `${ckey}:${cvalue};`;
                    isAdd = false;
                    continue;
                }
            }

            if (isAdd) {
                newCss += `${okey}:${ovalue};`;
            }

            addKeyList[okey] = 1;
        }

        for (let a = 0; a < coverArray.length; a++) {
            let sc = coverArray[a];
            sc = sc.toLowerCase();
            let ckey = textTrim(sc.substr(0, sc.indexOf(':')));
            let cvalue = textTrim(sc.substr(sc.indexOf(':') + 1));

            if (isLimit) {
                if (!(ckey in this.inlineStyleAffectCssName)) {
                    continue;
                }
            }

            if (!(ckey in addKeyList)) {
                newCss += `${ckey}:${cvalue};`;
            }
        }

        return newCss;
    }

    getCssText(cssText: string, attr: string, value: string | number) {
        let styleObj: IStyleSetting = {};
        styleObj[attr] = value;
        if (attr === 'un') {
            let fontColor = this.getClassWithcss(cssText, 'color');
            if (fontColor === '') {
                fontColor = '#000000';
            }
            let fs = this.getClassWithcss(cssText, 'font-size');
            let fsNum = parseInt(fs);
            if (fs === '') {
                fsNum = 11;
            }

            styleObj._fontSize = fsNum;
            styleObj._color = fontColor;
        }
        let s: string | undefined = this.getFontStyleByCell(styleObj, undefined, undefined, false);
        let ukey = textTrim(s && s.substr(0, s.indexOf(':')));
        let uvalue = textTrim(s && s.substr(s.indexOf(':') + 1));
        uvalue = uvalue.substr(0, uvalue.length - 1);
        // let cssText = span.style.cssText;
        cssText = this.removeClassWidthCss(cssText, attr);

        cssText = this.upsetClassWithCss(cssText, ukey, uvalue);

        return cssText;
    }

    getClassWithcss(cssText: string, ukey: string): string {
        let cssTextArray = cssText.split(';');
        if (ukey == null || ukey.length === 0) {
            return cssText;
        }
        if (cssText.indexOf(ukey) > -1) {
            for (let i = 0; i < cssTextArray.length; i++) {
                let s = cssTextArray[i];
                s = s.toLowerCase();
                let key = textTrim(s.substr(0, s.indexOf(':')));
                let value = textTrim(s.substr(s.indexOf(':') + 1));
                if (key === ukey) {
                    return value;
                }
            }
        }

        return '';
    }

    removeClassWidthCss(cssText: string, ukey: string) {
        let cssTextArray = cssText.split(';');
        let newCss = '';
        let oUkey = ukey;
        if (ukey == null || ukey.length === 0) {
            return cssText;
        }
        if (ukey in this.univerToCssName) {
            ukey = this.univerToCssName[ukey];
        }
        if (cssText.indexOf(ukey) > -1) {
            for (let i = 0; i < cssTextArray.length; i++) {
                let s = cssTextArray[i];
                s = s.toLowerCase();
                let key = textTrim(s.substr(0, s.indexOf(':')));
                let value = textTrim(s.substr(s.indexOf(':') + 1));
                if (key === ukey || (oUkey === 'cl' && key === 'lucky-strike') || (oUkey === 'un' && key === 'lucky-underline')) {
                    continue;
                } else if (key.length > 0) {
                    newCss += `${key}:${value};`;
                }
            }
        } else {
            newCss = cssText;
        }

        return newCss;
    }

    upsetClassWithCss(cssText: string, ukey: string, uvalue: string) {
        let cssTextArray = cssText.split(';');
        let newCss = '';
        if (ukey == null || ukey.length === 0) {
            return cssText;
        }
        if (cssText.indexOf(ukey) > -1) {
            for (let i = 0; i < cssTextArray.length; i++) {
                let s = cssTextArray[i];
                s = s.toLowerCase();
                let key = textTrim(s.substr(0, s.indexOf(':')));
                let value = textTrim(s.substr(s.indexOf(':') + 1));
                if (key === ukey) {
                    newCss += `${key}:${uvalue};`;
                } else if (key.length > 0) {
                    newCss += `${key}:${value};`;
                }
            }
        } else if (ukey.length > 0) {
            cssText += `${ukey}:${uvalue};`;
            newCss = cssText;
        }

        return newCss;
    }

    getFontStyleByCell(cell: IStyleSetting, checksAF: any, checksCF: any, isCheck = true): string {
        if (cell == null) {
            return '';
        }
        let style = '';
        for (let key in cell) {
            let value = cell[key];
            if (isCheck) {
                value = this.checkstatusByCell(cell, key);
            }
            if (key === 'bl' && value !== '0') {
                style += 'font-weight: bold;';
            }

            if (key === 'it' && value !== '0') {
                style += 'font-style:italic;';
            }

            if (key === 'ff') {
                let f = value;
                style += `font-family: ${f};`;
            }

            if (key === 'fs' && value !== '10') {
                style += `font-size: ${value}pt;`;
            }

            if ((key === 'fc' && value !== '#000000') || checksAF != null || (checksCF != null && checksCF.textColor != null)) {
                if (checksCF != null && checksCF.textColor != null) {
                    style += `color: ${checksCF.textColor};`;
                } else if (checksAF != null) {
                    style += `color: ${checksAF[0]};`;
                } else {
                    style += `color: ${value};`;
                }
            }

            if (key === 'bg' && value !== '#ffffff' && value !== '#fff') {
                style += `background: ${value};`;
            }

            if (key === 'cl' && value !== '0') {
                style += 'text-decoration: line-through;';
            }

            if (key === 'un' && (value === '1' || value === '3')) {
                let color = cell._color;
                if (color == null) {
                    color = cell.fc;
                }
                let fs = cell._fontSize || 11;
                if (fs == null) {
                    fs = cell.fs || 11;
                }
                style += `border-bottom: ${Math.floor(fs / 9)}px solid ${color};`;
            }
        }
        return style;
    }

    checkstatusByCell(cell: IStyleSetting, a: string) {
        // 获取当前单元格配置 默认值
        let foucsStatus: any;
        let tf = { bl: 1, it: 1, ff: 1, cl: 1, un: 1 };

        if (a in tf) {
            if (foucsStatus == null) {
                foucsStatus = '0';
            } else {
                foucsStatus = foucsStatus[a];

                if (foucsStatus == null) {
                    foucsStatus = '0';
                }
            }
        } else if (a === 'fc') {
            if (foucsStatus == null) {
                foucsStatus = '#000000';
            } else {
                foucsStatus = foucsStatus[a];

                if (foucsStatus == null) {
                    foucsStatus = '#000000';
                }

                if (foucsStatus.indexOf('rgba') > -1) {
                    foucsStatus = Color.rgbColorToHexValue(foucsStatus);
                }
            }
        } else if (a === 'bg') {
            if (foucsStatus == null) {
                foucsStatus = null;
            } else {
                foucsStatus = foucsStatus[a];

                if (foucsStatus == null) {
                    foucsStatus = null;
                } else if ((foucsStatus as string).toString().indexOf('rgba') > -1) {
                    foucsStatus = Color.rgbColorToHexValue(foucsStatus);
                }
            }
        } else if (a.substr(0, 2) === 'bs') {
            if (foucsStatus == null) {
                foucsStatus = 'none';
            } else {
                foucsStatus = foucsStatus[a];
                if (foucsStatus == null) {
                    foucsStatus = 'none';
                }
            }
        } else if (a.substr(0, 2) === 'bc') {
            if (foucsStatus == null) {
                foucsStatus = '#000000';
            } else {
                foucsStatus = foucsStatus[a];
                if (foucsStatus == null) {
                    foucsStatus = '#000000';
                }
            }
        } else if (a === 'ht') {
            if (foucsStatus == null) {
                foucsStatus = '1';
            } else {
                foucsStatus = foucsStatus[a];
                if (foucsStatus == null) {
                    foucsStatus = '1';
                }
            }

            if (['0', '1', '2'].indexOf(foucsStatus.toString()) === -1) {
                foucsStatus = '1';
            }
        } else if (a === 'vt') {
            // 默认垂直居中
            if (foucsStatus == null) {
                foucsStatus = '0';
            } else {
                foucsStatus = foucsStatus[a];
                if (foucsStatus == null) {
                    foucsStatus = '0';
                }
            }

            if (['0', '1', '2'].indexOf(foucsStatus.toString()) === -1) {
                foucsStatus = '0';
            }
        } else if (a === 'ct') {
            if (foucsStatus == null) {
                foucsStatus = null;
            } else {
                foucsStatus = foucsStatus[a];
                if (foucsStatus == null) {
                    foucsStatus = null;
                }
            }
        } else if (a === 'fs') {
            if (foucsStatus == null) {
                foucsStatus = '10';
            } else {
                foucsStatus = foucsStatus[a];
                if (foucsStatus == null) {
                    foucsStatus = '10';
                }
            }
        } else if (a === 'tb') {
            if (foucsStatus == null) {
                foucsStatus = '0';
            } else {
                foucsStatus = foucsStatus[a];
                if (foucsStatus == null) {
                    foucsStatus = '0';
                }
            }
        } else if (a === 'tr') {
            if (foucsStatus == null) {
                foucsStatus = '0';
            } else {
                foucsStatus = foucsStatus[a];
                if (foucsStatus == null) {
                    foucsStatus = '0';
                }
            }
        } else if (a === 'rt') {
            if (foucsStatus == null) {
                foucsStatus = null;
            } else {
                foucsStatus = foucsStatus[a];
                if (foucsStatus == null) {
                    foucsStatus = null;
                }
            }
        }

        return foucsStatus;
    }
}
