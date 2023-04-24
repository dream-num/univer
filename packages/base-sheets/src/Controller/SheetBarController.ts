import { UIObserver } from '@univerjs/core';
import { SheetPlugin } from '../SheetPlugin';

export class SheetBarControl {
    protected _plugin: SheetPlugin;

    constructor(plugin: SheetPlugin) {
        this._plugin = plugin;
    }

    listenEventManager(): void {
        this._getCoreObserver('onUIChangeObservable').add(({ name, value }) => {
            switch (name) {
                case 'deleteSheet': {
                    const workbook = this._plugin.getContext().getWorkBook();
                    if (workbook) {
                        workbook.removeSheetBySheetId(value as string);
                    }
                    break;
                }
                case 'copySheet': {
                    const workbook = this._plugin.getContext().getWorkBook();
                    const activeSheet = workbook.getActiveSheet();
                    const sheetContext = this._plugin.getContext();
                    const genName = sheetContext.getGenName();
                    const locale = this._plugin.getGlobalContext().getLocale();
                    const copySheet = activeSheet.copy(genName.onlyName(`${activeSheet.getName()} ${locale.get('BaseSheetLocale.CopyName')}`));
                    if (workbook) {
                        workbook.insertSheet(workbook.getActiveSheetIndex() + 1, copySheet.getConfig());
                    }
                    break;
                }
                case 'renameSheet': {
                    const { sheetId, sheetName } = value as { sheetId: string; sheetName: string };
                    const workbook = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook();
                    const worksheet = workbook.getSheetBySheetId(sheetId);
                    if (worksheet && sheetName !== worksheet.getName()) {
                        worksheet.setName(sheetName);
                    }
                    break;
                }
                case 'addSheet': {
                    const workbook = this._plugin.getContext().getWorkBook();
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
                    const workbook = this._plugin.getContext().getWorkBook();
                    const worksheet = workbook.getSheetBySheetId(value as string);
                    if (worksheet) {
                        worksheet.showSheet();
                    }
                    break;
                }
                case 'hideSheet': {
                    const workbook = this._plugin.getContext().getWorkBook();
                    const worksheet = workbook.getSheetBySheetId(value as string);
                    if (worksheet) {
                        worksheet.hideSheet();
                    }
                    break;
                }
                case 'changeSheetColor': {
                    const { color, sheetId } = value as { color: string; sheetId: string };
                    const workbook = this._plugin.getContext().getWorkBook();
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
        return this._plugin.getGlobalContext().getObserverManager().requiredObserver<UIObserver<T>>(type, 'core');
    }
}
