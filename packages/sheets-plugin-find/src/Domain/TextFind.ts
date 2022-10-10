import { Range, Worksheet, RangeList, FormatType, IRangeData } from '@univer/core';
import { getRegExpStr } from '../Util/util';
import { FindType } from '../IData';

export class TextFinder {
    private _text: string | FormatType;

    private _type: FindType; // 查找类型

    private _range: Range[]; // 保存匹配到的单元格range格式

    private _rangeData: Range[] = []; // ranglist每个单元格range格式

    private _rangeList: IRangeData[]; // 初始rangeList

    private _workSheet: Worksheet;

    private _index: number;

    private _matchCase: boolean = false; // 大小写匹配

    private _matchEntire: boolean = false; // 完全匹配

    private _useRegEx: boolean = false; // 正则匹配

    private _matchFormula: boolean = false; // 匹配公式文字

    private _startRange: Range | null; // 从这个位置后开始找

    constructor(workSheet: Worksheet, type: FindType, text?: string | FormatType) {
        this._workSheet = workSheet;
        this._type = type;
        if (text) {
            this._text = text;
        }
        this._index = -1;
        this._rangeList = this._workSheet.getActiveRangeList().getRangeList();
        if (
            this._rangeList.length == 0 ||
            (this._rangeList.length == 1 && this._rangeList[0].startRow == this._rangeList[0].endRow && this._rangeList[0].startColumn == this._rangeList[0].endColumn)
        ) {
            this._rangeList = [
                {
                    startRow: 0,
                    endRow: this._workSheet.getLastRow(),
                    startColumn: 0,
                    endColumn: this._workSheet.getLastColumn(),
                },
            ];
        }
        for (let i = 0; i < this._rangeList.length; i++) {
            const range = new Range(this._workSheet, this._rangeList[i]);
            for (let j = this._rangeList[i].startRow; j <= this._rangeList[i].endRow; j++) {
                for (let k = this._rangeList[i].startColumn; k <= this._rangeList[i].endColumn; k++) {
                    this._rangeData.push(range.getCell(j, k));
                }
            }
        }
    }

    /**
     * Returns all cells matching the search criteria.
     */
    findAll(): Range[] | null {
        this._index = -1;
        this._match();
        if (this._range.length == 0) return null;
        return this._range;
    }

    /**
     * Returns the next cell matching the search criteria.
     */
    findNext(): Range | null {
        this._match();
        if (this._range.length == 0) return null;
        this._index++;
        if (this._index > this._range.length - 1) this._index = 0;
        return this._range[this._index];
    }

    /**
     * Returns the previous cell matching the search criteria.
     */
    findPrevious(): Range | null {
        this._match();
        if (this._range.length == 0) return null;
        this._index--;
        if (this._index < 0) this._index = this._range.length - 1;
        return this._range[this._index];
    }

    /**
     * If true, configures the search to match the search text's case exactly, otherwise the search defaults to case-insensitive matching.
     */
    matchCase(matchCase: boolean): TextFinder {
        this._matchCase = matchCase;
        return this;
    }

    /**
     * If true, configures the search to match the entire contents of a cell; otherwise, the search defaults to partial matching.
     */
    matchEntireCell(matchEntire: boolean): TextFinder {
        this._matchEntire = matchEntire;
        return this;
    }

    /**
     * If true, configures the search to return matches that appear within formula text; otherwise cells with formulas are considered based on their displayed value.
     */
    matchFormulaText(matchFormulaText: boolean): TextFinder {
        this._matchFormula = matchFormulaText;
        return this;
    }

    /**
     * If true, configures the search to interpret the search string as a regular expression; otherwise the search interprets the search string as normal text.
     */
    useRegularExpression(useRegEx: boolean): TextFinder {
        this._useRegEx = useRegEx;
        return this;
    }

    /**
     * TODO
     * 替换还需考虑编辑模式和保护模式,整个workbook
     */
    /**
     * Replaces all matches with the specified text. Returns the number of occurrences replaced, which may be different from the number of matched cells.
     */
    replaceAllWith(replaceText: string): number {
        const range = this.findAll();
        if (!range) return 0;
        const rangType = [];
        for (let i = 0; i < range.length; i++) {
            rangType.push(range[i].getRangeData());
        }
        const rangeList = new RangeList(this._workSheet, rangType);
        rangeList.setValue(replaceText);
        return range.length;
    }

    /**
     * Replaces the search text in the currently matched cell with the specified text and returns the number of occurrences replaced.
     */
    replaceWith(replaceText: string): number {
        const range = this.findNext();
        if (!range) return 0;
        this._index--;
        range.setValue(replaceText);
        return 1;
    }

    /**
     * Configures the search to start searching immediately after the specified cell range.
     */
    startFrom(startRange: Range): TextFinder {
        this._startRange = startRange;
        return this;
    }

    /**
     * Returns the current cell matching the search criteria.
     */
    getCurrentMatch(): Range | null {
        if (this._index < 0) return null;
        return this._range[this._index];
    }

    /**
     * match rule
     */
    private _match = () => {
        const choose = new Map<string | FormatType, () => Range[]>([
            ['text', this._mathTxt],
            ['condition', this._matchCondition],
            ['intervalRow', () => this._matchInterval('row')],
            ['intervalColumn', () => this._matchInterval('column')],
            ['null', this._matchNull],
            ['format', this._matchFormat],
        ]);
        let range;
        if (this._type in FormatType) {
            range = choose.get('format')!();
        } else {
            range = choose.get(this._type)!();
        }
        // range.sort((a, b) => a.getRangeData().startRow - b.getRangeData().startRow).sort((a, b) => a.getRangeData().startColumn - b.getRangeData().startColumn);
        if (this._startRange) {
            const startRange = this._startRange.getRangeData();
            for (let i = 0; i < range.length; i++) {
                const cell = range[i].getRangeData();
                if (cell.startColumn <= startRange.endColumn) {
                    range.splice(i, 1);
                    i--;
                } else if (cell.startRow < startRange.startRow) {
                    range.splice(i, 1);
                    i--;
                }
            }
        }
        this._range = range;
    };

    // 查找文本
    private _mathTxt(): Range[] {
        this._text = this._text as string;
        const range = [];
        for (let i = 0; i < this._rangeData.length; i++) {
            let value = this._rangeData[i].getValue().m;
            if (this._matchFormula) {
                value = this._rangeData[i].getValue().f;
            }
            if (value != null) {
                value = value.toString();
                if (this._matchEntire) {
                    if (this._matchCase) {
                        if (this._text == value) {
                            range.push(this._rangeData[i]);
                        }
                    } else {
                        if (this._text.toLowerCase() == value.toLowerCase()) {
                            range.push(this._rangeData[i]);
                        }
                    }
                } else if (this._useRegEx) {
                    let reg;
                    if (this._matchCase) {
                        reg = new RegExp(getRegExpStr(this._text), 'g');
                    } else {
                        reg = new RegExp(getRegExpStr(this._text), 'ig');
                    }

                    if (reg.test(value)) {
                        range.push(this._rangeData[i]);
                    }
                } else {
                    let reg = new RegExp(getRegExpStr(this._text), 'ig');
                    if (reg.test(value)) {
                        range.push(this._rangeData[i]);
                    }
                }
            }
        }
        return range;
    }

    // 按format寻找
    private _matchFormat(): Range[] {
        const range = [];
        for (let i = 0; i < this._rangeData.length; i++) {
            const format = this._rangeData[i].getValue().fm?.t;
            if (!format) continue;
            if (format == this._type) {
                range.push(this._rangeData[i]);
            }
        }
        return range;
    }

    // 寻找null的单元格
    private _matchNull(): Range[] {
        const range = [];
        for (let i = 0; i < this._rangeData.length; i++) {
            let value = this._rangeData[i].getValue().v;
            if (value == null) {
                range.push(this._rangeData[i]);
            }
        }
        return range;
    }

    // todo: 等condition插件定好结构
    // 寻找条件格式
    private _matchCondition(): Range[] {
        const range: Range[] = [];
        return range;
    }

    // todo: 移到UI里,增加开始行列,间隔行列数
    // 寻找间隔行间隔列,移到UI里
    private _matchInterval(param: 'column' | 'row'): Range[] {
        const range = [];
        for (let i = 0; i < this._rangeList.length; i++) {
            const rangeArea = this._rangeList[i];
            if (param == 'row') {
                if (rangeArea.startRow == rangeArea.endRow) {
                    continue;
                }
                for (let j = rangeArea.startRow; j <= rangeArea.endRow; j++) {
                    if ((j - rangeArea.startRow) % 2 == 0) {
                        range.push(
                            new Range(this._workSheet, {
                                startRow: j,
                                endRow: j,
                                startColumn: rangeArea.startColumn,
                                endColumn: rangeArea.endColumn,
                            })
                        );
                    }
                }
            } else {
                if (rangeArea.startColumn == rangeArea.endColumn) {
                    continue;
                }
                for (let j = rangeArea.startColumn; j <= rangeArea.endColumn; j++) {
                    if ((j - rangeArea.startColumn) % 2 == 0) {
                        range.push(
                            new Range(this._workSheet, {
                                startRow: rangeArea.startRow,
                                endRow: rangeArea.endRow,
                                startColumn: j,
                                endColumn: j,
                            })
                        );
                    }
                }
            }
        }
        return range;
    }
}
