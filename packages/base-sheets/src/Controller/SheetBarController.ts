import { Context, SheetContext, UIObserver } from '@univerjs/core';

import { IGlobalContext, ISheetContext } from '../Services/tokens';

export class SheetBarController {
    constructor(@IGlobalContext private readonly _globalContext: Context, @ISheetContext private readonly _context: SheetContext) {}

    listenEventManager(): void {
        this._getCoreObserver('onUIChangeObservable').add(({ name, value }) => {
            const context = this._context;
            switch (name) {
                case 'deleteSheet': {
                    const workbook = context.getWorkBook();
                    if (workbook) {
                        workbook.removeSheetBySheetId(value as string);
                    }
                    break;
                }
                case 'copySheet': {
                    const workbook = context.getWorkBook();
                    const activeSheet = workbook.getActiveSheet();
                    const sheetContext = context;
                    const genName = sheetContext.getGenName();
                    const locale = this._globalContext.getLocale();
                    const copySheet = activeSheet.copy(genName.onlyName(`${activeSheet.getName()} ${locale.get('BaseSheetLocale.CopyName')}`));
                    if (workbook) {
                        workbook.insertSheet(workbook.getActiveSheetIndex() + 1, copySheet.getConfig());
                    }
                    break;
                }
                case 'renameSheet': {
                    const { sheetId, sheetName } = value as { sheetId: string; sheetName: string };
                    const workbook = context.getUniver().getCurrentUniverSheetInstance().getWorkBook();
                    const worksheet = workbook.getSheetBySheetId(sheetId);
                    if (worksheet && sheetName !== worksheet.getName()) {
                        worksheet.setName(sheetName);
                    }
                    break;
                }
                case 'addSheet': {
                    const workbook = context.getWorkBook();
                    workbook.insertSheet();

                    const size = workbook.getSheetSize();
                    const sheets = workbook.getSheets();
                    const lastSheet = sheets[size - 1];
                    if (lastSheet) {
                        lastSheet.activate();
                    }
                    break;
                }
                case 'unHideSheet': {
                    const workbook = context.getWorkBook();
                    const worksheet = workbook.getSheetBySheetId(value as string);
                    if (worksheet) {
                        worksheet.showSheet();
                    }
                    break;
                }
                case 'hideSheet': {
                    const workbook = context.getWorkBook();
                    const worksheet = workbook.getSheetBySheetId(value as string);
                    if (worksheet) {
                        worksheet.hideSheet();
                    }
                    break;
                }
                case 'changeSheetColor': {
                    const { color, sheetId } = value as { color: string; sheetId: string };
                    const workbook = context.getWorkBook();
                    const worksheet = workbook.getSheetBySheetId(sheetId);
                    if (worksheet) {
                        worksheet.setTabColor(color);
                    }
                    break;
                }
            }
        });
    }

    protected _getCoreObserver<T>(type: string) {
        return this._globalContext.getObserverManager().requiredObserver<UIObserver<T>>(type, 'core');
    }
}
