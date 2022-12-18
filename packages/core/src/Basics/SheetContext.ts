import { Workbook } from '../Sheets/Domain';
import { WorkBookObserverImpl } from './WorkBookObserverImpl';
import { ContextBase } from './ContextBase';
import { Observable } from '../Observer';
import { PropsFrom } from '../Shared';
import { WorkBookObserver } from './WorkBookObserver';
import { IWorkbookConfig } from '../Interfaces';

/**
 * Core context, mount important instances, managers
 */
export class SheetContext extends ContextBase {
    protected _workbook: Workbook;

    constructor(univerSheetData: Partial<IWorkbookConfig> = {}) {
        super();
        this._locale.initialize(univerSheetData.locale);
        this._setObserver();
        this._workbook = new Workbook(univerSheetData, this);
    }

    protected _setObserver(): void {
        const manager = this.getObserverManager();

        new WorkBookObserverImpl().install(manager);
    }

    getWorkBook(): Workbook {
        return this._workbook;
    }

    getContextObserver<Key extends keyof WorkBookObserver>(
        value: Key
    ): Observable<PropsFrom<WorkBookObserver[Key]>> {
        return this.getObserverManager().requiredObserver(value, 'core');
    }

    refreshWorkbook(univerSheetData: Partial<IWorkbookConfig> = {}) {
        this._workbook = new Workbook(univerSheetData, this);
    }
}
