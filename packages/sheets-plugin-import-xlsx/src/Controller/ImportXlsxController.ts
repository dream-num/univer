import { Inject } from '@wendellhu/redi';
import { ICurrentUniverService, IDCurrentUniverService, IKeyValue, migrate, Tools } from '@univerjs/core';
import { BaseComponentRender } from '@univerjs/base-ui';
import { IToolbarItemProps, SheetContainerUIController } from '@univerjs/ui-plugin-sheets';

import * as LuckyExcel from 'luckyexcel';
import { IMPORT_XLSX_PLUGIN_NAME } from '../Basics/Const';

export class ImportXlsxController {
    protected _toolButton: IToolbarItemProps;

    protected _render: BaseComponentRender;

    constructor(
        @Inject(SheetContainerUIController) private readonly _sheetContainerUIController: SheetContainerUIController,
        @IDCurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {
        this._toolButton = {
            name: IMPORT_XLSX_PLUGIN_NAME,
            toolbarType: 1,
            tooltip: 'importXlsx.tooltip',
            show: true,
            label: 'importXlsx.import',
            onClick: () => {
                this.upload();
            },
        };
        this._sheetContainerUIController.getToolbarController().addToolbarConfig(this._toolButton);
    }

    upload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        input.addEventListener('change', (evt) => {
            const element = evt.currentTarget as HTMLInputElement;
            this.handleFiles(element.files);
        });

        input.click();
    }

    handleFiles(files: File[] | FileList | null) {
        if (files == null || files.length === 0) {
            console.error('No files wait for import');
            return;
        }

        const name = files[0].name;
        const suffixArr = name.split('.');
        const suffix = suffixArr[suffixArr.length - 1];
        if (suffix !== 'xlsx') {
            console.error('Currently only supports the import of xlsx files');
            return;
        }
        const transformExcelToLucky = LuckyExcel.default.transformExcelToLucky;

        transformExcelToLucky(files[0], (exportJson: IKeyValue) => {
            if (exportJson.sheets == null || exportJson.sheets.length === 0) {
                console.error('Failed to read the content of the excel file, currently does not support xls files!');
                return;
            }

            const luckysheetConfig = {
                container: 'universheet',
                data: exportJson.sheets,
                title: exportJson.info.name,
            };
            const univerWorkbookConfig = migrate(luckysheetConfig);

            const sheets = univerWorkbookConfig.sheets;

            if (!sheets) {
                return console.error('No content');
            }

            const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();

            const order = Tools.deepClone(workbook.getConfig().sheetOrder);

            // add new sheets
            Object.keys(sheets).forEach((sheetId) => {
                const sheetData = sheets[sheetId];
                workbook.insertSheet(sheetData);
            });

            // remove other sheets
            order.forEach((sheetId: string) => {
                workbook.removeSheetBySheetId(sheetId);
            });
        });
    }
}
