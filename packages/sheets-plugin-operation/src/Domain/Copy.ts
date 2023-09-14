import { SelectionManagerService } from '@univerjs/base-sheets';
import { Clipboard } from '@univerjs/base-ui';
import { handleJsonToDom, handleStyleToString, ICurrentUniverService, IKeyValue, Tools } from '@univerjs/core';
import { RightMenuItem } from '@univerjs/ui-plugin-sheets';
import { Inject } from '@wendellhu/redi';
// import { ClipboardInput } from '../UI/ClipboardInput';

export abstract class Copy {
    // constructor(copyList: RightMenuProps[]) {
    //     this._context = context;
    //     const SheetPlugin = this._context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

    //     // this._initRegisterComponent(componentList);
    //     // SheetPlugin?.addRightMenu(copyList);
    // }

    copy(e: Event) {
        e.preventDefault();
    }
}

export class UniverCopy extends Copy {
    constructor(
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {
        const copyList = [
            {
                label: 'rightClick.copy',
                onClick: () => this.copyTo(),
            },
            {
                customLabel: {
                    name: RightMenuItem.name,
                    props: {
                        label: 'rightClick.copyAs',
                    },
                },
                children: [
                    {
                        label: ['Json', 'rightClick.firstLineTitle'],
                        onClick: () => this.copyJsonHead(),
                    },
                    {
                        label: ['Json', 'rightClick.untitled'],
                        onClick: () => this.copyJsonNoHead(),
                    },
                    {
                        label: ['rightClick.array1'],
                        onClick: () => this.copyArray1(),
                    },
                    {
                        label: ['rightClick.array2'],
                        onClick: () => this.copyArray2(),
                    },
                ],
            },
        ];
        // super(context, copyList);
        super();
        // super(context, copyList, [ClipboardInput]);
    }

    override async copy(e: ClipboardEvent) {
        const table = this.getCopyContent();
        if (table) {
            Clipboard.write(
                {
                    data: table,
                },
                e
            );
        }
    }

    async copyTo(...arg: any) {
        const table = this.getCopyContent();
        if (table) {
            const isWrite = await Clipboard.write({
                data: table,
            });
        }
    }

    //复制为json格式字符串，首行为标题
    async copyJsonHead(...arg: any) {
        const Range = this._getRangeInfo();
        if (!Range) return;
        const { range, rangeData } = Range;

        const arr = [];
        if (rangeData.length === 1) {
            const obj: IKeyValue = {};
            for (let i = 0; i < rangeData[0].length; i++) {
                const value = range.getValues()[0][i]?.v;
                if (typeof value === 'string' || typeof value === 'number') {
                    obj[value] = '';
                } else {
                    obj[''] = '';
                }
            }
            arr.push(obj);
        } else {
            for (let r = 1; r < rangeData.length; r++) {
                const obj: IKeyValue = {};
                for (let c = 0; c < rangeData[0].length; c++) {
                    const title = range.getValues()[0][c]?.v;
                    const value = range.getValues()[r][c]?.v;
                    if (typeof title === 'string' || typeof title === 'number') {
                        obj[title] = value;
                    } else {
                        obj[''] = value;
                    }
                }
                arr.push(obj);
            }
        }

        const isWrite = await Clipboard.writeText(JSON.stringify(arr));
    }

    //复制为json格式字符串，无标题，采用ABCD作为标题
    async copyJsonNoHead(...arg: any) {
        const Range = this._getRangeInfo();
        if (!Range) return;
        const { range, rangeData } = Range;

        const arr = [];
        for (let r = 0; r < rangeData.length; r++) {
            const obj: IKeyValue = {};
            for (let c = 0; c < rangeData[0].length; c++) {
                const value = range.getValues()[r][c]?.v;
                obj[Tools.chatAtABC(c + range.getRangeData().startColumn)] = value;
            }
            arr.push(obj);
        }

        const isWrite = await Clipboard.writeText(JSON.stringify(arr));
    }

    //复制为一维数组
    async copyArray1(...arg: any) {
        const Range = this._getRangeInfo();
        if (!Range) return;
        const { range, rangeData } = Range;

        const arr = [];
        for (let r = 0; r < rangeData.length; r++) {
            for (let c = 0; c < rangeData[0].length; c++) {
                const value = range.getValues()[r][c]?.v;
                arr.push(value);
            }
        }

        const isWrite = await Clipboard.writeText(JSON.stringify(arr));
    }

    //复制为二维数组
    async copyArray2(...arg: any) {
        const Range = this._getRangeInfo();
        if (!Range) return;
        const { range, rangeData } = Range;

        const arr = [];
        for (let r = 0; r < rangeData.length; r++) {
            for (let c = 0; c < rangeData[0].length; c++) {
                const value = range.getValues()[r][c]?.v;
                arr.push(value);
            }
        }

        const isWrite = await Clipboard.writeText(JSON.stringify(arr));
    }

    //复制为多维数组
    async copyArrayMore(e: KeyboardEvent) {
        if (e.key !== 'Enter') return;
        const Range = this._getRangeInfo();
        if (!Range) return;
        const { range, rangeData } = Range;

        const arr = [];
        for (let r = 0; r < rangeData.length; r++) {
            for (let c = 0; c < rangeData[0].length; c++) {
                arr.push(rangeData[r][c]);
            }
        }

        let row = '0';
        let column = '0';
        const target = e.target as HTMLInputElement;
        const textContent = target?.previousSibling?.textContent;
        if (!textContent) return;
        if (textContent.length > 1) {
            row = target.value;
            const columnItem = target.parentNode?.querySelectorAll('input')[1];
            column = columnItem!.value;
        } else {
            column = target.value;
            const columnItem = target.parentNode?.querySelectorAll('input')[0];
            row = columnItem!.value;
        }

        if (row === '' && column === '') {
            const isWrite = await Clipboard.writeText(JSON.stringify(arr));
            return;
        }

        if (row === '') {
            row = '1';
        } else {
            row = `${parseInt(row)}`;
        }

        if (column === '') {
            column = '1';
        } else {
            column = `${parseInt(column)}`;
        }

        if (+row < 1 || +column < 1) {
            return;
        }

        const arrLen = arr.length;
        let i = 0;
        const ret = [];
        for (let r = 0; r < +row; r++) {
            const a = [];
            for (let c = 0; c < +column; c++) {
                a.push(arr[i++]);
                if (i >= arrLen) {
                    const isWrite = await Clipboard.writeText(JSON.stringify(ret));
                    return;
                }
            }
            ret.push(a);
        }

        const isWrite = await Clipboard.writeText(JSON.stringify(ret));
    }

    /**
     * TODO 加入univerId,sheetId,rangeData等 @tony
     * @returns
     */
    // eslint-disable-next-line max-lines-per-function
    getCopyContent() {
        const { sheet, selections } = this._getSheetInfo();
        if (!selections?.length) return;
        const mergeData = sheet.getMergeData();
        const rowManager = sheet.getRowManager().getRowData();
        const colManager = sheet.getColumnManager().getColumnData();
        const rowIndexArr: number[] = [];
        const colIndexArr: number[] = [];

        for (let s = 0; s < selections.length; s++) {
            const range = selections[s];

            const r1 = range.startRow;
            const r2 = range.endRow;
            const c1 = range.startColumn;
            const c2 = range.endColumn;

            for (let copyR = r1; copyR <= r2; copyR++) {
                const rowItem = rowManager.get(copyR);

                if (rowItem && rowItem.hd) {
                    continue;
                }

                if (!rowIndexArr.includes(copyR)) {
                    rowIndexArr.push(copyR);
                }

                for (let copyC = c1; copyC <= c2; copyC++) {
                    const colItem = colManager.get(copyC);
                    if (colItem && colItem.hd) {
                        continue;
                    }

                    if (!colIndexArr.includes(copyC)) {
                        colIndexArr.push(copyC);
                    }
                }
            }
        }

        let cpData = '';
        let colGroup = '<colgroup>';

        for (let i = 0; i < rowIndexArr.length; i++) {
            const r = rowIndexArr[i];
            cpData += '<tr>';

            for (let j = 0; j < colIndexArr.length; j++) {
                const c = colIndexArr[j];

                const cellValue = sheet.getRange(r, c).getValue();
                let column = '';
                let style = '';
                let span = '';

                if (r === rowIndexArr[0]) {
                    const colItem = colManager.get(c);
                    if (colItem && colItem.w) {
                        colGroup += `<col width="${colItem.w}px"></col>`;
                    } else {
                        colGroup += '<col width="72px"></col>';
                    }
                }

                const rowItem = rowManager.get(r);
                if (rowItem && rowItem.h) {
                    style += `height:${rowItem.h}px;`;
                } else {
                    style += 'height:19px;';
                }

                // const colItem = colManager.get(c);
                // if (colItem && colItem.w) {
                //     style += `width:${colItem.w}px;`;
                // } else {
                //     style += `width:72px;`;
                // }

                if (cellValue && cellValue.s) {
                    const cellStyle = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getStyles().getStyleByCell(cellValue);
                    // const cellStyle = this.getContext().getWorkBook().getStyles().get(cellValue.s);
                    if (cellStyle) {
                        style += handleStyleToString(cellStyle);
                    }
                }

                const cellRange = this._selectionManagerService.transformCellDataToSelectionData(r, c, mergeData)?.cellRange;
                if (cellRange?.isMerged || (!cellRange?.isMerged && cellRange?.isMergedMainCell)) {
                    if (cellRange.isMergedMainCell) {
                        span = `rowSpan="${cellRange.endRow - cellRange.startRow + 1}" colSpan="${cellRange.endColumn - cellRange.startColumn + 1}"`;
                    } else {
                        continue;
                    }
                }

                if (style.includes('data-rotate')) {
                    const rotate = style.split(';').find((item) => item.includes('data-rotate'));
                    const match = rotate?.match(/\d+/g);
                    let angle = 0;
                    let ver = 0;
                    if (match?.length) {
                        angle = +match[0];
                        ver = +match[1] ?? 0;
                    }
                    column += `<td ${span} ${ver ? `data-vertical=${ver}` : ''} style="display:inline-block;transform: rotate(${angle}deg);${style}">`;
                } else {
                    column = `<td ${span} style="${style}">`;
                }

                let c_value;

                if (cellValue) {
                    if (cellValue.p) {
                        c_value = handleJsonToDom(cellValue.p);
                    } else {
                        c_value = sheet.getRange(r, c).getDisplayValue();
                        if (c_value == null) {
                            c_value = '';
                        }
                    }
                } else {
                    c_value = '';
                }

                column += c_value;

                column += '</td>';
                cpData += column;
            }

            cpData += '</tr>';
        }
        colGroup += '</colgroup>';
        const cpTable = `<table data-type="universheet_copy_action_table">${colGroup}${cpData}</table>`;
        return cpTable;
    }

    private _getSheetInfo() {
        const sheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
        const selections = this._selectionManagerService.getRangeDataList();
        return { sheet, selections };
    }

    private _getRangeInfo() {
        const { sheet, selections } = this._getSheetInfo();
        if (!selections?.length) return;
        const range = sheet.getRange(selections[0]);
        const rangeData = range.getValues();
        if (!rangeData.length) return;
        return { range, rangeData };
    }
}
