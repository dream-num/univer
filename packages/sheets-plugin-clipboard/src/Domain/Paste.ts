import { SelectionControl } from '@univerjs/base-sheets/src/Controller/Selection/SelectionController';
import { SheetContext, PLUGIN_NAMES, Nullable } from '@univerjs/core';
import { SelectionModel, SheetPlugin } from '@univerjs/base-sheets';
import { handleTableMergeData, Prompt } from '@univerjs/base-ui';
import { RightMenuProps, SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '@univerjs/ui-plugin-sheets';

export interface PasteType {
    type: string;
    result: string | ArrayBuffer | null;
}

export interface PasteInfo {
    data: Nullable<Array<[]>>;
    colInfo: Nullable<number[]>;
    rowInfo: Nullable<number[]>;
}

export abstract class Paste {
    private _context: SheetContext;

    constructor(context: SheetContext, pasteList: RightMenuProps[]) {
        this._context = context;
    }

    getContext() {
        return this._context;
    }

    paste(e: Event) {}
}

export class UniverPaste extends Paste {
    constructor(context: SheetContext) {
        const pasteList = [
            {
                label: 'rightClick.paste',
                onClick: () => {
                    // this.pasteTo();
                },
            },
        ];
        super(context, pasteList);
    }

    pasteTo(info: PasteInfo) {
        const { data, colInfo, rowInfo } = info;
        // const data = await this.pasteResolver(e);
        // if (data.length === 0) return;

        if (!data || !data.length) return;
        const sheet = this.getContext().getWorkBook().getActiveSheet();
        if (!sheet) return;
        const SheetPlugin = this.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);
        if (!SheetPlugin) return;
        const spreadsheet = SheetPlugin?.getMainComponent();
        if (!spreadsheet) return;
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

        if (!selections.length) {
            return;
        }

        if (selections.length > 1) {
            return;
        }

        const selection = selections[0];

        let copyH = data.length;
        let copyC = data[0].length;

        let minH = selection.startRow; //应用范围首尾行
        let maxH = minH + copyH - 1;
        let minC = selection.startColumn; //应用范围首尾列
        let maxC = minC + copyC - 1;
        const isMerge = sheet.getMerges().getByRowColumn(minH, maxH, minC, maxC);
        if (isMerge) {
            const prompt = this.getContext()
                .getUniver()
                .getGlobalContext()
                .getPluginManager()
                .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
                .getSlot(SHEET_UI_PLUGIN_NAME + Prompt.name);
            prompt.props.title = 'info.tooltip';
            prompt.props.content = 'info.notChangeMerge';
            prompt.showModal(true);

            return;
        }
        // 最终渲染数据
        const tableData = handleTableMergeData(data, selection);
        const mergeData = tableData.mergeData;
        for (let i = 0; i < mergeData.length; i++) {
            sheet.getMerges().add(mergeData[i]);
        }
        sheet.getRange(minH, minC, maxH, maxC).setRangeDatas(tableData.data);

        if (colInfo && colInfo.length) {
            for (let i = 0; i < colInfo.length; i++) {
                sheet.setColumnWidth(minC + i, colInfo[i]);
            }
        }

        if (rowInfo && rowInfo.length) {
            for (let i = 0; i < rowInfo.length; i++) {
                sheet.setRowHeight(minH + i, rowInfo[i]);
            }
        }
    }

    paste(e: ClipboardEvent) {
        this.pasteTo(e);
    }
}
