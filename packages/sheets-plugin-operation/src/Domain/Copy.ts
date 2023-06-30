import { SheetContext, PLUGIN_NAMES, Tools, handleJsonToDom, handleStyleToString } from '@univerjs/core';
import { SheetPlugin, SelectionModel, SelectionControl } from '@univerjs/base-sheets';
import { RightMenuProps, RightMenuItem } from '@univerjs/ui-plugin-sheets';
import { Clipboard } from '@univerjs/base-ui';
// import { ClipboardInput } from '../UI/ClipboardInput';

export abstract class Copy {
    private _context: SheetContext;

    constructor(context: SheetContext, copyList: RightMenuProps[], componentList: any[]) {
        this._context = context;
        const SheetPlugin = this._context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        // this._initRegisterComponent(componentList);
        // SheetPlugin?.addRightMenu(copyList);
    }

    getContext() {
        return this._context;
    }

    copy(e: Event) {
        e.preventDefault();
    }
}

export class UniverCopy extends Copy {
    constructor(context: SheetContext) {
        const copyList = [
            {
                locale: 'rightClick.copy',
                onClick: () => this.copyTo(),
            },
            {
                customLabel: {
                    name: RightMenuItem.name,
                    props: {
                        locale: 'rightClick.copyAs',
                    },
                },
                children: [
                    {
                        locale: ['Json', 'rightClick.firstLineTitle'],
                        onClick: () => this.copyJsonHead(),
                    },
                    {
                        locale: ['Json', 'rightClick.untitled'],
                        onClick: () => this.copyJsonNoHead(),
                    },
                    {
                        locale: ['rightClick.array1'],
                        onClick: () => this.copyArray1(),
                    },
                    {
                        locale: ['rightClick.array2'],
                        onClick: () => this.copyArray2(),
                    },
                    {
                        // customLabel: {
                        //     name: OPERATION_PLUGIN + ClipboardInput.name,
                        //     props: {
                        //         prefixLocale: 'rightClick.array3',
                        //         placeholder1Locale: 'rightClick.row',
                        //         suffixLocale: 'rightClick.column',
                        //         placeholder2Locale: 'rightClick.column',
                        //     },
                        // },
                        // locale: [
                        //     'rightClick.array3',
                        //     {
                        //         type: 'input',
                        //         min: 1,
                        //         format: 'number',
                        //         placeholder: 'rightClick.row',
                        //         locale: 'rightClick.row',
                        //         onKeyUp: (e: KeyboardEvent) => this.copyArrayMore(e),
                        //     },
                        //     '×',
                        //     {
                        //         type: 'input',
                        //         format: 'number',
                        //         min: 1,
                        //         placeholder: 'rightClick.column',
                        //         locale: 'rightClick.column',
                        //         onKeyUp: (e: KeyboardEvent) => this.copyArrayMore(e),
                        //     },
                        // ],
                        // onKeyUp: (...arg: any) => {
                        //     if (arg[0].key !== 'Enter') return;
                        //     arg[1].ref.hideSelect();
                        //     arg[1].ref.getParent().hideSelect();
                        // },
                    },
                    // {
                    //     locale: ['rightClick.diagonal'],
                    // },
                    // {
                    //     locale: ['rightClick.antiDiagonal'],
                    // },
                    // {
                    //     locale: ['rightClick.diagonalOffset', { type: 'input', format: 'number' }, 'rightClick.column'],
                    // },
                    // {
                    //     locale: ['rightClick.boolean'],
                    // },
                ],
            },
        ];
        super(context, copyList);
        // super(context, copyList, [ClipboardInput]);
    }

    async copy(e: ClipboardEvent) {
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

        let arr = [];
        if (rangeData.length === 1) {
            let obj = {};
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
                let obj = {};
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

        let arr = [];
        for (let r = 0; r < rangeData.length; r++) {
            let obj = {};
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

        let arr = [];
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

        let arr = [];
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

        let arr = [];
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

        let arrLen = arr.length;
        let i = 0;
        let ret = [];
        for (let r = 0; r < +row; r++) {
            let a = [];
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
    getCopyContent() {
        const { sheet, spreadsheet, selections } = this._getSheetInfo();
        if (selections.length > 1) return;

        const rowManager = sheet.getRowManager().getRowData();
        const colManager = sheet.getColumnManager().getColumnData();
        let rowIndexArr: number[] = [];
        let colIndexArr: number[] = [];

        for (let s = 0; s < selections.length; s++) {
            let range = selections[s];

            let r1 = range.startRow;
            let r2 = range.endRow;
            let c1 = range.startColumn;
            let c2 = range.endColumn;

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
            let r = rowIndexArr[i];
            cpData += '<tr>';

            for (let j = 0; j < colIndexArr.length; j++) {
                let c = colIndexArr[j];

                let cellValue = sheet.getRange(r, c).getValue();
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
                    const cellStyle = this.getContext().getWorkBook().getStyles().getStyleByCell(cellValue);
                    // const cellStyle = this.getContext().getWorkBook().getStyles().get(cellValue.s);
                    if (cellStyle) {
                        style += handleStyleToString(cellStyle);
                    }
                }

                const cellInfo = spreadsheet?.getCellByIndex(r, c);
                if (cellInfo?.isMerged || (!cellInfo?.isMerged && cellInfo?.isMergedMainCell)) {
                    if (cellInfo.isMergedMainCell) {
                        span = `rowSpan="${cellInfo.mergeInfo.endRow - cellInfo.mergeInfo.startRow + 1}" colSpan="${
                            cellInfo.mergeInfo.endColumn - cellInfo.mergeInfo.startColumn + 1
                        }"`;
                    } else {
                        continue;
                    }
                }

                if (style.includes('data-rotate')) {
                    let rotate = style.split(';').find((item) => item.includes('data-rotate'));
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
        let cpTable = `<table data-type="universheet_copy_action_table">${colGroup}${cpData}</table>`;
        return cpTable;
    }

    private _getSheetInfo() {
        const sheet = this.getContext().getWorkBook().getActiveSheet();
        const SheetPlugin = this.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);
        const spreadsheet = SheetPlugin?.getMainComponent();
        const controls = SheetPlugin?.getSelectionManager().getCurrentControls();
        const selections: any = controls?.map((control: SelectionControl) => {
            const model: SelectionModel = control.model;
            return {
                startRow: model.startRow,
                startColumn: model.startColumn,
                endRow: model.endRow,
                endColumn: model.endColumn,
            };
        });
        return { sheet, spreadsheet, selections };
    }

    private _getRangeInfo() {
        const { sheet, selections } = this._getSheetInfo();
        if (!selections.length) return;
        const range = sheet.getRange(selections[0]);
        const rangeData = range.getValues();
        if (!rangeData.length) return;
        return { range, rangeData };
    }
}
