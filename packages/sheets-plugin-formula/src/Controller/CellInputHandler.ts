import { $$, getNodeindex, xssDeal } from '@univerjs/base-ui';
import { Nullable, Tools } from '@univerjs/core';
import { FunList } from '../Basics';

/**
 * Random color for formula cell input
 */
const LUCKY_COLOR = [
    '#c1232b',
    '#27727b',
    '#fcce10',
    '#e87c25',
    '#b5c334',
    '#fe8463',
    '#9bca63',
    '#fad860',
    '#f3a43b',
    '#60c0dd',
    '#d7504b',
    '#c6e579',
    '#f4e001',
    '#f0805a',
    '#26c0c0',
    '#c12e34',
    '#e6b600',
    '#0098d9',
    '#2b821d',
    '#005eaa',
    '#339ca8',
    '#cda819',
    '#32a487',
    '#3fb1e3',
    '#6be6c1',
    '#626c91',
    '#a0a7e6',
    '#c4ebad',
    '#96dee8',
];

/**
 * Handle cell input event
 */
export class CellInputHandler {
    functionHTMLIndex: number;

    functionRangeIndex: Range | number[];

    operator: string;

    operatorjson: object;

    rangestart: boolean;

    rangedrag_column_start: boolean;

    rangedrag_row_start: boolean;

    // inputValue: string;

    formula: any;

    functionlistPosition: object;

    funcName: Nullable<string>;

    paramindex: number;

    searchFunctionCell: any;

    editor: HTMLElement;

    constructor(ele: HTMLElement) {
        this.functionHTMLIndex = 0;
        this.functionRangeIndex = [];
        this.operator = '===|!==|<>|<=|>=|=|+|-|>|<|/|*|%|&|^';
        this.operatorjson = this.covertOperatorjson();
        this.rangestart = false;
        this.rangedrag_column_start = false;
        this.rangedrag_row_start = false;
        this.functionlistPosition = {};

        this.editor = ele;
    }

    covertOperatorjson() {
        let arr = this.operator.split('|');
        let op = {};

        for (let i = 0; i < arr.length; i++) {
            op[arr[i].toString()] = 1;
        }

        return op;
    }

    getFormula() {
        return this.formula || [];
    }

    getInputValue() {
        return this.editor.innerHTML;
    }

    /**
     * update value and html
     * @param value
     */
    setInputValue(value: string) {
        this.editor.innerHTML = xssDeal(value);
    }

    getHelpFormula() {
        return [this.funcName, this.paramindex];
    }

    getFunctionlistPosition() {
        return this.functionlistPosition;
    }

    /**
     * An entry that handles input events
     *
     * @param $input
     * @param kcode
     */
    functionInputHandler($input: HTMLElement, kcode: number) {
        let _this = this;

        let $editer = $input;
        let value1 = $editer.innerHTML;
        let value1txt = $editer.textContent || '';

        // You must use setTimeout to get the current input value
        setTimeout(() => {
            let value = $editer.textContent || '';
            let valuetxt = value;
            value = xssDeal(value);
            _this.funcName = null;
            if (value.length > 0 && value.substr(0, 1) === '=' && (kcode !== 229 || value.length === 1)) {
                // _this.inputValue = value;
                value = _this.functionHTMLGenerate(value);
                value1 = _this.functionHTMLGenerate(value1txt);
                let currSelection = window.getSelection();
                if (currSelection) {
                    // all browsers, except IE before version 9
                    if (currSelection?.anchorNode instanceof HTMLElement && currSelection.anchorNode?.matches('div')) {
                        let editorlen = $$('span', $editer).length;
                        _this.functionRangeIndex = [editorlen - 1, $$('span', $editer)[editorlen - 1].textContent.length];
                    } else {
                        _this.functionRangeIndex = [getNodeindex(currSelection.anchorNode?.parentNode), currSelection.anchorOffset];
                    }
                } else {
                    // Internet Explorer before version 9
                    let textRange = (document as any).selection.createRange();
                    _this.functionRangeIndex = textRange;
                }

                $editer.innerHTML = value;
                _this.functionRange($editer, value, value1);
                _this.canceFunctionrangeSelected();

                if (kcode !== 46) {
                    // delete不执行此函数
                    // _this.createRangeHightlight();
                }

                _this.rangestart = false;
                _this.rangedrag_column_start = false;
                _this.rangedrag_row_start = false;

                const current = _this.getrangeseleciton() as HTMLSpanElement;

                _this.helpFunctionExe($editer, current);
            } else if (value1txt.substr(0, 1) !== '=') {
                // if ($copy.attr('id') === 'universheet-rich-text-editor') {
                //     if ($copy.html().substr(0, 5) === '<span') {
                //     } else {
                //         $copy.html(value);
                //     }
                // } else {
                //     $copy.html(value);
                // }
            } else {
                // _this.inputValue = value;
            }
        }, 1);
    }

    findrangeindex(v: string, vp: string) {
        let _this = this;

        let re = /<span.*?>/g;
        let v_a_string = v.replace(re, '');
        let vp_a_string = vp.replace(re, '');
        let v_a = v_a_string.split('</span>');
        let vp_a = vp_a_string.split('</span>');
        v_a.pop();
        vp_a.pop();

        let pfri = _this.functionRangeIndex;
        // let i = 0;
        let spanlen = vp_a.length > v_a.length ? v_a.length : vp_a.length;

        let vplen = vp_a.length;
        let vlen = v_a.length;

        // 不增加元素输入
        if (vplen === vlen) {
            let i = pfri[0];
            let p = vp_a[i];
            let n = v_a[i];

            if (p == null) {
                if (vp_a.length <= i) {
                    pfri = [vp_a.length - 1, vp_a.length - 1];
                } else if (v_a.length <= i) {
                    pfri = [v_a.length - 1, v_a.length - 1];
                }

                return pfri;
            }
            if (p.length === n.length) {
                if (vp_a[i + 1] != null && v_a[i + 1] != null && vp_a[i + 1].length < v_a[i + 1].length) {
                    pfri[0] += 1;
                    pfri[1] = 1;
                }

                return pfri;
            }
            if (p.length > n.length) {
                if (p != null && v_a[i + 1] != null && v_a[i + 1].substr(0, 1) === '"' && (p.indexOf('{') > -1 || p.indexOf('}') > -1)) {
                    pfri[0] += 1;
                    pfri[1] = 1;
                }

                return pfri;
            }
            if (p.length < n.length) {
                if (pfri[1] > n.length) {
                    pfri[1] = n.length;
                }

                return pfri;
            }
        }
        // 减少元素输入
        else if (vplen > vlen) {
            let i = pfri[0];
            let p = vp_a[i];
            let n = v_a[i];

            if (n == null) {
                if (v_a[i - 1].indexOf('{') > -1) {
                    pfri[0] -= 1;
                    let start = v_a[i - 1].search('{');
                    pfri[1] += start;
                } else {
                    pfri[0] = 0;
                    pfri[1] = 0;
                }
            } else if (p.length === n.length) {
                if (v_a[i + 1] != null && (v_a[i + 1].substr(0, 1) === '"' || v_a[i + 1].substr(0, 1) === '{' || v_a[i + 1].substr(0, 1) === '}')) {
                    pfri[0] += 1;
                    pfri[1] = 1;
                } else if (p != null && p.length > 2 && p.substr(0, 1) === '"' && p.substr(p.length - 1, 1) === '"') {
                    // pfri[1] = n.length-1;
                } else if (v_a[i] != null && v_a[i] === '")') {
                    pfri[1] = 1;
                } else if (v_a[i] != null && v_a[i] === '"}') {
                    pfri[1] = 1;
                } else if (v_a[i] != null && v_a[i] === '{)') {
                    pfri[1] = 1;
                } else {
                    pfri[1] = n.length;
                }

                return pfri;
            } else if (p.length > n.length) {
                if (v_a[i + 1] != null && (v_a[i + 1].substr(0, 1) === '"' || v_a[i + 1].substr(0, 1) === '{' || v_a[i + 1].substr(0, 1) === '}')) {
                    pfri[0] += 1;
                    pfri[1] = 1;
                }

                return pfri;
            } else if (p.length < n.length) {
                return pfri;
            }

            return pfri;
        }
        // 增加元素输入
        else if (vplen < vlen) {
            let i = pfri[0];
            let p = vp_a[i];
            let n = v_a[i];

            if (p == null) {
                pfri[0] = v_a.length - 1;

                if (n != null) {
                    pfri[1] = n.length;
                } else {
                    pfri[1] = 1;
                }
            } else if (p.length === n.length) {
                if (vp_a[i + 1] != null && (vp_a[i + 1].substr(0, 1) === '"' || vp_a[i + 1].substr(0, 1) === '{' || vp_a[i + 1].substr(0, 1) === '}')) {
                    pfri[1] = n.length;
                } else if (v_a[i + 1] != null && v_a[i + 1].substr(0, 1) === '"' && (v_a[i + 1].substr(0, 1) === '{' || v_a[i + 1].substr(0, 1) === '}')) {
                    pfri[0] += 1;
                    pfri[1] = 1;
                } else if (n != null && n.substr(0, 1) === '"' && n.substr(n.length - 1, 1) === '"' && p.substr(0, 1) === '"' && p.substr(p.length - 1, 1) === ')') {
                    pfri[1] = n.length;
                } else if (n != null && n.substr(0, 1) === '{' && n.substr(n.length - 1, 1) === '}' && p.substr(0, 1) === '{' && p.substr(p.length - 1, 1) === ')') {
                    pfri[1] = n.length;
                } else {
                    pfri[0] = pfri[0] + vlen - vplen;
                    if (v_a.length > vp_a.length) {
                        pfri[1] = v_a[i + 1].length;
                    } else {
                        pfri[1] = 1;
                    }
                }

                return pfri;
            } else if (p.length > n.length) {
                if (p != null && p.substr(0, 1) === '"') {
                    pfri[1] = n.length;
                } else if (v_a[i + 1] != null && /{.*?}/.test(v_a[i + 1])) {
                    pfri[0] += 1;
                    pfri[1] = v_a[i + 1].length;
                } else if (p != null && v_a[i + 1].substr(0, 1) === '"' && (p.indexOf('{') > -1 || p.indexOf('}') > -1)) {
                    pfri[0] += 1;
                    pfri[1] = 1;
                }
                //  else if (p != null && (p.indexOf('{') > -1 || p.indexOf('}') > -1)) {
                // }
                else {
                    pfri[0] = pfri[0] + vlen - vplen - 1;
                    pfri[1] = v_a[i - 1].length;
                }

                return pfri;
            } else if (p.length < n.length) {
                return pfri;
            }

            return pfri;
        }

        return null;
    }

    setCaretPosition(textDom: HTMLElement, children: number, pos: number) {
        try {
            let el = textDom;
            let range = document.createRange();
            let sel = window.getSelection();
            range.setStart(el.childNodes[children], pos);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
            el.focus();
        } catch (err) {
            // universheetRangeLast(this.rangeResizeTo[0]);
        }
    }

    functionRange(obj: HTMLElement, v: string, vp: string) {
        let _this = this;

        // ie11 10 9 ff safari
        let currSelection = window.getSelection();
        let fri = _this.findrangeindex(v, vp);

        // FIX: set position
        if (fri == null && currSelection) {
            currSelection.selectAllChildren(obj[0]);
            currSelection.collapseToEnd();
        } else if (fri != null) {
            let span = $$('span', obj);

            _this.setCaretPosition(Array.isArray(span) ? span[fri[0]] : span, 0, fri[1]);
        }
    }

    functionHTMLGenerate(txt: string) {
        let _this = this;

        if (txt.length === 0 || txt.substr(0, 1) !== '=') {
            return txt;
        }

        _this.functionHTMLIndex = 0;

        return `<span dir="auto" class="universheet-formula-text-color">=</span>${_this.functionHTML(txt)}`;
    }

    functionHTML(txt: string) {
        let _this = this;

        if (_this.operatorjson == null) {
            let arr = _this.operator.split('|');
            let op = {};

            for (let i = 0; i < arr.length; i++) {
                op[arr[i].toString()] = 1;
            }

            _this.operatorjson = op;
        }

        if (txt.substr(0, 1) === '=') {
            txt = txt.substr(1);
        }

        let funcstack = txt.split('');
        let i = 0;
        let str = '';
        let function_str = '';
        let ispassby = true;
        let matchConfig = {
            bracket: 0,
            comma: 0,
            squote: 0,
            dquote: 0,
            braces: 0,
        };

        while (i < funcstack.length) {
            let s = funcstack[i];

            if (s === '(' && matchConfig.squote === 0 && matchConfig.dquote === 0 && matchConfig.braces === 0) {
                matchConfig.bracket += 1;

                if (str.length > 0) {
                    function_str += `<span dir="auto" class="universheet-formula-text-func">${str}</span><span dir="auto" class="universheet-formula-text-lpar">(</span>`;
                } else {
                    function_str += '<span dir="auto" class="universheet-formula-text-lpar">(</span>';
                }

                str = '';
            } else if (s === ')' && matchConfig.squote === 0 && matchConfig.dquote === 0 && matchConfig.braces === 0) {
                matchConfig.bracket -= 1;
                function_str += `${_this.functionHTML(str)}<span dir="auto" class="universheet-formula-text-rpar">)</span>`;
                str = '';
            } else if (s === '{' && matchConfig.squote === 0 && matchConfig.dquote === 0) {
                str += '{';
                matchConfig.braces += 1;
            } else if (s === '}' && matchConfig.squote === 0 && matchConfig.dquote === 0) {
                str += '}';
                matchConfig.braces -= 1;
            } else if (s === '"' && matchConfig.squote === 0) {
                if (matchConfig.dquote > 0) {
                    if (str.length > 0) {
                        function_str += `${str}"</span>`;
                    } else {
                        function_str += '"</span>';
                    }

                    matchConfig.dquote -= 1;
                    str = '';
                } else {
                    matchConfig.dquote += 1;

                    if (str.length > 0) {
                        function_str += `${_this.functionHTML(str)}<span dir="auto" class="universheet-formula-text-string">"`;
                    } else {
                        function_str += `<span dir="auto" class="universheet-formula-text-string">"`;
                    }

                    str = '';
                }
            }
            // 修正例如输入公式='1-2'!A1时，只有2'!A1是universheet-formula-functionrange-cell色，'1-是黑色的问题。
            else if (s === "'" && matchConfig.dquote === 0) {
                str += "'";
                matchConfig.squote = matchConfig.squote === 0 ? 1 : 0;
            } else if (s === ',' && matchConfig.squote === 0 && matchConfig.dquote === 0 && matchConfig.braces === 0) {
                // matchConfig.comma += 1;
                function_str += `${_this.functionHTML(str)}<span dir="auto" class="universheet-formula-text-comma">,</span>`;
                str = '';
            } else if (s === '&' && matchConfig.squote === 0 && matchConfig.dquote === 0 && matchConfig.braces === 0) {
                if (str.length > 0) {
                    function_str += `${_this.functionHTML(str)}<span dir="auto" class="universheet-formula-text-calc">&</span>`;
                    str = '';
                } else {
                    function_str += '<span dir="auto" class="universheet-formula-text-calc">&</span>';
                }
            } else if (s in _this.operatorjson && matchConfig.squote === 0 && matchConfig.dquote === 0 && matchConfig.braces === 0) {
                let s_next = '';
                if (i + 1 < funcstack.length) {
                    s_next = funcstack[i + 1];
                }

                let p = i - 1;
                let s_pre = null;
                if (p >= 0) {
                    do {
                        s_pre = funcstack[p--];
                    } while (p >= 0 && s_pre === ' ');
                }

                if (s + s_next in _this.operatorjson) {
                    if (str.length > 0) {
                        function_str += `${_this.functionHTML(str)}<span dir="auto" class="universheet-formula-text-calc">${s}${s_next}</span>`;
                        str = '';
                    } else {
                        function_str += `<span dir="auto" class="universheet-formula-text-calc">${s}${s_next}</span>`;
                    }

                    i++;
                } else if (!/[^0-9]/.test(s_next) && s === '-' && (s_pre === '(' || s_pre == null || s_pre === ',' || s_pre === ' ' || s_pre in _this.operatorjson)) {
                    str += s;
                } else if (str.length > 0) {
                    function_str += `${_this.functionHTML(str)}<span dir="auto" class="universheet-formula-text-calc">${s}</span>`;
                    str = '';
                } else {
                    function_str += `<span dir="auto" class="universheet-formula-text-calc">${s}</span>`;
                }
            } else {
                str += s;
            }

            if (i === funcstack.length - 1) {
                // function_str += str;
                if (_this.iscelldata(str.trim())) {
                    function_str += `<span class="universheet-formula-functionrange-cell" rangeindex="${_this.functionHTMLIndex}" dir="auto" style="color:${
                        LUCKY_COLOR[_this.functionHTMLIndex]
                    };">${str}</span>`;
                    _this.functionHTMLIndex++;
                } else if (matchConfig.dquote > 0) {
                    function_str += `${str}</span>`;
                } else if (str.indexOf('</span>') === -1 && str.length > 0) {
                    let regx = /{.*?}/;

                    if (regx.test(str.trim())) {
                        let arraytxt = regx.exec(str)![0];
                        let arraystart = str.search(regx);
                        let alltxt = '';

                        if (arraystart > 0) {
                            alltxt += `<span dir="auto" class="universheet-formula-text-color">${str.substr(0, arraystart)}</span>`;
                        }

                        alltxt += `<span dir="auto" style="color:#959a05" class="universheet-formula-text-array">${arraytxt}</span>`;

                        if (arraystart + arraytxt.length < str.length) {
                            alltxt += `<span dir="auto" class="universheet-formula-text-color">${str.substr(arraystart + arraytxt.length, str.length)}</span>`;
                        }

                        function_str += alltxt;
                    } else {
                        function_str += `<span dir="auto" class="universheet-formula-text-color">${str}</span>`;
                    }
                }
            }

            i++;
        }

        return function_str;
    }

    canceFunctionrangeSelected() {
        // $('#universheet-formula-functionrange-select').hide();
        // $('#universheet-row-count-show, #universheet-column-count-show').hide();
        // // $("#universheet-cols-h-selected, #universheet-rows-h-selected").hide();
        // $('#universheet-formula-search-c, #universheet-formula-help-c').hide();
    }

    iscelldata(txt: string) {
        // 判断是否为单元格格式
        let val = txt.split('!');
        let rangetxt;

        if (val.length > 1) {
            rangetxt = val[1];
        } else {
            rangetxt = val[0];
        }

        let reg_cell = /^(([a-zA-Z]+)|([$][a-zA-Z]+))(([0-9]+)|([$][0-9]+))$/g; // 增加正则判断单元格为字母+数字的格式：如 A1:B3
        let reg_cellRange = /^(((([a-zA-Z]+)|([$][a-zA-Z]+))(([0-9]+)|([$][0-9]+)))|((([a-zA-Z]+)|([$][a-zA-Z]+))))$/g; // 增加正则判断单元格为字母+数字或字母的格式：如 A1:B3，A:A

        if (rangetxt.indexOf(':') === -1) {
            let row = parseInt(rangetxt.replace(/[^0-9]/g, '')) - 1;
            let col = Tools.ABCatNum(rangetxt.replace(/[^A-Za-z]/g, ''));

            if (!Number.isNaN(row) && !Number.isNaN(col) && rangetxt.toString().match(reg_cell)) {
                return true;
            }
            if (!Number.isNaN(row)) {
                return false;
            }
            if (!Number.isNaN(col)) {
                return false;
            }
            return false;
        }
        reg_cellRange = /^(((([a-zA-Z]+)|([$][a-zA-Z]+))(([0-9]+)|([$][0-9]+)))|((([a-zA-Z]+)|([$][a-zA-Z]+)))|((([0-9]+)|([$][0-9]+s))))$/g;

        rangetxt = rangetxt.split(':');

        let row = [];
        let col = [];
        row[0] = parseInt(rangetxt[0].replace(/[^0-9]/g, '')) - 1;
        row[1] = parseInt(rangetxt[1].replace(/[^0-9]/g, '')) - 1;
        if (row[0] > row[1]) {
            return false;
        }

        col[0] = Tools.ABCatNum(rangetxt[0].replace(/[^A-Za-z]/g, ''));
        col[1] = Tools.ABCatNum(rangetxt[1].replace(/[^A-Za-z]/g, ''));
        if (col[0] > col[1]) {
            return false;
        }

        if (rangetxt[0].toString().match(reg_cellRange) && rangetxt[1].toString().match(reg_cellRange)) {
            return true;
        }
        return false;
    }

    getrangeseleciton() {
        let currSelection = window.getSelection()!;
        let anchor = currSelection.anchorNode!;
        let anchorOffset = currSelection.anchorOffset;
        let anchorLength = anchor?.parentElement!.querySelectorAll('span');
        if (anchor?.parentNode?.nodeName === 'SPAN' && anchorOffset !== 0) {
            let txt = anchor.textContent!.trim();
            let lasttxt = '';

            if (txt.length === 0 && anchor.parentNode.previousSibling) {
                let ahr = anchor.parentNode.previousSibling!;
                txt = ahr.textContent!.trim();
                lasttxt = txt.substring(txt.length - 1, 1);
                return ahr;
            }
            lasttxt = txt.substring(anchorOffset - 1, 1);
            return anchor.parentNode;
        }
        if (anchor?.parentElement?.className === 'universheet-rich-text-editor') {
            // const a = anchor.querySelectorAll('span');
            // let txt = anchor.parentElement!.querySelectorAll('span')[anchorLength.length - 1].textContent!.trim();
            let txt = anchor.textContent?.trim()!;

            if (txt.length === 0 && anchor!.parentElement!.querySelectorAll('span').length > 1) {
                let ahr = anchor?.parentElement!.querySelectorAll('span')!;
                const textContent = ahr[`${ahr.length - 2}`].textContent;
                txt = (textContent && textContent.trim()) || '';
                return ahr[anchorLength.length - 1];
            }
            return anchor.parentElement!.querySelectorAll('span')[anchorLength.length - 1];
        }

        // if ((anchor.parentNode as HTMLElement).matches('span') && anchorOffset !== 0) {
        //     let txt = (anchor as HTMLElement).textContent!.trim(),
        //         lasttxt = '';

        //     if (txt.length === 0 && (anchor.parentNode as HTMLElement).previousElementSibling!) {
        //         let ahr = anchor.parentElement!.previousElementSibling;
        //         // txt = ahr.textContent.trim();
        //         // lasttxt = txt.substr(txt.length - 1, 1);
        //         return ahr;
        //     } else {
        //         // lasttxt = txt.substr(anchorOffset - 1, 1);
        //         return anchor.parentNode;
        //     }
        // } else if ((anchor as HTMLElement).matches(styles.richTextEditor) /*|| (anchor as HTMLElement).matches('#universheet-functionbox-cell')*/) {
        //     let txt = anchor.querySelectorAll('span').lastElementChild.textContent.trim();

        //     if (txt.length === 0 && anchor.querySelectorAll('span').length > 1) {
        //         let ahr = anchor.querySelectorAll('span');
        //         // txt = ahr.eq(ahr.length - 2).textContent.trim();
        //         return ahr;
        //     } else {
        //         return anchor.querySelectorAll('span').lastElementChild;
        //     }
        // } else if (
        //     (anchor.parentNode as HTMLElement).matches(styles.richTextEditor) ||
        //     /* (anchor.parentNode as HTMLElement).matches('#universheet-functionbox-cell') ||*/
        //     anchorOffset === 0
        // ) {
        //     if (anchorOffset === 0) {
        //         anchor = anchor.parentNode!;
        //     }

        //     if ((anchor as HTMLElement).previousElementSibling) {
        //         // let txt = anchor.previousElementSibling.textContent.trim();
        //         // let lasttxt = txt.substr(txt.length - 1, 1);
        //         return anchor.previousElementSibling;
        //     }
        // }

        return null;
    }

    searchFunction($editer: HTMLElement) {
        let _this = this;
        // const locale = 'zh';
        this.formula = [];

        // let functionlist = lang[`${locale}`];

        let $cell = _this.getrangeseleciton();

        _this.searchFunctionCell = $cell;

        if ($cell == null || $editer == null) {
            return;
        }

        // Use innerText instead of innerHTML because rich text styles will appear"<span dir="auto" class="univer-formula-text-color">=</span><span dir="auto" class="univer-formula -text-color ">su</span>", resulting in inaccurate judgment of inputContent.substr(0, 1)
        let inputContent = $editer.innerText;
        let searchtxt = $cell.textContent!.toUpperCase();
        let reg = /^[a-zA-Z]|[a-zA-Z_]+$/;
        if (!reg.test(searchtxt) || inputContent.substr(0, 1) !== '=') {
            return;
        }
        // return;
        let result: any = {
            f: [],
            s: [],
            t: [],
        };
        let result_i = 0;

        for (let i = 0; i < FunList.length; i++) {
            let item = FunList[i];
            let n = item.n;

            if (!n) continue;

            if (n === searchtxt) {
                result.f.unshift(item);
                result_i++;
            } else if (n.substr(0, searchtxt.length) === searchtxt) {
                result.s.unshift(item);
                result_i++;
            } else if (n.indexOf(searchtxt) > -1) {
                result.t.unshift(item);
                result_i++;
            }

            if (result_i >= 10) {
                break;
            }
        }

        let list = result.t.concat(result.s.concat(result.f));

        this.formula = list;
        // if (list.length <= 0) {
        // }
    }

    helpFunctionExe($editer: HTMLElement, currSelection: HTMLSpanElement) {
        let _this = this;
        if (document.querySelectorAll('#universheet-formula-help-c').length === 0) {
            for (let i = 0; i < FunList.length; i++) {
                const n = FunList[i].n;
                if (!n) continue;
                _this.functionlistPosition[n] = i;
            }
        }
        if (!currSelection) {
            return;
        }

        let $prev = currSelection;
        let $span = $editer.querySelectorAll('span');
        let currentIndex = [].indexOf.call(currSelection.parentNode!.querySelectorAll(currSelection.tagName), currSelection as never);
        // currentIndex = currSelection.parentNode.childNodes.length - 1,
        let i = currentIndex;

        if ($prev == null) {
            return;
        }
        let funcName = null;
        let paramindex = null;
        if ($span[`${i}`].className === 'universheet-rich-text-editor') {
            funcName = $span[`${i}`].textContent;
        } else {
            let $cur = null;
            let exceptIndex = [-1, -1];

            while (--i > 0) {
                $cur = $span[`${i}`];

                if ($cur.className === 'universheet-formula-text-func' || $cur.textContent!.trim().toUpperCase() in _this.functionlistPosition) {
                    funcName = $cur.textContent;
                    paramindex = null;
                    let endstate = true;

                    for (let a = i; a <= currentIndex; a++) {
                        if (!paramindex) {
                            paramindex = 0;
                        }

                        if (a >= exceptIndex[0] && a <= exceptIndex[1]) {
                            continue;
                        }

                        $cur = $span[`${a}`];
                        if ($cur.className === 'universheet-formula-text-rpar') {
                            exceptIndex = [i, a];
                            funcName = null;
                            endstate = false;
                            break;
                        }

                        if ($cur.className === 'universheet-formula-text-comma') {
                            paramindex++;
                        }
                    }

                    if (endstate) {
                        break;
                    }
                }
            }
        }

        if (funcName == null) {
            return;
        }

        this.funcName = funcName;
        this.paramindex = paramindex!;
    }

    searchFunctionEnter(funcName: string) {
        let _this = this;

        let functxt = funcName;

        let searchFunctionCell = _this.searchFunctionCell;

        searchFunctionCell.innerText = functxt;
        const span = document.createElement('span');
        span.dir = 'auto';
        span.className = 'universheet-formula-text-color';
        span.innerText = '(';
        insertAfter(span, searchFunctionCell);

        _this.setCaretPosition(span, 0, 1);
    }
}

function insertAfter(newElement: any, targetElement: { parentNode: any; nextSibling: any }) {
    let parent = targetElement.parentNode;
    if (parent.lastChild === targetElement) {
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
}
