import { Plugin, UIObserver } from '@univerjs/core';

export class SheetBarControl {
    protected _plugin: Plugin;

    protected _getCoreObserver<T>(type: string) {
        return this._plugin.getContext().getUniver().getGlobalContext().getObserverManager().requiredObserver<UIObserver<T>>(type, 'core');
    }

    constructor(plugin: Plugin) {
        this._plugin = plugin;
    }

    listenEventManager(): void {
        this._getCoreObserver<string>('onDeleteSheet').add(({ name, value }) => {
            const workbook = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook();
            if (workbook) {
                workbook.removeSheetBySheetId(value!);
            }
        });
        this._getCoreObserver('onAddSheet').add(() => {
            const context = this._plugin.getContext();
            const workbook = context.getUniver().getCurrentUniverSheetInstance().getWorkBook();
            workbook.insertSheet();

            const size = workbook.getSheetSize();
            const sheets = workbook.getSheets();
            const lastSheet = sheets[size - 1];
            if (lastSheet) {
                lastSheet.activate();
            }
        });
        this._getCoreObserver('onToLeftSheet').add(() => {
            //TDOO ..
        });
        this._getCoreObserver('onToRightSheet').add(() => {
            //TDOO ..
        });
        this._getCoreObserver<string>('onHideSheet').add(({ value }) => {
            const workbook = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook();
            const worksheet = workbook.getSheetBySheetId(value!);
            if (worksheet) {
                worksheet.hideSheet();
            }
        });
        this._getCoreObserver<string>('onUnHideSheet').add(({ value }) => {
            const workbook = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook();
            const worksheet = workbook.getSheetBySheetId(value!);
            if (worksheet) {
                worksheet.showSheet();
            }
        });
        this._getCoreObserver('onCopySheet').add(() => {
            //TDOO ..
        });
        this._getCoreObserver<string>('onRemoveSheet').add(({ value }) => {
            const workbook = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook();
            if (workbook) {
                workbook.removeSheetBySheetId(value!);
            }
        });
        this._getCoreObserver('onSheetColor').add(() => {
            //TDOO ..
        });
    }
}
