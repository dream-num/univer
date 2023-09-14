import { ISelectionTransformerShapeManager } from '@univerjs/base-render';
import { SelectionManagerService } from '@univerjs/base-sheets';
import { FormatType, ICellData, ICurrentUniverService, IGridRange, Nullable, ObjectMatrix, Range, Worksheet } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { FindType } from '../IData';
import { getRegExpStr } from '../Util/util';
import { SelectSearch } from '../View/UI/FindModal';

export class TextFinder {
    private _text: string | FormatType;

    private _type: FindType = 'text'; // 查找类型

    private _searchRange: SelectSearch = SelectSearch.CurrentSheet; //查找范围

    private _range: IGridRange[]; // 保存匹配到的单元格range格式

    private _rangeData: IGridRange[] = []; // rangList每个单元格range格式

    private _index: number;

    private _matchCase: boolean = false; // 大小写匹配

    private _matchEntire: boolean = false; // 完全匹配

    private _useRegEx: boolean = false; // 正则匹配

    private _matchFormula: boolean = false; // 匹配公式文字

    private _startRange: Nullable<Range>; // 从这个位置后开始找

    constructor(
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ISelectionTransformerShapeManager private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager
    ) {}

    /**
     * Returns all cells matching the search criteria.
     */
    findAll(): Nullable<TextFinder> {
        this._match();
        if (!this._range.length) return null;
        return this;
    }

    /**
     * Returns the next cell matching the search criteria.
     */
    findNext(): Nullable<TextFinder> {
        if (this._range.length === 0) return null;
        this._index++;
        if (this._index > this._range.length - 1) this._index = 0;
        this._highlightCell(this._range[this._index]);
        return this;
    }

    /**
     * Returns the previous cell matching the search criteria.
     */
    findPrevious(): Nullable<TextFinder> {
        if (this._range.length === 0) return null;
        this._index--;
        if (this._index < 0) this._index = this._range.length - 1;
        this._highlightCell(this._range[this._index]);
        return this;
    }

    getCount(): number {
        return this._range.length;
    }

    getCurrentIndex(): number {
        return this._index;
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
        if (!this._range.length) return 0;

        let count = 0;
        const sheetId = this._range[0].sheetId;
        let sheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getSheetBySheetId(sheetId);
        for (let i = 0; i < this._range.length; i++) {
            if (sheetId !== this._range[i].sheetId) {
                sheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getSheetBySheetId(this._range[i].sheetId);
            }
            const range = this._range[i];
            if (!sheet) continue;

            this._replaceText(sheet, range, replaceText);
            count++;
        }
        this._range = [];
        this._index = -1;

        return count;
    }

    /**
     * Replaces the search text in the currently matched cell with the specified text and returns the number of occurrences replaced.
     */
    replaceWith(replaceText: string): number {
        if (!this._range.length) return 0;
        const range = this._range[this._index];
        const sheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getSheetBySheetId(range.sheetId);
        if (!sheet) return 0;

        this._replaceText(sheet, range, replaceText);

        this._range.splice(this._index, 1);
        this._highlightCell(this._range[this._index]);
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
    getCurrentMatch(): IGridRange | null {
        if (this._index < 0) return null;
        return this._range[this._index];
    }

    // 开始查找
    searchText(text: string | FormatType, type: FindType = 'text', searchRange: SelectSearch = SelectSearch.CurrentSheet): TextFinder | null {
        if (!text) return null;
        // 查找范围变化或者初始化rangeData
        if (this._searchRange !== searchRange || !this._rangeData.length) {
            this._getRange(searchRange);
        }
        // 查找文字或者类型变化
        if (this._text !== text || this._type !== type) {
            this._type = type;
            this._text = text;
            this._index = -1;
            this.findAll();
        }
        return this;
    }

    private _getRange(searchRange: SelectSearch) {
        if (searchRange === SelectSearch.CurrentSheet) {
            const sheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
            const sheetId = sheet.getSheetId();
            const rangeList: IGridRange = {
                sheetId,
                rangeData: {
                    startRow: 0,
                    endRow: sheet.getLastRow(),
                    startColumn: 0,
                    endColumn: sheet.getLastColumn(),
                },
            };
            this._rangeData = [rangeList];
        }
    }

    /**
     * match rule
     */
    private _match = () => {
        const matchMap = new Map<string | FormatType, () => IGridRange[]>([
            ['text', this._mathTxt.bind(this)],
            // ['condition', this._matchCondition],
            // ['intervalRow', () => this._matchInterval('row')],
            // ['intervalColumn', () => this._matchInterval('column')],
            // ['null', this._matchNull],
            // ['format', this._matchFormat],
        ]);
        let range;
        if (this._type in FormatType) {
            range = matchMap.get('format')!();
        } else {
            range = matchMap.get(this._type)!();
        }
        // range.sort((a, b) => a.getRangeData().startRow - b.getRangeData().startRow).sort((a, b) => a.getRangeData().startColumn - b.getRangeData().startColumn);
        // if (this._startRange) {
        //     const startRange = this._startRange.getRangeData();
        //     for (let i = 0; i < range.length; i++) {
        //         const cell = range[i].getRangeData();
        //         if (cell.startColumn <= startRange.endColumn) {
        //             range.splice(i, 1);
        //             i--;
        //         } else if (cell.startRow < startRange.startRow) {
        //             range.splice(i, 1);
        //             i--;
        //         }
        //     }
        // }
        this._range = range;
    };

    // 查找文本
    private _mathTxt(): IGridRange[] {
        const range: IGridRange[] = [];
        for (let i = 0; i < this._rangeData.length; i++) {
            const sheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getSheetBySheetId(this._rangeData[i].sheetId);
            if (!sheet) return [];
            let matrix: ObjectMatrix<ICellData> = new ObjectMatrix<ICellData>();
            if (this._matchFormula) {
                // matrix = this._rangeData[i].getValue().f;
            } else {
                matrix = sheet.getRange(this._rangeData[i].rangeData).getMatrix();
            }

            if (this._matchEntire) {
                matrix.forValue((row, col, value) => {
                    if (!value.m) return;
                    if ((this._matchCase && value.m === this._text) || (this._text as string).toLowerCase() === value.m.toLowerCase()) {
                        range.push({
                            sheetId: this._rangeData[i].sheetId,
                            rangeData: {
                                startRow: row,
                                endRow: row,
                                startColumn: col,
                                endColumn: col,
                            },
                        });
                    }
                });
            }
            //  else if (this._useRegEx) {
            //     let reg;
            //     if (this._matchCase) {
            //         reg = new RegExp(getRegExpStr(this._text), 'g');
            //     } else {
            //         reg = new RegExp(getRegExpStr(this._text), 'ig');
            //     }

            //     if (reg.test(value)) {
            //         range.push(this._rangeData[i]);
            //     }
            // }
            else {
                const reg = new RegExp(getRegExpStr(this._text as string), this._matchCase ? 'g' : 'ig');

                matrix.forValue((row, col, value) => {
                    if (!value.m) return;
                    if (reg.test(value.m)) {
                        reg.lastIndex = 0;
                        range.push({
                            sheetId: this._rangeData[i].sheetId,
                            rangeData: {
                                startRow: row,
                                endRow: row,
                                startColumn: col,
                                endColumn: col,
                            },
                        });
                    }
                });
            }
        }
        return range;
    }

    // 高亮匹配单元格
    private _highlightCell(range: IGridRange) {
        if (!range) return;
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const unitId = workbook.getUnitId();
        const sheetId = range.sheetId;
        const mergeData = workbook.getActiveSheet().getMergeData();

        const selectionRange = this._selectionManagerService.transformCellDataToSelectionData(range.rangeData.startColumn, range.rangeData.endColumn, mergeData);
        if (selectionRange == null) {
            return;
        }

        this._selectionManagerService.replace([
            {
                ...selectionRange,
                ...this._selectionManagerService.createDefaultSelection(),
            },
        ]);
    }

    private _replaceText(sheet: Worksheet, range: IGridRange, text: string) {
        const value = sheet.getRange(range.rangeData).getValue();
        if (!value || !value.m) return 0;
        if (!this._matchEntire) {
            let match;
            match = 'ig';
            if (this._matchCase) {
                match = 'g';
            }
            const reg = new RegExp(getRegExpStr(this._text as string), match);
            // sheet.getRange(range.rangeData).setValue(value.m.replace(reg, text));
        } else {
            // sheet.getRange(range.rangeData).setValue(text);
        }
    }
}
