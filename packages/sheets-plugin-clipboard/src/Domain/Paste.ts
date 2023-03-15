import { SelectionControl } from '@univerjs/base-sheets/src/Controller/Selection/SelectionController';
import { SheetContext, PLUGIN_NAMES } from '@univerjs/core';
import { SelectionModel, SheetPlugin } from '@univerjs/base-sheets';
import { handleTableMergeData } from '@univerjs/base-ui';
import { RightMenuProps } from '@univerjs/ui-plugin-sheets';

export interface PasteType {
    type: string;
    result: string | ArrayBuffer | null;
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

    pasteTo(data: any) {
        // const data = await this.pasteResolver(e);
        // if (data.length === 0) return;

        if (!data || data?.length === 0) return;
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
            return;
        }
        // 最终渲染数据
        const tableData = handleTableMergeData(data, selection);
        const mergeData = tableData.mergeData;
        for (let i = 0; i < mergeData.length; i++) {
            sheet.getMerges().add(mergeData[i]);
        }
        sheet.getRange(minH, minC, maxH, maxC).setRangeDatas(tableData.data);
    }

    paste(e: ClipboardEvent) {
        this.pasteTo(e);
    }
}
