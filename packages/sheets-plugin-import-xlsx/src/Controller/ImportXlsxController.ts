import { Inject, Injector } from '@wendellhu/redi';
import { Disposable, ICurrentUniverService, IKeyValue, migrate, Tools } from '@univerjs/core';
import { BaseComponentRender, IMenuService } from '@univerjs/base-ui';
import { IToolbarItemProps, SheetContainerUIController } from '@univerjs/ui-plugin-sheets';

import * as LuckyExcel from 'luckyexcel';
import { BasicWorkbookController } from '@univerjs/base-sheets';
import { IMPORT_XLSX_PLUGIN_NAME } from '../Basics/Const';
import { ImportMenuItemFactory } from './menu';

export class ImportXlsxController extends Disposable{
    protected _toolButton: IToolbarItemProps;

    protected _render: BaseComponentRender;

    constructor(
        @Inject(SheetContainerUIController) private readonly _sheetContainerUIController: SheetContainerUIController,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(BasicWorkbookController) private readonly _basicWorkbookController: BasicWorkbookController,
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService
    ) {
        super();
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
        // this._sheetContainerUIController.getToolbarController().addToolbarConfig(this._toolButton);
        const toolbar = this._sheetContainerUIController.getToolbarController();
        this._initializeContextMenu();
        toolbar.setToolbar();
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
            const workbookId = workbook.getUnitId();
            const order = Tools.deepClone(workbook.getConfig().sheetOrder);

            // add new sheets
            Object.keys(sheets).forEach((sheetId, i) => {
                const sheetData = sheets[sheetId];
                // workbook.insertSheet(sheetData);
                const index = order.length - 1 + i;
                this._basicWorkbookController.insertSheet(index, sheetData, workbookId);
            });

            // remove other sheets
            order.forEach((sheetId: string) => {
                // workbook.removeSheetBySheetId(sheetId);
                // workbook.removeSheetBySheetId(sheetId);
                this._basicWorkbookController.removeSheet(sheetId, workbookId);
            });
        });
    }

    private _initializeContextMenu() {
        [
            ImportMenuItemFactory
        ].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
