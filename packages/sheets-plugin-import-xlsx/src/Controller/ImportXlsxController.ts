import { IKeyValue, migrate, PLUGIN_NAMES, Tools } from '@univer/core';
import { BaseComponentRender } from '@univer/base-component';
import { IToolBarItemProps, SelectTypes, SheetPlugin } from '@univer/base-sheets';

import * as LuckyExcel from 'luckyexcel';
import { IMPORT_XLSX_PLUGIN_NAME } from '../Basic/Const';
import { ImportXlsxPlugin } from '../ImportXlsxPlugin';

export class ImportXlsxController {
    protected _sheetPlugin: SheetPlugin;

    protected _toolButton: IToolBarItemProps;

    protected _plugin: ImportXlsxPlugin;

    protected _render: BaseComponentRender;

    constructor(plugin: ImportXlsxPlugin) {
        this._plugin = plugin;
        this._sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this._toolButton = {
            name: IMPORT_XLSX_PLUGIN_NAME,
            type: SelectTypes.FIX,
            locale: 'importXlsx.tooltip',
            tooltipLocale: 'importXlsx.tooltip',
            show: true,
            hideSelectedIcon: true,
            children: [
                {
                    locale: 'importXlsx.upload',
                    onClick: () => {
                        this.upload();
                    },
                },
            ],
        };
        this._sheetPlugin.addToolButton(this._toolButton);
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
        if (files == null || files.length == 0) {
            alert('No files wait for import');
            return;
        }

        let name = files[0].name;
        let suffixArr = name.split('.');
        let suffix = suffixArr[suffixArr.length - 1];
        if (suffix != 'xlsx') {
            alert('Currently only supports the import of xlsx files');
            return;
        }
        const transformExcelToLucky = LuckyExcel.default.transformExcelToLucky;

        transformExcelToLucky(files[0], (exportJson: IKeyValue) => {
            if (exportJson.sheets == null || exportJson.sheets.length == 0) {
                alert('Failed to read the content of the excel file, currently does not support xls files!');
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
                return alert('No content');
            }

            const workbook = this._plugin.getContext().getWorkBook();

            const order = Tools.deepClone(workbook.getConfig().sheetOrder);

            // add new sheets
            Object.keys(sheets).forEach((sheetId) => {
                const sheetData = sheets[sheetId];
                workbook.insertSheet(sheetData);
            });

            // remove other sheets
            // order.forEach((sheetId: string) => {
            //     workbook.removeSheetBySheetId(sheetId);
            // });
        });
    }
}
