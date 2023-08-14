import { UIObserver, ObserverManager, LocaleService, ICurrentUniverService, IDCurrentUniverService, GenName } from '@univerjs/core';
import { Inject, SkipSelf } from '@wendellhu/redi';

export class SheetBarController {
    constructor(
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @IDCurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(GenName) private _genName: GenName
    ) {}

    listenEventManager(): void {
        // FIXME@wzhudev: detailed logic should not be implemented in this class
        this._getCoreObserver('onUIChangeObservable').add(({ name, value }) => {
            const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
            switch (name) {
                case 'deleteSheet': {
                    if (workbook) {
                        workbook.removeSheetBySheetId(value as string);
                    }
                    break;
                }
                case 'copySheet': {
                    const activeSheet = workbook.getActiveSheet();
                    const locale = this._localeService.getLocale();
                    const copySheet = activeSheet.copy(this._genName.onlyName(`${activeSheet.getName()} ${locale.get('BaseSheetLocale.CopyName')}`));
                    if (workbook) {
                        workbook.insertSheet(workbook.getActiveSheetIndex() + 1, copySheet.getConfig());
                    }
                    break;
                }
                case 'renameSheet': {
                    const { sheetId, sheetName } = value as { sheetId: string; sheetName: string };
                    const worksheet = workbook.getSheetBySheetId(sheetId);
                    if (worksheet && sheetName !== worksheet.getName()) {
                        worksheet.setName(sheetName);
                    }
                    break;
                }
                case 'addSheet': {
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
                    const worksheet = workbook.getSheetBySheetId(value as string);
                    if (worksheet) {
                        worksheet.showSheet();
                    }
                    break;
                }
                case 'hideSheet': {
                    const worksheet = workbook.getSheetBySheetId(value as string);
                    if (worksheet) {
                        worksheet.hideSheet();
                    }
                    break;
                }
                case 'changeSheetColor': {
                    const { color, sheetId } = value as { color: string; sheetId: string };
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
        return this._globalObserverManager.requiredObserver<UIObserver<T>>(type, 'core');
    }
}
