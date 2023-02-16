import { NameGen, Plugin, UIObserver } from '@univerjs/core';

export class SheetBarControl {
    protected _plugin: Plugin;

    protected _getCoreObserver<T>(type: string) {
        return this._plugin.getContext().getUniver().getGlobalContext().getObserverManager().requiredObserver<UIObserver<T>>(type, 'core');
    }

    constructor(plugin: Plugin) {
        this._plugin = plugin;
    }

    listenEventManager(): void {
        this._getCoreObserver('onUIChangeObservable').add(({ name, value }) => {
            switch (name) {
                case 'deleteSheet': {
                    const workbook = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook();
                    if (workbook) {
                        workbook.removeSheetBySheetId(value as string);
                    }
                    break;
                }
                case 'copySheet': {
                    const workbook = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook();
                    const activeSheet = workbook.getActiveSheet();
                    const copySheet = activeSheet.copy(NameGen.getSheetName());
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
                    const context = this._plugin.getContext();
                    const workbook = context.getUniver().getCurrentUniverSheetInstance().getWorkBook();
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
                    const workbook = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook();
                    const worksheet = workbook.getSheetBySheetId(value as string);
                    if (worksheet) {
                        worksheet.showSheet();
                    }
                    break;
                }
                case 'hideSheet': {
                    const workbook = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook();
                    const worksheet = workbook.getSheetBySheetId(value as string);
                    if (worksheet) {
                        worksheet.hideSheet();
                    }
                    break;
                }
                case 'changeSheetColor': {
                    const { color, sheetId } = value as { color: string; sheetId: string };
                    const workbook = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook();
                    const worksheet = workbook.getSheetBySheetId(sheetId);
                    if (worksheet) {
                        worksheet.setTabColor(color);
                    }
                    break;
                }
            }
        });
    }
}
